// lib/api/api-client-production.ts - REAL API IMPLEMENTATION
'use client'

import { createClientSupabase } from '../supabase'
import { toast } from 'react-hot-toast'

interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  loading?: boolean
}

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  subscription_tier: 'free' | 'starter' | 'pro' | 'complete'
  subscription_status: 'active' | 'canceled' | 'past_due'
  country_code: string | null
  onboarding_completed: boolean
  created_at: string
}

interface EcosystemAccess {
  ecosystem: string
  access_level: 'free' | 'premium' | 'locked'
  activated_at: string
  expires_at: string | null
}

interface AIConversation {
  id: string
  ecosystem: string
  title: string | null
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  created_at: string
  updated_at: string
}

export class ProductionAPIClient {
  private supabase: any
  private baseUrl: string

  constructor() {
    this.supabase = createClientSupabase()
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  // ================================
  // AUTHENTICATION & USER MANAGEMENT
  // ================================

  async getCurrentUser(): Promise<APIResponse<UserProfile>> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !user) {
        return { success: false, error: 'Not authenticated' }
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return { success: false, error: profileError.message }
      }

      return { success: true, data: profile }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<APIResponse<UserProfile>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Profile updated successfully!')
      return { success: true, data }
    } catch (error: any) {
      toast.error('Failed to update profile')
      return { success: false, error: error.message }
    }
  }

  // ================================
  // ECOSYSTEM ACCESS MANAGEMENT
  // ================================

  async getUserEcosystems(): Promise<APIResponse<EcosystemAccess[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_ecosystems')
        .select('*')
        .eq('user_id', user.id)
        .order('activated_at', { ascending: false })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async checkEcosystemAccess(ecosystem: string): Promise<APIResponse<{ hasAccess: boolean; level: string }>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_ecosystems')
        .select('access_level')
        .eq('user_id', user.id)
        .eq('ecosystem', ecosystem)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      const hasAccess = data && data.access_level !== 'locked'
      const level = data?.access_level || 'locked'

      return { 
        success: true, 
        data: { hasAccess, level }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async checkQuantumVaultAccess(): Promise<APIResponse<{ hasAccess: boolean; unlockMethod: string }>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check Trinity combo (por-mind + por-flow + por-blu all premium)
      const { data: ecosystems } = await this.supabase
        .from('user_ecosystems')
        .select('ecosystem, access_level')
        .eq('user_id', user.id)
        .in('ecosystem', ['por-mind', 'por-flow', 'por-blu'])

      const trinityEcosystems = ecosystems?.filter(e => e.access_level === 'premium') || []
      const hasTrinity = trinityEcosystems.length === 3

      // Check direct Quantum Vault access
      const { data: quantumAccess } = await this.supabase
        .from('quantum_vault_access')
        .select('access_level')
        .eq('user_id', user.id)
        .single()

      const hasDirectAccess = quantumAccess?.access_level === 'full'

      return {
        success: true,
        data: {
          hasAccess: hasTrinity || hasDirectAccess,
          unlockMethod: hasDirectAccess ? 'direct' : hasTrinity ? 'trinity' : 'none'
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // AI CONVERSATIONS
  // ================================

  async startAIConversation(ecosystem: string, initialMessage?: string): Promise<APIResponse<AIConversation>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check ecosystem access first
      const accessCheck = await this.checkEcosystemAccess(ecosystem)
      if (!accessCheck.success || !accessCheck.data?.hasAccess) {
        throw new Error('No access to this ecosystem')
      }

      const messages = initialMessage ? [
        {
          role: 'user' as const,
          content: initialMessage,
          timestamp: new Date().toISOString()
        }
      ] : []

      const { data, error } = await this.supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          ecosystem,
          title: `${ecosystem} - ${new Date().toLocaleDateString()}`,
          messages,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async sendAIMessage(
    conversationId: string, 
    message: string, 
    ecosystem: string
  ): Promise<APIResponse<{ userMessage: any; aiResponse: any }>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get existing conversation
      const { data: conversation, error: convError } = await this.supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (convError) throw convError

      // Create user message
      const userMessage = {
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString()
      }

      // Call AI API endpoint
      const response = await fetch(`${this.baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          ecosystem,
          conversationId,
          userId: user.id
        })
      })

      if (!response.ok) {
        throw new Error('AI service unavailable')
      }

      const aiData = await response.json()
      
      const aiMessage = {
        role: 'assistant' as const,
        content: aiData.message,
        timestamp: new Date().toISOString()
      }

      // Update conversation with both messages
      const updatedMessages = [...conversation.messages, userMessage, aiMessage]

      const { error: updateError } = await this.supabase
        .from('ai_conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (updateError) throw updateError

      return { 
        success: true, 
        data: { 
          userMessage, 
          aiResponse: aiMessage 
        } 
      }
    } catch (error: any) {
      toast.error('Failed to send message')
      return { success: false, error: error.message }
    }
  }

  async getConversationHistory(ecosystem: string): Promise<APIResponse<AIConversation[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('ecosystem', ecosystem)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(10)

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // ECOSYSTEM-SPECIFIC DATA
  // ================================

  // PORHEALTH
  async getHealthProfile(): Promise<APIResponse<any>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return { success: true, data: data || null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async updateHealthProfile(healthData: any): Promise<APIResponse<any>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_health_profiles')
        .upsert({
          user_id: user.id,
          ...healthData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Health profile updated!')
      return { success: true, data }
    } catch (error: any) {
      toast.error('Failed to update health profile')
      return { success: false, error: error.message }
    }
  }

  // PORKIDS
  async getChildProfiles(): Promise<APIResponse<any[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async createChildProfile(childData: any): Promise<APIResponse<any>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('child_profiles')
        .insert({
          parent_id: user.id,
          ...childData
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Child profile created!')
      return { success: true, data }
    } catch (error: any) {
      toast.error('Failed to create child profile')
      return { success: false, error: error.message }
    }
  }

  // PORWELL
  async saveMoodEntry(moodData: any): Promise<APIResponse<any>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          ...moodData
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getMoodHistory(days: number = 30): Promise<APIResponse<any[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // PAYMENT & SUBSCRIPTION
  // ================================

  async createCheckoutSession(planId: string): Promise<APIResponse<{ url: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getSubscriptionStatus(): Promise<APIResponse<any>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            ecosystems,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      return { success: true, data: data?.[0] || null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // PROGRESS TRACKING
  // ================================

  async saveProgress(ecosystem: string, progressData: any): Promise<APIResponse<any>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          ecosystem,
          ...progressData
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getProgress(ecosystem: string): Promise<APIResponse<any[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await this.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('ecosystem', ecosystem)
        .order('date_recorded', { ascending: false })
        .limit(50)

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

// Singleton instance
export const apiClient = new ProductionAPIClient()

// React hooks for common operations
export function useAPICall<T>(
  apiCall: () => Promise<APIResponse<T>>,
  dependencies: any[] = []
) {
  const [state, setState] = React.useState<APIResponse<T>>({ 
    success: false, 
    loading: true 
  })

  React.useEffect(() => {
    let mounted = true

    const execute = async () => {
      setState(prev => ({ ...prev, loading: true }))
      
      const result = await apiCall()
      
      if (mounted) {
        setState({ ...result, loading: false })
      }
    }

    execute()

    return () => { mounted = false }
  }, dependencies)

  return state
}

export function useUserProfile() {
  return useAPICall(() => apiClient.getCurrentUser())
}

export function useEcosystemAccess(ecosystem: string) {
  return useAPICall(() => apiClient.checkEcosystemAccess(ecosystem), [ecosystem])
}

export function useQuantumVaultAccess() {
  return useAPICall(() => apiClient.checkQuantumVaultAccess())
}

export default apiClient