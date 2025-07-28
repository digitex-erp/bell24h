import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../theme';
import MaterialDialog from '../MaterialDialog';

describe('MaterialDialog', () => {
  it('renders when open', () => {
    render(
      <ThemeProvider theme={theme}>
        <MaterialDialog open={true} onClose={() => {}} title="Test Dialog">
          Dialog Content
        </MaterialDialog>
      </ThemeProvider>
    );
    
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <MaterialDialog 
          open={true} 
          onClose={handleClose} 
          title="Test Dialog"
          showCloseButton
        >
          Dialog Content
        </MaterialDialog>
      </ThemeProvider>
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders loading state', () => {
    render(
      <ThemeProvider theme={theme}>
        <MaterialDialog 
          open={true} 
          onClose={() => {}} 
          loading
          loadingText="Loading..."
        >
          Dialog Content
        </MaterialDialog>
      </ThemeProvider>
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
