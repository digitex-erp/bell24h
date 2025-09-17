@echo off
echo Starting Bell24h Database Setup...
cd /d "%~dp0"
node scripts/setup-database.js
pause
