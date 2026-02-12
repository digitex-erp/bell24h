import { OpenAI } from 'openai';

/**
 * Bell24H AI Model Router
 * 
 * Strategy:
 * - GPT-4: Critical functions (risk assessment, fraud detection, complex sentiment)
 * - AWS GPT-OSS-20B: General text processing (80% cost savings)
 * - Minimax M2.1: Voice/video multimodal content
 * - DeepSeek V3.2: Embeddings and high-volume text processing
 */

export interface ModelConfig {
  client: OpenAI;
  model: string;
  provider: 'openai' | 'nvidia' | 'minimax' | 'deepseek';
  costPer1K: number;
}

export interface TaskCriteria {
  taskType: 'risk_assessment' | 'fraud_detection' | 'sentiment_analysis' | 'rfq_categorization' | 'content_generation' | 'chat_support' | 'voice_processing' | 'video_analysis' | 'embeddings';
  criticality: 'high' | 'medium' | 'low';
  volume: 'high' | 'medium' | 'low';
  accuracyRequirement: 'legal' | 'business' | 'general';
}

export class Bell24HAIRouter {
  private clients: Record<string, OpenAI>;
  private modelConfigs: Record<string, any>;
  
  constructor() {
    // Initialize all AI clients
    this.clients = {
      openai: new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      }),
      nvidia: new OpenAI({
        baseURL: 'https://integrate.api.nvidia.com/v1',
        apiKey: process.env.NVIDIA_API_KEY || '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',
      }),
      minimax: new OpenAI({
        baseURL: 'https://integrate.api.nvidia.com/v1',
        apiKey: process.env.MINIMAX_API_KEY || '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',
      }),
      deepseek: new OpenAI({
        baseURL: 'https://integrate.api.nvidia.com/v1',
        apiKey: process.env.DEEPSEEK_API_KEY || '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',
      }),
    };

    // Model configurations with cost estimates
    this.modelConfigs = {
      'gpt-4': {
        client: this.clients.openai,
        provider: 'openai',
        costPer1K: 0.03, // $30 per million tokens
        maxTokens: 8192,
        temperature: 0.1, // Low for consistency in critical tasks
      },
      'openai/gpt-oss-20b': {
        client: this.clients.nvidia,
        provider: 'nvidia',
        costPer1K: 0.006, // $6 per million tokens (80% savings)
        maxTokens: 4096,
        temperature: 0.7, // Higher for creativity
      },
      'minimaxai/minimax-m2.1': {
        client: this.clients.minimax,
        provider: 'minimax',
        costPer1K: 0.005, // $5 per million tokens
        maxTokens: 2048,
        temperature: 0.5,
      },
      'deepseek-ai/deepseek-v3.2': {
        client: this.clients.deepseek,
        provider: 'deepseek',
        costPer1K: 0.0035, // $3.5 per million tokens (91% savings)
        maxTokens: 4096,
        temperature: 0.3,
      },
    };
  }

  /**
   * Select the best model based on task criteria
   */
  selectModel(criteria: TaskCriteria): ModelConfig {
    const { taskType, criticality, accuracyRequirement } = criteria;

    // CRITICAL FUNCTIONS - Keep GPT-4
    if (criticality === 'high' || accuracyRequirement === 'legal') {
      return {
        ...this.modelConfigs['gpt-4'],
        model: 'gpt-4',
      };
    }

    // Task-specific model selection
    switch (taskType) {
      // VOICE/VIDEO PROCESSING - Minimax M2.1
      case 'voice_processing':
      case 'video_analysis':
        return {
          ...this.modelConfigs['minimaxai/minimax-m2.1'],
          model: 'minimaxai/minimax-m2.1',
        };

      // EMBEDDINGS - DeepSeek (highest cost savings)
      case 'embeddings':
        return {
          ...this.modelConfigs['deepseek-ai/deepseek-v3.2'],
          model: 'deepseek-ai/deepseek-v3.2',
        };

      // GENERAL TEXT PROCESSING - AWS GPT-OSS-20B
      case 'rfq_categorization':
      case 'content_generation':
      case 'chat_support':
        return {
          ...this.modelConfigs['openai/gpt-oss-20b'],
          model: 'openai/gpt-oss-20b',
        };

      // SENTIMENT ANALYSIS - GPT-4 for nuance
      case 'sentiment_analysis':
        return {
          ...this.modelConfigs['gpt-4'],
          model: 'gpt-4',
        };

      // DEFAULT - AWS GPT-OSS-20B for cost efficiency
      default:
        return {
          ...this.modelConfigs['openai/gpt-oss-20b'],
          model: 'openai/gpt-oss-20b',
        };
    }
  }

  /**
   * Create chat completion with automatic model selection
   */
  async createChatCompletion(
    criteria: TaskCriteria,
    messages: Array<{role: string; content: string}>,
    options: { temperature?: number; maxTokens?: number; stream?: boolean } = {}
  ) {
    const modelConfig = this.selectModel(criteria);
    const { temperature, maxTokens, stream } = options;

    try {
      const response = await modelConfig.client.chat.completions.create({
        model: modelConfig.model,
        messages,
        temperature: temperature || modelConfig.temperature,
        max_tokens: maxTokens || modelConfig.maxTokens,
        stream: stream || false,
      });

      // Log for cost tracking
      console.log(`AI Request: ${criteria.taskType} → ${modelConfig.model} (${modelConfig.provider})`);

      return {
        response,
        modelUsed: modelConfig.model,
        provider: modelConfig.provider,
        estimatedCost: this.estimateCost(messages, modelConfig.costPer1K),
      };
    } catch (error) {
      console.error(`AI Request Failed: ${criteria.taskType} → ${modelConfig.model}`, error);
      
      // Fallback to GPT-4 for critical functions
      if (criteria.criticality === 'high') {
        console.log('Falling back to GPT-4 for critical function');
        return this.createChatCompletion(criteria, messages, options);
      }
      
      throw error;
    }
  }

  /**
   * Estimate token cost for request
   */
  private estimateCost(messages: Array<{role: string; content: string}>, costPer1K: number): number {
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    // Rough estimate: 1 token ≈ 4 characters
    const estimatedTokens = Math.ceil(totalChars / 4);
    return (estimatedTokens / 1000) * costPer1K;
  }

  /**
   * Compare model quality for testing
   */
  async compareModels(
    taskType: string,
    messages: Array<{role: string; content: string}>
  ) {
    const modelsToTest = ['gpt-4', 'openai/gpt-oss-20b'];
    const results = [];

    for (const model of modelsToTest) {
      const startTime = Date.now();
      try {
        const response = await this.modelConfigs[model].client.chat.completions.create({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 1000,
        });
        
        results.push({
          model,
          response: response.choices[0].message.content,
          latency: Date.now() - startTime,
          cost: this.estimateCost(messages, this.modelConfigs[model].costPer1K),
          success: true,
        });
      } catch (error) {
        results.push({
          model,
          error: error.message,
          latency: Date.now() - startTime,
          success: false,
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const aiRouter = new Bell24HAIRouter();

// Convenience functions for common Bell24H tasks
export async function categorizeRFQ(rfqText: string, criticality: 'high' | 'medium' | 'low' = 'medium') {
  return aiRouter.createChatCompletion(
    {
      taskType: 'rfq_categorization',
      criticality,
      volume: 'high',
      accuracyRequirement: criticality === 'high' ? 'business' : 'general',
    },
    [{
      role: 'user',
      content: `Categorize this RFQ: ${rfqText}\nCategories: Agriculture, Construction, Manufacturing, Chemicals, Electronics, Textiles, Automotive, Healthcare, Energy, Technology`
    }]
  );
}

export async function assessSupplierRisk(supplierData: any) {
  return aiRouter.createChatCompletion(
    {
      taskType: 'risk_assessment',
      criticality: 'high',
      volume: 'medium',
      accuracyRequirement: 'legal',
    },
    [{
      role: 'user',
      content: `Assess supplier risk for: ${JSON.stringify(supplierData)}`
    }],
    { temperature: 0.1, maxTokens: 500 }
  );
}

export async function generateContent(contentType: string, data: any) {
  return aiRouter.createChatCompletion(
    {
      taskType: 'content_generation',
      criticality: 'medium',
      volume: 'high',
      accuracyRequirement: 'business',
    },
    [{
      role: 'user',
      content: `Generate ${contentType} content for: ${JSON.stringify(data)}`
    }]
  );
}

export async function processVoiceRFQ(audioTranscript: string) {
  return aiRouter.createChatCompletion(
    {
      taskType: 'voice_processing',
      criticality: 'medium',
      volume: 'medium',
      accuracyRequirement: 'business',
    },
    [{
      role: 'user',
      content: `Process this voice RFQ transcript and extract key details: ${audioTranscript}`
    }]
  );
}