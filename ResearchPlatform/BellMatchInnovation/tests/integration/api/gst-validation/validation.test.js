/**
 * Integration tests for GST Validation API
 * 
 * These tests verify that the GST validation API endpoints work correctly
 * and handle various scenarios appropriately.
 */

const { expect } = require('chai');
const axios = require('axios');
const gstValidationService = require('../../../../server/services/gst-validation-service');

// Mock API responses for testing
const mockValidGSTResponse = {
  valid: true,
  message: "GSTIN validation successful",
  gstin: "27AADCB2230M1ZT",
  legal_name: "TEST COMPANY PVT LTD",
  trade_name: "TEST COMPANY",
  address: "123 TEST STREET, MUMBAI, MAHARASHTRA, 400001",
  state_code: "27",
  state_name: "Maharashtra",
  business_type: "Regular",
  tax_payer_type: "Regular",
  status: "Active",
  registration_date: "2017-07-01"
};

const mockInvalidGSTResponse = {
  valid: false,
  message: "Invalid GSTIN format. GSTIN must be 15 characters long and follow the correct pattern.",
  gstin: "INVALID123456"
};

describe('GST Validation API Integration Tests', () => {
  let originalAxiosPost;
  let originalAxiosGet;

  before(() => {
    // Store original axios methods
    originalAxiosPost = axios.post;
    originalAxiosGet = axios.get;
  });

  after(() => {
    // Restore original axios methods
    axios.post = originalAxiosPost;
    axios.get = originalAxiosGet;
  });

  beforeEach(() => {
    // Mock axios for testing without real API calls
    axios.post = async (url, data) => {
      if (url.includes('/validate')) {
        if (data.gstin === '27AADCB2230M1ZT') {
          return { data: mockValidGSTResponse };
        } else {
          return { data: mockInvalidGSTResponse };
        }
      }
      
      if (url.includes('/verify-invoice')) {
        if (data.gstin === '27AADCB2230M1ZT' && data.invoiceNumber && data.invoiceDate) {
          return { 
            data: {
              valid: true,
              message: 'Invoice verification successful',
              gstin: data.gstin,
              invoiceNumber: data.invoiceNumber,
              invoiceDate: data.invoiceDate,
              filing_status: 'FILED'
            }
          };
        } else {
          return { 
            data: {
              valid: false,
              message: 'Invalid invoice details'
            }
          };
        }
      }

      if (url.includes('/bulk-validate')) {
        const results = data.gstinList.map(gstin => {
          if (gstin === '27AADCB2230M1ZT') {
            return {
              ...mockValidGSTResponse
            };
          } else {
            return {
              valid: false,
              message: 'Invalid GSTIN',
              gstin
            };
          }
        });

        return {
          data: {
            success: true,
            message: 'Bulk validation completed',
            results
          }
        };
      }
    };

    axios.get = async (url) => {
      if (url.includes('/business-details/27AADCB2230M1ZT')) {
        return {
          data: {
            success: true,
            message: 'Business details retrieved successfully',
            gstin: '27AADCB2230M1ZT',
            business_details: {
              legal_name: 'TEST COMPANY PVT LTD',
              trade_name: 'TEST COMPANY',
              address: '123 TEST STREET, MUMBAI, MAHARASHTRA, 400001',
              business_type: 'Regular',
              constitution: 'Private Limited Company',
              status: 'Active',
              registration_date: '2017-07-01'
            },
            filing_history: [
              {
                return_period: '2023-03',
                filing_date: '2023-04-20',
                return_type: 'GSTR-3B',
                status: 'FILED'
              }
            ],
            compliance_rating: 85
          }
        };
      } else {
        return {
          data: {
            success: false,
            message: 'Invalid GSTIN'
          }
        };
      }
    };
  });

  describe('validateGSTIN', () => {
    it('should validate a valid GST number', async () => {
      const result = await gstValidationService.validateGSTIN('27AADCB2230M1ZT');
      
      expect(result.valid).to.be.true;
      expect(result.legal_name).to.equal('TEST COMPANY PVT LTD');
      expect(result.trade_name).to.equal('TEST COMPANY');
      expect(result.state_name).to.equal('Maharashtra');
    });

    it('should reject an invalid GST number', async () => {
      const result = await gstValidationService.validateGSTIN('INVALID123456');
      
      expect(result.valid).to.be.false;
    });

    it('should validate GST number format correctly', () => {
      // Valid GST format
      expect(gstValidationService.isValidGSTINFormat('27AADCB2230M1ZT')).to.be.true;
      
      // Invalid formats
      expect(gstValidationService.isValidGSTINFormat('INVALID12345')).to.be.false; // Too short
      expect(gstValidationService.isValidGSTINFormat('99AADCB2230M1ZT')).to.be.false; // Invalid state code
      expect(gstValidationService.isValidGSTINFormat('27AADCB2230M0ZT')).to.be.false; // Invalid entity number
    });
  });

  describe('getBusinessDetails', () => {
    it('should return business details for a valid GST number', async () => {
      const result = await gstValidationService.getBusinessDetails('27AADCB2230M1ZT');
      
      expect(result.success).to.be.true;
      expect(result.business_details).to.exist;
      expect(result.business_details.legal_name).to.equal('TEST COMPANY PVT LTD');
      expect(result.filing_history).to.be.an('array');
      expect(result.compliance_rating).to.equal(85);
    });

    it('should return failure for an invalid GST number', async () => {
      const result = await gstValidationService.getBusinessDetails('INVALID123456');
      
      expect(result.success).to.be.false;
    });
  });

  describe('verifyInvoice', () => {
    it('should verify a valid invoice', async () => {
      const result = await gstValidationService.verifyInvoice(
        '27AADCB2230M1ZT', 
        'INV-001', 
        '2023-05-15'
      );
      
      expect(result.valid).to.be.true;
      expect(result.filing_status).to.equal('FILED');
    });

    it('should reject an invalid invoice', async () => {
      const result = await gstValidationService.verifyInvoice(
        'INVALID123456', 
        'INV-001', 
        '2023-05-15'
      );
      
      expect(result.valid).to.be.false;
    });
  });

  describe('bulkValidateGSTINs', () => {
    it('should validate multiple GST numbers', async () => {
      const result = await gstValidationService.bulkValidateGSTINs([
        '27AADCB2230M1ZT',
        'INVALID123456'
      ]);
      
      expect(result.success).to.be.true;
      expect(result.results).to.be.an('array').with.lengthOf(2);
      expect(result.results[0].valid).to.be.true;
      expect(result.results[1].valid).to.be.false;
    });

    it('should handle empty input correctly', async () => {
      const result = await gstValidationService.bulkValidateGSTINs([]);
      
      expect(result.success).to.be.false;
      expect(result.message).to.include('No GSTINs provided');
    });
  });
});