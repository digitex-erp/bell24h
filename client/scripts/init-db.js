const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('🔧 Initializing Bell24h database...');
    
    // Push the schema to the database
    console.log('📋 Pushing schema to database...');
    const { execSync } = require('child_process');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Database schema pushed successfully!');
    
    // Test the connection
    console.log('🔍 Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected! Found ${userCount} users.`);
    
    // Create a test user if none exist
    if (userCount === 0) {
      console.log('👤 Creating test user...');
      const testUser = await prisma.user.create({
        data: {
          email: 'admin@bell24h.com',
          name: 'Bell24h Admin',
          companyname: 'Bell24h',
          role: 'SUPPLIER',
          roles: ['supplier', 'buyer'],
          trafficTier: 'PLATINUM',
          showcaseEnabled: true,
        }
      });
      console.log(`✅ Test user created: ${testUser.email}`);
    }
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase(); 