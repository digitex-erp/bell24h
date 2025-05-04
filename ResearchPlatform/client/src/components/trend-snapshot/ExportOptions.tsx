import React, { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet, Settings } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useSnapshotExport, type PdfExportOptions } from '@/lib/pdf-export';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExportOptionsProps {
  snapshot: any;
  contentRef: React.RefObject<HTMLElement>;
}

export function ExportOptions({ snapshot, contentRef }: ExportOptionsProps) {
  const { toast } = useToast();
  const { exportAsPdf, exportAsCsv } = useSnapshotExport(snapshot, contentRef);
  const [showSettings, setShowSettings] = useState(false);
  const [exportOptions, setExportOptions] = useState<Partial<PdfExportOptions>>({
    filename: `bell24h-${snapshot?.industry?.toLowerCase().replace(/\s+/g, '-')}-trend.pdf`,
    orientation: 'portrait',
    pageSize: 'a4',
    addWatermark: true,
    addFooter: true,
    includeTimestamp: true,
    includePageNumbers: true,
    quality: 2,
    scale: 2
  });

  const handleExportPdf = async () => {
    try {
      await exportAsPdf(exportOptions);
      toast({
        title: 'Export Successful',
        description: 'Your report has been downloaded as a PDF',
        variant: 'default',
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was a problem exporting your report',
        variant: 'destructive',
      });
    }
  };

  const handleExportCsv = () => {
    try {
      exportAsCsv();
      toast({
        title: 'Export Successful',
        description: 'Your data has been downloaded as a CSV file',
        variant: 'default',
      });
    } catch (error) {
      console.error('CSV export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was a problem exporting your data',
        variant: 'destructive',
      });
    }
  };

  const handleOptionChange = (key: string, value: unknown) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!snapshot) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportPdf}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCsv}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Export Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Settings</DialogTitle>
            <DialogDescription>
              Customize your export options. These settings will be applied to your PDF export.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                Filename
              </Label>
              <Input
                id="filename"
                value={exportOptions.filename}
                onChange={(e) => handleOptionChange('filename', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pageSize" className="text-right">
                Page Size
              </Label>
              <Select 
                value={exportOptions.pageSize} 
                onValueChange={(value: string) => handleOptionChange('pageSize', value)}
              >
                <SelectTrigger id="pageSize" className="col-span-3">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orientation" className="text-right">
                Orientation
              </Label>
              <Select 
                value={exportOptions.orientation} 
                onValueChange={(value: 'portrait' | 'landscape') => handleOptionChange('orientation', value)}
              >
                <SelectTrigger id="orientation" className="col-span-3">
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quality" className="text-right">
                Quality
              </Label>
              <Select 
                value={exportOptions.quality?.toString()} 
                onValueChange={(value) => handleOptionChange('quality', parseInt(value))}
              >
                <SelectTrigger id="quality" className="col-span-3">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Low</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">High</SelectItem>
                  <SelectItem value="4">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={exportOptions.addWatermark}
                    onCheckedChange={(checked: boolean) => handleOptionChange('addWatermark', checked)}
                    id="add-watermark"
                  />
                  <Label htmlFor="add-watermark">Add Bell24h Watermark</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={exportOptions.addFooter}
                    onCheckedChange={(checked: boolean) => handleOptionChange('addFooter', checked)}
                    id="add-footer"
                  />
                  <Label htmlFor="add-footer">Add Footer</Label>
                </div>
              </div>
            </div>
            {exportOptions.addFooter && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4 pl-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={exportOptions.includeTimestamp}
                        onCheckedChange={(checked: boolean) => handleOptionChange('includeTimestamp', checked)}
                        id="include-timestamp"
                      />
                      <Label htmlFor="include-timestamp">Include Timestamp</Label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4 pl-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={exportOptions.includePageNumbers}
                        onCheckedChange={(checked: boolean) => handleOptionChange('includePageNumbers', checked)}
                        id="include-page-numbers"
                      />
                      <Label htmlFor="include-page-numbers">Include Page Numbers</Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowSettings(false);
              handleExportPdf();
            }}>
              Export Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ExportOptions;