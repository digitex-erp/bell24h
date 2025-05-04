import { apiRequest } from './queryClient';

// GST Validation API
export const validateGst = async (gstin: string) => {
  const res = await apiRequest('POST', '/api/gst/validate', { gstin });
  return await res.json();
};

export const getBusinessDetails = async (gstin: string) => {
  const res = await apiRequest('GET', `/api/gst/business-details/${gstin}`);
  return await res.json();
};

export const verifyInvoice = async (gstin: string, invoiceNumber: string, invoiceDate: string) => {
  const res = await apiRequest('POST', '/api/gst/verify-invoice', { gstin, invoiceNumber, invoiceDate });
  return await res.json();
};

export const bulkValidateGst = async (gstinList: string[]) => {
  const res = await apiRequest('POST', '/api/gst/bulk-validate', { gstinList });
  return await res.json();
};

// Voice RFQ API
export const transcribeAudio = async (audioData: string, language = 'en') => {
  const res = await apiRequest('POST', '/api/voice/transcribe', { audioData, language });
  return await res.json();
};

export const createRfqFromVoice = async (audioData: string, userId?: number, language = 'en') => {
  const res = await apiRequest('POST', '/api/voice/create-rfq', { audioData, userId, language });
  return await res.json();
};

export const processVoiceCommand = async (audioData: string, language = 'en') => {
  const res = await apiRequest('POST', '/api/voice/process-command', { audioData, language });
  return await res.json();
};

export const getSupportedLanguages = async () => {
  const res = await apiRequest('GET', '/api/voice/supported-languages');
  return await res.json();
};

// Payment API
export const discountInvoice = async (invoiceNumber: string, amount: string, dueDate: string, userId?: number) => {
  const res = await apiRequest('POST', '/api/payment/kredx/discount-invoice', { invoiceNumber, amount, dueDate, userId });
  return await res.json();
};

export const getKredxRates = async () => {
  const res = await apiRequest('GET', '/api/payment/kredx/rates');
  return await res.json();
};

export const initiateBlockchainPayment = async (amount: string, type: string, userId?: number) => {
  const res = await apiRequest('POST', '/api/payment/blockchain/initiate', { amount, type, userId });
  return await res.json();
};

export const checkBlockchainTransactionStatus = async (transactionHash: string) => {
  const res = await apiRequest('GET', `/api/payment/blockchain/status/${transactionHash}`);
  return await res.json();
};

export const getUserBlockchainTransactions = async (userId: number) => {
  const res = await apiRequest('GET', `/api/payment/blockchain/transactions/${userId}`);
  return await res.json();
};

// Dashboard API
export const getProjectCompletion = async () => {
  const res = await apiRequest('GET', '/api/dashboard/completion');
  return await res.json();
};

export const getPriorityTasks = async () => {
  const res = await apiRequest('GET', '/api/dashboard/priority-tasks');
  return await res.json();
};

export const getIntegrationStatus = async () => {
  const res = await apiRequest('GET', '/api/dashboard/integration-status');
  return await res.json();
};

export const getSystemHealth = async () => {
  const res = await apiRequest('GET', '/api/dashboard/system-health');
  return await res.json();
};

export const getTaskDetails = async (taskId: number) => {
  const res = await apiRequest('GET', `/api/dashboard/task/${taskId}`);
  return await res.json();
};

export const updateTaskStatus = async (taskId: number, status?: string, completion?: number) => {
  const res = await apiRequest('PUT', `/api/dashboard/task/${taskId}`, { status, completion });
  return await res.json();
};
