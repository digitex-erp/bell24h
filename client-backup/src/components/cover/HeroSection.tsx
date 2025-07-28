import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  useTheme, 
  useMediaQuery,
  Paper,
  InputBase,
  IconButton,
  Divider,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'All Categories',
    'Electronics',
    'Textiles',
    'Machinery',
    'Chemicals',
    'Construction',
    'Food & Beverage',
    'Agriculture',
    'Automotive',
    'Pharmaceuticals'
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}${category !== 'All Categories' ? `&category=${encodeURIComponent(category)}` : ''}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            maxWidth: 1000,
            mx: 'auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              mb: 3,
              textShadow: '0 2px 4px rgba(0,0,0,0.15)',
              lineHeight: 1.2,
            }}
          >
            Connect with Global Suppliers & Grow Your Business
          </Typography>
          
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: isMobile ? '100%' : '70%',
              mx: 'auto',
              fontSize: isMobile ? '1rem' : '1.25rem',
              lineHeight: 1.6,
            }}
          >
            Source quality products, get competitive quotes, and manage your B2B transactions all in one place.
            Join thousands of businesses already growing with Bell24H.
          </Typography>

          {/* Enhanced Search Bar */}
          <Paper
            component="div"
            sx={{
              p: '4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 800,
              mx: 'auto',
              mt: 3,
              mb: 4,
              borderRadius: 50,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as string)}
              variant="outlined"
              size="medium"
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  },
                },
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <InputBase
              sx={{ ml: 2, flex: 1, py: 1 }}
              placeholder="Search for products, suppliers, or RFQs..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <IconButton 
              onClick={() => setShowFilters(!showFilters)}
              sx={{ p: '10px', color: 'text.secondary' }}
              aria-label="filters"
            >
              <TuneIcon />
            </IconButton>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              sx={{
                borderRadius: 50,
                px: 4,
                py: 1.5,
                height: '100%',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                },
              }}
              endIcon={<SearchIcon />}
            >
              {isMobile ? 'Search' : 'Search Now'}
            </Button>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 50,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px 0 rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate('/rfq/create')}
            >
              Create RFQ
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                px: 4,
                py: 1.5,
                borderRadius: 50,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>
      
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </Box>
  );
};

export default HeroSection;
