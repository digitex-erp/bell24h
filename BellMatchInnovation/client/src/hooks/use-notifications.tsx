import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: NotificationType;
  priority: NotificationPriority;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  notificationsVisible: boolean;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  toggleNotificationsMenu: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Add a new notification
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);
  
  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Toggle notifications menu visibility
  const toggleNotificationsMenu = useCallback(() => {
    setNotificationsVisible(prev => !prev);
    
    // Mark all as read when opening
    if (!notificationsVisible) {
      setTimeout(() => {
        markAllAsRead();
      }, 1000);
    }
  }, [notificationsVisible, markAllAsRead]);
  
  // Auto-mark notifications as read after a delay
  useEffect(() => {
    if (notificationsVisible) {
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notificationsVisible, markAllAsRead]);
  
  const value = {
    notifications,
    unreadCount,
    notificationsVisible,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    toggleNotificationsMenu
  };
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};

export default useNotificationsContext;