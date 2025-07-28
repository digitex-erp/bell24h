import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  VStack,
  Flex,
  Icon
} from '@chakra-ui/react';
import { 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolumeX, 
  FiMaximize, 
  FiMinimize,
  FiZap
} from 'react-icons/fi';
import axios from 'axios';

export interface VideoAnalyticsPlayerProps {
  videoUrl: string;
  publicId: string;
  onProcessed?: () => void;
  resourceType?: string;
  resourceId?: string;
  autoAnalytics?: boolean;
}

const VideoAnalyticsPlayer: React.FC<VideoAnalyticsPlayerProps> = ({
  videoUrl,
  publicId,
  onProcessed,
  resourceType = 'product_showcase',
  resourceId,
  autoAnalytics = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastTrackedProgress, setLastTrackedProgress] = useState(0);

  // Track analytics when the component mounts
  useEffect(() => {
    if (autoAnalytics && publicId) {
      trackVideoActivity('load');
    }
    
    // Process the video for adaptive streaming when it loads
    if (publicId) {
      processVideo();
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [publicId, autoAnalytics]);

  // Process video for adaptive streaming and thumbnails
  const processVideo = async () => {
    try {
      await axios.post('/api/video-processing', {
        videoUrl,
        publicId
      });
      
      if (onProcessed) {
        onProcessed();
      }
    } catch (error) {
      console.error('Error processing video:', error);
    }
  };

  // Track video analytics
  const trackVideoActivity = async (activityType: string) => {
    if (!publicId) return;
    
    try {
      const currentTime = videoRef.current?.currentTime || 0;
      const totalDuration = videoRef.current?.duration || 0;
      
      await axios.post(`/api/${resourceType}s/${resourceId || 'track-video'}`, {
        activity_type: activityType,
        video_id: publicId,
        position: currentTime,
        duration: totalDuration,
        device_info: navigator.userAgent,
        metadata: JSON.stringify({
          referrer: document.referrer || 'direct',
          screen: `${window.screen.width}x${window.screen.height}`
        })
      });
      
      // Only update last tracked progress on progress events
      if (activityType === 'progress') {
        setLastTrackedProgress(currentTime);
      }
    } catch (error) {
      console.error('Error tracking video activity:', error);
    }
  };

  // Play/Pause video
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        trackVideoActivity('pause');
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      } else {
        videoRef.current.play();
        trackVideoActivity('play');
        
        // Track progress every 15 seconds or 10% of the video duration
        progressInterval.current = setInterval(() => {
          const currentTime = videoRef.current?.currentTime || 0;
          const totalDuration = videoRef.current?.duration || 0;
          
          // Only track if we've moved at least 10% from the last tracked position
          if (currentTime > 0 && totalDuration > 0) {
            const progressPercentage = (currentTime / totalDuration) * 100;
            const lastTrackedPercentage = (lastTrackedProgress / totalDuration) * 100;
            
            if (
              currentTime - lastTrackedProgress >= 15 || // Track every 15 seconds
              progressPercentage - lastTrackedPercentage >= 10 // Or every 10% progress
            ) {
              trackVideoActivity('progress');
            }
          }
        }, 5000); // Check every 5 seconds
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle video events
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const percentage = (currentTime / duration) * 100;
      setProgress(percentage);
      
      // Track video completion
      if (currentTime >= duration * 0.95 && isPlaying) {
        trackVideoActivity('complete');
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    trackVideoActivity('complete');
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const handleProgressChange = (value: number) => {
    if (videoRef.current) {
      const newTime = (value / 100) * duration;
      videoRef.current.currentTime = newTime;
      setProgress(value);
      trackVideoActivity('seek');
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  // Additional state for player UI enhancement
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Handle mouse interactions for player controls
  const handleMouseEnter = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2000);
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2000);
    }
  }, [isPlaying]);

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="md" 
      overflow="hidden" 
      position="relative" 
      bg="black"
      boxShadow="md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Video container with 16:9 aspect ratio */}
      <Box position="relative" width="100%" paddingBottom="56.25%">
        <video
          ref={videoRef}
          src="https://example.com/video.mp4"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onClick={togglePlay}
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', background: 'black' }}
          playsInline
        />

        {/* Large play button overlay when paused */}
        {!isPlaying && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width="80px"
            height="80px"
            borderRadius="full"
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            onClick={togglePlay}
            transition="all 0.2s"
            _hover={{ bg: 'blackAlpha.700', transform: 'translate(-50%, -50%) scale(1.1)' }}
          >
            <Icon as={FiPlay} color="white" boxSize={10} />
          </Box>
        )}

        {/* Custom Progress Bar */}
        <Box
          position="relative"
          width="100%"
          height="5px"
          bg="rgba(255,255,255,0.2)"
          borderRadius="full"
          mb={3}
          cursor="pointer"
          _hover={{ height: '8px' }}
          transition="height 0.2s ease"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            handleProgressChange(pos * 100);
          }}
        >
          {/* Progress filled track */}
          <Box
            position="absolute"
            left={0}
            top={0}
            height="100%"
            width={`${progress}%`}
            bg="blue.400"
            borderRadius="full"
          />

          {/* Progress thumb indicator */}
          <Box
            position="absolute"
            left={`${progress}%`}
            top="50%"
            transform="translate(-50%, -50%)"
            width="12px"
            height="12px"
            borderRadius="full"
            bg="blue.400"
            boxShadow="0 0 0 2px white"
            opacity={true ? 1 : 0}
            transition="opacity 0.3s ease"
          />

          {/* Buffer progress indicator */}
          <Box
            position="absolute"
            left={0}
            top={0}
            height="100%"
            width={`${Math.min((videoRef.current?.buffered.length ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / duration : 0) * 100, 100)}%`}
            bg="whiteAlpha.400"
            borderRadius="full"
          />
        </Box>

        {/* Controls Bar */}
        <Flex width="100%" justify="space-between" align="center">
          <HStack>
            {/* Play/Pause button */}
            <Box
              as="button"
              onClick={togglePlay}
              p={2}
              borderRadius="full"
              bg="whiteAlpha.200"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="32px"
              height="32px"
              _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.05)' }}
              transition="all 0.2s"
              mr={2}
            >
              <Icon as={isPlaying ? FiPause : FiPlay} boxSize={4} />
            </Box>

            {/* Volume control */}
            <HStack mr={2}>
              <Box
                as="button"
                onClick={toggleMute}
                p={2}
                borderRadius="full"
                bg="whiteAlpha.200"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="32px"
                height="32px"
                _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.05)' }}
                transition="all 0.2s"
                mr={2}
              >
                <Icon as={isMuted ? FiVolumeX : FiVolume2} boxSize={4} />
              </Box>

              {/* Custom Volume Slider */}
              <Box
                width="60px"
                height="4px"
                bg="whiteAlpha.300"
                borderRadius="full"
                position="relative"
                display="inline-block"
                cursor="pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const vol = (e.clientX - rect.left) / rect.width;
                  handleVolumeChange(vol);
                }}
                _hover={{ height: '5px' }}
                transition="height 0.2s"
              >
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  height="100%"
                  width={`${(isMuted ? 0 : volume) * 100}%`}
                  bg="blue.400"
                  borderRadius="full"
                />

                {/* Volume thumb */}
                <Box
                  position="absolute"
                  left={`${(isMuted ? 0 : volume) * 100}%`}
                  top="50%"
                  transform="translate(-50%, -50%)"
                  width="10px"
                  height="10px"
                  borderRadius="full"
                  bg="blue.400"
                  boxShadow="0 0 0 2px white"
                />
              </Box>
            </HStack>

            {/* Time display */}
            <Box color="white" fontSize="xs" fontWeight="medium" px={2} py={1} bg="whiteAlpha.200" borderRadius="md">
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </Box>
          </HStack>

          <HStack>
            {/* Analytics indicator */}
            <Box
              p={1}
              borderRadius="md"
              bg={autoAnalytics ? 'green.500' : 'transparent'}
              color="white"
              display="flex"
              alignItems="center"
              fontSize="xs"
              mr={2}
            >
              <Icon as={FiZap} boxSize={3} mr={1} />
              <Text fontSize="xs" display={{ base: 'none', md: 'block' }}>
                Analytics
              </Text>
            </Box>

            {/* Fullscreen button */}
            <Box
              as="button"
              onClick={toggleFullscreen}
              p={2}
              borderRadius="full"
              bg="whiteAlpha.200"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="32px"
              height="32px"
              _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.05)' }}
              transition="all 0.2s"
            >
              <Icon as={isFullscreen ? FiMinimize : FiMaximize} boxSize={4} />
            </Box>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default VideoAnalyticsPlayer;
