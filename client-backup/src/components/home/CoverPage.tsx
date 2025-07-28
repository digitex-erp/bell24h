import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import SearchBar from '../search/SearchBar';
import { categories } from '../../config/categories';

const CoverPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
        color: 'white',
        pt: 8,
        pb: 6
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              B2B Marketplace for Global Trade
            </Typography>
            
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Connect with verified suppliers and buyers across 50+ categories
            </Typography>

            <SearchBar />

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                href="/rfq/create"
              >
                Post an RFQ
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                href="/register"
              >
                Register Now
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                Popular Categories
              </Typography>
              
              <Grid container spacing={2}>
                {categories.slice(0, 6).map((category) => (
                  <Grid item xs={6} key={category.id}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          bgcolor: 'primary.light',
                          color: 'white'
                        }
                      }}
                      onClick={() => window.location.href = `/rfq/category/${category.id}`}
                    >
                      <Typography variant="subtitle1">
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.subcategories.length} subcategories
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Why Choose Bell24H?
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Verified Suppliers
                </Typography>
                <Typography>
                  All suppliers are thoroughly verified to ensure quality and reliability
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  AI-Powered Matching
                </Typography>
                <Typography>
                  Our AI algorithms match you with the most relevant suppliers
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Global Reach
                </Typography>
                <Typography>
                  Connect with suppliers and buyers from around the world
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default CoverPage; 