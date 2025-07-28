import React, { lazy, ComponentType, LazyExoticComponent, Suspense, useEffect } from 'react';

type ImportFunction<T> = () => Promise<{ default: ComponentType<T> }>;

/**
 * Creates a lazy-loaded component with performance tracking
 * @param importFn Function that returns a dynamic import()
 * @param componentName Name of the component for performance tracking
 */
export function lazyWithRetry<T = any>(
  importFn: ImportFunction<T>,
  componentName: string = 'AnonymousComponent'
): LazyExoticComponent<ComponentType<T>> {
  const componentId = `lazy_${componentName}`;
  
  return lazy(async () => {
    performance.mark(`${componentId}_start`);
    
    try {
      const module = await importFn();
      performance.mark(`${componentId}_loaded`);
      performance.measure(componentId, `${componentId}_start`, `${componentId}_loaded`);
      
      return module;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      
      // Retry loading the component after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const retryModule = await importFn();
        performance.mark(`${componentId}_retry_loaded`);
        performance.measure(
          `${componentId}_retry`, 
          `${componentId}_start`, 
          `${componentId}_retry_loaded`
        );
        
        return retryModule;
      } catch (retryError) {
        console.error(`Failed to load component ${componentName} after retry:`, retryError);
        throw retryError;
      }
    }
  });
}

/**
 * Creates a preload function for a lazy-loaded component
 * @param importFn Function that returns a dynamic import()
 */
export function preloadComponent<T>(
  importFn: ImportFunction<T>
): () => Promise<void> {
  let promise: Promise<void> | null = null;
  
  return () => {
    if (!promise) {
      promise = importFn().then(() => {
        console.log('Component preloaded successfully');
      }).catch(error => {
        console.error('Failed to preload component:', error);
      });
    }
    
    return promise;
  };
}

/**
 * Creates a component that preloads other components when it mounts
 * @param preloadFns Array of preload functions to call
 */
export function createPreloader(
  preloadFns: Array<() => Promise<void>>
): React.FC<{ children: React.ReactNode }> {
  return function Preloader({ children }) {
    useEffect(() => {
      // Start preloading components when the preloader mounts
      Promise.all(preloadFns.map(fn => fn().catch(console.error)));
    }, []);
    
    return <>{children}</>;
  };
}

/**
 * Higher-order component that adds a loading state to a lazy-loaded component
 * @param LazyComponent The lazy-loaded component
 * @param Fallback The fallback component to show while loading
 */
export function withLoading<T>(
  LazyComponent: LazyExoticComponent<ComponentType<T>>,
  Fallback: React.ComponentType = () => <div>Loading...</div>
): React.FC<T> {
  return function WithLoading(props: T) {
    return (
      <Suspense fallback={<Fallback {...(props as any)} />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// New lazyImport function as per user's plan
export function lazyImport(path: string) {
  return React.lazy(() => {
    // Handle new component paths
    if (path.includes('ExplainabilityPanel')) {
      return import(
        /* webpackChunkName: "explainability-panel" */
        '@/components/ai/ExplainabilityPanel'
      );
    }
    
    // Existing import logic or a default behavior should be defined here
    // For now, let's throw an error if the path is not recognized
    // or return a promise to a default component or null.
    // This part needs to be adapted based on how other components are lazy loaded.
    console.warn(`lazyImport: Path "${path}" not explicitly handled. Falling back to direct import attempt.`);
    // Assuming other paths are direct or need a different mapping
    // This is a placeholder and might need to match existing patterns in the codebase
    return import(`@/${path}`); 
  });
}
