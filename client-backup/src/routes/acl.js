import express from 'express';

const router = express.Router();

// Mock ACL (Access Control List) data
const roles = [
  {
    id: 1,
    name: 'admin',
    permissions: ['*'] // Admin has all permissions
  },
  {
    id: 2,
    name: 'user',
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:rfq',
      'create:rfq',
      'update:own_rfq',
      'delete:own_rfq',
      'read:suppliers',
      'read:own_contracts'
    ]
  },
  {
    id: 3,
    name: 'supplier',
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:rfq',
      'create:bid',
      'update:own_bid',
      'read:own_contracts'
    ]
  }
];

// Get all roles and permissions (admin only)
router.get('/roles', (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(roles);
});

// Get role by name
router.get('/roles/:name', (req, res) => {
  const role = roles.find(r => r.name === req.params.name);
  
  if (!role) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  // Regular users can only see their own role
  if (req.user.role !== 'admin' && req.user.role !== req.params.name) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(role);
});

// Check permission
router.post('/check-permission', (req, res) => {
  const { permission } = req.body;
  
  if (!permission) {
    return res.status(400).json({ message: 'Permission parameter is required' });
  }
  
  // Get the user's role
  const userRole = roles.find(r => r.name === req.user.role);
  
  if (!userRole) {
    return res.status(404).json({ message: 'User role not found' });
  }
  
  // Check if the role has the permission
  const hasPermission = userRole.permissions.includes('*') || userRole.permissions.includes(permission);
  
  res.json({ hasPermission });
});

export default router;
