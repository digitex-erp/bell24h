import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockMarketDashboard from '@/app/dashboard/stock-market/page';

/**
 * Phase C: Stock Market Display UI Testing (Cursor-safe)
 * Tests stock price display with mock data
 * Keep under 70 lines to prevent hanging
 */

// Mock stock data
const mockStockData = {
  indices: [
    { symbol: 'NIFTY', value: 19875.45, change: '+125.30', percent: '+0.63%' },
    { symbol: 'SENSEX', value: 65782.12, change: '+412.55', percent: '+0.63%' },
  ],
  commodities: [
    { name: 'Gold', price: 62450, change: '-120', unit: '₹/10g' },
    { name: 'Silver', price: 74200, change: '+350', unit: '₹/kg' },
  ],
  lastUpdate: new Date().toISOString(),
};

// Mock WebSocket for real-time updates
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
}));

// Mock API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockStockData),
  })
);

describe('Stock Market Dashboard - UI Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders market indices correctly', async () => {
    render(<StockMarketDashboard />);

    expect(screen.getByText(/Stock Market/i)).toBeInTheDocument();

    // Wait for data
    const niftyValue = await screen.findByText('19875.45');
    expect(niftyValue).toBeInTheDocument();
    expect(screen.getByText('SENSEX')).toBeInTheDocument();
    expect(screen.getByText('+0.63%')).toBeInTheDocument();
  });

  test('displays commodity prices', async () => {
    render(<StockMarketDashboard />);

    await screen.findByText('Gold');
    expect(screen.getByText('₹62,450')).toBeInTheDocument();
    expect(screen.getByText('Silver')).toBeInTheDocument();
  });

  test('shows positive/negative indicators', async () => {
    render(<StockMarketDashboard />);

    await screen.findByText('NIFTY');

    // Positive changes should have green color
    const positiveChange = screen.getByText('+125.30');
    expect(positiveChange).toHaveClass('text-green-600');

    // Negative changes should have red color
    const negativeChange = screen.getByText('-120');
    expect(negativeChange).toHaveClass('text-red-600');
  });
});
