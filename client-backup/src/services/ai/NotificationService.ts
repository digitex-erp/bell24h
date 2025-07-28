import { RFQ, Supplier } from '../../types/rfq';
import { User } from '../../types/user';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  read: boolean;
  data?: any;
}

type NotificationType = 
  | 'price_change'
  | 'new_opportunity'
  | 'deadline_reminder'
  | 'match_found'
  | 'status_update'
  | 'system_alert';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

export class NotificationService {
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private notifications: Map<string, Notification[]> = new Map();

  async createNotification(
    userId: string,
    type: NotificationType,
    data: any
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title: this.generateTitle(type, data),
      message: this.generateMessage(type, data),
      priority: this.calculatePriority(type, data),
      timestamp: new Date(),
      read: false,
      data
    };

    await this.storeNotification(userId, notification);
    await this.deliverNotification(userId, notification);

    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.get(userId) || [];
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.updateNotification(userId, notification);
    }
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const currentPreferences = this.userPreferences.get(userId) || this.getDefaultPreferences();
    this.userPreferences.set(userId, {
      ...currentPreferences,
      ...preferences
    });
  }

  async checkPriceChanges(rfq: RFQ, newPrice: number): Promise<void> {
    if (rfq.budget && Math.abs(parseFloat(rfq.budget) - newPrice) / parseFloat(rfq.budget) > 0.1) {
      await this.createNotification(rfq.userId, 'price_change', {
        rfqId: rfq.id,
        oldPrice: rfq.budget,
        newPrice,
        percentageChange: ((newPrice - parseFloat(rfq.budget)) / parseFloat(rfq.budget)) * 100
      });
    }
  }

  async checkNewOpportunities(user: User, category: string): Promise<void> {
    const preferences = this.userPreferences.get(user.id);
    if (preferences?.types.new_opportunity) {
      await this.createNotification(user.id, 'new_opportunity', {
        category,
        timestamp: new Date()
      });
    }
  }

  async checkDeadlines(rfqs: RFQ[]): Promise<void> {
    const now = new Date();
    rfqs.forEach(async rfq => {
      if (rfq.deadline) {
        const deadline = new Date(rfq.deadline);
        const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysUntilDeadline <= 3) {
          await this.createNotification(rfq.userId, 'deadline_reminder', {
            rfqId: rfq.id,
            daysUntilDeadline: Math.ceil(daysUntilDeadline)
          });
        }
      }
    });
  }

  async notifyMatchFound(rfq: RFQ, supplier: Supplier): Promise<void> {
    await this.createNotification(rfq.userId, 'match_found', {
      rfqId: rfq.id,
      supplierId: supplier.id,
      matchScore: supplier.matchScore
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateTitle(type: NotificationType, data: any): string {
    const titles = {
      price_change: `Price Change Alert: ${data.percentageChange > 0 ? 'Increase' : 'Decrease'} of ${Math.abs(data.percentageChange).toFixed(1)}%`,
      new_opportunity: `New Opportunity in ${data.category}`,
      deadline_reminder: `Deadline Approaching: ${data.daysUntilDeadline} days remaining`,
      match_found: `New Supplier Match Found`,
      status_update: `Status Update: ${data.newStatus}`,
      system_alert: 'System Alert'
    };

    return titles[type] || 'New Notification';
  }

  private generateMessage(type: NotificationType, data: any): string {
    const messages = {
      price_change: `The price for your RFQ has changed from ${data.oldPrice} to ${data.newPrice}.`,
      new_opportunity: `New opportunities are available in ${data.category}. Click to view details.`,
      deadline_reminder: `Your RFQ deadline is approaching in ${data.daysUntilDeadline} days.`,
      match_found: `A new supplier with ${(data.matchScore * 100).toFixed(0)}% match score has been found for your RFQ.`,
      status_update: `Your RFQ status has been updated to ${data.newStatus}.`,
      system_alert: data.message || 'A system alert has been generated.'
    };

    return messages[type] || 'You have a new notification.';
  }

  private calculatePriority(type: NotificationType, data: any): 'high' | 'medium' | 'low' {
    const priorityMap = {
      price_change: data.percentageChange > 20 ? 'high' : 'medium',
      new_opportunity: 'medium',
      deadline_reminder: data.daysUntilDeadline <= 1 ? 'high' : 'medium',
      match_found: data.matchScore > 0.8 ? 'high' : 'medium',
      status_update: 'medium',
      system_alert: 'high'
    };

    return priorityMap[type] || 'medium';
  }

  private async storeNotification(userId: string, notification: Notification): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.push(notification);
    this.notifications.set(userId, userNotifications);
  }

  private async updateNotification(userId: string, notification: Notification): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const index = userNotifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      userNotifications[index] = notification;
      this.notifications.set(userId, userNotifications);
    }
  }

  private async deliverNotification(userId: string, notification: Notification): Promise<void> {
    const preferences = this.userPreferences.get(userId) || this.getDefaultPreferences();
    
    if (preferences.email) {
      await this.sendEmailNotification(userId, notification);
    }
    
    if (preferences.push) {
      await this.sendPushNotification(userId, notification);
    }
    
    if (preferences.inApp) {
      await this.sendInAppNotification(userId, notification);
    }
  }

  private async sendEmailNotification(userId: string, notification: Notification): Promise<void> {
    // Implement email sending logic
    console.log(`Sending email notification to user ${userId}: ${notification.title}`);
  }

  private async sendPushNotification(userId: string, notification: Notification): Promise<void> {
    // Implement push notification logic
    console.log(`Sending push notification to user ${userId}: ${notification.title}`);
  }

  private async sendInAppNotification(userId: string, notification: Notification): Promise<void> {
    // Implement in-app notification logic
    console.log(`Sending in-app notification to user ${userId}: ${notification.title}`);
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      email: true,
      push: true,
      inApp: true,
      types: {
        price_change: true,
        new_opportunity: true,
        deadline_reminder: true,
        match_found: true,
        status_update: true,
        system_alert: true
      },
      frequency: 'immediate'
    };
  }
}

export const notificationService = new NotificationService(); 