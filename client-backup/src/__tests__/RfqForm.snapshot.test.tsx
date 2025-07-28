import React from 'react';
import { render } from '@testing-library/react';
import RfqForm from '../../client/src/components/rfq/RfqForm';

describe('RFQ Form snapshot', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(<RfqForm />);
    expect(asFragment()).toMatchSnapshot();
  });
  
  // You can test different states of the form
  it('matches the snapshot with validation errors', () => {
    const { asFragment, getByRole } = render(<RfqForm />);
    
    // Attempt to submit the form without filling it out
    const submitButton = getByRole('button', { name: /submit|send|create/i });
    submitButton.click();
    
    // Now take a snapshot with validation errors displayed
    expect(asFragment()).toMatchSnapshot();
  });
});
