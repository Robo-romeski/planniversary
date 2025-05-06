import { Router, Request, Response } from 'express';
import { checkSchema } from 'express-validator';
import { authenticateToken, requireEmailVerified } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { UserController } from '../controllers/user.controller';
import { validateSchema } from '../middleware/validate-schema';
import { authMiddleware } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limiter.middleware';
import { 
  createUserSchema, 
  updateUserSchema, 
  updatePasswordSchema,
  updatePreferencesSchema 
} from '../validation/user.schema';

const router = Router();
const userController = new UserController();

// Validation rules
const updateProfileSchema = {
    first_name: {
        optional: true,
        trim: true,
        isLength: {
            options: { min: 2 },
            errorMessage: 'First name must be at least 2 characters long'
        }
    },
    last_name: {
        optional: true,
        trim: true,
        isLength: {
            options: { min: 2 },
            errorMessage: 'Last name must be at least 2 characters long'
        }
    },
    email: {
        optional: true,
        isEmail: true,
        normalizeEmail: true,
        errorMessage: 'Must be a valid email address'
    },
    username: {
        optional: true,
        trim: true,
        isLength: {
            options: { min: 3 },
            errorMessage: 'Username must be at least 3 characters long'
        }
    },
    profile_picture_url: {
        optional: true,
        isURL: true,
        errorMessage: 'Must be a valid URL'
    }
};

const updatePasswordSchema = {
    current_password: {
        notEmpty: true,
        errorMessage: 'Current password is required'
    },
    new_password: {
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password must be at least 8 characters long'
        }
    }
};

const updatePreferencesSchema = {
    default_location: {
        optional: true,
        trim: true,
        isLength: {
            options: { min: 2 },
            errorMessage: 'Location name must be at least 2 characters long'
        }
    },
    default_location_lat: {
        optional: true,
        isFloat: {
            options: { min: -90, max: 90 },
            errorMessage: 'Latitude must be between -90 and 90'
        }
    },
    default_location_lng: {
        optional: true,
        isFloat: {
            options: { min: -180, max: 180 },
            errorMessage: 'Longitude must be between -180 and 180'
        }
    },
    budget_preference: {
        optional: true,
        isIn: {
            options: [['low', 'medium', 'high', 'custom']],
            errorMessage: 'Invalid budget preference'
        }
    },
    custom_budget_min: {
        optional: true,
        isInt: {
            options: { min: 0 },
            errorMessage: 'Minimum budget must be a positive number'
        }
    },
    custom_budget_max: {
        optional: true,
        isInt: {
            options: { min: 0 },
            errorMessage: 'Maximum budget must be a positive number'
        }
    },
    theme_preference: {
        optional: true,
        trim: true
    },
    notification_preference: {
        optional: true,
        isIn: {
            options: [['email', 'sms', 'both', 'none']],
            errorMessage: 'Invalid notification preference'
        }
    },
    email_notifications: {
        optional: true,
        isBoolean: true,
        errorMessage: 'Email notifications must be true or false'
    },
    sms_notifications: {
        optional: true,
        isBoolean: true,
        errorMessage: 'SMS notifications must be true or false'
    }
};

// Protected routes - require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/profile', (req: Request, res: Response) => userController.getCurrentUser(req, res));

// Update user profile - requires email verification
router.put('/profile', 
    requireEmailVerified,
    // checkSchema(updateProfileSchema),
    validateRequest([]),
    (req: Request, res: Response) => userController.updateUser(req, res)
);

// Update password - requires email verification
router.put('/password', 
    requireEmailVerified,
    checkSchema(updatePasswordSchema), 
    validateRequest,
    (req: Request, res: Response) => userController.updatePassword(req, res)
);

// Delete account - requires email verification
router.delete('/me', 
    requireEmailVerified, 
    (req: Request, res: Response) => userController.deleteUser(req, res)
);

// Email verification routes
router.post('/verify-email/:token', (req: Request, res: Response) => userController.verifyEmail(req, res));
router.post('/resend-verification', (req: Request, res: Response) => userController.resendVerification(req, res));

// Password reset routes
router.post('/request-password-reset', (req: Request, res: Response) => userController.requestPasswordReset(req, res));
router.post('/reset-password', (req: Request, res: Response) => userController.resetPassword(req, res));

// User preferences routes
router.get('/preferences', 
    requireEmailVerified,
    (req: Request, res: Response) => userController.getUserPreferences(req, res)
);

router.put('/preferences',
    requireEmailVerified,
    checkSchema(updatePreferencesSchema),
    validateRequest,
    (req: Request, res: Response) => userController.updateUserPreferences(req, res)
);

router.delete('/preferences',
    requireEmailVerified,
    (req: Request, res: Response) => userController.deleteUserPreferences(req, res)
);

// Profile picture routes
router.post('/profile-picture/upload-url',
    requireEmailVerified,
    checkSchema({
        fileType: {
            notEmpty: true,
            matches: {
                options: [/^image\/(jpeg|png|gif)$/],
                errorMessage: 'Invalid file type. Supported types: JPEG, PNG, GIF'
            }
        }
    }),
    validateRequest,
    (req: Request, res: Response) => userController.getProfilePictureUploadUrl(req, res)
);

router.delete('/profile-picture',
    requireEmailVerified,
    (req: Request, res: Response) => userController.deleteProfilePicture(req, res)
);

export const userRoutes = router; 