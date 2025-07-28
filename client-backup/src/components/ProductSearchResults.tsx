import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductResult, VisionApiResponse } from '../services/vision.service';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Button,
  Grid
} from '@mui/material';
import { FiShoppingCart, FiInfo, FiAlertCircle } from 'react-icons/fi';

interface ProductSearchResultsProps {
  results: VisionApiResponse;
  loading: boolean;
  error?: string;
  onSelectProduct: (product: ProductResult) => void;
  onRetry: () => void;
}

const ProductSearchResults: React.FC<ProductSearchResultsProps> = ({
  results,
  loading,
  error,
  onSelectProduct,
  onRetry
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
        <Typography variant="body1" ml={2}>
          {t('rfq.create.searching')}
        </Typography>
      </Box>
    );
  }


  if (error) {
    return (
      <Box textAlign="center" my={4} p={3} bgcolor="error.light" color="error.contrastText" borderRadius={1}>
        <FiAlertCircle size={24} style={{ marginBottom: 8 }} />
        <Typography variant="body1" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onRetry}
          startIcon={<FiInfo />}
          sx={{ mt: 2 }}
        >
          {t('common.retry')}
        </Button>
      </Box>
    );
  }

  if (!results.products || results.products.length === 0) {
    return (
      <Box textAlign="center" my={4} p={3} bgcolor="grey.100" borderRadius={1}>
        <Typography variant="body1" color="textSecondary">
          {t('rfq.create.noProductsFound')}
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          {t('rfq.create.tryDifferentImage')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        {t('rfq.create.detectedProducts')}
      </Typography>
      
      <Grid container spacing={3}>
        {results.products.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${product.name}-${index}`}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {product.imageUri && (
                <CardMedia
                  component="img"
                  height="200"
                  image={product.imageUri}
                  alt={product.name}
                  sx={{ objectFit: 'contain', bgcolor: 'grey.100', p: 2 }}
                />
              )}
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {product.name}
                </Typography>
                
                {product.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {product.description}
                  </Typography>
                )}
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" color="primary">
                    {product.price}
                  </Typography>
                  {product.score && (
                    <Chip 
                      label={`${Math.round(product.score * 100)}% ${t('rfq.create.confidence')}`} 
                      size="small" 
                      sx={{ ml: 1 }}
                      color={product.score > 0.7 ? 'success' : 'warning'}
                    />
                  )}
                </Box>
                
                {product.category && (
                  <Chip 
                    label={product.category} 
                    size="small" 
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                
                <Box mt={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<FiShoppingCart />}
                    onClick={() => onSelectProduct(product)}
                    sx={{ textTransform: 'none' }}
                  >
                    {t('rfq.create.selectProduct')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {results.labels && results.labels.length > 0 && (
        <Box mt={4}>
          <Typography variant="subtitle1" gutterBottom>
            {t('rfq.create.relatedTags')}:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {results.labels.slice(0, 10).map((label, idx) => (
              <Chip 
                key={idx} 
                label={label.description} 
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProductSearchResults;
