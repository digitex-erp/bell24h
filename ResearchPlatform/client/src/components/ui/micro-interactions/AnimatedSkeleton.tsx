import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedSkeletonProps {
  className?: string;
  variant?: "line" | "circle" | "rectangle" | "card" | "avatar" | "button" | "paragraph";
  lines?: number;
  width?: string | number;
  height?: string | number;
  animate?: boolean;
  shimmer?: boolean;
}

export function AnimatedSkeleton({
  className = "",
  variant = "line",
  lines = 3,
  width,
  height,
  animate = true,
  shimmer = true,
}: AnimatedSkeletonProps) {
  const baseClasses = "bg-gray-200 dark:bg-gray-700 rounded relative overflow-hidden";
  
  // Default dimensions based on variant
  const getDefaultDimensions = (variant: string) => {
    switch (variant) {
      case "circle":
        return { width: "40px", height: "40px" };
      case "rectangle":
        return { width: "100%", height: "120px" };
      case "card":
        return { width: "100%", height: "200px" };
      case "avatar":
        return { width: "50px", height: "50px" };
      case "button":
        return { width: "100px", height: "40px" };
      case "line":
      default:
        return { width: "100%", height: "16px" };
    }
  };
  
  const defaultDims = getDefaultDimensions(variant);
  const w = width || defaultDims.width;
  const h = height || defaultDims.height;
  
  // Specific classes based on variant
  const variantClasses = {
    circle: "rounded-full",
    rectangle: "rounded-md",
    card: "rounded-lg",
    avatar: "rounded-full",
    button: "rounded-md",
    line: "rounded",
    paragraph: "",
  }[variant];

  // Create shimmer effect
  const shimmerElement = shimmer ? (
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{ x: ["0%", "100%"] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
  ) : null;

  // For paragraph variant, render multiple lines
  if (variant === "paragraph") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="relative">
            <motion.div
              className={cn(baseClasses, "rounded")}
              style={{ 
                height: h,
                width: i === lines - 1 ? "70%" : "100%", 
              }}
              {...(animate && {
                initial: { opacity: 0.5 },
                animate: { opacity: 1 },
                transition: { duration: 1, repeat: Infinity, repeatType: "reverse" }
              })}
            >
              {shimmerElement}
            </motion.div>
          </div>
        ))}
      </div>
    );
  }

  // Single skeleton element
  return (
    <div className="relative">
      <motion.div
        className={cn(baseClasses, variantClasses, className)}
        style={{ width: w, height: h }}
        {...(animate && {
          initial: { opacity: 0.5 },
          animate: { opacity: 1 },
          transition: { duration: 1, repeat: Infinity, repeatType: "reverse" }
        })}
      >
        {shimmerElement}
      </motion.div>
    </div>
  );
}