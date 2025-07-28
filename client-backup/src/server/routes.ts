/**
 * Express route registration for Bell24H Dashboard
 */
import { Express } from 'express';
import * as http from 'http';
import { WebSocketServer } from 'ws';
import { log } from './utils';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth';
import rfqRoutes from './routes/rfq.routes';

// Load environment variables
dotenv.config();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' 
    ? { rejectUnauthorized: false } 
    : undefined
});

// Export database instance
export const db = drizzle(pool);

/**
 * Register all API routes for the Bell24H Dashboard
 */
import { ModelMonitor } from '../models/ai-explainer';

export async function registerRoutes(app: Express, modelMonitor: ModelMonitor): Promise<http.Server> {
  // Create HTTP server
  const server = http.createServer(app);
  
  // Setup WebSocket server for real-time features
  const wss = new WebSocketServer({ server });
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    log('New WebSocket connection established', 'info');
    
    // Message handler
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        log(`WebSocket message received: ${JSON.stringify(data).substring(0, 100)}`, 'debug');
        
        // Process different message types
        switch (data.type) {
          case 'perplexity_subscribe':
            // Subscribe to perplexity updates
            log(`Subscribed to perplexity updates for: ${data.entityTypes.join(', ')}`, 'info');
            break;
            
          case 'ping':
            // Respond to heartbeat
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
            
          default:
            // Handle other message types
            // For now, just broadcast to all connected clients
            wss.clients.forEach((client) => {
              if (client !== ws) {
                client.send(JSON.stringify(data));
              }
            });
        }
      } catch (error) {
        log(`Error processing WebSocket message: ${error}`, 'error');
      }
    });
    
    // Connection close handler
    ws.on('close', () => {
      log('WebSocket connection closed', 'info');
    });
  });

  // API Routes
  
  // Register authentication routes
  app.use('/api/auth', authRoutes);
  app.use('/api/rfqs', rfqRoutes(modelMonitor));
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      user: req.user ? `${req.user.username} (${req.user.role})` : 'anonymous',
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Perplexity API endpoints
  
  // Test endpoint
  app.get('/api/perplexity/test', (req, res) => {
    res.json({
      status: 'success',
      message: 'Perplexity API test endpoint',
      timestamp: new Date().toISOString()
    });
  });
  
  // Analyze text
  app.post('/api/perplexity/analyze', (req, res) => {
    const { text, entityType, modelType } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Mock analysis response
    res.json({
      id: `perplexity-${Date.now()}`,
      text,
      entityType: entityType || 'rfq',
      modelType: modelType || 'default',
      score: parseFloat((Math.random() * 100).toFixed(2)),
      complexity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      readabilityIndex: parseFloat((Math.random() * 100).toFixed(2)),
      perplexityFactors: [
        { factor: 'Vocabulary', impact: parseFloat((Math.random()).toFixed(2)) },
        { factor: 'Sentence Structure', impact: parseFloat((Math.random()).toFixed(2)) },
        { factor: 'Technical Content', impact: parseFloat((Math.random()).toFixed(2)) }
      ],
      timestamp: new Date().toISOString()
    });
  });
  
  // Get temporal trends
  app.get('/api/perplexity/trends/:entityType', (req, res) => {
    const { entityType } = req.params;
    const { timeframe = 'month' } = req.query;
    
    // Generate mock trend data
    const trends = [];
    const periods = timeframe === 'week' ? 7 : timeframe === 'month' ? 4 : timeframe === 'quarter' ? 3 : 12;
    
    for (let i = 0; i < periods; i++) {
      trends.push({
        period: `2025-${(i + 1).toString().padStart(2, '0')}`,
        complexity: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
        industryAverage: parseFloat((0.65 + Math.random() * 0.2).toFixed(2))
      });
    }
    
    res.json({
      entityType,
      timeframe,
      trends,
      timestamp: new Date().toISOString()
    });
  });
  
  // Market segmentation
  app.get('/api/perplexity/segments', (req, res) => {
    const { criteria = 'terminology' } = req.query;
    
    // Generate mock segment data
    const segments = [
      { name: 'Technical', percentage: parseFloat((Math.random() * 40).toFixed(2)) },
      { name: 'Business', percentage: parseFloat((Math.random() * 30).toFixed(2)) },
      { name: 'General', percentage: parseFloat((Math.random() * 20).toFixed(2)) },
      { name: 'Other', percentage: parseFloat((Math.random() * 10).toFixed(2)) }
    ];
    
    // Normalize to ensure sum is 100%
    const total = segments.reduce((sum, segment) => sum + segment.percentage, 0);
    segments.forEach(segment => {
      segment.percentage = parseFloat((segment.percentage / total * 100).toFixed(2));
    });
    
    res.json({
      criteria,
      segments,
      timestamp: new Date().toISOString()
    });
  });
  
  // Competitive insights
  app.get('/api/perplexity/competitive/:entityType', (req, res) => {
    const { entityType } = req.params;
    
    res.json({
      entityType,
      insights: [
        {
          competitor: 'Competitor A',
          score: parseFloat((Math.random() * 100).toFixed(2)),
          strengths: ['Clear communication', 'Technical specificity'],
          gaps: ['Missing pricing information']
        },
        {
          competitor: 'Competitor B',
          score: parseFloat((Math.random() * 100).toFixed(2)),
          strengths: ['Comprehensive specifications'],
          gaps: ['Complex language', 'Technical jargon']
        },
        {
          competitor: 'Competitor C',
          score: parseFloat((Math.random() * 100).toFixed(2)),
          strengths: ['Concise messaging'],
          gaps: ['Lacks technical details']
        }
      ],
      timestamp: new Date().toISOString()
    });
  });
  
  // Success prediction
  app.get('/api/perplexity/predict/:entityType/:entityId', (req, res) => {
    const { entityType, entityId } = req.params;
    
    res.json({
      entityType,
      entityId,
      successProbability: parseFloat((Math.random() * 100).toFixed(2)),
      confidence: parseFloat((Math.random() * 100).toFixed(2)),
      areas: [
        { name: 'Clarity', score: parseFloat((Math.random() * 100).toFixed(2)) },
        { name: 'Technical Accuracy', score: parseFloat((Math.random() * 100).toFixed(2)) },
        { name: 'Competitive Pricing', score: parseFloat((Math.random() * 100).toFixed(2)) },
        { name: 'Value Proposition', score: parseFloat((Math.random() * 100).toFixed(2)) }
      ],
      timestamp: new Date().toISOString()
    });
  });
  
  // Text improvement
  app.post('/api/perplexity/improve', (req, res) => {
    const { text, targetAudience } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Generate a slightly improved version of the text
    const improvedText = text
      .replace(/utilize/g, 'use')
      .replace(/in order to/g, 'to')
      .replace(/due to the fact that/g, 'because')
      .replace(/at this point in time/g, 'now');
    
    res.json({
      originalText: text,
      improvedText,
      targetAudience: targetAudience || 'general',
      improvements: [
        { type: 'simplification', count: 3 },
        { type: 'clarity', count: 2 },
        { type: 'conciseness', count: 4 }
      ],
      timestamp: new Date().toISOString()
    });
  });
  
  // Generate custom report
  app.post('/api/perplexity/report', (req, res) => {
    const data = req.body;
    
    // In a real implementation, this would generate a PDF
    // For now, we'll just return a mock base64 string (not a real PDF)
    const mockPdfBase64 = 'JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAEtjTsKgDAUBHtPMXYiPj+PmO8X...';
    
    res.json({
      status: 'success',
      message: 'Custom report generated successfully',
      reportType: 'pdf',
      pdfBase64: mockPdfBase64,
      timestamp: new Date().toISOString()
    });
  });
  
  // Perplexity Export Endpoints - integrating with Analytics Export functionality
  
  // Export perplexity analysis to CSV
  app.post('/api/perplexity/export/csv', (req, res) => {
    const { entityType, data } = req.body;
    
    // In a real implementation, this would generate a proper CSV
    // For now, we'll just return a mock CSV string
    const mockCsv = 'Entity Type,Score,Complexity\n' + 
                  `${entityType},${Math.random().toFixed(2)},Medium\n` +
                  'Factor,Impact\n' +
                  'Vocabulary,0.45\n' +
                  'Sentence Structure,0.32\n' +
                  'Technical Content,0.23';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="perplexity-${entityType}-${Date.now()}.csv"`);
    res.send(mockCsv);
  });
  
  // Export perplexity analysis to Excel
  app.post('/api/perplexity/export/excel', (req, res) => {
    const { entityType } = req.body;
    
    // In a real implementation, this would generate a proper Excel file
    // For now, we'll just return a mock binary response
    const mockBinary = Buffer.from('Mock Excel file content');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="perplexity-${entityType}-${Date.now()}.xlsx"`);
    res.send(mockBinary);
  });
  
  // Export perplexity analysis to JSON
  app.post('/api/perplexity/export/json', (req, res) => {
    const { entityType, modelType, text, perplexityResult } = req.body;
    
    const exportData = {
      entityType,
      modelType,
      text,
      perplexityResult: perplexityResult || {
        score: Math.random().toFixed(2),
        complexity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        perplexityFactors: [
          { factor: 'Vocabulary', impact: parseFloat((Math.random()).toFixed(2)) },
          { factor: 'Sentence Structure', impact: parseFloat((Math.random()).toFixed(2)) },
          { factor: 'Technical Content', impact: parseFloat((Math.random()).toFixed(2)) }
        ]
      },
      exportedAt: new Date().toISOString(),
      exportedBy: req.user ? req.user.username : 'anonymous'
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="perplexity-${entityType}-${Date.now()}.json"`);
    res.json(exportData);
  });
  
  // Log that routes are registered
  log('API routes registered successfully', 'info');
  
  return server;
}
