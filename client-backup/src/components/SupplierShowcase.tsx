import React from 'react';
import { Box, Container, Grid, Typography, Button, Card, CardContent, Avatar, Rating, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

// Mock data for featured suppliers
const featuredSuppliers = [
  {
    id: 'SUP-001',
    name: 'EcoTextiles Ltd.',
    logo: '/suppliers/eco-textiles.png',
    rating: 4.8,
    reviews: 124,
    location: 'India',
    categories: ['Organic Cotton', 'Sustainable Fabrics', 'Eco-Friendly Textiles'],
    verified: true,
    description: 'Leading manufacturer of sustainable and organic textiles with 15+ years of experience.',
  },
  {
    id: 'SUP-002',
    name: 'Precision Metals Inc.',
    logo: '/suppliers/precision-metals.png',
    rating: 4.9,
    reviews: 89,
    location: 'Germany',
    categories: ['Metal Fabrication', 'CNC Machining', 'Industrial Components'],
    verified: true,
    description: 'High-precision metal fabrication services for industrial applications.',
  },
  {
    id: 'SUP-003',
    name: 'GreenPack Solutions',
    logo: '/suppliers/greenpack.png',
    rating: 4.7,
    reviews: 67,
    location: 'Canada',
    categories: ['Eco Packaging', 'Biodegradable Materials', 'Custom Packaging'],
    verified: true,
    description: 'Innovative and sustainable packaging solutions for eco-conscious brands.',
  },
];

const SupplierShowcase = () => {
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
            color: theme.palette.getContrastText(theme.palette.background.paper),
            mb: 2,
          }}
        >
          Featured Suppliers
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            maxWidth: '700px', 
            mx: 'auto', 
            color: theme.palette.getContrastText(theme.palette.background.paper, 0.7),
          }}
        >
          Connect with verified suppliers who meet the highest quality and reliability standards.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {featuredSuppliers.map((supplier) => (
          <Grid item xs={12} md={4} key={supplier.id}>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: theme.shadows[2],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Box 
                  sx={{
                    height: '120px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '-40px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      border: '4px solid white',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Avatar 
                      src={supplier.logo} 
                      alt={supplier.name}
                      sx={{ 
                        width: '90%', 
                        height: '90%',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                </Box>
                
                <CardContent sx={{ mt: 6, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {supplier.name}
                        {supplier.verified && (
                          <CheckCircleIcon color="primary" fontSize="small" />
                        )}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                      <Rating 
                        value={supplier.rating} 
                        precision={0.1} 
                        readOnly 
                        size="small"
                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {supplier.rating} ({supplier.reviews} reviews)
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" justifyContent="center" color="text.secondary" mb={2}>
                      <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{supplier.location}</Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2, minHeight: '60px' }}>
                      {supplier.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 2 }}>
                      {supplier.categories.map((category, index) => (
                        <Chip 
                          key={index} 
                          label={category} 
                          size="small" 
                          variant="outlined"
                          icon={<CategoryIcon fontSize="small" />}
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => navigate(`/suppliers/${supplier.id}`)}
                    sx={{ mt: 'auto' }}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      
      <Box textAlign="center" mt={6}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/suppliers')}
          endIcon={<BusinessIcon />}
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
          Explore All Suppliers
        </Button>
      </Box>
    </Container>
  );
};

export default SupplierShowcase;
