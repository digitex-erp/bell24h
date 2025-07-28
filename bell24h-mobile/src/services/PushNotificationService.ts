import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { store } from '../store/store';
import { addNotification } from '../store/slices/notificationSlice';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: 'rfq' | 'bid' | 'payment' | 'system' | 'reminder';
  priority: 'high' | 'normal' | 'low';
  timestamp: Date;
  isRead: boolean;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
  priority?: 'high' | 'normal' | 'low';
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private constructor() {}

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<string | null> {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.warn('Push notifications are only supported on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.warn('Project ID not found in app config');
        return null;
      }

      this.expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      console.log('Push token:', this.expoPushToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      return this.expoPushToken.data;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Set up notification listeners
   */
  private setupNotificationListeners(): void {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle incoming notifications
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const notificationData: NotificationData = {
      id: notification.request.identifier,
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      data: notification.request.content.data,
      type: notification.request.content.data?.type || 'system',
      priority: notification.request.content.data?.priority || 'normal',
      timestamp: new Date(),
      isRead: false,
    };

    // Add to Redux store
    store.dispatch(addNotification(notificationData));

    // Update badge count
    this.updateBadgeCount();
  }

  /**
   * Handle notification responses
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { identifier, userText } = response.actionIdentifier;
    const notificationData = response.notification.request.content.data;

    console.log('Notification response:', { identifier, userText, notificationData });

    // Handle different action types
    switch (identifier) {
      case 'view-rfq':
        this.navigateToRFQ(notificationData?.rfqId);
        break;
      case 'reply':
        this.navigateToReply(notificationData?.rfqId);
        break;
      case 'view-bid':
        this.navigateToBid(notificationData?.bidId);
        break;
      case 'accept-bid':
        this.acceptBid(notificationData?.bidId);
        break;
      case 'reject-bid':
        this.rejectBid(notificationData?.bidId);
        break;
      case 'view-payment':
        this.navigateToPayment(notificationData?.paymentId);
        break;
      case 'confirm-payment':
        this.confirmPayment(notificationData?.paymentId);
        break;
      default:
        // Default action - navigate based on notification type
        this.handleDefaultNavigation(notificationData);
    }

    // Mark notification as read
    this.markNotificationAsRead(response.notification.request.identifier);
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(notification: PushNotificationPayload): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound || 'default',
          badge: notification.badge,
          priority: notification.priority || 'normal',
          categoryIdentifier: this.getCategoryIdentifier(notification.data?.type),
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  }

  /**
   * Schedule notification for later
   */
  async scheduleNotification(
    notification: PushNotificationPayload,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound || 'default',
          badge: notification.badge,
          priority: notification.priority || 'normal',
          categoryIdentifier: this.getCategoryIdentifier(notification.data?.type),
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Send RFQ response notification
   */
  async sendRFQResponseNotification(rfqId: string, supplierName: string): Promise<void> {
    await this.sendLocalNotification({
      title: 'New RFQ Response',
      body: `${supplierName} has responded to your RFQ`,
      data: {
        type: 'rfq',
        rfqId,
        supplierName,
      },
      priority: 'high',
      categoryIdentifier: 'rfq-response',
    });
  }

  /**
   * Send bid status notification
   */
  async sendBidStatusNotification(bidId: string, status: 'accepted' | 'rejected', amount?: number): Promise<void> {
    const title = `Bid ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const body = status === 'accepted' 
      ? `Your bid for ₹${amount?.toLocaleString()} has been accepted!`
      : 'Your bid has been rejected.';

    await this.sendLocalNotification({
      title,
      body,
      data: {
        type: 'bid',
        bidId,
        status,
        amount,
      },
      priority: 'high',
      categoryIdentifier: 'bid-status',
    });
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(paymentId: string, type: 'received' | 'sent' | 'failed', amount: number): Promise<void> {
    const title = `Payment ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const body = type === 'received'
      ? `You received ₹${amount.toLocaleString()}`
      : type === 'sent'
      ? `Payment of ₹${amount.toLocaleString()} sent successfully`
      : `Payment of ₹${amount.toLocaleString()} failed`;

    await this.sendLocalNotification({
      title,
      body,
      data: {
        type: 'payment',
        paymentId,
        paymentType: type,
        amount,
      },
      priority: 'high',
      categoryIdentifier: 'payment',
    });
  }

  /**
   * Send reminder notification
   */
  async sendReminderNotification(title: string, body: string, data?: any): Promise<void> {
    await this.sendLocalNotification({
      title,
      body,
      data: {
        type: 'reminder',
        ...data,
      },
      priority: 'normal',
    });
  }

  /**
   * Schedule RFQ deadline reminder
   */
  async scheduleRFQDeadlineReminder(rfqId: string, deadline: Date, title: string): Promise<void> {
    const reminderDate = new Date(deadline.getTime() - 24 * 60 * 60 * 1000); // 24 hours before

    if (reminderDate > new Date()) {
      await this.scheduleNotification(
        {
          title: 'RFQ Deadline Reminder',
          body: `Your RFQ "${title}" expires tomorrow`,
          data: {
            type: 'reminder',
            rfqId,
            title,
          },
          priority: 'high',
        },
        {
          date: reminderDate,
        }
      );
    }
  }

  /**
   * Get category identifier based on notification type
   */
  private getCategoryIdentifier(type?: string): string | undefined {
    switch (type) {
      case 'rfq':
        return 'rfq-response';
      case 'bid':
        return 'bid-status';
      case 'payment':
        return 'payment';
      default:
        return undefined;
    }
  }

  /**
   * Update badge count
   */
  private async updateBadgeCount(): Promise<void> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      const unreadCount = notifications.length;
      
      if (Platform.OS === 'ios') {
        await Notifications.setBadgeCountAsync(unreadCount);
      }
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  /**
   * Mark notification as read
   */
  private async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      // Remove from scheduled notifications
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      
      // Update Redux store
      // This would typically update the notification status in the store
      
      // Update badge count
      this.updateBadgeCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
      
      if (Platform.OS === 'ios') {
        await Notifications.setBadgeCountAsync(0);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken?.data || null;
  }

  /**
   * Navigation handlers (to be implemented based on your navigation setup)
   */
  private navigateToRFQ(rfqId?: string): void {
    // Implement navigation to RFQ details
    console.log('Navigate to RFQ:', rfqId);
  }

  private navigateToReply(rfqId?: string): void {
    // Implement navigation to reply screen
    console.log('Navigate to reply:', rfqId);
  }

  private navigateToBid(bidId?: string): void {
    // Implement navigation to bid details
    console.log('Navigate to bid:', bidId);
  }

  private acceptBid(bidId?: string): void {
    // Implement bid acceptance logic
    console.log('Accept bid:', bidId);
  }

  private rejectBid(bidId?: string): void {
    // Implement bid rejection logic
    console.log('Reject bid:', bidId);
  }

  private navigateToPayment(paymentId?: string): void {
    // Implement navigation to payment details
    console.log('Navigate to payment:', paymentId);
  }

  private confirmPayment(paymentId?: string): void {
    // Implement payment confirmation logic
    console.log('Confirm payment:', paymentId);
  }

  private handleDefaultNavigation(data?: any): void {
    // Implement default navigation based on notification type
    console.log('Default navigation for:', data);
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance(); 