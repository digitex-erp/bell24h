// Animation utility functions and classes for supplier match insights

/**
 * Calculates a scale factor based on match score.
 * Higher scores result in larger scale factors to visually emphasize better matches.
 * 
 * @param score - Match score (0-100)
 * @returns A scale factor between 0.85 and 1.15
 */
export const getScaleByScore = (score: number): number => {
  // 0-100 range to 0.85-1.15 scale factor
  return 0.85 + (score / 100) * 0.3;
};

/**
 * Calculates animation duration based on confidence level.
 * Higher confidence results in quicker animations to convey certainty.
 * 
 * @param confidence - Confidence value (0-1)
 * @returns Animation duration in milliseconds (300-800ms)
 */
export const getDurationByConfidence = (confidence: number): number => {
  // 0-1 range to 800-300ms duration (higher confidence = faster animation)
  const clamped = Math.max(0, Math.min(1, confidence));
  return 800 - clamped * 500;
};

/**
 * Generates staggered delay times for sequentially animating multiple items.
 * Creates a cascading effect when used with lists of elements.
 * 
 * @param index - Index of the item in a list (0-based)
 * @returns Delay in milliseconds
 */
export const getStaggerDelay = (index: number): number => {
  return index * 120; // 120ms stagger between items
};

/**
 * Creates a sequence of animation delays based on multiple factors.
 * Useful for complex multi-part animations that need coordinated timing.
 * 
 * @param index - Base index position
 * @param baseDelay - Starting delay time in ms
 * @param staggerAmount - Amount of time between staggered animations
 * @param priorityFactor - Optional multiplier to speed up or slow down based on priority
 * @returns Final calculated delay in milliseconds
 */
export const getSequencedDelay = (
  index: number, 
  baseDelay: number = 100, 
  staggerAmount: number = 100,
  priorityFactor: number = 1
): number => {
  return baseDelay + (index * staggerAmount * priorityFactor);
};

/**
 * Map of animation classes for various animation types.
 * These classes correspond to the CSS animations defined in index.css
 */
export const animationClasses = {
  // For item entrances
  fadeIn: 'animate-fade-in',
  slideInRight: 'animate-slide-in-right',
  slideInLeft: 'animate-slide-in-left',
  slideInUp: 'animate-slide-in-up',
  zoomIn: 'animate-zoom-in',
  revealText: 'animate-reveal-text',
  
  // For attention highlighting
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  wiggle: 'animate-wiggle',
  float: 'animate-float',
  ripple: 'animate-ripple',
  spin: 'animate-spin',
  
  // For state changes
  expandHeight: 'animate-expand-height',
  fadeInScale: 'animate-fade-in-scale',
  progressFill: 'animate-progress-fill',
  
  // For UI effects
  shimmer: 'animate-shimmer',
  
  // For charts and graphs
  barGrow: 'animate-bar-grow',
  lineGrow: 'animate-line-grow',
  
  // For positive/negative indications
  positiveHighlight: 'animate-positive-highlight',
  negativeHighlight: 'animate-negative-highlight',
};

/**
 * Converts a delay time value to the appropriate Tailwind delay class.
 * Used to apply consistent delays across components.
 * 
 * @param delayMs - Delay time in milliseconds
 * @returns Tailwind delay class name
 */
export const getDelayClass = (delayMs: number): string => {
  const delay = Math.max(0, delayMs); // Ensure non-negative
  if (delay <= 100) return 'delay-75';
  if (delay <= 200) return 'delay-150';
  if (delay <= 300) return 'delay-300';
  if (delay <= 500) return 'delay-500';
  if (delay <= 700) return 'delay-700';
  if (delay <= 1000) return 'delay-1000';
  return 'delay-[2000ms]'; // Custom delay for longer times
};

/**
 * Converts a duration time value to the appropriate Tailwind duration class.
 * Ensures animation durations are consistent across the application.
 * 
 * @param durationMs - Animation duration in milliseconds
 * @returns Tailwind duration class name
 */
export const getDurationClass = (durationMs: number): string => {
  const duration = Math.max(0, durationMs); // Ensure non-negative
  if (duration <= 200) return 'duration-150';
  if (duration <= 300) return 'duration-300';
  if (duration <= 500) return 'duration-500';
  if (duration <= 700) return 'duration-700';
  if (duration <= 1000) return 'duration-1000';
  return `duration-[${duration}ms]`; // Custom duration for specific timing
};

/**
 * Creates a combined animation class string based on element type and its importance.
 * Streamlines the process of building multiple animation classes.
 * 
 * @param type - Type of the element (e.g., 'title', 'card', 'button', etc.)
 * @param importance - Importance level (0-1) that affects animation prominence
 * @returns String of combined animation classes
 */
export const getAnimationByElementType = (type: string, importance: number = 0.5): string => {
  const baseClass = 'transition-all';
  const delayClass = getDelayClass(importance * 300);
  
  switch (type) {
    case 'title':
      return `${baseClass} ${animationClasses.slideInLeft} ${delayClass}`;
    case 'card':
      return `${baseClass} ${animationClasses.fadeInScale} ${delayClass}`;
    case 'metric':
      return `${baseClass} ${animationClasses.slideInUp} ${delayClass}`;
    case 'button':
      return `${baseClass} ${animationClasses.fadeIn} ${delayClass}`;
    case 'chart':
      return `${baseClass} ${animationClasses.barGrow} ${delayClass}`;
    default:
      return `${baseClass} ${animationClasses.fadeIn} ${delayClass}`;
  }
};

/**
 * Determines the appropriate animation class for contribution values.
 * Positive contributions get highlighted differently than negative ones.
 * 
 * @param value - Contribution value (positive or negative percentage)
 * @returns CSS class string for the appropriate animation
 */
export const getContributionAnimationClass = (value: number): string => {
  const baseClass = 'transition-all';
  
  // Determine animation intensity based on contribution magnitude
  if (value > 50) return `${baseClass} ${animationClasses.positiveHighlight} font-semibold`;
  if (value > 30) return `${baseClass} ${animationClasses.positiveHighlight}`;
  if (value > 10) return `${baseClass} ${animationClasses.fadeInScale}`;
  
  if (value < -50) return `${baseClass} ${animationClasses.negativeHighlight} font-semibold`;
  if (value < -30) return `${baseClass} ${animationClasses.negativeHighlight}`;
  if (value < -10) return `${baseClass} ${animationClasses.fadeInScale}`;
  
  return baseClass;
};

/**
 * Determines the appropriate animation class for match scores.
 * Higher match scores receive more prominent animations.
 * 
 * @param score - Match score (0-100)
 * @returns CSS class string for the appropriate animation
 */
export const getMatchScoreAnimationClass = (score: number): string => {
  const baseClass = 'transition-all';
  
  // Scale animation prominence with match score
  if (score >= 90) return `${baseClass} ${animationClasses.pulse} ${animationClasses.fadeInScale} font-bold text-green-600`;
  if (score >= 80) return `${baseClass} ${animationClasses.pulse} text-green-600 font-semibold`;
  if (score >= 70) return `${baseClass} ${animationClasses.fadeInScale} text-blue-600`;
  if (score >= 60) return `${baseClass} ${animationClasses.fadeIn} text-blue-600`;
  
  return baseClass;
};

/**
 * Gets animation classes for match confidence level visualization.
 * 
 * @param confidence - Confidence level (0-1)
 * @returns CSS animation class
 */
export const getConfidenceAnimationClass = (confidence: number): string => {
  const baseClass = 'transition-all';
  
  if (confidence > 0.9) return `${baseClass} ${animationClasses.fadeInScale} text-green-600 font-semibold`;
  if (confidence > 0.7) return `${baseClass} ${animationClasses.fadeIn} text-green-600`;
  if (confidence > 0.5) return `${baseClass} ${animationClasses.fadeIn} text-blue-600`;
  
  return `${baseClass} text-gray-500`;
};