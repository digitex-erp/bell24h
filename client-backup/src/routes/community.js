import express from 'express';

const router = express.Router();

// Mock community posts
const posts = [
  {
    id: 1,
    title: 'Welcome to Bell24H Community',
    content: 'This is a platform for B2B professionals to connect and share insights.',
    authorId: 1,
    authorName: 'Admin User',
    createdAt: '2025-05-15T10:30:00Z',
    likes: 15,
    comments: 5
  },
  {
    id: 2,
    title: 'Tips for optimizing your RFQ process',
    content: 'Learn how to get better responses to your RFQs with these proven tactics.',
    authorId: 2,
    authorName: 'Test User',
    createdAt: '2025-05-20T14:45:00Z',
    likes: 8,
    comments: 3
  }
];

// Get all community posts
router.get('/posts', (req, res) => {
  res.json(posts);
});

// Get post by ID
router.get('/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  res.json(post);
});

// Create new post
router.post('/posts', (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  
  const newPost = {
    id: posts.length + 1,
    title,
    content,
    authorId: req.user.id,
    authorName: 'Current User', // In a real app, you would get the actual name
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0
  };
  
  posts.push(newPost);
  
  res.status(201).json(newPost);
});

export default router;
