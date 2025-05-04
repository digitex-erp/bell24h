import React from 'react';
import { useOnboardingNotifications } from '@/hooks/use-onboarding-notifications';

/**
 * This component uses the onboarding notifications hook to provide
 * contextual notifications during guided tours. It doesn't render
 * anything visible.
 */
export const OnboardingNotificationsProvider: React.FC = () => {
  // This hook handles showing notifications based on onboarding state
  useOnboardingNotifications();
  
  // This component doesn't render anything
  return null;
};

export default OnboardingNotificationsProvider;