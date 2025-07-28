import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  const handleChange = (event: SelectChangeEvent) => {
    setCurrency(event.target.value);
  };

  return (
    <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
      <InputLabel id="currency-selector-label">Currency</InputLabel>
      <Select
        labelId="currency-selector-label"
        id="currency-selector"
        value={currency}
        onChange={handleChange}
        label="Currency"
      >
        {availableCurrencies.map((curr) => (
          <MenuItem key={curr.code} value={curr.code}>
            {`${curr.code} (${curr.symbol})`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CurrencySelector;
