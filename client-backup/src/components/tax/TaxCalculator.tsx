import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
  Grid,
  Button,
  Alert,
} from '@mui/material';
import { calculateTax, getAvailableRegions, validateTaxId } from '../../services/taxService';
import { TaxCalculationResult, TaxRegion } from '../../types/tax';

interface TaxCalculatorProps {
  amount: number;
  onTaxCalculated?: (result: TaxCalculationResult) => void;
  defaultOrigin?: string;
  defaultDestination?: string;
  showBusinessToggle?: boolean;
  showTaxIdField?: boolean;
}

const TaxCalculator: React.FC<TaxCalculatorProps> = ({
  amount,
  onTaxCalculated,
  defaultOrigin = 'IN-MH',
  defaultDestination = 'IN-MH',
  showBusinessToggle = true,
  showTaxIdField = true,
}) => {
  const [origin, setOrigin] = useState<string>(defaultOrigin);
  const [destination, setDestination] = useState<string>(defaultDestination);
  const [isBusiness, setIsBusiness] = useState<boolean>(true);
  const [taxId, setTaxId] = useState<string>('');
  const [isTaxIdValid, setIsTaxIdValid] = useState<boolean>(true);
  const [regions, setRegions] = useState<TaxRegion[]>([]);
  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load available regions
  useEffect(() => {
    setRegions(getAvailableRegions());
  }, []);

  // Recalculate tax when inputs change
  useEffect(() => {
    try {
      const calculation = calculateTax(amount, origin, destination, isBusiness);
      setResult(calculation);
      setError(null);
      
      if (onTaxCalculated) {
        onTaxCalculated(calculation);
      }
    } catch (err) {
      setError('Failed to calculate tax. Please check your inputs.');
      console.error('Tax calculation error:', err);
    }
  }, [amount, origin, destination, isBusiness, onTaxCalculated]);

  const handleOriginChange = (event: SelectChangeEvent) => {
    setOrigin(event.target.value);
  };

  const handleDestinationChange = (event: SelectChangeEvent) => {
    setDestination(event.target.value);
  };

  const handleBusinessToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsBusiness(event.target.checked);
  };

  const handleTaxIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTaxId(value);
    
    // Validate tax ID if not empty
    if (value) {
      const countryCode = destination.split('-')[0];
      setIsTaxIdValid(validateTaxId(value, countryCode));
    } else {
      setIsTaxIdValid(true);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: result?.currency || 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Tax Calculation
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="origin-region-label">Origin</InputLabel>
            <Select
              labelId="origin-region-label"
              value={origin}
              label="Origin"
              onChange={handleOriginChange}
            >
              {regions.map((region) => (
                <MenuItem key={region.code} value={region.code}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="destination-region-label">Destination</InputLabel>
            <Select
              labelId="destination-region-label"
              value={destination}
              label="Destination"
              onChange={handleDestinationChange}
            >
              {regions.map((region) => (
                <MenuItem key={region.code} value={region.code}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {showBusinessToggle && (
        <FormControlLabel
          control={
            <Switch
              checked={isBusiness}
              onChange={handleBusinessToggle}
              color="primary"
            />
          }
          label="Business Transaction"
          sx={{ mt: 1, mb: 2 }}
        />
      )}

      {showTaxIdField && isBusiness && (
        <TextField
          fullWidth
          margin="normal"
          label={`Tax ID (${destination.split('-')[0]}${isBusiness ? ' GSTIN' : ''})`}
          value={taxId}
          onChange={handleTaxIdChange}
          error={!isTaxIdValid}
          helperText={
            !isTaxIdValid ? 'Please enter a valid tax ID' : ''
          }
          placeholder={
            destination.startsWith('IN')
              ? '22AAAAA0000A1Z5' // Example GSTIN format
              : 'Enter your tax ID'
          }
        />
      )}

      {result && (
        <Box mt={3}>
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Subtotal:</Typography>
            <Typography>{formatCurrency(result.subtotal)}</Typography>
          </Box>
          
          {Object.entries(result.taxDetails).map(([key, value]) => (
            <Box key={key} display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                {key.toUpperCase()} ({value / result.subtotal * 100}%):
              </Typography>
              <Typography variant="body2">
                {formatCurrency(value)}
              </Typography>
            </Box>
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1">Total Tax:</Typography>
            <Typography variant="subtitle1">
              {formatCurrency(result.totalTax)}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Typography variant="h6">Total Amount:</Typography>
            <Typography variant="h6">
              {formatCurrency(result.totalAmount)}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TaxCalculator;
