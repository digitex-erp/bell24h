import { apiRequest } from "./queryClient";

// User authentication
export async function login(username: string, password: string) {
  return apiRequest("POST", "/api/auth/login", { username, password });
}

export async function logout() {
  return apiRequest("POST", "/api/auth/logout");
}

export async function register(userData: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  company?: string;
  role?: string;
}) {
  return apiRequest("POST", "/api/auth/register", userData);
}

// RFQ endpoints
export async function createRfq(rfqData: {
  rfqNumber: string;
  product: string;
  quantity: string;
  status?: string;
  dueDate?: Date;
  description?: string;
  videoUrl?: string;
}) {
  return apiRequest("POST", "/api/rfqs", rfqData);
}

// Quote endpoints
export async function createQuote(quoteData: {
  rfqId: number;
  supplierId: number;
  price: string;
  deliveryTime: string;
  status?: string;
  notes?: string;
}) {
  return apiRequest("POST", "/api/quotes", quoteData);
}

// Supplier endpoints
export async function createSupplier(supplierData: {
  name: string;
  location: string;
  category: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  riskScore?: number;
  financialStability?: number;
  qualityControl?: number;
  deliveryRecord?: number;
  complianceRisk?: number;
}) {
  return apiRequest("POST", "/api/suppliers", supplierData);
}

// Shipment endpoints
export async function createShipment(shipmentData: {
  shipmentNumber: string;
  rfqId: number;
  supplierId: number;
  status?: string;
  expectedDelivery?: Date;
  origin: string;
  destination: string;
  trackingSteps?: any;
  trackingProgress?: number;
  trackingUrl?: string;
}) {
  return apiRequest("POST", "/api/shipments", shipmentData);
}

// Payment endpoints
export async function createMilestonePayment(paymentData: {
  rfqId: number;
  supplierId: number;
  amount: string;
  status?: string;
  milestoneNumber?: number;
  milestoneTotal?: number;
  milestonePercent?: number;
}) {
  return apiRequest("POST", "/api/payments/milestone", paymentData);
}

export async function createInvoiceDiscount(invoiceData: {
  invoiceNumber: string;
  amount: string;
  dueDate: Date;
  supplierId: number;
}) {
  return apiRequest("POST", "/api/payments/invoice-discount", invoiceData);
}

// Activity endpoints
export async function createActivity(activityData: {
  type: string;
  description: string;
  referenceId?: number;
  referenceType?: string;
}) {
  return apiRequest("POST", "/api/activities", activityData);
}

// Supplier recommendation endpoints
export async function createSupplierRecommendation(recommendationData: {
  rfqId: number;
  supplierId: number;
  matchScore: number;
  shapValues: any;
}) {
  return apiRequest("POST", "/api/supplier-recommendations", recommendationData);
}
