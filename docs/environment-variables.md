# Environment Variables Documentation

This document describes all environment variables used in the Planiversary project.

## Backend (API) Environment Variables

### Node Environment
- `NODE_ENV`: Application environment (`development`, `test`, `production`). Default: `development`
- `PORT`: Port number for the HTTP server. Default: `3001`

### Database Configuration
- `DB_HOST`: PostgreSQL database host. Default: `localhost`
- `DB_PORT`: PostgreSQL database port. Default: `5432`
- `DB_NAME`: PostgreSQL database name. Default: `planiversary`
- `DB_USER`: PostgreSQL database user. Default: `postgres`
- `DB_PASSWORD`: PostgreSQL database password. Default: `postgres`
- `DB_SSL`: Enable SSL for database connection (`true`/`false`). Default: `false`

### Redis Configuration
- `REDIS_URL`: Redis connection URL. Default: `redis://localhost:6379`

### JWT Authentication
- `JWT_SECRET`: Secret key for JWT token generation (min 32 characters). **Required**
- `JWT_EXPIRES_IN`: JWT token expiration time. Default: `24h`

### API Configuration
- `API_PREFIX`: API route prefix. Default: `/api/v1`
- `CORS_ORIGIN`: Allowed CORS origin. Default: `http://localhost:3000`

### Security Settings
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window in milliseconds. Default: `900000` (15 minutes)
- `RATE_LIMIT_MAX`: Maximum requests per window. Default: `100`

## Frontend (Web) Environment Variables

### API Configuration
- `NEXT_PUBLIC_API_URL`: Backend API URL. Default: `http://localhost:3001/api/v1`

## Development Setup

1. Copy the example environment files:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

2. Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Update the environment files with your values.

## HTTPS Development

Both the frontend and backend support HTTPS in development mode. SSL certificates are automatically generated when running the development servers with HTTPS:

```bash
# Run both frontend and backend with HTTPS
npm run dev

# Or run them separately
npm run dev:api  # Backend on https://localhost:3002
npm run dev:web  # Frontend on https://localhost:3000
```

## Production Deployment

In production:
1. Set `NODE_ENV=production`
2. Use strong, unique passwords for database and JWT secret
3. Configure proper CORS origins
4. Use environment-specific database and Redis URLs
5. Set appropriate rate limiting values 