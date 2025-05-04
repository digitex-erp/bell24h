/**
 * Compatible startup script for Bell24h Application
 * This script uses the CommonJS versions of server files to avoid
 * ESM/CJS compatibility issues.
 */

console.log('Starting Bell24h application in compatibility mode...');

// Use CommonJS-compatible server file
require('./server/index.compat.js');