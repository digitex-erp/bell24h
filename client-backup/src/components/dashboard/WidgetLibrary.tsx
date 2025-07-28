import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Box,
} from '@mui/material';
import {
  Add,
  BarChart,
  PieChart,
  LineChart,
  TableChart,
  Map,
  Description,
} from '@mui/icons-material';
import { WidgetConfig } from '../../types/dashboard';

interface WidgetLibraryProps {
  onAddWidget: (widget: WidgetConfig) => void;
}

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ onAddWidget }) => {
  const defaultWidgets: WidgetConfig[] = [
    {
      id: 'rfq-summary',
      type: 'metric',
      title: 'RFQ Summary',
      dataSources: [
        {
          type: 'api',
          endpoint: '/api/metrics/rfq-summary',
        },
      ],
      visualization: {
        type: 'kpi',
        options: {
          showTrend: true,
          showTargets: true,
        },
      },
      layout: {
        row: 0,
        column: 0,
        width: 2,
        height: 1,
      },
      settings: {
        refreshInterval: 300,
        autoRefresh: true,
        theme: 'light',
        animation: true,
        tooltips: true,
      },
    },
    {
      id: 'supplier-performance',
      type: 'chart',
      title: 'Supplier Performance',
      dataSources: [
        {
          type: 'api',
          endpoint: '/api/metrics/supplier-performance',
        },
      ],
      visualization: {
        type: 'bar',
        options: {
          showLegend: true,
          showTooltip: true,
        },
      },
      layout: {
        row: 0,
        column: 2,
        width: 2,
        height: 2,
      },
      settings: {
        refreshInterval: 600,
        autoRefresh: true,
        theme: 'light',
        animation: true,
        tooltips: true,
      },
    },
    {
      id: 'response-times',
      type: 'chart',
      title: 'Response Times',
      dataSources: [
        {
          type: 'api',
          endpoint: '/api/metrics/response-times',
        },
      ],
      visualization: {
        type: 'line',
        options: {
          showTrendLine: true,
          showAverage: true,
        },
      },
      layout: {
        row: 1,
        column: 0,
        width: 2,
        height: 2,
      },
      settings: {
        refreshInterval: 900,
        autoRefresh: true,
        theme: 'light',
        animation: true,
        tooltips: true,
      },
    },
    {
      id: 'supplier-table',
      type: 'table',
      title: 'Supplier Table',
      dataSources: [
        {
          type: 'api',
          endpoint: '/api/suppliers',
        },
      ],
      visualization: {
        type: 'table',
        options: {
          sortable: true,
          filterable: true,
        },
      },
      layout: {
        row: 1,
        column: 2,
        width: 2,
        height: 2,
      },
      settings: {
        refreshInterval: 1200,
        autoRefresh: true,
        theme: 'light',
        animation: false,
        tooltips: true,
      },
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Available Widgets
      </Typography>
      <List>
        {defaultWidgets.map((widget) => (
          <ListItem
            key={widget.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => onAddWidget(widget)}>
                <Add />
              </IconButton>
            }
          >
            <ListItemIcon>
              {widget.visualization.type === 'bar' && <BarChart />}
              {widget.visualization.type === 'pie' && <PieChart />}
              {widget.visualization.type === 'line' && <LineChart />}
              {widget.visualization.type === 'table' && <TableChart />}
              {widget.visualization.type === 'map' && <Map />}
              {widget.visualization.type === 'kpi' && <Description />}
            </ListItemIcon>
            <ListItemText
              primary={widget.title}
              secondary={widget.visualization.type}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default WidgetLibrary;
