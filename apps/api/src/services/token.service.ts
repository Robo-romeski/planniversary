import { redisClient } from '../config/redis';

const TOKEN_BLACKLIST_PREFIX = 'bl_token:';
const USER_SESSIONS_PREFIX = 'user_sessions:';

export class TokenService {
  /**
   * Add a token to the blacklist
   * @param token The JWT token to blacklist
   * @param expiresIn Time in seconds until the token expires
   */
  static async blacklistToken(token: string, expiresIn: number): Promise<void> {
    await redisClient.setEx(`${TOKEN_BLACKLIST_PREFIX}${token}`, expiresIn, 'blacklisted');
  }

  /**
   * Check if a token is blacklisted
   * @param token The JWT token to check
   * @returns boolean indicating if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await redisClient.get(`${TOKEN_BLACKLIST_PREFIX}${token}`);
    return result !== null;
  }

  /**
   * Add a refresh token to user's session
   * @param userId The user's ID
   * @param refreshToken The refresh token
   * @param expiresIn Time in seconds until the token expires
   */
  static async addUserSession(userId: string, refreshToken: string, expiresIn: number): Promise<void> {
    const key = `${USER_SESSIONS_PREFIX}${userId}`;
    
    // Get existing sessions
    const sessions = await redisClient.sMembers(key);
    
    // Add new session
    await redisClient.sAdd(key, refreshToken);
    
    // Set expiry on the refresh token
    await redisClient.expire(key, expiresIn);
    
    // Limit to 5 active sessions per user
    if (sessions.length >= 5) {
      // Remove oldest session
      const oldestSession = sessions[0];
      await redisClient.sRem(key, oldestSession);
    }
  }

  /**
   * Remove a refresh token from user's sessions
   * @param userId The user's ID
   * @param refreshToken The refresh token to remove
   */
  static async removeUserSession(userId: string, refreshToken: string): Promise<void> {
    const key = `${USER_SESSIONS_PREFIX}${userId}`;
    await redisClient.sRem(key, refreshToken);
  }

  /**
   * Check if a refresh token exists in user's sessions
   * @param userId The user's ID
   * @param refreshToken The refresh token to check
   * @returns boolean indicating if the session exists
   */
  static async isValidUserSession(userId: string, refreshToken: string): Promise<boolean> {
    const key = `${USER_SESSIONS_PREFIX}${userId}`;
    return await redisClient.sIsMember(key, refreshToken);
  }

  /**
   * Remove all sessions for a user
   * @param userId The user's ID
   */
  static async removeAllUserSessions(userId: string): Promise<void> {
    const key = `${USER_SESSIONS_PREFIX}${userId}`;
    await redisClient.del(key);
  }
} 