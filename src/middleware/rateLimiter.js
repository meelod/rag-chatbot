/**
 * Rate Limiter Middleware
 *
 * Implements rate limiting with Redis backing (when available) and
 * in-memory fallback.
 *
 * Environment variables:
 * - RATE_LIMIT_WINDOW_MS: Window size in milliseconds (default: 60000 = 1 minute)
 * - RATE_LIMIT_MAX_REQUESTS: Max requests per window (default: 20)
 */

const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { getRedisClient, isRedisConnected } = require('../services/redisClient');

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000;
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 20;

/**
 * Create rate limiter middleware
 * Uses Redis store when available, falls back to memory store
 */
function createRateLimiter() {
    const options = {
        windowMs: WINDOW_MS,
        max: MAX_REQUESTS,
        message: {
            error: 'Too many requests',
            message: `Please wait before making more requests. Limit: ${MAX_REQUESTS} requests per ${WINDOW_MS / 1000} seconds.`,
            retryAfter: Math.ceil(WINDOW_MS / 1000),
        },
        standardHeaders: true, // Return rate limit info in headers
        legacyHeaders: false, // Disable X-RateLimit-* headers
        keyGenerator: (req) => {
            // Use conversation ID if available, otherwise use IP
            return req.body?.conversationId || req.ip || 'anonymous';
        },
        skip: (req) => {
            // Skip rate limiting for health checks
            return req.path === '/api/health';
        },
    };

    // Try to use Redis store if available
    if (isRedisConnected()) {
        const redis = getRedisClient();
        try {
            options.store = new RedisStore({
                sendCommand: (...args) => redis.call(...args),
            });
            console.log('[RateLimiter] Using Redis store');
        } catch (error) {
            console.warn('[RateLimiter] Failed to create Redis store, using memory:', error.message);
        }
    } else {
        console.log('[RateLimiter] Using in-memory store');
    }

    return rateLimit(options);
}

/**
 * Create a stricter rate limiter for expensive operations (e.g., streaming)
 */
function createStrictRateLimiter() {
    const strictMax = Math.ceil(MAX_REQUESTS / 2);

    const options = {
        windowMs: WINDOW_MS,
        max: strictMax,
        message: {
            error: 'Too many requests',
            message: `Streaming endpoint limit: ${strictMax} requests per ${WINDOW_MS / 1000} seconds.`,
            retryAfter: Math.ceil(WINDOW_MS / 1000),
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            return `stream:${req.body?.conversationId || req.ip || 'anonymous'}`;
        },
    };

    if (isRedisConnected()) {
        const redis = getRedisClient();
        try {
            options.store = new RedisStore({
                sendCommand: (...args) => redis.call(...args),
            });
        } catch (error) {
            // Silently fall back to memory
        }
    }

    return rateLimit(options);
}

/**
 * Get rate limit configuration
 */
function getRateLimitConfig() {
    return {
        windowMs: WINDOW_MS,
        maxRequests: MAX_REQUESTS,
        backend: isRedisConnected() ? 'redis' : 'memory',
    };
}

module.exports = {
    createRateLimiter,
    createStrictRateLimiter,
    getRateLimitConfig,
};
