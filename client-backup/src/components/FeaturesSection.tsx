import React from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Bolt as BoltIcon,
  Security as SecurityIcon,
  Search as SearchIcon,
  Handshake as HandshakeIcon,
  Payments as PaymentsIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: <BoltIcon fontSize="large" color="primary" />,
    title: 'AI-Powered Matching',
    description: 'Smart algorithms connect you with the most relevant suppliers for your RFQs.',
  },
  {
    icon: <SecurityIcon fontSize="large" color="primary" />,
    title: 'Secure Transactions',
    description: 'End-to-end encrypted communications and secure payment processing.',
  },
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: 'Advanced Search',
    description: 'Find exactly what you need with our powerful search and filtering options.',
  },
  {
    icon: <HandshakeIcon fontSize="large" color="primary" />,
    title: 'Supplier Network',
    description: 'Access a global network of verified suppliers across multiple industries.',
  },
  {
    icon: <PaymentsIcon fontSize="large" color="primary" />,
    title: 'Flexible Payments',
    description: 'Multiple payment options and secure escrow services for peace of mind.',
  },
  {
    icon: <AnalyticsIcon fontSize="large" color="primary" />,
    title: 'Real-time Analytics',
    description: 'Track your RFQs, orders, and supplier performance with detailed analytics.',
  },
];

const FeaturesSection = () => {
  const theme = useTheme();

  return (
    <Container>
      <Box textAlign="center" mb={8}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Why Choose Bell24H?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
          Our platform is designed to streamline your procurement process and connect you with the best suppliers
          worldwide.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              whileHover={{ y: -5, boxShadow: theme.shadows[6] }}
              transition={{ duration: 0.3 }}
              style={{
                height: '100%',
                padding: theme.spacing(4),
                borderRadius: theme.shape.borderRadius,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[2],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <Box mb={2} sx={{ color: theme.palette.primary.main }}>
                {feature.icon}
              </Box>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {feature.description}
              </Typography>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FeaturesSection;
