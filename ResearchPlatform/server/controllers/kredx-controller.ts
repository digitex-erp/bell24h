import type { Request, Response } from 'express';
import { z } from 'zod';
import { kredxService } from '../services/kredx-service';

// Updated validation schema for discount request
const discountRequestSchema = z.object({
  invoiceId: z.number().int().positive(),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  buyerName: z.string().min(1),
  buyerEmail: z.string().email(), // Required
  invoiceReference: z.string().min(1)
});

// Updated validation schema for early payment request
const earlyPaymentSchema = z.object({
  milestoneId: z.number().int().positive(),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  buyerId: z.number().int().positive(),
  supplierId: z.number().int().positive(),
  description: z.string().min(1) // Required
});

// Validation schema for rate calculation
const calculationSchema = z.object({
  amount: z.number().positive(),
  dueDate: z.string().datetime()
});

// Validation schema for bulk discount request
const bulkDiscountSchema = z.object({
  invoiceIds: z.array(z.number().int().positive())
});

// Validation schema for analytics filters
const analyticsFilterSchema = z.object({
  userId: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export async function getAccountStatus(_req: Request, res: Response) {
  try {
    const status = await kredxService.getAccountStatus();
    return res.json(status);
  } catch (error) {
    console.error('Error fetching KredX account status:', error);
    return res.status(500).json({ error: 'Failed to fetch KredX account status' });
  }
}

export async function createInvoiceDiscount(req: Request, res: Response) {
  try {
    const data = discountRequestSchema.parse(req.body);
    const result = await kredxService.createInvoiceDiscount(data);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('Error creating invoice discount:', error);
      return res.status(500).json({ error: 'Failed to create invoice discount' });
    }
  }
}

export async function requestEarlyPayment(req: Request, res: Response) {
  try {
    const data = earlyPaymentSchema.parse(req.body);
    const result = await kredxService.requestEarlyPayment(data);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('Error requesting early payment:', error);
      return res.status(500).json({ error: 'Failed to request early payment' });
    }
  }
}

export async function getDiscountableInvoices(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const invoices = await kredxService.getDiscountableInvoices(userId);
    return res.json(invoices);
  } catch (error) {
    console.error('Error fetching discountable invoices:', error);
    return res.status(500).json({ error: 'Failed to fetch discountable invoices' });
  }
}

export async function getDiscountStatus(req: Request, res: Response) {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }
    
    const status = await kredxService.getDiscountStatus(invoiceId);
    return res.json(status);
  } catch (error) {
    console.error('Error fetching discount status:', error);
    return res.status(500).json({ error: 'Failed to fetch discount status' });
  }
}

export async function calculateDiscountRates(req: Request, res: Response) {
  try {
    const data = calculationSchema.parse(req.body);
    const rates = await kredxService.calculateDiscountRates(data.amount, data.dueDate);
    return res.json(rates);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('Error calculating discount rates:', error);
      return res.status(500).json({ error: 'Failed to calculate discount rates' });
    }
  }
}

export async function getTransactionHistory(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const history = await kredxService.getTransactionHistory(userId);
    return res.json(history);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
}

export async function checkIntegrationStatus(_req: Request, res: Response) {
  try {
    const isConfigured = await kredxService.isConfigured();
    return res.json({ integrated: isConfigured });
  } catch (error) {
    console.error('Error checking KredX integration status:', error);
    return res.status(500).json({ error: 'Failed to check KredX integration status' });
  }
}

export async function createBulkInvoiceDiscount(req: Request, res: Response) {
  try {
    const { invoiceIds } = bulkDiscountSchema.parse(req.body);
    const result = await kredxService.createBulkInvoiceDiscount(invoiceIds);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('Error creating bulk invoice discount:', error);
      return res.status(500).json({ error: 'Failed to create bulk invoice discount' });
    }
  }
}

export async function getDiscountAnalytics(req: Request, res: Response) {
  try {
    const filters = analyticsFilterSchema.parse(req.query);
    
    // Convert string dates to Date objects if present
    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
    
    const analytics = await kredxService.getDiscountAnalytics(
      filters.userId,
      startDate,
      endDate
    );
    
    return res.json(analytics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid filter parameters', details: error.errors });
    } else {
      console.error('Error fetching discount analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch discount analytics' });
    }
  }
}

export async function getBestDiscountOptions(req: Request, res: Response) {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    if (isNaN(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }
    
    const options = await kredxService.getBestDiscountOptions(invoiceId);
    return res.json(options);
  } catch (error) {
    console.error('Error fetching best discount options:', error);
    return res.status(500).json({ error: 'Failed to fetch best discount options' });
  }
}

export async function getDashboardStats(req: Request, res: Response) {
  try {
    let userId: number | undefined = undefined;
    
    if (req.query.userId && typeof req.query.userId === 'string') {
      userId = parseInt(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
    }
    
    const stats = await kredxService.getDashboardStats(userId);
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}