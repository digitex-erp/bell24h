import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  TablePagination,
  TableSortLabel,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Refresh as RefreshIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { format } from 'date-fns';

interface Explanation {
  id: string;
  timestamp: string;
  model: string;
  confidence: number;
  summary: string;
  features: Record<string, number>;
}

interface ExplanationHistoryProps {
  onViewExplanation: (explanation: Explanation) => void;
  refreshInterval?: number;
}

export const ExplanationHistory: React.FC<ExplanationHistoryProps> = ({
  onViewExplanation,
  refreshInterval = 30000
}) => {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Explanation>('timestamp');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const loadingRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const fetchExplanations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        sortBy: orderBy,
        sortOrder: order
      });

      const response = await fetch(`/api/explanations?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch explanations');
      }

      const data = await response.json();
      setExplanations(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanations();
    const interval = setInterval(fetchExplanations, refreshInterval);
    return () => clearInterval(interval);
  }, [page, rowsPerPage, orderBy, order, refreshInterval]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property: keyof Explanation) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRefresh = () => {
    fetchExplanations();
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
        <IconButton onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Explanation History</Typography>
        <IconButton onClick={handleRefresh} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <TableContainer component={Paper} ref={tableRef}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'timestamp'}
                  direction={orderBy === 'timestamp' ? order : 'asc'}
                  onClick={() => handleSort('timestamp')}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'model'}
                  direction={orderBy === 'model' ? order : 'asc'}
                  onClick={() => handleSort('model')}
                >
                  Model
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'confidence'}
                  direction={orderBy === 'confidence' ? order : 'asc'}
                  onClick={() => handleSort('confidence')}
                >
                  Confidence
                </TableSortLabel>
              </TableCell>
              <TableCell>Summary</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : explanations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No explanations available
                </TableCell>
              </TableRow>
            ) : (
              explanations.map((explanation) => (
                <TableRow key={explanation.id}>
                  <TableCell>
                    {format(new Date(explanation.timestamp), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{explanation.model}</TableCell>
                  <TableCell>{(explanation.confidence * 100).toFixed(1)}%</TableCell>
                  <TableCell>{explanation.summary}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => onViewExplanation(explanation)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={-1}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};