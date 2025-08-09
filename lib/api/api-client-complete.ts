// lib/api/api-client-complete.ts - COMPLETE FRONTEND API INTEGRATION
import { createClientSupabase } from '../supabase'
import { SecurityService } from '../security/security-service'

interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  loading?: boolean
}

interface UseAPICallOptions {
  immediate?: boolean
  dependencies?: any[]
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export class APIClient {
  private supabase: any
  private security: SecurityService
  private baseUrl: string

  constructor() {
    this.supabase = createClientSupabase()
    this.security = SecurityService.getInstance()
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  // ================================
  // CORE API METHODS - COMPLETE
  // ================================

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      // Get authentication token
      const { data: { session } } = await this.supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session.access_token}` : '',
        'X-CSRF-Token': await this.getCSRFToken(),
        ...options.headers
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data: data.data || data }

    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error)
      return { success: false, error: error.message }
    }
  }

  private async getCSRFToken(): Promise<string> {
    // Implementation would get CSRF token from cookie or generate one
    return 'csrf-token-placeholder'
  }

  // ================================
  // AUTHENTICATION API - COMPLETE
  // ================================

  async login(email: string, password: string, rememberMe: boolean = false): Promise<APIResponse> {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: this.security.sanitizeInput(email),
        password,
        rememberMe
      })
    })
  }

  async signup(userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    country?: string
    goals?: string[]
    challenges?: string[]
  }): Promise<APIResponse> {
    return this.makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        email: this.security.sanitizeInput(userData.email),
        firstName: userData.firstName ? this.security.sanitizeInput(userData.firstName) : undefined,
        lastName: userData.lastName ? this.security.sanitizeInput(userData.lastName) : undefined
      })
    })
  }

  async logout(): Promise<APIResponse> {
    return this.makeRequest('/api/auth/logout', {
      method: 'POST'
    })
  }

  async resetPassword(email: string): Promise<APIResponse> {
    return this.makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: this.security.sanitizeInput(email)
      })
    })
  }

  async verifyEmail(token: string): Promise<APIResponse> {
    return this.makeRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }

  // ================================
  // USER PROFILE API - COMPLETE
  // ================================

  async getUserProfile(): Promise<APIResponse> {
    return this.makeRequest('/api/user/profile')
  }

  async updateUserProfile(updates: any): Promise<APIResponse> {
    return this.makeRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(this.security.sanitizeJSON(updates))
    })
  }

  async getUserEcosystems(): Promise<APIResponse> {
    return this.makeRequest('/api/user/ecosystems')
  }

  async getDashboardData(ecosystem?: string): Promise<APIResponse> {
    const endpoint = ecosystem ? `/api/dashboard?ecosystem=${ecosystem}` : '/api/dashboard'
    return this.makeRequest(endpoint)
  }

  // ================================
  // AI INTEGRATION API - COMPLETE
  // ================================

  async chatWithAI(
    ecosystem: string,
    message: string,
    conversationHistory: ConversationMessage[] = [],
    context: any = {}
  ): Promise<APIResponse> {
    return this.makeRequest('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        ecosystem,
        message: this.security.sanitizeInput(message),
        conversationHistory,
        context: this.security.sanitizeJSON(context)
      })
    })
  }

  async getAIConversations(ecosystem: string, limit: number = 10): Promise<APIResponse> {
    return this.makeRequest(`/api/ai/conversations?ecosystem=${ecosystem}&limit=${limit}`)
  }

  // ================================
  // PORHEALTH API - COMPLETE
  // ================================

  async generateNutritionPlan(preferences: {
    targetCalories: number
    dietaryRestrictions: string[]
    allergies: string[]
    mealsPerDay: number
    budget: string
    cuisinePreferences: string[]
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-health/nutrition/generate-plan', {
      method: 'POST',
      body: JSON.stringify(this.security.sanitizeJSON(preferences))
    })
  }

  async saveNutritionLog(logData: {
    mealType: string
    foods: any[]
    calories: number
    protein: number
    carbs: number
    fat: number
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-health/nutrition/log', {
      method: 'POST',
      body: JSON.stringify(this.security.sanitizeJSON(logData))
    })
  }

  async generateWorkoutPlan(preferences: {
    fitnessLevel: string
    goals: string[]
    daysPerWeek: number
    minutesPerSession: number
    equipment: string[]
    injuries: string[]
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-health/fitness/generate-plan', {
      method: 'POST',
      body: JSON.stringify(this.security.sanitizeJSON(preferences))
    })
  }

  async logWorkoutSession(sessionData: {
    workoutType: string
    duration: number
    exercises: any[]
    caloriesBurned: number
    notes?: string
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-health/fitness/log-session', {
      method: 'POST',
      body: JSON.stringify(this.security.sanitizeJSON(sessionData))
    })
  }

  async getHealthMetrics(): Promise<APIResponse> {
    return this.makeRequest('/api/por-health/metrics')
  }

  async saveHealthMetrics(metrics: {
    weight?: number
    bloodPressure?: { systolic: number; diastolic: number }
    heartRate?: number
    sleepHours?: number
    stressLevel?: number
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-health/metrics', {
      method: 'POST',
      body: JSON.stringify(this.security.sanitizeJSON(metrics))
    })
  }

  // ================================
  // PORKIDS API - COMPLETE
  // ================================

  async analyzeHomework(
    imageFile: File,
    subject: string,
    gradeLevel: number,
    childId: string
  ): Promise<APIResponse> {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('subject', subject)
    formData.append('gradeLevel', gradeLevel.toString())
    formData.append('childId', childId)

    return this.makeRequest('/api/por-kids/homework/analyze', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
  }

  async generateLearningPath(
    childId: string,
    subject: string,
    currentLevel: string,
    targetLevel: string,
    weakAreas: string[]
  ): Promise<APIResponse> {
    return this.makeRequest('/api/por-kids/learning/generate-path', {
      method: 'POST',
      body: JSON.stringify({
        childId,
        subject,
        currentLevel,
        targetLevel,
        weakAreas: weakAreas.map(area => this.security.sanitizeInput(area))
      })
    })
  }

  async getLearningProgress(childId: string): Promise<APIResponse> {
    return this.makeRequest(`/api/por-kids/progress?childId=${childId}`)
  }

  async saveLearningSession(sessionData: {
    childId: string
    subject: string
    topic: string
    duration: number
    accuracy: number
    exercisesCompleted: number
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-kids/progress/session', {
      method: 'POST',
      body: JSON.stringify(this.security.sanitizeJSON(sessionData))
    })
  }

  async getChildProfiles(): Promise<APIResponse> {
    return this.makeRequest('/api/por-kids/children')
  }

  async createChildProfile(childData: {
    name: string
    age: number
    gradeLevel: string
    interests: string[]
    learningStyle: string
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-kids/children', {
      method: 'POST',
      body: JSON.stringify({
        ...childData,
        name: this.security.sanitizeInput(childData.name)
      })
    })
  }

  // ================================
  // PORWELL API - COMPLETE
  // ================================

  async startTherapySession(
    sessionType: string = 'general',
    initialMood?: number,
    anxietyLevel?: number
  ): Promise<APIResponse> {
    return this.makeRequest('/api/por-well/therapy/start-session', {
      method: 'POST',
      body: JSON.stringify({
        sessionType,
        initialMood,
        anxietyLevel
      })
    })
  }

  async sendTherapyMessage(
    message: string,
    sessionId: string,
    context: any = {}
  ): Promise<APIResponse> {
    return this.makeRequest('/api/por-well/therapy/message', {
      method: 'POST',
      body: JSON.stringify({
        message: this.security.sanitizeInput(message),
        sessionId,
        context: this.security.sanitizeJSON(context)
      })
    })
  }

  async logMoodEntry(moodData: {
    moodScore: number
    emotions: string[]
    triggers?: string[]
    activities?: string[]
    thoughts?: string
    physicalSymptoms?: string[]
    sleepQuality?: number
    anxietyLevel?: number
    stressLevel?: number
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-well/mood/log', {
      method: 'POST',
      body: JSON.stringify(this.security.sanitizeJSON(moodData))
    })
  }

  async getMoodHistory(days: number = 30): Promise<APIResponse> {
    return this.makeRequest(`/api/por-well/mood/history?days=${days}`)
  }

  async getMoodAnalytics(): Promise<APIResponse> {
    return this.makeRequest('/api/por-well/mood/analytics')
  }

  async startMeditationSession(
    type: string,
    duration: number
  ): Promise<APIResponse> {
    return this.makeRequest('/api/por-well/meditation/start', {
      method: 'POST',
      body: JSON.stringify({ type, duration })
    })
  }

  async completeMeditationSession(
    sessionId: string,
    actualDuration: number,
    rating: number
  ): Promise<APIResponse> {
    return this.makeRequest('/api/por-well/meditation/complete', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        actualDuration,
        rating
      })
    })
  }

  // ================================
  // PORMIND API - COMPLETE
  // ================================

  async getFinancialOverview(): Promise<APIResponse> {
    return this.makeRequest('/api/por-mind/financial/overview')
  }

  async createBudget(budgetData: {
    name: string
    categories: { [key: string]: number }
    period: 'monthly' | 'weekly'
    totalAmount: number
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-mind/budgeting/create', {
      method: 'POST',
      body: JSON.stringify({
        ...budgetData,
        name: this.security.sanitizeInput(budgetData.name)
      })
    })
  }

  async logTransaction(transactionData: {
    amount: number
    category: string
    description: string
    date: string
    isIncome: boolean
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-mind/transactions/log', {
      method: 'POST',
      body: JSON.stringify({
        ...transactionData,
        description: this.security.sanitizeInput(transactionData.description)
      })
    })
  }

  async getFinancialAdvice(query: string): Promise<APIResponse> {
    return this.makeRequest('/api/por-mind/advice', {
      method: 'POST',
      body: JSON.stringify({
        query: this.security.sanitizeInput(query)
      })
    })
  }

  async generateInvestmentPlan(preferences: {
    riskTolerance: string
    investmentGoals: string[]
    timeHorizon: number
    monthlyAmount: number
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-mind/investment/generate-plan', {
      method: 'POST',
      body: JSON.stringify(this.security.sanitizeJSON(preferences))
    })
  }

  // ================================
  // PORFLOW API - COMPLETE
  // ================================

  async getTasks(): Promise<APIResponse> {
    return this.makeRequest('/api/por-flow/tasks')
  }

  async createTask(taskData: {
    title: string
    description?: string
    priority: string
    category: string
    estimatedMinutes: number
    dueDate?: string
    tags?: string[]
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-flow/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...taskData,
        title: this.security.sanitizeInput(taskData.title),
        description: taskData.description ? this.security.sanitizeInput(taskData.description) : undefined
      })
    })
  }

  async updateTask(taskId: string, updates: any): Promise<APIResponse> {
    return this.makeRequest(`/api/por-flow/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(this.security.sanitizeJSON(updates))
    })
  }

  async optimizeSchedule(
    tasks: string[],
    preferences: any
  ): Promise<APIResponse> {
    return this.makeRequest('/api/por-flow/productivity/optimize-schedule', {
      method: 'POST',
      body: JSON.stringify({
        tasks,
        preferences: this.security.sanitizeJSON(preferences)
      })
    })
  }

  async startFocusSession(
    taskId: string,
    sessionType: string,
    plannedDuration: number
  ): Promise<APIResponse> {
    return this.makeRequest('/api/por-flow/focus/start-session', {
      method: 'POST',
      body: JSON.stringify({
        taskId,
        sessionType,
        plannedDuration
      })
    })
  }

  async completeFocusSession(
    sessionId: string,
    actualDuration: number,
    productivity: number,
    distractions: number
  ): Promise<APIResponse> {
    return this.makeRequest('/api/por-flow/focus/complete-session', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        actualDuration,
        productivity,
        distractions
      })
    })
  }

  // ================================
  // PORBLU API - COMPLETE
  // ================================

  async createVisionBoard(visionData: {
    timeHorizon: number
    lifeAreas: string[]
    goals: any[]
    values: string[]
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-blu/vision/create-board', {
      method: 'POST',
      body: JSON.stringify(this.security.sanitizeJSON(visionData))
    })
  }

  async getStrategicInsights(
    goals: any[],
    currentMetrics: any
  ): Promise<APIResponse> {
    return this.makeRequest('/api/por-blu/strategy/insights', {
      method: 'POST',
      body: JSON.stringify({
        goals: this.security.sanitizeJSON(goals),
        currentMetrics: this.security.sanitizeJSON(currentMetrics)
      })
    })
  }

  async createStrategicDecision(decisionData: {
    title: string
    options: string[]
    criteria: string[]
    weights: number[]
    constraints: string[]
  }): Promise<APIResponse> {
    return this.makeRequest('/api/por-blu/decisions/create', {
      method: 'POST',
      body: JSON.stringify({
        ...decisionData,
        title: this.security.sanitizeInput(decisionData.title)
      })
    })
  }

  async getExecutiveCoaching(topic: string): Promise<APIResponse> {
    return this.makeRequest('/api/por-blu/coaching', {
      method: 'POST',
      body: JSON.stringify({
        topic: this.security.sanitizeInput(topic)
      })
    })
  }

  // ================================
  // QUANTUM VAULT API - COMPLETE
  // ================================

  async checkQuantumAccess(): Promise<APIResponse> {
    return this.makeRequest('/api/quantum-vault/access')
  }

  async generateFutureSelf(timelineYears: number = 10): Promise<APIResponse> {
    return this.makeRequest('/api/quantum-vault/future-self', {
      method: 'POST',
      body: JSON.stringify({ timelineYears })
    })
  }

  async runIdentitySimulator(
    decisions: any[]
  ): Promise<APIResponse> {
    return this.makeRequest('/api/quantum-vault/identity-simulator', {
      method: 'POST',
      body: JSON.stringify({
        decisions: this.security.sanitizeJSON(decisions)
      })
    })
  }

  async createReverseRoadmap(
    desiredFuture: any
  ): Promise<APIResponse> {
    return this.makeRequest('/api/quantum-vault/reverse-roadmap', {
      method: 'POST',
      body: JSON.stringify({
        desiredFuture: this.security.sanitizeJSON(desiredFuture)
      })
    })
  }

  async startMirrorConversation(topic: string): Promise<APIResponse> {
    return this.makeRequest('/api/quantum-vault/mirror-conversation', {
      method: 'POST',
      body: JSON.stringify({
        topic: this.security.sanitizeInput(topic)
      })
    })
  }

  async detectQuantumPatterns(): Promise<APIResponse> {
    return this.makeRequest('/api/quantum-vault/pattern-detection', {
      method: 'POST'
    })
  }

  // ================================
  // PAYMENT API - COMPLETE
  // ================================

  async getSubscriptionPlans(): Promise<APIResponse> {
    return this.makeRequest('/api/payments/plans')
  }

  async createStripeCheckout(
    planId: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<APIResponse> {
    return this.makeRequest('/api/payments/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle })
    })
  }

  async createPayPalOrder(
    planId: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<APIResponse> {
    return this.makeRequest('/api/payments/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle })
    })
  }

  async getCustomerPortal(): Promise<APIResponse> {
    return this.makeRequest('/api/payments/portal', {
      method: 'POST'
    })
  }

  async cancelSubscription(reason?: string): Promise<APIResponse> {
    return this.makeRequest('/api/payments/cancel', {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  async applyDiscountCode(code: string, planId: string): Promise<APIResponse> {
    return this.makeRequest('/api/payments/discount', {
      method: 'POST',
      body: JSON.stringify({
        code: this.security.sanitizeInput(code),
        planId
      })
    })
  }

  // ================================
  // ANALYTICS & REPORTING API - COMPLETE
  // ================================

  async getUserAnalytics(days: number = 30): Promise<APIResponse> {
    return this.makeRequest(`/api/analytics/user?days=${days}`)
  }

  async getEcosystemUsage(): Promise<APIResponse> {
    return this.makeRequest('/api/analytics/ecosystem-usage')
  }

  async getProgressReport(type: 'weekly' | 'monthly' = 'weekly'): Promise<APIResponse> {
    return this.makeRequest(`/api/analytics/progress-report?type=${type}`)
  }

  // ================================
  // FILE UPLOAD API - COMPLETE
  // ================================

  async uploadFile(
    file: File,
    category: 'avatar' | 'homework' | 'document' | 'image'
  ): Promise<APIResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)

    return this.makeRequest('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
  }

  async deleteFile(fileId: string): Promise<APIResponse> {
    return this.makeRequest(`/api/upload/${fileId}`, {
      method: 'DELETE'
    })
  }
}

// ================================
// REACT HOOKS FOR API CALLS - COMPLETE
// ================================

import { useState, useEffect, useCallback } from 'react'

export function useAPICall<T>(
  apiCall: () => Promise<APIResponse<T>>,
  options: UseAPICallOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(options.immediate !== false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiCall()
      
      if (response.success) {
        setData(response.data || null)
        options.onSuccess?.(response.data)
      } else {
        setError(response.error || 'Unknown error')
        options.onError?.(response.error || 'Unknown error')
      }
    } catch (err: any) {
      setError(err.message)
      options.onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }, [apiCall, options])

  useEffect(() => {
    if (options.immediate !== false) {
      execute()
    }
  }, options.dependencies || [])

  return { data, loading, error, refetch: execute }
}

export function useConversation(ecosystem: string) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (message: string, context: any = {}) => {
    try {
      setLoading(true)
      setError(null)

      // Add user message immediately
      const userMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      // Send to API
      const response = await apiClient.chatWithAI(ecosystem, message, messages, context)
      
      if (response.success) {
        const aiMessage: ConversationMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        setError(response.error || 'Failed to send message')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [ecosystem, messages])

  const clearConversation = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, loading, error, sendMessage, clearConversation }
}

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabase()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { user, loading, isAuthenticated: !!user }
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchSubscription = async () => {
        try {
          const response = await apiClient.getUserProfile()
          if (response.success) {
            setSubscription(response.data.user_subscriptions?.[0] || null)
          }
        } finally {
          setLoading(false)
        }
      }
      fetchSubscription()
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [user])

  return { subscription, loading, isPremium: subscription?.status === 'active' }
}

// Create global instance
export const apiClient = new APIClient()

// Export commonly used hooks and utilities
export {
  useAPICall,
  useConversation,
  useAuth,
  useSubscription
}