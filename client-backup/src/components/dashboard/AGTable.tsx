
import { AgGridReact } from '@ag-grid-community/react';
import { ColDef } from '@ag-grid-community/core';

// Import AG-Grid styles
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

interface AGTableProps {
  columns: ColDef[];
  data: any[];
}

export default function AGTable({ columns, data }: AGTableProps) {
  return (
    <div className="ag-theme-alpine w-full h-[400px]">
      <AgGridReact
        columnDefs={columns}
        rowData={data}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        animateRows={true}
      />
    </div>
  );
}
