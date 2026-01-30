/**
 * Unified Embedding Service
 *
 * Supports multiple embedding providers:
 * - ollama: Self-hosted embeddings via Ollama (default)
 * - openai: OpenAI text-embedding-ada-002
 *
 * Environment variables:
 * - EMBEDDING_PROVIDER: 'ollama' or 'openai' (default: 'ollama')
 * - OLLAMA_BASE_URL: Ollama server URL (default: 'http://localhost:11434')
 * - OLLAMA_EMBEDDING_MODEL: Model name (default: 'nomic-embed-text')
 * - OPENAI_API_KEY: Required for OpenAI provider
 * - EMBEDDING_MODEL: OpenAI model (default: 'text-embedding-ada-002')
 */

const OpenAI = require('openai');

// Configuration
const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER || 'ollama';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
const OPENAI_EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-ada-002';

let openaiClient = null;

/**
 * Get OpenAI client (lazy initialization)
 */
function getOpenAIClient() {
    if (openaiClient) return openaiClient;
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not set - OpenAI embeddings will not work');
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openaiClient;
}

/**
 * Generate embedding using Ollama
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function embedWithOllama(text) {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_EMBEDDING_MODEL,
            prompt: text,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama embedding failed: ${response.status} - ${error}`);
    }

    const data = await response.json();

    if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error('Invalid response from Ollama: missing embedding array');
    }

    return data.embedding;
}

/**
 * Generate embedding using OpenAI
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function embedWithOpenAI(text) {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
        model: OPENAI_EMBEDDING_MODEL,
        input: text,
    });
    return response.data[0].embedding;
}

/**
 * Generate embedding using configured provider
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function embed(text) {
    if (EMBEDDING_PROVIDER === 'openai') {
        return embedWithOpenAI(text);
    }
    return embedWithOllama(text);
}

/**
 * Generate embeddings for multiple texts (batch)
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function embedBatch(texts) {
    // For Ollama, we need to embed one at a time
    // For OpenAI, we could batch but keep it simple for now
    return Promise.all(texts.map(text => embed(text)));
}

/**
 * Check if the embedding service is healthy
 * @returns {Promise<{healthy: boolean, provider: string, model: string, error?: string}>}
 */
async function healthCheck() {
    const result = {
        healthy: false,
        provider: EMBEDDING_PROVIDER,
        model: EMBEDDING_PROVIDER === 'openai' ? OPENAI_EMBEDDING_MODEL : OLLAMA_EMBEDDING_MODEL,
    };

    try {
        if (EMBEDDING_PROVIDER === 'ollama') {
            // Check Ollama server health
            const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
            if (!response.ok) {
                throw new Error(`Ollama server returned ${response.status}`);
            }
            const data = await response.json();
            const models = data.models || [];
            const hasModel = models.some(m => m.name === OLLAMA_EMBEDDING_MODEL || m.name.startsWith(`${OLLAMA_EMBEDDING_MODEL}:`));

            if (!hasModel) {
                result.error = `Model '${OLLAMA_EMBEDDING_MODEL}' not found. Run: ollama pull ${OLLAMA_EMBEDDING_MODEL}`;
                return result;
            }
        } else {
            // Check OpenAI API key
            if (!process.env.OPENAI_API_KEY) {
                result.error = 'OPENAI_API_KEY not set';
                return result;
            }
        }

        // Test embedding with a simple string
        const testEmbedding = await embed('test');
        if (testEmbedding && testEmbedding.length > 0) {
            result.healthy = true;
            result.dimensions = testEmbedding.length;
        }
    } catch (error) {
        result.error = error.message;
    }

    return result;
}

/**
 * Get current configuration
 */
function getConfig() {
    return {
        provider: EMBEDDING_PROVIDER,
        model: EMBEDDING_PROVIDER === 'openai' ? OPENAI_EMBEDDING_MODEL : OLLAMA_EMBEDDING_MODEL,
        ollamaUrl: OLLAMA_BASE_URL,
    };
}

module.exports = {
    embed,
    embedBatch,
    healthCheck,
    getConfig,
    // Export individual providers for testing
    embedWithOllama,
    embedWithOpenAI,
};
