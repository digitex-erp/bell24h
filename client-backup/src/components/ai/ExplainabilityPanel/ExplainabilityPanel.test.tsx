import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExplainabilityPanel from './ExplainabilityPanel';

// Mock FeatureImportanceChart to isolate testing to ExplainabilityPanel
jest.mock('@/components/ai/FeatureImportanceChart', () => {
  return jest.fn(() => <div data-testid="feature-importance-chart">Mocked Chart</div>);
});

// Helper to mock global fetch
global.fetch = jest.fn();

const mockRfqId = 'rfq-123';

const mockExplanationData = {
  modelType: 'SHAP',
  baseValue: 0.35,
  features: [
    { name: 'Supplier Rating', value: 0.25, originalValue: 'A+' },
    { name: 'Price Competitiveness', value: 0.15, originalValue: 'High' },
  ],
};

describe('ExplainabilityPanel', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.clearAllMocks(); // Clear all mocks including component mocks
  });

  it('shows loading state initially', () => {
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Keep promise pending
    render(<ExplainabilityPanel rfqId={mockRfqId} />);
    expect(screen.getByText(/Loading Explainability Data.../i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('fetches and displays explanation data successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockExplanationData,
    });

    render(<ExplainabilityPanel rfqId={mockRfqId} />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading Explainability Data.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(`AI Model Explanation (${mockExplanationData.modelType})`)).toBeInTheDocument();
    expect(screen.getByText(`Details for RFQ ID: ${mockRfqId}`)).toBeInTheDocument();
    expect(screen.getByText(`Base Model Prediction Value: ${mockExplanationData.baseValue.toFixed(4)}`)).toBeInTheDocument();
    
    // Check for feature list items (simplified check)
    mockExplanationData.features.forEach(feature => {
      expect(screen.getByText(new RegExp(`${feature.name}: ${feature.value.toFixed(4)}`, 'i'))).toBeInTheDocument();
    });

    // Check if the mocked chart is rendered
    expect(screen.getByTestId('feature-importance-chart')).toBeInTheDocument();
  });

  it('handles API error during fetch', async () => {
    const errorMessage = 'API Error: Failed to fetch';
    (fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<ExplainabilityPanel rfqId={mockRfqId} />);

    await waitFor(() => {
      expect(screen.getByText(`Error loading explainability data: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('handles API non-ok response during fetch', async () => {
    const errorStatusText = 'Internal Server Error';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: errorStatusText,
      json: async () => ({ message: 'Server error occurred' }),
    });

    render(<ExplainabilityPanel rfqId={mockRfqId} />);

    await waitFor(() => {
        expect(screen.getByText(/Error loading explainability data: API error: 500 Internal Server Error/i)).toBeInTheDocument();
    });
  });

  it('displays no data message if explanation is null after loading', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => null, // Simulate API returning null
    });

    render(<ExplainabilityPanel rfqId={mockRfqId} />);

    await waitFor(() => {
      expect(screen.getByText('No explainability data available for this RFQ.')).toBeInTheDocument();
    });
  });

   it('displays no data message if features array is empty after loading', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockExplanationData, features: [] }), // Simulate API returning empty features
    });

    render(<ExplainabilityPanel rfqId={mockRfqId} />);

    await waitFor(() => {
      // The panel will still render, but the FeatureImportanceChart (mocked) might not appear or specific feature items won't be there.
      // The main panel structure should be there.
      expect(screen.getByText(`AI Model Explanation (${mockExplanationData.modelType})`)).toBeInTheDocument();
      // Check that the chart mock is called, but it will internally handle empty features.
      expect(screen.getByTestId('feature-importance-chart')).toBeInTheDocument(); 
      // Check that no list items for features are rendered
      expect(screen.queryByText(new RegExp(`${mockExplanationData.features[0].name}:`, 'i'))).not.toBeInTheDocument();
    });
  });

});
