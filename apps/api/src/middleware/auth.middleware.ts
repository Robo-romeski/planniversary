import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.utils';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { TokenService } from '../services/token.service';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}

const userRepository = new UserRepository();

/**
 * Middleware to verify JWT access token
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('[auth] START', req.method, req.originalUrl);
  try {
    const authHeader = req.headers.authorization;
    let token = authHeader?.split(' ')[1]; // Bearer <token>

    // Also check for accessToken in cookies
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      console.log('[auth] NO TOKEN');
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      // Check if token is blacklisted
      const isBlacklisted = await TokenService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        console.log('[auth] TOKEN BLACKLISTED');
        return res.status(401).json({ message: 'Token has been revoked' });
      }

      const decoded = verifyToken(token);
      
      // Verify token type
      if (decoded.type !== 'access') {
        console.log('[auth] INVALID TOKEN TYPE');
        return res.status(401).json({ message: 'Invalid token type' });
      }

      // Get user from database
      const userId = decoded.userId ? String(decoded.userId) : undefined;
      if (!userId) {
        console.log('[auth] INVALID TOKEN PAYLOAD');
        return res.status(401).json({ message: 'Invalid token payload' });
      }
      const user = await userRepository.findById(userId);
      if (!user) {
        console.log('[auth] USER NOT FOUND');
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user is active
      if (user.account_status !== 'active') {
        console.log('[auth] ACCOUNT NOT ACTIVE');
        return res.status(401).json({ 
          message: 'Account is not active',
          status: user.account_status 
        });
      }

      // Attach user and token to request
      req.user = user;
      req.token = token;
      console.log('[auth] END (success)', req.method, req.originalUrl);
      next();
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        console.log('[auth] TOKEN EXPIRED');
        return res.status(401).json({ message: 'Token expired' });
      }
      console.log('[auth] INVALID TOKEN', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.log('[auth] ERROR', error);
    next(error);
  }
}

/**
 * Middleware to verify email is verified
 */
export function requireEmailVerified(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('[requireEmailVerified] called', req.user);
  if (!req.user?.email_verified) {
    return res.status(403).json({ 
      message: 'Email verification required',
      verificationRequired: true
    });
  }
  next();
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require authentication
 */
export async function optionalAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyToken(token);
      if (decoded.type !== 'access') return next();

      const userIdOpt = decoded.userId ? String(decoded.userId) : undefined;
      if (userIdOpt) {
        const user = await userRepository.findById(userIdOpt);
        if (user && user.account_status === 'active') {
          req.user = user;
          req.token = token;
        }
      }
    } catch (error) {
      // Ignore token verification errors in optional auth
    }
    
    next();
  } catch (error) {
    next(error);
  }
} 