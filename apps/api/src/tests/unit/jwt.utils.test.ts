import { generateToken, generateTokens, verifyToken, refreshAccessToken } from '../../utils/jwt.utils';
import { User } from '../../models/user.model';

describe('JWT Utilities', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password_hash: 'hash',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    email_verified: true,
    verification_token: null,
    verification_token_expires_at: null,
    reset_token: null,
    reset_token_expires_at: null,
    last_login: null,
    account_status: 'active',
    profile_picture_url: null,
    oauth_provider: null,
    oauth_id: null,
    created_at: new Date(),
    updated_at: new Date()
  };

  describe('generateToken', () => {
    it('should generate a valid token with correct payload', () => {
      const payload = { userId: '1', email: 'test@example.com', type: 'access' as const };
      const token = generateToken(payload, '15m');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.type).toBe(payload.type);
    });

    it('should generate tokens with different types', () => {
      const types = ['access', 'refresh', 'verification', 'reset'] as const;
      
      types.forEach(type => {
        const token = generateToken({ type }, '15m');
        const decoded = verifyToken(token);
        expect(decoded.type).toBe(type);
      });
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const { accessToken, refreshToken, expiresIn } = generateTokens(mockUser);
      
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(expiresIn).toBeDefined();
      
      const decodedAccess = verifyToken(accessToken);
      expect(decodedAccess.type).toBe('access');
      expect(decodedAccess.userId).toBe(mockUser.id);
      expect(decodedAccess.email).toBe(mockUser.email);
      
      const decodedRefresh = verifyToken(refreshToken);
      expect(decodedRefresh.type).toBe('refresh');
      expect(decodedRefresh.userId).toBe(mockUser.id);
      expect(decodedRefresh.email).toBe(mockUser.email);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { userId: '1', type: 'access' as const };
      const token = generateToken(payload, '15m');
      
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.type).toBe(payload.type);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('should throw error for expired token', () => {
      const payload = { userId: '1', type: 'access' as const };
      const token = generateToken(payload, '0s'); // Expires immediately
      
      // Wait a moment to ensure token expires
      setTimeout(() => {
        expect(() => verifyToken(token)).toThrow();
      }, 1000);
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from valid refresh token', () => {
      const { refreshToken } = generateTokens(mockUser);
      const newAccessToken = refreshAccessToken(refreshToken);
      
      expect(newAccessToken).toBeDefined();
      expect(typeof newAccessToken).toBe('string');
      
      const decoded = verifyToken(newAccessToken);
      expect(decoded.type).toBe('access');
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should throw error for non-refresh token', () => {
      const accessToken = generateToken({ userId: '1', type: 'access' }, '15m');
      expect(() => refreshAccessToken(accessToken)).toThrow('Invalid token type');
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => refreshAccessToken('invalid-token')).toThrow('Invalid refresh token');
    });
  });
}); 