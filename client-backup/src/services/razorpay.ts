import * as crypto from 'crypto';

interface RazorpayConfig {
  key_id: string;
  key_secret: string;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

interface RazorpayPayout {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

class RazorpayMock {
  private config: RazorpayConfig;

  constructor(config: RazorpayConfig) {
    this.config = config;
  }

  orders = {
    create: async (options: any): Promise<RazorpayOrder> => {
      return {
        id: `order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt
      };
    }
  };

  payouts = {
    create: async (options: any): Promise<RazorpayPayout> => {
      return {
        id: `payout_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        status: 'processing'
      };
    },
    fetch: async (id: string): Promise<RazorpayPayout> => {
      return {
        id,
        amount: 0,
        currency: 'INR',
        status: 'processed'
      };
    }
  };
}
import { db } from '../server';
import { walletTransactions } from '../db/schema';

class RazorpayService {
  private razorpay: RazorpayMock;

  constructor() {
    this.razorpay = new RazorpayMock({
      key_id: process.env.RAZORPAYX_KEY_ID!,
      key_secret: process.env.RAZORPAYX_KEY_SECRET!
    });
  }

  // Create a new payment order
  async createOrder(amount: number, currency: string = 'INR') {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `order_${Date.now()}`,
      });

      return order;
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw error;
    }
  }

  // Verify payment signature
  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    const body = orderId + '|' + paymentId;
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAYX_KEY_SECRET!);
    hmac.update(body.toString());
    const expectedSignature = hmac.digest('hex');

    return expectedSignature === signature;
  }

  // Create a payout to supplier
  async createPayout(supplierId: number, amount: number, accountId: string) {
    try {
      const payout = await this.razorpay.payouts.create({
        account_number: accountId,
        amount: amount * 100,
        currency: 'INR',
        mode: 'IMPS',
        purpose: 'payout',
        queue_if_low_balance: true,
      });

      // Record transaction
      await db.insert(walletTransactions).values({
        userId: supplierId,
        type: 'payout',
        amount,
        status: 'processing',
        metadata: { payoutId: payout.id }
      });

      return payout;
    } catch (error) {
      console.error('Razorpay payout error:', error);
      throw error;
    }
  }

  // Check payout status
  async getPayoutStatus(payoutId: string) {
    try {
      const payout = await this.razorpay.payouts.fetch(payoutId);
      return payout;
    } catch (error) {
      console.error('Razorpay payout status error:', error);
      throw error;
    }
  }
}

export const razorpayService = new RazorpayService();
