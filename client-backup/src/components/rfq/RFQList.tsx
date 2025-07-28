import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface RFQ {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unit: string;
  status: 'draft' | 'submitted' | 'quoted' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  quotesCount: number;
  quotedPrice?: number;
  quotedCurrency?: string;
}

const statusColors = {
  draft: 'default',
  submitted: 'info',
  quoted: 'success',
  expired: 'warning',
  cancelled: 'error',
} as const;

import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const RFQList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [creationDate, setCreationDate] = useState<[Date | null, Date | null]>([null, null]);
  const [clientName, setClientName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [assignedUser, setAssignedUser] = useState('');
  const [supplierRiskScore, setSupplierRiskScore] = useState<number[]>([0, 100]);
  const [location, setLocation] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (creationDate[0]) params.creationDateStart = creationDate[0].toISOString();
      if (creationDate[1]) params.creationDateEnd = creationDate[1].toISOString();
      if (clientName) params.clientName = clientName;
      if (productCategory) params.productCategory = productCategory;
      if (priceRange[0] > 0) params.priceMin = priceRange[0];
      if (priceRange[1] < 10000) params.priceMax = priceRange[1];
      if (assignedUser) params.assignedUser = assignedUser;
      if (supplierRiskScore[0] > 0) params.supplierRiskScoreMin = supplierRiskScore[0];
      if (supplierRiskScore[1] < 100) params.supplierRiskScoreMax = supplierRiskScore[1];
      if (location) params.location = location;

      const response = await axios.get('/api/rfq/filter', { params });
      setRFQs(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch RFQs:', err);
      setError(t('rfq.list.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
    // eslint-disable-next-line
  }, [page, rowsPerPage, statusFilter, creationDate, clientName, productCategory, priceRange, assignedUser, supplierRiskScore, location]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rfqId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedRFQ(rfqId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRFQ(null);
  };

  const handleViewRFQ = (id: string) => {
    navigate(`/buyer/rfqs/${id}`);
    handleMenuClose();
  };

  const handleEditRFQ = (id: string) => {
    navigate(`/buyer/rfqs/${id}/edit`);
    handleMenuClose();
  };

  const handleDeleteRFQ = async (id: string) => {
    if (window.confirm(t('rfq.list.confirmDelete'))) {
      try {
        await axios.delete(`/api/rfqs/${id}`);
        fetchRFQs(); // Refresh the list
      } catch (err) {
        console.error('Failed to delete RFQ:', err);
        setError(t('rfq.list.deleteError'));
      }
    }
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      {/* Advanced Filters UI */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Creation Date Start"
              value={creationDate[0]}
              onChange={(date) => setCreationDate([date, creationDate[1]])}
              renderInput={(params) => <TextField {...params} size="small" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Creation Date End"
              value={creationDate[1]}
              onChange={(date) => setCreationDate([creationDate[0], date])}
              renderInput={(params) => <TextField {...params} size="small" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Product Category"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box px={1}>
              <Typography variant="caption">Price Range</Typography>
              <Slider
                value={priceRange}
                onChange={(_, val) => setPriceRange(val as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={100}
                marks={[{ value: 0, label: '0' }, { value: 10000, label: '10k' }]}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Assigned User"
              value={assignedUser}
              onChange={(e) => setAssignedUser(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box px={1}>
              <Typography variant="caption">Supplier Risk Score</Typography>
              <Slider
                value={supplierRiskScore}
                onChange={(_, val) => setSupplierRiskScore(val as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                step={1}
                marks={[{ value: 0, label: '0' }, { value: 100, label: '100' }]}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="outlined" color="secondary" onClick={() => {
              setStatusFilter('all');
              setCreationDate([null, null]);
              setClientName('');
              setProductCategory('');
              setPriceRange([0, 10000]);
              setAssignedUser('');
              setSupplierRiskScore([0, 100]);
              setLocation('');
              setPage(0);
            }}>Clear Filters</Button>
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">{t('rfq.list.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/buyer/rfqs/new')}
        >
          {t('rfq.list.newRFQ')}
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder={t('rfq.list.searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={t('rfq.status.all')}
              onClick={() => handleStatusFilter('all')}
              color={statusFilter === 'all' ? 'primary' : 'default'}
              variant={statusFilter === 'all' ? 'filled' : 'outlined'}
            />
            {Object.entries(statusColors).map(([status, color]) => (
              <Chip
                key={status}
                label={t(`rfq.status.${status}`)}
                onClick={() => handleStatusFilter(status)}
                color={statusFilter === status ? 'primary' : 'default'}
                variant={statusFilter === status ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('rfq.list.columns.product')}</TableCell>
                <TableCell align="right">{t('rfq.list.columns.quantity')}</TableCell>
                <TableCell>{t('rfq.list.columns.status')}</TableCell>
                <TableCell>{t('rfq.list.columns.quotes')}</TableCell>
                <TableCell>{t('rfq.list.columns.date')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rfqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {t('rfq.list.noRFQs')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rfqs.map((rfq) => (
                  <TableRow
                    hover
                    key={rfq.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        {rfq.productImage && (
                          <Box
                            component="img"
                            src={rfq.productImage}
                            alt={rfq.productName}
                            sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                          />
                        )}
                        <Typography variant="body2">{rfq.productName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {rfq.quantity} {rfq.unit}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`rfq.status.${rfq.status}`)}
                        color={statusColors[rfq.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {rfq.quotesCount} {t('rfq.list.quotes')}
                        </Typography>
                        {rfq.quotedPrice && (
                          <Chip
                            label={`${rfq.quotedPrice} ${rfq.quotedCurrency || ''}`}
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(rfq.createdAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, rfq.id)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={() => selectedRFQ && handleViewRFQ(selectedRFQ)}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          {t('common.view')}
        </MenuItem>
        <MenuItem
          onClick={() => selectedRFQ && handleEditRFQ(selectedRFQ)}
          disabled={selectedRFQ && rfqs.find((r) => r.id === selectedRFQ)?.status !== 'draft'}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          {t('common.edit')}
        </MenuItem>
        <MenuItem
          onClick={() => selectedRFQ && handleDeleteRFQ(selectedRFQ)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default RFQList;
