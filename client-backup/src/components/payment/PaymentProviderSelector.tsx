import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Add as AddIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { usePayment } from '../../contexts/PaymentContext';
import { PaymentMethodForm } from './PaymentMethodForm';

interface PaymentProviderSelectorProps {
  amount: number;
  currency?: string;
  onPaymentMethodSelected?: (paymentMethodId: string) => void;
  onPaymentSuccess?: (paymentIntent: any) => void;
  onPaymentError?: (error: Error) => void;
  showAddPaymentMethod?: boolean;
  autoSelectIfSingle?: boolean;
  disabled?: boolean;
}

export const PaymentProviderSelector: React.FC<PaymentProviderSelectorProps> = ({
  amount,
  currency = 'usd',
  onPaymentMethodSelected,
  onPaymentSuccess,
  onPaymentError,
  showAddPaymentMethod = true,
  autoSelectIfSingle = true,
  disabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  
  const {
    paymentMethods,
    selectedPaymentMethod,
    loading,
    error,
    fetchPaymentMethods,
    setSelectedPaymentMethod,
  } = usePayment();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch payment methods on mount
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        await fetchPaymentMethods();
      } catch (err) {
        console.error('Error loading payment methods:', err);
        enqueueSnackbar('Failed to load payment methods', { variant: 'error' });
      }
    };
    
    loadPaymentMethods();
  }, [fetchPaymentMethods, enqueueSnackbar]);
  
  // Auto-select the first payment method if there's only one and autoSelectIfSingle is true
  useEffect(() => {
    if (autoSelectIfSingle && paymentMethods.length === 1 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0].id);
      onPaymentMethodSelected?.(paymentMethods[0].id);
    }
  }, [autoSelectIfSingle, paymentMethods, onPaymentMethodSelected, selectedPaymentMethod, setSelectedPaymentMethod]);
  
  // Handle payment method selection
  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const paymentMethodId = event.target.value;
    setSelectedPaymentMethod(paymentMethodId);
    onPaymentMethodSelected?.(paymentMethodId);
  };
  
  // Handle successful payment method addition
  const handleAddPaymentMethodSuccess = (newPaymentMethod: any) => {
    setShowAddForm(false);
    setSelectedPaymentMethod(newPaymentMethod.id);
    onPaymentMethodSelected?.(newPaymentMethod.id);
    enqueueSnackbar('Payment method added successfully', { variant: 'success' });
  };
  
  // Handle payment method addition error
  const handleAddPaymentMethodError = (error: Error) => {
    console.error('Error adding payment method:', error);
    enqueueSnackbar(error.message || 'Failed to add payment method', { variant: 'error' });
  };
  
  // Render payment method icon based on type
  const renderPaymentMethodIcon = (method: any) => {
    switch (method.type) {
      case 'card':
        return <CreditCardIcon color="action" sx={{ mr: 1 }} />;
      case 'paypal':
        return (
          <Box component="img" 
            src="/icons/paypal.png" 
            alt="PayPal" 
            sx={{ width: 24, height: 24, mr: 1 }} 
          />
        );
      case 'bank_account':
        return (
          <Box component="img" 
            src="/icons/bank.png" 
            alt="Bank Account" 
            sx={{ width: 24, height: 24, mr: 1 }} 
          />
        );
      default:
        return <PaymentIcon color="action" sx={{ mr: 1 }} />;
    }
  };
  
  // Render payment method details
  const renderPaymentMethodDetails = (method: any) => {
    switch (method.type) {
      case 'card':
        return (
          <Box display="flex" alignItems="center">
            {renderPaymentMethodIcon(method)}
            <Box>
              <Typography variant="body1">
                {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} •••• {method.card.last4}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Expires {method.card.expMonth.toString().padStart(2, '0')}/{method.card.expYear.toString().slice(-2)}
                {method.isDefault && ' • Default'}
              </Typography>
            </Box>
          </Box>
        );
      case 'paypal':
        return (
          <Box display="flex" alignItems="center">
            {renderPaymentMethodIcon(method)}
            <Box>
              <Typography variant="body1">PayPal</Typography>
              <Typography variant="body2" color="textSecondary">
                {method.paypal?.email || 'PayPal account'}
                {method.isDefault && ' • Default'}
              </Typography>
            </Box>
          </Box>
        );
      case 'bank_account':
        return (
          <Box display="flex" alignItems="center">
            {renderPaymentMethodIcon(method)}
            <Box>
              <Typography variant="body1">
                {method.bankAccount?.bankName || 'Bank Account'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                •••• {method.bankAccount?.last4}
                {method.isDefault && ' • Default'}
              </Typography>
            </Box>
          </Box>
        );
      default:
        return (
          <Box display="flex" alignItems="center">
            {renderPaymentMethodIcon(method)}
            <Typography variant="body1">
              {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
              {method.isDefault && ' • Default'}
            </Typography>
          </Box>
        );
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      {showAddForm ? (
        <Box mb={3}>
          <PaymentMethodForm
            onSuccess={handleAddPaymentMethodSuccess}
            onError={handleAddPaymentMethodError}
            onCancel={() => setShowAddForm(false)}
          />
        </Box>
      ) : (
        <Card variant="outlined">
          <CardContent>
            <FormControl component="fieldset" fullWidth disabled={disabled}>
              <FormLabel component="legend" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center">
                  <PaymentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Payment Method</Typography>
                </Box>
                {showAddPaymentMethod && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddForm(true)}
                    disabled={isProcessing || disabled}
                  >
                    Add New
                  </Button>
                )}
              </FormLabel>
              
              {paymentMethods.length === 0 ? (
                <Box textAlign="center" py={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    No payment methods found
                  </Typography>
                  {showAddPaymentMethod && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setShowAddForm(true)}
                      disabled={isProcessing || disabled}
                      sx={{ mt: 1 }}
                    >
                      Add Payment Method
                    </Button>
                  )}
                </Box>
              ) : (
                <RadioGroup
                  aria-label="payment-method"
                  name="payment-method"
                  value={selectedPaymentMethod || ''}
                  onChange={handlePaymentMethodChange}
                >
                  {paymentMethods.map((method, index) => (
                    <React.Fragment key={method.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          py: 1.5,
                          px: 2,
                          borderRadius: 1,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Radio
                          value={method.id}
                          color="primary"
                          checked={selectedPaymentMethod === method.id}
                          disabled={isProcessing || disabled}
                        />
                        <Box flexGrow={1}>
                          {renderPaymentMethodDetails(method)}
                        </Box>
                        {method.isDefault && (
                          <Tooltip title="Default payment method">
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                      {index < paymentMethods.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </RadioGroup>
              )}
            </FormControl>
            
            {selectedPaymentMethod && (
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Tooltip title="This payment method will be charged">
                  <Box display="flex" alignItems="center">
                    <InfoIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" color="textSecondary">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.toUpperCase(),
                      }).format(amount / 100)} will be charged
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// Helper component for the payment icon
const PaymentIcon: React.FC<{ color?: 'inherit' | 'primary' | 'secondary' | 'action' | 'disabled' | 'error' }> = ({ color = 'action' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color={color}>
    <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor"/>
  </svg>
);
