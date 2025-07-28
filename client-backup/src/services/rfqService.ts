import axios from 'axios';

const API_BASE_URL = '/api/rfqs';

export interface RFQCreateData {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  specifications?: Array<{ key: string; value: string }>;
  notes?: string;
  expiryDate?: string;
}

export interface RFQUpdateData {
  quantity?: number;
  unit?: string;
  specifications?: Array<{ key: string; value: string }>;
  notes?: string;
  status?: 'draft' | 'submitted' | 'quoted' | 'expired' | 'cancelled';
  quotedPrice?: number;
  quotedCurrency?: string;
}

export interface RFQListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface RFQListResponse {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const createRFQ = async (data: RFQCreateData) => {
  const response = await axios.post(API_BASE_URL, data);
  return response.data;
};

export const getRFQ = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const updateRFQ = async (id: string, data: RFQUpdateData) => {
  const response = await axios.patch(`${API_BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteRFQ = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const listBuyerRFQs = async (params: RFQListParams = {}) => {
  const response = await axios.get(`${API_BASE_URL}/buyer/list`, { params });
  return response.data;
};

export const listSupplierRFQs = async (params: RFQListParams = {}) => {
  const response = await axios.get(`${API_BASE_URL}/supplier/list`, { params });
  return response.data;
};

export const acceptQuote = async (rfqId: string, quoteId: string) => {
  const response = await axios.patch(
    `${API_BASE_URL}/${rfqId}/quotes/${quoteId}/accept`
  );
  return response.data;
};

export const rejectQuote = async (rfqId: string, quoteId: string, reason: string) => {
  const response = await axios.patch(
    `${API_BASE_URL}/${rfqId}/quotes/${quoteId}/reject`,
    { reason }
  );
  return response.data;
};

export const uploadRFQAttachment = async (rfqId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${API_BASE_URL}/${rfqId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export const deleteRFQAttachment = async (rfqId: string, attachmentId: string) => {
  const response = await axios.delete(
    `${API_BASE_URL}/${rfqId}/attachments/${attachmentId}`
  );
  return response.data;
};
