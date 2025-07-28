'use client';

import { AgGridReact } from '@ag-grid-community/react';
import { ColDef } from '@ag-grid-community/core';
import { useState, useCallback, useRef, useEffect } from 'react';
import { StatusItem } from './data';

// Import AG-Grid styles
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

interface StatusTableProps {
  data: StatusItem[];
  categoryType: string;
  pageSize?: number;
}

export function StatusTable({ data, categoryType, pageSize = 10 }: StatusTableProps) {
  // Add refs and state for AG-Grid optimization
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<StatusItem[]>([]);
  const [paginationPageSize] = useState<number>(pageSize); // We only need to read this value, not set it
  // Define column configuration for AG-Grid
  const columnDefs: ColDef[] = [
    { 
      field: 'name', 
      headerName: categoryType === 'features' ? 'Feature' : 
                 categoryType === 'services' ? 'Service Name' : 
                 categoryType === 'apiEndpoints' ? 'API Endpoint' : 'Area',
      sortable: true,
      filter: true,
      flex: 1
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      sortable: true, 
      filter: true, 
      width: 120,
      cellClass: (params: any) => {
        switch(params.value) {
          case 'Complete': return 'bg-green-100 text-green-800';
          case 'In Progress': return 'bg-blue-100 text-blue-800';
          case 'Planned': return 'bg-yellow-100 text-yellow-800';
          default: return '';
        }
      }
    },
    { 
      field: 'incomplete', 
      headerName: '% Incomplete', 
      sortable: true, 
      filter: true, 
      width: 140,
      cellRenderer: (params: any) => {
        return `${params.value}%`;
      },
      cellClass: (params: any) => {
        const value = params.value;
        if (value < 10) return 'bg-green-100 text-green-800';
        if (value < 30) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
      }
    }
  ];
  
  // Default column definition with improved performance settings
  const defaultColDef = useCallback(() => {
    return {
      flex: 1,
      minWidth: 100,
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,  // Improved performance by disabling column moving
      floatingFilter: false     // Only enable when specifically needed
    };
  }, []);

  // Load data with lazy loading approach
  useEffect(() => {
    if (data.length > 0) {
      // Use a small timeout to prevent UI blocking with large datasets
      const timer = setTimeout(() => {
        setRowData(data);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [data]);
  
  // Grid ready event handler to optimize initial rendering
  const onGridReady = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      // Ensure all columns are correctly sized
      gridRef.current.api.sizeColumnsToFit();
      
      // Set any additional options via available API methods
      // Note: Modern AG-Grid versions handle performance optimizations automatically
    }
  }, []);

  return (
    <div className="ag-theme-alpine h-96 w-full">
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout={'autoHeight'}
        animateRows={true}
        defaultColDef={defaultColDef()}
        onGridReady={onGridReady}
        rowBuffer={10}
        pagination={true}
        paginationPageSize={paginationPageSize}
        cacheBlockSize={paginationPageSize}
        paginationAutoPageSize={false}
        suppressPaginationPanel={false}
      />
    </div>
  );
}

export default StatusTable;
