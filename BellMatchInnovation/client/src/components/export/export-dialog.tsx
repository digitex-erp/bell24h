import React from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { convertToCSV, downloadCSV, shareExportedData } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';
import { Download, Send, Share, File } from 'lucide-react';

// Define the form schema
const exportFormSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  format: z.enum(["csv"]),
  includeHeaders: z.boolean().default(true),
  exportAction: z.enum(["download", "share"]),
});

type ExportFormValues = z.infer<typeof exportFormSchema>;

interface ExportDialogProps {
  data: Record<string, any>[];
  columns: { header: string; key: string }[];
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  defaultFilename?: string;
  defaultFormat?: "csv";
  exportType?: "rfq" | "supplier" | "custom";
  onExportComplete?: () => void;
}

export function ExportDialog({
  data,
  columns,
  title = "Export Data",
  description = "Choose your export options",
  trigger,
  defaultFilename = "bell24h_export.csv",
  defaultFormat = "csv",
  exportType = "custom",
  onExportComplete,
}: ExportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      filename: defaultFilename,
      format: defaultFormat,
      includeHeaders: true,
      exportAction: "download",
    },
  });

  const onSubmit = async (values: ExportFormValues) => {
    try {
      if (!data || data.length === 0) {
        toast({
          title: "Export Error",
          description: "No data to export",
          variant: "destructive",
        });
        return;
      }

      // Ensure filename has the correct extension
      const filename = values.filename.endsWith(`.${values.format}`)
        ? values.filename
        : `${values.filename}.${values.format}`;

      // Create CSV content
      const csvContent = convertToCSV(data, columns);

      if (values.exportAction === "download") {
        // Download CSV
        downloadCSV(csvContent, filename);
        toast({
          title: "Export Successful",
          description: `${title} has been downloaded as ${filename}`,
        });
      } else if (values.exportAction === "share") {
        // Use share API if available
        const shared = await shareExportedData(csvContent, filename);
        if (shared) {
          toast({
            title: "Share Initiated",
            description: "The export data is ready to share",
          });
        } else {
          toast({
            title: "Share Fallback",
            description: "Sharing was not available. The file has been downloaded instead.",
          });
        }
      }

      // Close the dialog
      setOpen(false);

      // Call the completion callback if provided
      if (onExportComplete) {
        onExportComplete();
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the data",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <File className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filename</FormLabel>
                  <FormControl>
                    <Input placeholder="export.csv" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name for the exported file
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Format for the exported data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exportAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Action</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="download">
                        <div className="flex items-center">
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="share">
                        <div className="flex items-center">
                          <Share className="mr-2 h-4 w-4" />
                          <span>Share</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how to export the data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">
                {form.watch('exportAction') === 'download' ? (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                ) : (
                  <>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}