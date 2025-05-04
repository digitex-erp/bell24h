import { useState, useRef, useEffect } from 'react';
import { useContextualProcurement } from '@/hooks/use-contextual-procurement';
import { ChatMessage, useProcurementChatbot } from '@/hooks/use-procurement-chatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  FileText, 
  Info, 
  BarChart, 
  Calendar, 
  RefreshCw,
  Users,
  Sparkles
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// RFQ type definition
interface RFQ {
  id: number;
  title: string;
  description: string;
  category: string;
  requirements: string[];
  deadline: Date;
  budget: string;
  quantity: number;
}

// Supplier type definition
interface Supplier {
  id: number;
  name: string;
  industry: string;
  products: string[];
  rating: number;
  region: string;
  yearsOfPartnership: number;
}

// Context type definition
interface ContextData {
  currentRfq: RFQ | null;
  currentSupplier: Supplier | null;
}

interface ContextualChatInterfaceProps {
  userId?: number | null;
  showToolbar?: boolean;
  maxHeight?: string;
  initialTab?: string;
  onToolSelect?: (toolName: string) => void;
  currentContext?: ContextData; // Typed context data
}

export const ContextualChatInterface: React.FC<ContextualChatInterfaceProps> = ({
  userId = null,
  showToolbar = false,
  maxHeight = '500px',
  initialTab = 'chat',
  onToolSelect,
  currentContext
}) => {
  // Use the contextual procurement hook for context awareness
  const {
    contextualSuggestions
  } = useContextualProcurement();
  
  // Use the procurement chatbot hook for messaging functionality
  const procurementChatbot = useProcurementChatbot({ userId });
  
  // Destructure what we need from the chatbot
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    getContextualSuggestions
  } = procurementChatbot;
  
  // Mock contextual data (in a real implementation this would come from a context API)
  const contextData = {
    currentRfq: currentContext?.currentRfq || null,
    currentSupplier: currentContext?.currentSupplier || null
  };
  
  // State for storing suggestions
  const [suggestions, setSuggestions] = useState<string[]>([
    "How can I improve my RFQ description?",
    "What are the current market trends?",
    "How do I find suppliers in this category?",
    "What negotiation points should I focus on?"
  ]);
  
  // Input state
  const [inputValue, setInputValue] = useState('');
  const [selectedTab, setSelectedTab] = useState(initialTab);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Use currentContext when provided
  useEffect(() => {
    if (currentContext) {
      // If this were a real implementation, we would update the context
      // in the procurement context provider here
      console.log('Current context updated:', currentContext);
    }
  }, [currentContext]);
  
  // Load contextual suggestions on component mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        // Use contextual suggestions from procurement context if available
        if (contextualSuggestions && contextualSuggestions.length > 0) {
          setSuggestions(contextualSuggestions);
        } else {
          // Fallback to chatbot suggestions
          const chatbotSuggestions = await getContextualSuggestions();
          if (chatbotSuggestions && chatbotSuggestions.length > 0) {
            setSuggestions(chatbotSuggestions);
          }
        }
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }
    };
    
    loadSuggestions();
    
    // Refresh suggestions every 2 minutes
    const intervalId = setInterval(() => {
      loadSuggestions();
    }, 2 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [contextualSuggestions, getContextualSuggestions]);
  
  // Handle submitting a message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) {
      return;
    }
    
    // Send the message
    await sendMessage(inputValue);
    
    // Clear input
    setInputValue('');
    
    // Focus input again
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle using a suggestion
  const handleUseSuggestion = async (suggestion: string) => {
    if (isLoading) return;
    
    setInputValue(suggestion);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle selecting a tool
  const handleSelectTool = (toolName: string) => {
    if (onToolSelect) {
      onToolSelect(toolName);
    }
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(timestamp);
  };
  
  // Get message icon and color based on context
  const getMessageContextDetails = (message: ChatMessage): { icon: JSX.Element, color: string } => {
    switch (message.context) {
      case 'rfq_optimization':
        return { 
          icon: <FileText className="h-3 w-3" />, 
          color: 'bg-orange-500'
        };
      case 'category_insights':
        return { 
          icon: <BarChart className="h-3 w-3" />, 
          color: 'bg-blue-500'
        };
      case 'supplier_compatibility':
        return { 
          icon: <Users className="h-3 w-3" />, 
          color: 'bg-green-500'
        };
      case 'negotiation_points':
        return { 
          icon: <Calendar className="h-3 w-3" />, 
          color: 'bg-purple-500'
        };
      case 'match_explanation':
        return { 
          icon: <Info className="h-3 w-3" />, 
          color: 'bg-teal-500'
        };
      case 'error':
        return { 
          icon: <RefreshCw className="h-3 w-3" />, 
          color: 'bg-red-500'
        };
      default:
        return { 
          icon: <Sparkles className="h-3 w-3" />, 
          color: 'bg-primary'
        };
    }
  };
  
  // Render chat messages
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Sparkles className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Procurement Assistant</h3>
          <p className="text-muted-foreground mb-6">
            Ask me anything about procurement, suppliers, RFQs, or market trends.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleUseSuggestion(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <>
        {messages.filter(m => m.role !== 'system').map((message) => {
          const { icon, color } = getMessageContextDetails(message);
          
          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/assistant-avatar.png" />
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`flex flex-col ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.context && message.role === 'assistant' && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs flex items-center gap-1 border-0 ${color} text-white`}
                      >
                        {icon}
                        <span>{message.context.replace('_', ' ')}</span>
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 ml-2">
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback className="bg-secondary">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex items-start gap-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/assistant-avatar.png" />
              <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[170px]" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </>
    );
  };
  
  // Render context information
  const renderContext = () => {
    return (
      <div className="h-full">
        <Tabs defaultValue="rfq" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rfq" className="text-xs">RFQ Context</TabsTrigger>
            <TabsTrigger value="supplier" className="text-xs">Supplier Context</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rfq" className="flex-1 overflow-auto">
            {contextData.currentRfq ? (
              <div className="space-y-4 p-2">
                <div>
                  <h3 className="text-sm font-medium">Title</h3>
                  <p className="text-sm">{contextData.currentRfq.title}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Category</h3>
                  <p className="text-sm">{contextData.currentRfq.category}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="text-sm">{contextData.currentRfq.description}</p>
                </div>
                
                {contextData.currentRfq.requirements && contextData.currentRfq.requirements.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Requirements</h3>
                    <ul className="text-sm list-disc list-inside">
                      {contextData.currentRfq.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {contextData.currentRfq.deadline && (
                  <div>
                    <h3 className="text-sm font-medium">Deadline</h3>
                    <p className="text-sm">{contextData.currentRfq.deadline.toLocaleDateString()}</p>
                  </div>
                )}
                
                {contextData.currentRfq.budget && (
                  <div>
                    <h3 className="text-sm font-medium">Budget</h3>
                    <p className="text-sm">{contextData.currentRfq.budget}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm text-center">
                  No RFQ context set.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="supplier" className="flex-1 overflow-auto">
            {contextData.currentSupplier ? (
              <div className="space-y-4 p-2">
                <div>
                  <h3 className="text-sm font-medium">Name</h3>
                  <p className="text-sm">{contextData.currentSupplier.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Industry</h3>
                  <p className="text-sm">{contextData.currentSupplier.industry}</p>
                </div>
                
                {contextData.currentSupplier.products && contextData.currentSupplier.products.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Products</h3>
                    <ul className="text-sm list-disc list-inside">
                      {contextData.currentSupplier.products.map((prod: string, index: number) => (
                        <li key={index}>{prod}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {contextData.currentSupplier.rating !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium">Rating</h3>
                    <p className="text-sm">{contextData.currentSupplier.rating}/5</p>
                  </div>
                )}
                
                {contextData.currentSupplier.region && (
                  <div>
                    <h3 className="text-sm font-medium">Region</h3>
                    <p className="text-sm">{contextData.currentSupplier.region}</p>
                  </div>
                )}
                
                {contextData.currentSupplier.yearsOfPartnership !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium">Years of Partnership</h3>
                    <p className="text-sm">{contextData.currentSupplier.yearsOfPartnership}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm text-center">
                  No supplier context set.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  // Render suggestion chips
  const renderSuggestions = () => {
    if (suggestions.length === 0) {
      return null;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((suggestion: string, index: number) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleUseSuggestion(suggestion)}
            className="text-xs"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    );
  };
  
  // Render toolbar
  const renderToolbar = () => {
    if (!showToolbar) {
      return null;
    }
    
    const tools = [
      {
        name: 'rfq_optimizer',
        label: 'RFQ Optimizer',
        icon: <FileText className="h-4 w-4" />,
        description: 'Analyze and improve your RFQ to get better supplier responses'
      },
      {
        name: 'market_insights',
        label: 'Market Insights',
        icon: <BarChart className="h-4 w-4" />,
        description: 'Get up-to-date insights on market conditions and pricing trends'
      },
      {
        name: 'supplier_finder',
        label: 'Supplier Finder',
        icon: <Users className="h-4 w-4" />,
        description: 'Find the right suppliers for your procurement needs'
      },
      {
        name: 'negotiation_coach',
        label: 'Negotiation Coach',
        icon: <Calendar className="h-4 w-4" />,
        description: 'Get expert advice on negotiating with suppliers'
      }
    ];
    
    return (
      <div className="flex overflow-x-auto gap-2 pb-2">
        {tools.map((tool) => (
          <TooltipProvider key={tool.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleSelectTool(tool.name)}
                >
                  {tool.icon}
                  <span className="text-xs">{tool.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{tool.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="flex flex-col h-full">
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full h-full flex flex-col"
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-[180px] grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="context">Context</TabsTrigger>
            </TabsList>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              title="Clear chat"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <TabsContent
          value="chat"
          className="flex-1 flex flex-col px-0 pt-0 pb-0 m-0 overflow-hidden"
        >
          <CardContent className="flex-1 overflow-hidden p-4 pt-2">
            {renderToolbar()}
            <ScrollArea className="h-full pr-4" style={{ maxHeight }}>
              {renderMessages()}
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="border-t p-4">
            <form onSubmit={handleSubmit} className="w-full space-y-2">
              {renderSuggestions()}
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardFooter>
        </TabsContent>
        
        <TabsContent
          value="context"
          className="flex-1 m-0 overflow-hidden"
        >
          <CardContent className="h-full p-4 pt-2">
            {renderContext()}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};