/**
 * n8n-trigger.ts
 * 
 * Utility to trigger n8n marketing workflows from the Next.js backend.
 * 
 * ARCHITECTURE PRINCIPLE:
 * - This file ONLY triggers marketing events (emails, SMS, social posts).
 * - NO business logic or decision-making happens in the n8n workflows.
 * - All data passed here is pre-calculated by the backend.
 */

interface N8NPayload {
  event: string;
  [key: string]: any;
}

/**
 * Triggers an n8n workflow via webhook
 * @param eventName Unique name for the marketing event
 * @param data Payload to send to n8n
 */
export async function triggerN8NWorkflow(eventName: string, data: Record<string, any>) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_URL not configured. Skipping marketing notification.');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-Event-Source': 'Bell24h-Backend',
      },
      body: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error triggering n8n workflow (${eventName}):`, error);
    // We don't throw here to avoid breaking business logic if marketing automation fails
    return null;
  }
}

/**
 * Convenience methods for common marketing events
 */
export const n8nMarketing = {
  /**
   * Send payment confirmation email/SMS
   */
  async notifyPaymentSuccess(paymentData: {
    orderId: string;
    amount: number;
    email: string;
    name: string;
    rfqTitle: string;
  }) {
    return triggerN8NWorkflow('payment_success', paymentData);
  },

  /**
   * Notify suppliers of a new matching RFQ
   */
  async notifyNewRFQ(rfqData: {
    rfqId: number;
    title: string;
    category: string;
    supplierEmails: string[];
  }) {
    return triggerN8NWorkflow('new_rfq_notification', rfqData);
  },

  /**
   * Send referral invite
   */
  async sendReferralInvite(referralData: {
    referralCode: string; // Generated in backend
    inviteeEmail: string;
    referrerName: string;
  }) {
    return triggerN8NWorkflow('referral_invite', referralData);
  },

  /**
   * Send re-engagement email (Churn Prevention)
   */
  async sendChurnPrevention(userData: {
    email: string;
    name: string;
    lastActiveDays: number;
    discountCode?: string;
  }) {
    return triggerN8NWorkflow('churn_prevention', userData);
  }
};
