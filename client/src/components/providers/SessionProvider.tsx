'use client';

import { ReactNode, createContext, useContext } from 'react';

// Simple mock session context
const SessionContext = createContext<any>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const mockSession = {
    data: null,
    status: 'unauthenticated',
    update: () => Promise.resolve(),
  };

  return <SessionContext.Provider value={mockSession}>{children}</SessionContext.Provider>;
}

export function () => ({ data: { user: { id: "demo", email: "demo@bell24h.com", name: "Demo User" } }, status: "authenticated" }) {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
