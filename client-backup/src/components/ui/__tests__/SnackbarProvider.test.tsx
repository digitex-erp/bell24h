import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../theme';
import { SnackbarProvider, useSnackbar } from '../SnackbarProvider';

// Test component that uses the snackbar
const TestComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

  return (
    <div>
      <button onClick={() => showSuccess('Success message')}>Show Success</button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showWarning('Warning message')}>Show Warning</button>
      <button onClick={() => showInfo('Info message')}>Show Info</button>
    </div>
  );
};

describe('SnackbarProvider', () => {
  it('shows success snackbar', async () => {
    render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      </ThemeProvider>
    );

    // Click the button to show success snackbar
    const button = screen.getByText('Show Success');
    act(() => {
      button.click();
    });

    // Check if the success message is displayed
    expect(await screen.findByText('Success message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-filledSuccess');
  });

  it('shows error snackbar', async () => {
    render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      </ThemeProvider>
    );

    // Click the button to show error snackbar
    const button = screen.getByText('Show Error');
    act(() => {
      button.click();
    });

    // Check if the error message is displayed
    expect(await screen.findByText('Error message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-filledError');
  });

  it('allows customizing snackbar options', async () => {
    render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      </ThemeProvider>
    );

    // Click the button to show warning snackbar
    const button = screen.getByText('Show Warning');
    act(() => {
      button.click();
    });

    // Check if the warning message is displayed
    expect(await screen.findByText('Warning message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-filledWarning');
  });
});
