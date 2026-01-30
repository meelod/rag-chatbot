#!/usr/bin/env node
/**
 * Re-indexing Script
 *
 * Use this script to re-index all products when changing embedding models.
 * This is necessary when switching between Ollama and OpenAI, or when
 * changing the embedding model (e.g., from nomic-embed-text to mxbai-embed-large).
 *
 * Usage:
 *   node scripts/reindex.js
 *
 * Prerequisites:
 *   - ChromaDB running on CHROMA_URL
 *   - If using Ollama: `ollama serve` running with the model pulled
 *   - If using OpenAI: OPENAI_API_KEY set in .env
 */

require('dotenv').config();

const { ChromaClient } = require('chromadb');
const { healthCheck, getConfig } = require('../src/services/embeddingService');
const chromaVectorStore = require('../src/services/chromaVectorStore');

// Product sources
const { getHardcodedProducts } = require('../src/constants/products');
const { scrapeProducts } = require('../src/services/partSelectScraper');

const COLLECTION_NAME = process.env.CHROMA_COLLECTION || 'partselect_products';

async function getChromaClient() {
    const rawUrl = process.env.CHROMA_URL;
    if (rawUrl) {
        const u = new URL(String(rawUrl).trim());
        return new ChromaClient({
            host: u.hostname,
            port: u.port ? Number(u.port) : (u.protocol === 'https:' ? 443 : 80),
            ssl: u.protocol === 'https:',
        });
    }
    return new ChromaClient({
        host: process.env.CHROMA_HOST || 'localhost',
        port: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000,
        ssl: process.env.CHROMA_SSL === 'true',
    });
}

async function main() {
    console.log('='.repeat(60));
    console.log('RAG Chatbot - Re-indexing Script');
    console.log('='.repeat(60));

    // Check embedding service health
    console.log('\n[1/4] Checking embedding service...');
    const embeddingConfig = getConfig();
    console.log(`   Provider: ${embeddingConfig.provider}`);
    console.log(`   Model: ${embeddingConfig.model}`);

    const health = await healthCheck();
    if (!health.healthy) {
        console.error('\n❌ Embedding service is not healthy!');
        console.error(`   Error: ${health.error}`);
        if (embeddingConfig.provider === 'ollama') {
            console.log('\n   To fix:');
            console.log('   1. Make sure Ollama is running: ollama serve');
            console.log(`   2. Pull the model: ollama pull ${embeddingConfig.model}`);
        } else {
            console.log('\n   To fix:');
            console.log('   1. Set OPENAI_API_KEY in your .env file');
        }
        process.exit(1);
    }
    console.log(`   ✓ Healthy (${health.dimensions} dimensions)`);

    // Check ChromaDB connection
    console.log('\n[2/4] Connecting to ChromaDB...');
    let chroma;
    try {
        chroma = await getChromaClient();
        const version = await chroma.version();
        console.log(`   ✓ Connected (version: ${version})`);
    } catch (error) {
        console.error('\n❌ Failed to connect to ChromaDB!');
        console.error(`   Error: ${error.message}`);
        console.log('\n   To fix:');
        console.log('   1. Make sure ChromaDB is running');
        console.log('   2. Check CHROMA_URL in your .env file');
        process.exit(1);
    }

    // Delete existing collection
    console.log('\n[3/4] Deleting existing collection...');
    try {
        await chroma.deleteCollection({ name: COLLECTION_NAME });
        console.log(`   ✓ Collection "${COLLECTION_NAME}" deleted`);
    } catch (error) {
        console.log(`   ⓘ Collection "${COLLECTION_NAME}" did not exist`);
    }

    // Load products
    console.log('\n[4/4] Re-indexing products...');
    let products = [];

    // Try scraping first, fall back to hardcoded
    const shouldScrape = process.env.SCRAPE_PARTSELECT === 'true';
    if (shouldScrape) {
        console.log('   Loading products from PartSelect...');
        try {
            products = await scrapeProducts();
            console.log(`   ✓ Scraped ${products.length} products`);
        } catch (error) {
            console.log(`   ⚠ Scraping failed: ${error.message}`);
            console.log('   Falling back to hardcoded products...');
        }
    }

    if (products.length === 0) {
        console.log('   Loading hardcoded products...');
        products = getHardcodedProducts();
        console.log(`   ✓ Loaded ${products.length} hardcoded products`);
    }

    // Initialize vector store with force refresh
    await chromaVectorStore.initialize(products, true);

    console.log('\n' + '='.repeat(60));
    console.log('✓ Re-indexing complete!');
    console.log('='.repeat(60));
    console.log(`\nEmbedding provider: ${embeddingConfig.provider}`);
    console.log(`Embedding model: ${embeddingConfig.model}`);
    console.log(`Collection: ${COLLECTION_NAME}`);

    const count = await chromaVectorStore.getCount();
    console.log(`Total products indexed: ${count}`);
}

main().catch(error => {
    console.error('\n❌ Re-indexing failed!');
    console.error(error);
    process.exit(1);
});
