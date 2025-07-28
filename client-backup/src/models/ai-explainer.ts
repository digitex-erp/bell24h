/**
 * Bell24H AI Model Monitoring and Explainability System
 * 
 * This module provides comprehensive monitoring for machine learning models used
 * in the Bell24H RFQ marketplace, including:
 * - Model performance tracking
 * - Drift detection
 * - Model versioning
 * - Rollback capabilities
 * - Integration with explainability tools
 */

import { ExplainerFactory, ShapExplainer, LimeExplainer, ExplanationResult } from '../analytics/shap-explainer';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Model metadata interfaces
export interface ModelVersion {
  id: string;
  modelId: string;
  version: string;
  timestamp: string;
  metrics: ModelMetrics;
  path: string;
  active: boolean;
  description: string;
  trainingData: {
    source: string;
    size: number;
    features: string[];
    startDate: string;
    endDate: string;
  };
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
  customMetrics?: Record<string, number>;
}

export interface PredictionLog {
  id: string;
  timestamp: string;
  modelId: string;
  modelVersion: string;
  input: Record<string, any>;
  output: any;
  latencyMs: number;
  explanation?: ExplanationResult;
}

export interface DriftMetrics {
  featureDrift: Record<string, number>;
  conceptDrift: number;
  predictionDrift: number;
  dataQualityScore: number;
}

export interface ModelMonitorConfig {
  modelId: string;
  storagePath: string;
  driftThreshold: number;
  monitoringFrequencyMs: number;
  explainSamplingRate: number;
  alertEndpoint?: string;
  autoRollback: boolean;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
}

// Default configuration values
const DEFAULT_CONFIG: Partial<ModelMonitorConfig> = {
  driftThreshold: 0.15,
  monitoringFrequencyMs: 3600000, // 1 hour
  explainSamplingRate: 0.05, // Explain 5% of predictions
  autoRollback: false,
  logLevel: 'info'
};

/**
 * Model Monitor class to track model performance and detect drift
 */
export class ModelMonitor {
  private config: ModelMonitorConfig;
  private versions: ModelVersion[] = [];
  private predictionLogs: PredictionLog[] = [];
  private driftMetrics: DriftMetrics[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private explainer: ShapExplainer | LimeExplainer | null = null;
  
  constructor(config: Partial<ModelMonitorConfig>) {
    if (!config.modelId || !config.storagePath) {
      throw new Error('ModelId and storagePath are required configuration parameters');
    }
    
    this.config = { ...DEFAULT_CONFIG, ...config } as ModelMonitorConfig;
    
    // Load existing data if available
    this.loadState().catch(err => {
      this.log('error', `Failed to load model monitor state: ${err.message}`);
    });
  }
  
  /**
   * Initialize the model monitor
   */
  public async initialize(): Promise<void> {
    // Create storage directory if it doesn't exist
    await this.ensureStorageDirectory();
    
    // Load model versions
    await this.loadModelVersions();
    
    // Set up explainer for selected samples
    await this.setupExplainer();
    
    // Start monitoring interval
    this.startMonitoring();
    
    this.log('info', `Model monitor initialized for model ${this.config.modelId}`);
  }
  
  /**
   * Register a new model version
   */
  public async registerModelVersion(version: Omit<ModelVersion, 'id'>): Promise<string> {
    const id = uuidv4();
    const newVersion: ModelVersion = {
      ...version,
      id,
      timestamp: new Date().toISOString()
    };
    
    // Add to versions list
    this.versions.push(newVersion);
    
    // Save to disk
    await this.saveModelVersions();
    
    this.log('info', `Registered new model version: ${version.version} (${id})`);
    
    return id;
  }
  
  /**
   * Activate a specific model version
   */
  public async activateModelVersion(versionId: string): Promise<void> {
    // Find the version
    const versionIndex = this.versions.findIndex(v => v.id === versionId);
    if (versionIndex === -1) {
      throw new Error(`Model version with ID ${versionId} not found`);
    }
    
    // Update active status
    for (let i = 0; i < this.versions.length; i++) {
      this.versions[i].active = (i === versionIndex);
    }
    
    // Save to disk
    await this.saveModelVersions();
    
    this.log('info', `Activated model version: ${this.versions[versionIndex].version} (${versionId})`);
  }
  
  /**
   * Log a prediction made by the model
   */
  public async logPrediction(prediction: Omit<PredictionLog, 'id'>): Promise<string> {
    const id = uuidv4();
    const predLog: PredictionLog = {
      ...prediction,
      id
    };
    
    // Add to prediction logs
    this.predictionLogs.push(predLog);
    
    // Generate explanation if sampling rate hits
    if (Math.random() < this.config.explainSamplingRate && this.explainer) {
      try {
        const explanation = await this.explainer.explain(prediction.input);
        predLog.explanation = explanation;
        
        this.log('debug', `Generated explanation for prediction ${id}`);
      } catch (error) {
        this.log('error', `Failed to generate explanation: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Save periodically (not every prediction to reduce I/O)
    if (this.predictionLogs.length % 100 === 0) {
      this.savePredictionLogs().catch(err => {
        this.log('error', `Failed to save prediction logs: ${err.message}`);
      });
    }
    
    return id;
  }
  
  /**
   * Calculate current drift metrics
   */
  public async calculateDrift(): Promise<DriftMetrics> {
    // Get reference data (training data or baseline period)
    const activeVersion = this.versions.find(v => v.active);
    if (!activeVersion) {
      throw new Error('No active model version found');
    }
    
    // Get recent predictions
    const recentPredictions = this.predictionLogs
      .filter(log => log.modelVersion === activeVersion.version)
      .slice(-1000); // Use last 1000 predictions
    
    if (recentPredictions.length < 100) {
      this.log('warning', 'Not enough recent predictions to calculate reliable drift metrics');
    }
    
    // Calculate feature drift (statistical distance between distributions)
    const featureDrift: Record<string, number> = {};
    const features = activeVersion.trainingData.features;
    
    // For each feature, calculate drift
    for (const feature of features) {
      // In a real implementation, we would compare distributions
      // For now, we'll use a random value as a placeholder
      featureDrift[feature] = Math.random() * 0.3;
    }
    
    // Calculate concept drift (model accuracy change)
    const conceptDrift = Math.random() * 0.2;
    
    // Calculate prediction drift (distribution of predictions change)
    const predictionDrift = Math.random() * 0.25;
    
    // Calculate overall data quality score
    const dataQualityScore = 0.95 - (Math.random() * 0.15);
    
    // Create drift metrics
    const driftMetrics: DriftMetrics = {
      featureDrift,
      conceptDrift,
      predictionDrift,
      dataQualityScore
    };
    
    // Store drift metrics
    this.driftMetrics.push(driftMetrics);
    
    // Check if drift exceeds threshold
    const maxDrift = Math.max(
      conceptDrift,
      predictionDrift,
      ...Object.values(featureDrift)
    );
    
    if (maxDrift > this.config.driftThreshold) {
      this.handleExcessiveDrift(maxDrift, driftMetrics);
    }
    
    return driftMetrics;
  }
  
  /**
   * Rollback to a previous model version
   */
  public async rollbackToVersion(versionId: string): Promise<void> {
    // Find the version
    const version = this.versions.find(v => v.id === versionId);
    if (!version) {
      throw new Error(`Model version with ID ${versionId} not found`);
    }
    
    // Set as active
    await this.activateModelVersion(versionId);
    
    this.log('info', `Rolled back to model version: ${version.version} (${versionId})`);
    
    // Send alert if configured
    if (this.config.alertEndpoint) {
      this.sendAlert({
        type: 'rollback',
        modelId: this.config.modelId,
        versionId,
        version: version.version,
        timestamp: new Date().toISOString(),
        message: `Model rolled back to version ${version.version}`
      });
    }
  }
  
  /**
   * Get active model version
   */
  public getActiveVersion(): ModelVersion | null {
    return this.versions.find(v => v.active) || null;
  }
  
  /**
   * Get model performance metrics
   */
  public async getPerformanceMetrics(days: number = 7): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Filter prediction logs by date range
    const logsInRange = this.predictionLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
    
    // Group by version
    const byVersion: Record<string, PredictionLog[]> = {};
    for (const log of logsInRange) {
      if (!byVersion[log.modelVersion]) {
        byVersion[log.modelVersion] = [];
      }
      byVersion[log.modelVersion].push(log);
    }
    
    // Calculate performance metrics for each version
    const performanceByVersion: Record<string, any> = {};
    for (const [version, logs] of Object.entries(byVersion)) {
      // Calculate average latency
      const avgLatency = logs.reduce((sum, log) => sum + log.latencyMs, 0) / logs.length;
      
      // In a real implementation, we would calculate accuracy metrics
      // by comparing predictions to ground truth
      performanceByVersion[version] = {
        predictionCount: logs.length,
        averageLatencyMs: avgLatency,
        // Placeholder metrics (would be real in production)
        estimatedAccuracy: 0.92 - (Math.random() * 0.1),
        throughputPerMinute: logs.length / (days * 24 * 60)
      };
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalPredictions: logsInRange.length,
      byVersion: performanceByVersion
    };
  }
  
  /**
   * Start periodic monitoring
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(async () => {
      try {
        // Calculate drift
        const drift = await this.calculateDrift();
        
        this.log('debug', `Drift metrics calculated: ${JSON.stringify(drift, null, 2)}`);
        
        // Save state
        await this.saveState();
      } catch (error) {
        this.log('error', `Error in monitoring interval: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, this.config.monitoringFrequencyMs);
    
    this.log('info', `Started model monitoring with interval ${this.config.monitoringFrequencyMs}ms`);
  }
  
  /**
   * Handle excessive drift detected
   */
  private async handleExcessiveDrift(driftValue: number, metrics: DriftMetrics): Promise<void> {
    this.log('warning', `Excessive drift detected: ${driftValue.toFixed(4)} (threshold: ${this.config.driftThreshold})`);
    
    // Send alert if configured
    if (this.config.alertEndpoint) {
      this.sendAlert({
        type: 'drift',
        modelId: this.config.modelId,
        driftValue,
        threshold: this.config.driftThreshold,
        metrics,
        timestamp: new Date().toISOString(),
        message: `Drift threshold exceeded for model ${this.config.modelId}`
      });
    }
    
    // Auto-rollback if configured
    if (this.config.autoRollback) {
      // Find the previous stable version
      const stableVersions = this.versions
        .filter(v => !v.active)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (stableVersions.length > 0) {
        const targetVersion = stableVersions[0];
        this.log('info', `Auto-rolling back to version ${targetVersion.version}`);
        await this.rollbackToVersion(targetVersion.id);
      } else {
        this.log('warning', 'Auto-rollback enabled but no previous versions found');
      }
    }
  }
  
  /**
   * Set up the explainer
   */
  private async setupExplainer(): Promise<void> {
    const activeVersion = this.getActiveVersion();
    if (!activeVersion) {
      this.log('warning', 'No active model version found, explainer not set up');
      return;
    }
    
    // Create model config for explainer
    const modelConfig = {
      modelId: this.config.modelId,
      modelType: 'supplier_matching' as const,
      features: activeVersion.trainingData.features,
      // Define baseline based on training data (in a real implementation)
      baseline: {},
      localModel: await tf.loadLayersModel(`file://${activeVersion.path}`)
    };
    
    // Create explainer
    this.explainer = ExplainerFactory.createExplainer('shap', modelConfig, {
      numSamples: 100
    });
    
    this.log('info', 'Explainer set up successfully');
  }
  
  /**
   * Send alert to configured endpoint
   */
  private async sendAlert(alert: any): Promise<void> {
    if (!this.config.alertEndpoint) return;
    
    try {
      await axios.post(this.config.alertEndpoint, alert);
      this.log('info', `Alert sent: ${alert.type}`);
    } catch (error) {
      this.log('error', `Failed to send alert: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.storagePath, { recursive: true });
    } catch (error) {
      this.log('error', `Failed to create storage directory: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Load model versions from disk
   */
  private async loadModelVersions(): Promise<void> {
    const versionsPath = path.join(this.config.storagePath, `${this.config.modelId}_versions.json`);
    
    try {
      const data = await fs.readFile(versionsPath, 'utf8');
      this.versions = JSON.parse(data);
      this.log('info', `Loaded ${this.versions.length} model versions from disk`);
    } catch (error) {
      // If file doesn't exist, that's okay
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.log('error', `Error loading model versions: ${error instanceof Error ? error.message : String(error)}`);
      }
      this.versions = [];
    }
  }
  
  /**
   * Save model versions to disk
   */
  private async saveModelVersions(): Promise<void> {
    const versionsPath = path.join(this.config.storagePath, `${this.config.modelId}_versions.json`);
    
    try {
      await fs.writeFile(versionsPath, JSON.stringify(this.versions, null, 2), 'utf8');
      this.log('debug', `Saved ${this.versions.length} model versions to disk`);
    } catch (error) {
      this.log('error', `Error saving model versions: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Save prediction logs to disk
   */
  private async savePredictionLogs(): Promise<void> {
    const logsPath = path.join(this.config.storagePath, `${this.config.modelId}_predictions.json`);
    
    try {
      // In a real implementation, we would use a database or rotate log files
      // For simplicity, we'll just save the last 1000 logs
      const recentLogs = this.predictionLogs.slice(-1000);
      await fs.writeFile(logsPath, JSON.stringify(recentLogs, null, 2), 'utf8');
      this.log('debug', `Saved ${recentLogs.length} prediction logs to disk`);
    } catch (error) {
      this.log('error', `Error saving prediction logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Load previously saved state
   */
  private async loadState(): Promise<void> {
    await this.loadModelVersions();
    
    // Load prediction logs
    const logsPath = path.join(this.config.storagePath, `${this.config.modelId}_predictions.json`);
    
    try {
      const data = await fs.readFile(logsPath, 'utf8');
      this.predictionLogs = JSON.parse(data);
      this.log('info', `Loaded ${this.predictionLogs.length} prediction logs from disk`);
    } catch (error) {
      // If file doesn't exist, that's okay
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.log('error', `Error loading prediction logs: ${error instanceof Error ? error.message : String(error)}`);
      }
      this.predictionLogs = [];
    }
  }
  
  /**
   * Save current state to disk
   */
  private async saveState(): Promise<void> {
    await this.saveModelVersions();
    await this.savePredictionLogs();
  }
  
  /**
   * Log a message with the specified level
   */
  private log(level: 'debug' | 'info' | 'warning' | 'error', message: string): void {
    const logLevels = {
      debug: 0,
      info: 1,
      warning: 2,
      error: 3
    };
    
    if (logLevels[level] >= logLevels[this.config.logLevel]) {
      const timestamp = new Date().toISOString();
      // eslint-disable-next-line no-console
      console.log(`[${timestamp}] [${level.toUpperCase()}] [ModelMonitor] ${message}`);
    }
  }
  
  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.log('info', 'Model monitor disposed');
  }
}

/**
 * Factory for creating model monitors
 */
export class ModelMonitorFactory {
  /**
   * Create a model monitor for a specific model
   */
  static createMonitor(modelId: string, config: Partial<ModelMonitorConfig> = {}): ModelMonitor {
    return new ModelMonitor({
      ...config,
      modelId,
      storagePath: config.storagePath || path.join(process.cwd(), 'model-monitoring')
    });
  }
}

// Export a default service instance
export default {
  ModelMonitor,
  ModelMonitorFactory
};
