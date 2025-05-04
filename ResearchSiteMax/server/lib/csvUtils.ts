/**
 * CSV Utility functions for exporting data
 */

/**
 * Convert JSON array to CSV string
 * @param jsonArray - Array of objects to convert to CSV
 * @returns CSV formatted string
 */
export function jsonToCSV(jsonArray: any[]): string {
  if (!jsonArray || jsonArray.length === 0) {
    return '';
  }

  // Extract headers from the first object
  const headers = Object.keys(jsonArray[0]);
  
  // Create CSV header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  for (const item of jsonArray) {
    const values = headers.map(header => {
      const val = item[header];
      
      // Handle different value types
      if (val === null || val === undefined) {
        return '';
      } else if (typeof val === 'object') {
        // Stringify objects/arrays and wrap in quotes
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      } else if (typeof val === 'string') {
        // Escape quotes and wrap in quotes
        return `"${val.replace(/"/g, '""')}"`;
      } else {
        // Numbers, booleans, etc.
        return String(val);
      }
    });
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Convert a complex nested JSON object to CSV
 * When object contains arrays of objects (like dashboardOverview.suppliers)
 * 
 * @param data - Complex object with nested arrays to convert
 * @returns Object with CSV strings for each data section
 */
export function complexJsonToCSV(data: any): Record<string, string> {
  const result: Record<string, string> = {};
  
  // Process each key in the data object
  for (const [key, value] of Object.entries(data)) {
    // Skip null or undefined values
    if (value === null || value === undefined) {
      continue;
    }
    
    // If value is an array of objects, convert it to CSV
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      result[key] = jsonToCSV(value);
    } 
    // If value is an object with arrays inside, process each array
    else if (typeof value === 'object' && !Array.isArray(value)) {
      const nestedResults = processNestedArrays(value, key);
      Object.assign(result, nestedResults);
    }
    // Skip simple values or empty arrays
    else {
      continue;
    }
  }
  
  return result;
}

/**
 * Process nested arrays within an object
 * @param obj - Object with potential nested arrays
 * @param prefix - Prefix for naming the CSV sections
 * @returns Object with CSV strings for each nested array
 */
function processNestedArrays(obj: any, prefix: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const sectionName = `${prefix}_${key}`;
    
    // If value is an array of objects, convert it to CSV
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      result[sectionName] = jsonToCSV(value);
    } 
    // If value is an object with potentially more nested arrays, recurse
    else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const deeperResults = processNestedArrays(value, sectionName);
      Object.assign(result, deeperResults);
    }
  }
  
  return result;
}

/**
 * Convert time series data to CSV format
 * @param data - Array of time series data points
 * @param timeField - Name of the field containing the timestamp
 * @param valueFields - Names of the fields containing values to export
 * @returns CSV formatted string
 */
export function timeSeriesDataToCSV(
  data: any[],
  timeField: string,
  valueFields: string[]
): string {
  if (!data || data.length === 0) {
    return '';
  }
  
  // Create headers
  const headers = [timeField, ...valueFields];
  const csvRows = [headers.join(',')];
  
  // Add data rows
  for (const item of data) {
    const timeValue = item[timeField];
    const formattedTime = timeValue instanceof Date 
      ? timeValue.toISOString() 
      : String(timeValue);
      
    const values = [
      `"${formattedTime}"`,
      ...valueFields.map(field => {
        const val = item[field];
        if (val === null || val === undefined) {
          return '';
        } else if (typeof val === 'object') {
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        } else if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        } else {
          return String(val);
        }
      })
    ];
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Format date range for file names
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatDateRangeForFileName(startDate: Date, endDate: Date): string {
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };
  
  return `${formatDate(startDate)}_to_${formatDate(endDate)}`;
}

/**
 * Add metadata header to CSV
 * @param csv - Original CSV string
 * @param metadata - Object containing metadata
 * @returns CSV with metadata header
 */
export function addMetadataHeader(csv: string, metadata: Record<string, any>): string {
  const metadataRows = Object.entries(metadata).map(([key, value]) => {
    const formattedValue = typeof value === 'object' 
      ? JSON.stringify(value).replace(/"/g, '""') 
      : String(value);
    return `# ${key}: "${formattedValue}"`;
  });
  
  return [...metadataRows, '', csv].join('\n');
}

/**
 * Create a ZIP archive containing multiple CSV files
 * @param files - Object mapping filenames to CSV content
 * @returns Buffer containing the ZIP archive
 */
export function createCSVArchive(files: Record<string, string>): Buffer {
  // Instead of using the archiver package, we're implementing a simple solution
  // that concatenates all CSV files with clear section separators
  
  const sections = Object.entries(files).map(([filename, content]) => {
    return [
      '='.repeat(80),
      `FILE: ${filename}`,
      '='.repeat(80),
      content
    ].join('\n');
  });
  
  const combinedCSV = sections.join('\n\n');
  
  return Buffer.from(combinedCSV, 'utf8');
}