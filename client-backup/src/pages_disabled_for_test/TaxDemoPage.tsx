import React, { useState } from 'react';
import { Container, Typography, TextField, Box, Paper, Divider } from '@mui/material';
import TaxCalculator from '../components/tax/TaxCalculator.js';

const TaxDemoPage: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [calculationResult, setCalculationResult] = useState<any>(null);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    setAmount(value);
  };

  const handleTaxCalculated = (result: any) => {
    setCalculationResult(result);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tax Calculator Demo
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Enter Amount
        </Typography>
        <TextField
          fullWidth
          type="number"
          label="Amount"
          variant="outlined"
          value={amount}
          onChange={handleAmountChange}
          InputProps={{
            startAdornment: '₹',
            inputProps: { min: 0, step: 0.01 }
          }}
          sx={{ maxWidth: 300 }}
        />
      </Paper>

      
      <TaxCalculator 
        amount={amount} 
        onTaxCalculated={handleTaxCalculated} 
      />
      
      {calculationResult && (
        <Paper elevation={2} sx={{ p: 3, mt: 4, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>
            Raw Calculation Result
          </Typography>
          <Box component="pre" sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            overflowX: 'auto',
            fontSize: '0.8rem'
          }}>
            {JSON.stringify(calculationResult, null, 2)}
          </Box>
        </Paper>
      )}
      
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Integration Guide
        </Typography>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Basic Usage:
          </Typography>
          <Box component="pre" sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            overflowX: 'auto',
            fontSize: '0.8rem',
            mb: 3
          }}>
{`import TaxCalculator from './components/tax/TaxCalculator';

function CheckoutPage() {
  const [amount, setAmount] = useState(1000);
  
  const handleTaxCalculated = (result) => {
    // Use the tax calculation result
    console.log('Tax calculated:', result);
  };
  
  return (
    <div>
      <h2>Checkout</h2>
      <TaxCalculator 
        amount={amount} 
        onTaxCalculated={handleTaxCalculated}
      />
    </div>
  );
}`}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Props:
          </Typography>
          <ul>
            <li><strong>amount</strong> (number, required): The subtotal amount to calculate tax for</li>
            <li><strong>onTaxCalculated</strong> (function): Callback when tax is calculated</li>
            <li><strong>defaultOrigin</strong> (string): Default origin region code (e.g., 'IN-MH')</li>
            <li><strong>defaultDestination</strong> (string): Default destination region code</li>
            <li><strong>showBusinessToggle</strong> (boolean): Show/hide business transaction toggle</li>
            <li><strong>showTaxIdField</strong> (boolean): Show/hide tax ID field</li>
          </ul>
        </Paper>
      </Box>
    </Container>
  );
};

export default TaxDemoPage;
