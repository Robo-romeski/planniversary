import { BaseRepository } from './base.repository';
import { db } from '../config/database';
import { User, CreateUserDTO, UpdateUserDTO, AccountStatus, OAuthProvider } from '../models/user.model';

export class UserRepository extends BaseRepository<User, string> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
  }

  async findByUsername(username: string): Promise<User | null> {
    return db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
  }

  async findByOAuth(provider: OAuthProvider, oauthId: string): Promise<User | null> {
    return db.oneOrNone(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      [provider, oauthId]
    );
  }

  async createUser(userData: CreateUserDTO, passwordHash: string): Promise<User> {
    const result = await db.one(
      `INSERT INTO users (
        email, password_hash, username, first_name, last_name, 
        email_verified, account_status
      ) VALUES (
        $1, $2, $3, $4, $5, 
        false, 'pending'
      ) RETURNING *`,
      [
        userData.email,
        passwordHash,
        userData.username || null,
        userData.first_name || null,
        userData.last_name || null
      ]
    );
    return result;
  }

  async createOAuthUser(
    email: string,
    provider: OAuthProvider,
    oauthId: string,
    userData: Partial<CreateUserDTO>
  ): Promise<User> {
    const result = await db.one(
      `INSERT INTO users (
        email, oauth_provider, oauth_id, username, first_name, last_name,
        email_verified, account_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        true, 'active'
      ) RETURNING *`,
      [
        email,
        provider,
        oauthId,
        userData.username || null,
        userData.first_name || null,
        userData.last_name || null
      ]
    );
    return result;
  }

  async updateUser(id: string, userData: UpdateUserDTO): Promise<User | null> {
    const updates: any = { ...userData };
    const setColumns = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map((key, i) => `${key} = $${i + 2}`);

    if (setColumns.length === 0) return null;

    const query = `
      UPDATE users 
      SET ${setColumns.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, ...Object.values(updates).filter(val => val !== undefined)];
    console.log('[UserRepository.updateUser] Query:', query);
    console.log('[UserRepository.updateUser] Values:', values);
    const result = await db.oneOrNone(query, values);
    console.log('[UserRepository.updateUser] Result:', result);
    return result;
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const result = await db.result(
      'UPDATE users SET password_hash = $2 WHERE id = $1',
      [id, passwordHash]
    );
    return result.rowCount > 0;
  }

  async setEmailVerification(id: string, verified: boolean): Promise<boolean> {
    const result = await db.result(
      'UPDATE users SET email_verified = $2 WHERE id = $1',
      [id, verified]
    );
    return result.rowCount > 0;
  }

  async setVerificationToken(
    id: string, 
    token: string | null, 
    expiresAt: Date | null
  ): Promise<boolean> {
    const result = await db.result(
      `UPDATE users 
       SET verification_token = $2, verification_token_expires_at = $3 
       WHERE id = $1`,
      [id, token, expiresAt]
    );
    return result.rowCount > 0;
  }

  async setResetToken(
    id: string, 
    token: string | null, 
    expiresAt: Date | null
  ): Promise<boolean> {
    const result = await db.result(
      `UPDATE users 
       SET reset_token = $2, reset_token_expires_at = $3 
       WHERE id = $1`,
      [id, token, expiresAt]
    );
    return result.rowCount > 0;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return db.oneOrNone(
      `SELECT * FROM users 
       WHERE verification_token = $1 
       AND verification_token_expires_at > NOW()`,
      [token]
    );
  }

  async findByResetToken(token: string): Promise<User | null> {
    return db.oneOrNone(
      `SELECT * FROM users 
       WHERE reset_token = $1 
       AND reset_token_expires_at > NOW()`,
      [token]
    );
  }

  async updateLastLogin(id: string): Promise<boolean> {
    const result = await db.result(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  async updateAccountStatus(id: string, status: AccountStatus): Promise<boolean> {
    const result = await db.result(
      'UPDATE users SET account_status = $2 WHERE id = $1',
      [id, status]
    );
    return result.rowCount > 0;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.result('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
} 