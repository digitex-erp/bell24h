// CommonJS version of the Express server for Windows compatibility
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.TEST_PORT || 4000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.send('Hello Express app!');
});

// Sample API route for testing
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API test endpoint',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server started on port ${PORT}`);
});
