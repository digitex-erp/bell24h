import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  Button,
  Divider,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  IconButton,
  Tooltip,
  Pagination,
  Stack,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Collapse
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { rfqService } from '../../services/rfq/RFQService';
import { RFQ } from '../../types/rfq';
import { categories, getSubcategoriesByCategoryId } from '../../config/categories';
import { searchAnalyticsService } from '../../services/search/SearchAnalyticsService';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentIcon from '@mui/icons-material/Payment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExportResults from './ExportResults';
import { exportService } from '../../services/exportService';

interface SearchFilters {
  priceRange: [number, number];
  location: string;
  category: string;
  subcategory: string;
  status: string;
  timeline: string;
  dateRange: [Date | null, Date | null];
  supplierRating: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  verifiedSuppliers: boolean;
  paymentTerms: string[];
  minOrderQuantity: number;
  maxOrderQuantity: number;
  certifications: string[];
  deliveryTime: string;
  showExpired: boolean;
}

const ITEMS_PER_PAGE = 10;

const SearchResults: React.FC = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 1000000],
    location: '',
    category: '',
    subcategory: '',
    status: '',
    timeline: '',
    dateRange: [null, null],
    supplierRating: 0,
    sortBy: 'relevance',
    sortOrder: 'desc',
    verifiedSuppliers: false,
    paymentTerms: [],
    minOrderQuantity: 0,
    maxOrderQuantity: 1000000,
    certifications: [],
    deliveryTime: '',
    showExpired: false
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await rfqService.getRFQs();
        let filteredResults = response.rfqs.filter(rfq => 
          rfq.title.toLowerCase().includes(query.toLowerCase()) ||
          rfq.description.toLowerCase().includes(query.toLowerCase())
        );

        // Apply basic filters
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.budget >= filters.priceRange[0] && rfq.budget <= filters.priceRange[1]
          );
        }

        if (filters.location) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.location.toLowerCase().includes(filters.location.toLowerCase())
          );
        }

        if (filters.category) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.category === filters.category
          );
        }

        if (filters.subcategory) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.subcategory === filters.subcategory
          );
        }

        if (filters.status) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.status === filters.status
          );
        }

        if (filters.timeline) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.timeline === filters.timeline
          );
        }

        // Apply advanced filters
        if (filters.dateRange[0] && filters.dateRange[1]) {
          filteredResults = filteredResults.filter(rfq => {
            const rfqDate = new Date(rfq.createdAt);
            return rfqDate >= filters.dateRange[0]! && rfqDate <= filters.dateRange[1]!;
          });
        }

        if (filters.supplierRating > 0) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.supplierRating >= filters.supplierRating
          );
        }

        if (filters.verifiedSuppliers) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.supplierVerified
          );
        }

        if (filters.paymentTerms.length > 0) {
          filteredResults = filteredResults.filter(rfq => 
            filters.paymentTerms.some(term => rfq.paymentTerms.includes(term))
          );
        }

        if (filters.minOrderQuantity > 0 || filters.maxOrderQuantity < 1000000) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.quantity >= filters.minOrderQuantity && 
            rfq.quantity <= filters.maxOrderQuantity
          );
        }

        if (filters.certifications.length > 0) {
          filteredResults = filteredResults.filter(rfq => 
            filters.certifications.some(cert => rfq.certifications.includes(cert))
          );
        }

        if (filters.deliveryTime) {
          filteredResults = filteredResults.filter(rfq => 
            rfq.deliveryTime === filters.deliveryTime
          );
        }

        if (!filters.showExpired) {
          filteredResults = filteredResults.filter(rfq => 
            new Date(rfq.expiryDate) > new Date()
          );
        }

        // Sort results
        filteredResults.sort((a, b) => {
          let comparison = 0;
          switch (filters.sortBy) {
            case 'price':
              comparison = a.budget - b.budget;
              break;
            case 'date':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              break;
            case 'rating':
              comparison = (a.supplierRating || 0) - (b.supplierRating || 0);
              break;
            case 'quantity':
              comparison = a.quantity - b.quantity;
              break;
            default:
              comparison = 0;
          }
          return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        setResults(filteredResults);
        setError(null);

        // Track search analytics
        searchAnalyticsService.trackSearch({
          query,
          timestamp: new Date(),
          resultCount: filteredResults.length
        });
      } catch (err) {
        setError('Failed to fetch search results');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, filters]);

  const handleFilterChange = (filter: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePopularSearchClick = (search: string) => {
    // Update URL with new search query
    window.location.href = `/search?q=${encodeURIComponent(search)}`;
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000000],
      location: '',
      category: '',
      subcategory: '',
      status: '',
      timeline: '',
      dateRange: [null, null],
      supplierRating: 0,
      sortBy: 'relevance',
      sortOrder: 'desc',
      verifiedSuppliers: false,
      paymentTerms: [],
      minOrderQuantity: 0,
      maxOrderQuantity: 1000000,
      certifications: [],
      deliveryTime: '',
      showExpired: false
    });
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleExport = async (format: string, options: ExportOptions) => {
    await exportService.exportResults(filteredResults, format, options);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading search results...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Filters
              </Typography>
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterListIcon />
              </IconButton>
            </Box>

            {showFilters && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Price Range</Typography>
                  <Slider
                    value={filters.priceRange}
                    onChange={(_, value) => handleFilterChange('priceRange', value)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000000}
                    step={1000}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      ${filters.priceRange[0].toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      ${filters.priceRange[1].toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={filters.location}
                    label="Location"
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  >
                    <MenuItem value="">Any Location</MenuItem>
                    <MenuItem value="US">United States</MenuItem>
                    <MenuItem value="EU">European Union</MenuItem>
                    <MenuItem value="ASIA">Asia</MenuItem>
                    <MenuItem value="AFRICA">Africa</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {filters.category && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Subcategory</InputLabel>
                    <Select
                      value={filters.subcategory}
                      label="Subcategory"
                      onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    >
                      <MenuItem value="">All Subcategories</MenuItem>
                      {getSubcategoriesByCategoryId(filters.category).map((sub) => (
                        <MenuItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">Any Status</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Timeline</InputLabel>
                  <Select
                    value={filters.timeline}
                    label="Timeline"
                    onChange={(e) => handleFilterChange('timeline', e.target.value)}
                  >
                    <MenuItem value="">Any Timeline</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="flexible">Flexible</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="text"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mb: 2 }}
                >
                  Advanced Filters
                </Button>

                <Collapse in={showAdvancedFilters}>
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>Order Quantity Range</Typography>
                    <Slider
                      value={[filters.minOrderQuantity, filters.maxOrderQuantity]}
                      onChange={(_, value) => {
                        const [min, max] = value as number[];
                        handleFilterChange('minOrderQuantity', min);
                        handleFilterChange('maxOrderQuantity', max);
                      }}
                      valueLabelDisplay="auto"
                      min={0}
                      max={1000000}
                      step={100}
                    />
                  </Box>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Delivery Time</InputLabel>
                    <Select
                      value={filters.deliveryTime}
                      label="Delivery Time"
                      onChange={(e) => handleFilterChange('deliveryTime', e.target.value)}
                    >
                      <MenuItem value="">Any Delivery Time</MenuItem>
                      <MenuItem value="immediate">Immediate</MenuItem>
                      <MenuItem value="1-2 weeks">1-2 Weeks</MenuItem>
                      <MenuItem value="2-4 weeks">2-4 Weeks</MenuItem>
                      <MenuItem value="1-2 months">1-2 Months</MenuItem>
                    </Select>
                  </FormControl>

                  <FormGroup sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.verifiedSuppliers}
                          onChange={(e) => handleFilterChange('verifiedSuppliers', e.target.checked)}
                        />
                      }
                      label="Verified Suppliers Only"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.showExpired}
                          onChange={(e) => handleFilterChange('showExpired', e.target.checked)}
                        />
                      }
                      label="Show Expired RFQs"
                    />
                  </FormGroup>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Payment Terms</InputLabel>
                    <Select
                      multiple
                      value={filters.paymentTerms}
                      label="Payment Terms"
                      onChange={(e) => handleFilterChange('paymentTerms', e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="advance">Advance Payment</MenuItem>
                      <MenuItem value="net30">Net 30</MenuItem>
                      <MenuItem value="net60">Net 60</MenuItem>
                      <MenuItem value="net90">Net 90</MenuItem>
                      <MenuItem value="letter_of_credit">Letter of Credit</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Certifications</InputLabel>
                    <Select
                      multiple
                      value={filters.certifications}
                      label="Certifications"
                      onChange={(e) => handleFilterChange('certifications', e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="iso9001">ISO 9001</MenuItem>
                      <MenuItem value="iso14001">ISO 14001</MenuItem>
                      <MenuItem value="ce">CE Marking</MenuItem>
                      <MenuItem value="fda">FDA Approved</MenuItem>
                      <MenuItem value="rohs">RoHS Compliant</MenuItem>
                    </Select>
                  </FormControl>
                </Collapse>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={clearFilters}
                  sx={{ mt: 2 }}
                >
                  Clear All Filters
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Search Results */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Search Results for "{query}"
            </Typography>
            <ExportResults
              results={results}
              onExport={handleExport}
            />
          </Box>

          {/* Sort Options */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1">Sort by:</Typography>
              <ToggleButtonGroup
                value={filters.sortBy}
                exclusive
                onChange={(_, value) => value && handleSortChange(value)}
                size="small"
              >
                <ToggleButton value="relevance">
                  <Tooltip title="Sort by relevance">
                    <SortIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="price">
                  <Tooltip title="Sort by price">
                    <AttachMoneyIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="date">
                  <Tooltip title="Sort by date">
                    <DateRangeIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="rating">
                  <Tooltip title="Sort by rating">
                    <Rating value={1} readOnly size="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="quantity">
                  <Tooltip title="Sort by quantity">
                    <Typography variant="body2">Qty</Typography>
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Paper>

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Popular Searches
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {popularSearches.map((search) => (
                  <Chip
                    key={search}
                    label={search}
                    onClick={() => handlePopularSearchClick(search)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Results Grid */}
          <Grid container spacing={2}>
            {paginatedResults.map((rfq) => (
              <Grid item xs={12} key={rfq.id}>
                <Paper
                  sx={{
                    p: 2,
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {rfq.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {rfq.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Budget: $${rfq.budget.toLocaleString()}`}
                      size="small"
                    />
                    <Chip
                      label={`Location: ${rfq.location}`}
                      size="small"
                    />
                    <Chip
                      label={`Status: ${rfq.status}`}
                      size="small"
                      color={rfq.status === 'open' ? 'success' : 'default'}
                    />
                    <Chip
                      label={`Timeline: ${rfq.timeline}`}
                      size="small"
                    />
                    {rfq.supplierRating && (
                      <Chip
                        icon={<Rating value={rfq.supplierRating} readOnly size="small" />}
                        label={`Rating: ${rfq.supplierRating}`}
                        size="small"
                      />
                    )}
                    {rfq.supplierVerified && (
                      <Chip
                        icon={<VerifiedIcon />}
                        label="Verified Supplier"
                        size="small"
                        color="success"
                      />
                    )}
                    {rfq.paymentTerms && (
                      <Chip
                        icon={<PaymentIcon />}
                        label={rfq.paymentTerms}
                        size="small"
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {results.length > ITEMS_PER_PAGE && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(results.length / ITEMS_PER_PAGE)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {results.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No results found for your search criteria
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your filters or search terms
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchResults; 