// app/api/ai/therapy/route.ts
// AI THERAPY ENDPOINT - Crisis-safe mental health support

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TherapistService } from '@/lib/ai/ai-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const therapistService = new TherapistService()

export async function POST(request: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { message, conversationHistory, mood_score, anxiety_level } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check user subscription tier
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const userTier = userProfile?.subscription_tier === 'premium' ? 'premium' : 'free'

    // Generate AI response
    const aiResponse = await therapistService.provideMentalHealthSupport(
      user.id,
      message,
      conversationHistory || [],
      userTier
    )

    // Log crisis intervention if needed
    if (aiResponse.requiresIntervention) {
      console.warn(`[CRISIS ALERT] User ${user.id} requires intervention - confidence: ${aiResponse.confidence}%`)
    }

    return NextResponse.json({
      success: true,
      ...aiResponse
    })

  } catch (error) {
    console.error('AI Therapy API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process therapy request',
        response: 'Îmi pare rău, întâmpin dificultăți tehnice. Te rog încearcă din nou în câteva momente.',
        requiresIntervention: false,
        sessionId: crypto.randomUUID(),
        confidence: 0
      },
      { status: 500 }
    )
  }
}

// app/api/ai/nutrition/route.ts  
// AI NUTRITION ENDPOINT - Romanian meal planning

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { NutritionService } from '@/lib/ai/ai-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const nutritionService = new NutritionService()

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { action, preferences } = body
    
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Check user tier
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const userTier = userProfile?.subscription_tier === 'premium' ? 'premium' : 'free'
    
    let result
    
    switch (action) {
      case 'generate_meal_plan':
        if (!preferences?.targetCalories) {
          return NextResponse.json({ error: 'Target calories required' }, { status: 400 })
        }
        
        result = await nutritionService.generateMealPlan(user.id, preferences, userTier)
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Nutrition API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// app/api/mood/route.ts
// MOOD TRACKING ENDPOINT - Mental wellness analytics

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { mood_score, emotions, triggers, stress_level, anxiety_level, thoughts } = body

    if (!mood_score || mood_score < 1 || mood_score > 10) {
      return NextResponse.json({ error: 'Valid mood score (1-10) is required' }, { status: 400 })
    }

    // Save mood entry
    const { data: moodEntry, error: insertError } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.id,
        mood_score,
        emotions: emotions || [],
        triggers: triggers || [],
        stress_level: stress_level || null,
        anxiety_level: anxiety_level || null,
        thoughts: thoughts || null,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Get recent mood history for trend analysis
    const { data: recentMoods } = await supabase
      .from('mood_entries')
      .select('mood_score, recorded_at, stress_level, anxiety_level')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(7)

    // Simple mood trend calculation
    const calculateMoodTrends = (moods: any[]) => {
      if (moods.length < 2) return { direction: 'stable', change: 0 }
      
      const recent = moods.slice(0, 3)
      const older = moods.slice(3, 6)
      
      const recentAvg = recent.reduce((sum, m) => sum + m.mood_score, 0) / recent.length
      const olderAvg = older.length > 0 ? older.reduce((sum, m) => sum + m.mood_score, 0) / older.length : recentAvg
      
      const change = recentAvg - olderAvg
      
      return {
        direction: change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable',
        change: Math.abs(change),
        recent_average: recentAvg,
        previous_average: olderAvg
      }
    }

    const moodTrends = calculateMoodTrends(recentMoods || [])
    
    // Check if intervention might be needed
    const needsAttention = mood_score <= 3 || (stress_level && stress_level >= 8) || (anxiety_level && anxiety_level >= 8)

    // Generate recommendations
    const recommendations = needsAttention ? [
      'Considera o sesiune cu AI Therapist',
      'Practică tehnici de respirație profundă',
      'Contactează pe cineva de încredere',
      'Ia o pauză și fă ceva plăcut pentru tine'
    ] : [
      'Continuă să îți monitorizezi dispoziția zilnic',
      'Practică gratitudine pentru lucrurile pozitive',
      'Menține rutina de auto-îngrijire'
    ]

    return NextResponse.json({
      success: true,
      mood_entry: moodEntry,
      analysis: {
        trends: moodTrends,
        needs_attention: needsAttention,
        recommendations,
        weekly_average: recentMoods?.length > 0 
          ? recentMoods.reduce((sum, m) => sum + m.mood_score, 0) / recentMoods.length 
          : mood_score
      }
    })

  } catch (error) {
    console.error('Mood tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to save mood entry' },
      { status: 500 }
    )
  }
}

// app/api/dashboard/route.ts
// DASHBOARD DATA AGGREGATION - Real data from all ecosystems

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get ecosystem parameter
    const { searchParams } = new URL(request.url)
    const ecosystem = searchParams.get('ecosystem')

    let dashboardData: any = {}

    if (ecosystem === 'por-health' || !ecosystem) {
      dashboardData.health = await getHealthDashboardData(user.id)
    }

    if (ecosystem === 'por-well' || !ecosystem) {
      dashboardData.wellness = await getWellnessDashboardData(user.id)
    }

    if (ecosystem === 'por-kids' || !ecosystem) {
      dashboardData.kids = await getKidsDashboardData(user.id)
    }

    if (!ecosystem) {
      // Generate cross-ecosystem insights
      dashboardData.cross_insights = await generateCrossEcosystemInsights(user.id, dashboardData)
      
      // Check Trinity access
      dashboardData.trinity_access = await checkTrinityAccess(user.id)
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

// Helper functions for dashboard data aggregation
async function getHealthDashboardData(userId: string) {
  try {
    // Get latest nutrition plan
    const { data: nutritionPlan } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get recent biometric readings
    const { data: biometrics } = await supabase
      .from('biometric_readings')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(10)

    // Get health profile
    const { data: healthProfile } = await supabase
      .from('user_health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Calculate simple health score
    const calculateHealthScore = (biometrics: any[], profile: any): number => {
      let score = 70 // Base score

      if (biometrics && biometrics.length > 0) {
        const latest = biometrics[0]
        
        // Sleep score
        if (latest.sleep_hours) {
          if (latest.sleep_hours >= 7 && latest.sleep_hours <= 9) score += 15
          else if (latest.sleep_hours >= 6 && latest.sleep_hours <= 10) score += 10
          else score -= 5
        }

        // Weight tracking (if available)
        if (profile?.weight_kg && profile?.height_cm) {
          const heightM = profile.height_cm / 100
          const bmi = profile.weight_kg / (heightM * heightM)
          
          if (bmi >= 18.5 && bmi <= 24.9) score += 10
          else if (bmi >= 25 && bmi <= 29.9) score += 5
        }
      }

      return Math.max(0, Math.min(100, score))
    }

    const healthScore = calculateHealthScore(biometrics || [], healthProfile)

    return {
      nutrition: {
        current_plan: nutritionPlan,
        today_calories: nutritionPlan?.target_calories || 0,
        estimated_cost: nutritionPlan?.estimated_cost || 0,
        has_active_plan: !!nutritionPlan
      },
      biometrics: {
        latest_readings: biometrics?.[0] || null,
        health_score: healthScore,
        recent_count: biometrics?.length || 0
      },
      profile: healthProfile,
      insights: [
        {
          title: nutritionPlan ? '🥗 Plan nutrițional activ' : '📝 Generează un plan nutrițional',
          description: nutritionPlan 
            ? `Ai un plan personalizat cu ${nutritionPlan.target_calories} calorii/zi`
            : 'Creează un plan AI personalizat pentru obiectivele tale',
          importance: 'medium'
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching health data:', error)
    return null
  }
}

async function getWellnessDashboardData(userId: string) {
  try {
    // Get recent mood entries
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(14)

    // Get recent therapy sessions
    const { data: therapySessions } = await supabase
      .from('therapy_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Calculate mood trends
    const calculateMoodTrends = (entries: any[]) => {
      if (entries.length < 2) return { direction: 'stable', strength: 0 }
      
      const recent = entries.slice(0, 7)
      const older = entries.slice(7, 14)
      
      const recentAvg = recent.reduce((sum, entry) => sum + entry.mood_score, 0) / recent.length
      const olderAvg = older.length > 0 ? older.reduce((sum, entry) => sum + entry.mood_score, 0) / older.length : recentAvg
      
      const difference = recentAvg - olderAvg
      
      return {
        direction: difference > 0.5 ? 'improving' : difference < -0.5 ? 'declining' : 'stable',
        strength: Math.abs(difference),
        recent_average: recentAvg,
        previous_average: olderAvg
      }
    }

    const moodTrends = calculateMoodTrends(moodEntries || [])
    const averageMood = moodEntries?.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length 
      : 5

    // Extract techniques used in therapy
    const techniquesUsed = therapySessions?.flatMap(session => session.techniques_used || []) || []
    const uniqueTechniques = [...new Set(techniquesUsed)]

    // Simple risk assessment
    const assessRisk = (moods: any[], sessions: any[]) => {
      let riskLevel = 'none'
      
      if (moods && moods.length > 0) {
        const recentMoods = moods.slice(0, 3)
        const avgMood = recentMoods.reduce((sum, entry) => sum + entry.mood_score, 0) / recentMoods.length
        
        if (avgMood <= 3) riskLevel = 'high'
        else if (avgMood <= 5) riskLevel = 'medium'
        else if (avgMood <= 7) riskLevel = 'low'
      }
      
      return { risk_level: riskLevel }
    }

    const riskAssessment = assessRisk(moodEntries, therapySessions)

    return {
      mood_tracking: {
        recent_entries: moodEntries || [],
        average_mood: averageMood,
        mood_trends: moodTrends,
        entries_count: moodEntries?.length || 0
      },
      therapy: {
        recent_sessions: therapySessions || [],
        sessions_count: therapySessions?.length || 0,
        techniques_used: uniqueTechniques,
        last_session: therapySessions?.[0]?.created_at || null
      },
      mindfulness: {
        streak_days: 0, // Calculate actual streak later
        total_minutes: 0, // Calculate from meditation sessions
        favorite_types: ['anxiety_relief', 'sleep_meditation']
      },
      risk_assessment: riskAssessment,
      insights: [
        {
          title: averageMood < 5 ? '💙 Dispoziție scăzută detectată' : '😊 Dispoziție bună',
          description: averageMood < 5 
            ? `Dispoziția ta medie este ${averageMood.toFixed(1)}/10. Să explorăm tehnici de îmbunătățire`
            : `Dispoziția ta medie este ${averageMood.toFixed(1)}/10. Continuă așa!`,
          importance: averageMood < 5 ? 'high' : 'low'
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching wellness data:', error)
    return null
  }
}

async function getKidsDashboardData(userId: string) {
  try {
    // Get children profiles
    const { data: children } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('parent_id', userId)

    if (!children || children.length === 0) {
      return {
        children: [],
        family_insights: [],
        has_children: false
      }
    }

    // Get homework and progress for each child
    const childrenData = await Promise.all(
      children.map(async (child) => {
        const [homework, progress] = await Promise.all([
          supabase
            .from('homework_submissions')
            .select('*')
            .eq('child_id', child.id)
            .order('submitted_at', { ascending: false })
            .limit(5),
          supabase
            .from('learning_progress')
            .select('*')
            .eq('child_id', child.id)
            .order('last_updated', { ascending: false })
        ])

        return {
          child_profile: child,
          recent_homework: homework.data || [],
          learning_progress: progress.data || [],
          homework_count: homework.data?.length || 0,
          subjects_tracked: new Set(progress.data?.map(p => p.subject) || []).size
        }
      })
    )

    return {
      children: childrenData,
      has_children: true,
      total_children: children.length,
      family_insights: [
        {
          title: '📚 Activitate educațională',
          description: `${childrenData.reduce((sum, child) => sum + child.homework_count, 0)} teme procesate`,
          importance: 'medium'
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching kids data:', error)
    return { children: [], has_children: false }
  }
}

async function generateCrossEcosystemInsights(userId: string, data: any) {
  const insights = []

  // Sleep-Mood correlation
  if (data.health?.biometrics?.latest_readings?.sleep_hours && data.wellness?.mood_tracking?.average_mood) {
    const sleepHours = data.health.biometrics.latest_readings.sleep_hours
    const avgMood = data.wellness.mood_tracking.average_mood
    
    if (sleepHours < 7 && avgMood < 6) {
      insights.push({
        type: 'sleep_mood_correlation',
        title: '😴 Somnul afectează dispoziția',
        description: `Dormi în medie ${sleepHours}h/noapte și ai dispoziția la ${avgMood.toFixed(1)}/10. Somnul insuficient poate afecta starea emoțională.`,
        action_items: [
          'Stabilește o rutină de somn consistentă',
          'Evită ecranele cu 1h înainte de culcare',
          'Încearcă meditația pentru somn din PorWell'
        ],
        ecosystems_involved: ['PorHealth', 'PorWell'],
        priority: 'high'
      })
    }
  }

  return insights
}

async function checkTrinityAccess(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_ecosystems')
    .select('ecosystem')
    .eq('user_id', userId)
    .eq('access_level', 'premium')

  const premiumEcosystems = data?.map(e => e.ecosystem) || []
  const trinityRequired = ['por-mind', 'por-flow', 'por-blu']
  
  return trinityRequired.every(ecosystem => premiumEcosystems.includes(ecosystem))
}