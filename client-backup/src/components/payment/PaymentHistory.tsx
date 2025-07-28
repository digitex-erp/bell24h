import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { PaymentStatus, PaymentProvider } from '../../../server/models/PaymentModel';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  paymentMethod: string;
  orderId: string;
  description?: string;
  createdAt: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
}

interface PaymentHistoryProps {
  initialPayments?: Payment[];
  itemsPerPage?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  title?: string;
  subtitle?: string;
  onPaymentClick?: (payment: Payment) => void;
  refreshable?: boolean;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  initialPayments = [],
  itemsPerPage: initialItemsPerPage = 10,
  showSearch = true,
  showFilters = true,
  title = 'Payment History',
  subtitle = 'View and manage your payment transactions',
  onPaymentClick,
  refreshable = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  
  // State
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [loading, setLoading] = useState(!initialPayments.length);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialItemsPerPage);
  const [orderBy, setOrderBy] = useState<keyof Payment>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    status: PaymentStatus | 'all';
    provider: PaymentProvider | 'all';
  }>({
    status: 'all',
    provider: 'all',
  });

  // Fetch payments on component mount if no initial payments provided
  useEffect(() => {
    if (!initialPayments.length) {
      fetchPayments();
    }
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      enqueueSnackbar('Failed to load payment history', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const handleRequestSort = (property: keyof Payment) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle change page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle change rows per page
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter change
  const handleFilterChange = (filter: 'status' | 'provider', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value,
    }));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchPayments();
    enqueueSnackbar('Payment history refreshed', { variant: 'info' });
  };

  // Handle payment row click
  const handleRowClick = (payment: Payment) => {
    if (onPaymentClick) {
      onPaymentClick(payment);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100); // Convert from cents to dollars
  };

  // Get status chip color
  const getStatusChipColor = (status: PaymentStatus) => {
    switch (status) {
      case 'succeeded':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'canceled':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get provider icon
  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider) {
      case 'stripe':
        return '/icons/stripe.png';
      case 'paypal':
        return '/icons/paypal.png';
      case 'razorpay':
        return '/icons/razorpay.png';
      default:
        return null;
    }
  };

  // Filter and sort payments
  const filteredPayments = React.useMemo(() => {
    return payments
      .filter((payment) => {
        // Apply search filter
        const matchesSearch =
          payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (payment.description && payment.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Apply status filter
        const matchesStatus = filters.status === 'all' || payment.status === filters.status;

        // Apply provider filter
        const matchesProvider = filters.provider === 'all' || payment.provider === filters.provider;

        return matchesSearch && matchesStatus && matchesProvider;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        if (orderBy === 'amount') {
          comparison = a.amount - b.amount;
        } else if (orderBy === 'createdAt') {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (orderBy === 'status') {
          comparison = a.status.localeCompare(b.status);
        } else {
          // Default sorting by date
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }

        return order === 'desc' ? -comparison : comparison;
      });
  }, [payments, searchQuery, filters, orderBy, order]);

  // Pagination
  const paginatedPayments = React.useMemo(() => {
    return filteredPayments.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredPayments, page, rowsPerPage]);

  // Show empty state if no payments
  if (!loading && payments.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <ReceiptIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Payment History
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              You don't have any payment transactions yet.
            </Typography>
            {refreshable && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom={!subtitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          {refreshable && (
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Filters and Search */}
      <Box mb={3} display="flex" flexWrap="wrap" gap={2}>
        {showSearch && (
          <TextField
            placeholder="Search payments..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250, flexGrow: 1 }}
          />
        )}

        {showFilters && (
          <Box display="flex" gap={2} flexWrap="wrap" flexGrow={1} justifyContent={isMobile ? 'space-between' : 'flex-end'}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value as PaymentStatus | 'all')}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="succeeded">Succeeded</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="provider-filter-label">Provider</InputLabel>
              <Select
                labelId="provider-filter-label"
                id="provider-filter"
                value={filters.provider}
                onChange={(e) => handleFilterChange('provider', e.target.value as PaymentProvider | 'all')}
                label="Provider"
              >
                <MenuItem value="all">All Providers</MenuItem>
                <MenuItem value="stripe">Stripe</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="razorpay">Razorpay</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* Payment Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'desc'}
                    onClick={() => handleRequestSort('createdAt')}
                  >
                    Date
                    {orderBy === 'createdAt' ? (
                      order === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />
                    ) : null}
                  </TableSortLabel>
                </TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'amount'}
                    direction={orderBy === 'amount' ? order : 'desc'}
                    onClick={() => handleRequestSort('amount')}
                  >
                    Amount
                    {orderBy === 'amount' ? (
                      order === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />
                    ) : null}
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Loading payments...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No payments found matching your criteria
                    </Typography>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({ status: 'all', provider: 'all' });
                      }}
                      sx={{ mt: 1 }}
                    >
                      Clear filters
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    hover
                    onClick={() => handleRowClick(payment)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(payment.createdAt), 'h:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.orderId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap maxWidth={200}>
                        {payment.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        color={getStatusChipColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getProviderIcon(payment.provider) ? (
                          <Box
                            component="img"
                            src={getProviderIcon(payment.provider)}
                            alt={payment.provider}
                            sx={{ height: 20, mr: 1 }}
                          />
                        ) : (
                          <InfoIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                        )}
                        <Typography variant="body2">
                          {payment.provider.charAt(0).toUpperCase() + payment.provider.slice(1)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(payment);
                        }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {payment.receiptUrl && (
                        <Tooltip title="View receipt">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(payment.receiptUrl, '_blank');
                            }}
                          >
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-toolbar': {
              paddingLeft: 2,
              paddingRight: 1,
            },
          }}
        />
      </Card>
    </Box>
  );
};

export default PaymentHistory;
