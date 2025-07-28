import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Badge, 
  Typography, 
  Stack, 
  IconButton, 
  Popover, 
  Paper, 
  Button,
  List,
  ListItem,
  Divider,
  Tooltip
} from '@mui/material';
import { Notifications as BellIcon, Check as CheckIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { 
  getStoredNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications,
  getUnreadCount,
  Notification,
  NotificationType
} from '../utils/notificationService.js';

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Colors
  const bgColor = '#ffffff';
  const borderColor = '#e0e0e0';
  const hoverBgColor = '#f5f5f5';

  // Load notifications on mount
  useEffect(() => {
    const storedNotifications = getStoredNotifications();
    setNotifications(storedNotifications);
    setUnreadCount(getUnreadCount());
  }, []);

  // Handle marking a notification as read
  const handleMarkAsRead = (id: string) => {
    const updatedNotifications = markAsRead(id);
    setNotifications(updatedNotifications);
    setUnreadCount(getUnreadCount());
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    const updatedNotifications = markAllAsRead();
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  // Handle deleting a notification
  const handleDeleteNotification = (id: string) => {
    const updatedNotifications = deleteNotification(id);
    setNotifications(updatedNotifications);
    setUnreadCount(getUnreadCount());
  };

  // Handle clearing all notifications
  const handleClearAll = () => {
    clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  // Get icon and color based on notification type
  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case NotificationType.RFQ_RESPONSE:
        return { color: 'green.500', icon: '📝' };
      case NotificationType.BID_STATUS:
        return { color: 'blue.500', icon: '🔔' };
      case NotificationType.TREND_UPDATE:
        return { color: 'orange.500', icon: '📈' };
      case NotificationType.PAYMENT:
        return { color: 'green.500', icon: '💰' };
      case NotificationType.SHIPPING:
        return { color: 'purple.500', icon: '🚚' };
      default:
        return { color: 'gray.500', icon: 'ℹ️' };
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return notificationDate.toLocaleDateString();
  };

  return (
    <div>
      <Box position="relative" display="inline-block">
        <IconButton
          aria-label="Notifications"
          onClick={() => setIsOpen(!isOpen)}
          size="medium"
        >
          <BellIcon />
        </IconButton>
        {unreadCount > 0 && (
          <Badge
            badgeContent={unreadCount > 99 ? '99+' : unreadCount}
            color="error"
            sx={{ position: 'absolute', top: 0, right: 0 }}
          />
        )}
      </Box>
      
      <Popover
        open={isOpen}
        anchorReference="anchorPosition"
        anchorPosition={{ top: 64, left: window.innerWidth - 350 }}
        onClose={() => setIsOpen(false)}
      >
        <Paper sx={{ width: 350, maxHeight: 500, overflow: 'auto' }}>
          <Box sx={{ p: 2, borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
            {unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <IconButton
                  aria-label="Mark all as read"
                  size="small"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No notifications</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => {
                const { color, icon } = getNotificationStyle(notification.type);
                return (
                  <ListItem 
                    key={notification.id}
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${borderColor}`,
                      backgroundColor: notification.read ? bgColor : '#e3f2fd',
                      '&:hover': { backgroundColor: hoverBgColor },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body1">{icon}</Typography>
                          <Typography variant="body2" fontWeight={notification.read ? 'normal' : 'bold'}>
                            {notification.message}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                      <Stack direction="row">
                        {!notification.read && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              aria-label="Mark as read"
                              size="small"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label="Delete"
                            size="small"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
          
          {notifications.length > 0 && (
            <Box sx={{ p: 1, borderTop: `1px solid ${borderColor}` }}>
              <Button variant="text" fullWidth size="small" onClick={handleClearAll}>
                Clear All
              </Button>
            </Box>
          )}
        </Paper>
      </Popover>
    </div>
  );
};

export default NotificationPanel;
