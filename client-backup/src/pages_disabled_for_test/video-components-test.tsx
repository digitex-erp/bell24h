import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  Divider, 
  Text,
  Button,
  useToast
} from '@chakra-ui/react';
import VideoRFQUploader from '../components/video/VideoRFQUploader';
import ThumbnailGenerator from '../components/video/ThumbnailGenerator';
import VideoAnalyticsPlayer from '../components/video/VideoAnalyticsPlayer';

const VideoComponentsTest: React.FC = () => {
  const toast = useToast();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [publicId, setPublicId] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [step, setStep] = useState<number>(1);

  const handleUploadComplete = (url: string, videoPublicId: string) => {
    setVideoUrl(url);
    setPublicId(videoPublicId);
    setStep(2);
    toast({
      title: 'Video uploaded successfully',
      description: 'You can now generate a thumbnail',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleThumbnailGenerated = (url: string) => {
    setThumbnailUrl(url);
    setStep(3);
    toast({
      title: 'Thumbnail generated',
      description: 'Thumbnail has been created successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const mockAnalyticsTracking = (activityType: string, position: number) => {
    console.log(`Analytics tracked: ${activityType} at position ${position}`);
    toast({
      title: 'Analytics event tracked',
      description: `${activityType} at position ${position}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" mb={8} textAlign="center">
        Video Components Test Page
      </Heading>

      <VStack spacing={10} align="stretch">
        {/* Step 1: Video Upload */}
        <Box 
          p={6} 
          borderWidth="1px" 
          borderRadius="lg" 
          boxShadow={step === 1 ? "lg" : "base"}
          bg={step === 1 ? "blue.50" : "white"}
        >
          <Heading as="h2" size="md" mb={4}>
            Step 1: Video Upload
          </Heading>
          <VideoRFQUploader 
            onUploadComplete={handleUploadComplete} 
            maxSizeMB={100}
            resourceType="tests"
          />
        </Box>

        {/* Step 2: Thumbnail Generation */}
        <Box 
          p={6} 
          borderWidth="1px" 
          borderRadius="lg"
          boxShadow={step === 2 ? "lg" : "base"}
          bg={step === 2 ? "blue.50" : "white"}
          opacity={videoUrl ? 1 : 0.5}
          pointerEvents={videoUrl ? "auto" : "none"}
        >
          <Heading as="h2" size="md" mb={4}>
            Step 2: Thumbnail Generation
          </Heading>
          {videoUrl ? (
            <ThumbnailGenerator
              videoUrl={videoUrl}
              publicId={publicId}
              onThumbnailGenerated={handleThumbnailGenerated}
              width={640}
              height={360}
            />
          ) : (
            <Text>Upload a video first to generate thumbnails</Text>
          )}
        </Box>

        {/* Step 3: Video Player with Analytics */}
        <Box 
          p={6} 
          borderWidth="1px" 
          borderRadius="lg"
          boxShadow={step === 3 ? "lg" : "base"}
          bg={step === 3 ? "blue.50" : "white"}
          opacity={thumbnailUrl ? 1 : 0.5}
          pointerEvents={thumbnailUrl ? "auto" : "none"}
        >
          <Heading as="h2" size="md" mb={4}>
            Step 3: Video Player with Analytics
          </Heading>
          {videoUrl ? (
            <VideoAnalyticsPlayer
              src={videoUrl}
              publicId={publicId}
              posterUrl={thumbnailUrl || undefined}
              resourceType="tests"
              // For testing without a working API
              onActivityTracked={(activity, position) => mockAnalyticsTracking(activity, position)}
            />
          ) : (
            <Text>Upload a video first to play it with analytics</Text>
          )}
        </Box>

        {/* Results Summary */}
        {videoUrl && (
          <Box p={6} borderWidth="1px" borderRadius="lg">
            <Heading as="h2" size="md" mb={4}>
              Component Test Results
            </Heading>
            <VStack align="stretch" spacing={4}>
              <Text><strong>Video URL:</strong> {videoUrl.substring(0, 50)}...</Text>
              <Text><strong>Public ID:</strong> {publicId}</Text>
              {thumbnailUrl && (
                <Text><strong>Thumbnail URL:</strong> {thumbnailUrl.substring(0, 50)}...</Text>
              )}
              <Divider />
              <Button 
                colorScheme="green" 
                isDisabled={!thumbnailUrl}
                onClick={() => {
                  toast({
                    title: 'Test Completed Successfully',
                    description: 'All video components are working correctly!',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                  });
                }}
              >
                Complete Test
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default VideoComponentsTest;
