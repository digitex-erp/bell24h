/**
 * PDF Generator Utility
 * 
 * This module provides functions to generate PDF reports from RFQ analytics data.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart } from 'chart.js/auto';

/**
 * Generate a PDF report from RFQ analytics data
 * 
 * @param {Object} data - The RFQ analytics data
 * @param {string} title - The title of the report
 * @param {string} filename - The filename to save the PDF as
 * @param {boolean} skipCharts - Whether to skip chart generation (auto-detected if not provided)
 * @returns {Object} - The generated PDF document object
 */
export const generateRfqAnalyticsPdf = (data, title = 'RFQ Analytics Report', filename = 'rfq-analytics-report.pdf', skipCharts = undefined) => {
  // Auto-detect if we should skip charts based on environment
  if (skipCharts === undefined) {
    // Skip charts in Node.js environment (no browser/DOM)
    skipCharts = typeof window === 'undefined' || typeof document === 'undefined';
  }
  
  console.log(`Generating PDF with charts ${skipCharts ? 'disabled' : 'enabled'}`);
  
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add report title
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80); // Dark blue color
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Add generation timestamp
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128); // Gray color
  const timestamp = new Date().toLocaleString();
  doc.text(`Generated on: ${timestamp}`, pageWidth / 2, 30, { align: 'center' });
  
  // Add Bell24h branding
  doc.setFontSize(12);
  doc.setTextColor(52, 152, 219); // Bell24h blue
  doc.text('Bell24h RFQ Marketplace', pageWidth / 2, 40, { align: 'center' });
  
  // Add section divider
  doc.setDrawColor(230, 230, 230); // Light gray
  doc.line(20, 45, pageWidth - 20, 45);
  
  // Add RFQ summary if available
  if (data.rfq) {
    addRfqSummary(doc, data.rfq, 50);
  }
  
  // Add quote analytics if available
  if (data.quotes && data.quotes.length > 0) {
    const yPos = data.rfq ? 130 : 50;
    addQuotesAnalysis(doc, data.quotes, yPos);
  }
  
  // Add supplier comparison if available
  if (data.supplierComparison) {
    // Check if we need a new page
    if ((data.rfq && data.quotes && data.quotes.length > 3) || doc.internal.getCurrentPageInfo().pageNumber > 1) {
      doc.addPage();
      // Add title to new page
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Supplier Comparison', pageWidth / 2, 20, { align: 'center' });
      addSupplierComparison(doc, data.supplierComparison, 30, skipCharts);
    } else {
      const yPos = data.quotes && data.quotes.length > 0 ? 200 : (data.rfq ? 130 : 50);
      addSupplierComparison(doc, data.supplierComparison, yPos, skipCharts);
    }
  }
  
  // Add market trends if available
  if (data.marketTrends) {
    // Add to a new page
    doc.addPage();
    // Add title to new page
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Market Trends Analysis', pageWidth / 2, 20, { align: 'center' });
    addMarketTrends(doc, data.marketTrends, 30, skipCharts);
  }
  
  // Add footer to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Bell24h RFQ Analytics Report - Confidential',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10);
  }
  
  // Save or return the PDF
  if (filename) {
    doc.save(filename);
  }
  
  return doc;
};

/**
 * Add RFQ summary to the PDF
 * 
 * @param {Object} doc - The jsPDF document
 * @param {Object} rfq - The RFQ data
 * @param {number} yPos - The vertical position to start adding content
 */
const addRfqSummary = (doc, rfq, yPos) => {
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text('RFQ Summary', 20, yPos);
  
  // Add RFQ details table
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Field', 'Value']],
    body: [
      ['RFQ ID', rfq.id?.toString() || 'N/A'],
      ['Title', rfq.title || 'N/A'],
      ['Status', rfq.status || 'N/A'],
      ['Created', rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : 'N/A'],
      ['Buyer', rfq.buyerName || 'N/A'],
      ['Category', rfq.category || 'N/A'],
      ['Quote Count', rfq.quoteCount?.toString() || '0'],
      ['Deadline', rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { left: 20, right: 20 }
  });
};

/**
 * Add quotes analysis to the PDF
 * 
 * @param {Object} doc - The jsPDF document
 * @param {Array} quotes - The quotes data
 * @param {number} yPos - The vertical position to start adding content
 */
const addQuotesAnalysis = (doc, quotes, yPos) => {
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text('Quotes Analysis', 20, yPos);
  
  // Calculate price statistics
  const prices = quotes.map(q => q.price);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Calculate delivery statistics
  const deliveryDays = quotes.filter(q => q.deliveryDays).map(q => q.deliveryDays);
  const avgDelivery = deliveryDays.length > 0 
    ? deliveryDays.reduce((sum, days) => sum + days, 0) / deliveryDays.length 
    : 'N/A';
  const minDelivery = deliveryDays.length > 0 ? Math.min(...deliveryDays) : 'N/A';
  const maxDelivery = deliveryDays.length > 0 ? Math.max(...deliveryDays) : 'N/A';
  
  // Add pricing statistics table
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Metric', 'Price (₹)', 'Delivery Days']],
    body: [
      ['Average', avgPrice.toFixed(2), avgDelivery !== 'N/A' ? avgDelivery.toFixed(0) : 'N/A'],
      ['Minimum', minPrice.toFixed(2), minDelivery !== 'N/A' ? minDelivery : 'N/A'],
      ['Maximum', maxPrice.toFixed(2), maxDelivery !== 'N/A' ? maxDelivery : 'N/A'],
      ['Range', (maxPrice - minPrice).toFixed(2), 
        minDelivery !== 'N/A' && maxDelivery !== 'N/A' ? (maxDelivery - minDelivery) : 'N/A']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { left: 20, right: 20 }
  });
  
  // Quote distribution table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Supplier', 'Price (₹)', 'Delivery Days', 'Status']],
    body: quotes.map(quote => [
      quote.supplierName || `Supplier ${quote.supplierId}`,
      quote.price.toFixed(2),
      quote.deliveryDays || 'N/A',
      quote.status || 'Submitted'
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { left: 20, right: 20 }
  });
};

/**
 * Add supplier comparison to the PDF
 * 
 * @param {Object} doc - The jsPDF document
 * @param {Array} supplierData - The supplier comparison data
 * @param {number} yPos - The vertical position to start adding content
 * @param {boolean} skipCharts - Whether to skip chart generation (useful for server-side/testing)
 */
const addSupplierComparison = (doc, supplierData, yPos, skipCharts = false) => {
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text('Supplier Comparison', 20, yPos);
  
  // Prepare data for table
  const tableHead = ['Supplier', 'Avg. Price', 'Avg. Delivery', 'Quote Count', 'Acceptance Rate'];
  const tableBody = supplierData.map(supplier => [
    supplier.name || `Supplier ${supplier.id}`,
    supplier.avgPrice ? `₹${supplier.avgPrice.toFixed(2)}` : 'N/A',
    supplier.avgDeliveryDays ? `${supplier.avgDeliveryDays.toFixed(0)} days` : 'N/A',
    supplier.quoteCount?.toString() || '0',
    supplier.acceptanceRate ? `${(supplier.acceptanceRate * 100).toFixed(1)}%` : 'N/A'
  ]);
  
  // Add supplier comparison table
  autoTable(doc, {
    startY: yPos + 5,
    head: [tableHead],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { left: 20, right: 20 }
  });
  
  // Add chart to PDF if data is available and not skipping charts
  if (supplierData.length > 0 && !skipCharts) {
    try {
      // Canvas to generate chart image
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 250;
      document.body.appendChild(canvas);
      
      // Create chart
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: supplierData.map(s => s.name || `Supplier ${s.id}`),
          datasets: [
            {
              label: 'Avg. Price (₹)',
              data: supplierData.map(s => s.avgPrice || 0),
              backgroundColor: 'rgba(41, 128, 185, 0.6)',
              borderColor: 'rgba(41, 128, 185, 1)',
              borderWidth: 1
            },
            {
              label: 'Acceptance Rate (%)',
              data: supplierData.map(s => (s.acceptanceRate || 0) * 100),
              backgroundColor: 'rgba(46, 204, 113, 0.6)',
              borderColor: 'rgba(46, 204, 113, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Add chart to PDF
      const imageData = canvas.toDataURL('image/png');
      doc.addImage(imageData, 'PNG', 20, doc.lastAutoTable.finalY + 10, 170, 85);
      
      // Remove canvas from DOM
      document.body.removeChild(canvas);
    } catch (error) {
      console.error('Failed to create chart:', error.message);
    }
  }
};

/**
 * Add market trends analysis to the PDF
 * 
 * @param {Object} doc - The jsPDF document
 * @param {Object} marketData - The market trends data
 * @param {number} yPos - The vertical position to start adding content
 * @param {boolean} skipCharts - Whether to skip chart generation (useful for server-side/testing)
 */
const addMarketTrends = (doc, marketData, yPos, skipCharts = false) => {
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text('Market Trends Analysis', 20, yPos);
  
  // Add market overview text
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Market Overview:', 20, yPos + 10);
  doc.setFontSize(9);
  
  const marketOverview = marketData.overview || 
    'This section provides an analysis of market trends related to this RFQ category, ' +
    'including pricing trends, supplier availability, and delivery timeframes.';
  
  const textLines = doc.splitTextToSize(marketOverview, doc.internal.pageSize.getWidth() - 40);
  doc.text(textLines, 20, yPos + 16);
  
  // Add price trends if available
  if (marketData.priceTrends) {
    // Price trends table
    const trendsTableHead = ['Period', 'Avg. Price', 'Change (%)', 'Trend'];
    const trendsTableBody = marketData.priceTrends.map(trend => [
      trend.period,
      `₹${trend.avgPrice.toFixed(2)}`,
      `${trend.change > 0 ? '+' : ''}${(trend.change * 100).toFixed(1)}%`,
      trend.change > 0 ? '↑' : (trend.change < 0 ? '↓' : '→')
    ]);
    
    autoTable(doc, {
      startY: yPos + 16 + (textLines.length * 3.5),
      head: [trendsTableHead],
      body: trendsTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { left: 20, right: 20 }
    });
    
    // Add chart if not skipping charts
    if (!skipCharts) {
      try {
        // Canvas to generate chart image
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 250;
        document.body.appendChild(canvas);
        
        // Create chart
        new Chart(canvas, {
          type: 'line',
          data: {
            labels: marketData.priceTrends.map(t => t.period),
            datasets: [
              {
                label: 'Avg. Price (₹)',
                data: marketData.priceTrends.map(t => t.avgPrice),
                backgroundColor: 'rgba(41, 128, 185, 0.1)',
                borderColor: 'rgba(41, 128, 185, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            scales: {
              y: {
                beginAtZero: false
              }
            }
          }
        });
        
        // Add chart to PDF
        const imageData = canvas.toDataURL('image/png');
        doc.addImage(imageData, 'PNG', 20, doc.lastAutoTable.finalY + 10, 170, 85);
        
        // Remove canvas from DOM
        document.body.removeChild(canvas);
      } catch (error) {
        console.error('Failed to create market trends chart:', error.message);
      }
    }
  }
  
  // Add market insights if available
  if (marketData.insights && marketData.insights.length > 0) {
    const insightsY = marketData.priceTrends 
      ? doc.lastAutoTable.finalY + 100 
      : yPos + 16 + (textLines.length * 3.5);
    
    // Check if we need a new page
    if (insightsY > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Market Insights', 20, 20);
      addMarketInsights(doc, marketData.insights, 30);
    } else {
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text('Market Insights', 20, insightsY);
      addMarketInsights(doc, marketData.insights, insightsY + 10);
    }
  }
};

/**
 * Add market insights to the PDF
 * 
 * @param {Object} doc - The jsPDF document
 * @param {Array} insights - The market insights data
 * @param {number} yPos - The vertical position to start adding content
 */
const addMarketInsights = (doc, insights, yPos) => {
  let currentY = yPos;
  
  insights.forEach((insight, index) => {
    doc.setFontSize(10);
    doc.setTextColor(41, 128, 185);
    doc.text(`${index + 1}. ${insight.title || 'Insight'}`, 20, currentY);
    
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const textLines = doc.splitTextToSize(insight.text || '', doc.internal.pageSize.getWidth() - 40);
    doc.text(textLines, 20, currentY + 6);
    
    currentY += 6 + (textLines.length * 3.5) + 5;
  });
};

export default generateRfqAnalyticsPdf;