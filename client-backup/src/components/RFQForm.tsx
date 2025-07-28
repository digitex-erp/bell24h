/**
 * Interactive RFQ Submission Form Component
 * Allows users to create and submit RFQs with real-time validation
 * and supplier matching suggestions
 */

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useWebSocket } from '../hooks/use-websocket';
import { useAudio } from '../lib/audio-utils';

// Form validation schema
const rfqSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  budget: z.coerce.number()
    .min(100, 'Budget must be at least ₹100')
    .optional(),
  deadline: z.string()
    .refine(date => new Date(date) > new Date(), {
      message: 'Deadline must be in the future'
    }),
  categories: z.array(z.string())
    .min(1, 'Select at least one category'),
  attachments: z.array(z.any())
    .optional(),
  requirements: z.array(z.object({
    name: z.string().min(3, 'Requirement name is required'),
    description: z.string().optional(),
    isRequired: z.boolean().default(true),
    type: z.enum(['numeric', 'boolean', 'text', 'date', 'file']),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z.array(z.string()).optional(),
  })).optional(),
});

type RFQFormValues = z.infer<typeof rfqSchema>;

// Category options
const categoryOptions = [
  { id: 'electronics', name: 'Electronics & Components' },
  { id: 'manufacturing', name: 'Manufacturing Services' },
  { id: 'logistics', name: 'Logistics & Shipping' },
  { id: 'software', name: 'Software & IT Services' },
  { id: 'marketing', name: 'Marketing & Design' },
  { id: 'consulting', name: 'Business Consulting' },
  { id: 'materials', name: 'Raw Materials' },
  { id: 'office', name: 'Office Supplies' },
];

interface RFQFormProps {
  onSubmit: (data: RFQFormValues) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<RFQFormValues>;
  isEdit?: boolean;
}

export const RFQForm: React.FC<RFQFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}) => {
  // Initialize audio
  const audio = useAudio();
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUploads, setFileUploads] = useState<File[]>([]);
  const [requirementFields, setRequirementFields] = useState<any[]>(
    initialData?.requirements || [{ name: '', description: '', isRequired: true, type: 'text' }]
  );
  const [suggestedSuppliers, setSuggestedSuppliers] = useState<any[]>([]);
  
  // WebSocket connection for real-time supplier suggestions
  const { status, sendMessage } = useWebSocket({
    url: 'ws://localhost:8080',
    onMessage: (message: any) => {
      if (message.type === 'supplier_suggestions' || message.type === 'supplier_match') {
        setSuggestedSuppliers(message.suppliers || []);
        audio.playMatchFound().catch(console.error);
      }
    }
  });

  // Initialize form with react-hook-form
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<RFQFormValues>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      budget: initialData?.budget || undefined,
      deadline: initialData?.deadline || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      categories: initialData?.categories || [],
      requirements: initialData?.requirements || [],
    }
  });

  // Watch form values for real-time supplier suggestions
  const watchedValues = watch();
  
  // Send form data to WebSocket for real-time supplier suggestions
  useEffect(() => {
    // Only send if we have sufficient data and WebSocket is connected
    if (
      status === 'open' && 
      watchedValues.title && 
      watchedValues.title.length > 10 && 
      watchedValues.categories &&
      watchedValues.categories.length > 0
    ) {
      sendMessage({
        type: 'request_supplier_suggestions',
        data: {
          title: watchedValues.title,
          categories: watchedValues.categories
        },
        timestamp: Date.now()
      });
    }
  }, [watchedValues.title, watchedValues.categories, status, sendMessage]);

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFileUploads([...fileUploads, ...newFiles]);
      setValue('attachments', [...(watchedValues.attachments || []), ...newFiles]);
      audio.playUpload().catch(console.error);
    }
  };

  // Add a new requirement field
  const addRequirement = () => {
    setRequirementFields([
      ...requirementFields,
      { name: '', description: '', isRequired: true, type: 'text' }
    ]);
  };

  // Remove a requirement field
  const removeRequirement = (index: number) => {
    const updated = [...requirementFields];
    updated.splice(index, 1);
    setRequirementFields(updated);
  };

  // Update a requirement field
  const updateRequirement = (index: number, field: string, value: any) => {
    const updated = [...requirementFields];
    updated[index] = { ...updated[index], [field]: value };
    setRequirementFields(updated);
    setValue('requirements', updated);
  };

  // Cancel form handler
  const handleCancel = () => {
    audio.playError().catch(console.error);
    onCancel();
  };

  // Submit form handler
  const onFormSubmit = async (data: RFQFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        attachments: fileUploads
      });
      reset();
      setFileUploads([]);
      setRequirementFields([{ name: '', description: '', isRequired: true, type: 'text' }]);
      await audio.playSuccess();
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      await audio.playError().catch(console.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Request for Quotation' : 'Create New Request for Quotation'}
      </h2>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RFQ Title <span className="text-red-500">*</span>
          </label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter a clear, concise title for your RFQ"
              />
            )}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Provide detailed specifications and requirements"
              />
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Budget and Deadline - Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (₹)
            </label>
            <Controller
              name="budget"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your budget"
                />
              )}
            />
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline <span className="text-red-500">*</span>
            </label>
            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              )}
            />
            {errors.deadline && (
              <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories <span className="text-red-500">*</span>
          </label>
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categoryOptions.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      value={category.id}
                      checked={(field.value || []).includes(category.id)}
                      onChange={(e) => {
                        const updatedCategories = e.target.checked
                          ? [...(field.value || []), category.id]
                          : (field.value || []).filter((id) => id !== category.id);
                        field.onChange(updatedCategories);
                      }}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          />
          {errors.categories && (
            <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
          )}
        </div>

        {/* Requirements */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Specific Requirements
            </label>
            <button
              type="button"
              onClick={addRequirement}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Requirement
            </button>
          </div>
          
          {requirementFields.map((req, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Requirement #{index + 1}</h4>
                {requirementFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={req.name}
                    onChange={(e) => updateRequirement(index, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    placeholder="e.g. Material quality"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={req.type}
                    onChange={(e) => updateRequirement(index, 'type', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="numeric">Number</option>
                    <option value="boolean">Yes/No</option>
                    <option value="date">Date</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={req.description}
                    onChange={(e) => updateRequirement(index, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Detailed description of this requirement"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`req-required-${index}`}
                    checked={req.isRequired}
                    onChange={(e) => updateRequirement(index, 'isRequired', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`req-required-${index}`}
                    className="ml-2 block text-xs text-gray-700"
                  >
                    This is a mandatory requirement
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, Word, Excel, Image up to 10MB each
              </p>
            </div>
          </div>
          
          {/* Display uploaded files */}
          {fileUploads.length > 0 && (
            <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
              {fileUploads.map((file, index) => (
                <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 flex-1 w-0 truncate">
                      {file.name}
                    </span>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        audio.playError(); // Play error sound when removing a file
                        const updatedFiles = [...fileUploads];
                        updatedFiles.splice(index, 1);
                        setFileUploads(updatedFiles);
                      }}
                      className="font-medium text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Play sound when suppliers are suggested */}
        {suggestedSuppliers.length > 0 && (
          <div className="hidden" aria-hidden="true">
            {(() => {
              audio.playMatchFound();
              return null;
            })()}
          </div>
        )}

        {/* Suggested Suppliers */}
        {suggestedSuppliers.length > 0 && (
          <div className="border border-green-200 bg-green-50 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Suggested Suppliers Based on Your RFQ
            </h3>
            <ul className="space-y-2">
              {suggestedSuppliers.slice(0, 3).map((supplier, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  {supplier.name} - {supplier.matchScore}% match
                </li>
              ))}
            </ul>
            <p className="text-xs text-green-700 mt-2">
              These suppliers will be automatically notified when you submit this RFQ.
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : isEdit ? 'Update RFQ' : 'Submit RFQ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RFQForm;
