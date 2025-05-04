
import express from 'express';
import path from 'path';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Sample RFQ data
const sampleRFQs = [
  {
    id: 1,
    title: "Industrial Machinery Parts",
    description: "Looking for CNC machine components",
    category: "Manufacturing",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deliveryLocation: "Mumbai"
  },
  {
    id: 2,
    title: "Electronic Components",
    description: "Bulk order for PCB components", 
    category: "Electronics",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    deliveryLocation: "Delhi"
  }
];

// API Routes
app.get('/api/rfqs', (req, res) => {
  res.json(sampleRFQs);
});

app.get('/api/rfq/:id', (req, res) => {
  const rfq = sampleRFQs.find(r => r.id === parseInt(req.params.id));
  if (rfq) {
    res.json(rfq);
  } else {
    res.status(404).json({ error: 'RFQ not found' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
