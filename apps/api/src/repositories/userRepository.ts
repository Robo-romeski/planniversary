import { db } from '../config/db';
import { User, CreateUserDTO, UpdateUserDTO, UserResponse } from '../types/database';

class UserRepository {
  // Find user by ID
  async findById(id: number): Promise<UserResponse | null> {
    const query = `
      SELECT id, email, first_name, last_name, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const user = await db.oneOrNone(query, [id]);
    return user;
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT *
      FROM users
      WHERE email = $1
    `;
    const user = await db.oneOrNone(query, [email]);
    return user;
  }

  // Create new user
  async create(userData: CreateUserDTO): Promise<UserResponse> {
    const query = `
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, created_at, updated_at
    `;
    const values = [
      userData.email,
      userData.password,
      userData.first_name,
      userData.last_name
    ];
    const user = await db.one(query, values);
    return user;
  }

  // Update user
  async update(id: number, userData: UpdateUserDTO): Promise<UserResponse | null> {
    // Build the update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(userData.email);
      paramCount++;
    }
    if (userData.password !== undefined) {
      updates.push(`password = $${paramCount}`);
      values.push(userData.password);
      paramCount++;
    }
    if (userData.first_name !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      values.push(userData.first_name);
      paramCount++;
    }
    if (userData.last_name !== undefined) {
      updates.push(`last_name = $${paramCount}`);
      values.push(userData.last_name);
      paramCount++;
    }

    // If no updates, return null
    if (updates.length === 0) return null;

    // Add the id to values array
    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, created_at, updated_at
    `;

    const user = await db.oneOrNone(query, values);
    return user;
  }

  // Delete user
  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `;
    const result = await db.oneOrNone(query, [id]);
    return result !== null;
  }

  // List all users with pagination
  async findAll(page: number = 1, limit: number = 10): Promise<{ users: UserResponse[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const countQuery = 'SELECT COUNT(*) FROM users';
    const total = parseInt((await db.one(countQuery)).count, 10);

    const query = `
      SELECT id, email, first_name, last_name, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const users = await db.manyOrNone(query, [limit, offset]);

    return { users, total };
  }
}

export const userRepository = new UserRepository(); 