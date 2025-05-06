import { Router } from 'express';
import { cacheMiddleware, createCacheKey } from '../middleware/cache';
import { AppError } from '../middleware/errorHandler';
import { redisClient } from '../config/redis';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// Create a cache key generator for test routes
const testCacheKey = createCacheKey('test');

/**
 * GET /api/test/cache
 * Test endpoint to demonstrate Redis caching
 * First request will return current timestamp
 * Subsequent requests within TTL will return cached timestamp
 */
router.get('/cache', 
  cacheMiddleware({ 
    ttl: 30, // Cache for 30 seconds
    key: testCacheKey 
  }), 
  (req, res) => {
    const timestamp = new Date().toISOString();
    res.json({
      message: 'This response will be cached for 30 seconds',
      timestamp,
      cached: false
    });
  }
);

/**
 * GET /api/test/nocache
 * Control endpoint that doesn't use caching
 * Always returns current timestamp
 */
router.get('/nocache', (req, res) => {
  const timestamp = new Date().toISOString();
  res.json({
    message: 'This response is never cached',
    timestamp,
    cached: false
  });
});

// GET /api/test
router.get('/', (req, res) => {
  res.json({
    message: 'Test route working',
    timestamp: new Date().toISOString()
  });
});

// POST /api/test/echo
router.post('/echo', (req, res) => {
  res.json({
    message: 'Echo endpoint',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// GET /api/test/error
router.get('/error', (req, res, next) => {
  try {
    throw new AppError('Test error endpoint', 400);
  } catch (error) {
    next(error);
  }
});

// Test endpoint with caching
router.get('/cache', cacheMiddleware({ key: createCacheKey('test-cache'), ttl: 60 }), async (req, res) => {
  try {
    // Simulate some expensive operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = {
      message: 'This response is cached for 60 seconds',
      timestamp: new Date().toISOString()
    };
    
    res.json(data);
  } catch (error) {
    console.error('Cache test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test route with custom rate limit
router.get('/rate-limit', rateLimit({ windowMs: 60000, max: 5 }), (req, res) => {
  res.json({ message: 'Rate limit test successful' });
});

// Test route with default rate limit
router.get('/test', (req, res) => {
  res.json({ message: 'Test route successful' });
});

// Test endpoint
router.get('/ping', (req, res) => {
  res.json({
    data: {
      message: 'pong',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router; 