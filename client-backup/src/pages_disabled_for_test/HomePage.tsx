import React from 'react';
import { Container, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import HeroSection from '../components/cover/HeroSection';
import FeaturesSection from '../components/cover/FeaturesSection';
import CategoryShowcase from '../components/cover/CategoryShowcase';
import TestimonialsSection from '../components/cover/TestimonialsSection';
import TrustIndicators from '../components/cover/TrustIndicators';
import MarketplaceSection from '../components/cover/MarketplaceSection';
import CallToAction from '../components/cover/CallToAction';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}));

const HomePage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <HeroSection />
      <StyledContainer maxWidth="lg">
        <TrustIndicators />
        <FeaturesSection />
      </StyledContainer>
      <MarketplaceSection />
      <StyledContainer maxWidth="lg">
        <CategoryShowcase />
        <TestimonialsSection />
      </StyledContainer>
      <CallToAction />
    </Box>
  );
};

export default HomePage;
