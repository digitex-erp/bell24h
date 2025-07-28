import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const prisma = new PrismaClient();

// Production authentication configuration
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Validate email format
          const emailSchema = z.string().email();
          emailSchema.parse(credentials.email);

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: {
              company: true,
            },
          });

          if (!user) {
            throw new Error('Invalid credentials');
          }

          // Check if user is verified (for production)
          if (process.env.NODE_ENV === 'production' && !user.emailVerified) {
            throw new Error('Please verify your email before logging in');
          }

          // Verify password with bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, user.password || '');

          if (!isValidPassword) {
            throw new Error('Invalid credentials');
          }

          // Check for account lockout (implement rate limiting)
          if (user.failedLoginAttempts && user.failedLoginAttempts >= 5) {
            const lockoutTime = user.lastFailedLogin
              ? new Date(user.lastFailedLogin).getTime() + 15 * 60 * 1000
              : 0;
            if (Date.now() < lockoutTime) {
              throw new Error('Account temporarily locked. Please try again in 15 minutes');
            }
          }

          // Reset failed login attempts on successful login
          if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: 0,
                lastFailedLogin: null,
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            company: user.company,
            isVerified: user.emailVerified,
            lastLogin: new Date(),
          };
        } catch (error) {
          // Log failed login attempts
          if (error instanceof Error && error.message === 'Invalid credentials') {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email.toLowerCase() },
            });

            if (user) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  failedLoginAttempts: (user.failedLoginAttempts || 0) + 1,
                  lastFailedLogin: new Date(),
                },
              });
            }
          }

          console.error('Authentication error:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.company = user.company;
        token.isVerified = user.isVerified;
        token.lastLogin = user.lastLogin;
      }

      // Update last login time
      if (token.id && !token.lastLogin) {
        await prisma.user.update({
          where: { id: token.id },
          data: { lastLogin: new Date() },
        });
      }

      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.company = token.company;
        session.user.isVerified = token.isVerified;
        session.user.lastLogin = token.lastLogin;
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      // Log sign-in events for security monitoring
      console.log(`User sign-in: ${user.email} via ${account?.provider || 'credentials'}`);

      // Additional security checks for production
      if (process.env.NODE_ENV === 'production') {
        // Check for suspicious activity
        const recentLogins = await prisma.user.findMany({
          where: {
            lastLogin: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        // Implement additional security measures here
      }

      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

export class AuthService {
  private static readonly TOKEN_KEY = 'auth-token';
  private static readonly USER_KEY = 'user-data';

  // Set authentication token
  static setToken(token: string) {
    if (typeof window !== 'undefined') {
      document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=86400; secure; samesite=strict`;
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // Get authentication token
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // Remove authentication token
  static clearToken() {
    if (typeof window !== 'undefined') {
      document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Set user data
  static setUser(userData: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    }
  }

  // Get user data
  static getUser(): any | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Login user
  static async login(email: string, password: string) {
    // Simulate API call - replace with real authentication
    if (email && password) {
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUser = {
        id: 1,
        email,
        name: 'Demo User',
        companyName: 'Demo Company',
        verified: true,
      };

      this.setToken(mockToken);
      this.setUser(mockUser);
      return { success: true, user: mockUser };
    }
    throw new Error('Invalid credentials');
  }

  // Logout user
  static logout() {
    this.clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
}
