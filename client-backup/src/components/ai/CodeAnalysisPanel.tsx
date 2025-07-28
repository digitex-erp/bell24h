import React from 'react';
import { Box, Typography, Paper, Divider, Chip, Tooltip, IconButton, Collapse, useTheme } from '@mui/material';
import { AZRCodeAnalysis } from '../../services/azrCoderService';
import { CheckCircle, Error, Warning, Info, ExpandMore, ExpandLess } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import CodeBlock from './CodeBlock';

interface CodeAnalysisPanelProps {
  analysis: AZRCodeAnalysis | null;
  isLoading?: boolean;
  error?: Error | null;
  onSuggestionClick?: (suggestion: any) => void;
  maxHeight?: string | number;
  className?: string;
}

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
}));

const MetricsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const MetricItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  minWidth: '80px',
  '&:not(:last-child)': {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const SuggestionItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'severity',
})<{ severity: 'low' | 'medium' | 'high' }>(({ theme, severity }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  cursor: 'pointer',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: {
      low: theme.palette.info.main,
      medium: theme.palette.warning.main,
      high: theme.palette.error.main,
    }[severity],
  },
}));

const SeverityChip = styled(Chip)(({ theme }) => ({
  marginLeft: 'auto',
  textTransform: 'capitalize',
  '&.low': {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  },
  '&.medium': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  '&.high': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
}));

const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'high':
      return <Error color="error" fontSize="small" />;
    case 'medium':
      return <Warning color="warning" fontSize="small" />;
    case 'low':
    default:
      return <Info color="info" fontSize="small" />;
  }
};

const CodeAnalysisPanel: React.FC<CodeAnalysisPanelProps> = ({
  analysis,
  isLoading = false,
  error = null,
  onSuggestionClick,
  maxHeight = '500px',
  className,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    metrics: true,
    suggestions: true,
  });

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading) {
    return (
      <StyledPaper className={className}>
        <Header>
          <Typography variant="subtitle1">Code Analysis</Typography>
          <Box flexGrow={1} />
          <Typography variant="body2" color="text.secondary">
            Analyzing code...
          </Typography>
        </Header>
      </StyledPaper>
    );
  }

  if (error) {
    return (
      <StyledPaper className={className}>
        <Header>
          <Typography variant="subtitle1">Code Analysis</Typography>
          <Box flexGrow={1} />
          <Typography variant="body2" color="error">
            Error: {error.message}
          </Typography>
        </Header>
      </StyledPaper>
    );
  }

  if (!analysis) {
    return (
      <StyledPaper className={className}>
        <Header>
          <Typography variant="subtitle1">Code Analysis</Typography>
          <Box flexGrow={1} />
          <Typography variant="body2" color="text.secondary">
            No analysis available. Run analysis to see results.
          </Typography>
        </Header>
      </StyledPaper>
    );
  }

  const { metrics, suggestions, summary } = analysis;

  return (
    <StyledPaper className={className}>
      <Header>
        <Typography variant="subtitle1">Code Analysis</Typography>
        <Box flexGrow={1} />
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            {suggestions.length} {suggestions.length === 1 ? 'issue' : 'issues'} found
          </Typography>
          {suggestions.length === 0 && <CheckCircle color="success" fontSize="small" />}
        </Box>
      </Header>

      <Collapse in={expandedSections.metrics}>
        <MetricsContainer>
          <MetricItem>
            <Typography variant="caption" color="text.secondary">Complexity</Typography>
            <Typography variant="h6" color={metrics.complexity > 10 ? 'error.main' : 'text.primary'}>
              {metrics.complexity.toFixed(1)}
            </Typography>
          </MetricItem>
          <MetricItem>
            <Typography variant="caption" color="text.secondary">Maintainability</Typography>
            <Typography variant="h6" color={metrics.maintainability < 60 ? 'error.main' : 'success.main'}>
              {Math.round(metrics.maintainability)}%
            </Typography>
          </MetricItem>
          <MetricItem>
            <Typography variant="caption" color="text.secondary">Performance</Typography>
            <Typography variant="h6" color={metrics.performance < 60 ? 'warning.main' : 'success.main'}>
              {Math.round(metrics.performance)}%
            </Typography>
          </MetricItem>
          <MetricItem>
            <Typography variant="caption" color="text.secondary">Security</Typography>
            <Typography variant="h6" color={metrics.security < 60 ? 'error.main' : 'success.main'}>
              {Math.round(metrics.security)}%
            </Typography>
          </MetricItem>
        </MetricsContainer>
      </Collapse>

      {summary && (
        <Box p={2} bgcolor="background.default">
          <Typography variant="body2">{summary}</Typography>
        </Box>
      )}

      <Box>
        <Header
          onClick={() => toggleSection('suggestions')}
          sx={{
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <Typography variant="subtitle2">Suggestions ({suggestions.length})</Typography>
          <Box flexGrow={1} />
          {expandedSections.suggestions ? <ExpandLess /> : <ExpandMore />}
        </Header>

        <Collapse in={expandedSections.suggestions}>
          <Box maxHeight={maxHeight} overflow="auto">
            {suggestions.length === 0 ? (
              <Box p={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  No issues found. Great job! 🎉
                </Typography>
              </Box>
            ) : (
              suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={index}
                  severity={suggestion.severity}
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <Box mr={1} mt={0.5}>
                      {getSeverityIcon(suggestion.severity)}
                    </Box>
                    <Typography variant="subtitle2" flexGrow={1}>
                      {suggestion.message}
                    </Typography>
                    <SeverityChip
                      label={suggestion.severity}
                      size="small"
                      className={suggestion.severity}
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="caption" color="text.secondary">
                      {suggestion.type}
                      {suggestion.file && (
                        <>
                          {' • '}
                          {suggestion.file}
                          {suggestion.line !== undefined && `:${suggestion.line}`}
                        </>
                      )}
                    </Typography>
                  </Box>

                  {suggestion.codeSnippet && (
                    <Box mb={1}>
                      <CodeBlock
                        code={suggestion.codeSnippet}
                        language={suggestion.file?.split('.').pop()}
                        maxHeight="100px"
                        showLineNumbers={false}
                        showCopyButton={false}
                        style={{
                          borderRadius: theme.shape.borderRadius,
                          margin: 0,
                          boxShadow: 'none',
                        }}
                      />
                    </Box>
                  )}

                  {suggestion.recommendedFix && (
                    <Box mt={1}>
                      <Box
                        display="flex"
                        alignItems="center"
                        sx={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(`fix-${index}`);
                        }}
                      >
                        <Typography variant="caption" fontWeight="medium">
                          Recommended Fix
                        </Typography>
                        <Box flexGrow={1} />
                        {expanded[`fix-${index}`] ? <ExpandLess /> : <ExpandMore />}
                      </Box>
                      
                      <Collapse in={expanded[`fix-${index}`]}>
                        <Box mt={1} p={1} bgcolor="background.paper" borderRadius={1}>
                          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                            {suggestion.recommendedFix}
                          </Typography>
                        </Box>
                      </Collapse>
                    </Box>
                  )}
                </SuggestionItem>
              ))
            )}
          </Box>
        </Collapse>
      </Box>
    </StyledPaper>
  );
};

export default CodeAnalysisPanel;
