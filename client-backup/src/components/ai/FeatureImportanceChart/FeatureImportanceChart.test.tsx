import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeatureImportanceChart from './FeatureImportanceChart';
import { useTheme } from '@mui/material/styles';

// Mock MUI's useTheme
jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: jest.fn(() => ({
    palette: {
      success: { main: '#4caf50' }, // Mock success color
      error: { main: '#f44336' },   // Mock error color
    },
  })),
}));

// Mock Recharts components to simplify testing and focus on our component's logic
const mockResponsiveContainer = jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>);
const mockBarChart = jest.fn(({ children }) => <div data-testid="bar-chart">{children}</div>);
const mockBar = jest.fn(({ children }) => <div data-testid="bar">{children}</div>);
const mockXAxis = jest.fn(() => <div data-testid="x-axis"></div>);
const mockYAxis = jest.fn(() => <div data-testid="y-axis"></div>);
const mockCartesianGrid = jest.fn(() => <div data-testid="cartesian-grid"></div>);
const mockTooltip = jest.fn(() => <div data-testid="tooltip"></div>);
const mockLegend = jest.fn(() => <div data-testid="legend"></div>);
const mockCell = jest.fn(() => <div data-testid="cell"></div>);

jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: (props: any) => mockResponsiveContainer(props),
  BarChart: (props: any) => mockBarChart(props),
  Bar: (props: any) => mockBar(props),
  XAxis: (props: any) => mockXAxis(props),
  YAxis: (props: any) => mockYAxis(props),
  CartesianGrid: (props: any) => mockCartesianGrid(props),
  Tooltip: (props: any) => mockTooltip(props),
  Legend: (props: any) => mockLegend(props),
  Cell: (props: any) => mockCell(props),
}));

const mockFeatures = [
  { name: 'Feature A', value: 0.5, originalValue: 'ValA' },
  { name: 'Feature B', value: -0.3, originalValue: 'ValB' },
  { name: 'Feature C', value: 0.7, originalValue: 'ValC' },
];

describe('FeatureImportanceChart', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockResponsiveContainer.mockClear();
    mockBarChart.mockClear();
    mockBar.mockClear();
    mockXAxis.mockClear();
    mockYAxis.mockClear();
    mockCartesianGrid.mockClear();
    mockTooltip.mockClear();
    mockLegend.mockClear();
    mockCell.mockClear();
    (useTheme as jest.Mock).mockClear();
  });

  it('renders the title', () => {
    render(<FeatureImportanceChart features={mockFeatures} title="Custom Chart Title" />);
    expect(screen.getByText('Custom Chart Title')).toBeInTheDocument();
  });

  it('renders default title if none provided', () => {
    render(<FeatureImportanceChart features={mockFeatures} />);
    expect(screen.getByText('Feature Importances')).toBeInTheDocument();
  });

  it('displays a message when no features are provided', () => {
    render(<FeatureImportanceChart features={[]} />);
    expect(screen.getByText('No feature importance data to display.')).toBeInTheDocument();
  });

  it('renders the chart structure when features are provided', () => {
    render(<FeatureImportanceChart features={mockFeatures} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    // Check if Bar was called with the correct data
    expect(mockBar).toHaveBeenCalledWith(expect.objectContaining({
      dataKey: 'value',
      name: 'Importance Score',
    }));
  });

  it('passes correct data to BarChart', () => {
    render(<FeatureImportanceChart features={mockFeatures} />);
    // The features are mapped to chartData, which might truncate names.
    // We check if the BarChart mock was called with data derived from mockFeatures.
    const expectedChartData = mockFeatures.map(f => ({ ...f, name: f.name.length > 30 ? `${f.name.substring(0,27)}...` : f.name }));
    expect(mockBarChart).toHaveBeenCalledWith(expect.objectContaining({ data: expectedChartData }));
  });

  it('uses theme colors for cells', () => {
    render(<FeatureImportanceChart features={mockFeatures} />);
    expect(useTheme).toHaveBeenCalled();
    // Check if Bar was called with children that include Cell components
    const barCall = mockBar.mock.calls[0][0];
    expect(barCall.children).toBeDefined();
    expect(barCall.children.length).toBe(mockFeatures.length);
  });
});
