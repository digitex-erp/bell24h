import React, { useState, useCallback } from 'react';
import { Box, Typography, Stepper, Step, StepLabel, Button, Card, Paper, TextField, Grid } from '@mui/material';
import VideoUploader from './VideoUploader';
import ThumbnailGenerator from './ThumbnailGenerator';

interface ProductShowcaseUploaderProps {
  onComplete: (productShowcaseData: {
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    productId?: string;
  }) => void;
  productId?: string;
  initialValues?: {
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
  };
}

const ProductShowcaseUploader: React.FC<ProductShowcaseUploaderProps> = ({
  onComplete,
  productId,
  initialValues = { title: '', description: '', videoUrl: '', thumbnailUrl: '' }
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [videoUrl, setVideoUrl] = useState(initialValues.videoUrl);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialValues.thumbnailUrl);
  const [generatedThumbnail, setGeneratedThumbnail] = useState('');
  
  const steps = ['Product Details', 'Upload Video', 'Generate Thumbnail', 'Review & Publish'];
  
  const handleNext = useCallback(() => {
    // If we're at the last step, complete the process
    if (activeStep === steps.length - 1) {
      onComplete({
        title,
        description,
        videoUrl,
        thumbnailUrl: generatedThumbnail || thumbnailUrl,
        productId
      });
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  }, [activeStep, steps.length, title, description, videoUrl, thumbnailUrl, generatedThumbnail, productId, onComplete]);
  
  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => prevStep - 1);
  }, []);
  
  const handleVideoUploaded = useCallback((newVideoUrl: string, newThumbnailUrl: string) => {
    setVideoUrl(newVideoUrl);
    setThumbnailUrl(newThumbnailUrl);
  }, []);
  
  const handleThumbnailGenerated = useCallback((newThumbnailUrl: string) => {
    setGeneratedThumbnail(newThumbnailUrl);
  }, []);
  
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Enter Product Showcase Details
            </Typography>
            
            <TextField
              label="Showcase Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              helperText="Enter a compelling title for your product showcase video"
            />
            
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              required
              multiline
              rows={4}
              helperText="Describe your product's key features and benefits"
            />
          </Box>
        );
      case 1:
        return (
          <VideoUploader
            onVideoUploaded={handleVideoUploaded}
            initialVideoUrl={videoUrl}
            initialThumbnailUrl={thumbnailUrl}
            label="Upload Product Showcase Video"
            maxDuration={600} // 10 minutes max for product showcases
            maxFileSize={200} // 200MB max
            uploadPreset="bell24h_product_showcase"
          />
        );
      case 2:
        return (
          <ThumbnailGenerator
            videoUrl={videoUrl}
            onThumbnailGenerated={handleThumbnailGenerated}
            initialThumbnailUrl={thumbnailUrl}
          />
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Review Your Product Showcase
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }} elevation={1}>
                  <Typography variant="subtitle1" gutterBottom>
                    Video Preview
                  </Typography>
                  
                  <Card sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                    <video
                      src={videoUrl}
                      controls
                      poster={generatedThumbnail || thumbnailUrl}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </Card>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }} elevation={1}>
                  <Typography variant="subtitle1" gutterBottom>
                    Showcase Details
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>
                    {title}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                    {description}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Product ID: {productId || 'Not specified'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            <Paper sx={{ p: 2, mt: 3 }} elevation={1}>
              <Typography variant="body2" color="textSecondary">
                <strong>Publishing this showcase will:</strong>
                <ul>
                  <li>Make your product video visible to potential buyers</li>
                  <li>Track detailed analytics on viewer engagement</li>
                  <li>Optimize the video for viewing on all devices</li>
                  <li>Include the video in relevant search results</li>
                </ul>
              </Typography>
            </Paper>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    if (activeStep === 0 && (!title || !description)) return true;
    if (activeStep === 1 && !videoUrl) return true;
    if (activeStep === 2 && !videoUrl) return true;
    return false;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {getStepContent(activeStep)}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isNextDisabled()}
        >
          {activeStep === steps.length - 1 ? 'Publish Showcase' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductShowcaseUploader;
