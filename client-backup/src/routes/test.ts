import express, { Request, Response, Router } from 'express';

const router = Router();

// Basic test endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Test routes are working',
    timestamp: new Date().toISOString()
  });
});

// Perplexity test endpoint that returns mock data
router.get('/perplexity', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    entityType: 'test',
    modelType: 'mock',
    perplexityResult: {
      score: 0.78,
      complexity: 'Medium',
      readabilityIndex: 65,
      perplexityFactors: [
        { factor: 'Vocabulary', impact: 0.45 },
        { factor: 'Sentence Structure', impact: 0.32 },
        { factor: 'Technical Content', impact: 0.23 }
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Mock temporal trends endpoint
router.get('/trends', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    trends: [
      { period: '2025-01', complexity: 0.82, industryAverage: 0.75 },
      { period: '2025-02', complexity: 0.79, industryAverage: 0.76 },
      { period: '2025-03', complexity: 0.83, industryAverage: 0.77 },
      { period: '2025-04', complexity: 0.80, industryAverage: 0.78 },
      { period: '2025-05', complexity: 0.78, industryAverage: 0.78 }
    ],
    timestamp: new Date().toISOString()
  });
});

export default router;
