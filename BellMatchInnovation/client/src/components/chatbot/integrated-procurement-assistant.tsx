import { useState, useEffect, useCallback } from 'react';
import { ContextualChatInterface } from './contextual-chat-interface';
import { RFQ, Supplier, useContextualProcurement } from '@/hooks/use-contextual-procurement';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  X, 
  Maximize2, 
  Minimize2, 
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader
} from '@/components/ui/card';
import { useMediaQuery } from '@/hooks/use-mobile';

// Context type definition for the chat interface
interface ContextData {
  currentRfq: RFQ | null;
  currentSupplier: Supplier | null;
}

type AssistantPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type AssistantSize = 'small' | 'medium' | 'large';

interface IntegratedProcurementAssistantProps {
  userId?: number | null;
  position?: AssistantPosition;
  size?: AssistantSize;
  initiallyOpen?: boolean;
  title?: string;
  showCloseButton?: boolean;
}

export const IntegratedProcurementAssistant: React.FC<IntegratedProcurementAssistantProps> = ({
  userId = null,
  position = 'bottom-right',
  size = 'medium',
  initiallyOpen = false,
  title = 'Procurement Assistant',
  showCloseButton = true
}) => {
  // Context hooks for recommendations and preferences
  const { 
    pageContext, 
    hasSuggestions,
    newSuggestionCount
  } = useContextualProcurement();
  
  const { 
    preferences, 
    updatePreference 
  } = useUserPreferences();
  
  // State
  const [isOpen, setIsOpen] = useState(preferences?.assistantOpen || initiallyOpen);
  const [isExpanded, setIsExpanded] = useState(preferences?.assistantExpanded || false);
  const [userPosition, setUserPosition] = useState<AssistantPosition>(
    preferences?.assistantPosition || position
  );
  const [animateIn, setAnimateIn] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Ensure assistant starts closed on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setIsExpanded(false);
    }
  }, [isMobile]);
  
  // Save user preferences when changed
  useEffect(() => {
    if (!isMobile) {
      updatePreference('assistantOpen', isOpen);
      updatePreference('assistantExpanded', isExpanded);
      updatePreference('assistantPosition', userPosition);
    }
  }, [isOpen, isExpanded, userPosition, updatePreference, isMobile]);
  
  // Animation effect for smooth transitions
  useEffect(() => {
    if (isOpen) {
      // Slight delay to ensure CSS transition works
      setTimeout(() => setAnimateIn(true), 50);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);
  
  // Handle opening and closing
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
    
    // Clear new suggestion count when opening
    if (!isOpen && newSuggestionCount > 0) {
      // This would typically call a method from the context to reset the count
      // For now we'll assume this is handled in the context provider
    }
  }, [isOpen, newSuggestionCount]);
  
  // Handle expanding and collapsing
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // Change assistant position
  const changePosition = useCallback((newPosition: AssistantPosition) => {
    setUserPosition(newPosition);
  }, []);
  
  // Get position classes
  const getPositionClasses = (): string => {
    switch (userPosition) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };
  
  // Get size classes
  const getSizeClasses = (): { width: string, height: string } => {
    if (isExpanded) {
      return {
        width: isMobile ? 'w-[95vw]' : 'w-[600px]',
        height: isMobile ? 'h-[80vh]' : 'h-[80vh]'
      };
    }
    
    switch (size) {
      case 'small':
        return {
          width: isMobile ? 'w-[90vw]' : 'w-[300px]',
          height: 'h-[400px]'
        };
      case 'medium':
        return {
          width: isMobile ? 'w-[90vw]' : 'w-[350px]',
          height: 'h-[500px]'
        };
      case 'large':
        return {
          width: isMobile ? 'w-[90vw]' : 'w-[400px]',
          height: 'h-[600px]'
        };
      default:
        return {
          width: isMobile ? 'w-[90vw]' : 'w-[350px]',
          height: 'h-[500px]'
        };
    }
  };
  
  // Get the chat interface max height
  const getChatMaxHeight = (): string => {
    if (isExpanded) {
      return 'calc(80vh - 60px)';
    }
    
    switch (size) {
      case 'small':
        return '340px';
      case 'medium':
        return '440px';
      case 'large':
        return '540px';
      default:
        return '440px';
    }
  };
  
  // Get z-index based on open state
  const getZIndex = (): string => {
    return isOpen ? 'z-50' : 'z-40';
  };
  
  // Render the position selector
  const renderPositionSelector = () => {
    return (
      <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => changePosition('top-left')}
          aria-label="Move to top left"
        >
          <div className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600 flex items-start justify-start">
            <div className="h-2 w-2 rounded-full bg-primary m-1"></div>
          </div>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => changePosition('top-right')}
          aria-label="Move to top right"
        >
          <div className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600 flex items-start justify-end">
            <div className="h-2 w-2 rounded-full bg-primary m-1"></div>
          </div>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => changePosition('bottom-left')}
          aria-label="Move to bottom left"
        >
          <div className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600 flex items-end justify-start">
            <div className="h-2 w-2 rounded-full bg-primary m-1"></div>
          </div>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => changePosition('bottom-right')}
          aria-label="Move to bottom right"
        >
          <div className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600 flex items-end justify-end">
            <div className="h-2 w-2 rounded-full bg-primary m-1"></div>
          </div>
        </Button>
      </div>
    );
  };
  
  // Render the assistant button when closed
  const renderAssistantButton = () => {
    return (
      <Button
        className={`rounded-full h-14 w-14 ${isOpen ? 'hidden' : 'flex'} shadow-lg`}
        onClick={toggleOpen}
        aria-label="Open procurement assistant"
      >
        {newSuggestionCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full"
            variant="destructive"
          >
            {newSuggestionCount}
          </Badge>
        )}
        {hasSuggestions ? (
          <Sparkles className="h-6 w-6 text-amber-500" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>
    );
  };
  
  // Create context data from page context
  const createContextData = (): ContextData => {
    // Extract RFQ and supplier data from page context if available
    // This is a simplified adapter - in a real implementation, this would map data from the pageContext
    // based on the current route and parameters
    
    // Default empty context
    const contextData: ContextData = {
      currentRfq: null,
      currentSupplier: null
    };
    
    // For RFQ pages
    if (pageContext?.page === 'rfq' && pageContext?.params?.id) {
      // This would typically be a data lookup from an API or context store
      // For now, we're creating a mock RFQ based on the page context
      contextData.currentRfq = {
        id: parseInt(pageContext.params.id) || 0,
        title: pageContext.title || 'Untitled RFQ',
        description: 'RFQ details would be populated here based on the context',
        category: pageContext.params.category || 'General',
        requirements: pageContext.keywords || [],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        budget: '$5,000 - $10,000',
        quantity: 100
      };
    }
    
    // For supplier pages
    if (pageContext?.page === 'supplier' && pageContext?.params?.id) {
      // This would typically be a data lookup from an API or context store
      // For now, we're creating a mock supplier based on the page context
      contextData.currentSupplier = {
        id: parseInt(pageContext.params.id) || 0,
        name: pageContext.title || 'Unnamed Supplier',
        industry: pageContext.params.industry || 'Manufacturing',
        products: pageContext.keywords || [],
        rating: 4.5,
        region: pageContext.params.region || 'Global',
        yearsOfPartnership: 3
      };
    }
    
    return contextData;
  };

  // Render the assistant when open
  const renderAssistant = () => {
    const { width, height } = getSizeClasses();
    const scaleClass = animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0';
    const contextData = createContextData();
    
    return (
      <Card 
        className={`${width} ${height} flex flex-col overflow-hidden shadow-xl ${isOpen ? 'flex' : 'hidden'} 
          ${scaleClass} transition-all duration-200 origin-bottom-right`}
      >
        <CardHeader className="p-3 flex flex-row items-center space-y-0 gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold leading-none tracking-tight flex-1">{title}</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={toggleExpanded}
              aria-label={isExpanded ? 'Minimize' : 'Maximize'}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleOpen}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ContextualChatInterface 
            userId={userId} 
            maxHeight={getChatMaxHeight()}
            showToolbar={true}
            currentContext={contextData}
          />
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div 
      className={`fixed ${getPositionClasses()} ${getZIndex()} transition-all duration-300`}
      onDoubleClick={() => setIsExpanded(!isExpanded)}
    >
      {renderAssistantButton()}
      {renderAssistant()}
      {isOpen && !isMobile && renderPositionSelector()}
    </div>
  );
};