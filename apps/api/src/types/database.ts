// Database configuration type
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // maximum number of clients in the pool
  idleTimeoutMillis?: number; // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis?: number; // how long to wait before timing out when connecting a new client
  ssl?: boolean | { rejectUnauthorized: boolean }; // SSL configuration
}

// Base user type with common properties
export interface BaseUser {
  email: string;
  name: string;
  password: string;
}

// User type with all properties including auto-generated ones
export interface User extends BaseUser {
  id: number;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

// Type for creating a new user
export type CreateUserDTO = Omit<BaseUser, 'id'> & {
  is_active?: boolean;
};

// Type for updating a user
export type UpdateUserDTO = Partial<Omit<BaseUser, 'id' | 'password'>> & {
  password?: string;
  is_active?: boolean;
  last_login?: Date;
};

// Type for user list response with pagination
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 