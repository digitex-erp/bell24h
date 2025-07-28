import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Chip,
  Paper,
  useTheme
} from '@mui/material';
import { rfqService } from '../../services/rfq/RFQService';
import { categories, getSubcategoriesByCategoryId } from '../../config/categories';
import { debounce } from 'lodash';

interface SearchResult {
  id: string;
  type: 'category' | 'subcategory' | 'rfq';
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
}

interface SearchAnalytics {
  query: string;
  timestamp: Date;
  resultCount: number;
  selectedResult?: SearchResult;
}

const SearchBar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalytics[]>([]);

  // Load popular searches from localStorage
  useEffect(() => {
    const savedSuggestions = localStorage.getItem('searchSuggestions');
    if (savedSuggestions) {
      setSuggestions(JSON.parse(savedSuggestions));
    }
  }, []);

  // Save search analytics
  const saveSearchAnalytics = useCallback((data: SearchAnalytics) => {
    const currentAnalytics = JSON.parse(localStorage.getItem('searchAnalytics') || '[]');
    const updatedAnalytics = [...currentAnalytics, data].slice(-100); // Keep last 100 searches
    localStorage.setItem('searchAnalytics', JSON.stringify(updatedAnalytics));
    setAnalytics(updatedAnalytics);
  }, []);

  // Update search suggestions
  const updateSuggestions = useCallback((query: string) => {
    if (query.length < 2) return;

    const currentSuggestions = JSON.parse(localStorage.getItem('searchSuggestions') || '[]');
    if (!currentSuggestions.includes(query)) {
      const updatedSuggestions = [query, ...currentSuggestions].slice(0, 10);
      localStorage.setItem('searchSuggestions', JSON.stringify(updatedSuggestions));
      setSuggestions(updatedSuggestions);
    }
  }, []);

  const search = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Search categories
        const categoryResults = categories
          .filter(cat => 
            cat.name.toLowerCase().includes(query.toLowerCase()) ||
            cat.description.toLowerCase().includes(query.toLowerCase())
          )
          .map(cat => ({
            id: cat.id,
            type: 'category' as const,
            title: cat.name,
            description: cat.description
          }));

        // Search subcategories
        const subcategoryResults = categories
          .flatMap(cat => 
            cat.subcategories
              .filter(sub => 
                sub.name.toLowerCase().includes(query.toLowerCase()) ||
                sub.description.toLowerCase().includes(query.toLowerCase())
              )
              .map(sub => ({
                id: sub.id,
                type: 'subcategory' as const,
                title: sub.name,
                description: sub.description,
                category: cat.id
              }))
          );

        // Search RFQs
        const rfqResponse = await rfqService.getRFQs();
        const rfqResults = rfqResponse.rfqs
          .filter(rfq => 
            rfq.title.toLowerCase().includes(query.toLowerCase()) ||
            rfq.description.toLowerCase().includes(query.toLowerCase())
          )
          .map(rfq => ({
            id: rfq.id,
            type: 'rfq' as const,
            title: rfq.title,
            description: rfq.description,
            category: rfq.category,
            subcategory: rfq.subcategory
          }));

        const allResults = [...categoryResults, ...subcategoryResults, ...rfqResults];
        setResults(allResults);

        // Save analytics
        saveSearchAnalytics({
          query,
          timestamp: new Date(),
          resultCount: allResults.length
        });

        // Update suggestions
        updateSuggestions(query);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    search(inputValue);
  }, [inputValue, search]);

  const handleSelect = (result: SearchResult) => {
    // Save selected result to analytics
    saveSearchAnalytics({
      query: inputValue,
      timestamp: new Date(),
      resultCount: results.length,
      selectedResult: result
    });

    // Navigate based on result type
    switch (result.type) {
      case 'category':
        navigate(`/rfq/category/${result.id}`);
        break;
      case 'subcategory':
        navigate(`/rfq/category/${result.category}/subcategory/${result.id}`);
        break;
      case 'rfq':
        navigate(`/rfq/${result.id}`);
        break;
    }
  };

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <Autocomplete
        freeSolo
        options={results}
        loading={loading}
        inputValue={inputValue}
        onInputChange={(_, value) => setInputValue(value)}
        onChange={(_, value) => {
          if (typeof value === 'string') {
            handleSearch(value);
          } else if (value) {
            handleSelect(value);
          }
        }}
        getOptionLabel={(option) => 
          typeof option === 'string' ? option : option.title
        }
        renderOption={(props, option) => (
          <li {...props}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body1">
                {option.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.type.charAt(0).toUpperCase() + option.type.slice(1)}
                {option.description && ` - ${option.description}`}
              </Typography>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search categories, subcategories, or RFQs..."
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        PaperComponent={({ children, ...props }) => (
          <Paper
            {...props}
            sx={{
              mt: 1,
              '& .MuiAutocomplete-listbox': {
                maxHeight: 300
              }
            }}
          >
            {suggestions.length > 0 && (
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Popular Searches
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {suggestions.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      size="small"
                      onClick={() => handleSearch(suggestion)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            {children}
          </Paper>
        )}
      />
    </Box>
  );
};

export default SearchBar; 