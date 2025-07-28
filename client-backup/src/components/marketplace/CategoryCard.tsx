import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActionArea,
  Box,
  Chip
} from '@mui/material';
import { Category, Subcategory } from '../../types/marketplace.js';

interface CategoryCardProps {
  category: Category;
}

/**
 * Displays a single marketplace category as a card
 */
const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/marketplace/${category.id}`);
  };

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardActionArea 
        onClick={handleClick}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        <CardContent sx={{ width: '100%' }}>
          <Box sx={{ fontSize: '2rem', mb: 1 }}>
            {category.icon}
          </Box>
          <Typography gutterBottom variant="h6" component="div">
            {category.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {category.description}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {category.subcategories.slice(0, 3).map((subcategory: Subcategory) => (
              <Chip 
                key={subcategory.id} 
                label={subcategory.name} 
                size="small" 
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {category.subcategories.length > 3 && (
              <Chip 
                label={`+${category.subcategories.length - 3} more`} 
                size="small" 
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryCard;
