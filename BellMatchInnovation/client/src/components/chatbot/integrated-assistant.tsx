import React, { useState, useRef, useEffect } from 'react';
import { ContextualChatInterface } from './contextual-chat-interface';
import { ProcurementChatPreferences } from './preference-settings';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Bot, 
  Maximize2, 
  Minimize2, 
  X, 
  MessageSquare, 
  BarChart3,
  ShoppingBag,
  Search,
  Settings
} from 'lucide-react';
import { useUserPreferences } from '../../hooks/use-user-preferences';

/**
 * IntegratedAssistant Props
 */
interface IntegratedAssistantProps {
  userId?: number | null;
  initiallyOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

/**
 * Integrated Procurement Assistant Component
 * 
 * This component provides a floating assistant that can be integrated into any page.
 * It contains the procurement chatbot with various tools for procurement tasks.
 */
export const IntegratedAssistant: React.FC<IntegratedAssistantProps> = ({
  userId = null,
  initiallyOpen = false,
  position = 'bottom-right',
  size = 'medium',
  onClose,
  onMinimize,
  onMaximize
}) => {
  // State
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const { preferences, updateChatPreferences, updateInterfacePreferences, resetPreferences } = useUserPreferences();
  
  // Refs
  const assistantRef = useRef<HTMLDivElement>(null);
  
  // Position styles
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };
  
  // Size styles
  const sizeStyles = {
    small: {
      collapsed: 'h-12 w-12',
      open: 'h-[400px] w-[350px]',
      maximized: 'h-[calc(100vh-2rem)] w-[calc(100vw-2rem)]'
    },
    medium: {
      collapsed: 'h-14 w-14',
      open: 'h-[500px] w-[400px]',
      maximized: 'h-[calc(100vh-2rem)] w-[calc(100vw-2rem)]'
    },
    large: {
      collapsed: 'h-16 w-16',
      open: 'h-[600px] w-[450px]',
      maximized: 'h-[calc(100vh-2rem)] w-[calc(100vw-2rem)]'
    }
  };
  
  // Handle clicks outside to close the assistant
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assistantRef.current && !assistantRef.current.contains(event.target as Node) && !isMaximized) {
        // Don't close if maximized
        // setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMaximized]);
  
  // Toggle open/closed
  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };
  
  // Toggle maximize
  const toggleMaximize = () => {
    setIsMaximized(prev => {
      const newState = !prev;
      
      if (newState && onMaximize) {
        onMaximize();
      } else if (!newState && onMinimize) {
        onMinimize();
      }
      
      return newState;
    });
  };
  
  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };
  
  // Get current size class
  const getCurrentSizeClass = () => {
    if (!isOpen) {
      return sizeStyles[size].collapsed;
    }
    
    return isMaximized ? sizeStyles[size].maximized : sizeStyles[size].open;
  };
  
  // Render collapsed button
  if (!isOpen) {
    return (
      <Button
        className={`rounded-full flex items-center justify-center fixed z-50 ${positionStyles[position]} ${getCurrentSizeClass()} p-0`}
        onClick={toggleOpen}
        variant="default"
      >
        <Bot size={24} />
      </Button>
    );
  }
  
  // Render expanded assistant
  return (
    <div
      ref={assistantRef}
      className={`fixed z-50 ${positionStyles[position]} ${getCurrentSizeClass()} transition-all duration-300 ease-in-out bg-background shadow-lg rounded-lg border overflow-hidden flex flex-col`}
      style={{ maxHeight: isMaximized ? 'calc(100vh - 2rem)' : '80vh' }}
    >
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-muted/50">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-primary" />
          <h3 className="font-medium">Procurement Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          {isMaximized ? (
            <Button variant="ghost" size="icon" onClick={toggleMaximize} title="Minimize">
              <Minimize2 size={16} />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={toggleMaximize} title="Maximize">
              <Maximize2 size={16} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleClose} title="Close">
            <X size={16} />
          </Button>
        </div>
      </div>
      
      {/* Assistant Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="px-3 pt-2 bg-background border-b h-auto justify-start gap-2">
          <TabsTrigger value="chat" className="px-3 h-9">
            <MessageSquare size={16} className="mr-2" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="px-3 h-9">
            <BarChart3 size={16} className="mr-2" />
            <span>Insights</span>
          </TabsTrigger>
          <TabsTrigger value="procurement" className="px-3 h-9">
            <ShoppingBag size={16} className="mr-2" />
            <span>RFQs</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="px-3 h-9">
            <Search size={16} className="mr-2" />
            <span>Search</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="px-3 h-9">
            <Settings size={16} className="mr-2" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {/* Chat Tab */}
          <TabsContent value="chat" className="m-0 h-full">
            <ContextualChatInterface userId={userId} initialTab="chat" />
          </TabsContent>
          
          {/* Insights Tab */}
          <TabsContent value="insights" className="m-0 h-full p-4 overflow-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Procurement Insights</h3>
              <p className="text-muted-foreground">
                Get AI-powered analytics and recommendations for your procurement strategy.
              </p>
              
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-medium">Market Trends</h4>
                  <p className="text-sm text-muted-foreground">
                    Analyze current market conditions and pricing trends for key categories.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    View Market Analysis
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-medium">Supplier Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Review supplier performance metrics and identify opportunities for improvement.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    View Supplier Dashboard
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-medium">Spending Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize your spending patterns and identify cost-saving opportunities.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    View Spending Breakdown
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Procurement Tab */}
          <TabsContent value="procurement" className="m-0 h-full p-4 overflow-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">RFQ Management</h3>
              <p className="text-muted-foreground">
                Create, optimize, and manage RFQs with AI assistance.
              </p>
              
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-medium">Draft an RFQ</h4>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered help to create a comprehensive RFQ that attracts the best suppliers.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Create New RFQ
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-medium">Optimize Existing RFQ</h4>
                  <p className="text-sm text-muted-foreground">
                    Improve an existing RFQ with AI suggestions for clarity, completeness, and effectiveness.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Select RFQ to Optimize
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-medium">Supplier Matching</h4>
                  <p className="text-sm text-muted-foreground">
                    Find the best suppliers for your RFQ based on capabilities, performance, and compatibility.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Match Suppliers
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Search Tab */}
          <TabsContent value="search" className="m-0 h-full p-4 overflow-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Procurement Knowledge Base</h3>
              <p className="text-muted-foreground">
                Search for procurement knowledge, templates, and best practices.
              </p>
              
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search procurement knowledge base..."
                  className="w-full pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">RFQ Templates</Button>
                  <Button variant="outline" size="sm">Supplier Evaluation</Button>
                  <Button variant="outline" size="sm">Negotiation Tactics</Button>
                  <Button variant="outline" size="sm">Cost Reduction</Button>
                  <Button variant="outline" size="sm">Contract Terms</Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h4 className="font-medium">Recent Articles</h4>
                  <ul className="space-y-2">
                    <li className="text-sm">
                      <a href="#" className="text-primary hover:underline">Best Practices for Global Sourcing</a>
                    </li>
                    <li className="text-sm">
                      <a href="#" className="text-primary hover:underline">How to Evaluate Supplier Sustainability</a>
                    </li>
                    <li className="text-sm">
                      <a href="#" className="text-primary hover:underline">Digital Transformation in Procurement</a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="m-0 h-full p-4 overflow-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Assistant Preferences</h3>
              <p className="text-muted-foreground">
                Customize how the procurement assistant works for you
              </p>
              
              <ProcurementChatPreferences 
                preferences={preferences}
                updateChatPreferences={updateChatPreferences}
                updateInterfacePreferences={updateInterfacePreferences}
                resetPreferences={resetPreferences}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};