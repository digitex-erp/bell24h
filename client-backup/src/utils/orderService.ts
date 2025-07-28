// src/utils/orderService.ts
import { v4 as uuidv4 } from 'uuid';
import { sendNotification, NotificationType } from './notificationService.js';

// Order status types
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

// Payment status types
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_PAID = 'partially_paid'
}

// Shipping provider types
export enum ShippingProvider {
  SHIPROCKET = 'shiprocket',
  DHL = 'dhl',
  FEDEX = 'fedex',
  BLUEDART = 'bluedart',
  DELHIVERY = 'delhivery',
  SELF_PICKUP = 'self_pickup'
}

// Order item interface
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  category?: string;
  imageUrl?: string;
}

// Address interface
export interface Address {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
  isDefault?: boolean;
}

// Shipment tracking interface
export interface ShipmentTracking {
  trackingId: string;
  provider: ShippingProvider;
  status: string;
  estimatedDelivery?: Date;
  trackingUrl?: string;
  events: {
    timestamp: Date;
    status: string;
    location?: string;
    description?: string;
  }[];
}

// Order interface
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  tax: number;
  shippingCost: number;
  discount: number;
  grandTotal: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  shipment?: ShipmentTracking;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  fulfillmentDate?: Date;
  deliveryDate?: Date;
  rfqId?: string;
  bidId?: string;
}

// Mock orders data (for demo purposes)
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-0001',
    customerId: 'CUST-001',
    customerName: 'Acme Industries',
    items: [
      {
        id: '1',
        productId: 'PROD-001',
        productName: 'Industrial Water Pump',
        quantity: 2,
        unitPrice: 12500,
        totalPrice: 25000,
        sku: 'WP-IND-001'
      },
      {
        id: '2',
        productId: 'PROD-002',
        productName: 'Pressure Gauge',
        quantity: 5,
        unitPrice: 1200,
        totalPrice: 6000,
        sku: 'PG-001'
      }
    ],
    totalAmount: 31000,
    tax: 5580,
    shippingCost: 2000,
    discount: 1500,
    grandTotal: 37080,
    currency: 'INR',
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: 'Bank Transfer',
    shippingAddress: {
      name: 'Acme Industries',
      company: 'Acme Industries Pvt Ltd',
      street1: '123 Industrial Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phone: '+91 9876543210'
    },
    billingAddress: {
      name: 'Acme Industries',
      company: 'Acme Industries Pvt Ltd',
      street1: '123 Industrial Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      phone: '+91 9876543210'
    },
    shipment: {
      trackingId: 'SHIP-001',
      provider: ShippingProvider.SHIPROCKET,
      status: 'In Transit',
      estimatedDelivery: new Date('2025-05-25'),
      trackingUrl: 'https://shiprocket.co/tracking/SHIP-001',
      events: [
        {
          timestamp: new Date('2025-05-17T10:00:00'),
          status: 'Order Processed',
          location: 'Mumbai',
          description: 'Order has been processed and is ready for pickup'
        },
        {
          timestamp: new Date('2025-05-17T16:30:00'),
          status: 'Picked Up',
          location: 'Mumbai',
          description: 'Order has been picked up by courier partner'
        }
      ]
    },
    createdAt: new Date('2025-05-15'),
    updatedAt: new Date('2025-05-17'),
    rfqId: 'RFQ-2025-0001',
    bidId: 'BID-2025-0001'
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-0002',
    customerId: 'CUST-002',
    customerName: 'TechSolutions Ltd',
    items: [
      {
        id: '3',
        productId: 'PROD-003',
        productName: 'Server Rack Cabinet',
        quantity: 1,
        unitPrice: 45000,
        totalPrice: 45000,
        sku: 'SR-CAB-001'
      }
    ],
    totalAmount: 45000,
    tax: 8100,
    shippingCost: 5000,
    discount: 0,
    grandTotal: 58100,
    currency: 'INR',
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: 'Credit Card',
    shippingAddress: {
      name: 'TechSolutions Ltd',
      company: 'TechSolutions Ltd',
      street1: '456 Tech Park',
      street2: 'Building B, Floor 3',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      phone: '+91 8765432109'
    },
    billingAddress: {
      name: 'TechSolutions Ltd',
      company: 'TechSolutions Ltd',
      street1: '456 Tech Park',
      street2: 'Building B, Floor 3',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      phone: '+91 8765432109'
    },
    createdAt: new Date('2025-05-16'),
    updatedAt: new Date('2025-05-16'),
    rfqId: 'RFQ-2025-0002',
    bidId: 'BID-2025-0002'
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-0003',
    customerId: 'CUST-003',
    customerName: 'Global Textiles',
    items: [
      {
        id: '4',
        productId: 'PROD-004',
        productName: 'Industrial Sewing Machine',
        quantity: 3,
        unitPrice: 28000,
        totalPrice: 84000,
        sku: 'ISM-001'
      },
      {
        id: '5',
        productId: 'PROD-005',
        productName: 'Thread Spools (Pack of 100)',
        quantity: 10,
        unitPrice: 1500,
        totalPrice: 15000,
        sku: 'TS-100'
      }
    ],
    totalAmount: 99000,
    tax: 17820,
    shippingCost: 8000,
    discount: 5000,
    grandTotal: 119820,
    currency: 'INR',
    status: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: 'Bank Transfer',
    shippingAddress: {
      name: 'Global Textiles',
      company: 'Global Textiles Pvt Ltd',
      street1: '789 Textile Hub',
      city: 'Surat',
      state: 'Gujarat',
      postalCode: '395001',
      country: 'India',
      phone: '+91 7654321098'
    },
    billingAddress: {
      name: 'Global Textiles',
      company: 'Global Textiles Pvt Ltd',
      street1: '789 Textile Hub',
      city: 'Surat',
      state: 'Gujarat',
      postalCode: '395001',
      country: 'India',
      phone: '+91 7654321098'
    },
    shipment: {
      trackingId: 'SHIP-003',
      provider: ShippingProvider.DELHIVERY,
      status: 'In Transit',
      estimatedDelivery: new Date('2025-05-23'),
      trackingUrl: 'https://www.delhivery.com/track/SHIP-003',
      events: [
        {
          timestamp: new Date('2025-05-16T11:00:00'),
          status: 'Order Processed',
          location: 'Surat',
          description: 'Order has been processed and is ready for pickup'
        },
        {
          timestamp: new Date('2025-05-16T17:00:00'),
          status: 'Picked Up',
          location: 'Surat',
          description: 'Order has been picked up by courier partner'
        },
        {
          timestamp: new Date('2025-05-17T09:30:00'),
          status: 'In Transit',
          location: 'Ahmedabad',
          description: 'Order is in transit to the next hub'
        }
      ]
    },
    createdAt: new Date('2025-05-14'),
    updatedAt: new Date('2025-05-17'),
    rfqId: 'RFQ-2025-0003',
    bidId: 'BID-2025-0003'
  }
];

// Get all orders
export const getOrders = (): Order[] => {
  const storedOrders = localStorage.getItem('bell24h_orders');
  if (storedOrders) {
    const parsedOrders = JSON.parse(storedOrders);
    // Convert string dates back to Date objects
    return parsedOrders.map((order: any) => ({
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
      fulfillmentDate: order.fulfillmentDate ? new Date(order.fulfillmentDate) : undefined,
      deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : undefined,
      shipment: order.shipment ? {
        ...order.shipment,
        estimatedDelivery: order.shipment.estimatedDelivery ? new Date(order.shipment.estimatedDelivery) : undefined,
        events: order.shipment.events.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
      } : undefined
    }));
  }
  
  // If no orders in localStorage, initialize with mock data
  localStorage.setItem('bell24h_orders', JSON.stringify(mockOrders));
  return mockOrders;
};

// Get order by ID
export const getOrderById = (id: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(order => order.id === id);
};

// Create new order
export const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order => {
  const orders = getOrders();
  
  // Generate new order ID and order number
  const id = uuidv4();
  const orderCount = orders.length + 1;
  const orderNumber = `ORD-2025-${orderCount.toString().padStart(4, '0')}`;
  
  const newOrder: Order = {
    ...orderData,
    id,
    orderNumber,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Add to orders list
  orders.push(newOrder);
  localStorage.setItem('bell24h_orders', JSON.stringify(orders));
  
  // Send notification
  sendNotification(NotificationType.SYSTEM, `New order ${orderNumber} has been created`);
  
  return newOrder;
};

// Update order
export const updateOrder = (id: string, orderData: Partial<Order>): Order | undefined => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(order => order.id === id);
  
  if (orderIndex === -1) {
    return undefined;
  }
  
  // Update order
  const updatedOrder: Order = {
    ...orders[orderIndex],
    ...orderData,
    updatedAt: new Date()
  };
  
  orders[orderIndex] = updatedOrder;
  localStorage.setItem('bell24h_orders', JSON.stringify(orders));
  
  // Send notification
  sendNotification(NotificationType.SYSTEM, `Order ${updatedOrder.orderNumber} has been updated`);
  
  return updatedOrder;
};

// Update order status
export const updateOrderStatus = (id: string, status: OrderStatus): Order | undefined => {
  const order = getOrderById(id);
  
  if (!order) {
    return undefined;
  }
  
  // If status is changing to shipped, add fulfillment date
  const additionalData: Partial<Order> = {};
  if (status === OrderStatus.SHIPPED && order.status !== OrderStatus.SHIPPED) {
    additionalData.fulfillmentDate = new Date();
    
    // Send shipping notification
    sendNotification(
      NotificationType.SHIPPING, 
      `Order ${order.orderNumber} has been shipped`
    );
  }
  
  // If status is changing to delivered, add delivery date
  if (status === OrderStatus.DELIVERED && order.status !== OrderStatus.DELIVERED) {
    additionalData.deliveryDate = new Date();
    
    // Send delivery notification
    sendNotification(
      NotificationType.SHIPPING, 
      `Order ${order.orderNumber} has been delivered`
    );
  }
  
  return updateOrder(id, { status, ...additionalData });
};

// Update payment status
export const updatePaymentStatus = (id: string, paymentStatus: PaymentStatus): Order | undefined => {
  const order = getOrderById(id);
  
  if (!order) {
    return undefined;
  }
  
  // If payment status is changing to paid, send notification
  if (paymentStatus === PaymentStatus.PAID && order.paymentStatus !== PaymentStatus.PAID) {
    sendNotification(
      NotificationType.PAYMENT, 
      `Payment for order ${order.orderNumber} has been received`
    );
  }
  
  return updateOrder(id, { paymentStatus });
};

// Add shipment tracking
export const addShipmentTracking = (
  orderId: string, 
  trackingId: string, 
  provider: ShippingProvider,
  estimatedDelivery?: Date
): Order | undefined => {
  const order = getOrderById(orderId);
  
  if (!order) {
    return undefined;
  }
  
  const shipment: ShipmentTracking = {
    trackingId,
    provider,
    status: 'Processing',
    estimatedDelivery,
    events: [
      {
        timestamp: new Date(),
        status: 'Order Processed',
        description: 'Order has been processed and is ready for pickup'
      }
    ]
  };
  
  // Set tracking URL based on provider
  switch (provider) {
    case ShippingProvider.SHIPROCKET:
      shipment.trackingUrl = `https://shiprocket.co/tracking/${trackingId}`;
      break;
    case ShippingProvider.DHL:
      shipment.trackingUrl = `https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingId}`;
      break;
    case ShippingProvider.FEDEX:
      shipment.trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingId}`;
      break;
    case ShippingProvider.BLUEDART:
      shipment.trackingUrl = `https://www.bluedart.com/tracking?trackingNo=${trackingId}`;
      break;
    case ShippingProvider.DELHIVERY:
      shipment.trackingUrl = `https://www.delhivery.com/track/?track_id=${trackingId}`;
      break;
  }
  
  // Update order with shipment tracking
  const updatedOrder = updateOrder(orderId, { 
    shipment,
    status: OrderStatus.PROCESSING 
  });
  
  // Send notification
  sendNotification(
    NotificationType.SHIPPING, 
    `Tracking information added for order ${order.orderNumber}`
  );
  
  return updatedOrder;
};

// Update shipment tracking
export const updateShipmentTracking = (
  orderId: string, 
  status: string, 
  location?: string,
  description?: string
): Order | undefined => {
  const order = getOrderById(orderId);
  
  if (!order || !order.shipment) {
    return undefined;
  }
  
  // Add new tracking event
  const newEvent = {
    timestamp: new Date(),
    status,
    location,
    description
  };
  
  const updatedShipment: ShipmentTracking = {
    ...order.shipment,
    status,
    events: [...order.shipment.events, newEvent]
  };
  
  // Update order status based on shipment status
  let orderStatus = order.status;
  if (status.toLowerCase().includes('delivered')) {
    orderStatus = OrderStatus.DELIVERED;
  } else if (status.toLowerCase().includes('transit') || status.toLowerCase().includes('shipped')) {
    orderStatus = OrderStatus.SHIPPED;
  }
  
  // Update order with new shipment tracking
  const updatedOrder = updateOrder(orderId, { 
    shipment: updatedShipment,
    status: orderStatus
  });
  
  // Send notification
  sendNotification(
    NotificationType.SHIPPING, 
    `Shipment for order ${order.orderNumber} updated: ${status}`
  );
  
  return updatedOrder;
};

// Generate invoice PDF (mock function)
export const generateInvoice = (orderId: string): string => {
  const order = getOrderById(orderId);
  
  if (!order) {
    return '';
  }
  
  // In a real implementation, this would generate a PDF
  // For now, we'll just return a mock URL
  return `https://api.bell24h.com/invoices/${order.orderNumber}.pdf`;
};

// Generate packing slip PDF (mock function)
export const generatePackingSlip = (orderId: string): string => {
  const order = getOrderById(orderId);
  
  if (!order) {
    return '';
  }
  
  // In a real implementation, this would generate a PDF
  // For now, we'll just return a mock URL
  return `https://api.bell24h.com/packing-slips/${order.orderNumber}.pdf`;
};

// Initialize orders data
export const initializeOrdersData = (): void => {
  const storedOrders = localStorage.getItem('bell24h_orders');
  if (!storedOrders) {
    localStorage.setItem('bell24h_orders', JSON.stringify(mockOrders));
  }
};
