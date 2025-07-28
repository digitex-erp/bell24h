import React from 'react';
import { render } from '@testing-library/react';
import ExplanationHistory from '@/components/ai/ExplanationHistory';

describe('ExplanationHistory snapshot', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(<ExplanationHistory items={[]} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
