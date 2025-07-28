'use client';

import { Box, Typography, Container } from '@mui/material';

export default function TestPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, p: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Test Page Working
        </Typography>
        <Typography variant="body1" color="text.secondary">
          If you see this, routing and Material UI are working correctly!
        </Typography>
      </Box>
    </Container>
  );
}
