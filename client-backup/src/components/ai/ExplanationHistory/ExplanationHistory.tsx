import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TablePagination from '@mui/material/TablePagination';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Define a basic type for an explanation item (you can expand this later)
export interface ExplanationItem {
  id: string;
  modelType: string;
  timestamp: string;
  summary: string;
}

// Define props for the component
interface ExplanationHistoryProps {
  explanations: ExplanationItem[];
  isLoading: boolean;
  error: { message: string } | null;
  // Optional props for fetching data if managed externally
  onFetchExplanations?: (params: { page: number; limit: number; sortBy: keyof ExplanationItem; sortOrder: 'asc' | 'desc' }) => Promise<{ data: ExplanationItem[]; total: number }>;
}

interface HeadCell {
  id: keyof ExplanationItem | 'actions'; // Include 'actions' or other non-data fields if needed
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'id', numeric: false, label: 'ID' },
  { id: 'modelType', numeric: false, label: 'Model Type' },
  { id: 'timestamp', numeric: false, label: 'Timestamp' },
  { id: 'summary', numeric: false, label: 'Summary' },
];

// Responsive styles for the component
const responsiveStyles = {
  tableCell: {
    padding: '16px',
    '@media (max-width: 600px)': {
      padding: '12px 8px',
      '&:first-of-type': { paddingLeft: '16px' },
      '&:last-child': { paddingRight: '16px' },
    },
  },
  tableRow: {
    '&:hover': { backgroundColor: 'action.hover' },
    '&:focus-within': {
      outline: '2px solid #4a90e2',
      outlineOffset: '-2px',
    },
    '@media (max-width: 600px)': {
      minHeight: '48px',
    },
  },
  sortLabel: {
    minHeight: '48px',
    minWidth: '48px',
    display: 'flex',
    alignItems: 'center',
    margin: '-12px -16px',
    padding: '12px 16px',
  }
};

export const ExplanationHistory: React.FC<ExplanationHistoryProps> = ({
  explanations: initialExplanations = [],
  isLoading: initialLoading = false,
  error: initialError = null,
  onFetchExplanations
}) => {
  const [explanations, setExplanations] = useState<ExplanationItem[]>(initialExplanations);
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<string | null>(initialError ? initialError.message : null);
  
  // Theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Pagination state
  const [page, setPage] = useState<number>(0); // 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<keyof ExplanationItem>('timestamp'); // Default sort field
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default sort order

  // Effect to load explanations
  useEffect(() => {
    const params = new URLSearchParams({
      page: (page + 1).toString(),
      limit: rowsPerPage.toString(),
      sortBy: sortBy as string, // API might expect string
      sortOrder: sortOrder,
    });
    console.log('[TEST_DEBUG] Effect for fetch triggered. Params:', params.toString(), 'Current sortModel:', JSON.stringify({ sortBy, sortOrder })); // DEBUG
    if (onFetchExplanations) {
      setLoading(true);
      setError(null);
      onFetchExplanations({ page, limit: rowsPerPage, sortBy, sortOrder })
        .then(response => {
          setExplanations(response.data);
          setTotalItems(response.total);
        })
        .catch(err => {
          setError(err.message || 'Failed to fetch explanations');
          setExplanations([]); // Clear data on error
          setTotalItems(0);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (initialExplanations.length > 0 && !onFetchExplanations) {
      // If onFetchExplanations is not provided, but initialExplanations are, use them.
      setExplanations(initialExplanations);
      setTotalItems(initialExplanations.length);
      setLoading(false);
    } else {
      setExplanations([]); // Ensure explanations is empty if no data source
      setTotalItems(0);
      setLoading(false);
    }
  }, [onFetchExplanations, page, rowsPerPage, sortBy, sortOrder, initialExplanations]);

  // Pagination handlers
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  // Sorting handler
  const handleSortRequest = (property: keyof ExplanationItem) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
    setPage(0); // Reset to first page on sort
  };

  const handleSortLabelClick = (property: keyof ExplanationItem) => {
    handleSortRequest(property);
  };

  const handleSortLabelKeyDown = (property: keyof ExplanationItem, event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSortRequest(property);
    }
  };

  // Handle keyboard navigation for the table
  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    // Basic arrow key navigation could be added here if needed
    // For now, primarily for focus management and Enter/Space on rows
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // Implement row navigation if desired
    }
  };

  if (loading && explanations.length === 0) { // Show full page loader only on initial load
    return (
      <Box
        sx={{ 
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px"
        }}
        role="progressbar"
        aria-busy="true"
        aria-live="polite"
      >
        <CircularProgress />
        <Typography sx={{ marginLeft: 2 }}>Loading explanations...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ margin: 2 }}
        role="alert"
        aria-live="assertive"
      >
        {error}
      </Alert>
    );
  }
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        padding: 2, 
        margin: 2,
        '&:focus-visible': {
          outline: '2px solid #4a90e2',
          outlineOffset: '2px',
        }
      }}
      data-testid="explanation-history-container"
      tabIndex={-1} // Makes Paper focusable if needed, but content inside should be focusable
    >
      <Typography 
        variant="h5" 
        gutterBottom 
        component="div" // More semantic for a heading
      >
        Explanation History
      </Typography>
      {explanations.length === 0 && !loading && !error ? (
        <Typography
          variant="body1"
          sx={{
            padding: 2,
            textAlign: 'center',
            color: 'text.secondary', // Use theme color for secondary text
          }}
          aria-live="assertive"
        >
          No explanations available.
        </Typography>
      ) : !error ? ( // Only render table if no error and potentially data (or loading new data)
        <TableContainer 
          tabIndex={0} // Make container focusable for keyboard nav context
          onKeyDown={handleTableKeyDown}
          sx={{
            '&:focus-visible': {
              outline: '2px solid #4a90e2', // Focus indicator for the container
              outlineOffset: '2px',
            }
          }}
        >
          <Table stickyHeader aria-label="explanation history table">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    padding={headCell.id === 'actions' ? 'checkbox' : 'normal'} // Adjust padding for actions
                    sortDirection={sortBy === headCell.id ? sortOrder : false}
                    sx={responsiveStyles.tableCell}
                  >
                    <TableSortLabel
                      active={sortBy === headCell.id}
                      direction={sortBy === headCell.id ? sortOrder : 'asc'}
                      onClick={() => handleSortLabelClick(headCell.id as keyof ExplanationItem)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => handleSortLabelKeyDown(headCell.id as keyof ExplanationItem, e)}
                      tabIndex={0} // Make sort label focusable
                      component="span" // Use span for proper accessibility with TableSortLabel
                      sx={responsiveStyles.sortLabel}
                      aria-label={`Sort by ${headCell.label} ${sortBy === headCell.id ? 
                        (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                    >
                      {headCell.label}
                      {sortBy === headCell.id ? (
                        <Box sx={visuallyHidden}>
                          {sortOrder === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {explanations.map((exp) => (
                <TableRow 
                  hover 
                  key={exp.id}
                  tabIndex={0} // Make rows focusable
                  role="row"
                  sx={{
                    ...responsiveStyles.tableRow, // Apply responsive styles
                    '&:focus-within': { // Enhanced focus style for row
                      outline: '2px solid #4a90e2',
                      outlineOffset: '-2px',
                    },
                    '&:hover': {
                      cursor: 'pointer',
                      backgroundColor: 'action.hover', // Use theme hover color
                    },
                  }}
                  onClick={() => {
                    // Handle row click if needed
                    console.log('Row clicked:', exp.id);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Handle row activation if needed
                      console.log('Row activated with keyboard:', exp.id);
                    }
                  }}
                >
                  <TableCell sx={responsiveStyles.tableCell}>{exp.id}</TableCell>
                  <TableCell sx={responsiveStyles.tableCell}>{exp.modelType}</TableCell>
                  <TableCell sx={responsiveStyles.tableCell}>{new Date(exp.timestamp).toLocaleString()}</TableCell>
                  <TableCell sx={responsiveStyles.tableCell}>{exp.summary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}{/* Render nothing if error and no data, error is handled by Alert above */}
      { !error && explanations.length > 0 && (
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
          labelRowsPerPage={isMobile ? '' : 'Rows:'} // Hide label on mobile for space
          labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => 
            isMobile ? `${from}-${to} of ${count}` : `Showing ${from}-${to} of ${count}`
          }
          sx={{ // Responsive adjustments for pagination
            '& .MuiTablePagination-toolbar': {
              flexWrap: 'wrap', // Allow wrapping on small screens
              gap: 1, // Add gap between elements
            },
            '& .MuiTablePagination-actions': {
              margin: 0, // Remove default margin
              '& button': {
                padding: '8px', // Ensure touch target size
                minWidth: '48px', // Consistent button size
                minHeight: '48px',
              },
            },
          }}
        />
      )}
    </Paper>
  );
};

// Helper for visually hidden class (for accessibility with TableSortLabel)
const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute' as 'absolute', // Ensure 'absolute' is treated as a literal type
  top: 20,
  width: 1,
};

export default ExplanationHistory;
