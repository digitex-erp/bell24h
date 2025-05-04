#!/bin/bash

# Bell24h Application Startup Script
# This script starts the Bell24h application using the unified startup process

# Header display
echo "-----------------------------------------"
echo "      BELL24h STARTUP SCRIPT"
echo "-----------------------------------------"
echo ""

# Set execute permissions for the startup script if needed
if [ ! -x "bell24h-unified-startup.js" ]; then
  chmod +x bell24h-unified-startup.js
  echo "✓ Set execute permissions for startup script"
fi

# Check for database connection
check_database() {
  echo "Checking database connection..."
  node -e "const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()', (err, res) => { if(err) { console.error('Database connection failed'); process.exit(1); } else { console.log('✓ Database connection successful'); pool.end(); } });" || return 1
}

check_database

if [ $? -ne 0 ]; then
  echo "❌ Database connection failed. Please check your DATABASE_URL environment variable."
  exit 1
fi

# Check for important environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  Warning: DATABASE_URL environment variable is not set"
fi

# Start the application
echo "Starting Bell24h application..."
node bell24h-unified-startup.js
