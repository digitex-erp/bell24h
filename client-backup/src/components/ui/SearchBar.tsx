import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Paper,
  Popper,
  Fade,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  CircularProgress,
  alpha,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

export interface SearchSuggestion {
  id: string | number;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface SearchBarProps {
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  /**
   * Current search query
   */
  value: string;
  /**
   * Callback when search query changes
   */
  onChange: (value: string) => void;
  /**
   * Callback when search is submitted
   */
  onSearch: (query: string) => void;
  /**
   * Callback when search is cleared
   */
  onClear?: () => void;
  /**
   * Array of search suggestions
   */
  suggestions?: SearchSuggestion[];
  /**
   * Whether to show recent searches
   */
  showRecentSearches?: boolean;
  /**
   * Recent searches to display
   */
  recentSearches?: SearchSuggestion[];
  /**
   * Callback when a recent search is clicked
   */
  onRecentSearchClick?: (search: SearchSuggestion) => void;
  /**
   * Callback to clear recent searches
   */
  onClearRecentSearches?: () => void;
  /**
   * Whether the search is loading
   */
  loading?: boolean;
  /**
   * Custom width for the search bar
   */
  width?: number | string;
  /**
   * Custom height for the search bar
   */
  height?: number | string;
  /**
   * Custom border radius
   */
  borderRadius?: number | string;
  /**
   * Custom styles
   */
  sx?: any;
}

const StyledSearch = styled(Paper)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  display: 'flex',
  alignItems: 'center',
  transition: theme.transitions.create(['width', 'background-color']),
  '&.focused': {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 1),
    paddingLeft: `calc(1em + ${theme.spacing(1)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  onClear,
  suggestions = [],
  showRecentSearches = true,
  recentSearches = [],
  onRecentSearchClick,
  onClearRecentSearches,
  loading = false,
  width = '100%',
  height = 40,
  borderRadius = 4,
  sx,
}) => {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const anchorEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleFocus = () => {
    setFocused(true);
    if (inputValue) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(!!newValue || recentSearches.length > 0);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    if (onClear) {
      onClear();
    }
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.onClick) {
      suggestion.onClick();
    } else {
      setInputValue(suggestion.label);
      onChange(suggestion.label);
      onSearch(suggestion.label);
    }
    setShowSuggestions(false);
  };

  const handleRecentSearchClick = (search: SearchSuggestion) => {
    if (onRecentSearchClick) {
      onRecentSearchClick(search);
    } else {
      setInputValue(search.label);
      onChange(search.label);
      onSearch(search.label);
    }
    setShowSuggestions(false);
  };

  const hasSuggestions = suggestions.length > 0 || (showRecentSearches && recentSearches.length > 0);

  return (
    <Box sx={{ width, ...sx }}>
      <form onSubmit={handleSubmit}>
        <StyledSearch
          ref={anchorEl}
          elevation={focused ? 2 : 0}
          className={focused ? 'focused' : ''}
          sx={{
            borderRadius,
            height,
            bgcolor: focused ? 'background.paper' : 'action.hover',
            '&:hover': {
              bgcolor: focused ? 'background.paper' : 'action.selected',
            },
            ...sx,
          }}
        >
          <IconButton
            type="submit"
            sx={{
              p: 1,
              color: focused ? 'primary.main' : 'text.secondary',
            }}
            aria-label="search"
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SearchIcon />
            )}
          </IconButton>
          <StyledInputBase
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            inputProps={{ 'aria-label': 'search' }}
            endAdornment={
              inputValue && (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={handleClear}
                    size="small"
                    sx={{ mr: 0.5 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
        </StyledSearch>
      </form>

      <Popper
        open={focused && showSuggestions && hasSuggestions}
        anchorEl={anchorEl.current}
        placement="bottom-start"
        transition
        disablePortal
        style={{
          zIndex: 1300,
          width: anchorEl.current?.clientWidth,
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <Paper
              elevation={4}
              sx={{
                width: '100%',
                maxHeight: 400,
                overflow: 'auto',
                mt: 0.5,
                borderRadius: 2,
              }}
            >
              <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
                <div>
                  {suggestions.length > 0 && (
                    <List dense>
                      {suggestions.map((suggestion) => (
                        <ListItem
                          key={suggestion.id}
                          button
                          onClick={() => handleSuggestionClick(suggestion)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          {suggestion.icon && (
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {suggestion.icon}
                            </ListItemIcon>
                          )}
                          <ListItemText
                            primary={suggestion.label}
                            secondary={suggestion.subLabel}
                            primaryTypographyProps={{
                              noWrap: true,
                              color: 'text.primary',
                            }}
                            secondaryTypographyProps={{
                              noWrap: true,
                              variant: 'caption',
                            }}
                          />
                          <ArrowForwardIcon color="action" fontSize="small" />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {showRecentSearches && recentSearches.length > 0 && (
                    <Box>
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: 'background.default',
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          Recent Searches
                        </Typography>
                        {onClearRecentSearches && (
                          <Typography
                            variant="caption"
                            color="primary"
                            onClick={onClearRecentSearches}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            Clear all
                          </Typography>
                        )}
                      </Box>
                      <List dense>
                        {recentSearches.map((search, index) => (
                          <ListItem
                            key={`${search.id}-${index}`}
                            button
                            onClick={() => handleRecentSearchClick(search)}
                            sx={{
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <HistoryIcon fontSize="small" color="action" />
                            </ListItemIcon>
                            <ListItemText
                              primary={search.label}
                              primaryTypographyProps={{
                                noWrap: true,
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default SearchBar;
