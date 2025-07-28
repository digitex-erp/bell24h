import React, { useState } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CardActionArea,
  Box,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { categories } from '../../config/categories';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleSubcategoryClick = (categoryId: string, subcategory: string) => {
    navigate(`/rfq/category/${categoryId}/subcategory/${subcategory.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <Grid container spacing={3}>
      {categories.map((category) => (
        <Grid item xs={12} sm={6} md={4} key={category.id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}
          >
            <CardActionArea 
              onClick={() => handleCategoryClick(category.id)}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 2 
                  }}
                >
                  <Typography variant="h5" component="h2">
                    {category.name}
                  </Typography>
                  {expandedCategory === category.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {category.description}
                </Typography>

                <Collapse in={expandedCategory === category.id}>
                  <List dense>
                    {category.subcategories.map((subcategory) => (
                      <ListItem 
                        key={subcategory}
                        button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubcategoryClick(category.id, subcategory);
                        }}
                      >
                        <ListItemText primary={subcategory} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>

                <Box 
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2
                  }}
                >
                  <Chip 
                    label={`${category.subcategories.length} subcategories`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography 
                    variant="body2" 
                    color="primary"
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    View {category.mockupRFQs.length} sample RFQs
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CategoryList; 