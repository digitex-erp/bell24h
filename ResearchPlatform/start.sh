#!/bin/bash

echo "Starting Bell24h application..."

# Try to start with tsx first (for ESM compatibility)
echo "Attempting to start with tsx..."
npx tsx server/index.ts

# If tsx fails, try with esbuild-register
if [ $? -ne 0 ]; then
  echo "TSX execution failed, trying with esbuild-register..."
  node -r esbuild-register server/index.ts

  # If that fails too, try the compatibility version
  if [ $? -ne 0 ]; then
    echo "ESBuild execution failed, trying compatibility mode..."
    node server/index.compat.js
  fi
fi