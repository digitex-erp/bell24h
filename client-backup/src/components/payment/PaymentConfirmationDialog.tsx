import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

interface PaymentConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  paymentDetails: {
    id: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'pending' | 'failed';
    paymentMethod: {
      type: string;
      last4?: string;
      brand?: string;
    };
    receiptUrl?: string;
    billingDetails?: {
      name?: string;
      email?: string;
    };
    createdAt: number | string | Date;
    description?: string;
  };
  onPrint?: () => void;
  onEmailReceipt?: () => Promise<void>;
}

export const PaymentConfirmationDialog: React.FC<PaymentConfirmationDialogProps> = ({
  open,
  onClose,
  paymentDetails,
  onPrint,
  onEmailReceipt,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const [isEmailing, setIsEmailing] = React.useState(false);
  
  // Format amount with currency
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };
  
  // Format date
  const formatDate = (date: number | string | Date) => {
    try {
      const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date);
      return format(dateObj, 'PPPppp');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'N/A';
    }
  };
  
  // Handle print receipt
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };
  
  // Handle email receipt
  const handleEmailReceipt = async () => {
    if (!onEmailReceipt) return;
    
    try {
      setIsEmailing(true);
      await onEmailReceipt();
      enqueueSnackbar('Receipt sent to your email', { variant: 'success' });
    } catch (err) {
      console.error('Error emailing receipt:', err);
      enqueueSnackbar('Failed to send receipt. Please try again.', { variant: 'error' });
    } finally {
      setIsEmailing(false);
    }
  };
  
  // Handle share receipt
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Receipt',
          text: `Here's your payment receipt for ${formatAmount(paymentDetails.amount, paymentDetails.currency)}`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      enqueueSnackbar('Link copied to clipboard', { variant: 'info' });
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get payment method icon
  const getPaymentMethodIcon = () => {
    const { type, brand } = paymentDetails.paymentMethod;
    
    if (type === 'card') {
      switch (brand) {
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
    } else if (type === 'paypal') {
      return '/icons/paypal.png';
    } else if (type === 'bank_account') {
      return '/icons/bank.png';
    }
    
    return '/icons/payment.png';
  };
  
  // Get payment method label
  const getPaymentMethodLabel = () => {
    const { type, brand, last4 } = paymentDetails.paymentMethod;
    
    switch (type) {
      case 'card':
        return `${brand ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} ` : ''}•••• ${last4 || '••••'}`;
      case 'paypal':
        return 'PayPal';
      case 'bank_account':
        return `Bank Account •••• ${last4 || '••••'}`;
      default:
        return type || 'Payment Method';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <CheckCircleIcon 
              color={paymentDetails.status === 'succeeded' ? 'success' : 'disabled'} 
              sx={{ mr: 1 }} 
            />
            <Typography variant="h6" component="span">
              {paymentDetails.status === 'succeeded' 
                ? 'Payment Successful!' 
                : paymentDetails.status === 'pending'
                  ? 'Payment Pending'
                  : 'Payment Failed'}
            </Typography>
          </Box>
          <IconButton 
            edge="end" 
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: theme.palette.success.light,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <CheckCircleIcon 
              sx={{ 
                fontSize: 48, 
                color: theme.palette.success.contrastText 
              }} 
            />
          </Box>
          
          <Typography variant="h4" gutterBottom>
            {formatAmount(paymentDetails.amount, paymentDetails.currency)}
          </Typography>
          
          <Chip 
            label={paymentDetails.status.toUpperCase()} 
            color={getStatusColor(paymentDetails.status)}
            size="small"
            sx={{ mb: 2 }}
          />
          
          {paymentDetails.description && (
            <Typography variant="body1" color="textSecondary" paragraph>
              {paymentDetails.description}
            </Typography>
          )}
          
          <Typography variant="body2" color="textSecondary">
            {formatDate(paymentDetails.createdAt)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Transaction ID: {paymentDetails.id}
          </Typography>
        </Box>
        
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mb: 3,
            borderRadius: 1,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Payment Method
              </Typography>
              <Box display="flex" alignItems="center">
                <Box 
                  component="img" 
                  src={getPaymentMethodIcon()} 
                  alt={paymentDetails.paymentMethod.type}
                  sx={{ 
                    width: 32, 
                    height: 20, 
                    objectFit: 'contain',
                    mr: 1.5,
                  }} 
                />
                <Typography variant="body1">
                  {getPaymentMethodLabel()}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Billed to
              </Typography>
              <Typography variant="body1">
                {paymentDetails.billingDetails?.name || 'N/A'}
              </Typography>
              {paymentDetails.billingDetails?.email && (
                <Typography variant="body2" color="textSecondary">
                  {paymentDetails.billingDetails.email}
                </Typography>
              )}
            </Grid>
            
            {paymentDetails.receiptUrl && (
              <Grid item xs={12}>
                <Button
                  startIcon={<ReceiptIcon />}
                  onClick={() => window.open(paymentDetails.receiptUrl, '_blank')}
                  size="small"
                >
                  View Receipt
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={isEmailing}
            size="small"
          >
            Print
          </Button>
          
          <Button
            startIcon={<EmailIcon />}
            onClick={handleEmailReceipt}
            disabled={isEmailing || !onEmailReceipt}
            size="small"
          >
            {isEmailing ? 'Sending...' : 'Email Receipt'}
          </Button>
          
          <Button
            startIcon={<ShareIcon />}
            onClick={handleShare}
            disabled={isEmailing}
            size="small"
          >
            Share
          </Button>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onClose}
          fullWidth={isMobile}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentConfirmationDialog;
