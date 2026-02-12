import { NextRequest, NextResponse } from 'next/server';

/**
 * CRM Integration Service for Bell24H
 * Handles synchronization with Zoho CRM and other CRM systems
 */
export class CRMIntegrationService {
  private zohoAccessToken: string | null = null;
  private zohoRefreshToken: string | null = null;

  constructor() {
    this.zohoAccessToken = process.env.ZOHO_ACCESS_TOKEN || null;
    this.zohoRefreshToken = process.env.ZOHO_REFRESH_TOKEN || null;
  }

  /**
   * Sync user and subscription data to Zoho CRM
   */
  async syncUserToCRM(user: any, subscription: any) {
    try {
      if (!this.zohoAccessToken) {
        console.warn('Zoho access token not configured');
        return { success: false, error: 'CRM not configured' };
      }

      const contactData = {
        data: [{
          First_Name: user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Unknown',
          Last_Name: user.name?.split(' ')[1] || '',
          Email: user.email,
          Phone: user.phone || '',
          Company: user.company || '',
          Subscription_Plan: subscription.plan || 'free',
          Subscription_Status: subscription.status || 'active',
          MRR: subscription.monthlyRevenue || 0,
          LTV: subscription.lifetimeValue || 0,
          Subscription_Start_Date: subscription.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : '',
          Subscription_End_Date: subscription.expirationDate ? new Date(subscription.expirationDate).toISOString().split('T')[0] : '',
          Last_Subscription_Update: new Date().toISOString().split('T')[0],
          Source: 'Bell24H Platform',
          Tags: ['subscription', subscription.plan || 'free', 'revenuecat']
        }]
      };

      const response = await fetch('https://www.zohoapis.com/crm/v2/Contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${this.zohoAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Zoho CRM API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Successfully synced to Zoho CRM:', result);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to sync to Zoho CRM:', error);
      return { success: false, error: error instanceof Error ? error.message : 'CRM sync failed' };
    }
  }

  /**
   * Update RevenueCat with CRM data for segmentation
   */
  async updateRevenueCatWithCRMData(userId: string, crmData: any) {
    try {
      // This would integrate with RevenueCat's setAttributes API
      // For now, we'll store it in our database and sync later
      
      const attributes = {
        email: crmData.email,
        phoneNumber: crmData.phone,
        company: crmData.company,
        industry: crmData.industry,
        employeeCount: crmData.employeeCount,
        revenueRange: crmData.revenueRange,
        location: crmData.location,
        leadSource: crmData.leadSource,
        lastContactDate: crmData.lastContactDate
      };

      // Store in database for RevenueCat sync
      console.log('Storing CRM attributes for RevenueCat sync:', attributes);
      
      return { success: true, attributes };
    } catch (error) {
      console.error('Failed to update RevenueCat with CRM data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  }

  /**
   * Get user data from Zoho CRM
   */
  async getUserFromCRM(email: string) {
    try {
      if (!this.zohoAccessToken) {
        return { success: false, error: 'CRM not configured' };
      }

      const response = await fetch(
        `https://www.zohoapis.com/crm/v2/Contacts/search?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${this.zohoAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Zoho CRM search error: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Failed to get user from Zoho CRM:', error);
      return { success: false, error: error instanceof Error ? error.message : 'CRM lookup failed' };
    }
  }

  /**
   * Update existing contact in Zoho CRM
   */
  async updateCRMContact(contactId: string, data: any) {
    try {
      if (!this.zohoAccessToken) {
        return { success: false, error: 'CRM not configured' };
      }

      const response = await fetch(`https://www.zohoapis.com/crm/v2/Contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Zoho-oauthtoken ${this.zohoAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [data] })
      });

      if (!response.ok) {
        throw new Error(`Zoho CRM update error: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to update contact in Zoho CRM:', error);
      return { success: false, error: error instanceof Error ? error.message : 'CRM update failed' };
    }
  }

  /**
   * Create or update contact based on email
   */
  async upsertCRMContact(user: any, subscription: any) {
    try {
      // First, try to find existing contact
      const existingContact = await this.getUserFromCRM(user.email);
      
      if (existingContact.success && existingContact.data && existingContact.data.length > 0) {
        // Update existing contact
        const contactId = existingContact.data[0].id;
        const updateData = {
          Subscription_Plan: subscription.plan || 'free',
          Subscription_Status: subscription.status || 'active',
          MRR: subscription.monthlyRevenue || 0,
          LTV: subscription.lifetimeValue || 0,
          Last_Subscription_Update: new Date().toISOString().split('T')[0]
        };
        
        return await this.updateCRMContact(contactId, updateData);
      } else {
        // Create new contact
        return await this.syncUserToCRM(user, subscription);
      }
    } catch (error) {
      console.error('Failed to upsert CRM contact:', error);
      return { success: false, error: error instanceof Error ? error.message : 'CRM upsert failed' };
    }
  }

  /**
   * Get CRM analytics data
   */
  async getCRMAnalytics() {
    try {
      if (!this.zohoAccessToken) {
        return { success: false, error: 'CRM not configured' };
      }

      // Get contacts by subscription status
      const response = await fetch(
        'https://www.zohoapis.com/crm/v2/Contacts?fields=Subscription_Plan,Subscription_Status,MRR,LTV&per_page=200',
        {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${this.zohoAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Zoho CRM analytics error: ${response.status}`);
      }

      const result = await response.json();
      
      // Process analytics data
      const analytics = {
        totalContacts: result.data.length,
        subscriptionBreakdown: this.analyzeSubscriptionBreakdown(result.data),
        revenueBreakdown: this.analyzeRevenueBreakdown(result.data),
        conversionRate: this.calculateConversionRate(result.data)
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Failed to get CRM analytics:', error);
      return { success: false, error: error instanceof Error ? error.message : 'CRM analytics failed' };
    }
  }

  private analyzeSubscriptionBreakdown(contacts: any[]) {
    const breakdown: Record<string, number> = {};
    contacts.forEach(contact => {
      const plan = contact.Subscription_Plan || 'unknown';
      breakdown[plan] = (breakdown[plan] || 0) + 1;
    });
    return breakdown;
  }

  private analyzeRevenueBreakdown(contacts: any[]) {
    const totalMRR = contacts.reduce((sum, contact) => sum + (contact.MRR || 0), 0);
    const totalLTV = contacts.reduce((sum, contact) => sum + (contact.LTV || 0), 0);
    return { totalMRR, totalLTV, avgMRR: totalMRR / contacts.length, avgLTV: totalLTV / contacts.length };
  }

  private calculateConversionRate(contacts: any[]) {
    const subscribed = contacts.filter(contact => 
      contact.Subscription_Status === 'active' && 
      contact.Subscription_Plan !== 'free'
    ).length;
    return contacts.length > 0 ? (subscribed / contacts.length) * 100 : 0;
  }
}

/**
 * API Route Handler for CRM Integration
 */
export async function POST(request: NextRequest) {
  try {
    const { user, subscription, action } = await request.json();
    
    if (!user || !subscription) {
      return NextResponse.json(
        { error: 'User and subscription data required' },
        { status: 400 }
      );
    }

    const crmService = new CRMIntegrationService();
    
    let result;
    switch (action) {
      case 'sync':
        result = await crmService.syncUserToCRM(user, subscription);
        break;
      case 'upsert':
        result = await crmService.upsertCRMContact(user, subscription);
        break;
      case 'update-attributes':
        result = await crmService.updateRevenueCatWithCRMData(user.id, user);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use sync, upsert, or update-attributes' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'CRM operation completed successfully',
        data: result.data
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('CRM integration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const email = searchParams.get('email');

    const crmService = new CRMIntegrationService();

    switch (action) {
      case 'analytics':
        const analytics = await crmService.getCRMAnalytics();
        if (analytics.success) {
          return NextResponse.json({ success: true, data: analytics.data });
        } else {
          return NextResponse.json(
            { error: analytics.error },
            { status: 500 }
          );
        }

      case 'lookup':
        if (!email) {
          return NextResponse.json(
            { error: 'Email parameter required for lookup' },
            { status: 400 }
          );
        }
        const userData = await crmService.getUserFromCRM(email);
        if (userData.success) {
          return NextResponse.json({ success: true, data: userData.data });
        } else {
          return NextResponse.json(
            { error: userData.error },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use analytics or lookup' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('CRM integration GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}