/**
 * MSG91 SMS/OTP Service for Bell24h
 *
 * Features:
 * - Send OTP to Indian mobile numbers
 * - Verify OTP with MSG91
 * - Resend OTP functionality
 *
 * Pricing: ₹0.15 per SMS (~$0.002)
 * Free Trial: 25 SMS credits
 */

interface MSG91Config {
  authKey: string;
  templateId: string;
  senderId: string;
}

interface SendOTPResponse {
  type: string;
  message: string;
}

interface VerifyOTPResponse {
  type: string;
  message: string;
}

class MSG91Service {
  private config: MSG91Config;
  private baseUrl = 'https://control.msg91.com/api/v5';

  constructor() {
    this.config = {
      authKey: process.env.MSG91_AUTH_KEY || process.env.NEXT_PUBLIC_MSG91_AUTH_KEY || '',
      templateId: process.env.MSG91_TEMPLATE_ID || '',
      senderId: process.env.MSG91_SENDER_ID || 'BELL24H',
    };

    if (!this.config.authKey) {
      console.warn('MSG91 API key not configured. OTP will use mock mode.');
    }
  }

  /**
   * Send OTP to mobile number
   * @param phoneNumber - 10-digit Indian mobile number (without +91)
   */
  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate phone number
      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        throw new Error('Invalid mobile number format');
      }

      // If no API key, use mock mode
      if (!this.config.authKey) {
        console.log(`📱 [MOCK] OTP sent to +91${phoneNumber}: 123456`);
        return {
          success: true,
          message: 'OTP sent successfully (mock mode)',
        };
      }

      console.log(`Sending OTP to +91${phoneNumber} via MSG91...`);

      const response = await fetch(`${this.baseUrl}/otp`, {
        method: 'POST',
        headers: {
          'authkey': this.config.authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: this.config.templateId,
          mobile: `91${phoneNumber}`,
          sender: this.config.senderId,
          otp_length: 6,
          otp_expiry: 5, // 5 minutes
        }),
      });

      const data: SendOTPResponse = await response.json();

      if (!response.ok || data.type === 'error') {
        throw new Error(data.message || 'Failed to send OTP');
      }

      console.log(`✅ OTP sent successfully to +91${phoneNumber}`);

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error: any) {
      console.error('MSG91 Send OTP Error:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  /**
   * Verify OTP
   * @param phoneNumber - 10-digit Indian mobile number (without +91)
   * @param otp - 6-digit OTP code
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate inputs
      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        throw new Error('Invalid mobile number format');
      }

      if (!/^\d{6}$/.test(otp)) {
        throw new Error('Invalid OTP format. Must be 6 digits.');
      }

      // If no API key, use mock mode (accept any OTP)
      if (!this.config.authKey) {
        console.log(`✅ [MOCK] OTP verified for +91${phoneNumber}`);
        return {
          success: true,
          message: 'OTP verified successfully (mock mode)',
        };
      }

      console.log(`Verifying OTP for +91${phoneNumber}...`);

      const response = await fetch(`${this.baseUrl}/otp/verify`, {
        method: 'POST',
        headers: {
          'authkey': this.config.authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: `91${phoneNumber}`,
          otp: otp,
        }),
      });

      const data: VerifyOTPResponse = await response.json();

      if (!response.ok || data.type === 'error') {
        throw new Error(data.message || 'Invalid OTP');
      }

      console.log(`✅ OTP verified successfully for +91${phoneNumber}`);

      return {
        success: true,
        message: 'OTP verified successfully',
      };
    } catch (error: any) {
      console.error('MSG91 Verify OTP Error:', error);
      throw new Error(error.message || 'Invalid OTP. Please try again.');
    }
  }

  /**
   * Resend OTP
   * @param phoneNumber - 10-digit Indian mobile number (without +91)
   * @param retryType - 'voice' or 'text' (default: 'text')
   */
  async resendOTP(phoneNumber: string, retryType: 'voice' | 'text' = 'text'): Promise<{ success: boolean; message: string }> {
    try {
      // Validate phone number
      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        throw new Error('Invalid mobile number format');
      }

      // If no API key, use mock mode
      if (!this.config.authKey) {
        console.log(`📱 [MOCK] OTP resent to +91${phoneNumber} via ${retryType}`);
        return {
          success: true,
          message: `OTP resent successfully via ${retryType} (mock mode)`,
        };
      }

      console.log(`Resending OTP to +91${phoneNumber} via ${retryType}...`);

      const response = await fetch(`${this.baseUrl}/otp/retry`, {
        method: 'POST',
        headers: {
          'authkey': this.config.authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: `91${phoneNumber}`,
          retrytype: retryType,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.type === 'error') {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      console.log(`✅ OTP resent successfully to +91${phoneNumber} via ${retryType}`);

      return {
        success: true,
        message: `OTP resent successfully via ${retryType}`,
      };
    } catch (error: any) {
      console.error('MSG91 Resend OTP Error:', error);
      throw new Error(error.message || 'Failed to resend OTP');
    }
  }

  /**
   * Get account balance (SMS credits remaining)
   */
  async getBalance(): Promise<number> {
    try {
      if (!this.config.authKey) {
        return -1; // Mock mode indicator
      }

      const response = await fetch(`https://control.msg91.com/api/balance.php?authkey=${this.config.authKey}`, {
        method: 'GET',
      });

      const data = await response.text();
      const balance = parseFloat(data);

      console.log(`MSG91 Balance: ${balance} credits`);

      return balance;
    } catch (error) {
      console.error('MSG91 Get Balance Error:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const msg91Service = new MSG91Service();

// Export types
export type {
  SendOTPResponse,
  VerifyOTPResponse,
};
