// ================================
// app/api/ai/therapy/route.ts - FIXED VERSION
// ================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AIService } from '@/lib/ai/AI-SERVICE'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const aiService = new AIService()

// Environment validation
function validateEnvironment() {
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    validateEnvironment()
    
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
    const { message, conversationHistory, mood_score, anxiety_level } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get user subscription tier with error handling
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Profile fetch error:', profileError)
    }

    const userTier = userProfile?.subscription_tier === 'premium' ? 'premium' : 'free'

    // Crisis detection first
    const crisisCheck = await aiService.detectCrisis(message, user.id)
    
    if (crisisCheck.requiresIntervention) {
      // Log crisis intervention
      try {
        await supabase
          .from('crisis_interventions')
          .insert({
            user_id: user.id,
            message: message.substring(0, 500),
            risk_level: crisisCheck.riskLevel,
            confidence: crisisCheck.confidence,
            keywords_found: crisisCheck.keywordsFound || [],
            intervention_triggered: true,
            created_at: new Date().toISOString()
          })
      } catch (dbError) {
        console.warn('Crisis intervention logging failed:', dbError)
      }

      return NextResponse.json({
        success: true,
        response: crisisCheck.response,
        techniques: ['crisis_intervention'],
        resources: crisisCheck.emergencyResources,
        requiresIntervention: true,
        sessionId: crypto.randomUUID(),
        confidence: crisisCheck.confidence,
        riskLevel: crisisCheck.riskLevel
      })
    }

    // Generate therapeutic response using existing AI service
    const completion = await aiService.makeAPICall(async () => {
      const model = userTier === 'premium' ? 'openai/gpt-4o' : 'openai/gpt-4o-mini'
      
      return await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `Ești un terapeut AI empatic și profesionist specializat în terapia cognitiv-comportamentală (CBT). Vorbești în română.

PRINCIPII:
- Oferă suport emoțional autentic
- Folosește tehnici terapeutice validate
- Nu diagnostica sau prescrie medicație
- Recomandă ajutor profesional când este necesar

CONTEXT UTILIZATOR:
- Dispoziție actuală: ${mood_score || 'necunoscută'}/10
- Nivel anxietate: ${anxiety_level || 'necunoscut'}/10
- Tip abonament: ${userTier}

${userTier === 'premium' ? 'Oferă răspunsuri detaliate și exerciții personalizate (150-200 cuvinte).' : 'Oferă răspunsuri concise dar utile (100-150 cuvinte).'}

Răspunde empatic și oferă tehnici practice.`
            },
            ...conversationHistory.slice(-6),
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: userTier === 'premium' ? 300 : 200
        })
      }).then(res => res.json())
    })

    const response = completion.choices[0].message.content

    // Identify therapeutic techniques used
    const techniques = identifyTherapeuticTechniques(response)
    const homework = generateTherapeuticHomework(techniques, userTier)

    // Save therapy session with error handling
    try {
      await supabase
        .from('therapy_sessions')
        .insert({
          user_id: user.id,
          session_type: 'ai_chat',
          duration_minutes: 5, // Estimate
          topics_discussed: [message.substring(0, 100)],
          techniques_used: techniques,
          mood_before: mood_score || null,
          anxiety_level_before: anxiety_level || null,
          ai_response: response,
          homework_assigned: homework,
          created_at: new Date().toISOString()
        })
    } catch (dbError) {
      console.warn('Session logging failed:', dbError)
    }

    return NextResponse.json({
      success: true,
      response,
      techniques,
      homework,
      resources: [],
      requiresIntervention: false,
      sessionId: crypto.randomUUID(),
      confidence: 85
    })

  } catch (error) {
    console.error('AI Therapy API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process therapy request',
        response: 'Îmi pare rău, întâmpin dificultăți tehnice. Te rog încearcă din nou în câteva momente. Dacă te simți în criză, te rog contactează 112 sau 0800-801-200 (Telefonul Speranței).',
        requiresIntervention: false,
        sessionId: crypto.randomUUID(),
        confidence: 0
      },
      { status: 500 }
    )
  }
}

// Helper functions
function identifyTherapeuticTechniques(response: string): string[] {
  const techniques = []
  const lowerResponse = response.toLowerCase()

  if (lowerResponse.includes('gânduri') || lowerResponse.includes('cognitiv')) {
    techniques.push('cognitive_restructuring')
  }
  if (lowerResponse.includes('respirație') || lowerResponse.includes('relaxare')) {
    techniques.push('breathing_exercises')
  }
  if (lowerResponse.includes('mindfulness') || lowerResponse.includes('prezent')) {
    techniques.push('mindfulness')
  }
  if (lowerResponse.includes('emoții') || lowerResponse.includes('sentiment')) {
    techniques.push('emotion_regulation')
  }

  return techniques.length > 0 ? techniques : ['supportive_conversation']
}

function generateTherapeuticHomework(techniques: string[], userTier: string): string[] {
  const homework = []

  if (techniques.includes('mindfulness')) {
    homework.push('Practică 5-10 minute de respirație conștientă zilnic')
  }
  if (techniques.includes('cognitive_restructuring')) {
    homework.push('Identifică și notează 3 gânduri negative zilnic')
  }
  if (techniques.includes('emotion_regulation')) {
    homework.push('Ține un jurnal de emoții timp de 7 zile')
  }

  if (userTier === 'free' && homework.length > 1) {
    return homework.slice(0, 1) // Limit homework for free users
  }

  return homework.slice(0, 3)
}

// ================================
// app/api/ai/nutrition/route.ts - FIXED VERSION
// ================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AIService } from '@/lib/ai/AI-SERVICE'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const aiService = new AIService()

export async function POST(request: NextRequest) {
  try {
    // Environment validation
    const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    const missing = required.filter(key => !process.env[key])
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`)
    }

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

    // Get user profile with error handling
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle()

    const userTier = userProfile?.subscription_tier === 'premium' ? 'premium' : 'free'
    
    let result
    
    switch (action) {
      case 'generate_meal_plan':
        if (!preferences?.targetCalories) {
          return NextResponse.json({ error: 'Target calories required' }, { status: 400 })
        }
        
        result = await generateMealPlan(user.id, preferences, userTier)
        
        // Save to database with error handling
        if (result.success) {
          try {
            await supabase
              .from('nutrition_plans')
              .insert({
                user_id: user.id,
                plan_data: result.mealPlan,
                target_calories: preferences.targetCalories,
                estimated_cost: result.estimatedCost,
                dietary_restrictions: preferences.dietaryRestrictions || [],
                allergies: preferences.allergies || [],
                is_active: true,
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              })
          } catch (dbError) {
            console.warn('Failed to save nutrition plan:', dbError)
          }
        }
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

async function generateMealPlan(
  userId: string, 
  preferences: any, 
  userTier: string
): Promise<any> {
  const model = userTier === 'premium' ? 'openai/gpt-4o' : 'openai/gpt-4o-mini'
  
  const completion = await aiService.makeAPICall(async () => {
    return await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `Ești un nutriționist AI expert specializat în planuri de mese pentru români. Creezi planuri personalizate cu ingrediente locale și prețuri în LEI.

CONTEXT UTILIZATOR:
- Calorii țintă: ${preferences.targetCalories}
- Restricții: ${preferences.dietaryRestrictions?.join(', ') || 'Niciunele'}
- Alergii: ${preferences.allergies?.join(', ') || 'Niciunele'}
- Mese pe zi: ${preferences.mealsPerDay || 3}
- Buget: ${preferences.budget || 'mediu'}

CERINȚE:
1. Creează un plan de 7 zile cu ingrediente românești
2. Calculează costurile în LEI (prețuri realiste din România)
3. Oferă rețete cu pași detaliați
4. Include macronutrienți pentru fiecare masă
5. Generează listă de cumpărături organizată

${userTier === 'premium' ? 'Oferă plan complex cu variații și substituții.' : 'Oferă plan simplu și eficient.'}

Răspunde în JSON cu structura:
{
  "mealPlan": {...},
  "shoppingList": [...],
  "estimatedCost": number,
  "nutritionSummary": {...},
  "tips": [...]
}`
          },
          {
            role: "user",
            content: `Generează un plan nutrițional personalizat pentru ${preferences.targetCalories} calorii/zi.`
          }
        ],
        temperature: 0.7,
        max_tokens: userTier === 'premium' ? 2000 : 1200
      })
    }).then(res => res.json())
  })

  try {
    const response = JSON.parse(completion.choices[0].message.content)
    return {
      success: true,
      ...response
    }
  } catch (parseError) {
    console.error('JSON parse error:', parseError)
    return {
      success: false,
      error: 'Failed to generate meal plan'
    }
  }
}

// ================================
// app/api/dashboard/route.ts - FIXED VERSION
// ================================

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
      dashboardData.cross_insights = await generateCrossEcosystemInsights(user.id, dashboardData)
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

// Helper functions with error handling
async function getHealthDashboardData(userId: string) {
  try {
    // Get nutrition plan with error handling
    const { data: nutritionPlan, error: nutritionError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (nutritionError && nutritionError.code !== 'PGRST116') {
      console.warn('Nutrition plans table issue:', nutritionError)
    }

    // Get biometric readings with error handling
    const { data: biometrics, error: biometricsError } = await supabase
      .from('biometric_readings')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(10)

    if (biometricsError && biometricsError.code !== 'PGRST116') {
      console.warn('Biometric readings table issue:', biometricsError)
    }

    // Calculate health score with defaults
    const healthScore = calculateHealthScore(biometrics || [], nutritionPlan)

    return {
      nutrition: {
        current_plan: nutritionPlan || null,
        today_calories: nutritionPlan?.target_calories || 0,
        estimated_cost: nutritionPlan?.estimated_cost || 0,
        has_active_plan: !!nutritionPlan
      },
      biometrics: {
        latest_readings: biometrics?.[0] || null,
        health_score: healthScore,
        recent_count: biometrics?.length || 0
      },
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
    console.error('Health dashboard error:', error)
    return {
      nutrition: { current_plan: null, has_active_plan: false },
      biometrics: { latest_readings: null, health_score: 50 },
      insights: []
    }
  }
}

async function getWellnessDashboardData(userId: string) {
  try {
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(14)

    const { data: therapySessions } = await supabase
      .from('therapy_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const moodTrends = calculateMoodTrends(moodEntries || [])
    const averageMood = moodEntries?.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length 
      : 5

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
        last_session: therapySessions?.[0]?.created_at || null
      },
      insights: [
        {
          title: averageMood < 5 ? '💙 Dispoziție scăzută detectată' : '😊 Dispoziție bună',
          description: `Dispoziția ta medie este ${averageMood.toFixed(1)}/10`,
          importance: averageMood < 5 ? 'high' : 'low'
        }
      ]
    }
  } catch (error) {
    console.error('Wellness dashboard error:', error)
    return {
      mood_tracking: { recent_entries: [], average_mood: 5 },
      therapy: { recent_sessions: [], sessions_count: 0 },
      insights: []
    }
  }
}

async function getKidsDashboardData(userId: string) {
  try {
    const { data: children } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('parent_id', userId)

    if (!children || children.length === 0) {
      return {
        children: [],
        has_children: false,
        family_insights: []
      }
    }

    return {
      children: children.map(child => ({
        child_profile: child,
        recent_homework: [],
        learning_progress: []
      })),
      has_children: true,
      total_children: children.length,
      family_insights: [
        {
          title: '📚 Activitate educațională',
          description: `${children.length} copii înregistrați`,
          importance: 'medium'
        }
      ]
    }
  } catch (error) {
    console.error('Kids dashboard error:', error)
    return {
      children: [],
      has_children: false,
      family_insights: []
    }
  }
}

async function generateCrossEcosystemInsights(userId: string, data: any) {
  const insights = []

  if (data.health && data.wellness) {
    const avgMood = data.wellness.mood_tracking?.average_mood || 5
    
    if (avgMood < 6) {
      insights.push({
        type: 'mood_health_correlation',
        title: '💙 Starea emoțională poate fi îmbunătățită',
        description: `Dispoziția ta medie de ${avgMood.toFixed(1)}/10 poate fi influențată de obiceiurile de sănătate.`,
        action_items: [
          'Generează un plan nutrițional pentru energie',
          'Adaugă exerciții fizice în rutină',
          'Încearcă o sesiune de terapie AI'
        ],
        ecosystems_involved: ['PorHealth', 'PorWell'],
        priority: 'medium'
      })
    }
  }

  return insights
}

async function checkTrinityAccess(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_ecosystems')
      .select('ecosystem')
      .eq('user_id', userId)
      .eq('access_level', 'premium')

    const premiumEcosystems = data?.map(e => e.ecosystem) || []
    const trinityRequired = ['por-mind', 'por-flow', 'por-blu']
    
    return trinityRequired.every(ecosystem => premiumEcosystems.includes(ecosystem))
  } catch (error) {
    console.error('Trinity access check error:', error)
    return false
  }
}

// Utility functions
function calculateHealthScore(biometrics: any[], nutritionPlan: any): number {
  let score = 50 // Base score

  if (nutritionPlan) score += 20
  if (biometrics && biometrics.length > 0) score += 15
  if (biometrics && biometrics.length > 5) score += 10

  return Math.min(100, Math.max(0, score))
}

function calculateMoodTrends(entries: any[]) {
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