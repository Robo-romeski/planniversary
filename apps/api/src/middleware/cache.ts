import { Request, Response, NextFunction } from 'express';
import { getCache, setCache, DEFAULT_TTL } from '../utils/redis';

interface CacheOptions {
  ttl?: number;
  key?: (req: Request) => string;
}

/**
 * Generate a cache key from the request
 */
function defaultKeyGenerator(req: Request): string {
  return `${req.method}:${req.originalUrl}`;
}

/**
 * Middleware to cache API responses
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const { ttl = DEFAULT_TTL, key = defaultKeyGenerator } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = key(req);

    try {
      // Check if response is cached
      const cachedResponse = await getCache<any>(cacheKey);
      
      if (cachedResponse) {
        return res.json(cachedResponse);
      }

      // Store the original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response before sending
      res.json = function(body: any): Response {
        // Cache the response
        setCache(cacheKey, body, ttl)
          .catch(error => console.error('Cache middleware error:', error));

        // Call the original json function
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Helper to generate cache key with custom prefix
 */
export function createCacheKey(prefix: string) {
  return (req: Request): string => {
    return `${prefix}:${req.originalUrl}`;
  };
} 