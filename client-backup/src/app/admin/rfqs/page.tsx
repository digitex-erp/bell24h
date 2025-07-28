'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  TextField as MuiTextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Warning as FlagIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'completed';
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  supplierCount: number;
  bidCount: number;
  isUrgent: boolean;
  isFeatured: boolean;
  tags: string[];
}

interface RFQStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  completed: number;
  urgent: number;
  featured: number;
}

export default function RFQManagementPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [stats, setStats] = useState<RFQStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
      });

      const [rfqsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/rfqs?${params}`),
        fetch('/api/admin/rfqs/stats'),
      ]);

      if (!rfqsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch RFQ data');
      }

      const [rfqsData, statsData] = await Promise.all([
        rfqsResponse.json(),
        statsResponse.json(),
      ]);

      setRfqs(rfqsData.rfqs);
      setStats(statsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load RFQ data');
      console.error('Error fetching RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, [page, searchTerm, statusFilter, categoryFilter]);

  const handleStatusChange = async (rfqId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/rfqs/${rfqId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update RFQ status');

      await fetchRFQs();
    } catch (err) {
      setError('Failed to update RFQ status');
      console.error('Error updating RFQ status:', err);
    }
  };

  const handleDeleteRFQ = async (rfqId: string) => {
    if (!confirm('Are you sure you want to delete this RFQ? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/rfqs/${rfqId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete RFQ');

      await fetchRFQs();
    } catch (err) {
      setError('Failed to delete RFQ');
      console.error('Error deleting RFQ:', err);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        format,
        status: statusFilter,
        category: categoryFilter,
      });

      const response = await fetch(`/api/admin/rfqs/export?${params}`);
      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rfqs-${statusFilter}-${categoryFilter}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting RFQs:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'flagged':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredPermission={{ action: 'view', resource: 'rfq-management' }}>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                RFQ Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchRFQs} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('csv')}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('pdf')}
              >
                Export PDF
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Total RFQs</Typography>
                    <Typography variant="h4">{stats.total}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Pending Review</Typography>
                    <Typography variant="h4" color="warning.main">{stats.pending}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Approved</Typography>
                    <Typography variant="h4" color="success.main">{stats.approved}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">Flagged</Typography>
                    <Typography variant="h4" color="error.main">{stats.flagged}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <MuiTextField
                  fullWidth
                  placeholder="Search RFQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="flagged">Flagged</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="electronics">Electronics</MenuItem>
                    <MenuItem value="machinery">Machinery</MenuItem>
                    <MenuItem value="textiles">Textiles</MenuItem>
                    <MenuItem value="chemicals">Chemicals</MenuItem>
                    <MenuItem value="services">Services</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* RFQs Table */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              RFQs ({rfqs.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Buyer</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Suppliers</TableCell>
                    <TableCell>Bids</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rfqs.map((rfq) => (
                    <TableRow key={rfq.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {rfq.title}
                          </Typography>
                          {rfq.isUrgent && (
                            <Chip label="Urgent" color="error" size="small" sx={{ mr: 1 }} />
                          )}
                          {rfq.isFeatured && (
                            <Chip label="Featured" color="primary" size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{rfq.buyer.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rfq.buyer.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{rfq.category}</TableCell>
                      <TableCell>{formatCurrency(rfq.budget)}</TableCell>
                      <TableCell>
                        <Chip
                          label={rfq.status.toUpperCase()}
                          color={getStatusColor(rfq.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{rfq.supplierCount}</TableCell>
                      <TableCell>{rfq.bidCount}</TableCell>
                      <TableCell>{new Date(rfq.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRFQ(rfq);
                                setViewDialogOpen(true);
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit RFQ">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRFQ(rfq);
                                setEditDialogOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {rfq.status === 'pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleStatusChange(rfq.id, 'approved')}
                                >
                                  <ApproveIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleStatusChange(rfq.id, 'rejected')}
                                >
                                  <RejectIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Flag">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => handleStatusChange(rfq.id, 'flagged')}
                                >
                                  <FlagIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRFQ(rfq.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil((stats?.total || 0) / pageSize)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </Paper>

          {/* View RFQ Dialog */}
          <Dialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>RFQ Details</DialogTitle>
            <DialogContent>
              {selectedRFQ && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {selectedRFQ.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedRFQ.description}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Typography variant="body1">{selectedRFQ.category}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Budget</Typography>
                      <Typography variant="body1">{formatCurrency(selectedRFQ.budget)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Deadline</Typography>
                      <Typography variant="body1">
                        {new Date(selectedRFQ.deadline).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedRFQ.status.toUpperCase()}
                        color={getStatusColor(selectedRFQ.status) as any}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Tags</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {selectedRFQ.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </ProtectedRoute>
  );
} 