import { api } from './api';
import { updateSession, clearSession } from '@/lib/session';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName: string;
  companyType: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    company?: {
      id: string;
      name: string;
      type: string;
    };
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  updateSession(response.data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  updateSession(response.data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    clearSession();
  }
};

export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
  updateSession(response.data);
  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  await api.post('/auth/reset-password', { token, password });
};

export const verifyEmail = async (token: string): Promise<void> => {
  await api.post('/auth/verify-email', { token });
};

export const resendVerification = async (email: string): Promise<void> => {
  await api.post('/auth/resend-verification', { email });
}; 