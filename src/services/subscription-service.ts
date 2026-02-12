/**
 * Subscription Service for Bell24H
 * Complete RevenueCat integration with user management
 */

import { RevenueCatService, BELL24H_PLANS } from '@/lib/revenuecat-config';
import { prisma } from '@/lib/prisma';

export class SubscriptionService {
  
  /**
   * Initialize user in RevenueCat
   */
  async initializeUser(userId: string, email: string) {
    try {
      const purchases = await RevenueCatService.getClient();
      
      // Log in user to RevenueCat
      await purchases.logIn(userId);
      
      // Set user attributes for segmentation
      await purchases.setAttributes({
        email: email,
        userId: userId,
        platform: 'web'
      });
      
      console.log(`User ${userId} initialized in RevenueCat`);
      
    } catch (error) {
      console.error('Failed to initialize user in RevenueCat:', error);
      throw error;
    }
  }
  
  /**
   * Get available subscription offerings
   */
  async getOfferings() {
    try {
      const purchases = await RevenueCatService.getClient();
      const offerings = await purchases.getOfferings();
      
      if (offerings.current) {
        return offerings.current.availablePackages.map(pkg => ({
          identifier: pkg.identifier,
          product: {
            title: pkg.product.title,
            description: pkg.product.description,
            price: pkg.product.price,
            priceString: pkg.product.priceString,
            currencyCode: pkg.product.currencyCode
          }
        }));
      }
      
      return [];
      
    } catch (error) {
      console.error('Failed to get offerings:', error);
      
      // Fallback to hardcoded plans if RevenueCat fails
      return Object.values(BELL24H_PLANS).map(plan => ({
        identifier: plan.identifier,
        product: {
          title: plan.displayName,
          description: plan.features.join(', '),
          price: plan.price,
          priceString: plan.price > 0 ? `₹${plan.price.toLocaleString()}/month` : 'Free',
          currencyCode: 'INR'
        }
      }));
    }
  }
  
  /**
   * Purchase a subscription plan
   */
  async purchasePlan(userId: string, packageIdentifier: string) {
    try {
      const purchases = await RevenueCatService.getClient();
      await purchases.logIn(userId);
      
      const offerings = await purchases.getOfferings();
      const packageToPurchase = offerings.current?.availablePackages.find(
        pkg => pkg.identifier === packageIdentifier
      );
      
      if (!packageToPurchase) {
        throw new Error('Package not found');
      }
      
      try {
        const { customerInfo } = await purchases.purchasePackage(packageToPurchase);
        
        // Update user in database
        await this.updateUserSubscription(userId, customerInfo);
        
        // Log subscription event
        await this.logSubscriptionEvent(userId, 'purchased', packageIdentifier, customerInfo);
        
        return {
          success: true,
          plan: customerInfo.activeSubscriptions[0],
          entitlements: customerInfo.entitlements.active
        };
        
      } catch (error: any) {
        if (error.userCancelled) {
          return { success: false, error: 'User cancelled purchase' };
        }
        throw error;
      }
      
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }
  
  /**
   * Get subscription status for user
   */
  async getSubscriptionStatus(userId: string) {
    try {
      const purchases = await RevenueCatService.getClient();
      await purchases.logIn(userId);
      
      const customerInfo = await purchases.getCustomerInfo();
      
      return {
        activeSubscriptions: customerInfo.activeSubscriptions,
        entitlements: customerInfo.entitlements.active,
        expirationDate: customerInfo.expirationDate,
        isPro: customerInfo.entitlements.active.includes('pro')
      };
      
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      
      // Return default free status if error
      return {
        activeSubscriptions: [],
        entitlements: {},
        expirationDate: null,
        isPro: false
      };
    }
  }
  
  /**
   * Restore purchases for user
   */
  async restorePurchases(userId: string) {
    try {
      const purchases = await RevenueCatService.getClient();
      await purchases.logIn(userId);
      
      const customerInfo = await purchases.restorePurchases();
      
      // Update user in database
      await this.updateUserSubscription(userId, customerInfo);
      
      // Log restoration event
      await this.logSubscriptionEvent(userId, 'restored', null, customerInfo);
      
      return customerInfo;
      
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }
  
  /**
   * Handle RevenueCat webhook events
   */
  async handleWebhook(event: any) {
    try {
      const { type, app_user_id, product_id } = event;
      
      console.log(`Processing webhook event: ${type} for user ${app_user_id}`);
      
      switch (type) {
        case 'INITIAL_PURCHASE':
          await this.handleInitialPurchase(app_user_id, product_id, event);
          break;
          
        case 'RENEWAL':
          await this.handleRenewal(app_user_id, product_id, event);
          break;
          
        case 'CANCELLATION':
          await this.handleCancellation(app_user_id, product_id, event);
          break;
          
        case 'EXPIRATION':
          await this.handleExpiration(app_user_id, product_id, event);
          break;
          
        case 'BILLING_ISSUE':
          await this.handleBillingIssue(app_user_id, product_id, event);
          break;
          
        case 'PRODUCT_CHANGE':
          await this.handleProductChange(app_user_id, product_id, event);
          break;
          
        default:
          console.log(`Unhandled event type: ${type}`);
      }
      
      // Trigger n8n workflow for analytics and notifications
      await this.triggerN8NWorkflow(event);
      
    } catch (error) {
      console.error('Webhook handling failed:', error);
      throw error;
    }
  }
  
  /**
   * Update user subscription in database
   */
  private async updateUserSubscription(userId: string, customerInfo: any) {
    try {
      const activeSubscriptions = customerInfo.activeSubscriptions || [];
      const hasActiveSubscription = activeSubscriptions.length > 0;
      
      // Determine user role based on subscription
      let role = 'USER'; // Default role
      let subscriptionPlan = 'bell24h_free';
      
      if (hasActiveSubscription) {
        const subscription = activeSubscriptions[0];
        
        if (subscription.includes('enterprise')) {
          role = 'ENTERPRISE_USER';
          subscriptionPlan = 'bell24h_enterprise_yearly';
        } else if (subscription.includes('pro')) {
          role = 'PREMIUM_USER';
          subscriptionPlan = 'bell24h_pro_monthly';
        } else if (subscription.includes('starter')) {
          role = 'PREMIUM_USER';
          subscriptionPlan = 'bell24h_starter_monthly';
        }
      }
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          role,
          subscriptionPlan,
          subscriptionStatus: hasActiveSubscription ? 'active' : 'inactive',
          subscriptionStartDate: customerInfo.firstSeen ? new Date(customerInfo.firstSeen) : null,
          subscriptionEndDate: customerInfo.expirationDate ? new Date(customerInfo.expirationDate) : null,
          updatedAt: new Date()
        }
      });
      
      console.log(`Updated user ${userId} subscription: ${role}, ${subscriptionPlan}`);
      
    } catch (error) {
      console.error('Failed to update user subscription:', error);
      throw error;
    }
  }
  
  /**
   * Log subscription event
   */
  private async logSubscriptionEvent(userId: string, action: string, plan?: string | null, customerInfo?: any) {
    try {
      await prisma.subscriptionEvent.create({
        data: {
          userId,
          action,
          plan: plan || customerInfo?.activeSubscriptions?.[0] || 'unknown',
          amount: customerInfo?.price || 0,
          currency: 'INR',
          transactionId: customerInfo?.transactionId,
          timestamp: new Date(),
          metadata: {
            customerInfo,
            environment: process.env.NODE_ENV
          }
        }
      });
      
      console.log(`Logged subscription event: ${action} for user ${userId}`);
      
    } catch (error) {
      console.error('Failed to log subscription event:', error);
      // Don't throw error - logging failure shouldn't break the flow
    }
  }
  
  /**
   * Handle initial purchase
   */
  private async handleInitialPurchase(userId: string, productId: string, event: any) {
    try {
      // Update user subscription
      await this.updateUserSubscription(userId, event);
      
      // Log event
      await this.logSubscriptionEvent(userId, 'initial_purchase', productId, event);
      
      console.log(`Initial purchase handled for user ${userId}, plan ${productId}`);
      
    } catch (error) {
      console.error('Initial purchase handling failed:', error);
      throw error;
    }
  }
  
  /**
   * Handle renewal
   */
  private async handleRenewal(userId: string, productId: string, event: any) {
    try {
      // Update user subscription
      await this.updateUserSubscription(userId, event);
      
      // Log event
      await this.logSubscriptionEvent(userId, 'renewal', productId, event);
      
      console.log(`Renewal handled for user ${userId}, plan ${productId}`);
      
    } catch (error) {
      console.error('Renewal handling failed:', error);
      throw error;
    }
  }
  
  /**
   * Handle cancellation
   */
  private async handleCancellation(userId: string, productId: string, event: any) {
    try {
      // Update user status
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'cancelled',
          subscriptionCancelledAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Log event
      await this.logSubscriptionEvent(userId, 'cancellation', productId, event);
      
      console.log(`Cancellation handled for user ${userId}, plan ${productId}`);
      
    } catch (error) {
      console.error('Cancellation handling failed:', error);
      throw error;
    }
  }
  
  /**
   * Handle expiration
   */
  private async handleExpiration(userId: string, productId: string, event: any) {
    try {
      // Downgrade user to free plan
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: 'USER',
          subscriptionStatus: 'expired',
          subscriptionPlan: 'bell24h_free',
          subscriptionExpiredAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Log event
      await this.logSubscriptionEvent(userId, 'expiration', productId, event);
      
      console.log(`Expiration handled for user ${userId}, plan ${productId}`);
      
    } catch (error) {
      console.error('Expiration handling failed:', error);
      throw error;
    }
  }
  
  /**
   * Handle billing issue
   */
  private async handleBillingIssue(userId: string, productId: string, event: any) {
    try {
      // Update user status
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'billing_issue',
          updatedAt: new Date()
        }
      });
      
      // Log event
      await this.logSubscriptionEvent(userId, 'billing_issue', productId, event);
      
      console.log(`Billing issue handled for user ${userId}, plan ${productId}`);
      
    } catch (error) {
      console.error('Billing issue handling failed:', error);
      throw error;
    }
  }
  
  /**
   * Handle product change
   */
  private async handleProductChange(userId: string, productId: string, event: any) {
    try {
      // Update user subscription
      await this.updateUserSubscription(userId, event);
      
      // Log event
      await this.logSubscriptionEvent(userId, 'product_change', productId, event);
      
      console.log(`Product change handled for user ${userId}, plan ${productId}`);
      
    } catch (error) {
      console.error('Product change handling failed:', error);
      throw error;
    }
  }
  
  /**
   * Trigger n8n workflow
   */
  private async triggerN8NWorkflow(event: any) {
    try {
      const workflowMap: Record<string, string> = {
        'INITIAL_PURCHASE': 'subscription-activated',
        'RENEWAL': 'subscription-renewed',
        'CANCELLATION': 'subscription-cancelled',
        'EXPIRATION': 'subscription-expired',
        'BILLING_ISSUE': 'billing-issue',
        'PRODUCT_CHANGE': 'subscription-changed',
        'NON_RENEWING_PURCHASE': 'one-time-purchase'
      };
      
      const workflowName = workflowMap[event.type];
      if (workflowName) {
        const n8nWebhookUrl = `http://165.232.187.195:5678/webhook/${workflowName}`;
        
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
        
        console.log(`Triggered n8n workflow: ${workflowName}`);
      }
      
    } catch (error) {
      console.error(`Failed to trigger n8n workflow for event ${event.type}:`, error);
      // Don't throw error - workflow failure shouldn't break the main flow
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();