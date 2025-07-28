import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  Button, 
  MenuItem, 
  Paper,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Tune as TuneIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface SearchBarProps {
  onSearch?: (query: string, category?: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  categories?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch = () => {},
  placeholder = 'Search products, suppliers, or RFQs...',
  showFilters = true,
  categories = [
    'All Categories',
    'Electronics',
    'Textiles',
    'Machinery',
    'Chemicals',
    'Construction',
    'Food & Beverage'
  ]
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, selectedCategory !== 'All Categories' ? selectedCategory : undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCategory(e.target.value as string);
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <Paper 
        elevation={3}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 50,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            boxShadow: 4,
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          {showFilters && !isMobile && (
            <>
              <TextField
                select
                value={selectedCategory}
                onChange={handleCategoryChange}
                variant="standard"
                sx={{
                  minWidth: 150,
                  mx: 1,
                  '& .MuiInput-underline:before': {
                    borderBottom: 'none',
                  },
                  '& .MuiInput-underline:after': {
                    borderBottom: 'none',
                  },
                  '& .MuiSelect-select': {
                    py: 1.5,
                    color: 'primary.main',
                    fontWeight: 500,
                  },
                }}
                SelectProps={{
                  IconComponent: () => null,
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 6, 
                        height: 6, 
                        bgcolor: 'primary.main', 
                        borderRadius: '50%',
                        mr: 1 
                      }} />
                      {selected}
                    </Box>
                  ),
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <Box 
                sx={{ 
                  width: '1px', 
                  height: 24, 
                  bgcolor: 'divider',
                  mx: 1
                }} 
              />
            </>
          )}
          
          <TextField
            fullWidth
            variant="standard"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              '& .MuiInput-underline:before': {
                borderBottom: 'none',
              },
              '& .MuiInput-underline:after': {
                borderBottom: 'none',
              },
              '& .MuiInputBase-root': {
                py: 0.5,
              },
              '& .MuiInputBase-input': {
                py: 1.5,
                px: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ mr: -1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              disableUnderline: true,
            }}
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{
              borderRadius: 50,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 2,
              },
            }}
          >
            {isMobile ? <SearchIcon /> : 'Search'}
          </Button>
          
          {showFilters && (
            <IconButton 
              onClick={toggleAdvancedFilters}
              sx={{
                ml: 1,
                color: showAdvancedFilters ? 'primary.main' : 'text.secondary',
                bgcolor: showAdvancedFilters ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <TuneIcon />
            </IconButton>
          )}
        </Box>
      </Paper>
      
      {showAdvancedFilters && (
        <Paper 
          elevation={3}
          sx={{
            mt: 2,
            p: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Advanced Filters
            </Typography>
            <Button 
              size="small" 
              onClick={toggleAdvancedFilters}
              startIcon={<CloseIcon fontSize="small" />}
            >
              Close
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField
              select
              label="Supplier Location"
              size="small"
              fullWidth
              defaultValue=""
            >
              <MenuItem value="">Any Location</MenuItem>
              <MenuItem value="india">India</MenuItem>
              <MenuItem value="china">China</MenuItem>
              <MenuItem value="usa">USA</MenuItem>
              <MenuItem value="europe">Europe</MenuItem>
            </TextField>
            <TextField
              select
              label="Supplier Tier"
              size="small"
              fullWidth
              defaultValue=""
            >
              <MenuItem value="">Any Tier</MenuItem>
              <MenuItem value="platinum">Platinum</MenuItem>
              <MenuItem value="gold">Gold</MenuItem>
              <MenuItem value="silver">Silver</MenuItem>
              <MenuItem value="bronze">Bronze</MenuItem>
            </TextField>
            <TextField
              select
              label="Minimum Rating"
              size="small"
              fullWidth
              defaultValue=""
            >
              <MenuItem value="">Any Rating</MenuItem>
              <MenuItem value="5">5 Stars</MenuItem>
              <MenuItem value="4">4+ Stars</MenuItem>
              <MenuItem value="3">3+ Stars</MenuItem>
              <MenuItem value="2">2+ Stars</MenuItem>
              <MenuItem value="1">1+ Stars</MenuItem>
            </TextField>
            <TextField
              label="Min Order Value"
              size="small"
              type="number"
              fullWidth
              placeholder="Min"
            />
            <TextField
              label="Max Order Value"
              size="small"
              type="number"
              fullWidth
              placeholder="Max"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small" 
                fullWidth
                onClick={() => {
                  // Reset filters
                }}
              >
                Reset
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                fullWidth
                onClick={handleSearch}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
