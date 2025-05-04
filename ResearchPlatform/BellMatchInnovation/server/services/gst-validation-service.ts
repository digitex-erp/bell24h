import axios from 'axios';

// Constants
const GST_API_BASE_URL = process.env.GST_API_BASE_URL || 'https://api.gstvalidate.india.gov.in/v1';
const GST_API_KEY = process.env.GST_API_KEY;

// GSTIN format regex
const gstinRegex = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

/**
 * GST Validation Service
 * 
 * Provides validation for Indian GST (Goods and Services Tax) numbers
 * and related business information verification
 */
class GSTValidationService {
  /**
   * Validates a GST Identification Number (GSTIN)
   * 
   * @param gstin - The 15-character GST identification number to validate
   * @returns An object containing validation result and business details if valid
   */
  async validateGSTIN(gstin: string): Promise<GSTValidationResult> {
    try {
      // Check if GST API key is configured
      if (!GST_API_KEY) {
        console.warn('GST validation API key not configured');
        return {
          valid: false,
          message: 'GST validation service is not configured. Please contact administrator.',
        };
      }

      // Basic format validation before calling the API
      if (!this.isValidGSTINFormat(gstin)) {
        return {
          valid: false,
          message: 'Invalid GSTIN format. GSTIN must be 15 characters long and follow the correct pattern.',
          gstin
        };
      }

      // Make API request to validate GSTIN
      const response = await axios.post(
        `${GST_API_BASE_URL}/validate`,
        { gstin },
        {
          headers: {
            'Authorization': `Bearer ${GST_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const data = response.data;

      // If API returns valid status
      if (data.valid) {
        return {
          valid: true,
          gstin,
          legal_name: data.legal_name,
          trade_name: data.trade_name,
          address: data.address,
          state_code: data.state_code,
          state_name: data.state_name,
          business_type: data.business_type,
          tax_payer_type: data.tax_payer_type,
          status: data.status,
          registration_date: data.registration_date,
          message: 'GSTIN validation successful'
        };
      } else {
        return {
          valid: false,
          gstin,
          message: data.message || 'GSTIN validation failed. The provided GSTIN is invalid or inactive.'
        };
      }
    } catch (error: any) {
      // Handle different types of errors appropriately
      console.error('GST validation error:', error);

      // Rate limiting or quota errors
      if (error.response?.status === 429) {
        return {
          valid: false,
          gstin,
          message: 'GST validation service quota exceeded. Please try again later.'
        };
      }

      // Authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return {
          valid: false,
          gstin,
          message: 'GST validation service authentication failed. Please contact administrator.'
        };
      }

      // Timeout errors
      if (error.code === 'ECONNABORTED') {
        return {
          valid: false,
          gstin,
          message: 'GST validation timed out. The service might be experiencing high load.'
        };
      }

      // Generic error with API response
      if (error.response) {
        return {
          valid: false,
          gstin,
          message: `GST validation failed: ${error.response.data?.message || error.message}`
        };
      }

      // Network or other errors
      return {
        valid: false,
        gstin,
        message: 'GST validation failed due to a network or server error. Please try again later.'
      };
    }
  }

  /**
   * Performs bulk validation of multiple GSTINs
   * 
   * @param gstinList - List of GST identification numbers to validate
   * @returns Array of validation results for each GSTIN
   */
  async bulkValidateGSTINs(gstinList: string[]): Promise<BulkGSTValidationResult> {
    try {
      // Check if GST API key is configured
      if (!GST_API_KEY) {
        console.warn('GST validation API key not configured');
        return {
          success: false,
          message: 'GST validation service is not configured. Please contact administrator.',
          results: []
        };
      }

      if (!gstinList.length) {
        return {
          success: false,
          message: 'No GSTINs provided for validation',
          results: []
        };
      }

      // If list is too long, API might reject it
      if (gstinList.length > 100) {
        return {
          success: false,
          message: 'Too many GSTINs provided. Maximum 100 GSTINs allowed per bulk request.',
          results: []
        };
      }

      // Make API request to validate GSTINs in bulk
      const response = await axios.post(
        `${GST_API_BASE_URL}/bulk-validate`,
        { gstinList },
        {
          headers: {
            'Authorization': `Bearer ${GST_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout for bulk operations
        }
      );

      const data = response.data;
      
      return {
        success: true,
        message: 'Bulk validation completed',
        results: data.results
      };
    } catch (error: any) {
      // Handle bulk validation errors
      console.error('Bulk GST validation error:', error);

      // When the API is unavailable, validate each GSTIN individually
      if (!error.response || error.code === 'ECONNABORTED') {
        console.warn('Bulk validation failed, falling back to individual validation');
        
        const results = await Promise.all(
          gstinList.map(gstin => this.validateGSTIN(gstin))
        );

        return {
          success: true,
          message: 'Completed validation individually (bulk API unavailable)',
          results
        };
      }

      return {
        success: false,
        message: `Bulk validation failed: ${error.response?.data?.message || error.message}`,
        results: []
      };
    }
  }

  /**
   * Retrieves detailed business information for a valid GSTIN
   * 
   * @param gstin - A previously validated GSTIN
   * @returns Detailed business information including tax filing history
   */
  async getBusinessDetails(gstin: string): Promise<GSTBusinessDetailsResult> {
    try {
      // Check if GST API key is configured
      if (!GST_API_KEY) {
        console.warn('GST validation API key not configured');
        return {
          success: false,
          message: 'GST validation service is not configured. Please contact administrator.'
        };
      }

      // Basic format validation before calling the API
      if (!this.isValidGSTINFormat(gstin)) {
        return {
          success: false,
          message: 'Invalid GSTIN format. GSTIN must be 15 characters long and follow the correct pattern.'
        };
      }

      // Make API request to get business details
      const response = await axios.get(
        `${GST_API_BASE_URL}/business-details/${gstin}`,
        {
          headers: {
            'Authorization': `Bearer ${GST_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 second timeout
        }
      );

      const data = response.data;

      if (data.success) {
        return {
          success: true,
          gstin,
          business_details: data.business_details,
          filing_history: data.filing_history,
          compliance_rating: data.compliance_rating,
          message: 'Business details retrieved successfully'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to retrieve business details'
        };
      }
    } catch (error: any) {
      // Handle different types of errors
      console.error('Get business details error:', error);

      // API response error
      if (error.response?.data) {
        return {
          success: false,
          message: `Failed to retrieve business details: ${error.response.data.message || error.message}`
        };
      }

      // Network or other errors
      return {
        success: false,
        message: 'Failed to retrieve business details due to a network or server error'
      };
    }
  }

  /**
   * Verifies if an invoice number is valid for a given GSTIN
   * 
   * @param gstin - The supplier's GSTIN
   * @param invoiceNumber - The invoice number to verify
   * @param invoiceDate - The invoice date in YYYY-MM-DD format
   * @returns Validation result for the invoice
   */
  async verifyInvoice(
    gstin: string, 
    invoiceNumber: string, 
    invoiceDate: string
  ): Promise<GSTInvoiceVerificationResult> {
    try {
      // Check if GST API key is configured
      if (!GST_API_KEY) {
        console.warn('GST validation API key not configured');
        return {
          valid: false,
          message: 'GST validation service is not configured. Please contact administrator.'
        };
      }

      // Basic format validation
      if (!this.isValidGSTINFormat(gstin)) {
        return {
          valid: false,
          message: 'Invalid GSTIN format'
        };
      }

      if (!invoiceNumber || !invoiceDate) {
        return {
          valid: false,
          message: 'Invoice number and date are required'
        };
      }

      // Make API request to verify invoice
      const response = await axios.post(
        `${GST_API_BASE_URL}/verify-invoice`,
        {
          gstin,
          invoiceNumber,
          invoiceDate
        },
        {
          headers: {
            'Authorization': `Bearer ${GST_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const data = response.data;

      if (data.valid) {
        return {
          valid: true,
          gstin,
          invoiceNumber,
          invoiceDate,
          message: 'Invoice verification successful',
          filing_status: data.filing_status
        };
      } else {
        return {
          valid: false,
          message: data.message || 'Invoice verification failed'
        };
      }
    } catch (error: any) {
      // Handle different types of errors
      console.error('Invoice verification error:', error);
      
      // API response error
      if (error.response?.data) {
        return {
          valid: false,
          message: `Invoice verification failed: ${error.response.data.message || error.message}`
        };
      }

      // Network or other errors
      return {
        valid: false,
        message: 'Invoice verification failed due to a network or server error'
      };
    }
  }

  /**
   * Check if a string follows the correct GSTIN format
   * 
   * @param gstin - The GST identification number to validate
   * @returns boolean indicating if the format is valid
   */
  isValidGSTINFormat(gstin: string): boolean {
    // GSTIN must be 15 characters long
    if (!gstin || typeof gstin !== 'string' || gstin.length !== 15) {
      return false;
    }
    
    return gstinRegex.test(gstin.toUpperCase());
  }

  /**
   * Calculates the checksum digit for a GSTIN
   * Used for local validation without API calls
   * 
   * @param gstin - The GST identification number (without the last checksum digit)
   * @returns The calculated checksum character
   */
  calculateChecksumDigit(gstin: string): string {
    // GSTIN is 15 chars, we need the first 14 to calculate the checksum
    if (!gstin || gstin.length < 14) {
      throw new Error('Invalid GSTIN provided for checksum calculation');
    }

    const input = gstin.substring(0, 14).toUpperCase();
    
    // Factors for each position in the GSTIN
    const factors = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
    
    let sum = 0;
    
    // Calculate weighted sum
    for (let i = 0; i < 14; i++) {
      let charValue: number;
      const char = input.charAt(i);
      
      // Handle numeric vs alphabetic characters
      if (/\d/.test(char)) {
        charValue = parseInt(char, 10);
      } else {
        // A=10, B=11, etc.
        charValue = char.charCodeAt(0) - 55;
      }
      
      // Apply factor
      let product = charValue * factors[i];
      
      // Sum digits of product for values >= 10
      if (product >= 10) {
        product = Math.floor(product / 10) + (product % 10);
      }
      
      sum += product;
    }
    
    // Calculate checksum: (Ceiling of sum to next 10 - sum) % 10
    const checksum = (Math.ceil(sum / 10) * 10 - sum) % 10;
    
    // Convert checksum to character
    return checksum.toString();
  }

  /**
   * Gets the state name corresponding to a GST state code
   * 
   * @param stateCode - The 2-digit state code from a GSTIN
   * @returns The name of the state
   */
  getStateNameFromCode(stateCode: string): string {
    const states: Record<string, string> = {
      '01': 'Jammu and Kashmir',
      '02': 'Himachal Pradesh',
      '03': 'Punjab',
      '04': 'Chandigarh',
      '05': 'Uttarakhand',
      '06': 'Haryana',
      '07': 'Delhi',
      '08': 'Rajasthan',
      '09': 'Uttar Pradesh',
      '10': 'Bihar',
      '11': 'Sikkim',
      '12': 'Arunachal Pradesh',
      '13': 'Nagaland',
      '14': 'Manipur',
      '15': 'Mizoram',
      '16': 'Tripura',
      '17': 'Meghalaya',
      '18': 'Assam',
      '19': 'West Bengal',
      '20': 'Jharkhand',
      '21': 'Odisha',
      '22': 'Chhattisgarh',
      '23': 'Madhya Pradesh',
      '24': 'Gujarat',
      '26': 'Dadra and Nagar Haveli and Daman and Diu',
      '27': 'Maharashtra',
      '28': 'Andhra Pradesh',
      '29': 'Karnataka',
      '30': 'Goa',
      '31': 'Lakshadweep',
      '32': 'Kerala',
      '33': 'Tamil Nadu',
      '34': 'Puducherry',
      '35': 'Andaman and Nicobar Islands',
      '36': 'Telangana',
      '37': 'Ladakh',
      '38': 'Other Territory'
    };
    
    return states[stateCode] || 'Unknown State';
  }
}

export interface GSTValidationResult {
  valid: boolean;
  message: string;
  gstin?: string;
  legal_name?: string;
  trade_name?: string;
  address?: string;
  state_code?: string;
  state_name?: string;
  business_type?: string;
  tax_payer_type?: string;
  status?: string;
  registration_date?: string;
}

export interface BulkGSTValidationResult {
  success: boolean;
  message: string;
  results: GSTValidationResult[];
}

export interface GSTBusinessDetailsResult {
  success: boolean;
  message: string;
  gstin?: string;
  business_details?: {
    legal_name: string;
    trade_name: string;
    address: string;
    business_type: string;
    constitution: string;
    status: string;
    registration_date: string;
    cancellation_date?: string;
    last_updated?: string;
  };
  filing_history?: Array<{
    return_period: string;
    filing_date: string;
    return_type: string;
    status: string;
  }>;
  compliance_rating?: number;
}

export interface GSTInvoiceVerificationResult {
  valid: boolean;
  message: string;
  gstin?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  filing_status?: 'FILED' | 'NOT_FILED' | 'UNKNOWN';
}

const gstValidationService = new GSTValidationService();
export default gstValidationService;