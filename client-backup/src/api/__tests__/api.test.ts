import { rest } from 'msw';
import { server } from '@/mocks/server';
import { 
  loginUser,
  fetchAnalytics,
  fetchSupplierRisk,
  fetchTransactions,
  fetchPerformanceMetrics
} from '../api';

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Clear any previous mocks
    server.resetHandlers();
  });

  describe('Authentication', () => {
    it('should successfully login user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await loginUser(credentials);
      
      expect(response).toHaveProperty('token');
      expect(response).toHaveProperty('user');
      expect(response.user).toHaveProperty('email', 'test@example.com');
      expect(response.user).toHaveProperty('role', 'user');
    });

    it('should handle login failure', async () => {
      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ message: 'Invalid credentials' })
          );
        })
      );

      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpass',
      };

      await expect(loginUser(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Analytics', () => {
    it('should fetch dashboard analytics', async () => {
      const analytics = await fetchAnalytics();
      
      expect(analytics).toHaveProperty('totalTransactions', 150);
      expect(analytics).toHaveProperty('activeSuppliers', 45);
      expect(analytics).toHaveProperty('pendingRFQs', 12);
      expect(analytics).toHaveProperty('revenue', 250000);
    });

    it('should handle analytics fetch error', async () => {
      server.use(
        rest.get('/api/analytics/dashboard', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      await expect(fetchAnalytics()).rejects.toThrow();
    });
  });

  describe('Supplier Risk', () => {
    it('should fetch supplier risk data', async () => {
      const riskData = await fetchSupplierRisk();
      
      expect(riskData.suppliers).toHaveLength(2);
      expect(riskData.suppliers[0]).toHaveProperty('name', 'Supplier A');
      expect(riskData.suppliers[0]).toHaveProperty('riskScore', 0.85);
    });

    it('should handle supplier risk fetch error', async () => {
      server.use(
        rest.get('/api/suppliers/risk', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      await expect(fetchSupplierRisk()).rejects.toThrow();
    });
  });

  describe('Transactions', () => {
    it('should fetch transaction data', async () => {
      const transactions = await fetchTransactions();
      
      expect(transactions.transactions).toHaveLength(2);
      expect(transactions.transactions[0]).toHaveProperty('amount', 5000);
      expect(transactions.transactions[0]).toHaveProperty('status', 'completed');
    });

    it('should handle transaction fetch error', async () => {
      server.use(
        rest.get('/api/transactions', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      await expect(fetchTransactions()).rejects.toThrow();
    });
  });

  describe('Performance Metrics', () => {
    it('should fetch performance metrics', async () => {
      const metrics = await fetchPerformanceMetrics();
      
      expect(metrics.metrics).toHaveProperty('responseTime', 250);
      expect(metrics.metrics).toHaveProperty('uptime', 99.9);
      expect(metrics.metrics).toHaveProperty('errorRate', 0.1);
      expect(metrics.metrics).toHaveProperty('userSatisfaction', 4.5);
    });

    it('should handle performance metrics fetch error', async () => {
      server.use(
        rest.get('/api/performance', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      await expect(fetchPerformanceMetrics()).rejects.toThrow();
    });
  });
}); 