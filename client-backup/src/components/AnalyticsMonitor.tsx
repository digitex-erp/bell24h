'use client';

import React, { useEffect, useState } from 'react';
import { analytics } from '../utils/analytics';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

const AnalyticsMonitor: React.FC = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const updateEvents = () => {
      setEvents(analytics.getEvents());
    };

    // Update events every 5 seconds
    const interval = setInterval(updateEvents, 5000);
    updateEvents(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClearEvents = () => {
    analytics.clearEvents();
    setEvents([]);
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.category === filter;
  });

  const categories = Array.from(new Set(events.map(event => event.category)));

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-blue-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              Analytics Monitor ({events.length})
            </h3>
            <div className="space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
              <button
                onClick={handleClearEvents}
                className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
          </div>

          <div className={`space-y-4 ${isExpanded ? 'max-h-96 overflow-y-auto' : 'max-h-32'}`}>
            {filteredEvents.map((event, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {event.category}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {event.action}
                      </span>
                    </div>
                    {event.label && (
                      <p className="mt-1 text-sm text-gray-700">{event.label}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                  {event.value !== undefined && (
                    <div className="text-sm font-medium text-blue-600">
                      {event.value}
                    </div>
                  )}
                </div>

                {isExpanded && event.properties && (
                  <div className="mt-2">
                    <pre className="p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(event.properties, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMonitor; 