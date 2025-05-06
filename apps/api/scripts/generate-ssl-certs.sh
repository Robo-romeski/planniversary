#!/bin/bash

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "mkcert is not installed. Installing..."
    
    # Check the operating system and install mkcert accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install mkcert
        brew install nss # for Firefox
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y libnss3-tools
            sudo apt-get install -y mkcert
        elif command -v yum &> /dev/null; then
            sudo yum install nss-tools
            sudo yum install mkcert
        fi
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        echo "Please install mkcert manually on Windows:"
        echo "1. Install Chocolatey from https://chocolatey.org/"
        echo "2. Run: choco install mkcert"
        exit 1
    else
        echo "Unsupported operating system"
        exit 1
    fi
fi

# Create certs directory if it doesn't exist
CERTS_DIR="certs"
mkdir -p "$CERTS_DIR"

# Install mkcert root CA if not already installed
mkcert -install

# Generate certificates for localhost
echo "Generating SSL certificates for localhost..."
mkcert -key-file "$CERTS_DIR/localhost-key.pem" \
       -cert-file "$CERTS_DIR/localhost.pem" \
       localhost 127.0.0.1 ::1

echo "SSL certificates generated successfully in $CERTS_DIR/"
echo "- Certificate: $CERTS_DIR/localhost.pem"
echo "- Private key: $CERTS_DIR/localhost-key.pem" 