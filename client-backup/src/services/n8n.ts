import axios from 'axios';

const API_URL = process.env.REACT_APP_N8N_API_URL || 'https://your-n8n-cloud-instance.com';
const API_KEY = process.env.REACT_APP_N8N_API_KEY;

const n8nClient = axios.create({
  baseURL: API_URL,
  headers: {
    'X-N8N-API-KEY': API_KEY,
    'Content-Type': 'application/json'
  }
});

export const n8nService = {
  // Workflow Management
  getWorkflows: async () => {
    const response = await n8nClient.get('/workflows');
    return response.data;
  },

  getWorkflow: async (id: string) => {
    const response = await n8nClient.get(`/workflows/${id}`);
    return response.data;
  },

  createWorkflow: async (workflow: any) => {
    const response = await n8nClient.post('/workflows', workflow);
    return response.data;
  },

  updateWorkflow: async (id: string, workflow: any) => {
    const response = await n8nClient.put(`/workflows/${id}`, workflow);
    return response.data;
  },

  deleteWorkflow: async (id: string) => {
    await n8nClient.delete(`/workflows/${id}`);
  },

  // Workflow Execution
  executeWorkflow: async (id: string, data?: any) => {
    const response = await n8nClient.post(`/workflows/${id}/execute`, { data });
    return response.data;
  },

  getWorkflowExecutions: async (id: string) => {
    const response = await n8nClient.get(`/workflows/${id}/executions`);
    return response.data;
  },

  // Statistics
  getWorkflowStats: async (id: string, startDate?: Date, endDate?: Date) => {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    const response = await n8nClient.get(`/workflows/${id}/stats`, { params });
    return response.data;
  },

  getSystemStats: async () => {
    const response = await n8nClient.get('/stats');
    return response.data;
  }
}; 