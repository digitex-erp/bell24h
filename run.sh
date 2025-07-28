#!/bin/bash

# Bell24H Application Runner Script
echo "Starting Bell24H application..."

# Check if database is connected
node -e "require('./src/db').connectToDatabase().then(connected => { if (!connected) process.exit(1); else process.exit(0); })" 

if [ $? -ne 0 ]; then
  echo "Database connection failed. Setting up database..."
  # Install required dependencies if needed
  npm install
  
  # Push schema changes to database
  npx drizzle-kit push:pg
  
  # Seed the database
  npx tsx db/seed.ts
fi

# Start the server
echo "Starting server..."
npx tsx src/index.ts
