import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportOptions {
  filename: string;
  data: any[];
  columns: {
    header: string;
    key: string;
    width?: number;
  }[];
}

export const exportToCSV = ({ filename, data, columns }: ExportOptions) => {
  // Create CSV header
  const headers = columns.map(col => col.header).join(',');
  
  // Create CSV rows
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      // Handle special cases
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      if (typeof value === 'number') {
        return value.toString();
      }
      // Escape strings with commas
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );

  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = ({ filename, data, columns }: ExportOptions) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(filename, 14, 15);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

  // Prepare table data
  const tableData = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return value;
    })
  );

  // Add table
  (doc as any).autoTable({
    head: [columns.map(col => col.header)],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
    columnStyles: columns.reduce((acc, col, index) => ({
      ...acc,
      [index]: { cellWidth: col.width || 'auto' }
    }), {})
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
}; 