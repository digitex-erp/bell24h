// Simple verification script for local SQLite database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function verifyData() {
  console.log('🔍 Verifying Bell24h Database Seed Data...\n');

  try {
    // Count suppliers
    const supplierCount = await prisma.user.count({
      where: { type: 'SUPPLIER' }
    });
    console.log(`✅ Suppliers: ${supplierCount}/50 ${supplierCount === 50 ? '✓' : '✗'}`);

    // Count buyers
    const buyerCount = await prisma.user.count({
      where: { type: 'BUYER' }
    });
    console.log(`✅ Buyers: ${buyerCount}/20 ${buyerCount === 20 ? '✓' : '✗'}`);

    // Count RFQs
    const rfqCount = await prisma.rfq.count();
    console.log(`✅ RFQs: ${rfqCount}/30 ${rfqCount === 30 ? '✓' : '✗'}`);

    // Count quotes
    const quoteCount = await prisma.quote.count();
    console.log(`✅ Quotes: ${quoteCount}/50 ${quoteCount === 50 ? '✓' : '✗'}`);

    // Count messages
    const messageCount = await prisma.message.count();
    console.log(`✅ Messages: ${messageCount}/100 ${messageCount === 100 ? '✓' : '✗'}`);

    // Count categories
    const categoryCount = await prisma.category.count();
    console.log(`✅ Categories: ${categoryCount}/50 ${categoryCount >= 50 ? '✓' : '✗'}`);

    // Count payments
    const paymentCount = await prisma.payment.count();
    console.log(`✅ Payments: ${paymentCount}/25 ${paymentCount === 25 ? '✓' : '✗'}`);

    console.log('\n📋 Sample Data Checks:');

    // Sample supplier
    const sampleSupplier = await prisma.user.findFirst({
      where: { type: 'SUPPLIER' },
      select: { email: true, companyName: true, city: true, verified: true, rating: true }
    });
    console.log(`Sample Supplier: ${sampleSupplier?.email} | ${sampleSupplier?.companyName} | ${sampleSupplier?.city} | Verified: ${sampleSupplier?.verified} | Rating: ${sampleSupplier?.rating}`);

    // Sample buyer
    const sampleBuyer = await prisma.user.findFirst({
      where: { type: 'BUYER' },
      select: { email: true, companyName: true, city: true, verified: true }
    });
    console.log(`Sample Buyer: ${sampleBuyer?.email} | ${sampleBuyer?.companyName} | ${sampleBuyer?.city} | Verified: ${sampleBuyer?.verified}`);

    // Sample RFQ
    const sampleRfq = await prisma.rfq.findFirst({
      select: { title: true, quantity: true, unit: true, targetPrice: true, deadline: true }
    });
    console.log(`Sample RFQ: ${sampleRfq?.title} | Qty: ${sampleRfq?.quantity} ${sampleRfq?.unit} | Target: ₹${sampleRfq?.targetPrice} | Deadline: ${sampleRfq?.deadline}`);

    // Sample Hindi-English message
    const hindiMessage = await prisma.message.findFirst({
      where: { 
        content: { contains: 'hai' }
      },
      select: { content: true }
    });
    console.log(`Sample Hindi Message: ${hindiMessage?.content}`);

    // Check quotes per RFQ
    const rfqQuoteCounts = await prisma.rfq.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: { quotes: true }
        }
      },
      take: 5
    });
    console.log('\n📊 Quotes per RFQ (first 5):');
    rfqQuoteCounts.forEach(rfq => {
      console.log(`  ${rfq.title}: ${rfq._count.quotes} quotes`);
    });

    console.log('\n✨ All verifications completed!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();