import { Session } from 'next-auth';
import { getSession as getNextAuthSession } from 'next-auth/react';

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  user?: {
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

let currentSession: ExtendedSession | null = null;

export const getSession = async (): Promise<ExtendedSession | null> => {
  if (currentSession) {
    return currentSession;
  }

  const session = await getNextAuthSession();
  if (session) {
    currentSession = session as ExtendedSession;
  }
  return currentSession;
};

export const updateSession = (session: ExtendedSession) => {
  currentSession = session;
};

export const clearSession = () => {
  currentSession = null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session?.accessToken;
};

export const hasRole = async (role: string): Promise<boolean> => {
  const session = await getSession();
  return session?.user?.role === role;
};

export const getUserId = async (): Promise<string | undefined> => {
  const session = await getSession();
  return session?.user?.id;
};

export const getCompanyId = async (): Promise<string | undefined> => {
  const session = await getSession();
  return session?.user?.company?.id;
}; 