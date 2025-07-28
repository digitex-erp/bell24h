import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  ArrowRight,
  UserCircle,
  FileText,
  Video,
  Shield,
  BarChart2,
  Package
} from 'lucide-react';
import { OnboardingProvider, useOnboarding } from '../services/onboardingService.tsx';
import { useAuth } from '../services/authService';

// Step components
import ProfileSetup from '../components/onboarding/ProfileSetup';
import RfqCreation from '../components/onboarding/RfqCreation';
import VideoRfq from '../components/onboarding/VideoRfq';
import BlockchainVerification from '../components/onboarding/BlockchainVerification';
import AnalyticsDashboard from '../components/onboarding/AnalyticsDashboard';
import ProductShowcase from '../components/onboarding/ProductShowcase';
import VideoShowcase from '../components/onboarding/VideoShowcase';
import BidSettings from '../components/onboarding/BidSettings';

// Import styles
import '../styles/onboarding.css';

const OnboardingContent: React.FC = () => {
  const { 
    state, 
    completeStep, 
    skipStep, 
    nextStep, 
    prevStep, 
    isStepCompleted, 
    isOnboardingComplete,
    currentStep 
  } = useOnboarding();
  const [, setLocation] = useLocation();
  const [stepData, setStepData] = useState<any>({});

  // Handle step completion
  const handleCompleteStep = () => {
    if (currentStep) {
      completeStep(currentStep.id);
      nextStep();
    }
  };

  // Handle step skip
  const handleSkipStep = () => {
    if (currentStep && !currentStep.required) {
      skipStep(currentStep.id);
    }
  };

  // Handle finish onboarding
  const handleFinishOnboarding = () => {
    // Redirect to appropriate dashboard based on user role
    setLocation('/dashboard');
  };

  // Handle step data change
  const handleStepDataChange = (data: any) => {
    setStepData((prevData: any) => ({
      ...prevData,
      [currentStep?.id || '']: data
    }));
  };

  // Get step component based on step ID
  const getStepComponent = () => {
    if (!currentStep) return null;

    const commonProps = {
      onComplete: handleCompleteStep,
      onSkip: handleSkipStep,
      data: stepData[currentStep.id] || {},
      onDataChange: handleStepDataChange
    };

    switch (currentStep.id) {
      case 'profile':
        return <ProfileSetup {...commonProps} />;
      case 'first-rfq':
        return <RfqCreation {...commonProps} />;
      case 'video-rfq':
        return <VideoRfq {...commonProps} />;
      case 'blockchain-verification':
        return <BlockchainVerification {...commonProps} />;
      case 'analytics-dashboard':
        return <AnalyticsDashboard {...commonProps} />;
      case 'product-showcase':
        return <ProductShowcase {...commonProps} />;
      case 'video-showcase':
        return <VideoShowcase {...commonProps} />;
      case 'bid-settings':
        return <BidSettings {...commonProps} />;
      default:
        return <div>Step not found</div>;
    }
  };

  // Get step icon based on step ID
  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'profile':
        return <UserCircle size={24} />;
      case 'first-rfq':
        return <FileText size={24} />;
      case 'video-rfq':
        return <Video size={24} />;
      case 'blockchain-verification':
        return <Shield size={24} />;
      case 'analytics-dashboard':
        return <BarChart2 size={24} />;
      case 'product-showcase':
        return <Package size={24} />;
      case 'video-showcase':
        return <Video size={24} />;
      case 'bid-settings':
        return <FileText size={24} />;
      default:
        return <ChevronRight size={24} />;
    }
  };

  // Check if we're on the last step
  const isLastStep = state.currentStepIndex === state.steps.length - 1;

  // Check if all required steps are completed
  const allRequiredCompleted = state.steps
    .filter(step => step.required)
    .every(step => step.completed);

  return (
    <div className="onboarding-container">
      <div className="onboarding-sidebar">
        <div className="onboarding-logo">
          <img src="/logo.svg" alt="BELL24H Logo" className="logo" />
          <h2 className="logo-text">BELL24H</h2>
        </div>
        
        <div className="onboarding-steps">
          {state.steps.map((step, index) => (
            <div 
              key={step.id}
              className={`onboarding-step-item ${
                index === state.currentStepIndex ? 'active' : ''
              } ${step.completed ? 'completed' : ''}`}
            >
              <div className="step-icon">
                {step.completed ? (
                  <Check size={20} />
                ) : (
                  getStepIcon(step.id)
                )}
              </div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${
                  (state.steps.filter(step => step.completed).length / 
                  state.steps.length) * 100
                }%` 
              }}
            ></div>
          </div>
          <span className="progress-text">
            {state.steps.filter(step => step.completed).length} of {state.steps.length} completed
          </span>
        </div>
      </div>
      
      <div className="onboarding-content">
        <div className="onboarding-step-content">
          {getStepComponent()}
        </div>
        
        <div className="onboarding-actions">
          {state.currentStepIndex > 0 && (
            <button 
              className="onboarding-button secondary" 
              onClick={prevStep}
            >
              <ChevronLeft size={20} />
              Back
            </button>
          )}
          
          <div className="onboarding-right-actions">
            {!currentStep?.required && (
              <button 
                className="onboarding-button text" 
                onClick={handleSkipStep}
              >
                Skip for now
              </button>
            )}
            
            {isLastStep && allRequiredCompleted ? (
              <button 
                className="onboarding-button primary" 
                onClick={handleFinishOnboarding}
              >
                Finish Setup
                <ArrowRight size={20} />
              </button>
            ) : (
              <button 
                className="onboarding-button primary" 
                onClick={handleCompleteStep}
                disabled={!currentStep}
              >
                {currentStep?.required ? 'Complete' : 'Continue'}
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect if no user
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);
  
  if (!user) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return (
    <OnboardingProvider userRole={user.role}>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default OnboardingPage;
