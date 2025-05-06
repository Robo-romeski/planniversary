import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CERTS_DIR = path.join(__dirname, '../certs');

const checkMkcertInstallation = () => {
  try {
    execSync('mkcert --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

const installMkcert = () => {
  console.log('Installing mkcert...');
  
  try {
    const platform = process.platform;
    
    if (platform === 'darwin') {
      execSync('brew install mkcert', { stdio: 'inherit' });
      execSync('brew install nss', { stdio: 'inherit' }); // Required for Firefox
    } else if (platform === 'linux') {
      execSync('sudo apt-get update && sudo apt-get install -y libnss3-tools', { stdio: 'inherit' });
      execSync('sudo apt-get install -y mkcert', { stdio: 'inherit' });
    } else if (platform === 'win32') {
      execSync('choco install mkcert', { stdio: 'inherit' });
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    console.log('✅ mkcert installed successfully');
  } catch (error) {
    console.error('❌ Failed to install mkcert. Please install it manually:');
    console.error('- macOS: brew install mkcert nss');
    console.error('- Linux: sudo apt-get install -y libnss3-tools mkcert');
    console.error('- Windows: choco install mkcert');
    process.exit(1);
  }
};

const generateSSLCerts = () => {
  // Check if mkcert is installed
  if (!checkMkcertInstallation()) {
    installMkcert();
  }

  // Create certs directory if it doesn't exist
  if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
  }

  try {
    // Install mkcert root CA
    execSync('mkcert -install', { stdio: 'inherit' });

    // Generate certificates
    execSync(
      `mkcert -key-file ${path.join(CERTS_DIR, 'localhost-key.pem')} -cert-file ${path.join(
        CERTS_DIR,
        'localhost.pem'
      )} localhost 127.0.0.1 ::1`,
      { stdio: 'inherit' }
    );

    console.log('\n✅ SSL certificates generated successfully in the certs/ directory');

    // Add certs directory to .gitignore if not already present
    const gitignorePath = path.join(__dirname, '../.gitignore');
    const gitignoreContent = fs.existsSync(gitignorePath)
      ? fs.readFileSync(gitignorePath, 'utf-8')
      : '';

    if (!gitignoreContent.includes('certs/')) {
      fs.appendFileSync(gitignorePath, '\n# SSL Certificates\ncerts/\n');
      console.log('✅ Added certs/ to .gitignore');
    }
  } catch (error) {
    console.error('❌ Failed to generate SSL certificates:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  generateSSLCerts();
}

export { generateSSLCerts }; 