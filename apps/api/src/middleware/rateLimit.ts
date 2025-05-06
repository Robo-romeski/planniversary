import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { env } from '../config/env';
import { AppError } from './errorHandler';

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Max number of requests per window
}

const DEFAULT_WINDOW_MS = 60000; // 1 minute
const DEFAULT_MAX_REQUESTS = 100; // 100 requests per minute

export const rateLimit = (options: RateLimitOptions = {}) => {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.max || DEFAULT_MAX_REQUESTS;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === 'test') {
      return next();
    }

    const key = `rate-limit:${req.ip}`;

    try {
      // Get the current count for this IP
      const currentCount = await redisClient.get(key);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      if (count >= maxRequests) {
        throw new AppError('Too many requests', 429);
      }

      // Increment the count
      if (count === 0) {
        // First request in window, set with expiry
        await redisClient.setEx(key, Math.floor(windowMs / 1000), '1');
      } else {
        // Increment existing count
        await redisClient.incr(key);
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - (count + 1));
      res.setHeader('X-RateLimit-Reset', Math.ceil((await redisClient.ttl(key)) / 1000));

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Rate limiting error', 500));
      }
    }
  };
}; 