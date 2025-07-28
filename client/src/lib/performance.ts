// Performance monitoring utilities for Bell24H
export const measurePageLoad = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`🚀 Page load time: ${loadTime.toFixed(2)}ms`);

      // Core Web Vitals tracking
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        const metrics = {
          loadTime: loadTime,
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstByte: navigation.responseStart - navigation.requestStart,
          domInteractive: navigation.domInteractive - navigation.startTime,
          domComplete: navigation.domComplete - navigation.startTime,
        };

        console.log('📊 Performance Metrics:', metrics);

        // Alert if load time exceeds target
        if (loadTime > 3000) {
          console.warn('⚠️ Page load time exceeds 3 seconds:', loadTime);
        } else {
          console.log('✅ Page load time within target (<3s)');
        }

        // Report to analytics in production
        if (process.env.NODE_ENV === 'production') {
          // TODO: Send to analytics service
          reportToAnalytics('page_load', metrics);
        }
      }
    });
  }
};

export const measureComponentRender = (componentName: string) => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    const renderTime = end - start;
    console.log(`⚡ ${componentName} render time: ${renderTime.toFixed(2)}ms`);

    if (renderTime > 100) {
      console.warn(`⚠️ Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    return renderTime;
  };
};

export const measureAPICall = (endpoint: string) => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    const apiTime = end - start;
    console.log(`🔌 API ${endpoint} response time: ${apiTime.toFixed(2)}ms`);

    if (apiTime > 1000) {
      console.warn(`⚠️ Slow API response: ${endpoint} took ${apiTime.toFixed(2)}ms`);
    }

    return apiTime;
  };
};

export const measureBundleSize = () => {
  if (typeof window !== 'undefined') {
    // Monitor JavaScript bundle loading
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.name.includes('.js')) {
          const size = (entry as any).transferSize || 0;
          console.log(`📦 Bundle ${entry.name}: ${(size / 1024).toFixed(2)}KB`);

          if (size > 200 * 1024) {
            // 200KB threshold
            console.warn(
              `⚠️ Large bundle detected: ${entry.name} is ${(size / 1024).toFixed(2)}KB`
            );
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }
};

// Analytics reporting (placeholder)
const reportToAnalytics = (event: string, data: any) => {
  // In production, this would send to your analytics service
  console.log(`📈 Analytics Event: ${event}`, data);
};

// Core Web Vitals monitoring
export const initCoreWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      console.log(`🎯 LCP: ${lcp.toFixed(2)}ms`);

      if (lcp > 2500) {
        console.warn('⚠️ LCP exceeds 2.5s threshold');
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID) monitoring
    const fidObserver = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        const fid = (entry as any).processingStart - entry.startTime;
        console.log(`⚡ FID: ${fid.toFixed(2)}ms`);

        if (fid > 100) {
          console.warn('⚠️ FID exceeds 100ms threshold');
        }
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });
  }
};

// Initialize all performance monitoring
export const initPerformanceMonitoring = () => {
  measurePageLoad();
  measureBundleSize();
  initCoreWebVitals();
};
