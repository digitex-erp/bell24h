'use client';

import React from 'react';

// Import Material Web Components
import '@material/web/table/data-table.js';
import '@material/web/table/data-table-cell.js';
import '@material/web/table/data-table-column.js';
import '@material/web/table/data-table-header-cell.js';
import '@material/web/table/data-table-row.js';

interface MDCTableProps {
  data: any[];
}

export default function MDCTable({ data }: MDCTableProps) {
  // If no data is provided or data is empty, return null
  if (!data || data.length === 0) return null;

  // Extract column headers from the first data object
  const headers = Object.keys(data[0]);

  return (
    <md-data-table>
      <md-data-table-column slot="header">
        {headers.map((header) => (
          <md-data-table-header-cell key={header}>
            {header}
          </md-data-table-header-cell>
        ))}
      </md-data-table-column>
      
      {data.map((row, rowIndex) => (
        <md-data-table-row key={rowIndex}>
          {headers.map((header) => (
            <md-data-table-cell key={`${rowIndex}-${header}`}>
              {row[header]}
            </md-data-table-cell>
          ))}
        </md-data-table-row>
      ))}
    </md-data-table>
  );
}
