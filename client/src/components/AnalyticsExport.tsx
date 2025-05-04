import * as React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { FileDown, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

type ExportFormat = 'csv' | 'excel' | 'pdf';
type ExportType = 'rfqs' | 'bids' | 'all' | 'summary';

interface AnalyticsExportProps {
  className?: string;
}

const AnalyticsExport: React.FC<AnalyticsExportProps> = ({ className }) => {
  const [exportFormat, setExportFormat] = React.useState<ExportFormat>('csv');
  const [exportType, setExportType] = React.useState<ExportType>('rfqs');
  const { toast } = useToast();

  const handleExport = () => {
    try {
      // Get the API endpoint based on format
      const endpoint = `/api/analytics/export/${exportFormat}?type=${exportType}`;

      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = endpoint;
      downloadLink.target = '_blank';
      
      // Set filename based on type and format
      const fileExtension = exportFormat === 'excel' ? 'xlsx' : exportFormat;
      downloadLink.download = `${exportType}_export.${fileExtension}`;
      
      // Trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "Export started",
        description: `Your ${exportType} data is being exported as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Export Analytics</CardTitle>
        <CardDescription>Download your analytics data in different formats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="export-type">Data to Export</Label>
          <Select value={exportType} onValueChange={(value) => setExportType(value as ExportType)}>
            <SelectTrigger id="export-type">
              <SelectValue placeholder="Select data to export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rfqs">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>RFQs Only</span>
                </div>
              </SelectItem>
              <SelectItem value="bids">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Bids Only</span>
                </div>
              </SelectItem>
              <SelectItem value="all">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>All Data</span>
                </div>
              </SelectItem>
              <SelectItem value="summary">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Summary Report</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="export-format">Format</Label>
          <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
            <SelectTrigger id="export-format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>CSV</span>
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Excel</span>
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center">
                  <File className="mr-2 h-4 w-4" />
                  <span>PDF</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExport} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <FileDown className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnalyticsExport;