import { Redis } from '@upstash/redis';
import env from 'dotenv';
env.config();

// Redis connection variables
let redis = null;

// Redis connection initialization
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
    console.warn('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not configured in .env. Caching is disabled.');
} else {
    try {
        redis = new Redis({
            url: redisUrl,
            token: redisToken,
        });
        console.log('Upstash Redis REST client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Upstash Redis client:', error.message);
        redis = null;
    }
}

/**
 * Get a value from Redis cache
 * @param {string} key 
 * @returns {Promise<any|null>}
 */
export const getCache = async (key) => {
    if (!redis) return null;
    try {
        const data = await redis.get(key);
        if (data === null || data === undefined) return null;
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch {
                return data;
            }
        }
        return data;
    } catch (error) {
        console.error(`Error reading cache key "${key}":`, error.message);
        return null;
    }
};

/**
 * Set a value in Redis cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlInSeconds - expiration in seconds (default 3600 / 1 hour)
 * @returns {Promise<boolean>}
 */
export const setCache = async (key, value, ttlInSeconds = 3600) => {
    if (!redis) return false;
    try {
        const stringified = JSON.stringify(value);
        await redis.set(key, stringified, { ex: ttlInSeconds });
        return true;
    } catch (error) {
        console.error(`Error setting cache key "${key}":`, error.message);
        return false;
    }
};

/**
 * Delete a value from Redis cache by key
 * @param {string} key 
 * @returns {Promise<boolean>}
 */
export const deleteCache = async (key) => {
    if (!redis) return false;
    try {
        await redis.del(key);
        return true;
    } catch (error) {
        console.error(`Error deleting cache key "${key}":`, error.message);
        return false;
    }
};

/**
 * Delete multiple keys matching a pattern (e.g. "products:*")
 * @param {string} pattern 
 * @returns {Promise<boolean>}
 */
export const deleteCachePattern = async (pattern) => {
    if (!redis) return false;
    try {
        let cursor = '0';
        let keysToDelete = [];

        do {
            const reply = await redis.scan(cursor, { match: pattern, count: 100 });
            cursor = reply[0];
            const keys = reply[1];
            if (keys && keys.length > 0) {
                keysToDelete.push(...keys);
            }
        } while (cursor !== '0');

        if (keysToDelete.length > 0) {
            await redis.del(...keysToDelete);
        }
        return true;
    } catch (error) {
        console.error(`Error deleting cache pattern "${pattern}":`, error.message);
        return false;
    }
};

export default redis;
