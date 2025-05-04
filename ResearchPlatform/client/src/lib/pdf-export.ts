/**
 * PDF Export Utilities for Bell24h Platform
 * 
 * This module provides utilities for exporting content as PDF files.
 * It supports industry trend snapshots, market reports, supplier profiles, 
 * and other exportable content from the platform.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BellSoundEffects } from './audio';

/**
 * Interface for PDF export options
 */
export interface PdfExportOptions {
  filename?: string;
  pageSize?: string;
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  addWatermark?: boolean;
  addFooter?: boolean;
  includeTimestamp?: boolean;
  includePageNumbers?: boolean;
  quality?: number;
  scale?: number;
}

/**
 * Default PDF export options
 */
const defaultOptions: PdfExportOptions = {
  filename: 'bell24h-export.pdf',
  pageSize: 'a4',
  orientation: 'portrait',
  margin: {
    top: 15,
    right: 15,
    bottom: 15,
    left: 15
  },
  addWatermark: true,
  addFooter: true,
  includeTimestamp: true,
  includePageNumbers: true,
  quality: 2,
  scale: 2
};

/**
 * Export an HTML element to PDF
 * @param element HTML element to export
 * @param options Export options
 * @returns Promise that resolves when export is complete
 */
export const exportElementToPdf = async (
  element: HTMLElement,
  options: Partial<PdfExportOptions> = {}
): Promise<void> => {
  try {
    // Merge options with defaults
    const exportOptions = { ...defaultOptions, ...options };
    
    // Initialize jsPDF
    const pdf = new jsPDF({
      orientation: exportOptions.orientation,
      unit: 'mm',
      format: exportOptions.pageSize
    });
    
    // Capture HTML content using html2canvas
    const canvas = await html2canvas(element, {
      scale: exportOptions.scale,
      useCORS: true,
      logging: false
    });
    
    // Calculate dimensions
    const imgData = canvas.toDataURL('image/jpeg', exportOptions.quality! / 100);
    const imgWidth = pdf.internal.pageSize.getWidth() - 
                    (exportOptions.margin!.left + exportOptions.margin!.right);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image to PDF
    pdf.addImage(
      imgData, 
      'JPEG', 
      exportOptions.margin!.left, 
      exportOptions.margin!.top, 
      imgWidth, 
      imgHeight
    );
    
    // Add watermark if specified
    if (exportOptions.addWatermark) {
      const textSize = 14;
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(textSize);
      pdf.setFont('helvetica', 'italic');
      
      // Rotate and position the watermark
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Instead of using pdf.translate and pdf.rotate which are not available in some jsPDF versions,
      // we'll use a simpler approach to add a watermark
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(textSize);
      pdf.setFont('helvetica', 'italic');
      
      // Add watermark text
      pdf.text('Bell24h.com', pageWidth / 2, pageHeight / 2, { 
        align: 'center',
        angle: -45
      });
    }
    
    // Add footer if specified
    if (exportOptions.addFooter) {
      const footerFontSize = 8;
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(footerFontSize);
      pdf.setFont('helvetica', 'normal');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add timestamp if specified
      if (exportOptions.includeTimestamp) {
        const timestamp = new Date().toLocaleString();
        pdf.text(
          `Generated on ${timestamp}`, 
          pageWidth / 2, 
          pageHeight - exportOptions.margin!.bottom + 5, 
          { align: 'center' }
        );
      }
      
      // Add page number if specified
      if (exportOptions.includePageNumbers) {
        pdf.text(
          'Page 1',
          pageWidth - exportOptions.margin!.right, 
          pageHeight - exportOptions.margin!.bottom + 5, 
          { align: 'right' }
        );
      }
      
      // Add copyright notice
      pdf.text(
        '© Bell24h Marketplace',
        exportOptions.margin!.left,
        pageHeight - exportOptions.margin!.bottom + 5,
        { align: 'left' }
      );
    }
    
    // Save the PDF
    pdf.save(exportOptions.filename);
    
    // Play success sound
    BellSoundEffects.success();
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return Promise.reject(error);
  }
};

/**
 * Export an industry trend snapshot to PDF
 * @param snapshotId ID of the snapshot to export
 * @param element HTML element containing the snapshot content
 * @param options Export options
 * @returns Promise that resolves when export is complete
 */
export const exportTrendSnapshotToPdf = async (
  snapshotId: number,
  element: HTMLElement,
  options: Partial<PdfExportOptions> = {}
): Promise<void> => {
  try {
    // Set snapshot-specific options
    const snapshotOptions: Partial<PdfExportOptions> = {
      ...options,
      filename: options.filename || `bell24h-industry-trend-${snapshotId}.pdf`
    };
    
    // Export the snapshot
    return exportElementToPdf(element, snapshotOptions);
  } catch (error) {
    console.error('Error exporting trend snapshot:', error);
    return Promise.reject(error);
  }
};

/**
 * Export data to CSV format
 * @param data Array of data objects to export
 * @param headers Map of field names to display names
 * @param filename Filename for the exported CSV
 * @returns void
 */
export const exportDataToCsv = (
  data: any[],
  headers: Record<string, string>,
  filename: string = 'bell24h-export.csv'
): void => {
  try {
    if (!data || !data.length) {
      console.error('No data to export');
      return;
    }
    
    // Create CSV header row
    const headerRow = Object.values(headers).join(',');
    
    // Create CSV content rows
    const rows = data.map(item => {
      return Object.keys(headers)
        .map(key => {
          // Handle values that need quoting (contain commas, quotes, or newlines)
          let value = item[key];
          if (value === null || value === undefined) {
            value = '';
          } else {
            value = String(value);
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              // Escape quotes and wrap in quotes
              value = '"' + value.replace(/"/g, '""') + '"';
            }
          }
          return value;
        })
        .join(',');
    });
    
    // Combine header and rows
    const csvContent = [headerRow, ...rows].join('\n');
    
    // Create a blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    
    // Hide the link
    link.style.visibility = 'hidden';
    
    // Add the link to the document
    document.body.appendChild(link);
    
    // Click the link to download the file
    link.click();
    
    // Clean up by removing the link and revoking the URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Play success sound
    BellSoundEffects.success();
  } catch (error) {
    console.error('Error exporting CSV:', error);
  }
};

/**
 * Export trend snapshot data to CSV
 * @param snapshot Trend snapshot data
 * @param filename Filename for the exported CSV
 * @returns void
 */
export const exportTrendSnapshotToCsv = (
  snapshot: any,
  filename: string = 'bell24h-trend-snapshot.csv'
): void => {
  try {
    if (!snapshot) {
      console.error('No snapshot data to export');
      return;
    }
    
    // Convert snapshot format to rows for CSV export
    const data = [];
    
    // Basic snapshot info
    data.push({
      type: 'Industry',
      name: snapshot.industry,
      value: '',
      description: ''
    });
    
    if (snapshot.region) {
      data.push({
        type: 'Region',
        name: snapshot.region,
        value: '',
        description: ''
      });
    }
    
    data.push({
      type: 'Summary',
      name: '',
      value: '',
      description: snapshot.summary
    });
    
    // Market size data
    data.push({
      type: 'Market Size',
      name: 'Current Size',
      value: snapshot.marketSizeData.currentSize,
      description: ''
    });
    
    data.push({
      type: 'Market Size',
      name: 'Projected Growth',
      value: snapshot.marketSizeData.projectedGrowth,
      description: ''
    });
    
    data.push({
      type: 'Market Size',
      name: 'CAGR',
      value: snapshot.marketSizeData.cagr,
      description: ''
    });
    
    // Key trends
    snapshot.keyTrends.forEach((trend: any) => {
      data.push({
        type: 'Key Trend',
        name: trend.title,
        value: trend.impact,
        description: trend.description
      });
    });
    
    // Top players
    snapshot.topPlayers.forEach((player: any) => {
      data.push({
        type: 'Top Player',
        name: player.name,
        value: player.marketShare || '',
        description: player.strengthAreas.join(', ')
      });
    });
    
    // Emerging technologies
    snapshot.emergingTechnologies.forEach((tech: any) => {
      data.push({
        type: 'Technology',
        name: tech.name,
        value: `${tech.adoptionStage}, Impact: ${tech.potentialImpact}`,
        description: tech.description
      });
    });
    
    // Regional insights
    Object.entries(snapshot.regionalInsights).forEach(([region, insight]) => {
      data.push({
        type: 'Regional Insight',
        name: region,
        value: '',
        description: insight
      });
    });
    
    // Challenges and opportunities
    snapshot.challenges.forEach((challenge: string) => {
      data.push({
        type: 'Challenge',
        name: '',
        value: '',
        description: challenge
      });
    });
    
    snapshot.opportunities.forEach((opportunity: string) => {
      data.push({
        type: 'Opportunity',
        name: '',
        value: '',
        description: opportunity
      });
    });
    
    // Define headers for CSV
    const headers = {
      type: 'Category',
      name: 'Name',
      value: 'Value',
      description: 'Description'
    };
    
    // Export the data to CSV
    exportDataToCsv(data, headers, filename);
  } catch (error) {
    console.error('Error exporting trend snapshot to CSV:', error);
  }
};

/**
 * Create a data export menu for industry trend snapshots
 * @param snapshot Snapshot data object
 * @param elementRef Reference to the HTML element containing the snapshot
 * @returns Object with export functions
 */
export const useSnapshotExport = (snapshot: any, elementRef: React.RefObject<HTMLElement>) => {
  const exportAsPdf = async (options: Partial<PdfExportOptions> = {}) => {
    if (elementRef.current && snapshot) {
      await exportTrendSnapshotToPdf(
        snapshot.id, 
        elementRef.current, 
        {
          filename: `bell24h-${snapshot.industry.toLowerCase().replace(/\s+/g, '-')}-trend.pdf`,
          ...options
        }
      );
    }
  };
  
  const exportAsCsv = () => {
    if (snapshot) {
      exportTrendSnapshotToCsv(
        snapshot,
        `bell24h-${snapshot.industry.toLowerCase().replace(/\s+/g, '-')}-trend.csv`
      );
    }
  };
  
  return {
    exportAsPdf,
    exportAsCsv
  };
};

export default {
  exportElementToPdf,
  exportTrendSnapshotToPdf,
  exportDataToCsv,
  exportTrendSnapshotToCsv,
  useSnapshotExport
};