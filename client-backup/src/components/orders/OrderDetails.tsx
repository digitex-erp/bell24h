import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
  Button,
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Link
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  ShippingProvider,
  updateOrderStatus,
  updatePaymentStatus,
  addShipmentTracking,
  updateShipmentTracking,
  generateInvoice,
  generatePackingSlip
} from '../../utils/orderService.js';
import { sendNotification, NotificationType } from '../../utils/notificationService.js';

interface OrderDetailsProps {
  order: Order;
  onRefresh: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onRefresh }) => {
  // State for dialogs
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);

  // State for form values
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [trackingId, setTrackingId] = useState('');
  const [shippingProvider, setShippingProvider] = useState<ShippingProvider>(ShippingProvider.SHIPROCKET);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [trackingStatus, setTrackingStatus] = useState('');
  const [trackingLocation, setTrackingLocation] = useState('');
  const [trackingDescription, setTrackingDescription] = useState('');

  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  };

  // Handle status update
  const handleStatusUpdate = () => {
    const updatedOrder = updateOrderStatus(order.id, newStatus);
    if (updatedOrder) {
      sendNotification(
        NotificationType.SYSTEM,
        `Order ${order.orderNumber} status updated to ${newStatus}`
      );
      onRefresh();
    }
    setIsStatusDialogOpen(false);
  };

  // Handle payment status update
  const handlePaymentUpdate = () => {
    const updatedOrder = updatePaymentStatus(order.id, newPaymentStatus);
    if (updatedOrder) {
      sendNotification(
        NotificationType.PAYMENT,
        `Payment status for order ${order.orderNumber} updated to ${newPaymentStatus}`
      );
      onRefresh();
    }
    setIsPaymentDialogOpen(false);
  };

  // Handle shipping tracking addition
  const handleAddShipping = () => {
    const estimatedDeliveryDate = estimatedDelivery ? new Date(estimatedDelivery) : undefined;
    const updatedOrder = addShipmentTracking(
      order.id,
      trackingId,
      shippingProvider,
      estimatedDeliveryDate
    );
    if (updatedOrder) {
      sendNotification(
        NotificationType.SHIPPING,
        `Shipping tracking added for order ${order.orderNumber}`
      );
      onRefresh();
    }
    setIsShippingDialogOpen(false);
  };

  // Handle tracking update
  const handleTrackingUpdate = () => {
    const updatedOrder = updateShipmentTracking(
      order.id,
      trackingStatus,
      trackingLocation,
      trackingDescription
    );
    if (updatedOrder) {
      sendNotification(
        NotificationType.SHIPPING,
        `Shipping tracking updated for order ${order.orderNumber}`
      );
      onRefresh();
    }
    setIsTrackingDialogOpen(false);
  };

  // Handle invoice generation
  const handleGenerateInvoice = () => {
    const invoiceUrl = generateInvoice(order.id);
    if (invoiceUrl) {
      sendNotification(
        NotificationType.SYSTEM,
        `Invoice generated for order ${order.orderNumber}`
      );
      // In a real app, we would open the invoice in a new tab
      window.open(invoiceUrl, '_blank');
    }
  };

  // Handle packing slip generation
  const handleGeneratePackingSlip = () => {
    const packingSlipUrl = generatePackingSlip(order.id);
    if (packingSlipUrl) {
      sendNotification(
        NotificationType.SYSTEM,
        `Packing slip generated for order ${order.orderNumber}`
      );
      // In a real app, we would open the packing slip in a new tab
      window.open(packingSlipUrl, '_blank');
    }
  };

  // Get status chip color
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

  // Get shipping status steps
  const getShippingSteps = () => {
    const steps = [
      { label: 'Order Placed', completed: true },
      { label: 'Processing', completed: order.status !== OrderStatus.PENDING },
      { label: 'Shipped', completed: order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED },
      { label: 'Delivered', completed: order.status === OrderStatus.DELIVERED }
    ];
    
    return steps;
  };

  // Get active step for stepper
  const getActiveStep = () => {
    switch (order.status) {
      case OrderStatus.PENDING:
        return 0;
      case OrderStatus.PROCESSING:
        return 1;
      case OrderStatus.SHIPPED:
        return 2;
      case OrderStatus.DELIVERED:
        return 3;
      default:
        return 0;
    }
  };

  return (
    <Box>
      {/* Order Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2">
              Order {order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Placed on {formatDate(order.createdAt)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<ReceiptIcon />}
              onClick={handleGenerateInvoice}
            >
              Generate Invoice
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handleGeneratePackingSlip}
            >
              Packing Slip
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ShippingIcon />}
              onClick={() => setIsStatusDialogOpen(true)}
            >
              Update Status
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Order Status Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={getActiveStep()} alternativeLabel>
          {getShippingSteps().map((step) => (
            <Step key={step.label} completed={step.completed}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Order Details */}
      <Grid container spacing={3}>
        {/* Order Summary */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  color={getStatusChipColor(order.status) as any}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Payment
                </Typography>
                <Chip
                  label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).replace('_', ' ')}
                  color={getPaymentChipColor(order.paymentStatus) as any}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1">
                  {order.paymentMethod}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(order.grandTotal, order.currency)}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Order Items */}
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2">{item.productName}</Typography>
                        <Typography variant="caption" color="text.secondary">SKU: {item.sku}</Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice, order.currency)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.totalPrice, order.currency)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="right">{formatCurrency(order.totalAmount, order.currency)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right">Tax</TableCell>
                    <TableCell align="right">{formatCurrency(order.tax, order.currency)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right">Shipping</TableCell>
                    <TableCell align="right">{formatCurrency(order.shippingCost, order.currency)}</TableCell>
                  </TableRow>
                  {order.discount > 0 && (
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right">Discount</TableCell>
                      <TableCell align="right">-{formatCurrency(order.discount, order.currency)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(order.grandTotal, order.currency)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Shipping Tracking */}
          {order.shipment && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Shipping Information
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TimelineIcon />}
                  onClick={() => setIsTrackingDialogOpen(true)}
                >
                  Update Tracking
                </Button>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Tracking Number
                  </Typography>
                  <Typography variant="body1">
                    {order.shipment.trackingId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping Provider
                  </Typography>
                  <Typography variant="body1">
                    {order.shipment.provider}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Delivery
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(order.shipment.estimatedDelivery)}
                  </Typography>
                </Grid>
              </Grid>

              {order.shipment.trackingUrl && (
                <Button
                  variant="text"
                  component={Link}
                  href={order.shipment.trackingUrl}
                  target="_blank"
                  rel="noopener"
                  sx={{ mb: 2 }}
                >
                  Track Package
                </Button>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Tracking History
              </Typography>

              {order.shipment.events.map((event, index) => (
                <Box key={index} sx={{ mb: 2, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                  <Typography variant="body2" fontWeight="medium">
                    {event.status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(event.timestamp)}
                    {event.location && ` • ${event.location}`}
                  </Typography>
                  {event.description && (
                    <Typography variant="body2">
                      {event.description}
                    </Typography>
                  )}
                </Box>
              ))}
            </Paper>
          )}
        </Grid>

        {/* Customer and Shipping Details */}
        <Grid item xs={12} md={4}>
          {/* Customer Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Typography variant="body1">
              {order.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer ID: {order.customerId}
            </Typography>
            {order.billingAddress.phone && (
              <Typography variant="body2">
                {order.billingAddress.phone}
              </Typography>
            )}
            {order.billingAddress.email && (
              <Typography variant="body2">
                {order.billingAddress.email}
              </Typography>
            )}
          </Paper>

          {/* Shipping Address */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Typography variant="body1">
              {order.shippingAddress.name}
            </Typography>
            {order.shippingAddress.company && (
              <Typography variant="body2">
                {order.shippingAddress.company}
              </Typography>
            )}
            <Typography variant="body2">
              {order.shippingAddress.street1}
            </Typography>
            {order.shippingAddress.street2 && (
              <Typography variant="body2">
                {order.shippingAddress.street2}
              </Typography>
            )}
            <Typography variant="body2">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress.country}
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress.phone}
            </Typography>
          </Paper>

          {/* Billing Address */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Billing Address
            </Typography>
            <Typography variant="body1">
              {order.billingAddress.name}
            </Typography>
            {order.billingAddress.company && (
              <Typography variant="body2">
                {order.billingAddress.company}
              </Typography>
            )}
            <Typography variant="body2">
              {order.billingAddress.street1}
            </Typography>
            {order.billingAddress.street2 && (
              <Typography variant="body2">
                {order.billingAddress.street2}
              </Typography>
            )}
            <Typography variant="body2">
              {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
            </Typography>
            <Typography variant="body2">
              {order.billingAddress.country}
            </Typography>
            <Typography variant="body2">
              {order.billingAddress.phone}
            </Typography>
          </Paper>

          {/* Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsStatusDialogOpen(true)}
                >
                  Update Order Status
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsPaymentDialogOpen(true)}
                >
                  Update Payment Status
                </Button>
              </Grid>
              {!order.shipment && (
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => setIsShippingDialogOpen(true)}
                  >
                    Add Shipping Information
                  </Button>
                </Grid>
              )}
              {order.shipment && (
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => setIsTrackingDialogOpen(true)}
                  >
                    Update Tracking
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onClose={() => setIsStatusDialogOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            >
              <MenuItem value={OrderStatus.PENDING}>Pending</MenuItem>
              <MenuItem value={OrderStatus.PROCESSING}>Processing</MenuItem>
              <MenuItem value={OrderStatus.SHIPPED}>Shipped</MenuItem>
              <MenuItem value={OrderStatus.DELIVERED}>Delivered</MenuItem>
              <MenuItem value={OrderStatus.CANCELLED}>Cancelled</MenuItem>
              <MenuItem value={OrderStatus.RETURNED}>Returned</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Status Update Dialog */}
      <Dialog open={isPaymentDialogOpen} onClose={() => setIsPaymentDialogOpen(false)}>
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="payment-status-select-label">Payment Status</InputLabel>
            <Select
              labelId="payment-status-select-label"
              value={newPaymentStatus}
              label="Payment Status"
              onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
            >
              <MenuItem value={PaymentStatus.PENDING}>Pending</MenuItem>
              <MenuItem value={PaymentStatus.PAID}>Paid</MenuItem>
              <MenuItem value={PaymentStatus.FAILED}>Failed</MenuItem>
              <MenuItem value={PaymentStatus.REFUNDED}>Refunded</MenuItem>
              <MenuItem value={PaymentStatus.PARTIALLY_PAID}>Partially Paid</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePaymentUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Shipping Dialog */}
      <Dialog open={isShippingDialogOpen} onClose={() => setIsShippingDialogOpen(false)}>
        <DialogTitle>Add Shipping Information</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Tracking ID"
            fullWidth
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="shipping-provider-label">Shipping Provider</InputLabel>
            <Select
              labelId="shipping-provider-label"
              value={shippingProvider}
              label="Shipping Provider"
              onChange={(e) => setShippingProvider(e.target.value as ShippingProvider)}
            >
              <MenuItem value={ShippingProvider.SHIPROCKET}>Shiprocket</MenuItem>
              <MenuItem value={ShippingProvider.DHL}>DHL</MenuItem>
              <MenuItem value={ShippingProvider.FEDEX}>FedEx</MenuItem>
              <MenuItem value={ShippingProvider.BLUEDART}>BlueDart</MenuItem>
              <MenuItem value={ShippingProvider.DELHIVERY}>Delhivery</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Estimated Delivery Date"
            type="date"
            fullWidth
            value={estimatedDelivery}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsShippingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddShipping} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Tracking Update Dialog */}
      <Dialog open={isTrackingDialogOpen} onClose={() => setIsTrackingDialogOpen(false)}>
        <DialogTitle>Update Tracking Information</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Status"
            fullWidth
            value={trackingStatus}
            onChange={(e) => setTrackingStatus(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={trackingLocation}
            onChange={(e) => setTrackingLocation(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={trackingDescription}
            onChange={(e) => setTrackingDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTrackingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleTrackingUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetails;
