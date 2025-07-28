import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import ErrorBoundary from '../ErrorBoundary';

interface ApiStateHandlerProps {
  isLoading: boolean;
  error: Error | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  retry?: () => void;
}

export function ApiStateHandler({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
  retry,
}: ApiStateHandlerProps) {
  if (isLoading) {
    return loadingComponent || <LoadingSpinner />;
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <div className="text-red-500 mb-4">
          {error.message || 'An error occurred while loading the data.'}
        </div>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}

// Example usage:
// function MyComponent() {
//   const { data, isLoading, error, refetch } = useApi(['my-data'], '/api/my-endpoint');
//
//   return (
//     <ApiStateHandler
//       isLoading={isLoading}
//       error={error}
//       retry={refetch}
//     >
//       <div>Your component content</div>
//     </ApiStateHandler>
//   );
// }