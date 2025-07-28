import express from 'express';
import { authorize } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get all users (admin only)
router.get('/', authorize(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;
    const where = {};
    
    if (role) {
      where.role = role as string;
    }
    
    if (status) {
      where.status = status as string;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await prisma.user.findMany({
      where,
      include: {
        company: true,
        rfqs: true,
        bids: true,
      },
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
    });

    const count = await prisma.user.count({ where });
    res.json({ users, total: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details (admin or self)
router.get('/:id', authorize(['ADMIN', 'BUYER', 'SUPPLIER']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        rfqs: true,
        bids: true,
        notifications: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only admins can view other users' details
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update user details (admin only)
router.put('/:id', authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, company } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        role,
        status,
        companyId: company?.id,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user statistics (admin only)
router.get('/stats', authorize(['ADMIN']), async (req, res) => {
  try {
    const stats = {
      totalUsers: await prisma.user.count(),
      activeUsers: await prisma.user.count({ where: { status: 'ACTIVE' } }),
      buyers: await prisma.user.count({ where: { role: 'BUYER' } }),
      suppliers: await prisma.user.count({ where: { role: 'SUPPLIER' } }),
      pendingApprovals: await prisma.user.count({ where: { status: 'PENDING' } }),
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
