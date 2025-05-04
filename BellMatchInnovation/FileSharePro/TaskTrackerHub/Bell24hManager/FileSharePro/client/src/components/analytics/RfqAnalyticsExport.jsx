/**
 * RFQ Analytics Export Component
 * 
 * This component provides functionality to export RFQ analytics data to PDF.
 */

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateRfqAnalyticsPdf } from '../../lib/pdf-generator';

/**
 * RFQ Analytics Export Button
 * 
 * @param {Object} props - Component props
 * @param {Object} props.rfqData - RFQ data for the report
 * @param {Array} props.quotesData - Quotes data for the report
 * @param {Array} props.supplierData - Supplier data for the report
 * @param {Object} props.marketData - Market trends data for the report
 * @param {string} props.title - Title for the PDF report
 */
const RfqAnalyticsExport = ({ 
  rfqData, 
  quotesData, 
  supplierData, 
  marketData,
  title = 'RFQ Analytics Report'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  // Handle export action
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Prepare data for export
      const exportData = {
        rfq: rfqData,
        quotes: quotesData,
        supplierComparison: supplierData,
        marketTrends: marketData
      };
      
      // Generate PDF with the data
      const filename = `bell24h_rfq_analytics_${rfqData?.id || 'report'}.pdf`;
      await generateRfqAnalyticsPdf(exportData, title, filename);
      
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setIsExporting(false);
    }
  };
  
  return (
    <motion.button
      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium
        ${isExporting 
          ? 'bg-gray-200 text-gray-600 cursor-wait' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
        } transition-colors duration-200 ease-in-out shadow-sm`}
      onClick={handleExport}
      disabled={isExporting || !rfqData}
      whileHover={{ scale: isExporting ? 1 : 1.03 }}
      whileTap={{ scale: isExporting ? 1 : 0.98 }}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          <span>Export as PDF</span>
        </>
      )}
    </motion.button>
  );
};

export default RfqAnalyticsExport;