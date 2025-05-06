import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
    statusCode?: number;
    details?: any;
}

export const errorHandler = (
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const details = err.details;

    // Log error
    console.error(`[Error] ${statusCode} - ${message}`, {
        path: req.path,
        details: details,
        stack: err.stack
    });

    // Send error response
    res.status(statusCode).json({
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && {
                details,
                stack: err.stack
            })
        }
    });
}; 