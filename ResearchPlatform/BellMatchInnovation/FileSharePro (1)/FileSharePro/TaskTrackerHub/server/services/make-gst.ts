import axios from 'axios';
import { logger } from '../logger';

export class MakeGSTService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.MAKE_GST_WEBHOOK_URL || '';
  }

  async validateGST(gstNumber: string): Promise<{
    valid: boolean;
    business?: string;
    registrationDate?: string;
    status?: string;
    address?: string;
    category?: string;
    lastFilingDate?: string;
  }> {
    try {
      const response = await axios.post(
        this.webhookUrl,
        {
          gstNumber,
          action: 'validate'
        }
      );

      logger.info(`Validated GST number: ${gstNumber}`);
      return response.data;
    } catch (error) {
      logger.error('Error validating GST:', error);
      throw error;
    }
  }

  async getBusinessDetails(gstNumber: string): Promise<any> {
    try {
      const response = await axios.post(
        this.webhookUrl,
        {
          gstNumber,
          action: 'details'
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error getting business details:', error);
      throw error;
    }
  }
}

export const makeGstService = new MakeGSTService();