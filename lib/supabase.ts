// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for client components
export const createClientSupabase = () => createClientComponentClient()

// Client for server components
export const createServerSupabase = () => createServerComponentClient({ cookies })

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Regular client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID)
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'starter' | 'pro' | 'complete'
          subscription_status: 'active' | 'canceled' | 'past_due'
          country_code: string | null
          created_at: string
          updated_at: string
          onboarding_completed: boolean
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'starter' | 'pro' | 'complete'
          subscription_status?: 'active' | 'canceled' | 'past_due'
          country_code?: string | null
          onboarding_completed?: boolean
          stripe_customer_id?: string | null
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'starter' | 'pro' | 'complete'
          subscription_status?: 'active' | 'canceled' | 'past_due'
          country_code?: string | null
          onboarding_completed?: boolean
          stripe_customer_id?: string | null
          updated_at?: string
        }
      }
      user_ecosystems: {
        Row: {
          id: string
          user_id: string
          ecosystem: 'por-health' | 'por-kids' | 'por-mind' | 'por-well' | 'por-flow' | 'por-blu'
          access_level: 'free' | 'premium' | 'locked'
          activated_at: string
          expires_at: string | null
        }
        Insert: {
          user_id: string
          ecosystem: 'por-health' | 'por-kids' | 'por-mind' | 'por-well' | 'por-flow' | 'por-blu'
          access_level?: 'free' | 'premium' | 'locked'
          expires_at?: string | null
        }
        Update: {
          access_level?: 'free' | 'premium' | 'locked'
          expires_at?: string | null
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          ecosystem: 'por-health' | 'por-kids' | 'por-mind' | 'por-well' | 'por-flow' | 'por-blu' | 'quantum-vault'
          title: string | null
          messages: any[]
          context_data: any
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          user_id: string
          ecosystem: 'por-health' | 'por-kids' | 'por-mind' | 'por-well' | 'por-flow' | 'por-blu' | 'quantum-vault'
          title?: string | null
          messages?: any[]
          context_data?: any
          is_active?: boolean
        }
        Update: {
          title?: string | null
          messages?: any[]
          context_data?: any
          updated_at?: string
          is_active?: boolean
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          ecosystem: 'por-health' | 'por-kids' | 'por-mind' | 'por-well' | 'por-flow' | 'por-blu'
          progress_type: string
          progress_data: any
          score: number
          created_at: string
          date_recorded: string
        }
        Insert: {
          user_id: string
          ecosystem: 'por-health' | 'por-kids' | 'por-mind' | 'por-well' | 'por-flow' | 'por-blu'
          progress_type: string
          progress_data?: any
          score?: number
          date_recorded?: string
        }
        Update: {
          progress_data?: any
          score?: number
        }
      }
      user_goals: {
        Row: {
          id: string
          user_id: string
          ecosystem: 'por-health' | 'por-kids' | 'por-mind' | 'por-well' | 'por-flow' | 'por-blu'
          goal_type: string
          title: string
          description: string | null
          target_value: number | null
          current_value: number
          unit: string | null
          target_date: string | null
          status: 'active' | 'completed' | 'paused' | 'failed'
          priority: number
          created_at: string
          completed_at: string | null
        }
        Insert: {
          user_id: string
          ecosystem: 'por-health' | 'por-kids' | 'por-mind' | 'por-well' | 'por-flow' | 'por-blu'
          goal_type: string
          title: string
          description?: string | null
          target_value?: number | null
          current_value?: number
          unit?: string | null
          target_date?: string | null
          status?: 'active' | 'completed' | 'paused' | 'failed'
          priority?: number
        }
        Update: {
          title?: string
          description?: string | null
          target_value?: number | null
          current_value?: number
          unit?: string | null
          target_date?: string | null
          status?: 'active' | 'completed' | 'paused' | 'failed'
          priority?: number
          completed_at?: string | null
        }
      }
    }
    Views: {
      user_dashboard_summary: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          subscription_tier: 'free' | 'starter' | 'pro' | 'complete'
          onboarding_completed: boolean
          total_ecosystems: number
          premium_ecosystems: number
          has_quantum_access: boolean
          overall_progress: number
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      has_trinity_combo: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      calculate_overall_progress: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_user_active_ecosystems: {
        Args: { user_uuid: string }
        Returns: {
          ecosystem: string
          access_level: string
          activated_at: string
        }[]
      }
    }
  }
}