/**
 * AI API Routes for Bell24h
 *
 * This module defines the API routes for AI functionality in Bell24h.com,
 * including supplier risk assessment and RFQ matching with explainability.
 */

import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Python script execution wrapper
async function runPythonScript(scriptName: string, args: Record<string, any>): Promise<any> {
  try {
    // Create a temporary file for the arguments
    const argsFile = path.join(process.cwd(), 'temp_args.json');
    fs.writeFileSync(argsFile, JSON.stringify(args));
    
    // Run the Python script with the arguments file
    const scriptPath = path.join(process.cwd(), 'server', 'lib', 'ai', 'scripts', scriptName);
    const { stdout, stderr } = await execAsync(`python3 ${scriptPath} ${argsFile}`);
    
    if (stderr) {
      console.error(`Python script error: ${stderr}`);
    }
    
    // Clean up the arguments file
    fs.unlinkSync(argsFile);
    
    // Parse the output
    return JSON.parse(stdout);
  } catch (error) {
    console.error(`Error running Python script: ${error.message}`);
    throw error;
  }
}

// Register AI API routes
export function registerAIRoutes(app: Express) {
  // Supplier Risk Assessment Routes
  
  app.get('/api/ai/supplier-risk/:supplierId', async (req: Request, res: Response) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      
      // Get supplier data
      const supplier = await storage.getSupplier(supplierId);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      // Get user data for additional supplier info
      const user = await storage.getUser(supplier.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Supplier user not found'
        });
      }
      
      // Prepare data for risk model
      const supplierData = {
        late_delivery_rate: supplier.lateDeliveryRate || 0,
        compliance_score: supplier.complianceScore || 100,
        financial_stability: supplier.financialStability || 100,
        user_feedback: supplier.userFeedback || 100,
        order_fulfillment_rate: 100 - (supplier.lateDeliveryRate || 0),
        payment_timeliness: 100, // Default value
        quality_rating: supplier.userFeedback || 80,
        communication_rating: supplier.userFeedback || 80,
        years_in_business: user.yearFounded ? (2024 - user.yearFounded) : 1,
        certifications_count: supplier.certifications ? supplier.certifications.length : 0,
        dispute_ratio: 0, // Default value
        average_response_time: 24, // Default value, in hours
        repeat_business_rate: 0.7 // Default value, 70%
      };
      
      // Get risk assessment with explanation
      const result = await runPythonScript('supplier_risk.py', {
        action: 'explain',
        data: supplierData
      });
      
      // Add supplier info to result
      result.supplier = {
        id: supplier.id,
        name: user.companyName,
        industry: supplier.industry
      };
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error(`Error in supplier risk assessment: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Error in risk assessment: ${error.message}`
      });
    }
  });
  
  app.get('/api/ai/supplier-risk/batch', async (req: Request, res: Response) => {
    try {
      // Get supplier IDs from query params
      const supplierIdsParam = req.query.supplierIds as string;
      if (!supplierIdsParam) {
        return res.status(400).json({
          success: false,
          message: 'No supplier IDs provided'
        });
      }
      
      // Parse supplier IDs
      let supplierIds: number[];
      try {
        supplierIds = supplierIdsParam.split(',').map(id => parseInt(id));
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid supplier IDs format'
        });
      }
      
      // Get risk assessment for each supplier
      const results = [];
      for (const supplierId of supplierIds) {
        // Get supplier data
        const supplier = await storage.getSupplier(supplierId);
        if (!supplier) {
          continue;
        }
        
        // Get user data
        const user = await storage.getUser(supplier.userId);
        if (!user) {
          continue;
        }
        
        // Prepare data for risk model
        const supplierData = {
          late_delivery_rate: supplier.lateDeliveryRate || 0,
          compliance_score: supplier.complianceScore || 100,
          financial_stability: supplier.financialStability || 100,
          user_feedback: supplier.userFeedback || 100,
          order_fulfillment_rate: 100 - (supplier.lateDeliveryRate || 0),
          payment_timeliness: 100,
          quality_rating: supplier.userFeedback || 80,
          communication_rating: supplier.userFeedback || 80,
          years_in_business: user.yearFounded ? (2024 - user.yearFounded) : 1,
          certifications_count: supplier.certifications ? supplier.certifications.length : 0,
          dispute_ratio: 0,
          average_response_time: 24,
          repeat_business_rate: 0.7
        };
        
        // Get risk score (without full explanation for batch processing)
        const result = await runPythonScript('supplier_risk.py', {
          action: 'predict',
          data: supplierData
        });
        
        results.push({
          supplier_id: supplier.id,
          supplier_name: user.companyName,
          risk_score: result.risk_score,
          risk_category: result.risk_category
        });
      }
      
      return res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error(`Error in batch supplier risk assessment: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Error in batch risk assessment: ${error.message}`
      });
    }
  });
  
  // RFQ Matching Routes
  
  app.get('/api/ai/rfq-match/:rfqId', async (req: Request, res: Response) => {
    try {
      const rfqId = parseInt(req.params.rfqId);
      
      // Get RFQ data
      const rfq = await storage.getRfq(rfqId);
      if (!rfq) {
        return res.status(404).json({
          success: false,
          message: 'RFQ not found'
        });
      }
      
      // Get suppliers to match
      const suppliers = await storage.getAllSuppliers();
      if (!suppliers || suppliers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No suppliers found'
        });
      }
      
      // Prepare RFQ data for matching
      const rfqData = {
        id: rfq.id,
        title: rfq.title,
        description: rfq.description,
        category: rfq.category,
        quantity: rfq.quantity,
        deadline: rfq.deadline,
        estimatedValue: rfq.estimatedValue || 5000,  // Default value
        location: rfq.location || 'India',
        attachments: rfq.attachments,
        priority: rfq.priority || 2  // Default medium priority
      };
      
      // Enhance supplier data for matching
      const enhancedSuppliers = [];
      for (const supplier of suppliers) {
        const user = await storage.getUser(supplier.userId);
        if (!user) {
          continue;
        }
        
        // Add user data to supplier
        enhancedSuppliers.push({
          ...supplier,
          companyName: user.companyName,
          email: user.email,
          location: user.location,
          yearFounded: user.yearFounded
        });
      }
      
      // Get matches with explanations
      const matches = await runPythonScript('rfq_matching.py', {
        action: 'match_rfq',
        rfq: rfqData,
        suppliers: enhancedSuppliers
      });
      
      return res.json({
        success: true,
        data: {
          rfq: {
            id: rfq.id,
            title: rfq.title,
            category: rfq.category
          },
          matches: matches
        }
      });
    } catch (error) {
      console.error(`Error in RFQ matching: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Error in RFQ matching: ${error.message}`
      });
    }
  });
  
  app.get('/api/ai/explain-match', async (req: Request, res: Response) => {
    try {
      const rfqId = parseInt(req.query.rfqId as string);
      const supplierId = parseInt(req.query.supplierId as string);
      
      // Get RFQ and supplier data
      const rfq = await storage.getRfq(rfqId);
      const supplier = await storage.getSupplier(supplierId);
      
      if (!rfq || !supplier) {
        return res.status(404).json({
          success: false,
          message: 'RFQ or supplier not found'
        });
      }
      
      // Get user data for supplier
      const user = await storage.getUser(supplier.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Supplier user not found'
        });
      }
      
      // Prepare RFQ data
      const rfqData = {
        id: rfq.id,
        title: rfq.title,
        description: rfq.description,
        category: rfq.category,
        quantity: rfq.quantity,
        deadline: rfq.deadline,
        estimatedValue: rfq.estimatedValue || 5000,
        location: rfq.location || 'India',
        attachments: rfq.attachments,
        priority: rfq.priority || 2
      };
      
      // Prepare supplier data
      const supplierData = {
        ...supplier,
        companyName: user.companyName,
        email: user.email,
        location: user.location,
        yearFounded: user.yearFounded
      };
      
      // Get detailed explanation
      const explanation = await runPythonScript('rfq_matching.py', {
        action: 'explain_match',
        rfq: rfqData,
        supplier: supplierData
      });
      
      // Add context to result
      const result = {
        rfq: {
          id: rfq.id,
          title: rfq.title,
          category: rfq.category
        },
        supplier: {
          id: supplier.id,
          name: user.companyName,
          industry: supplier.industry
        },
        ...explanation
      };
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error(`Error in match explanation: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Error in match explanation: ${error.message}`
      });
    }
  });
  
  return app;
}