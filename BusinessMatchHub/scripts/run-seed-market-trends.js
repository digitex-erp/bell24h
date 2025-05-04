/**
 * Runner script for the market trends seeder
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('Running market trends seeder...');

try {
  // Run the TypeScript seeder with ts-node
  execSync('npx tsx scripts/seed-market-trends.ts', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('Market trends seeding completed!');
} catch (error) {
  console.error('Error running market trends seeder:', error);
  process.exit(1);
}