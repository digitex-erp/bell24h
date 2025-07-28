import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../theme';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(
      <ThemeProvider theme={theme}>
        <SearchBar placeholder="Search..." />
      </ThemeProvider>
    );
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', () => {
    const handleSearch = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <SearchBar onSearch={handleSearch} />
      </ThemeProvider>
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(screen.getByRole('search'));
    
    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  it('shows clear button when there is text', () => {
    render(
      <ThemeProvider theme={theme}>
        <SearchBar value="test" onChange={() => {}} />
      </ThemeProvider>
    );
    
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });
});
