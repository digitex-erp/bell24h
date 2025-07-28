import React from 'react';
import { Box, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const FeatureCard = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.contrastText,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '& svg': {
    fontSize: 32,
  },
}));

const features = [
  {
    icon: <SearchIcon />,
    title: 'Advanced Search',
    description: 'Find exactly what you need with our powerful search and filtering tools across thousands of suppliers and products.',
  },
  {
    icon: <SecurityIcon />,
    title: 'Secure Transactions',
    description: 'Trade with confidence using our secure payment system and escrow protection for all transactions.',
  },
  {
    icon: <HandshakeIcon />,
    title: 'Verified Suppliers',
    description: 'Connect with pre-vetted suppliers who meet our strict quality and reliability standards.',
  },
  {
    icon: <SupportAgentIcon />,
    title: 'Dedicated Support',
    description: 'Get 24/7 assistance from our dedicated support team for all your business needs.',
  },
];

const FeaturesSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ my: 12 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 8 }}>
        <Typography
          variant="overline"
          color="primary"
          sx={{
            display: 'inline-block',
            mb: 2,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          WHY CHOOSE US
        </Typography>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          component="h2"
          sx={{
            mb: 3,
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          Everything You Need for B2B Success
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: isMobile ? '1rem' : '1.1rem',
            lineHeight: 1.7,
          }}
        >
          Our platform is designed to simplify global trade with powerful tools and features that help you grow your business.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <FeatureCard>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  lineHeight: 1.7,
                }}
              >
                {feature.description}
              </Typography>
            </FeatureCard>
          </Grid>
        ))}
      </Grid>

      {/* Call to action */}
      <Box
        sx={{
          mt: 10,
          p: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          component="h3"
          sx={{
            mb: 2,
            fontWeight: 600,
          }}
        >
          Ready to transform your B2B experience?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            maxWidth: 600,
            mx: 'auto',
            opacity: 0.9,
          }}
        >
          Join thousands of businesses already growing with our platform.
        </Typography>
        <Box>
          <button
            style={{
              background: 'white',
              color: theme.palette.primary.main,
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              },
            }}
          >
            Get Started for Free
          </button>
        </Box>
      </Box>
    </Box>
  );
};

export default FeaturesSection;
