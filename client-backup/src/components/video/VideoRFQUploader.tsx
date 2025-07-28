import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Icon,
  Flex
} from '@chakra-ui/react';
import { FiUpload, FiX, FiVideo, FiFile, FiAlertCircle, FiMaximize, FiClock, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

export interface VideoRFQUploaderProps {
  onUploadComplete: (url: string, publicId: string) => void;
  maxDuration?: number;
  maxSizeMB?: number;
  resourceType?: string;
}

const VideoRFQUploader: React.FC<VideoRFQUploaderProps> = ({
  onUploadComplete,
  maxDuration = 600, // 10 minutes
  maxSizeMB = 100,
  resourceType = 'rfq'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const showMessage = (message: string, type: 'success' | 'error') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // In a production app, you might want to use a proper notification system
    // Instead of just logging to console
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload MP4, MOV, AVI, or WebM video.');
        setSelectedFile(null);
        return;
      }
      
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds ${maxSizeMB}MB limit.`);
        setSelectedFile(null);
        return;
      }
      
      // Validate duration (note: we can't reliably check this before upload,
      // but we'll still notify users of the limit)
      
      setError(null);
      setSelectedFile(file);
    }
  }, [maxSizeMB]);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const uploadVideo = useCallback(async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // First, get the signed upload parameters from the server
      const { data: uploadParams } = await axios.post('/api/product-showcases/upload-params', {
        resourceType
      });
      
      // Create FormData for Cloudinary direct upload
      const formData = new FormData();
      Object.entries(uploadParams).forEach(([key, value]) => {
        if (key !== 'cloudName' && key !== 'apiKey') {
          formData.append(key, value as string);
        }
      });
      formData.append('file', selectedFile);
      
      // Upload to Cloudinary with progress tracking
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${uploadParams.cloudName}/video/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            setUploadProgress(progress);
          }
        }
      );
      
      // Extract video URL and public_id from response
      const { secure_url, public_id } = response.data;
      
      // Call onUploadComplete callback
      onUploadComplete(secure_url, public_id);
      
      showMessage('Your video has been successfully uploaded.', 'success');
      
      clearSelection();
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Failed to upload video. Please try again.');
      showMessage(error.message || 'There was an error uploading your video.', 'error');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, resourceType, onUploadComplete, clearSelection]);

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} boxShadow="sm" bg="white">
      <VStack align="stretch">
        <Text fontWeight="bold" mb={2}>
          Upload Video
        </Text>
        
        {!selectedFile ? (
          <Box
            as="label"
            cursor="pointer"
            borderWidth="2px"
            borderRadius="md"
            borderStyle="dashed"
            borderColor="gray.300"
            p={6}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bg="gray.50"
            transition="all 0.3s ease"
            _hover={{
              borderColor: "blue.400", 
              bg: "blue.50",
              transform: "translateY(-2px)",
              boxShadow: "md"
            }}
            _active={{
              transform: "translateY(0)",
              boxShadow: "sm"
            }}
          >
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
              onChange={handleFileSelect}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Icon as={FiUpload} boxSize={12} color="blue.500" mb={4} />
            <Text fontWeight="medium" mb={2} textAlign="center">
              Drag and drop your video file here
            </Text>
            <Text color="gray.500" fontSize="sm" textAlign="center">
              or click to browse files
            </Text>
            
            <Flex mt={6} flexWrap="wrap" justifyContent="center" gap={3}>
              <Box 
                display="flex" 
                alignItems="center" 
                bg="blue.50" 
                px={3} 
                py={1} 
                borderRadius="full"
              >
                <Icon as={FiFile} color="blue.500" mr={1} />
                <Text fontSize="xs" color="blue.700">
                  MP4, MOV, AVI, WebM
                </Text>
              </Box>
              <Box 
                display="flex" 
                alignItems="center" 
                bg="blue.50" 
                px={3} 
                py={1} 
                borderRadius="full"
              >
                <Icon as={FiMaximize} color="blue.500" mr={1} />
                <Text fontSize="xs" color="blue.700">
                  Max size: {maxSizeMB}MB
                </Text>
              </Box>
              <Box 
                display="flex" 
                alignItems="center" 
                bg="blue.50" 
                px={3} 
                py={1} 
                borderRadius="full"
              >
                <Icon as={FiClock} color="blue.500" mr={1} />
                <Text fontSize="xs" color="blue.700">
                  Max {Math.floor(maxDuration / 60)} minutes
                </Text>
              </Box>
            </Flex>
          </Box>
        ) : selectedFile && !uploading ? (
          <Box borderWidth="1px" borderRadius="md" p={4} bg="white" boxShadow="sm" transition="all 0.2s ease">
            <HStack justify="space-between" spacing={4}>
              <HStack spacing={3}>
                <Box 
                  p={3} 
                  bg="blue.50" 
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiVideo} color="blue.500" boxSize={5} />
                </Box>
                <Box>
                  <Text fontWeight="medium" maxW="200px"> 
                    {selectedFile.name.length > 25 ? `${selectedFile.name.substring(0, 22)}...` : selectedFile.name}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB
                  </Text>
                </Box>
              </HStack>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={uploadVideo}
                  disabled={!!error}
                  _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                  transition="all 0.2s"
                >
                  <Box display="flex" alignItems="center">
                    <Icon as={FiUpload} mr={1} />
                    <Text>Upload</Text>
                  </Box>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSelection}
                  _hover={{ bg: "red.50" }}
                  transition="all 0.2s"
                >
                  <Box display="flex" alignItems="center">
                    <Icon as={FiX} mr={1} />
                    <Text>Cancel</Text>
                  </Box>
                </Button>
              </HStack>
            </HStack>
            {error && (
              <Box 
                mt={3} 
                p={3} 
                bg="red.50" 
                color="red.500" 
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor="red.500"
              >
                <HStack>
                  <Icon as={FiAlertCircle} />
                  <Text fontSize="sm" fontWeight="medium">{error}</Text>
                </HStack>
              </Box>
            )}
          </Box>
        ) : (
          <Box borderWidth="1px" borderRadius="md" p={5} bg="white" boxShadow="sm">
            <HStack justify="space-between" mb={3}>
              <HStack spacing={3}>
                <Box 
                  p={3} 
                  bg="blue.50" 
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiVideo} color="blue.500" boxSize={5} />
                </Box>
                <Box>
                  <Text fontWeight="medium" maxW="200px">
                    {selectedFile?.name && (selectedFile.name.length > 25 ? `${selectedFile.name.substring(0, 22)}...` : selectedFile.name)}
                  </Text>
                  <Text fontSize="sm" color="blue.600" fontWeight="medium">
                    Uploading... {uploadProgress}%
                  </Text>
                </Box>
              </HStack>
              <Box 
                bg={uploadProgress === 100 ? "green.500" : "blue.500"} 
                color="white" 
                borderRadius="full" 
                px={3} 
                py={1}
                fontSize="xs"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                justifyContent="center"
                minW="48px"
              >
                {uploadProgress === 100 ? (
                  <HStack spacing={1}>
                    <Icon as={FiCheckCircle} />
                    <Text>Done</Text>
                  </HStack>
                ) : (
                  `${uploadProgress}%`
                )}
              </Box>
            </HStack>
            
            {/* Custom Progress Bar */}
            <Box w="100%" bg="gray.100" h="10px" borderRadius="full" overflow="hidden" position="relative">
              <Box 
                h="100%" 
                bg={uploadProgress === 100 ? "green.500" : "blue.500"} 
                borderRadius="full"
                w={`${uploadProgress}%`}
                transition="width 0.3s ease-in-out, background-color 0.3s ease"
                position="absolute"
                top={0}
                left={0}
              />
              
              {/* Progress Markers */}
              {[25, 50, 75].map(marker => (
                <Box 
                  key={marker}
                  position="absolute"
                  left={`${marker}%`}
                  top="50%"
                  transform="translate(-50%, -50%)"
                  width="4px"
                  height="4px"
                  borderRadius="full"
                  bg={uploadProgress >= marker ? (uploadProgress === 100 ? "green.500" : "blue.500") : "gray.300"}
                  zIndex={2}
                />
              ))}
            </Box>
            
            <HStack justify="center" mt={3}>
              <Icon as={FiAlertCircle} color="gray.400" fontSize="xs" />
              <Text fontSize="xs" color="gray.500">
                Please don't close this window during upload
              </Text>
            </HStack>
          </Box>
        )}

        <Box mt={4} borderRadius="md" bg="gray.50" p={3}>
          <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={2}>
            Video Requirements:
          </Text>
          <HStack spacing={4} flexWrap="wrap">
            <HStack>
              <Icon as={FiClock} color="gray.500" boxSize={3} />
              <Text fontSize="xs" color="gray.500">
                Max {maxDuration / 60} minutes
              </Text>
            </HStack>
            <HStack>
              <Icon as={FiMaximize} color="gray.500" boxSize={3} />
              <Text fontSize="xs" color="gray.500">
                Max {maxSizeMB}MB
              </Text>
            </HStack>
            <HStack>
              <Icon as={FiFile} color="gray.500" boxSize={3} />
              <Text fontSize="xs" color="gray.500">
                MP4, MOV, AVI, WebM
              </Text>
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default VideoRFQUploader;
