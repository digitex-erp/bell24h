import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import RfqForm from '../../client/src/components/rfq/RfqForm';

expect.extend({ toHaveNoViolations });

describe('RFQ Form accessibility', () => {
  it('should have no basic accessibility violations', async () => {
    const { container } = render(<RfqForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have properly labeled form fields', async () => {
    const { getAllByRole } = render(<RfqForm />);
    // Check that form inputs have proper labeling
    const textboxes = getAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThan(0);
    
    // Each textbox should have an accessible name
    textboxes.forEach(textbox => {
      expect(textbox).toHaveAccessibleName();
    });
  });
  
  it('should have keyboard navigable form controls', async () => {
    const { getByRole } = render(<RfqForm />);
    // Form should be navigable
    const form = getByRole('form');
    expect(form).toBeInTheDocument();
    
    // Submit button should be accessible
    const submitButton = getByRole('button', { name: /submit|send|create/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });
});
