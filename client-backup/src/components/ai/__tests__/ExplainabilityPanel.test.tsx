import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExplainabilityPanel } from '../ExplainabilityPanel';
import { explainabilityService } from '../../../services/explainability/ExplainabilityService';
import { render as customRender } from '../../../test-utils/TestWrapper';

// Mock the service
jest.mock('../../../services/explainability/ExplainabilityService');

describe('ExplainabilityPanel', () => {
  const mockExplanations = {
    items: [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00Z',
        model: 'test-model',
        confidence: 0.95,
        summary: 'Test explanation',
        features: {
          'feature1': 0.8,
          'feature2': 0.6
        }
      }
    ],
    total: 1,
    page: 1,
    pageSize: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (explainabilityService.getExplanations as jest.Mock).mockResolvedValue(mockExplanations);
    (explainabilityService.generateExplanation as jest.Mock).mockResolvedValue({
      id: '2',
      timestamp: new Date().toISOString(),
      model: 'test-model',
      confidence: 0.85,
      summary: 'Generated explanation',
      features: {
        'feature1': 0.7,
        'feature2': 0.5
      }
    });
  });

  it('renders loading state initially', () => {
    customRender(<ExplainabilityPanel />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays explanations when loaded', async () => {
    customRender(<ExplainabilityPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/test explanation/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/95%/i)).toBeInTheDocument();
    expect(screen.getByText(/test-model/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (explainabilityService.getExplanations as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    customRender(<ExplainabilityPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading explanations/i)).toBeInTheDocument();
    });
  });

  it('allows generating new explanations', async () => {
    customRender(<ExplainabilityPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/test explanation/i)).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateButton);

    expect(explainabilityService.generateExplanation).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText(/generated explanation/i)).toBeInTheDocument();
    });
  });

  it('switches between SHAP and LIME explanations', async () => {
    customRender(<ExplainabilityPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/test explanation/i)).toBeInTheDocument();
    });

    const switchButton = screen.getByRole('button', { name: /switch to lime/i });
    await userEvent.click(switchButton);

    expect(screen.getByText(/lime explanation/i)).toBeInTheDocument();
  });

  it('displays feature values when available', async () => {
    customRender(<ExplainabilityPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/test explanation/i)).toBeInTheDocument();
    });

    const featureButton = screen.getByRole('button', { name: /show features/i });
    await userEvent.click(featureButton);

    expect(screen.getByText('feature1: 0.8')).toBeInTheDocument();
    expect(screen.getByText('feature2: 0.6')).toBeInTheDocument();
  });

  it('handles explanation generation error', async () => {
    (explainabilityService.generateExplanation as jest.Mock).mockRejectedValue(new Error('Generation failed'));
    
    customRender(<ExplainabilityPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/test explanation/i)).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/error generating explanation/i)).toBeInTheDocument();
    });
  });
});

});
