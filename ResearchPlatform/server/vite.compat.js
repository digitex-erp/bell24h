const path = require("path");
const fs = require("fs");

function log(message) {
  console.log(`[server] ${message}`);
}

async function setupVite(app, server) {
  log("setting up vite middleware");
  try {
    // Try to load the vite config
    const viteConfig = require("../vite.config.compat.js");
    log("Vite config loaded successfully");
    
    // Simplified middleware setup without actual Vite integration
    // This is just a placeholder as we're focusing on getting a minimal server running
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      
      // For all non-API routes, serve a simple HTML page
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bell24h - Compatibility Mode</title>
        </head>
        <body>
          <h1>Bell24h Running in Compatibility Mode</h1>
          <p>The server is running in compatibility mode with minimal Vite integration.</p>
          <p>API endpoints are available, but the frontend is not fully rendered.</p>
          <div>
            <h2>Available API Endpoints:</h2>
            <ul>
              <li><a href="/api/health">/api/health</a> - Check server health</li>
              <li><a href="/api/industry-trends/featured">/api/industry-trends/featured</a> - Get featured industries</li>
              <li><a href="/api/test-audio">/api/test-audio</a> - Test audio system</li>
            </ul>
          </div>
        </body>
        </html>
      `);
    });
    
    log("vite middleware setup complete");
  } catch (error) {
    log(`error setting up vite: ${error.message}`);
    throw error;
  }
}

function serveStatic(app) {
  log("setting up static file serving");
  const staticPath = path.resolve(__dirname, "../dist/public");
  
  // Check if the static directory exists
  if (fs.existsSync(staticPath)) {
    app.use(require("express").static(staticPath));
    log(`serving static files from ${staticPath}`);
  } else {
    log(`static directory ${staticPath} does not exist, skipping static file serving`);
  }
}

module.exports = {
  setupVite,
  serveStatic,
  log,
};