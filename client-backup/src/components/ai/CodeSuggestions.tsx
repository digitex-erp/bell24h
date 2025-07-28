import React, { useMemo } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Divider, Paper, Tooltip, useTheme } from '@mui/material';
import { AZRCodeCompletion } from '../../services/azrCoderService';
import CodeBlock from './CodeBlock';
import { Check, Code, Functions, DataObject, Terminal, Star } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  cursor: 'pointer',
}));

const SuggestionItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  cursor: 'pointer',
  transition: 'background-color 0.2s',
}));

const ScoreBadge = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '24px',
  height: '20px',
  padding: theme.spacing(0, 0.5),
  borderRadius: '10px',
  backgroundColor: theme.palette.action.selected,
  color: theme.palette.text.secondary,
  fontSize: '0.7rem',
  fontWeight: 500,
  marginLeft: theme.spacing(1),
}));

const getSuggestionIcon = (type: string) => {
  switch (type) {
    case 'function':
      return <Functions fontSize="small" />;
    case 'class':
      return <DataObject fontSize="small" />;
    case 'snippet':
      return <Code fontSize="small" />;
    default:
      return <Terminal fontSize="small" />;
  }
};

const getSuggestionType = (text: string, docstring?: string) => {
  if (text.trim().startsWith('function')) return 'function';
  if (text.trim().startsWith('class')) return 'class';
  if (docstring?.includes('@param') || docstring?.includes('@returns')) return 'function';
  return 'snippet';
};

interface CodeSuggestionsProps {
  completions: AZRCodeCompletion | null;
  isLoading?: boolean;
  error?: Error | null;
  onSelect?: (completion: string) => void;
  maxHeight?: string | number;
  className?: string;
  selectedIndex?: number;
  onHover?: (index: number) => void;
}

const CodeSuggestions: React.FC<CodeSuggestionsProps> = ({
  completions,
  isLoading = false,
  error = null,
  onSelect,
  maxHeight = '400px',
  className,
  selectedIndex = -1,
  onHover,
}) => {
  const theme = useTheme();
  
  const sortedCompletions = useMemo(() => {
    if (!completions?.completions) return [];
    return [...completions.completions].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [completions]);

  if (isLoading) {
    return (
      <StyledPaper className={className}>
        <Header>
          <Typography variant="subtitle2">Code Completions</Typography>
          <Box flexGrow={1} />
          <Typography variant="caption" color="text.secondary">
            Generating suggestions...
          </Typography>
        </Header>
      </StyledPaper>
    );
  }


  if (error) {
    return (
      <StyledPaper className={className}>
        <Header>
          <Typography variant="subtitle2" color="error">
            Error loading completions
          </Typography>
          <Box flexGrow={1} />
          <Typography variant="caption" color="error">
            {error.message}
          </Typography>
        </Header>
      </StyledPaper>
    );
  }

  if (!completions || sortedCompletions.length === 0) {
    return (
      <StyledPaper className={className}>
        <Header>
          <Typography variant="subtitle2">Code Completions</Typography>
          <Box flexGrow={1} />
          <Typography variant="caption" color="text.secondary">
            No suggestions available
          </Typography>
        </Header>
      </StyledPaper>
    );
  }

  const handleSelect = (completion: string) => {
    onSelect?.(completion);
  };

  const handleMouseEnter = (index: number) => {
    onHover?.(index);
  };

  return (
    <StyledPaper className={className}>
      <Header>
        <Typography variant="subtitle2">Code Completions</Typography>
        <Box flexGrow={1} />
        <Typography variant="caption" color="text.secondary">
          {sortedCompletions.length} {sortedCompletions.length === 1 ? 'suggestion' : 'suggestions'}
        </Typography>
      </Header>

      <Box maxHeight={maxHeight} overflow="auto">
        <List disablePadding>
          {sortedCompletions.map((completion, index) => {
            const type = getSuggestionType(completion.text, completion.docstring);
            const isSelected = index === selectedIndex;
            
            return (
              <React.Fragment key={index}>
                <SuggestionItem
                  onClick={() => handleSelect(completion.text)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  sx={{
                    bgcolor: isSelected ? theme.palette.action.selected : 'transparent',
                    '&:hover': {
                      bgcolor: isSelected 
                        ? theme.palette.action.selected 
                        : theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getSuggestionIcon(type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="body2"
                          component="div"
                          sx={{
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 'calc(100% - 40px)',
                          }}
                        >
                          {completion.text.trim().split('\n')[0]}
                        </Typography>
                        {completion.score !== undefined && (
                          <Tooltip title={`Confidence: ${Math.round(completion.score * 100)}%`}>
                            <ScoreBadge>
                              {Math.round(completion.score * 100)}%
                            </ScoreBadge>
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={
                      completion.docstring ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {completion.docstring.replace(/\s+/g, ' ').trim()}
                        </Typography>
                      ) : null
                    }
                    secondaryTypographyProps={{
                      component: 'div',
                    }}
                  />
                  {index === 0 && (
                    <Tooltip title="Top suggestion">
                      <Star color="warning" fontSize="small" />
                    </Tooltip>
                  )}
                </SuggestionItem>
                {index < sortedCompletions.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
      
      {sortedCompletions[selectedIndex]?.docstring && (
        <Box p={2} borderTop={`1px solid ${theme.palette.divider}`}>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            Documentation
          </Typography>
          <CodeBlock
            code={sortedCompletions[selectedIndex].docstring || ''}
            language="markdown"
            showLineNumbers={false}
            showCopyButton={false}
            style={{
              backgroundColor: theme.palette.background.default,
              borderRadius: theme.shape.borderRadius,
              padding: theme.spacing(1),
              margin: 0,
              boxShadow: 'none',
              fontSize: '0.8rem',
            }}
          />
        </Box>
      )}
    </StyledPaper>
  );
};

export default CodeSuggestions;
