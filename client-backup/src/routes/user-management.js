import express from 'express';

const router = express.Router();

// Sample users data
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@bell24h.com',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-15T08:30:00Z'
  },
  {
    id: 2,
    name: 'Test User',
    email: 'user@bell24h.com',
    role: 'user',
    status: 'active',
    createdAt: '2025-02-20T10:45:00Z'
  }
];

// Get all users (admin only)
router.get('/users', (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(users);
});

// Get user by ID
router.get('/users/:id', (req, res) => {
  // Check if user is admin or requesting their own info
  if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json(user);
});

// Update user status (admin only)
router.put('/users/:id/status', (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const { status } = req.body;
  
  if (!status || !['active', 'suspended', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is required' });
  }
  
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.status = status;
  
  res.json(user);
});

export default router;
