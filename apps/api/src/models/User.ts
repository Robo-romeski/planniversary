import { db } from '../config/database';
import bcrypt from 'bcrypt';

export interface IUser {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface IUserUpdate {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
}

export class User {
  static async create(userData: IUserCreate): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return db.one<IUser>(
      `INSERT INTO users (email, password, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userData.email, hashedPassword, userData.first_name, userData.last_name]
    );
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    return db.oneOrNone<IUser>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
  }

  static async findById(id: number): Promise<IUser | null> {
    return db.oneOrNone<IUser>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
  }

  static async update(id: number, userData: IUserUpdate): Promise<IUser> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.email) {
      updates.push(`email = $${paramCount}`);
      values.push(userData.email);
      paramCount++;
    }

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      updates.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (userData.first_name) {
      updates.push(`first_name = $${paramCount}`);
      values.push(userData.first_name);
      paramCount++;
    }

    if (userData.last_name) {
      updates.push(`last_name = $${paramCount}`);
      values.push(userData.last_name);
      paramCount++;
    }

    values.push(id);

    return db.one<IUser>(
      `UPDATE users 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
  }

  static async delete(id: number): Promise<void> {
    await db.none(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
  }

  static async validatePassword(user: IUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
} 