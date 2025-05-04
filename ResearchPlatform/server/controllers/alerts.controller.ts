import { Request, Response } from 'express';
import { db } from '../db';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { 
  alertConfigurations, 
  alertLogs, 
  alertPreferences, 
  alertNotifications,
  insertAlertConfigurationSchema,
  insertAlertPreferenceSchema
} from '@shared/schema';
import type { AuthRequest } from '../utils';

/**
 * Get all alert configurations for the authenticated user
 */
export async function getUserAlertConfigurations(req: AuthRequest, res: Response) {
  try {
    const userId = req.user.id;
    
    const userAlerts = await db.select().from(alertConfigurations)
      .where(eq(alertConfigurations.userId, userId))
      .orderBy(desc(alertConfigurations.createdAt));
    
    return res.json(userAlerts);
  } catch (error) {
    console.error('Error fetching alert configurations:', error);
    return res.status(500).json({ error: 'Failed to fetch alert configurations' });
  }
}

/**
 * Get a specific alert configuration by ID
 */
export async function getAlertConfigurationById(req: AuthRequest, res: Response) {
  try {
    const alertId = Number(req.params.id);
    const userId = req.user.id;
    
    const [alert] = await db.select().from(alertConfigurations)
      .where(and(
        eq(alertConfigurations.id, alertId),
        eq(alertConfigurations.userId, userId)
      ));
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert configuration not found' });
    }
    
    return res.json(alert);
  } catch (error) {
    console.error('Error fetching alert configuration:', error);
    return res.status(500).json({ error: 'Failed to fetch alert configuration' });
  }
}

/**
 * Create a new alert configuration
 */
export async function createAlertConfiguration(req: AuthRequest, res: Response) {
  try {
    const userId = req.user.id;
    
    // Validate request body
    const validatedData = insertAlertConfigurationSchema.parse({
      ...req.body,
      userId
    });
    
    // Insert new alert configuration
    const [newAlertConfig] = await db.insert(alertConfigurations)
      .values(validatedData)
      .returning();
    
    return res.status(201).json(newAlertConfig);
  } catch (error) {
    console.error('Error creating alert configuration:', error);
    return res.status(500).json({ error: 'Failed to create alert configuration' });
  }
}

/**
 * Update an existing alert configuration
 */
export async function updateAlertConfiguration(req: AuthRequest, res: Response) {
  try {
    const alertId = Number(req.params.id);
    const userId = req.user.id;
    
    // Check if alert configuration exists and belongs to the user
    const [existingAlert] = await db.select().from(alertConfigurations)
      .where(and(
        eq(alertConfigurations.id, alertId),
        eq(alertConfigurations.userId, userId)
      ));
    
    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert configuration not found' });
    }
    
    // Update the alert configuration
    const [updatedAlert] = await db.update(alertConfigurations)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(alertConfigurations.id, alertId))
      .returning();
    
    return res.json(updatedAlert);
  } catch (error) {
    console.error('Error updating alert configuration:', error);
    return res.status(500).json({ error: 'Failed to update alert configuration' });
  }
}

/**
 * Delete an alert configuration
 */
export async function deleteAlertConfiguration(req: AuthRequest, res: Response) {
  try {
    const alertId = Number(req.params.id);
    const userId = req.user.id;
    
    // Check if alert configuration exists and belongs to the user
    const [existingAlert] = await db.select().from(alertConfigurations)
      .where(and(
        eq(alertConfigurations.id, alertId),
        eq(alertConfigurations.userId, userId)
      ));
    
    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert configuration not found' });
    }
    
    // Delete the alert configuration
    await db.delete(alertConfigurations)
      .where(eq(alertConfigurations.id, alertId));
    
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting alert configuration:', error);
    return res.status(500).json({ error: 'Failed to delete alert configuration' });
  }
}

/**
 * Toggle an alert configuration's enabled status
 */
export async function toggleAlertEnabled(req: AuthRequest, res: Response) {
  try {
    const alertId = Number(req.params.id);
    const userId = req.user.id;
    
    // Check if alert configuration exists and belongs to the user
    const [existingAlert] = await db.select().from(alertConfigurations)
      .where(and(
        eq(alertConfigurations.id, alertId),
        eq(alertConfigurations.userId, userId)
      ));
    
    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert configuration not found' });
    }
    
    // Toggle the enabled status
    const [updatedAlert] = await db.update(alertConfigurations)
      .set({
        enabled: !existingAlert.enabled,
        updatedAt: new Date()
      })
      .where(eq(alertConfigurations.id, alertId))
      .returning();
    
    return res.json(updatedAlert);
  } catch (error) {
    console.error('Error toggling alert enabled status:', error);
    return res.status(500).json({ error: 'Failed to toggle alert status' });
  }
}

/**
 * Get alert logs for a specific alert configuration
 */
export async function getAlertLogs(req: AuthRequest, res: Response) {
  try {
    const alertId = Number(req.params.id);
    const userId = req.user.id;
    
    // Check if alert configuration exists and belongs to the user
    const [existingAlert] = await db.select().from(alertConfigurations)
      .where(and(
        eq(alertConfigurations.id, alertId),
        eq(alertConfigurations.userId, userId)
      ));
    
    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert configuration not found' });
    }
    
    // Fetch alert logs
    const logs = await db.select().from(alertLogs)
      .where(eq(alertLogs.alertConfigurationId, alertId))
      .orderBy(desc(alertLogs.triggered));
    
    return res.json(logs);
  } catch (error) {
    console.error('Error fetching alert logs:', error);
    return res.status(500).json({ error: 'Failed to fetch alert logs' });
  }
}

/**
 * Get user's alert preferences
 */
export async function getUserAlertPreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.user.id;
    
    // Find existing preferences or create default ones
    const [preferences] = await db.select().from(alertPreferences)
      .where(eq(alertPreferences.userId, userId));
    
    if (preferences) {
      return res.json(preferences);
    }
    
    // Create default preferences if none exist
    const defaultPreferences = {
      userId,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      doNotDisturbEnabled: false
    };
    
    const [newPreferences] = await db.insert(alertPreferences)
      .values(defaultPreferences)
      .returning();
    
    return res.status(201).json(newPreferences);
  } catch (error) {
    console.error('Error fetching alert preferences:', error);
    return res.status(500).json({ error: 'Failed to fetch alert preferences' });
  }
}

/**
 * Update user's alert preferences
 */
export async function updateAlertPreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.user.id;
    
    // Validate request body
    const validatedData = insertAlertPreferenceSchema.parse({
      ...req.body,
      userId
    });
    
    // Find existing preferences
    const [existingPreferences] = await db.select().from(alertPreferences)
      .where(eq(alertPreferences.userId, userId));
    
    let updatedPreferences;
    
    if (existingPreferences) {
      // Update existing preferences
      [updatedPreferences] = await db.update(alertPreferences)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(alertPreferences.userId, userId))
        .returning();
    } else {
      // Create new preferences
      [updatedPreferences] = await db.insert(alertPreferences)
        .values(validatedData)
        .returning();
    }
    
    return res.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating alert preferences:', error);
    return res.status(500).json({ error: 'Failed to update alert preferences' });
  }
}

/**
 * Get user's notifications (unread by default)
 */
export async function getUserNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user.id;
    const { all } = req.query;
    
    // Build query based on whether to include read notifications
    let query = db.select().from(alertNotifications)
      .where(eq(alertNotifications.userId, userId));
    
    if (!all) {
      query = query.where(isNull(alertNotifications.readAt));
    }
    
    const notifications = await query.orderBy(desc(alertNotifications.createdAt));
    
    return res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(req: AuthRequest, res: Response) {
  try {
    const notificationId = Number(req.params.id);
    const userId = req.user.id;
    
    // Check if notification exists and belongs to the user
    const [existingNotification] = await db.select().from(alertNotifications)
      .where(and(
        eq(alertNotifications.id, notificationId),
        eq(alertNotifications.userId, userId)
      ));
    
    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Already read - no need to update
    if (existingNotification.readAt) {
      return res.json(existingNotification);
    }
    
    // Mark as read
    const [updatedNotification] = await db.update(alertNotifications)
      .set({
        readAt: new Date()
      })
      .where(eq(alertNotifications.id, notificationId))
      .returning();
    
    return res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user.id;
    
    // Mark all unread notifications as read
    await db.update(alertNotifications)
      .set({
        readAt: new Date()
      })
      .where(and(
        eq(alertNotifications.userId, userId),
        isNull(alertNotifications.readAt)
      ));
    
    return res.status(204).end();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}

/**
 * Trigger an alert manually (for testing purposes)
 */
export async function triggerAlertManually(req: AuthRequest, res: Response) {
  try {
    const alertId = Number(req.params.id);
    const userId = req.user.id;
    
    // Check if alert configuration exists and belongs to the user
    const [existingAlert] = await db.select().from(alertConfigurations)
      .where(and(
        eq(alertConfigurations.id, alertId),
        eq(alertConfigurations.userId, userId)
      ));
    
    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert configuration not found' });
    }
    
    // Create alert log
    const [alertLog] = await db.insert(alertLogs)
      .values({
        alertConfigurationId: alertId,
        data: { test: true, message: 'Manual test trigger' },
        actions: { notified: true, channels: ['app'] },
        status: 'delivered'
      })
      .returning();
    
    // Create notification
    const [notification] = await db.insert(alertNotifications)
      .values({
        userId,
        alertLogId: alertLog.id,
        title: `Test Alert: ${existingAlert.name}`,
        message: 'This is a test alert triggered manually',
        type: 'info'
      })
      .returning();
    
    return res.status(201).json({ alertLog, notification });
  } catch (error) {
    console.error('Error triggering alert manually:', error);
    return res.status(500).json({ error: 'Failed to trigger alert' });
  }
}

/**
 * Register alert controller routes
 */
export function registerAlertRoutes(app: any) {
  // Alert configuration routes
  app.get('/api/alerts', getUserAlertConfigurations);
  app.post('/api/alerts', createAlertConfiguration);
  app.get('/api/alerts/:id', getAlertConfigurationById);
  app.put('/api/alerts/:id', updateAlertConfiguration);
  app.delete('/api/alerts/:id', deleteAlertConfiguration);
  app.patch('/api/alerts/:id/toggle', toggleAlertEnabled);
  app.get('/api/alerts/:id/logs', getAlertLogs);
  app.post('/api/alerts/:id/trigger', triggerAlertManually);
  
  // Alert preferences routes
  app.get('/api/alert-preferences', getUserAlertPreferences);
  app.put('/api/alert-preferences', updateAlertPreferences);
  
  // Notification routes
  app.get('/api/notifications', getUserNotifications);
  app.patch('/api/notifications/:id/read', markNotificationAsRead);
  app.post('/api/notifications/read-all', markAllNotificationsAsRead);
}