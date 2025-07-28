
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// ✅ Setup jest-axe correctly
expect.extend({ toHaveNoViolations });

import ExplanationHistory from '@/components/ai/ExplanationHistory';

describe('ExplanationHistory accessibility', () => {
  it('should have no basic accessibility violations', async () => {
    const { container } = render(<ExplanationHistory items={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
