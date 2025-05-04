import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { ChatMessage, ChatAction, GeminiChatResponse } from '../lib/gemini';

interface UseGeminiChatbotOptions {
  userId?: number;
  initialMessages?: ChatMessage[];
  onAction?: (action: ChatAction) => void;
  mode?: 'general' | 'procurement';
}

interface UseGeminiChatbotReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string, mode?: string) => Promise<void>;
  clearMessages: () => void;
}

const defaultSystemMessage: ChatMessage = {
  role: 'system',
  content: `You are a helpful assistant for Bell24h.com, a global AI-powered RFQ marketplace that 
  simplifies procurement through intelligent supplier matching and multilingual blockchain-secured transactions.
  You can help with navigation, explain features, and provide general assistance.`
};

/**
 * Hook for interacting with the Gemini chatbot
 * 
 * @param options Configuration options
 * @returns State and methods for interacting with the chatbot
 */
export function useGeminiChatbot({
  userId,
  initialMessages = [defaultSystemMessage],
  onAction,
  mode = 'general'
}: UseGeminiChatbotOptions = {}): UseGeminiChatbotReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle chat actions effect
  useEffect(() => {
    if (!onAction) return;
    
    // Check the last message for potential actions
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== 'assistant') return;
    
    // Extract actions from content if they exist
    const actionMatches = lastMessage.content.match(/\[ACTION\](.*?)\[\/ACTION\]/g);
    if (!actionMatches) return;
    
    // Process each action
    actionMatches.forEach(match => {
      try {
        const actionJson = match.replace('[ACTION]', '').replace('[/ACTION]', '');
        const action = JSON.parse(actionJson);
        onAction(action as ChatAction);
      } catch (e) {
        console.error('Error parsing action JSON:', e);
      }
    });
    
    // Clean up the message by removing action tags
    const cleanContent = lastMessage.content.replace(/\[ACTION\](.*?)\[\/ACTION\]/g, '');
    if (cleanContent !== lastMessage.content) {
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1] = {
          ...lastMessage,
          content: cleanContent
        };
        return newMessages;
      });
    }
  }, [messages, onAction]);
  
  /**
   * Send a message to the chatbot
   */
  const sendMessage = useCallback(async (message: string, requestMode: string = mode) => {
    if (!message.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to the chat
      const userMessage: ChatMessage = { role: 'user', content: message };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Filter out system messages for the API request
      const historyForApi = updatedMessages.filter(msg => msg.role !== 'system');
      
      // Call the Gemini chatbot API
      const response = await axios.post<GeminiChatResponse>('/api/chatbot/gemini', {
        message,
        history: historyForApi.slice(0, -1), // Exclude the message we just added
        userId,
        mode: requestMode
      });
      
      // Add assistant message to the chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.response
      };
      
      setMessages([...updatedMessages, assistantMessage]);
      
      // Process actions if present
      if (response.data.actions && response.data.actions.length > 0 && onAction) {
        response.data.actions.forEach(action => {
          onAction(action);
        });
      }
    } catch (err) {
      console.error('Error sending message to Gemini chatbot:', err);
      
      // Handle API errors
      let errorMessage = 'Failed to get a response. Please try again.';
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      const errorAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${errorMessage}`
      };
      
      setMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, userId, mode, onAction]);
  
  /**
   * Clear all messages except the system message
   */
  const clearMessages = useCallback(() => {
    // Keep only system messages
    const systemMessages = messages.filter(msg => msg.role === 'system');
    setMessages(systemMessages.length > 0 ? systemMessages : [defaultSystemMessage]);
    setError(null);
  }, [messages]);
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
}