import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Sample user database for demo purposes
const users = [
  {
    id: 1,
    email: 'admin@bell24h.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@bell24h.com',
    password: 'user123',
    role: 'user'
  }
];

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Create token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-default-secret-key',
    { expiresIn: '1h' }
  );
  
  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

// Logout route
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;
