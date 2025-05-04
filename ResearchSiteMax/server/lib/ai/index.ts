/**
 * AI Module for Bell24h Platform
 * 
 * This module exports the AI models and services used in the Bell24h platform.
 */

import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

/**
 * Interface for the supplier risk model
 */
export interface SupplierRiskModel {
  predict_risk(supplierData: any): Promise<number>;
  get_risk_category(riskScore: number): string;
  explain_prediction(supplierData: any): Promise<any>;
}

/**
 * Interface for the RFQ matching model
 */
export interface RfqMatchingModel {
  predict_match_for_rfq(rfqData: any, suppliers: any[]): Promise<any[]>;
  _create_match_data(rfqData: any, supplierData: any): any;
  explain_prediction(matchData: any): Promise<any>;
}

/**
 * Supplier Risk Model implementation
 */
export const supplier_risk_model: SupplierRiskModel = {
  async predict_risk(supplierData: any): Promise<number> {
    try {
      // Create a temporary file for the arguments
      const argsFile = path.join(process.cwd(), 'temp_supplier_risk_args.json');
      fs.writeFileSync(argsFile, JSON.stringify({
        action: 'predict',
        data: supplierData
      }));
      
      // Run the Python script with the arguments file
      const scriptPath = path.join(process.cwd(), 'server', 'lib', 'ai', 'scripts', 'supplier_risk.py');
      const { stdout, stderr } = await execAsync(`python3 ${scriptPath} ${argsFile}`);
      
      if (stderr) {
        console.error(`Python script error: ${stderr}`);
      }
      
      // Clean up the arguments file
      fs.unlinkSync(argsFile);
      
      // Parse the output
      const result = JSON.parse(stdout);
      return result.risk_score;
    } catch (error) {
      console.error(`Error predicting supplier risk: ${error.message}`);
      return 50; // Default medium risk
    }
  },
  
  get_risk_category(riskScore: number): string {
    if (riskScore < 20) {
      return 'Low Risk';
    } else if (riskScore < 50) {
      return 'Medium-Low Risk';
    } else if (riskScore < 70) {
      return 'Medium Risk';
    } else if (riskScore < 85) {
      return 'Medium-High Risk';
    } else {
      return 'High Risk';
    }
  },
  
  async explain_prediction(supplierData: any): Promise<any> {
    try {
      // Create a temporary file for the arguments
      const argsFile = path.join(process.cwd(), 'temp_supplier_risk_args.json');
      fs.writeFileSync(argsFile, JSON.stringify({
        action: 'explain',
        data: supplierData
      }));
      
      // Run the Python script with the arguments file
      const scriptPath = path.join(process.cwd(), 'server', 'lib', 'ai', 'scripts', 'supplier_risk.py');
      const { stdout, stderr } = await execAsync(`python3 ${scriptPath} ${argsFile}`);
      
      if (stderr) {
        console.error(`Python script error: ${stderr}`);
      }
      
      // Clean up the arguments file
      fs.unlinkSync(argsFile);
      
      // Parse the output
      return JSON.parse(stdout);
    } catch (error) {
      console.error(`Error explaining supplier risk: ${error.message}`);
      return {
        risk_score: 50,
        risk_category: 'Medium Risk',
        explanation_text: 'Error generating explanation',
        feature_importance: [],
        visualization_data: null
      };
    }
  }
};

/**
 * RFQ Matching Model implementation
 */
export const rfq_matching_model: RfqMatchingModel = {
  async predict_match_for_rfq(rfqData: any, suppliers: any[]): Promise<any[]> {
    try {
      // Create a temporary file for the arguments
      const argsFile = path.join(process.cwd(), 'temp_rfq_matching_args.json');
      fs.writeFileSync(argsFile, JSON.stringify({
        action: 'match_rfq',
        rfq: rfqData,
        suppliers: suppliers
      }));
      
      // Run the Python script with the arguments file
      const scriptPath = path.join(process.cwd(), 'server', 'lib', 'ai', 'scripts', 'rfq_matching.py');
      const { stdout, stderr } = await execAsync(`python3 ${scriptPath} ${argsFile}`);
      
      if (stderr) {
        console.error(`Python script error: ${stderr}`);
      }
      
      // Clean up the arguments file
      fs.unlinkSync(argsFile);
      
      // Parse the output
      return JSON.parse(stdout);
    } catch (error) {
      console.error(`Error predicting RFQ matches: ${error.message}`);
      return suppliers.map(supplier => ({
        supplier_id: supplier.id,
        supplier_name: supplier.companyName || 'Unknown',
        match_score: 50,
        match_category: 'Medium Match',
        key_strengths: [],
        key_weaknesses: []
      }));
    }
  },
  
  _create_match_data(rfqData: any, supplierData: any): any {
    // Combine RFQ and supplier data for matching
    return {
      // RFQ data
      rfq_id: rfqData.id,
      rfq_category: rfqData.category,
      rfq_quantity: parseInt(rfqData.quantity) || 0,
      rfq_deadline_days: Math.ceil((new Date(rfqData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      rfq_estimated_value: rfqData.estimatedValue || 0,
      rfq_priority: rfqData.priority || 2,
      
      // Supplier data
      supplier_id: supplierData.id,
      supplier_industry: supplierData.industry,
      supplier_rating: supplierData.userFeedback || 0,
      supplier_compliance_score: supplierData.complianceScore || 0,
      supplier_financial_stability: supplierData.financialStability || 0,
      supplier_late_delivery_rate: supplierData.lateDeliveryRate || 0,
      supplier_years_in_business: supplierData.yearFounded ? (2024 - supplierData.yearFounded) : 1,
      
      // Location match (boolean)
      location_match: rfqData.location === supplierData.location ? 1 : 0,
      
      // Category match (boolean)
      category_match: rfqData.category === supplierData.industry ? 1 : 0
    };
  },
  
  async explain_prediction(matchData: any): Promise<any> {
    try {
      // Create a temporary file for the arguments
      const argsFile = path.join(process.cwd(), 'temp_rfq_matching_args.json');
      fs.writeFileSync(argsFile, JSON.stringify({
        action: 'explain_match',
        match_data: matchData
      }));
      
      // Run the Python script with the arguments file
      const scriptPath = path.join(process.cwd(), 'server', 'lib', 'ai', 'scripts', 'rfq_matching.py');
      const { stdout, stderr } = await execAsync(`python3 ${scriptPath} ${argsFile}`);
      
      if (stderr) {
        console.error(`Python script error: ${stderr}`);
      }
      
      // Clean up the arguments file
      fs.unlinkSync(argsFile);
      
      // Parse the output
      return JSON.parse(stdout);
    } catch (error) {
      console.error(`Error explaining RFQ match: ${error.message}`);
      return {
        match_score: 50,
        match_category: 'Medium Match',
        explanation_text: 'Error generating explanation',
        feature_importance: [],
        key_strengths: [],
        key_weaknesses: [],
        visualization_data: null
      };
    }
  }
};