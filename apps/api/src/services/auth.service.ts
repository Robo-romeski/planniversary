import { UserRepository } from '../repositories/user.repository';
import { TokenService } from './token.service';
import { generateToken, verifyToken, TokenPayload } from '../utils/jwt.utils';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { User, CreateUserDTO } from '../models/user.model';

export class AuthService {
  private static userRepository = new UserRepository();

  static async login(email: string, password: string) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      if (user.account_status !== 'active') {
        throw new Error(`Account is ${user.account_status}`);
      }

      // Generate tokens
      const accessToken = generateToken({ 
        userId: user.id.toString(),
        email: user.email,
        type: 'access'
      }, '15m');

      const refreshToken = generateToken({ 
        userId: user.id.toString(),
        email: user.email,
        type: 'refresh'
      }, '7d');

      // Add refresh token to user's sessions
      await TokenService.addUserSession(
        user.id.toString(), 
        refreshToken,
        7 * 24 * 60 * 60 // 7 days in seconds
      );

      // Update last login
      await this.userRepository.updateLastLogin(user.id.toString());

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          account_status: user.account_status
        },
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token is valid in Redis
      const isValidSession = await TokenService.isValidUserSession(
        decoded.userId!,
        refreshToken
      );

      if (!isValidSession) {
        throw new Error('Invalid refresh token');
      }

      const user = await this.userRepository.findById(parseInt(decoded.userId!));
      if (!user) {
        throw new Error('User not found');
      }

      if (user.account_status !== 'active') {
        throw new Error(`Account is ${user.account_status}`);
      }

      // Generate new access token
      const newAccessToken = generateToken({ 
        userId: user.id.toString(),
        email: user.email,
        type: 'access'
      }, '15m');

      return {
        accessToken: newAccessToken
      };
    } catch (error) {
      throw error;
    }
  }

  static async logout(userId: string, refreshToken: string) {
    try {
      // Remove refresh token from user's sessions
      await TokenService.removeUserSession(userId, refreshToken);
    } catch (error) {
      throw error;
    }
  }

  static async logoutAll(userId: string) {
    try {
      // Remove all user sessions
      await TokenService.removeAllUserSessions(userId);
    } catch (error) {
      throw error;
    }
  }

  static async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    username?: string;
  }) {
    try {
      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Generate verification token
      const verificationToken = generateToken({ 
        email: userData.email,
        type: 'verification'
      }, '24h');

      // Create user
      const createData: CreateUserDTO = {
        email: userData.email,
        password: userData.password, // Required by DTO but not used by repository
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        verification_token: verificationToken,
        verification_token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      const user = await this.userRepository.createUser(createData, hashedPassword);

      // TODO: Send verification email

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        account_status: user.account_status
      };
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(token: string) {
    try {
      const decoded = verifyToken(token) as TokenPayload;
      
      if (decoded.type !== 'verification') {
        throw new Error('Invalid token type');
      }

      const user = await this.userRepository.findByVerificationToken(token);
      if (!user) {
        throw new Error('Invalid verification token');
      }

      // Update user status and clear verification token
      await this.userRepository.setEmailVerification(user.id.toString(), true);
      await this.userRepository.setVerificationToken(user.id.toString(), null, null);
      await this.userRepository.updateAccountStatus(user.id.toString(), 'active');

      return {
        message: 'Email verified successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  static async requestPasswordReset(email: string) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Return success even if user not found for security
        return { message: 'If an account exists, a password reset email has been sent' };
      }

      const resetToken = generateToken({ 
        userId: user.id.toString(),
        type: 'reset'
      }, '1h');

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await this.userRepository.setResetToken(user.id.toString(), resetToken, expiresAt);

      // TODO: Send password reset email

      return { 
        message: 'If an account exists, a password reset email has been sent'
      };
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = verifyToken(token) as TokenPayload;
      
      if (decoded.type !== 'reset') {
        throw new Error('Invalid token type');
      }

      const user = await this.userRepository.findByResetToken(token);
      if (!user) {
        throw new Error('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password and clear reset token
      await this.userRepository.updatePassword(user.id.toString(), hashedPassword);
      await this.userRepository.setResetToken(user.id.toString(), null, null);

      // Invalidate all user sessions for security
      await TokenService.removeAllUserSessions(user.id.toString());

      return {
        message: 'Password reset successfully'
      };
    } catch (error) {
      throw error;
    }
  }
} 