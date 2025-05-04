import { useEffect, useState } from 'react';
import { useOnboardingContext } from '@/components/onboarding';
import { alertService } from '@/services/AlertService';

/**
 * This hook connects the onboarding system with our notification system
 * to provide contextual notifications during guided tours
 */
export const useOnboardingNotifications = () => {
  const { isActive, currentFlow, currentStep } = useOnboardingContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepsCount, setStepsCount] = useState(0);
  
  // Calculate step index and count whenever the flow or step changes
  useEffect(() => {
    if (!currentFlow || !currentStep) {
      setCurrentStepIndex(0);
      setStepsCount(0);
      return;
    }
    
    setStepsCount(currentFlow.steps.length);
    const index = currentFlow.steps.findIndex(step => step.id === currentStep.id);
    setCurrentStepIndex(index !== -1 ? index : 0);
  }, [currentFlow, currentStep]);
  
  // Send notifications based on onboarding progress
  useEffect(() => {
    if (!isActive || !currentFlow) return;
    
    // First step of any flow - welcome message
    if (currentStepIndex === 0) {
      const flowMessages: Record<string, {title: string, message: string}> = {
        'main-onboarding': {
          title: '👋 Welcome to Bell24h Tour',
          message: 'Let\'s explore the main features of the platform together.'
        },
        'voice-rfq-tutorial': {
          title: '🎙️ Voice RFQ Guide Starting',
          message: 'Learn how to create RFQs using our voice recognition feature.'
        },
        'blockchain-tutorial': {
          title: '🔒 Blockchain Payments Tour',
          message: 'Discover how to use secure blockchain transactions for milestone payments.'
        },
        'risk-scoring-tutorial': {
          title: '📊 Risk Scoring Guide',
          message: 'Learn how our Aladin-inspired risk scoring helps evaluate suppliers.'
        },
        'market-insights-tutorial': {
          title: '📈 Market Insights Tour',
          message: 'Explore real-time market trends and forecasts for procurement.'
        },
        'ai-assistant-tutorial': {
          title: '🤖 AI Assistant Guide',
          message: 'See how our AI procurement assistant can help optimize your sourcing process.'
        },
        'analytics-dashboard-tutorial': {
          title: '📊 Analytics Dashboard Tour',
          message: 'Learn how to use data visualization to make informed decisions.'
        }
      };
      
      const defaultMessage = {
        title: 'Guide Started',
        message: `Starting tutorial (${currentStepIndex + 1}/${stepsCount})`
      };
      
      const notification = currentFlow.id in flowMessages 
        ? flowMessages[currentFlow.id] 
        : defaultMessage;
      
      // Show welcome notification
      alertService.info(notification.message, { 
        title: notification.title, 
        priority: 'medium'
      });
    }
    
    // Last step of any flow - completion message
    if (currentStepIndex === stepsCount - 1) {
      setTimeout(() => {
        alertService.success('Guided tour completed successfully! You can restart it anytime from the help menu.', {
          title: '🎉 Tour Completed',
          priority: 'medium'
        });
      }, 1000); // Delay to avoid showing at the same time as the step notification
    }
    
    // Custom notifications for specific steps
    if (currentFlow.id === 'main-onboarding') {
      if (currentStepIndex === 2) {
        alertService.info('Click on the cards to explore different features.', {
          title: 'Navigation Tip',
          priority: 'low'
        });
      }
    }
    
    if (currentFlow.id === 'blockchain-tutorial') {
      if (currentStepIndex === 3) {
        alertService.warning('Ensure contract details are accurate before creating a transaction.', {
          title: 'Security Note',
          priority: 'medium'
        });
      }
    }
    
    if (currentFlow.id === 'risk-scoring-tutorial') {
      if (currentStepIndex === 2) {
        alertService.info('Risk scores are calculated using AI and historical performance data.', {
          title: 'Risk Analysis',
          priority: 'low'
        });
      }
    }
    
  }, [currentFlow, currentStepIndex, stepsCount, isActive]);
  
  return null;
};

export default useOnboardingNotifications;