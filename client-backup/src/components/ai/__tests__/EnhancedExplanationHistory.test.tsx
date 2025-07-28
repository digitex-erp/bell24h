import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../src/test-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import EnhancedExplanationHistory from '../EnhancedExplanationHistory';
import { ModelExplanation } from '../../../../src/types/ai';

// Mock data for testing
const mockExplanations: ModelExplanation[] = [
  {
    id: '1',
    modelType: 'classification',
    explainabilityType: 'shap',
    features: [
      { feature: 'age', importance: 0.8, direction: 'positive' },
      { feature: 'income', importance: 0.6, direction: 'positive' },
    ],
    prediction: 'Approved',
    timestamp: '2023-06-01T10:00:00Z',
    confidence: 0.85,
    modelName: 'Loan Approval Model',
    predictionClass: 'Approved',
  },
  {
    id: '2',
    modelType: 'regression',
    explainabilityType: 'lime',
    features: [
      { feature: 'credit_score', importance: 0.9, direction: 'positive' },
      { feature: 'debt_ratio', importance: -0.7, direction: 'negative' },
    ],
    prediction: 0.75,
    timestamp: '2023-06-02T11:30:00Z',
    confidence: 0.92,
    modelName: 'Risk Assessment Model',
  },
];

describe('EnhancedExplanationHistory', () => {
  const defaultProps = {
    explanations: mockExplanations,
    onDelete: vi.fn(),
    onRefresh: vi.fn(),
    onDetail: vi.fn(),
    onCompare: vi.fn(),
    onExport: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onModelTypeChange: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with explanations', () => {
    render(<EnhancedExplanationHistory {...defaultProps} />);
    
    // Check if explanations are rendered
    expect(screen.getByText('Loan Approval Model')).toBeInTheDocument();
    expect(screen.getByText('Risk Assessment Model')).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    render(<EnhancedExplanationHistory {...defaultProps} loading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    render(<EnhancedExplanationHistory {...defaultProps} />);
    
    // Click the first delete button
    const deleteButtons = screen.getAllByLabelText(/delete explanation/i);
    fireEvent.click(deleteButtons[0]);

    // Check if delete confirmation dialog appears
    expect(screen.getByText('Delete Explanation')).toBeInTheDocument();
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    // Wait for the delete operation to complete
    await waitFor(() => {
      expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
    });
  });

  it('filters explanations based on search term', () => {
    render(<EnhancedExplanationHistory {...defaultProps} />);
    
    // Type in the search box
    const searchInput = screen.getByPlaceholderText('Search explanations...');
    fireEvent.change(searchInput, { target: { value: 'Loan' } });
    
    // Should only show the matching explanation
    expect(screen.getByText('Loan Approval Model')).toBeInTheDocument();
    expect(screen.queryByText('Risk Assessment Model')).not.toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(<EnhancedExplanationHistory {...defaultProps} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
  });
});
