import { useState, useRef, useEffect, FormEvent } from 'react';
import { useProcurementChatbot } from '../../hooks/use-procurement-chatbot';
import { useUserPreferences } from '../../hooks/use-user-preferences';
import { ProcurementChatPreferences } from './preference-settings';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { 
  ShoppingBag, 
  Settings, 
  SendHorizontal, 
  Info, 
  BarChart, 
  FileText, 
  ThumbsUp, 
  User, 
  Bot 
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

/**
 * Types for the component props
 */
export interface ProcurementChatInterfaceProps {
  userId?: number | null;
  initialTab?: 'chat' | 'tools';
}

/**
 * Enhanced procurement chatbot interface with user preferences
 */
export const ProcurementChatInterface = ({
  userId = null,
  initialTab = 'chat'
}: ProcurementChatInterfaceProps) => {
  // Get user preferences
  const { preferences } = useUserPreferences();
  
  // Initialize chatbot
  const {
    messages,
    isLoading,
    isOnline,
    sendMessage,
    getCategoryAdvice,
    optimizeRfqText,
    getNegotiationAdvice,
    analyzeSupplier,
    clearMessages
  } = useProcurementChatbot({
    userId,
    persist: true,
    maxStoredMessages: 100
  });

  // State for message input
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showSettings, setShowSettings] = useState(false);
  
  // State for specialized tools
  const [categoryInput, setCategoryInput] = useState('');
  const [rfqInput, setRfqInput] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [rfqId, setRfqId] = useState('');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && preferences.chatPreferences.autoScrollEnabled) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, preferences.chatPreferences.autoScrollEnabled]);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle message submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  // Handle category advice request
  const handleCategoryAdvice = () => {
    if (categoryInput.trim() && !isLoading) {
      getCategoryAdvice(categoryInput);
      setCategoryInput('');
      setActiveTab('chat');
    }
  };

  // Handle RFQ optimization request
  const handleOptimizeRfq = () => {
    if (rfqInput.trim() && !isLoading) {
      optimizeRfqText(rfqInput);
      setRfqInput('');
      setActiveTab('chat');
    }
  };

  // Handle negotiation advice request
  const handleNegotiationAdvice = () => {
    const supplierIdNum = parseInt(supplierId);
    const rfqIdNum = parseInt(rfqId);
    
    if (!isNaN(supplierIdNum) && !isNaN(rfqIdNum) && !isLoading) {
      getNegotiationAdvice(supplierIdNum, rfqIdNum);
      setSupplierId('');
      setRfqId('');
      setActiveTab('chat');
    }
  };

  // Handle supplier analysis request
  const handleSupplierAnalysis = () => {
    const supplierIdNum = parseInt(supplierId);
    const rfqIdNum = parseInt(rfqId);
    
    if (!isNaN(supplierIdNum) && !isNaN(rfqIdNum) && !isLoading) {
      analyzeSupplier(supplierIdNum, rfqIdNum);
      setSupplierId('');
      setRfqId('');
      setActiveTab('chat');
    }
  };

  // Sample suggestion chips
  const suggestions = [
    "What categories have the best margins?",
    "Help me find reliable electronics suppliers",
    "How to negotiate better payment terms?",
    "What are common RFQ mistakes to avoid?"
  ];

  // Apply font size based on preferences
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  // Apply message spacing based on preferences
  const spacingClasses = {
    compact: 'space-y-2',
    comfortable: 'space-y-4',
    spacious: 'space-y-6'
  };
  
  // Get status indicator styles
  const getConnectionStatusStyles = () => {
    return {
      indicator: isOnline ? 'bg-green-500' : 'bg-red-500',
      text: isOnline ? 'text-green-500' : 'text-red-500',
      label: isOnline ? 'Online' : 'Offline'
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main interface */}
      <div className="flex flex-col h-full">
        {/* Tabs and Settings */}
        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Bot size={16} />
                  <span>Chatbot</span>
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex items-center gap-2">
                  <ShoppingBag size={16} />
                  <span>Procurement Tools</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center">
                {/* Connection status indicator */}
                <div className="flex items-center mr-3">
                  <div className={`h-2 w-2 rounded-full ${getConnectionStatusStyles().indicator} mr-2`}></div>
                  <span className={`text-xs font-medium ${getConnectionStatusStyles().text}`}>
                    {getConnectionStatusStyles().label}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings size={20} />
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6">
            <ProcurementChatPreferences />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <TabsContent value="chat" className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto mb-4 ${spacingClasses[preferences.interfacePreferences.messageCompactness]}`}>
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center space-y-4 max-w-md mx-auto p-6">
                    <Bot size={48} className="mx-auto text-primary" />
                    <h3 className="text-xl font-semibold">Procurement Assistant</h3>
                    <p className="text-muted-foreground">
                      Ask me anything about procurement, suppliers, or RFQs. I'm here to help optimize your procurement process.
                    </p>
                    
                    {preferences.chatPreferences.suggestionsEnabled && (
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {suggestions.map((suggestion, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary py-2"
                            onClick={() => {
                              setInputValue(suggestion);
                              if (inputRef.current) {
                                inputRef.current.focus();
                              }
                            }}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-center gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => setActiveTab('tools')}
                      >
                        <ShoppingBag size={16} />
                        <span>Procurement Tools</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => setShowSettings(true)}
                      >
                        <Settings size={16} />
                        <span>Customize</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`mb-4 ${
                        msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      <div 
                        className={`flex gap-3 ${
                          msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div 
                          className={`p-2 rounded-full flex-shrink-0 ${
                            msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                          }`}
                        >
                          {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        
                        <div
                          className={`${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : msg.isOfflineResponse
                              ? 'bg-amber-50 border border-amber-200 text-amber-800'
                              : 'bg-muted text-foreground'
                          } p-4 rounded-lg max-w-[80%] ${fontSizeClasses[preferences.interfacePreferences.fontSize]}`}
                        >
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          {msg.isOfflineResponse && (
                            <div className="flex items-center mt-2 text-xs text-amber-600">
                              <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                              <span>Offline response</span>
                            </div>
                          )}
                          
                          {/* Message actions if any */}
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {msg.actions.map((action, actionIndex) => (
                                <Badge 
                                  key={actionIndex} 
                                  variant={msg.role === 'user' ? 'outline' : 'secondary'}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    if (action.type === 'category') {
                                      setCategoryInput(action.value);
                                      setActiveTab('tools');
                                    } else if (action.type === 'rfq') {
                                      setRfqInput(action.value);
                                      setActiveTab('tools');
                                    }
                                  }}
                                >
                                  {action.label}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Timestamp */}
                          {preferences.interfacePreferences.showTimestamps && msg.timestamp && (
                            <div className="mt-1 text-xs opacity-70">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                placeholder="Type your message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="h-12"
              >
                <SendHorizontal />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="tools" className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Insights Tool */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <BarChart className="text-primary" />
                      <h3 className="text-lg font-medium">Category Insights</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get detailed analysis and insights for specific product categories
                    </p>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Enter category name (e.g., Electronics, Office Supplies)"
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        onClick={handleCategoryAdvice} 
                        disabled={isLoading || !categoryInput.trim()}
                        className="w-full"
                      >
                        Get Category Insights
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* RFQ Optimization Tool */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="text-primary" />
                      <h3 className="text-lg font-medium">RFQ Optimization</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Improve your RFQ text to get better supplier responses
                    </p>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Paste your RFQ text here for optimization suggestions"
                        value={rfqInput}
                        onChange={(e) => setRfqInput(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        onClick={handleOptimizeRfq} 
                        disabled={isLoading || !rfqInput.trim()}
                        className="w-full"
                      >
                        Optimize RFQ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Analysis Tool */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Info className="text-primary" />
                      <h3 className="text-lg font-medium">Supplier Analysis</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Analyze a supplier's compatibility with a specific RFQ
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Textarea
                          placeholder="Supplier ID"
                          value={supplierId}
                          onChange={(e) => setSupplierId(e.target.value.replace(/[^0-9]/g, ''))}
                          rows={1}
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="RFQ ID"
                          value={rfqId}
                          onChange={(e) => setRfqId(e.target.value.replace(/[^0-9]/g, ''))}
                          rows={1}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSupplierAnalysis} 
                      disabled={isLoading || !supplierId.trim() || !rfqId.trim()}
                      className="w-full"
                    >
                      Analyze Compatibility
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Negotiation Helper Tool */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="text-primary" />
                      <h3 className="text-lg font-medium">Negotiation Helper</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get talking points for negotiating with a specific supplier
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Textarea
                          placeholder="Supplier ID"
                          value={supplierId}
                          onChange={(e) => setSupplierId(e.target.value.replace(/[^0-9]/g, ''))}
                          rows={1}
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="RFQ ID"
                          value={rfqId}
                          onChange={(e) => setRfqId(e.target.value.replace(/[^0-9]/g, ''))}
                          rows={1}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleNegotiationAdvice} 
                      disabled={isLoading || !supplierId.trim() || !rfqId.trim()}
                      className="w-full"
                    >
                      Get Negotiation Points
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};