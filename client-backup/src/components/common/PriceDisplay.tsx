import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Typography, Tooltip, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface PriceDisplayProps {
  amount: number;
  originalCurrency: string;
  showOriginal?: boolean;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
  fontWeight?: number | string;
  color?: string;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  originalCurrency,
  showOriginal = true,
  variant = 'body1',
  fontWeight = 'normal',
  color = 'inherit',
  className = '',
}) => {
  const { currency, formatCurrency, convertCurrency, getExchangeRate } = useCurrency();
  
  // If no amount is provided, show a dash
  if (amount === null || amount === undefined) {
    return <Typography variant={variant} fontWeight={fontWeight} color={color} className={className}>-</Typography>;
  }

  const convertedAmount = convertCurrency(amount, originalCurrency);
  const exchangeRate = getExchangeRate(originalCurrency);
  const isDifferentCurrency = originalCurrency !== currency;

  return (
    <Box display="flex" alignItems="center" className={className}>
      <Typography variant={variant} fontWeight={fontWeight} color={color}>
        {formatCurrency(convertedAmount)}
      </Typography>
      
      {showOriginal && isDifferentCurrency && (
        <Tooltip 
          title={
            <>
              <div>{`${formatCurrency(amount, originalCurrency)} (${originalCurrency})`}</div>
              <div>{`1 ${originalCurrency} = ${exchangeRate.toFixed(4)} ${currency}`}</div>
            </>
          }
          arrow
          placement="top"
        >
          <Box display="inline-flex" ml={1} sx={{ cursor: 'pointer' }}>
            <InfoOutlinedIcon fontSize="small" color="action" />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default PriceDisplay;
