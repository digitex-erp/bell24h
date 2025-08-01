import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Indian businesses...');

  // Check if demo users already exist
  const existingSupplier = await prisma.user.findUnique({
    where: { email: 'demo.supplier@bell24h.com' },
  });

  const existingBuyer = await prisma.user.findUnique({
    where: { email: 'demo.buyer@bell24h.com' },
  });

  if (existingSupplier && existingBuyer) {
    console.log('✅ Demo users already exist, skipping...');
    return;
  }

  // Create demo supplier account: Mumbai Textiles Pvt Ltd
  const supplierPassword = await bcrypt.hash('supplier123', 12);
  
  const supplierUser = await prisma.user.create({
    data: {
      email: 'demo.supplier@bell24h.com',
      name: 'Mumbai Textiles Pvt Ltd',
      companyname: 'Mumbai Textiles Pvt Ltd',
      role: 'SUPPLIER',
      gstin: '27ABCDE1234F1Z5',
      phone: '+91-98765-43210',
      address: '123 Textile Street, Andheri East, Mumbai - 400069',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      businesstype: 'manufacturing',
      password: supplierPassword,
      isemailverified: true
    }
  });

  console.log('✅ Supplier demo user created:', {
    id: supplierUser.id,
    email: supplierUser.email,
    name: supplierUser.name,
    companyname: supplierUser.companyname,
  });

  // Create demo buyer account: Delhi Manufacturing Co
  const buyerPassword = await bcrypt.hash('buyer123', 12);
  
  const buyerUser = await prisma.user.create({
    data: {
      email: 'demo.buyer@bell24h.com',
      name: 'Delhi Manufacturing Co',
      companyname: 'Delhi Manufacturing Co',
      role: 'BUYER',
      gstin: '07FGHIJ5678K1L9',
      phone: '+91-98765-43211',
      address: '456 Industrial Area, Okhla Phase 1, New Delhi - 110020',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110020',
      businesstype: 'manufacturing',
      password: buyerPassword,
      isemailverified: true
    }
  });

  console.log('✅ Buyer demo user created:', {
    id: buyerUser.id,
    email: buyerUser.email,
    name: buyerUser.name,
    companyname: buyerUser.companyname,
  });

  // Create additional Indian supplier users
  const additionalSuppliers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sales@puneautocomponents.com',
        name: 'Pune Auto Components',
        companyname: 'Pune Auto Components',
        role: 'SUPPLIER',
        gstin: '27GHIJK5678L1M9',
        phone: '+91-98765-43211',
        address: '789 Industrial Estate, Hinjewadi, Pune - 411057',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411057',
        businesstype: 'automotive',
        password: await bcrypt.hash('supplier123', 12),
        isemailverified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'contact@ahmedabadpharma.com',
        name: 'Ahmedabad Pharma Solutions',
        companyname: 'Ahmedabad Pharma Solutions',
        role: 'SUPPLIER',
        gstin: '24NOPQR5678S1T9',
        phone: '+91-98765-43212',
        address: '456 Pharma Park, Vatva, Ahmedabad - 382445',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382445',
        businesstype: 'pharmaceuticals',
        password: await bcrypt.hash('supplier123', 12),
        isemailverified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'hello@chennaiitservices.com',
        name: 'Chennai IT Services',
        companyname: 'Chennai IT Services',
        role: 'SUPPLIER',
        gstin: '33UVWXY5678Z1A9',
        phone: '+91-98765-43213',
        address: '123 Tech Park, Tidel Park, Chennai - 600113',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600113',
        businesstype: 'it_services',
        password: await bcrypt.hash('supplier123', 12),
        isemailverified: true
      }
    }),
  ]);

  console.log('✅ Additional Indian suppliers created:', additionalSuppliers.length);

  // Create sample products for Indian market
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Premium Cotton Fabric',
        description: 'High-quality cotton fabric suitable for garment manufacturing',
        category: 'Textiles & Garments',
        price: 150.00,
        minOrderQuantity: 1000,
        unit: 'meters',
        specifications: 'Material: 100% Cotton, Weight: 180 GSM, Width: 44 inches, Color: White',
        images: '/images/cotton-fabric-1.jpg',
        supplierId: supplierUser.id,
        status: 'ACTIVE'
      },
    }),
    prisma.product.create({
      data: {
        name: 'Automotive Engine Block',
        description: 'Precision-engineered engine blocks for commercial vehicles',
        category: 'Automotive Parts',
        price: 25000.00,
        minOrderQuantity: 10,
        unit: 'units',
        specifications: 'Material: Cast Iron, Weight: 45 kg, Compatibility: Commercial Vehicles, Warranty: 2 years',
        images: '/images/engine-block-1.jpg',
        supplierId: additionalSuppliers[0].id,
        status: 'ACTIVE'
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pharmaceutical API - Paracetamol',
        description: 'High-purity paracetamol API for pharmaceutical manufacturing',
        category: 'Pharmaceuticals',
        price: 850.00,
        minOrderQuantity: 100,
        unit: 'kg',
        specifications: 'Purity: 99.5%, Form: Powder, Packaging: 25kg drums, Shelf Life: 24 months',
        images: '/images/paracetamol-api.jpg',
        supplierId: additionalSuppliers[1].id,
        status: 'ACTIVE'
      },
    }),
  ]);

  console.log('✅ Indian products created:', products.length);

  console.log('🎉 Indian business database seeding completed!');
  console.log('📧 Demo Supplier: demo.supplier@bell24h.com (password: supplier123)');
  console.log('📧 Demo Buyer: demo.buyer@bell24h.com (password: buyer123)');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
