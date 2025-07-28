'use client';

import React, { useEffect, useState } from 'react';
import { stateTracker } from '../utils/stateTracker';

interface StateChange {
  component: string;
  previousState: any;
  newState: any;
  timestamp: number;
  action?: string;
  userId?: string;
  sessionId: string;
}

const StateMonitor: React.FC = () => {
  const [changes, setChanges] = useState<StateChange[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    const updateChanges = () => {
      setChanges(stateTracker.getChanges());
    };

    // Update changes every 5 seconds
    const interval = setInterval(updateChanges, 5000);
    updateChanges(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClearChanges = () => {
    stateTracker.clearChanges();
    setChanges([]);
  };

  const filteredChanges = changes.filter(change => {
    if (filter !== 'all' && change.component !== filter) return false;
    if (actionFilter !== 'all' && change.action !== actionFilter) return false;
    return true;
  });

  const components = Array.from(new Set(changes.map(change => change.component)));
  const actions = Array.from(new Set(changes.map(change => change.action).filter(Boolean)));

  const getDiff = (prev: any, next: any) => {
    const diff: Record<string, { from: any; to: any }> = {};
    
    const compare = (obj1: any, obj2: any, path: string = '') => {
      if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        if (obj1 !== obj2) {
          diff[path || 'value'] = { from: obj1, to: obj2 };
        }
        return;
      }

      const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
      keys.forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        compare(obj1[key], obj2[key], newPath);
      });
    };

    compare(prev, next);
    return diff;
  };

  if (changes.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-purple-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-800">
              State Monitor ({changes.length})
            </h3>
            <div className="space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              >
                <option value="all">All Components</option>
                {components.map(component => (
                  <option key={component} value={component}>
                    {component}
                  </option>
                ))}
              </select>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              >
                <option value="all">All Actions</option>
                {actions.map(action => (
                  <option key={action} value={action}>
                    {action}
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
                onClick={handleClearChanges}
                className="px-2 py-1 text-sm text-purple-600 hover:text-purple-800"
              >
                Clear
              </button>
            </div>
          </div>

          <div className={`space-y-4 ${isExpanded ? 'max-h-96 overflow-y-auto' : 'max-h-32'}`}>
            {filteredChanges.map((change, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                        {change.component}
                      </span>
                      {change.action && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {change.action}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatTimestamp(change.timestamp)}
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">State Changes:</p>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {Object.entries(getDiff(change.previousState, change.newState)).map(([key, { from, to }]) => (
                          <div key={key} className="mb-1">
                            <span className="font-medium">{key}:</span>{' '}
                            <span className="text-red-600">{JSON.stringify(from)}</span>
                            {' → '}
                            <span className="text-green-600">{JSON.stringify(to)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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

export default StateMonitor; 