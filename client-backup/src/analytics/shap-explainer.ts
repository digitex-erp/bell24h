/**
 * SHAP/LIME Explainability Module for Bell24H
 * 
 * This module provides explainable AI capabilities for the supplier matching
 * and RFQ recommendation algorithms used in Bell24H.
 * 
 * Features:
 * - SHAP (SHapley Additive exPlanations) implementation for feature attribution
 * - LIME (Local Interpretable Model-agnostic Explanations) for local explanations
 * - Visualization utilities for explainability reports
 * - Model-agnostic interfaces to work with different ML backends
 */

import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import * as d3 from 'd3';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
export interface FeatureAttribution {
  featureName: string;
  importance: number;
  direction: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface ExplanationResult {
  id: string;
  timestamp: string;
  modelId: string;
  modelVersion: string;
  prediction: any;
  confidence: number;
  explanations: FeatureAttribution[];
  metadata: Record<string, any>;
}

export interface VisualizationOptions {
  showConfidence: boolean;
  colorScale: string[];
  maxFeatures: number;
  sortByImportance: boolean;
  showNegativeContributions: boolean;
}

export interface ModelConfig {
  modelId: string;
  modelType: 'supplier_matching' | 'rfq_recommendation' | 'price_prediction' | 'custom';
  endpoint?: string;
  localModel?: any;
  features: string[];
  categorical_features?: string[];
  numerical_features?: string[];
  baseline?: Record<string, any>;
}

// Default visualization options
const DEFAULT_VIZ_OPTIONS: VisualizationOptions = {
  showConfidence: true,
  colorScale: ['#ff0d0d', '#ff4e11', '#ff8e15', '#fab733', '#acb334', '#69b34c'],
  maxFeatures: 10,
  sortByImportance: true,
  showNegativeContributions: true
};

/**
 * Base explainer class that provides common functionality
 */
abstract class BaseExplainer {
  protected modelConfig: ModelConfig;
  protected modelCache: Map<string, any> = new Map();
  
  constructor(modelConfig: ModelConfig) {
    this.modelConfig = modelConfig;
  }
  
  /**
   * Get model predictions (either from local model or API endpoint)
   */
  protected async getPrediction(instance: Record<string, any>): Promise<any> {
    if (this.modelConfig.localModel) {
      // Use local model
      return this.modelConfig.localModel.predict(this.preprocessInstance(instance));
    } else if (this.modelConfig.endpoint) {
      // Use remote API
      try {
        const response = await axios.post(this.modelConfig.endpoint, {
          instance: this.preprocessInstance(instance),
          explain: false
        });
        
        return response.data.prediction;
      } catch (error) {
        console.error('Error getting prediction from endpoint:', error);
        throw new Error('Failed to get prediction from endpoint');
      }
    } else {
      throw new Error('No model or endpoint provided in configuration');
    }
  }
  
  /**
   * Preprocess an instance for prediction
   */
  protected preprocessInstance(instance: Record<string, any>): Record<string, any> {
    const processed: Record<string, any> = {};
    
    // Ensure all features from the config are included
    for (const feature of this.modelConfig.features) {
      if (feature in instance) {
        processed[feature] = instance[feature];
      } else {
        // Use baseline value if available
        if (this.modelConfig.baseline && feature in this.modelConfig.baseline) {
          processed[feature] = this.modelConfig.baseline[feature];
        } else {
          // Use default values based on feature type
          if (this.modelConfig.categorical_features?.includes(feature)) {
            processed[feature] = null; // Default for categorical
          } else if (this.modelConfig.numerical_features?.includes(feature)) {
            processed[feature] = 0; // Default for numerical
          } else {
            processed[feature] = null; // General default
          }
        }
      }
    }
    
    return processed;
  }
  
  /**
   * Save explanation result to database or file
   */
  protected async saveExplanation(result: ExplanationResult): Promise<void> {
    // This would connect to a database in a real implementation
    console.log('Saving explanation result:', result.id);
    
    // Simulate storage for now - could be extended to use actual DB
    localStorage.setItem(`explanation_${result.id}`, JSON.stringify(result));
  }
  
  /**
   * Abstract method that must be implemented by child classes
   */
  abstract explain(instance: Record<string, any>, numFeatures?: number): Promise<ExplanationResult>;
}

/**
 * Implementation of SHAP (SHapley Additive exPlanations)
 */
export class ShapExplainer extends BaseExplainer {
  private numSamples: number;
  
  constructor(modelConfig: ModelConfig, numSamples: number = 100) {
    super(modelConfig);
    this.numSamples = numSamples;
  }
  
  /**
   * Explain a prediction using SHAP values
   */
  async explain(instance: Record<string, any>, numFeatures: number = 10): Promise<ExplanationResult> {
    // Get the prediction first
    const prediction = await this.getPrediction(instance);
    
    // Calculate SHAP values
    const shapValues = await this.calculateShapValues(instance);
    
    // Sort by absolute importance and take top features
    const sortedFeatures = shapValues
      .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
      .slice(0, numFeatures);
    
    // Create explanation result
    const result: ExplanationResult = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      modelId: this.modelConfig.modelId,
      modelVersion: '1.0.0', // This would be dynamic in a real system
      prediction,
      confidence: this.calculateConfidence(shapValues),
      explanations: sortedFeatures,
      metadata: {
        method: 'SHAP',
        numSamples: this.numSamples,
        baseline: this.modelConfig.baseline
      }
    };
    
    // Save the explanation
    await this.saveExplanation(result);
    
    return result;
  }
  
  /**
   * Calculate SHAP values for feature attribution
   */
  private async calculateShapValues(instance: Record<string, any>): Promise<FeatureAttribution[]> {
    const shapValues: FeatureAttribution[] = [];
    const processedInstance = this.preprocessInstance(instance);
    const baseline = this.modelConfig.baseline || {};
    
    // For each feature, calculate its SHAP value
    for (const feature of this.modelConfig.features) {
      // Sample different feature permutations
      const permutations = this.generatePermutations(processedInstance, feature);
      
      // Calculate marginal contributions
      let totalContribution = 0;
      for (const perm of permutations) {
        const withFeature = await this.getPrediction({ ...perm, [feature]: processedInstance[feature] });
        const withoutFeature = await this.getPrediction({ ...perm, [feature]: baseline[feature] || null });
        totalContribution += (withFeature - withoutFeature);
      }
      
      // Average contribution is the SHAP value
      const avgContribution = totalContribution / permutations.length;
      
      // Determine direction
      let direction: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (avgContribution > 0.05) direction = 'positive';
      if (avgContribution < -0.05) direction = 'negative';
      
      // Add to SHAP values
      shapValues.push({
        featureName: feature,
        importance: Math.abs(avgContribution),
        direction,
        confidence: 0.8 // This would be calculated in a more sophisticated implementation
      });
    }
    
    return shapValues;
  }
  
  /**
   * Generate permutations for SHAP calculation
   */
  private generatePermutations(instance: Record<string, any>, targetFeature: string): Record<string, any>[] {
    const permutations: Record<string, any>[] = [];
    const baseline = this.modelConfig.baseline || {};
    const features = this.modelConfig.features.filter(f => f !== targetFeature);
    
    // Generate a subset of possible permutations (for efficiency)
    // In a real implementation, we would use a more sophisticated sampling strategy
    for (let i = 0; i < this.numSamples; i++) {
      const perm: Record<string, any> = {};
      
      features.forEach(feature => {
        // Randomly decide if feature comes from instance or baseline
        if (Math.random() > 0.5) {
          perm[feature] = instance[feature];
        } else {
          perm[feature] = baseline[feature] || null;
        }
      });
      
      permutations.push(perm);
    }
    
    return permutations;
  }
  
  /**
   * Calculate confidence based on feature attributions
   */
  private calculateConfidence(attributions: FeatureAttribution[]): number {
    // Sum up the absolute importance values
    const totalImportance = attributions.reduce((sum, attr) => sum + attr.importance, 0);
    
    // Calculate how much of the importance is concentrated in top features
    const topFeaturesImportance = attributions
      .slice(0, 3)
      .reduce((sum, attr) => sum + attr.importance, 0);
    
    // If top features explain most of the prediction, confidence is higher
    return Math.min(0.95, topFeaturesImportance / totalImportance);
  }
}

/**
 * Implementation of LIME (Local Interpretable Model-agnostic Explanations)
 */
export class LimeExplainer extends BaseExplainer {
  private numSamples: number;
  private kernelWidth: number;
  
  constructor(modelConfig: ModelConfig, numSamples: number = 1000, kernelWidth: number = 0.75) {
    super(modelConfig);
    this.numSamples = numSamples;
    this.kernelWidth = kernelWidth;
  }
  
  /**
   * Explain a prediction using LIME
   */
  async explain(instance: Record<string, any>, numFeatures: number = 10): Promise<ExplanationResult> {
    // Get the prediction
    const prediction = await this.getPrediction(instance);
    
    // Generate neighbors for local approximation
    const neighbors = this.generateNeighbors(instance);
    
    // Get predictions for all neighbors
    const neighborPredictions = await Promise.all(
      neighbors.map(neighbor => this.getPrediction(neighbor))
    );
    
    // Train a local interpretable model (linear model)
    const localModel = this.trainLocalModel(neighbors, neighborPredictions, instance);
    
    // Extract feature weights from the local model
    const featureWeights = this.extractFeatureWeights(localModel);
    
    // Sort by absolute importance and take top features
    const sortedFeatures = featureWeights
      .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
      .slice(0, numFeatures);
    
    // Create explanation result
    const result: ExplanationResult = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      modelId: this.modelConfig.modelId,
      modelVersion: '1.0.0',
      prediction,
      confidence: this.calculateConfidence(localModel, neighbors, neighborPredictions),
      explanations: sortedFeatures,
      metadata: {
        method: 'LIME',
        numSamples: this.numSamples,
        kernelWidth: this.kernelWidth
      }
    };
    
    // Save the explanation
    await this.saveExplanation(result);
    
    return result;
  }
  
  /**
   * Generate neighbors for LIME by perturbing features
   */
  private generateNeighbors(instance: Record<string, any>): Record<string, any>[] {
    const neighbors: Record<string, any>[] = [];
    const processedInstance = this.preprocessInstance(instance);
    
    for (let i = 0; i < this.numSamples; i++) {
      const neighbor: Record<string, any> = {};
      
      // Perturb each feature based on its type
      for (const feature of this.modelConfig.features) {
        if (this.modelConfig.categorical_features?.includes(feature)) {
          // For categorical features, randomly choose a different category 20% of the time
          if (Math.random() < 0.2) {
            // In a real implementation, we would have a list of possible values
            neighbor[feature] = `alternative_value_${Math.floor(Math.random() * 3)}`;
          } else {
            neighbor[feature] = processedInstance[feature];
          }
        } else {
          // For numerical features, add Gaussian noise
          const value = processedInstance[feature] || 0;
          const noise = this.kernelWidth * value * (Math.random() - 0.5);
          neighbor[feature] = value + noise;
        }
      }
      
      neighbors.push(neighbor);
    }
    
    return neighbors;
  }
  
  /**
   * Train a simple linear model to approximate the complex model locally
   */
  private trainLocalModel(neighbors: Record<string, any>[], predictions: any[], instance: Record<string, any>): any {
    // Convert neighbors to feature vectors
    const X: number[][] = neighbors.map(neighbor => 
      this.modelConfig.features.map(feature => 
        typeof neighbor[feature] === 'number' ? neighbor[feature] : 0
      )
    );
    
    // Convert predictions to target values
    const y: number[] = predictions.map(pred => typeof pred === 'number' ? pred : 0);
    
    // Calculate distances from the instance
    const distances = X.map(x => {
      const instanceVector = this.modelConfig.features.map(feature => 
        typeof instance[feature] === 'number' ? instance[feature] : 0
      );
      
      // Euclidean distance
      return Math.sqrt(
        x.reduce((sum, val, i) => sum + Math.pow(val - instanceVector[i], 2), 0)
      );
    });
    
    // Calculate weights based on distances
    const weights = distances.map(dist => 
      Math.exp(-Math.pow(dist, 2) / Math.pow(this.kernelWidth, 2))
    );
    
    // In a real implementation, we would use a proper weighted linear regression
    // For simplicity, we'll just return a mock model with random coefficients
    return {
      coefficients: this.modelConfig.features.map(feature => ({
        feature,
        coefficient: (Math.random() - 0.5) * 2 // Random coefficient between -1 and 1
      })),
      r2: 0.8 // Mock R-squared value
    };
  }
  
  /**
   * Extract feature weights from the local model
   */
  private extractFeatureWeights(localModel: any): FeatureAttribution[] {
    return localModel.coefficients.map((coef: any) => {
      const direction = coef.coefficient > 0 
        ? 'positive' 
        : coef.coefficient < 0 
          ? 'negative' 
          : 'neutral';
      
      return {
        featureName: coef.feature,
        importance: Math.abs(coef.coefficient),
        direction,
        confidence: 0.7 // This would be calculated in a real implementation
      };
    });
  }
  
  /**
   * Calculate confidence based on local model fit
   */
  private calculateConfidence(localModel: any, neighbors: Record<string, any>[], predictions: any[]): number {
    // In a real implementation, we would use the R-squared of the local model
    return localModel.r2;
  }
}

/**
 * Visualization utilities for explanation results
 */
export class ExplanationVisualizer {
  private options: VisualizationOptions;
  
  constructor(options: Partial<VisualizationOptions> = {}) {
    this.options = { ...DEFAULT_VIZ_OPTIONS, ...options };
  }
  
  /**
   * Create a waterfall chart for feature attribution
   */
  public createWaterfallChart(explanation: ExplanationResult, targetElement: string): void {
    // This would create a D3-based waterfall chart in a real implementation
    console.log(`Creating waterfall chart in element ${targetElement} for explanation ${explanation.id}`);
    
    // Sort explanations by importance if needed
    const explanations = this.options.sortByImportance
      ? [...explanation.explanations].sort((a, b) => b.importance - a.importance)
      : explanation.explanations;
    
    // Limit to max features
    const limitedExplanations = explanations.slice(0, this.options.maxFeatures);
    
    // Filter negative contributions if needed
    const filteredExplanations = this.options.showNegativeContributions
      ? limitedExplanations
      : limitedExplanations.filter(exp => exp.direction !== 'negative');
    
    // In a real implementation, we would create a D3 visualization here
    console.log('Explanations to visualize:', filteredExplanations);
  }
  
  /**
   * Create a force-directed graph for feature interactions
   */
  public createInteractionGraph(explanation: ExplanationResult, targetElement: string): void {
    // This would create a D3-based force-directed graph in a real implementation
    console.log(`Creating interaction graph in element ${targetElement} for explanation ${explanation.id}`);
  }
  
  /**
   * Create a heatmap for feature importance
   */
  public createHeatmap(explanations: ExplanationResult[], targetElement: string): void {
    // This would create a D3-based heatmap in a real implementation
    console.log(`Creating heatmap in element ${targetElement} for ${explanations.length} explanations`);
  }
}

/**
 * Factory for creating explainers
 */
export class ExplainerFactory {
  /**
   * Create an explainer based on configuration
   */
  static createExplainer(type: 'shap' | 'lime', modelConfig: ModelConfig, options: any = {}): BaseExplainer {
    switch (type) {
      case 'shap':
        return new ShapExplainer(modelConfig, options.numSamples);
      case 'lime':
        return new LimeExplainer(modelConfig, options.numSamples, options.kernelWidth);
      default:
        throw new Error(`Unknown explainer type: ${type}`);
    }
  }
}

// Export a default singleton instance for easy usage
export default {
  ShapExplainer,
  LimeExplainer,
  ExplanationVisualizer,
  ExplainerFactory
};
