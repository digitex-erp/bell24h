import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  size?: "small" | "medium" | "large";
  className?: string;
}

export function SuccessAnimation({
  isVisible,
  onComplete,
  size = "medium",
  className = "",
}: SuccessAnimationProps) {
  const [played, setPlayed] = useState(false);
  
  // Determine dimensions based on size
  const dimensions = {
    small: { circle: 24, check: 12 },
    medium: { circle: 40, check: 20 },
    large: { circle: 56, check: 28 },
  }[size];
  
  useEffect(() => {
    if (isVisible && !played) {
      setPlayed(true);
      
      // Call onComplete after animation finishes
      if (onComplete) {
        const timer = setTimeout(() => {
          onComplete();
        }, 2000); // Animation duration + a bit extra
        
        return () => clearTimeout(timer);
      }
    }
    
    if (!isVisible) {
      setPlayed(false);
    }
  }, [isVisible, played, onComplete]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <div className={`relative flex items-center justify-center ${className}`}>
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className="relative"
          >
            {/* Outer circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute inset-0 bg-primary/20 rounded-full"
              style={{ width: dimensions.circle, height: dimensions.circle }}
            />
            
            {/* Inner circle with check */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center bg-primary rounded-full"
              style={{ width: dimensions.circle, height: dimensions.circle }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.15, 
                  duration: 0.4, 
                  type: "spring", 
                  stiffness: 400
                }}
              >
                <Check 
                  size={dimensions.check} 
                  strokeWidth={3} 
                  className="text-primary-foreground" 
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}