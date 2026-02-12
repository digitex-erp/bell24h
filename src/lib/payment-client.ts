// Payment Client for Bell24H
// Handles all payment-related operations including Razorpay integration

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  razorpayKey: string;
  planDetails?: {
    planId: string;
    planName: string;
    price: number;
    currency: string;
  };
}

export interface PaymentVerification {
  success: boolean;
  message: string;
  payment?: {
    id: string;
    orderId: string;
    status: string;
    amount: number;
    completedAt?: Date;
  };
}

export interface PaymentStatus {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  paymentMethod?: string;
  escrowEnabled: boolean;
  escrowReleasedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  rfq?: {
    id: number;
    title: string;
    description: string;
  };
}

export interface CreateOrderParams {
  amount: number;
  userId: string;
  rfqId?: number;
  planId?: string;
  planName?: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
  userId: string;
}

export class PaymentClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  }

  /**
   * Create a new payment order
   */
  async createOrder(params: CreateOrderParams): Promise<{
    success: boolean;
    order?: PaymentOrder;
    payment?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create order',
        };
      }

      return {
        success: true,
        order: data.order,
        payment: data.payment,
      };
    } catch (error) {
      console.error('Create order error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Verify payment after Razorpay checkout
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerification> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Payment verification failed',
        };
      }

      return {
        success: true,
        message: data.message,
        payment: data.payment,
      };
    } catch (error) {
      console.error('Verify payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId?: string, orderId?: string): Promise<{
    success: boolean;
    payment?: PaymentStatus;
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (paymentId) params.append('paymentId', paymentId);
      if (orderId) params.append('orderId', orderId);

      const response = await fetch(`${this.baseUrl}/api/payments/status?${params}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to get payment status',
        };
      }

      return {
        success: true,
        payment: data.payment,
      };
    } catch (error) {
      console.error('Get payment status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Initialize Razorpay checkout
   */
  initializeRazorpayCheckout(order: PaymentOrder, options: {
    onSuccess: (response: any) => void;
    onError?: (error: any) => void;
    onClose?: () => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Razorpay can only be initialized in browser'));
        return;
      }

      // @ts-ignore - Razorpay is loaded via script
      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      const razorpayOptions = {
        key: order.razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'Bell24h',
        description: 'India\'s Fastest B2B Match-Making Engine',
        image: '/logo.png',
        order_id: order.id,
        handler: (response: any) => {
          options.onSuccess(response);
          resolve(response);
        },
        prefill: options.prefill || {},
        theme: {
          color: '#6366f1', // Indigo color matching Bell24h theme
        },
        notes: {
          order_id: order.orderId,
          platform: 'bell24h',
        },
        modal: {
          ondismiss: () => {
            if (options.onClose) {
              options.onClose();
            }
            reject(new Error('Payment cancelled by user'));
          },
        },
      };

      const razorpay = new Razorpay(razorpayOptions);
      
      if (options.onError) {
        razorpay.on('payment.error', options.onError);
      }

      razorpay.open();
    });
  }

  /**
   * Complete payment flow
   */
  async completePaymentFlow(
    params: CreateOrderParams,
    options: {
      onSuccess?: (result: PaymentVerification) => void;
      onError?: (error: string) => void;
      onClose?: () => void;
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
    } = {}
  ): Promise<PaymentVerification> {
    try {
      // Step 1: Create order
      const createResult = await this.createOrder(params);
      if (!createResult.success || !createResult.order) {
        const error = createResult.error || 'Failed to create order';
        if (options.onError) options.onError(error);
        return { success: false, message: error };
      }

      // Step 2: Initialize Razorpay checkout
      const razorpayResponse = await this.initializeRazorpayCheckout(
        createResult.order,
        {
          onSuccess: async (response) => {
            // Step 3: Verify payment
            const verificationResult = await this.verifyPayment({
              orderId: createResult.payment.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId: params.userId,
            });

            if (options.onSuccess) {
              options.onSuccess(verificationResult);
            }

            return verificationResult;
          },
          onError: options.onError,
          onClose: options.onClose,
          prefill: options.prefill,
        }
      );

      // This should not be reached if payment is successful
      return {
        success: false,
        message: 'Payment flow interrupted',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment flow failed';
      if (options.onError) options.onError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}

// Export singleton instance
export const paymentClient = new PaymentClient();

// Export types
export type {
  PaymentOrder,
  PaymentVerification,
  PaymentStatus,
  CreateOrderParams,
  VerifyPaymentParams,
};