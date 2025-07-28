import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExplanationHistory } from './ExplanationHistory';
import { explainabilityService } from '../../../services/explainability/ExplainabilityService';
import { render as customRender } from '../../../test-utils/TestWrapper';

// Mock the service
jest.mock('../../../services/explainability/ExplainabilityService');

describe('ExplanationHistory', () => {
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
  });

  it('renders loading state initially', () => {
    customRender(<ExplanationHistory />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays explanations when loaded', async () => {
    customRender(<ExplanationHistory />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    expect(screen.getByRole('columnheader', { name: /timestamp/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /model/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /confidence/i })).toBeInTheDocument();
    
    expect(screen.getByText('test-model')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (explainabilityService.getExplanations as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    customRender(<ExplanationHistory />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading explanations/i)).toBeInTheDocument();
    });
  });

  it('allows refreshing explanations', async () => {
    customRender(<ExplanationHistory />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await userEvent.click(refreshButton);

    expect(explainabilityService.getExplanations).toHaveBeenCalledTimes(2);
  });

  it('displays feature values when available', async () => {
    customRender(<ExplanationHistory />);
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const featureButton = screen.getByRole('button', { name: /show features/i });
    await userEvent.click(featureButton);

    expect(screen.getByText('feature1: 0.8')).toBeInTheDocument();
    expect(screen.getByText('feature2: 0.6')).toBeInTheDocument();
  });
});
