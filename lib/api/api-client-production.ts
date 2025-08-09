// lib/api/api-client-production.ts - FIXED IMPLEMENTATION
'use client'

import React from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

export class ProductionAPIClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  // ================================
  // AUTHENTICATION & USER MANAGEMENT
  // ================================

  async getCurrentUser(): Promise<APIResponse<UserProfile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { success: false, error: 'Not authenticated' }
      }

      const { data: profile, error: profileError } = await supabase
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
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

  // ================================
  // AI CONVERSATIONS
  // ================================

  async sendAIMessage(
    message: string, 
    ecosystem: string,
    conversationId?: string
  ): Promise<APIResponse<{ response: string }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check ecosystem access
      const accessCheck = await this.checkEcosystemAccess(ecosystem)
      if (!accessCheck.success || !accessCheck.data?.hasAccess) {
        throw new Error('No access to this ecosystem')
      }

      // Mock AI response for now
      const mockResponses = {
        'por-health': 'Based on your health profile, I recommend focusing on balanced nutrition and regular exercise.',
        'por-kids': 'Great question! Let me help you with this homework step by step.',
        'por-mind': 'Here\'s a personalized budget analysis based on your financial goals.',
        'por-well': 'I understand how you\'re feeling. Let\'s explore some coping strategies.',
        'por-flow': 'Here\'s an optimized schedule for your productivity goals.',
        'por-blu': 'Based on your strategic vision, here are actionable next steps.'
      }

      const response = mockResponses[ecosystem as keyof typeof mockResponses] || 
        'Thank you for your message. How can I assist you today?'

      // Save conversation to database
      await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          ecosystem,
          messages: [
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: response, timestamp: new Date().toISOString() }
          ]
        })

      return { success: true, data: { response } }
    } catch (error: any) {
      toast.error('Failed to send message')
      return { success: false, error: error.message }
    }
  }

  // ================================
  // ECOSYSTEM-SPECIFIC DATA
  // ================================

  async getHealthProfile(): Promise<APIResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
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

  async getChildProfiles(): Promise<APIResponse<any[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
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

  async saveMoodEntry(moodData: any): Promise<APIResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
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

  async createCheckoutSession(planId: string): Promise<APIResponse<{ url: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      if (!response.ok) throw new Error('Failed to create checkout session')

      const data = await response.json()
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getSubscriptionStatus(): Promise<APIResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
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
}

// Singleton instance
export const apiClient = new ProductionAPIClient()

// React hooks
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

export default apiClient