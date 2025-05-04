import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
  location: string;
  className?: string;
  transitionType?: "fade" | "slide" | "zoom" | "none";
}

export function PageTransition({
  children,
  location,
  className = "",
  transitionType = "fade",
}: PageTransitionProps) {
  // Different animation variants for different transition types
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3, type: "tween" }
    },
    zoom: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.02 },
      transition: { duration: 0.3 }
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
      transition: {}
    }
  };

  const selectedVariant = variants[transitionType];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        className={className}
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={selectedVariant.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}