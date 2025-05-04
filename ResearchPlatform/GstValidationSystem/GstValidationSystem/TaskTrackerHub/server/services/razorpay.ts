import { log } from "../vite";
import type { Payment } from "@shared/schema";

export interface RazorpayPaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  created_at: number;
}

export interface EscrowWalletResponse {
  id: string;
  entity: string;
  balance: number;
  currency: string;
}

export class RazorpayService {
  private apiKey: string;
  private apiSecret: string;
  private isInitialized: boolean;
  
  constructor() {
    this.apiKey = process.env.RAZORPAY_API_KEY || "";
    this.apiSecret = process.env.RAZORPAY_API_SECRET || "";
    this.isInitialized = !!this.apiKey && !!this.apiSecret;
    
    if (!this.isInitialized) {
      log("Warning: RazorpayX API keys not set. Wallet functionality will be simulated.", "razorpay");
    }
  }
  
  /**
   * Creates an escrow wallet for the user
   * @param userId User ID for whom to create the wallet
   * @returns Wallet ID or simulated data if API keys not set
   */
  async createEscrowWallet(userId: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        // Return a simulated wallet ID when API not configured
        return `simulated_wallet_${userId}_${Date.now()}`;
      }
      
      const url = "https://api.razorpay.com/v1/wallets";
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `Bell24h Escrow for User ${userId}`,
          description: "Escrow wallet for Bell24h marketplace transactions",
          customer_id: userId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`RazorpayX API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      return data.id;
    } catch (error) {
      log(`Error creating escrow wallet: ${error}`, "razorpay");
      throw error;
    }
  }
  
  /**
   * Gets wallet balance for a user
   * @param walletId Wallet ID to check
   * @returns Wallet balance details
   */
  async getWalletBalance(walletId: string): Promise<EscrowWalletResponse> {
    try {
      if (!this.isInitialized) {
        // Return simulated wallet data
        return {
          id: walletId,
          entity: "wallet",
          balance: 250000, // ₹2,50,000
          currency: "INR"
        };
      }
      
      const url = `https://api.razorpay.com/v1/wallets/${walletId}`;
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`RazorpayX API error: ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      log(`Error fetching wallet balance: ${error}`, "razorpay");
      throw error;
    }
  }
  
  /**
   * Creates a milestone payment
   * @param payment Payment details
   * @returns Payment ID from Razorpay
   */
  async createMilestonePayment(payment: Omit<Payment, "id" | "createdAt" | "razorpayPaymentId">): Promise<string> {
    try {
      if (!this.isInitialized) {
        // Return a simulated payment ID
        return `simulated_payment_${Date.now()}`;
      }
      
      const url = "https://api.razorpay.com/v1/payments";
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Number(payment.amount) * 100, // Convert to paisa
          currency: "INR",
          description: `Milestone ${payment.milestoneNumber} of ${payment.milestoneTotal} for RFQ #${payment.rfqId}`,
          customer_id: payment.userId.toString(),
          notes: {
            "rfq_id": payment.rfqId.toString(),
            "milestone_number": payment.milestoneNumber?.toString() || "1",
            "milestone_total": payment.milestoneTotal?.toString() || "1",
            "supplier_id": payment.supplierId.toString()
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`RazorpayX API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      return data.id;
    } catch (error) {
      log(`Error creating milestone payment: ${error}`, "razorpay");
      throw error;
    }
  }
  
  /**
   * Gets payment details by ID
   * @param paymentId Payment ID to fetch
   * @returns Payment details
   */
  async getPayment(paymentId: string): Promise<RazorpayPaymentDetails> {
    try {
      if (!this.isInitialized) {
        // Return simulated payment data
        return {
          id: paymentId,
          amount: 75000 * 100, // ₹75,000 in paisa
          currency: "INR",
          status: "created",
          method: "wallet",
          created_at: Math.floor(Date.now() / 1000)
        };
      }
      
      const url = `https://api.razorpay.com/v1/payments/${paymentId}`;
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`RazorpayX API error: ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      log(`Error fetching payment: ${error}`, "razorpay");
      throw error;
    }
  }
}

// Create singleton instance
export const razorpayService = new RazorpayService();
