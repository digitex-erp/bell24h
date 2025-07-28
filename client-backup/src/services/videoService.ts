import { useState, useEffect } from 'react';

// Video sources for different formats to ensure cross-browser compatibility
export const demoVideoSources = {
  mp4: 'https://storage.googleapis.com/bell24h-public/demo/bell24h-platform-demo.mp4',
  webm: 'https://storage.googleapis.com/bell24h-public/demo/bell24h-platform-demo.webm',
  poster: 'https://storage.googleapis.com/bell24h-public/demo/bell24h-platform-demo-poster.jpg'
};

// Video segments for the demo
export const videoSegments = [
  { 
    id: 'rfq-creation', 
    title: 'RFQ Creation', 
    timestamp: 0,
    description: 'Create detailed RFQs with voice, image, and video support'
  },
  { 
    id: 'supplier-matching', 
    title: 'AI Supplier Matching', 
    timestamp: 15,
    description: 'AI-powered supplier recommendations with SHAP/LIME explainability'
  },
  { 
    id: 'blockchain-verification', 
    title: 'Blockchain Verification', 
    timestamp: 30,
    description: 'Secure supplier verification with blockchain technology'
  },
  { 
    id: 'analytics-dashboard', 
    title: 'Analytics Dashboard', 
    timestamp: 45,
    description: 'Real-time analytics and insights for better decision making'
  }
];

// Hook for video playback control
export const useVideoControl = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
    const handleDurationChange = () => setDuration(videoElement.duration);
    const handleVolumeChange = () => setVolume(videoElement.volume);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedData = () => setIsLoaded(true);
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement || 
          (document as any).webkitFullscreenElement || 
          (document as any).mozFullScreenElement)
      );
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('volumechange', handleVolumeChange);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [videoRef]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.muted = !videoElement.muted;
    setIsMuted(videoElement.muted);
  };

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!isFullscreen) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if ((videoElement as any).webkitRequestFullscreen) {
        (videoElement as any).webkitRequestFullscreen();
      } else if ((videoElement as any).mozRequestFullScreen) {
        (videoElement as any).mozRequestFullScreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      }
    }
  };

  const seekTo = (time: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.currentTime = time;
  };

  const jumpToSegment = (segmentId: string) => {
    const segment = videoSegments.find(s => s.id === segmentId);
    if (segment && videoRef.current) {
      videoRef.current.currentTime = segment.timestamp;
      if (!isPlaying) {
        videoRef.current.play();
      }
    }
  };

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    isLoaded,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    seekTo,
    jumpToSegment
  };
};
