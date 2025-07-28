import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../../theme';
import DataTable from '../DataTable';

const columns = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'age', label: 'Age', sortable: true },
];

const rows = [
  { id: 1, name: 'John Doe', age: 30 },
  { id: 2, name: 'Jane Smith', age: 25 },
];

describe('DataTable', () => {
  it('renders with data', () => {
    render(
      <ThemeProvider theme={theme}>
        <DataTable columns={columns} rows={rows} />
      </ThemeProvider>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('sorts data when column header is clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <DataTable columns={columns} rows={rows} />
      </ThemeProvider>
    );
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    // Verify sort indicator appears
    expect(nameHeader).toHaveAttribute('aria-sort', 'asc');
  });

  it('handles row selection', () => {
    const handleSelectRow = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <DataTable 
          columns={columns} 
          rows={rows} 
          onSelectRow={handleSelectRow} 
        />
      </ThemeProvider>
    );
    
    const firstRow = screen.getByText('John Doe').closest('tr');
    fireEvent.click(firstRow!);
    
    expect(handleSelectRow).toHaveBeenCalledWith(rows[0]);
  });
});
