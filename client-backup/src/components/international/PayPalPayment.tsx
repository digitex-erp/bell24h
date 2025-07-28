import React, { useState } from 'react';
// @ts-ignore
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useTranslation } from 'react-i18next';
import { PaymentService } from '../../services/international/paymentService.js';
// @ts-ignore
import { Box, Typography, CircularProgress } from '@mui/material';

interface PayPalPaymentProps {
  amount: number;
  currency: string;
  orderId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  currency,
  orderId,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const paymentService = new PaymentService({
    stripe: {
      apiKey: process.env.REACT_APP_STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.REACT_APP_STRIPE_WEBHOOK_SECRET || ''
    },
    paypal: {
      clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
      secret: process.env.REACT_APP_PAYPAL_SECRET || ''
    },
    regional: {}
  });

  const createOrder = async () => {
    try {
      const order = await paymentService.createPaymentIntent(
        amount,
        currency,
        'paypal',
        { orderId }
      );
      return order.id;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      onError(t('payment.error.creatingOrder'));
      return null;
    }
  };

  const onApprove = async (details: any) => {
    try {
      setLoading(true);
      const verified = await paymentService.verifyPayment(details.orderID, 'paypal');
      
      if (verified) {
        onSuccess();
      } else {
        onError(t('payment.error.verification'));
      }
    } catch (error) {
      onError(t('payment.error.processing'));
    } finally {
      setLoading(false);
    }
  };

  const onErrorHandler = (error: any) => {
    console.error('PayPal error:', error);
    onError(t('payment.error.processing'));
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('payment.title')}
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onErrorHandler}
            style={{
              layout: 'horizontal',
              color: 'blue',
              shape: 'pill',
              label: 'paypal',
              tagline: false
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default PayPalPayment;
