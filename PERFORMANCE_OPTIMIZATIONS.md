# Performance Optimizations for Bell24H

This document outlines the performance optimizations implemented in the Bell24H application.

## Table of Contents

1. [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
2. [Image Optimization](#image-optimization)
3. [Data Fetching & Caching](#data-fetching--caching)
4. [Virtualized Lists](#virtualized-lists)
5. [Web Workers](#web-workers)
6. [Storage Management](#storage-management)
7. [Performance Monitoring](#performance-monitoring)

## Code Splitting & Lazy Loading

### Implementation
- **React.lazy() with Suspense** for component-level code splitting
- Route-based code splitting for better initial load performance
- Custom `lazyWithRetry` utility for automatic retry on chunk load failures
- Preloading of critical components

### Key Files
- `src/utils/lazyImport.ts` - Utilities for lazy loading with retry and preloading
- `src/hoc/withLoading.tsx` - HOC for adding loading states to lazy components

### Usage
```typescript
import { lazyWithRetry } from '../utils/lazyImport';

const LazyComponent = lazyWithRetry(() => import('./HeavyComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

## Image Optimization

### Implementation
- Lazy loading with intersection observer
- Blur-up placeholder technique
- Responsive images with srcset
- Optimized loading strategies

### Key Components
- `src/components/OptimizedImage.tsx` - Smart image component with lazy loading

### Usage
```typescript
import OptimizedImage from './components/OptimizedImage';

function ProductImage({ src, alt }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={300}
      height={200}
      lazyLoad={true}
      objectFit="cover"
    />
  );
}
```

## Data Fetching & Caching

### Implementation
- Request deduplication
- Response caching with TTL
- Background refresh for stale data
- Optimistic updates

### Key Hooks
- `src/hooks/useOptimizedFetch.ts` - Enhanced data fetching with caching

### Usage
```typescript
const { data, isLoading, error, refetch } = useOptimizedFetch(
  async (signal) => {
    const response = await fetch('/api/data', { signal });
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },
  {
    key: 'data-fetch',
    cacheTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 60 * 1000, // 1 minute
  }
);
```

## Virtualized Lists

### Implementation
- Windowed rendering for large lists
- Dynamic height calculation
- Overscan for smooth scrolling

### Key Components
- `src/components/VirtualizedList.tsx` - High-performance list component

### Usage
```typescript
<VirtualizedList
  items={largeArray}
  itemHeight={60}
  containerHeight={400}
  overscanCount={5}
  renderItem={(item, index) => (
    <div key={item.id}>
      {item.name} - {index}
    </div>
  )}
/>
```

## Web Workers

### Implementation
- Offload heavy computations to web workers
- Message passing interface
- Worker pooling for better performance

### Key Files
- `src/workers/computation.worker.ts` - Example worker implementation
- `src/hooks/useWorker.ts` - Hook for working with web workers

### Usage
```typescript
const { postMessage, terminate } = useWorker(
  new URL('../workers/computation.worker.ts', import.meta.url)
);

// Send data to worker
postMessage({ type: 'COMPUTE', payload: data });
```

## Storage Management

### Implementation
- Encrypted storage for sensitive data
- Automatic expiration
- Namespaced keys
- Type-safe API

### Key Files
- `src/utils/storage.ts` - Storage manager with encryption

### Usage
```typescript
import { localStorageManager } from './utils/storage';

// Set data
localStorageManager.set('user', { name: 'John' }, { encrypt: true });

// Get data
const user = localStorageManager.get<{ name: string }>('user');
```

## Performance Monitoring

### Implementation
- Performance marks and measures
- Component load tracking
- Bundle analysis

### Key Utilities
- `src/utils/performance.ts` - Performance measurement utilities
- `src/hoc/withPerformance.tsx` - HOC for component performance tracking

### Usage
```typescript
import { mark, measure } from './utils/performance';

function trackComponentLoad() {
  mark('component_start');
  // Component loading logic
  mark('component_loaded');
  measure('component_load_time', 'component_start', 'component_loaded');
}
```

## Best Practices

1. **Always use code splitting** for routes and heavy components
2. **Optimize images** with proper sizing and formats
3. **Cache API responses** when appropriate
4. **Use virtualized lists** for large datasets
5. **Offload heavy computations** to web workers
6. **Monitor performance** in development and production
7. **Regularly audit** bundle size and performance

## Scripts

- `npm run build:analyze` - Build with bundle analysis
- `npm run analyze` - Start the bundle analyzer

## Dependencies

- `react` - Core React library
- `react-dom` - React DOM rendering
- `@mui/material` - UI components
- `crypto-js` - Encryption utilities
- `react-window` - Virtualized lists (if needed)

## License

MIT
