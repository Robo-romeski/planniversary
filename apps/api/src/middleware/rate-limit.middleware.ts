import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Base configuration for rate limiting
const baseConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: { error: 'Too many requests, please try again later.' }
};

/**
 * Rate limiter for general API endpoints
 * Limit: 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
    ...baseConfig,
    max: 100,
});

/**
 * Stricter rate limiter for authentication endpoints
 * Limit: 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
    ...baseConfig,
    max: 5,
    message: { error: 'Too many authentication attempts, please try again later.' }
});

/**
 * Rate limiter for password reset and email verification
 * Limit: 3 requests per hour
 */
export const tokenLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: 'Too many token requests, please try again later.' }
});

/**
 * Custom rate limiter factory
 * @param windowMs Time window in milliseconds
 * @param max Maximum number of requests in the time window
 * @param message Custom error message
 */
export const createRateLimiter = (
    windowMs: number,
    max: number,
    message: string = 'Too many requests, please try again later.'
) => rateLimit({
    windowMs,
    max,
    message: { error: message }
});

// Default middleware for the main application
export const defaultRateLimit = () => apiLimiter; 