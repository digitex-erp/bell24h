import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  File, 
  ImageIcon, 
  FileText, 
  Package, 
  X,
  AlertCircle,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

/**
 * Animated file dropzone with micro-interactions for empty and error states
 */
export function FileDropzone({
  accept = "*",
  maxFiles = 5,
  maxSize = 5242880, // 5MB
  value = [],
  onChange,
  onRemove,
  disabled = false,
  className = "",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTimeout, setDragTimeout] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);
  
  // Reset messages after timeout
  const resetMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  };

  const onDragEnter = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dragTimeout) {
      clearTimeout(dragTimeout);
    }
    
    if (disabled) return;
    
    setIsDragging(true);
  }, [dragTimeout, disabled]);

  const onDragLeave = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    const timeout = setTimeout(() => {
      setIsDragging(false);
    }, 100);
    
    setDragTimeout(timeout);
  }, [disabled]);

  const onDragOver = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dragTimeout) {
      clearTimeout(dragTimeout);
    }
    
    if (disabled) return;
    
    setIsDragging(true);
  }, [dragTimeout, disabled]);

  const onDrop = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragging(false);
    
    const items = e.dataTransfer.files;
    handleFiles(items);
  }, [disabled]);

  const handleFiles = (files) => {
    if (disabled) return;
    
    // Check if exceeding max files
    if (value.length + files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files.`);
      resetMessages();
      return;
    }
    
    const newFiles = [];
    
    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`);
        resetMessages();
        return;
      }
      
      // Check file type (if specified)
      if (accept !== "*") {
        const acceptedTypes = accept.split(",").map(type => type.trim());
        const fileType = file.type;
        const fileExtension = "." + file.name.split('.').pop();
        
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith(".")) {
            return type === fileExtension;
          } else if (type.endsWith("/*")) {
            const mainType = type.split("/")[0];
            return fileType.startsWith(mainType);
          } else {
            return type === fileType;
          }
        });
        
        if (!isAccepted) {
          setError(`File "${file.name}" is not of an accepted type.`);
          resetMessages();
          return;
        }
      }
      
      newFiles.push(file);
    });
    
    if (newFiles.length > 0) {
      const updatedFiles = [...value, ...newFiles];
      onChange(updatedFiles);
      setSuccess(`Successfully added ${newFiles.length} file${newFiles.length > 1 ? 's' : ''}.`);
      resetMessages();
    }
  };

  const handleInputChange = e => {
    handleFiles(e.target.files);
    e.target.value = null; // Reset input
  };

  const handleRemove = (index) => {
    if (disabled) return;
    
    const newFiles = [...value];
    const removedFile = newFiles[index];
    newFiles.splice(index, 1);
    onChange(newFiles);
    
    if (onRemove) {
      onRemove(removedFile, index);
    }
  };

  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current.click();
  };

  // Format bytes to readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Get icon based on file type
  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="text-blue-500" />;
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return <FileText className="text-red-500" />;
    } else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
      return <Package className="text-amber-500" />;
    } else {
      return <File className="text-gray-500" />;
    }
  };

  const containerVariants = {
    dragging: {
      scale: 1.02,
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.05)",
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
    },
    idle: {
      scale: 1,
      borderColor: "#e5e7eb",
      backgroundColor: "#ffffff",
      boxShadow: "none",
    }
  };

  const uploadIconVariants = {
    initial: { y: 0 },
    dragging: { 
      y: [0, -8, 0],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut"
      }
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };

  const fileItemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    },
    hover: {
      y: -2,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={className}>
      <AnimatePresence>
        {error && (
          <Alert
            variant="error"
            title="Upload Error"
            description={error}
            className="mb-4"
            dismissible
            onDismiss={() => setError(null)}
          />
        )}
        
        {success && (
          <Alert
            variant="success"
            title="Success"
            description={success}
            className="mb-4"
            dismissible
            onDismiss={() => setSuccess(null)}
          />
        )}
      </AnimatePresence>
      
      <motion.div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          disabled ? 'bg-gray-50 cursor-not-allowed opacity-75' : 'cursor-pointer'
        }`}
        variants={containerVariants}
        animate={isDragging ? "dragging" : "idle"}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          multiple={maxFiles > 1}
          accept={accept}
          disabled={disabled}
        />
        
        <div className="space-y-3">
          <motion.div 
            className="flex justify-center"
            variants={uploadIconVariants}
            initial="initial"
            animate={isDragging ? "dragging" : "initial"}
            whileHover="hover"
          >
            <div className="p-3 bg-blue-50 rounded-full">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>
          
          <div className="text-gray-500">
            <p className="font-medium text-sm">
              {isDragging ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-xs mt-1">
              or <span className="text-blue-600 font-medium">browse files</span>
            </p>
            <p className="text-xs mt-3 text-gray-400">
              {accept !== "*" && 
                <span>Allowed files: {accept.split(",").join(", ")}<br /></span>
              }
              Maximum file size: {formatBytes(maxSize)}
              <br />
              Maximum files: {maxFiles}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* File List */}
      {value.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files ({value.length}/{maxFiles})</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {value.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-white border rounded-md"
                  variants={fileItemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover="hover"
                  layout
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={disabled}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}