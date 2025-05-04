const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve basic HTML with links to view components
app.get('/', (req, res) => {
  // Read the client directory to show available components
  const componentsDir = path.join(__dirname, 'client/src/components');
  const pagesDir = path.join(__dirname, 'client/src/pages');
  
  let componentsHtml = '<h2>Components</h2><ul>';
  let pagesHtml = '<h2>Pages</h2><ul>';
  
  try {
    // Function to recursively scan directory
    const scanDirectory = (dir, prefix = '') => {
      let html = '';
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const relativePath = path.join(prefix, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          html += `<li><strong>${file}/</strong><ul>`;
          html += scanDirectory(filePath, relativePath);
          html += '</ul></li>';
        } else if (file.endsWith('.tsx') && !file.includes('.d.ts')) {
          const componentName = file.replace('.tsx', '');
          html += `<li>${componentName} [<a href="/component-preview?path=${encodeURIComponent(relativePath)}">View Code</a>]</li>`;
        }
      });
      
      return html;
    };
    
    componentsHtml += scanDirectory(componentsDir, 'components');
    componentsHtml += '</ul>';
    
    pagesHtml += scanDirectory(pagesDir, 'pages');
    pagesHtml += '</ul>';
  } catch (err) {
    console.error('Error scanning directories:', err);
    componentsHtml += '<li>Error scanning components directory</li></ul>';
    pagesHtml += '<li>Error scanning pages directory</li></ul>';
  }
  
  // Show screenshots of features (placeholder)
  const featuresHtml = `
    <h2>Bell24h.com Features</h2>
    <ul>
      <li>Industry Trend Snapshot Generator with 10 enhancements</li>
      <li>Voice/Video RFQ System with OpenAI integration</li>
      <li>RFQ Categorization and Supplier Matching</li>
      <li>KredX Invoice Discounting</li>
      <li>Blockchain Payment Integration</li>
      <li>Analytics Dashboard</li>
      <li>Real-time WebSocket Features</li>
      <li>GST Validation System</li>
    </ul>
    <h3>Overall Project Status</h3>
    <ul>
      <li>Core Platform: 100% Complete</li>
      <li>Trading Features: 93% Complete</li>
      <li>Voice/Video RFQ System: 90% Complete</li>
      <li>Project Consolidation: 90% Complete</li>
      <li>Testing & Integration: 95% Complete</li>
      <li>Deployment Infrastructure: 95% Complete</li>
      <li>Analytics Dashboard: 90% Complete</li>
      <li>Payment System: 80% Complete</li>
    </ul>
  `;
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bell24h.com - Platform Preview</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          header {
            background: linear-gradient(to right, #0066cc, #007bff);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1 {
            margin: 0;
          }
          .tagline {
            font-style: italic;
            margin-top: 5px;
          }
          .container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
          }
          .section {
            flex: 1;
            min-width: 300px;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          h2 {
            color: #0066cc;
            border-bottom: 2px solid #ddd;
            padding-bottom: 5px;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          a {
            color: #0066cc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .free-trial {
            background: #ffd700;
            color: #333;
            padding: 10px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Bell24h.com Marketplace Preview</h1>
          <p class="tagline">RFQ Automation and Buyer-Supplier Matching Platform</p>
        </header>
        
        <div class="free-trial">
          🎉 All features will be available FREE for 30 days to new users! 🎉
        </div>
        
        <div class="section">
          ${featuresHtml}
        </div>
        
        <div class="container">
          <div class="section">
            ${componentsHtml}
          </div>
          <div class="section">
            ${pagesHtml}
          </div>
        </div>
        
        <footer>
          &copy; 2023-2025 Bell24h.com - All rights reserved.
        </footer>
      </body>
    </html>
  `);
});

// Component preview endpoint
app.get('/component-preview', (req, res) => {
  const componentPath = req.query.path;
  
  if (!componentPath) {
    return res.status(400).send('Component path is required');
  }
  
  // Prevent directory traversal
  const normalizedPath = path.normalize(componentPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(__dirname, 'client/src', normalizedPath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      return res.status(404).send(`Component file not found: ${normalizedPath}`);
    }
    
    const code = fs.readFileSync(fullPath, 'utf8');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Component: ${path.basename(normalizedPath)}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            header {
              background: linear-gradient(to right, #0066cc, #007bff);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h1 {
              margin: 0;
            }
            pre {
              background: #f4f4f4;
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 20px;
              white-space: pre-wrap;
              overflow-x: auto;
            }
            .back-link {
              display: inline-block;
              margin-bottom: 20px;
              color: #0066cc;
              text-decoration: none;
            }
            .back-link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <header>
            <h1>Component: ${path.basename(normalizedPath)}</h1>
          </header>
          
          <a href="/" class="back-link">← Back to Component List</a>
          
          <pre>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error reading component file:', err);
    res.status(500).send('Error reading component file');
  }
});

app.listen(PORT, () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
});