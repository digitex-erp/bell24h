import React from 'react';
import { Button, Typography, Box, Paper, Grid, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import { 
  sendNotification, 
  storeNotification,
  NotificationType
} from '../utils/notificationService.js';

const NotificationDemo = () => {
  const handleSendNotification = (type: NotificationType) => {
    const messages = {
      [NotificationType.RFQ_RESPONSE]: 'Supplier XYZ responded to your RFQ for industrial pumps',
      [NotificationType.BID_STATUS]: 'Your bid for Project ABC has been accepted',
      [NotificationType.TREND_UPDATE]: 'New trend detected in curtain fabric category!',
      [NotificationType.PAYMENT]: 'Payment of ₹25,000 processed successfully',
      [NotificationType.SHIPPING]: 'Your shipment #SH12345 has been dispatched',
      [NotificationType.SYSTEM]: 'System maintenance scheduled for tomorrow'
    };

    const notification = sendNotification(type, messages[type]);
    storeNotification(notification);
  };

  const handleTestToast = () => {
    toast.success('This is a test toast notification!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notification System Demo
      </Typography>
      <Typography variant="body1" paragraph>
        This page demonstrates the Bell24H notification system. Click the buttons below to trigger different types of notifications.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Notification Types
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => handleSendNotification(NotificationType.RFQ_RESPONSE)}
            >
              RFQ Response Notification
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              color="info" 
              fullWidth
              onClick={() => handleSendNotification(NotificationType.BID_STATUS)}
            >
              Bid Status Notification
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              color="warning" 
              fullWidth
              onClick={() => handleSendNotification(NotificationType.TREND_UPDATE)}
            >
              Market Trend Notification
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              color="success" 
              fullWidth
              onClick={() => handleSendNotification(NotificationType.PAYMENT)}
            >
              Payment Notification
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth
              onClick={() => handleSendNotification(NotificationType.SHIPPING)}
            >
              Shipping Notification
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="contained" 
              color="inherit" 
              fullWidth
              onClick={() => handleSendNotification(NotificationType.SYSTEM)}
            >
              System Notification
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Toast Notification Test
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={handleTestToast}
          >
            Show Toast Notification
          </Button>
        </Stack>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          How to Use the Notification System
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>Click the bell icon in the top right corner to view your notifications</li>
            <li>Unread notifications will appear with a blue background</li>
            <li>Click the check icon to mark a notification as read</li>
            <li>Click the trash icon to delete a notification</li>
            <li>Use the "Clear All" button to remove all notifications</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default NotificationDemo;
