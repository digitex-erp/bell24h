import React from 'react';
import { Button, Typography, Box, Container } from '@mui/material';

export default function TestMUI() {
  return (
    <Container maxWidth="md">
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Material-UI is Working! 🎉
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Welcome to Bell24H Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" color="primary">
            Primary Action
          </Button>
          <Button variant="outlined" color="inherit">
            Secondary Action
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
