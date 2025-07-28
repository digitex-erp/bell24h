import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../theme';
import PrimaryButton from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('renders with default props', () => {
    render(
      <ThemeProvider theme={theme}>
        <PrimaryButton>Click me</PrimaryButton>
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('MuiButton-contained');
  });

  it('shows loading state', () => {
    render(
      <ThemeProvider theme={theme}>
        <PrimaryButton loading>Loading</PrimaryButton>
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <PrimaryButton onClick={handleClick}>Click me</PrimaryButton>
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with start icon', () => {
    render(
      <ThemeProvider theme={theme}>
        <PrimaryButton startIcon={<span>🔍</span>}>Search</PrimaryButton>
      </ThemeProvider>
    );
    
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });
});
