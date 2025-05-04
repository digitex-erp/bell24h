import React from 'react';
import { Button } from '@/components/ui/button';
import { convertToCSV, downloadCSV, formatSuppliersForExport, formatRfqsForExport, shareExportedData } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';
import { Download, Share } from 'lucide-react';

interface ExportActionButtonProps {
  data: Record<string, any>[];
  columns?: { header: string; key: string }[];
  filename?: string;
  title?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: boolean;
  className?: string;
  exportType?: "rfq" | "supplier" | "custom";
  buttonText?: string;
}

export function ExportActionButton({
  data,
  columns,
  filename = "bell24h_export.csv",
  title,
  variant = "default",
  size = "default",
  icon = true,
  className,
  exportType = "custom",
  buttonText = "Export"
}: ExportActionButtonProps) {
  const { toast } = useToast();
  const [isShareSupported, setIsShareSupported] = React.useState(false);

  // Check if Web Share API is supported
  React.useEffect(() => {
    setIsShareSupported(
      typeof navigator !== 'undefined' && 
      !!navigator.share && 
      !!navigator.canShare
    );
  }, []);

  const prepareExportData = () => {
    if (!data || data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export at this time.",
        variant: "destructive",
      });
      return null;
    }

    // Format the data based on export type
    let formattedData = data;
    let exportColumns = columns;

    if (exportType === "supplier" && !columns) {
      formattedData = formatSuppliersForExport(data);
      exportColumns = [
        { header: 'ID', key: 'id' },
        { header: 'Company Name', key: 'companyName' },
        { header: 'Location', key: 'location' },
        { header: 'Categories', key: 'categories' },
        { header: 'Verified', key: 'verified' },
        { header: 'Risk Score', key: 'riskScore' },
        { header: 'Risk Grade', key: 'riskGrade' },
        { header: 'Match Score', key: 'matchScore' },
        { header: 'Description', key: 'description' },
      ];
    } else if (exportType === "rfq" && !columns) {
      formattedData = formatRfqsForExport(data);
      exportColumns = [
        { header: 'ID', key: 'id' },
        { header: 'Title', key: 'title' },
        { header: 'Category', key: 'category' },
        { header: 'Status', key: 'status' },
        { header: 'Type', key: 'type' },
        { header: 'Created Date', key: 'createdAt' },
        { header: 'Deadline', key: 'deadline' },
        { header: 'Responses', key: 'responseCount' },
        { header: 'Budget', key: 'budget' },
        { header: 'Quantity', key: 'quantity' },
        { header: 'Description', key: 'description' },
      ];
    }

    if (!exportColumns) {
      toast({
        title: "Export configuration error",
        description: "Export columns not specified. Please contact support.",
        variant: "destructive",
      });
      return null;
    }

    return { formattedData, exportColumns };
  };

  const handleExport = async () => {
    try {
      const preparedData = prepareExportData();
      if (!preparedData) return;
      
      const { formattedData, exportColumns } = preparedData;

      // Convert to CSV
      const csvContent = convertToCSV(formattedData, exportColumns);
      
      // Download the file
      downloadCSV(csvContent, filename);

      toast({
        title: `${title || 'Data'} exported`,
        description: `Your data has been exported to ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const preparedData = prepareExportData();
      if (!preparedData) return;
      
      const { formattedData, exportColumns } = preparedData;

      // Convert to CSV
      const csvContent = convertToCSV(formattedData, exportColumns);
      
      // Share the file
      const shared = await shareExportedData(csvContent, filename);
      
      if (shared) {
        toast({
          title: "Sharing initiated",
          description: "The exported data is ready to share",
        });
      } else {
        // Fallback to download
        downloadCSV(csvContent, filename);
        toast({
          title: "Sharing not available",
          description: "The file has been downloaded instead.",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Sharing failed",
        description: "An error occurred while sharing your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If sharing is not supported, only show download button
  if (!isShareSupported) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={handleExport}
        className={className}
      >
        {icon && <Download className="h-4 w-4 mr-2" />}
        {buttonText}
      </Button>
    );
  }

  // If sharing is supported, show both download and share buttons
  return (
    <div className="flex gap-1">
      <Button 
        variant={variant} 
        size={size} 
        onClick={handleExport}
        className={className}
      >
        {icon && <Download className="h-4 w-4 mr-2" />}
        {buttonText}
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={handleShare}
        className={className}
      >
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  );
}