import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { categories } from '../config/categories';

// Mock API endpoints
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-token',
      user: { id: 1, name: 'Test User' }
    });
  }),

  // RFQ endpoints
  http.get('/api/rfq', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    
    if (category) {
      const categoryConfig = categories.find(c => c.id === category);
      return HttpResponse.json(categoryConfig?.mockupRFQs || []);
    }
    
    return HttpResponse.json(categories.flatMap(c => c.mockupRFQs));
  }),

  http.get('/api/rfq/:id', ({ params }) => {
    const rfq = categories
      .flatMap(c => c.mockupRFQs)
      .find(r => r.id === params.id);
    
    if (!rfq) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(rfq);
  }),

  http.post('/api/rfq', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...body,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'open'
    });
  }),

  http.post('/api/rfq/:id/respond', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...body,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
  }),

  // Quote endpoints
  http.get('/api/quotes', () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          text: 'Test quote 1',
          author: 'Author 1',
          category: 'test'
        },
        {
          id: '2',
          text: 'Test quote 2',
          author: 'Author 2',
          category: 'test'
        }
      ],
      total: 2,
      page: 1,
      pageSize: 10
    });
  }),

  http.get('/api/quotes/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      text: 'Test quote',
      author: 'Test Author',
      category: 'test'
    });
  }),

  // AI endpoints
  http.post('/api/ai/analyze', () => {
    return HttpResponse.json({
      decision: 'approve',
      confidence: 0.85,
      reasoning: 'Test reasoning',
      timestamp: new Date().toISOString()
    });
  }),

  // Explainability endpoints
  http.get('/api/explainability', () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00Z',
          model: 'test-model',
          confidence: 0.95,
          summary: 'Test explanation',
          features: {
            'feature1': 0.8,
            'feature2': 0.6
          }
        }
      ],
      total: 1,
      page: 1,
      pageSize: 10
    });
  }),

  // Feedback endpoints
  http.post('/api/feedback', () => {
    return HttpResponse.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  }),

  http.get('/api/feedback', () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00Z',
          rating: 5,
          comment: 'Great service!',
          category: 'general'
        }
      ],
      total: 1,
      page: 1,
      pageSize: 10
    });
  }),

  // Analytics endpoints
  http.get('/api/analytics/dashboard', () => {
    return HttpResponse.json({
      totalTransactions: 150,
      activeSuppliers: 45,
      pendingRFQs: 12,
      revenue: 250000,
    });
  }),

  // Supplier endpoints
  http.get('/api/suppliers/risk', () => {
    return HttpResponse.json({
      suppliers: [
        {
          id: 1,
          name: 'Supplier A',
          riskScore: 0.85,
          status: 'active',
        },
        {
          id: 2,
          name: 'Supplier B',
          riskScore: 0.65,
          status: 'active',
        },
      ],
    });
  }),

  // Transaction endpoints
  http.get('/api/transactions', () => {
    return HttpResponse.json({
      transactions: [
        {
          id: 1,
          amount: 5000,
          status: 'completed',
          date: '2024-03-20',
        },
        {
          id: 2,
          amount: 3000,
          status: 'pending',
          date: '2024-03-21',
        },
      ],
    });
  }),

  // Performance metrics endpoints
  http.get('/api/performance', () => {
    return HttpResponse.json({
      metrics: {
        responseTime: 250,
        uptime: 99.9,
        errorRate: 0.1,
        userSatisfaction: 4.5,
      },
    });
  }),
];

export const server = setupServer(...handlers);
