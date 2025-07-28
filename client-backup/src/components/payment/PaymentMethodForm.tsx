import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Event as EventIcon,
  VpnKey as VpnKeyIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { usePayment } from '../../contexts/PaymentContext';

interface PaymentMethodFormProps {
  onSuccess?: (paymentMethod: any) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  defaultValues?: Partial<PaymentMethodFormData>;
  submitButtonText?: string;
  showBackButton?: boolean;
}

interface PaymentMethodFormData {
  type: 'card' | 'paypal' | 'bank_account';
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
  saveForFutureUse: boolean;
  makeDefault: boolean;
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  onSuccess,
  onError,
  onCancel,
  defaultValues = {},
  submitButtonText = 'Add Payment Method',
  showBackButton = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const { addPaymentMethod, loading: isProcessing } = usePayment();
  
  const [cardType, setCardType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, handleSubmit, watch, formState: { errors }, setValue } = useForm<PaymentMethodFormData>({
    defaultValues: {
      type: 'card',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      cardName: '',
      saveForFutureUse: true,
      makeDefault: true,
      ...defaultValues,
    },
  });
  
  // Watch form values
  const watchType = watch('type');
  const watchSaveForFutureUse = watch('saveForFutureUse');
  
  // Handle form submission
  const onSubmit = async (data: PaymentMethodFormData) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real app, you would validate the card details and create a payment method
      // using your payment processor's API (e.g., Stripe Elements)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock payment method response
      const mockPaymentMethod = {
        id: `pm_${Math.random().toString(36).substr(2, 14)}`,
        type: 'card',
        card: {
          brand: cardType || 'visa',
          last4: data.cardNumber.slice(-4),
          expMonth: parseInt(data.cardExpiry.split('/')[0].trim(), 10),
          expYear: parseInt(`20${data.cardExpiry.split('/')[1].trim()}`, 10),
        },
        isDefault: data.makeDefault,
        createdAt: new Date().toISOString(),
      };
      
      // In a real app, you would call your API to add the payment method
      // await addPaymentMethod({
      //   type: 'card',
      //   card: {
      //     number: data.cardNumber.replace(/\s+/g, ''),
      //     exp_month: parseInt(data.cardExpiry.split('/')[0].trim(), 10),
      //     exp_year: parseInt(`20${data.cardExpiry.split('/')[1].trim()}`, 10),
      //     cvc: data.cardCvc,
      //     name: data.cardName,
      //   },
      //   billing_details: {
      //     name: data.cardName,
      //   },
      // }, data.makeDefault);
      
      enqueueSnackbar('Payment method added successfully', { variant: 'success' });
      onSuccess?.(mockPaymentMethod);
    } catch (err) {
      console.error('Error adding payment method:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment method';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '').substring(0, 16);
    
    // Detect card type
    if (/^4/.test(v)) {
      setCardType('visa');
    } else if (/^5[1-5]/.test(v)) {
      setCardType('mastercard');
    } else if (/^3[47]/.test(v)) {
      setCardType('amex');
    } else if (/^6(?:011|5)/.test(v)) {
      setCardType('discover');
    } else {
      setCardType('');
    }
    
    // Add spaces for better readability
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : '';
  };
  
  // Format expiry date as MM/YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };
  
  // Format CVC (3-4 digits)
  const formatCvc = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 4);
  };
  
  // Get card icon based on type
  const getCardIcon = () => {
    switch (cardType) {
      case 'visa':
        return '/icons/visa.png';
      case 'mastercard':
        return '/icons/mastercard.png';
      case 'amex':
        return '/icons/amex.png';
      case 'discover':
        return '/icons/discover.png';
      default:
        return '/icons/credit-card.png';
    }
  };
  
  // Validate expiry date
  const validateExpiry = (value: string) => {
    if (!value) return 'Expiry date is required';
    
    const [month, year] = value.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return 'Invalid expiry date';
    }
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Card has expired';
    }
    
    return true;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          {showBackButton && (
            <IconButton 
              onClick={onCancel} 
              sx={{ mr: 1 }}
              disabled={isSubmitting || isProcessing}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6">
            {submitButtonText}
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Payment Method Type</FormLabel>
                    <RadioGroup row {...field}>
                      <FormControlLabel 
                        value="card" 
                        control={<Radio />} 
                        label="Credit/Debit Card" 
                      />
                      <FormControlLabel 
                        value="paypal" 
                        control={<Radio />} 
                        label="PayPal" 
                        disabled // PayPal integration would be implemented separately
                      />
                      <FormControlLabel 
                        value="bank_account" 
                        control={<Radio />} 
                        label="Bank Account" 
                        disabled // Bank account integration would be implemented separately
                      />
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </Grid>
            
            {watchType === 'card' && (
              <>
                <Grid item xs={12}>
                  <Controller
                    name="cardNumber"
                    control={control}
                    rules={{
                      required: 'Card number is required',
                      validate: (value) => {
                        // Luhn algorithm for card validation
                        const cleanValue = value.replace(/\s+/g, '');
                        let sum = 0;
                        let shouldDouble = false;
                        
                        for (let i = cleanValue.length - 1; i >= 0; i--) {
                          let digit = parseInt(cleanValue.charAt(i), 10);
                          
                          if (shouldDouble) {
                            digit *= 2;
                            if (digit > 9) {
                              digit = (digit % 10) + 1;
                            }
                          }
                          
                          sum += digit;
                          shouldDouble = !shouldDouble;
                        }
                        
                        return sum % 10 === 0 || 'Invalid card number';
                      },
                    }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Card Number"
                        variant="outlined"
                        value={formatCardNumber(value || '')}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          onChange(formatted);
                        }}
                        error={!!errors.cardNumber}
                        helperText={errors.cardNumber?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {cardType ? (
                                <Box 
                                  component="img" 
                                  src={getCardIcon()} 
                                  alt={cardType} 
                                  sx={{ width: 24, height: 24, mr: 1 }} 
                                />
                              ) : (
                                <CreditCardIcon color="action" />
                              )}
                            </InputAdornment>
                          ),
                        }}
                        disabled={isSubmitting || isProcessing}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="cardExpiry"
                    control={control}
                    rules={{
                      required: 'Expiry date is required',
                      validate: validateExpiry,
                    }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Expiry Date (MM/YY)"
                        placeholder="MM/YY"
                        variant="outlined"
                        value={formatExpiry(value || '')}
                        onChange={(e) => {
                          const formatted = formatExpiry(e.target.value);
                          onChange(formatted);
                        }}
                        error={!!errors.cardExpiry}
                        helperText={errors.cardExpiry?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EventIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled={isSubmitting || isProcessing}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="cardCvc"
                    control={control}
                    rules={{
                      required: 'CVC is required',
                      minLength: { value: 3, message: 'CVC must be at least 3 digits' },
                      maxLength: { value: 4, message: 'CVC cannot exceed 4 digits' },
                    }}
                    render={({ field: { onChange, value, ...field } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="CVC"
                        variant="outlined"
                        value={formatCvc(value || '')}
                        onChange={(e) => {
                          const formatted = formatCvc(e.target.value);
                          onChange(formatted);
                        }}
                        error={!!errors.cardCvc}
                        helperText={errors.cardCvc?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKeyIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        disabled={isSubmitting || isProcessing}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="cardName"
                    control={control}
                    rules={{
                      required: 'Cardholder name is required',
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Cardholder Name"
                        variant="outlined"
                        error={!!errors.cardName}
                        helperText={errors.cardName?.message}
                        disabled={isSubmitting || isProcessing}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="saveForFutureUse"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            color="primary"
                            disabled={isSubmitting || isProcessing}
                          />
                        }
                        label="Save this card for future payments"
                      />
                    )}
                  />
                </Grid>
                
                {watchSaveForFutureUse && (
                  <Grid item xs={12}>
                    <Controller
                      name="makeDefault"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              color="primary"
                              disabled={isSubmitting || isProcessing}
                            />
                          }
                          label="Set as default payment method"
                        />
                      )}
                    />
                  </Grid>
                )}
              </>
            )}
            
            {watchType === 'paypal' && (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    You will be redirected to PayPal to complete your payment
                  </Typography>
                  <Box my={2}>
                    <Box 
                      component="img" 
                      src="/icons/paypal.png" 
                      alt="PayPal" 
                      sx={{ height: 40, mb: 2 }} 
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Your payment will be processed securely by PayPal
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {watchType === 'bank_account' && (
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary" align="center" py={4}>
                  Bank account integration coming soon
                </Typography>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={2}>
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    disabled={isSubmitting || isProcessing}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    isSubmitting || 
                    isProcessing ||
                    (watchType === 'card' && Object.keys(errors).length > 0)
                  }
                  startIcon={
                    (isSubmitting || isProcessing) ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  sx={{ ml: 'auto' }}
                >
                  {isSubmitting || isProcessing ? 'Processing...' : submitButtonText}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodForm;
