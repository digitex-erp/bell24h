import { render, screen } from '@testing-library/react';
import FeatureImportanceChart from '../FeatureImportanceChart';

describe('FeatureImportanceChart', () => {
  it('renders chart with features', () => {
    const features = [
      { name: 'A', importance: 1, direction: 'positive' as const, value: 10 },
      { name: 'B', importance: 2, direction: 'negative' as const, value: 5 }
    ];
    render(<FeatureImportanceChart features={features} modelType="shap" confidence={0.9} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
