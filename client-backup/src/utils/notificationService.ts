// src/utils/notificationService.ts
import { toast } from 'react-toastify';

// Types of notifications
export enum NotificationType {
  RFQ_RESPONSE = 'rfq-response',
  BID_STATUS = 'bid-status',
  TREND_UPDATE = 'trend-update',
  PAYMENT = 'payment',
  SHIPPING = 'shipping',
  SYSTEM = 'system'
}

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: any;
}

// Function to send in-app notification
export const sendNotification = (type: NotificationType, message: string, data?: any) => {
  switch (type) {
    case NotificationType.RFQ_RESPONSE:
      toast.success('Supplier responded to your RFQ!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      break;
    case NotificationType.BID_STATUS:
      toast.info('Your bid has been updated!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      break;
    case NotificationType.TREND_UPDATE:
      toast.warning('New trend detected in market!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      break;
    case NotificationType.PAYMENT:
      toast.success('Payment processed successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      break;
    case NotificationType.SHIPPING:
      toast.info('Shipping status updated!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      break;
    default:
      toast.info(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
  }

  // Return a notification object that can be stored
  return {
    id: generateId(),
    type,
    message,
    read: false,
    createdAt: new Date(),
    data
  };
};

// Helper function to generate unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Store notifications in localStorage
export const storeNotification = (notification: Notification) => {
  const notifications = getStoredNotifications();
  notifications.unshift(notification);
  localStorage.setItem('bell24h_notifications', JSON.stringify(notifications.slice(0, 50))); // Keep only last 50
};

// Get notifications from localStorage
export const getStoredNotifications = (): Notification[] => {
  const storedNotifications = localStorage.getItem('bell24h_notifications');
  return storedNotifications ? JSON.parse(storedNotifications) : [];
};

// Mark notification as read
export const markAsRead = (id: string) => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.map(notification => 
    notification.id === id ? { ...notification, read: true } : notification
  );
  localStorage.setItem('bell24h_notifications', JSON.stringify(updatedNotifications));
  return updatedNotifications;
};

// Mark all notifications as read
export const markAllAsRead = () => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
  localStorage.setItem('bell24h_notifications', JSON.stringify(updatedNotifications));
  return updatedNotifications;
};

// Delete notification
export const deleteNotification = (id: string) => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.filter(notification => notification.id !== id);
  localStorage.setItem('bell24h_notifications', JSON.stringify(updatedNotifications));
  return updatedNotifications;
};

// Clear all notifications
export const clearAllNotifications = () => {
  localStorage.setItem('bell24h_notifications', JSON.stringify([]));
  return [];
};

// Get unread notification count
export const getUnreadCount = () => {
  const notifications = getStoredNotifications();
  return notifications.filter(notification => !notification.read).length;
};

// WhatsApp integration placeholder - would require backend implementation
export const sendWhatsAppNotification = (phoneNumber: string, message: string) => {
  console.log(`Would send WhatsApp message to ${phoneNumber}: ${message}`);
  // In a real implementation, this would call a backend API that integrates with WhatsApp Business API
  return true;
};
