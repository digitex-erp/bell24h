import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { aiService } from '../../../services/ai/AIService';
import { render as customRender } from '../../../test-utils/TestWrapper';

// Mock the service
jest.mock('../../../services/ai/AIService');

describe('AIAnalysisPanel', () => {
  const mockAnalysis = {
    decision: 'approve',
    confidence: 0.85,
    reasoning: 'Test reasoning',
    timestamp: new Date().toISOString(),
    features: {
      'feature1': 0.8,
      'feature2': 0.6
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (aiService.analyze as jest.Mock).mockResolvedValue(mockAnalysis);
  });

  it('renders loading state initially', () => {
    customRender(<AIAnalysisPanel />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays analysis results when loaded', async () => {
    customRender(<AIAnalysisPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/approve/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/85%/i)).toBeInTheDocument();
    expect(screen.getByText(/test reasoning/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (aiService.analyze as jest.Mock).mockRejectedValue(new Error('Analysis failed'));
    
    customRender(<AIAnalysisPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/error performing analysis/i)).toBeInTheDocument();
    });
  });

  it('allows manual refresh', async () => {
    customRender(<AIAnalysisPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/approve/i)).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await userEvent.click(refreshButton);

    expect(aiService.analyze).toHaveBeenCalledTimes(2);
  });

  it('displays feature importance', async () => {
    customRender(<AIAnalysisPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/approve/i)).toBeInTheDocument();
    });

    const featureButton = screen.getByRole('button', { name: /show features/i });
    await userEvent.click(featureButton);

    expect(screen.getByText('feature1: 0.8')).toBeInTheDocument();
    expect(screen.getByText('feature2: 0.6')).toBeInTheDocument();
  });

  it('toggles detailed view', async () => {
    customRender(<AIAnalysisPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/approve/i)).toBeInTheDocument();
    });

    const expandButton = screen.getByRole('button', { name: /show details/i });
    await userEvent.click(expandButton);

    expect(screen.getByText(/detailed analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/confidence score/i)).toBeInTheDocument();
  });

  it('handles empty analysis results', async () => {
    (aiService.analyze as jest.Mock).mockResolvedValue(null);
    
    customRender(<AIAnalysisPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/no analysis available/i)).toBeInTheDocument();
    });
  });
}); 