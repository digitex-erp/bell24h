'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { Location, PackageInfo, ShippingPriorities } from '../../services/logistics/ShippingOptimizer';

interface ShippingFormProps {
  onSubmit: (
    origin: Location,
    destination: Location,
    packageDetails: PackageInfo,
    priorities: ShippingPriorities
  ) => Promise<void>;
  isLoading?: boolean;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({ onSubmit, isLoading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [origin, setOrigin] = useState<Location>({
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });

  const [destination, setDestination] = useState<Location>({
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });

  const [packageDetails, setPackageDetails] = useState<PackageInfo>({
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    fragile: false
  });

  const [priorities, setPriorities] = useState<ShippingPriorities>({
    cost: 0.5,
    speed: 0.3,
    reliability: 0.2
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(origin, destination, packageDetails, priorities);
  };

  const handlePriorityChange = (priority: keyof ShippingPriorities, value: number) => {
    setPriorities(prev => ({
      ...prev,
      [priority]: value
    }));
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: isMobile ? 2 : 3,
        maxWidth: '100%',
        mx: 'auto',
        mt: 2
      }}
    >
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Shipping Details
        </Typography>

        <Grid container spacing={2}>
          {/* Origin Address */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Origin Address
            </Typography>
            <TextField
              fullWidth
              label="Address"
              value={origin.address}
              onChange={(e) => setOrigin(prev => ({ ...prev, address: e.target.value }))}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={origin.city}
                  onChange={(e) => setOrigin(prev => ({ ...prev, city: e.target.value }))}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={origin.postalCode}
                  onChange={(e) => setOrigin(prev => ({ ...prev, postalCode: e.target.value }))}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth margin="normal" size={isMobile ? "small" : "medium"}>
              <InputLabel>Country</InputLabel>
              <Select
                value={origin.country}
                onChange={(e) => setOrigin(prev => ({ ...prev, country: e.target.value }))}
                required
              >
                <MenuItem value="USA">United States</MenuItem>
                <MenuItem value="UK">United Kingdom</MenuItem>
                <MenuItem value="CA">Canada</MenuItem>
                {/* Add more countries as needed */}
              </Select>
            </FormControl>
          </Grid>

          {/* Destination Address */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Destination Address
            </Typography>
            <TextField
              fullWidth
              label="Address"
              value={destination.address}
              onChange={(e) => setDestination(prev => ({ ...prev, address: e.target.value }))}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={destination.city}
                  onChange={(e) => setDestination(prev => ({ ...prev, city: e.target.value }))}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={destination.postalCode}
                  onChange={(e) => setDestination(prev => ({ ...prev, postalCode: e.target.value }))}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth margin="normal" size={isMobile ? "small" : "medium"}>
              <InputLabel>Country</InputLabel>
              <Select
                value={destination.country}
                onChange={(e) => setDestination(prev => ({ ...prev, country: e.target.value }))}
                required
              >
                <MenuItem value="USA">United States</MenuItem>
                <MenuItem value="UK">United Kingdom</MenuItem>
                <MenuItem value="CA">Canada</MenuItem>
                {/* Add more countries as needed */}
              </Select>
            </FormControl>
          </Grid>

          {/* Package Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Package Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={packageDetails.weight}
                  onChange={(e) => setPackageDetails(prev => ({
                    ...prev,
                    weight: parseFloat(e.target.value)
                  }))}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={packageDetails.fragile}
                      onChange={(e) => setPackageDetails(prev => ({
                        ...prev,
                        fragile: e.target.checked
                      }))}
                    />
                  }
                  label="Fragile Package"
                />
              </Grid>
            </Grid>
            <Typography variant="subtitle2" gutterBottom>
              Dimensions (cm)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Length"
                  type="number"
                  value={packageDetails.dimensions.length}
                  onChange={(e) => setPackageDetails(prev => ({
                    ...prev,
                    dimensions: {
                      ...prev.dimensions,
                      length: parseFloat(e.target.value)
                    }
                  }))}
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Width"
                  type="number"
                  value={packageDetails.dimensions.width}
                  onChange={(e) => setPackageDetails(prev => ({
                    ...prev,
                    dimensions: {
                      ...prev.dimensions,
                      width: parseFloat(e.target.value)
                    }
                  }))}
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Height"
                  type="number"
                  value={packageDetails.dimensions.height}
                  onChange={(e) => setPackageDetails(prev => ({
                    ...prev,
                    dimensions: {
                      ...prev.dimensions,
                      height: parseFloat(e.target.value)
                    }
                  }))}
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Shipping Priorities */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Shipping Priorities
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Cost Priority: {priorities.cost}
                </Typography>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={priorities.cost}
                  onChange={(e) => handlePriorityChange('cost', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Speed Priority: {priorities.speed}
                </Typography>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={priorities.speed}
                  onChange={(e) => handlePriorityChange('speed', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Reliability Priority: {priorities.reliability}
                </Typography>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={priorities.reliability}
                  onChange={(e) => handlePriorityChange('reliability', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Get Shipping Options'
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}; 