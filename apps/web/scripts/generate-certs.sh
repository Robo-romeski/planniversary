#!/bin/bash

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "mkcert is not installed. Please install it first:"
    echo "On macOS: brew install mkcert"
    echo "On Linux: apt install mkcert"
    echo "On Windows: choco install mkcert"
    exit 1
fi

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate certificates
mkcert -install
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1 