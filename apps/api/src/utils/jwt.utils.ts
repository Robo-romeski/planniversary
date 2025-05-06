import jwt from 'jsonwebtoken';
import { SafeUser, User } from '../models/user.model';

// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

// Token expiration times (in seconds)
const ACCESS_TOKEN_EXPIRES_IN = 60 * 60; // 1 hour
const REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days

export interface TokenPayload {
  userId?: string;
  email?: string;
  type: 'access' | 'refresh' | 'verification' | 'reset';
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate a single JWT token
 * @param payload The token payload
 * @param expiresIn Time until token expires (e.g., '15m', '1h', '7d')
 * @returns The generated token
 */
export function generateToken(payload: TokenPayload, expiresIn: string): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn });
}

/**
 * Generate JWT tokens for a user
 * @param user The user to generate tokens for
 * @returns Object containing access token, refresh token, and expiration
 */
export function generateTokens(user: User): TokenResponse {
  // Create access token
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      type: 'access'
    } as TokenPayload,
    JWT_SECRET as jwt.Secret,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

  // Create refresh token
  const refreshToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      type: 'refresh'
    } as TokenPayload,
    JWT_SECRET as jwt.Secret,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  };
}

/**
 * Verify and decode a JWT token
 * @param token The token to verify
 * @returns Decoded token payload if valid
 * @throws JsonWebTokenError if token is invalid
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw error;
  }
}

/**
 * Generate a new access token using a refresh token
 * @param refreshToken The refresh token to use
 * @returns New access token if refresh token is valid
 * @throws Error if refresh token is invalid or expired
 */
export function refreshAccessToken(refreshToken: string): string {
  try {
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Generate new access token
    return jwt.sign(
      { 
        userId: decoded.userId, 
        email: decoded.email,
        type: 'access'
      } as TokenPayload,
      JWT_SECRET as jwt.Secret,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

/**
 * Extract user information from a token
 * @param token The token to extract user info from
 * @returns User ID and email from the token
 */
export function extractUserFromToken(token: string): Pick<User, 'id' | 'email'> {
  const decoded = verifyToken(token);
  return {
    id: decoded.userId,
    email: decoded.email
  };
} 