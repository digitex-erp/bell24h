import axios from 'axios';
import { CurrencyService } from './currencyService';

export interface PaymentGatewayConfig {
  stripe: {
    apiKey: string;
    webhookSecret: string;
  };
  paypal: {
    clientId: string;
    secret: string;
  };
  regional: {
    [key: string]: {
      name: string;
      apiKey: string;
      countries: string[];
    };
  };
}

export class PaymentService {
  private readonly baseUrl = process.env.API_BASE_URL || '';
  private readonly currencyService: CurrencyService;
  private readonly config: PaymentGatewayConfig;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
    this.currencyService = new CurrencyService();
  }

  /**
   * Get available payment methods for a country
   */
  async getAvailablePaymentMethods(countryCode: string): Promise<string[]> {
    const methods = ['stripe', 'paypal'];
    
    // Add regional payment methods
    for (const [key, gateway] of Object.entries(this.config.regional)) {
      if (gateway.countries.includes(countryCode)) {
        methods.push(key);
      }
    }

    return methods;
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    paymentMethod: string,
    metadata?: Record<string, string>
  ) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/payments/intent`, {
        amount,
        currency,
        paymentMethod,
        metadata
      });

      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Process payment
   */
  async processPayment(
    paymentMethod: string,
    paymentData: Record<string, any>
  ) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/payments/process`, {
        paymentMethod,
        paymentData
      });

      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(paymentId: string, paymentMethod: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/payments/verify`, {
        paymentId,
        paymentMethod
      });

      return response.data.verified;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/payments/${paymentId}/status`);
      return response.data.status;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Handle payment webhook
   */
  async handleWebhook(
    body: string,
    signature: string,
    paymentMethod: string
  ): Promise<void> {
    try {
      // Verify webhook signature
      const verified = await this.verifyWebhookSignature(body, signature, paymentMethod);
      if (!verified) {
        throw new Error('Invalid webhook signature');
      }

      // Process webhook event
      const event = JSON.parse(body);
      await this.processWebhookEvent(event, paymentMethod);
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  private async verifyWebhookSignature(
    body: string,
    signature: string,
    paymentMethod: string
  ): Promise<boolean> {
    const secret = paymentMethod === 'stripe' 
      ? this.config.stripe.webhookSecret
      : this.config.paypal.secret;

    // Implementation depends on payment gateway
    // This is a placeholder
    return true;
  }

  /**
   * Process webhook event
   */
  private async processWebhookEvent(
    event: any,
    paymentMethod: string
  ): Promise<void> {
    // Implementation depends on payment gateway
    // This is a placeholder
    console.log(`Processing ${paymentMethod} webhook event:`, event.type);
  }
}
