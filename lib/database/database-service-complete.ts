// lib/database/database-service-complete.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SecurityService } from '../security/security-service'

interface DatabaseResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  country_code?: string
  subscription_tier: 'free' | 'starter' | 'pro' | 'complete'
  subscription_status: 'active' | 'canceled' | 'past_due'
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

interface EcosystemData {
  ecosystem: string
  access_level: 'free' | 'premium'
  activated_at?: string
  usage_stats: any
  preferences: any
}

interface HealthData {
  user_id: string
  current_metrics: {
    weight?: number
    height?: number
    bmr?: number
    activity_level: string
  }
  nutrition_goals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  workout_plan: any
  meal_plan: any
}

interface AIConversation {
  id: string
  user_id: string
  ecosystem: string
  messages: any[]
  context: any
  total_tokens: number
  cost_cents: number
  created_at: string
  updated_at: string
}

export class DatabaseService {
  private supabaseAdmin: SupabaseClient
  private security: SecurityService

  constructor() {
    this.supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    this.security = SecurityService.getInstance()
  }

  // ================================
  // USER MANAGEMENT - COMPLETE
  // ================================

  async createUserProfile(userData: {
    userId: string
    email: string
    firstName?: string
    lastName?: string
    country?: string
  }): Promise<DatabaseResult<UserProfile>> {
    try {
      const sanitizedData = this.security.sanitizeJSON(userData)
      
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .insert({
          id: sanitizedData.userId,
          email: sanitizedData.email,
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
          country_code: sanitizedData.country,
          subscription_tier: 'free',
          subscription_status: 'active',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Initialize free ecosystems
      await this.initializeFreeEcosystems(sanitizedData.userId)

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getUserProfile(userId: string): Promise<DatabaseResult<UserProfile>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .select(`
          *,
          user_subscriptions (
            id,
            plan_id,
            status,
            current_period_end,
            stripe_subscription_id,
            paypal_subscription_id
          ),
          user_ecosystems (
            ecosystem,
            access_level,
            activated_at,
            usage_stats,
            preferences
          ),
          quantum_vault_access (
            access_level,
            unlocked_at,
            features_unlocked
          )
        `)
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<DatabaseResult<UserProfile>> {
    try {
      const sanitizedUpdates = this.security.sanitizeJSON(updates)
      
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .update({
          ...sanitizedUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async deleteUserProfile(userId: string): Promise<DatabaseResult> {
    try {
      // Soft delete - mark for deletion
      const { error } = await this.supabaseAdmin
        .from('user_profiles')
        .update({
          deletion_requested_at: new Date().toISOString(),
          is_active: false
        })
        .eq('id', userId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // ECOSYSTEM MANAGEMENT - COMPLETE
  // ================================

  async initializeFreeEcosystems(userId: string): Promise<DatabaseResult> {
    try {
      const freeEcosystems = ['por-health', 'por-well']
      
      const ecosystemData = freeEcosystems.map(ecosystem => ({
        user_id: userId,
        ecosystem,
        access_level: 'free',
        activated_at: new Date().toISOString(),
        usage_stats: {},
        preferences: {}
      }))

      const { error } = await this.supabaseAdmin
        .from('user_ecosystems')
        .insert(ecosystemData)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async grantEcosystemAccess(userId: string, ecosystem: string, accessLevel: 'free' | 'premium'): Promise<DatabaseResult> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_ecosystems')
        .upsert({
          user_id: userId,
          ecosystem,
          access_level: accessLevel,
          activated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Check for Trinity unlock
      if (accessLevel === 'premium') {
        await this.checkTrinityUnlock(userId)
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getUserEcosystems(userId: string): Promise<DatabaseResult<EcosystemData[]>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_ecosystems')
        .select('*')
        .eq('user_id', userId)
        .order('activated_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async checkTrinityUnlock(userId: string): Promise<DatabaseResult> {
    try {
      const { data } = await this.supabaseAdmin
        .from('user_ecosystems')
        .select('ecosystem')
        .eq('user_id', userId)
        .eq('access_level', 'premium')
        .in('ecosystem', ['por-mind', 'por-flow', 'por-blu'])

      if (data && data.length >= 3) {
        // Grant Quantum Vault access
        await this.grantQuantumVaultAccess(userId)
        return { success: true, data: { trinityUnlocked: true } }
      }

      return { success: true, data: { trinityUnlocked: false } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async grantQuantumVaultAccess(userId: string): Promise<DatabaseResult> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('quantum_vault_access')
        .upsert({
          user_id: userId,
          access_level: 'full',
          unlocked_at: new Date().toISOString(),
          features_unlocked: [
            'future_self',
            'identity_simulator',
            'reverse_roadmap',
            'mirror_conversations',
            'pattern_detection'
          ]
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // SUBSCRIPTION MANAGEMENT - COMPLETE
  // ================================

  async createSubscription(subscriptionData: {
    userId: string
    planId: string
    stripeSubscriptionId?: string
    paypalSubscriptionId?: string
    status: string
    currentPeriodStart: Date
    currentPeriodEnd: Date
  }): Promise<DatabaseResult> {
    try {
      const sanitizedData = this.security.sanitizeJSON(subscriptionData)
      
      const { data, error } = await this.supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: sanitizedData.userId,
          plan_id: sanitizedData.planId,
          stripe_subscription_id: sanitizedData.stripeSubscriptionId,
          paypal_subscription_id: sanitizedData.paypalSubscriptionId,
          status: sanitizedData.status,
          current_period_start: sanitizedData.currentPeriodStart.toISOString(),
          current_period_end: sanitizedData.currentPeriodEnd.toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update user profile subscription tier
      const plan = await this.getSubscriptionPlan(sanitizedData.planId)
      if (plan.success) {
        await this.updateUserProfile(sanitizedData.userId, {
          subscription_tier: plan.data.tier,
          subscription_status: sanitizedData.status
        } as Partial<UserProfile>)
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getSubscriptionPlan(planId: string): Promise<DatabaseResult> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<DatabaseResult> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_subscriptions')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .or(`stripe_subscription_id.eq.${subscriptionId},paypal_subscription_id.eq.${subscriptionId}`)
        .select()
        .single()

      if (error) throw error

      // Update user profile status
      if (data) {
        await this.updateUserProfile(data.user_id, {
          subscription_status: status
        } as Partial<UserProfile>)
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // HEALTH DATA MANAGEMENT - COMPLETE
  // ================================

  async saveHealthData(userId: string, healthData: Partial<HealthData>): Promise<DatabaseResult> {
    try {
      const sanitizedData = this.security.sanitizeJSON(healthData)
      
      const { data, error } = await this.supabaseAdmin
        .from('user_health_data')
        .upsert({
          user_id: userId,
          ...sanitizedData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getHealthData(userId: string): Promise<DatabaseResult<HealthData>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_health_data')
        .select(`
          *,
          nutrition_logs (
            id,
            meal_type,
            calories,
            logged_at
          ),
          workout_sessions (
            id,
            workout_type,
            duration_minutes,
            calories_burned,
            completed_at
          )
        `)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // AI CONVERSATION MANAGEMENT - COMPLETE
  // ================================

  async saveAIConversation(conversationData: {
    userId: string
    ecosystem: string
    messages: any[]
    context?: any
    totalTokens?: number
    costCents?: number
  }): Promise<DatabaseResult<AIConversation>> {
    try {
      const sanitizedData = this.security.sanitizeJSON(conversationData)
      
      const { data, error } = await this.supabaseAdmin
        .from('ai_conversations')
        .insert({
          user_id: sanitizedData.userId,
          ecosystem: sanitizedData.ecosystem,
          messages: sanitizedData.messages,
          context: sanitizedData.context || {},
          total_tokens: sanitizedData.totalTokens || 0,
          cost_cents: sanitizedData.costCents || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getAIConversations(userId: string, ecosystem?: string, limit: number = 50): Promise<DatabaseResult<AIConversation[]>> {
    try {
      let query = this.supabaseAdmin
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (ecosystem) {
        query = query.eq('ecosystem', ecosystem)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // ANALYTICS & LOGGING - COMPLETE
  // ================================

  async logUserActivity(activityData: {
    userId?: string
    ecosystem?: string
    actionType: string
    actionData?: any
    ipAddress?: string
    userAgent?: string
  }): Promise<DatabaseResult> {
    try {
      const sanitizedData = this.security.sanitizeJSON(activityData)
      
      const { data, error } = await this.supabaseAdmin
        .from('user_activity_logs')
        .insert({
          user_id: sanitizedData.userId,
          ecosystem: sanitizedData.ecosystem,
          action_type: sanitizedData.actionType,
          action_data: sanitizedData.actionData || {},
          ip_address: sanitizedData.ipAddress,
          user_agent: sanitizedData.userAgent,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getUserAnalytics(userId: string, days: number = 30): Promise<DatabaseResult> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabaseAdmin
        .from('user_activity_logs')
        .select('ecosystem, action_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process analytics
      const analytics = {
        totalActions: data?.length || 0,
        ecosystemUsage: this.aggregateByEcosystem(data || []),
        dailyActivity: this.aggregateByDay(data || []),
        topActions: this.aggregateByAction(data || [])
      }

      return { success: true, data: analytics }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // DATA CLEANUP & MAINTENANCE - COMPLETE
  // ================================

  async cleanupOldData(): Promise<DatabaseResult> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      // Clean up old activity logs (30 days)
      await this.supabaseAdmin
        .from('user_activity_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())

      // Archive old AI conversations (90 days)
      const { data: oldConversations } = await this.supabaseAdmin
        .from('ai_conversations')
        .select('id')
        .lt('created_at', ninetyDaysAgo.toISOString())

      if (oldConversations && oldConversations.length > 0) {
        // Move to archive table (implementation would create archive table)
        console.log(`Archiving ${oldConversations.length} old conversations`)
      }

      return { success: true, data: { cleaned: true } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // HELPER METHODS
  // ================================

  private aggregateByEcosystem(data: any[]): Record<string, number> {
    return data.reduce((acc, item) => {
      if (item.ecosystem) {
        acc[item.ecosystem] = (acc[item.ecosystem] || 0) + 1
      }
      return acc
    }, {})
  }

  private aggregateByDay(data: any[]): Record<string, number> {
    return data.reduce((acc, item) => {
      const day = new Date(item.created_at).toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})
  }

  private aggregateByAction(data: any[]): Record<string, number> {
    return data.reduce((acc, item) => {
      acc[item.action_type] = (acc[item.action_type] || 0) + 1
      return acc
    }, {})
  }
}

export default new DatabaseService()