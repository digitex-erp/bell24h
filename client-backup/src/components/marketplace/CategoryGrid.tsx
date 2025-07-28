import React from 'react';
import { Grid, Typography, Box, Container } from '@mui/material';
import CategoryCard from './CategoryCard.js';
import { Category } from '../../types/marketplace.js';

interface CategoryGridProps {
  categories: Category[];
  title?: string;
}

/**
 * Displays a grid of marketplace categories
 */
const CategoryGrid: React.FC<CategoryGridProps> = ({ 
  categories, 
  title = "Browse Categories" 
}) => {
  return (
    <Container maxWidth="lg">
      {title && (
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography variant="h4" component="h2">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore our {categories.length} marketplace categories
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
            <CategoryCard category={category} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CategoryGrid;
