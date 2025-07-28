import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Chip,
  Box,
  CircularProgress,
  Container
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { RFQ } from '../../types/rfq';
import { rfqService } from '../../services/rfq/RFQService';
import { categories, getCategoryById } from '../../config/categories';
import SubcategoryFilter from './SubcategoryFilter';

const CategoryRFQs: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const category = categoryId ? getCategoryById(categoryId) : null;

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        setLoading(true);
        const mockupRFQs = await rfqService.getMockupRFQs(categoryId);
        setRfqs(mockupRFQs as RFQ[]);
        setError(null);
      } catch (err) {
        setError('Failed to load RFQs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRFQs();
  }, [categoryId]);

  const filteredRFQs = selectedSubcategory
    ? rfqs.filter(rfq => rfq.subcategory === selectedSubcategory)
    : rfqs;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!category) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Category not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {category.name}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/rfq/create')}
        >
          Create New RFQ
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" mb={4}>
        {category.description}
      </Typography>

      <SubcategoryFilter
        categoryId={categoryId!}
        selectedSubcategory={selectedSubcategory}
        onSubcategoryChange={setSelectedSubcategory}
      />

      <Grid container spacing={3}>
        {filteredRFQs.map((rfq) => (
          <Grid item xs={12} key={rfq.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2">
                    {rfq.title}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip 
                      label={rfq.status} 
                      color={rfq.status === 'open' ? 'success' : 'default'}
                      size="small"
                    />
                    {rfq.subcategory && (
                      <Chip 
                        label={rfq.subcategory}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {rfq.description}
                </Typography>

                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Quantity:</strong> {rfq.quantity} {rfq.unit}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Timeline:</strong> {rfq.timeline}
                    </Typography>
                  </Grid>
                  {rfq.budget && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Budget:</strong> {rfq.budget.currency} {rfq.budget.min.toLocaleString()} - {rfq.budget.max.toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Location:</strong> {rfq.location.city ? `${rfq.location.city}, ` : ''}{rfq.location.country}
                    </Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Specifications:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {rfq.specifications.map((spec, index) => (
                      <Chip 
                        key={index} 
                        label={spec} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate(`/rfq/${rfq.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {filteredRFQs.length === 0 && (
          <Grid item xs={12}>
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              minHeight="200px"
              bgcolor="background.paper"
              borderRadius={1}
            >
              <Typography color="text.secondary">
                No RFQs found for the selected criteria
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default CategoryRFQs; 