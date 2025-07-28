import React, { useState, useEffect } from 'react';
import { isTestMode } from '../../lib/api-config';
import { perplexityApi } from '../../lib/api';

/**
 * Simple test page for the Perplexity Test API
 * This allows developers to test the API endpoints separately from the main dashboard
 */
const PerplexityTestPage = () => {
  const [isUsingTestApi, setIsUsingTestApi] = useState(isTestMode());
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState('test');
  
  // Test the connection to the API
  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await perplexityApi.testApiConnection();
      setApiResponse(result);
    } catch (err) {
      console.error('API connection error:', err);
      setError('Failed to connect to the API. Make sure the test server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle between test and production API
  const toggleApiMode = () => {
    // Toggle by setting the URL parameter
    const url = new URL(window.location.href);
    
    if (!isUsingTestApi) {
      url.searchParams.set('useTestApi', 'true');
    } else {
      url.searchParams.delete('useTestApi');
    }
    
    window.history.replaceState({}, '', url.toString());
    
    // Reload the page to apply the change
    window.location.reload();
  };
  
  // Test other endpoints
  const testEndpoint = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (endpoint) {
        case 'test':
          result = await perplexityApi.testApiConnection();
          break;
        case 'analyze':
          result = await perplexityApi.analyzeText(
            'This is a test message to analyze the perplexity score.',
            'rfq',
            'rfq_classification'
          );
          break;
        case 'trends':
          result = await perplexityApi.getTemporalTrends('rfq', 'month');
          break;
        case 'competitive':
          result = await perplexityApi.getCompetitiveInsights('rfq');
          break;
        case 'segments':
          result = await perplexityApi.getMarketSegmentation('terminology');
          break;
        default:
          result = { message: 'Invalid endpoint selected' };
      }
      
      setApiResponse(result);
    } catch (err) {
      console.error(`Error calling ${endpoint} endpoint:`, err);
      setError(`Failed to call the ${endpoint} endpoint. Check the console for details.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Call the selected endpoint when it changes
  useEffect(() => {
    testEndpoint(selectedEndpoint);
  }, [selectedEndpoint]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Perplexity Test API Page</h1>
        <div className="flex items-center space-x-2">
          <span className={isUsingTestApi ? 'text-orange-500' : 'text-gray-500'}>
            {isUsingTestApi ? 'Using Test API (Port 3001)' : 'Using Production API'}
          </span>
          <button 
            onClick={toggleApiMode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isUsingTestApi ? 'Switch to Production' : 'Switch to Test API'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 mb-8 rounded">
        <p className="mb-2">
          This page allows you to test the Perplexity API endpoints without modifying the main dashboard.
          Select an endpoint to test below:
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <button 
            onClick={() => setSelectedEndpoint('test')}
            className={`px-3 py-1 rounded ${selectedEndpoint === 'test' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Test Connection
          </button>
          <button 
            onClick={() => setSelectedEndpoint('analyze')}
            className={`px-3 py-1 rounded ${selectedEndpoint === 'analyze' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Analyze Text
          </button>
          <button 
            onClick={() => setSelectedEndpoint('trends')}
            className={`px-3 py-1 rounded ${selectedEndpoint === 'trends' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Temporal Trends
          </button>
          <button 
            onClick={() => setSelectedEndpoint('competitive')}
            className={`px-3 py-1 rounded ${selectedEndpoint === 'competitive' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Competitive Insights
          </button>
          <button 
            onClick={() => setSelectedEndpoint('segments')}
            className={`px-3 py-1 rounded ${selectedEndpoint === 'segments' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Market Segments
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {apiResponse && !loading && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <div className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-4">Integration Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Make sure your test server is running: <code className="bg-gray-200 px-1 py-0.5 rounded">node src/perplexity-test-server.cjs</code></li>
          <li>Toggle between test and production APIs using the button above</li>
          <li>Use the URL parameter <code className="bg-gray-200 px-1 py-0.5 rounded">?useTestApi=true</code> to enable test mode from any page</li>
          <li>API requests will automatically be routed to the test server when in test mode</li>
        </ol>
      </div>
    </div>
  );
};

export default PerplexityTestPage;
