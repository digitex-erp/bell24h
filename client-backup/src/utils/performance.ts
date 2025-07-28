import { ReportHandler } from 'web-vitals';

interface PerformanceEntry {
  name: string;
  type: 'mark' | 'measure';
  startTime: number;
  duration?: number;
}

const performanceEntries: PerformanceEntry[] = [];

export function mark(name: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`mark_${name}_start`);
  }
  
  performanceEntries.push({
    name,
    type: 'mark',
    startTime: performance.now(),
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] Mark: ${name}`);
  }
}

export function measure(name: string, startMark: string, endMark: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`mark_${name}_end`);
    performance.measure(
      name,
      `mark_${startMark}_start`,
      `mark_${endMark || name}_end`
    );
    
    // Clean up marks to avoid memory leaks
    performance.clearMarks(`mark_${name}_start`);
    performance.clearMarks(`mark_${name}_end`);
  }
  
  // Find the start and end marks in our custom tracking
  const startEntry = performanceEntries.find(entry => 
    entry.name === startMark && entry.type === 'mark'
  );
  
  const endEntry = performanceEntries.find(entry => 
    entry.name === (endMark || name) && entry.type === 'mark'
  );
  
  if (startEntry && endEntry) {
    const duration = endEntry.startTime - startEntry.startTime;
    performanceEntries.push({
      name,
      type: 'measure',
      startTime: startEntry.startTime,
      duration,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
    
    // Log to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Replace with your analytics implementation
      // logToAnalytics('performance_metric', { name, duration });
    }
  }
}

// Log all performance entries
if (process.env.NODE_ENV === 'development') {
  // Log performance metrics when the page is about to unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      console.group('Performance Metrics');
      performanceEntries.forEach(entry => {
        if (entry.type === 'measure') {
          console.log(`${entry.name}: ${entry.duration?.toFixed(2)}ms`);
        }
      });
      console.groupEnd();
    });
  }
}

export const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export const measurePerformance = () => {
  const metrics: { [key: string]: number } = {};

  // Measure First Contentful Paint (FCP)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    metrics.fcp = entries[0].startTime;
  }).observe({ entryTypes: ['paint'] });

  // Measure Largest Contentful Paint (LCP)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    metrics.lcp = entries[entries.length - 1].startTime;
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Measure First Input Delay (FID)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    metrics.fid = entries[0].duration;
  }).observe({ entryTypes: ['first-input'] });

  // Measure Cumulative Layout Shift (CLS)
  new PerformanceObserver((entryList) => {
    let cls = 0;
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }
    metrics.cls = cls;
  }).observe({ entryTypes: ['layout-shift'] });

  return metrics;
};

export const logPerformanceMetrics = (metrics: { [key: string]: number }) => {
  console.log('Performance Metrics:', {
    FCP: `${metrics.fcp.toFixed(2)}ms`,
    LCP: `${metrics.lcp.toFixed(2)}ms`,
    FID: `${metrics.fid.toFixed(2)}ms`,
    CLS: metrics.cls.toFixed(3),
  });
};

export const measureApiPerformance = async (url: string, method: string = 'GET') => {
  const startTime = performance.now();
  try {
    const response = await fetch(url, { method });
    const endTime = performance.now();
    return {
      url,
      method,
      duration: endTime - startTime,
      status: response.status,
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      url,
      method,
      duration: endTime - startTime,
      error: error.message,
    };
  }
};

export const measureComponentRender = (componentName: string) => {
  const startTime = performance.now();
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
      return duration;
    },
  };
};

export const measurePageLoad = () => {
  const metrics = {
    navigationStart: performance.timing.navigationStart,
    domComplete: performance.timing.domComplete,
    loadEventEnd: performance.timing.loadEventEnd,
  };

  return {
    domLoadTime: metrics.domComplete - metrics.navigationStart,
    totalLoadTime: metrics.loadEventEnd - metrics.navigationStart,
  };
};

export const measureMemoryUsage = () => {
  if (performance.memory) {
    return {
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    };
  }
  return null;
};

export const measureNetworkRequests = () => {
  const resources = performance.getEntriesByType('resource');
  return resources.map(resource => ({
    name: resource.name,
    duration: resource.duration,
    size: resource.transferSize,
    type: resource.initiatorType,
  }));
};

export const measureUserTiming = (markName: string) => {
  performance.mark(markName);
  return {
    end: (measureName: string) => {
      performance.mark(`${markName}-end`);
      performance.measure(measureName, markName, `${markName}-end`);
      const measure = performance.getEntriesByName(measureName)[0];
      return measure.duration;
    },
  };
};
