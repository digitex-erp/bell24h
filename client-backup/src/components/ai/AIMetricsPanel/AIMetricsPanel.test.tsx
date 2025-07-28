import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIMetricsPanel } from './AIMetricsPanel';
import { aiService } from '../../../services/ai/AIService';
import { render as customRender } from '../../../test-utils/TestWrapper';

// Mock the service
jest.mock('../../../services/ai/AIService');

describe('AIMetricsPanel', () => {
  const mockMetrics = {
    accuracy: 0.95,
    precision: 0.92,
    recall: 0.88,
    f1Score: 0.90,
    confusionMatrix: {
      truePositives: 100,
      falsePositives: 10,
      trueNegatives: 90,
      falseNegatives: 20
    },
    timestamp: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (aiService.getMetrics as jest.Mock).mockResolvedValue(mockMetrics);
  });

  it('renders loading state initially', () => {
    customRender(<AIMetricsPanel />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays metrics when loaded', async () => {
    customRender(<AIMetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/92%/i)).toBeInTheDocument();
    expect(screen.getByText(/88%/i)).toBeInTheDocument();
    expect(screen.getByText(/90%/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (aiService.getMetrics as jest.Mock).mockRejectedValue(new Error('Failed to fetch metrics'));
    
    customRender(<AIMetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading metrics/i)).toBeInTheDocument();
    });
  });

  it('allows manual refresh', async () => {
    customRender(<AIMetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await userEvent.click(refreshButton);

    expect(aiService.getMetrics).toHaveBeenCalledTimes(2);
  });

  it('displays confusion matrix', async () => {
    customRender(<AIMetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
    });

    const matrixButton = screen.getByRole('button', { name: /show matrix/i });
    await userEvent.click(matrixButton);

    expect(screen.getByText(/true positives/i)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/false positives/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('toggles detailed view', async () => {
    customRender(<AIMetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
    });

    const expandButton = screen.getByRole('button', { name: /show details/i });
    await userEvent.click(expandButton);

    expect(screen.getByText(/detailed metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/performance breakdown/i)).toBeInTheDocument();
  });

  it('handles empty metrics', async () => {
    (aiService.getMetrics as jest.Mock).mockResolvedValue(null);
    
    customRender(<AIMetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/no metrics available/i)).toBeInTheDocument();
    });
  });

  it('updates metrics periodically', async () => {
    jest.useFakeTimers();
    
    customRender(<AIMetricsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
    });

    // Fast-forward time
    jest.advanceTimersByTime(30000);

    expect(aiService.getMetrics).toHaveBeenCalledTimes(2);
    
    jest.useRealTimers();
  });
}); 