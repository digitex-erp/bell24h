import React from 'react';
import { Box, Typography } from '@mui/material';

export default function DashboardPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">User Dashboard</Typography>
      <Typography>Your analytics, transaction history, and profile settings will appear here.</Typography>
    </Box>
  );
}
