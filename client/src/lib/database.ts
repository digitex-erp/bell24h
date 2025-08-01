import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Database utility functions
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
}

// Database seeding function
export async function seedDatabase() {
  try {
    // Seed categories
    const categories = [
      {
        name: 'Electronics',
        slug: 'electronics',
        icon: '🏭',
        description: 'Electronic components and devices',
        featured: true,
        trending: true,
      },
      {
        name: 'Textiles',
        slug: 'textiles',
        icon: '🧵',
        description: 'Fabric and garment manufacturing',
        featured: true,
        trending: false,
      },
      {
        name: 'Machinery',
        slug: 'machinery',
        icon: '⚙️',
        description: 'Industrial machinery and equipment',
        featured: false,
        trending: true,
      },
      {
        name: 'Automotive',
        slug: 'automotive',
        icon: '🚗',
        description: 'Automotive parts and components',
        featured: true,
        trending: false,
      },
      {
        name: 'Construction',
        slug: 'construction',
        icon: '🏗️',
        description: 'Construction materials and supplies',
        featured: false,
        trending: false,
      },
      {
        name: 'Chemicals',
        slug: 'chemicals',
        icon: '🧪',
        description: 'Industrial chemicals and materials',
        featured: false,
        trending: false,
      },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      });
    }

    // Seed sample suppliers
    const suppliers = [
      {
        name: 'TechSupply Pro',
        email: 'contact@techsupplypro.com',
        phone: '+91-9876543210',
        location: 'Mumbai, Maharashtra',
        website: 'https://techsupplypro.com',
        verified: true,
        ecgcApproved: true,
        featured: true,
        rating: 4.8,
        reviews: 234,
        orders: 2340,
        responseTime: '<2hrs',
        aiMatchScore: 98.7,
        specialties: ['PCB Manufacturing', 'Component Sourcing', 'Assembly Services'],
        certifications: ['ISO 9001', 'ECGC Approved', 'BELL24H Verified'],
        description:
          'Leading electronics component supplier with 15+ years experience in PCB manufacturing and component sourcing',
        logo: '🏭',
        priceRange: '₹1K - ₹1L',
        successRate: '98.5%',
        employees: '500-1000',
        revenue: '₹50-100Cr',
        establishedYear: 2008,
      },
      {
        name: 'TextileCraft Industries',
        email: 'info@textilecraft.com',
        phone: '+91-9876543211',
        location: 'Bangalore, Karnataka',
        website: 'https://textilecraft.com',
        verified: true,
        ecgcApproved: true,
        featured: true,
        rating: 4.7,
        reviews: 189,
        orders: 1890,
        responseTime: '<1hr',
        aiMatchScore: 95.2,
        specialties: ['Fabric Sourcing', 'Garment Manufacturing', 'Dyeing Services'],
        certifications: ['GOTS Certified', 'ECGC Approved', 'BELL24H Verified'],
        description:
          'Premium textile manufacturer specializing in sustainable garment production and fabric innovation',
        logo: '🧵',
        priceRange: '₹500 - ₹5K',
        successRate: '96.8%',
        employees: '200-500',
        revenue: '₹25-50Cr',
        establishedYear: 2012,
      },
      {
        name: 'MachineTech Solutions',
        email: 'sales@machinetech.com',
        phone: '+91-9876543212',
        location: 'Pune, Maharashtra',
        website: 'https://machinetech.com',
        verified: true,
        ecgcApproved: false,
        featured: false,
        rating: 4.9,
        reviews: 156,
        orders: 1650,
        responseTime: '<3hrs',
        aiMatchScore: 97.3,
        specialties: ['CNC Machines', 'Industrial Equipment', 'Automation'],
        certifications: ['ISO 14001', 'CE Certified', 'BELL24H Verified'],
        description:
          'Industrial machinery specialist providing CNC equipment and manufacturing automation solutions',
        logo: '⚙️',
        priceRange: '₹10K - ₹10L',
        successRate: '94.2%',
        employees: '100-200',
        revenue: '₹10-25Cr',
        establishedYear: 2015,
      },
    ];

    for (const supplier of suppliers) {
      await prisma.supplier.upsert({
        where: { email: supplier.email },
        update: supplier,
        create: supplier,
      });
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Export types for better TypeScript support
export type {
  Analytics,
  Category,
  Listing,
  Notification,
  Payment,
  Quote,
  RFQ,
  Subscription,
  Supplier,
  User,
} from '@prisma/client';
