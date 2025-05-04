import { Request, Response } from "express";
import { z } from "zod";
import { db } from "@db";
import { paymentsService } from "../services/payments-service";
import { kredxService } from "../services/kredx-service";
import { insertMilestonePaymentSchema } from "@shared/schema";

/**
 * Payments Controller
 * Handles all payment-related API endpoints
 */
class PaymentsController {
  
  /**
   * Get user wallet
   */
  async getWallet(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      
      const wallet = await paymentsService.getWallet(userId);
      
      // Add additional wallet data for the frontend
      const walletResponse = {
        ...wallet,
        balance_inr: parseFloat(wallet.balance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
        escrow_balance_inr: parseFloat(wallet.escrowBalance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
        usdc_balance: (parseFloat(wallet.balance) / 83).toFixed(2), // Mock USDC conversion
        recentDeposits: {
          count: 3,
          total: 45000
        },
        recentWithdrawals: {
          count: 1,
          total: 20000
        }
      };
      
      res.json(walletResponse);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  }
  
  /**
   * Get wallet transactions
   */
  async getTransactions(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      
      const transactions = await paymentsService.getTransactions(userId);
      
      res.json({ transactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  }
  
  /**
   * Add funds to wallet
   */
  async addFunds(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      
      const transaction = await paymentsService.addFunds(userId, req.body);
      
      res.status(201).json({
        message: "Funds added successfully",
        transaction
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error adding funds:", error);
      res.status(500).json({ message: error.message || "Failed to add funds" });
    }
  }
  
  /**
   * Withdraw funds from wallet
   */
  async withdrawFunds(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      
      const transaction = await paymentsService.withdrawFunds(userId, req.body);
      
      res.status(201).json({
        message: "Funds withdrawn successfully",
        transaction
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error withdrawing funds:", error);
      res.status(500).json({ message: error.message || "Failed to withdraw funds" });
    }
  }
  
  /**
   * Create escrow payment
   */
  async createEscrow(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      
      const transaction = await paymentsService.createEscrow(userId, req.body);
      
      res.status(201).json({
        message: "Escrow payment created successfully",
        transaction
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating escrow payment:", error);
      res.status(500).json({ message: error.message || "Failed to create escrow payment" });
    }
  }
  
  /**
   * Release escrow payment
   */
  async releaseEscrow(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      const { id } = req.params;
      
      const transaction = await paymentsService.releaseEscrow(userId, parseInt(id));
      
      res.status(201).json({
        message: "Escrow payment released successfully",
        transaction
      });
    } catch (error) {
      console.error("Error releasing escrow payment:", error);
      res.status(500).json({ message: error.message || "Failed to release escrow payment" });
    }
  }
  
  /**
   * Get invoices
   */
  async getInvoices(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      
      const invoices = await paymentsService.getInvoices(userId);
      
      res.json({ invoices });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  }
  
  /**
   * Create invoice
   */
  async createInvoice(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      
      const invoice = await paymentsService.createInvoice(userId, req.body);
      
      res.status(201).json({
        message: "Invoice created successfully",
        invoice
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: error.message || "Failed to create invoice" });
    }
  }
  
  /**
   * Discount invoice via KredX
   */
  async discountInvoice(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      const { id } = req.params;
      
      const invoice = await paymentsService.discountInvoice(userId, parseInt(id));
      
      res.json({
        message: "Invoice discounted successfully via KredX",
        invoice
      });
    } catch (error) {
      console.error("Error discounting invoice:", error);
      res.status(500).json({ message: error.message || "Failed to discount invoice" });
    }
  }
  
  /**
   * Get KredX integration status
   */
  async getKredxStatus(req: Request, res: Response) {
    try {
      // Use the dedicated KredX service for current status
      const isConfigured = await kredxService.isConfigured();
      
      // If KredX API is configured, get the detailed account status
      if (isConfigured) {
        const accountStatus = await kredxService.getAccountStatus();
        res.json({
          ...accountStatus,
          isConfigured
        });
      } else {
        // If not configured, return basic status
        res.json({
          integrated: false,
          isConfigured: false,
          message: "KredX API credentials not configured"
        });
      }
    } catch (error) {
      console.error("Error getting KredX status:", error);
      res.status(500).json({ message: "Failed to get KredX status" });
    }
  }

  /**
   * Get milestone payments for a user (as buyer)
   */
  async getMilestonePayments(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      
      const milestonePayments = await paymentsService.getMilestonePayments(userId);
      
      res.json({ milestonePayments });
    } catch (error) {
      console.error("Error fetching milestone payments:", error);
      res.status(500).json({ message: "Failed to fetch milestone payments" });
    }
  }

  /**
   * Get milestone payments for a specific RFQ
   */
  async getRfqMilestonePayments(req: Request, res: Response) {
    try {
      const { rfqId } = req.params;
      
      if (!rfqId || isNaN(parseInt(rfqId))) {
        return res.status(400).json({ message: "Valid RFQ ID is required" });
      }
      
      const milestonePayments = await paymentsService.getRfqMilestonePayments(parseInt(rfqId));
      
      res.json({ milestonePayments });
    } catch (error) {
      console.error("Error fetching RFQ milestone payments:", error);
      res.status(500).json({ message: "Failed to fetch RFQ milestone payments" });
    }
  }

  /**
   * Create a new milestone payment
   */
  async createMilestonePayment(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      
      // Validate the request body using the schema
      const validatedData = insertMilestonePaymentSchema.parse({
        ...req.body,
        userId // Set the userId from authentication
      });
      
      const milestonePayment = await paymentsService.createMilestonePayment(validatedData);
      
      res.status(201).json({
        message: "Milestone payment created successfully",
        milestonePayment
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating milestone payment:", error);
      res.status(500).json({ message: error.message || "Failed to create milestone payment" });
    }
  }

  /**
   * Approve a milestone payment (by buyer)
   */
  async approveMilestonePayment(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: "Valid milestone payment ID is required" });
      }
      
      const milestonePayment = await paymentsService.approveMilestonePayment(parseInt(id), userId);
      
      res.json({
        message: "Milestone payment approved successfully",
        milestonePayment
      });
    } catch (error) {
      console.error("Error approving milestone payment:", error);
      res.status(500).json({ message: error.message || "Failed to approve milestone payment" });
    }
  }

  /**
   * Release a milestone payment to the supplier (after approval)
   */
  async releaseMilestonePayment(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID
      const userId = 1; // Mock user ID
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: "Valid milestone payment ID is required" });
      }
      
      const milestonePayment = await paymentsService.releaseMilestonePayment(parseInt(id), userId);
      
      res.json({
        message: "Milestone payment released successfully",
        milestonePayment
      });
    } catch (error) {
      console.error("Error releasing milestone payment:", error);
      res.status(500).json({ message: error.message || "Failed to release milestone payment" });
    }
  }

  /**
   * Get a supplier's milestone payments
   */
  async getSupplierMilestonePayments(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;
      
      if (!supplierId || isNaN(parseInt(supplierId))) {
        return res.status(400).json({ message: "Valid supplier ID is required" });
      }
      
      const milestonePayments = await paymentsService.getSupplierMilestonePayments(parseInt(supplierId));
      
      res.json({ milestonePayments });
    } catch (error) {
      console.error("Error fetching supplier milestone payments:", error);
      res.status(500).json({ message: "Failed to fetch supplier milestone payments" });
    }
  }
  
  /**
   * Request early payment for a milestone through KredX financing
   */
  async requestEarlyMilestonePayment(req: Request, res: Response) {
    try {
      // In a real implementation, this would use the authenticated user ID (supplier)
      const supplierId = req.body.supplierId || 1;
      const { milestoneId } = req.params;
      
      if (!milestoneId || isNaN(parseInt(milestoneId))) {
        return res.status(400).json({ message: "Valid milestone payment ID is required" });
      }
      
      // Check if KredX integration is available
      const isKredxConfigured = await kredxService.isConfigured();
      if (!isKredxConfigured) {
        return res.status(400).json({ 
          message: "KredX integration is not configured, cannot process early payment" 
        });
      }
      
      // Get milestone payment details
      const milestone = await paymentsService.getMilestonePaymentById(parseInt(milestoneId));
      if (!milestone) {
        return res.status(404).json({ message: "Milestone payment not found" });
      }
      
      if (milestone.status !== 'approved') {
        return res.status(400).json({ 
          message: "Only approved milestone payments can be processed for early payment" 
        });
      }
      
      // Request early payment through KredX
      const result = await kredxService.requestEarlyPayment({
        milestoneId: parseInt(milestoneId),
        amount: parseFloat(milestone.amount.toString()),
        dueDate: milestone.dueDate.toISOString(),
        buyerId: milestone.userId,
        supplierId: supplierId,
        description: `Early payment for milestone #${milestoneId} - ${milestone.title || 'Untitled'}`
      });
      
      res.json({
        message: "Early payment request processed successfully",
        result,
        discountRate: "5%",
        estimatedPaymentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        referenceId: result.invoice.kredxReferenceId
      });
    } catch (error) {
      console.error("Error requesting early milestone payment:", error);
      res.status(500).json({ message: error.message || "Failed to process early payment request" });
    }
  }
}

// Singleton instance
export const paymentsController = new PaymentsController();