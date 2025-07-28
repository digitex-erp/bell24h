import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  AspectRatio,
  Text,
  Badge,
  Flex,
  Progress,
  IconButton,
  HStack,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip
} from '@chakra-ui/react';
import {
  FaPlay, 
  FaPause, 
  FaRedo, 
  FaCog, 
  FaInfoCircle, 
  FaDownload, 
  FaStepBackward, 
  FaStepForward,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
import axios from 'axios';

interface VideoAnalyticsPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  videoId: string;
  title?: string;
  autoplay?: boolean;
  allowDownload?: boolean;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
  height?: string;
  maxWidth?: string;
  videoMetadata?: any;
  adaptiveStreaming?: {
    hls?: string;
    dash?: string;
  };
}

export const VideoAnalyticsPlayer: React.FC<VideoAnalyticsPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  videoId,
  title,
  autoplay = false,
  allowDownload = false,
  onEnded,
  onProgress,
  height = '400px',
  maxWidth = '100%',
  videoMetadata,
  adaptiveStreaming
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState<'auto' | 'high' | 'medium' | 'low'>('auto');
  const [showControls, setShowControls] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  
  const progressBarColor = useColorModeValue('blue.500', 'blue.300');
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  
  // Track when video is first played
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  
  // Determine best video source based on connection speed and device capabilities
  const getBestVideoSource = () => {
    if (!videoRef.current) return videoUrl;
    
    // Use adaptive streaming if available
    if (adaptiveStreaming) {
      // Check if browser supports HLS natively (Safari)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (adaptiveStreaming.hls && (isSafari || window.MediaSource)) {
        return adaptiveStreaming.hls;
      }
      
      // DASH is a fallback for browsers that support MSE but not HLS
      if (adaptiveStreaming.dash && window.MediaSource) {
        return adaptiveStreaming.dash;
      }
    }
    
    // Fall back to direct video URL if no adaptive streaming is available
    return videoUrl;
  };
  
  // Initialize with the best video source
  const [currentSource, setCurrentSource] = useState(getBestVideoSource());
  
  // Track video playback events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const trackEvent = async (action: string) => {
      try {
        await axios.post('/api/video-rfq/track', {
          videoId,
          action,
          position: video.currentTime,
          duration: video.duration
        });
      } catch (error) {
        console.error('Failed to track video analytics:', error);
      }
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      if (!hasStartedPlaying) {
        trackEvent('play');
        setHasStartedPlaying(true);
      } else {
        trackEvent('resume');
      }
    };
    
    const handlePause = () => {
      if (!video.seeking) {
        setIsPlaying(false);
        trackEvent('pause');
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      trackEvent('complete');
      if (onEnded) onEnded();
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progressValue = (video.currentTime / video.duration) * 100;
      setProgress(progressValue);
      
      // Report progress at 25%, 50%, 75% marks
      if (onProgress) {
        onProgress(progressValue);
      }
      
      // Track quartile events
      if (Math.floor(progressValue) === 25) trackEvent('progress_25');
      if (Math.floor(progressValue) === 50) trackEvent('progress_50');
      if (Math.floor(progressValue) === 75) trackEvent('progress_75');
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    const handleRateChange = () => {
      setPlaybackRate(video.playbackRate);
    };
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', handleRateChange);
    
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ratechange', handleRateChange);
    };
  }, [videoId, hasStartedPlaying, onEnded, onProgress]);
  
  // Fetch view count on component mount
  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        const response = await axios.get(`/api/video-rfq/analytics/${videoId}`);
        setViewCount(response.data.viewCount || 0);
      } catch (error) {
        console.error('Failed to fetch view count:', error);
      }
    };
    
    fetchViewCount();
  }, [videoId]);
  
  // Handle play/pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  
  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle seeking in the video
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * video.duration;
    
    video.currentTime = newTime;
  };
  
  // Handle quality change
  const changeQuality = (newQuality: 'auto' | 'high' | 'medium' | 'low') => {
    setQuality(newQuality);
    
    const video = videoRef.current;
    if (!video) return;
    
    // Save current position
    const currentPosition = video.currentTime;
    const wasPlaying = !video.paused;
    
    // Change source based on quality selection
    // In a real implementation, you'd have different quality sources available
    // Here we're just simulating it
    setCurrentSource(getBestVideoSource());
    
    // After source change, restore position and play state
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = currentPosition;
      if (wasPlaying) video.play();
    }, { once: true });
  };
  
  // Handle playback rate change
  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
  };
  
  // Skip forward/backward
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration);
  };
  
  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
  };
  
  return (
    <Box
      position="relative"
      width="100%"
      maxWidth={maxWidth}
      height={height}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
    >
      <AspectRatio ratio={16 / 9}>
        <Box as="video"
          ref={videoRef}
          src={currentSource}
          poster={thumbnailUrl}
          autoPlay={autoplay}
          preload="metadata"
          onClick={togglePlayPause}
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
        />
      </AspectRatio>
      
      {/* Video title overlay */}
      {title && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          p={2}
          bg="rgba(0,0,0,0.5)"
          color="white"
          transition="opacity 0.3s"
          opacity={showControls ? 1 : 0}
        >
          <Text fontWeight="bold" isTruncated>
            {title}
          </Text>
        </Box>
      )}
      
      {/* Video controls */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        bg="rgba(0,0,0,0.7)"
        p={2}
        transition="opacity 0.3s"
        opacity={showControls ? 1 : 0}
      >
        {/* Progress bar */}
        <Box
          width="100%"
          height="8px"
          bg={bgColor}
          borderRadius="full"
          mb={2}
          onClick={handleSeek}
          cursor="pointer"
          position="relative"
        >
          <Box
            height="100%"
            width={`${progress}%`}
            bg={progressBarColor}
            borderRadius="full"
            transition="width 0.1s"
          />
        </Box>
        
        {/* Control buttons */}
        <Flex justifyContent="space-between" alignItems="center">
          <HStack spacing={2}>
            <IconButton
              aria-label={isPlaying ? 'Pause' : 'Play'}
              icon={isPlaying ? <FaPause /> : <FaPlay />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={togglePlayPause}
            />
            
            <IconButton
              aria-label="Rewind 10s"
              icon={<FaStepBackward />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={() => skip(-10)}
            />
            
            <IconButton
              aria-label="Forward 10s"
              icon={<FaStepForward />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={() => skip(10)}
            />
            
            <Text color="white" fontSize="sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </HStack>
          
          <HStack spacing={2}>
            {/* Volume control */}
            <IconButton
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={toggleMute}
            />
            
            {/* Video quality selector */}
            <Menu>
              <MenuButton 
                as={IconButton}
                aria-label="Settings"
                icon={<FaCog />}
                size="sm"
                variant="ghost"
                color="white"
              />
              <MenuList>
                <MenuItem onClick={() => changeQuality('auto')}>
                  Auto {quality === 'auto' && '✓'}
                </MenuItem>
                <MenuItem onClick={() => changeQuality('high')}>
                  High Quality {quality === 'high' && '✓'}
                </MenuItem>
                <MenuItem onClick={() => changeQuality('medium')}>
                  Medium Quality {quality === 'medium' && '✓'}
                </MenuItem>
                <MenuItem onClick={() => changeQuality('low')}>
                  Low Quality {quality === 'low' && '✓'}
                </MenuItem>
                <MenuItem onClick={() => changePlaybackRate(0.5)}>
                  Speed: 0.5x {playbackRate === 0.5 && '✓'}
                </MenuItem>
                <MenuItem onClick={() => changePlaybackRate(1)}>
                  Speed: Normal {playbackRate === 1 && '✓'}
                </MenuItem>
                <MenuItem onClick={() => changePlaybackRate(1.5)}>
                  Speed: 1.5x {playbackRate === 1.5 && '✓'}
                </MenuItem>
                <MenuItem onClick={() => changePlaybackRate(2)}>
                  Speed: 2x {playbackRate === 2 && '✓'}
                </MenuItem>
              </MenuList>
            </Menu>
            
            {/* Stats toggle */}
            <Tooltip label="Video Statistics">
              <IconButton
                aria-label="Video Statistics"
                icon={<FaInfoCircle />}
                size="sm"
                variant="ghost"
                color="white"
                onClick={() => setShowStats(!showStats)}
              />
            </Tooltip>
            
            {/* Download button */}
            {allowDownload && (
              <Tooltip label="Download Video">
                <IconButton
                  as="a"
                  href={videoUrl}
                  download
                  aria-label="Download Video"
                  icon={<FaDownload />}
                  size="sm"
                  variant="ghost"
                  color="white"
                  target="_blank"
                />
              </Tooltip>
            )}
          </HStack>
        </Flex>
      </Box>
      
      {/* Video statistics overlay */}
      {showStats && (
        <Box
          position="absolute"
          top="10px"
          right="10px"
          bg="rgba(0,0,0,0.7)"
          color="white"
          p={2}
          borderRadius="md"
          fontSize="sm"
        >
          <Text fontWeight="bold" mb={1}>Video Stats</Text>
          <Text>Views: {viewCount}</Text>
          {videoMetadata && (
            <>
              <Text>Resolution: {videoMetadata.width}x{videoMetadata.height}</Text>
              <Text>Duration: {formatTime(videoMetadata.duration || duration)}</Text>
            </>
          )}
          <Text>Current Quality: {quality}</Text>
        </Box>
      )}
      
      {/* Mobile play button overlay - shown on mobile or when video is paused */}
      {!isPlaying && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="rgba(0,0,0,0.5)"
          borderRadius="full"
          width="60px"
          height="60px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={togglePlayPause}
        >
          <FaPlay color="white" />
        </Box>
      )}
    </Box>
  );
};

export default VideoAnalyticsPlayer;
