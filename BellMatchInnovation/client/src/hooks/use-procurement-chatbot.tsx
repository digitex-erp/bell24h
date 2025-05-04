import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  processMessage, 
  optimizeRfq,
  getCategoryInsights,
  analyzeSupplierCompatibility,
  getNegotiationTalkingPoints,
  getSupplierMatchExplanation
} from '@/lib/gemini';

// Types for the chatbot
export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

export interface ProcurementChatbotOptions {
  userId?: number | null;
  mode?: 'general' | 'procurement' | 'technical';
  language?: string;
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
}

/**
 * Procurement Chatbot Hook
 * 
 * Provides a chatbot interface for procurement-related queries and assistance.
 */
export function useProcurementChatbot(options: ProcurementChatbotOptions = {}) {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Init system message
  useEffect(() => {
    // Add system message if none exists
    if (messages.length === 0) {
      setMessages([
        {
          id: uuidv4(),
          role: 'system',
          content: `You are a procurement assistant specialized in helping with RFQs, supplier selection, and market insights. Provide concise, specific advice based on best practices and market data. Use clear language and guide users step-by-step when appropriate. When responding to industry-specific questions, consider the key trends and challenges in that sector. Prioritize actionable insights over general information.`,
          timestamp: new Date(),
          context: 'system'
        }
      ]);
    }
  }, []);
  
  // Send a message and get a response
  const sendMessage = useCallback(async (
    message: string
  ): Promise<string> => {
    if (!message.trim()) {
      return '';
    }
    
    setIsLoading(true);
    
    try {
      // Add user message to state
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Convert messages to format expected by Gemini API
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));
      
      // Call Gemini API
      const response = await processMessage(message, {
        history,
        userId: options.userId ?? undefined,
        mode: options.mode ?? 'procurement',
        language: options.language ?? 'en',
        detailLevel: options.detailLevel ?? 'detailed'
      });
      
      // Add assistant message to state
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        context: response.context
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      return response.response;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        context: 'error'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      return errorMessage.content;
    } finally {
      setIsLoading(false);
    }
  }, [messages, options]);
  
  // Optimize an RFQ text
  const optimizeRfqText = useCallback(async (
    rfqText: string
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: `Please optimize this RFQ: ${rfqText}`,
        timestamp: new Date(),
        context: 'rfq_optimization'
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Call Gemini API
      const response = await optimizeRfq(rfqText, {
        userId: options.userId ?? undefined,
        detailLevel: options.detailLevel === 'comprehensive' ? 'comprehensive' : 'basic',
        language: options.language ?? 'en'
      });
      
      // Add assistant message to state
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        context: 'rfq_optimization'
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      return response.response;
    } catch (error) {
      console.error('Error optimizing RFQ:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error optimizing the RFQ. Please try again.',
        timestamp: new Date(),
        context: 'error'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      return errorMessage.content;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Get category insights
  const getCategoryInsightsInternal = useCallback(async (
    category: string
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: `What are the latest insights for the ${category} category?`,
        timestamp: new Date(),
        context: 'category_insights'
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Call Gemini API
      const response = await getCategoryInsights(category, {
        userId: options.userId ?? undefined,
        detailLevel: options.detailLevel === 'comprehensive' ? 'comprehensive' : 'basic',
        language: options.language ?? 'en'
      });
      
      // Add assistant message to state
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        context: 'category_insights'
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      return response.response;
    } catch (error) {
      console.error('Error getting category insights:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `Sorry, I encountered an error retrieving insights for the ${category} category. Please try again.`,
        timestamp: new Date(),
        context: 'error'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      return errorMessage.content;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Analyze supplier compatibility with RFQ
  const analyzeSupplierCompatibilityInternal = useCallback(async (
    supplierId: string | number,
    rfqId: string | number
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: `Is supplier #${supplierId} compatible with RFQ #${rfqId}?`,
        timestamp: new Date(),
        context: 'supplier_compatibility'
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Call Gemini API
      const response = await analyzeSupplierCompatibility(supplierId, rfqId, {
        userId: options.userId ?? undefined,
        detailLevel: options.detailLevel === 'comprehensive' ? 'comprehensive' : 'basic',
        includeSupplierInfo: true,
        language: options.language ?? 'en'
      });
      
      // Add assistant message to state
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        context: 'supplier_compatibility'
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      return response.response;
    } catch (error) {
      console.error('Error analyzing supplier compatibility:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `Sorry, I encountered an error analyzing the compatibility between supplier #${supplierId} and RFQ #${rfqId}. Please try again.`,
        timestamp: new Date(),
        context: 'error'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      return errorMessage.content;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Get negotiation talking points
  const getNegotiationTalkingPointsInternal = useCallback(async (
    supplierId: string | number,
    rfqId: string | number
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: `What negotiation points should I focus on with supplier #${supplierId} for RFQ #${rfqId}?`,
        timestamp: new Date(),
        context: 'negotiation_points'
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Call Gemini API
      const response = await getNegotiationTalkingPoints(supplierId, rfqId, {
        userId: options.userId ?? undefined,
        detailLevel: options.detailLevel === 'comprehensive' ? 'comprehensive' : 'basic',
        includeSupplierInfo: true,
        language: options.language ?? 'en'
      });
      
      // Add assistant message to state
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        context: 'negotiation_points'
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      return response.response;
    } catch (error) {
      console.error('Error getting negotiation talking points:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `Sorry, I encountered an error retrieving negotiation talking points for supplier #${supplierId} and RFQ #${rfqId}. Please try again.`,
        timestamp: new Date(),
        context: 'error'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      return errorMessage.content;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Get explanation for supplier match
  const getSupplierMatchExplanationInternal = useCallback(async (
    rfqId: string | number,
    supplierId: string | number
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: `Why was supplier #${supplierId} matched with RFQ #${rfqId}?`,
        timestamp: new Date(),
        context: 'match_explanation'
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Call Gemini API
      const response = await getSupplierMatchExplanation(rfqId, supplierId, {
        userId: options.userId ?? undefined,
        detailLevel: options.detailLevel === 'comprehensive' ? 'comprehensive' : 'basic',
        includeSupplierInfo: true,
        language: options.language ?? 'en'
      });
      
      // Add assistant message to state
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        context: 'match_explanation'
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      return response.response;
    } catch (error) {
      console.error('Error getting supplier match explanation:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `Sorry, I encountered an error retrieving the explanation for why supplier #${supplierId} was matched with RFQ #${rfqId}. Please try again.`,
        timestamp: new Date(),
        context: 'error'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      return errorMessage.content;
    } finally {
      setIsLoading(false);
    }
  }, [options]);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages(messages.filter(m => m.role === 'system'));
  }, [messages]);
  
  // Get contextual suggestions based on page context
  const getContextualSuggestions = useCallback(async (): Promise<string[]> => {
    // In a real implementation, this would call the AI to get contextual suggestions
    // based on the current page, user preferences, etc.
    // For now, we'll return static suggestions
    const defaultSuggestions = [
      "How can I improve my RFQ description?",
      "What are the current market trends?",
      "How do I find suppliers in this category?",
      "What negotiation points should I focus on?"
    ];
    
    return defaultSuggestions;
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    optimizeRfqText,
    getCategoryInsights: getCategoryInsightsInternal,
    analyzeSupplierCompatibility: analyzeSupplierCompatibilityInternal,
    getNegotiationTalkingPoints: getNegotiationTalkingPointsInternal,
    getSupplierMatchExplanation: getSupplierMatchExplanationInternal,
    getContextualSuggestions
  };
}