import { Express } from 'express';
import {
  getAccountStatus,
  createInvoiceDiscount,
  requestEarlyPayment,
  getDiscountableInvoices,
  getDiscountStatus,
  calculateDiscountRates,
  getTransactionHistory,
  checkIntegrationStatus,
  createBulkInvoiceDiscount,
  getDiscountAnalytics,
  getBestDiscountOptions,
  getDashboardStats
} from './kredx-controller';

/**
 * Register KredX invoice discounting API routes
 */
export function registerKredxRoutes(app: Express) {
  // KredX integration status
  app.get('/api/kredx/status', checkIntegrationStatus);
  app.get('/api/kredx/account', getAccountStatus);
  
  // Invoice discounting endpoints
  app.post('/api/kredx/discount', createInvoiceDiscount);
  app.post('/api/kredx/early-payment', requestEarlyPayment);
  app.get('/api/kredx/invoices/:userId', getDiscountableInvoices);
  app.get('/api/kredx/discount/:invoiceId', getDiscountStatus);
  app.post('/api/kredx/calculate', calculateDiscountRates);
  
  // Transaction history
  app.get('/api/kredx/transactions/:userId', getTransactionHistory);
  
  // Advanced invoice discounting features
  app.post('/api/kredx/bulk-discount', createBulkInvoiceDiscount);
  app.get('/api/kredx/analytics', getDiscountAnalytics);
  app.get('/api/kredx/options/:invoiceId', getBestDiscountOptions);
  app.get('/api/kredx/dashboard', getDashboardStats);
}