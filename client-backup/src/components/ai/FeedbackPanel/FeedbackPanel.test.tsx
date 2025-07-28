import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackPanel } from './FeedbackPanel';
import { feedbackService } from '../../../services/feedback/FeedbackService';
import { render as customRender } from '../../../test-utils/TestWrapper';

// Mock the service
jest.mock('../../../services/feedback/FeedbackService', () => ({
  feedbackService: {
    submitFeedback: jest.fn(),
    getFeedback: jest.fn()
  }
}));

describe('FeedbackPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (feedbackService.submitFeedback as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Feedback submitted successfully'
    });
  });

  it('renders initial state correctly', () => {
    customRender(<FeedbackPanel />);
    
    expect(screen.getByText(/how was your experience/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('enables submit button when rating is selected', async () => {
    customRender(<FeedbackPanel />);
    
    const ratingButton = screen.getByRole('button', { name: /5 stars/i });
    await userEvent.click(ratingButton);

    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
  });

  it('allows comment input', async () => {
    customRender(<FeedbackPanel />);
    
    const commentInput = screen.getByRole('textbox');
    await userEvent.type(commentInput, 'Great service!');

    expect(commentInput).toHaveValue('Great service!');
  });

  it('submits feedback successfully', async () => {
    customRender(<FeedbackPanel />);
    
    // Select rating
    const ratingButton = screen.getByRole('button', { name: /5 stars/i });
    await userEvent.click(ratingButton);

    // Add comment
    const commentInput = screen.getByRole('textbox');
    await userEvent.type(commentInput, 'Great service!');

    // Submit feedback
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/feedback submitted successfully/i)).toBeInTheDocument();
    });

    expect(feedbackService.submitFeedback).toHaveBeenCalledWith({
      rating: 5,
      comment: 'Great service!'
    });
  });

  it('handles submission error', async () => {
    const errorMessage = 'Failed to submit feedback';
    (feedbackService.submitFeedback as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    customRender(<FeedbackPanel />);
    
    // Select rating
    const ratingButton = screen.getByRole('button', { name: /5 stars/i });
    await userEvent.click(ratingButton);

    // Submit feedback
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error submitting feedback/i)).toBeInTheDocument();
    });
  });

  it('resets form after successful submission', async () => {
    customRender(<FeedbackPanel />);
    
    // Select rating
    const ratingButton = screen.getByRole('button', { name: /5 stars/i });
    await userEvent.click(ratingButton);

    // Add comment
    const commentInput = screen.getByRole('textbox');
    await userEvent.type(commentInput, 'Great service!');

    // Submit feedback
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(commentInput).toHaveValue('');
      expect(submitButton).toBeDisabled();
    });
  });
});