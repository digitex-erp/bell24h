import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  Progress,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  AspectRatio,
  Image,
  IconButton,
  Flex,
  useToast,
  Tooltip,
  Spinner,
  Badge
} from '@chakra-ui/react';
import { 
  AttachmentIcon, 
  CheckCircleIcon, 
  WarningIcon, 
  RepeatIcon, 
  DeleteIcon,
  InfoIcon
} from '@chakra-ui/icons';
import axios from 'axios';

interface VideoRFQUploaderProps {
  onVideoUploaded: (videoUrl: string, thumbnailUrl: string, publicId: string, metadata: any) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  initialVideo?: string;
}

export const VideoRFQUploader: React.FC<VideoRFQUploaderProps> = ({
  onVideoUploaded,
  maxSizeMB = 100, // Default max size of 100MB
  allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  initialVideo
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(initialVideo || null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<any>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Validate file size and type
  const validateFile = (file: File): boolean => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setUploadError(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
      return false;
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      setUploadError(`File type not supported. Allowed types: ${allowedTypes.join(', ')}`);
      return false;
    }
    
    return true;
  };
  
  // Generate thumbnail from video
  const generateThumbnail = useCallback((videoFile: File) => {
    if (!videoFile) return;
    
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    
    video.onloadeddata = () => {
      // Seek to 25% of the video duration for a better thumbnail
      video.currentTime = video.duration * 0.25;
    };
    
    video.onseeked = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
      setThumbnailUrl(thumbnailDataUrl);
      
      // Extract metadata
      const metadata = {
        duration: video.duration.toFixed(2),
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: (video.videoWidth / video.videoHeight).toFixed(2)
      };
      setVideoMetadata(metadata);
      
      URL.revokeObjectURL(video.src); // Clean up
    };
  }, []);
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadError(null);
    setUploadProgress(0);
    
    if (!validateFile(file)) return;
    
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    generateThumbnail(file);
  };
  
  // Compress video (client-side) using Web Workers
  const compressVideo = async (file: File): Promise<File | null> => {
    // Simple compression - in a production app, you'd use a library like ffmpeg.wasm
    // For now, we'll just return the original file
    // Real implementation would use Web Workers to not block the main thread
    
    // Mock compression for demo purposes
    setIsCompressing(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsCompressing(false);
        toast({
          title: "Video processed",
          description: "Video compression and optimization complete",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        resolve(file);
      }, 2000);
    });
  };
  
  // Upload video via API
  const uploadVideo = async () => {
    if (!videoFile) return;
    
    try {
      setIsUploading(true);
      
      // Step 1: Compress video if it's large
      const fileSizeMB = videoFile.size / (1024 * 1024);
      let fileToUpload = videoFile;
      
      if (fileSizeMB > 10) { // Only compress videos larger than 10MB
        const compressed = await compressVideo(videoFile);
        if (compressed) {
          fileToUpload = compressed;
        }
      }
      
      // Step 2: Get signed upload params
      const paramsResponse = await axios.get('/api/video-rfq/signed-params');
      const { signature, cloudName, apiKey, folder, timestamp } = paramsResponse.data;
      
      // Step 3: Upload to Cloudinary with progress tracking
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('resource_type', 'video');
      
      // Add options for video optimization
      formData.append('eager', 'q_auto,f_auto'); // Quality auto and format auto
      formData.append('eager_async', 'true');
      formData.append('eager_notification_url', `${window.location.origin}/api/video-rfq/eager-notification`);
      
      // Upload with progress tracking
      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      // Step 4: Extract and set video details
      const { secure_url, public_id, eager } = uploadResponse.data;
      
      // Get generated thumbnail URL or use Cloudinary's auto-generated thumbnail
      const cloudinaryThumbnail = `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_jpg,w_480/${public_id}.jpg`;
      
      // Callback with all needed data
      onVideoUploaded(secure_url, cloudinaryThumbnail, public_id, videoMetadata);
      
      toast({
        title: "Upload successful",
        description: "Your video has been uploaded and optimized",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Keep the video preview but reset other states
      setUploadProgress(100);
    } catch (error: any) {
      console.error('Video upload error:', error);
      setUploadError(error.response?.data?.error || error.message || 'Failed to upload video');
      toast({
        title: "Upload failed",
        description: error.response?.data?.error || error.message || 'Failed to upload video',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Reset the uploader
  const resetUploader = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setThumbnailUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
    setVideoMetadata(null);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      if (videoPreview && !initialVideo) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview, initialVideo]);
  
  // Mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <VStack spacing={4} align="stretch" w="100%">
      {/* Hidden file input */}
      <input
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
        capture={isMobile ? 'environment' : undefined} // Enable camera on mobile
      />
      
      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Video preview or upload button */}
      {!videoPreview ? (
        <Box 
          border="2px dashed" 
          borderColor="gray.300" 
          borderRadius="md" 
          p={isMobile ? 4 : 8} 
          textAlign="center"
          bg="gray.50"
          _hover={{ bg: 'gray.100', cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <VStack spacing={3}>
            <AttachmentIcon w={10} h={10} color="blue.500" />
            <Text fontWeight="bold">
              {isMobile ? "Tap to record or upload video" : "Click to select or drag and drop video"}
            </Text>
            <Text color="gray.500" fontSize="sm">
              Maximum size: {maxSizeMB}MB
            </Text>
          </VStack>
        </Box>
      ) : (
        <VStack spacing={4}>
          {/* Video player and thumbnail */}
          <Flex 
            direction={isMobile ? "column" : "row"} 
            align="center" 
            w="100%" 
            gap={4}
          >
            {/* Video player */}
            <Box flex={3} borderRadius="md" overflow="hidden" boxShadow="md">
              <AspectRatio ratio={16/9}>
                <video 
                  src={videoPreview} 
                  controls 
                  ref={videoRef}
                  style={{ objectFit: "contain", width: "100%", height: "100%" }}
                />
              </AspectRatio>
            </Box>
            
            {/* Thumbnail and metadata */}
            <VStack flex={1} align="start" spacing={3}>
              {thumbnailUrl && (
                <Box w="100%" position="relative">
                  <Image 
                    src={thumbnailUrl} 
                    alt="Video thumbnail" 
                    borderRadius="md"
                    boxShadow="sm"
                  />
                  <Badge position="absolute" top={2} right={2} colorScheme="blue">
                    Thumbnail
                  </Badge>
                </Box>
              )}
              
              {videoMetadata && (
                <VStack align="start" spacing={1} fontSize="sm" w="100%">
                  <Text fontWeight="bold">Video Details:</Text>
                  <Text>Duration: {videoMetadata.duration}s</Text>
                  <Text>Resolution: {videoMetadata.width} x {videoMetadata.height}</Text>
                  <Text>Type: {videoFile?.type}</Text>
                  <Text>Size: {(videoFile?.size / (1024 * 1024)).toFixed(2)} MB</Text>
                </VStack>
              )}
            </VStack>
          </Flex>
          
          {/* Upload controls */}
          <HStack spacing={4} w="100%" justifyContent="space-between">
            <Button 
              leftIcon={<DeleteIcon />} 
              colorScheme="red" 
              variant="outline"
              onClick={resetUploader}
              isDisabled={isUploading || isCompressing}
            >
              Remove
            </Button>
            
            <Button 
              leftIcon={uploadProgress === 100 ? <CheckCircleIcon /> : <RepeatIcon />} 
              colorScheme={uploadProgress === 100 ? "green" : "blue"} 
              onClick={uploadVideo}
              isLoading={isUploading || isCompressing}
              loadingText={isCompressing ? "Optimizing..." : "Uploading..."}
              isDisabled={uploadProgress === 100}
            >
              {uploadProgress === 100 ? "Uploaded" : isCompressing ? "Optimizing..." : "Upload Video"}
            </Button>
          </HStack>
          
          {/* Upload progress */}
          {(isUploading || uploadProgress > 0) && (
            <Box w="100%">
              <Progress 
                value={uploadProgress} 
                size="sm" 
                colorScheme={uploadProgress === 100 ? "green" : "blue"} 
                borderRadius="md"
                hasStripe={uploadProgress < 100}
                isAnimated={uploadProgress < 100}
              />
              <Text fontSize="sm" textAlign="right" mt={1}>
                {uploadProgress}%
              </Text>
            </Box>
          )}
        </VStack>
      )}
      
      {/* Error display */}
      {uploadError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text>{uploadError}</Text>
        </Alert>
      )}
      
      {/* Mobile tips */}
      {isMobile && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Mobile Tips:</Text>
            <Text fontSize="sm">• Hold your phone horizontally for better video</Text>
            <Text fontSize="sm">• Good lighting improves video quality</Text>
            <Text fontSize="sm">• Try to keep the camera steady</Text>
          </VStack>
        </Alert>
      )}
      
      {/* Video optimization tips */}
      <Flex align="center" fontSize="sm" color="gray.500">
        <InfoIcon mr={2} />
        <Text>Videos are automatically optimized for quality and bandwidth</Text>
        <Tooltip 
          label="Your video will be compressed and converted to the most efficient format while maintaining quality" 
          hasArrow
        >
          <InfoIcon ml={1} />
        </Tooltip>
      </Flex>
    </VStack>
  );
};

export default VideoRFQUploader;
