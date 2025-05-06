import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'planiversary',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres', // Set default password
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
};

// Initialize pg-promise with options
const pgp = pgPromise({
  // Event handlers for database-related events
  error: (error, e) => {
    if (e.cn) {
      // A connection-related error
      console.error('CN:', e.cn);
      console.error('EVENT:', error.message || error);
    }
  }
});

// Create database instance
export const db = pgp(databaseConfig);

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await db.connect();
    console.log('✅ Successfully connected to database');
    connection.done();
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
};

// Export pgp instance for access to special queries or types if needed
export { pgp };

export const nodeConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default_jwt_secret_do_not_use_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

export const apiConfig = {
  prefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}; 