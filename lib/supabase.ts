// lib/supabase.ts - FIXED FOR CLIENT/SERVER COMPATIBILITY
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// ================================
// CLIENT-SIDE SUPABASE CLIENT (for 'use client' components)
// ================================
export const createClientSupabase = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// ================================
// SERVER-SIDE SUPABASE CLIENT (for server components)
// ================================
export const createServerSupabase = () => {
  const { cookies } = require('next/headers')
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  )
}

// ================================
// ADMIN CLIENT (for server-side operations)
// ================================
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// ================================
// REGULAR CLIENT (for simple operations)
// ================================
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey
)

// ================================
// DATABASE TYPES (your existing types preserved)
// ================================
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
      subscription_plans: {
        Row: {
          id: string
          name: string
          slug: string
          price_monthly: number
          price_yearly: number
          currency: string
          ecosystems: string[]
          features: any
          is_active: boolean
          max_ai_interactions: number
          created_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          price_monthly: number
          price_yearly: number
          currency: string
          ecosystems: string[]
          features?: any
          is_active?: boolean
          max_ai_interactions?: number
        }
        Update: {
          name?: string
          price_monthly?: number
          price_yearly?: number
          currency?: string
          ecosystems?: string[]
          features?: any
          is_active?: boolean
          max_ai_interactions?: number
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          stripe_subscription_id: string | null
          paypal_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          paypal_subscription_id?: string | null
        }
        Update: {
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          updated_at?: string
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

// ================================
// HELPER TYPES
// ================================
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific type exports for convenience
export type UserProfile = Tables<'user_profiles'>
export type UserEcosystem = Tables<'user_ecosystems'>
export type AIConversation = Tables<'ai_conversations'>
export type UserProgress = Tables<'user_progress'>
export type UserGoal = Tables<'user_goals'>
export type SubscriptionPlan = Tables<'subscription_plans'>
export type UserSubscription = Tables<'user_subscriptions'>

export default supabase