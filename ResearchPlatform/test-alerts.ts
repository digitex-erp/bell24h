import { db } from './server/db';
import { 
  users,
  alertConfigurations, 
  alertLogs, 
  alertPreferences,
  alertNotifications,
  insertUserSchema,
  insertAlertConfigurationSchema,
  insertAlertLogSchema,
  insertAlertPreferenceSchema,
  insertAlertNotificationSchema
} from './shared/schema';
import { eq } from 'drizzle-orm';

async function testAlertSystem() {
  try {
    console.log('Testing Alert System functionalities...');
    
    // 1. First create a test user
    const testUser = {
      username: 'testuser',
      password: 'password123',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };
    
    // Check if the test user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, testUser.username));
    
    let userId: number;
    
    if (existingUser.length > 0) {
      console.log('Test user already exists, using existing user');
      userId = existingUser[0].id;
    } else {
      console.log('Creating test user for alert system testing');
      const [createdUser] = await db.insert(users).values(testUser).returning();
      userId = createdUser.id;
      console.log('Created test user with ID:', userId);
    }
    
    // 2. Create Alert Configuration
    const alertConfig = {
      userId: userId,
      name: 'Test Price Alert',
      alertType: 'price',
      frequency: 'daily',
      enabled: true,
      description: 'Test alert for price changes',
      conditions: { price: 100, operator: '>' },
      actions: { notify: true, channels: ['email', 'app'] }
    };
    
    const [createdAlert] = await db.insert(alertConfigurations)
      .values(alertConfig)
      .returning();
    
    console.log('Created alert configuration:', createdAlert);
    
    // 3. Create Alert Log
    const alertLog = {
      alertConfigurationId: createdAlert.id,
      data: { price: 120, threshold: 100 },
      actions: { notified: true, channels: ['app'] },
      status: 'delivered'
    };
    
    const [createdLog] = await db.insert(alertLogs)
      .values(alertLog)
      .returning();
    
    console.log('Created alert log:', createdLog);
    
    // 4. Create Alert Notification
    const notification = {
      userId: userId,
      alertLogId: createdLog.id,
      title: 'Price Alert Triggered',
      message: 'The price has exceeded your threshold of 100',
      type: 'warning'
    };
    
    const [createdNotification] = await db.insert(alertNotifications)
      .values(notification)
      .returning();
    
    console.log('Created notification:', createdNotification);
    
    // 5. Create Alert Preferences
    const preferences = {
      userId: userId,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      doNotDisturbEnabled: false
    };
    
    const [createdPreferences] = await db.insert(alertPreferences)
      .values(preferences)
      .returning();
    
    console.log('Created alert preferences:', createdPreferences);
    
    // 6. Fetch Alert Configurations
    const fetchedAlerts = await db.select().from(alertConfigurations)
      .where(eq(alertConfigurations.userId, userId));
    
    console.log('Fetched alert configurations:', fetchedAlerts);
    
    // 7. Fetch Alert Logs
    const fetchedLogs = await db.select().from(alertLogs)
      .where(eq(alertLogs.alertConfigurationId, createdAlert.id));
    
    console.log('Fetched alert logs:', fetchedLogs);
    
    // 8. Fetch Notifications
    const fetchedNotifications = await db.select().from(alertNotifications)
      .where(eq(alertNotifications.userId, userId));
    
    console.log('Fetched notifications:', fetchedNotifications);
    
    // 9. Fetch Alert Preferences
    const fetchedPreferences = await db.select().from(alertPreferences)
      .where(eq(alertPreferences.userId, userId));
    
    console.log('Fetched alert preferences:', fetchedPreferences);
    
    console.log('Alert System testing completed successfully!');
  } catch (error) {
    console.error('Error testing Alert System:', error);
  } finally {
    // In Neon database with drizzle-orm, we can't directly end the db
    // but we can end the pool connection
    if (db.$client) {
      await db.$client.end();
    }
  }
}

testAlertSystem();