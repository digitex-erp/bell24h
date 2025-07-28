import React, { useState, useRef } from 'react';
import { Button, Card, Box, Typography, CircularProgress, Paper, Grid, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CategoryIcon from '@mui/icons-material/Category';
import { styled } from '@mui/material/styles';

// Styled components
const UploadArea = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.default,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '300px',
  objectFit: 'contain',
  marginTop: '16px',
  borderRadius: '8px',
});

const ResultCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

interface ImageRFQUploaderProps {
  onImageProcessed?: (data: any) => void;
  onError?: (error: string) => void;
}

const ImageRFQUploader: React.FC<ImageRFQUploaderProps> = ({ onImageProcessed, onError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset states
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Only images and PDFs are allowed');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, just show an icon or placeholder
        setPreviewUrl(null);
      }
      
      // Reset states
      setError(null);
      setResult(null);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/image-rfq', {
        method: 'POST',
        body: formData,
        // Credentials included for authentication
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      setResult(data);
      
      // Call the callback if provided
      if (onImageProcessed) {
        onImageProcessed(data);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while processing the image';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Image-Based RFQ Submission
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Upload an image of your product or a document with specifications. Our AI will extract the information to create your RFQ.
      </Typography>
      
      <HiddenInput
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <UploadArea
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6">
          Drag & Drop or Click to Upload
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Supports images (JPG, PNG) and PDFs up to 10MB
        </Typography>
      </UploadArea>
      
      {previewUrl && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <PreviewImage src={previewUrl} alt="Preview" />
        </Box>
      )}
      
      {selectedFile && !previewUrl && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Paper sx={{ p: 2, display: 'inline-block' }}>
            <ImageIcon sx={{ fontSize: 48 }} />
            <Typography>{selectedFile.name}</Typography>
          </Paper>
        </Box>
      )}
      
      {error && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error" display="flex" alignItems="center">
            <ErrorIcon sx={{ mr: 1 }} />
            {error}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Processing...' : 'Process Image'}
        </Button>
      </Box>
      
      {result && (
        <ResultCard>
          <Typography variant="h6" gutterBottom>
            <CheckCircleIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Image Processed Successfully
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" display="flex" alignItems="center">
                  <TextSnippetIcon sx={{ mr: 1 }} />
                  Detected Text
                </Typography>
                <Paper sx={{ p: 2, maxHeight: '200px', overflow: 'auto', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {result.detectedText || 'No text detected'}
                  </Typography>
                </Paper>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" display="flex" alignItems="center">
                  <CategoryIcon sx={{ mr: 1 }} />
                  Detected Objects
                </Typography>
                <Paper sx={{ p: 2, maxHeight: '200px', overflow: 'auto', bgcolor: 'grey.50' }}>
                  {result.objects && result.objects.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {result.objects.map((obj: any, index: number) => (
                        <Chip
                          key={index}
                          label={`${obj.name} (${Math.round(obj.confidence * 100)}%)`}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2">No objects detected</Typography>
                  )}
                </Paper>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Extracted Product Information
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  {result.productInfo && (
                    <Grid container spacing={2}>
                      {result.productInfo.quantities && result.productInfo.quantities.length > 0 && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2">Quantities</Typography>
                          <ul>
                            {result.productInfo.quantities.map((q: any, i: number) => (
                              <li key={i}>{q.value} {q.unit}</li>
                            ))}
                          </ul>
                        </Grid>
                      )}
                      
                      {result.productInfo.dimensions && result.productInfo.dimensions.length > 0 && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2">Dimensions</Typography>
                          <ul>
                            {result.productInfo.dimensions.map((d: any, i: number) => (
                              <li key={i}>{d.length} x {d.width} x {d.height} {d.unit}</li>
                            ))}
                          </ul>
                        </Grid>
                      )}
                      
                      {result.productInfo.specifications && result.productInfo.specifications.length > 0 && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2">Specifications</Typography>
                          <ul>
                            {result.productInfo.specifications.map((s: any, i: number) => (
                              <li key={i}>{s.type}: {s.value} {s.unit || ''}</li>
                            ))}
                          </ul>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                // This would typically navigate to RFQ form with pre-filled data
                if (onImageProcessed) {
                  onImageProcessed(result);
                }
              }}
            >
              Continue to RFQ Form
            </Button>
          </Box>
        </ResultCard>
      )}
    </Card>
  );
};

export default ImageRFQUploader;
