import React, { useState } from 'react';
import { 
  useProcurementContext, 
  BusinessMetric, 
  MetricAlert 
} from '../../hooks/use-procurement-context';
import { MetricHistoryChart } from './MetricHistoryChart';
import { MetricAlertsList } from './MetricAlertsList';
import { MetricRecommendations } from './MetricRecommendations';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRight, 
  Edit, 
  Trash2, 
  BellPlus, 
  BarChart4 
} from 'lucide-react';

interface MetricDetailViewProps {
  metricId: string;
  onClose?: () => void;
  onEdit?: (metricId: string) => void;
  onCreateAlert?: (metricId: string, metricName: string) => void;
  onDeleteMetric?: (metricId: string) => void;
  className?: string;
}

/**
 * Comprehensive view of a single metric including history, alerts and recommendations
 */
export const MetricDetailView: React.FC<MetricDetailViewProps> = ({
  metricId,
  onClose,
  onEdit,
  onCreateAlert,
  onDeleteMetric,
  className = ''
}) => {
  const { 
    keyMetrics, 
    metricAlerts, 
    deleteAlert, 
    updateMetricValue, 
    getRecommendationsForMetric,
    generateRecommendation
  } = useProcurementContext();
  
  const [isUpdatingValue, setIsUpdatingValue] = useState(false);
  const [newValue, setNewValue] = useState<string>('');
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);

  // Find the metric by ID
  const metric = keyMetrics.find(m => m.id === metricId);
  if (!metric) return null;

  // Get alerts for this metric
  const relevantAlerts = metricAlerts.filter(alert => alert.metricId === metricId);
  
  // Get recommendations for this metric
  const recommendations = getRecommendationsForMetric(metricId);

  // Handle generating a new recommendation
  const handleGenerateRecommendation = async () => {
    if (isGeneratingRecommendation) return;
    
    setIsGeneratingRecommendation(true);
    try {
      await generateRecommendation(metricId);
    } catch (error) {
      console.error('Error generating recommendation:', error);
    } finally {
      setIsGeneratingRecommendation(false);
    }
  };

  // Handle updating the metric value
  const handleUpdateValue = () => {
    const parsedValue = parseFloat(newValue);
    if (!isNaN(parsedValue)) {
      updateMetricValue(metricId, parsedValue);
      setNewValue('');
      setIsUpdatingValue(false);
    }
  };

  // Get the trend icon based on the metric trend
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'stable':
      default:
        return <ArrowRight className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* Header with metric info */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            {metric.name}
            {metric.isImportant && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                High Priority
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {metric.category || 'General'} • Updated {metric.lastUpdated ? new Date(metric.lastUpdated).toLocaleDateString() : 'recently'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {onEdit && (
            <button 
              onClick={() => onEdit(metricId)}
              className="p-1.5 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-md"
              aria-label="Edit metric"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          
          {onCreateAlert && (
            <button 
              onClick={() => onCreateAlert(metricId, metric.name)}
              className="p-1.5 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-md"
              aria-label="Create alert"
            >
              <BellPlus className="h-4 w-4" />
            </button>
          )}
          
          {onDeleteMetric && (
            <button 
              onClick={() => onDeleteMetric(metricId)}
              className="p-1.5 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-md"
              aria-label="Delete metric"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Current value and update form */}
      <div className="p-4 bg-card rounded-md border flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 bg-primary/10 rounded-full mr-3">
            <BarChart4 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Current Value</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                {metric.value}{metric.unit}
              </span>
              <span className="ml-2 flex items-center">
                {getTrendIcon()}
              </span>
            </div>
            {metric.targetValue !== null && (
              <p className="text-xs text-muted-foreground">
                Target: {metric.targetValue}{metric.unit}
              </p>
            )}
          </div>
        </div>
        
        {/* Update value form */}
        {isUpdatingValue ? (
          <div className="flex items-center mt-3 sm:mt-0">
            <input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-24 px-2 py-1 border rounded-md mr-2"
              placeholder="New value"
            />
            <button
              onClick={handleUpdateValue}
              className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md"
            >
              Update
            </button>
            <button
              onClick={() => setIsUpdatingValue(false)}
              className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-md ml-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsUpdatingValue(true)}
            className="px-3 py-1 bg-muted hover:bg-muted/80 text-sm rounded-md mt-3 sm:mt-0"
          >
            Update Value
          </button>
        )}
      </div>
      
      {/* Metric history chart */}
      <div className="p-4 bg-card rounded-md border">
        <h3 className="text-lg font-medium mb-3">Historical Trend</h3>
        <MetricHistoryChart metric={metric} height={250} />
      </div>
      
      {/* Metric alerts */}
      <div className="p-4 bg-card rounded-md border">
        <MetricAlertsList 
          alerts={relevantAlerts} 
          onDismiss={deleteAlert}
          showEmpty={true}
        />
      </div>
      
      {/* AI Recommendations */}
      <div className="p-4 bg-card rounded-md border">
        <MetricRecommendations 
          metric={metric}
          recommendations={recommendations}
          onGenerateRecommendation={async (metricId) => {
            await handleGenerateRecommendation();
          }}
        />
      </div>
    </div>
  );
};

export default MetricDetailView;