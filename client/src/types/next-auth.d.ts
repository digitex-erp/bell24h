
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: string | null | undefined;
      companyName?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string | null | undefined;
    companyName?: string;
  }
}
