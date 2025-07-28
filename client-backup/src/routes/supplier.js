import express from 'express';

const router = express.Router();

// Mock supplier data
const suppliers = [
  {
    id: 1,
    name: 'Acme Supplies Ltd.',
    email: 'contact@acmesupplies.com',
    phone: '+91 9876543210',
    address: 'Mumbai, Maharashtra, India',
    categories: ['Electronics', 'Industrial Equipment'],
    rating: 4.5,
    verified: true
  },
  {
    id: 2,
    name: 'TechPro Solutions',
    email: 'info@techprosolutions.com',
    phone: '+91 9765432109',
    address: 'Bangalore, Karnataka, India',
    categories: ['Software', 'IT Services'],
    rating: 4.2,
    verified: true
  }
];

// Get all suppliers
router.get('/', (req, res) => {
  // Filter by category if provided
  const { category } = req.query;
  
  if (category) {
    const filteredSuppliers = suppliers.filter(s => 
      s.categories.includes(category)
    );
    return res.json(filteredSuppliers);
  }
  
  res.json(suppliers);
});

// Get supplier by ID
router.get('/:id', (req, res) => {
  const supplier = suppliers.find(s => s.id === parseInt(req.params.id));
  
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  
  res.json(supplier);
});

// Register as a supplier
router.post('/register', (req, res) => {
  const { name, email, phone, address, categories } = req.body;
  
  if (!name || !email || !categories || categories.length === 0) {
    return res.status(400).json({ message: 'Name, email, and at least one category are required' });
  }
  
  const newSupplier = {
    id: suppliers.length + 1,
    name,
    email,
    phone: phone || '',
    address: address || '',
    categories,
    rating: 0,
    verified: false,
    userId: req.user.id,
    createdAt: new Date().toISOString()
  };
  
  suppliers.push(newSupplier);
  
  res.status(201).json(newSupplier);
});

export default router;
