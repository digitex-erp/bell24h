/**
 * InsForge Client Configuration
 * Backend-as-a-Service integration for Bell24h
 *
 * This replaces manual Prisma/PostgreSQL setup with auto-generated APIs
 */

import { createClient } from '@insforge/supabase-js'

// Environment variables required:
// NEXT_PUBLIC_INSFORGE_URL - Your InsForge project URL
// NEXT_PUBLIC_INSFORGE_ANON_KEY - Your InsForge anonymous key
// INSFORGE_SERVICE_ROLE_KEY - Service role key (server-side only)

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY

if (!insforgeUrl || !insforgeAnonKey) {
  throw new Error(
    'Missing InsForge environment variables. Please check .env.local:\n' +
    '- NEXT_PUBLIC_INSFORGE_URL\n' +
    '- NEXT_PUBLIC_INSFORGE_ANON_KEY'
  )
}

/**
 * InsForge client for client-side and server-side usage
 * Auto-generates REST API from PostgreSQL schema
 * Includes Row Level Security (RLS) for data isolation
 */
export const insforge = createClient(insforgeUrl, insforgeAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application': 'bell24h-platform'
    }
  }
})

/**
 * Server-side admin client with elevated privileges
 * Use this for operations that bypass RLS (admin tasks)
 */
export const insforgeAdmin = createClient(
  insforgeUrl,
  process.env.INSFORGE_SERVICE_ROLE_KEY || insforgeAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Type-safe database schema types
 * These will be auto-generated from your InsForge schema
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          email: string | null
          full_name: string | null
          company_name: string | null
          user_type: 'buyer' | 'supplier' | 'both'
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      rfqs: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          type: 'text' | 'voice' | 'video' | 'image'
          audio_url: string | null
          video_url: string | null
          transcription: string | null
          extracted_data: any
          status: 'open' | 'closed' | 'awarded' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['rfqs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['rfqs']['Insert']>
      }
      quotes: {
        Row: {
          id: string
          rfq_id: string
          supplier_id: string
          price: number
          currency: string
          delivery_days: number
          message: string | null
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>
      }
      otp_verifications: {
        Row: {
          id: string
          phone: string
          otp: string
          expires_at: string
          verified: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['otp_verifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['otp_verifications']['Insert']>
      }
    }
  }
}

/**
 * Helper function to handle InsForge errors
 */
export function handleInsForgeError(error: any) {
  console.error('InsForge Error:', error)

  if (error.code === 'PGRST116') {
    return { error: 'No data found', code: 404 }
  }

  if (error.code === '23505') {
    return { error: 'Duplicate entry', code: 409 }
  }

  if (error.code === '42501') {
    return { error: 'Permission denied', code: 403 }
  }

  return { error: error.message || 'Database error', code: 500 }
}

/**
 * Type-safe query builder helpers
 */
export const db = {
  users: () => insforge.from('users'),
  rfqs: () => insforge.from('rfqs'),
  quotes: () => insforge.from('quotes'),
  otps: () => insforge.from('otp_verifications'),
  transactions: () => insforge.from('transactions'),
  notifications: () => insforge.from('notifications'),
  categories: () => insforge.from('categories'),
  suppliers: () => insforge.from('suppliers'),
  reviews: () => insforge.from('reviews'),
  commissions: () => insforge.from('commissions'),
  referrals: () => insforge.from('referrals'),
  invoices: () => insforge.from('invoices'),
  chat_messages: () => insforge.from('chat_messages'),
  audit_logs: () => insforge.from('audit_logs'),
  ai_explanations: () => insforge.from('ai_explanations')
}

export default insforge
