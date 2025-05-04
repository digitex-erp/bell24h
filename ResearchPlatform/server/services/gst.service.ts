import axios from 'axios';

export class GstService {
  private validateGSTINFormat(gstin: string): boolean {
    // Regex for GSTIN validation (15 characters)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  }

  private calculateChecksum(gstin: string): boolean {
    if (gstin.length !== 15) return false;
    
    // Last character is the checksum
    const providedChecksum = gstin.charAt(14);
    
    // Implement the checksum calculation algorithm
    // This is a simplified version - in production, use the actual algorithm
    const factor = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27];
    let total = 0;
    
    for (let i = 0; i < 14; i++) {
      let ascii = gstin.charCodeAt(i);
      
      if (48 <= ascii && ascii <= 57) {
        total += (ascii - 48) * factor[i];
      } else if (65 <= ascii && ascii <= 90) {
        total += (ascii - 55) * factor[i];
      } else {
        return false;
      }
    }
    
    const remainder = total % 36;
    const calculatedChecksum = remainder < 10 
      ? String.fromCharCode(remainder + 48) 
      : String.fromCharCode(remainder - 10 + 65);
    
    return calculatedChecksum === providedChecksum;
  }

  async validateGST(gstin: string): Promise<{
    valid: boolean;
    formatValid: boolean;
    checksumValid: boolean;
    message: string;
  }> {
    try {
      // First validate the format
      const formatValid = this.validateGSTINFormat(gstin);
      
      if (!formatValid) {
        return {
          valid: false,
          formatValid: false,
          checksumValid: false,
          message: 'Invalid GSTIN format',
        };
      }
      
      // Then validate the checksum
      const checksumValid = this.calculateChecksum(gstin);
      
      if (!checksumValid) {
        return {
          valid: false,
          formatValid: true,
          checksumValid: false,
          message: 'Invalid GSTIN checksum',
        };
      }
      
      // API call would go here in production
      // For now, we'll simulate a successful response
      return {
        valid: true,
        formatValid: true,
        checksumValid: true,
        message: 'Valid GSTIN',
      };
    } catch (error) {
      console.error('Error in validateGST:', error);
      throw new Error('Failed to validate GST');
    }
  }

  async getBusinessDetails(gstin: string): Promise<{
    gstin: string;
    businessName: string;
    address: string;
    registrationType: string;
    status: string;
  }> {
    try {
      // First validate the GSTIN
      const validation = await this.validateGST(gstin);
      
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // In a production environment, we would make an API call to get the business details
      // For now, we'll return mock data based on the GSTIN
      const stateCode = gstin.substring(0, 2);
      const panNumber = gstin.substring(2, 12);
      
      return {
        gstin,
        businessName: `Business with PAN ${panNumber}`,
        address: `Address in State with code ${stateCode}`,
        registrationType: 'Regular',
        status: 'Active',
      };
    } catch (error) {
      console.error('Error in getBusinessDetails:', error);
      throw new Error('Failed to get business details');
    }
  }

  async verifyInvoice(gstin: string, invoiceNumber: string, invoiceDate: string): Promise<{
    verified: boolean;
    gstin: string;
    invoiceNumber: string;
    invoiceDate: string;
    message: string;
  }> {
    try {
      // First validate the GSTIN
      const validation = await this.validateGST(gstin);
      
      if (!validation.valid) {
        return {
          verified: false,
          gstin,
          invoiceNumber,
          invoiceDate,
          message: validation.message,
        };
      }
      
      // In a production environment, we would verify the invoice against the GST database
      // For now, we'll simulate a successful verification
      return {
        verified: true,
        gstin,
        invoiceNumber,
        invoiceDate,
        message: 'Invoice verified successfully',
      };
    } catch (error) {
      console.error('Error in verifyInvoice:', error);
      throw new Error('Failed to verify invoice');
    }
  }

  async bulkValidateGST(gstinList: string[]): Promise<{
    overallStatus: string;
    results: Array<{
      gstin: string;
      valid: boolean;
      message: string;
    }>;
  }> {
    try {
      const results = await Promise.all(
        gstinList.map(async (gstin) => {
          try {
            const validation = await this.validateGST(gstin);
            return {
              gstin,
              valid: validation.valid,
              message: validation.message,
            };
          } catch (error) {
            return {
              gstin,
              valid: false,
              message: 'Validation failed',
            };
          }
        })
      );
      
      const validCount = results.filter(result => result.valid).length;
      
      return {
        overallStatus: `${validCount}/${gstinList.length} GSTINs valid`,
        results,
      };
    } catch (error) {
      console.error('Error in bulkValidateGST:', error);
      throw new Error('Failed to perform bulk GST validation');
    }
  }
}
