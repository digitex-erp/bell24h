import React, { useEffect } from 'react';
import { useNotificationsContext } from '@/hooks/use-notifications';
import { alertService, Alert } from '@/services/AlertService';

/**
 * This component connects the AlertService to our NotificationsContext
 * It doesn't render anything, just establishes the connection
 */
export const AlertServiceConnector: React.FC = () => {
  const { addNotification, clearNotifications, markAllAsRead } = useNotificationsContext();
  
  useEffect(() => {
    // Function to handle alerts from the service
    const handleAlert = (alert: Alert) => {
      addNotification({
        id: alert.id,
        title: alert.options.title || alert.type.charAt(0).toUpperCase() + alert.type.slice(1),
        message: alert.message,
        timestamp: alert.timestamp,
        read: alert.read,
        type: alert.type,
        priority: alert.options.priority || 'medium',
        actionText: alert.options.actionText,
        onAction: alert.options.onAction,
        icon: alert.options.icon
      });
    };
    
    // Listen for alerts from the service
    alertService.on('alert-added', handleAlert);
    
    // Clean up event listener on unmount
    return () => {
      alertService.off('alert-added', handleAlert);
    };
  }, [addNotification]);
  
  // Sync clear-all functionality
  useEffect(() => {
    const handleClearAll = () => {
      clearNotifications();
    };
    
    alertService.on('alerts-cleared', handleClearAll);
    
    return () => {
      alertService.off('alerts-cleared', handleClearAll);
    };
  }, [clearNotifications]);
  
  // Sync mark-all-as-read functionality
  useEffect(() => {
    const handleMarkAllAsRead = () => {
      markAllAsRead();
    };
    
    alertService.on('all-marked-read', handleMarkAllAsRead);
    
    return () => {
      alertService.off('all-marked-read', handleMarkAllAsRead);
    };
  }, [markAllAsRead]);
  
  // This component doesn't render anything
  return null;
};

export default AlertServiceConnector;