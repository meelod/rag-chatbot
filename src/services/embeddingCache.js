/**
 * Embedding Cache
 *
 * In-memory LRU cache for embeddings to reduce API calls
 * and improve response times for repeated queries.
 *
 * Environment variables:
 * - CACHE_TTL_SECONDS: TTL for cached embeddings (default: 300 = 5 minutes)
 */

const NodeCache = require('node-cache');

const TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 300;
const MAX_KEYS = 1000; // Maximum number of cached embeddings
const CHECK_PERIOD = 60; // Check for expired keys every 60 seconds

// Initialize cache
const cache = new NodeCache({
    stdTTL: TTL_SECONDS,
    checkperiod: CHECK_PERIOD,
    maxKeys: MAX_KEYS,
    useClones: false, // Embeddings are large arrays, don't clone
});

// Stats tracking
let hits = 0;
let misses = 0;

/**
 * Generate cache key for a text
 * Uses a simple hash to keep keys short
 * @param {string} text
 * @returns {string}
 */
function generateKey(text) {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    // Include text length to reduce collisions
    return `emb:${hash.toString(36)}:${text.length}`;
}

/**
 * Get cached embedding
 * @param {string} text
 * @returns {number[]|null} Embedding array or null if not cached
 */
function get(text) {
    const key = generateKey(text);
    const embedding = cache.get(key);

    if (embedding) {
        hits++;
        return embedding;
    }

    misses++;
    return null;
}

/**
 * Cache an embedding
 * @param {string} text
 * @param {number[]} embedding
 */
function set(text, embedding) {
    const key = generateKey(text);
    cache.set(key, embedding);
}

/**
 * Get cache statistics
 * @returns {{hits: number, misses: number, hitRate: number, size: number, ttlSeconds: number}}
 */
function getStats() {
    const total = hits + misses;
    return {
        hits,
        misses,
        hitRate: total > 0 ? (hits / total * 100).toFixed(1) + '%' : '0%',
        size: cache.keys().length,
        maxSize: MAX_KEYS,
        ttlSeconds: TTL_SECONDS,
    };
}

/**
 * Clear the cache
 */
function clear() {
    cache.flushAll();
    hits = 0;
    misses = 0;
}

/**
 * Create a cached version of an embed function
 * @param {Function} embedFn - Original embed function
 * @returns {Function} - Cached embed function
 */
function withCache(embedFn) {
    return async function cachedEmbed(text) {
        // Check cache first
        const cached = get(text);
        if (cached) {
            return cached;
        }

        // Generate new embedding
        const embedding = await embedFn(text);

        // Cache the result
        set(text, embedding);

        return embedding;
    };
}

module.exports = {
    get,
    set,
    getStats,
    clear,
    withCache,
};
