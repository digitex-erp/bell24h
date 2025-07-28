import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function HomePage() {
  return (
    <Box sx={{ p: 4, textAlign: 'center', fontFamily: 'Arial' }}>
      <Typography variant="h3" gutterBottom>
        Bell24H - B2B Marketplace
      </Typography>
      <Typography variant="body1" paragraph>
        AI-Powered Supplier Matching, Escrow System, Real-Time Updates
      </Typography>
      <Button variant="contained" color="primary">
        Submit RFQ
      </Button>
    </Box>
  );
}
