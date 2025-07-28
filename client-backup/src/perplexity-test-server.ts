import express from 'express';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.TEST_PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello Express app!');
});

// Add a test endpoint for your Perplexity API
app.get('/api/perplexity/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Perplexity API test endpoint',
    timestamp: new Date().toISOString()
  });
});

// Import and use test routes
import testRoutes from './routes/test';
app.use('/api/test', testRoutes);

app.listen(PORT, () => {
  console.log(`Test server started on port ${PORT}`);
});
