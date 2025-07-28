import axios from 'axios';
import { getSession } from 'next-auth/react';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await getSession();
        if (session?.refreshToken) {
          // Call refresh token endpoint
          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken: session.refreshToken,
          });

          const { accessToken } = response.data;

          // Update session with new token
          // Note: This requires custom session handling
          // You might need to implement this based on your auth setup

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh token failure
        // You might want to redirect to login or handle this differently
        console.error('Token refresh failed:', refreshError);
      }
    }

    return Promise.reject(error);
  }
); 