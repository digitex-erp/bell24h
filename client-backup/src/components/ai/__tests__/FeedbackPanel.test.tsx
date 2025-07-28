import { render, screen, fireEvent } from '@testing-library/react';
import FeedbackPanel from '../FeedbackPanel';

describe('FeedbackPanel', () => {
  it('renders and allows feedback', () => {
    render(<FeedbackPanel explanationId="exp-1" />);
    expect(screen.getByText(/Rate this explanation/i)).toBeInTheDocument();
    
    // Find the text area by its placeholder text instead of label
    const textField = screen.getByPlaceholderText(/Please provide more details about your feedback/i);
    fireEvent.change(textField, { target: { value: 'Great explanation!' } });
    
    expect(screen.getByDisplayValue('Great explanation!')).toBeInTheDocument();
  });
});
