import { polygonService } from './polygon-integration.js';

// Interfaces for credential verification
interface VerificationResult {
  success: boolean;
  verificationId?: string;
  transactionHash?: string;
  ipfsHash?: string;
  message: string;
  details?: any;
}

interface CredentialMetadata {
  credentialType: string;
  credentialValue: string;
  businessName: string;
  businessAddress: string;
  verificationSource: string;
  verificationDate: string;
  expiryDate?: string;
  issuer?: string;
  additionalData?: Record<string, any>;
}

/**
 * Service for verifying business credentials on the blockchain
 * Supports GSTIN, ISO, and other business certifications
 */
export class CredentialVerificationService {
  constructor() {
    // Load contract address from environment or config
  }

  /**
   * Verify a GSTIN (Goods and Services Tax Identification Number)
   * @param gstin GSTIN number to verify
   * @param businessAddress Blockchain address of the business
   * @param businessName Name of the business
   */
  async verifyGSTIN(
    gstin: string,
    businessAddress: string,
    businessName: string
  ): Promise<VerificationResult> {
    try {
      // Validate GSTIN format
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstin || !gstinRegex.test(gstin)) {
        return {
          success: false,
          message: 'Invalid GSTIN format. Must follow the standard 15-character format.'
        };
      }

      // Before recording on blockchain, we would verify with the GST Portal
      // This is a placeholder for the actual verification API call
      const gstVerificationResult = await this.verifyGSTINWithGovernmentAPI(gstin);
      
      if (!gstVerificationResult.success) {
        return {
          success: false,
          message: gstVerificationResult.message
        };
      }
      
      // Prepare metadata for blockchain storage
      const metadata: CredentialMetadata = {
        credentialType: 'GSTIN',
        credentialValue: gstin,
        businessName: businessName,
        businessAddress: businessAddress,
        verificationSource: 'GST Portal',
        verificationDate: new Date().toISOString(),
        additionalData: gstVerificationResult.details
      };
      
      // Store metadata on IPFS or other decentralized storage
      const metadataURI = await this.storeMetadataForCredential(metadata);
      
      // Record verification on blockchain
      const result = await polygonService.recordCredentialVerification(
        'GSTIN',
        gstin,
        businessAddress,
        metadataURI
      );
      
      return {
        success: true,
        verificationId: result.verificationId,
        transactionHash: result.transactionHash,
        ipfsHash: metadataURI.replace('ipfs://', ''),
        message: 'GSTIN verified successfully and recorded on blockchain',
        details: gstVerificationResult.details
      };
    } catch (error: any) {
      console.error('Error verifying GSTIN:', error);
      return {
        success: false,
        message: `GSTIN verification failed: ${error.message}`
      };
    }
  }

  /**
   * Verify an ISO certification
   * @param isoNumber ISO certification number
   * @param isoType Type of ISO certification (e.g., "ISO9001", "ISO14001")
   * @param businessAddress Blockchain address of the business
   * @param businessName Name of the business
   * @param issuer Name of the certification body
   * @param expiryDate Expiration date of the certification
   */
  async verifyISO(
    isoNumber: string,
    isoType: string,
    businessAddress: string,
    businessName: string,
    issuer: string,
    expiryDate?: string
  ): Promise<VerificationResult> {
    try {
      // Basic validation
      if (!isoNumber || isoNumber.length < 5) {
        return {
          success: false,
          message: 'Invalid ISO certification number'
        };
      }

      if (!isoType) {
        isoType = 'ISO9001'; // Default if not specified
      }

      // In a real implementation, we would verify with ISO certification bodies
      // This is a placeholder for that verification
      const isoVerificationResult = await this.verifyISOWithCertificateAuthority(
        isoNumber,
        isoType,
        issuer
      );
      
      if (!isoVerificationResult.success) {
        return {
          success: false,
          message: isoVerificationResult.message
        };
      }
      
      // Prepare metadata for blockchain storage
      const metadata: CredentialMetadata = {
        credentialType: isoType,
        credentialValue: isoNumber,
        businessName: businessName,
        businessAddress: businessAddress,
        verificationSource: issuer,
        verificationDate: new Date().toISOString(),
        expiryDate: expiryDate,
        issuer: issuer,
        additionalData: isoVerificationResult.details
      };
      
      // Store metadata on IPFS or other decentralized storage
      const metadataURI = await this.storeMetadataForCredential(metadata);
      
      // Record verification on blockchain
      const result = await polygonService.recordCredentialVerification(
        isoType,
        isoNumber,
        businessAddress,
        metadataURI
      );
      
      return {
        success: true,
        verificationId: result.verificationId,
        transactionHash: result.transactionHash,
        ipfsHash: metadataURI.replace('ipfs://', ''),
        message: `${isoType} certification verified successfully and recorded on blockchain`,
        details: isoVerificationResult.details
      };
    } catch (error: any) {
      console.error('Error verifying ISO certification:', error);
      return {
        success: false,
        message: `ISO verification failed: ${error.message}`
      };
    }
  }

  /**
   * Verify an Udyam Registration certificate
   * @param udyamNumber Udyam registration number
   * @param businessAddress Blockchain address of the business
   * @param businessName Name of the business
   */
  async verifyUdyam(
    udyamNumber: string,
    businessAddress: string,
    businessName: string
  ): Promise<VerificationResult> {
    try {
      // Validate Udyam format (UDYAM-XX-XX-XXXXXXX)
      const udyamRegex = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;
      if (!udyamNumber || !udyamRegex.test(udyamNumber)) {
        return {
          success: false,
          message: 'Invalid Udyam registration number format. Should follow UDYAM-XX-XX-XXXXXXX pattern.'
        };
      }

      // Verify with Udyam portal API
      const udyamVerificationResult = await this.verifyUdyamWithGovernmentAPI(udyamNumber);
      
      if (!udyamVerificationResult.success) {
        return {
          success: false,
          message: udyamVerificationResult.message
        };
      }
      
      // Prepare metadata for blockchain storage
      const metadata: CredentialMetadata = {
        credentialType: 'UDYAM',
        credentialValue: udyamNumber,
        businessName: businessName,
        businessAddress: businessAddress,
        verificationSource: 'Udyam Portal',
        verificationDate: new Date().toISOString(),
        additionalData: udyamVerificationResult.details
      };
      
      // Store metadata on IPFS or other decentralized storage
      const metadataURI = await this.storeMetadataForCredential(metadata);
      
      // Record verification on blockchain
      const result = await polygonService.recordCredentialVerification(
        'UDYAM',
        udyamNumber,
        businessAddress,
        metadataURI
      );
      
      return {
        success: true,
        verificationId: result.verificationId,
        transactionHash: result.transactionHash,
        ipfsHash: metadataURI.replace('ipfs://', ''),
        message: 'Udyam registration verified successfully and recorded on blockchain',
        details: udyamVerificationResult.details
      };
    } catch (error: any) {
      console.error('Error verifying Udyam registration:', error);
      return {
        success: false,
        message: `Udyam verification failed: ${error.message}`
      };
    }
  }

  /**
   * Check verification status of a credential
   * @param verificationId The blockchain verification ID
   */
  async checkVerificationStatus(verificationId: string): Promise<{
    isValid: boolean;
    verificationDate: string;
    verifier: string;
    metadata: CredentialMetadata | null;
  }> {
    try {
      // Get verification details from blockchain
      const details = await polygonService.getCredentialVerificationDetails(verificationId);
      
      // If we have a metadata URI, fetch it
      let metadata = null;
      if (details.metadataURI) {
        metadata = await this.fetchMetadataFromURI(details.metadataURI);
      }
      
      return {
        isValid: details.isValid,
        verificationDate: new Date(details.timestamp * 1000).toISOString(),
        verifier: details.verifier,
        metadata
      };
    } catch (error: any) {
      console.error('Error checking verification status:', error);
      throw new Error(`Failed to check verification status: ${error.message}`);
    }
  }

  /**
   * Check if a business has a specific verified credential
   * @param businessAddress Blockchain address of the business
   * @param credentialType Type of credential to check (e.g., 'GSTIN', 'ISO9001')
   */
  async businessHasCredential(
    businessAddress: string,
    credentialType: string
  ): Promise<boolean> {
    try {
      return await polygonService.hasBusinessCredential(businessAddress, credentialType);
    } catch (error) {
      console.error(`Error checking if business has ${credentialType}:`, error);
      return false;
    }
  }

  // Private methods for interacting with verification APIs

  /**
   * Verify GSTIN with government GST Portal
   * @private
   */
  private async verifyGSTINWithGovernmentAPI(gstin: string): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      // In a production environment, this would call the actual GST Portal API
      // For now, we'll simulate a successful verification
      
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extract state code from GSTIN (first two digits)
      const stateCode = gstin.substring(0, 2);
      
      // Map state code to state name (simplified)
      const stateMap: Record<string, string> = {
        '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
        '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
        '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
        '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
        '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
        '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
        '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
        '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
        '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra',
        '28': 'Andhra Pradesh', '29': 'Karnataka', '30': 'Goa',
        '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
        '34': 'Puducherry', '35': 'Andaman and Nicobar Islands',
        '36': 'Telangana', '37': 'Andhra Pradesh (New)', '38': 'Ladakh'
      };
      
      const state = stateMap[stateCode] || 'Unknown State';
      
      // Generate simulated verification details
      const details = {
        gstin: gstin,
        tradeName: `Business ${gstin.substring(5, 9)}`,
        legalName: `Company ${gstin.substring(5, 9)} Pvt Ltd`,
        status: 'Active',
        registrationDate: '2019-04-01',
        businessType: 'Private Limited Company',
        state: state,
        center: 'Center Jurisdiction',
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        success: true,
        message: 'GSTIN verification successful',
        details
      };
    } catch (error: any) {
      console.error('Error verifying GSTIN with government API:', error);
      return {
        success: false,
        message: `Failed to verify GSTIN with GST Portal: ${error.message}`
      };
    }
  }

  /**
   * Verify ISO certification with certification authority
   * @private
   */
  private async verifyISOWithCertificateAuthority(
    isoNumber: string,
    isoType: string,
    issuer: string
  ): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      // In a production environment, this would verify with the certification authority
      // For now, we'll simulate a successful verification
      
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Get description based on ISO type
      const isoDescriptions: Record<string, string> = {
        'ISO9001': 'Quality Management System',
        'ISO14001': 'Environmental Management System',
        'ISO27001': 'Information Security Management',
        'ISO45001': 'Occupational Health and Safety',
        'ISO22000': 'Food Safety Management'
      };
      
      const description = isoDescriptions[isoType] || 'International Standard';
      
      // Generate simulated verification details
      const details = {
        certificateNumber: isoNumber,
        standardType: isoType,
        description: description,
        issuer: issuer,
        issueDate: '2022-06-15',
        expiryDate: '2025-06-14',
        status: 'Valid',
        scope: 'Full organization compliance',
        lastVerified: new Date().toISOString(),
      };
      
      return {
        success: true,
        message: `${isoType} certification verification successful`,
        details
      };
    } catch (error: any) {
      console.error('Error verifying ISO certification:', error);
      return {
        success: false,
        message: `Failed to verify ${isoType} certification: ${error.message}`
      };
    }
  }

  /**
   * Verify Udyam registration with government API
   * @private
   */
  private async verifyUdyamWithGovernmentAPI(udyamNumber: string): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      // In a production environment, this would call the Udyam Portal API
      // For now, we'll simulate a successful verification
      
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate enterprise size based on Udyam number
      const lastDigit = parseInt(udyamNumber.charAt(udyamNumber.length - 1));
      let enterpriseSize: string;
      
      if (lastDigit <= 3) {
        enterpriseSize = 'Micro';
      } else if (lastDigit <= 6) {
        enterpriseSize = 'Small';
      } else {
        enterpriseSize = 'Medium';
      }
      
      // Generate simulated verification details
      const details = {
        udyamNumber: udyamNumber,
        enterpriseName: `Enterprise ${udyamNumber.substring(10, 15)}`,
        dateOfRegistration: '2021-05-20',
        enterpriseSize: enterpriseSize,
        majorActivity: lastDigit % 2 === 0 ? 'Manufacturing' : 'Service',
        state: 'Maharashtra', // Example state
        district: 'Mumbai',
        status: 'Active',
        lastUpdated: new Date().toISOString(),
      };
      
      return {
        success: true,
        message: 'Udyam registration verification successful',
        details
      };
    } catch (error: any) {
      console.error('Error verifying Udyam registration:', error);
      return {
        success: false,
        message: `Failed to verify Udyam registration: ${error.message}`
      };
    }
  }

  /**
   * Store credential metadata (would use IPFS in production)
   * @private
   */
  private async storeMetadataForCredential(metadata: CredentialMetadata): Promise<string> {
    // In a production environment, this would store metadata on IPFS or similar
    // For now, we'll simulate storing and return a fake IPFS hash
    try {
      // Simulate IPFS storage delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a deterministic but fake IPFS hash based on the data
      const dataString = JSON.stringify(metadata);
      const fakeHash = Buffer.from(dataString).toString('base64').substring(0, 46);
      
      return `ipfs://${fakeHash}`;
    } catch (error) {
      console.error('Error storing credential metadata:', error);
      // Return a fallback URI with the credential type and value
      return `local://${metadata.credentialType.toLowerCase()}/${metadata.credentialValue}`;
    }
  }

  /**
   * Fetch metadata from URI (IPFS or other storage)
   * @private
   */
  private async fetchMetadataFromURI(uri: string): Promise<CredentialMetadata | null> {
    // In a production environment, this would fetch from IPFS or similar
    // For now, we'll return simulated data
    try {
      if (uri.startsWith('ipfs://')) {
        const hash = uri.replace('ipfs://', '');
        
        // In production, would be:
        // const response = await axios.get(`${this.ipfsGateway}${hash}`);
        // return response.data;
        
        // For simulation, we'll just return a basic metadata object
        return {
          credentialType: 'SIMULATED',
          credentialValue: hash.substring(0, 10),
          businessName: 'Simulated Business',
          businessAddress: '0x' + hash.substring(0, 40),
          verificationSource: 'Simulation',
          verificationDate: new Date().toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching metadata from URI:', error);
      return null;
    }
  }
}

// Export singleton instance
export const credentialVerificationService = new CredentialVerificationService();
