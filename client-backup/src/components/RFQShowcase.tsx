import React from 'react';
import { Box, Container, Grid, Typography, Button, Card, CardContent, Chip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Business as BusinessIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

// Mock data for featured RFQs
const featuredRFQs = [
  {
    id: 'RFQ-2023-001',
    title: 'Bulk Order of Organic Cotton T-Shirts',
    company: 'EcoWear Inc.',
    category: 'Apparel & Fashion',
    budget: '$5,000 - $10,000',
    location: 'India',
    posted: '2 days ago',
    status: 'Open',
    description: 'Looking for a supplier of 100% organic cotton t-shirts, various sizes and colors needed.',
  },
  {
    id: 'RFQ-2023-002',
    title: 'Custom Metal Fabrication Services',
    company: 'MetalWorks Ltd.',
    category: 'Manufacturing',
    budget: '$15,000+',
    location: 'Germany',
    posted: '1 week ago',
    status: 'Open',
    description: 'Need custom metal fabrication for industrial equipment components.',
  },
  {
    id: 'RFQ-2023-003',
    title: 'Eco-Friendly Packaging Solutions',
    company: 'GreenPack Solutions',
    category: 'Packaging',
    budget: '$3,000 - $7,000',
    location: 'Canada',
    posted: '3 days ago',
    status: 'Open',
    description: 'Seeking sustainable packaging solutions for our new product line.',
  },
];

const RFQShowcase = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Container>
      <Box textAlign="center" mb={6}>
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
          Featured RFQs
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
          Browse through our latest requests for quotations from buyers around the world.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {featuredRFQs.map((rfq, index) => (
          <Grid item xs={12} md={4} key={rfq.id}>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Chip 
                      label={rfq.status} 
                      color={rfq.status === 'Open' ? 'success' : 'default'} 
                      size="small" 
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {rfq.posted}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, minHeight: '64px' }}>
                    {rfq.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2, minHeight: '60px' }}>
                    {rfq.description}
                  </Typography>
                  
                  <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                    <Box display="flex" alignItems="center" color="text.secondary">
                      <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">{rfq.company}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" color="text.secondary">
                      <CategoryIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">{rfq.category}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" color="text.secondary">
                      <MoneyIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">{rfq.budget}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" color="text.secondary">
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">{rfq.location}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={() => navigate(`/rfqs/${rfq.id}`)}
                    sx={{ mt: 1 }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      
      <Box textAlign="center" mt={6}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/rfqs')}
          sx={{
            px: 4,
            py: 1.5,
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 12px 0 ${theme.palette.primary.main}33`,
            },
          }}
        >
          View All RFQs
        </Button>
      </Box>
    </Container>
  );
};

export default RFQShowcase;
