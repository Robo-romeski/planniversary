import http from 'http';
import https from 'https';
import app from './app';
import { env } from './config/env';
import { httpsConfig } from './config/https';

const PORT = env.PORT;

const startServer = () => {
  // Create HTTP server
  const httpServer = http.createServer(app);

  // Start HTTP server
  httpServer.listen(PORT, () => {
    console.log(`🚀 HTTP Server running on port ${PORT}`);
  });

  // Create HTTPS server in development
  if (httpsConfig.enabled && httpsConfig.key && httpsConfig.cert) {
    const httpsServer = https.createServer(
      {
        key: httpsConfig.key,
        cert: httpsConfig.cert,
      },
      app
    );

    // Start HTTPS server on PORT + 1
    httpsServer.listen(PORT + 1, () => {
      console.log(`🔒 HTTPS Server running on port ${PORT + 1}`);
    });
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer(); 