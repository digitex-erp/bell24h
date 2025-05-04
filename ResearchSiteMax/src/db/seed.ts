import { db } from '.';
import { users, rfqs } from '../models/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import 'dotenv/config';

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Check if users exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      console.log('Seeding users...');
      // Create demo users
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Create buyers
      await db.insert(users).values([
        {
          username: 'buyer1',
          email: 'buyer1@example.com',
          password: hashedPassword,
          fullName: 'Buyer User',
          companyName: 'Buyer Company',
          gstNumber: 'GSTIN1234567890',
          role: 'buyer'
        },
        {
          username: 'supplier1',
          email: 'supplier1@example.com',
          password: hashedPassword,
          fullName: 'Supplier User',
          companyName: 'Supplier Company',
          gstNumber: 'GSTIN0987654321',
          role: 'supplier'
        }
      ]);
    }

    // Check if RFQs exist
    const existingRfqs = await db.select().from(rfqs).limit(1);
    if (existingRfqs.length === 0) {
      console.log('Seeding RFQs...');
      
      // Get the buyer user
      const buyer = await db.select().from(users).where(eq(users.username, 'buyer1')).limit(1);
      
      if (buyer.length > 0) {
        const buyerId = buyer[0].id;
        
        // Create sample RFQs
        await db.insert(rfqs).values([
          {
            userId: buyerId,
            title: 'Industrial Pump Supply',
            description: 'Looking for industrial water pumps with 2 HP capacity for factory use',
            category: 'Industrial Equipment',
            quantity: '50 units',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            specifications: {
              powerRating: '2 HP',
              manufacturer: 'Any reputable brand',
              warranty: '1 year minimum'
            },
            referenceNumber: 'RFQ-2023-0001',
            rfqType: 'text',
            status: 'open'
          },
          {
            userId: buyerId,
            title: 'Office Furniture Procurement',
            description: 'Need ergonomic office chairs and desks for new office setup',
            category: 'Furniture',
            quantity: '100 sets',
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            specifications: {
              chairType: 'Ergonomic with lumbar support',
              deskDimensions: '5ft x 3ft',
              color: 'Black or Grey'
            },
            referenceNumber: 'RFQ-2023-0002',
            rfqType: 'text',
            status: 'open'
          },
          {
            userId: buyerId,
            title: 'Raw Material Supply Hindi Voice RFQ',
            description: 'Looking for steel raw materials for manufacturing',
            category: 'Raw Materials',
            quantity: '5 tons',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            specifications: {
              material: 'Steel',
              grade: 'Industrial grade',
              delivery: 'Within 2 weeks'
            },
            referenceNumber: 'RFQ-2023-0003',
            rfqType: 'voice',
            status: 'open',
            detectedLanguage: 'hi',
            originalTranscript: 'हमें अपने उत्पादन के लिए 5 टन स्टील की आवश्यकता है। हमें औद्योगिक ग्रेड की गुणवत्ता चाहिए और 2 सप्ताह के भीतर डिलीवरी की आवश्यकता है।'
          }
        ]);
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seeding function
seedDatabase();
