
import React from 'react';
import { useMobile } from '../../hooks/use-mobile';

interface TouchFriendlyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({ 
  label, 
  className = '',
  ...props 
}) => {
  const isMobile = useMobile();
  
  return (
    <button
      {...props}
      className={`
        rounded-lg
        ${isMobile ? 'p-4 text-lg min-h-[48px]' : 'p-2 text-base'}
        ${className}
      `}
    >
      {label}
    </button>
  );
};
