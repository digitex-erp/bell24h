import React from 'react';
import { Container, Typography, Box, Paper, InputBase, IconButton, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CategoryGrid from '../../components/marketplace/CategoryGrid.js';
import { getAllCategories } from '../../data/marketplaceCategories.js';

/**
 * Main marketplace page showing all categories
 */
const MarketplacePage: React.FC = () => {
  const categories = getAllCategories();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Bell24H Marketplace
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Connect with thousands of verified suppliers across 30 industry categories
      </Typography>
      
      {/* Search */}
      <Paper
        component="form"
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', mb: 6 }}
        elevation={2}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search products, suppliers, or categories..."
          inputProps={{ 'aria-label': 'search marketplace' }}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>
      
      {/* Featured Categories */}
      <Box sx={{ mb: 6 }}>
        <CategoryGrid 
          categories={categories} 
          title="All Categories"
        />
      </Box>
    </Container>
  );
};

export default MarketplacePage;
