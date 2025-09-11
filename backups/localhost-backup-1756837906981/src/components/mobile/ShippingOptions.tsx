import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
  LinearProgress,
  Rating
} from '@mui/material';
import { ShippingRecommendation } from '../../services/logistics/ShippingOptimizer';

interface ShippingOptionsProps {
  options: ShippingRecommendation[];
  onSelect: (option: ShippingRecommendation) => void;
  isLoading?: boolean;
}

export const ShippingOptions: React.FC<ShippingOptionsProps> = ({
  options,
  onSelect,
  isLoading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!options.length) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No shipping options available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Available Shipping Options
      </Typography>
      <Grid container spacing={2}>
        {options.map((option, index) => (
          <Grid item xs={12} key={index}>
            <Card
              elevation={2}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4
                }
              }}
              onClick={() => onSelect(option)}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" component="div">
                      {option.carrier}
                    </Typography>
                    <Chip
                      label={`$${option.cost.toFixed(2)}`}
                      color="primary"
                      size={isMobile ? "small" : "medium"}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Delivery
                    </Typography>
                    <Typography variant="body1">
                      {option.estimatedDeliveryTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Reliability:
                      </Typography>
                      <Rating
                        value={option.reliability * 5}
                        readOnly
                        precision={0.5}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 1 }}
                      size={isMobile ? "small" : "medium"}
                    >
                      Select
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 