import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../theme';
import MaterialCard from '../MaterialCard';

describe('MaterialCard', () => {
  it('renders with default props', () => {
    render(
      <ThemeProvider theme={theme}>
        <MaterialCard>Card Content</MaterialCard>
      </ThemeProvider>
    );
    
    const card = screen.getByText('Card Content').closest('.MuiPaper-root');
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle('border-radius: 12px');
  });

  it('applies hover effect when hoverEffect is true', () => {
    render(
      <ThemeProvider theme={theme}>
        <MaterialCard hoverEffect>Hover Me</MaterialCard>
      </ThemeProvider>
    );
    
    const card = screen.getByText('Hover Me').closest('.MuiPaper-root');
    expect(card).toHaveStyle('transition: box-shadow 0.3s ease, transform 0.3s ease');
  });

  it('renders with outlined variant', () => {
    render(
      <ThemeProvider theme={theme}>
        <MaterialCard variant="outlined">Outlined Card</MaterialCard>
      </ThemeProvider>
    );
    
    const card = screen.getByText('Outlined Card').closest('.MuiPaper-root');
    expect(card).toHaveStyle('border: 1px solid');
  });
});
