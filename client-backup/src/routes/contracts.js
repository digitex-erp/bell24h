import express from 'express';

const router = express.Router();

// Mock contracts data
const contracts = [
  {
    id: 1,
    title: 'Industrial Motors Supply Agreement',
    rfqId: 1,
    buyerId: 1,
    supplierId: 2,
    amount: 25000,
    status: 'active',
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2026-06-01T00:00:00Z',
    createdAt: '2025-05-20T14:30:00Z'
  },
  {
    id: 2,
    title: 'Office Furniture Supply Contract',
    rfqId: 2,
    buyerId: 2,
    supplierId: 1,
    amount: 75000,
    status: 'draft',
    startDate: '2025-07-01T00:00:00Z',
    endDate: '2026-01-01T00:00:00Z',
    createdAt: '2025-05-25T09:45:00Z'
  }
];

// Get all contracts
router.get('/', (req, res) => {
  // Filter based on user role and ID
  const userId = req.user.id;
  const userRole = req.user.role;
  
  let userContracts;
  
  if (userRole === 'admin') {
    // Admins can see all contracts
    userContracts = contracts;
  } else {
    // Regular users can only see contracts where they are buyer or supplier
    userContracts = contracts.filter(
      c => c.buyerId === userId || c.supplierId === userId
    );
  }
  
  res.json(userContracts);
});

// Get contract by ID
router.get('/:id', (req, res) => {
  const contractId = parseInt(req.params.id);
  const userId = req.user.id;
  const userRole = req.user.role;
  
  const contract = contracts.find(c => c.id === contractId);
  
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found' });
  }
  
  // Check if user has access to this contract
  if (userRole !== 'admin' && contract.buyerId !== userId && contract.supplierId !== userId) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(contract);
});

// Create new contract
router.post('/', (req, res) => {
  const { title, rfqId, supplierId, amount, startDate, endDate } = req.body;
  
  // Validation
  if (!title || !rfqId || !supplierId || !amount || !startDate || !endDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const newContract = {
    id: contracts.length + 1,
    title,
    rfqId: parseInt(rfqId),
    buyerId: req.user.id,
    supplierId: parseInt(supplierId),
    amount: parseFloat(amount),
    status: 'draft',
    startDate,
    endDate,
    createdAt: new Date().toISOString()
  };
  
  // In a real app, you would save this to a database
  contracts.push(newContract);
  
  res.status(201).json(newContract);
});

// Update contract status
router.put('/:id/status', (req, res) => {
  const contractId = parseInt(req.params.id);
  const { status } = req.body;
  const userId = req.user.id;
  
  if (!status || !['draft', 'active', 'completed', 'terminated'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is required' });
  }
  
  const contract = contracts.find(c => c.id === contractId);
  
  if (!contract) {
    return res.status(404).json({ message: 'Contract not found' });
  }
  
  // Check if user has permission to update this contract
  if (contract.buyerId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  contract.status = status;
  
  res.json(contract);
});

export default router;
