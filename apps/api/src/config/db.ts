import pgPromise from 'pg-promise';
import { DatabaseConfig } from '../types/database';
import { databaseConfig } from './database';

// Initialize pg-promise with options
const pgp = pgPromise({
  // Initialization options
  capSQL: true, // capitalize SQL queries
  // You can add more options here as needed
});

// Create the database instance with the configuration
export const db = pgp(databaseConfig as DatabaseConfig);

// Add an error handler
db.$pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export pgp instance in case it's needed elsewhere
export { pgp }; 