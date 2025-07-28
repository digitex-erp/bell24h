import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AIDecisionPanel from './index';
import { AIDecision, ModelType } from '../../../types/ai';
import { aiService } from '../../../services/ai/AIService';

// Mock the AI service
// Important: we define the mock first, ensuring it's hoisted properly
vi.mock('../../../services/ai/AIService', async () => {
  const mockAnalyze = vi.fn();
  return {
    aiService: {
      analyze: mockAnalyze,
      refresh: vi.fn()
    },
  };
});

// Get the mocked function to use in tests
const { aiService } = await import('../../../services/ai/AIService');
const mockAnalyze = aiService.analyze as ReturnType<typeof vi.fn>;

const mockDecision: AIDecision = {
  confidence: 0.95,
  reasoning: 'This is a test decision with high confidence.',
  recommendations: ['Recommendation 1', 'Recommendation 2'],
  data: { test: 'data' },
  timestamp: new Date().toISOString(),
  modelVersion: '1.0.0',
};

describe('AIDecisionPanel', () => {
  const mockContext = { test: 'context' };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    mockAnalyze.mockImplementation(() => Promise.resolve(mockDecision));
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially when autoFetch is true', async () => {
    // Setup mock implementation for this specific test
    mockAnalyze.mockImplementationOnce(() => Promise.resolve(mockDecision));
    
    render(
      <AIDecisionPanel 
        context={mockContext} 
        modelType="rfq_analysis" 
        autoFetch={true} 
      />
    );
    
    // Check loading state is shown
    expect(screen.getByText('Analyzing with AI...')).toBeInTheDocument();
    
    // Wait for the analysis to complete
    await waitFor(() => {
      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    });
  });

  it('does not auto-fetch when autoFetch is false', () => {
    render(
      <AIDecisionPanel 
        context={mockContext} 
        modelType="rfq_analysis" 
        autoFetch={false} 
      />
    );
    
    expect(screen.queryByText('Analyzing with AI...')).not.toBeInTheDocument();
    expect(mockAnalyze).not.toHaveBeenCalled();
  });

  it('displays error state when analysis fails', async () => {
    const errorMessage = 'Analysis failed';
    mockAnalyze.mockRejectedValueOnce(new Error(errorMessage));
    
    render(
      <AIDecisionPanel 
        context={mockContext} 
        modelType="rfq_analysis" 
        autoFetch={true} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('allows manual refresh when autoFetch is false', async () => {
    // First render with autoFetch false
    const { rerender } = render(
      <AIDecisionPanel 
        context={mockContext} 
        modelType="rfq_analysis" 
        autoFetch={false} 
      />
    );
    
    // Should not call analyze on initial render
    expect(mockAnalyze).not.toHaveBeenCalled();
    
    // Click refresh button
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    
    // Should call analyze on refresh
    expect(mockAnalyze).toHaveBeenCalledTimes(1);
    
    // Rerender with loading state
    rerender(
      <AIDecisionPanel 
        context={mockContext} 
        modelType="rfq_analysis" 
        autoFetch={false} 
      />
    );
    
    // Should show loading state
    expect(screen.getByText('Analyzing with AI...')).toBeInTheDocument();
    
    // Resolve the promise
    await waitFor(() => {
      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    });
  });

  it('calls onDecision when analysis is successful', async () => {
    const onDecision = vi.fn();
    mockAnalyze.mockResolvedValueOnce(mockDecision);
    
    render(
      <AIDecisionPanel 
        context={mockContext} 
        modelType="rfq_analysis" 
        onDecision={onDecision}
        autoFetch={true} 
      />
    );
    
    await waitFor(() => {
      expect(onDecision).toHaveBeenCalledTimes(1);
      expect(onDecision).toHaveBeenCalledWith(mockDecision);
    });
  });

  it('calls onError when analysis fails', async () => {
    const error = new Error('Analysis failed');
    const onError = vi.fn();
    mockAnalyze.mockRejectedValueOnce(error);
    
    render(
      <AIDecisionPanel 
        context={mockContext} 
        modelType="rfq_analysis" 
        onError={onError}
        autoFetch={true} 
      />
    );
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('refreshes analysis when refresh button is clicked', async () => {
    require('../../../services/ai/AIService').aiService.analyze
      .mockResolvedValueOnce(mockDecision)
      .mockResolvedValueOnce({ ...mockDecision, confidence: 0.8 });
    
    render(
      <AIDecisionPanel 
        context={mockContext} 
        modelType="rfq_analysis" 
        autoFetch={true}
        showRefresh={true}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Refresh Analysis'));
    
    await waitFor(() => {
      expect(require('../../../services/ai/AIService').aiService.analyze).toHaveBeenCalledTimes(2);
    });
  });

  it('toggles expanded state when header is clicked and collapsible is true', async () => {
    require('../../../services/ai/AIService').aiService.analyze.mockResolvedValueOnce(mockDecision);
    
    render(
      <AIDecisionPanel 
        context={mockContext} 
        modelType="rfq_analysis" 
        collapsible={true}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    });
    
    const expandButton = screen.getByLabelText('Collapse');
    fireEvent.click(expandButton);
    
    expect(screen.queryByText('Analysis')).not.toBeInTheDocument();
    
    fireEvent.click(expandButton);
    expect(screen.getByText('Analysis')).toBeInTheDocument();
  });
});
