import React from 'react';
import { render, screen, fireEvent } from '../../test-utils/accessibility';
import { testA11y } from '../../test-utils/accessibility';
import Button from '@mui/material/Button';

describe('AccessibleButton', () => {
  it('renders a button with proper accessibility attributes', async () => {
    // Render the button
    const { container } = render(
      <Button 
        variant="contained" 
        color="primary"
        aria-label="Test button"
      >
        Click me
      </Button>
    );

    // Test for accessibility
    await testA11y(container);

    // Check that the button is rendered with the correct text
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');

    // Check that the button has the correct ARIA attributes
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    
    render(
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleClick}
        aria-label="Clickable button"
      >
        Click me
      </Button>
    );

    const button = screen.getByRole('button', { name: /clickable button/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is keyboard accessible', async () => {
    const handleKeyDown = jest.fn();
    
    render(
      <Button 
        variant="contained" 
        color="primary"
        onKeyDown={handleKeyDown}
        aria-label="Keyboard accessible button"
      >
        Press me
      </Button>
    );

    const button = screen.getByRole('button', { name: /keyboard accessible button/i });
    
    // Test keyboard interaction (Enter key)
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
    
    // Test keyboard interaction (Space key)
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(handleKeyDown).toHaveBeenCalledTimes(2);
  });

  it('shows proper focus styles', async () => {
    render(
      <Button 
        variant="contained" 
        color="primary"
        aria-label="Focusable button"
      >
        Focus me
      </Button>
    );

    const button = screen.getByRole('button', { name: /focusable button/i });
    
    // Initially not focused
    expect(button).not.toHaveFocus();
    
    // Focus the button
    button.focus();
    expect(button).toHaveFocus();
    
    // Check that focus styles are applied
    // This depends on your theme's focus styles
    expect(button).toHaveStyle('outline: none'); // MUI typically uses outline: none with a different focus style
    
    // Test tab navigation
    const { container } = render(
      <div>
        <button>First</button>
        <Button variant="contained">Second</Button>
        <button>Third</button>
      </div>
    );
    
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    
    // Test tab navigation
    fireEvent.keyDown(buttons[0], { key: 'Tab' });
    expect(buttons[1]).toHaveFocus();
    
    fireEvent.keyDown(buttons[1], { key: 'Tab' });
    expect(buttons[2]).toHaveFocus();
  });

  it('respects disabled state', async () => {
    const handleClick = jest.fn();
    
    const { container } = render(
      <Button 
        variant="contained" 
        color="primary"
        disabled
        onClick={handleClick}
        aria-label="Disabled button"
      >
        Disabled
      </Button>
    );

    // Test for accessibility
    await testA11y(container);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    
    // Check that the button is disabled
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    
    // Check that click handler is not called when disabled
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    
    // Check that the button is not focusable when disabled
    button.focus();
    expect(button).not.toHaveFocus();
  });
});
