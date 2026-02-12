import { getRevenueCatClient, BELL24H_PLANS } from '@/lib/revenuecat';
import { prisma } from '@/lib/prisma';
import { RevenueCatClient } from '@/lib/revenuecat';

export interface RevenueCatWebhookEvent {
  type: 'INITIAL_PURCHASE' | 'RENEWAL' | 'EXPIRATION' | 'CANCELLATION' | 'PRODUCT_CHANGE' | 'UNCANCELLATION';
  id: string;
  app_user_id: string;
  original_app_user_id: string;
  product_id: string;
  period_type: 'NORMAL' | 'INTRO' | 'TRIAL';
  purchased_at_ms: number;
  expiration_at_ms: number;
  environment: 'SANDBOX' | 'PRODUCTION';
  entitlement_ids?: string[];
  presentment_currency?: string;
  price?: number;
  price_in_purchased_currency?: number;
  takehome_percentage?: number;
  commission_percentage?: number;
  is_family_share?: boolean;
  transaction_id?: string;
  original_transaction_id?: string;
  is_trial_conversion?: boolean;
}

export interface SubscriptionOffering {
  identifier: string;
  serverDescription: string;
  availablePackages: SubscriptionPackage[];
  metadata?: Record<string, any>;
}

export interface SubscriptionPackage {
  identifier: string;
  packageType: 'MONTHLY' | 'ANNUAL' | 'WEEKLY' | 'CUSTOM';
  product: SubscriptionProduct;
  offeringIdentifier: string;
}

export interface SubscriptionProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  productType: 'SUBSCRIPTION' | 'NON_SUBSCRIPTION';
  subscriptionPeriod?: string;
  introPrice?: {
    price: number;
    priceString: string;
    period: string;
    cycles: number;
  };
}

export interface SubscriptionStatus {
  isActive: boolean;
  activePlan: string | null;
  expiryDate: string | null;
  entitlements: string[];
  gracePeriod: boolean;
  willRenew: boolean;
}

export interface PurchaseResult {
  success: boolean;
  plan: string;
  expiryDate: string | null;
  customerInfo: any;
  error?: string;
}

export class SubscriptionService {
  private revenueCatClient: RevenueCatClient;

  constructor(environment?: 'development' | 'production') {
    this.revenueCatClient = getRevenueCatClient(environment);
  }

  /**
   * Get available subscription offerings for Bell24H
   */
  async getOfferings(userId?: string): Promise<SubscriptionOffering[]> {
    try {
      // Get products from RevenueCat
      const products = await this.revenueCatClient.getProducts();
      
      // Create offerings based on Bell24H plans
      const offerings: SubscriptionOffering[] = [
        {
          identifier: 'bell24h_monthly',
          serverDescription: 'Bell24H Monthly Subscriptions',
          availablePackages: [
            {
              identifier: 'bell24h_starter_monthly',
              packageType: 'MONTHLY',
              product: {
                identifier: BELL24H_PLANS.STARTER.identifier,
                description: 'Perfect for small businesses',
                title: 'Bell24H Starter',
                price: BELL24H_PLANS.STARTER.price,
                priceString: `₹${BELL24H_PLANS.STARTER.price}`,
                currencyCode: 'INR',
                productType: 'SUBSCRIPTION',
                subscriptionPeriod: 'P1M'
              },
              offeringIdentifier: 'bell24h_monthly'
            },
            {
              identifier: 'bell24h_pro_monthly',
              packageType: 'MONTHLY',
              product: {
                identifier: BELL24H_PLANS.PRO.identifier,
                description: 'For growing businesses',
                title: 'Bell24H Pro',
                price: BELL24H_PLANS.PRO.price,
                priceString: `₹${BELL24H_PLANS.PRO.price}`,
                currencyCode: 'INR',
                productType: 'SUBSCRIPTION',
                subscriptionPeriod: 'P1M'
              },
              offeringIdentifier: 'bell24h_monthly'
            }
          ]
        },
        {
          identifier: 'bell24h_annual',
          serverDescription: 'Bell24H Annual Subscriptions (Save up to 20%)',
          availablePackages: [
            {
              identifier: 'bell24h_starter_annual',
              packageType: 'ANNUAL',
              product: {
                identifier: 'bell24h_starter_annual',
                description: 'Perfect for small businesses - Annual',
                title: 'Bell24H Starter Annual',
                price: Math.round(BELL24H_PLANS.STARTER.price * 12 * 0.85), // 15% discount
                priceString: `₹${Math.round(BELL24H_PLANS.STARTER.price * 12 * 0.85)}`,
                currencyCode: 'INR',
                productType: 'SUBSCRIPTION',
                subscriptionPeriod: 'P1Y'
              },
              offeringIdentifier: 'bell24h_annual'
            },
            {
              identifier: 'bell24h_pro_annual',
              packageType: 'ANNUAL',
              product: {
                identifier: 'bell24h_pro_annual',
                description: 'For growing businesses - Annual',
                title: 'Bell24H Pro Annual',
                price: Math.round(BELL24H_PLANS.PRO.price * 12 * 0.80), // 20% discount
                priceString: `₹${Math.round(BELL24H_PLANS.PRO.price * 12 * 0.80)}`,
                currencyCode: 'INR',
                productType: 'SUBSCRIPTION',
                subscriptionPeriod: 'P1Y'
              },
              offeringIdentifier: 'bell24h_annual'
            }
          ]
        }
      ];

      return offerings;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      throw new Error('Failed to retrieve subscription offerings');
    }
  }

  /**
   * Purchase a subscription plan
   */
  async purchasePlan(userId: string, packageId: string): Promise<PurchaseResult> {
    try {
      // Validate user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get available offerings
      const offerings = await this.getOfferings(userId);
      
      // Find the package to purchase
      let packageToPurchase: SubscriptionPackage | null = null;
      for (const offering of offerings) {
        const pkg = offering.availablePackages.find(p => p.identifier === packageId);
        if (pkg) {
          packageToPurchase = pkg;
          break;
        }
      }

      if (!packageToPurchase) {
        throw new Error('Subscription package not found');
      }

      // Process purchase through RevenueCat
      const result = await this.revenueCatClient.purchaseSubscription(packageId, userId);
      
      if (result.success) {
        // Update user role to premium
        await prisma.user.update({
          where: { id: userId },
          data: { 
            role: 'PREMIUM_USER',
            updatedAt: new Date()
          }
        });

        // Log subscription event
        await this.logSubscriptionEvent(userId, 'purchase', packageId, result);

        return {
          success: true,
          plan: packageId,
          expiryDate: result.expirationDate || null,
          customerInfo: result
        };
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase plan error:', error);
      return {
        success: false,
        plan: packageId,
        expiryDate: null,
        customerInfo: null,
        error: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  /**
   * Check subscription status for a user
   */
  async checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get customer info from RevenueCat
      const customerInfo = await this.revenueCatClient.getSubscriberInfo(userId);
      
      // Check if user has active subscription
      const activeSubscriptions = customerInfo.activeSubscriptions || [];
      const isActive = activeSubscriptions.length > 0;
      
      // Get entitlements
      const entitlements = customerInfo.entitlements?.active || [];
      
      // Get expiry date from first active subscription
      const expiryDate = isActive && customerInfo.expirationDate ? 
        new Date(customerInfo.expirationDate).toISOString() : null;

      // Check grace period
      const gracePeriod = customerInfo.gracePeriodExpiresDate ? 
        new Date(customerInfo.gracePeriodExpiresDate) > new Date() : false;

      return {
        isActive,
        activePlan: isActive ? activeSubscriptions[0] : null,
        expiryDate,
        entitlements,
        gracePeriod,
        willRenew: isActive && !gracePeriod
      };
    } catch (error) {
      console.error('Check subscription status error:', error);
      
      // Return default free tier status
      return {
        isActive: false,
        activePlan: null,
        expiryDate: null,
        entitlements: [],
        gracePeriod: false,
        willRenew: false
      };
    }
  }

  /**
   * Handle RevenueCat webhook events
   */
  async handleWebhook(event: RevenueCatWebhookEvent): Promise<void> {
    try {
      console.log(`Processing webhook event: ${event.type} for user ${event.app_user_id}`);

      switch (event.type) {
        case 'INITIAL_PURCHASE':
          await this.onSubscriptionCreated(event);
          break;
        case 'RENEWAL':
          await this.onSubscriptionRenewed(event);
          break;
        case 'EXPIRATION':
          await this.onSubscriptionExpired(event);
          break;
        case 'CANCELLATION':
          await this.onSubscriptionCancelled(event);
          break;
        case 'PRODUCT_CHANGE':
          await this.onSubscriptionChanged(event);
          break;
        case 'UNCANCELLATION':
          await this.onSubscriptionReactivated(event);
          break;
        default:
          console.warn(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  /**
   * Handle subscription creation
   */
  private async onSubscriptionCreated(event: RevenueCatWebhookEvent): Promise<void> {
    const userId = event.app_user_id;
    const planId = event.product_id;
    
    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { 
        role: 'PREMIUM_USER',
        updatedAt: new Date()
      }
    });

    // Log the event
    await this.logSubscriptionEvent(userId, 'created', planId, event);

    // Send welcome email (via n8n webhook)
    await this.sendWebhookEvent('subscription.created', {
      userId,
      planId,
      eventType: 'INITIAL_PURCHASE',
      expiryDate: new Date(event.expiration_at_ms).toISOString()
    });
  }

  /**
   * Handle subscription renewal
   */
  private async onSubscriptionRenewed(event: RevenueCatWebhookEvent): Promise<void> {
    const userId = event.app_user_id;
    const planId = event.product_id;

    // Log the event
    await this.logSubscriptionEvent(userId, 'renewed', planId, event);

    // Send renewal confirmation (via n8n webhook)
    await this.sendWebhookEvent('subscription.renewed', {
      userId,
      planId,
      eventType: 'RENEWAL',
      expiryDate: new Date(event.expiration_at_ms).toISOString()
    });
  }

  /**
   * Handle subscription expiration
   */
  private async onSubscriptionExpired(event: RevenueCatWebhookEvent): Promise<void> {
    const userId = event.app_user_id;
    const planId = event.product_id;

    // Update user role to free
    await prisma.user.update({
      where: { id: userId },
      data: { 
        role: 'USER',
        updatedAt: new Date()
      }
    });

    // Log the event
    await this.logSubscriptionEvent(userId, 'expired', planId, event);

    // Send expiration notice (via n8n webhook)
    await this.sendWebhookEvent('subscription.expired', {
      userId,
      planId,
      eventType: 'EXPIRATION'
    });
  }

  /**
   * Handle subscription cancellation
   */
  private async onSubscriptionCancelled(event: RevenueCatWebhookEvent): Promise<void> {
    const userId = event.app_user_id;
    const planId = event.product_id;

    // Log the event
    await this.logSubscriptionEvent(userId, 'cancelled', planId, event);

    // Send cancellation confirmation (via n8n webhook)
    await this.sendWebhookEvent('subscription.cancelled', {
      userId,
      planId,
      eventType: 'CANCELLATION',
      expiryDate: new Date(event.expiration_at_ms).toISOString()
    });
  }

  /**
   * Handle subscription change
   */
  private async onSubscriptionChanged(event: RevenueCatWebhookEvent): Promise<void> {
    const userId = event.app_user_id;
    const planId = event.product_id;

    // Log the event
    await this.logSubscriptionEvent(userId, 'changed', planId, event);

    // Send change confirmation (via n8n webhook)
    await this.sendWebhookEvent('subscription.changed', {
      userId,
      planId,
      eventType: 'PRODUCT_CHANGE',
      expiryDate: new Date(event.expiration_at_ms).toISOString()
    });
  }

  /**
   * Handle subscription reactivation
   */
  private async onSubscriptionReactivated(event: RevenueCatWebhookEvent): Promise<void> {
    const userId = event.app_user_id;
    const planId = event.product_id;

    // Update user role to premium
    await prisma.user.update({
      where: { id: userId },
      data: { 
        role: 'PREMIUM_USER',
        updatedAt: new Date()
      }
    });

    // Log the event
    await this.logSubscriptionEvent(userId, 'reactivated', planId, event);

    // Send reactivation confirmation (via n8n webhook)
    await this.sendWebhookEvent('subscription.reactivated', {
      userId,
      planId,
      eventType: 'UNCANCELLATION',
      expiryDate: new Date(event.expiration_at_ms).toISOString()
    });
  }

  /**
   * Log subscription events for analytics
   */
  private async logSubscriptionEvent(
    userId: string, 
    action: string, 
    planId: string, 
    eventData: any
  ): Promise<void> {
    try {
      await prisma.subscriptionEvent.create({
        data: {
          userId,
          action,
          planId,
          eventData: JSON.stringify(eventData),
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log subscription event:', error);
    }
  }

  /**
   * Send webhook events to n8n for email notifications
   */
  private async sendWebhookEvent(eventType: string, payload: any): Promise<void> {
    try {
      await prisma.webhook.create({
        data: {
          eventType,
          payload,
          status: 'pending',
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to create webhook event:', error);
    }
  }

  /**
   * Get subscription analytics for a user
   */
  async getSubscriptionAnalytics(userId: string): Promise<any> {
    try {
      const [events, currentStatus] = await Promise.all([
        prisma.subscriptionEvent.findMany({
          where: { userId },
          orderBy: { timestamp: 'desc' },
          take: 50
        }),
        this.checkSubscriptionStatus(userId)
      ]);

      const totalPurchases = events.filter(e => e.action === 'created').length;
      const totalRenewals = events.filter(e => e.action === 'renewed').length;
      const totalCancellations = events.filter(e => e.action === 'cancelled').length;

      return {
        currentStatus,
        totalPurchases,
        totalRenewals,
        totalCancellations,
        recentEvents: events.map(e => ({
          action: e.action,
          planId: e.planId,
          timestamp: e.timestamp,
          eventData: JSON.parse(e.eventData as string)
        }))
      };
    } catch (error) {
      console.error('Failed to get subscription analytics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService(
  process.env.NODE_ENV === 'production' ? 'production' : 'development'
);