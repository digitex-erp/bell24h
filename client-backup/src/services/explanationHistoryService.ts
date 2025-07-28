import { ModelExplanation } from '../types/ai.js';

/**
 * Service to handle storing and retrieving explanation history
 * Uses localStorage for client-side persistence
 */
class ExplanationHistoryService {
  private readonly STORAGE_KEY = 'bell24h_explanation_history';
  private readonly MAX_HISTORY_ITEMS = 20;

  /**
   * Save an explanation to history
   * @param explanation The explanation to save
   * @returns The updated history array
   */
  saveExplanation(explanation: ModelExplanation): ModelExplanation[] {
    const history = this.getHistory();
    
    // Check if this explanation is already in history (by ID)
    const existingIndex = history.findIndex(item => item.id === explanation.id);
    
    if (existingIndex !== -1) {
      // Replace existing entry
      history[existingIndex] = explanation;
    } else {
      // Add to history
      history.unshift(explanation);
      
      // Limit history size
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.pop();
      }
    }
    
    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    
    return history;
  }
  
  /**
   * Get all saved explanations
   * @returns Array of ModelExplanation objects
   */
  getHistory(): ModelExplanation[] {
    const historyString = localStorage.getItem(this.STORAGE_KEY);
    
    if (!historyString) {
      return [];
    }
    
    try {
      return JSON.parse(historyString) as ModelExplanation[];
    } catch (error) {
      console.error('Error parsing explanation history:', error);
      return [];
    }
  }
  
  /**
   * Get explanations for a specific model and instance
   * @param modelId The model ID
   * @param instanceId The instance ID
   * @returns Filtered array of ModelExplanation objects
   */
  getHistoryForInstance(modelId: string, instanceId: string): ModelExplanation[] {
    const history = this.getHistory();
    
    return history.filter(explanation => 
      explanation.modelId === modelId && 
      explanation.instanceId === instanceId
    );
  }
  
  /**
   * Clear all saved explanations
   */
  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  /**
   * Delete a specific explanation from history
   * @param explanationId The ID of the explanation to delete
   * @returns The updated history array
   */
  deleteExplanation(explanationId: string): ModelExplanation[] {
    const history = this.getHistory();
    const updatedHistory = history.filter(explanation => explanation.id !== explanationId);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
    
    return updatedHistory;
  }
}

// Create a singleton instance
export const explanationHistoryService = new ExplanationHistoryService();
