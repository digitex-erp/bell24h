/**
 * Animated Illustration Component
 * 
 * This component provides animated SVG illustrations for empty states
 * with engaging micro-interactions to improve the user experience.
 */

import React from 'react';
import { motion } from 'framer-motion';

// Animation variants for the search illustration
const searchIllustrationVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const searchElementVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 100
    }
  }
};

const pulseVariants = {
  initial: {
    scale: 0.8,
    opacity: 0.6
  },
  animate: {
    scale: [0.8, 1.1, 0.8],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const floatVariants = {
  initial: {
    y: 0
  },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const rotateVariants = {
  initial: {
    rotate: 0
  },
  animate: {
    rotate: 360,
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Animation variants for the document illustration
const documentIllustrationVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const documentElementVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 100
    }
  }
};

// Different illustration types
const illustrations = {
  search: ({ colors = {}, size = 200 }) => {
    const {
      primary = "#3B82F6",
      secondary = "#93C5FD",
      accent = "#2563EB",
      background = "#EFF6FF"
    } = colors;
    
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={searchIllustrationVariants}
        initial="initial"
        animate="animate"
      >
        <motion.rect 
          x="30" 
          y="30" 
          width="140" 
          height="140" 
          rx="20" 
          fill={background}
          variants={searchElementVariants}
        />
        
        <motion.circle
          cx="95"
          cy="95"
          r="40"
          stroke={primary}
          strokeWidth="6"
          fill="white"
          variants={searchElementVariants}
        />
        
        <motion.line
          x1="125"
          y1="125"
          x2="145"
          y2="145"
          stroke={primary}
          strokeWidth="8"
          strokeLinecap="round"
          variants={searchElementVariants}
        />
        
        <motion.circle
          cx="95"
          cy="95"
          r="20"
          fill={secondary}
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.path
          d="M60 90C60 90 70 80 95 80C120 80 130 90 130 90"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          fill="transparent"
          variants={searchElementVariants}
        />
        
        <motion.circle
          cx="55"
          cy="60"
          r="5"
          fill={accent}
          variants={floatVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.circle
          cx="140"
          cy="70"
          r="7"
          fill={accent}
          opacity="0.5"
          variants={floatVariants}
          initial="initial"
          animate="animate"
          custom={1}
        />
      </motion.svg>
    );
  },
  
  noData: ({ colors = {}, size = 200 }) => {
    const {
      primary = "#3B82F6",
      secondary = "#93C5FD",
      accent = "#2563EB",
      background = "#EFF6FF"
    } = colors;
    
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={documentIllustrationVariants}
        initial="initial"
        animate="animate"
      >
        <motion.rect 
          x="40" 
          y="40" 
          width="120" 
          height="140" 
          rx="10" 
          fill={background}
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="55" 
          y="60" 
          width="90" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="55" 
          y="80" 
          width="60" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="55" 
          y="100" 
          width="75" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="55" 
          y="120" 
          width="40" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="150"
          cy="60"
          r="20"
          fill={primary}
          variants={rotateVariants}
          initial="initial"
          animate="animate"
          style={{ originX: "50%", originY: "50%" }}
        />
        
        <motion.path
          d="M150 50L150 70M140 60L160 60"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="40"
          cy="150"
          r="8"
          fill={accent}
          opacity="0.6"
          variants={floatVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.circle
          cx="160"
          cy="140"
          r="5"
          fill={accent}
          opacity="0.8"
          variants={floatVariants}
          initial="initial"
          animate="animate"
          custom={1}
        />
      </motion.svg>
    );
  },
  
  emptyFolder: ({ colors = {}, size = 200 }) => {
    const {
      primary = "#3B82F6",
      secondary = "#93C5FD",
      accent = "#2563EB",
      background = "#EFF6FF"
    } = colors;
    
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={documentIllustrationVariants}
        initial="initial"
        animate="animate"
      >
        <motion.path 
          d="M40 70C40 64.4772 44.4772 60 50 60H80C85.5228 60 90 64.4772 90 70V70H150C155.523 70 160 74.4772 160 80V140C160 145.523 155.523 150 150 150H50C44.4772 150 40 145.523 40 140V70Z" 
          fill={background}
          variants={documentElementVariants}
        />
        
        <motion.path 
          d="M40 85C40 85 40 85 60 85H140C140 85 160 85 160 85" 
          stroke={secondary}
          strokeWidth="2"
          variants={documentElementVariants}
        />
        
        <motion.path 
          d="M50 60L65 45H90L105 60H150" 
          stroke={primary}
          strokeWidth="2"
          fill="none"
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="100"
          cy="110"
          r="15"
          fill={primary}
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.path
          d="M100 100L100 120M90 110L110 110"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="70"
          cy="130"
          r="5"
          fill={accent}
          opacity="0.6"
          variants={floatVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.circle
          cx="130"
          cy="130"
          r="8"
          fill={accent}
          opacity="0.4"
          variants={floatVariants}
          initial="initial"
          animate="animate"
          custom={1}
        />
      </motion.svg>
    );
  },
  
  error: ({ colors = {}, size = 200 }) => {
    const {
      primary = "#EF4444",
      secondary = "#FEE2E2",
      accent = "#B91C1C",
      background = "#FEF2F2"
    } = colors;
    
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={documentIllustrationVariants}
        initial="initial"
        animate="animate"
      >
        <motion.circle 
          cx="100" 
          cy="100" 
          r="60" 
          fill={background}
          variants={documentElementVariants}
        />
        
        <motion.circle 
          cx="100" 
          cy="100" 
          r="40" 
          stroke={primary}
          strokeWidth="5"
          fill="transparent"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.path
          d="M80 80L120 120M120 80L80 120"
          stroke={primary}
          strokeWidth="5"
          strokeLinecap="round"
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="60"
          cy="60"
          r="10"
          fill={secondary}
          variants={floatVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.circle
          cx="140"
          cy="60"
          r="5"
          fill={accent}
          opacity="0.5"
          variants={floatVariants}
          initial="initial"
          animate="animate"
          custom={1}
        />
        
        <motion.circle
          cx="150"
          cy="120"
          r="8"
          fill={secondary}
          variants={floatVariants}
          initial="initial"
          animate="animate"
        />
      </motion.svg>
    );
  },
  
  notification: ({ colors = {}, size = 200 }) => {
    const {
      primary = "#8B5CF6",
      secondary = "#DDD6FE",
      accent = "#6D28D9",
      background = "#F5F3FF"
    } = colors;
    
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={documentIllustrationVariants}
        initial="initial"
        animate="animate"
      >
        <motion.rect 
          x="45" 
          y="60" 
          width="110" 
          height="80" 
          rx="10" 
          fill={background}
          variants={documentElementVariants}
        />
        
        <motion.path
          d="M45 80L155 80"
          stroke={secondary}
          strokeWidth="2"
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="60" 
          y="95" 
          width="80" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="60" 
          y="115" 
          width="50" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="150"
          cy="70"
          r="4"
          fill={primary}
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="135"
          cy="70"
          r="4"
          fill={primary}
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="120"
          cy="70"
          r="4"
          fill={primary}
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="40"
          cy="50"
          r="10"
          fill={primary}
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.circle
          cx="160"
          cy="40"
          r="5"
          fill={accent}
          opacity="0.6"
          variants={floatVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.circle
          cx="170"
          cy="100"
          r="8"
          fill={secondary}
          variants={floatVariants}
          initial="initial"
          animate="animate"
          custom={1}
        />
      </motion.svg>
    );
  },
  
  rfq: ({ colors = {}, size = 200 }) => {
    const {
      primary = "#3B82F6",
      secondary = "#93C5FD",
      accent = "#2563EB",
      background = "#EFF6FF"
    } = colors;
    
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={documentIllustrationVariants}
        initial="initial"
        animate="animate"
      >
        <motion.rect 
          x="50" 
          y="50" 
          width="100" 
          height="120" 
          rx="8" 
          fill={background}
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="65" 
          y="70" 
          width="70" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="65" 
          y="90" 
          width="40" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="65" 
          y="110" 
          width="55" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.rect 
          x="65" 
          y="130" 
          width="30" 
          height="10" 
          rx="5" 
          fill={secondary}
          variants={documentElementVariants}
        />
        
        <motion.path
          d="M65 150H120"
          stroke={primary}
          strokeWidth="2"
          strokeDasharray="3 3"
          variants={documentElementVariants}
        />
        
        <motion.circle
          cx="140"
          cy="40"
          r="12"
          fill={primary}
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />
        
        <motion.path
          d="M140 35V45M135 40H145"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          variants={documentElementVariants}
        />
        
        <motion.path
          d="M50 70L40 80L50 90"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          variants={documentElementVariants}
        />
        
        <motion.path
          d="M150 70L160 80L150 90"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          variants={documentElementVariants}
        />
      </motion.svg>
    );
  }
};

/**
 * AnimatedIllustration component that provides an animated SVG illustration
 * based on the specified type.
 * 
 * @param {string} type - The type of illustration ('search', 'noData', 'emptyFolder', 'error', etc.)
 * @param {object} colors - Custom colors for the illustration
 * @param {number} size - Size of the illustration (width and height)
 */
const AnimatedIllustration = ({
  type = 'noData',
  colors = {},
  size = 200,
  className = '',
  ...props
}) => {
  const IllustrationComponent = illustrations[type] || illustrations.noData;
  
  return (
    <div className={`animated-illustration ${className}`} {...props}>
      <IllustrationComponent colors={colors} size={size} />
    </div>
  );
};

export default AnimatedIllustration;