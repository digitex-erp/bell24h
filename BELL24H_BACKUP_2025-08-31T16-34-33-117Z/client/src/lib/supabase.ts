import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zxwfvvkdsgmrambmugkz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Check if we have valid Supabase credentials
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co' || supabaseUrl === 'https://zxwfvvkdsgmrambmugkz.supabase.co') {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL is not properly configured. Please set it in your .env.local file.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key' || supabaseAnonKey === 'your-anon-key-here') {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY is not properly configured. Please set it in your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    console.error('Supabase auth error:', error)
    return { data: null, error: { message: 'Authentication service unavailable. Please check your configuration.' } }
  }
}

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    console.error('Supabase auth error:', error)
    return { data: null, error: { message: 'Authentication service unavailable. Please check your configuration.' } }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('Supabase signout error:', error)
    return { error: { message: 'Sign out failed. Please check your configuration.' } }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Supabase getCurrentUser error:', error)
    return null
  }
}

// Database types for TypeScript
export interface User {
  id: string;
  email: string;
  company_name?: string;
  business_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  company_name: string;
  business_type: string;
  contact_email: string;
  phone?: string;
  address?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}
