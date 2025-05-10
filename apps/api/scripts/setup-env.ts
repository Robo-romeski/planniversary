import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const apiEnvTemplate = `# Node environment
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=planiversary
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=${generateJwtSecret()}
JWT_EXPIRES_IN=24h

# API
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
`;

const webEnvTemplate = ``;

const writeEnvFile = (filePath: string, content: string) => {
  const envPath = path.resolve(filePath);
  const envExamplePath = envPath.replace('.env', '.env.example');

  // Write .env file if it doesn't exist
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, content);
    console.log(`✅ Created ${envPath}`);
  } else {
    console.log(`⚠️ ${envPath} already exists, skipping...`);
  }

  // Always write .env.example
  fs.writeFileSync(envExamplePath, content.replace(generateJwtSecret(), 'your_jwt_secret_at_least_32_chars_long'));
  console.log(`✅ Created ${envExamplePath}`);
};

const setupEnv = () => {
  // Create API .env files
  writeEnvFile(path.join(__dirname, '../.env'), apiEnvTemplate);

  // Create Web .env files
  writeEnvFile(path.join(__dirname, '../../web/.env'), webEnvTemplate);
};

// Run setup if this script is executed directly
if (require.main === module) {
  setupEnv();
} 