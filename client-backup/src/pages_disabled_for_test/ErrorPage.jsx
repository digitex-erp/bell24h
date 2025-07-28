import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function ErrorPage() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" color="error" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography>The page you're looking for doesn't exist.</Typography>
      <Button component="a" href="/" variant="outlined" sx={{ mt: 2 }}>
        Go Home
      </Button>
    </Box>
  );
}
