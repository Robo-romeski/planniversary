import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

/**
 * Middleware to validate request data using express-validator rules
 * @param validations Array of express-validator validation chains
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format validation errors
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }));

      // Throw custom error with validation details
      throw new AppError('Validation failed', 400, { errors: formattedErrors });
    }

    next();
  };
};

/**
 * Common validation rules for request parameters
 */
export const commonValidations = {
  // Pagination parameters
  pagination: {
    page: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: 'Page must be a positive integer'
      },
      toInt: true
    },
    limit: {
      in: ['query'],
      optional: true,
      isInt: {
        options: { min: 1, max: 100 },
        errorMessage: 'Limit must be between 1 and 100'
      },
      toInt: true
    }
  },

  // ID parameter
  id: {
    in: ['params'],
    isUUID: {
      errorMessage: 'Invalid ID format'
    }
  },

  // Search parameter
  search: {
    in: ['query'],
    optional: true,
    isString: true,
    trim: true,
    escape: true
  }
}; 