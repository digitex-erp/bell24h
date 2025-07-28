import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Snackbar, Badge, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Typography, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';

// Notification type definition
interface Notification {
  id: string;
  type: string;
  title?: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

// Props for the RealtimeManager component
interface RealtimeManagerProps {
  wsUrl?: string;
  sseUrl?: string;
  proxyUrl?: string;
  onNotification?: (notification: Notification) => void;
  onConnectionChange?: (status: 'connected' | 'disconnected') => void;
  enableWebSocket?: boolean;
  enableSSE?: boolean;
  showUI?: boolean;
}

/**
 * RealtimeManager component for handling real-time communications
 * 
 * This component manages WebSocket and Server-Sent Events connections
 * and provides a notification UI for displaying real-time updates.
 */
const RealtimeManager: React.FC<RealtimeManagerProps> = ({
  wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8080`,
  sseUrl = `//${window.location.hostname}:5004/events`,
  proxyUrl = `//${window.location.hostname}:5003`,
  onNotification,
  onConnectionChange,
  enableWebSocket = true,
  enableSSE = true,
  showUI = true
}) => {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [alert, setAlert] = useState<{open: boolean, message: string, severity: 'success' | 'info' | 'warning' | 'error'}>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Notification handling
  const handleNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      // Add the new notification
      const updated = [{ ...notification, read: false }, ...prev].slice(0, 50);
      return updated;
    });
    
    // Update unread count
    setUnreadCount(prev => prev + 1);
    
    // Call the onNotification callback if provided
    if (onNotification) {
      onNotification(notification);
    }
    
    // Show a snackbar for important notifications
    if (notification.type === 'notification' || notification.type === 'perplexity_update') {
      setAlert({
        open: true,
        message: notification.title || notification.message,
        severity: 'info'
      });
    }
  }, [onNotification]);
  
  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket) return;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        if (onConnectionChange) onConnectionChange('connected');
        
        setAlert({
          open: true,
          message: 'WebSocket connected',
          severity: 'success'
        });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);
          
          // Handle different message types
          if (data.type === 'notification' || data.type === 'perplexity_update' || data.type === 'new_bid' || data.type === 'rfq_update') {
            handleNotification({
              id: data.id || `ws-${Date.now()}`,
              type: data.type,
              title: data.title,
              message: data.message || JSON.stringify(data),
              timestamp: data.timestamp || new Date().toISOString(),
              read: false
            });
          } else if (data.type === 'connection_established') {
            console.log('WebSocket connection established');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        if (onConnectionChange) onConnectionChange('disconnected');
        
        wsRef.current = null;
        
        // Attempt to reconnect after delay
        if (reconnectTimerRef.current === null) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            connectWebSocket();
          }, 5000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setAlert({
          open: true,
          message: 'WebSocket connection error',
          severity: 'error'
        });
      };
      
      // Store the WebSocket in the ref
      wsRef.current = ws;
      
      // Set up ping interval to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
      
      // Clean up ping interval when component unmounts
      return () => clearInterval(pingInterval);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setAlert({
        open: true,
        message: 'Failed to connect to WebSocket server',
        severity: 'error'
      });
    }
  }, [enableWebSocket, wsUrl, handleNotification, onConnectionChange]);
  
  // SSE connection management
  const connectSSE = useCallback(() => {
    if (!enableSSE) return;
    
    try {
      const sse = new EventSource(sseUrl);
      
      sse.onopen = () => {
        console.log('SSE connected');
        setSseConnected(true);
      };
      
      sse.addEventListener('connected', (event) => {
        console.log('SSE connection established:', event);
        setSseConnected(true);
      });
      
      sse.addEventListener('notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE notification:', data);
          
          handleNotification({
            id: data.id || `sse-${Date.now()}`,
            type: 'notification',
            title: data.title,
            message: data.message,
            timestamp: data.timestamp || new Date().toISOString(),
            read: false
          });
        } catch (error) {
          console.error('Error parsing SSE notification:', error);
        }
      });
      
      sse.addEventListener('perplexity_update', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE perplexity update:', data);
          
          handleNotification({
            id: data.id || `sse-perplexity-${Date.now()}`,
            type: 'perplexity_update',
            title: 'Perplexity Update',
            message: data.message || 'New perplexity analysis available',
            timestamp: data.timestamp || new Date().toISOString(),
            read: false
          });
        } catch (error) {
          console.error('Error parsing SSE perplexity update:', error);
        }
      });
      
      sse.onerror = (error) => {
        console.error('SSE error:', error);
        setSseConnected(false);
        
        // Close the connection
        sse.close();
        sseRef.current = null;
        
        // Attempt to reconnect after delay
        setTimeout(connectSSE, 5000);
      };
      
      // Store the SSE in the ref
      sseRef.current = sse;
    } catch (error) {
      console.error('Error connecting to SSE:', error);
    }
  }, [enableSSE, sseUrl, handleNotification]);
  
  // Load existing notifications
  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${proxyUrl}/api/notifications`);
      const data = await response.json();
      
      if (data.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications.map((notification: any) => ({
          ...notification,
          read: true
        })));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [proxyUrl]);
  
  // Initialize connections
  useEffect(() => {
    loadNotifications();
    
    if (enableWebSocket) {
      connectWebSocket();
    }
    
    if (enableSSE) {
      connectSSE();
    }
    
    // Clean up connections on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      if (sseRef.current) {
        sseRef.current.close();
      }
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [connectWebSocket, connectSSE, loadNotifications, enableWebSocket, enableSSE]);
  
  // Toggle the notification drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    
    // Mark all notifications as read when drawer is opened
    if (!drawerOpen) {
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
      
      setUnreadCount(0);
    }
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => {
      if (notification.id === id && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        return { ...notification, read: true };
      }
      return notification;
    }));
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (error) {
      return timestamp;
    }
  };
  
  // If UI is disabled, just manage connections silently
  if (!showUI) {
    return null;
  }
  
  return (
    <>
      {/* Notification Icon */}
      <IconButton color="inherit" onClick={toggleDrawer} title="Notifications">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Notifications</Typography>
            <Box>
              <IconButton size="small" onClick={clearNotifications} title="Clear All">
                <CloseIcon />
              </IconButton>
              <IconButton size="small" onClick={toggleDrawer} title="Close">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Divider />
          
          {/* Connection Status */}
          <Box sx={{ my: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                backgroundColor: wsConnected ? 'success.main' : 'error.main',
                mr: 1
              }} />
              <Typography variant="body2">WebSocket</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                backgroundColor: sseConnected ? 'success.main' : 'error.main',
                mr: 1
              }} />
              <Typography variant="body2">SSE</Typography>
            </Box>
          </Box>
          
          <Divider />
          
          {/* Notification List */}
          <List sx={{ pt: 0, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No notifications" 
                  secondary="You'll see updates about RFQs, bids, and perplexity analysis here." 
                />
              </ListItem>
            ) : (
              notifications.map((notification) => (
                <ListItem 
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    borderLeft: notification.read ? 'none' : '3px solid',
                    borderLeftColor: 'primary.main',
                    cursor: 'pointer'
                  }}
                >
                  <ListItemIcon>
                    {notification.type === 'notification' && <NotificationsIcon color="primary" />}
                    {notification.type === 'perplexity_update' && <SettingsIcon color="secondary" />}
                    {!['notification', 'perplexity_update'].includes(notification.type) && (
                      <ScheduleIcon color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title || notification.type}
                    secondary={
                      <>
                        {notification.message}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>
      
      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RealtimeManager;
