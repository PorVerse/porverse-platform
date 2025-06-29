// lib/database/users.ts
import { createServerSupabase, supabaseAdmin } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserEcosystem = Database['public']['Tables']['user_ecosystems']['Row']
type UserProgress = Database['public']['Tables']['user_progress']['Row']

// ================================
// USER PROFILE OPERATIONS
// ================================

export async function createUserProfile(userData: {
  id: string
  email: string
  first_name?: string
  last_name?: string
  country_code?: string
}) {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      country_code: userData.country_code || 'RO'
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return data
}

export async function updateUserProfile(userId: string, updates: {
  first_name?: string
  last_name?: string
  avatar_url?: string
  subscription_tier?: 'free' | 'starter' | 'pro' | 'complete'
  onboarding_completed?: boolean
  country_code?: string
}) {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ================================
// USER ECOSYSTEMS OPERATIONS
// ================================

export async function getUserEcosystems(userId: string): Promise<UserEcosystem[]> {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .from('user_ecosystems')
    .select('*')
    .eq('user_id', userId)
    .order('activated_at', { ascending: false })

  if (error) {
    console.error('Error fetching user ecosystems:', error)
    return []
  }
  
  return data || []
}

export async function grantEcosystemAccess(
  userId: string, 
  ecosystem: string, 
  accessLevel: 'free' | 'premium' = 'premium',
  expiresAt?: string
) {
  const supabase = supabaseAdmin
  
  const { data, error } = await supabase
    .from('user_ecosystems')
    .upsert({
      user_id: userId,
      ecosystem,
      access_level: accessLevel,
      expires_at: expiresAt || null
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function checkQuantumAccess(userId: string): Promise<boolean> {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .rpc('has_trinity_combo', { user_uuid: userId })

  if (error) {
    console.error('Error checking quantum access:', error)
    return false
  }
  
  return data || false
}

// ================================
// USER PROGRESS OPERATIONS
// ================================

export async function saveUserProgress(progressData: {
  user_id: string
  ecosystem: string
  progress_type: string
  progress_data: any
  score?: number
}) {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: progressData.user_id,
      ecosystem: progressData.ecosystem,
      progress_type: progressData.progress_type,
      progress_data: progressData.progress_data,
      score: progressData.score || 0,
      date_recorded: new Date().toISOString().split('T')[0]
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserProgress(
  userId: string, 
  ecosystem?: string,
  days: number = 30
): Promise<UserProgress[]> {
  const supabase = createServerSupabase()
  
  let query = supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })

  if (ecosystem) {
    query = query.eq('ecosystem', ecosystem)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user progress:', error)
    return []
  }
  
  return data || []
}

export async function calculateOverallProgress(userId: string): Promise<number> {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .rpc('calculate_overall_progress', { user_uuid: userId })

  if (error) {
    console.error('Error calculating progress:', error)
    return 0
  }
  
  return data || 0
}

// ================================
// AI CONVERSATIONS OPERATIONS
// ================================

export async function saveAIConversation(conversationData: {
  user_id: string
  ecosystem: string
  title?: string
  messages: any[]
  context_data?: any
}) {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert([{
      user_id: conversationData.user_id,
      ecosystem: conversationData.ecosystem,
      title: conversationData.title || null,
      messages: conversationData.messages,
      context_data: conversationData.context_data || {}
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAIConversation(
  conversationId: string,
  updates: {
    messages?: any[]
    context_data?: any
    title?: string
  }
) {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .from('ai_conversations')
    .update(updates)
    .eq('id', conversationId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserConversations(
  userId: string,
  ecosystem?: string,
  limit: number = 10
) {
  const supabase = createServerSupabase()
  
  let query = supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (ecosystem) {
    query = query.eq('ecosystem', ecosystem)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
  
  return data || []
}

// ================================
// USER GOALS OPERATIONS
// ================================

export async function createUserGoal(goalData: {
  user_id: string
  ecosystem: string
  goal_type: string
  title: string
  description?: string
  target_value?: number
  unit?: string
  target_date?: string
  priority?: number
}) {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .from('user_goals')
    .insert([goalData])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserGoals(
  userId: string,
  ecosystem?: string,
  status: 'active' | 'completed' | 'paused' | 'failed' = 'active'
) {
  const supabase = createServerSupabase()
  
  let query = supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false })

  if (ecosystem) {
    query = query.eq('ecosystem', ecosystem)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user goals:', error)
    return []
  }
  
  return data || []
}

export async function updateGoalProgress(
  goalId: string,
  currentValue: number,
  status?: 'active' | 'completed' | 'paused' | 'failed'
) {
  const supabase = createServerSupabase()
  
  const updateData: any = { current_value: currentValue }
  
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
    updateData.status = status
  } else if (status) {
    updateData.status = status
  }

  const { data, error } = await supabase
    .from('user_goals')
    .update(updateData)
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ================================
// DASHBOARD SUMMARY OPERATIONS
// ================================

export async function getUserDashboardSummary(userId: string) {
  const supabase = createServerSupabase()
  
  const { data, error } = await supabase
    .from('user_dashboard_summary')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching dashboard summary:', error)
    return null
  }
  
  return data
}

// ================================
// ACTIVITY LOGGING
// ================================

export async function logUserActivity(activityData: {
  user_id: string
  ecosystem?: string
  action_type: string
  action_data?: any
  ip_address?: string
  user_agent?: string
}) {
  const supabase = supabaseAdmin
  
  const { error } = await supabase
    .from('user_activity_logs')
    .insert([activityData])

  if (error) {
    console.error('Error logging activity:', error)
  }
}

// ================================
// UTILITY FUNCTIONS
// ================================

export async function isEcosystemAccessible(userId: string, ecosystem: string): Promise<boolean> {
  const ecosystems = await getUserEcosystems(userId)
  const userEcosystem = ecosystems.find(e => e.ecosystem === ecosystem)
  
  if (!userEcosystem) return false
  
  // Check if premium access hasn't expired
  if (userEcosystem.expires_at) {
    const expirationDate = new Date(userEcosystem.expires_at)
    const now = new Date()
    if (now > expirationDate) return false
  }
  
  return userEcosystem.access_level !== 'locked'
}

export function getEcosystemDisplayName(ecosystem: string): string {
  const names: Record<string, string> = {
    'por-health': 'PorHealth',
    'por-kids': 'PorKids', 
    'por-mind': 'PorMind',
    'por-well': 'PorWell',
    'por-flow': 'PorFlow',
    'por-blu': 'PorBlu'
  }
  return names[ecosystem] || ecosystem
}