"use client";

import { useEffect } from 'react';
import { Button, Typography, Card, Box, CardContent } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: '#f5f5f5',
      p: 3
    }}>
      <Card 
        sx={{ 
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <WarningIcon sx={{ fontSize: '48px', color: '#ff4d4f' }} />
          <Typography variant="h4" component="h2">
            Something went wrong!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error.message || 'An unexpected error occurred'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => reset()}
            size="large"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
