import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ChevronRight } from 'lucide-react';
import { demoVideoSources, videoSegments, useVideoControl } from '../services/videoService';

interface DemoVideoPlayerProps {
  onClose?: () => void;
}

const DemoVideoPlayer: React.FC<DemoVideoPlayerProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  
  const {
    isPlaying,
    currentTime,
    duration,
    isMuted,
    isLoaded,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    seekTo,
    jumpToSegment
  } = useVideoControl(videoRef);

  const handleSegmentClick = (segmentId: string) => {
    setActiveSegment(segmentId);
    jumpToSegment(segmentId);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seekTo(pos * duration);
  };

  // Determine current segment based on video time
  React.useEffect(() => {
    if (!isLoaded) return;
    
    const currentSegment = videoSegments.reduce((prev, current) => {
      if (currentTime >= current.timestamp && 
          (prev === null || current.timestamp > videoSegments.find(s => s.id === prev)?.timestamp!)) {
        return current.id;
      }
      return prev;
    }, null as string | null);
    
    if (currentSegment !== activeSegment) {
      setActiveSegment(currentSegment);
    }
  }, [currentTime, isLoaded, activeSegment]);

  return (
    <div 
      className="demo-video-player"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="demo-video-element"
        poster={demoVideoSources.poster}
        playsInline
        muted
        onClick={togglePlay}
      >
        <source src={demoVideoSources.mp4} type="video/mp4" />
        <source src={demoVideoSources.webm} type="video/webm" />
        Your browser does not support the video tag.
      </video>

      <div className={`video-overlay ${showControls || !isPlaying ? 'show' : ''}`}>
        <div className="video-controls">
          <button className="control-button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <div className="progress-container" onClick={handleProgressClick}>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="right-controls">
            <button className="control-button" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <button className="control-button" onClick={toggleFullscreen} aria-label="Fullscreen">
              <Maximize size={20} />
            </button>
          </div>
        </div>

        <div className="video-segments">
          {videoSegments.map((segment) => (
            <button
              key={segment.id}
              className={`segment-button ${activeSegment === segment.id ? 'active' : ''}`}
              onClick={() => handleSegmentClick(segment.id)}
            >
              <span className="segment-title">{segment.title}</span>
              {activeSegment === segment.id && (
                <span className="segment-indicator">
                  <ChevronRight size={16} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {onClose && (
        <button className="video-close-button" onClick={onClose} aria-label="Close video">
          ×
        </button>
      )}
    </div>
  );
};

export default DemoVideoPlayer;
