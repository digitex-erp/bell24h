import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  MoreVert as MoreVertIcon,
  CreditCard as CreditCardIcon,
  Payment as PaymentIcon,
  ReceiptLong as ReceiptLongIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

interface PaymentHistoryItemProps {
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';
    paymentMethod: {
      type: 'card' | 'paypal' | 'bank_account' | string;
      brand?: string;
      last4?: string;
    };
    description?: string;
    receiptUrl?: string;
    invoiceUrl?: string;
    createdAt: number | string | Date;
    metadata?: Record<string, any>;
  };
  onViewDetails?: (paymentId: string) => void;
  onDownloadReceipt?: (paymentId: string, receiptUrl: string) => void;
  onShare?: (paymentId: string) => void;
  onRefund?: (paymentId: string) => void;
  showDivider?: boolean;
}

const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({
  payment,
  onViewDetails,
  onDownloadReceipt,
  onShare,
  onRefund,
  showDivider = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
      return format(dateObj, 'MMM d, yyyy');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'N/A';
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
      case 'refunded':
      case 'partially_refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get payment method icon
  const getPaymentMethodIcon = () => {
    const { type, brand } = payment.paymentMethod;
    
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
    const { type, brand, last4 } = payment.paymentMethod;
    
    switch (type) {
      case 'card':
        return `${brand ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} ` : ''}•••• ${last4 || '••••'}`;
      case 'paypal':
        return 'PayPal';
      case 'bank_account':
        return `Bank Account •••• ${last4 || '••••'}`;
      default:
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Payment Method';
    }
  };

  // Handle menu open
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = (event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  // Handle view details
  const handleViewDetails = (event: React.MouseEvent) => {
    event.stopPropagation();
    onViewDetails?.(payment.id);
    handleMenuClose();
  };

  // Handle download receipt
  const handleDownloadReceipt = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (payment.receiptUrl) {
      onDownloadReceipt?.(payment.id, payment.receiptUrl);
    } else {
      enqueueSnackbar('No receipt available for this payment', { variant: 'info' });
    }
    handleMenuClose();
  };

  // Handle share
  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (onShare) {
      onShare(payment.id);
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Receipt',
          text: `Payment of ${formatAmount(payment.amount, payment.currency)} on ${formatDate(payment.createdAt)}`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          enqueueSnackbar('Failed to share payment', { variant: 'error' });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `Payment of ${formatAmount(payment.amount, payment.currency)} on ${formatDate(payment.createdAt)}`;
      await navigator.clipboard.writeText(shareText);
      enqueueSnackbar('Payment details copied to clipboard', { variant: 'info' });
    }
    
    handleMenuClose();
  };

  // Handle refund
  const handleRefund = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRefund?.(payment.id);
    handleMenuClose();
  };

  return (
    <>
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 2,
          px: { xs: 1, sm: 2 },
          cursor: onViewDetails ? 'pointer' : 'default',
          '&:hover': {
            backgroundColor: onViewDetails ? 'action.hover' : 'transparent',
            borderRadius: 1,
          },
          transition: 'background-color 0.2s ease-in-out',
        }}
        onClick={() => onViewDetails?.(payment.id)}
      >
        {/* Payment Icon */}
        <Box 
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: theme.palette.primary.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            flexShrink: 0,
          }}
        >
          <PaymentIcon 
            sx={{ 
              color: theme.palette.primary.contrastText,
              fontSize: 20,
            }} 
          />
        </Box>

        {/* Payment Details */}
        <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
          <Box display="flex" alignItems="center" mb={0.5}>
            <Typography 
              variant="subtitle1" 
              component="div"
              sx={{
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mr: 1,
              }}
            >
              {payment.description || 'Payment'}
            </Typography>
            
            <Chip 
              label={getStatusLabel(payment.status)}
              color={getStatusColor(payment.status)}
              size="small"
              sx={{ 
                height: 20, 
                fontSize: '0.65rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            />
          </Box>
          
          <Box display="flex" flexWrap="wrap" alignItems="center" rowGap={0.5} columnGap={2}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <CreditCardIcon 
                sx={{ 
                  fontSize: '1rem', 
                  opacity: 0.7, 
                  mr: 0.5,
                  position: 'relative',
                  top: -1,
                }} 
              />
              {getPaymentMethodLabel()}
            </Typography>
            
            {!isMobile && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <ReceiptIcon 
                  sx={{ 
                    fontSize: '1rem', 
                    opacity: 0.7, 
                    mr: 0.5,
                    position: 'relative',
                    top: -1,
                  }} 
                />
                {formatDate(payment.createdAt)}
              </Typography>
            )}
            
            {payment.invoiceUrl && (
              <Tooltip title="View invoice">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(payment.invoiceUrl, '_blank');
                  }}
                  sx={{ 
                    p: 0.5,
                    ml: -0.5,
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ReceiptLongIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Amount */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            ml: 'auto',
            mr: 1,
          }}
        >
          <Typography 
            variant="subtitle1" 
            fontWeight={500}
            color={payment.status === 'refunded' || payment.status === 'failed' ? 'text.secondary' : 'text.primary'}
            sx={{
              textDecoration: payment.status === 'refunded' ? 'line-through' : 'none',
            }}
          >
            {formatAmount(payment.amount, payment.currency)}
          </Typography>
          
          {isMobile && (
            <Typography variant="caption" color="text.secondary">
              {formatDate(payment.createdAt)}
            </Typography>
          )}
        </Box>

        {/* Actions Menu */}
        <Box>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            aria-label="payment actions"
            sx={{
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
                bgcolor: 'action.hover',
              },
            }}
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleViewDetails}>
              <ListItemIcon>
                <InfoIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            
            <MenuItem 
              onClick={handleDownloadReceipt}
              disabled={!payment.receiptUrl}
            >
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Download Receipt</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleShare}>
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share</ListItemText>
            </MenuItem>
            
            {(payment.status === 'succeeded' || payment.status === 'partially_refunded') && (
              <MenuItem 
                onClick={handleRefund}
                disabled={!onRefund}
              >
                <ListItemIcon>
                  <PaymentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {payment.status === 'partially_refunded' ? 'Refund Remaining' : 'Refund'}
                </ListItemText>
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Box>
      
      {showDivider && <Divider sx={{ mx: 2 }} />}
    </>
  );
};

export default PaymentHistoryItem;
