import React, { useState, useEffect } from 'react';

interface HealthCheckProps {
  showDetails?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface HealthData {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  host: {
    hostname: string;
    platform: string;
  };
  database?: {
    status: 'connected' | 'error' | 'not_configured';
    type?: string;
    version?: string;
    message?: string;
  };
}

/**
 * HealthCheckStatus Component
 * 
 * Displays the current health status of the Bell24H platform,
 * including database connectivity and server status.
 */
const HealthCheckStatus: React.FC<HealthCheckProps> = ({ 
  showDetails = false,
  refreshInterval = 60000 // default to 1 minute
}) => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health-check');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      console.error('Health check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check system health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchHealthData();
    
    // Set up interval for periodic checks
    const intervalId = setInterval(fetchHealthData, refreshInterval);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Format uptime to readable string
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ok':
        return 'bg-green-500';
      case 'connected':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'not_configured':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-2 text-sm text-gray-500">
        Checking system health...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (!health) {
    return (
      <div className="p-2 text-sm text-gray-500">
        Health status unavailable
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3">
      <div className="flex items-center mb-2">
        <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(health.status)}`}></div>
        <h3 className="text-sm font-medium">System Status: {health.status.toUpperCase()}</h3>
        <button 
          onClick={fetchHealthData}
          className="ml-auto text-xs text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>
      
      {health.database && (
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(health.database.status)}`}></div>
          <span>Database: {health.database.status}</span>
          {health.database.version && (
            <span className="ml-1 text-gray-400">{health.database.type}</span>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        Uptime: {formatUptime(health.uptime)}
      </div>
      
      {showDetails && (
        <div className="mt-3 pt-2 border-t border-gray-100 text-xs">
          <div className="text-gray-500">
            <span className="font-medium">Last Updated:</span>{' '}
            {new Date(health.timestamp).toLocaleTimeString()}
          </div>
          <div className="text-gray-500">
            <span className="font-medium">Host:</span>{' '}
            {health.host.hostname} ({health.host.platform})
          </div>
          {health.database?.message && (
            <div className="text-gray-500">
              <span className="font-medium">DB Message:</span>{' '}
              {health.database.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthCheckStatus;
