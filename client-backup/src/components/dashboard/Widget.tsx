import React from 'react';
import { WidgetConfig } from '../../types/dashboard';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Stack,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Delete, Settings, Refresh, BarChart, PieChart, LineChart } from '@mui/icons-material';

interface WidgetProps {
  widget: WidgetConfig;
  onRemove: () => void;
  onUpdate: (updates: Partial<WidgetConfig>) => void;
}

const Widget: React.FC<WidgetProps> = ({ widget, onRemove, onUpdate }) => {
  const handleDelete = () => {
    onRemove();
  };

  const handleRefresh = () => {
    onUpdate({
      settings: {
        ...widget.settings,
        lastRefresh: new Date(),
      },
    });
  };

  const handleVisualizationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const visualizationType = event.target.value as string;
    onUpdate({
      visualization: {
        ...widget.visualization,
        type: visualizationType as any,
      },
    });
  };

  const handleAutoRefreshChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      settings: {
        ...widget.settings,
        autoRefresh: event.target.checked,
      },
    });
  };

  const handleRefreshIntervalChange = (_: any, value: number | number[]) => {
    onUpdate({
      settings: {
        ...widget.settings,
        refreshInterval: value as number,
      },
    });
  };

  const visualizationIcon = () => {
    switch (widget.visualization.type) {
      case 'bar':
        return <BarChart />;
      case 'pie':
        return <PieChart />;
      case 'line':
        return <LineChart />;
      default:
        return <BarChart />;
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            {widget.title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton onClick={() => onUpdate({ settings: { ...widget.settings } })}>
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={handleDelete} color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Box sx={{ height: 200 }}>
          {/* Placeholder for visualization */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: 'grey.100',
              borderRadius: 1,
            }}
          >
            {visualizationIcon()}
          </Box>
        </Box>
      </CardContent>

      <CardActions>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="visualization-label">Visualization</InputLabel>
          <Select
            labelId="visualization-label"
            value={widget.visualization.type}
            onChange={handleVisualizationChange}
            label="Visualization"
          >
            <MenuItem value="bar">Bar Chart</MenuItem>
            <MenuItem value="pie">Pie Chart</MenuItem>
            <MenuItem value="line">Line Chart</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={widget.settings.autoRefresh}
              onChange={handleAutoRefreshChange}
            />
          }
          label="Auto Refresh"
        />

        {widget.settings.autoRefresh && (
          <Slider
            value={widget.settings.refreshInterval}
            onChange={handleRefreshIntervalChange}
            min={30}
            max={3600}
            step={30}
            valueLabelDisplay="auto"
            marks={[
              { value: 30, label: '30s' },
              { value: 300, label: '5m' },
              { value: 900, label: '15m' },
              { value: 1800, label: '30m' },
              { value: 3600, label: '1h' },
            ]}
          />
        )}
      </CardActions>
    </Card>
  );
};

export default Widget;
