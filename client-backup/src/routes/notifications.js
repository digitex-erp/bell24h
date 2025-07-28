import express from 'express';

const router = express.Router();

// Sample notifications data
const notifications = [
  {
    id: 1,
    userId: 1,
    message: 'New bid received on your RFQ',
    type: 'rfq',
    isRead: false,
    createdAt: '2025-05-25T10:30:00Z'
  },
  {
    id: 2,
    userId: 1,
    message: 'Payment confirmation for order #12345',
    type: 'payment',
    isRead: true,
    createdAt: '2025-05-24T15:45:00Z'
  },
  {
    id: 3,
    userId: 2,
    message: 'Your supplier application was approved',
    type: 'account',
    isRead: false,
    createdAt: '2025-05-23T09:15:00Z'
  }
];

// Get all notifications for a user
router.get('/', (req, res) => {
  const userId = req.user.id;
  const userNotifications = notifications.filter(n => n.userId === userId);
  res.json(userNotifications);
});

// Mark notification as read
router.put('/:id/read', (req, res) => {
  const notificationId = parseInt(req.params.id);
  const userId = req.user.id;
  
  const notification = notifications.find(n => n.id === notificationId && n.userId === userId);
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  notification.isRead = true;
  
  res.json(notification);
});

// Mark all notifications as read
router.put('/read-all', (req, res) => {
  const userId = req.user.id;
  
  notifications.forEach(n => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });
  
  const userNotifications = notifications.filter(n => n.userId === userId);
  res.json(userNotifications);
});

export default router;
