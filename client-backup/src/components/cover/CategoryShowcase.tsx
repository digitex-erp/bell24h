import React, { useState } from 'react';
import { Box, Typography, Button, Grid, useTheme, useMediaQuery, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { categories } from '../../../data/categories';

const CategoryCard = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
}));

const CategoryIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.light + '20',
  color: theme.palette.primary.main,
  '& svg': {
    fontSize: 30,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiTabs-indicator': {
    height: 4,
    borderRadius: '2px 2px 0 0',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9375rem',
    minWidth: 'auto',
    padding: theme.spacing(1, 2),
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
}));

// Group categories by their parent category
const groupedCategories = categories.reduce((acc, category) => {
  const group = category.parent || 'Other';
  if (!acc[group]) {
    acc[group] = [];
  }
  acc[group].push(category);
  return acc;
}, {} as Record<string, any[]>);

const CategoryShowcase: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const categoryGroups = Object.entries(groupedCategories);
  const currentGroup = categoryGroups[activeTab]?.[1] || [];
  const displayedCategories = showAll ? currentGroup : currentGroup.slice(0, 8);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setShowAll(false);
  };

  return (
    <Box sx={{ my: 12 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 6 }}>
        <Typography
          variant="overline"
          color="primary"
          sx={{
            display: 'inline-block',
            mb: 2,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          EXPLORE CATEGORIES
        </Typography>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          component="h2"
          sx={{
            mb: 3,
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          Browse by Category
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: isMobile ? '1rem' : '1.1rem',
            lineHeight: 1.7,
          }}
        >
          Discover products and services across our extensive range of categories
        </Typography>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ overflowX: 'auto', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <StyledTabs
            value={activeTab}
            onChange={handleChangeTab}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="category tabs"
          >
            {categoryGroups.map(([groupName], index) => (
              <Tab key={groupName} label={groupName} />
            ))}
          </StyledTabs>
        </Box>
      </Box>

      {/* Category Grid */}
      <Grid container spacing={3}>
        {displayedCategories.map((category) => (
          <Grid item xs={6} sm={4} md={3} key={category.id}>
            <CategoryCard>
              <CategoryIcon>
                {category.icon || <span>📦</span>}
              </CategoryIcon>
              <Typography
                variant="subtitle1"
                component="h3"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                {category.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  fontSize: '0.875rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {category.description}
              </Typography>
              <Box sx={{ mt: 'auto', pt: 1 }}>
                <Button
                  size="small"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    p: 0,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Explore {category.name}
                </Button>
              </Box>
            </CategoryCard>
          </Grid>
        ))}
      </Grid>

      {currentGroup.length > 8 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowAll(!showAll)}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {showAll ? 'Show Less' : `View All ${currentGroup.length} Categories`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CategoryShowcase;
