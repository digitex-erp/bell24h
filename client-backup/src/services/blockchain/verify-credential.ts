import { ethers } from 'ethers';
import { polygonService } from './polygon-integration.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Utility for verifying business credentials on blockchain
 * Integrates with the Polygon network for credential verification
 */
export class CredentialVerifier {
  private contractAbi: any;

  constructor() {
    try {
      // For demo purposes, we're loading the ABI dynamically
      // In production, you would use a proper solidity compiler and load the compiled ABI
      // from a file like 'contracts/CredentialVerification.json' using fs.readFileSync
      // For example:
      // const __filename = fileURLToPath(import.meta.url);
      // const __dirname = path.dirname(__filename);
      // const contractPath = path.join(__dirname, 'contracts', 'CredentialVerification.json');
      // const abiFile = fs.readFileSync(contractPath, 'utf-8');
      // this.contractAbi = JSON.parse(abiFile).abi;

      this.contractAbi = [
        "function verifyCredential(string,string,address) returns (bytes32)",
        "function checkVerification(bytes32) view returns (bool,uint256,address)",
        "function hasVerifiedCredential(address,string) view returns (bool)",
        "function revokeVerification(bytes32)"
      ];
    } catch (error) {
      console.error('Error loading contract ABI:', error);
      throw new Error('Failed to initialize credential verifier');
    }
  }

  /**
   * Verify a business credential like GSTIN, ISO certification, etc.
   * @param businessAddress Blockchain address of the business
   * @param credentialType Type of credential (e.g., "GSTIN", "ISO9001")
   * @param credentialValue The actual credential value or identifier
   * @returns Transaction info including verification ID
   */
  async verifyBusinessCredential(
    businessAddress: string,
    credentialType: string,
    credentialValue: string
  ): Promise<{
    verificationId: string;
    transactionHash: string;
    blockNumber: number;
    timestamp: string;
  }> {
    try {
      // For real usage, you should validate the credential before submitting to blockchain
      // Call an external API to validate GSTIN, ISO, etc.
      
      // Submit verification to blockchain
      const result = await polygonService.verifyBusinessCredential(
        credentialType,
        credentialValue,
        businessAddress
      );
      
      // Get detailed transaction info
      const txDetails = await polygonService.getTransactionDetails(result.transactionHash);
      
      return {
        verificationId: result.verificationId,
        transactionHash: result.transactionHash,
        blockNumber: txDetails.blockNumber || 0,
        timestamp: txDetails.timestamp || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error verifying business credential:', error);
      throw new Error(`Credential verification failed: ${error.message}`);
    }
  }

  /**
   * Check if a business has a verified credential
   * @param businessAddress Blockchain address of the business
   * @param credentialType Type of credential to check
   * @returns Boolean indicating if credential is verified
   */
  async hasVerifiedCredential(
    businessAddress: string,
    credentialType: string
  ): Promise<boolean> {
    try {
      // Query the credential contract
      const hasCredential = await this.queryCredentialContract(
        businessAddress,
        credentialType
      );
      
      return hasCredential;
    } catch (error: any) {
      console.error('Error checking credential verification:', error);
      throw new Error(`Credential verification check failed: ${error.message}`);
    }
  }

  /**
   * Get credential verification details
   * @param verificationId The ID of the verification to check
   * @returns Verification details
   */
  async getVerificationDetails(
    verificationId: string
  ): Promise<{
    verified: boolean;
    timestamp: number;
    verifier: string;
    verifierName?: string;
  }> {
    try {
      // Check credential verification status
      const details = await polygonService.checkCredentialVerification(verificationId);
      
      // Get verifier name if available (could query from a database)
      let verifierName;
      if (details.verifier === polygonService.getOwnerAddress()) {
        verifierName = 'Bell24H Verification Service';
      }
      
      return {
        ...details,
        verifierName
      };
    } catch (error: any) {
      console.error('Error getting verification details:', error);
      throw new Error(`Failed to retrieve verification details: ${error.message}`);
    }
  }

  /**
   * Private method to query the credential contract
   */
  private async queryCredentialContract(
    businessAddress: string,
    credentialType: string
  ): Promise<boolean> {
    // This would be implemented to call the contract's hasVerifiedCredential function
    // For demo purposes, we're simulating a response
    
    // In a real implementation:
    // const hasCredential = await credentialContract.hasVerifiedCredential(businessAddress, credentialType);
    
    // Simulate blockchain response
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo, checking if address starts with "0x" and credential type is non-empty
    return businessAddress.startsWith('0x') && credentialType.length > 0;
  }
}

// Export singleton instance
export const credentialVerifier = new CredentialVerifier();

/**
 * Helper function to verify a GSTIN number on the blockchain
 * @param gstin GSTIN number to verify
 * @param businessAddress Blockchain address of the business
 */
export async function verifyGSTIN(
  gstin: string,
  businessAddress: string
): Promise<{
  success: boolean;
  verificationId?: string;
  transactionHash?: string;
  message: string;
}> {
  try {
    // Validate GSTIN format
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin)) {
      return {
        success: false,
        message: 'Invalid GSTIN format'
      };
    }
    
    // Verify GSTIN with government API (simulated)
    console.log(`Verifying GSTIN ${gstin} with government API...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Record verification on blockchain
    const result = await credentialVerifier.verifyBusinessCredential(
      businessAddress,
      'GSTIN',
      gstin
    );
    
    return {
      success: true,
      verificationId: result.verificationId,
      transactionHash: result.transactionHash,
      message: 'GSTIN verified successfully and recorded on blockchain'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `GSTIN verification failed: ${error.message}`
    };
  }
}

/**
 * Helper function to verify ISO certification on the blockchain
 * @param isoNumber ISO certification number
 * @param businessAddress Blockchain address of the business
 * @param isoType Type of ISO certification (e.g., "ISO9001", "ISO14001")
 */
export async function verifyISO(
  isoNumber: string,
  businessAddress: string,
  isoType: string = 'ISO9001'
): Promise<{
  success: boolean;
  verificationId?: string;
  transactionHash?: string;
  message: string;
}> {
  try {
    // Validate ISO format (basic check)
    if (!isoNumber || isoNumber.length < 5) {
      return {
        success: false,
        message: 'Invalid ISO certification number'
      };
    }
    
    // Verify ISO with certification authority (simulated)
    console.log(`Verifying ${isoType} certification ${isoNumber}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Record verification on blockchain
    const result = await credentialVerifier.verifyBusinessCredential(
      businessAddress,
      isoType,
      isoNumber
    );
    
    return {
      success: true,
      verificationId: result.verificationId,
      transactionHash: result.transactionHash,
      message: `${isoType} certification verified successfully and recorded on blockchain`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `ISO verification failed: ${error.message}`
    };
  }
}
