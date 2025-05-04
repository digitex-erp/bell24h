import { promises as fs } from 'fs';
import path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import OpenAI from 'openai';
import documentProcessingService from './documentProcessingService';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * PDF Report Service
 * 
 * This service generates PDF reports for various procurement-related data.
 * It uses OpenAI's GPT-4 to generate report content and formats it as HTML,
 * then converts the HTML to PDF.
 */
export class PDFReportService {
  private tempDir: string;
  
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'bell24h-reports');
    this.ensureTempDir();
  }
  
  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error: any) {
      console.error('Error creating temp directory:', error.message);
    }
  }
  
  /**
   * Generate a PDF report using AI-processed data
   * 
   * @param data - The data to include in the report
   * @param reportType - Type of report to generate
   * @returns Path to the generated PDF file
   */
  async generateReport(data: any, reportType: string): Promise<string> {
    try {
      // Generate HTML content for the report using AI
      const html = await this.generateReportHtml(data, reportType);
      
      // Generate a unique filename
      const filename = `${reportType.toLowerCase().replace(/\s+/g, '-')}-${uuidv4()}.pdf`;
      const outputPath = path.join(this.tempDir, filename);
      
      // For the time being, we'll just save the HTML as a placeholder
      // In a real implementation, we would convert HTML to PDF
      await fs.writeFile(outputPath.replace('.pdf', '.html'), html);
      
      // Here we would normally use a PDF conversion library, but for now
      // we'll just return the HTML file path
      return outputPath.replace('.pdf', '.html');
    } catch (error: any) {
      console.error('Error generating PDF report:', error.message);
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
  }
  
  /**
   * Use AI to generate structured HTML for the report
   * 
   * @param data - Data to include in the report
   * @param reportType - Type of report to generate
   * @returns HTML content for the report
   */
  private async generateReportHtml(data: any, reportType: string): Promise<string> {
    try {
      const promptData = JSON.stringify(data, null, 2);
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional report generator. You will be provided with data for a ${reportType} report. 
            Your task is to create a visually appealing HTML report that includes all the key information.
            The HTML should use modern styling (with inline CSS) and should be structured well with sections, tables, and visual elements.
            Include a header with the Bell24h logo and the current date.
            Include a footer with page numbers and a generated timestamp.
            Make sure the HTML is complete and standalone (include all CSS inline).`
          },
          {
            role: "user",
            content: `Please generate a complete HTML report for this ${reportType} data:\n\n${promptData}`
          }
        ],
        max_tokens: 4000,
      });
      
      return response.choices[0].message.content || this.getDefaultReportTemplate(data, reportType);
    } catch (error: any) {
      console.error('Error generating report HTML:', error.message);
      return this.getDefaultReportTemplate(data, reportType);
    }
  }
  
  /**
   * Get a default report template as a fallback
   * 
   * @param data - Data to include in the report
   * @param reportType - Type of report
   * @returns Basic HTML template for the report
   */
  private getDefaultReportTemplate(data: any, reportType: string): string {
    const currentDate = new Date().toLocaleDateString();
    const jsonData = JSON.stringify(data, null, 2);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reportType} Report - Bell24h</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          line-height: 1.6;
        }
        header {
          border-bottom: 1px solid #ccc;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }
        h1 {
          color: #2c3e50;
        }
        .report-date {
          color: #7f8c8d;
          font-size: 0.9em;
        }
        .report-content {
          margin: 20px 0;
        }
        pre {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
        }
        footer {
          margin-top: 50px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          font-size: 0.8em;
          color: #7f8c8d;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>${reportType} Report</h1>
        <div class="report-date">Generated on: ${currentDate}</div>
      </header>
      
      <div class="report-content">
        <h2>Report Data</h2>
        <pre>${jsonData}</pre>
      </div>
      
      <footer>
        <p>This report was generated by Bell24h Procurement Platform.</p>
        <p>© ${new Date().getFullYear()} Bell24h - All rights reserved.</p>
      </footer>
    </body>
    </html>
    `;
  }
  
  /**
   * Generate a supplier performance report
   * 
   * @param supplierId - ID of the supplier
   * @returns Path to the generated report
   */
  async generateSupplierPerformanceReport(supplierId: string): Promise<string> {
    try {
      // In a real implementation, we would fetch supplier data from the database
      // For now, we'll use a placeholder
      const supplierData = {
        id: supplierId,
        name: `Supplier ${supplierId}`,
        performanceMetrics: {
          deliveryOnTime: 85,
          qualityScore: 92,
          communicationScore: 88,
          priceCompetitiveness: 78,
          overall: 85.75
        },
        historicalPerformance: [
          { month: 'Jan', score: 82 },
          { month: 'Feb', score: 84 },
          { month: 'Mar', score: 86 },
          { month: 'Apr', score: 85 },
          { month: 'May', score: 88 }
        ],
        strengths: ['Quality control', 'Responsive communication'],
        weaknesses: ['Price negotiation', 'Delivery delays'],
        recommendations: [
          'Negotiate better delivery terms',
          'Consider for high-quality requirements'
        ]
      };
      
      return this.generateReport(supplierData, 'Supplier Performance');
    } catch (error: any) {
      console.error('Error generating supplier performance report:', error.message);
      throw new Error(`Failed to generate supplier performance report: ${error.message}`);
    }
  }
  
  /**
   * Generate an RFQ match history report
   * 
   * @param rfqId - ID of the RFQ
   * @returns Path to the generated report
   */
  async generateRfqMatchHistoryReport(rfqId: string): Promise<string> {
    try {
      // In a real implementation, we would fetch RFQ match data from the database
      // For now, we'll use a placeholder
      const rfqMatchData = {
        rfqId,
        rfqTitle: `RFQ #${rfqId}`,
        issuedDate: new Date().toISOString(),
        matches: [
          {
            supplierId: 's001',
            supplierName: 'Acme Supplies',
            matchScore: 92,
            status: 'Accepted',
            bidAmount: 15000,
            bidDate: new Date().toISOString()
          },
          {
            supplierId: 's002',
            supplierName: 'Best Components',
            matchScore: 88,
            status: 'Rejected',
            bidAmount: 16500,
            bidDate: new Date().toISOString()
          },
          {
            supplierId: 's003',
            supplierName: 'Quality Parts',
            matchScore: 85,
            status: 'Pending',
            bidAmount: 14800,
            bidDate: new Date().toISOString()
          }
        ],
        matchAnalysis: {
          averageMatchScore: 88.33,
          averageBidAmount: 15433.33,
          lowestBid: 14800,
          highestBid: 16500,
          recommendedSupplier: 'Acme Supplies'
        }
      };
      
      return this.generateReport(rfqMatchData, 'RFQ Match History');
    } catch (error: any) {
      console.error('Error generating RFQ match history report:', error.message);
      throw new Error(`Failed to generate RFQ match history report: ${error.message}`);
    }
  }
  
  /**
   * Generate a daily summary report
   * 
   * @returns Path to the generated report
   */
  async generateDailySummaryReport(): Promise<string> {
    try {
      // In a real implementation, we would fetch daily activity data from the database
      // For now, we'll use a placeholder
      const dailySummaryData = {
        date: new Date().toISOString(),
        rfqActivity: {
          newRfqs: 12,
          completedRfqs: 8,
          pendingRfqs: 24,
          totalActiveRfqs: 36
        },
        supplierActivity: {
          newSuppliers: 3,
          activeSuppliers: 42,
          topPerformingSuppliers: [
            { id: 's001', name: 'Acme Supplies', score: 92 },
            { id: 's008', name: 'Global Parts', score: 91 },
            { id: 's015', name: 'Tech Components', score: 90 }
          ]
        },
        financialSummary: {
          totalTransactionValue: 125000,
          pendingPayments: 45000,
          completedPayments: 80000,
          averageTransactionSize: 15625
        },
        recommendedActions: [
          'Follow up on 5 pending high-value RFQs',
          'Review 3 new supplier applications',
          'Approve 2 milestone payments pending review'
        ]
      };
      
      return this.generateReport(dailySummaryData, 'Daily Summary');
    } catch (error: any) {
      console.error('Error generating daily summary report:', error.message);
      throw new Error(`Failed to generate daily summary report: ${error.message}`);
    }
  }
  
  /**
   * Generate a PDF report from a document image using AI
   * 
   * @param documentBase64 - Base64 encoded document image
   * @returns Path to the generated report with extracted and formatted data
   */
  async generateReportFromDocument(documentBase64: string): Promise<string> {
    try {
      // Extract data from the document using the document processing service
      const extractedData = await documentProcessingService.analyzeProcurementDocument(documentBase64);
      
      // Generate a report based on the extracted data
      return this.generateReport(extractedData, 'Document Analysis');
    } catch (error: any) {
      console.error('Error generating report from document:', error.message);
      throw new Error(`Failed to generate report from document: ${error.message}`);
    }
  }
}

export default new PDFReportService();