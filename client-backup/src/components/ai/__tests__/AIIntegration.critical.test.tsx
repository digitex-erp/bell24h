import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIIntegration } from '../AIIntegration';
import { render as customRender } from '../../../test-utils/TestWrapper';
import { aiService } from '../../../services/ai/AIService';

// Mock the AI service
jest.mock('../../../services/ai/AIService', () => ({
  aiService: {
    analyze: jest.fn(),
    getAnalysis: jest.fn()
  }
}));

describe('AIIntegration', () => {
  const mockAnalysis = {
    decision: 'approve',
    confidence: 0.85,
    reasoning: 'Test reasoning',
    timestamp: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (aiService.analyze as jest.Mock).mockResolvedValue(mockAnalysis);
  });

  it('renders loading state initially', () => {
    customRender(<AIIntegration />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays analysis results when loaded', async () => {
    customRender(<AIIntegration />);
    
    await waitFor(() => {
      expect(screen.getByText(/approve/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/85%/i)).toBeInTheDocument();
    expect(screen.getByText(/test reasoning/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (aiService.analyze as jest.Mock).mockRejectedValue(new Error('Analysis failed'));
    
    customRender(<AIIntegration />);
    
    await waitFor(() => {
      expect(screen.getByText(/error performing analysis/i)).toBeInTheDocument();
    });
  });

  it('allows manual refresh', async () => {
    customRender(<AIIntegration />);
    
    await waitFor(() => {
      expect(screen.getByText(/approve/i)).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await userEvent.click(refreshButton);

    expect(aiService.analyze).toHaveBeenCalledTimes(2);
  });

  it('displays feature importance', async () => {
    customRender(<AIIntegration />);
    
    await waitFor(() => {
      expect(screen.getByText(/approve/i)).toBeInTheDocument();
    });

    const featureButton = screen.getByRole('button', { name: /show features/i });
    await userEvent.click(featureButton);

    expect(screen.getByText(/feature importance/i)).toBeInTheDocument();
  });
});
