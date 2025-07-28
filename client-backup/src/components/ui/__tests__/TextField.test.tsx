import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../theme';
import TextField from '../TextField';

describe('TextField', () => {
  it('renders with label', () => {
    render(
      <ThemeProvider theme={theme}>
        <TextField label="Username" />
      </ThemeProvider>
    );
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <ThemeProvider theme={theme}>
        <TextField 
          label="Email" 
          errorMessage="Invalid email" 
          error 
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('calls onChange handler', () => {
    const handleChange = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <TextField 
          label="Search" 
          onChange={handleChange} 
        />
      </ThemeProvider>
    );
    
    const input = screen.getByLabelText('Search');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledWith('test');
  });
});
