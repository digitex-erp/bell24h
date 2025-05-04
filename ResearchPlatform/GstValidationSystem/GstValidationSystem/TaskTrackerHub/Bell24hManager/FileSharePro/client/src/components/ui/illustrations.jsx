import React from 'react';
import { motion } from 'framer-motion';

// Empty inbox illustration
export function EmptyInboxIllustration({ className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`w-12 h-12 ${className}`}
    >
      <motion.path 
        d="M22 12h-6l-2 3h-4l-2-3H2" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.path 
        d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
      />
    </svg>
  );
}

// Empty search results illustration
export function EmptySearchIllustration({ className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`w-12 h-12 ${className}`}
    >
      <motion.circle 
        cx="11" 
        cy="11" 
        r="8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.line 
        x1="21" 
        y1="21" 
        x2="16.65" 
        y2="16.65"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 1 }}
      />
      <motion.line 
        x1="11" 
        y1="8" 
        x2="11" 
        y2="14"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.line 
        x1="8" 
        y1="11" 
        x2="14" 
        y2="11"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", delay: 1.5 }}
      />
    </svg>
  );
}

// Empty notifications illustration
export function EmptyNotificationIllustration({ className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`w-12 h-12 ${className}`}
    >
      <motion.path 
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.path 
        d="M13.73 21a2 2 0 0 1-3.46 0" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 1 }}
      />
      <motion.path
        d="M10 3V2M14 3V2M9 10h6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 1.5 }}
      />
    </svg>
  );
}

// Empty suppliers illustration
export function EmptySupplierIllustration({ className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`w-12 h-12 ${className}`}
    >
      <motion.path 
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.polyline 
        points="9 22 9 12 15 12 15 22" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut", delay: 0.8 }}
      />
      <motion.line
        x1="3" 
        y1="10" 
        x2="21" 
        y2="10"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 1.5 }}
      />
    </svg>
  );
}

// Empty quotes illustration
export function EmptyQuoteIllustration({ className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`w-12 h-12 ${className}`}
    >
      <motion.rect 
        x="3" 
        y="3" 
        width="18" 
        height="18" 
        rx="2" 
        ry="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.line 
        x1="9" 
        y1="9" 
        x2="15" 
        y2="9"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", delay: 1 }}
      />
      <motion.line 
        x1="9" 
        y1="12" 
        x2="15" 
        y2="12"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", delay: 1.2 }}
      />
      <motion.line 
        x1="9" 
        y1="15" 
        x2="15" 
        y2="15"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", delay: 1.4 }}
      />
    </svg>
  );
}

// Error illustration
export function ErrorIllustration({ className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`w-12 h-12 ${className}`}
    >
      <motion.circle 
        cx="12" 
        cy="12" 
        r="10"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.line 
        x1="12" 
        y1="8" 
        x2="12" 
        y2="12"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 1 }}
      />
      <motion.line 
        x1="12" 
        y1="16" 
        x2="12.01" 
        y2="16"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", delay: 1.5 }}
      />
    </svg>
  );
}