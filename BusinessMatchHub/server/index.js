const express = require('express');
const path = require('path');
// Import from the JavaScript files
const { registerRoutes } = require('./routes');

// Create Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register all routes
registerRoutes(app).then(httpServer => {
  // Default route for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  // Start the server
  const PORT = process.env.PORT || 8080;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});