import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Password is optional for the interface as it might not always be returned
  role: string;
}

declare global {
  var mockDB: User[];
}

// Mock database
const globalMockDB: User[] = global.mockDB || [
  {
    id: '1',
    email: 'user@example.com',
    name: 'Test User',
    password: 'password',
    role: 'user'
  }
];
global.mockDB = globalMockDB;

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Login attempt for email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = globalMockDB.find((u: User) => u.email === credentials.email);
        console.log('Found user:', user ? {...user, password: '***'} : null);

        if (user && user.password === credentials.password) {
          console.log('Login successful for user:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Force all cookies to be non-secure for development
  useSecureCookies: false,

  // Add explicit cookie settings to fix session persistence
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: false // Force non-secure for local development
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false // Force non-secure for local development
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false // Force non-secure for local development
      }
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      console.log('JWT callback - token:', token);
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      console.log('Session callback - session:', session);
      return session;
    }
  },










  pages: {
    signIn: '/login',
    error: '/login',
  },

  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
