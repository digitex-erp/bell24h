import React from 'react';
import { Box, Container, Typography, Button, Grid, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  RocketLaunch as RocketIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

const StyledCTACard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(6, 4),
  color: theme.palette.primary.contrastText,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    zIndex: 1,
  },
}));

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Box sx={{ textAlign: 'center', px: 2, mb: { xs: 4, md: 0 } }}>
    <Box
      sx={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        color: 'white',
        fontSize: '2rem',
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
      {title}
    </Typography>
    <Typography variant="body1" sx={{ opacity: 0.9, color: 'rgba(255, 255, 255, 0.9)' }}>
      {description}
    </Typography>
  </Box>
);

const CTASection = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ position: 'relative', py: 8, mt: 8 }}>
      {/* Decorative elements */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          clipPath: 'polygon(0 15%, 100% 0, 100% 85%, 0% 100%)',
          zIndex: 0,
        }}
      />
      
      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <StyledCTACard>
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800, color: 'white', mb: 3 }}>
                  Ready to Transform Your Procurement Process?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, color: 'rgba(255, 255, 255, 0.9)' }}>
                  Join thousands of businesses that trust Bell24H for their sourcing needs. Get started in minutes and experience the future of procurement.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4 }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/signup')}
                      sx={{
                        bgcolor: 'white',
                        color: theme.palette.primary.main,
                        px: 4,
                        py: 1.5,
                        fontWeight: 700,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    >
                      Get Started Free
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/contact')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Contact Sales
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ textAlign: 'center' }}
              >
                <Box
                  component="img"
                  src="/images/cta-illustration.svg"
                  alt="Get started with Bell24H"
                  sx={{
                    maxWidth: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </StyledCTACard>
        
        <Grid container spacing={4} sx={{ mt: 4, textAlign: 'center' }}>
          <Grid item xs={12} md={4}>
            <FeatureItem
              icon={<RocketIcon fontSize="large" />}
              title="Quick Setup"
              description="Get started in minutes with our easy onboarding process."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureItem
              icon={<TrendingUpIcon fontSize="large" />}
              title="Grow Your Business"
              description="Access a global network of verified suppliers and buyers."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureItem
              icon={<GroupIcon fontSize="large" />}
              title="24/7 Support"
              description="Our dedicated team is here to help you every step of the way."
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CTASection;
