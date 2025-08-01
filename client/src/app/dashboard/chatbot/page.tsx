'use client';

import { BarChart3, Bot, MessageSquare, Send, Settings, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'data';
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hello! I'm your BELL24H AI assistant. I can help you with supplier insights, market analysis, order tracking, and business intelligence. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { id: 'suppliers', text: 'Find suppliers in electronics', icon: '🔍' },
    { id: 'analytics', text: 'Show revenue analytics', icon: '📊' },
    { id: 'orders', text: 'Track my recent orders', icon: '📦' },
    { id: 'trends', text: 'Market trends analysis', icon: '📈' },
  ];

  const chatModes = [
    { id: 'general', name: 'General Assistance', icon: MessageSquare },
    { id: 'analytics', name: 'Business Analytics', icon: BarChart3 },
    { id: 'supplier', name: 'Supplier Intelligence', icon: Zap },
    { id: 'settings', name: 'Platform Settings', icon: Settings },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      let response = '';
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('supplier') || lowerMessage.includes('find')) {
        response = `I found 156 verified suppliers matching your criteria. Here are the top 5:

🔸 **ElectroTech Industries** - Mumbai
   • Rating: 4.8/5 • Orders: 2,340 • Response: <2hrs
   
🔸 **PowerComponents Ltd** - Bangalore  
   • Rating: 4.7/5 • Orders: 1,890 • Response: <1hr
   
🔸 **TechSupply Pro** - Delhi
   • Rating: 4.6/5 • Orders: 1,650 • Response: <3hrs
   
Would you like detailed profiles or quotes from these suppliers?`;
      } else if (lowerMessage.includes('revenue') || lowerMessage.includes('analytics')) {
        response = `📊 **Revenue Analytics Summary**

💰 **Current Month**: ₹12.4 Crores (+23% vs last month)
📈 **Quarter Growth**: +47% YoY
🎯 **Top Categories**: 
   • Electronics: ₹4.2Cr (34%)
   • Textiles: ₹3.1Cr (25%) 
   • Machinery: ₹2.8Cr (23%)

🔥 **Key Insights**:
   • Electronics demand surged 45% this month
   • New supplier onboarding increased 67%
   • International orders up 89%

Need detailed breakdown for any specific category?`;
      } else if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
        response = `📦 **Your Recent Orders Status**

🟢 **Order #BH-2024-5847** - ₹2.4L
   • Status: Delivered ✅
   • Supplier: TechCorp Industries
   • Delivered: 2 days ago

🟡 **Order #BH-2024-5848** - ₹1.8L  
   • Status: In Transit 🚛
   • Supplier: MetalWorks Ltd
   • Expected: Tomorrow

🔵 **Order #BH-2024-5849** - ₹3.2L
   • Status: Processing ⚙️
   • Supplier: ChemSupply Pro  
   • Expected: 3-5 days

Want to track a specific order or need delivery updates?`;
      } else if (lowerMessage.includes('trend') || lowerMessage.includes('market')) {
        response = `📈 **Market Trends Analysis**

🔥 **Hot Trends**:
   • AI/ML equipment demand +156% 
   • Sustainable materials +89%
   • Industrial automation +67%

📊 **Category Performance**:
   • Electronics: Very High demand
   • Green Energy: Rising trend  
   • Traditional Textiles: Stable

🌍 **Regional Insights**:
   • Mumbai: Electronics hub
   • Bangalore: Tech components
   • Delhi: Machinery & tools

🎯 **Recommendations**:
   • Focus on AI/ML suppliers
   • Expand green energy category
   • Strengthen regional partnerships

Need deep-dive analysis for any specific trend?`;
      } else {
        response = `I can help you with:

🔍 **Supplier Management**
   • Find verified suppliers
   • Compare quotes and ratings
   • Track supplier performance

📊 **Business Intelligence** 
   • Revenue and growth analytics
   • Market trend analysis
   • Performance insights

📦 **Order Management**
   • Track order status
   • Delivery notifications  
   • Order history and patterns

💡 **Smart Recommendations**
   • Best suppliers for your needs
   • Optimal pricing strategies
   • Market opportunities

What specific area would you like help with?`;
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    simulateAIResponse(inputMessage);
  };

  const handleQuickAction = (action: any) => {
    setInputMessage(action.text);
    handleSendMessage();
  };

  return (
    <div className='h-screen bg-gray-50 flex flex-col'>
      {/* Header */}
      <div className='bg-white shadow-lg border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center'>
                  <Bot className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>BELL24H AI Assistant</h1>
                  <p className='text-sm text-gray-600'>
                    Explainability Service • Business Intelligence Chatbot
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <select
                value={activeMode}
                onChange={e => setActiveMode(e.target.value)}
                className='px-3 py-2 border rounded-lg text-sm'
              >
                {chatModes.map(mode => (
                  <option key={mode.id} value={mode.id}>
                    {mode.name}
                  </option>
                ))}
              </select>
              <button className='p-2 text-gray-400 hover:text-gray-600'>
                <span>🔄</span>
              </button>
              <button className='p-2 text-gray-400 hover:text-gray-600'>
                <span>⬇️</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='flex-1 flex overflow-hidden'>
        {/* Chat Area */}
        <div className='flex-1 flex flex-col'>
          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-3xl ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <span>👤</span>
                    ) : (
                      <Bot className='h-4 w-4 text-white' />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-4 max-w-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className='whitespace-pre-wrap text-sm'>{message.content}</div>
                    <div
                      className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className='flex justify-start'>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center'>
                    <Bot className='h-4 w-4 text-white' />
                  </div>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
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
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className='p-4 border-t bg-white'>
            <div className='flex flex-wrap gap-2 mb-4'>
              {quickActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className='flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors'
                >
                  <span>{action.icon}</span>
                  <span>{action.text}</span>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className='flex space-x-4'>
              <div className='flex-1 relative'>
                <input
                  type='text'
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder='Ask me anything about suppliers, analytics, orders...'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
              >
                <Send className='h-4 w-4' />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='w-80 bg-white border-l border-gray-200 p-6'>
          <h3 className='font-bold text-gray-900 mb-4'>AI Assistant Features</h3>

          <div className='space-y-4'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <h4 className='font-semibold text-blue-900 mb-2'>🔍 Supplier Discovery</h4>
              <p className='text-sm text-blue-800'>
                Find verified suppliers with AI-powered matching
              </p>
            </div>

            <div className='p-4 bg-green-50 rounded-lg'>
              <h4 className='font-semibold text-green-900 mb-2'>📊 Business Analytics</h4>
              <p className='text-sm text-green-800'>
                Get real-time insights and performance metrics
              </p>
            </div>

            <div className='p-4 bg-purple-50 rounded-lg'>
              <h4 className='font-semibold text-purple-900 mb-2'>📦 Order Tracking</h4>
              <p className='text-sm text-purple-800'>Track orders and get delivery updates</p>
            </div>

            <div className='p-4 bg-orange-50 rounded-lg'>
              <h4 className='font-semibold text-orange-900 mb-2'>📈 Market Trends</h4>
              <p className='text-sm text-orange-800'>Stay updated with market insights</p>
            </div>
          </div>

          <div className='mt-8'>
            <h4 className='font-semibold text-gray-900 mb-3'>Recent Conversations</h4>
            <div className='space-y-2'>
              <div className='p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100'>
                <p className='text-sm font-medium'>Supplier search for electronics</p>
                <p className='text-xs text-gray-500'>2 hours ago</p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100'>
                <p className='text-sm font-medium'>Revenue analytics Q4</p>
                <p className='text-xs text-gray-500'>1 day ago</p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100'>
                <p className='text-sm font-medium'>Order tracking BH-2024-5847</p>
                <p className='text-xs text-gray-500'>3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
