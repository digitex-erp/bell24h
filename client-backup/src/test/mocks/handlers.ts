import { rest } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const handlers = [
  // Auth endpoints
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body as any;
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'test-token',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'BUYER',
          },
        })
      );
    }
    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
  }),

  rest.post(`${API_URL}/auth/register`, (req, res, ctx) => {
    const { email, password, name } = req.body as any;
    return res(
      ctx.status(201),
      ctx.json({
        token: 'test-token',
        user: {
          id: '1',
          email,
          name,
          role: 'BUYER',
        },
      })
    );
  }),

  // User endpoints
  rest.get(`${API_URL}/users/me`, (req, res, ctx) => {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (token === 'test-token') {
      return res(
        ctx.status(200),
        ctx.json({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'BUYER',
        })
      );
    }
    return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
  }),

  // RFQ endpoints
  rest.get(`${API_URL}/rfqs`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: '1',
            title: 'Test RFQ',
            description: 'Test Description',
            status: 'OPEN',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      })
    );
  }),

  rest.post(`${API_URL}/rfqs`, (req, res, ctx) => {
    const { title, description } = req.body as any;
    return res(
      ctx.status(201),
      ctx.json({
        id: '1',
        title,
        description,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // Quote endpoints
  rest.get(`${API_URL}/quotes`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: '1',
            price: 100,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      })
    );
  }),

  rest.post(`${API_URL}/quotes`, (req, res, ctx) => {
    const { price, rfqId } = req.body as any;
    return res(
      ctx.status(201),
      ctx.json({
        id: '1',
        price,
        rfqId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // Transaction endpoints
  rest.get(`${API_URL}/transactions`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: '1',
            amount: 100,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      })
    );
  }),

  rest.post(`${API_URL}/transactions`, (req, res, ctx) => {
    const { amount, quoteId } = req.body as any;
    return res(
      ctx.status(201),
      ctx.json({
        id: '1',
        amount,
        quoteId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // Company endpoints
  rest.get(`${API_URL}/companies`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: '1',
            name: 'Test Company',
            type: 'SUPPLIER',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      })
    );
  }),

  rest.post(`${API_URL}/companies`, (req, res, ctx) => {
    const { name, type } = req.body as any;
    return res(
      ctx.status(201),
      ctx.json({
        id: '1',
        name,
        type,
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // Document endpoints
  rest.post(`${API_URL}/documents/upload`, async (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '1',
        name: 'test.pdf',
        url: 'https://example.com/test.pdf',
        size: 1024,
        mimeType: 'application/pdf',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // Notification endpoints
  rest.get(`${API_URL}/notifications`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: '1',
            type: 'RFQ',
            title: 'New RFQ',
            message: 'You have a new RFQ',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      })
    );
  }),

  // Analytics endpoints
  rest.get(`${API_URL}/analytics/dashboard`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        totalUsers: 100,
        totalRFQs: 50,
        totalQuotes: 200,
        totalTransactions: 75,
        recentActivity: [
          {
            id: '1',
            type: 'RFQ',
            description: 'New RFQ created',
            createdAt: new Date().toISOString(),
          },
        ],
      })
    );
  }),
]; 