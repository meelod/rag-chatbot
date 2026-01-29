const { ChromaClient } = require('chromadb');
const OpenAI = require('openai');

/**
 * Chroma-backed vector store - Semantic Search Only
 * 
 * Env:
 * - CHROMA_URL=http://localhost:8000
 * - CHROMA_COLLECTION=partselect_products
 */

const COLLECTION_NAME = process.env.CHROMA_COLLECTION || 'partselect_products';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-ada-002';

let chromaClient = null;
let collection = null;
let openaiClient = null;

function getChromaClient() {
    if (chromaClient) return chromaClient;

    const rawUrl = process.env.CHROMA_URL;
    if (rawUrl) {
        try {
            const u = new URL(String(rawUrl).trim());
            chromaClient = new ChromaClient({
                host: u.hostname,
                port: u.port ? Number(u.port) : (u.protocol === 'https:' ? 443 : 80),
                ssl: u.protocol === 'https:',
            });
            return chromaClient;
        } catch (e) {
            throw new Error(
                `Invalid CHROMA_URL "${rawUrl}". Set CHROMA_URL to something like "http://localhost:8000".`
            );
        }
    }

    chromaClient = new ChromaClient({
        host: process.env.CHROMA_HOST || 'localhost',
        port: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000,
        ssl: process.env.CHROMA_SSL === 'true',
    });
    return chromaClient;
}

function getOpenAIClient() {
    if (openaiClient) return openaiClient;
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not set - embeddings will not work');
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openaiClient;
}

function productToText(product) {
    const parts = [
        `${product.name} (${product.partNumber}).`,
        product.manufacturerPartNumber && `Manufacturer Part Number: ${product.manufacturerPartNumber}.`,
        product.manufacturedBy && `Manufactured by ${product.manufacturedBy}${product.manufacturedFor?.length ? ` for ${product.manufacturedFor.join(', ')}` : ''}.`,
        product.productType && `Product type: ${product.productType}.`,
        product.description,
        `Category: ${product.category}. Brand: ${product.brand || 'Various'}.`,
        product.compatibleModels?.length && `Compatible models: ${product.compatibleModels.map(m => typeof m === 'object' ? `${m.brand} ${m.modelNumber}` : m).join(', ')}.`,
        product.replacementParts?.length && `Replaces part numbers: ${product.replacementParts.join(', ')}.`,
        product.symptoms?.length && `Fixes symptoms: ${product.symptoms.join(', ')}.`,
    ].filter(Boolean);

    return parts.join(' ');
}

async function embed(text) {
    const openai = getOpenAIClient();
    const resp = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
    });
    return resp.data[0].embedding;
}

async function ensureCollection() {
    if (collection) return collection;
    const chroma = getChromaClient();
    collection = await chroma.getOrCreateCollection({
        name: COLLECTION_NAME,
        embeddingFunction: null,
    });
    return collection;
}

function buildRecord(product) {
    const text = productToText(product);

    // Helper to safely convert arrays to strings for Chroma metadata
    const arrayToString = (arr) => Array.isArray(arr) ? arr.map(m => typeof m === 'object' ? `${m.brand} ${m.modelNumber}` : m).join(', ') : (arr || '');

    return {
        id: product.id,
        document: text,
        metadata: {
            partNumber: product.partNumber,
            name: product.name,
            description: product.description || `${product.name} for ${product.category}`,
            category: product.category,
            brand: product.brand || 'Various',
            manufacturerPartNumber: product.manufacturerPartNumber || '',
            manufacturedBy: product.manufacturedBy || '',
            manufacturedFor: arrayToString(product.manufacturedFor),
            symptoms: arrayToString(product.symptoms),
            productType: product.productType || '',
            compatibleModels: arrayToString(product.compatibleModels),
            replacementParts: arrayToString(product.replacementParts),
            url: product.url || '',
            imageUrl: product.imageUrl || '',
        },
    };
}

/**
 * Initialize / populate Chroma collection
 */
async function initialize(products, forceRefresh = false) {
    const chroma = getChromaClient();
    await chroma.version();

    if (forceRefresh) {
        console.log(`FORCE_REFRESH - deleting collection "${COLLECTION_NAME}"...`);
        try {
            await chroma.deleteCollection({ name: COLLECTION_NAME });
            console.log(`   Collection deleted`);
        } catch (e) {
            // Collection might not exist
        }
        collection = null;
        await new Promise(r => setTimeout(r, 500));
    }

    const col = await ensureCollection();
    const existingCount = await col.count();

    if (!forceRefresh && existingCount > 0) {
        console.log(`Chroma collection already has ${existingCount} records`);
        console.log(`   To force refresh, set FORCE_REFRESH=true`);
        return;
    }

    // Deduplicate products by ID (same product may appear on multiple brand pages)
    const seen = new Set();
    const uniqueProducts = products.filter(p => {
        const id = p.id || p.partNumber?.toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });

    if (uniqueProducts.length < products.length) {
        console.log(`Deduplicated: ${products.length} -> ${uniqueProducts.length} products (${products.length - uniqueProducts.length} duplicates removed)`);
    }

    console.log(`Adding ${uniqueProducts.length} products to Chroma...`);

    const batchSize = 50;
    for (let i = 0; i < uniqueProducts.length; i += batchSize) {
        const batch = uniqueProducts.slice(i, i + batchSize);
        const records = batch.map(buildRecord);
        const embeddings = await Promise.all(records.map(r => embed(r.document)));

        await col.upsert({
            ids: records.map(r => r.id),
            documents: records.map(r => r.document),
            metadatas: records.map(r => r.metadata),
            embeddings,
        });

        console.log(`   Upserted ${Math.min(i + batchSize, uniqueProducts.length)}/${uniqueProducts.length}`);
    }

    const finalCount = await col.count();
    console.log(`Chroma collection now has ${finalCount} records`);
}

/**
 * Semantic search for products
 */
async function searchProducts(query, limit = 3) {
    const col = await ensureCollection();
    const queryEmbedding = await embed(query);

    const res = await col.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        include: ['metadatas', 'distances'],
    });

    const metadatas = res.metadatas?.[0] || [];
    const distances = res.distances?.[0] || [];

    // Helper to parse comma-separated strings back to arrays
    const parseArray = (str) => str ? str.split(', ').filter(Boolean) : [];

    return metadatas.map((m, idx) => ({
        id: res.ids?.[0]?.[idx],
        partNumber: m.partNumber,
        name: m.name,
        description: m.description,
        category: m.category,
        brand: m.brand,
        manufacturerPartNumber: m.manufacturerPartNumber || '',
        manufacturedBy: m.manufacturedBy || '',
        manufacturedFor: parseArray(m.manufacturedFor),
        symptoms: parseArray(m.symptoms),
        productType: m.productType || '',
        compatibleModels: parseArray(m.compatibleModels),
        replacementParts: parseArray(m.replacementParts),
        url: m.url,
        imageUrl: m.imageUrl || '',
        relevance: typeof distances[idx] === 'number' ? Math.max(0, 1 - distances[idx]) : undefined,
    })).filter(p => p?.partNumber && p?.name);
}

/**
 * Get all products (for debug endpoint)
 */
async function getAllProducts(limit = 1000) {
    const col = await ensureCollection();
    const res = await col.get({ limit, include: ['metadatas'] });

    const parseArray = (str) => str ? str.split(', ').filter(Boolean) : [];

    return (res.metadatas || []).map((m, idx) => ({
        id: res.ids[idx],
        partNumber: m.partNumber,
        name: m.name,
        category: m.category,
        brand: m.brand,
        manufacturerPartNumber: m.manufacturerPartNumber || '',
        manufacturedBy: m.manufacturedBy || '',
        manufacturedFor: parseArray(m.manufacturedFor),
        symptoms: parseArray(m.symptoms),
        productType: m.productType || '',
        url: m.url,
        imageUrl: m.imageUrl,
        description: m.description,
        compatibleModels: parseArray(m.compatibleModels),
        replacementParts: parseArray(m.replacementParts),
    })).filter(p => p?.partNumber);
}

async function getCount() {
    try {
        const col = await ensureCollection();
        return await col.count();
    } catch {
        return 0;
    }
}

module.exports = {
    initialize,
    searchProducts,
    getAllProducts,
    getCount,
};
