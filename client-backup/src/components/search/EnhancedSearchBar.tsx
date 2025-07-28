import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  Button, 
  MenuItem, 
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Popper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  ClickAwayListener,
  Fade,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Tune as TuneIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  ArrowRight as ArrowRightIcon
} from '@mui/icons-material';
import { useSearch } from '../../contexts/SearchContext';
import { SearchSuggestion } from '../../services/search/types';

interface EnhancedSearchBarProps {
  onSearch?: (query: string, category?: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  categories?: string[];
  autoFocus?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearch,
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
  ],
  autoFocus = false,
  size = 'medium',
  fullWidth = true,
  variant = 'outlined',
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { search, getSuggestions, recentSearches, popularSearches } = useSearch();

  // Update search query from URL on initial load
  useEffect(() => {
    if (router.isReady && router.query.q) {
      const query = Array.isArray(router.query.q) ? router.query.q[0] : router.query.q;
      setSearchQuery(query);
      
      if (router.query.category) {
        const category = Array.isArray(router.query.category) 
          ? router.query.category[0] 
          : router.query.category;
        setSelectedCategory(decodeURIComponent(category));
      }
    }
  }, [router.isReady, router.query.q, router.query.category]);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([
          ...recentSearches,
          ...popularSearches.filter(p => !recentSearches.some(r => r.text === p.text))
        ].slice(0, 5));
        return;
      }

      setLoading(true);
      try {
        const result = await getSuggestions(searchQuery);
        setSuggestions(result);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, getSuggestions, recentSearches, popularSearches]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    // Update URL
    const queryParams = new URLSearchParams();
    queryParams.set('q', searchQuery);
    
    if (selectedCategory !== 'All Categories') {
      queryParams.set('category', selectedCategory);
    }

    router.push({
      pathname: '/search',
      search: queryParams.toString(),
    }, undefined, { shallow: true });

    // Execute search
    search(searchQuery, selectedCategory !== 'All Categories' ? { categories: [selectedCategory] } : {});
    
    if (onSearch) {
      onSearch(searchQuery, selectedCategory !== 'All Categories' ? selectedCategory : undefined);
    }
    
    setShowSuggestions(false);
  }, [searchQuery, selectedCategory, router, search, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCategory(e.target.value as string);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    
    // If it's a category suggestion, update the category
    if (suggestion.category && categories.includes(suggestion.category)) {
      setSelectedCategory(suggestion.category);
    }
    
    // Focus the input and hide suggestions
    searchInputRef.current?.focus();
    setShowSuggestions(false);
    
    // Trigger search after a small delay
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const renderSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <HistoryIcon fontSize="small" color="action" />;
      case 'popular':
        return <TrendingUpIcon fontSize="small" color="primary" />;
      case 'suggestion':
      default:
        return <SearchIcon fontSize="small" color="action" />;
    }
  };

  const renderSuggestionText = (suggestion: SearchSuggestion) => {
    if (!searchQuery) return suggestion.text;
    
    const index = suggestion.text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (index === -1) return suggestion.text;
    
    return (
      <span>
        {suggestion.text.substring(0, index)}
        <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {suggestion.text.substring(index, index + searchQuery.length)}
        </Box>
        {suggestion.text.substring(index + searchQuery.length)}
      </span>
    );
  };

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        maxWidth: 800,
        mx: 'auto',
      }}
    >
      <Paper 
        elevation={3}
        sx={{
          p: variant === 'outlined' ? 0 : 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: variant === 'outlined' ? 'none' : '1px solid',
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
                    py: size === 'small' ? 1 : 1.5,
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
              <Divider orientation="vertical" flexItem sx={{ my: 1 }} />
            </>
          )}
          
          <Box sx={{ flex: 1, position: 'relative' }}>
            <TextField
              inputRef={searchInputRef}
              fullWidth
              variant={variant}
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none',
                  },
                },
                '& .MuiInputBase-input': {
                  py: size === 'small' ? 1 : 1.5,
                  px: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        sx={{ mr: -1 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                ) : null,
              }}
              autoFocus={autoFocus}
              size={size}
            />
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            sx={{
              borderRadius: 3,
              px: 4,
              py: size === 'small' ? 0.75 : 1.25,
              mx: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 2,
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'text.disabled',
              },
            }}
          >
            {isMobile ? <SearchIcon /> : 'Search'}
          </Button>
        </Box>
      </Paper>

      {/* Suggestions Dropdown */}
      <Popper
        open={showSuggestions && suggestions.length > 0}
        anchorEl={containerRef.current}
        placement="bottom-start"
        style={{ 
          width: containerRef.current?.clientWidth,
          zIndex: theme.zIndex.modal,
        }}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <Paper 
              elevation={4} 
              sx={{ 
                width: '100%',
                maxHeight: 400,
                overflow: 'auto',
                mt: 1,
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <List dense={size === 'small'}>
                {suggestions.map((suggestion, index) => (
                  <React.Fragment key={`${suggestion.type}-${index}`}>
                    <ListItem 
                      button 
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        py: size === 'small' ? 0.5 : 1,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {renderSuggestionIcon(suggestion.type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={renderSuggestionText(suggestion)}
                        primaryTypographyProps={{
                          variant: size === 'small' ? 'body2' : 'body1',
                        }}
                      />
                      {suggestion.type === 'suggestion' && suggestion.category && (
                        <Chip 
                          label={suggestion.category}
                          size="small" 
                          sx={{ 
                            ml: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            '& .MuiChip-label': { px: 1 },
                          }} 
                        />
                      )}
                    </ListItem>
                    {index < suggestions.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default EnhancedSearchBar;
