'use client';

import React from 'react';

interface MaterialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  href?: string;
  children: React.ReactNode;
}

export const MaterialButton = React.forwardRef<
  HTMLButtonElement,
  MaterialButtonProps
>(({ variant = 'filled', href, children, className, ...props }, ref) => {
  const baseStyles =
    'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = {
    filled:
      'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    outlined:
      'text-indigo-600 border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    text: 'text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    elevated: 
      'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-md',
    tonal: 
      'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className || ''}`.trim();

  if (href) {
    return (
      <a href={href} className={combinedClassName} ref={ref as any} {...(props as any)}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={combinedClassName} ref={ref} {...props}>
      {children}
    </button>
  );
});

MaterialButton.displayName = 'MaterialButton';
