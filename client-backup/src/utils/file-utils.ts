/**
 * File utility functions for the Bell24H application
 */

import fs from 'fs';
import path from 'path';
import { logInfo, logError } from '../websocket/logger.js';

/**
 * Create directory if it doesn't exist
 */
export function createLogDir(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
}

/**
 * Delete old log files
 * @param dirPath Path to log directory
 * @param maxAgeInDays Maximum age of log files in days
 * @param filePattern Pattern to match log files
 */
export function cleanupOldLogFiles(
  dirPath: string, 
  maxAgeInDays: number = 30,
  filePattern: RegExp = /\.log$/
): void {
  try {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const files = fs.readdirSync(dirPath);
    const now = Date.now();
    const maxAgeMs = maxAgeInDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      if (filePattern.test(file)) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        const fileAgeMs = now - stats.mtimeMs;

        if (fileAgeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} old log files from ${dirPath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up old log files in ${dirPath}:`, error);
  }
}

/**
 * Get size of a directory in bytes (recursive)
 */
export function getDirSize(dirPath: string): number {
  try {
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    let totalSize = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        totalSize += getDirSize(filePath);
      }
    }

    return totalSize;
  } catch (error) {
    console.error(`Error calculating directory size for ${dirPath}:`, error);
    return 0;
  }
}

/**
 * Ensure a file exists, creating it with default content if not
 */
export function ensureFileExists(filePath: string, defaultContent: string = ''): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, defaultContent);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error ensuring file ${filePath} exists:`, error);
    return false;
  }
}

/**
 * Read JSON from file
 */
export function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    return defaultValue;
  }
}

/**
 * Write JSON to file
 */
export function writeJsonFile(filePath: string, data: any): boolean {
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    return false;
  }
}
