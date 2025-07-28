import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Button,
  Container
} from '@mui/material';
import OrdersList from '../components/orders/OrdersList.js';
import OrderDetails from '../components/orders/OrderDetails.js';
import { getOrders, initializeOrdersData, Order } from '../utils/orderService.js';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`order-tabpanel-${index}`}
      aria-labelledby={`order-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `order-tab-${index}`,
    'aria-controls': `order-tabpanel-${index}`,
  };
}

const OrderFulfillment: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsView, setIsDetailsView] = useState(false);

  useEffect(() => {
    // Initialize orders data
    initializeOrdersData();
    
    // Load orders
    const loadedOrders = getOrders();
    setOrders(loadedOrders);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsView(true);
  };

  const handleBackToList = () => {
    setIsDetailsView(false);
    setSelectedOrder(null);
  };

  const refreshOrders = () => {
    const loadedOrders = getOrders();
    setOrders(loadedOrders);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Order Fulfillment
          </Typography>
          {!isDetailsView ? (
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="order tabs">
              <Tab label="All Orders" {...a11yProps(0)} />
              <Tab label="Pending" {...a11yProps(1)} />
              <Tab label="Processing" {...a11yProps(2)} />
              <Tab label="Shipped" {...a11yProps(3)} />
              <Tab label="Delivered" {...a11yProps(4)} />
              <Tab label="Cancelled" {...a11yProps(5)} />
            </Tabs>
          ) : (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button variant="outlined" onClick={handleBackToList}>
                Back to Orders List
              </Button>
            </Box>
          )}
        </Box>

        {!isDetailsView ? (
          <>
            <TabPanel value={tabValue} index={0}>
              <OrdersList 
                orders={orders} 
                onSelectOrder={handleOrderSelect} 
                filter="all" 
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <OrdersList 
                orders={orders} 
                onSelectOrder={handleOrderSelect} 
                filter="pending" 
              />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <OrdersList 
                orders={orders} 
                onSelectOrder={handleOrderSelect} 
                filter="processing" 
              />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <OrdersList 
                orders={orders} 
                onSelectOrder={handleOrderSelect} 
                filter="shipped" 
              />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <OrdersList 
                orders={orders} 
                onSelectOrder={handleOrderSelect} 
                filter="delivered" 
              />
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
              <OrdersList 
                orders={orders} 
                onSelectOrder={handleOrderSelect} 
                filter="cancelled" 
              />
            </TabPanel>
          </>
        ) : (
          selectedOrder && (
            <OrderDetails 
              order={selectedOrder} 
              onRefresh={refreshOrders} 
            />
          )
        )}
      </Paper>
    </Container>
  );
};

export default OrderFulfillment;
