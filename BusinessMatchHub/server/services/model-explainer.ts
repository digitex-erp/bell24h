/**
 * Model Explainer Service
 * 
 * This service integrates with the AI models to provide explanations for predictions
 * using SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations).
 * 
 * It helps users understand why AI models made specific predictions for supplier risk assessment,
 * RFQ matching, and other predictive features.
 */

import { storage } from '../storage';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface ExplanationRequest {
  modelType: 'supplier_risk' | 'rfq_matching' | 'price_prediction';
  instanceId: number; // ID of the supplier or RFQ
  contextData?: Record<string, any>; // Additional context data
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface ModelExplanation {
  prediction: any;
  confidence: number;
  topFeatures: FeatureImportance[];
  visualizationUrl?: string;
  modelType: string;
  interpretationMethod: 'shap' | 'lime';
  interpretationTime: Date;
}

export class ModelExplainerService {
  /**
   * Generate an explanation for a supplier risk assessment
   * @param supplierId The ID of the supplier
   * @returns Explanation with feature importances
   */
  async explainSupplierRisk(supplierId: number): Promise<ModelExplanation> {
    try {
      // Get supplier data
      const supplier = await storage.getSupplier(supplierId);
      
      if (!supplier) {
        throw new Error(`Supplier with ID ${supplierId} not found`);
      }
      
      // Build input data for the explanation model
      const inputData = {
        supplier_id: supplierId,
        experience_years: supplier.yearsInBusiness || 0,
        delivery_performance: supplier.onTimeDeliveryRate || 0,
        financial_stability: supplier.financialStabilityScore || 0,
        quality_score: supplier.qualityScore || 0,
        compliance_score: supplier.complianceScore || 0,
        geographical_risk: supplier.geographicalRisk || 0,
        industry_volatility: supplier.industryVolatility || 0,
        credit_score: supplier.creditScore || 0,
        dispute_history: supplier.lateDeliveryRate || 0,
        certification_level: supplier.certifications ? 
          (typeof supplier.certifications === 'string' ? 
            JSON.parse(supplier.certifications).length : 
            Object.keys(supplier.certifications).length) : 0
      };
      
      // Call Python explainer script with the input data
      const result = await this.callPythonExplainer(
        'supplier_risk',
        inputData
      );
      
      // Process and return the results
      return {
        prediction: {
          riskScore: result.risk_score,
          riskCategory: result.risk_category
        },
        confidence: result.confidence,
        topFeatures: result.feature_importances.map((f: any) => ({
          feature: this.formatFeatureName(f.feature),
          importance: Math.abs(f.importance),
          direction: f.importance > 0 ? 'positive' : (f.importance < 0 ? 'negative' : 'neutral'),
          description: this.generateFeatureDescription(f.feature, f.importance, 'supplier_risk')
        })),
        visualizationUrl: result.visualization_url,
        modelType: 'supplier_risk',
        interpretationMethod: result.method,
        interpretationTime: new Date()
      };
    } catch (error) {
      console.error('Error explaining supplier risk:', error);
      throw error;
    }
  }
  
  /**
   * Generate an explanation for RFQ-Supplier matching scores
   * @param rfqId The ID of the RFQ
   * @param supplierId The ID of the supplier
   * @returns Explanation with feature importances
   */
  async explainRfqMatching(rfqId: number, supplierId: number): Promise<ModelExplanation> {
    try {
      // Get RFQ and supplier data
      const rfq = await storage.getRfq(rfqId);
      const supplier = await storage.getSupplier(supplierId);
      
      if (!rfq) {
        throw new Error(`RFQ with ID ${rfqId} not found`);
      }
      
      if (!supplier) {
        throw new Error(`Supplier with ID ${supplierId} not found`);
      }
      
      // Build input data for the explanation model
      const inputData = {
        rfq_id: rfqId,
        supplier_id: supplierId,
        rfq_category: rfq.category,
        rfq_quantity: rfq.quantity,
        rfq_deadline: rfq.deadline.toISOString(),
        supplier_category: supplier.industry,
        supplier_capacity: supplier.productionCapacity || 'medium',
        supplier_rating: supplier.overallRating || 3,
        geographical_distance: 0, // Would be calculated from locations
        previous_business: false, // Would check if they've worked together before
        price_competitiveness: 0.5, // Would be calculated from past bids
        quality_match: 0.7, // Would be calculated from RFQ requirements vs supplier capabilities
        delivery_capability: supplier.onTimeDeliveryRate || 0.8,
      };
      
      // Call Python explainer script with the input data
      const result = await this.callPythonExplainer(
        'rfq_matching',
        inputData
      );
      
      // Process and return the results
      return {
        prediction: {
          matchScore: result.match_score,
          matchQuality: result.match_quality,
          recommendationLevel: result.recommendation_level
        },
        confidence: result.confidence,
        topFeatures: result.feature_importances.map((f: any) => ({
          feature: this.formatFeatureName(f.feature),
          importance: Math.abs(f.importance),
          direction: f.importance > 0 ? 'positive' : (f.importance < 0 ? 'negative' : 'neutral'),
          description: this.generateFeatureDescription(f.feature, f.importance, 'rfq_matching')
        })),
        visualizationUrl: result.visualization_url,
        modelType: 'rfq_matching',
        interpretationMethod: result.method,
        interpretationTime: new Date()
      };
    } catch (error) {
      console.error('Error explaining RFQ matching:', error);
      throw error;
    }
  }
  
  /**
   * Generate an explanation for price predictions
   * @param productId The ID of the product
   * @param contextData Additional context like quantity, timeline, etc.
   * @returns Explanation with feature importances
   */
  async explainPricePrediction(
    productId: number,
    contextData: Record<string, any>
  ): Promise<ModelExplanation> {
    try {
      // Get product data
      const product = await storage.getProduct(productId);
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // Build input data for the explanation model
      const inputData = {
        product_id: productId,
        product_category: product.category,
        base_price: product.price || 0,
        quantity: contextData.quantity || 1,
        delivery_timeline: contextData.timeline || 30,
        market_demand: contextData.marketDemand || 0.5,
        seasonal_factor: contextData.seasonalFactor || 1,
        raw_material_cost: contextData.rawMaterialCost || product.costPrice || 0,
        competitor_pricing: contextData.competitorPricing || product.price * 0.9 || 0,
        currency_exchange: contextData.exchangeRate || 1,
        customer_tier: contextData.customerTier || 'standard',
      };
      
      // Call Python explainer script with the input data
      const result = await this.callPythonExplainer(
        'price_prediction',
        inputData
      );
      
      // Process and return the results
      return {
        prediction: {
          predictedPrice: result.predicted_price,
          priceRange: result.price_range,
          recommendedDiscount: result.recommended_discount
        },
        confidence: result.confidence,
        topFeatures: result.feature_importances.map((f: any) => ({
          feature: this.formatFeatureName(f.feature),
          importance: Math.abs(f.importance),
          direction: f.importance > 0 ? 'positive' : (f.importance < 0 ? 'negative' : 'neutral'),
          description: this.generateFeatureDescription(f.feature, f.importance, 'price_prediction')
        })),
        visualizationUrl: result.visualization_url,
        modelType: 'price_prediction',
        interpretationMethod: result.method,
        interpretationTime: new Date()
      };
    } catch (error) {
      console.error('Error explaining price prediction:', error);
      throw error;
    }
  }
  
  /**
   * Generate a visualization for a model explanation
   * @param modelType Type of model
   * @param explanationId ID of the explanation
   * @param outputFormat Format of the visualization (svg, png, etc.)
   * @returns Path to the visualization file
   */
  async generateVisualization(
    modelType: 'supplier_risk' | 'rfq_matching' | 'price_prediction',
    explanationId: number,
    outputFormat: 'svg' | 'png' = 'svg'
  ): Promise<string> {
    try {
      // Get the explanation data
      const explanation = await storage.getModelExplanation(explanationId);
      
      if (!explanation) {
        throw new Error(`Explanation with ID ${explanationId} not found`);
      }
      
      // Create a unique filename
      const filename = `${modelType}_${explanationId}_${Date.now()}.${outputFormat}`;
      const outputPath = path.join('uploads', 'visualizations', filename);
      
      // Ensure directory exists
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      
      // Call Python script to generate visualization
      const script = path.join('server', 'lib', 'ai', 'explainable', 'generate_visualization.py');
      const command = `python ${script} --model=${modelType} --data='${JSON.stringify(explanation.data)}' --output=${outputPath} --format=${outputFormat}`;
      
      await execAsync(command);
      
      // Update the explanation with the visualization URL
      await storage.updateModelExplanation(explanationId, {
        visualizationUrl: `/uploads/visualizations/${filename}`
      });
      
      return `/uploads/visualizations/${filename}`;
    } catch (error) {
      console.error('Error generating visualization:', error);
      throw error;
    }
  }
  
  /**
   * Call the Python script that performs the SHAP/LIME explanation
   * @param modelType Type of model to explain
   * @param inputData Input data for the model
   * @returns Explanation results
   */
  private async callPythonExplainer(
    modelType: 'supplier_risk' | 'rfq_matching' | 'price_prediction',
    inputData: Record<string, any>
  ): Promise<any> {
    try {
      // Create a temporary input file
      const inputFilename = `explain_input_${Date.now()}.json`;
      const inputPath = path.join('uploads', 'temp', inputFilename);
      
      // Ensure directory exists
      await fs.promises.mkdir(path.dirname(inputPath), { recursive: true });
      
      // Write input data to file
      await fs.promises.writeFile(inputPath, JSON.stringify(inputData), 'utf8');
      
      // Determine which explanation script to call
      let scriptPath;
      switch (modelType) {
        case 'supplier_risk':
          scriptPath = path.join('server', 'lib', 'ai', 'explainable', 'supplier_risk_explainer.py');
          break;
        case 'rfq_matching':
          scriptPath = path.join('server', 'lib', 'ai', 'explainable', 'rfq_matching_explainer.py');
          break;
        case 'price_prediction':
          scriptPath = path.join('server', 'lib', 'ai', 'explainable', 'price_prediction_explainer.py');
          break;
        default:
          throw new Error(`Unknown model type: ${modelType}`);
      }
      
      // Call the Python script
      const outputFilename = `explain_output_${Date.now()}.json`;
      const outputPath = path.join('uploads', 'temp', outputFilename);
      
      const command = `python ${scriptPath} --input=${inputPath} --output=${outputPath}`;
      
      await execAsync(command);
      
      // Read the results
      const outputData = await fs.promises.readFile(outputPath, 'utf8');
      const result = JSON.parse(outputData);
      
      // Cleanup temporary files
      await fs.promises.unlink(inputPath);
      await fs.promises.unlink(outputPath);
      
      return result;
    } catch (error) {
      console.error('Error calling Python explainer:', error);
      throw error;
    }
  }
  
  /**
   * Format feature names to be more human-readable
   * @param featureName Raw feature name
   * @returns Formatted feature name
   */
  private formatFeatureName(featureName: string): string {
    return featureName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
  
  /**
   * Generate a human-readable description of a feature's impact on the prediction
   * @param featureName Name of the feature
   * @param importance Importance value
   * @param modelType Type of model
   * @returns Description of the feature's impact
   */
  private generateFeatureDescription(
    featureName: string,
    importance: number,
    modelType: 'supplier_risk' | 'rfq_matching' | 'price_prediction'
  ): string {
    const direction = importance > 0 ? 'increased' : 'decreased';
    const impact = Math.abs(importance) > 0.5 ? 'significantly' : Math.abs(importance) > 0.2 ? 'moderately' : 'slightly';
    
    switch (modelType) {
      case 'supplier_risk':
        return `${this.formatFeatureName(featureName)} ${direction} the risk score ${impact}.`;
      
      case 'rfq_matching':
        return `${this.formatFeatureName(featureName)} ${direction} the match score ${impact}.`;
      
      case 'price_prediction':
        return `${this.formatFeatureName(featureName)} ${direction} the predicted price ${impact}.`;
      
      default:
        return `${this.formatFeatureName(featureName)} had a ${impact} ${direction === 'increased' ? 'positive' : 'negative'} impact.`;
    }
  }
}

// Create a singleton instance for the whole application
export const modelExplainerService = new ModelExplainerService();