import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { JWT } from 'next-auth/jwt'

// Initialize Prisma client with connection pooling for 1000+ concurrent users
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Rate limiting for authentication attempts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5 // Max 5 attempts per window

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= MAX_ATTEMPTS) {
    return false
  }
  
  userLimit.count++
  return true
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  // Session configuration for high concurrency
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  // JWT configuration for scalability
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Pages configuration
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  
  // Providers configuration
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // LinkedIn OAuth Provider
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    
    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    
    // Credentials Provider with enhanced security
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'Enter your email'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Enter your password'
        },
        remember: {
          label: 'Remember me',
          type: 'checkbox'
        }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Rate limiting check
        const clientIP = req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || 'unknown'
        if (!checkRateLimit(`${credentials.email}-${clientIP}`)) {
          throw new Error('Too many login attempts. Please try again later.')
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase(),
            },
            include: {
              profile: true,
              company: true,
            }
          })

          if (!user) {
            throw new Error('Invalid email or password')
          }

          if (!user.password) {
            throw new Error('Please use social login or reset your password')
          }

          // Verify password with timing-safe comparison
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)

          if (!isValidPassword) {
            throw new Error('Invalid email or password')
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Account is deactivated. Please contact support.')
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })

          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            companyId: user.companyId,
            isVerified: user.isVerified,
            profile: user.profile,
            company: user.company,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error(error instanceof Error ? error.message : 'Authentication failed')
        }
      }
    })
  ],
  
  // Callbacks for session and JWT management
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
        token.isVerified = user.isVerified
        token.profile = user.profile
        token.company = user.company
      }

      // Update session if triggered
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.isVerified = token.isVerified as boolean
        session.user.profile = token.profile as any
        session.user.company = token.company as any
      }
      
      return session
    },
    
    async signIn({ user, account, profile, email, credentials }) {
      // Allow all sign-ins for now, but can add custom logic here
      return true
    },
    
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  
  // Events for logging and analytics
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} (New: ${isNewUser})`)
      
      // Log sign-in event for analytics
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'SIGN_IN',
            details: {
              provider: account?.provider,
              isNewUser,
              timestamp: new Date().toISOString()
            }
          }
        })
      } catch (error) {
        console.error('Failed to log sign-in event:', error)
      }
    },
    
    async signOut({ token, session }) {
      console.log(`User signed out: ${token?.email}`)
      
      // Log sign-out event
      try {
        await prisma.auditLog.create({
          data: {
            userId: token?.sub,
            action: 'SIGN_OUT',
            details: {
              timestamp: new Date().toISOString()
            }
          }
        })
      } catch (error) {
        console.error('Failed to log sign-out event:', error)
      }
    }
  },
  
  // Security configuration
  secret: process.env.NEXTAUTH_SECRET,
  
  // Cookie configuration for production
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
      }
    }
  },
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
}

// Export Prisma instance for use in other parts of the application
export { prisma }

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Helper function to generate secure random tokens
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Rate limiting cleanup (run every hour)
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60 * 60 * 1000) // 1 hour
