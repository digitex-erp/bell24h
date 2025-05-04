import React, { useState, useRef, useEffect } from 'react';
import { useProcurementChatbot } from '../../hooks/use-procurement-chatbot';
import { Book, Loader2, RotateCcw, Send, Sparkles, FileText, Menu, Lightbulb } from 'lucide-react';

// A simplified chat interface with procurement tools
export function ProcurementChat() {
  const {
    messages,
    isLoading,
    sendMessage,
    getCategoryAdvice,
    optimizeRfqText,
    clearMessages
  } = useProcurementChatbot({
    storageKey: 'bell24h_procurement_chat',
    maxStoredMessages: 150
  });

  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Tool panel state
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [rfqInput, setRfqInput] = useState('');

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle chat submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  // Handle category insights request
  const handleCategoryInsights = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryInput.trim()) {
      getCategoryAdvice(categoryInput);
      setCategoryInput('');
      setShowToolPanel(false);
    }
  };

  // Handle RFQ optimization request
  const handleRfqOptimization = (e: React.FormEvent) => {
    e.preventDefault();
    if (rfqInput.trim()) {
      optimizeRfqText(rfqInput);
      setRfqInput('');
      setShowToolPanel(false);
    }
  };

  // Quick action suggestions
  const suggestions = [
    { text: "What are the best practices for electronics procurement?", action: () => { 
      setInputValue("What are the best practices for electronics procurement?");
      sendMessage("What are the best practices for electronics procurement?");
      setShowSuggestions(false);
    }},
    { text: "Help me draft an effective RFQ", action: () => { 
      setInputValue("Help me draft an effective RFQ");
      sendMessage("Help me draft an effective RFQ");
      setShowSuggestions(false);
    }},
    { text: "Tips for negotiating with international suppliers", action: () => { 
      setInputValue("Tips for negotiating with international suppliers");
      sendMessage("Tips for negotiating with international suppliers");
      setShowSuggestions(false);
    }}
  ];
  
  // Use a category from the suggestions
  const useCategory = (category: string) => {
    getCategoryAdvice(category);
    setShowToolPanel(false);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-md overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles size={20} />
          <h2 className="font-semibold">Procurement Assistant</h2>
        </div>
        <div>
          <button
            onClick={() => clearMessages()}
            className="p-1 rounded-full hover:bg-blue-700 transition-colors"
            title="Clear conversation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-5">
            <div className="bg-blue-50 p-6 rounded-xl text-center max-w-md">
              <Lightbulb className="mx-auto text-blue-500 mb-2" size={28} />
              <h3 className="text-lg font-medium text-gray-800">Procurement AI Assistant</h3>
              <p className="text-gray-600 mt-2">
                Ask me about procurement strategies, supplier evaluation, or RFQ optimization. 
                I can help with category insights and negotiation tips too.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl">
              <button
                onClick={() => useCategory('Industrial Equipment')}
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <Book className="text-blue-500 mr-2" size={16} />
                <span className="text-sm text-gray-700">Industrial Equipment Insights</span>
              </button>
              
              <button
                onClick={() => setRfqInput('Need 500 units of industrial-grade LED displays with 4K resolution for outdoor digital signage project. Delivery expected within 60 days.')}
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <FileText className="text-blue-500 mr-2" size={16} />
                <span className="text-sm text-gray-700">Optimize Sample RFQ</span>
              </button>
              
              <button
                onClick={() => setShowSuggestions(true)}
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <Menu className="text-blue-500 mr-2" size={16} />
                <span className="text-sm text-gray-700">More Suggestions</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-xl p-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-gray-800 max-w-[75%]'
                      : 'bg-white border border-gray-200 text-gray-800 max-w-[75%]'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.timestamp && (
                    <div className="text-xs mt-1 text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips - only visible when appropriate */}
      {showSuggestions && (
        <div className="px-4 py-3 bg-gray-50 border-t space-y-2">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={suggestion.action}
                className="bg-white text-sm text-gray-700 px-3 py-1 rounded-full border hover:bg-gray-100 transition-colors"
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tool panel - visible when a specialized tool is selected */}
      {showToolPanel && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Procurement Tools</h3>
            <button 
              onClick={() => setShowToolPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Category Insights Tool */}
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center text-blue-600 mb-2">
                <Book size={16} className="mr-1" />
                <h4 className="text-sm font-medium">Category Insights</h4>
              </div>
              <form onSubmit={handleCategoryInsights} className="space-y-2">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="Enter a product category (e.g., Electronics)"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  disabled={isLoading}
                />
                <div className="flex space-x-2">
                  <button 
                    type="button"
                    onClick={() => useCategory('Electronics')}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                  >
                    Electronics
                  </button>
                  <button 
                    type="button"
                    onClick={() => useCategory('Industrial Equipment')}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                  >
                    Industrial
                  </button>
                  <button 
                    type="button"
                    onClick={() => useCategory('Healthcare Supplies')}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                  >
                    Healthcare
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1.5 text-sm disabled:opacity-50"
                  disabled={isLoading || !categoryInput.trim()}
                >
                  {isLoading ? 'Loading...' : 'Get Category Insights'}
                </button>
              </form>
            </div>
            
            {/* RFQ Optimization Tool */}
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center text-blue-600 mb-2">
                <FileText size={16} className="mr-1" />
                <h4 className="text-sm font-medium">RFQ Optimization</h4>
              </div>
              <form onSubmit={handleRfqOptimization} className="space-y-2">
                <textarea
                  value={rfqInput}
                  onChange={(e) => setRfqInput(e.target.value)}
                  placeholder="Paste your RFQ text here for optimization suggestions..."
                  className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1.5 text-sm disabled:opacity-50"
                  disabled={isLoading || !rfqInput.trim()}
                >
                  {isLoading ? 'Optimizing...' : 'Optimize RFQ'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-3 bg-white">
        <form onSubmit={handleChatSubmit} className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowToolPanel(!showToolPanel)}
            className="p-2 text-gray-500 hover:text-gray-700 border rounded-md hover:bg-gray-50"
            title="Procurement Tools"
          >
            <Sparkles size={18} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => messages.length === 0 && setShowSuggestions(true)}
            placeholder="Ask about procurement, suppliers, or RFQs..."
            className="flex-grow px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 disabled:opacity-50"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}