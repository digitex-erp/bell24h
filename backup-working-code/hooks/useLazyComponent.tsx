import { useState, useEffect, ComponentType, LazyExoticComponent } from 'react';

type LazyComponent<T extends ComponentType<any>> = LazyExoticComponent<T> | (() => Promise<{ default: T }>);

export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: React.ReactNode = null
): [LazyExoticComponent<T> | null, boolean] {
  const [Component, setComponent] = useState<LazyExoticComponent<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        const module = await importFn();
        if (isMounted) {
          setComponent(() => module.default);
        }
      } catch (error) {
        console.error('Failed to load component:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [importFn]);

  return [Component, isLoading];
}
