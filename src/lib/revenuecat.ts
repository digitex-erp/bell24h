import { Purchases } from '@revenuecat/purchases-js';

/**
 * Bell24H RevenueCat Configuration
 * 
 * Handles subscription management for B2B marketplace
 * Cross-platform support (web, mobile, desktop)
 * Integration with CRM systems and analytics
 */

// RevenueCat API Keys (use public keys for client-side)
const REVENUECAT_CONFIG = {
  development: {
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY_DEV || 'rc_undefined_dev',
    appUserID: undefined // Let RevenueCat generate anonymous IDs
  },
  production: {
    apiKey: process.env.NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY_PROD || 'rc_undefined_prod',
    appUserID: undefined
  }
};

// Bell24H Subscription Plans
export const BELL24H_PLANS = {
  FREE: {
    identifier: 'bell24h_free',
    displayName: 'Free',
    features: [
      '3 RFQs per month',
      'Basic supplier matching',
      'Email support',
      'Standard analytics'
    ],
    limits: {
      rfqsPerMonth: 3,
      suppliersPerRfq: 5,
      storageGB: 1
    },
    price: 0,
    currency: 'INR'
  },
  
  STARTER: {
    identifier: 'bell24h_starter_monthly',
    displayName: 'Starter',
    features: [
      '25 RFQs per month',
      'AI-powered matching',
      'Voice RFQ processing',
      'Priority support',
      'Advanced analytics',
      'API access (limited)'
    ],
    limits: {
      rfqsPerMonth: 25,
      suppliersPerRfq: 15,
      storageGB: 10,
      apiCallsPerMonth: 1000
    },
    price: 999, // ₹999/month
    currency: 'INR',
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID
  },
  
  PRO: {
    identifier: 'bell24h_pro_monthly',
    displayName: 'Pro',
    features: [
      'Unlimited RFQs',
      'Advanced AI matching',
      'Voice & video RFQ processing',
      'Dedicated account manager',
      'Custom AI models',
      'Full API access',
      'White-label options',
      'Priority supplier verification'
    ],
    limits: {
      rfqsPerMonth: -1, // Unlimited
      suppliersPerRfq: -1, // Unlimited
      storageGB: 100,
      apiCallsPerMonth: 10000
    },
    price: 2999, // ₹2,999/month
    currency: 'INR',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID
  },
  
  ENTERPRISE: {
    identifier: 'bell24h_enterprise_yearly',
    displayName: 'Enterprise',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated infrastructure',
      '24/7 phone support',
      'Custom compliance',
      'SLA guarantees',
      'White-glove onboarding',
      'Custom reporting'
    ],
    limits: {
      rfqsPerMonth: -1, // Unlimited
      suppliersPerRfq: -1, // Unlimited
      storageGB: -1, // Unlimited
      apiCallsPerMonth: -1 // Unlimited
    },
    price: 299999, // ₹2,99,999/year (~₹25,000/month)
    currency: 'INR',
    billingPeriod: 'yearly'
  }
};

// Plan hierarchy for upgrades/downgrades
export const PLAN_HIERARCHY = [
  BELL24H_PLANS.FREE.identifier,
  BELL24H_STRIPE_PLANS.STARTER.identifier,
  BELL24H_STRIPE_PLANS.PRO.identifier,
  BELL24H_STRIPE_PLANS.ENTERPRISE.identifier
];

// RevenueCat configuration
export class RevenueCatClient {
  private purchases: Purchases;
  private environment: 'development' | 'production';

  constructor(environment: 'development' | 'production' = 'development') {
    this.environment = environment;
    const config = REVENUECAT_CONFIG[environment];
    
    this.purchases = Purchases.configure({
      apiKey: config.apiKey,
      appUserID: config.appUserID,
      // Enable additional features
      observerMode: false,
      userDefaultsSuiteName: 'bell24h_preferences'
    });
  }

  /**
   * Get current subscriber info
   */
  async getSubscriberInfo(userId?: string) {
    try {
      if (userId) {
        await this.purchases.logIn(userId);
      }
      
      const customerInfo = await this.purchases.getCustomerInfo();
      return this.parseCustomerInfo(customerInfo);
    } catch (error) {
      console.error('RevenueCat: Error getting subscriber info:', error);
      throw error;
    }
  }

  /**
   * Get available products/packages
   */
  async getProducts() {
    try {
      const offerings = await this.purchases.getOfferings();
      return this.parseOfferings(offerings);
    } catch (error) {
      console.error('RevenueCat: Error getting products:', error);
      throw error;
    }
  }

  /**
   * Purchase a subscription
   */
  async purchaseSubscription(packageId: string, userId?: string) {
    try {
      if (userId) {
        await this.purchases.logIn(userId);
      }
      
      const { customerInfo } = await this.purchases.purchasePackage(packageId);
      return this.parseCustomerInfo(customerInfo);
    } catch (error) {
      console.error('RevenueCat: Error purchasing subscription:', error);
      throw error;
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases() {
    try {
      const customerInfo = await this.purchases.restorePurchases();
      return this.parseCustomerInfo(customerInfo);
    } catch (error) {
      console.error('RevenueCat: Error restoring purchases:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId?: string): Promise<boolean> {
    try {
      const subscriberInfo = await this.getSubscriberInfo(userId);
      return subscriberInfo.hasActiveSubscription;
    } catch (error) {
      console.error('RevenueCat: Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Get user's current plan details
   */
  async getCurrentPlan(userId?: string) {
    try {
      const subscriberInfo = await this.getSubscriberInfo(userId);
      return subscriberInfo.currentPlan;
    } catch (error) {
      console.error('RevenueCat: Error getting current plan:', error);
      return BELL24H_PLANS.FREE;
    }
  }

  /**
   * Check RFQ limits for user
   */
  async canCreateRFQ(userId: string): Promise<{ allowed: boolean; limit: number; used: number; remaining: number }> {
    try {
      const currentPlan = await this.getCurrentPlan(userId);
      const subscriberInfo = await this.getSubscriberInfo(userId);
      
      const limit = currentPlan.limits.rfqsPerMonth;
      const used = subscriberInfo.usage?.rfqsThisMonth || 0;
      const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
      
      return {
        allowed: limit === -1 || remaining > 0,
        limit,
        used,
        remaining
      };
    } catch (error) {
      console.error('RevenueCat: Error checking RFQ limits:', error);
      return {
        allowed: true, // Default to allowing in case of error
        limit: 3,
        used: 0,
        remaining: 3
      };
    }
  }

  /**
   * Track RFQ creation (for usage analytics)
   */
  async trackRFQCreation(userId: string, rfqId: string) {
    try {
      // This would typically be tracked in your database
      // RevenueCat can handle this through custom attributes if needed
      console.log(`RevenueCat: Tracked RFQ creation for user ${userId}, RFQ ${rfqId}`);
    } catch (error) {
      console.error('RevenueCat: Error tracking RFQ creation:', error);
    }
  }

  /**
   * Parse customer info from RevenueCat response
   */
  private parseCustomerInfo(customerInfo: any) {
    const activeSubscriptions = customerInfo.activeSubscriptions || [];
    const hasActiveSubscription = activeSubscriptions.length > 0;
    
    let currentPlan = BELL24H_PLANS.FREE;
    let subscriptionStatus = 'free';
    
    if (hasActiveSubscription) {
      const subscriptionId = activeSubscriptions[0];
      currentPlan = Object.values(BELL24H_PLANS).find(plan => 
        plan.identifier === subscriptionId
      ) || BELL24H_PLANS.FREE;
      
      subscriptionStatus = 'active';
    }

    return {
      hasActiveSubscription,
      currentPlan,
      subscriptionStatus,
      expirationDate: customerInfo.latestExpirationDate,
      originalAppUserId: customerInfo.originalAppUserId,
      managementURL: customerInfo.managementURL,
      usage: {
        rfqsThisMonth: 0, // This would come from your database
        apiCallsThisMonth: 0,
        storageUsedGB: 0
      }
    };
  }

  /**
   * Parse offerings from RevenueCat response
   */
  private parseOfferings(offerings: any) {
    const packages = offerings.current?.availablePackages || [];
    
    return packages.map((pkg: any) => ({
      identifier: pkg.identifier,
      displayName: pkg.packageType,
      product: {
        identifier: pkg.product.identifier,
        displayName: pkg.product.displayName,
        price: pkg.product.price,
        currency: pkg.product.currency
      },
      offeringId: offerings.current?.identifier
    }));
  }
}

// Singleton instance
let revenueCatClient: RevenueCatClient | null = null;

export function getRevenueCatClient(environment?: 'development' | 'production'): RevenueCatClient {
  if (!revenueCatClient) {
    revenueCatClient = new RevenueCatClient(environment);
  }
  return revenueCatClient;
}

export default RevenueCatClient;