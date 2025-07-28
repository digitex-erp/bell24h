import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCamera, FiUpload, FiX, FiSearch, FiImage, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { visionService } from '../services/vision.service';
import { ProductResult } from '../services/vision.service';

interface ImageSearchProps {
  onSearchResults: (results: ProductResult[]) => void;
  onError?: (error: Error) => void;
  onLoading?: (isLoading: boolean) => void;
  className?: string;
  maxSizeMB?: number;
  supportedFormats?: string[];
}

const ImageSearch: React.FC<ImageSearchProps> = ({ onSearchResults, onError, className }) => {
  const { t } = useTranslation();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSize = (maxSizeMB || 5) * 1024 * 1024; // Default 5MB
  const formats = supportedFormats || ['image/jpeg', 'image/png', 'image/webp'];
  const formatText = formats.map(f => f.split('/')[1].toUpperCase()).join(', ');

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Check file type
    if (!formats.includes(file.type)) {
      const errorMsg = t('rfq.create.imageSearchSection.errorFormat', {
        formats: formatText
      });
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      const errorMsg = t('rfq.create.imageSearchSection.errorSize', {
        maxSize: `${maxSizeMB}MB`
      });
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setSuccess(t('rfq.create.imageSearchSection.readyForSearch'));
    };
    reader.onerror = () => {
      const errorMsg = t('rfq.create.imageSearchSection.errorRead');
      setError(errorMsg);
      onError?.(new Error(errorMsg));
    };
    reader.readAsDataURL(file);
  }, [formats, maxSize, onError, t, formatText]);

  const handleSearch = async () => {
    if (!image) return;

    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      onLoading?.(true);
      
      const results = await visionService.detectProducts(image);
      
      if (results.error) {
        throw new Error(results.error);
      }
      
      if (!results.products.length) {
        setError(t('rfq.create.noProductsFound'));
      } else {
        setSuccess(t('rfq.create.searchComplete', { count: results.products.length }));
      }
      
      onSearchResults(results.products);
    } catch (err) {
      console.error('Error during image search:', err);
      const error = err instanceof Error ? err : new Error(t('rfq.create.imageSearchSection.errorProcess'));
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCapture = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(t('rfq.create.imageSearchSection.cameraNotSupported'));
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // In a real implementation, you would show a camera preview here
      // and allow the user to take a photo
      // For now, we'll just show an error
      throw new Error(t('rfq.create.imageSearchSection.cameraNotImplemented'));
      
      // Cleanup
      return () => {
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (err) {
      console.error('Error accessing camera:', err);
      const error = err instanceof Error ? err : new Error(t('rfq.create.imageSearchSection.cameraError'));
      setError(error.message);
      onError?.(error);
    }
  }, [onError, t]);

  const removeImage = useCallback(() => {
    setImage(null);
    setPreview('');
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
        capture="environment"
      />

      {error && (
        <div className="flex items-center p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <FiAlertCircle className="flex-shrink-0 mr-2" size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {success && !error && (
        <div className="flex items-center p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          <FiCheckCircle className="flex-shrink-0 mr-2" size={20} />
          <span>{success}</span>
        </div>
      )}

      {preview ? (
        <div className={`flex flex-col items-center p-6 border-2 border-dashed rounded-lg bg-gray-50 ${!preview ? 'border-gray-300' : 'border-transparent'}`}>
          <div className="relative">
            <img 
              src={preview} 
              alt={t('rfq.create.imageSearchSection.upload')} 
              className="max-h-64 max-w-full rounded-lg shadow-sm" 
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              aria-label={t('common.remove')}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center w-full">
          <div className="bg-white rounded-full p-4 inline-block mb-4 shadow-sm">
            <FiImage size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2 text-sm">
            {t('rfq.create.imageSearchSection.dragAndDrop')}
          </p>
          <p className="text-gray-500 text-xs mb-4">
            {t('rfq.create.supportedFormats', { formats: formatText })}
            <br />
            {t('rfq.create.maxSize', { size: `${maxSize / (1024 * 1024)}MB` })}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={triggerFileInput}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
            >
              <FiUpload className="mr-2" />
              {t('rfq.create.imageSearchSection.upload')}
            </button>
            <button
              onClick={handleCapture}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
            >
              <FiCamera className="mr-2" />
              {t('rfq.create.imageSearchSection.takePhoto')}
            </button>
          </div>
        </div>
      )}

      {preview && (
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md ${
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>{t('common.searching')}...</span>
            </>
          ) : (
            <>
              <FiSearch />
              <span>{t('rfq.create.searchProducts')}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageSearch;
