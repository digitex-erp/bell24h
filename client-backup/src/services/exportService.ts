import { RFQ } from '../types/rfq';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportOptions {
  includeDescription: boolean;
  includeSupplier: boolean;
  includeContact: boolean;
  includeTimeline: boolean;
  includeBudget: boolean;
  includeLocation: boolean;
  includeStatus: boolean;
  includeCertifications: boolean;
  filename: string;
}

class ExportService {
  private prepareData(rfqs: RFQ[], options: ExportOptions) {
    return rfqs.map(rfq => {
      const data: Record<string, any> = {
        'Title': rfq.title,
        'Category': rfq.category,
        'Subcategory': rfq.subcategory || 'N/A',
      };

      if (options.includeDescription) {
        data['Description'] = rfq.description;
      }

      if (options.includeSupplier) {
        data['Supplier'] = rfq.supplier?.name || 'N/A';
        data['Supplier Rating'] = rfq.supplier?.rating || 'N/A';
      }

      if (options.includeContact) {
        data['Contact Name'] = rfq.contact?.name || 'N/A';
        data['Contact Email'] = rfq.contact?.email || 'N/A';
        data['Contact Phone'] = rfq.contact?.phone || 'N/A';
      }

      if (options.includeTimeline) {
        data['Timeline'] = rfq.timeline || 'N/A';
      }

      if (options.includeBudget) {
        data['Budget'] = rfq.budget || 'N/A';
      }

      if (options.includeLocation) {
        data['Location'] = rfq.location || 'N/A';
      }

      if (options.includeStatus) {
        data['Status'] = rfq.status;
      }

      if (options.includeCertifications) {
        data['Certifications'] = rfq.certifications?.join(', ') || 'N/A';
      }

      return data;
    });
  }

  async exportToCSV(rfqs: RFQ[], options: ExportOptions) {
    const data = this.prepareData(rfqs, options);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RFQs');
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${options.filename}.csv`);
  }

  async exportToExcel(rfqs: RFQ[], options: ExportOptions) {
    const data = this.prepareData(rfqs, options);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RFQs');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${options.filename}.xlsx`);
  }

  async exportToPDF(rfqs: RFQ[], options: ExportOptions) {
    const data = this.prepareData(rfqs, options);
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('RFQ Export', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Prepare table data
    const tableData = data.map(item => Object.values(item));
    const headers = Object.keys(data[0]);

    // Add table
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`${options.filename}.pdf`);
  }

  async exportToJSON(rfqs: RFQ[], options: ExportOptions) {
    const data = this.prepareData(rfqs, options);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `${options.filename}.json`);
  }

  async exportResults(rfqs: RFQ[], format: string, options: ExportOptions) {
    switch (format) {
      case 'csv':
        await this.exportToCSV(rfqs, options);
        break;
      case 'excel':
        await this.exportToExcel(rfqs, options);
        break;
      case 'pdf':
        await this.exportToPDF(rfqs, options);
        break;
      case 'json':
        await this.exportToJSON(rfqs, options);
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }
}

export const exportService = new ExportService(); 