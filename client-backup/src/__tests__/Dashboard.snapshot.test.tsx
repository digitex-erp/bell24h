import React from 'react';
import { render } from '@testing-library/react';
import Dashboard from '../../client/src/components/Dashboard';

describe('Dashboard snapshot', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(<Dashboard />);
    expect(asFragment()).toMatchSnapshot();
  });
  
  // You can add additional snapshot tests for different states
  // For example, with different loading states, error states, etc.
});
