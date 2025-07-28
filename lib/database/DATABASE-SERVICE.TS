// ================================
// LIB/DATABASE/DATABASE-SERVICE.TS
// ================================
import { createClient } from '@supabase/supabase-js'
import { SecurityService } from '../security/security-service'

export class DatabaseService {
  private supabaseAdmin
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
      const sanitizedData = this.security.sanitizeJSON(userData)
      
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .insert({
          id: sanitizedData.userId,
          email: sanitizedData.email,
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
          country_code: sanitizedData.country,
          created_at: new Date().toISOString(),
          onboarding_completed: false
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create user profile error:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserProfile(userId: string) {
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
            stripe_subscription_id
          ),
          user_ecosystems (
            ecosystem,
            access_level,
            activated_at
          )
        `)
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get user profile error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateUserProfile(userId: string, updates: any) {
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
    } catch (error) {
      console.error('Update user profile error:', error)
      return { success: false, error: error.message }
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

      // Grant ecosystem access based on plan
      await this.grantEcosystemAccess(sanitizedData.userId, sanitizedData.planId)
      
      return { success: true, data }
    } catch (error) {
      console.error('Create subscription error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateSubscription(subscriptionId: string, updates: any) {
    try {
      const sanitizedUpdates = this.security.sanitizeJSON(updates)
      
      const { data, error } = await this.supabaseAdmin
        .from('user_subscriptions')
        .update({
          ...sanitizedUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update subscription error:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserSubscription(userId: string) {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            ecosystems,
            features
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get user subscription error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // ECOSYSTEM ACCESS MANAGEMENT
  // ================================
  async grantEcosystemAccess(userId: string, planId: string) {
    try {
      // Get plan details
      const { data: plan } = await this.supabaseAdmin
        .from('subscription_plans')
        .select('ecosystems')
        .eq('id', planId)
        .single()

      if (!plan) throw new Error('Plan not found')

      // Grant access to ecosystems
      const ecosystemAccess = plan.ecosystems.map(ecosystem => ({
        user_id: userId,
        ecosystem,
        access_level: 'premium',
        activated_at: new Date().toISOString()
      }))

      const { error } = await this.supabaseAdmin
        .from('user_ecosystems')
        .upsert(ecosystemAccess, {
          onConflict: 'user_id,ecosystem'
        })

      if (error) throw error

      // Check for Trinity unlock
      await this.checkTrinityUnlock(userId)
      
      return { success: true }
    } catch (error) {
      console.error('Grant ecosystem access error:', error)
      return { success: false, error: error.message }
    }
  }

  async revokeEcosystemAccess(userId: string, ecosystems?: string[]) {
    try {
      let query = this.supabaseAdmin
        .from('user_ecosystems')
        .update({ access_level: 'free' })
        .eq('user_id', userId)

      if (ecosystems) {
        query = query.in('ecosystem', ecosystems)
      }

      const { error } = await query

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Revoke ecosystem access error:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserEcosystemAccess(userId: string) {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_ecosystems')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get ecosystem access error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // TRINITY & QUANTUM VAULT
  // ================================
  async checkTrinityUnlock(userId: string) {
    try {
      // Check if user has premium access to por-mind, por-flow, and por-blu
      const { data: ecosystems } = await this.supabaseAdmin
        .from('user_ecosystems')
        .select('ecosystem, access_level')
        .eq('user_id', userId)
        .eq('access_level', 'premium')
        .in('ecosystem', ['por-mind', 'por-flow', 'por-blu'])

      const hasTrinity = ecosystems?.length === 3

      if (hasTrinity) {
        // Check if Quantum Vault already unlocked
        const { data: existing } = await this.supabaseAdmin
          .from('quantum_vault_access')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (!existing) {
          // Unlock Quantum Vault
          const { error } = await this.supabaseAdmin
            .from('quantum_vault_access')
            .insert({
              user_id: userId,
              unlocked_at: new Date().toISOString(),
              access_level: 'full'
            })

          if (error) throw error

          // Log achievement
          await this.logUserActivity(userId, 'trinity', 'quantum_vault_unlocked', {
            achievement: 'Trinity Master',
            timestamp: new Date().toISOString()
          })

          return { success: true, trinityUnlocked: true }
        }
      }

      return { success: true, trinityUnlocked: false }
    } catch (error) {
      console.error('Check Trinity unlock error:', error)
      return { success: false, error: error.message }
    }
  }

  async getQuantumVaultAccess(userId: string) {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('quantum_vault_access')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get Quantum Vault access error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // AI CONVERSATIONS
  // ================================
  async saveAIConversation(conversationData: {
    userId: string
    ecosystem: string
    aiModel: string
    messages: any[]
    totalTokens?: number
    costCents?: number
  }) {
    try {
      const sanitizedData = this.security.sanitizeJSON(conversationData)
      
      const { data, error } = await this.supabaseAdmin
        .from('ai_conversations')
        .insert({
          user_id: sanitizedData.userId,
          ecosystem: sanitizedData.ecosystem,
          ai_model: sanitizedData.aiModel,
          messages: sanitizedData.messages,
          total_tokens: sanitizedData.totalTokens,
          cost_cents: sanitizedData.costCents,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Save AI conversation error:', error)
      return { success: false, error: error.message }
    }
  }

  async getAIConversationHistory(userId: string, ecosystem: string, limit: number = 10) {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('ai_conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('ecosystem', ecosystem)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get AI conversation history error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // PAYMENT LOGGING
  // ================================
  async logPaymentEvent(paymentData: {
    userId: string
    type: 'checkout_created' | 'payment_succeeded' | 'payment_failed' | 'subscription_updated'
    amount?: number
    currency?: string
    stripeSessionId?: string
    paypalOrderId?: string
    metadata?: any
  }) {
    try {
      const sanitizedData = this.security.sanitizeJSON(paymentData)
      
      const { data, error } = await this.supabaseAdmin
        .from('payment_logs')
        .insert({
          user_id: sanitizedData.userId,
          event_type: sanitizedData.type,
          amount: sanitizedData.amount,
          currency: sanitizedData.currency,
          stripe_session_id: sanitizedData.stripeSessionId,
          paypal_order_id: sanitizedData.paypalOrderId,
          metadata: sanitizedData.metadata,
          created_at: new Date().toISOString()
        })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Log payment event error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // USER ACTIVITY LOGGING
  // ================================
  async logUserActivity(
    userId: string,
    ecosystem: string,
    actionType: string,
    actionData: any = {},
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const sanitizedData = this.security.sanitizeJSON(actionData)
      
      const { error } = await this.supabaseAdmin
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          ecosystem,
          action_type: actionType,
          action_data: sanitizedData,
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: new Date().toISOString()
        })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Log user activity error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // ANALYTICS & REPORTING
  // ================================
  async getUserStats(userId: string) {
    try {
      const [profileResult, subscriptionResult, ecosystemResult, activityResult] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserSubscription(userId),
        this.getUserEcosystemAccess(userId),
        this.supabaseAdmin
          .from('user_activity_logs')
          .select('ecosystem, action_type, created_at')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      ])

      return {
        success: true,
        data: {
          profile: profileResult.data,
          subscription: subscriptionResult.data,
          ecosystems: ecosystemResult.data,
          recentActivity: activityResult.data || []
        }
      }
    } catch (error) {
      console.error('Get user stats error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // USAGE LIMITS & TRACKING
  // ================================
  async checkUsageLimit(userId: string, ecosystem: string, action: string): Promise<{
    allowed: boolean
    remaining: number
    resetDate: Date
  }> {
    try {
      // Get user's access level for ecosystem
      const { data: ecosystemAccess } = await this.supabaseAdmin
        .from('user_ecosystems')
        .select('access_level')
        .eq('user_id', userId)
        .eq('ecosystem', ecosystem)
        .single()

      const accessLevel = ecosystemAccess?.access_level || 'free'

      // Define limits based on access level
      const limits: Record<string, Record<string, number>> = {
        free: {
          'ai_interaction': 3,
          'meal_plan_generation': 1,
          'homework_analysis': 5
        },
        premium: {
          'ai_interaction': 100,
          'meal_plan_generation': 50,
          'homework_analysis': 100
        }
      }

      const dailyLimit = limits[accessLevel]?.[action] || 0
      
      if (accessLevel === 'premium' && ['ai_interaction', 'meal_plan_generation', 'homework_analysis'].includes(action)) {
        // Premium users have unlimited access for most actions
        return {
          allowed: true,
          remaining: 999,
          resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      }

      // Check today's usage
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: todayUsage } = await this.supabaseAdmin
        .from('user_activity_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('ecosystem', ecosystem)
        .eq('action_type', action)
        .gte('created_at', today.toISOString())

      const usedToday = todayUsage?.length || 0
      const remaining = Math.max(0, dailyLimit - usedToday)
      
      const resetDate = new Date(today)
      resetDate.setDate(resetDate.getDate() + 1)

      return {
        allowed: remaining > 0,
        remaining,
        resetDate
      }
    } catch (error) {
      console.error('Check usage limit error:', error)
      return {
        allowed: false,
        remaining: 0,
        resetDate: new Date()
      }
    }
  }

  // ================================
  // HEALTH DATA MANAGEMENT
  // ================================
  async saveHealthProfile(userId: string, healthData: {
    height?: number
    weight?: number
    activityLevel?: string
    healthGoals?: string[]
    dietaryRestrictions?: string[]
    allergies?: string[]
  }) {
    try {
      const sanitizedData = this.security.sanitizeJSON(healthData)
      
      const { data, error } = await this.supabaseAdmin
        .from('user_health_profiles')
        .upsert({
          user_id: userId,
          height_cm: sanitizedData.height,
          weight_kg: sanitizedData.weight,
          activity_level: sanitizedData.activityLevel,
          health_goals: sanitizedData.healthGoals,
          dietary_restrictions: sanitizedData.dietaryRestrictions,
          allergies: sanitizedData.allergies,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Save health profile error:', error)
      return { success: false, error: error.message }
    }
  }

  async getNutritionLogs(userId: string, days: number = 7) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabaseAdmin
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', startDate.toISOString())
        .order('logged_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get nutrition logs error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // MOOD & WELLNESS TRACKING
  // ================================
  async saveMoodEntry(userId: string, moodData: {
    moodScore: number
    emotions?: string[]
    triggers?: string[]
    activities?: string[]
    thoughts?: string
    anxietyLevel?: number
    stressLevel?: number
  }) {
    try {
      const sanitizedData = this.security.sanitizeJSON(moodData)
      
      const { data, error } = await this.supabaseAdmin
        .from('mood_entries')
        .insert({
          user_id: userId,
          mood_score: sanitizedData.moodScore,
          emotions: sanitizedData.emotions,
          triggers: sanitizedData.triggers,
          activities: sanitizedData.activities,
          thoughts: sanitizedData.thoughts,
          anxiety_level: sanitizedData.anxietyLevel,
          stress_level: sanitizedData.stressLevel,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Save mood entry error:', error)
      return { success: false, error: error.message }
    }
  }

  async getMoodHistory(userId: string, days: number = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabaseAdmin
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get mood history error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // CHILDREN & EDUCATION DATA
  // ================================
  async createChildProfile(parentId: string, childData: {
    name: string
    age: number
    gradeLevel: string
    learningStyle?: string
    interests?: string[]
  }) {
    try {
      const sanitizedData = this.security.sanitizeJSON(childData)
      
      const { data, error } = await this.supabaseAdmin
        .from('child_profiles')
        .insert({
          parent_id: parentId,
          name: sanitizedData.name,
          age: sanitizedData.age,
          grade_level: sanitizedData.gradeLevel,
          learning_style: sanitizedData.learningStyle,
          interests: sanitizedData.interests,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create child profile error:', error)
      return { success: false, error: error.message }
    }
  }

  async saveHomeworkSubmission(childId: string, homeworkData: {
    subject: string
    imageUrl?: string
    ocrText?: string
    aiSolution?: any
    parentApproved?: boolean
  }) {
    try {
      const sanitizedData = this.security.sanitizeJSON(homeworkData)
      
      const { data, error } = await this.supabaseAdmin
        .from('homework_submissions')
        .insert({
          child_id: childId,
          subject: sanitizedData.subject,
          image_url: sanitizedData.imageUrl,
          ocr_text: sanitizedData.ocrText,
          ai_solution: sanitizedData.aiSolution,
          parent_approved: sanitizedData.parentApproved || false,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Save homework submission error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // FINANCIAL DATA MANAGEMENT
  // ================================
  async saveFinancialProfile(userId: string, financialData: {
    monthlyIncome?: number
    currency?: string
    savingsGoal?: number
    retirementAge?: number
    riskTolerance?: string
    investmentExperience?: string
  }) {
    try {
      const sanitizedData = this.security.sanitizeJSON(financialData)
      
      const { data, error } = await this.supabaseAdmin
        .from('financial_profiles')
        .upsert({
          user_id: userId,
          monthly_income: sanitizedData.monthlyIncome,
          currency: sanitizedData.currency || 'RON',
          savings_goal: sanitizedData.savingsGoal,
          retirement_age: sanitizedData.retirementAge,
          risk_tolerance: sanitizedData.riskTolerance,
          investment_experience: sanitizedData.investmentExperience,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Save financial profile error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // PRODUCTIVITY & TASK MANAGEMENT
  // ================================
  async saveTask(userId: string, taskData: {
    title: string
    description?: string
    priority?: string
    category?: string
    estimatedMinutes?: number
    dueDate?: Date
    tags?: string[]
  }) {
    try {
      const sanitizedData = this.security.sanitizeJSON(taskData)
      
      const { data, error } = await this.supabaseAdmin
        .from('tasks')
        .insert({
          user_id: userId,
          title: sanitizedData.title,
          description: sanitizedData.description,
          priority: sanitizedData.priority || 'medium',
          category: sanitizedData.category,
          estimated_minutes: sanitizedData.estimatedMinutes,
          due_date: sanitizedData.dueDate?.toISOString(),
          tags: sanitizedData.tags,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Save task error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateTaskStatus(taskId: string, status: string, actualMinutes?: number) {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
        if (actualMinutes) {
          updates.actual_minutes = actualMinutes
        }
      }

      const { data, error } = await this.supabaseAdmin
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update task status error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // CLEANUP & MAINTENANCE
  // ================================
  async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Cleanup old activity logs
      await this.supabaseAdmin
        .from('user_activity_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())

      // Cleanup old AI conversations (keep last 50 per user per ecosystem)
      const { data: users } = await this.supabaseAdmin
        .from('user_profiles')
        .select('id')

      if (users) {
        for (const user of users) {
          const ecosystems = ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu']
          
          for (const ecosystem of ecosystems) {
            const { data: conversations } = await this.supabaseAdmin
              .from('ai_conversations')
              .select('id')
              .eq('user_id', user.id)
              .eq('ecosystem', ecosystem)
              .order('created_at', { ascending: false })
              .range(50, 1000) // Keep first 50, delete the rest

            if (conversations && conversations.length > 0) {
              const idsToDelete = conversations.map(c => c.id)
              await this.supabaseAdmin
                .from('ai_conversations')
                .delete()
                .in('id', idsToDelete)
            }
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Cleanup old data error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // HEALTH CHECK
  // ================================
  async healthCheck() {
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .select('count')
        .limit(1)

      if (error) throw error
      
      return {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Database health check error:', error)
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}