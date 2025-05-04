import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Check, 
  AlertCircle, 
  Info, 
  MessageSquare, 
  Calendar, 
  Mail, 
  Package, 
  Award, 
  FileText,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyNotificationIllustration } from "@/components/ui/illustrations";

/**
 * Notification component with engaging micro-interactions
 */
export function NotificationCenter({ 
  notifications = [], 
  onDismiss, 
  onDismissAll, 
  onRead, 
  onAction,
  maxNotifications = 5,
  className = ""
}) {
  const [expanded, setExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Calculate unread notifications
  useEffect(() => {
    setUnreadCount(notifications.filter(notif => !notif.read).length);
    setShowEmptyState(notifications.length === 0);
  }, [notifications]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const handleAction = (notification, e) => {
    e.stopPropagation();
    if (onAction) {
      onAction(notification);
    }
  };

  const handleRead = (notification) => {
    if (!notification.read && onRead) {
      onRead(notification.id);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.2 }
    }
  };

  const bellIconVariants = {
    initial: { rotate: 0 },
    animate: unreadCount > 0 ? {
      rotate: [0, -5, 5, -5, 0],
      transition: {
        repeat: 4,
        repeatType: "mirror",
        duration: 0.5,
        repeatDelay: 5
      }
    } : {}
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'email':
        return <Mail className="h-5 w-5 text-purple-500" />;
      case 'shipment':
        return <Package className="h-5 w-5 text-amber-500" />;
      case 'award':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon Button */}
      <motion.button
        className={`relative rounded-full p-2 focus:outline-none ${
          expanded ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        onClick={toggleExpanded}
        initial="initial"
        animate="animate"
        variants={bellIconVariants}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <motion.span 
            className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 15
              }
            }}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Notifications
              </h3>
              {notifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onDismissAll}
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {showEmptyState ? (
                <div className="p-8 text-center">
                  <EmptyNotificationIllustration className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-gray-900 font-medium mb-1">All Caught Up!</h4>
                  <p className="text-gray-500 text-sm">
                    You don't have any notifications right now.
                  </p>
                </div>
              ) : (
                <motion.div
                  className="divide-y divide-gray-200"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence initial={false}>
                    {notifications.slice(0, maxNotifications).map((notification) => (
                      <motion.div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => handleRead(notification)}
                        layout
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            {notification.time && (
                              <p className="text-xs text-gray-400 mt-1">
                                {typeof notification.time === 'string' 
                                  ? notification.time 
                                  : new Date(notification.time).toLocaleString()}
                              </p>
                            )}
                            {notification.actionLabel && (
                              <motion.button
                                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                                onClick={(e) => handleAction(notification, e)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {notification.actionLabel}
                              </motion.button>
                            )}
                          </div>
                          <motion.button
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            onClick={(e) => handleDismiss(notification.id, e)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {notifications.length > maxNotifications && (
                    <div className="px-4 py-3 text-center">
                      <Button variant="link" size="sm">
                        View All Notifications
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Toast notification component with engaging animations
 */
export function ToastNotification({
  id,
  type = "info",
  title,
  message,
  duration = 5000,
  onDismiss,
  action,
  actionLabel,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer;
    let progressTimer;
    
    if (isVisible && !isPaused && duration > 0) {
      // Main dismiss timer
      timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {
          onDismiss(id);
        }
      }, duration);
      
      // Progress bar timer
      const interval = 10; // Update every 10ms
      const steps = duration / interval;
      const stepValue = 100 / steps;
      
      progressTimer = setInterval(() => {
        setProgress(prev => {
          const newValue = prev - stepValue;
          return newValue < 0 ? 0 : newValue;
        });
      }, interval);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [isVisible, isPaused, duration, id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-500',
          progressColor: 'bg-green-500'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-500',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-500',
          progressColor: 'bg-amber-500'
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-500',
          progressColor: 'bg-blue-500'
        };
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const styles = getTypeStyles();
  const icon = getTypeIcon();

  const toastVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`w-full max-w-sm overflow-hidden rounded-lg border shadow-lg ${styles.bgColor} ${styles.borderColor}`}
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          layout
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${styles.iconBg} p-2 rounded-full ${styles.iconColor}`}>
                {icon}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
                {action && actionLabel && (
                  <div className="mt-3">
                    <Button 
                      size="sm" 
                      onClick={action}
                    >
                      {actionLabel}
                    </Button>
                  </div>
                )}
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <motion.button
                  className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDismiss}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          {duration > 0 && (
            <div className="h-1 w-full bg-gray-200">
              <motion.div
                className={`h-full ${styles.progressColor}`}
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Toast notification container component
 */
export function ToastContainer({ 
  toasts = [], 
  position = "bottom-right", 
  onDismiss 
}) {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-center':
        return 'top-0 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-center':
        return 'bottom-0 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-0 right-0';
    }
  };

  const positionClass = getPositionStyles();

  return (
    <div 
      className={`fixed z-50 m-4 flex flex-col space-y-4 ${positionClass}`}
      aria-live="assertive"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onDismiss={onDismiss}
            action={toast.action}
            actionLabel={toast.actionLabel}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}