import { Box, Typography, Stack, Icon } from '@mui/material';
import { FaRegLightbulb, FaUserCheck, FaTruck, FaMoneyBillWave } from 'react-icons/fa';

export default function HowItWorks() {
  return (
    <Box sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h4" fontWeight="bold" mb={5}>
        How Bell24H Works
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" alignItems="center">
        <Box p={3} bgcolor="grey.100" borderRadius={2} maxWidth={260} width="100%">
          <Icon component={FaRegLightbulb} sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography fontWeight="bold">1. Post RFQ</Typography>
          <Typography variant="body2">Submit your request for quotes.</Typography>
        </Box>
        <Box p={3} bgcolor="grey.100" borderRadius={2} maxWidth={260} width="100%">
          <Icon component={FaUserCheck} sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
          <Typography fontWeight="bold">2. Receive Quotes</Typography>
          <Typography variant="body2">Get supplier bids and comparisons.</Typography>
        </Box>
        <Box p={3} bgcolor="grey.100" borderRadius={2} maxWidth={260} width="100%">
          <Icon component={FaTruck} sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
          <Typography fontWeight="bold">3. Select Supplier</Typography>
          <Typography variant="body2">Choose the best match based on ratings and AI insights.</Typography>
        </Box>
        <Box p={3} bgcolor="grey.100" borderRadius={2} maxWidth={260} width="100%">
          <Icon component={FaMoneyBillWave} sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
          <Typography fontWeight="bold">4. Make Payment</Typography>
          <Typography variant="body2">Secure payment via KredX, RazorpayX, or Escrow.</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
