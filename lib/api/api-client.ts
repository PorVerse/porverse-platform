// lib/api/api-client.ts - Real API Integration Layer
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export class APIClient {
  private supabase = createClientComponentClient()
  private baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'

  // ================================
  // AUTHENTICATION HELPERS
  // ================================

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await this.supabase.auth.getSession()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    return headers
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        return { data: null, error: errorData.error || `HTTP ${response.status}` }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('API Request failed:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // ================================
  // AI SERVICES
  // ================================

  async chatWithAI(ecosystem: string, message: string, context?: any) {
    return this.makeRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        ecosystem,
        message,
        context
      })
    })
  }

  async generateNutritionPlan(preferences: any) {
    return this.makeRequest('/ai/nutrition/generate', {
      method: 'POST',
      body: JSON.stringify(preferences)
    })
  }

  async analyzeHomework(imageData: string, subject: string, grade: number) {
    return this.makeRequest('/ai/homework/analyze', {
      method: 'POST',
      body: JSON.stringify({
        imageData,
        subject,
        grade
      })
    })
  }

  async getTherapySession(message: string, context: any) {
    return this.makeRequest('/ai/therapy/session', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context
      })
    })
  }

  // ================================
  // QUANTUM VAULT
  // ================================

  async generateFutureSelf(timelineYears: number = 10) {
    return this.makeRequest('/quantum-vault/future-self/generate', {
      method: 'POST',
      body: JSON.stringify({ timelineYears })
    })
  }

  async getFutureWisdom(category?: string) {
    const query = category ? `?category=${category}` : ''
    return this.makeRequest(`/quantum-vault/future-self/wisdom${query}`)
  }

  async createFutureAvatar(projectionData: any) {
    return this.makeRequest('/quantum-vault/future-self/avatar', {
      method: 'POST',
      body: JSON.stringify(projectionData)
    })
  }

  // ================================
  // USER MANAGEMENT
  // ================================

  async updateUserProfile(updates: any) {
    return this.makeRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async getUserProgress(ecosystem?: string) {
    const query = ecosystem ? `?ecosystem=${ecosystem}` : ''
    return this.makeRequest(`/user/progress${query}`)
  }

  async logUserActivity(ecosystem: string, actionType: string, data?: any) {
    return this.makeRequest('/user/activity', {
      method: 'POST',
      body: JSON.stringify({
        ecosystem,
        actionType,
        data
      })
    })
  }

  // ================================
  // PAYMENTS
  // ================================

  async createCheckoutSession(planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') {
    return this.makeRequest('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({
        planId,
        billingCycle
      })
    })
  }

  async getSubscriptionStatus() {
    return this.makeRequest('/payments/subscription/status')
  }

  async cancelSubscription(subscriptionId: string) {
    return this.makeRequest('/payments/subscription/cancel', {
      method: 'POST',
      body: JSON.stringify({ subscriptionId })
    })
  }

  // ================================
  // ECOSYSTEMS DATA
  // ================================

  async getEcosystemAccess() {
    return this.makeRequest('/user/ecosystems')
  }

  async unlockEcosystem(ecosystem: string) {
    return this.makeRequest('/user/ecosystems/unlock', {
      method: 'POST',
      body: JSON.stringify({ ecosystem })
    })
  }

  // ================================
  // HEALTH DATA (PorHealth)
  // ================================

  async saveHealthProfile(profileData: any) {
    return this.makeRequest('/health/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    })
  }

  async logNutrition(nutritionData: any) {
    return this.makeRequest('/health/nutrition/log', {
      method: 'POST',
      body: JSON.stringify(nutritionData)
    })
  }

  async logWorkout(workoutData: any) {
    return this.makeRequest('/health/workout/log', {
      method: 'POST',
      body: JSON.stringify(workoutData)
    })
  }

  // ================================
  // KIDS DATA (PorKids)
  // ================================

  async saveChildProfile(childData: any) {
    return this.makeRequest('/kids/profile', {
      method: 'POST',
      body: JSON.stringify(childData)
    })
  }

  async submitHomework(homeworkData: any) {
    return this.makeRequest('/kids/homework/submit', {
      method: 'POST',
      body: JSON.stringify(homeworkData)
    })
  }

  async getChildProgress(childId: string) {
    return this.makeRequest(`/kids/progress/${childId}`)
  }

  // ================================
  // WELLNESS DATA (PorWell)
  // ================================

  async saveMoodEntry(moodData: any) {
    return this.makeRequest('/wellness/mood/log', {
      method: 'POST',
      body: JSON.stringify(moodData)
    })
  }

  async getMoodHistory(days: number = 30) {
    return this.makeRequest(`/wellness/mood/history?days=${days}`)
  }

  async startTherapySession(sessionType: string) {
    return this.makeRequest('/wellness/therapy/start', {
      method: 'POST',
      body: JSON.stringify({ sessionType })
    })
  }

  // ================================
  // PRODUCTIVITY DATA (PorFlow)
  // ================================

  async createTask(taskData: any) {
    return this.makeRequest('/productivity/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    })
  }

  async updateTask(taskId: string, updates: any) {
    return this.makeRequest(`/productivity/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async startFocusSession(duration: number, taskId?: string) {
    return this.makeRequest('/productivity/focus/start', {
      method: 'POST',
      body: JSON.stringify({ duration, taskId })
    })
  }

  // ================================
  // EMAIL & NOTIFICATIONS
  // ================================

  async triggerEmailAutomation(trigger: string, data?: any) {
    return this.makeRequest('/email/send', {
      method: 'POST',
      body: JSON.stringify({
        trigger,
        data
      })
    })
  }

  // ================================
  // ANALYTICS
  // ================================

  async trackEvent(event: string, properties?: any) {
    // Fire and forget - don't wait for response
    this.makeRequest('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        event,
        properties,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Silently fail for analytics
    })
  }
}

// ================================
// SINGLETON INSTANCE
// ================================

export const apiClient = new APIClient()

// ================================
// REACT HOOKS FOR API CALLS
// ================================

import { useState, useEffect } from 'react'

export function useAPICall<T>(
  apiCall: () => Promise<{ data: T | null; error: string | null }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      const result = await apiCall()
      
      if (result.error) {
        setError(result.error)
      } else {
        setData(result.data)
      }
      
      setLoading(false)
    }

    fetchData()
  }, dependencies)

  const refetch = async () => {
    setLoading(true)
    setError(null)
    
    const result = await apiCall()
    
    if (result.error) {
      setError(result.error)
    } else {
      setData(result.data)
    }
    
    setLoading(false)
  }

  return { data, loading, error, refetch }
}

// ================================
// HELPER HOOKS
// ================================

export function useUserProgress(ecosystem?: string) {
  return useAPICall(
    () => apiClient.getUserProgress(ecosystem),
    [ecosystem]
  )
}

export function useEcosystemAccess() {
  return useAPICall(
    () => apiClient.getEcosystemAccess(),
    []
  )
}

export function useSubscriptionStatus() {
  return useAPICall(
    () => apiClient.getSubscriptionStatus(),
    []
  )
}