import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CERTS_DIR = path.join(__dirname, '../certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true });
}

try {
  // Check if mkcert is installed
  execSync('which mkcert', { stdio: 'ignore' });
} catch (error) {
  console.error('mkcert is not installed. Please install it first:');
  console.error('macOS: brew install mkcert');
  console.error('Windows: choco install mkcert');
  console.error('Linux: apt install mkcert');
  process.exit(1);
}

try {
  // Install local CA
  execSync('mkcert -install', { stdio: 'inherit' });

  // Generate certificates
  execSync(
    `mkcert -key-file ${path.join(CERTS_DIR, 'localhost-key.pem')} -cert-file ${path.join(
      CERTS_DIR,
      'localhost.pem'
    )} localhost 127.0.0.1 ::1`,
    { stdio: 'inherit' }
  );

  console.log('\nSSL certificates generated successfully in the certs directory.');
} catch (error) {
  console.error('Error generating SSL certificates:', error);
  process.exit(1);
} 