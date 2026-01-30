/**
 * Redis Client Singleton
 *
 * Provides a Redis connection with automatic fallback to in-memory storage.
 * This allows the app to work without Redis while still supporting persistence
 * when Redis is available.
 *
 * Environment variables:
 * - REDIS_URL: Redis connection URL (default: redis://localhost:6379)
 */

const Redis = require('ioredis');

let redisClient = null;
let isConnected = false;
let connectionError = null;

/**
 * Get or create Redis client
 * @returns {Redis|null} Redis client or null if connection failed
 */
function getRedisClient() {
    if (redisClient) return redisClient;

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 3) {
                    console.warn('[Redis] Max retries reached, giving up');
                    return null; // Stop retrying
                }
                return Math.min(times * 200, 2000);
            },
            lazyConnect: true,
        });

        redisClient.on('connect', () => {
            isConnected = true;
            connectionError = null;
            console.log('[Redis] Connected successfully');
        });

        redisClient.on('error', (err) => {
            isConnected = false;
            connectionError = err.message;
            // Only log first error to avoid spam
            if (!connectionError) {
                console.warn('[Redis] Connection error:', err.message);
            }
        });

        redisClient.on('close', () => {
            isConnected = false;
            console.log('[Redis] Connection closed');
        });

        // Attempt to connect
        redisClient.connect().catch(err => {
            isConnected = false;
            connectionError = err.message;
            console.warn('[Redis] Failed to connect:', err.message);
            console.warn('[Redis] App will use in-memory fallback');
        });

    } catch (error) {
        console.warn('[Redis] Failed to create client:', error.message);
        connectionError = error.message;
        redisClient = null;
    }

    return redisClient;
}

/**
 * Check if Redis is connected and healthy
 * @returns {boolean}
 */
function isRedisConnected() {
    return isConnected && redisClient !== null;
}

/**
 * Get Redis health status
 * @returns {{connected: boolean, error: string|null, url: string}}
 */
function getRedisStatus() {
    return {
        connected: isConnected,
        error: connectionError,
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    };
}

/**
 * Gracefully close Redis connection
 */
async function closeRedis() {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        isConnected = false;
    }
}

// Initialize on first import (lazy)
getRedisClient();

module.exports = {
    getRedisClient,
    isRedisConnected,
    getRedisStatus,
    closeRedis,
};
