#!/bin/bash

# Bell24h Marketplace Startup Script

echo "Starting Bell24h Marketplace..."
echo "==============================================="

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run this application."
    exit 1
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "Error: server.js not found. Make sure you are in the correct directory."
    exit 1
fi

# Check for required packages
echo "Checking dependencies..."
REQUIRED_PACKAGES=("express" "pg" "ws")
MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if ! grep -q "\"$package\"" package.json; then
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo "Missing required packages: ${MISSING_PACKAGES[*]}"
    echo "Installing missing packages..."
    npm install ${MISSING_PACKAGES[*]} --save
fi

# Check database connection
echo "Checking database connection..."
if [ -z "$DATABASE_URL" ]; then
    echo "Warning: DATABASE_URL environment variable not set. Using default connection."
fi

# Start the server
echo "Starting server..."
echo "==============================================="
node server.js