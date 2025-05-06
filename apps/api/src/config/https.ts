import fs from 'fs';
import path from 'path';
import https from 'https';
import { Express } from 'express';
import { env } from './env';

interface HttpsConfig {
  enabled: boolean;
  key?: Buffer;
  cert?: Buffer;
}

const CERTS_DIR = path.join(__dirname, '../../certs');
const KEY_PATH = path.join(CERTS_DIR, 'localhost-key.pem');
const CERT_PATH = path.join(CERTS_DIR, 'localhost.pem');

export const httpsConfig: HttpsConfig = {
  enabled: env.NODE_ENV === 'development',
  ...(env.NODE_ENV === 'development' && fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)
    ? {
        key: fs.readFileSync(KEY_PATH),
        cert: fs.readFileSync(CERT_PATH),
      }
    : {}),
};

export const createHttpsServer = (app: Express) => {
  if (!httpsConfig.enabled || !httpsConfig.key || !httpsConfig.cert) {
    throw new Error('HTTPS configuration is not complete. Please run npm run setup:ssl first.');
  }

  return https.createServer(
    {
      key: httpsConfig.key,
      cert: httpsConfig.cert,
    },
    app
  );
}; 