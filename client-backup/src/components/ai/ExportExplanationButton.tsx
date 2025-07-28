import React from 'react';
import { Button, Tooltip } from '@mui/material';
// Use a simple text label instead of icon to avoid dependency issues
import { ShapLimeExplanation } from '../../types/ai.js';

interface ExportExplanationButtonProps {
  explanation: ShapLimeExplanation;
  format: 'csv' | 'pdf' | 'json';
}

/**
 * Button component for exporting explanation data in various formats
 */
const ExportExplanationButton: React.FC<ExportExplanationButtonProps> = ({ 
  explanation, 
  format 
}) => {
  // Handle the export based on the requested format
  const handleExport = () => {
    switch (format) {
      case 'csv':
        exportToCsv(explanation);
        break;
      case 'pdf':
        exportToPdf(explanation);
        break;
      case 'json':
        exportToJson(explanation);
        break;
    }
  };

  // Export to CSV format
  const exportToCsv = (explanation: ShapLimeExplanation) => {
    // Create CSV header
    let csvContent = 'Feature,Importance,Value\n';
    
    // Add each feature to CSV
    explanation.features.forEach((feature: { name: string, importance: number, value: any }) => {
      csvContent += `${feature.name},${feature.importance},${feature.value}\n`;
    });
    
    // Create and trigger download
    downloadFile(csvContent, `explanation-${explanation.id}.csv`, 'text/csv');
  };

  // Export to JSON format 
  const exportToJson = (explanation: ShapLimeExplanation) => {
    const jsonContent = JSON.stringify(explanation, null, 2);
    downloadFile(jsonContent, `explanation-${explanation.id}.json`, 'application/json');
  };

  // Export to PDF format (placeholder - would require PDF generation library)
  const exportToPdf = (explanation: ShapLimeExplanation) => {
    // In a real implementation, you would use a library like jsPDF here
    alert('PDF export would require a PDF generation library. This is a placeholder.');
    
    // For demonstration, we'll just export the JSON instead
    exportToJson(explanation);
  };

  // Helper function to trigger file download
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format-specific labels and tooltips
  const formatLabels = {
    csv: 'Export as CSV',
    pdf: 'Export as PDF',
    json: 'Export as JSON'
  };

  return (
    <Tooltip title={formatLabels[format]}>
      <Button
        variant="outlined"
        color="primary"
        size="small"
        // Use a text symbol instead of the icon
        onClick={handleExport}
        sx={{ ml: 1 }}
      >
        {format.toUpperCase()}
      </Button>
    </Tooltip>
  );
};

export default ExportExplanationButton;
