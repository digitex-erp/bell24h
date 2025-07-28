import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Play, ArrowRight } from 'lucide-react';
import DemoVideoPlayer from './DemoVideoPlayer';

interface VideoHeroProps {
  translations: any;
}

const VideoHero: React.FC<VideoHeroProps> = ({ translations }) => {
  const [, setLocation] = useLocation();
  const [showFullVideo, setShowFullVideo] = useState(false);

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  const handlePlayVideo = () => {
    setShowFullVideo(true);
  };

  const handleCloseVideo = () => {
    setShowFullVideo(false);
  };

  return (
    <div className="video-hero-section">
      <div className="video-background">
        <div className="video-overlay"></div>
      </div>

      <div className="hero-content">
        <h1 className="hero-title">{translations.heroTitle}</h1>
        <p className="hero-subtitle">
          {translations.heroSubtitle}
        </p>
        
        <div className="hero-actions">
          <div className="cta-buttons">
            <button onClick={() => navigateTo('/rfqs')} className="cta-button primary">
              {translations.startRfq} <ArrowRight size={20} />
            </button>
            <button onClick={() => navigateTo('/blockchain')} className="cta-button secondary">
              {translations.exploreBlockchain}
            </button>
          </div>
          
          <button className="video-play-button" onClick={handlePlayVideo} aria-label="Play demo video">
            <div className="play-icon-container">
              <Play size={24} fill="white" />
            </div>
            <span>Watch Demo</span>
          </button>
        </div>
      </div>

      {showFullVideo && (
        <div className="full-video-modal">
          <DemoVideoPlayer onClose={handleCloseVideo} />
        </div>
      )}
    </div>
  );
};

export default VideoHero;
