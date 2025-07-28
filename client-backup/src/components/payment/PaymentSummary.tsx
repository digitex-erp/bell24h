import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper,
  useTheme,
  Alert,
  AlertTitle,
  Button,
  Tooltip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Info as InfoIcon,
  LocalOffer as LocalOfferIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';

interface FeeItem {
  id: string;
  label: string;
  amount: number;
  description?: string;
  taxable?: boolean;
}

interface PaymentSummaryProps {
  subtotal: number;
  currency?: string;
  fees?: FeeItem[];
  taxRate?: number;
  discountCode?: string;
  onDiscountCodeChange?: (code: string) => void;
  onApplyDiscount?: () => void;
  discountError?: string;
  discountLoading?: boolean;
  showTaxBreakdown?: boolean;
  showDiscountField?: boolean;
  showTotal?: boolean;
  showDisclaimer?: boolean;
  disclaimerText?: string;
  termsAndConditionsLink?: string;
  onTermsClick?: () => void;
  showAgreementCheckbox?: boolean;
  isAgreed?: boolean;
  onAgreementChange?: (agreed: boolean) => void;
  agreementText?: string;
  actionButton?: React.ReactNode;
  className?: string;
  sx?: object;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  subtotal = 0,
  currency = 'usd',
  fees = [],
  taxRate = 0,
  discountCode = '',
  onDiscountCodeChange,
  onApplyDiscount,
  discountError,
  discountLoading = false,
  showTaxBreakdown = true,
  showDiscountField = true,
  showTotal = true,
  showDisclaimer = true,
  disclaimerText = 'By completing your purchase, you agree to our Terms of Service and Privacy Policy.',
  termsAndConditionsLink = '/terms',
  onTermsClick,
  showAgreementCheckbox = false,
  isAgreed = false,
  onAgreementChange,
  agreementText = 'I agree to the Terms of Service and Privacy Policy',
  actionButton,
  className,
  sx = {},
}) => {
  const theme = useTheme();
  const [showFeeDetails, setShowFeeDetails] = React.useState(false);
  const [showTaxDetails, setShowTaxDetails] = React.useState(false);
  
  // Calculate fees total
  const feesTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
  
  // Calculate taxable amount (subtotal + non-taxable fees)
  const taxableAmount = subtotal + fees
    .filter(fee => !fee.taxable)
    .reduce((sum, fee) => sum + fee.amount, 0);
  
  // Calculate tax
  const tax = taxableAmount * (taxRate / 100);
  
  // Calculate total
  const total = subtotal + feesTotal + tax - (discountCode ? 0 : 0); // Discount calculation would be handled by parent
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };
  
  // Handle discount code change
  const handleDiscountCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDiscountCodeChange?.(e.target.value);
  };
  
  // Handle discount code apply
  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyDiscount?.();
  };
  
  // Handle terms click
  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTermsClick) {
      onTermsClick();
    } else if (termsAndConditionsLink) {
      window.open(termsAndConditionsLink, '_blank');
    }
  };
  
  // Handle agreement change
  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAgreementChange?.(e.target.checked);
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 3,
        ...sx,
      }}
      className={className}
    >
      <Typography variant="h6" fontWeight={600} mb={2}>
        Order Summary
      </Typography>
      
      {/* Subtotal */}
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body1" color="text.secondary">
          Subtotal
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {formatCurrency(subtotal)}
        </Typography>
      </Box>
      
      {/* Fees */}
      {fees.length > 0 && (
        <Box>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            mb={1}
            sx={{ cursor: 'pointer' }}
            onClick={() => setShowFeeDetails(!showFeeDetails)}
          >
            <Box display="flex" alignItems="center">
              <Typography variant="body1" color="text.secondary">
                Fees & Charges
              </Typography>
              <Tooltip title="View fee details">
                <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                  {showFeeDetails ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" fontWeight={500}>
              {formatCurrency(feesTotal)}
            </Typography>
          </Box>
          
          <Collapse in={showFeeDetails}>
            <Box mb={2} pl={2}>
              <List dense disablePadding>
                {fees.map((fee) => (
                  <ListItem key={fee.id} disableGutters disablePadding sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <LocalOfferIcon color="action" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={fee.label}
                      secondary={fee.description}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Typography variant="body2">
                      {formatCurrency(fee.amount)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Collapse>
        </Box>
      )}
      
      {/* Tax */}
      {tax > 0 && (
        <Box>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            mb={1}
            sx={showTaxBreakdown ? { cursor: 'pointer' } : {}}
            onClick={() => showTaxBreakdown && setShowTaxDetails(!showTaxDetails)}
          >
            <Box display="flex" alignItems="center">
              <Typography variant="body1" color="text.secondary">
                Tax
              </Typography>
              {showTaxBreakdown && (
                <Tooltip title="View tax details">
                  <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                    {showTaxDetails ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={`Tax rate: ${taxRate}%`}>
                <InfoIcon fontSize="small" color="action" sx={{ ml: 0.5 }} />
              </Tooltip>
            </Box>
            <Typography variant="body1" fontWeight={500}>
              {formatCurrency(tax)}
            </Typography>
          </Box>
          
          {showTaxBreakdown && (
            <Collapse in={showTaxDetails}>
              <Box mb={2} pl={2}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Taxable amount: {formatCurrency(taxableAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tax rate: {taxRate}%
                </Typography>
              </Box>
            </Collapse>
          )}
        </Box>
      )}
      
      {/* Discount Code */}
      {showDiscountField && onDiscountCodeChange && (
        <Box mb={2}>
          <form onSubmit={handleApplyDiscount}>
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                placeholder="Discount code"
                value={discountCode}
                onChange={handleDiscountCodeChange}
                fullWidth
                disabled={discountLoading}
                error={!!discountError}
                helperText={discountError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Apply discount code">
                        <span>
                          <Button 
                            type="submit"
                            disabled={!discountCode || discountLoading}
                            size="small"
                          >
                            {discountLoading ? 'Applying...' : 'Apply'}
                          </Button>
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </form>
        </Box>
      )}
      
      {/* Applied Discount */}
      {discountCode && !discountError && (
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" color="success.main" sx={{ mr: 0.5 }}>
              Discount ({discountCode})
            </Typography>
            <Tooltip title="Discount applied">
              <InfoIcon color="success" fontSize="small" />
            </Tooltip>
          </Box>
          <Typography variant="body1" color="success.main" fontWeight={500}>
            -{formatCurrency(0)} {/* This would be the actual discount amount */}
          </Typography>
        </Box>
      )}
      
      {/* Total */}
      {showTotal && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {formatCurrency(total)}
            </Typography>
          </Box>
          
          {currency.toUpperCase() !== 'USD' && (
            <Typography variant="caption" color="text.secondary" display="block" textAlign="right">
              All prices in {currency.toUpperCase()}
            </Typography>
          )}
        </>
      )}
      
      {/* Agreement Checkbox */}
      {showAgreementCheckbox && onAgreementChange && (
        <Box mt={2} mb={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAgreed}
                onChange={handleAgreementChange}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                {agreementText.split(/(\[^\]]+\])/g).map((part, i) => {
                  if (part.startsWith('[') && part.endsWith(']')) {
                    const text = part.slice(1, -1);
                    return (
                      <Box 
                        key={i} 
                        component="span" 
                        sx={{ 
                          color: 'primary.main', 
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'none' },
                        }}
                        onClick={handleTermsClick}
                      >
                        {text}
                      </Box>
                    );
                  }
                  return part;
                })}
              </Typography>
            }
            sx={{ alignItems: 'flex-start' }}
          />
        </Box>
      )}
      
      {/* Action Button */}
      {actionButton && (
        <Box mt={3}>
          {actionButton}
        </Box>
      )}
      
      {/* Disclaimer */}
      {showDisclaimer && (
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            {disclaimerText.split(/(\[^\]]+\])/g).map((part, i) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                const text = part.slice(1, -1);
                return (
                  <Box 
                    key={i} 
                    component="span" 
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'none' },
                    }}
                    onClick={handleTermsClick}
                  >
                    {text}
                  </Box>
                );
              }
              return part;
            })}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PaymentSummary;
