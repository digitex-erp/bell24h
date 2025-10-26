import React from 'react';

interface VideoPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = '',
  controls = true,
  preload = 'metadata',
}) => {
  return <video src={src} className={className} controls={controls} preload={preload} />;
};

export default VideoPlayer;
