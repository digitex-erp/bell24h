import { EventEmitter } from 'events';
import { toast } from '@/hooks/use-toast';

export type AlertPriority = 'low' | 'medium' | 'high';

export interface AlertOptions {
  title?: string;
  priority?: AlertPriority;
  duration?: number; // in milliseconds
  autoClose?: boolean;
  requiresAction?: boolean;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export interface Alert {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  options: AlertOptions;
  type: 'info' | 'success' | 'warning' | 'error';
}

class AlertService extends EventEmitter {
  private alerts: Alert[] = [];
  private notificationsMuted: boolean = false;
  private emailEnabled: boolean = false;
  private pushEnabled: boolean = false;
  
  constructor() {
    super();
    // Load user preferences for notifications
    try {
      const preferences = localStorage.getItem('notification_preferences');
      if (preferences) {
        const { muted, email, push } = JSON.parse(preferences);
        this.notificationsMuted = muted ?? false;
        this.emailEnabled = email ?? false;
        this.pushEnabled = push ?? false;
      }
    } catch (error) {
      console.error('Failed to load notification preferences', error);
    }
  }
  
  // Get all alerts
  getAlerts(): Alert[] {
    return [...this.alerts].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }
  
  // Get unread alerts count
  getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.read).length;
  }
  
  // Mark all alerts as read
  markAllAsRead(): void {
    this.alerts = this.alerts.map(alert => ({ ...alert, read: true }));
    this.emit('alerts-updated', this.getAlerts());
  }
  
  // Mark a specific alert as read
  markAsRead(id: string): void {
    this.alerts = this.alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    );
    this.emit('alerts-updated', this.getAlerts());
  }
  
  // Clear all alerts
  clearAll(): void {
    this.alerts = [];
    this.emit('alerts-updated', this.getAlerts());
  }
  
  // Toggle notification mute status
  toggleMute(muted?: boolean): boolean {
    this.notificationsMuted = muted !== undefined ? muted : !this.notificationsMuted;
    this.savePreferences();
    return this.notificationsMuted;
  }
  
  // Toggle email notifications
  toggleEmail(enabled?: boolean): boolean {
    this.emailEnabled = enabled !== undefined ? enabled : !this.emailEnabled;
    this.savePreferences();
    return this.emailEnabled;
  }
  
  // Toggle push notifications
  togglePush(enabled?: boolean): boolean {
    this.pushEnabled = enabled !== undefined ? enabled : !this.pushEnabled;
    this.savePreferences();
    return this.pushEnabled;
  }
  
  // Get notification preferences
  getPreferences(): { muted: boolean; email: boolean; push: boolean } {
    return {
      muted: this.notificationsMuted,
      email: this.emailEnabled,
      push: this.pushEnabled
    };
  }
  
  // Save preferences to local storage
  private savePreferences(): void {
    try {
      localStorage.setItem('notification_preferences', JSON.stringify({
        muted: this.notificationsMuted,
        email: this.emailEnabled,
        push: this.pushEnabled
      }));
    } catch (error) {
      console.error('Failed to save notification preferences', error);
    }
  }
  
  // Generic alert method
  private alert(
    type: 'info' | 'success' | 'warning' | 'error',
    message: string,
    options: AlertOptions = {}
  ): Alert {
    // Create alert object
    const alert: Alert = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      read: false,
      options: {
        ...options,
        duration: options.duration || (
          options.priority === 'high' ? 10000 : 
          options.priority === 'medium' ? 6000 : 4000
        ),
        autoClose: options.autoClose !== undefined ? options.autoClose : true
      },
      type
    };
    
    // Add to alerts collection
    this.alerts.push(alert);
    
    // Show toast notification if not muted
    if (!this.notificationsMuted) {
      this.showToast(alert);
    }
    
    // Send email notification if enabled and high priority
    if (this.emailEnabled && options.priority === 'high') {
      this.sendEmailNotification(alert);
    }
    
    // Send push notification if enabled and medium/high priority
    if (this.pushEnabled && (options.priority === 'high' || options.priority === 'medium')) {
      this.sendPushNotification(alert);
    }
    
    // Emit event for listeners
    this.emit('alert-added', alert);
    this.emit('alerts-updated', this.getAlerts());
    
    return alert;
  }
  
  // Show toast notification
  private showToast(alert: Alert): void {
    const { title, duration, variant, actionText, onAction } = alert.options;
    
    toast({
      title: title,
      description: alert.message,
      duration: duration,
      variant: variant || this.getVariantForType(alert.type),
      action: actionText && onAction ? {
        label: actionText,
        onClick: () => {
          onAction();
          this.markAsRead(alert.id);
        }
      } : undefined
    });
  }
  
  // Map alert type to toast variant
  private getVariantForType(type: 'info' | 'success' | 'warning' | 'error'): 'default' | 'destructive' | 'success' {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'destructive';
      case 'warning': 
      case 'info':
      default: return 'default';
    }
  }
  
  // Send email notification (placeholder for future implementation)
  private sendEmailNotification(alert: Alert): void {
    // This would connect to a backend API to send emails
    console.log('Would send email notification:', alert);
  }
  
  // Send push notification (placeholder for future implementation)
  private sendPushNotification(alert: Alert): void {
    // This would use the Web Push API in a real implementation
    console.log('Would send push notification:', alert);
  }
  
  // Public API methods
  
  // Info notification
  info(message: string, options: AlertOptions = {}): Alert {
    return this.alert('info', message, options);
  }
  
  // Success notification
  success(message: string, options: AlertOptions = {}): Alert {
    return this.alert('success', message, options);
  }
  
  // Warning notification
  warning(message: string, options: AlertOptions = {}): Alert {
    return this.alert('warning', message, options);
  }
  
  // Error notification
  error(message: string, options: AlertOptions = {}): Alert {
    return this.alert('error', message, options);
  }
}

// Singleton instance
export const alertService = new AlertService();

export default alertService;