import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { GstService } from '../services/gst.service';

// Initialize the GST service
const gstService = new GstService();

export function registerGstRoutes(app: Express) {
  // GST Validation endpoint
  app.post('/api/gst/validate', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        gstin: z.string().min(15).max(15)
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid GSTIN format', 
          errors: result.error.errors 
        });
      }
      
      const { gstin } = result.data;
      const validation = await gstService.validateGST(gstin);
      
      return res.status(200).json(validation);
    } catch (error) {
      console.error('Error validating GST:', error);
      return res.status(500).json({ message: 'Failed to validate GST' });
    }
  });

  // Get business details by GSTIN
  app.get('/api/gst/business-details/:gstin', async (req: Request, res: Response) => {
    try {
      const { gstin } = req.params;
      
      // Validate GSTIN format
      if (!gstin || gstin.length !== 15) {
        return res.status(400).json({ message: 'Invalid GSTIN format. Must be 15 characters.' });
      }
      
      const businessDetails = await gstService.getBusinessDetails(gstin);
      
      return res.status(200).json(businessDetails);
    } catch (error) {
      console.error('Error fetching business details:', error);
      return res.status(500).json({ message: 'Failed to fetch business details' });
    }
  });

  // Verify invoice
  app.post('/api/gst/verify-invoice', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        gstin: z.string().min(15).max(15),
        invoiceNumber: z.string().min(1),
        invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request format', 
          errors: result.error.errors 
        });
      }
      
      const { gstin, invoiceNumber, invoiceDate } = result.data;
      const verification = await gstService.verifyInvoice(gstin, invoiceNumber, invoiceDate);
      
      return res.status(200).json(verification);
    } catch (error) {
      console.error('Error verifying invoice:', error);
      return res.status(500).json({ message: 'Failed to verify invoice' });
    }
  });

  // Bulk GST validation
  app.post('/api/gst/bulk-validate', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        gstinList: z.array(z.string().min(15).max(15)).min(1)
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request format', 
          errors: result.error.errors 
        });
      }
      
      const { gstinList } = result.data;
      const bulkValidation = await gstService.bulkValidateGST(gstinList);
      
      return res.status(200).json(bulkValidation);
    } catch (error) {
      console.error('Error performing bulk GST validation:', error);
      return res.status(500).json({ message: 'Failed to perform bulk GST validation' });
    }
  });
}
