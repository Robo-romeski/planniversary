import { redisClient } from '../config/redis';

// Default TTL in seconds (1 hour)
export const DEFAULT_TTL = 3600;

/**
 * Set a value in Redis cache with optional TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  try {
    const stringValue = JSON.stringify(value);
    await redisClient.set(key, stringValue, { EX: ttl });
  } catch (error) {
    console.error('Redis setCache error:', error);
    throw error;
  }
}

/**
 * Get a value from Redis cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Redis getCache error:', error);
    throw error;
  }
}

/**
 * Delete a value from Redis cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis deleteCache error:', error);
    throw error;
  }
}

/**
 * Check if a key exists in Redis cache
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    return await redisClient.exists(key) === 1;
  } catch (error) {
    console.error('Redis hasCache error:', error);
    throw error;
  }
}

/**
 * Set multiple values in Redis cache
 */
export async function setMultiCache(
  items: { key: string; value: any; ttl?: number }[]
): Promise<void> {
  try {
    const multi = redisClient.multi();
    
    items.forEach(({ key, value, ttl = DEFAULT_TTL }) => {
      const stringValue = JSON.stringify(value);
      multi.set(key, stringValue, { EX: ttl });
    });

    await multi.exec();
  } catch (error) {
    console.error('Redis setMultiCache error:', error);
    throw error;
  }
}

/**
 * Get multiple values from Redis cache
 */
export async function getMultiCache<T>(keys: string[]): Promise<(T | null)[]> {
  try {
    const values = await redisClient.mGet(keys);
    return values.map(value => value ? JSON.parse(value) as T : null);
  } catch (error) {
    console.error('Redis getMultiCache error:', error);
    throw error;
  }
}

/**
 * Clear all keys matching a pattern
 */
export async function clearCachePattern(pattern: string): Promise<void> {
  try {
    let cursor = 0;
    do {
      const { cursor: newCursor, keys } = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = newCursor;
      
      if (keys.length) {
        await redisClient.del(keys);
      }
    } while (cursor !== 0);
  } catch (error) {
    console.error('Redis clearCachePattern error:', error);
    throw error;
  }
} 