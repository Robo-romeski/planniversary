import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
import { validationResult } from 'express-validator';
import { ApiError } from './error.middleware';

/**
 * Middleware to validate request using express-validator rules
 * @param validations Array of express-validator validation chains
 */
export const validateRequest = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log('[validateRequest] START', req.method, req.originalUrl);
        try {
            // Run all validations
            await Promise.all(validations.map(validation => validation.run(req)));
            console.log('[validateRequest] Validations complete', req.method, req.originalUrl);

            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('[validateRequest] Validation errors:', errors.array());
                const error: ApiError = new Error('Validation failed');
                error.statusCode = 400;
                error.details = errors.array();
                return next(error);
            }

            console.log('[validateRequest] No validation errors, calling next()', req.method, req.originalUrl);
            next();
        } catch (error) {
            console.log('[validateRequest] ERROR', error);
            next(error);
        }
    };
}; 