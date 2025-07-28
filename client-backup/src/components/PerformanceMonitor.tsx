'use client';

import React, { useEffect, useState } from 'react';
import {
  measurePerformance,
  logPerformanceMetrics,
  measureApiPerformance,
  measurePageLoad,
  measureMemoryUsage,
  measureNetworkRequests,
} from '../utils/performance';

interface PerformanceData {
  webVitals: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  };
  pageLoad: {
    domLoadTime: number;
    totalLoadTime: number;
  };
  memory?: {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  network: Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>;
}

const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    webVitals: {},
    pageLoad: { domLoadTime: 0, totalLoadTime: 0 },
    network: [],
  });

  useEffect(() => {
    const collectMetrics = async () => {
      // Collect Web Vitals
      const webVitals = measurePerformance();
      logPerformanceMetrics(webVitals);

      // Collect Page Load metrics
      const pageLoad = measurePageLoad();

      // Collect Memory Usage
      const memory = measureMemoryUsage();

      // Collect Network Requests
      const network = measureNetworkRequests();

      setPerformanceData({
        webVitals,
        pageLoad,
        memory,
        network,
      });
    };

    collectMetrics();

    // Set up periodic collection
    const interval = setInterval(collectMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)}ms`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Web Vitals</h3>
          <div className="space-y-2">
            <p>FCP: {performanceData.webVitals.fcp ? formatTime(performanceData.webVitals.fcp) : 'N/A'}</p>
            <p>LCP: {performanceData.webVitals.lcp ? formatTime(performanceData.webVitals.lcp) : 'N/A'}</p>
            <p>FID: {performanceData.webVitals.fid ? formatTime(performanceData.webVitals.fid) : 'N/A'}</p>
            <p>CLS: {performanceData.webVitals.cls?.toFixed(3) || 'N/A'}</p>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Page Load</h3>
          <div className="space-y-2">
            <p>DOM Load: {formatTime(performanceData.pageLoad.domLoadTime)}</p>
            <p>Total Load: {formatTime(performanceData.pageLoad.totalLoadTime)}</p>
          </div>
        </div>

        {performanceData.memory && (
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Memory Usage</h3>
            <div className="space-y-2">
              <p>Total: {formatBytes(performanceData.memory.totalJSHeapSize)}</p>
              <p>Used: {formatBytes(performanceData.memory.usedJSHeapSize)}</p>
              <p>Limit: {formatBytes(performanceData.memory.jsHeapSizeLimit)}</p>
            </div>
          </div>
        )}

        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Network Requests</h3>
          <div className="max-h-40 overflow-y-auto">
            {performanceData.network.map((request, index) => (
              <div key={index} className="text-sm mb-2">
                <p className="font-medium">{request.name}</p>
                <p className="text-gray-600">
                  {request.type} • {formatTime(request.duration)} • {formatBytes(request.size)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor; 