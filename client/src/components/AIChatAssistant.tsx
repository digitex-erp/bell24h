'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: string;
  icon: any;
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Sample quick actions
  const quickActions: QuickAction[] = [
    { label: 'Get Quote', action: 'quote', icon: FileText },
    { label: 'Find Suppliers', action: 'suppliers', icon: Search },
    { label: 'Market Trends', action: 'trends', icon: TrendingUp },
    { label: 'Optimize RFQ', action: 'optimize', icon: Zap },
  ];

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content:
          "👋 Hi! I'm Bell24H AI Assistant. I'm here to help you with procurement, supplier discovery, RFQ optimization, and market insights. How can I assist you today?",
        timestamp: new Date(),
        quickActions: quickActions,
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulated AI responses
  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes('quote') || message.includes('rfq')) {
      return 'I can help you create an optimized RFQ! Based on your requirements, I recommend:\n\n✅ Include detailed specifications\n✅ Set clear delivery timelines\n✅ Specify quality standards\n✅ Add payment terms\n\nWould you like me to guide you through creating an RFQ template?';
    }

    if (message.includes('supplier') || message.includes('vendor')) {
      return "I can help you find the perfect suppliers! Bell24H has 500K+ verified suppliers across 50+ categories.\n\n🔍 What industry are you looking for?\n📍 Preferred location/region?\n💰 Budget range?\n📅 Timeline requirements?\n\nShare these details and I'll recommend the best matches!";
    }

    if (message.includes('price') || message.includes('cost')) {
      return 'Smart pricing strategies can save you 15-30%! Here are my recommendations:\n\n💡 Use bulk ordering for better rates\n📊 Compare 3-5 suppliers minimum\n⏰ Consider off-peak delivery timing\n🤝 Negotiate payment terms\n\nWant me to analyze current market prices for your specific requirements?';
    }

    if (message.includes('trend') || message.includes('market')) {
      return 'Current B2B market trends show:\n\n📈 Electronics demand up 23%\n🏭 Manufacturing automation growing 18%\n🌱 Sustainable materials trending +35%\n📱 Digital procurement adoption +42%\n\nWhich industry trends interest you most?';
    }

    if (message.includes('payment') || message.includes('escrow')) {
      return "Bell24H's secure payment system ensures 100% transaction safety:\n\n🔒 Smart contract escrow protection\n💳 Multiple payment methods\n📄 Automated invoice processing\n⚡ Instant payment releases\n\nYour funds are protected until delivery confirmation!";
    }

    if (message.includes('help') || message.includes('how')) {
      return "I'm here to help with all your B2B needs:\n\n🎯 RFQ creation and optimization\n🔍 Supplier discovery and verification\n💰 Cost optimization strategies\n📊 Market insights and trends\n🔒 Secure transaction guidance\n\nWhat specific area would you like assistance with?";
    }

    return "Great question! I'm analyzing the latest market data to provide you with the most accurate information. Based on current trends and Bell24H's platform data, I recommend exploring our verified supplier network for the best results. Would you like me to connect you with relevant suppliers or help you create an optimized RFQ?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
        quickActions: Math.random() > 0.5 ? quickActions.slice(0, 2) : undefined,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Show new message indicator if chat is closed
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: { [key: string]: string } = {
      quote: "I'd like help creating an optimized RFQ",
      suppliers: 'Can you help me find verified suppliers?',
      trends: 'What are the current market trends?',
      optimize: 'How can I optimize my procurement process?',
    };

    setInputValue(actionMessages[action] || action);
    setTimeout(handleSendMessage, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div>
      {/* Only render animated/live chat if hasMounted is true */}
      {hasMounted ? (
        <>
          {/* Floating Chat Button */}
          <motion.div
            className='fixed bottom-6 right-6 z-50'
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
          >
            <AnimatePresence>
              {!isOpen && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={toggleChat}
                  className='relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center group'
                >
                  <MessageCircle className='w-7 h-7' />

                  {/* New message indicator */}
                  {hasNewMessage && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center'
                    >
                      <div className='w-2 h-2 bg-white rounded-full'></div>
                    </motion.div>
                  )}

                  {/* Pulse animation */}
                  <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-75 animate-ping'></div>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Chat Interface */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 100 }}
                transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 300 }}
                className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ${
                  isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
                }`}
              >
                {/* Chat Header */}
                <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                      <Bot className='w-5 h-5' />
                    </div>
                    <div>
                      <h3 className='font-semibold'>Bell24H AI Assistant</h3>
                      <div className='flex items-center gap-2 text-xs text-blue-100'>
                        <div className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></div>
                        Online • Ready to help
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className='w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center'
                    >
                      {isMinimized ? (
                        <Maximize2 className='w-4 h-4' />
                      ) : (
                        <Minimize2 className='w-4 h-4' />
                      )}
                    </button>
                    <button
                      onClick={toggleChat}
                      className='w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center'
                    >
                      <span>❌</span>
                    </button>
                  </div>
                </div>

                {!isMinimized && (
                  <>
                    {/* Messages Container */}
                    <div className='flex-1 overflow-y-auto p-4 space-y-4 max-h-96'>
                      {messages.map(message => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${
                            message.type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] ${
                              message.type === 'user' ? 'order-2' : 'order-1'
                            }`}
                          >
                            <div
                              className={`flex items-start gap-2 ${
                                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  message.type === 'user'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {message.type === 'user' ? (
                                  <span>👤</span>
                                ) : (
                                  <Bot className='w-4 h-4' />
                                )}
                              </div>
                              <div
                                className={`rounded-2xl p-3 max-w-full ${
                                  message.type === 'user'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <div className='whitespace-pre-wrap text-sm'>{message.content}</div>
                                <div
                                  className={`text-xs mt-1 ${
                                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                  }`}
                                >
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            {message.quickActions && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className='mt-3 flex flex-wrap gap-2 ml-10'
                              >
                                {message.quickActions.map(action => (
                                  <button
                                    key={action.action}
                                    onClick={() => handleQuickAction(action.action)}
                                    className='flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200'
                                  >
                                    <action.icon className='w-3 h-3' />
                                    {action.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className='flex justify-start'
                        >
                          <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                              <Bot className='w-4 h-4 text-gray-600' />
                            </div>
                            <div className='bg-gray-100 rounded-2xl p-3'>
                              <div className='flex space-x-1'>
                                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                                <div
                                  className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                  style={{ animationDelay: '0.1s' }}
                                ></div>
                                <div
                                  className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                  style={{ animationDelay: '0.2s' }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className='border-t border-gray-200 p-4'>
                      <div className='flex items-center gap-3'>
                        <div className='flex-1 relative'>
                          <input
                            ref={inputRef}
                            type='text'
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder='Ask me anything about procurement...'
                            className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'
                          />
                          {inputValue.trim() && (
                            <motion.button
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              onClick={handleSendMessage}
                              className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center hover:shadow-lg transition-all'
                            >
                              <Send className='w-4 h-4' />
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions Bar */}
                      <div className='flex gap-2 mt-3 overflow-x-auto'>
                        {quickActions.map(action => (
                          <button
                            key={action.action}
                            onClick={() => handleQuickAction(action.action)}
                            className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 rounded-lg text-sm hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all whitespace-nowrap'
                          >
                            <action.icon className='w-3 h-3' />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        // Fallback or static rendering for hydration
        <div className='fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-96 h-[600px] flex flex-col'>
          <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                <Bot className='w-5 h-5' />
              </div>
              <div>
                <h3 className='font-semibold'>Bell24H AI Assistant</h3>
                <div className='flex items-center gap-2 text-xs text-blue-100'>
                  <div className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></div>
                  Online • Ready to help
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className='w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center'
              >
                {isMinimized ? (
                  <Maximize2 className='w-4 h-4' />
                ) : (
                  <Minimize2 className='w-4 h-4' />
                )}
              </button>
              <button
                onClick={toggleChat}
                className='w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center'
              >
                <MessageCircle className='w-4 h-4' />
              </button>
            </div>
          </div>
          <div className='flex-1 overflow-y-auto p-4 space-y-4 max-h-96'>
            <div className='flex justify-start'>
              <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                <Bot className='w-4 h-4 text-gray-600' />
              </div>
              <div className='bg-gray-100 rounded-2xl p-3'>
                <div className='whitespace-pre-wrap text-sm'>
                  Hi! I'm Bell24H AI Assistant. I'm here to help you with procurement, supplier
                  discovery, RFQ optimization, and market insights. How can I assist you today?
                </div>
                <div className='text-xs mt-1 text-gray-500'>12:30 PM</div>
              </div>
            </div>
            <div className='flex justify-end'>
              <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                <span>👤</span>
              </div>
              <div className='bg-gray-100 rounded-2xl p-3'>
                <div className='whitespace-pre-wrap text-sm'>
                  I'd like help creating an optimized RFQ
                </div>
                <div className='text-xs mt-1 text-blue-100'>12:31 PM</div>
              </div>
            </div>
            <div className='flex justify-start'>
              <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                <Bot className='w-4 h-4 text-gray-600' />
              </div>
              <div className='bg-gray-100 rounded-2xl p-3'>
                <div className='whitespace-pre-wrap text-sm'>
                  I can help you create an optimized RFQ! Based on your requirements, I recommend:
                </div>
                <div className='text-xs mt-1 text-gray-500'>12:32 PM</div>
              </div>
            </div>
            <div className='flex justify-end'>
              <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                <span>👤</span>
              </div>
              <div className='bg-gray-100 rounded-2xl p-3'>
                <div className='whitespace-pre-wrap text-sm'>
                  I'd like help creating an optimized RFQ
                </div>
                <div className='text-xs mt-1 text-blue-100'>12:33 PM</div>
              </div>
            </div>
          </div>
          <div className='border-t border-gray-200 p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex-1 relative'>
                <input
                  type='text'
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Ask me anything about procurement...'
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'
                />
                {inputValue.trim() && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={handleSendMessage}
                    className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center hover:shadow-lg transition-all'
                  >
                    <Send className='w-4 h-4' />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className='flex gap-2 mt-3 overflow-x-auto'>
              {quickActions.map(action => (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 rounded-lg text-sm hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all whitespace-nowrap'
                >
                  <action.icon className='w-3 h-3' />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
