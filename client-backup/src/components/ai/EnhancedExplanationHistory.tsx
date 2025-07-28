import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  Box, 
  Button, 
  Checkbox, 
  Chip, 
  CircularProgress, 
  Collapse, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Paper, 
  Snackbar, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow, 
  TextField, 
  Typography, 
  useTheme,
  Alert,
  AlertColor,
  Grid,
  InputAdornment,
  TableSortLabel,
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  Input as InputIcon,
  Code as CodeIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';

// Export utilities
const exportToPdf = async (element: HTMLElement, filename: string) => {
  try {
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');
    
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
};

const exportToPng = async (element: HTMLElement, filename: string) => {
  try {
    const { default: html2canvas } = await import('html2canvas');
    
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw new Error('Failed to export to PNG');
  }
};

const exportToCsv = (data: any[], filename: string) => {
  try {
    // Flatten nested objects for CSV
    const flattenObject = (obj: any, prefix = '') => {
      return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? `${prefix}.` : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
          Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
          acc[pre + k] = obj[k];
        }
        return acc;
      }, {} as Record<string, any>);
    };

    const flattenedData = data.map(item => flattenObject(item));
    const headers = Array.from(
      flattenedData.reduce((acc, item) => {
        Object.keys(item).forEach(key => acc.add(key));
        return acc;
      }, new Set<string>())
    );

    const csvContent = [
      headers.join(','),
      ...flattenedData.map(row => 
        headers.map(fieldName => 
          `"${String(row[fieldName] || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export to CSV');
  }
};

const exportToJson = (data: any, filename: string) => {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('Failed to export to JSON');
  }
};
import { formatDistanceToNow } from 'date-fns';
import { AlertColor } from '@mui/material';

// Import types and interfaces
import { 
  ModelExplanation,
  ExtendedModelExplanation,
  ExportFormat,
  ExportOption,
  SnackbarState,
  EnhancedTableHeadProps,
  EnhancedExplanationHistoryProps
} from './types';

// Re-export types for backward compatibility
export type { ModelExplanation, FeatureImportance } from '../../types/ai';

export const EnhancedExplanationHistory = ({
  explanations = [],
  onExport = async (format, explanation) => {
    try {
      const element = document.getElementById(`explanation-${explanation.id}`);
      if (!element) throw new Error('Could not find explanation element');
      
      const baseFilename = `explanation-${explanation.modelType || 'model'}-${explanation.id.substring(0, 8)}`;
      
      switch (format) {
        case 'pdf':
          await exportToPdf(element, baseFilename);
          break;
        case 'png':
          await exportToPng(element, baseFilename);
          break;
        case 'csv':
          exportToCsv([explanation], baseFilename);
          break;
        case 'json':
          exportToJson(explanation, baseFilename);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },
  onDelete = async (id) => {
    // Default implementation
    console.log('Delete explanation:', id);
    return true;
  },
  loading = false,
  error = null,
  onRefresh,
  pageSize = 10,
  totalCount = 0,
  selectedModelType = '',
  availableModelTypes = [],
  onPageChange,
  onSortChange,
  onSearch,
  onCompare,
  onError,
  onSuccess,
  onSelectionChange,
  onModelTypeChange
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof ExtendedModelExplanation>('timestamp');
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExplanation, setSelectedExplanation] = useState<ExtendedModelExplanation | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'info' as AlertColor 
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleRequestSort = (property: keyof ExtendedModelExplanation) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    
    if (onSortChange) {
      onSortChange(property as string, isAsc ? 'desc' : 'asc');
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = explanations.map((n) => n.id);
      setSelected(newSelected);
      if (onSelectionChange) onSelectionChange(newSelected);
      return;
    }
    setSelected([]);
    if (onSelectionChange) onSelectionChange([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    setSelected(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    if (onPageChange) onPageChange(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    if (onPageChange) onPageChange(0, newRowsPerPage);
  };

  const handleExportClick = (explanation: ExtendedModelExplanation) => {
    setSelectedExplanation(explanation);
    setExportDialogOpen(true);
  };

  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      if (!selected.length) {
        setSnackbar({ open: true, message: 'Please select at least one explanation to export', severity: 'warning' });
        return;
      }

      // For single export, use the first selected item
      const explanation = explanations.find(exp => exp.id === selected[0]);
      if (!explanation) return;

      await onExport(format, explanation);
      setSnackbar({ open: true, message: 'Export started successfully', severity: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export';
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
      onError?.(errorMessage);
    }
  }, [selected, explanations, onExport, onError]);

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Filter explanations based on search term
  const filteredExplanations = useMemo(() => {
    if (!searchTerm.trim()) return explanations;
    
    const term = searchTerm.toLowerCase();
    return explanations.filter(explanation => 
      explanation.modelType?.toLowerCase().includes(term) ||
      explanation.id.toLowerCase().includes(term) ||
      explanation.timestamp.toLowerCase().includes(term) ||
      (explanation.modelName && explanation.modelName.toLowerCase().includes(term))
    );
  }, [explanations, searchTerm]);

  // Sort explanations
  const sortedExplanations = useMemo(() => {
    return [...filteredExplanations].sort((a, b) => {
      let comparison = 0;
      
      if (a[orderBy] < b[orderBy]) {
        comparison = -1;
      } else if (a[orderBy] > b[orderBy]) {
        comparison = 1;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  }, [filteredExplanations, order, orderBy]);

  // Pagination
  const paginatedExplanations = useMemo(() => {
    return sortedExplanations.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedExplanations, page, rowsPerPage]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        {/* Search and filter bar */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search explanations..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch?.(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            {selected.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteIcon />}
                onClick={async () => {
                  try {
                    await Promise.all(selected.map(id => onDelete(id)));
                    setSelected([]);
                    setSnackbar({
                      open: true,
                      message: 'Successfully deleted selected explanations',
                      severity: 'success',
                    });
                  } catch (error) {
                    console.error('Delete failed:', error);
                    setSnackbar({
                      open: true,
                      message: 'Failed to delete explanations',
                      severity: 'error',
                    });
                  }
                }}
                disabled={loading}
              >
                Delete Selected
              </Button>
            )}
          </Box>
        </Box>

        {/* Table content would go here */}
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};
