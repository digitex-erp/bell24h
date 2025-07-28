import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Chip,
  Button,
  TextField,
  Box,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { Order, OrderStatus, PaymentStatus } from '../../utils/orderService.js';

interface OrdersListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  filter: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onSelectOrder, filter }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders based on the selected tab
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  // Filter orders based on search term
  const searchedOrders = filteredOrders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    );
  });

  // Get status chip color based on order status
  const getStatusChipColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'default';
      case OrderStatus.PROCESSING:
        return 'primary';
      case OrderStatus.SHIPPED:
        return 'info';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'error';
      case OrderStatus.RETURNED:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get payment status chip color
  const getPaymentChipColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'success';
      case PaymentStatus.PENDING:
        return 'warning';
      case PaymentStatus.FAILED:
        return 'error';
      case PaymentStatus.REFUNDED:
        return 'info';
      case PaymentStatus.PARTIALLY_PAID:
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          {filter === 'all' ? 'All Orders' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders`}
          <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
            ({searchedOrders.length})
          </Typography>
        </Typography>
        <TextField
          size="small"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
      </Box>

      {searchedOrders.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No orders found.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table stickyHeader aria-label="orders table">
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchedOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell component="th" scope="row">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{formatCurrency(order.grandTotal, order.currency)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                      color={getStatusChipColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).replace('_', ' ')} 
                      color={getPaymentChipColor(order.paymentStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => onSelectOrder(order)}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {order.status === OrderStatus.PROCESSING && (
                        <IconButton 
                          size="small" 
                          color="info" 
                          onClick={() => onSelectOrder(order)}
                          title="Update Shipping"
                          sx={{ ml: 1 }}
                        >
                          <ShippingIcon fontSize="small" />
                        </IconButton>
                      )}
                      {order.paymentStatus === PaymentStatus.PENDING && (
                        <IconButton 
                          size="small" 
                          color="success" 
                          onClick={() => onSelectOrder(order)}
                          title="Update Payment"
                          sx={{ ml: 1 }}
                        >
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        color="secondary" 
                        onClick={() => onSelectOrder(order)}
                        title="Generate Invoice"
                        sx={{ ml: 1 }}
                      >
                        <ReceiptIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default OrdersList;
