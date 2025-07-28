import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { usePayment } from '../contexts/PaymentContext';
import PaymentProviderSelector from '../components/payment/PaymentProviderSelector';
import PaymentSummary from '../components/payment/PaymentSummary';
import PaymentConfirmationDialog from '../components/payment/PaymentConfirmationDialog';
import PaymentHistoryItem from '../components/payment/PaymentHistoryItem';

// Mock data for payment history
const mockPayments = [
  {
    id: 'pi_123456789',
    amount: 2999,
    currency: 'usd',
    status: 'succeeded',
    paymentMethod: {
      type: 'card',
      brand: 'visa',
      last4: '4242',
    },
    description: 'Premium Plan Subscription',
    receiptUrl: 'https://example.com/receipt/pi_123456789',
    invoiceUrl: 'https://example.com/invoice/inv_123456789',
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
  },
  {
    id: 'pi_987654321',
    amount: 999,
    currency: 'usd',
    status: 'succeeded',
    paymentMethod: {
      type: 'paypal',
    },
    description: 'Basic Plan Subscription',
    receiptUrl: 'https://example.com/receipt/pi_987654321',
    invoiceUrl: 'https://example.com/invoice/inv_987654321',
    createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
  },
];

const PaymentPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  
  const { createPaymentIntent, confirmPayment, paymentMethods } = usePayment();
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle payment method selection
  const handlePaymentMethodSelected = (paymentMethodId: string) => {
    setSelectedPaymentMethod(paymentMethodId);
  };
  
  // Handle payment submission
  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      enqueueSnackbar('Please select a payment method', { variant: 'warning' });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create a payment intent (in a real app, this would be an API call)
      const amount = 2999; // $29.99 in cents
      const currency = 'usd';
      
      // In a real app, you would call your backend to create a payment intent
      // const paymentIntent = await createPaymentIntent(amount, currency);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock payment intent response
      const paymentIntent = {
        id: `pi_${Math.random().toString(36).substr(2, 14)}`,
        amount,
        currency,
        status: 'requires_confirmation',
        clientSecret: `pi_${Math.random().toString(36).substr(2, 14)}_secret_${Math.random().toString(36).substr(2, 14)}`,
        created: Math.floor(Date.now() / 1000),
      };
      
      // Confirm the payment
      // In a real app, you would handle 3D Secure authentication if required
      const success = await confirmPayment(selectedPaymentMethod);
      
      if (success) {
        // Show success message and update UI
        setCurrentPayment({
          ...paymentIntent,
          status: 'succeeded',
          paymentMethod: paymentMethods.find(pm => pm.id === selectedPaymentMethod) || { type: 'card' },
          billingDetails: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        });
        setShowConfirmation(true);
        enqueueSnackbar('Payment successful!', { variant: 'success' });
      }
    } catch (err) {
      console.error('Payment error:', err);
      enqueueSnackbar('Payment failed. Please try again.', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle view payment details
  const handleViewDetails = (paymentId: string) => {
    const payment = mockPayments.find(p => p.id === paymentId);
    if (payment) {
      setCurrentPayment(payment);
      setShowConfirmation(true);
    }
  };
  
  // Handle download receipt
  const handleDownloadReceipt = (paymentId: string, receiptUrl: string) => {
    // In a real app, this would download the receipt
    window.open(receiptUrl, '_blank');
    enqueueSnackbar('Opening receipt in new tab...', { variant: 'info' });
  };
  
  // Handle share payment
  const handleSharePayment = (paymentId: string) => {
    // In a real app, this would share the payment details
    navigator.clipboard.writeText(`Check out my payment: ${window.location.origin}/payments/${paymentId}`);
    enqueueSnackbar('Payment link copied to clipboard', { variant: 'success' });
  };
  
  // Handle refund
  const handleRefund = (paymentId: string) => {
    // In a real app, this would initiate a refund
    enqueueSnackbar('Refund initiated', { variant: 'info' });
  };
  
  // Handle email receipt
  const handleEmailReceipt = async () => {
    // In a real app, this would send an email with the receipt
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Payment
      </Typography>
      
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tab label="Make a Payment" />
          <Tab label="Payment History" />
        </Tabs>
        
        <Box p={isMobile ? 2 : 3}>
          {activeTab === 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                <Box flex={1}>
                  <PaymentProviderSelector
                    amount={2999}
                    currency="usd"
                    onPaymentMethodSelected={handlePaymentMethodSelected}
                    showAddPaymentMethod={true}
                  />
                  
                  <Box mt={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      onClick={handlePayment}
                      disabled={isProcessing || !selectedPaymentMethod}
                      startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                      {isProcessing ? 'Processing...' : 'Pay $29.99'}
                    </Button>
                    
                    <Typography variant="caption" color="text.secondary" display="block" mt={1} textAlign="center">
                      You'll be charged $29.99 for the Premium Plan
                    </Typography>
                  </Box>
                </Box>
                
                <Box width={{ xs: '100%', md: 350 }}>
                  <PaymentSummary
                    subtotal={2999}
                    currency="usd"
                    fees={[
                      { id: 'processing', label: 'Processing Fee', amount: 99, description: '2.9% + $0.30' },
                    ]}
                    taxRate={8.875}
                    showTaxBreakdown={true}
                    showDiscountField={true}
                    showAgreementCheckbox={true}
                    agreementText="I agree to the [Terms of Service] and [Privacy Policy]"
                    disclaimerText="By completing your purchase, you agree to our [Terms of Service] and [Privacy Policy]."
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment History
              </Typography>
              
              {mockPayments.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No payment history found
                  </Typography>
                </Box>
              ) : (
                <Paper variant="outlined">
                  {mockPayments.map((payment, index) => (
                    <React.Fragment key={payment.id}>
                      <PaymentHistoryItem
                        payment={payment}
                        onViewDetails={handleViewDetails}
                        onDownloadReceipt={handleDownloadReceipt}
                        onShare={handleSharePayment}
                        onRefund={handleRefund}
                        showDivider={index < mockPayments.length - 1}
                      />
                    </React.Fragment>
                  ))}
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Payment Confirmation Dialog */}
      <PaymentConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        paymentDetails={currentPayment || {
          id: '',
          amount: 0,
          currency: 'usd',
          status: 'succeeded',
          paymentMethod: { type: 'card' },
          billingDetails: {},
          createdAt: new Date(),
        }}
        onEmailReceipt={handleEmailReceipt}
      />
    </Container>
  );
};

export default PaymentPage;
