import { createContext, useContext, useState } from 'react';

// Define onboarding steps based on user role
export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
};

// Define onboarding state
export interface OnboardingState {
  steps: OnboardingStep[];
  currentStepIndex: number;
  completed: boolean;
}

// Define buyer onboarding steps
export const buyerOnboardingSteps: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your company details, logo, and business information',
    completed: false,
    required: true,
  },
  {
    id: 'first-rfq',
    title: 'Create Your First RFQ',
    description: 'Submit a Request for Quotation to find the best suppliers',
    completed: false,
    required: true,
  },
  {
    id: 'video-rfq',
    title: 'Try Video RFQ',
    description: 'Enhance your RFQ with video to better explain your requirements',
    completed: false,
    required: false,
  },
];

// Define supplier onboarding steps
export const supplierOnboardingSteps: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your company details, logo, and business information',
    completed: false,
    required: true,
  },
  {
    id: 'first-product',
    title: 'Add Your First Product',
    description: 'Showcase your products to buyers',
    completed: false,
    required: true,
  },
  {
    id: 'showcase-video',
    title: 'Upload a Product Video',
    description: 'Enhance your product with a showcase video',
    completed: false,
    required: false,
  },
];

interface OnboardingContextType {
  state: OnboardingState;
  completeStep: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
  isStepCompleted: (stepId: string) => boolean;
  isOnboardingComplete: () => boolean;
  currentStep: OnboardingStep | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ role: 'buyer' | 'supplier'; children: React.ReactNode }> = ({ role, children }) => {
  const initialSteps = role === 'buyer' ? buyerOnboardingSteps : supplierOnboardingSteps;
  const [state, setState] = useState<OnboardingState>({
    steps: initialSteps,
    currentStepIndex: 0,
    completed: false,
  });

  // Mark a step as completed
  const completeStep = (stepId: string) => {
    setState(prev => {
      const steps = prev.steps.map(step => step.id === stepId ? { ...step, completed: true } : step);
      const completed = steps.every(step => step.completed || !step.required);
      return {
        ...prev,
        steps,
        completed,
      };
    });
  };

  // Skip a step
  const skipStep = (stepId: string) => {
    setState(prev => {
      const steps = prev.steps.map(step => step.id === stepId ? { ...step, completed: true } : step);
      const completed = steps.every(step => step.completed || !step.required);
      return {
        ...prev,
        steps,
        completed,
      };
    });
  };

  // Go to next step
  const nextStep = () => {
    setState(prev => {
      const nextIndex = Math.min(prev.currentStepIndex + 1, prev.steps.length - 1);
      return {
        ...prev,
        currentStepIndex: nextIndex,
      };
    });
  };

  // Go to previous step
  const prevStep = () => {
    setState(prev => {
      const prevIndex = Math.max(prev.currentStepIndex - 1, 0);
      return {
        ...prev,
        currentStepIndex: prevIndex,
      };
    });
  };

  const resetOnboarding = () => {
    setState({
      steps: initialSteps,
      currentStepIndex: 0,
      completed: false,
    });
  };

  // Check if a step is completed
  const isStepCompleted = (stepId: string) => {
    return state.steps.find((step) => step.id === stepId)?.completed || false;
  };

  // Check if onboarding is complete
  const isOnboardingComplete = () => {
    return state.completed;
  };

  // Get current step
  const currentStep = state.steps[state.currentStepIndex] || null;

  return (
    <OnboardingContext.Provider
      value={{
        state,
        completeStep,
        skipStep,
        nextStep,
        prevStep,
        resetOnboarding,
        isStepCompleted,
        isOnboardingComplete,
        currentStep
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

// Create hook for using onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
