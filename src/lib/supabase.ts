import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          is_admin: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          title: string
          description: string
          publisher_name: string
          contact_phone: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          publisher_name: string
          contact_phone: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          publisher_name?: string
          contact_phone?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Client for browser usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client for client components with auth
export const createSupabaseClient = () => createClientComponentClient<Database>()

// Client for server components with auth
export const createSupabaseServerClient = () => {
  const { cookies } = require('next/headers')
  return createServerComponentClient<Database>({ cookies })
}

// Admin client with service role key (for server-side admin operations)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
