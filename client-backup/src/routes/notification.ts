import express from 'express';
import { NotificationService } from '../services/notification';
import { authorize } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/express.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authorize(['BUYER', 'SUPPLIER']), async (req: AuthenticatedRequest & { query: { page?: string; limit?: string } }, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const notifications = await NotificationService.getNotifications(
      req.user.id,
      parseInt(limit),
      parseInt(page)
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/count', authorize(['BUYER', 'SUPPLIER']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authorize(['BUYER', 'SUPPLIER']), async (req: AuthenticatedRequest & { params: { id: string } }, res) => {
  try {
    const { id } = req.params;
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const notification = await NotificationService.markAsRead(id);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;
