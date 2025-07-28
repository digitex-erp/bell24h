import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dashboard from '../../client/src/components/Dashboard';

expect.extend({ toHaveNoViolations });

describe('Dashboard accessibility', () => {
  it('should have no basic accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  // Add additional a11y tests specific to Dashboard if needed
  it('should have accessible heading structure', async () => {
    const { getByRole } = render(<Dashboard />);
    // Verify main heading exists and is properly structured
    const heading = getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});
