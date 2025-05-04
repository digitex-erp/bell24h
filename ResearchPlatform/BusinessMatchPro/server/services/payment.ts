
import Razorpay from 'razorpay';

export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn('Warning: Razorpay API keys not found. Payment features will be disabled.');
      return;
    }
    
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  async createOrder(amount: number, currency: string = 'INR') {
    try {
      if (!this.razorpay) {
        throw new Error('Razorpay not initialized');
      }

      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: `order_${Date.now()}`
      });
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    try {
      if (!this.razorpay || !process.env.RAZORPAY_WEBHOOK_SECRET) {
        throw new Error('Razorpay not properly configured');
      }

      const generated_signature = this.razorpay.webhooks.generateSignature(
        orderId + "|" + paymentId,
        process.env.RAZORPAY_WEBHOOK_SECRET
      );
      return generated_signature === signature;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
}
