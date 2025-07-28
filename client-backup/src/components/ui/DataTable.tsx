import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  Box,
  Typography,
  CircularProgress,
  TableFooter,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

type Order = 'asc' | 'desc';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string | React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  selectedRows?: any[];
  onSelectRow?: (row: any) => void;
  onSelectAllRows?: (checked: boolean) => void;
  pagination?: boolean;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  totalRows?: number;
  emptyMessage?: string;
  hover?: boolean;
  size?: 'small' | 'medium';
  stickyHeader?: boolean;
  elevation?: number;
  sx?: any;
}

const StyledTablePagination = styled(TablePagination)(({ theme }) => ({
  '& .MuiTablePagination-toolbar': {
    padding: theme.spacing(1, 2),
  },
  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
    margin: 0,
  },
}));

const TablePaginationActions: React.FC<{
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}> = ({ count, page, rowsPerPage, onPageChange }) => {
  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </Box>
  );
};

const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows = [],
  loading = false,
  onRowClick,
  selectedRows = [],
  onSelectRow,
  onSelectAllRows,
  pagination = true,
  page: controlledPage = 0,
  rowsPerPage: controlledRowsPerPage = 10,
  onPageChange: handlePageChange,
  onRowsPerPageChange: handleRowsPerPageChange,
  totalRows: controlledTotalRows,
  emptyMessage = 'No data available',
  hover = true,
  size = 'medium',
  stickyHeader = false,
  elevation = 1,
  sx,
}) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isControlled = typeof controlledPage !== 'undefined';
  const currentPage = isControlled ? controlledPage : page;
  const currentRowsPerPage = isControlled ? controlledRowsPerPage : rowsPerPage;
  const totalRows = controlledTotalRows || rows.length;

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    if (isControlled && handlePageChange) {
      handlePageChange(newPage);
    } else {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (isControlled && handleRowsPerPageChange) {
      handleRowsPerPageChange(newRowsPerPage);
    } else {
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAllRows) {
      onSelectAllRows(event.target.checked);
    }
  };

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleSelectRow = (event: React.MouseEvent, row: any) => {
    event.stopPropagation();
    if (onSelectRow) {
      onSelectRow(row);
    }
  };

  const isSelected = (row: any) => {
    return selectedRows.some((selected) => selected.id === row.id);
  };

  const sortedRows = useMemo(() => {
    if (!orderBy) return rows;
    
    return [...rows].sort((a, b) => {
      if (a[orderBy] === b[orderBy]) return 0;
      
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return order === 'asc' 
        ? aValue < bValue ? -1 : 1
        : aValue > bValue ? -1 : 1;
    });
  }, [rows, orderBy, order]);

  const paginatedRows = useMemo(() => {
    if (!pagination) return sortedRows;
    const start = currentPage * currentRowsPerPage;
    return sortedRows.slice(start, start + currentRowsPerPage);
  }, [sortedRows, currentPage, currentRowsPerPage, pagination]);

  const showEmptyState = !loading && rows.length === 0;
  const showPagination = pagination && rows.length > 0;

  return (
    <Paper 
      elevation={elevation} 
      sx={{ width: '100%', overflow: 'hidden', ...sx }}
    >
      <TableContainer sx={{ maxHeight: '100%' }}>
        <Table 
          stickyHeader={stickyHeader}
          size={size}
          aria-label="data table"
        >
          <TableHead>
            <TableRow>
              {onSelectRow && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 && selectedRows.length < rows.length
                    }
                    checked={rows.length > 0 && selectedRows.length === rows.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all' }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => column.sortable !== false && handleRequestSort(column.id)}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={{
                          border: 0,
                          clip: 'rect(0 0 0 0)',
                          height: 1,
                          margin: -1,
                          overflow: 'hidden',
                          padding: 0,
                          position: 'absolute',
                          top: 20,
                          width: 1,
                        }}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onSelectRow ? 1 : 0)} align="center">
                  <Box py={4}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : showEmptyState ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onSelectRow ? 1 : 0)} align="center">
                  <Box py={4}>
                    <Typography variant="body2" color="textSecondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => {
                const isItemSelected = isSelected(row);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover={hover}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id || index}
                    selected={isItemSelected}
                    onClick={() => handleRowClick(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor: onRowClick ? 'action.hover' : 'inherit',
                      },
                    }}
                  >
                    {onSelectRow && (
                      <TableCell padding="checkbox" onClick={(e) => handleSelectRow(e, row)}>
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: column.minWidth || '200px',
                          }}
                        >
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
          {showPagination && (
            <TableFooter>
              <TableRow>
                <StyledTablePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  colSpan={columns.length + (onSelectRow ? 1 : 0)}
                  count={totalRows}
                  rowsPerPage={currentRowsPerPage}
                  page={currentPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                  labelRowsPerPage="Rows per page:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                  }
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DataTable;
