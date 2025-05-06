import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { UserPreferencesRepository } from '../repositories/user-preferences.repository';
import { User, CreateUserDTO, SafeUser, UpdateUserDTO } from '../models/user.model';
import { CreateUserPreferencesDTO, UpdateUserPreferencesDTO } from '../models/user-preferences.model';
import * as bcrypt from 'bcrypt';
import { generateTokens, generateToken } from '../utils/jwt.utils';
import { hashPassword } from '../utils/password.utils';
import { S3Service } from '../services/s3.service';

export class UserController {
  private userRepository: UserRepository;
  private userPreferencesRepository: UserPreferencesRepository;
  private s3Service: S3Service;

  constructor() {
    this.userRepository = new UserRepository();
    this.userPreferencesRepository = new UserPreferencesRepository();
    this.s3Service = new S3Service();
  }

  // Helper method to remove sensitive data before sending to client
  private sanitizeUser(user: any): any {
    const { password_hash, verification_token, reset_token, ...safeUser } = user;
    return safeUser;
  }

  // Get current user profile
  public async getCurrentUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(this.sanitizeUser(user));
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
  }

  // Get all users (admin only)
  public async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.userRepository.findAll();
      const safeUsers = users.map(user => this.sanitizeUser(user));
      return res.json(safeUsers);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
  }

  // Get user by ID
  public async getUserById(req: Request, res: Response): Promise<Response> {
    const userId = req.params.id;

    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(this.sanitizeUser(user));
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve user' });
    }
  }

  // Create new user (registration)
  public async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const userData: CreateUserDTO = req.body;
      
      // Check if email is already registered
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user with pending status and verification token
      const user = await this.userRepository.createUser({
        ...userData,
        account_status: 'pending',
        email_verified: false,
        verification_token: Math.random().toString(36).substring(2, 15),
        verification_token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }, hashedPassword);

      return res.status(201).json(this.sanitizeUser(user));
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Update user profile
  public async updateUser(req: Request, res: Response): Promise<Response> {
    // Use the authenticated user's ID
    const userId = (req as any).user.id;
    const userData = req.body;
    delete userData.preferences;
    console.log('[updateUser] Incoming userData:', userData);

    try {
      // Check if email is being updated and if it's already taken
      if (userData.email) {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        console.log('[updateUser] Existing user for email:', existingUser);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      // If password is being updated, hash it
      if (userData.password) {
        const hashedPassword = await hashPassword(userData.password);
        await this.userRepository.updatePassword(userId, hashedPassword);
        delete userData.password;
      }

      const updatedUser = await this.userRepository.updateUser(userId, userData);
      console.log('[updateUser] Updated user result:', updatedUser);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(this.sanitizeUser(updatedUser));
    } catch (error) {
      console.error('[updateUser] Error:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // Update password
  public async updatePassword(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      const user = await this.userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      const updated = await this.userRepository.updatePassword(userId, hashedPassword);
      if (!updated) {
        return res.status(500).json({ error: 'Failed to update password' });
      }

      return res.json({ message: 'Password updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update password' });
    }
  }

  // Delete user
  public async deleteUser(req: Request, res: Response): Promise<Response> {
    const userId = req.params.id;

    try {
      const success = await this.userRepository.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  // Verify email
  public async verifyEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;
      
      const user = await this.userRepository.findByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      if (user.verification_token_expires_at && user.verification_token_expires_at < new Date()) {
        return res.status(400).json({ error: 'Verification token has expired' });
      }

      // Update user verification status
      const verified = await this.userRepository.setEmailVerification(user.id, true);
      if (!verified) {
        return res.status(500).json({ error: 'Failed to verify email' });
      }

      // Update account status to active
      await this.userRepository.updateAccountStatus(user.id, 'active');

      return res.json({ message: 'Email verified successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to verify email' });
    }
  }

  // Resend verification email
  public async resendVerification(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.email_verified) {
        return res.status(400).json({ error: 'Email is already verified' });
      }

      // Generate new verification token
      const verificationToken = Math.random().toString(36).substring(2, 15);
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const updated = await this.userRepository.setVerificationToken(
        user.id,
        verificationToken,
        tokenExpires
      );

      if (!updated) {
        return res.status(500).json({ error: 'Failed to generate new verification token' });
      }

      // TODO: Send verification email

      return res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to resend verification email' });
    }
  }

  // Request password reset
  public async requestPasswordReset(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // For security, don't reveal if email exists
        return res.json({ message: 'If an account exists with this email, a password reset link will be sent' });
      }

      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15);
      const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      const updated = await this.userRepository.setResetToken(
        user.id,
        resetToken,
        tokenExpires
      );

      if (!updated) {
        return res.status(500).json({ error: 'Failed to generate reset token' });
      }

      // TODO: Send password reset email

      return res.json({ message: 'If an account exists with this email, a password reset link will be sent' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }

  // Reset password
  public async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      const user = await this.userRepository.findByResetToken(token);
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      if (user.reset_token_expires_at && user.reset_token_expires_at < new Date()) {
        return res.status(400).json({ error: 'Reset token has expired' });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      const updated = await this.userRepository.updatePassword(user.id, hashedPassword);
      if (!updated) {
        return res.status(500).json({ error: 'Failed to reset password' });
      }

      // Clear reset token
      await this.userRepository.setResetToken(user.id, null, null);

      return res.json({ message: 'Password reset successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  // Login
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login timestamp
      await this.userRepository.updateLastLogin(user.id);

      return res.json(this.sanitizeUser(user));
    } catch (error) {
      return res.status(500).json({ error: 'Failed to process login' });
    }
  }

  // Get user preferences
  public async getUserPreferences(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const preferences = await this.userPreferencesRepository.findByUserId(userId);
      
      if (!preferences) {
        return res.status(404).json({ error: 'User preferences not found' });
      }

      return res.json(preferences);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve user preferences' });
    }
  }

  // Create or update user preferences
  public async updateUserPreferences(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const preferencesData: UpdateUserPreferencesDTO = req.body;

      // Validate budget range if custom
      if (preferencesData.budget_preference === 'custom') {
        if (!preferencesData.custom_budget_min || !preferencesData.custom_budget_max) {
          return res.status(400).json({ 
            error: 'Custom budget range requires both minimum and maximum values' 
          });
        }
        if (preferencesData.custom_budget_min > preferencesData.custom_budget_max) {
          return res.status(400).json({ 
            error: 'Custom budget minimum cannot be greater than maximum' 
          });
        }
      }

      // Validate location coordinates if provided
      if (preferencesData.default_location_lat || preferencesData.default_location_lng) {
        if (!preferencesData.default_location_lat || !preferencesData.default_location_lng) {
          return res.status(400).json({ 
            error: 'Both latitude and longitude must be provided together' 
          });
        }
        if (preferencesData.default_location_lat < -90 || preferencesData.default_location_lat > 90) {
          return res.status(400).json({ error: 'Invalid latitude value' });
        }
        if (preferencesData.default_location_lng < -180 || preferencesData.default_location_lng > 180) {
          return res.status(400).json({ error: 'Invalid longitude value' });
        }
      }

      // Check if preferences exist
      const existingPreferences = await this.userPreferencesRepository.findByUserId(userId);

      let preferences;
      if (!existingPreferences) {
        // Create new preferences
        preferences = await this.userPreferencesRepository.createPreferences({
          user_id: userId,
          ...preferencesData
        });
      } else {
        // Update existing preferences
        preferences = await this.userPreferencesRepository.updatePreferences(userId, preferencesData);
      }

      if (!preferences) {
        return res.status(500).json({ error: 'Failed to update preferences' });
      }

      return res.json(preferences);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user preferences' });
    }
  }

  // Delete user preferences
  public async deleteUserPreferences(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const success = await this.userPreferencesRepository.deletePreferences(userId);
      
      if (!success) {
        return res.status(404).json({ error: 'User preferences not found' });
      }

      return res.json({ message: 'User preferences deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user preferences' });
    }
  }

  // Get profile picture upload URL
  public async getProfilePictureUploadUrl(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const { fileType } = req.body;

      if (!fileType) {
        return res.status(400).json({ error: 'File type is required' });
      }

      const { uploadUrl, fileUrl } = await this.s3Service.getProfilePictureUploadUrl(userId, fileType);

      // Store the file URL in the user's profile
      await this.userRepository.updateUser(userId, { profile_picture_url: fileUrl });

      return res.json({ uploadUrl, fileUrl });
    } catch (error: any) {
      if (error.message.includes('Invalid file type') || error.message.includes('Unsupported image type')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  }

  // Delete profile picture
  public async deleteProfilePicture(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const user = await this.userRepository.findById(userId);

      if (!user || !user.profile_picture_url) {
        return res.status(404).json({ error: 'No profile picture found' });
      }

      // Delete from S3
      await this.s3Service.deleteProfilePicture(user.profile_picture_url);

      // Remove URL from user profile
      await this.userRepository.updateUser(userId, { profile_picture_url: null });

      return res.json({ message: 'Profile picture deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete profile picture' });
    }
  }
} 