import axios from 'axios';
import { getAuthToken } from './authService';

// Types
export interface RLVRState {
  state: any;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RLVRAction {
  action: string;
  parameters: Record<string, any>;
  confidence?: number;
  qValue?: number;
}

export interface RLVREpisode {
  states: RLVRState[];
  actions: RLVRAction[];
  rewards: number[];
  totalReward: number;
  metadata?: Record<string, any>;
}

export interface RLVRTrainingConfig {
  gamma?: number;
  alpha?: number;
  epsilon?: number;
  maxEpisodes?: number;
  maxStepsPerEpisode?: number;
  batchSize?: number;
}

export interface RLVRModelConfig {
  modelType: 'dqn' | 'ddpg' | 'ppo' | 'custom';
  stateSize: number;
  actionSize: number;
  hiddenLayers?: number[];
  learningRate?: number;
}

class RLVRService {
  private api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api/rlvr',
    timeout: 30000, // 30 seconds
  });

  constructor() {
    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get an optimal action for the current state
   */
  async getOptimalAction(
    state: any,
    modelId: string = 'default',
    explore: boolean = true
  ): Promise<RLVRAction> {
    try {
      const response = await this.api.post<RLVRAction>('/action', {
        state,
        modelId,
        explore,
      });
      return response.data;
    } catch (error) {
      console.error('RLVR get action error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get optimal action from RLVR service'
      );
    }
  }

  /**
   * Record an experience (state, action, reward, next_state)
   */
  async recordExperience(
    state: any,
    action: RLVRAction,
    reward: number,
    nextState: any,
    done: boolean,
    modelId: string = 'default'
  ): Promise<void> {
    try {
      await this.api.post('/experience', {
        state,
        action,
        reward,
        nextState,
        done,
        modelId,
      });
    } catch (error) {
      console.error('RLVR record experience error:', error);
      // Don't throw error for experience recording to not block the main flow
    }
  }

  /**
   * Train the RLVR model
   */
  async trainModel(
    modelId: string = 'default',
    config: RLVRTrainingConfig = {}
  ): Promise<{
    status: string;
    metrics: {
      loss: number[];
      reward: number[];
      steps: number[];
      epsilon: number[];
    };
  }> {
    try {
      const response = await this.api.post(`/train/${modelId}`, config);
      return response.data;
    } catch (error) {
      console.error('RLVR train model error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to train RLVR model'
      );
    }
  }

  /**
   * Evaluate the RLVR model
   */
  async evaluateModel(
    modelId: string = 'default',
    numEpisodes: number = 10
  ): Promise<{
    meanReward: number;
    stdReward: number;
    episodes: RLVREpisode[];
  }> {
    try {
      const response = await this.api.get(`/evaluate/${modelId}?episodes=${numEpisodes}`);
      return response.data;
    } catch (error) {
      console.error('RLVR evaluate model error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to evaluate RLVR model'
      );
    }
  }

  /**
   * Save the RLVR model
   */
  async saveModel(modelId: string, path: string): Promise<{ status: string; path: string }> {
    try {
      const response = await this.api.post(`/save/${modelId}`, { path });
      return response.data;
    } catch (error) {
      console.error('RLVR save model error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to save RLVR model'
      );
    }
  }

  /**
   * Load a pre-trained RLVR model
   */
  async loadModel(modelId: string, path: string): Promise<{ status: string }> {
    try {
      const response = await this.api.post(`/load/${modelId}`, { path });
      return response.data;
    } catch (error) {
      console.error('RLVR load model error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to load RLVR model'
      );
    }
  }

  /**
   * Get model metadata and statistics
   */
  async getModelInfo(modelId: string = 'default'): Promise<{
    modelType: string;
    numParameters: number;
    trainingSteps: number;
    lastTrained: string;
    metrics: {
      meanReward: number;
      stdReward: number;
      episodesTrained: number;
    };
  }> {
    try {
      const response = await this.api.get(`/model/${modelId}/info`);
      return response.data;
    } catch (error) {
      console.error('RLVR get model info error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get RLVR model info'
      );
    }
  }
}

// Create a singleton instance
export const rlvrService = new RLVRService();

export default rlvrService;
