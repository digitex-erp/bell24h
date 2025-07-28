export interface FeatureImportance {
  feature: string;
  importance: number;
  direction?: 'positive' | 'negative' | 'neutral';
  value?: number | string;
}

export interface ModelExplanation {
  id: string;
  modelType: string;
  explainabilityType: 'shap' | 'lime' | string;
  features: FeatureImportance[];
  prediction: number | string;
  timestamp: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
  modelId?: string;
  inputData?: Record<string, unknown> | null;
  explanation?: Record<string, unknown> | null;
  modelName?: string;
  predictionClass?: string;
  method?: string;
}

export type ExportFormat = 'pdf' | 'png' | 'csv' | 'json';

export interface ExtendedModelExplanation extends ModelExplanation {
  expanded?: boolean;
}

export interface ExplanationHistoryProps {
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
}
