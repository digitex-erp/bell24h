// Type definitions for the trend snapshot feature

export interface IndustryTrendSnapshotData {
  industry: string;
  summary: string;
  keyTrends: Array<{
    title: string;
    description: string;
    impact: "low" | "medium" | "high";
  }>;
  marketSizeData: {
    currentSize: string;
    projectedGrowth: string;
    cagr: string;
  };
  topPlayers: Array<{
    name: string;
    strengthAreas: string[];
    marketShare?: string;
  }>;
  emergingTechnologies: Array<{
    name: string;
    description: string;
    adoptionStage: "early" | "growing" | "mature";
    potentialImpact: "low" | "medium" | "high";
  }>;
  regionalInsights: Record<string, string>;
  challenges: string[];
  opportunities: string[];
  sourcesUsed?: string[];
}

export interface IndustryComparisonData {
  industries: string[];
  comparisonDate: string;
  marketSizeComparison: Record<string, string>;
  growthRateComparison: Record<string, string>;
  keyPlayerOverlap: Array<{
    companyName: string;
    industries: string[];
    dominanceScore: number;
  }>;
  technologyTrends: Record<string, string[]>;
  opportunityMatrix: Record<string, Array<{
    opportunity: string;
    potentialScore: number;
    timeFrame: string;
  }>>;
  challengeMatrix: Record<string, string[]>;
  summaryInsights: string;
}

export interface ReportTemplateConfiguration {
  includedSections: string[];
  chartTypes: Record<string, string>;
  brandingOptions?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    companyName?: string;
    contactInfo?: string;
  };
  exportOptions: {
    includeTableOfContents: boolean;
    includeCoverPage: boolean;
    includeExecSummary: boolean;
    includeAppendix: boolean;
  };
  displayPreferences: {
    chartStyle: "minimal" | "detailed" | "interactive";
    dataVisualization: "charts" | "tables" | "both";
    colorScheme: "default" | "high-contrast" | "print-friendly" | "brand";
  };
}

export interface ReportTemplate {
  id: number;
  userId: number;
  name: string;
  description: string;
  configuration: ReportTemplateConfiguration;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SnapshotComment {
  id: number;
  snapshotId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentCommentId?: number;
}

export interface SavedFilter {
  id: number;
  userId: number;
  name: string;
  filters: {
    industries: string[];
    regions: string[];
    timeframes: string[];
    templateId?: number;
    visualizationPreferences?: {
      chartTypes: Record<string, string>;
      colorScheme: string;
    };
    sortBy?: string;
    includeHistorical?: boolean;
  };
  createdAt: string;
}

export interface IndustrySnapshot {
  id: number;
  userId: number;
  industry: string;
  region?: string;
  timeframe?: string;
  snapshotData: IndustryTrendSnapshotData;
  generatedAt: string;
  sharedCount: number;
  lastSharedAt?: string;
  templateId?: number;
  customBranding?: string;
  format: string;
  isFavorite: boolean;
  visibility: string;
  tags?: string[];
  commentCount: number;
  lastEditedAt?: string;
  lastEditedBy?: number;
  version: number;
}