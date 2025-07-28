import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  AccountBalanceWallet as WalletIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

interface PaymentSuccessProps {
  paymentId?: string;
  onClose?: () => void;
}

interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  orderId: string;
  createdAt: string;
  receiptUrl?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ paymentId: propPaymentId, onClose }) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get paymentId from URL if not provided as prop
  const urlPaymentId = router.query.paymentId as string;
  const paymentId = propPaymentId || urlPaymentId;

  useEffect(() => {
    if (!paymentId) {
      setError('No payment ID provided');
      setLoading(false);
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        const data = await response.json();
        setPayment(data);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to load payment details. Please try again later.');
        enqueueSnackbar('Failed to load payment details', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId, enqueueSnackbar]);

  const handleViewReceipt = () => {
    if (payment?.receiptUrl) {
      window.open(payment.receiptUrl, '_blank');
    } else {
      enqueueSnackbar('Receipt not available', { variant: 'info' });
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToOrders = () => {
    router.push('/orders');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100); // Convert from cents to dollars
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method.toLowerCase();
    
    if (methodLower.includes('visa')) return '/icons/visa.png';
    if (methodLower.includes('mastercard')) return '/icons/mastercard.png';
    if (methodLower.includes('amex')) return '/icons/amex.png';
    if (methodLower.includes('paypal')) return '/icons/paypal.png';
    if (methodLower.includes('razorpay')) return '/icons/razorpay.png';
    
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading payment details...</Typography>
      </Box>
    );
  }

  if (error || !payment) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="error" gutterBottom>
              {error || 'Payment not found'}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              We couldn't find the payment details. Please check the payment ID and try again.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoHome}
              startIcon={<HomeIcon />}
              sx={{ mt: 2 }}
            >
              Go to Home
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box maxWidth="800px" mx="auto">
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Thank you for your payment. Your transaction has been completed successfully.
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
              {formatCurrency(payment.amount, payment.currency)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Payment ID: {payment.id}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Order Information
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <ReceiptIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Order Number"
                      secondary={payment.orderId || 'N/A'}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <CalendarIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Date"
                      secondary={format(new Date(payment.createdAt), 'PPPppp')}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <WalletIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Payment Method"
                      secondary={
                        <Box display="flex" alignItems="center">
                          {getPaymentMethodIcon(payment.paymentMethod) ? (
                            <Box
                              component="img"
                              src={getPaymentMethodIcon(payment.paymentMethod)}
                              alt={payment.paymentMethod}
                              sx={{ height: 24, mr: 1 }}
                            />
                          ) : null}
                          {payment.paymentMethod}
                        </Box>
                      }
                    />
                  </ListItem>
                  {payment.customerEmail && (
                    <ListItem disableGutters>
                      <ListItemIcon>
                        <EmailIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={payment.customerEmail}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Next Steps
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, height: '100%' }}>
                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Order Confirmation"
                      secondary="You will receive an order confirmation email with details of your purchase."
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Shipping Information"
                      secondary="If your order includes shipping, you will receive tracking information once your order is on its way."
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Need Help?"
                      secondary="If you have any questions about your order, please contact our support team."
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="center" flexWrap="wrap" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleViewReceipt}
              disabled={!payment.receiptUrl}
              startIcon={<ReceiptIcon />}
            >
              View Receipt
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGoToOrders}
              sx={{ ml: 2 }}
            >
              View Order Status
            </Button>
            <Button
              variant="text"
              color="primary"
              onClick={handleGoHome}
              sx={{ ml: 2 }}
              startIcon={<HomeIcon />}
            >
              Back to Home
            </Button>
          </Box>

          <Box mt={4} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              A confirmation email has been sent to {payment.customerEmail || 'your email address'}.
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Order reference: {payment.orderId || 'N/A'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Additional order details or related products can go here */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Order Details
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          {payment.metadata?.items ? (
            <List>
              {payment.metadata.items.map((item: any, index: number) => (
                <ListItem key={index} divider={index < payment.metadata.items.length - 1}>
                  <ListItemText
                    primary={item.name}
                    secondary={`Quantity: ${item.quantity}`}
                  />
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(item.price * item.quantity, payment.currency)}
                  </Typography>
                </ListItem>
              ))}
              <ListItem>
                <ListItemText primary="Total" />
                <Typography variant="h6" color="primary">
                  {formatCurrency(payment.amount, payment.currency)}
                </Typography>
              </ListItem>
            </List>
          ) : (
            <Typography variant="body1" color="textSecondary" textAlign="center" py={2}>
              No order details available
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Support information */}
      <Box mt={4} textAlign="center">
        <Typography variant="subtitle1" gutterBottom>
          Need Help?
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          If you have any questions about your order, please contact our support team at{' '}
          <a href="mailto:support@bell24h.com" style={{ color: 'inherit' }}>
            support@bell24h.com
          </a>
          .
        </Typography>
        <Typography variant="body2" color="textSecondary">
          We're here to help you with any questions or concerns.
        </Typography>
      </Box>
    </Box>
  );
};

export default PaymentSuccess;
