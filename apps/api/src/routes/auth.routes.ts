import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Validation error handling middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: 'Too many login attempts. Please try again later.' },
  skipFailedRequests: false,
  skip: (req) => req.method !== 'POST' // Only count POST requests
});

// Login validation and route
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidationErrors,
  AuthController.login
);

// Add a specific handler for GET requests to login to provide a better error message
router.get('/login', (req: Request, res: Response) => {
  return res.status(405).json({ 
    error: 'Method not allowed', 
    message: 'The login endpoint only accepts POST requests. Please send a POST request with email and password in the body.' 
  });
});

// Registration validation and route
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty if provided'),
    body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty if provided')
  ],
  handleValidationErrors,
  AuthController.register
);

// Token refresh route
router.post('/refresh-token', AuthController.refreshToken);

// Logout routes
router.post('/logout', AuthController.logout);
router.post('/logout-all', AuthController.logoutAll);

// Email verification route
router.get('/verify-email/:token', AuthController.verifyEmail);

// Password reset request validation and route
router.post(
  '/request-password-reset',
  [
    body('email').isEmail().withMessage('Invalid email format')
  ],
  handleValidationErrors,
  AuthController.requestPasswordReset
);

// Reset password validation and route
router.post(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  handleValidationErrors,
  AuthController.resetPassword
);

export const authRoutes = router; 