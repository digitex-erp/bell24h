import { ModelExplanation } from '../../types/ai';
import { AlertColor } from '@mui/material';

// Extended interface for table functionality
export interface ExtendedModelExplanation extends ModelExplanation {
  expanded?: boolean;
}

export type ExportFormat = 'json' | 'csv' | 'pdf' | 'png';

export interface ExportOption {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
  pro: boolean;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface EnhancedTableHeadProps {
  numSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  onRequestSort: (property: keyof ExtendedModelExplanation) => void;
}

export interface EnhancedExplanationHistoryProps {
  explanations: ModelExplanation[];
  onExport: (format: ExportFormat, explanation: ModelExplanation) => Promise<void>;
  onDelete: (id: string) => Promise<boolean>;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  modelId?: string;
  instanceId?: string;
  selectedModelType?: string;
  availableModelTypes?: string[];
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number, rowsPerPage: number) => void;
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  onCompare?: (ids: string[]) => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
  onSelectionChange?: (selected: string[]) => void;
  onModelTypeChange?: (modelType: string) => void;
}
