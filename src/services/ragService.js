const { searchProducts } = require('./vectorStore');

/**
 * RAG Service - Retrieves relevant products using semantic search
 */

async function getRelevantContext(userQuery) {
    try {
        console.log(`[RAG] Searching for: "${userQuery.substring(0, 50)}..."`);

        const results = await searchProducts(userQuery, 10);

        if (!results.length) {
            console.log('[RAG] No products found');
            return null;
        }

        console.log(`[RAG] Found ${results.length} products: ${results.slice(0, 3).map(p => p.partNumber).join(', ')}...`);

        // Format for LLM
        let context = "\n\nRELEVANT PRODUCTS FROM DATABASE:\n\n";

        results.forEach((product, i) => {
            context += `--- Product ${i + 1} ---\n`;
            context += `Part Number: ${product.partNumber}\n`;
            context += `Name: ${product.name}\n`;
            context += `Category: ${product.category}\n`;
            context += `Brand: ${product.brand}\n`;
            if (product.description) context += `Description: ${product.description}\n`;
            if (product.symptoms?.length) context += `Fixes: ${product.symptoms.join(', ')}\n`;
            if (product.replacementParts?.length) context += `Replaces: ${product.replacementParts.join(', ')}\n`;
            if (product.compatibleModels?.length) context += `Compatible Models: ${product.compatibleModels.slice(0, 10).join(', ')}${product.compatibleModels.length > 10 ? '...' : ''}\n`;
            context += `URL: ${product.url}\n\n`;
        });

        return context;
    } catch (error) {
        console.error('[RAG] Error:', error.message);
        return null;
    }
}

module.exports = { getRelevantContext };
