import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
// Helper function to generate random dates within a range
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
// Helper function to generate GST number
function generateGSTNumber() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '22';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
async function main() {
    console.log('🌱 Seeding database...');
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.rFQ.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    // Create admin user and company
    console.log('👔 Creating admin user and company...');
    const adminCompany = await prisma.company.create({
        data: {
            name: 'Bell24H Admin',
            website: 'https://bell24h.com',
            type: 'BOTH',
        },
    });
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@bell24h.com',
            name: 'Admin User',
            password: await hash('Admin@123', 10),
            role: 'ADMIN',
            companyId: adminCompany.id,
        },
    });
    // Create buyer companies and users
    console.log('👥 Creating buyer companies and users...');
    const buyerCompanies = [];
    const buyerUsers = [];
    for (let i = 0; i < 5; i++) {
        const company = await prisma.company.create({
            data: {
                name: `${faker.company.name()} ${faker.company.name()}`,
                website: faker.internet.url(),
                type: 'BUYER',
            },
        });
        buyerCompanies.push(company);
        const user = await prisma.user.create({
            data: {
                email: `buyer${i}@example.com`,
                name: faker.person.fullName(),
                password: await hash('Buyer@123', 10),
                role: 'BUYER',
                companyId: company.id,
            },
        });
        buyerUsers.push(user);
    }
    // Create supplier companies and users
    console.log('🏭 Creating supplier companies and users...');
    const supplierCompanies = [];
    const supplierUsers = [];
    for (let i = 0; i < 10; i++) {
        const company = await prisma.company.create({
            data: {
                name: `${faker.company.name()} ${faker.company.name()}`,
                website: faker.internet.url(),
                type: 'SUPPLIER',
            },
        });
        supplierCompanies.push(company);
        const user = await prisma.user.create({
            data: {
                email: `supplier${i}@example.com`,
                name: faker.person.fullName(),
                password: await hash('Supplier@123', 10),
                role: 'SUPPLIER',
                companyId: company.id,
            },
        });
        supplierUsers.push(user);
    }
    console.log('Start seeding categories...');
    const industrialChemicals = await prisma.category.create({
        data: {
            name: 'Industrial Chemicals',
            description: 'Chemicals used in industrial processes.',
        },
    });
    await prisma.category.createMany({
        data: [
            { name: 'Acids', parentId: industrialChemicals.id },
            { name: 'Solvents', parentId: industrialChemicals.id },
            { name: 'Adhesives & Sealants', parentId: industrialChemicals.id },
        ],
    });
    const constructionMaterials = await prisma.category.create({
        data: {
            name: 'Construction Materials',
            description: 'Materials used for building and construction.',
        },
    });
    await prisma.category.createMany({
        data: [
            { name: 'Cement & Concrete', parentId: constructionMaterials.id },
            { name: 'Bricks & Blocks', parentId: constructionMaterials.id },
            { name: 'Steel & Metals', parentId: constructionMaterials.id },
        ],
    });
    const agriculture = await prisma.category.create({
        data: {
            name: 'Agriculture & Farming',
            description: 'Products for agriculture and farming.',
        },
    });
    await prisma.category.createMany({
        data: [
            { name: 'Fertilizers', parentId: agriculture.id },
            { name: 'Pesticides', parentId: agriculture.id },
            { name: 'Seeds & Grains', parentId: agriculture.id },
        ],
    });
    console.log('Category seeding finished.');
    const allCategories = await prisma.category.findMany();
    // Create products for suppliers
    console.log('📦 Creating products...');
    const allProducts = [];
    for (const company of [...supplierCompanies, adminCompany]) {
        const productCount = faker.number.int({ min: 5, max: 15 });
        for (let i = 0; i < productCount; i++) {
            const product = await prisma.product.create({
                data: {
                    name: `${faker.commerce.productName()} ${faker.commerce.productAdjective()}`,
                    description: faker.commerce.productDescription(),
                    unit: faker.helpers.arrayElement(['pcs', 'kg', 'm', 'l', 'box', 'set']),
                    companyId: company.id,
                    categoryId: faker.helpers.arrayElement(allCategories).id,
                },
            });
            allProducts.push(product);
        }
    }
    // Create RFQs from buyers
    console.log('📝 Creating RFQs...');
    const allRfqs = [];
    const rfqStatuses = ['OPEN', 'CLOSED', 'AWARDED', 'CANCELLED'];
    for (const buyer of buyerUsers) {
        const rfqCount = faker.number.int({ min: 3, max: 8 });
        for (let i = 0; i < rfqCount; i++) {
            const status = faker.helpers.arrayElement(rfqStatuses);
            const rfq = await prisma.rFQ.create({
                data: {
                    title: `RFQ-${faker.string.alphanumeric(6).toUpperCase()} - ${faker.commerce.productName()}`,
                    description: faker.lorem.paragraphs(3),
                    status: status,
                    deadline: randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Within next 30 days
                    buyerId: buyer.id,
                    companyId: buyer.companyId,
                    categoryId: faker.helpers.arrayElement(allCategories).id,
                    quantity: faker.number.int({ min: 10, max: 1000 }),
                    unit: faker.helpers.arrayElement(['pcs', 'kg', 'm', 'l', 'box', 'set']),
                },
            });
            allRfqs.push(rfq);
        }
    }
    console.log(`✅ Created ${buyerCompanies.length} buyer companies with users`);
    console.log(`✅ Created ${supplierCompanies.length} supplier companies with users`);
    console.log(`✅ Created ${allProducts.length} products`);
    console.log(`✅ Created ${allRfqs.length} RFQs`);
    console.log('✅ Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
