import { z } from 'zod';

const API_BASE_URL = '/api';

// Response schemas for payment operations
export const walletResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  balance: z.string(),
  escrowBalance: z.string(),
  razorpayXId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const transactionResponseSchema = z.object({
  id: z.number(),
  walletId: z.number(),
  amount: z.string(),
  type: z.string(),
  status: z.string(),
  description: z.string().optional(),
  externalId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const invoiceResponseSchema = z.object({
  id: z.number(),
  supplierId: z.number(),
  buyerId: z.number(),
  amount: z.string(),
  dueDate: z.string(),
  status: z.string(),
  discountRate: z.string().nullable().optional(),
  discountedAmount: z.string().nullable().optional(),
  kredxReferenceId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type WalletResponse = z.infer<typeof walletResponseSchema>;
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;
export type InvoiceResponse = z.infer<typeof invoiceResponseSchema>;

// Get user wallet
export const getUserWallet = async (): Promise<WalletResponse> => {
  const response = await fetch(`${API_BASE_URL}/payments/wallet`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get wallet: ${errorText}`);
  }
  
  const data = await response.json();
  return walletResponseSchema.parse(data);
};

// Get wallet transactions
export const getWalletTransactions = async (limit: number = 10): Promise<TransactionResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/payments/transactions?limit=${limit}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get transactions: ${errorText}`);
  }
  
  const data = await response.json();
  return z.array(transactionResponseSchema).parse(data);
};

// Add funds to wallet
export const addFunds = async (amount: number): Promise<TransactionResponse> => {
  const response = await fetch(`${API_BASE_URL}/payments/add-funds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add funds: ${errorText}`);
  }
  
  const data = await response.json();
  return transactionResponseSchema.parse(data);
};

// Withdraw funds from wallet
export const withdrawFunds = async (amount: number): Promise<TransactionResponse> => {
  const response = await fetch(`${API_BASE_URL}/payments/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to withdraw funds: ${errorText}`);
  }
  
  const data = await response.json();
  return transactionResponseSchema.parse(data);
};

// Create escrow payment
export const createEscrowPayment = async (amount: number, description: string): Promise<TransactionResponse> => {
  const response = await fetch(`${API_BASE_URL}/payments/escrow/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, description }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create escrow payment: ${errorText}`);
  }
  
  const data = await response.json();
  return transactionResponseSchema.parse(data);
};

// Release escrow payment
export const releaseEscrowPayment = async (transactionId: number): Promise<TransactionResponse> => {
  const response = await fetch(`${API_BASE_URL}/payments/escrow/release/${transactionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to release escrow payment: ${errorText}`);
  }
  
  const data = await response.json();
  return transactionResponseSchema.parse(data);
};

// Get user invoices
export const getUserInvoices = async (): Promise<InvoiceResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/payments/invoices`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get invoices: ${errorText}`);
  }
  
  const data = await response.json();
  return z.array(invoiceResponseSchema).parse(data);
};

// Create new invoice
export const createInvoice = async (
  supplierId: number, 
  amount: number, 
  dueDate: string
): Promise<InvoiceResponse> => {
  const response = await fetch(`${API_BASE_URL}/payments/invoices/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ supplierId, amount, dueDate }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create invoice: ${errorText}`);
  }
  
  const data = await response.json();
  return invoiceResponseSchema.parse(data);
};

// Request invoice discounting via KredX
export const discountInvoice = async (invoiceId: number): Promise<InvoiceResponse> => {
  const response = await fetch(`${API_BASE_URL}/payments/invoices/discount/${invoiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to discount invoice: ${errorText}`);
  }
  
  const data = await response.json();
  return invoiceResponseSchema.parse(data);
};
