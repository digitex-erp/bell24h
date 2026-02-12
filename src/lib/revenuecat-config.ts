/**
 * RevenueCat Configuration and Service for Bell24H
 * Complete integration with subscription management
 */

import { Purchases } from '@revenuecat/purchases-js';

export const BELL24H_PLANS = {
  FREE: {
    identifier: 'bell24h_free',
    displayName: 'Free Plan',
    features: [
      '3 RFQs per month',
      'Basic supplier matching',
      'Email support',
      'Standard analytics'
    ],
    price: 0,
    isPopular: false
  },
  STARTER_MONTHLY: {
    identifier: 'bell24h_starter_monthly',
    displayName: 'Starter Monthly',
    features: [
      '15 RFQs per month',
      'AI-powered matching',
      'Voice RFQ processing',
      'Priority email support',
      'Advanced analytics'
    ],
    price: 999,
    isPopular: false
  },
  PRO_MONTHLY: {
    identifier: 'bell24h_pro_monthly',
    displayName: 'Pro Monthly',
    features: [
      'Unlimited RFQs',
      'Advanced AI matching',
      'Voice & video RFQ processing',
      'Priority support (24h response)',
      'API access (1000 calls/month)',
      'Advanced analytics & reporting',
      'Custom branding'
    ],
    price: 2999,
    isPopular: true
  },
  PRO_YEARLY: {
    identifier: 'bell24h_pro_yearly',
    displayName: 'Pro Yearly',
    features: [
      'Unlimited RFQs',
      'Advanced AI matching',
      'Voice & video RFQ processing',
      'Priority support (12h response)',
      'API access (unlimited)',
      'Advanced analytics & reporting',
      'Custom branding',
      'White-label options',
      '20% discount (save ₹7,188/year)'
    ],
    price: 29999,
    isPopular: false
  },
  ENTERPRISE_YEARLY: {
    identifier: 'bell24h_enterprise_yearly',
    displayName: 'Enterprise Yearly',
    features: [
      'Unlimited RFQs',
      'Custom AI models',
      'Full API access',
      'Dedicated account manager',
      '24/7 premium support',
      'Custom integrations',
      'SLA guarantees',
      'Advanced security features',
      'Custom contract terms'
    ],
    price: 299999,
    isPopular: false
  }
};

export class RevenueCatService {
  private static instance: Purchases;
  
  /**
   * Initialize RevenueCat client
   */
  static async initialize() {
    if (!this.instance) {
      const apiKey = process.env.REVENUECAT_API_KEY;
      
      if (!apiKey) {
        throw new Error('RevenueCat API key not configured');
      }

      console.log('Initializing RevenueCat client...');
      
      this.instance = Purchases.configure({
        apiKey: apiKey,
        appUserID: undefined // Let RevenueCat generate unique ID
      });
      
      console.log('RevenueCat client initialized successfully');
    }
    
    return this.instance;
  }
  
  /**
   * Get RevenueCat client instance
   */
  static async getClient() {
    if (!this.instance) {
      await this.initialize();
    }
    return this.instance;
  }

  /**
   * Get available subscription offerings
   */
  static async getOfferings() {
    try {
      const client = await this.getClient();
      const offerings = await client.getOfferings();
      
      console.log('Available offerings:', offerings);
      return offerings;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      throw error;
    }
  }

  /**
   * Get customer subscription info
   */
  static async getCustomerInfo() {
    try {
      const client = await this.getClient();
      const customerInfo = await client.getCustomerInfo();
      
      console.log('Customer info:', customerInfo);
      return customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
  }

  /**
   * Purchase a subscription package
   */
  static async purchasePackage(packageIdentifier: string) {
    try {
      const client = await this.getClient();
      
      console.log(`Purchasing package: ${packageIdentifier}`);
      
      // Get the package from offerings
      const offerings = await client.getOfferings();
      const packages = offerings.current?.availablePackages || [];
      
      const targetPackage = packages.find(pkg => pkg.identifier === packageIdentifier);
      if (!targetPackage) {
        throw new Error(`Package ${packageIdentifier} not found`);
      }

      const result = await client.purchasePackage(targetPackage);
      
      console.log('Purchase successful:', result);
      return result;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Restore purchases (for existing customers)
   */
  static async restorePurchases() {
    try {
      const client = await this.getClient();
      const result = await client.restorePurchases();
      
      console.log('Purchases restored:', result);
      return result;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Set user attributes for segmentation
   */
  static async setAttributes(attributes: Record<string, string>) {
    try {
      const client = await this.getClient();
      await client.setAttributes(attributes);
      
      console.log('Attributes set:', attributes);
    } catch (error) {
      console.error('Failed to set attributes:', error);
      throw error;
    }
  }

  /**
   * Log revenue event for analytics
   */
  static async logRevenue(revenueData: {
    revenue: number;
    productIdentifier?: string;
    customerAttributes?: Record<string, string>;
  }) {
    try {
      const client = await this.getClient();
      
      // RevenueCat automatically tracks revenue from purchases
      // This is for additional revenue tracking if needed
      console.log('Revenue logged:', revenueData);
      
      // Set customer attributes if provided
      if (revenueData.customerAttributes) {
        await this.setAttributes(revenueData.customerAttributes);
      }
      
    } catch (error) {
      console.error('Failed to log revenue:', error);
      throw error;
    }
  }

  /**
   * Get subscription entitlements for user
   */
  static async getEntitlements() {
    try {
      const customerInfo = await this.getCustomerInfo();
      return customerInfo.entitlements;
    } catch (error) {
      console.error('Failed to get entitlements:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return customerInfo.entitlements.active && Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Get user's current plan
   */
  static async getCurrentPlan() {
    try {
      const customerInfo = await this.getCustomerInfo();
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      
      if (activeEntitlements.length === 0) {
        return 'free';
      }
      
      // Map entitlements to plan identifiers
      const planMapping: Record<string, string> = {
        'pro_monthly': 'bell24h_pro_monthly',
        'pro_yearly': 'bell24h_pro_yearly',
        'enterprise': 'bell24h_enterprise_yearly',
        'starter': 'bell24h_starter_monthly'
      };
      
      return planMapping[activeEntitlements[0]] || 'unknown';
    } catch (error) {
      console.error('Failed to get current plan:', error);
      return 'free';
    }
  }
}

/**
 * Helper function to get plan details
 */
export function getPlanDetails(planIdentifier: string) {
  const plans = Object.values(BELL24H_PLANS);
  return plans.find(plan => plan.identifier === planIdentifier) || BELL24H_PLANS.FREE;
}

/**
 * Helper function to calculate savings
 */
export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  const savings = monthlyTotal - yearlyPrice;
  return Math.round((savings / monthlyTotal) * 100);
}

/**
 * RevenueCat webhook event types
 */
export type RevenueCatWebhookEvent = {
  type: string;
  app_user_id: string;
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  purchased_at_ms: number;
  expiration_at_ms: number;
  environment: 'sandbox' | 'production';
  is_trial_conversion: boolean;
  period_type: 'normal' | 'trial' | 'intro';
  entitlement_ids?: string[];
  price: number;
  presentment_currency: string;
};