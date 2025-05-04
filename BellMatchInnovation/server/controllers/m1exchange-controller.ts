import { Request, Response } from 'express';
import * as m1exchangeService from '../services/m1exchange-service';

/**
 * M1 Exchange Controller - API handlers for M1 Exchange functionality
 */

/**
 * Check M1 Exchange service status
 * 
 * @param req Request object
 * @param res Response object
 */
export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await m1exchangeService.checkM1ExchangeStatus();
    return res.status(200).json(status);
  } catch (error) {
    console.error('Error checking M1 Exchange status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check M1 Exchange service status',
      error: error.message
    });
  }
};

/**
 * Request early payment for a milestone
 * 
 * @param req Request with milestoneId and supplierId
 * @param res Response object
 */
export const requestEarlyPayment = async (req: Request, res: Response) => {
  try {
    const milestoneId = parseInt(req.params.milestoneId);
    const { supplierId } = req.body;
    
    if (isNaN(milestoneId) || !supplierId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: milestoneId and supplierId'
      });
    }
    
    const result = await m1exchangeService.requestEarlyPayment(milestoneId, supplierId);
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error requesting early payment:', error);
    
    // Determine appropriate status code based on error
    let statusCode = 500;
    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (
      error.message.includes('must be approved') || 
      error.message.includes('already been released')
    ) {
      statusCode = 400;
    }
    
    return res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to request early payment'
    });
  }
};

/**
 * Get transaction details by ID
 * 
 * @param req Request with transactionId
 * @param res Response object
 */
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameter: transactionId'
      });
    }
    
    const transaction = await m1exchangeService.getTransactionById(transactionId);
    
    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Error getting transaction details:', error);
    
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    return res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to retrieve transaction details'
    });
  }
};

/**
 * Get all transactions for a supplier
 * 
 * @param req Request with supplierId
 * @param res Response object
 */
export const getSupplierTransactions = async (req: Request, res: Response) => {
  try {
    const supplierId = parseInt(req.params.supplierId);
    
    if (isNaN(supplierId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid supplier ID'
      });
    }
    
    const transactions = await m1exchangeService.getSupplierTransactions(supplierId);
    
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting supplier transactions:', error);
    
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve supplier transactions'
    });
  }
};

/**
 * Update transaction status
 * 
 * @param req Request with transactionId and status
 * @param res Response object
 */
export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;
    
    if (!transactionId || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: transactionId and status'
      });
    }
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const updatedTransaction = await m1exchangeService.updateTransactionStatus(transactionId, status);
    
    return res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction status:', error);
    
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    return res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to update transaction status'
    });
  }
};

/**
 * Generate payment report
 * 
 * @param req Request with startDate and endDate
 * @param res Response object
 */
export const generatePaymentReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string, endDate: string };
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: startDate and endDate'
      });
    }
    
    // Validate dates
    const isValidDate = (dateStr: string) => !isNaN(Date.parse(dateStr));
    
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Please use ISO format (YYYY-MM-DD)'
      });
    }
    
    const report = await m1exchangeService.generatePaymentReport(startDate, endDate);
    
    return res.status(200).json(report);
  } catch (error) {
    console.error('Error generating payment report:', error);
    
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate payment report'
    });
  }
};

// Export controller object for routes.ts
export const m1exchangeController = {
  getStatus,
  requestEarlyPayment,
  getTransactionById,
  getSupplierTransactions,
  updateTransactionStatus,
  generatePaymentReport
};