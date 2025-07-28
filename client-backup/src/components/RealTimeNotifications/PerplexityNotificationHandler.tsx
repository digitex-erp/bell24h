import React, { useEffect, useState } from 'react';
import { 
  Alert, 
  Snackbar, 
  IconButton, 
  Badge, 
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  Typography,
  Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

export interface PerplexityNotification {
  id: string;
  type: 'update' | 'insight' | 'trend' | 'prediction' | 'improvement';
  title: string;
  message: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  metadata?: any;
}

interface PerplexityNotificationHandlerProps {
  onNotificationReceived?: (notification: PerplexityNotification) => void;
  onNotificationSelected?: (notification: PerplexityNotification) => void;
  maxNotifications?: number;
}

const PerplexityNotificationHandler: React.FC<PerplexityNotificationHandlerProps> = ({
  onNotificationReceived,
  onNotificationSelected,
  maxNotifications = 10
}) => {
  const [notifications, setNotifications] = useState<PerplexityNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<PerplexityNotification | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle receiving a new notification
  const handleNotification = (notification: PerplexityNotification) => {
    // Call the onNotificationReceived callback if provided
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }

    // Update state with the new notification
    setNotifications(prevNotifications => {
      // Add notification to the beginning of the array
      const updatedNotifications = [notification, ...prevNotifications];
      
      // Limit the number of notifications
      if (updatedNotifications.length > maxNotifications) {
        return updatedNotifications.slice(0, maxNotifications);
      }
      
      return updatedNotifications;
    });

    // Show the snackbar with the latest notification
    setCurrentNotification(notification);
    setSnackbarOpen(true);
    
    // Increment unread count
    setUnreadCount(prev => prev + 1);
  };

  // Handle closing the snackbar
  const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handle opening the notification drawer
  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    // Reset unread count when opening the drawer
    setUnreadCount(0);
  };

  // Handle closing the notification drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  // Handle notification click
  const handleNotificationClick = (notification: PerplexityNotification) => {
    if (onNotificationSelected) {
      onNotificationSelected(notification);
    }
    handleCloseDrawer();
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string, severity?: string) => {
    switch (type) {
      case 'insight':
        return <AnalyticsIcon color="primary" />;
      case 'trend':
        return <TrendingUpIcon color="secondary" />;
      case 'prediction':
        return severity === 'warning' ? <WarningIcon color="warning" /> : <CheckCircleIcon color="success" />;
      case 'improvement':
        return <InfoIcon color="info" />;
      case 'update':
      default:
        return <InfoIcon color="primary" />;
    }
  };

  // Handle clearing all notifications
  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    handleCloseDrawer();
  };

  return (
    <>
      {/* Notification Bell Icon with Badge */}
      <IconButton color="inherit" onClick={handleOpenDrawer}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Notification Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: 320, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Perplexity Notifications</Typography>
            <IconButton onClick={handleClearAll} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100px">
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem 
                  key={notification.id} 
                  button 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    } 
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type, notification.severity)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography variant="body2" component="span" display="block">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {currentNotification && (
          <Alert 
            onClose={handleSnackbarClose}
            severity={currentNotification.severity || 'info'}
            sx={{ width: '100%' }}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={handleSnackbarClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <Typography variant="subtitle2">{currentNotification.title}</Typography>
            {currentNotification.message}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default PerplexityNotificationHandler;
