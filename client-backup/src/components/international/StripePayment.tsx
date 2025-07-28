import React, { useState, useEffect, useCallback } from 'react';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions, StripeError } from '@stripe/stripe-js';
import { useTranslation } from 'react-i18next';
import { PaymentService } from '../../services/international/paymentService';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert, 
  AlertTitle,
  Card,
  CardContent,
  Divider,
  Stack
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline, Payment as PaymentIcon } from '@mui/icons-material';

// Load Stripe.js asynchronously
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

interface StripePaymentProps {
  amount: number;
  currency: string;
  orderId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  metadata?: Record<string, string>;
  disabled?: boolean;
}

// Payment form component that uses Stripe Elements
const CheckoutForm: React.FC<{
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}> = ({ clientSecret, onSuccess, onError, disabled }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      console.error('Stripe.js has not loaded yet');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment method and confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement('card')!,
          billing_details: {
            // Add billing details if available
          },
        },
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        const errorMessage = stripeError.message || t('payment.error.processing');
        setError(errorMessage);
        onError(errorMessage);
        return;
      }

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        setPaymentIntentId(paymentIntent.id);
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('payment.error.unknown');
      console.error('Payment error:', err);
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Initialize Stripe Elements
  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    const card = elements.create('card');
    card.mount('#stripe-payment-element');

    return () => {
      if (card) {
        card.destroy();
      }
    };
  }, [stripe, elements]);

  // Handle payment element ready event
  useEffect(() => {
    console.log('Stripe Elements ready');
  }, []);

  // Handle payment element change event
  const handleChange = (event: { complete: boolean }) => {
    // Handle element change
  };

  if (succeeded && paymentIntentId) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <CheckCircleOutline style={{ fontSize: 60, marginBottom: '1rem', color: '#4caf50' }} />
        <h6 style={{ marginBottom: '1rem' }}>
          {t('payment.success.title')}
        </h6>
        <p style={{ color: 'rgba(0, 0, 0, 0.6)', marginBottom: '1rem' }}>
          {t('payment.success.message')}
        </p>
        <p style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>
          {t('payment.referenceId')}: {paymentIntentId}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" mb={2}>
              <PaymentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                {t('payment.secureCheckout')}
              </Typography>
            </Box>
            
            <Divider />
            
            {/* Payment Element */}
            <Box sx={{ minHeight: '200px' }}>
              {/* Card element will be injected here by Stripe.js */}
            <div id="stripe-payment-element" />
            </Box>

            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>{t('payment.error.title')}</AlertTitle>
                {error}
              </Alert>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={!stripe || processing || disabled}
              startIcon={processing ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : null}
            >
              {processing ? t('payment.processing') : t('payment.payNow')}
            </Button>
            
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <p style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem' }}>
                {t('payment.secureMessage')}
              </p>
            </div>
          </Stack>
        </CardContent>
      </Card>
    </form>
  );
};

// Main Stripe Payment component
const StripePayment: React.FC<StripePaymentProps> = ({
  amount,
  currency,
  orderId,
  onSuccess,
  onError,
  metadata = {},
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Initialize payment service
  const paymentService = React.useMemo(() => new PaymentService({
    stripe: {
      apiKey: process.env.REACT_APP_STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.REACT_APP_STRIPE_WEBHOOK_SECRET || ''
    },
    paypal: {
      clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
      secret: process.env.REACT_APP_PAYPAL_SECRET || ''
    },
    regional: {}
  }), []);

  // Create payment intent
  const createPaymentIntent = useCallback(async () => {
    if (!amount || !currency || !orderId) {
      setError(t('payment.error.invalidParams'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const intent = await paymentService.createPaymentIntent(
        amount,
        currency.toLowerCase(),
        'stripe',
        { 
          orderId,
          ...metadata 
        }
      );
      
      if (intent?.client_secret) {
        setClientSecret(intent.client_secret);
      } else {
        throw new Error(t('payment.error.noClientSecret'));
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      const errorMessage = err instanceof Error ? err.message : t('payment.error.creatingIntent');
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [amount, currency, orderId, metadata, paymentService, t, onError]);

  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Initialize payment intent on mount or when dependencies change
  useEffect(() => {
    createPaymentIntent();
  }, [createPaymentIntent, retryCount]);

  // Handle successful payment
  const handlePaymentSuccess = (paymentIntentId: string) => {
    onSuccess(paymentIntentId);
  };

  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    onError(errorMessage);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
        <CircularProgress />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <ErrorOutline style={{ fontSize: 60, marginBottom: '1rem', color: '#f44336' }} />
        <h6 style={{ marginBottom: '1rem' }}>
          {t('payment.error.title')}
        </h6>
        <p style={{ color: 'rgba(0, 0, 0, 0.6)', marginBottom: '1rem' }}>
          {error}
        </p>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={handleRetry}
          startIcon={<RefreshIcon />}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  // Render Stripe Elements provider
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px' }}>
      {clientSecret ? (
        <Elements 
          stripe={stripePromise} 
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
            },
            loader: 'auto',
          }}
        >
          <CheckoutForm 
            clientSecret={clientSecret} 
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            disabled={disabled}
          />
        </Elements>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <CircularProgress style={{ color: '#1976d2' }} />
          <div style={{ marginTop: '1rem' }}>
            <p>{t('payment.initializing')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StripePayment;
