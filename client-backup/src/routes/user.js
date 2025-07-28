import express from 'express';

const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
  // In a real app, you would fetch this from your database
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Mock user data
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    profile: {
      name: 'Demo User',
      company: 'Bell24H',
      position: 'Procurement Manager',
      location: 'Mumbai, India'
    }
  });
});

// Update user profile
router.put('/profile', (req, res) => {
  const { name, company, position, location } = req.body;
  
  // In a real app, you would update this in your database
  res.json({
    message: 'Profile updated successfully',
    profile: {
      name: name || 'Demo User',
      company: company || 'Bell24H',
      position: position || 'Procurement Manager',
      location: location || 'Mumbai, India'
    }
  });
});

export default router;
