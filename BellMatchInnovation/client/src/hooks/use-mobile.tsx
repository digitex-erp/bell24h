import { useState, useEffect } from 'react';

type ScreenType = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook to check if a media query matches
 * 
 * @param {string} query - CSS media query string
 * @returns {boolean} True if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    // Update the state with the current value
    const updateMatches = () => {
      setMatches(media.matches);
    };
    
    // Set initial value
    updateMatches();
    
    // Add listener for changes
    media.addEventListener('change', updateMatches);
    
    // Clean up
    return () => {
      media.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}

/**
 * Custom hook for responsive design detection
 * 
 * @returns {Object} Various responsive helpers
 * - isMobile: boolean - Is the screen size mobile (< 640px)
 * - isTablet: boolean - Is the screen size tablet (640px - 1024px)
 * - isDesktop: boolean - Is the screen size desktop (> 1024px)
 * - screenType: 'mobile' | 'tablet' | 'desktop' - Current screen type
 * - width: number - Current window width
 * - height: number - Current window height
 */
export function useMobile() {
  const [screenType, setScreenType] = useState<ScreenType>('desktop');
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });

      if (width < 640) {
        setScreenType('mobile');
      } else if (width < 1024) {
        setScreenType('tablet');
      } else {
        setScreenType('desktop');
      }
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: screenType === 'mobile',
    isTablet: screenType === 'tablet',
    isDesktop: screenType === 'desktop',
    screenType,
    width: dimensions.width,
    height: dimensions.height
  };
}

/**
 * Hook to detect if device has touch capability
 * 
 * @returns {boolean} True if touch is supported
 */
export function useTouch() {
  const [hasTouch, setHasTouch] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check for touch capability
    const isTouchDevice = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0;

    setHasTouch(isTouchDevice);
  }, []);

  return hasTouch;
}

/**
 * Hook to detect if the user is on a mobile browser
 * 
 * @returns {boolean} True if user is on a mobile browser
 */
export function useMobileBrowser() {
  const [isMobileBrowser, setIsMobileBrowser] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check for mobile user agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
    
    const isMobile = mobileRegex.test(userAgent);
    setIsMobileBrowser(isMobile);
  }, []);

  return isMobileBrowser;
}

/**
 * Hook to get device orientation
 * 
 * @returns {Object} Orientation information
 * - isPortrait: boolean - Is the device in portrait mode
 * - isLandscape: boolean - Is the device in landscape mode
 * - orientation: 'portrait' | 'landscape' - Current orientation
 */
export function useOrientation() {
  const { width, height } = useMobile();
  const isPortrait = height > width;
  const isLandscape = width > height;
  
  return {
    isPortrait,
    isLandscape,
    orientation: isPortrait ? 'portrait' : 'landscape' as const
  };
}