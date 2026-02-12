import { PrismaClient } from '@prisma/client'
import { ALL_50_CATEGORIES } from '../src/data/all-50-categories'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean small demo tables (safe for dev/demo only)
  await prisma.message.deleteMany().catch(() => {})
  await prisma.quote.deleteMany().catch(() => {})
  await prisma.rfq.deleteMany().catch(() => {})
  await prisma.category.deleteMany().catch(() => {})
  await prisma.user.deleteMany().catch(() => {})

  // Create demo users
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@bell24h.com',
      name: 'Demo Buyer',
      phone: '+91 9876543210',
      companyName: 'ABC Industries',
      type: 'BUYER',
    },
  })
  const supplier = await prisma.user.create({
    data: {
      email: 'supplier@bell24h.com',
      name: 'Demo Supplier',
      phone: '+91 9876543211',
      companyName: 'XYZ Suppliers',
      type: 'SUPPLIER',
    },
  })

  // Seed categories
  for (const cat of ALL_50_CATEGORIES) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
      },
    })
  }

  // Create two demo RFQs
  const electronics = await prisma.category.findUnique({ where: { slug: 'electronics' } })
  const construction = await prisma.category.findUnique({ where: { slug: 'construction' } })

  if (electronics) {
    await prisma.rfq.create({
      data: {
        buyerId: buyer.id,
        categoryId: electronics.id,
        title: 'Need 500 LED Bulbs for Office',
        description: '9W warm white, BIS certified. Delivery in Mumbai.',
        quantity: 500,
        unit: 'units',
        status: 'ACTIVE',
        deliveryLocation: 'Mumbai, MH',
        targetPrice: 25000,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
  }
  if (construction) {
    await prisma.rfq.create({
      data: {
        buyerId: buyer.id,
        categoryId: construction.id,
        title: 'Steel Rods Required - 1000kg',
        description: 'Grade 60 rods, urgent requirement for site.',
        quantity: 1000,
        unit: 'kg',
        status: 'ACTIVE',
        deliveryLocation: 'Delhi, IN',
        targetPrice: 50000,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('✅ Seed complete')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
