import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  Divider, 
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { useSearch } from '../../contexts/SearchContext';
import { EnhancedSearchBar } from '../../components/search';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `search-tab-${index}`,
    'aria-controls': `search-tabpanel-${index}`,
  };
}

const SearchPage: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  const { 
    results, 
    loading, 
    error, 
    search, 
    totalResults, 
    hasMore, 
    loadMore 
  } = useSearch();

  // Get search query from URL on initial load
  useEffect(() => {
    if (router.isReady) {
      const { q, category } = router.query;
      
      if (q) {
        const query = Array.isArray(q) ? q[0] : q;
        setSearchQuery(query);
        
        // Set filters from URL
        const newFilters: Record<string, any> = {};
        if (category) {
          newFilters.categories = [
            ...(Array.isArray(category) ? category : [category])
          ];
        }
        
        setFilters(newFilters);
        
        // Perform search if not already done by context
        if (results.length === 0 || results[0]?.query !== query) {
          search(query, newFilters);
        }
      }
    }
  }, [router.isReady, router.query, search, results]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = (query: string, newFilters?: Record<string, any>) => {
    const updatedFilters = newFilters || filters;
    
    // Update URL with new search query and filters
    const queryParams = new URLSearchParams();
    queryParams.set('q', query);
    
    if (updatedFilters.categories?.length) {
      updatedFilters.categories.forEach((cat: string) => {
        queryParams.append('category', cat);
      });
    }
    
    router.push(
      { pathname: '/search', search: queryParams.toString() },
      undefined,
      { shallow: true }
    );
    
    // Update local state
    setSearchQuery(query);
    setFilters(updatedFilters);
    
    // Perform search
    search(query, updatedFilters);
  };

  const handleFilterChange = (filterName: string, value: any) => {
    const newFilters = { ...filters, [filterName]: value };
    handleSearch(searchQuery, newFilters);
  };

  const renderResults = () => {
    if (loading && results.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box textAlign="center" py={4}>
          <Typography color="error">
            Error loading results. Please try again.
          </Typography>
        </Box>
      );
    }

    if (results.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No results found for "{searchQuery}"
          </Typography>
          <Typography color="text.secondary">
            Try different keywords or remove search filters
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary">
            {totalResults} results found for "{searchQuery}"
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {results.map((result, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'box-shadow 0.3s',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {result.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {result.description?.substring(0, 150)}...
                </Typography>
                {result.category && (
                  <Chip 
                    label={result.category} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      fontWeight: 500,
                    }} 
                  />
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        {hasMore && (
          <Box mt={4} textAlign="center">
            <Button 
              variant="outlined" 
              onClick={loadMore}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box mb={4}>
        <EnhancedSearchBar 
          initialQuery={searchQuery}
          onSearch={handleSearch}
          fullWidth
          autoFocus={!searchQuery}
          sx={{ maxWidth: 800, mx: 'auto' }}
        />
      </Box>
      
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
        {/* Filters Sidebar - Collapsible on mobile */}
        {!isMobile && (
          <Box width={{ xs: '100%', md: 250 }} flexShrink={0} mr={3}>
            <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <FilterListIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Filters</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {/* Category Filter */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>Categories</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {['All', 'Electronics', 'Textiles', 'Machinery', 'Chemicals'].map((cat) => (
                    <Chip 
                      key={cat}
                      label={cat} 
                      size="small"
                      onClick={() => handleFilterChange('category', cat === 'All' ? [] : [cat])}
                      variant={filters.categories?.includes(cat) ? 'filled' : 'outlined'}
                      color={filters.categories?.includes(cat) ? 'primary' : 'default'}
                      sx={{ mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
              
              {/* Price Range Filter */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>Price Range</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {['$', '$$', '$$$', '$$$$'].map((price, i) => (
                    <Chip 
                      key={price}
                      label={price} 
                      size="small"
                      onClick={() => handleFilterChange('priceRange', i + 1)}
                      variant={filters.priceRange === i + 1 ? 'filled' : 'outlined'}
                      color={filters.priceRange === i + 1 ? 'primary' : 'default'}
                      sx={{ mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
              
              {/* Rating Filter */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Minimum Rating</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {[4, 3, 2, 1].map((rating) => (
                    <Chip 
                      key={rating}
                      label={`${rating}+`} 
                      size="small"
                      onClick={() => handleFilterChange('minRating', rating)}
                      variant={filters.minRating === rating ? 'filled' : 'outlined'}
                      color={filters.minRating === rating ? 'primary' : 'default'}
                      sx={{ mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
        
        {/* Main Content */}
        <Box flexGrow={1}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="search result tabs"
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '& .MuiTabs-indicator': {
                  height: 3,
                },
              }}
            >
              <Tab label="All Results" {...a11yProps(0)} />
              <Tab label="Products" {...a11yProps(1)} />
              <Tab label="Suppliers" {...a11yProps(2)} />
              <Tab label="RFQs" {...a11yProps(3)} />
            </Tabs>
            
            <TabPanel value={activeTab} index={0}>
              {renderResults()}
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <Typography>Products coming soon</Typography>
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <Typography>Suppliers coming soon</Typography>
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <Typography>RFQs coming soon</Typography>
            </TabPanel>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default SearchPage;
