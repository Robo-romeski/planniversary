import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { apiLimiter, authLimiter } from './middleware/rate-limit.middleware';
import { errorHandler } from './middleware/error.middleware';
import { validateRequest } from './middleware/validation.middleware';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { db } from './config/database';

const app = express();

// Top-level request logger
app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.originalUrl}`);
  next();
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Request logging
app.use(morgan('dev'));
app.use(cookieParser());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use(apiLimiter);

// Health check endpoint (no rate limit)
// app.get('/health', (req, res) => {
//     res.json({ status: 'ok' });
// });

// API v1 health check (for frontend proxy compatibility)
app.get('/api/v1/health', (req, res) => {
  console.log('[HEALTHCHECK]', {
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer']
  });
  res.json({ status: 'ok', version: 'v1' });
});

// API v1 message test endpoint
// app.get('/api/v1/message', (req, res) => {
//     res.json({ message: 'API v1 is working!' });
// });

// Test database connection
app.get('/api/test', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ success: true, timestamp: result.rows[0].now });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({ success: false, error: 'Database connection failed' });
    }
});

// Apply stricter rate limiting to auth routes
app.use('/auth', authLimiter, authRoutes);

// API routes
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

export default app; 