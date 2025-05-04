import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InsertRfq } from '@shared/schema';
import { format } from 'date-fns';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CalendarIcon, Upload } from 'lucide-react';

interface RFQFormProps {
  rfqType: 'text' | 'video';
}

const RFQForm: React.FC<RFQFormProps> = ({ rfqType }) => {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Define the form schema based on the InsertRfq type
  const formSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    quantity: z.string().min(1, 'Quantity is required'),
    deadline: z.date({
      required_error: 'Deadline is required',
    }).min(new Date(), 'Deadline must be in the future'),
    category: z.string({
      required_error: 'Please select a category',
    }),
    specifications: z.string().optional(),
  });

  // Create form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      quantity: '',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      category: '',
      specifications: '',
    },
  });

  // Create RFQ mutation
  const createRfqMutation = useMutation({
    mutationFn: async (data: Partial<InsertRfq>) => {
      const response = await apiRequest('POST', '/api/rfqs', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
      toast({
        title: 'RFQ Created',
        description: 'Your RFQ has been submitted successfully',
      });
      navigate('/my-rfqs');
    },
    onError: (error) => {
      toast({
        title: 'Failed to create RFQ',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Prepare the specifications as a JSON object
    const specificationsObj = {};
    if (values.specifications) {
      // Split by new lines and attempt to parse as key-value pairs
      const lines = values.specifications.split('\n').filter(line => line.trim() !== '');
      lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join(':').trim();
          if (key && value) {
            specificationsObj[key] = value;
          }
        }
      });
    }

    // Generate a unique reference number
    const now = new Date();
    const referenceNumber = `RFQ-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Create the RFQ data
    const rfqData: Partial<InsertRfq> = {
      referenceNumber,
      title: values.title,
      description: values.description,
      quantity: values.quantity,
      deadline: values.deadline,
      category: values.category,
      specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : undefined,
      rfqType: rfqType,
      mediaUrl: rfqType === 'video' ? videoUrl : undefined,
      status: 'open',
    };

    // Submit the RFQ
    createRfqMutation.mutate(rfqData);
  };

  // Handle video upload
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid video file (MP4, WebM, or QuickTime)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload a video smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Start upload
    setIsUploading(true);
    setUploadProgress(0);

    // Create FormData and append file
    const formData = new FormData();
    formData.append('video', file);

    // Simulate upload progress for demo
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    // Fetch API to upload video
    fetch('/api/rfqs/video-upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to upload video');
        return response.json();
      })
      .then(data => {
        clearInterval(interval);
        setUploadProgress(100);
        setVideoUrl(data.mediaUrl);
        toast({
          title: 'Video uploaded',
          description: 'Your video has been uploaded successfully',
        });
      })
      .catch(error => {
        clearInterval(interval);
        toast({
          title: 'Upload failed',
          description: error.message || 'Failed to upload video',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  // List of industry categories
  const categories = [
    'Electronics',
    'Manufacturing',
    'Chemicals',
    'Textiles',
    'Auto Parts',
    'Pharmaceuticals',
    'Food & Beverages',
    'Construction',
    'IT Services',
    'Other',
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RFQ Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Supply of 5000 units of semiconductors" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of your requirements. Include important details such as specifications, quality standards, delivery location, etc."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 500 units" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 6))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technical Specifications</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter specifications in key:value format, one per line
Example:
Material: Aluminum
Dimensions: 10x20x30 cm
Weight: 500g"
                  className="min-h-28"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {rfqType === 'video' && (
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Video Upload</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload a video showcasing your product requirements or explaining your RFQ in detail.
            </p>

            {!videoUrl ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="mb-3">
                  <Upload className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Drag and drop a video or click to browse</p>
                <p className="text-xs text-gray-400 mb-4">MP4, WebM or QuickTime (max 10MB)</p>
                <input
                  type="file"
                  id="video-upload"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={handleVideoUpload}
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('video-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Select Video'}
                </Button>

                {isUploading && (
                  <div className="w-full mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}% uploaded</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-video text-primary-800 mr-2"></i>
                    <span className="text-sm font-medium">Video uploaded successfully</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setVideoUrl(null)}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createRfqMutation.isPending || (rfqType === 'video' && !videoUrl)}
          >
            {createRfqMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Submitting...
              </>
            ) : (
              'Submit RFQ'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RFQForm;
