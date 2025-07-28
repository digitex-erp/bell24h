'use client';

import React, { useEffect, useState } from 'react';
import { logger } from '../utils/logger';

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  data?: any;
  context?: string;
  userId?: string;
  sessionId: string;
}

const LogMonitor: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    const updateLogs = () => {
      setLogs(logger.getLogs());
    };

    // Update logs every 5 seconds
    const interval = setInterval(updateLogs, 5000);
    updateLogs(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.context !== filter) return false;
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    return true;
  });

  const contexts = Array.from(new Set(logs.map(log => log.context))).filter(Boolean);
  const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error'];

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'debug':
        return 'bg-gray-100 text-gray-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Log Monitor ({logs.length})
            </h3>
            <div className="space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              >
                <option value="all">All Contexts</option>
                {contexts.map(context => (
                  <option key={context} value={context}>
                    {context}
                  </option>
                ))}
              </select>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-2 py-1 text-sm border rounded"
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
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
                onClick={handleClearLogs}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </div>

          <div className={`space-y-4 ${isExpanded ? 'max-h-96 overflow-y-auto' : 'max-h-32'}`}>
            {filteredLogs.map((log, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      {log.context && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {log.context}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{log.message}</p>
                    <p className="text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                </div>

                {isExpanded && log.data && (
                  <div className="mt-2">
                    <pre className="p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
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

export default LogMonitor; 