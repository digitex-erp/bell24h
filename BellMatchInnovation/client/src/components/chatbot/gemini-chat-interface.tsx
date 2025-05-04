import { useState, useRef, useEffect } from 'react';
import { useGeminiChatbot } from '../../hooks/use-gemini-chatbot';
import { useProcurementChatbot } from '../../hooks/use-procurement-chatbot';
import { ChatMessage, ChatAction } from '../../lib/gemini';

interface GeminiChatInterfaceProps {
  mode?: 'general' | 'procurement';
  userId?: number;
  initialMessages?: ChatMessage[];
  onActionTriggered?: (action: ChatAction) => void;
  className?: string;
}

/**
 * A customizable chat interface component for interacting with Gemini AI
 */
export function GeminiChatInterface({
  mode = 'general',
  userId,
  initialMessages,
  onActionTriggered,
  className = '',
}: GeminiChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  
  // Choose between general and specialized procurement chatbot
  const generalChatbot = useGeminiChatbot({
    userId,
    initialMessages,
    onAction: onActionTriggered,
  });
  
  const procurementChatbot = useProcurementChatbot({
    userId,
    initialMessages,
    onAction: onActionTriggered,
  });
  
  // Use the appropriate chatbot based on mode
  const chatbot = mode === 'procurement' ? procurementChatbot : generalChatbot;
  const { messages, isLoading, error, sendMessage } = chatbot;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  // Handle action button clicks
  const handleActionClick = (action: ChatAction) => {
    if (onActionTriggered) {
      onActionTriggered(action);
    }
    
    // Some action handling within the component
    if (action.type === 'show_category_select') {
      setShowCategorySelect(true);
    } else if (action.type === 'procurement_insights' && mode === 'procurement' && procurementChatbot.requestCategoryInsights) {
      if (action.payload?.categories?.length) {
        procurementChatbot.requestCategoryInsights(action.payload.categories);
      } else {
        setShowCategorySelect(true);
      }
    }
  };

  // Handle category selection for procurement insights
  const handleCategorySelect = () => {
    if (selectedCategories.length > 0 && mode === 'procurement') {
      procurementChatbot.requestCategoryInsights(selectedCategories);
      setShowCategorySelect(false);
      setSelectedCategories([]);
    }
  };

  // Toggle a category in the selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  // Example categories for demonstration
  const availableCategories = [
    "Electronics",
    "Industrial Equipment",
    "Raw Materials",
    "Office Supplies",
    "IT Services",
    "Logistics",
    "Manufacturing"
  ];

  return (
    <div className={`flex flex-col h-full max-w-3xl mx-auto ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
        {messages.length === 1 && messages[0].role === 'system' ? (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">
              {mode === 'procurement' 
                ? 'Procurement Assistant' 
                : 'Bell24h AI Assistant'}
            </h3>
            <p className="text-blue-600">
              {mode === 'procurement'
                ? 'Ask me about procurement trends, supplier recommendations, or RFQ optimization.'
                : 'How can I help you today? I can assist with RFQs, supplier matching, and more.'}
            </p>
          </div>
        ) : (
          messages
            .filter(msg => msg.role !== 'system')
            .map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))
        )}
        {isLoading && (
          <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-[85%] animate-pulse">
            Thinking...
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg max-w-[85%] border border-red-300">
            Error: {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showCategorySelect && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <h4 className="font-medium mb-2">Select categories for insights:</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {availableCategories.map(category => (
              <button
                key={category}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            disabled={selectedCategories.length === 0}
            onClick={handleCategorySelect}
          >
            Get Insights
          </button>
          <button
            className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            onClick={() => setShowCategorySelect(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center p-3 border-t border-gray-200 bg-white rounded-b-lg"
      >
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            isLoading
              ? 'Please wait...'
              : mode === 'procurement'
              ? 'Ask about procurement trends, categories, or RFQs...'
              : 'Ask a question...'
          }
          value={inputValue}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
          disabled={!inputValue.trim() || isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
}