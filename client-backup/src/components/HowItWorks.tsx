import React from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Create as CreateIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Handshake as HandshakeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const steps = [
  {
    icon: <CreateIcon fontSize="large" color="primary" />,
    title: 'Create Your RFQ',
    description: 'Fill in your requirements and submit a detailed RFQ.',
    delay: 0.2,
  },
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: 'Get Matched',
    description: 'Our AI matches you with the most suitable suppliers.',
    delay: 0.4,
  },
  {
    icon: <NotificationsIcon fontSize="large" color="primary" />,
    title: 'Receive Quotes',
    description: 'Get competitive quotes from verified suppliers.',
    delay: 0.6,
  },
  {
    icon: <HandshakeIcon fontSize="large" color="primary" />,
    title: 'Negotiate & Finalize',
    description: 'Communicate directly and finalize the deal.',
    delay: 0.8,
  },
  {
    icon: <CheckCircleIcon fontSize="large" color="primary" />,
    title: 'Complete Order',
    description: 'Track and complete your order with confidence.',
    delay: 1,
  },
];

const HowItWorks = () => {
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
            color: theme.palette.getContrastText(theme.palette.background.paper),
            mb: 2,
          }}
        >
          How It Works
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ maxWidth: '700px', mx: 'auto', color: theme.palette.getContrastText(theme.palette.background.paper) }}
        >
          Get started in just a few simple steps and experience seamless procurement.
        </Typography>
      </Box>

      <Box position="relative" sx={{ py: 4 }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            height: '100%',
            width: '4px',
            background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            zIndex: 1,
            [theme.breakpoints.down('md')]: {
              left: '40px',
              transform: 'none',
            },
          }}
        />
        <Grid container spacing={4} sx={{ position: 'relative', zIndex: 2 }}>
          {steps.map((step, index) => (
            <Grid item xs={12} key={index}>
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: step.delay }}
                style={{
                  display: 'flex',
                  flexDirection: window.innerWidth < 900 ? 'row' : index % 2 === 0 ? 'row' : 'row-reverse',
                  alignItems: 'center',
                  gap: theme.spacing(4),
                }}
              >
                <Box
                  sx={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.background.paper,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.shadows[4],
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    textAlign: window.innerWidth < 900 ? 'left' : index % 2 === 0 ? 'left' : 'right',
                  }}
                >
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HowItWorks;
