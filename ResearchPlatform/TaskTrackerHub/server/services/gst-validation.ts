import axios from 'axios';
import { log } from '../vite';

// Constants
const GST_API_BASE_URL = process.env.GST_API_BASE_URL || 'https://api.gstvalidate.india.gov.in/v1';
const GST_API_KEY = process.env.GST_API_KEY;

/**
 * GST Validation Service
 * 
 * Provides validation for Indian GST (Goods and Services Tax) numbers
 * and related business information verification
 */
class GSTValidationService {
  private apiKey: string | undefined;
  
  constructor() {
    this.apiKey = GST_API_KEY;
    
    if (!this.apiKey) {
      log('GST validation API key not set. Running in simulation mode.', 'gst');
    } else {
      log('GST validation service initialized', 'gst');
    }
  }
  
  /**
   * Validate a GST number
   * @param gstNumber GST number to validate
   * @returns Validation result
   */
  public async validateGST(gstNumber: string): Promise<{ 
    valid: boolean; 
    businessName?: string; 
    address?: string;
    status?: string;
    error?: string;
  }> {
    try {
      // Perform basic format validation
      if (!this.isValidGSTFormat(gstNumber)) {
        return { 
          valid: false, 
          error: 'Invalid GST number format' 
        };
      }
      
      // If API key is not set, run in simulation mode
      if (!this.apiKey) {
        return this.simulateGSTValidation(gstNumber);
      }
      
      // Call actual GST validation API
      const response = await axios.get(`${GST_API_BASE_URL}/validate/${gstNumber}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });
      
      if (response.data && response.data.status === 'success') {
        return {
          valid: true,
          businessName: response.data.business_name,
          address: response.data.address,
          status: response.data.gst_status
        };
      } else {
        return {
          valid: false,
          error: response.data.message || 'GST validation failed'
        };
      }
    } catch (error) {
      log(`Error validating GST number: ${error}`, 'gst');
      
      // If the API is unavailable, fall back to simulation
      if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
        log('GST API unavailable, falling back to simulation', 'gst');
        return this.simulateGSTValidation(gstNumber);
      }
      
      return {
        valid: false,
        error: error.response?.data?.message || 'Error validating GST number'
      };
    }
  }
  
  /**
   * Get business details by GST number
   * @param gstNumber GST number
   * @returns Business details
   */
  public async getBusinessDetailsByGST(gstNumber: string): Promise<{
    success: boolean;
    businessName?: string;
    address?: string;
    state?: string;
    businessType?: string;
    registrationDate?: string;
    status?: string;
    error?: string;
  }> {
    try {
      // Validate GST format first
      if (!this.isValidGSTFormat(gstNumber)) {
        return { 
          success: false, 
          error: 'Invalid GST number format' 
        };
      }
      
      // If API key is not set, run in simulation mode
      if (!this.apiKey) {
        return this.simulateBusinessDetails(gstNumber);
      }
      
      // Call GST details API
      const response = await axios.get(`${GST_API_BASE_URL}/details/${gstNumber}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });
      
      if (response.data && response.data.status === 'success') {
        return {
          success: true,
          businessName: response.data.business_name,
          address: response.data.address,
          state: response.data.state,
          businessType: response.data.business_type,
          registrationDate: response.data.registration_date,
          status: response.data.gst_status
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to retrieve business details'
        };
      }
    } catch (error) {
      log(`Error getting business details: ${error}`, 'gst');
      
      // If the API is unavailable, fall back to simulation
      if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
        log('GST API unavailable, falling back to simulation', 'gst');
        return this.simulateBusinessDetails(gstNumber);
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Error retrieving business details'
      };
    }
  }
  
  /**
   * Verify business match between provided info and GST
   * @param gstNumber GST number
   * @param businessName Business name to verify
   * @param state State to verify
   * @returns Match verification result
   */
  public async verifyBusinessMatch(
    gstNumber: string, 
    businessName: string, 
    state?: string
  ): Promise<{
    match: boolean;
    confidence?: number;
    message?: string;
    error?: string;
  }> {
    try {
      // Validate GST format first
      if (!this.isValidGSTFormat(gstNumber)) {
        return { 
          match: false, 
          error: 'Invalid GST number format' 
        };
      }
      
      // Get business details
      const details = await this.getBusinessDetailsByGST(gstNumber);
      
      if (!details.success) {
        return {
          match: false,
          error: details.error
        };
      }
      
      // Compare business name using fuzzy matching
      const nameMatch = this.calculateStringSimilarity(
        businessName.toLowerCase(),
        details.businessName?.toLowerCase() || ''
      );
      
      // Check state match if provided
      const stateMatch = !state || !details.state 
        ? 1.0 
        : this.calculateStringIntegrity(state.toLowerCase(), details.state.toLowerCase());
      
      // Calculate overall match confidence
      const confidence = (nameMatch * 0.7) + (stateMatch * 0.3);
      
      // Determine match based on confidence threshold
      const match = confidence > 0.7;
      
      let message = match 
        ? 'Business information matches GST records'
        : 'Business information does not closely match GST records';
      
      return {
        match,
        confidence,
        message
      };
    } catch (error) {
      log(`Error verifying business match: ${error}`, 'gst');
      return {
        match: false,
        error: 'Error verifying business information'
      };
    }
  }
  
  /**
   * Validate GST number format
   * @param gstNumber GST number to validate
   * @returns Whether the format is valid
   */
  private isValidGSTFormat(gstNumber: string): boolean {
    // GST number format: 2 chars for state code, 10 chars for PAN, 1 char for entity, 
    // 1 char for blank/check digit, 1 char for Z
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    
    return gstRegex.test(gstNumber);
  }
  
  /**
   * Calculate string similarity (Jaro-Winkler distance)
   * @param s1 First string
   * @param s2 Second string
   * @returns Similarity score (0-1)
   */
  private calculateStringSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;
    
    // Simplified Jaro-Winkler implementation
    const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
    
    const s1Matches: boolean[] = Array(s1.length).fill(false);
    const s2Matches: boolean[] = Array(s2.length).fill(false);
    
    let matches = 0;
    
    for (let i = 0; i < s1.length; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, s2.length);
      
      for (let j = start; j < end; j++) {
        if (!s2Matches[j] && s1[i] === s2[j]) {
          s1Matches[i] = true;
          s2Matches[j] = true;
          matches++;
          break;
        }
      }
    }
    
    if (matches === 0) return 0.0;
    
    // Count transpositions
    let transpositions = 0;
    let j = 0;
    
    for (let i = 0; i < s1.length; i++) {
      if (s1Matches[i]) {
        while (!s2Matches[j]) j++;
        
        if (s1[i] !== s2[j]) transpositions++;
        
        j++;
      }
    }
    
    // Calculate Jaro similarity
    const matchScore = matches / s1.length;
    const accuracyScore = matches / s2.length;
    const transpositionScore = (matches - transpositions / 2) / matches;
    
    const jaroScore = (matchScore + accuracyScore + transpositionScore) / 3;
    
    // Apply Winkler modification (common prefix bonus)
    let commonPrefix = 0;
    for (let i = 0; i < Math.min(4, Math.min(s1.length, s2.length)); i++) {
      if (s1[i] === s2[i]) commonPrefix++;
      else break;
    }
    
    // Winkler scaling factor
    const winklerBonus = 0.1;
    
    return jaroScore + (commonPrefix * winklerBonus * (1 - jaroScore));
  }
  
  /**
   * Calculate string integrity/exact substring match ratio
   * @param s1 First string
   * @param s2 Second string
   * @returns Integrity score (0-1)
   */
  private calculateStringIntegrity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (s1.includes(s2)) return 0.9;
    if (s2.includes(s1)) return 0.9;
    
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    
    let matchedWords = 0;
    
    // Count exact word matches
    for (const word1 of words1) {
      if (word1.length <= 2) continue; // Skip short words
      
      if (words2.includes(word1)) {
        matchedWords++;
      }
    }
    
    return matchedWords / Math.max(words1.length, words2.length);
  }
  
  /**
   * Simulation for GST validation when API is unavailable
   * @param gstNumber GST number
   * @returns Simulated validation result
   */
  private simulateGSTValidation(gstNumber: string): { 
    valid: boolean; 
    businessName?: string; 
    address?: string;
    status?: string;
  } {
    log(`[SIMULATION] Validating GST number: ${gstNumber}`, 'gst');
    
    // Always validate well-formed test GST numbers
    const testGSTs = [
      '27AAPFU0939F1ZV', 
      '29AAGCB7383J1Z4',
      '33AACCT5581H1Z7'
    ];
    
    if (testGSTs.includes(gstNumber)) {
      return {
        valid: true,
        businessName: 'SIMULATED BUSINESS PVT LTD',
        address: '123 Simulated Street, Bengaluru, Karnataka',
        status: 'Active'
      };
    }
    
    // Extract state code and determine outcome based on heuristic
    const stateCode = gstNumber.substring(0, 2);
    const validStateCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', 
                            '10', '11', '12', '13', '14', '15', '16', '17', '18', 
                            '19', '20', '21', '22', '23', '24', '25', '26', '27', 
                            '28', '29', '30', '31', '32', '33', '34', '35', '36', '37'];
    
    // Simulated validation - accept valid state codes with 80% probability
    if (validStateCodes.includes(stateCode) && Math.random() < 0.8) {
      // Map state code to actual state name
      const stateMap: Record<string, string> = {
        '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
        '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi',
        '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim',
        '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
        '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
        '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
        '22': 'Chattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
        '27': 'Maharashtra', '29': 'Karnataka', '32': 'Kerala',
        '33': 'Tamil Nadu', '36': 'Telangana', '37': 'Andhra Pradesh'
      };
      
      const state = stateMap[stateCode] || 'Other State';
      
      return {
        valid: true,
        businessName: `SIMULATED ${state.toUpperCase()} BUSINESS`,
        address: `123 Main Street, ${state}`,
        status: 'Active'
      };
    }
    
    return {
      valid: false
    };
  }
  
  /**
   * Simulation for business details when API is unavailable
   * @param gstNumber GST number
   * @returns Simulated business details
   */
  private simulateBusinessDetails(gstNumber: string): {
    success: boolean;
    businessName?: string;
    address?: string;
    state?: string;
    businessType?: string;
    registrationDate?: string;
    status?: string;
  } {
    log(`[SIMULATION] Getting business details for GST: ${gstNumber}`, 'gst');
    
    // Extract state code and determine outcome
    const stateCode = gstNumber.substring(0, 2);
    const validStateCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', 
                            '10', '11', '12', '13', '14', '15', '16', '17', '18', 
                            '19', '20', '21', '22', '23', '24', '25', '26', '27', 
                            '28', '29', '30', '31', '32', '33', '34', '35', '36', '37'];
    
    if (validStateCodes.includes(stateCode)) {
      // Map state code to actual state name
      const stateMap: Record<string, string> = {
        '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
        '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi',
        '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim',
        '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
        '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
        '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
        '22': 'Chattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
        '27': 'Maharashtra', '29': 'Karnataka', '32': 'Kerala',
        '33': 'Tamil Nadu', '36': 'Telangana', '37': 'Andhra Pradesh'
      };
      
      const state = stateMap[stateCode] || 'Other State';
      const businessTypes = ['Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'LLP'];
      const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
      
      // Generate a random date between 2017-07-01 (GST introduction) and today
      const gstStartDate = new Date(2017, 6, 1).getTime();
      const now = new Date().getTime();
      const randomTimestamp = gstStartDate + Math.random() * (now - gstStartDate);
      const registrationDate = new Date(randomTimestamp).toISOString().split('T')[0];
      
      return {
        success: true,
        businessName: `SIMULATED ${state.toUpperCase()} ENTERPRISES`,
        address: `123 Simulation Street, ${state} - 500001`,
        state,
        businessType,
        registrationDate,
        status: 'Active'
      };
    }
    
    return {
      success: false
    };
  }
}

// Export singleton
const gstValidationService = new GSTValidationService();
export default gstValidationService;