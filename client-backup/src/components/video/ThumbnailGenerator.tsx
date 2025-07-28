import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Image,
  HStack,
  Spinner,
  Icon,
  Flex
} from '@chakra-ui/react';
import { FiCamera, FiCheck, FiClock, FiImage, FiPlay, FiPause } from 'react-icons/fi';
import axios from 'axios';

export interface ThumbnailGeneratorProps {
  videoUrl: string;
  publicId: string;
  onThumbnailGenerated: (thumbnailUrl: string) => void;
}

const ThumbnailGenerator: FC<ThumbnailGeneratorProps> = ({
  videoUrl,
  publicId,
  onThumbnailGenerated
}) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Generate default thumbnails when the component mounts
  useEffect(() => {
    if (publicId) {
      generateDefaultThumbnails();
    }
  }, [publicId]);

  // Calculate formatted time from slider value
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Generate thumbnails at specific points in the video
  const generateDefaultThumbnails = async () => {
    setLoading(true);
    try {
      // Get video duration
      const videoElement = document.createElement('video');
      videoElement.src = videoUrl;
      
      videoElement.onloadedmetadata = async () => {
        const duration = videoElement.duration;
        setVideoDuration(duration);
        
        // Generate thumbnails at 10%, 25%, 50%, 75%, and 90% of video duration
        const thumbnailTimes = [
          Math.floor(duration * 0.1),
          Math.floor(duration * 0.25),
          Math.floor(duration * 0.5),
          Math.floor(duration * 0.75),
          Math.floor(duration * 0.9)
        ];
        
        const thumbnailUrls = [];
        
        for (const time of thumbnailTimes) {
          const formattedTime = formatTimeForCloudinary(time);
          const url = await generateThumbnailUrl(formattedTime);
          if (url) {
            thumbnailUrls.push(url);
          }
        }
        
        setThumbnails(thumbnailUrls);
        
        // Set the default selected thumbnail (middle one)
        if (thumbnailUrls.length > 0) {
          const middleIndex = Math.floor(thumbnailUrls.length / 2);
          const selectedUrl = thumbnailUrls[middleIndex];
          setSelectedThumbnail(selectedUrl);
          setThumbnailUrl(selectedUrl);
          onThumbnailGenerated(selectedUrl);
        }
        
        setLoading(false);
      };
    } catch (error) {
      console.error('Error generating default thumbnails:', error);
      setLoading(false);
      // Using console.error instead of toast for compatibility
      console.error('Failed to generate thumbnails. Please try again.');
    }
  };

  // Format time for Cloudinary (HH:MM:SS)
  const formatTimeForCloudinary = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate a thumbnail at a specific timestamp
  const generateThumbnailUrl = async (timestamp: string): Promise<string | null> => {
    try {
      const response = await axios.post('/api/video-processing/thumbnail', {
        publicId,
        timestamp
      });
      
      return response.data.url;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  };

  // Generate a custom thumbnail based on slider position
  const generateCustomThumbnail = async () => {
    setIsGenerating(true);
    try {
      const timestamp = formatTimeForCloudinary(sliderValue);
      const url = await generateThumbnailUrl(timestamp);
      
      if (url) {
        setThumbnails(prev => [url, ...prev]);
        setSelectedThumbnail(url);
        setThumbnailUrl(url);
        onThumbnailGenerated(url);
      }
    } catch (error) {
      console.error('Error generating custom thumbnail:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle slider change
  const handleSliderChange = useCallback((value: number) => {
    setSliderValue(value);
    
    // Update video current time if video reference exists
    if (videoRef.current) {
      videoRef.current.currentTime = value;
    }
  }, []);

  // Handle video play/pause
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Handle video timeupdate event
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setSliderValue(videoRef.current.currentTime);
    }
  }, []);

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" boxShadow="sm">
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p={6}>
          <VStack spacing={3}>
            <Spinner size="lg" color="blue.500" thickness="3px" speed="0.8s" />
            <Text color="blue.500" fontWeight="medium">Loading video...</Text>
          </VStack>
        </Box>
      )}
      {!loading && (
        <Box>
          <Box borderWidth="1px" borderRadius="md" p={4} mb={4} bg="white" boxShadow="xs">
            <HStack justify="space-between" mb={3}>
              <HStack>
                <Icon as={FiImage} color="blue.500" />
                <Text fontWeight="bold">Generate Thumbnail</Text>
              </HStack>
              <Text color="gray.500" fontSize="sm" fontWeight="medium" bg="gray.50" px={2} py={1} borderRadius="md">
                {formatTime(sliderValue)} / {formatTime(videoDuration)}
              </Text>
            </HStack>

            <Box mb={4}>
              <Box
                width="100%"
                height="8px"
                bg="gray.200"
                borderRadius="full"
                position="relative"
                cursor="pointer"
                onClick={(e) => {
                  if (!videoDuration || isGenerating) return;

                  const rect = e.currentTarget.getBoundingClientRect();
                  const offsetX = e.clientX - rect.left;
                  const newValue = (offsetX / rect.width) * videoDuration;
                  handleSliderChange(Math.max(0, Math.min(videoDuration, newValue)));
                }}
              >
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  height="100%"
                  width={`${(sliderValue / videoDuration) * 100}%`}
                  bg="blue.500"
                  borderRadius="full"
                />
                <Box
                  position="absolute"
                  left={`${(sliderValue / videoDuration) * 100}%`}
                  top="50%"
                  transform="translate(-50%, -50%)"
                  width="16px"
                  height="16px"
                  borderRadius="full"
                  bg="blue.500"
                  border="2px solid white"
                  boxShadow="md"
                  onMouseDown={(e) => {
                    if (!videoDuration || isGenerating) return;

                    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                    if (!rect) return;

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const offsetX = moveEvent.clientX - rect.left;
                      const newValue = (offsetX / rect.width) * videoDuration;
                      handleSliderChange(Math.max(0, Math.min(videoDuration, newValue)));
                    };

                    const handleMouseUp = () => {
                      window.removeEventListener('mousemove', handleMouseMove);
                      window.removeEventListener('mouseup', handleMouseUp);
                    };

                    window.addEventListener('mousemove', handleMouseMove);
                    window.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </Box>
            </Box>

            <Box mb={4} position="relative" borderRadius="md" overflow="hidden" bg="black">
              <video
                src={videoUrl}
                width="100%"
                height="auto"
                style={{ display: 'block' }}
                controls={false}
                ref={videoRef}
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  setVideoDuration(video.duration);
                }}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Custom play/pause overlay button */}
              <Box 
                position="absolute" 
                top="50%" 
                left="50%" 
                transform="translate(-50%, -50%)"
                borderRadius="full"
                bg="blackAlpha.600"
                color="white"
                width="50px"
                height="50px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                onClick={handlePlayPause}
                transition="all 0.2s"
                _hover={{ bg: "blackAlpha.700", transform: "translate(-50%, -50%) scale(1.1)" }}
              >
                <Icon as={isPlaying ? FiPause : FiPlay} boxSize={5} />
              </Box>
            </Box>

            <HStack justify="space-between">
              <Button
                size="sm"
                colorScheme="blue"
                onClick={generateCustomThumbnail}
                isDisabled={isGenerating}
                _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                transition="all 0.2s"
              >
                {isGenerating ? (
                  <HStack>
                    <Spinner size="sm" />
                    <Text>Generating...</Text>
                  </HStack>
                ) : (
                  <HStack>
                    <Icon as={FiCamera} />
                    <Text>Generate Thumbnail</Text>
                  </HStack>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handlePlayPause}
                _hover={{ bg: isPlaying ? "red.50" : "blue.50" }}
                transition="all 0.2s"
              >
                <HStack>
                  <Icon as={isPlaying ? FiPause : FiPlay} />
                  <Text>{isPlaying ? "Pause" : "Preview"}</Text>
                </HStack>
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
      {thumbnails.length > 0 && (
        <Box borderWidth="1px" borderRadius="md" p={4} boxShadow="xs" bg="white">
          <HStack justify="space-between" mb={3}>
            <HStack>
              <Icon as={FiImage} color="blue.500" />
              <Text fontWeight="bold">Generated Thumbnails</Text>
            </HStack>
            <Text 
              fontSize="xs" 
              color="blue.500"
              bg="blue.50"
              px={2}
              py={1}
              borderRadius="full"
              fontWeight="medium"
            >
              Click to select
            </Text>
          </HStack>

          <Box overflowX="auto" py={2}>
            <Flex gap={3} flexWrap="nowrap">
              {thumbnails.map((thumb, index) => (
                <Box
                  key={index}
                  borderWidth="2px"
                  borderRadius="md"
                  borderColor={thumbnailUrl === thumb ? 'blue.500' : 'gray.200'}
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() => {
                    setThumbnailUrl(thumb);
                    onThumbnailGenerated(thumb);
                  }}
                  position="relative"
                  width="120px"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                >
                  <Image
                    src={thumb}
                    alt={`Thumbnail ${index + 1}`}
                    objectFit="cover"
                    height="67px" // 16:9 aspect ratio
                    width="120px"
                  />
                  {thumbnailUrl === thumb && (
                    <Box
                      position="absolute"
                      top={0}
                      right={0}
                      bg="blue.500"
                      color="white"
                      borderRadius="0 0 0 md"
                      p={1}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiCheck} boxSize={3} />
                    </Box>
                  )}
                </Box>
              ))}
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ThumbnailGenerator;
