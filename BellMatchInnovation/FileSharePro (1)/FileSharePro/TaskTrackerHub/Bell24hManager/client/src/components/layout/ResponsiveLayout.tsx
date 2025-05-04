
import React from 'react';
import { useMobile } from '../../hooks/use-mobile';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const isMobile = useMobile();

  return (
    <div className={`
      w-full min-h-screen
      ${isMobile ? 'px-4 py-2' : 'px-8 py-4'}
      transition-all duration-200
    `}>
      {children}
    </div>
  );
};
