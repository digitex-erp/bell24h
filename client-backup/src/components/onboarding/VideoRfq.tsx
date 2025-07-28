import React, { useState, useRef } from 'react';
import { Video, Upload, Play, Pause, X, Check, Clock } from 'lucide-react';

interface VideoRfqProps {
  onComplete: () => void;
  onSkip: () => void;
  data: any;
  onDataChange: (data: any) => void;
}

const VideoRfq: React.FC<VideoRfqProps> = ({
  onComplete,
  onSkip,
  data,
  onDataChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(data.videoUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Simulate upload
      setIsUploading(true);
      
      // Create a file reader to get a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            
            // Set video URL
            const url = event.target?.result as string;
            setVideoUrl(url);
            
            // Update data
            onDataChange({
              ...data,
              videoUrl: url
            });
          }
        }, 200);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Handle video play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle video seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Remove video
  const handleRemoveVideo = () => {
    setVideoUrl(null);
    onDataChange({
      ...data,
      videoUrl: null
    });
  };

  // Complete step
  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="onboarding-step-module">
      <h2 className="step-title">Create a Video RFQ</h2>
      <p className="step-description">
        Enhance your RFQ with video to better explain your requirements. This helps suppliers understand your needs more clearly.
      </p>
      
      <div className="video-rfq-container">
        {videoUrl ? (
          <div className="video-preview-container">
            <div className="video-player">
              <video
                ref={videoRef}
                src={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="video-element"
              />
              
              <div className="video-controls">
                <button 
                  className="play-pause-button" 
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                
                <div className="video-progress">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="progress-slider"
                  />
                  <div className="time-display">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="remove-video-button" 
                onClick={handleRemoveVideo}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="video-info">
              <h3>Your Video RFQ</h3>
              <p>
                <Clock size={16} />
                <span>{formatTime(duration)}</span>
              </p>
              
              <div className="video-tips">
                <h4>Tips for a great Video RFQ:</h4>
                <ul>
                  <li>Clearly explain your product requirements</li>
                  <li>Show examples or prototypes if available</li>
                  <li>Mention quantity, quality standards, and timeline</li>
                  <li>Highlight any specific technical requirements</li>
                </ul>
              </div>
              
              <button 
                className="complete-button" 
                onClick={handleComplete}
              >
                <Check size={20} />
                Complete This Step
              </button>
            </div>
          </div>
        ) : (
          <div className="video-upload-section">
            <div className="upload-container">
              {isUploading ? (
                <div className="upload-progress-container">
                  <div className="upload-progress-bar">
                    <div 
                      className="upload-progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="upload-progress-text">{uploadProgress}% Uploaded</span>
                </div>
              ) : (
                <>
                  <div className="upload-icon">
                    <Video size={48} />
                  </div>
                  <h3>Upload Your Video RFQ</h3>
                  <p>
                    Record a video explaining your requirements to help suppliers understand your needs better.
                  </p>
                  <input
                    type="file"
                    id="video-upload"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden-input"
                  />
                  <label htmlFor="video-upload" className="upload-button">
                    <Upload size={20} />
                    Select Video
                  </label>
                </>
              )}
            </div>
            
            <div className="video-rfq-info">
              <h3>Why Use Video RFQs?</h3>
              <ul>
                <li>
                  <strong>Better Communication:</strong> Explain complex requirements more effectively
                </li>
                <li>
                  <strong>Higher Response Rate:</strong> Suppliers are more likely to respond to video RFQs
                </li>
                <li>
                  <strong>Reduced Misunderstandings:</strong> Visual explanations lead to fewer errors
                </li>
                <li>
                  <strong>Faster Responses:</strong> Suppliers can understand your needs quicker
                </li>
              </ul>
              
              <div className="action-buttons">
                <button 
                  className="skip-button" 
                  onClick={onSkip}
                >
                  Skip for now
                </button>
                
                <button 
                  className="demo-button" 
                  onClick={() => {
                    // In a real implementation, this would load a demo video
                    // For now, we'll simulate it
                    setIsUploading(true);
                    let progress = 0;
                    const interval = setInterval(() => {
                      progress += 10;
                      setUploadProgress(progress);
                      
                      if (progress >= 100) {
                        clearInterval(interval);
                        setIsUploading(false);
                        
                        // Set a demo video URL
                        const demoUrl = "https://example.com/demo-video.mp4";
                        setVideoUrl(demoUrl);
                        
                        // Update data
                        onDataChange({
                          ...data,
                          videoUrl: demoUrl
                        });
                      }
                    }, 200);
                  }}
                >
                  <Play size={20} />
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRfq;
