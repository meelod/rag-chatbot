/**
 * Conversation Store
 *
 * Persistent storage for conversation history with Redis backend
 * and in-memory fallback for development/testing.
 *
 * Environment variables:
 * - CONVERSATION_TTL_SECONDS: TTL for conversations (default: 86400 = 24 hours)
 */

const { getRedisClient, isRedisConnected } = require('./redisClient');

const CONVERSATION_PREFIX = 'conv:';
const DEFAULT_TTL = parseInt(process.env.CONVERSATION_TTL_SECONDS, 10) || 86400;

// In-memory fallback store
const memoryStore = new Map();

/**
 * Get conversation from store
 * @param {string} conversationId
 * @returns {Promise<object[]|null>} Array of messages or null
 */
async function getConversation(conversationId) {
    if (!conversationId) return null;

    // Try Redis first
    if (isRedisConnected()) {
        const redis = getRedisClient();
        try {
            const data = await redis.get(`${CONVERSATION_PREFIX}${conversationId}`);
            if (data) {
                // Refresh TTL on access
                await redis.expire(`${CONVERSATION_PREFIX}${conversationId}`, DEFAULT_TTL);
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.warn('[ConversationStore] Redis get failed, using memory fallback:', error.message);
        }
    }

    // Memory fallback
    return memoryStore.get(conversationId) || null;
}

/**
 * Save conversation to store
 * @param {string} conversationId
 * @param {object[]} messages - Array of message objects
 * @returns {Promise<void>}
 */
async function setConversation(conversationId, messages) {
    if (!conversationId || !messages) return;

    // Try Redis first
    if (isRedisConnected()) {
        const redis = getRedisClient();
        try {
            await redis.setex(
                `${CONVERSATION_PREFIX}${conversationId}`,
                DEFAULT_TTL,
                JSON.stringify(messages)
            );
            return;
        } catch (error) {
            console.warn('[ConversationStore] Redis set failed, using memory fallback:', error.message);
        }
    }

    // Memory fallback
    memoryStore.set(conversationId, messages);
}

/**
 * Delete conversation from store
 * @param {string} conversationId
 * @returns {Promise<void>}
 */
async function deleteConversation(conversationId) {
    if (!conversationId) return;

    // Try Redis first
    if (isRedisConnected()) {
        const redis = getRedisClient();
        try {
            await redis.del(`${CONVERSATION_PREFIX}${conversationId}`);
        } catch (error) {
            console.warn('[ConversationStore] Redis delete failed:', error.message);
        }
    }

    // Also delete from memory (in case of fallback)
    memoryStore.delete(conversationId);
}

/**
 * Get all conversation IDs (for debugging/admin)
 * @returns {Promise<string[]>}
 */
async function getAllConversationIds() {
    if (isRedisConnected()) {
        const redis = getRedisClient();
        try {
            const keys = await redis.keys(`${CONVERSATION_PREFIX}*`);
            return keys.map(k => k.replace(CONVERSATION_PREFIX, ''));
        } catch (error) {
            console.warn('[ConversationStore] Redis keys failed:', error.message);
        }
    }

    return Array.from(memoryStore.keys());
}

/**
 * Get store stats
 * @returns {Promise<{count: number, backend: string}>}
 */
async function getStats() {
    if (isRedisConnected()) {
        const redis = getRedisClient();
        try {
            const keys = await redis.keys(`${CONVERSATION_PREFIX}*`);
            return {
                count: keys.length,
                backend: 'redis',
                ttlSeconds: DEFAULT_TTL,
            };
        } catch (error) {
            // Fall through to memory stats
        }
    }

    return {
        count: memoryStore.size,
        backend: 'memory',
        ttlSeconds: null, // Memory store doesn't expire
    };
}

/**
 * Clear all conversations (for testing)
 * @returns {Promise<void>}
 */
async function clearAll() {
    if (isRedisConnected()) {
        const redis = getRedisClient();
        try {
            const keys = await redis.keys(`${CONVERSATION_PREFIX}*`);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.warn('[ConversationStore] Redis clear failed:', error.message);
        }
    }

    memoryStore.clear();
}

module.exports = {
    getConversation,
    setConversation,
    deleteConversation,
    getAllConversationIds,
    getStats,
    clearAll,
};
