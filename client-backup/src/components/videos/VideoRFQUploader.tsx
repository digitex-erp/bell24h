import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  Progress,
  Flex,
  IconButton,
  useToast,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  AlertIcon,
  Badge,
  VStack,
  HStack,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Spinner,
  Divider
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTrash, FaPlay, FaPause, FaCheck, FaCompress, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { VideoAnalyticsPlayer } from './VideoAnalyticsPlayer';
import { VideoThumbnailGenerator } from './VideoThumbnailGenerator';

interface VideoRFQUploaderProps {
  onVideoUploaded: (videoUrl: string, thumbnailUrl: string) => void;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

export const VideoRFQUploader: React.FC<VideoRFQUploaderProps> = ({
  onVideoUploaded,
  maxFileSize = 100, // Default 100MB
  allowedFileTypes = ['video/mp4', 'video/webm', 'video/quicktime']
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<any>(null);
  const [adaptiveStreaming, setAdaptiveStreaming] = useState<{ hls?: string, dash?: string } | null>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Function to handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadError(null);
    
    if (acceptedFiles.length === 0) {
      setUploadError('No files were accepted. Please check file type and size.');
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setUploadError(`File too large. Maximum size is ${maxFileSize}MB.`);
      return;
    }
    
    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      setUploadError(`Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}.`);
      return;
    }
    
    setVideoFile(file);
    
    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    
    // Get video metadata via HTML5 video API
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      setVideoMetadata({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
      video.remove(); // Clean up
    };
    video.src = objectUrl;
    
    toast({
      title: "Video selected",
      description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [maxFileSize, allowedFileTypes, toast]);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': allowedFileTypes
    },
    maxFiles: 1
  });
  
  // Function to upload video to Cloudinary with optimizations
  const uploadVideo = async () => {
    if (!videoFile) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      
      // Create abort controller for cancellation support
      abortControllerRef.current = new AbortController();
      
      // Step 1: Get signed upload params from server
      const { data: uploadParams } = await axios.get('/api/video-rfq/upload-params', {
        params: {
          filename: videoFile.name,
          filesize: videoFile.size
        }
      });
      
      // Step 2: Create a FormData object with all required parameters
      const formData = new FormData();
      Object.entries(uploadParams.params).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', videoFile);
      
      // Step 3: Upload to Cloudinary with progress tracking
      const uploadResponse = await axios.post(
        uploadParams.uploadUrl,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
          signal: abortControllerRef.current.signal
        }
      );
      
      // Step 4: Get the public URL from the response
      const cloudinaryVideoUrl = uploadResponse.data.secure_url;
      
      // Step 5: Start optimization and adaptive streaming generation
      setIsOptimizing(true);
      setOptimizationProgress(15);
      
      // Call the API to generate adaptive streaming formats
      const { data: streamingData } = await axios.post('/api/video-analytics/generate-streaming', {
        videoUrl: cloudinaryVideoUrl
      });
      
      setOptimizationProgress(65);
      setAdaptiveStreaming(streamingData.adaptiveStreaming);
      
      // Step 6: Generate a thumbnail if none was provided
      if (!thumbnailUrl) {
        const { data: thumbnailData } = await axios.post('/api/video-analytics/generate-thumbnail', {
          videoUrl: cloudinaryVideoUrl,
          timestamp: Math.floor((videoMetadata?.duration || 0) / 3) // Use the 1/3 point of the video
        });
        
        setThumbnailUrl(thumbnailData.thumbnailUrl);
      }
      
      setOptimizationProgress(100);
      setIsOptimizing(false);
      setIsUploading(false);
      
      // Step 7: Call the onVideoUploaded callback with the final URLs
      onVideoUploaded(cloudinaryVideoUrl, thumbnailUrl);
      
      toast({
        title: "Upload complete",
        description: "Your video has been uploaded and optimized successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error: any) {
      console.error('Video upload error:', error);
      setUploadError(
        error.response?.data?.error || 
        error.message || 
        'An error occurred during upload. Please try again.'
      );
      
      setIsUploading(false);
      setIsOptimizing(false);
      
      toast({
        title: "Upload failed",
        description: error.response?.data?.error || error.message || 'Failed to upload video',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Function to cancel upload
  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsUploading(false);
    setIsOptimizing(false);
    setUploadProgress(0);
    setOptimizationProgress(0);
    
    toast({
      title: "Upload canceled",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Function to remove selected video
  const removeVideo = () => {
    if (videoUrl && !isUploading) {
      URL.revokeObjectURL(videoUrl); // Clean up the object URL
      setVideoFile(null);
      setVideoUrl('');
      setThumbnailUrl('');
      setVideoMetadata(null);
      setAdaptiveStreaming(null);
    }
  };
  
  // Handle thumbnail generation
  const handleThumbnailGenerated = (newThumbnailUrl: string, timestamp: number) => {
    setThumbnailUrl(newThumbnailUrl);
  };
  
  return (
    <Box width="100%">
      {!videoUrl && (
        <Box
          {...getRootProps()}
          p={6}
          borderWidth={2}
          borderRadius="md"
          borderStyle="dashed"
          borderColor={borderColor}
          bg={bgColor}
          textAlign="center"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ borderColor: 'blue.500' }}
          mb={4}
          height="200px"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <input {...getInputProps()} />
          
          <Box fontSize="3xl" mb={2}>
            <FaUpload />
          </Box>
          
          {isDragActive ? (
            <Text>Drop the video here...</Text>
          ) : isDragReject ? (
            <Text color="red.500">File type not accepted or too many files</Text>
          ) : (
            <VStack spacing={1}>
              <Text fontWeight="bold">Drag and drop or click to select a video</Text>
              <Text fontSize="sm" color="gray.500">
                Supported formats: MP4, WebM, MOV (max {maxFileSize}MB)
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                We recommend uploading high-quality videos for best results.
              </Text>
            </VStack>
          )}
        </Box>
      )}
      
      {uploadError && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <Text fontSize="sm">{uploadError}</Text>
        </Alert>
      )}
      
      {videoUrl && !isUploading && !isOptimizing && (
        <VStack spacing={4} align="stretch" mb={4}>
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold" fontSize="lg" isTruncated flex="1">
              {videoFile?.name}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme="blue">
                {videoFile && (videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </Badge>
              {videoMetadata && (
                <Tooltip label={`${videoMetadata.width}x${videoMetadata.height}`}>
                  <Badge colorScheme="green">
                    {videoMetadata.height >= 720 ? "HD" : "SD"}
                  </Badge>
                </Tooltip>
              )}
            </HStack>
          </Flex>
          
          <Box
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="md"
            overflow="hidden"
            position="relative"
          >
            {videoUrl && (
              <Box width="100%" maxWidth="100%" height="250px">
                <VideoAnalyticsPlayer
                  videoUrl={videoUrl}
                  videoId={videoFile?.name || 'preview'}
                  thumbnailUrl={thumbnailUrl}
                  height="250px"
                  videoMetadata={videoMetadata}
                />
              </Box>
            )}
          </Box>
          
          <VideoThumbnailGenerator
            videoUrl={videoUrl}
            onThumbnailGenerated={handleThumbnailGenerated}
          />
          
          <HStack spacing={4}>
            <Button
              leftIcon={<FaUpload />}
              colorScheme="blue"
              onClick={uploadVideo}
              isDisabled={isUploading || isOptimizing}
              flex={1}
            >
              Upload Video
            </Button>
            <IconButton
              aria-label="Remove video"
              icon={<FaTrash />}
              colorScheme="red"
              variant="outline"
              onClick={removeVideo}
              isDisabled={isUploading || isOptimizing}
            />
          </HStack>
          
          <FormHelperText>
            Your video will be optimized for web streaming after upload.
          </FormHelperText>
        </VStack>
      )}
      
      {(isUploading || isOptimizing) && (
        <Box borderWidth={1} borderColor={borderColor} borderRadius="md" p={4} mb={4}>
          {isUploading && (
            <Box mb={isOptimizing ? 4 : 0}>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="semibold">Uploading video...</Text>
                <Text>{uploadProgress}%</Text>
              </Flex>
              <Progress
                value={uploadProgress}
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                mb={2}
              />
              <Flex justify="flex-end">
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<FaTrash />}
                  onClick={cancelUpload}
                >
                  Cancel
                </Button>
              </Flex>
            </Box>
          )}
          
          {isOptimizing && (
            <Box>
              {isOptimizing && isUploading && <Divider my={3} />}
              
              <Flex justify="space-between" mb={2}>
                <HStack>
                  <Text fontWeight="semibold">Optimizing video</Text>
                  <Tooltip label="Creating adaptive streaming formats for better playback">
                    <Box as={FaCompress} color="blue.500" />
                  </Tooltip>
                </HStack>
                <Text>{optimizationProgress}%</Text>
              </Flex>
              <Progress
                value={optimizationProgress}
                size="sm"
                colorScheme="green"
                borderRadius="full"
                mb={2}
              />
              <Text fontSize="sm" color="gray.500">
                {optimizationProgress < 30
                  ? "Analyzing video content..."
                  : optimizationProgress < 60
                  ? "Creating adaptive formats..."
                  : optimizationProgress < 90
                  ? "Generating thumbnails..."
                  : "Finalizing..."}
              </Text>
            </Box>
          )}
        </Box>
      )}
      
      {videoUrl && adaptiveStreaming && (
        <Box
          mt={4}
          p={2}
          bg="green.50"
          color="green.800"
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor="green.500"
        >
          <Flex align="center">
            <Box as={FaCheck} mr={2} color="green.500" />
            <Text fontWeight="medium">
              Video optimized successfully with adaptive streaming
            </Text>
          </Flex>
        </Box>
      )}
      
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Video Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {videoUrl && (
              <Box width="100%">
                <VideoAnalyticsPlayer
                  videoUrl={videoUrl}
                  videoId={videoFile?.name || 'preview'}
                  thumbnailUrl={thumbnailUrl}
                  title={videoFile?.name}
                  autoplay={true}
                  allowDownload={true}
                  videoMetadata={videoMetadata}
                  adaptiveStreaming={adaptiveStreaming || undefined}
                />
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onPreviewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VideoRFQUploader;
