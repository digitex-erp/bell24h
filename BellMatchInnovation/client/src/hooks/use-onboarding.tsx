import { useState, useCallback, useEffect } from 'react';

// Define types for onboarding steps
export type OnboardingStep = {
  id: string;
  targetSelector: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  characterMood?: 'happy' | 'excited' | 'thinking' | 'curious' | 'surprised';
  route?: string; // Optional route to navigate to for this step
  action?: () => void; // Optional action to perform
};

// Define types for onboarding flows
export type OnboardingFlow = {
  id: string;
  name: string;
  steps: OnboardingStep[];
  completed?: boolean;
  completionCallback?: () => void;
};

// Define onboarding state
interface OnboardingState {
  isActive: boolean;
  currentFlowId: string | null;
  currentStepIndex: number;
  completedFlows: string[];
}

// Predefined onboarding flows
const ONBOARDING_FLOWS: OnboardingFlow[] = [
  {
    id: 'main-onboarding',
    name: 'Getting Started',
    steps: [
      {
        id: 'welcome',
        targetSelector: 'body',
        title: 'Welcome to Bell24h!',
        description: 'This quick tour will help you get started with the platform and show you the key features. You can revisit this tutorial anytime from the Help menu.',
        position: 'center',
        characterMood: 'excited'
      },
      {
        id: 'supplier-matching',
        targetSelector: '.supplier-matching',
        title: 'AI-Powered Supplier Matching',
        description: 'Our advanced AI algorithms match your RFQs with the perfect suppliers based on your requirements, preferences, and past history.',
        position: 'bottom',
        characterMood: 'happy'
      },
      {
        id: 'procurement-assistant',
        targetSelector: '.procurement-chatbot',
        title: 'Your Personal Procurement Assistant',
        description: 'Ask anything about procurement, get RFQ suggestions, or get help with supplier selection using our AI-powered assistant.',
        position: 'right',
        characterMood: 'curious'
      },
      {
        id: 'video-rfq',
        targetSelector: '.video-rfq',
        title: 'Video RFQ Submissions',
        description: 'Create video-based RFQs for complex products and services where text descriptions aren\'t enough.',
        position: 'left',
        characterMood: 'thinking'
      },
      {
        id: 'blockchain-payments',
        targetSelector: '.blockchain-payments',
        title: 'Secure Blockchain Payments',
        description: 'Our platform uses blockchain technology to secure milestone-based payments and contracts between buyers and suppliers.',
        position: 'top',
        characterMood: 'surprised'
      }
    ]
  },
  {
    id: 'voice-rfq-tutorial',
    name: 'Voice RFQ Tutorial',
    steps: [
      {
        id: 'voice-rfq-intro',
        targetSelector: '.voice-rfq-button',
        title: 'Voice RFQ Creation',
        description: 'You can now create RFQs using voice commands! Let\'s learn how to use this feature.',
        position: 'bottom',
        characterMood: 'excited'
      },
      {
        id: 'voice-command-basics',
        targetSelector: '.voice-command-help',
        title: 'Basic Voice Commands',
        description: 'Start with "Create RFQ for..." followed by the product or service you need. Our AI will guide you through the rest of the process.',
        position: 'right',
        characterMood: 'thinking'
      },
      {
        id: 'voice-rfq-details',
        targetSelector: '.voice-rfq-details',
        title: 'Adding Details by Voice',
        description: 'Specify quantities, delivery dates, quality standards, and other requirements using natural language.',
        position: 'bottom',
        characterMood: 'happy'
      },
      {
        id: 'voice-language-support',
        targetSelector: '.language-selector',
        title: 'Multi-Language Support',
        description: 'Voice RFQs work in multiple languages! Select your preferred language from the dropdown menu.',
        position: 'left',
        characterMood: 'curious'
      }
    ]
  },
  {
    id: 'blockchain-tutorial',
    name: 'Blockchain Payment Tutorial',
    steps: [
      {
        id: 'blockchain-intro',
        targetSelector: '.blockchain-intro',
        title: 'Secure Milestone Payments',
        description: 'Learn how to set up and use blockchain-backed milestone payments for your contracts.',
        position: 'center',
        characterMood: 'excited'
      },
      {
        id: 'create-milestones',
        targetSelector: '.milestone-creator',
        title: 'Creating Payment Milestones',
        description: 'Define project milestones and associate payments with each completed phase.',
        position: 'bottom',
        characterMood: 'thinking'
      },
      {
        id: 'approve-milestones',
        targetSelector: '.milestone-approval',
        title: 'Approving Milestone Completion',
        description: 'Review and approve completed milestones to release payments to suppliers.',
        position: 'right',
        characterMood: 'happy'
      },
      {
        id: 'payment-history',
        targetSelector: '.payment-history',
        title: 'Payment History & Verification',
        description: 'Track all payments and their blockchain verification status from this screen.',
        position: 'top',
        characterMood: 'curious'
      }
    ]
  },
  {
    id: 'risk-scoring-tutorial',
    name: 'Supplier Risk Scoring Tutorial',
    steps: [
      {
        id: 'risk-scoring-intro',
        targetSelector: '.risk-scoring-intro',
        title: 'Aladin-Inspired Risk Scoring',
        description: 'Our unique risk scoring system helps you evaluate suppliers before making procurement decisions. Let\'s learn how it works!',
        position: 'center',
        characterMood: 'excited'
      },
      {
        id: 'risk-factors',
        targetSelector: '.risk-factors',
        title: 'Understanding Risk Factors',
        description: 'We analyze multiple factors including financial stability, delivery reliability, quality standards, compliance, and reputation to generate comprehensive risk profiles.',
        position: 'bottom',
        characterMood: 'thinking'
      },
      {
        id: 'risk-grades',
        targetSelector: '.risk-grades',
        title: 'Risk Grade Classification',
        description: 'Suppliers are assigned grades from A+ (lowest risk) to D (highest risk). Each grade comes with recommended precautions for your business relationship.',
        position: 'right',
        characterMood: 'curious'
      },
      {
        id: 'risk-filtering',
        targetSelector: '.risk-filtering',
        title: 'Filtering by Risk Level',
        description: 'Use these filters to set your risk tolerance and only see suppliers that meet your requirements.',
        position: 'bottom',
        characterMood: 'happy'
      },
      {
        id: 'risk-detail-view',
        targetSelector: '.risk-detail-view',
        title: 'Detailed Risk Analysis',
        description: 'Click on any supplier to see a detailed breakdown of their risk factors and get insights on how to mitigate potential issues.',
        position: 'left',
        characterMood: 'thinking'
      }
    ]
  },
  {
    id: 'market-insights-tutorial',
    name: 'Market Insights Tutorial',
    steps: [
      {
        id: 'market-insights-intro',
        targetSelector: '.market-insights',
        title: 'Real-Time Market Insights',
        description: 'Our platform provides you with up-to-date market trends and predictions to help you make informed procurement decisions.',
        position: 'center',
        characterMood: 'excited'
      },
      {
        id: 'price-forecast',
        targetSelector: '.price-forecast',
        title: 'Price Trend Forecasting',
        description: 'We use advanced predictive analytics to forecast price changes for key commodities and services in your industry.',
        position: 'bottom',
        characterMood: 'thinking'
      },
      {
        id: 'supply-chain-status',
        targetSelector: '.supply-chain-status',
        title: 'Supply Chain Status',
        description: 'Get real-time information about global supply chain conditions that might affect your procurement strategy.',
        position: 'right',
        characterMood: 'curious'
      },
      {
        id: 'market-events',
        targetSelector: '.market-events',
        title: 'Market Events',
        description: 'Stay informed about important events that could impact your industry, such as regulatory changes, shortages, or major business developments.',
        position: 'bottom',
        characterMood: 'surprised'
      },
      {
        id: 'export-insights',
        targetSelector: '.export-insights',
        title: 'Export & Share Insights',
        description: 'Export market data and insights to PDF or CSV formats for offline analysis or sharing with your team.',
        position: 'left',
        characterMood: 'happy'
      }
    ]
  },
  {
    id: 'analytics-dashboard-tutorial',
    name: 'Analytics Dashboard Tutorial',
    steps: [
      {
        id: 'analytics-intro',
        targetSelector: '.analytics-dashboard',
        title: 'Your Procurement Analytics',
        description: 'This dashboard gives you a comprehensive view of your procurement activities, performance metrics, and opportunities for optimization.',
        position: 'center',
        characterMood: 'excited'
      },
      {
        id: 'rfq-metrics',
        targetSelector: '.rfq-metrics',
        title: 'RFQ Performance Metrics',
        description: 'Track your RFQ success rates, response times, and competition levels to improve your procurement strategy.',
        position: 'top',
        characterMood: 'thinking'
      },
      {
        id: 'supplier-metrics',
        targetSelector: '.supplier-metrics',
        title: 'Supplier Performance',
        description: 'Monitor key performance indicators for your suppliers including delivery times, quality compliance, and price competitiveness.',
        position: 'right',
        characterMood: 'curious'
      },
      {
        id: 'cost-savings',
        targetSelector: '.cost-savings',
        title: 'Cost Savings Analysis',
        description: 'See how much you\'ve saved through our platform, with detailed breakdowns by category and supplier.',
        position: 'bottom',
        characterMood: 'happy'
      },
      {
        id: 'custom-reports',
        targetSelector: '.custom-reports',
        title: 'Custom Report Generation',
        description: 'Create and schedule customized reports for different stakeholders in your organization.',
        position: 'left',
        characterMood: 'thinking'
      }
    ]
  },
  {
    id: 'ai-assistant-tutorial',
    name: 'AI Assistant Tutorial',
    steps: [
      {
        id: 'ai-assistant-intro',
        targetSelector: '.ai-assistant',
        title: 'Your AI Procurement Assistant',
        description: 'Meet your AI-powered procurement assistant that helps you make better decisions and streamlines your workflow.',
        position: 'center',
        characterMood: 'excited'
      },
      {
        id: 'assistant-queries',
        targetSelector: '.assistant-query-box',
        title: 'Ask Anything',
        description: 'Ask questions about procurement, suppliers, market conditions, or specific products in natural language.',
        position: 'bottom',
        characterMood: 'happy'
      },
      {
        id: 'assistant-tools',
        targetSelector: '.assistant-tools',
        title: 'Specialized Tools',
        description: 'Your assistant has access to specialized tools for tasks like RFQ generation, supplier comparison, and contract analysis.',
        position: 'right',
        characterMood: 'thinking'
      },
      {
        id: 'context-awareness',
        targetSelector: '.assistant-context',
        title: 'Context-Aware Assistance',
        description: 'The assistant remembers your preferences and previous interactions to provide personalized recommendations.',
        position: 'left',
        characterMood: 'curious'
      },
      {
        id: 'assistant-insights',
        targetSelector: '.assistant-insights',
        title: 'Proactive Insights',
        description: 'Your assistant proactively suggests opportunities for cost savings, supplier diversification, and process improvements.',
        position: 'top',
        characterMood: 'surprised'
      }
    ]
  }
];

// Use local storage key for onboarding state
const STORAGE_KEY = 'bell24h_onboarding_state';

export function useOnboarding() {
  // Initialize state from local storage or default values
  const [state, setState] = useState<OnboardingState>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState
      ? JSON.parse(savedState)
      : {
          isActive: false,
          currentFlowId: null,
          currentStepIndex: 0,
          completedFlows: []
        };
  });
  
  // Get current flow and step
  const currentFlow = state.currentFlowId
    ? ONBOARDING_FLOWS.find(flow => flow.id === state.currentFlowId) || null
    : null;
    
  const currentStep = currentFlow?.steps[state.currentStepIndex] || null;
  
  // Save state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  
  // Get list of available flows with completion status
  const availableFlows = ONBOARDING_FLOWS.map(flow => ({
    ...flow,
    completed: state.completedFlows.includes(flow.id)
  }));
  
  // Start a specific onboarding flow
  const startFlow = useCallback((flowId: string) => {
    // Find the requested flow
    const flow = ONBOARDING_FLOWS.find(f => f.id === flowId);
    if (!flow) return;
    
    // Check if the flow has a first step with a route
    const firstStep = flow.steps[0];
    if (firstStep.route) {
      // TODO: Navigate to the route using the router
      // navigate(firstStep.route);
    }
    
    // If the first step has an action, execute it
    if (firstStep.action) {
      firstStep.action();
    }
    
    // Update state to start the flow
    setState({
      isActive: true,
      currentFlowId: flowId,
      currentStepIndex: 0,
      completedFlows: state.completedFlows
    });
  }, [state.completedFlows]);
  
  // Move to the next step in the current flow
  const nextStep = useCallback(() => {
    if (!currentFlow) return;
    
    const nextIndex = state.currentStepIndex + 1;
    
    // If we're at the last step, finish the flow
    if (nextIndex >= currentFlow.steps.length) {
      // Call the completion callback if provided
      if (currentFlow.completionCallback) {
        currentFlow.completionCallback();
      }
      
      // Mark the flow as completed if it's not already
      const updatedCompletedFlows = state.completedFlows.includes(currentFlow.id)
        ? state.completedFlows
        : [...state.completedFlows, currentFlow.id];
      
      // Close the onboarding
      setState({
        isActive: false,
        currentFlowId: null,
        currentStepIndex: 0,
        completedFlows: updatedCompletedFlows
      });
      
      return;
    }
    
    // Otherwise, move to the next step
    const nextStep = currentFlow.steps[nextIndex];
    
    // If the next step has a route, navigate to it
    if (nextStep.route) {
      // TODO: Navigate to the route using the router
      // navigate(nextStep.route);
    }
    
    // If the next step has an action, execute it
    if (nextStep.action) {
      nextStep.action();
    }
    
    // Update state to show the next step
    setState({
      ...state,
      currentStepIndex: nextIndex
    });
  }, [currentFlow, state]);
  
  // Move to the previous step in the current flow
  const prevStep = useCallback(() => {
    if (!currentFlow) return;
    
    const prevIndex = Math.max(0, state.currentStepIndex - 1);
    
    // If we're already at the first step, do nothing
    if (prevIndex === state.currentStepIndex) return;
    
    // Otherwise, move to the previous step
    const prevStep = currentFlow.steps[prevIndex];
    
    // If the previous step has a route, navigate to it
    if (prevStep.route) {
      // TODO: Navigate to the route using the router
      // navigate(prevStep.route);
    }
    
    // If the previous step has an action, execute it
    if (prevStep.action) {
      prevStep.action();
    }
    
    // Update state to show the previous step
    setState({
      ...state,
      currentStepIndex: prevIndex
    });
  }, [currentFlow, state]);
  
  // Skip the current flow
  const skipFlow = useCallback(() => {
    setState({
      isActive: false,
      currentFlowId: null,
      currentStepIndex: 0,
      completedFlows: state.completedFlows
    });
  }, [state.completedFlows]);
  
  // Check if a specific flow is completed
  const isFlowCompleted = useCallback((flowId: string) => {
    return state.completedFlows.includes(flowId);
  }, [state.completedFlows]);
  
  // Reset all onboarding progress
  const resetOnboarding = useCallback(() => {
    setState({
      isActive: false,
      currentFlowId: null,
      currentStepIndex: 0,
      completedFlows: []
    });
  }, []);
  
  return {
    isActive: state.isActive,
    currentFlow,
    currentStep,
    availableFlows,
    startFlow,
    nextStep,
    prevStep,
    skipFlow,
    isFlowCompleted,
    resetOnboarding
  };
}