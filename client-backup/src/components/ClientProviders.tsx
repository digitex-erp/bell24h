"use client";

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { AuthProvider } from '@/context/auth/AuthContext';

export default function ClientProviders({
  session,
  children,
}: {
  session?: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}