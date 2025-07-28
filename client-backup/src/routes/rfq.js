import express from 'express';

const router = express.Router();

// Sample RFQ data
const rfqs = [
  {
    id: 1,
    title: 'Industrial Motors Procurement',
    description: 'Looking for 50 industrial motors with specific specifications',
    budget: 25000,
    deadline: '2025-06-15',
    status: 'open',
    createdBy: 1
  },
  {
    id: 2,
    title: 'Office Furniture Supply',
    description: 'Need office furniture for 100 employees',
    budget: 75000,
    deadline: '2025-06-30',
    status: 'open',
    createdBy: 2
  }
];

// Get all RFQs
router.get('/', (req, res) => {
  res.json(rfqs);
});

// Get RFQ by ID
router.get('/:id', (req, res) => {
  const rfq = rfqs.find(r => r.id === parseInt(req.params.id));
  
  if (!rfq) {
    return res.status(404).json({ message: 'RFQ not found' });
  }
  
  res.json(rfq);
});

// Create new RFQ
router.post('/', (req, res) => {
  const { title, description, budget, deadline } = req.body;
  
  // Validation
  if (!title || !description || !budget || !deadline) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const newRfq = {
    id: rfqs.length + 1,
    title,
    description,
    budget,
    deadline,
    status: 'open',
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };
  
  // In a real app, you would save this to a database
  rfqs.push(newRfq);
  
  res.status(201).json(newRfq);
});

export default router;
