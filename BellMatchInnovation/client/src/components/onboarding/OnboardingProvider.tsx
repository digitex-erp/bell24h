import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import OnboardingGuide from './OnboardingGuide';
import { Button } from '@/components/ui/button';
import { 
  LampWallUp, 
  Book, 
  BookOpen, 
  RefreshCw, 
  CheckCircle2,
  BarChart4, 
  ShieldAlert, 
  Mic, 
  Brain, 
  TrendingUp
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Create context for onboarding
const OnboardingContext = createContext<ReturnType<typeof useOnboarding> | null>(null);

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const onboardingData = useOnboarding();
  
  return (
    <OnboardingContext.Provider value={onboardingData}>
      {children}
      <OnboardingGuide />
    </OnboardingContext.Provider>
  );
};

// OnboardingTrigger component - use this to add data-onboarding attributes to elements
interface OnboardingTriggerProps {
  id: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const OnboardingTrigger: React.FC<OnboardingTriggerProps> = ({
  id,
  children,
  className,
  style
}) => {
  return (
    <div data-onboarding={id} className={className} style={style}>
      {children}
    </div>
  );
};

// Get icon for flow based on flow ID
const getFlowIcon = (flowId: string) => {
  switch (flowId) {
    case 'main-onboarding':
      return <BookOpen className="h-4 w-4 text-primary" />;
    case 'voice-rfq-tutorial':
      return <Mic className="h-4 w-4 text-indigo-500" />;
    case 'blockchain-tutorial':
      return <ShieldAlert className="h-4 w-4 text-blue-500" />;
    case 'risk-scoring-tutorial':
      return <BarChart4 className="h-4 w-4 text-orange-500" />;
    case 'market-insights-tutorial':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'analytics-dashboard-tutorial':
      return <BarChart4 className="h-4 w-4 text-violet-500" />;
    case 'ai-assistant-tutorial':
      return <Brain className="h-4 w-4 text-rose-500" />;
    default:
      return <Book className="h-4 w-4 text-primary" />;
  }
};

// OnboardingMenu component - shows available tours
interface OnboardingMenuProps {
  title?: string;
  className?: string;
  compact?: boolean;
}

export const OnboardingMenu: React.FC<OnboardingMenuProps> = ({
  title = 'Guided Tours',
  className,
  compact = false
}) => {
  const { availableFlows, startFlow, resetOnboarding } = useOnboardingContext();
  const [isOpen, setIsOpen] = useState(false);
  
  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <LampWallUp className="h-4 w-4 mr-2" />
            {title}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Select a guided tour to learn about the platform's features
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {availableFlows.map((flow) => (
              <div key={flow.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFlowIcon(flow.id)}
                  <span>{flow.name}</span>
                  {flow.completed && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    startFlow(flow.id);
                    setIsOpen(false);
                  }}
                >
                  {flow.completed ? 'Replay' : 'Start'}
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetOnboarding}
              className="text-xs text-muted-foreground"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset all tutorials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-3">
        {availableFlows.map((flow) => (
          <div key={flow.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFlowIcon(flow.id)}
              <span>{flow.name}</span>
              {flow.completed && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3 inline-block mr-1" />
                  Completed
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => startFlow(flow.id)}
            >
              {flow.completed ? 'Replay' : 'Start'}
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetOnboarding}
          className="text-xs text-muted-foreground"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reset all tutorials
        </Button>
      </div>
    </div>
  );
};

// OnboardingButton component - a simple button to trigger a specific flow
interface OnboardingButtonProps {
  flowId: string;
  children?: ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  withTooltip?: boolean;
  tooltipText?: string;
}

export const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  flowId,
  children = 'Start Tour',
  variant = 'outline',
  size = 'sm',
  className,
  withTooltip = false,
  tooltipText = 'Start a guided tour'
}) => {
  const { startFlow } = useOnboardingContext();
  
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={() => startFlow(flowId)}
      className={className}
    >
      <LampWallUp className="h-4 w-4 mr-1" />
      {children}
    </Button>
  );
  
  if (withTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return button;
};