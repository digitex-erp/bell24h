import React, { useState, useCallback, useEffect } from 'react';
import { Box, Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import MuiTypography from '@mui/material/Typography';
import MuiBox from '@mui/material/Box';
import MuiCircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

// Create styled components for Typography with proper typing
const StyledTypography = styled(MuiTypography)<{ component?: React.ElementType }>`
  ${({ theme }) => `
    &.title {
      margin-bottom: ${theme.spacing(2)};
    }
    &.body-text {
      text-align: center;
    }
    &.caption-text {
      font-size: 0.75rem;
    }
    &.error-text {
      color: ${theme.palette.error.main};
      margin-top: ${theme.spacing(1)};
    }
    &.file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `}
`;

// Create styled Box components with proper typing
const UploadBox = styled(MuiBox)(({ theme }) => ({
  border: '2px dashed #cccccc',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  height: 200,
  backgroundColor: '#f8f8f8',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: '#f5f5f5'
  }
}));

const DeleteButton = styled(MuiBox)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: 'rgba(0,0,0,0.6)',
  borderRadius: '50%',
  padding: theme.spacing(1),
  cursor: 'pointer'
}));

const VideoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden'
}));

const StyledCircularProgress = styled(MuiCircularProgress)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

// Add TypeScript interface for Cloudinary global object
declare global {  
  interface Window {
    cloudinary: any;
  }
}

interface VideoUploaderProps {
  onVideoUploaded: (videoUrl: string, thumbnailUrl: string) => void;
  initialVideoUrl?: string;
  initialThumbnailUrl?: string;
  maxDuration?: number; // in seconds
  maxFileSize?: number; // in MB
  allowedFormats?: string[]; // e.g. ['mp4', 'mov', 'avi']
  uploadPreset?: string;
  label?: string;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoUploaded,
  initialVideoUrl = '',
  initialThumbnailUrl = '',
  maxDuration = 300, // 5 minutes default
  maxFileSize = 100, // 100MB default
  allowedFormats = ['mp4', 'mov', 'webm'],
  uploadPreset = 'bell24h_videos',
  label = 'Upload Video'
}) => {
  const [videoUrl, setVideoUrl] = useState<string>(initialVideoUrl);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(initialThumbnailUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [cloudinaryWidget, setCloudinaryWidget] = useState<any>(null);

  // Initialize Cloudinary widget
  useEffect(() => {
    if (typeof window !== 'undefined' && !cloudinaryWidget) {
      // @ts-ignore - Cloudinary global is added via script tag
      if (window.cloudinary) {
        const widget = window.cloudinary.createUploadWidget(
          {
            cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
            uploadPreset,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFileSize: maxFileSize * 1024 * 1024,
            resourceType: 'video',
            clientAllowedFormats: allowedFormats,
            showAdvancedOptions: false,
            cropping: false,
            maxDuration,
            showUploadMoreButton: false,
            styles: {
              palette: {
                window: '#F5F5F5',
                windowBorder: '#90A0B3',
                tabIcon: '#0078FF',
                menuIcons: '#5A616A',
                textDark: '#000000',
                textLight: '#FFFFFF',
                link: '#0078FF',
                action: '#FF620C',
                inactiveTabIcon: '#0E2F5A',
                error: '#F44235',
                inProgress: '#0078FF',
                complete: '#20B832',
                sourceBg: '#FFFFFF'
              }
            }
          },
          (error: any, result: any) => {
            if (!error && result && result.event === 'success') {
              setVideoUrl(result.info.secure_url);
              // Generate thumbnail URL (Cloudinary transformation)
              const thumbnailUrl = result.info.secure_url.replace('/upload/', '/upload/w_640,h_360,c_fill,g_auto,q_auto,f_jpg/so_auto/');
              setThumbnailUrl(thumbnailUrl);
              onVideoUploaded(result.info.secure_url, thumbnailUrl);
              setIsUploading(false);
              setUploadProgress(100);
            }
            
            if (error) {
              setError('Upload failed: ' + error.message || 'Unknown error');
              setIsUploading(false);
            }
          }
        );
        
        setCloudinaryWidget(widget);
      } else {
        // Load Cloudinary script if not already loaded
        const script = document.createElement('script');
        script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
        script.async = true;
        // Safely append script to document body
        document.body.appendChild(script);
        
        // Store script reference for cleanup
        const scriptElement = script;
        return () => {
          // Safe removal of script
          if (scriptElement && scriptElement.parentNode) {
            scriptElement.parentNode.removeChild(scriptElement);
          }
        };
      }
    }
    
    return () => {
      // Clean up widget if needed
      if (cloudinaryWidget && typeof cloudinaryWidget.destroy === 'function') {
        cloudinaryWidget.destroy();
      }
    };
  }, [cloudinaryWidget, maxDuration, maxFileSize, allowedFormats, uploadPreset, onVideoUploaded]);

  const handleUploadClick = useCallback(() => {
    if (cloudinaryWidget) {
      setIsUploading(true);
      setUploadProgress(0);
      setError('');
      cloudinaryWidget.open();
    } else {
      setError('Upload widget is not ready yet. Please try again in a moment.');
    }
  }, [cloudinaryWidget]);

  const handleRemoveVideo = useCallback(() => {
    setVideoUrl('');
    setThumbnailUrl('');
    onVideoUploaded('', '');
  }, [onVideoUploaded]);

  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <StyledTypography variant="subtitle1" className="title">{label}</StyledTypography>
      
      {!videoUrl ? (
        <UploadBox onClick={handleUploadClick}>
          {isUploading ? (
            <>
              <StyledCircularProgress variant="determinate" value={uploadProgress} size={40} />
              <StyledTypography variant="body2">
                Uploading... {uploadProgress}%
              </StyledTypography>
            </>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 60, color: '#0078FF', mb: 2 }} />
              <StyledTypography variant="body1" className="body-text">Click to upload a video</StyledTypography>
              <StyledTypography variant="body2" className="caption-text">Supported formats: {allowedFormats.join(', ')} (Max: {maxFileSize}MB, {maxDuration}s)</StyledTypography>
            </>
          )}
        </UploadBox>
      ) : (
        <Box>
          <VideoCard>
            <Box sx={{ position: 'relative' }}>
              <video
                src={videoUrl}
                controls
                poster={thumbnailUrl}
                style={{ width: '100%', height: 'auto', maxHeight: '300px' }}
              />
              <DeleteButton onClick={handleRemoveVideo}>
                <DeleteIcon sx={{ color: 'white', fontSize: 20 }} />
              </DeleteButton>
            </Box>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <VideoLibraryIcon sx={{ mr: 1, color: '#0078FF' }} />
              <StyledTypography variant="body2" className="file-name">
                Video uploaded successfully
              </StyledTypography>
              <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} />
            </Box>
          </VideoCard>
        </Box>
      )}
      
      {error && (
        <StyledTypography variant="body2" className="error-text">
          {error}
        </StyledTypography>
      )}
    </Box>
  );
};

export default VideoUploader;
