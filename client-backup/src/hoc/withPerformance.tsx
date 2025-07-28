import { useEffect, useState, ComponentType } from 'react';
import { mark, measure } from '../utils/performance';

const withPerformance = <P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string = WrappedComponent.displayName || WrappedComponent.name || 'Component'
) => {
  const WithPerformance = (props: P & { isLoaded?: boolean }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const componentId = `component_${componentName}`;

    useEffect(() => {
      // Mark when the component starts loading
      mark(`${componentId}_start`);
      
      // Mark when the component is mounted
      const onLoad = () => {
        mark(`${componentId}_mount`);
        measure(componentId, `${componentId}_start`, `${componentId}_mount`);
        setIsLoaded(true);
      };

      // Use requestIdleCallback to measure after the component is mounted
      if (window.requestIdleCallback) {
        const id = requestIdleCallback(onLoad);
        return () => cancelIdleCallback(id);
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        const timer = setTimeout(onLoad, 0);
        return () => clearTimeout(timer);
      }
    }, [componentId]);

    return <WrappedComponent {...props} isLoaded={isLoaded} />;
  };

  // Set a display name for the HOC for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithPerformance.displayName = `WithPerformance(${displayName})`;

  return WithPerformance;
};

export default withPerformance;
