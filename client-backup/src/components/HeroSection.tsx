import React from 'react';
import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import SearchBar from './SearchBar.js';

const HeroSection: React.FC = () => {
  const theme = useTheme();

  const handleSearch = (query: string, category?: string) => {
    console.log('Searching:', { query, category });
    // TODO: Implement search functionality
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white',
        py: 12,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 20%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              lineHeight: 1.1,
              maxWidth: '900px',
            }}
          >
            Find the Best Suppliers for Your RFQ
          </Typography>
          
          <Typography
            variant="h5"
            component="h2"
            sx={{
              mb: 5,
              maxWidth: '700px',
              opacity: 0.9,
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
            }}
          >
            AI-Powered Matching, Real-Time Updates, and Secure Payments
          </Typography>

          <Box sx={{ width: '100%', maxWidth: '800px', mb: 5 }}>
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search by product, supplier, or RFQ ID..."
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
              href="/rfq/new"
            >
              Create Your RFQ
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'white',
                },
              }}
              href="/suppliers"
            >
              Browse Suppliers
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
