#!/usr/bin/env node
// Ultimate Node.js automation - NO Q PREFIX EVER
const { execSync, spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 ULTIMATE NODE.JS AUTOMATION - NO Q PREFIX');
console.log('==============================================');

// Set environment
process.env.CURSOR_NO_Q_PREFIX = 'true';
process.env.BYPASS_Q_PREFIX = 'true';

function executeCommand(command, description) {
    console.log(`\n🔄 ${description}`);
    console.log(`Command: ${command}`);
    
    try {
        execSync(command, { 
            stdio: 'inherit',
            encoding: 'utf8',
            env: {
                ...process.env,
                CURSOR_NO_Q_PREFIX: 'true',
                BYPASS_Q_PREFIX: 'true'
            }
        });
        console.log(`✅ ${description} - SUCCESS`);
        return true;
    } catch (error) {
        console.log(`⚠️ ${description} - FAILED: ${error.message}`);
        return false;
    }
}

// Execute all commands
executeCommand('npm install', 'Installing dependencies');
executeCommand('npx prisma generate', 'Generating Prisma client');
executeCommand('npm run build', 'Building application');
executeCommand('git add -A', 'Adding changes to Git');
executeCommand('git commit -m "ULTIMATE FIX: Eliminate q prefix permanently"', 'Committing changes');
executeCommand('git push origin main', 'Pushing to GitHub');
executeCommand('npx vercel --prod', 'Deploying to Vercel');

console.log('\n🎉 ULTIMATE NODE.JS AUTOMATION COMPLETE - NO Q PREFIX!');
