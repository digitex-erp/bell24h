import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MetricAlert } from '../../hooks/use-procurement-context';
import { AlertTriangle, AlertCircle, Info, X, BellRing } from 'lucide-react';

interface MetricAlertsListProps {
  alerts: MetricAlert[];
  onDismiss?: (alertId: string) => void;
  maxItems?: number;
  showEmpty?: boolean;
  className?: string;
}

/**
 * Component for displaying a list of metric alerts with severity indicators
 */
export const MetricAlertsList: React.FC<MetricAlertsListProps> = ({
  alerts,
  onDismiss,
  maxItems = 5,
  showEmpty = true,
  className = ''
}) => {
  // Filter to show only triggered alerts and sort by severity
  const triggeredAlerts = alerts
    .filter(alert => alert.triggered)
    .sort((a, b) => {
      // Sort by severity first (critical > warning > info)
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      
      // If same severity, sort by most recent trigger time
      if (severityDiff === 0 && a.lastTriggeredAt && b.lastTriggeredAt) {
        return b.lastTriggeredAt.getTime() - a.lastTriggeredAt.getTime();
      }
      
      return severityDiff;
    })
    .slice(0, maxItems);

  // Return null or empty state if no alerts and showEmpty is false
  if (triggeredAlerts.length === 0 && !showEmpty) {
    return null;
  }

  // Get the icon and background color based on alert severity
  const getSeverityStyles = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return {
          icon: <AlertCircle className="h-5 w-5 text-white" />,
          bgColor: 'bg-red-600',
          textColor: 'text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-white" />,
          bgColor: 'bg-amber-500',
          textColor: 'text-white'
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5 text-white" />,
          bgColor: 'bg-blue-600',
          textColor: 'text-white'
        };
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <BellRing className="h-5 w-5 mr-2" />
          Metric Alerts
        </h3>
        {triggeredAlerts.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            {triggeredAlerts.length} active
          </span>
        )}
      </div>

      {triggeredAlerts.length === 0 && showEmpty ? (
        <div className="text-center py-6 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">No active alerts at this time</p>
        </div>
      ) : (
        <div className="space-y-2">
          {triggeredAlerts.map(alert => {
            const { icon, bgColor, textColor } = getSeverityStyles(alert.severity);
            
            return (
              <div
                key={alert.id}
                className="flex items-start p-3 rounded-md border bg-card shadow-sm"
              >
                <div className={`p-2 rounded-full ${bgColor} mr-3 flex-shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.metricName} • Threshold: {alert.threshold}
                    {alert.lastTriggeredAt && (
                      <> • Triggered {formatDistanceToNow(alert.lastTriggeredAt, { addSuffix: true })}</>
                    )}
                  </p>
                </div>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="ml-2 p-1 text-muted-foreground hover:text-foreground rounded-full"
                    aria-label="Dismiss alert"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MetricAlertsList;