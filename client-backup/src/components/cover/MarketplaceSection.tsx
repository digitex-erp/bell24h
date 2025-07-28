import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const marketplaceFeatures = [
  {
    title: 'RFQ Management',
    description: 'Streamline your request for quotation process with our intuitive RFQ management system.',
    icon: '📋',
    path: '/rfq',
  },
  {
    title: 'Supplier Network',
    description: 'Connect with verified suppliers and expand your business network.',
    icon: '🌐',
    path: '/suppliers',
  },
  {
    title: 'Real-time Analytics',
    description: 'Make data-driven decisions with our comprehensive analytics dashboard.',
    icon: '📊',
    path: '/analytics',
  },
];

const MarketplaceSection: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 2,
            color: 'text.primary',
          }}
        >
          B2B Marketplace Features
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="textSecondary"
          paragraph
          sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
        >
          Discover powerful tools designed to streamline your business operations and connect you with
          the right partners.
        </Typography>
        
        <Grid container spacing={4}>
          {marketplaceFeatures.map((feature, index) => (
            <Grid item key={index} xs={12} md={4}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1, p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      fontSize: '2.5rem',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(feature.path)}
                    sx={{ mt: 'auto' }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default MarketplaceSection;
