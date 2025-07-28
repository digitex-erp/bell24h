import React, { useState } from 'react';
import { Container, Typography, Box, Stepper, Step, StepLabel, Button, Paper } from '@mui/material';
import ImageRFQUploader from '../components/ImageRFQUploader';
import ImageAnalysisExplainer from '../components/ImageAnalysisExplainer';
import { useNavigate } from 'react-router-dom';

const steps = ['Upload Image', 'Review Analysis', 'Complete RFQ'];

const ImageRFQPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [imageData, setImageData] = useState<any>(null);
  const [imageRfqId, setImageRfqId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleImageProcessed = (data: any) => {
    setImageData(data);
    setImageRfqId(data.imageRfqId);
    setActiveStep(1); // Move to the next step
  };

  const handleError = (error: string) => {
    console.error('Image processing error:', error);
    // Error handling is already done in the ImageRFQUploader component
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Last step - navigate to RFQ form with pre-filled data
      navigate('/rfq/new', { 
        state: { 
          imageData, 
          prefill: {
            title: `RFQ for ${imageData?.productInfo?.possibleProducts?.[0] || 'Product'}`,
            description: imageData?.detectedText || '',
            // Add other prefill data as needed
          }
        } 
      });
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3, mb: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Image-Based RFQ Submission
        </Typography>
        
        <Typography variant="body1" paragraph align="center" color="textSecondary">
          Upload an image of your product or specifications, and our AI will extract the information to create your RFQ.
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 && (
          <ImageRFQUploader 
            onImageProcessed={handleImageProcessed}
            onError={handleError}
          />
        )}
        
        {activeStep === 1 && imageRfqId && (
          <>
            <ImageAnalysisExplainer 
              imageRfqId={imageRfqId}
              imageUrl={imageData?.imageUrl}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Continue to RFQ Form
              </Button>
            </Box>
          </>
        )}
        
        {activeStep === 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Complete Your RFQ
            </Typography>
            
            <Typography paragraph>
              We've pre-filled your RFQ form with the information extracted from your image.
              Please review and complete any missing details.
            </Typography>
            
            {/* This step is just a transition - the actual form is shown after navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Go to RFQ Form
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ImageRFQPage;
