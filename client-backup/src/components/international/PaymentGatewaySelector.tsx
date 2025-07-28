import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentService } from '../../services/international/paymentService.js';
import StripePayment from './StripePayment.js';
import PayPalPayment from './PayPalPayment.js';
// @ts-ignore
import { Box, Card, CardContent, CardHeader, Divider, Typography, Button, Grid } from '@mui/material';

interface PaymentGatewaySelectorProps {
  amount: number;
  currency: string;
  orderId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentGatewaySelector: React.FC<PaymentGatewaySelectorProps> = ({
  amount,
  currency,
  orderId,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation();
  const [selectedGateway, setSelectedGateway] = useState('');
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

  const handleGatewaySelect = async (gateway: string) => {
    try {
      const availableMethods = await paymentService.getAvailablePaymentMethods('');
      if (availableMethods.includes(gateway)) {
        setSelectedGateway(gateway);
      } else {
        onError(t('payment.error.unavailable'));
      }
    } catch (error) {
      console.error('Error checking payment methods:', error);
      onError(t('payment.error.checkingMethods'));
    }
  };

  const renderPaymentGateway = () => {
    switch (selectedGateway) {
      case 'stripe':
        return (
          <StripePayment
            amount={amount}
            currency={currency}
            orderId={orderId}
            onSuccess={onSuccess}
            onError={onError}
          />
        );
      case 'paypal':
        return (
          <PayPalPayment
            amount={amount}
            currency={currency}
            orderId={orderId}
            onSuccess={onSuccess}
            onError={onError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card>
        <CardHeader title={t('payment.title')} />
        <Divider />
        
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('payment.selectGateway')}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant={selectedGateway === 'stripe' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => handleGatewaySelect('stripe')}
              >
                {t('payment.stripe')}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant={selectedGateway === 'paypal' ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => handleGatewaySelect('paypal')}
              >
                {t('payment.paypal')}
              </Button>
            </Grid>

            {selectedGateway && (
              <Grid item xs={12}>
                {renderPaymentGateway()}
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentGatewaySelector;
