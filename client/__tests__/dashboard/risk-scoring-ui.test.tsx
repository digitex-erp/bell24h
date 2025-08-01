import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskScoringDashboard from '@/app/dashboard/risk-scoring/page';

/**
 * Phase C: Risk Scoring UI Testing (Cursor-safe)
 * Tests risk assessment dashboard with mock data
 * Keep under 70 lines to prevent hanging
 */

// Mock risk data
const mockRiskData = {
  overallScore: 7.8,
  riskLevel: 'Medium',
  categories: [
    { name: 'Market Risk', score: 8.2, status: 'High' },
    { name: 'Credit Risk', score: 6.5, status: 'Medium' },
    { name: 'Operational Risk', score: 4.3, status: 'Low' },
    { name: 'Compliance Risk', score: 3.1, status: 'Low' },
  ],
  recommendations: [
    'Diversify supplier base to reduce market risk',
    'Implement stricter credit checks for new customers',
  ],
};

// Mock gauge chart
jest.mock('react-gauge-chart', () => ({
  __esModule: true,
  default: ({ percent }) => <div data-testid='risk-gauge'>{percent * 10}/10</div>,
}));

// Mock API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockRiskData),
  })
);

describe('Risk Scoring Dashboard - UI Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders overall risk score and level', async () => {
    render(<RiskScoringDashboard />);

    expect(screen.getByText(/Risk Assessment/i)).toBeInTheDocument();

    // Wait for data
    const riskScore = await screen.findByText('7.8');
    expect(riskScore).toBeInTheDocument();
    expect(screen.getByText('Medium Risk')).toBeInTheDocument();
  });

  test('displays risk categories breakdown', async () => {
    render(<RiskScoringDashboard />);

    await screen.findByText('Market Risk');
    expect(screen.getByText('8.2')).toBeInTheDocument();
    expect(screen.getByText('Credit Risk')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  test('shows risk recommendations', async () => {
    render(<RiskScoringDashboard />);

    await screen.findByText(/Recommendations/i);
    expect(screen.getByText(/Diversify supplier base/i)).toBeInTheDocument();
  });

  test('risk level colors are appropriate', async () => {
    render(<RiskScoringDashboard />);

    await screen.findByText('High');
    const highRisk = screen.getByText('High');
    expect(highRisk).toHaveClass('text-red-600');

    const lowRisk = screen.getAllByText('Low')[0];
    expect(lowRisk).toHaveClass('text-green-600');
  });
});
