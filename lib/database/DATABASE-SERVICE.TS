// lib/database/database-service.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SecurityService } from '../security/security-service'

type Json = Record<string, any> | any[] | string | number | boolean | null

export class DatabaseService {
  getSupabaseAdmin() {
    throw new Error('Method not implemented.');
  }
  checkTrinityUnlock(userId: string) {
    throw new Error('Method not implemented.');
  }
  logUserActivity(userId: string, arg1: string, arg2: string, arg3: { severity: "high" | "critical"; context: any; timestamp: string; priority: string }) {
    throw new Error('Method not implemented.')
  }
  private supabaseAdmin: SupabaseClient
  private security?: SecurityService

  constructor(
    supabaseAdmin?: SupabaseClient,
    securityService?: SecurityService
  ) {
    this.supabaseAdmin =
      supabaseAdmin ||
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: { autoRefreshToken: false, persistSession: false },
        }
      )

    // Folosim ce primim; dacă nu primim, mergem fără sanitizare (safe default).
    this.security = securityService
  }

  // ---------- helpers ----------
  private deepSanitize<T>(obj: T): T {
    if (!this.security || typeof obj !== 'object' || obj === null) return obj
    const sanitizeStr = (s: string) =>
      (this.security as any).sanitizeInput ? (this.security as any).sanitizeInput(s) : s
    const walk = (value: any): any => {
      if (typeof value === 'string') return sanitizeStr(value)
      if (Array.isArray(value)) return value.map(walk)
      if (value && typeof value === 'object') {
        const out: any = {}
        for (const k of Object.keys(value)) out[k] = walk(value[k])
        return out
      }
      return value
    }
    return walk(obj)
  }

  // ================================
  // USER MANAGEMENT
  // ================================
  async createUserProfile(userData: {
    userId: string
    email: string
    firstName?: string
    lastName?: string
    country?: string
  }) {
    try {
      const sanitized = this.deepSanitize(userData)
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .insert({
          id: sanitized.userId,
          email: sanitized.email,
          first_name: sanitized.firstName,
          last_name: sanitized.lastName,
          country_code: sanitized.country,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true as const, data }
    } catch (err: any) {
      console.error('Create user profile error:', err)
      return { success: false as const, error: String(err.message || err) }
    }
  }

  async updateUserProfile(userId: string, updates: Json) {
    try {
      const sanitized = this.deepSanitize(updates)
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .update({ ...(sanitized as object), updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true as const, data }
    } catch (err: any) {
      console.error('Update user profile error:', err)
      return { success: false as const, error: String(err.message || err) }
    }
  }

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { success: true as const, data }
    } catch (err: any) {
      console.error('Get user profile error:', err)
      return { success: false as const, error: String(err.message || err) }
    }
  }

  // ================================
  // SUBSCRIPTION MANAGEMENT
  // ================================
  async createSubscription(subscriptionData: {
    userId: string
    planId: string
    stripeSubscriptionId?: string
    paypalSubscriptionId?: string
    status: 'active' | 'trialing' | 'canceled' | 'past_due'
    currentPeriodStart: Date
    currentPeriodEnd: Date
  }) {
    try {
      const s = this.deepSanitize(subscriptionData)
      const { data, error } = await this.supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: s.userId,
          plan_id: s.planId,
          stripe_subscription_id: s.stripeSubscriptionId,
          paypal_subscription_id: s.paypalSubscriptionId,
          status: s.status,
          current_period_start: new Date(s.currentPeriodStart).toISOString(),
          current_period_end: new Date(s.currentPeriodEnd).toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true as const, data }
    } catch (err: any) {
      console.error('Create subscription error:', err)
      return { success: false as const, error: String(err.message || err) }
    }
  }

  async updateSubscription(stripeSubscriptionId: string, updates: Json) {
    try {
      const s = this.deepSanitize(updates)
      const { data, error } = await this.supabaseAdmin
        .from('user_subscriptions')
        .update({ ...(typeof s === 'object' && s !== null ? s : {}), updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .select()
        .single()

      if (error) throw error
      return { success: true as const, data }
    } catch (err: any) {
          console.error('Update subscription error:', err)
          return { success: false as const, error: String(err?.message || err) }
    }
  }
}
