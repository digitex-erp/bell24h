import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import { blockchainService } from '../services/blockchain';

// Validation schema for creating escrow payments
const createEscrowSchema = z.object({
  orderId: z.number().int().positive(),
  supplier: z.string().min(42).max(42), // ETH address is 42 chars with 0x prefix
  amount: z.number().positive(),
  paymentType: z.number().int().min(0).max(1), // 0=full, 1=milestone
  milestoneNumber: z.number().int().min(0),
  totalMilestones: z.number().int().min(1),
  description: z.string().min(1)
});

// Validation schema for releasing escrow payments
const releaseEscrowSchema = z.object({
  paymentId: z.number().int().positive()
});

// Validation schema for getting payment details
const paymentDetailsSchema = z.object({
  paymentId: z.number().int().positive()
});

// Validation schema for getting token balance
const tokenBalanceSchema = z.object({
  address: z.string().min(42).max(42) // ETH address is 42 chars with 0x prefix
});

/**
 * Get blockchain integration status
 */
export async function getBlockchainStatus(_req: Request, res: Response) {
  const status = blockchainService.getStatus();
  res.json(status);
}

/**
 * Create a new escrow payment
 */
export async function createEscrowPayment(req: Request, res: Response) {
  try {
    const data = createEscrowSchema.parse(req.body);
    
    const result = await blockchainService.createEscrowPayment(
      data.orderId,
      data.supplier,
      data.amount,
      data.paymentType,
      data.milestoneNumber,
      data.totalMilestones,
      data.description
    );
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Failed to create escrow payment', 
        details: result.error 
      });
    }
    
    res.json({
      success: true,
      txHash: result.txHash,
      message: 'Escrow payment created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('Error creating escrow payment:', error);
      res.status(500).json({ error: 'Failed to create escrow payment' });
    }
  }
}

/**
 * Release an escrow payment
 */
export async function releaseEscrowPayment(req: Request, res: Response) {
  try {
    const data = releaseEscrowSchema.parse(req.body);
    
    const result = await blockchainService.releaseEscrowPayment(data.paymentId);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Failed to release escrow payment', 
        details: result.error 
      });
    }
    
    res.json({
      success: true,
      txHash: result.txHash,
      message: 'Escrow payment released successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('Error releasing escrow payment:', error);
      res.status(500).json({ error: 'Failed to release escrow payment' });
    }
  }
}

/**
 * Get details of an escrow payment
 */
export async function getPaymentDetails(req: Request, res: Response) {
  try {
    const paymentId = parseInt(req.params.paymentId);
    
    if (isNaN(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }
    
    const result = await blockchainService.getPaymentDetails(paymentId);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Failed to get payment details', 
        details: result.error 
      });
    }
    
    res.json(result.payment);
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({ error: 'Failed to get payment details' });
  }
}

/**
 * Get payments by order ID
 */
export async function getPaymentsByOrderId(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const result = await blockchainService.getPaymentsByOrderId(orderId);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Failed to get payments by order ID', 
        details: result.error 
      });
    }
    
    res.json({ paymentIds: result.paymentIds });
  } catch (error) {
    console.error('Error getting payments by order ID:', error);
    res.status(500).json({ error: 'Failed to get payments by order ID' });
  }
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(req: Request, res: Response) {
  try {
    const address = req.params.address;
    
    if (!address || address.length !== 42 || !address.startsWith('0x')) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }
    
    const result = await blockchainService.getTokenBalance(address);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Failed to get token balance', 
        details: result.error 
      });
    }
    
    res.json({ address, balance: result.balance });
  } catch (error) {
    console.error('Error getting token balance:', error);
    res.status(500).json({ error: 'Failed to get token balance' });
  }
}

/**
 * Register blockchain API routes
 */
export function registerBlockchainRoutes(app: Express) {
  // Blockchain status
  app.get('/api/blockchain/status', getBlockchainStatus);
  
  // Token balance
  app.get('/api/blockchain/token/balance/:address', getTokenBalance);
  
  // Escrow payments
  app.post('/api/blockchain/escrow/create', createEscrowPayment);
  app.post('/api/blockchain/escrow/release', releaseEscrowPayment);
  app.get('/api/blockchain/escrow/payment/:paymentId', getPaymentDetails);
  app.get('/api/blockchain/escrow/order/:orderId', getPaymentsByOrderId);
}