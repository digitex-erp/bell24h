import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PredictiveAnalytics from '@/app/dashboard/predictive-analytics/page';

/**
 * Phase C: Predictive Analytics UI Testing (Cursor-safe)
 * Tests dashboard UI with mock chart data
 * Keep under 70 lines to prevent hanging
 */

// Mock chart data
const mockChartData = {
  forecast: [
    { month: 'Jan', actual: 45000, predicted: 47000 },
    { month: 'Feb', actual: 52000, predicted: 51000 },
    { month: 'Mar', actual: null, predicted: 58000 },
  ],
  accuracy: 98.5,
  trends: { growth: '+15%', confidence: 0.92 },
};

// Mock chart library
jest.mock('recharts', () => ({
  LineChart: () => <div data-testid='line-chart'>Mock Chart</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

// Mock API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockChartData),
  })
);

describe('Predictive Analytics Dashboard - UI Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with title and metrics', async () => {
    render(<PredictiveAnalytics />);

    expect(screen.getByText(/Predictive Analytics/i)).toBeInTheDocument();

    // Wait for data to load
    const accuracyMetric = await screen.findByText('98.5%');
    expect(accuracyMetric).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  test('displays forecast chart', async () => {
    render(<PredictiveAnalytics />);

    const chart = await screen.findByTestId('line-chart');
    expect(chart).toBeInTheDocument();
  });

  test('time range selector changes data', async () => {
    render(<PredictiveAnalytics />);

    const timeRangeSelect = screen.getByRole('combobox', { name: /time range/i });
    fireEvent.change(timeRangeSelect, { target: { value: '6months' } });

    // Should trigger new data fetch
    expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + after change
  });
});
