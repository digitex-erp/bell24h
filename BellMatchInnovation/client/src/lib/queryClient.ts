import { 
  QueryClient, 
  QueryClientProvider as TanStackQueryClientProvider 
} from '@tanstack/react-query';
import React from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const QueryClientProvider: React.FC<{
  children: React.ReactNode;
  client: QueryClient;
}> = ({ children, client }) => {
  return (
    <TanStackQueryClientProvider client={client}>
      {children}
    </TanStackQueryClientProvider>
  );
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Helper function for making API requests
 * 
 * @param method - HTTP method
 * @param url - API endpoint URL
 * @param data - Optional request body data
 * @param headers - Optional custom headers
 * @returns Promise with the response
 */
export const apiRequest = async (
  method: HttpMethod,
  url: string,
  data?: any,
  headers: HeadersInit = {}
): Promise<Response> => {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
    credentials: 'include',
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  let fullUrl = url;
  if (method === 'GET' && data) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    if (queryString) {
      fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  try {
    const response = await fetch(fullUrl, config);
    
    // Handle 401 Unauthorized globally - redirect to login if needed
    if (response.status === 401) {
      // Redirect to login page or refresh token logic would go here
      console.error('Authentication required');
      // window.location.href = '/auth/login';
    }
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};