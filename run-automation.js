#!/usr/bin/env node
// Node.js automation that bypasses q prefix
const { execSync } = require('child_process');

console.log('Running automation without q prefix...');

try {
    execSync('npm install', { stdio: 'inherit' });
    execSync('npx prisma generate', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    execSync('git add -A', { stdio: 'inherit' });
    execSync('git commit -m "AUTO-DEPLOY: Fix q prefix and deploy"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    execSync('npx vercel --prod', { stdio: 'inherit' });
    
    console.log('Automation completed successfully!');
} catch (error) {
    console.error('Automation failed:', error.message);
    process.exit(1);
}
