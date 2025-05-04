import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { queryClient, QueryClientProvider } from './lib/queryClient';
import './index.css';

// Create root element and render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);