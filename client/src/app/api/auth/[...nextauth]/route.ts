import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user && (await bcrypt.compare(credentials.password, user.password || ''))) {
          return { id: user.id, email: user.email, name: user.name };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Auto-create user and wallet for Google OAuth
        try {
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.name || user.email,
              isemailverified: true,
            },
            create: {
              email: user.email!,
              name: user.name || user.email!,
              hashedPassword: 'google_oauth', // marker for OAuth users
              role: 'BUYER',
              isemailverified: true,
              companyname: user.name || 'Google User',
            },
          });

          console.log(`✅ Google OAuth user created/updated: ${user.email}`);
          return true;
        } catch (error) {
          console.error('❌ Google OAuth user creation failed:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (user) {
          session.user.id = user.id;
          session.user.role = user.role;
          session.user.companyName = user.companyname;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.companyName = user.companyName;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
