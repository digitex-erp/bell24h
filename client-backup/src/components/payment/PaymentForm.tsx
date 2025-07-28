import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

// Material UI Components
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

// Material UI Icons
import LockIcon from '@mui/icons-material/Lock';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CardActions } from '@mui/material';

// Add payment SDKs to Window interface
declare global {
  interface Window {
    Razorpay: any;
    paypal: any;
    Stripe: any;
  }
}

// Types and interfaces
type PaymentProvider = 'stripe' | 'paypal' | 'razorpay';

interface CustomerDetails {
  name: string;
  email: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

interface PaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess: (data: PaymentResult) => void;
  onError: (error: any) => void;
  onCancel: () => void;
  redirectUrl?: string;
  customerDetails?: CustomerDetails;
  metadata?: Record<string, any>;
  allowedProviders?: PaymentProvider[];
}

interface PaymentResult {
  success: boolean;
  canceled?: boolean;
  payment: Record<string, any>;
  error?: any;
}

// Utility function to get currency symbol
const getCurrencySymbol = (currency: string): string => {
  switch (currency.toLowerCase()) {
    case 'usd':
      return '$';
    case 'eur':
      return '€';
    case 'gbp':
      return '£';
    case 'inr':
      return '₹';
    default:
      return '';
  }
};

// Utility function to load scripts dynamically
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'usd',
  description = 'Payment for services',
  onSuccess,
  onError,
  onCancel,
  redirectUrl,
  customerDetails,
  metadata = {},
  allowedProviders = ['stripe', 'paypal', 'razorpay'],
}): React.ReactNode => {
  // State hooks
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | ''>(allowedProviders[0] || '');
  const [cardElement, setCardElement] = useState<any>(null);
  const [formValid, setFormValid] = useState(false);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [savedCards] = useState<any[]>([]); // In a real app, fetch this from API
  const [formError, setFormError] = useState<string | null>(null);
  
  // Router and snackbar
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  
  // React Hook Form setup
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: customerDetails?.name || '',
      email: customerDetails?.email || '',
      phone: customerDetails?.phone || '',
      provider: selectedProvider,
      savedCard: '',
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: ''
    },
    mode: 'onChange'
  });
  
  // Validate form on change
  useEffect(() => {
    const subscription = watch((value) => {
      validateForm(value);
    });
    
    return () => subscription.unsubscribe();
  }, [watch]);
  
  // Validate the form fields
  const validateForm = (formData: any) => {
    if (!formData.provider) {
      setFormValid(false);
      return;
    }
    
    if (!formData.name || !formData.email) {
      setFormValid(false);
      return;
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormValid(false);
      return;
    }
    
    // Provider-specific validation
    if (formData.provider === 'stripe') {
      if (useSavedCard && !formData.savedCard) {
        setFormValid(false);
        return;
      }
    }
    
    setFormValid(true);
  };
  
  // Handle cancel action
  const handleCancel = () => {
    if (processingPayment) return;
    onCancel();
  };
  
  // Load SDK based on selected provider
  useEffect(() => {
    if (!selectedProvider) return;
    
    const loadProviderSDK = async () => {
      setLoading(true);
      try {
        switch (selectedProvider) {
          case 'stripe':
            await loadStripeSDK();
            break;
          case 'paypal':
            await loadPayPalSDK();
            break;
          case 'razorpay':
            await loadRazorpaySDK();
            break;
        }
      } catch (error) {
        console.error(`Failed to load ${selectedProvider} SDK:`, error);
        setFormError(`Failed to load ${selectedProvider} payment. Please try again.`);
        enqueueSnackbar(`Failed to load ${selectedProvider} payment. Please try again.`, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    loadProviderSDK();
  }, [selectedProvider, enqueueSnackbar]);
  
  // SDK Loading functions
  const loadStripeSDK = async () => {
    if (window.Stripe) return true;
    
    try {
      await loadScript('https://js.stripe.com/v3/');
      return true;
    } catch (error) {
      console.error('Failed to load Stripe SDK', error);
      throw new Error('Failed to load Stripe payment provider');
    }
  };
  
  const loadPayPalSDK = async () => {
    if (window.paypal) return true;
    
    try {
      await loadScript(`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}`);
      return true;
    } catch (error) {
      console.error('Failed to load PayPal SDK', error);
      throw new Error('Failed to load PayPal payment provider');
    }
  };
  
  const loadRazorpaySDK = async () => {
    if (window.Razorpay) return true;
    
    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      return true;
    } catch (error) {
      console.error('Failed to load Razorpay SDK', error);
      throw new Error('Failed to load Razorpay payment provider');
    }
  };
  
  // Handle payment method change
  const handleProviderChange = (event: SelectChangeEvent) => {
    const provider = event.target.value as PaymentProvider | '';
    setSelectedProvider(provider);
    setValue('provider', provider);
  };
  
  // Process payment with Stripe
  const processStripePayment = async (data: any) => {
    try {
      if (!window.Stripe) {
        throw new Error('Stripe SDK not loaded');
      }
      
      const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
      
      // In a real app, you would call your backend API to create a payment intent
      // and then confirm the payment with Stripe.js
      const paymentResult = {
        success: true,
        payment: {
          id: 'mock-stripe-payment-id-' + Date.now(),
          amount,
          currency,
          status: 'succeeded',
          provider: 'stripe',
          customerId: 'mock-customer-id',
          metadata: { ...metadata, ...data },
          timestamp: new Date().toISOString()
        }
      };
      
      return paymentResult;
    } catch (error) {
      console.error('Stripe payment failed:', error);
      throw error;
    }
  };
  
  // Process payment with PayPal
  const processPayPalPayment = async (data: any) => {
    try {
      if (!window.paypal) {
        throw new Error('PayPal SDK not loaded');
      }
      
      // In a real app, you would integrate with PayPal checkout flow
      const paymentResult = {
        success: true,
        payment: {
          id: 'mock-paypal-payment-id-' + Date.now(),
          amount,
          currency,
          status: 'COMPLETED',
          provider: 'paypal',
          customerId: 'mock-paypal-customer',
          metadata: { ...metadata, ...data },
          timestamp: new Date().toISOString()
        }
      };
      
      return paymentResult;
    } catch (error) {
      console.error('PayPal payment failed:', error);
      throw error;
    }
  };
  
  // Process payment with Razorpay
  const processRazorpayPayment = async (data: any) => {
    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }
      
      return new Promise<PaymentResult>((resolve, reject) => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: amount * 100, // Razorpay expects amount in smallest currency unit
          currency,
          name: 'Bell24H',
          description,
          handler: (response: any) => {
            const paymentResult = {
              success: true,
              payment: {
                id: response.razorpay_payment_id,
                amount,
                currency,
                status: 'completed',
                provider: 'razorpay',
                customerId: 'mock-customer-id',
                metadata: { ...metadata, ...data, response },
                timestamp: new Date().toISOString()
              }
            };
            
            resolve(paymentResult);
          },
          prefill: {
            name: data.name,
            email: data.email,
            contact: data.phone
          },
          notes: metadata,
          theme: {
            color: '#3f51b5'
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            }
          }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (error) {
      console.error('Razorpay payment failed:', error);
      throw error;
    }
  };
  
  // Handle form submission
  const onSubmit = useCallback(async (data: any) => {
    if (!selectedProvider || !formValid) {
      return;
    }
    
    setProcessingPayment(true);
    setFormError(null);
    
    try {
      let paymentResult: PaymentResult;
      
      switch (selectedProvider) {
        case 'stripe':
          paymentResult = await processStripePayment(data);
          break;
        case 'paypal':
          paymentResult = await processPayPalPayment(data);
          break;
        case 'razorpay':
          paymentResult = await processRazorpayPayment(data);
          break;
        default:
          throw new Error('Invalid payment provider selected');
      }
      
      onSuccess(paymentResult);
      
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      
      enqueueSnackbar('Payment completed successfully!', { variant: 'success' });
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setFormError(error.message || 'Payment failed. Please try again.');
      onError(error);
      enqueueSnackbar(error.message || 'Payment failed. Please try again.', { variant: 'error' });
    } finally {
      setProcessingPayment(false);
    }
  }, [selectedProvider, formValid, processStripePayment, processPayPalPayment, processRazorpayPayment, onSuccess, onError, redirectUrl, router, enqueueSnackbar]);
  
  // Render payment provider-specific UI 
  const renderPaymentForm = () => {
    if (!selectedProvider) return null;
    
    switch (selectedProvider) {
      case 'stripe':
        return (
          <Box style={{ marginTop: '16px' }}>
            {savedCards.length > 0 && (
              <FormControl fullWidth style={{ marginBottom: '16px' }}>
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id="use-saved-card" 
                    checked={useSavedCard} 
                    onChange={(e) => setUseSavedCard(e.target.checked)} 
                    style={{ margin: 0 }} 
                    name="useSavedCard"
                    aria-label="Use saved card"
                  />
                  <label htmlFor="use-saved-card" style={{ marginLeft: '8px' }}>Use saved card</label>
                </Box>
              </FormControl>
            )}
            
            {useSavedCard ? (
              <FormControl fullWidth style={{ marginBottom: '16px' }}>
                <InputLabel id="saved-card-label">Select Card</InputLabel>
                <Select
                  labelId="saved-card-label"
                  id="saved-card"
                  label="Select Card"
                  value={watch('savedCard')}
                  onChange={(e) => setValue('savedCard', e.target.value)}
                  error={Boolean(errors.savedCard)}
                  disabled={processingPayment}
                  aria-label="Select saved card"
                >
                  {savedCards.map((card) => (
                    <MenuItem key={card.id} value={card.id}>
                      {card.brand} **** **** **** {card.last4} (Expires: {card.exp_month}/{card.exp_year})
                    </MenuItem>
                  ))}
                </Select>
                {errors.savedCard && <FormHelperText error>{errors.savedCard.message}</FormHelperText>}
              </FormControl>
            ) : (
              <Box>
                <Typography variant="body2" style={{ marginBottom: '16px' }}>
                  <LockIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Your card information is encrypted and securely processed
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Holder Name"
                      {...register('cardName', { required: 'Card holder name is required' })}
                      error={Boolean(errors.cardName)}
                      helperText={errors.cardName?.message}
                      disabled={processingPayment}
                      InputProps={{
                        startAdornment: <CreditCardIcon style={{ marginRight: '8px', color: '#757575' }} />
                      }}
                      aria-label="Card holder name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      {...register('cardNumber', { 
                        required: 'Card number is required',
                        pattern: {
                          value: /^[0-9]{16}$/,
                          message: 'Please enter a valid 16-digit card number'
                        }
                      })}
                      error={Boolean(errors.cardNumber)}
                      helperText={errors.cardNumber?.message}
                      disabled={processingPayment}
                      aria-label="Card number"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date (MM/YY)"
                      {...register('cardExpiry', { 
                        required: 'Expiry date is required',
                        pattern: {
                          value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                          message: 'Please enter a valid expiry date (MM/YY)'
                        } 
                      })}
                      error={Boolean(errors.cardExpiry)}
                      helperText={errors.cardExpiry?.message}
                      disabled={processingPayment}
                      aria-label="Card expiry date"
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVC"
                      {...register('cardCvc', { 
                        required: 'CVC is required',
                        pattern: {
                          value: /^[0-9]{3,4}$/,
                          message: 'Please enter a valid CVC (3-4 digits)'
                        } 
                      })}
                      error={Boolean(errors.cardCvc)}
                      helperText={errors.cardCvc?.message}
                      disabled={processingPayment}
                      aria-label="Card CVC code"
                      type="password"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );
        
      case 'paypal':
        return (
          <Box style={{ marginTop: '16px', textAlign: 'center' }}>
            <Typography variant="body2" style={{ marginBottom: '16px' }}>
              <LockIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              You will be redirected to PayPal to complete your payment
            </Typography>
            
            <Box
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '16px',
                backgroundColor: '#fafafa',
                marginBottom: '16px'
              }}
            >
              <img 
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                alt="PayPal Logo" 
                style={{ height: '40px', marginBottom: '8px' }} 
              />
              <Typography variant="body2">
                Pay securely with your PayPal account or credit card through PayPal.
              </Typography>
            </Box>
          </Box>
        );
        
      case 'razorpay':
        return (
          <Box style={{ marginTop: '16px', textAlign: 'center' }}>
            <Typography variant="body2" style={{ marginBottom: '16px' }}>
              <LockIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              You will be redirected to Razorpay to complete your payment
            </Typography>
            
            <Box
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '16px',
                backgroundColor: '#fafafa',
                marginBottom: '16px'
              }}
            >
              <Typography variant="body2">
                Pay securely with UPI, credit/debit cards, or other payment methods through Razorpay.
              </Typography>
            </Box>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <CardHeader 
        title="Payment Details" 
        subheader={`Amount: ${getCurrencySymbol(currency)}${amount.toFixed(2)} ${currency.toUpperCase()}`}
      />
      
      <CardContent>
        {formError && (
          <Alert severity="error" style={{ marginBottom: '16px' }}>
            {formError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Payment Provider Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="payment-provider-label">Payment Method</InputLabel>
                <Select
                  labelId="payment-provider-label"
                  id="payment-provider"
                  value={selectedProvider}
                  onChange={handleProviderChange}
                  disabled={loading || processingPayment}
                  aria-label="Select payment method"
                  label="Payment Method"
                >
                  {allowedProviders.includes('stripe') && (
                    <MenuItem value="stripe">
                      <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCardIcon style={{ marginRight: '8px' }} />
                        <span>Credit/Debit Card</span>
                      </Box>
                    </MenuItem>
                  )}
                  
                  {allowedProviders.includes('paypal') && (
                    <MenuItem value="paypal">
                      <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                          src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                          alt="PayPal" 
                          style={{ width: '24px', marginRight: '8px' }} 
                        />
                        <span>PayPal</span>
                      </Box>
                    </MenuItem>
                  )}
                  
                  {allowedProviders.includes('razorpay') && (
                    <MenuItem value="razorpay">
                      <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceIcon style={{ marginRight: '8px' }} />
                        <span>UPI / Net Banking</span>
                      </Box>
                    </MenuItem>
                  )}
                </Select>
                {errors.provider && <FormHelperText error>{errors.provider.message}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* Customer Details */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                {...register('name', { required: 'Full name is required' })}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                disabled={loading || processingPayment}
                aria-label="Full name"
                InputProps={{
                  startAdornment: <PersonIcon style={{ marginRight: '8px', color: '#757575' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  } 
                })}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                disabled={loading || processingPayment}
                aria-label="Email address"
                InputProps={{
                  startAdornment: <EmailIcon style={{ marginRight: '8px', color: '#757575' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register('phone')}
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
                disabled={loading || processingPayment}
                aria-label="Phone number"
                InputProps={{
                  startAdornment: <PhoneIcon style={{ marginRight: '8px', color: '#757575' }} />
                }}
              />
            </Grid>
            
            {/* Payment Provider Specific Form */}
            <Grid item xs={12}>
              {loading ? (
                <Box style={{ textAlign: 'center', padding: '24px' }}>
                  <CircularProgress />
                  <Typography variant="body2" style={{ marginTop: '16px' }}>
                    Loading payment options...
                  </Typography>
                </Box>
              ) : renderPaymentForm()}
            </Grid>
          </Grid>
          
          <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <Button 
              variant="outlined" 
              onClick={handleCancel}
              disabled={processingPayment}
              aria-label="Cancel payment"
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={!formValid || loading || processingPayment}
              aria-label="Complete payment"
              endIcon={processingPayment ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {processingPayment ? 'Processing...' : `Pay ${getCurrencySymbol(currency)}${amount.toFixed(2)}`}
            </Button>
          </Box>
        </form>
      </CardContent>
      
      <CardActions style={{ justifyContent: 'center', padding: '16px' }}>
        <Typography variant="caption" style={{ display: 'flex', alignItems: 'center' }}>
          <LockIcon fontSize="small" style={{ marginRight: '4px', fontSize: '14px' }} />
          Secure payment powered by Bell24H
        </Typography>
      </CardActions>
    </Card>
  );
  };
