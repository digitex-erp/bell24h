import { db } from "../../db";
import { 
  wallets, transactions, invoices, milestonePayments, 
  InsertMilestonePayment 
} from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Define validation schemas
const addFundsSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

const withdrawFundsSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  accountDetails: z.object({
    accountNumber: z.string().min(1, "Account number is required"),
    ifscCode: z.string().min(1, "IFSC code is required"),
    accountName: z.string().min(1, "Account name is required"),
  }),
});

const createEscrowSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  rfqId: z.number().min(1, "RFQ ID is required"),
  supplierId: z.number().min(1, "Supplier ID is required"),
});

const createInvoiceSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  supplierId: z.number().min(1, "Supplier ID is required"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().min(1, "Description is required"),
});

class PaymentsService {
  async getWallet(userId: number) {
    try {
      // In a real implementation, this would query the database
      // const userWallet = await db.query.wallets.findFirst({
      //   where: eq(wallets.userId, userId)
      // });
      
      // Mock wallet data
      const userWallet = {
        id: 1,
        userId,
        balance: "100000",
        escrowBalance: "50000",
        razorpayXId: "acc_123456789",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return userWallet;
    } catch (error) {
      console.error(`Error fetching wallet for user ${userId}:`, error);
      throw new Error("Failed to fetch wallet");
    }
  }
  
  async getTransactions(userId: number) {
    try {
      // In a real implementation, this would query the database to get the
      // wallet ID first, then fetch transactions for that wallet
      
      // Mock transactions data
      const mockTransactions = [
        {
          id: 101,
          walletId: 1,
          amount: "50000",
          type: "deposit",
          status: "completed",
          description: "Initial deposit",
          externalId: "txn_12345",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 102,
          walletId: 1,
          amount: "25000",
          type: "escrow",
          status: "completed",
          description: "Escrow payment for RFQ #1234",
          externalId: "txn_23456",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 103,
          walletId: 1,
          amount: "25000",
          type: "escrow",
          status: "completed",
          description: "Escrow payment for RFQ #5678",
          externalId: "txn_34567",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 104,
          walletId: 1,
          amount: "15000",
          type: "release",
          status: "completed",
          description: "Payment released to supplier for RFQ #1234",
          externalId: "txn_45678",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      return mockTransactions;
    } catch (error) {
      console.error(`Error fetching transactions for user ${userId}:`, error);
      throw new Error("Failed to fetch transactions");
    }
  }
  
  async addFunds(userId: number, data: any) {
    try {
      const validated = addFundsSchema.parse(data);
      
      // In a real implementation, this would query the database, update the wallet,
      // and create a transaction record
      
      // Mock transaction
      const transaction = {
        id: Math.floor(Math.random() * 1000) + 200,
        walletId: 1,
        amount: validated.amount.toString(),
        type: "deposit",
        status: "completed",
        description: `Deposit via ${validated.paymentMethod}`,
        externalId: `txn_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return transaction;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      console.error(`Error adding funds for user ${userId}:`, error);
      throw new Error("Failed to add funds");
    }
  }
  
  async withdrawFunds(userId: number, data: any) {
    try {
      const validated = withdrawFundsSchema.parse(data);
      
      // Check if user has enough funds
      const wallet = await this.getWallet(userId);
      const currentBalance = parseFloat(wallet.balance.toString());
      
      if (validated.amount > currentBalance) {
        throw new Error("Insufficient funds");
      }
      
      // In a real implementation, this would query the database, update the wallet,
      // and create a transaction record
      
      // Mock transaction
      const transaction = {
        id: Math.floor(Math.random() * 1000) + 200,
        walletId: wallet.id,
        amount: validated.amount.toString(),
        type: "withdrawal",
        status: "pending", // Withdrawals typically start in pending state
        description: `Withdrawal to account ${validated.accountDetails.accountNumber}`,
        externalId: `txn_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return transaction;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      console.error(`Error withdrawing funds for user ${userId}:`, error);
      throw new Error(error.message || "Failed to withdraw funds");
    }
  }
  
  async createEscrow(userId: number, data: any) {
    try {
      const validated = createEscrowSchema.parse(data);
      
      // Check if user has enough funds
      const wallet = await this.getWallet(userId);
      const currentBalance = parseFloat(wallet.balance.toString());
      
      if (validated.amount > currentBalance) {
        throw new Error("Insufficient funds");
      }
      
      // In a real implementation, this would query the database, update the wallet,
      // and create a transaction record
      
      // Mock transaction
      const transaction = {
        id: Math.floor(Math.random() * 1000) + 200,
        walletId: wallet.id,
        amount: validated.amount.toString(),
        type: "escrow",
        status: "completed",
        description: `Escrow payment for RFQ #${validated.rfqId} to supplier #${validated.supplierId}`,
        externalId: `txn_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return transaction;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      console.error(`Error creating escrow for user ${userId}:`, error);
      throw new Error(error.message || "Failed to create escrow payment");
    }
  }
  
  async releaseEscrow(userId: number, escrowId: number) {
    try {
      // In a real implementation, this would query the database to check if the
      // escrow exists and belongs to the user, then create a release transaction
      
      // Mock transaction
      const transaction = {
        id: Math.floor(Math.random() * 1000) + 200,
        walletId: 1,
        amount: "25000", // Example amount
        type: "release",
        status: "completed",
        description: `Release of escrow payment #${escrowId}`,
        externalId: `txn_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return transaction;
    } catch (error) {
      console.error(`Error releasing escrow ${escrowId} for user ${userId}:`, error);
      throw new Error("Failed to release escrow payment");
    }
  }
  
  async getInvoices(userId: number) {
    try {
      // In a real implementation, this would query the database
      
      // Mock invoices data
      const mockInvoices = [
        {
          id: 201,
          supplierId: 101,
          buyerId: userId,
          amount: "48000",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          supplier: {
            companyName: "TechPro Solutions",
            location: "Mumbai, India"
          }
        },
        {
          id: 202,
          supplierId: 102,
          buyerId: userId,
          amount: "35000",
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          supplier: {
            companyName: "ElectroIndia Components",
            location: "Pune, India"
          }
        },
        {
          id: 203,
          supplierId: 103,
          buyerId: userId,
          amount: "62000",
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "paid",
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          supplier: {
            companyName: "AutoTech Controls",
            location: "Chennai, India"
          }
        }
      ];
      
      return mockInvoices;
    } catch (error) {
      console.error(`Error fetching invoices for user ${userId}:`, error);
      throw new Error("Failed to fetch invoices");
    }
  }
  
  async createInvoice(userId: number, data: any) {
    try {
      const validated = createInvoiceSchema.parse(data);
      
      // In a real implementation, this would insert into the database
      
      // Mock invoice
      const invoice = {
        id: Math.floor(Math.random() * 1000) + 300,
        supplierId: validated.supplierId,
        buyerId: userId,
        amount: validated.amount.toString(),
        dueDate: new Date(validated.dueDate).toISOString(),
        status: "pending",
        description: validated.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return invoice;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      console.error(`Error creating invoice for user ${userId}:`, error);
      throw new Error("Failed to create invoice");
    }
  }
  
  async discountInvoice(userId: number, invoiceId: number) {
    try {
      // In a real implementation, this would query the database, check if the
      // invoice exists and belongs to the user, then update it with KredX details
      
      // Mock discounted invoice
      const invoice = {
        id: invoiceId,
        supplierId: 101,
        buyerId: userId,
        amount: "48000",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "discounted",
        discountRate: "0.12",
        discountedAmount: "42240", // 48000 - 12%
        kredxReferenceId: `kredx_${Date.now()}`,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return invoice;
    } catch (error) {
      console.error(`Error discounting invoice ${invoiceId} for user ${userId}:`, error);
      throw new Error("Failed to discount invoice");
    }
  }
  
  async getKredxStatus() {
    try {
      // In a real implementation, this would check the KredX API status
      
      // Mock status
      const status = {
        integrated: true,
        lastSyncTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        availableCredit: "1000000",
        totalDiscounted: "350000",
        averageDiscountRate: "0.125"
      };
      
      return status;
    } catch (error) {
      console.error("Error getting KredX status:", error);
      throw new Error("Failed to get KredX status");
    }
  }

  /**
   * Get milestone payments for a user (as buyer)
   */
  async getMilestonePayments(userId: number) {
    try {
      // In a real implementation, this would query the database
      // const userMilestonePayments = await db.query.milestonePayments.findMany({
      //   where: eq(milestonePayments.userId, userId),
      //   with: {
      //     rfq: true,
      //     supplier: true
      //   }
      // });

      // Get the milestone payments from the database
      const milestonePaymentsData = await db.select().from(milestonePayments)
        .where(eq(milestonePayments.userId, userId));
      
      // For a complete implementation, we'd join with suppliers and rfqs tables to get more data
      return milestonePaymentsData;
    } catch (error) {
      console.error(`Error fetching milestone payments for user ${userId}:`, error);
      throw new Error("Failed to fetch milestone payments");
    }
  }

  /**
   * Get milestone payments for a specific RFQ
   */
  async getRfqMilestonePayments(rfqId: number) {
    try {
      // Query the database for milestone payments related to the specific RFQ
      const rfqMilestonePayments = await db.select().from(milestonePayments)
        .where(eq(milestonePayments.rfqId, rfqId));
      
      return rfqMilestonePayments;
    } catch (error) {
      console.error(`Error fetching milestone payments for RFQ ${rfqId}:`, error);
      throw new Error("Failed to fetch RFQ milestone payments");
    }
  }

  /**
   * Create a new milestone payment
   */
  async createMilestonePayment(data: InsertMilestonePayment) {
    try {
      // Create the milestone payment record in the database
      const [newMilestonePayment] = await db.insert(milestonePayments)
        .values({
          ...data,
          status: data.status || "pending", // Default to pending if not provided
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return newMilestonePayment;
    } catch (error) {
      console.error(`Error creating milestone payment:`, error);
      throw new Error("Failed to create milestone payment");
    }
  }

  /**
   * Approve a milestone payment (by buyer)
   */
  async approveMilestonePayment(id: number, userId: number) {
    try {
      // Check if the milestone payment exists and belongs to the user
      const milestonePayment = await db.query.milestonePayments.findFirst({
        where: and(
          eq(milestonePayments.id, id),
          eq(milestonePayments.userId, userId)
        )
      });
      
      if (!milestonePayment) {
        throw new Error("Milestone payment not found or you don't have permission to approve it");
      }
      
      if (milestonePayment.status !== "pending") {
        throw new Error(`Cannot approve milestone payment with status '${milestonePayment.status}'`);
      }
      
      // Update the milestone payment status to approved
      const [updatedMilestonePayment] = await db.update(milestonePayments)
        .set({
          status: "approved",
          approvalDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(milestonePayments.id, id))
        .returning();
      
      return updatedMilestonePayment;
    } catch (error) {
      console.error(`Error approving milestone payment ${id}:`, error);
      throw new Error(error.message || "Failed to approve milestone payment");
    }
  }

  /**
   * Release a milestone payment to the supplier (after approval)
   */
  async releaseMilestonePayment(id: number, userId: number) {
    try {
      // Check if the milestone payment exists and belongs to the user
      const milestonePayment = await db.query.milestonePayments.findFirst({
        where: and(
          eq(milestonePayments.id, id),
          eq(milestonePayments.userId, userId)
        )
      });
      
      if (!milestonePayment) {
        throw new Error("Milestone payment not found or you don't have permission to release it");
      }
      
      if (milestonePayment.status !== "approved") {
        throw new Error(`Cannot release milestone payment with status '${milestonePayment.status}'. Payment must be approved first.`);
      }
      
      // Generate a mock RazorpayX payment ID
      const razorpayPaymentId = `rzp_pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // In a real implementation, we would integrate with RazorpayX to process the payment
      // const paymentResult = await razorpayXClient.createPayout({
      //   account_number: supplierAccountDetails.accountNumber,
      //   amount: milestonePayment.amount * 100, // Convert to paise
      //   currency: "INR",
      //   notes: {
      //     rfqId: milestonePayment.rfqId,
      //     milestoneId: milestonePayment.id,
      //     milestoneName: milestonePayment.title
      //   },
      //   purpose: "payout"
      // });
      
      // Update the milestone payment status to released
      const [updatedMilestonePayment] = await db.update(milestonePayments)
        .set({
          status: "released",
          releaseDate: new Date(),
          razorpayPaymentId,
          updatedAt: new Date()
        })
        .where(eq(milestonePayments.id, id))
        .returning();
      
      return updatedMilestonePayment;
    } catch (error) {
      console.error(`Error releasing milestone payment ${id}:`, error);
      throw new Error(error.message || "Failed to release milestone payment");
    }
  }

  /**
   * Get a supplier's milestone payments
   */
  async getSupplierMilestonePayments(supplierId: number) {
    try {
      // Query the database for milestone payments related to the specific supplier
      const supplierMilestonePayments = await db.select().from(milestonePayments)
        .where(eq(milestonePayments.supplierId, supplierId));
      
      return supplierMilestonePayments;
    } catch (error) {
      console.error(`Error fetching milestone payments for supplier ${supplierId}:`, error);
      throw new Error("Failed to fetch supplier milestone payments");
    }
  }
  
  /**
   * Get a specific milestone payment by ID
   */
  async getMilestonePaymentById(id: number) {
    try {
      // Query the database for the specific milestone payment
      const milestone = await db.query.milestonePayments.findFirst({
        where: eq(milestonePayments.id, id)
      });
      
      if (!milestone) {
        return null;
      }
      
      return milestone;
    } catch (error) {
      console.error(`Error fetching milestone payment ${id}:`, error);
      throw new Error("Failed to fetch milestone payment");
    }
  }
}

// Singleton instance
export const paymentsService = new PaymentsService();