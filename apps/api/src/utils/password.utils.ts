import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password using bcrypt
 * @param password The plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param password The plain text password to check
 * @param hashedPassword The hashed password to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a secure random token for email verification or password reset
 * @param length Length of the token to generate (default: 32)
 * @returns A random token string
 */
export function generateSecureToken(length: number = 32): string {
  return bcrypt.genSaltSync(8)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);
}

/**
 * Calculate expiration date for a token
 * @param hours Number of hours from now when the token should expire
 * @returns Date object representing the expiration time
 */
export function calculateTokenExpiry(hours: number = 24): Date {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hours);
  return expiryDate;
} 