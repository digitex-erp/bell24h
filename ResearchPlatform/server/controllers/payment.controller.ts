import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { PaymentService } from '../services/payment.service';

// Initialize the Payment service
const paymentService = new PaymentService();

export function registerPaymentRoutes(app: Express) {
  // KredX invoice discounting
  app.post('/api/payment/kredx/discount-invoice', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        userId: z.number().optional(),
        invoiceNumber: z.string().min(1),
        amount: z.string().min(1),
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request format', 
          errors: result.error.errors 
        });
      }
      
      const { userId, invoiceNumber, amount, dueDate } = result.data;
      const discountResult = await paymentService.discountInvoice(userId, invoiceNumber, amount, dueDate);
      
      return res.status(200).json(discountResult);
    } catch (error) {
      console.error('Error discounting invoice:', error);
      return res.status(500).json({ message: 'Failed to discount invoice' });
    }
  });

  // Get KredX discounting rates
  app.get('/api/payment/kredx/rates', async (req: Request, res: Response) => {
    try {
      const rates = await paymentService.getKredxRates();
      return res.status(200).json(rates);
    } catch (error) {
      console.error('Error fetching KredX rates:', error);
      return res.status(500).json({ message: 'Failed to fetch KredX rates' });
    }
  });

  // Blockchain payment initiation
  app.post('/api/payment/blockchain/initiate', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        userId: z.number().optional(),
        amount: z.string().min(1),
        type: z.string().min(1),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request format', 
          errors: result.error.errors 
        });
      }
      
      const { userId, amount, type } = result.data;
      const paymentResult = await paymentService.initiateBlockchainPayment(userId, amount, type);
      
      return res.status(200).json(paymentResult);
    } catch (error) {
      console.error('Error initiating blockchain payment:', error);
      return res.status(500).json({ message: 'Failed to initiate blockchain payment' });
    }
  });

  // Check blockchain transaction status
  app.get('/api/payment/blockchain/status/:transactionHash', async (req: Request, res: Response) => {
    try {
      const { transactionHash } = req.params;
      
      if (!transactionHash) {
        return res.status(400).json({ message: 'Transaction hash is required' });
      }
      
      const status = await paymentService.checkBlockchainTransactionStatus(transactionHash);
      
      return res.status(200).json(status);
    } catch (error) {
      console.error('Error checking blockchain transaction status:', error);
      return res.status(500).json({ message: 'Failed to check blockchain transaction status' });
    }
  });

  // List blockchain transactions for a user
  app.get('/api/payment/blockchain/transactions/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Valid user ID is required' });
      }
      
      const transactions = await paymentService.getUserBlockchainTransactions(userId);
      
      return res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching user blockchain transactions:', error);
      return res.status(500).json({ message: 'Failed to fetch user blockchain transactions' });
    }
  });
}
