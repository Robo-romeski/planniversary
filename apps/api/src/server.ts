import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import application from './app';
import { env } from './config/env';
import { createHttpsServer } from './config/https';
import { createServer } from 'http';

// Load environment variables
config();

const PORT: string = String(env.PORT || '3001');
const HTTPS_PORT: string = String(parseInt(PORT, 10) + 1);

// Middleware
const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Create HTTP server
const httpServer = createServer(application);

// Start HTTP server
httpServer.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});

// Start HTTPS server in development
if (env.NODE_ENV === 'development') {
  const httpsServer = createHttpsServer(application);
  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running on port ${HTTPS_PORT}`);
  });
}

export default application; 