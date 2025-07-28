import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Button,
  IconButton,
  SimpleGrid,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Image,
  AspectRatio,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { FaCamera, FaDownload, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';

interface ThumbnailGeneratorProps {
  videoUrl: string;
  onThumbnailGenerated: (thumbnailUrl: string, timestamp: number) => void;
  aspectRatio?: number;
  maxWidth?: string;
}

export const VideoThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({
  videoUrl,
  onThumbnailGenerated,
  aspectRatio = 16/9,
  maxWidth = '100%'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      
      // Generate initial thumbnails automatically
      if (video.duration > 0) {
        generateAutoThumbnails();
      }
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl]);

  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate a single thumbnail at the current time
  const generateThumbnail = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    // Get video dimensions while maintaining aspect ratio
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Set canvas size based on video dimensions but cap at reasonable size
    const maxCanvasWidth = 640;
    const scale = Math.min(1, maxCanvasWidth / videoWidth);
    canvas.width = videoWidth * scale;
    canvas.height = videoHeight * scale;
    
    // Draw the current video frame to the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
    
    // Add to thumbnails array
    const newThumbnails = [...thumbnails, thumbnailUrl];
    setThumbnails(newThumbnails);
    
    // Select this thumbnail
    setSelectedThumbnail(thumbnailUrl);
    
    // Notify parent component
    onThumbnailGenerated(thumbnailUrl, video.currentTime);
    
    toast({
      title: "Thumbnail captured",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Generate automatic thumbnails at different points in the video
  const generateAutoThumbnails = async () => {
    setIsGenerating(true);
    const video = videoRef.current;
    if (!video) {
      setIsGenerating(false);
      return;
    }
    
    // Clear existing thumbnails
    setThumbnails([]);
    
    // Generate 5 thumbnails at evenly spaced intervals
    const totalDuration = video.duration;
    const timePoints = [
      totalDuration * 0.1, // 10% in
      totalDuration * 0.25, // 25% in
      totalDuration * 0.5,  // Middle
      totalDuration * 0.75, // 75% in
      totalDuration * 0.9   // 90% in
    ];
    
    const newThumbnails: string[] = [];
    
    for (const timePoint of timePoints) {
      await new Promise<void>((resolve) => {
        // Set the video time
        video.currentTime = timePoint;
        
        // Wait for the video to seek to that position
        const seeked = () => {
          const canvas = canvasRef.current;
          if (!canvas) {
            resolve();
            return;
          }
          
          // Set canvas size based on video dimensions
          canvas.width = 320;  // Fixed thumbnail width
          canvas.height = 320 / aspectRatio;
          
          // Draw the current frame to the canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve();
            return;
          }
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL and add to array
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
          newThumbnails.push(thumbnailUrl);
          
          video.removeEventListener('seeked', seeked);
          resolve();
        };
        
        video.addEventListener('seeked', seeked, { once: true });
      });
    }
    
    setThumbnails(newThumbnails);
    
    // Select the middle thumbnail by default
    if (newThumbnails.length > 0) {
      const middleIndex = Math.floor(newThumbnails.length / 2);
      setSelectedThumbnail(newThumbnails[middleIndex]);
      onThumbnailGenerated(newThumbnails[middleIndex], timePoints[middleIndex]);
    }
    
    setIsGenerating(false);
  };

  // Seek to a specific time in the video
  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = time;
    setCurrentTime(time);
    setSliderValue(time);
  };

  // Handle slider change
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    seekTo(value);
  };

  // Select specific thumbnail
  const selectThumbnail = (thumbnail: string) => {
    setSelectedThumbnail(thumbnail);
    
    // Find the index of this thumbnail and use corresponding timePoint
    const index = thumbnails.indexOf(thumbnail);
    if (index !== -1 && videoRef.current) {
      // Approximate the time based on the thumbnail index
      const timePoint = videoRef.current.duration * (index + 1) / (thumbnails.length + 1);
      onThumbnailGenerated(thumbnail, timePoint);
      
      // Jump to that position in the video
      seekTo(timePoint);
    }
  };

  // Skip forward or backward
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = Math.min(Math.max(currentTime + seconds, 0), duration);
    seekTo(newTime);
  };

  // Confirm selected thumbnail
  const confirmSelection = () => {
    if (selectedThumbnail) {
      onClose();
      toast({
        title: "Thumbnail selected",
        description: "This thumbnail will be used for your video",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box width="100%" maxWidth={maxWidth}>
      <Button 
        onClick={onOpen} 
        leftIcon={<FaCamera />} 
        size="sm" 
        colorScheme="blue" 
        variant="outline" 
        mb={4}
      >
        Customize Video Thumbnail
      </Button>
      
      {selectedThumbnail && (
        <Box mt={2} borderRadius="md" overflow="hidden" boxShadow="sm">
          <Image src={selectedThumbnail} alt="Selected thumbnail" />
        </Box>
      )}
      
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate Video Thumbnail</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {/* Hidden video and canvas elements */}
            <Box display="none">
              <video ref={videoRef} src={videoUrl} preload="metadata" />
              <canvas ref={canvasRef} />
            </Box>
            
            <Box mb={4}>
              {selectedThumbnail ? (
                <AspectRatio ratio={aspectRatio}>
                  <Image 
                    src={selectedThumbnail} 
                    alt="Current thumbnail" 
                    borderRadius="md"
                  />
                </AspectRatio>
              ) : (
                <Flex 
                  justify="center" 
                  align="center" 
                  height="200px" 
                  bg="gray.100"
                  borderRadius="md"
                >
                  <Text color="gray.500">No thumbnail selected</Text>
                </Flex>
              )}
            </Box>
            
            <Box mb={6}>
              <HStack spacing={4} mb={2}>
                <IconButton
                  aria-label="Go back 5 seconds"
                  icon={<FaArrowLeft />}
                  onClick={() => skip(-5)}
                  size="sm"
                />
                <Button 
                  onClick={generateThumbnail} 
                  leftIcon={<FaCamera />} 
                  colorScheme="blue"
                  isDisabled={isGenerating}
                  flex={1}
                >
                  Capture Current Frame
                </Button>
                <IconButton
                  aria-label="Go forward 5 seconds"
                  icon={<FaArrowRight />}
                  onClick={() => skip(5)}
                  size="sm"
                />
              </HStack>
              
              <Flex align="center" mb={2}>
                <Text w="50px">{formatTime(sliderValue)}</Text>
                <Slider
                  aria-label="Video position"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={sliderValue}
                  onChange={handleSliderChange}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  flex={1}
                  mx={2}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg="blue.500"
                    color="white"
                    placement="top"
                    isOpen={showTooltip}
                    label={formatTime(sliderValue)}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
                <Text w="50px">{formatTime(duration)}</Text>
              </Flex>
            </Box>
            
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold">Auto-Generated Thumbnails</Text>
                <Button
                  size="sm"
                  leftIcon={isGenerating ? <Spinner size="xs" /> : undefined}
                  onClick={generateAutoThumbnails}
                  isDisabled={isGenerating}
                  colorScheme="blue"
                  variant="outline"
                >
                  {isGenerating ? 'Generating...' : 'Regenerate'}
                </Button>
              </Flex>
              
              {isGenerating ? (
                <Flex justify="center" align="center" height="100px">
                  <Spinner />
                  <Text ml={3}>Generating thumbnails...</Text>
                </Flex>
              ) : (
                <SimpleGrid columns={5} spacing={2}>
                  {thumbnails.map((thumbnail, idx) => (
                    <Box 
                      key={idx} 
                      borderWidth="2px" 
                      borderColor={selectedThumbnail === thumbnail ? 'blue.500' : 'transparent'}
                      borderRadius="md" 
                      overflow="hidden"
                      onClick={() => selectThumbnail(thumbnail)}
                      position="relative"
                      cursor="pointer"
                      _hover={{ shadow: "md" }}
                    >
                      <Image src={thumbnail} alt={`Thumbnail ${idx + 1}`} />
                      {selectedThumbnail === thumbnail && (
                        <Flex
                          position="absolute"
                          top={0}
                          right={0}
                          bg="blue.500"
                          color="white"
                          w="24px"
                          h="24px"
                          borderBottomLeftRadius="md"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <FaCheck size="12px" />
                        </Flex>
                      )}
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={confirmSelection}
              isDisabled={!selectedThumbnail}
              leftIcon={<FaCheck />}
            >
              Use This Thumbnail
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VideoThumbnailGenerator;
