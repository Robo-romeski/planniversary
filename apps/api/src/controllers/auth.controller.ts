import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      // Set accessToken as HttpOnly cookie
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      return res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return res.status(401).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, first_name, last_name, username } = req.body;
      const user = await AuthService.register({ email, password, first_name, last_name, username });
      return res.status(201).json(user);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error && error.message === 'Email already registered') {
        return res.status(409).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const result = await AuthService.refreshToken(refreshToken);
      return res.json(result);
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return res.json({ message: 'Logged out successfully' });
  }

  static async logoutAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id.toString();
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      await AuthService.logoutAll(userId);
      return res.json({ message: 'Logged out from all devices successfully' });
    } catch (error) {
      console.error('Logout all error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ message: 'Verification token is required' });
      }

      const result = await AuthService.verifyEmail(token);
      return res.json(result);
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(400).json({ message: 'Invalid verification token' });
    }
  }

  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      await AuthService.requestPasswordReset(email);
      return res.json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Password reset request error:', error);
      return res.status(400).json({ message: 'Invalid email address' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token } = req.params;
      const { password } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Reset token is required' });
      }

      await AuthService.resetPassword(token, password);
      return res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
  }
} 