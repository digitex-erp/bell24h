/**
 * GST (Goods and Services Tax) Validation Service
 * 
 * This module provides functions to validate GST numbers and retrieve business details.
 * In a production environment, this would connect to the official GST portal API.
 * For this demo, it uses pattern validation and simulated responses.
 */

/**
 * Validate a GST number format
 * @param gstNumber GST number to validate
 * @returns Boolean indicating if the format is valid
 */
export function isValidGSTFormat(gstNumber: string): boolean {
  // GST number format: 2 digit state code + PAN (10 chars) + entity number (1 digit) + Z (check digit)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstNumber);
}

/**
 * Validate a GST number
 * @param gstNumber GST number to validate
 * @returns Validation result
 */
export async function validateGST(gstNumber: string): Promise<GSTValidationResult> {
  try {
    // First check the format
    if (!isValidGSTFormat(gstNumber)) {
      return {
        valid: false,
        message: 'Invalid GST number format',
      };
    }
    
    // In a real implementation, this would make an API call to the GST portal
    // For demo purposes, we'll simulate a successful validation
    // We'll consider a small percentage of valid format numbers as "invalid" to simulate real-world scenarios
    
    // Extract the state code
    const stateCode = gstNumber.substring(0, 2);
    
    // Get the state name
    const state = getStateFromCode(stateCode);
    
    // Create a deterministic "validation" based on the number
    const lastDigitSum = gstNumber.split('').reduce((sum, char) => {
      return sum + (char.charCodeAt(0) % 10);
    }, 0);
    
    // Simulate ~10% failure rate for valid format numbers
    const isValid = lastDigitSum % 10 !== 9;
    
    if (isValid) {
      return {
        valid: true,
        message: 'GST number validated successfully',
        businessDetails: {
          name: `Business ${gstNumber.substring(2, 7)}`,
          address: `123 Business Street, ${state}`,
          type: getBusinessType(gstNumber),
          registrationDate: getRandomPastDate(3 * 365), // Within last 3 years
          status: 'Active'
        }
      };
    } else {
      return {
        valid: false,
        message: 'GST number not found in registry',
      };
    }
  } catch (error) {
    console.error('Error validating GST number:', error);
    throw new Error('GST validation service error');
  }
}

/**
 * Get business details by GST number
 * @param gstNumber GST number
 * @returns Business details
 */
export async function getBusinessDetails(gstNumber: string): Promise<BusinessDetails | null> {
  const result = await validateGST(gstNumber);
  return result.valid ? result.businessDetails! : null;
}

/**
 * Verify an invoice using GST details
 * @param invoiceDetails Invoice details
 * @returns Verification result
 */
export async function verifyInvoice(invoiceDetails: InvoiceDetails): Promise<InvoiceVerificationResult> {
  // Validate the GST number
  const gstValidation = await validateGST(invoiceDetails.gstNumber);
  
  if (!gstValidation.valid) {
    return {
      valid: false,
      message: 'Invalid GST number on invoice',
    };
  }
  
  // In a real system, this would check the invoice against the GST portal
  // For demo, we'll simulate verification
  
  // Simple validation rules
  const validAmount = invoiceDetails.amount > 0;
  const validDate = new Date(invoiceDetails.date) <= new Date();
  
  if (!validAmount || !validDate) {
    return {
      valid: false,
      message: !validAmount ? 'Invalid invoice amount' : 'Invalid invoice date',
    };
  }
  
  return {
    valid: true,
    message: 'Invoice verified successfully',
    verificationId: `VER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    verificationDate: new Date().toISOString(),
  };
}

// ---- Helper functions ----

/**
 * Get state name from state code
 */
function getStateFromCode(code: string): string {
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
    '27': 'Maharashtra',
    '29': 'Karnataka',
    '30': 'Goa',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '36': 'Telangana',
    '37': 'Andhra Pradesh',
  };
  
  return states[code] || 'Unknown State';
}

/**
 * Get business type based on GST number
 */
function getBusinessType(gstNumber: string): string {
  // In a real implementation, the business type might be determined from the GST number
  // or returned by the GST API
  
  // For demo, we'll return a random business type
  const types = [
    'Private Limited Company',
    'Public Limited Company',
    'Limited Liability Partnership',
    'Partnership Firm',
    'Proprietorship',
    'HUF',
    'Society/Trust/Club',
  ];
  
  // Use a deterministic method to select a type based on the GST number
  const sum = gstNumber.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return types[sum % types.length];
}

/**
 * Get a random date in the past
 * @param maxDays Maximum number of days in the past
 * @returns ISO date string
 */
function getRandomPastDate(maxDays: number): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * maxDays);
  const pastDate = new Date(now.setDate(now.getDate() - daysAgo));
  return pastDate.toISOString().split('T')[0];
}

// ---- Type definitions ----

export interface GSTValidationResult {
  valid: boolean;
  message: string;
  businessDetails?: BusinessDetails;
}

export interface BusinessDetails {
  name: string;
  address: string;
  type: string;
  registrationDate: string;
  status: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  gstNumber: string;
  date: string;
  amount: number;
  description?: string;
}

export interface InvoiceVerificationResult {
  valid: boolean;
  message: string;
  verificationId?: string;
  verificationDate?: string;
}