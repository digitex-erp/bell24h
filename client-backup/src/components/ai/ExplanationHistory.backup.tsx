import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  useTheme, 
  Theme, 
  SelectChangeEvent, 
  AlertColor,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  Collapse,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  TablePagination,
  Checkbox,
  Grid,
  Menu,
  Chip
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
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
  PieChart as PieChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  FileCopy as FileCopyIcon,
  InsertChart as InsertChartIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  CompareArrows as CompareArrowsIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  HelpOutline as HelpOutlineIcon,
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Helper function to compare two values for sorting
const compareValues = (a: any, b: any, order: 'asc' | 'desc' = 'asc') => {
  if (a < b) return order === 'asc' ? -1 : 1;
  if (a > b) return order === 'asc' ? 1 : -1;
  return 0;
};
import html2canvas, { Options as Html2CanvasOptions } from 'html2canvas';
import { jsPDF } from 'jspdf';
import { v4 as uuidv4 } from 'uuid';

// Icons
import {
  Code as CodeIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CompareArrows as CompareArrowsIcon,
  GetApp as GetAppIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Input as InputIcon,
  CodeOff as CodeOffIcon
} from '@mui/icons-material';

// Types and Interfaces
type ExportFormat = 'json' | 'csv' | 'pdf' | 'png';

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction?: 'positive' | 'negative' | 'neutral';
}

export interface ModelExplanation {
  id: string;
  modelType: string;
  explainabilityType: 'shap' | 'lime';
  features: FeatureImportance[];
  prediction: number | string;
  timestamp: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
  modelId?: string;
  inputData?: Record<string, unknown>;
  explanation?: Record<string, unknown>;
}

export interface ExtendedModelExplanation extends ModelExplanation {
  expanded?: boolean;
  modelName?: string;
  predictionClass?: string;
  method?: string;
}

interface ExportOption {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
  pro: boolean;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface ExplanationHistoryProps {
  modelId?: string;
  instanceId?: string;
  explanations?: ExtendedModelExplanation[];
  loading?: boolean;
  error?: string | null;
  pageSize?: number;
  totalCount?: number;
  selectedModelType?: string;
  availableModelTypes?: string[];
  onPageChange?: (page: number, pageSize: number) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onSearch?: (term: string) => void;
  onCompare?: (selectedIds: string[]) => void;
  onExport?: (format: ExportFormat, explanation: ModelExplanation) => Promise<void>;
  onDelete?: (explanationId: string) => Promise<boolean>;
  onRefresh?: () => void;
  onError?: (error: string) => void;
  onSuccess?: (data: any) => void;
  onSelectionChange?: (selected: string[]) => void;
  onModelTypeChange?: (modelType: string) => void;
  onExplanationClick?: (explanation: ExtendedModelExplanation) => void;
  onExplanationExpand?: (explanation: ExtendedModelExplanation) => void;
  onExplanationCollapse?: (explanation: ExtendedModelExplanation) => void;
  onExplanationExport?: (format: ExportFormat, explanation: ExtendedModelExplanation) => void;
  onExplanationDelete?: (explanationId: string) => void;
  onExplanationCompare?: (explanation: ExtendedModelExplanation) => void;
  onExplanationSelect?: (explanation: ExtendedModelExplanation) => void;
  onExplanationDeselect?: (explanation: ExtendedModelExplanation) => void;
  maxItems?: number;
  user?: any;
  externalOnModelTypeChange?: (modelType: string) => void;
  externalPageSize?: number;
  externalTotalCount?: number;
  externalLoading?: boolean;
  externalError?: string | null;
  externalSelectedModelType?: string;
  externalOnExplanationClick?: (explanation: ExtendedModelExplanation) => void;
  externalOnExplanationSelect?: (explanation: ExtendedModelExplanation) => void;
  externalOnExplanationDeselect?: (explanation: ExtendedModelExplanation) => void;
  externalOnSelectionChange?: (selected: string[]) => void;
  externalOnSearch?: (term: string) => void;
}

// Format date helper function
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Get the display name for a model type or explanation method
 * @param modelType The model type or explanation method to get the display name for
 * @returns A human-readable display name
 */
const getModelDisplayName = (modelType: string): string => {
  const modelNames: Record<string, string> = {
    // Model types
    'logistic_regression': 'Logistic Regression',
    'random_forest': 'Random Forest',
    'decision_tree': 'Decision Tree',
    'svm': 'Support Vector Machine',
    'neural_network': 'Neural Network',
    'gradient_boosting': 'Gradient Boosting',
    'xgboost': 'XGBoost',
    'lightgbm': 'LightGBM',
    'catboost': 'CatBoost',
    'knn': 'K-Nearest Neighbors',
    'naive_bayes': 'Naive Bayes',
    'linear_regression': 'Linear Regression',
    
    // Explanation methods
    'shap': 'SHAP (SHapley Additive exPlanations)',
    'lime': 'LIME (Local Interpretable Model-agnostic Explanations)',
    'shapley': 'Shapley Values',
    'kernel_shap': 'Kernel SHAP',
    'tree_shap': 'Tree SHAP',
    'deep_shap': 'Deep SHAP',
    'gradient_shap': 'Gradient SHAP',
    'linear_shap': 'Linear SHAP',
    'permutation': 'Permutation Importance',
    'integrated_gradients': 'Integrated Gradients',
    'deep_lift': 'DeepLIFT',
    'lime_tabular': 'LIME for Tabular Data',
    'lime_text': 'LIME for Text Data',
    'lime_image': 'LIME for Image Data',
    'shapley_sampling': 'Shapley Sampling',
    'shapley_taylor': 'Shapley Taylor',
    'shapley_interaction': 'Shapley Interaction',
    'shapley_sampling_interaction': 'Shapley Sampling Interaction',
    'shapley_taylor_interaction': 'Shapley Taylor Interaction',
    'shapley_sampling_importance': 'Shapley Sampling Importance',
    'shapley_taylor_importance': 'Shapley Taylor Importance',
    'shapley_sampling_interaction_importance': 'Shapley Sampling Interaction Importance',
    'shapley_taylor_interaction_importance': 'Shapley Taylor Interaction Importance',
  };
  
  // If not found in the mapping, format the ID by capitalizing words and replacing underscores
  return modelNames[modelType] || 
    modelType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
};

// Helper function to retry failed fetch requests
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    // Wait for 1 second before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    return fetchWithRetry(url, options, retries - 1);
  }
};

// Export options
const exportOptions: ExportOption[] = [
  {
    format: 'json',
    label: 'JSON',
    icon: <CodeIcon />,
    description: 'Export as JSON data',
    pro: false
  },
  {
    format: 'csv',
    label: 'CSV',
    icon: <TableChartIcon />,
    description: 'Export as CSV file',
    pro: false
  },
  {
    format: 'pdf',
    label: 'PDF',
    icon: <PictureAsPdfIcon />,
    description: 'Export as PDF document',
    pro: true
  },
  {
    format: 'png',
    label: 'PNG',
    icon: <ImageIcon />,
    description: 'Export as PNG image',
    pro: true
  }
];

// ARIA labels for accessibility

 * ExplanationHistory component displays a list of model explanations with options to view details,
 * compare, export, and delete explanations.
 */
export const ExplanationHistory: React.FC<ExplanationHistoryProps> = ({
  modelId,
  instanceId,
  explanations: initialExplanations = [],
  loading = false,
  error = null,
  pageSize: externalPageSize = 10,
  totalCount: externalTotalCount = 0,
  selectedModelType: externalSelectedModelType = '',
  availableModelTypes = [],
  onPageChange,
  onSortChange,
  onSearch,
  onCompare,
  onExport,
  onDelete,
  onRefresh,
  onError,
  onSuccess,
  onSelectionChange,
  onModelTypeChange,
  onExplanationClick,
  onExplanationExpand,
  onExplanationCollapse,
  onExplanationExport,
  onExplanationDelete,
  onExplanationCompare,
  onExplanationSelect,
  onExplanationDeselect,
  maxItems = 100,
  user,
  externalOnModelTypeChange,
  externalOnSuccess,
  externalOnError,
  externalOnExplanationClick,
  externalOnExplanationSelect,
  externalOnExplanationDeselect,
  externalOnSelectionChange,
  externalOnSearch,
}) => {
  const theme = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // State for pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(externalPageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedExplanation, setSelectedExplanation] = useState<ExtendedModelExplanation | null>(null);
  const [explanationToDelete, setExplanationToDelete] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [exporting, setExporting] = useState(false);
  const [selectedExportExplanation, setSelectedExportExplanation] = useState<string | null>(null);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedModelType, setSelectedModelType] = useState(externalSelectedModelType);
  const [internalPageSize, setInternalPageSize] = useState(10);
  const [internalSelectedModelType, setInternalSelectedModelType] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const [availableModelTypes, setAvailableModelTypes] = useState<string[]>(availableModelTypes);
  const [explanations, setExplanations] = useState<ExtendedModelExplanation[]>(initialExplanations || []);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort explanations
  const filteredExplanations = useMemo(() => {
    let result = [...explanations];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(exp => 
        exp.modelType.toLowerCase().includes(searchLower) ||
        exp.id.toLowerCase().includes(searchLower) ||
        (exp.explainabilityType && exp.explainabilityType.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply model type filter
    if (modelFilter) {
      result = result.filter(exp => exp.modelType === modelFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return compareValues(new Date(a.timestamp).getTime(), new Date(b.timestamp).getTime(), sortOrder);
      } else if (sortBy === 'modelType') {
        return compareValues(a.modelType, b.modelType, sortOrder);
      }
      return 0;
    });
    
    return result;
  }, [explanations, searchTerm, modelFilter, sortBy, sortOrder]);
  
  // Show snackbar helper
  const showSnackbar = useCallback((message: string, severity: AlertColor = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);
  
  // Handle compare
  const handleCompare = useCallback(() => {
    if (onCompare) {
      onCompare(Array.from(selectedForComparison));
    }
  }, [onCompare, selectedForComparison]);
  
  // Handle export
  const handleExport = useCallback((format: ExportFormat, explanation: ExtendedModelExplanation) => {
    if (!explanation) return;

    const exportElement = document.getElementById(`explanation-${explanation.id}`);
    if (!exportElement) {
      showSnackbar('Could not find explanation content to export', 'error');
      return;
    }

    const filename = `explanation-${explanation.id}-${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'pdf':
        exportToPdf(exportElement, filename);
        break;
      case 'png':
        exportToPng(exportElement, filename);
        break;
      case 'csv':
        // Export as CSV
        const csvHeader = ['Feature', 'Importance', 'Direction'].join(',');
        const csvRows = explanation.features.map((f) => `"${f.feature}",${f.importance},${f.direction || ''}`);
        const csvContent = [csvHeader, ...csvRows].join('\n');
        const csvData = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
        const csvLink = document.createElement('a');
        csvLink.href = csvData;
        csvLink.download = `${filename}.csv`;
        csvLink.click();
        showSnackbar('CSV exported successfully', 'success');
        break;
      case 'json':
        // Export as JSON
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(explanation, null, 2))}`;
        const downloadLink = document.createElement('a');
        downloadLink.href = dataStr;
        downloadLink.download = `${filename}.json`;
        downloadLink.click();
        showSnackbar('JSON exported successfully', 'success');
        break;
      default:
        showSnackbar('Unsupported export format', 'error');
    }
  }, [exportToPdf, exportToPng, showSnackbar]);
  
  // Handle expand/collapse
  const handleExpandClick = useCallback((explanationId: string) => {
    setExpandedExplanationId(prev => 
      prev === explanationId ? null : explanationId
    );
  }, []);
  
  // Handle delete click
  const handleDeleteClick = useCallback((explanationId: string) => {
    setExplanationToDelete(explanationId);
    setDeleteConfirmOpen(true);
  }, []);
  
  // Handle model type change
  const handleModelTypeChange = useCallback((event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setModelFilter(value);
    
    if (onModelTypeChange) {
      onModelTypeChange(value);
    }
    
    if (externalOnModelTypeChange) {
      externalOnModelTypeChange(value);
    }
  }, [onModelTypeChange, externalOnModelTypeChange]);
  
  // Handle sort
  const handleSort = useCallback((property: string) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
    
    if (onSortChange) {
      onSortChange(property, isAsc ? 'desc' : 'asc');
    }
  }, [sortBy, sortOrder, onSortChange]);
  
  // Handle search
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (onSearch) {
      onSearch(value);
    }
    
    if (externalOnSearch) {
      externalOnSearch(value);
    }
  }, [onSearch, externalOnSearch]);
  
  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    
    if (onSearch) {
      onSearch('');
    }
    
    if (externalOnSearch) {
      externalOnSearch('');
    }
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [onSearch, externalOnSearch]);
  
  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    
    if (onSearch) {
      onSearch('');
    }
    
    if (externalOnSearch) {
      externalOnSearch('');
    }
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [onSearch, externalOnSearch]);
  
  // Handle delete confirmation dialog
  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
    setExplanationToDelete(null);
  }, []);
  
  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!explanationToDelete) return;
    
    try {
      setLoading(true);
      
      if (onDelete) {
        const success = await onDelete(explanationToDelete);
        if (success) {
          showSnackbar('Explanation deleted successfully', 'success');
          if (onRefresh) onRefresh();
        } else {
          showSnackbar('Failed to delete explanation', 'error');
        }
      } else if (onExplanationDelete) {
        onExplanationDelete(explanationToDelete);
        showSnackbar('Explanation deleted successfully', 'success');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error deleting explanation:', error);
      showSnackbar(
        `Failed to delete explanation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setExplanationToDelete(null);
    }
  }, [explanationToDelete, onDelete, onExplanationDelete, onRefresh, showSnackbar]);
  
  // Handle export menu open/close
  const handleExportMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, explanationId: string) => {
    setExportAnchorEl(event.currentTarget);
    setSelectedExportExplanation(explanationId);
  }, []);

  const handleExportMenuClose = useCallback(() => {
    setExportAnchorEl(null);
    setSelectedExportExplanation(null);
  }, []);
  
  // Handle export format selection
  const handleExportFormatSelect = useCallback((format: ExportFormat) => {
    if (!selectedExportExplanation) return;
    const explanation = explanations.find(e => e.id === selectedExportExplanation);
    if (explanation) {
      handleExport(format, explanation);
    }
    handleExportMenuClose();
  }, [explanations, handleExport, selectedExportExplanation, handleExportMenuClose]);
  
  // Close snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);
  
  // Toggle selection for comparison
  const toggleSelection = useCallback((explanationId: string) => {
    const newSelection = new Set(selectedForComparison);
    if (newSelection.has(explanationId)) {
      newSelection.delete(explanationId);
    } else {
      newSelection.add(explanationId);
    }
    setSelectedForComparison(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection));
    }
  }, [selectedForComparison, onSelectionChange]);

  // Handle row click
  const handleRowClick = useCallback((explanation: ExtendedModelExplanation) => {
    if (onExplanationClick) {
      onExplanationClick(explanation);
    } else if (externalOnExplanationClick) {
      externalOnExplanationClick(explanation);
    }
    
    // Toggle expand/collapse
    setExpandedExplanationId(prev => 
      prev === explanation.id ? null : explanation.id
    );
  }, [onExplanationClick, externalOnExplanationClick]);

  // Handle page change
  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage, rowsPerPage);
    }
  }, [onPageChange, rowsPerPage]);

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    if (onPageChange) {
      onPageChange(0, newRowsPerPage);
    }
  }, [onPageChange]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!explanationToDelete) return;
    
    try {
      // ... (rest of the code remains the same)
      if (onDelete) {
        const success = await onDelete(explanationToDelete);
        if (success) {
          showSnackbar('Explanation deleted successfully', 'success');
          if (onRefresh) onRefresh();
        } else {
          showSnackbar('Failed to delete explanation', 'error');
        }
      } else if (onExplanationDelete) {
        onExplanationDelete(explanationToDelete);
        showSnackbar('Explanation deleted successfully', 'success');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error deleting explanation:', error);
      showSnackbar(
        `Failed to delete explanation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setDeleteConfirmOpen(false);
      setExplanationToDelete(null);
    }
  }, [explanationToDelete, onDelete, onExplanationDelete, onRefresh, showSnackbar]);

// Render the component
return (
  <div className="explanation-history">
    {/* Search and filter bar */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 300, maxWidth: 600 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search explanations by ID, model type, or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          inputRef={searchInputRef}
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Model Type</InputLabel>
          <Select
            value={modelFilter}
            onChange={handleModelTypeChange}
            label="Model Type"
          >
            <MenuItem value="">All Models</MenuItem>
            {uniqueModelTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleCompare}
          disabled={selectedForComparison.size < 2}
          startIcon={<CompareArrowsIcon />}
        >
          Compare ({selectedForComparison.size})
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportMenuOpen}
          disabled={!selectedExplanation || exporting}
          startIcon={<FileDownloadIcon />}
        >
          Export
        </Button>
        
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={handleExportMenuClose}
          ref={exportMenuRef}
        >
          {exportOptions.map((option) => (
            <MenuItem 
              key={option.format} 
              onClick={() => {
                if (selectedExplanation) {
                  handleExport(option.format as ExportFormat, selectedExplanation);
                }
                handleExportMenuClose();
              }}
              disabled={!selectedExplanation || (option.pro && !user?.isPro)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', py: 0.5 }}>
                <Box sx={{ mr: 1.5, display: 'flex', color: 'primary.main' }}>
                  {option.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{option.label}</Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {option.description}
                  </Typography>
                </Box>
                {option.pro && (
                  <Chip 
                    label="PRO" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ 
                      ml: 1, 
                      height: 18, 
                      fontSize: '0.6rem',
                      '& .MuiChip-label': { px: 0.75 }
                    }} 
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
    
    {/* Explanation list */}
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={
                  selectedForComparison.size > 0 && 
                  selectedForComparison.size < filteredExplanations.length
                }
                checked={
                  filteredExplanations.length > 0 && 
                  selectedForComparison.size === filteredExplanations.length
                }
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.target.checked) {
                    setSelectedForComparison(new Set(filteredExplanations.map(e => e.id)));
                  } else {
                    setSelectedForComparison(new Set());
                  }
                }}
              />
            </TableCell>
            <TableCell 
              onClick={() => handleSort('modelType')}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Model Type</span>
                {sortBy === 'modelType' && (
                  <Box component="span" sx={{ ml: 0.5, display: 'flex', flexDirection: 'column' }}>
                    <ExpandLessIcon 
                      fontSize="small" 
                      sx={{ 
                        opacity: sortOrder === 'asc' ? 1 : 0.3,
                        mb: -0.5,
                        fontSize: '1rem'
                      }} 
                    />
                    <ExpandMoreIcon 
                      fontSize="small" 
                      sx={{ 
                        opacity: sortOrder === 'desc' ? 1 : 0.3,
                        mt: -0.5,
                        fontSize: '1rem'
                      }} 
                    />
                  </Box>
                )}
              </Box>
            </TableCell>
            <TableCell>Prediction</TableCell>
            <TableCell 
              onClick={() => handleSort('timestamp')}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Timestamp</span>
                {sortBy === 'timestamp' && (
                  <Box component="span" sx={{ ml: 0.5, display: 'flex', flexDirection: 'column' }}>
                    <ExpandLessIcon 
                      fontSize="small" 
                      sx={{ 
                        opacity: sortOrder === 'asc' ? 1 : 0.3,
                        mb: -0.5,
                        fontSize: '1rem'
                      }} 
                    />
                    <ExpandMoreIcon 
                      fontSize="small" 
                      sx={{ 
                        opacity: sortOrder === 'desc' ? 1 : 0.3,
                        mt: -0.5,
                        fontSize: '1rem'
                      }} 
                    />
                  </Box>
                )}
              </Box>
            </TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredExplanations
            .slice(page * pageSize, page * pageSize + pageSize)
            .map((explanation) => (
              <React.Fragment key={explanation.id}>
                <TableRow
                  hover
                  onClick={() => handleRowClick(explanation)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: selectedForComparison.has(explanation.id) ? 'action.selected' : 'inherit'
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedForComparison.has(explanation.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleComparison(explanation.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: explanation.explainabilityType === 'shap' ? 'primary.main' : 'secondary.main',
                        mr: 1.5,
                        flexShrink: 0
                      }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {getModelDisplayName(explanation.modelType)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip 
                            label={explanation.explainabilityType.toUpperCase()}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              height: 18, 
                              fontSize: '0.65rem',
                              '& .MuiChip-label': { px: 0.75 }
                            }}
                          />
                          {explanation.confidence !== undefined && (
                            <Chip 
                              label={`Confidence: ${(explanation.confidence * 100).toFixed(1)}%`}
                              size="small"
                              variant="outlined"
                              color={explanation.confidence > 0.7 ? 'success' : 
                                     explanation.confidence > 0.4 ? 'warning' : 'error'}
                              sx={{ 
                                height: 18, 
                                fontSize: '0.65rem',
                                '& .MuiChip-label': { px: 0.75 }
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 
                        typeof explanation.prediction === 'number' ? 
                        (explanation.prediction > 0.5 ? 'success.light' : 'error.light') :
                        (explanation.prediction === '1' ? 'success.light' : 'error.light'),
                      color: theme.palette.getContrastText(
                        theme.palette[
                          typeof explanation.prediction === 'number' ? 
                          (explanation.prediction > 0.5 ? 'success' : 'error') :
                          (explanation.prediction === '1' ? 'success' : 'error')
                        ].light
                      )
                    }}>
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'currentColor',
                          mr: 1,
                          flexShrink: 0
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {typeof explanation.prediction === 'number' 
                          ? `${(explanation.prediction * 100).toFixed(1)}% ${explanation.prediction > 0.5 ? 'Positive' : 'Negative'}`
                          : explanation.prediction === '1' ? 'Positive' : 'Negative'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip 
                      title={new Date(explanation.timestamp).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                      placement="top"
                      arrow
                    >
                      <Typography variant="body2" noWrap>
                        {formatDistanceToNow(new Date(explanation.timestamp), { addSuffix: true })}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Tooltip title={expandedExplanationId === explanation.id ? "Collapse details" : "View details"}>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandClick(explanation);
                          }}
                          color={expandedExplanationId === explanation.id ? 'primary' : 'default'}
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          {expandedExplanationId === explanation.id ? 
                            <ExpandLessIcon fontSize="small" /> : 
                            <ExpandMoreIcon fontSize="small" />
                          }
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExplanation(explanation);
                            handleExportMenuOpen(e);
                          }}
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                              color: 'primary.main'
                            }
                          }}
                        >
                          <FileDownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(explanation.id);
                          }}
                          color="error"
                          sx={{
                            '&:hover': {
                              bgcolor: 'error.light',
                              color: 'error.contrastText'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ padding: 0 }} colSpan={5}>
                    <Collapse 
                      in={expandedExplanationId === explanation.id} 
                      timeout="auto" 
                      unmountOnExit
                      sx={{
                        '& .MuiCollapse-wrapperInner': {
                          borderTop: `1px solid ${theme.palette.divider}`,
                          bgcolor: 'background.paper'
                        }
                      }}
                    >
                      <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <InfoIcon color="primary" sx={{ mr: 1, fontSize: '1rem' }} />
                              Model Information
                            </Typography>
                            <Box sx={{ 
                              bgcolor: 'background.default', 
                              p: 2, 
                              borderRadius: 1,
                              mb: 2
                            }}>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    Model Type
                                  </Typography>
                                  <Typography variant="body2">
                                    {getModelDisplayName(explanation.modelType)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    Explanation Method
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box 
                                      sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        borderRadius: '50%', 
                                        bgcolor: explanation.explainabilityType === 'shap' ? 'primary.main' : 'secondary.main',
                                        mr: 1
                                      }} 
                                    />
                                    <Typography variant="body2">
                                      {explanation.explainabilityType.toUpperCase()}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    Timestamp
                                  </Typography>
                                  <Typography variant="body2">
                                    {new Date(explanation.timestamp).toLocaleString()}
                                  </Typography>
                                </Grid>
                                {explanation.confidence !== undefined && (
                                  <Grid item xs={6}>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                      Confidence
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ width: '100%', maxWidth: 100, mr: 1 }}>
                                        <Box 
                                          sx={{ 
                                            height: 6, 
                                            borderRadius: 3, 
                                            bgcolor: 'divider',
                                            overflow: 'hidden'
                                          }}
                                        >
                                          <Box 
                                            sx={{ 
                                              height: '100%', 
                                              width: `${explanation.confidence * 100}%`,
                                              bgcolor: 
                                                explanation.confidence > 0.7 ? 'success.main' : 
                                                explanation.confidence > 0.4 ? 'warning.main' : 'error.main'
                                            }}
                                          />
                                        </Box>
                                      </Box>
                                      <Typography variant="body2">
                                        {(explanation.confidence * 100).toFixed(1)}%
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                              </Grid>
                              {explanation.metadata?.description && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                                  <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                    Description
                                  </Typography>
                                  <Typography variant="body2">
                                    {explanation.metadata.description}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <AssessmentIcon color="primary" sx={{ mr: 1, fontSize: '1rem' }} />
                              Feature Importance
                            </Typography>
                            <Box sx={{ 
                              bgcolor: 'background.default', 
                              p: 2, 
                              borderRadius: 1,
                              maxHeight: 300,
                              overflow: 'auto'
                            }}>
                              {explanation.features.length > 0 ? (
                                <>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" color="textSecondary">
                                      Feature
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      Importance
                                    </Typography>
                                  </Box>
                                  {explanation.features
                                    .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
                                    .map((feature, index) => (
                                      <Box 
                                        key={index} 
                                        sx={{ 
                                          mb: 1.5,
                                          '&:last-child': { mb: 0 }
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                          <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>
                                            {feature.feature}
                                          </Typography>
                                          <Typography 
                                            variant="body2" 
                                            color={feature.importance > 0 ? 'success.main' : 'error.main'}
                                            sx={{ fontWeight: 500 }}
                                          >
                                            {feature.importance > 0 ? '+' : ''}{feature.importance.toFixed(4)}
                                          </Typography>
                                        </Box>
                                        <Box 
                                          sx={{ 
                                            height: 4, 
                                            borderRadius: 2, 
                                            bgcolor: 'divider',
                                            overflow: 'hidden'
                                          }}
                                        >
                                          <Box 
                                            sx={{ 
                                              height: '100%', 
                                              width: `${Math.min(Math.abs(feature.importance) * 100, 100)}%`,
                                              bgcolor: feature.importance > 0 ? 'success.main' : 'error.main',
                                              ml: feature.importance < 0 ? 'auto' : 0,
                                              mr: feature.importance > 0 ? 'auto' : 0
                                            }}
                                          />
                                        </Box>
                                      </Box>
                                    ))}
                                </>
                              ) : (
                                <Box sx={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  py: 3,
                                  color: 'text.secondary'
                                }}>
                                  <InfoIcon fontSize="small" sx={{ mb: 1, opacity: 0.7 }} />
                                  <Typography variant="body2">
                                    No feature importance data available
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                          {explanation.inputData && Object.keys(explanation.inputData).length > 0 && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <InputIcon color="primary" sx={{ mr: 1, fontSize: '1rem' }} />
                                Input Data
                              </Typography>
                              <Box sx={{ 
                                bgcolor: 'background.default', 
                                p: 2, 
                                borderRadius: 1,
                                maxHeight: 200,
                                overflow: 'auto'
                              }}>
                                <Grid container spacing={2}>
                                  {Object.entries(explanation.inputData).map(([key, value]) => (
                                    <Grid item xs={12} sm={6} md={4} key={key}>
                                      <Typography variant="caption" color="textSecondary" display="block">
                                        {key}
                                      </Typography>
                                      <Typography variant="body2" noWrap>
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                      </Typography>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          
          {filteredExplanations.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <InfoIcon color="disabled" sx={{ fontSize: 40, opacity: 0.5 }} />
                  <Box>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No explanations found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm || modelFilter 
                        ? 'Try adjusting your search or filters.' 
                        : 'There are no explanations to display.'}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
          )}
          
          {loading && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body1" color="textSecondary">
                    Loading explanations...
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
    
    {/* Pagination */}
    {filteredExplanations.length > 0 && (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 2,
        px: 1
      }}>
        <Typography variant="body2" color="textSecondary">
          Showing {Math.min(page * pageSize + 1, totalCount)}-{Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
        </Typography>
        <Box>
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Rows per page</InputLabel>
            <Select
              value={pageSize}
              onChange={handleChangeRowsPerPage}
              label="Rows per page"
              size="small"
            >
              {[5, 10, 25, 50].map((size) => (
                <MenuItem key={size} value={size}>
                  {size} per page
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination 
            count={Math.ceil(totalCount / pageSize)} 
            page={page + 1}
            onChange={(e, value) => handlePageChange(e, value - 1)}
            color="primary"
            showFirstButton 
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            size="medium"
            sx={{
              '& .MuiPaginationItem-root': {
                minWidth: 32,
                height: 32,
                margin: '0 2px',
                '&.Mui-selected': {
                  fontWeight: 600
                }
              }
            }}
          />
        </Box>
      </Box>
    )}
    
    {/* Delete confirmation dialog */}
    <Dialog
      open={deleteConfirmOpen}
      onClose={() => setDeleteConfirmOpen(false)}
    >
      <DialogTitle>Delete Explanation</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this explanation? This action cannot be undone.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
        <Button 
          onClick={confirmDelete} 
          color="error"
          variant="contained"
          disabled={!explanationToDelete}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
    >
      <Alert 
        onClose={handleCloseSnackbar} 
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </Box>
);

// Set default props with TypeScript default values
ExplanationHistory.defaultProps = {
  explanations: [],
  loading: false,
  error: null,
  pageSize: 10,
  totalCount: 0,
  selectedModelType: 'all',
  availableModelTypes: [],
  externalPageSize: 10,
  externalTotalCount: 0,
  externalLoading: false,
  externalError: null,
};

export default ExplanationHistory;