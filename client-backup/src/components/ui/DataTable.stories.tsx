import type { Meta, StoryObj } from '@storybook/react';
import { useState, useMemo } from 'react';
import { DataTable } from './DataTable';
import { Box, Typography, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

const meta: Meta<typeof DataTable> = {
  title: 'Components/Organisms/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  argTypes: {
    rows: { control: false },
    columns: { control: false },
    loading: { control: 'boolean' },
    pagination: { control: 'boolean' },
    pageSize: { control: 'number' },
    pageSizeOptions: { control: 'array' },
    checkboxSelection: { control: 'boolean' },
    onRowClick: { action: 'rowClicked' },
    onSelectionChange: { action: 'selectionChanged' },
    onPageChange: { action: 'pageChanged' },
    onPageSizeChange: { action: 'pageSizeChanged' },
    onSort: { action: 'sorted' },
  },
  args: {
    loading: false,
    pagination: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    checkboxSelection: true,
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

// Sample data
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  joinDate: string;
};

const statusColors = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
} as const;

const generateUsers = (count: number): User[] => {
  const roles = ['Admin', 'Editor', 'Viewer', 'Manager', 'Developer'];
  const statuses = ['active', 'inactive', 'pending'] as const;
  
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    joinDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const userData = generateUsers(25);

const BasicTemplate: Story = {
  render: (args) => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [selected, setSelected] = useState<string[]>([]);
    const [sortModel, setSortModel] = useState<{ field: string; sort: 'asc' | 'desc' } | null>(null);

    const columns = [
      { 
        field: 'name', 
        headerName: 'Name',
        width: 200,
        renderCell: (params: any) => (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        ),
      },
      { 
        field: 'role', 
        headerName: 'Role',
        width: 130,
      },
      { 
        field: 'status', 
        headerName: 'Status',
        width: 130,
        renderCell: (params: any) => (
          <Chip 
            label={params.value} 
            size="small"
            color={statusColors[params.value as keyof typeof statusColors]}
            sx={{ textTransform: 'capitalize' }}
          />
        ),
      },
      { 
        field: 'lastLogin', 
        headerName: 'Last Login',
        width: 180,
        valueFormatter: (params: any) => 
          new Date(params.value).toLocaleString(),
      },
      { 
        field: 'joinDate', 
        headerName: 'Join Date',
        width: 150,
        valueFormatter: (params: any) => 
          new Date(params.value).toLocaleDateString(),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        renderCell: () => (
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];

    // Apply sorting
    const sortedData = useMemo(() => {
      if (!sortModel) return userData;
      
      return [...userData].sort((a: any, b: any) => {
        const aValue = a[sortModel.field];
        const bValue = b[sortModel.field];
        
        if (aValue < bValue) return sortModel.sort === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortModel.sort === 'asc' ? 1 : -1;
        return 0;
      });
    }, [sortModel]);

    // Apply pagination
    const paginatedData = useMemo(() => {
      return sortedData.slice(page * pageSize, page * pageSize + pageSize);
    }, [sortedData, page, pageSize]);

    const handleSort = (field: string) => {
      setSortModel(prev => ({
        field,
        sort: prev?.field === field && prev.sort === 'asc' ? 'desc' : 'asc',
      }));
    };

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        setSelected(paginatedData.map((row: any) => row.id));
      } else {
        setSelected([]);
      }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
      if (checked) {
        setSelected(prev => [...prev, id]);
      } else {
        setSelected(prev => prev.filter(item => item !== id));
      }
    };

    return (
      <Box sx={{ height: 600, width: '100%' }}>
        <DataTable
          {...args}
          columns={columns}
          rows={paginatedData}
          rowCount={userData.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSort={handleSort}
          sortModel={sortModel}
          selectedRows={selected}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
        />
      </Box>
    );
  },
};

export const Basic = BasicTemplate;

export const WithCustomToolbar: Story = {
  ...BasicTemplate,
  args: {
    ...BasicTemplate.args,
    renderToolbar: (selectedRows: any[]) => (
      <Box display="flex" alignItems="center" p={1} gap={1}>
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          {selectedRows.length} selected
        </Typography>
        <Button 
          size="small" 
          color="error" 
          variant="outlined"
          startIcon={<DeleteIcon />}
          disabled={selectedRows.length === 0}
        >
          Delete
        </Button>
        <Button 
          size="small" 
          variant="contained"
          startIcon={<EditIcon />}
          disabled={selectedRows.length !== 1}
        >
          Edit
        </Button>
      </Box>
    ),
  },
};

export const WithRowActions: Story = {
  ...BasicTemplate,
  args: {
    ...BasicTemplate.args,
    columns: [
      ...(BasicTemplate.render?.(BasicTemplate.args as any)?.props.columns.slice(0, -1) || []),
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        renderCell: () => (
          <IconButton size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
  },
};

export const WithExpandableRows: Story = {
  ...BasicTemplate,
  args: {
    ...BasicTemplate.args,
    expandableRows: true,
    renderExpandedRow: (row: any) => (
      <Box p={2} bgcolor="action.hover">
        <Typography variant="body2">
          <strong>ID:</strong> {row.id}<br />
          <strong>Email:</strong> {row.email}<br />
          <strong>Joined:</strong> {new Date(row.joinDate).toLocaleDateString()}
        </Typography>
      </Box>
    ),
  },
};

export const LoadingState: Story = {
  ...BasicTemplate,
  args: {
    ...BasicTemplate.args,
    loading: true,
    rows: [],
  },
};

export const EmptyState: Story = {
  ...BasicTemplate,
  args: {
    ...BasicTemplate.args,
    rows: [],
    emptyState: (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No data available
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          There are no records to display. Try adjusting your search or filter criteria.
        </Typography>
        <Button variant="contained" size="small">
          Add New Item
        </Button>
      </Box>
    ),
  },
};
