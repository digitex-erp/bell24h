/**
 * Utility functions for data export to CSV, Excel, and other formats
 * Used by export components across the application
 */

// Define export format types
export type ExportFormat = 'csv' | 'excel' | 'json';

// Helper to convert any data object to CSV format
export const convertToCSV = (data: Record<string, any>[], columns: { header: string; key: string }[]): string => {
  if (!data || data.length === 0) return '';

  // Create the header row
  const headerRow = columns.map(col => `"${col.header}"`).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '';
      // Wrap strings in quotes and escape any quotes within
      return typeof value === 'string'
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    }).join(',');
  }).join('\n');
  
  return `${headerRow}\n${rows}`;
};

// Download a string as a file
export const downloadFile = (content: string | Blob, filename: string, type: string = 'text/csv;charset=utf-8;'): void => {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Download CSV specifically
export const downloadCSV = (csvContent: string, filename: string): void => {
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

// Convert data to Excel format and download
export const convertToExcelAndDownload = async (
  data: Record<string, any>[], 
  columns: { header: string; key: string }[], 
  filename: string,
  sheetName: string = 'Data'
): Promise<Blob> => {
  // In a real implementation, we would create a proper Excel file
  // For simplicity, we'll create a tab-separated values file that Excel can open
  let tsvContent = columns.map(col => col.header).join('\t') + '\n';
  
  // Add rows
  tsvContent += data.map(item => {
    return columns.map(col => {
      const value = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '';
      // Escape tab characters in strings
      return typeof value === 'string' ? value.replace(/\t/g, ' ') : value;
    }).join('\t');
  }).join('\n');
  
  // Create a blob with BOM for Excel to recognize UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + tsvContent], { type: 'text/tab-separated-values;charset=utf-8' });
  
  // Download the file
  downloadFile(blob, filename.endsWith('.xls') ? filename : `${filename}.xls`);
  
  return blob;
};

// Format supplier data for export
export const formatSuppliersForExport = (suppliers: any[]): any[] => {
  if (!suppliers || suppliers.length === 0) return [];
  
  return suppliers.map(supplier => ({
    id: supplier.id,
    companyName: supplier.companyName,
    location: supplier.location,
    categories: Array.isArray(supplier.categories) ? supplier.categories.join(', ') : supplier.categories,
    verified: supplier.verified ? 'Yes' : 'No',
    riskScore: supplier.riskScore,
    riskGrade: supplier.riskGrade,
    matchScore: supplier.matchScore || 'N/A',
    description: supplier.description,
  }));
};

// Format RFQ data for export
export const formatRfqsForExport = (rfqs: any[]): any[] => {
  if (!rfqs || rfqs.length === 0) return [];
  
  return rfqs.map(rfq => ({
    id: rfq.id,
    title: rfq.title,
    category: rfq.category,
    status: rfq.status,
    type: rfq.type,
    description: rfq.description,
    createdAt: rfq.createdAt ? new Date(rfq.createdAt).toISOString().split('T')[0] : 'N/A',
    deadline: rfq.deadline ? new Date(rfq.deadline).toISOString().split('T')[0] : 'N/A',
    responseCount: rfq.responseCount || 0,
    budget: rfq.budget || 'Not specified',
    quantity: rfq.quantity || 'Not specified',
  }));
};

// Share exported data via built-in sharing APIs
export const shareExportedData = async (
  data: string | Blob, 
  filename: string, 
  type: string = 'text/csv'
): Promise<boolean> => {
  try {
    // Create file object for sharing
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const file = new File([blob], filename, { type });
    
    // First try the Web Share API with files if supported
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Bell24h ${filename.split('.')[0]}`,
        text: `Exported data from Bell24h marketplace`,
      });
      return true;
    } 
    // If file sharing isn't supported, try sharing just a data URL
    else if (navigator.share) {
      // Create a temporary URL for the file
      const fileUrl = URL.createObjectURL(blob);
      
      // Create a downloadable link first to ensure the user gets the file
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename;
      link.click();
      
      // Then try to share the data via text
      await navigator.share({
        title: `Bell24h ${filename.split('.')[0]}`,
        text: `I'm sharing exported data from Bell24h marketplace.`,
      });
      
      // Clean up the temporary URL
      setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
      return true;
    } 
    // Email sharing fallback for desktop browsers without Web Share API
    else if (typeof window !== 'undefined' && window.location.protocol !== 'file:') {
      // Create a downloadable link first to ensure the user gets the file
      const downloadLink = document.createElement('a');
      
      if (data instanceof Blob) {
        // If it's a blob, create an object URL
        const blobUrl = URL.createObjectURL(data);
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
        downloadLink.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } else {
        // Otherwise create a data URL
        const dataStr = `data:${type};charset=utf-8,${encodeURIComponent(data)}`;
        downloadLink.href = dataStr;
        downloadLink.download = filename;
        downloadLink.click();
      }
      
      // Create email sharing link with pre-filled subject
      const subject = encodeURIComponent(`Bell24h ${filename.split('.')[0]}`);
      const body = encodeURIComponent(`Please find attached the exported data from Bell24h marketplace.`);
      const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
      
      // Open email client
      const emailLink = document.createElement('a');
      emailLink.href = mailtoLink;
      emailLink.target = '_blank';
      emailLink.click();
      
      return true;
    } 
    else {
      // Fallback to download if sharing is not available
      if (data instanceof Blob) {
        downloadFile(data, filename, type);
      } else {
        downloadCSV(data, filename);
      }
      return true;
    }
  } catch (error) {
    console.error('Error sharing exported data:', error);
    // Fallback to download if sharing fails
    if (data instanceof Blob) {
      downloadFile(data, filename, type);
    } else {
      downloadCSV(data, filename);
    }
    return false;
  }
};

// Format date for display in exports
export const formatExportDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime())
    ? dateObj.toISOString().split('T')[0]
    : 'Invalid date';
};

// Format currency for display in exports
export const formatExportCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return value.toString();
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(numValue);
};