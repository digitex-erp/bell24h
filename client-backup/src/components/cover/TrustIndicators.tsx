import React from 'react';
import { Box, Grid, Typography, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import CategoryIcon from '@mui/icons-material/Category';

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.primary.light + '22',
  '& svg': {
    fontSize: 30,
  },
}));

const stats = [
  {
    icon: <VerifiedUserIcon />,
    value: '10,000+',
    label: 'Verified Suppliers',
  },
  {
    icon: <GroupIcon />,
    value: '50,000+',
    label: 'Active Buyers',
  },
  {
    icon: <ShoppingCartCheckoutIcon />,
    value: '1M+',
    label: 'Monthly Transactions',
  },
  {
    icon: <CategoryIcon />,
    value: '30+',
    label: 'Categories',
  },
];

const TrustIndicators: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ my: 8 }}>
      <Typography
        variant="h5"
        component="h2"
        align="center"
        sx={{
          mb: 6,
          fontWeight: 600,
          color: 'text.primary',
          position: 'relative',
          '&:after': {
            content: '""',
            display: 'block',
            width: 80,
            height: 4,
            backgroundColor: theme.palette.primary.main,
            margin: '16px auto 0',
            borderRadius: 2,
          },
        }}
      >
        Trusted by Businesses Worldwide
      </Typography>
      
      <Grid container spacing={3} justifyContent="center">
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <StatItem>
              <StatIcon>{stat.icon}</StatIcon>
              <Typography
                variant="h4"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1,
                  textAlign: 'center',
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                {stat.label}
              </Typography>
            </StatItem>
          </Grid>
        ))}
      </Grid>
      
      {/* Trust badges */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
          mt: 6,
          pt: 4,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        {['ISO 27001', 'GDPR Compliant', 'PCI DSS', '24/7 Support'].map((badge) => (
          <Box
            key={badge}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              '& svg': {
                color: theme.palette.success.main,
                mr: 1,
              },
            }}
          >
            <VerifiedUserIcon fontSize="small" />
            <Typography variant="body2">{badge}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TrustIndicators;
