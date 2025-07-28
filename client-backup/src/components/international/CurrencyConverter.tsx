import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CurrencyService } from '../../services/international/currencyService.js';
import type { SelectChangeEvent } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid } from '@mui/material';

interface CurrencyConverterProps {
  className?: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const currencyService = new CurrencyService();
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    if (!amount) return;

    try {
      setIsLoading(true);
      const converted = await currencyService.convertCurrency(
        parseFloat(amount),
        fromCurrency,
        toCurrency
      );
      setConvertedAmount(converted.toFixed(2));
    } catch (error) {
      console.error('Error converting currency:', error);
      setConvertedAmount('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Grid container spacing={2} className={className}>
      <Grid item xs={12}>
        <h3>{t('common.currency')} Converter</h3>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>{t('common.from')}</InputLabel>
          <Select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value as string)}
            label={t('common.from')}
          >
            {currencyService.getSupportedCurrencies().map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currencyService.getCurrencySymbol(currency)} {currency}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>{t('common.to')}</InputLabel>
          <Select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value as string)}
            label={t('common.to')}
          >
            {currencyService.getSupportedCurrencies().map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currencyService.getCurrencySymbol(currency)} {currency}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label={t('common.amount')}
          value={amount}
          onChange={handleAmountChange}
          type="number"
          InputProps={{
            startAdornment: fromCurrency && currencyService.getCurrencySymbol(fromCurrency)
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConvert}
          disabled={isLoading || !amount}
        >
          {isLoading ? t('common.converting') : t('common.convert')}
        </Button>
      </Grid>

      {convertedAmount && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('common.convertedAmount')}
            value={convertedAmount}
            disabled
            InputProps={{
              startAdornment: toCurrency && currencyService.getCurrencySymbol(toCurrency)
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default CurrencyConverter;
