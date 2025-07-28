/**
 * Enhanced WebSocket Logger
 * 
 * Provides consistent and structured logging for the WebSocket server
 * with support for different log levels, timestamps, and optional context.
 */

import fs from 'fs';
import path from 'path';
import { createLogDir } from '../utils/file-utils';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  NONE = 4
}

// Current log level (can be changed at runtime)
let currentLogLevel = LogLevel.INFO;

// Log file path
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'websocket.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'websocket-error.log');

// Create log directory if it doesn't exist
createLogDir(LOG_DIR);

/**
 * Set the current log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
  logInfo(`Log level set to ${LogLevel[level]}`);
}

/**
 * Log a debug message
 */
export function logDebug(message: string, data?: any): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    log('DEBUG', message, data);
  }
}

/**
 * Log an info message
 */
export function logInfo(message: string, data?: any): void {
  if (currentLogLevel <= LogLevel.INFO) {
    log('INFO', message, data);
  }
}

/**
 * Log a warning message
 */
export function logWarning(message: string, data?: any): void {
  if (currentLogLevel <= LogLevel.WARNING) {
    log('WARNING', message, data);
  }
}

/**
 * Log an error message
 */
export function logError(message: string, error?: any): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    log('ERROR', message, error);
    
    // Also log to error-specific file
    const timestamp = new Date().toISOString();
    let errorMessage = `[${timestamp}] [ERROR] ${message}`;
    
    if (error) {
      if (error instanceof Error) {
        errorMessage += `\nStack: ${error.stack || 'No stack trace available'}`;
      } else {
        errorMessage += `\nError: ${JSON.stringify(error, null, 2)}`;
      }
    }
    
    // Append to error log file
    fs.appendFileSync(ERROR_LOG_FILE, errorMessage + '\n\n');
  }
}

/**
 * Internal log function
 */
function log(level: string, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] [Bell24H WebSocket] ${message}`;
  
  // Output to console
  switch (level) {
    case 'ERROR':
      console.error(logMessage);
      break;
    case 'WARNING':
      console.warn(logMessage);
      break;
    default:
      console.log(logMessage);
  }
  
  // Add data if provided
  if (data) {
    let dataStr: string;
    
    if (data instanceof Error) {
      dataStr = `\nStack: ${data.stack || 'No stack trace available'}`;
    } else {
      try {
        dataStr = `\nData: ${JSON.stringify(data, null, 2)}`;
      } catch (error) {
        dataStr = `\nData: [Cannot serialize data]`;
      }
    }
    
    logMessage += dataStr;
    
    // Also log data to console
    if (level === 'ERROR') {
      console.error(data);
    } else if (data instanceof Error) {
      console.error(data);
    }
  }
  
  // Append to log file
  try {
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
  } catch (error) {
    console.error(`Failed to write to log file: ${error}`);
  }
}

/**
 * Get stats about the logs
 */
export function getLogStats(): { 
  logFileSize: number, 
  errorLogFileSize: number 
} {
  try {
    const logFileSize = fs.existsSync(LOG_FILE) ? fs.statSync(LOG_FILE).size : 0;
    const errorLogFileSize = fs.existsSync(ERROR_LOG_FILE) ? fs.statSync(ERROR_LOG_FILE).size : 0;
    
    return {
      logFileSize,
      errorLogFileSize
    };
  } catch (error) {
    console.error(`Failed to get log stats: ${error}`);
    return {
      logFileSize: 0,
      errorLogFileSize: 0
    };
  }
}

/**
 * Rotate log files if they exceed a certain size
 */
export function rotateLogFiles(maxSizeBytes: number = 10 * 1024 * 1024): void {
  try {
    // Rotate main log file if needed
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > maxSizeBytes) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const backupLogFile = path.join(LOG_DIR, `websocket_${timestamp}.log`);
      fs.renameSync(LOG_FILE, backupLogFile);
      logInfo(`Log file rotated to ${backupLogFile}`);
    }
    
    // Rotate error log file if needed
    if (fs.existsSync(ERROR_LOG_FILE) && fs.statSync(ERROR_LOG_FILE).size > maxSizeBytes) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const backupErrorLogFile = path.join(LOG_DIR, `websocket-error_${timestamp}.log`);
      fs.renameSync(ERROR_LOG_FILE, backupErrorLogFile);
      logInfo(`Error log file rotated to ${backupErrorLogFile}`);
    }
  } catch (error) {
    console.error(`Failed to rotate log files: ${error}`);
  }
}
