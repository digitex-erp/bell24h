/**
 * Utility functions for the Bell24H server
 */

/**
 * Custom logging function with level support and timestamp formatting
 */
export function log(message: string, level: 'info' | 'error' | 'warn' | 'debug' = 'info'): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${message}`);
      break;
    case 'debug':
      if (process.env.NODE_ENV !== 'production') {
        console.log(`${prefix} ${message}`);
      }
      break;
    case 'info':
    default:
      console.log(`${prefix} ${message}`);
      break;
  }
}

/**
 * Safely stringify an object for logging
 * Handles circular references and trims long strings
 */
export function safeStringify(obj: any, maxLength: number = 1000): string {
  try {
    // Use a replacer to handle circular references
    const cache: any[] = [];
    const result = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.includes(value)) {
          return '[Circular]';
        }
        cache.push(value);
      }
      return value;
    });
    
    if (result.length > maxLength) {
      return result.substring(0, maxLength) + '…';
    }
    
    return result;
  } catch (err) {
    return `[Error stringifying object: ${err}]`;
  }
}

/**
 * Format an error for logging or API response
 */
export function formatError(err: any): { status: number; message: string; details?: any } {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = process.env.NODE_ENV !== 'production' ? err.stack : undefined;
  
  return { status, message, details };
}

/**
 * Measure execution time of an async function
 */
export async function measureExecutionTime<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  return [result, duration];
}
