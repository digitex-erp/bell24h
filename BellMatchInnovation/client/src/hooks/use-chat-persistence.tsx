import React, { useCallback, useEffect } from 'react';
import { ChatMessage } from '../lib/gemini';

interface UseChatPersistenceOptions {
  key: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  enabled?: boolean;
  maxStoredMessages?: number;
}

/**
 * Hook to manage chat history persistence with localStorage
 */
export function useChatPersistence({
  key,
  messages,
  setMessages,
  enabled = true,
  maxStoredMessages = 100
}: UseChatPersistenceOptions) {
  
  // Load chat history from local storage
  const loadSavedMessages = useCallback(() => {
    if (!enabled) return null;
    
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        // Take only the last maxStoredMessages
        const limitedMessages = parsed.slice(-maxStoredMessages);
        // Convert timestamp strings back to Date objects
        return limitedMessages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
      }
    } catch (error) {
      console.error(`Error loading saved messages for ${key}:`, error);
    }
    return null;
  }, [key, enabled, maxStoredMessages]);

  // Load messages on initial mount
  useEffect(() => {
    const savedMessages = loadSavedMessages();
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, [loadSavedMessages, setMessages]);
  
  // Save messages to local storage when they change
  useEffect(() => {
    if (enabled && messages.length > 0) {
      try {
        // Only save the last maxStoredMessages
        const messagesToStore = messages.slice(-maxStoredMessages);
        localStorage.setItem(key, JSON.stringify(messagesToStore));
      } catch (error) {
        console.error(`Error saving messages for ${key}:`, error);
      }
    }
  }, [messages, key, enabled, maxStoredMessages]);

  // Clear saved messages
  const clearSavedMessages = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setMessages([]);
    } catch (error) {
      console.error(`Error clearing saved messages for ${key}:`, error);
    }
  }, [key, setMessages]);

  return {
    clearSavedMessages,
    loadSavedMessages
  };
}