/**
 * Empty State Component
 * 
 * This component provides engaging micro-interactions for empty data states
 * with animations and visual feedback to improve the user experience.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileQuestion, 
  AlertCircle, 
  Inbox, 
  FileX, 
  Filter, 
  RefreshCw,
  MailOpen,
  Folder,
  FileText,
  PlusCircle,
  ListPlus
} from 'lucide-react';

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
      duration: 0.2
    }
  }
};

// Animation variants for the icon
const iconVariants = {
  hidden: { scale: 0.8, opacity: 0, y: 10 },
  visible: { 
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring",
      damping: 12,
      stiffness: 200
    }
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.1,
    transition: { 
      type: "spring",
      damping: 10,
      stiffness: 300
    }
  },
  tap: {
    scale: 0.95
  }
};

// Animation variants for text elements
const textVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: { duration: 0.2 }
  }
};

// Animation variants for action button
const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      type: "spring",
      damping: 12,
      stiffness: 200,
      delay: 0.2
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    transition: { 
      type: "spring",
      damping: 10,
      stiffness: 300
    }
  },
  tap: {
    scale: 0.97
  }
};

// Floating animation for the icon
const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut"
  }
};

// Types of empty states with their default icons and messages
const EMPTY_TYPES = {
  SEARCH: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for"
  },
  DATA: {
    icon: FileQuestion,
    title: "No data available",
    description: "There is no data to display at this moment"
  },
  NOTIFICATIONS: {
    icon: MailOpen,
    title: "No notifications",
    description: "You don't have any notifications at this time"
  },
  ERROR: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "We encountered an error while trying to display this content"
  },
  FILTER: {
    icon: Filter,
    title: "No matches found",
    description: "Try adjusting your filters to see more items"
  },
  INBOX: {
    icon: Inbox,
    title: "Your inbox is empty",
    description: "You don't have any messages at this time"
  },
  FILES: {
    icon: FileX,
    title: "No files available",
    description: "There are no files to display here"
  },
  FOLDER: {
    icon: Folder,
    title: "Folder is empty",
    description: "This folder doesn't contain any items yet"
  },
  DOCUMENTS: {
    icon: FileText,
    title: "No documents yet",
    description: "There are no documents to display"
  },
  CUSTOM: {
    icon: FileQuestion,
    title: "Nothing to display",
    description: "This section is currently empty"
  }
};

/**
 * EmptyState component that provides an animated empty state message
 * with optional action button.
 * 
 * @param {string} type - The type of empty state (SEARCH, DATA, etc.)
 * @param {string} title - Custom title (overrides the default for the type)
 * @param {string} description - Custom description (overrides the default)
 * @param {React.ElementType} icon - Custom icon component (overrides default)
 * @param {string} actionText - Text for the call to action button
 * @param {function} onAction - Click handler for the action button
 * @param {string} imageSrc - Optional decorative image URL
 * @param {boolean} animate - Whether to animate the empty state (default: true)
 * @param {object} className - Additional CSS classes
 */
const EmptyState = ({
  type = 'DATA',
  title,
  description,
  icon: CustomIcon,
  actionText,
  onAction,
  imageSrc,
  animate = true,
  className = '',
  children,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const emptyConfig = EMPTY_TYPES[type] || EMPTY_TYPES.CUSTOM;
  
  // Randomize the animation delay slightly for a more organic feel
  const randomDelay = Math.random() * 0.3;
  
  // Icon selection logic
  const IconComponent = CustomIcon || emptyConfig.icon;
  
  // Set content visibility after a small delay for animation purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Render different icon variants based on the type
  const renderIcon = () => {
    return (
      <motion.div
        variants={iconVariants}
        whileHover="hover"
        whileTap="tap"
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative"
      >
        <motion.div
          animate={animate ? floatAnimation : {}}
          className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-5 shadow-sm"
        >
          <IconComponent className="h-8 w-8 text-gray-500" />
        </motion.div>
        
        {/* Decorative elements for certain types */}
        {type === 'SEARCH' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { delay: 0.5, duration: 0.3 }
            }}
            className="absolute -top-1 -right-1 bg-gray-200 rounded-full p-1"
          >
            <PlusCircle className="h-4 w-4 text-gray-500" />
          </motion.div>
        )}
        
        {type === 'DATA' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { delay: 0.5, duration: 0.3 }
            }}
            className="absolute -bottom-1 -right-1 bg-blue-100 rounded-full p-1"
          >
            <ListPlus className="h-4 w-4 text-blue-600" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          {...props}
        >
          {/* Icon or Image */}
          {imageSrc ? (
            <motion.img
              src={imageSrc}
              alt={title || emptyConfig.title}
              className="h-32 w-auto mb-4 rounded-lg"
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            />
          ) : (
            renderIcon()
          )}
          
          {/* Title */}
          <motion.h3 
            className="mt-4 text-lg font-medium text-gray-900"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ 
              transitionDelay: `${0.1 + randomDelay}s`,
            }}
          >
            {title || emptyConfig.title}
          </motion.h3>
          
          {/* Description */}
          <motion.p 
            className="mt-2 text-sm text-gray-500 max-w-md"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ 
              transitionDelay: `${0.2 + randomDelay}s`,
            }}
          >
            {description || emptyConfig.description}
          </motion.p>
          
          {/* Action Button */}
          {actionText && onAction && (
            <motion.button
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium inline-flex items-center transition-colors hover:bg-blue-100"
              onClick={onAction}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {actionText}
              {type === 'DATA' && <RefreshCw className="ml-2 h-4 w-4" />}
              {type === 'SEARCH' && <Search className="ml-2 h-4 w-4" />}
            </motion.button>
          )}
          
          {/* Optional children content */}
          {children && (
            <motion.div
              className="mt-4 w-full"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ 
                transitionDelay: `${0.3 + randomDelay}s`,
              }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmptyState;