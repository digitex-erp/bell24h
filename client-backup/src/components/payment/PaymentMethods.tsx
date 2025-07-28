import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, List, ListItem, ListItemIcon,
  ListItemText, Divider, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid,
  Paper, Avatar, Tooltip, CircularProgress, Alert, useTheme, useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon, CreditCard as CreditCardIcon, Delete as DeleteIcon,
  Edit as EditIcon, CheckCircle as CheckCircleIcon, Payment as PaymentIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unknown';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account' | 'wallet';
  card?: {
    brand: CardBrand;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  paypal?: { email: string };
  bankAccount?: {
    bankName: string;
    last4: string;
    accountType: 'checking' | 'savings';
  };
  isDefault: boolean;
  createdAt: string;
}

const PaymentMethods: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [formData, setFormData] = useState({
    type: 'card' as const,
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    isDefault: false,
  });

  // Mock data for demonstration
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData: PaymentMethod[] = [
          {
            id: 'pm_1',
            type: 'card',
            card: { brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025 },
            isDefault: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'pm_2',
            type: 'paypal',
            paypal: { email: 'user@example.com' },
            isDefault: false,
            createdAt: new Date().toISOString(),
          },
        ];
        
        setPaymentMethods(mockData);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        enqueueSnackbar('Failed to load payment methods', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [enqueueSnackbar]);

  const handleDelete = async () => {
    if (!selectedMethod) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPaymentMethods(prev => prev.filter(method => method.id !== selectedMethod.id));
      setDeleteDialogOpen(false);
      enqueueSnackbar('Payment method removed', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      enqueueSnackbar('Failed to remove payment method', { variant: 'error' });
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPaymentMethods(prev =>
        prev.map(method => ({
          ...method,
          isDefault: method.id === methodId,
        }))
      );
      
      enqueueSnackbar('Default payment method updated', { variant: 'success' });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      enqueueSnackbar('Failed to update default payment method', { variant: 'error' });
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method.type) {
      case 'card':
        return method.card 
          ? `${method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} •••• ${method.card.last4}`
          : 'Credit/Debit Card';
      case 'paypal':
        return method.paypal ? `PayPal (${method.paypal.email})` : 'PayPal';
      case 'bank_account':
        return method.bankAccount 
          ? `${method.bankAccount.bankName} •••• ${method.bankAccount.last4}`
          : 'Bank Account';
      default:
        return 'Payment Method';
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return method.card ? `/icons/${method.card.brand}.png` : '/icons/credit-card.png';
      case 'paypal':
        return '/icons/paypal.png';
      case 'bank_account':
        return '/icons/bank.png';
      default:
        return '/icons/payment.png';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Payment Methods</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setActiveTab('add')}
        >
          Add Payment Method
        </Button>
      </Box>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <PaymentIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Payment Methods
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                You haven't added any payment methods yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setActiveTab('add')}
              >
                Add Payment Method
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List disablePadding>
            {paymentMethods.map((method, index) => (
              <React.Fragment key={method.id}>
                <ListItem 
                  secondaryAction={
                    <Box display="flex" gap={1}>
                      {!method.isDefault && (
                        <Tooltip title="Set as default">
                          <IconButton
                            onClick={() => handleSetDefault(method.id)}
                            size="small"
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => {
                            setSelectedMethod(method);
                            setDeleteDialogOpen(true);
                          }}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Avatar 
                      src={getPaymentMethodIcon(method)} 
                      alt={method.type}
                      sx={{ width: 40, height: 40 }}
                      variant="rounded"
                    >
                      <PaymentIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={getPaymentMethodLabel(method)}
                    secondary={method.isDefault ? 'Default payment method' : ''}
                    primaryTypographyProps={{
                      fontWeight: method.isDefault ? 'bold' : 'normal',
                    }}
                  />
                </ListItem>
                {index < paymentMethods.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove Payment Method</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this payment method?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentMethods;
