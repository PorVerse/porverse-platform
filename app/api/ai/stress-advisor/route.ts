// app/api/stress-advisor/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerSupabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY ? (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1') : undefined
})

type StressEntry = {
  stress_level: number
  triggers?: string[]
  created_at: string
  mood_score?: number
  activities?: string[]
  physical_symptoms?: string[]
}

type AnxietyEpisode = {
  severity: number
  triggers?: string[]
  coping_strategies_used?: string[]
  duration_minutes?: number
  created_at: string
}

type StressPatterns = {
  trend: 'increasing' | 'decreasing' | 'stable'
  volatility: 'low' | 'moderate' | 'high'
}

type StressContext = {
  recent_stress_data: StressEntry[]
  anxiety_episodes: AnxietyEpisode[]
  patterns: StressPatterns
  trigger_analysis: {
    top_triggers: { trigger: string; impact: number }[]
    most_effective_coping: string[]
  }
  average_stress: number | null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const message: string = body?.message
    const stress_level: number = Number(body?.stress_level ?? 0)
    const triggers: string[] = Array.isArray(body?.triggers) ? body.triggers : []
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const stressContext = await getStressContext(user.id, supabase)
    const response = await generateStressAdvisorResponse(stress_level, triggers, stressContext)

    await supabase.from('ai_conversations').insert({
      user_id: user.id,
      ecosystem: 'por-well',
      ai_model: process.env.OPENROUTER_API_KEY ? 'openrouter/anthropic-claude' : 'openai',
      messages: [
        { role: 'user', content: message, stress_level, triggers },
        { role: 'assistant', content: response.content }
      ],
      context_data: { stress_context: stressContext, triggers, current_stress: stress_level }
    })

    if (stress_level >= 8) {
      await supabase.from('user_activity_logs').insert({
        user_id: user.id,
        ecosystem: 'por-well',
        action_type: 'high_stress_intervention',
        action_data: { stress_level, triggers, immediate_techniques: response.immediate_techniques }
      })
    }

    return NextResponse.json({
      success: true,
      response: response.content,
      immediate_techniques: response.immediate_techniques,
      personalized_plan: response.personalized_plan,
      stress_score: response.stress_score,
      follow_up_actions: response.follow_up_actions,
      session_id: crypto.randomUUID()
    })
  } catch (error) {
    console.error('Stress advisor error:', error)
    return NextResponse.json({ error: 'Stress advisor unavailable' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const timeframe = parseInt(searchParams.get('days') || '7', 10)

    const stressAnalysis = await generateStressAnalysis(user.id, supabase, timeframe)

    return NextResponse.json({
      success: true,
      analysis: stressAnalysis.analysis,
      patterns: stressAnalysis.patterns,
      triggers: stressAnalysis.top_triggers,
      stress_trends: stressAnalysis.trends,
      recommendations: stressAnalysis.recommendations,
      coping_effectiveness: stressAnalysis.coping_effectiveness
    })
  } catch (error) {
    console.error('Stress analysis error:', error)
    return NextResponse.json({ error: 'Stress analysis unavailable' }, { status: 500 })
  }
}

// ---------- Helpers ----------
async function getStressContext(userId: string, supabase: any): Promise<StressContext> {
  const { data: stressData } = await supabase
    .from('mood_entries')
    .select('stress_level, triggers, created_at, mood_score, activities, physical_symptoms')
    .eq('user_id', userId)
    .not('stress_level', 'is', null)
    .order('created_at', { ascending: false })
    .limit(21)

  const { data: anxietyEpisodes } = await supabase
    .from('anxiety_episodes')
    .select('severity, triggers, coping_strategies_used, duration_minutes, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const sd: StressEntry[] = (stressData ?? []) as StressEntry[]
  const ae: AnxietyEpisode[] = (anxietyEpisodes ?? []) as AnxietyEpisode[]

  const patterns = analyzeStressPatterns(sd)
  const triggerAnalysis = analyzeTriggerEffectiveness(sd, ae)
  const average_stress = sd.length ? sd.reduce((s, e) => s + (e.stress_level || 0), 0) / sd.length : null

  return { recent_stress_data: sd, anxiety_episodes: ae, patterns, trigger_analysis: triggerAnalysis, average_stress }
}

function analyzeStressPatterns(stressData: StressEntry[]): StressPatterns {
  if (!stressData || stressData.length < 2) return { trend: 'stable', volatility: 'moderate' }
  const last = [...stressData].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
  const window = Math.min(last.length, 14)
  const recent = last.slice(-window)
  const half = Math.floor(recent.length / 2) || 1
  const avg = (arr: StressEntry[]) => arr.reduce((s, e) => s + (e.stress_level || 0), 0) / arr.length
  const a1 = avg(recent.slice(0, half))
  const a2 = avg(recent.slice(half))

  let trend: StressPatterns['trend'] = 'stable'
  if (a2 - a1 > 0.5) trend = 'increasing'
  else if (a1 - a2 > 0.5) trend = 'decreasing'

  const variance = calculateVariance(recent.map(e => e.stress_level || 0))
  let volatility: StressPatterns['volatility'] = 'moderate'
  if (variance > 4) volatility = 'high'
  else if (variance <= 2) volatility = 'low'

  return { trend, volatility }
}

function analyzeTriggerEffectiveness(
  stressData: StressEntry[],
  anxietyEpisodes: AnxietyEpisode[]
): { top_triggers: { trigger: string; impact: number }[]; most_effective_coping: string[] } {
  const triggerCounts: Record<string, { count: number; total: number }> = {}
  ;(stressData || []).forEach(entry => {
    if (Array.isArray(entry.triggers)) {
      entry.triggers.forEach(t => {
        if (!triggerCounts[t]) triggerCounts[t] = { count: 0, total: 0 }
        triggerCounts[t].count++
        triggerCounts[t].total += entry.stress_level || 0
      })
    }
  })

  const triggerImpacts = Object.entries(triggerCounts).map(([trigger, data]) => ({
    trigger,
    impact: data.total / data.count,
    count: data.count
  })).sort((a, b) => b.impact - a.impact)

  const copingCounts: Record<string, number> = {}
  ;(anxietyEpisodes || []).forEach(ep => {
    if (Array.isArray(ep.coping_strategies_used)) {
      ep.coping_strategies_used.forEach(c => { copingCounts[c] = (copingCounts[c] || 0) + 1 })
    }
  })
  const mostEffectiveCoping = Object.entries(copingCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([coping]) => coping)
    .slice(0, 3)

  return { top_triggers: triggerImpacts.slice(0, 3), most_effective_coping }
}

function getTriggerManagementStrategy(trigger: string) {
  const strategies: Record<string, { trigger: string; strategies: string[]; prevention: string }> = {
    'Work stress': { trigger: 'Work stress', strategies: ['Tehnica Pomodoro', 'Pauze scurte programate', 'Prioritizare urgent/important'], prevention: 'Limite clare între muncă și timp personal' },
    'Relationships': { trigger: 'Relationships', strategies: ['Comunicare asertivă', 'Stabilirea limitelor', 'Rezolvare a conflictelor'], prevention: 'Timp de calitate recurent' },
    'Financial worries': { trigger: 'Financial worries', strategies: ['Buget realist', 'Focus pe controlabile', 'Plan financiar scurt'], prevention: 'Fond de urgență + rutine lunare' }
  }
  return strategies[trigger] || null
}

async function generateStressAdvisorResponse(stress_level: number, triggers: string[], stressContext: StressContext) {
  const immediate_techniques = generateImmediateTechniques(stress_level, triggers)
  const personalized_plan = generatePersonalizedStressPlan(stressContext, triggers)
  const stress_score = calculateStressScore(stressContext, stress_level)
  const follow_up_actions = generateFollowUpActions(stress_level, stressContext)

  return {
    content: 'Acesta este răspunsul personalizat pentru gestionarea stresului.',
    immediate_techniques,
    personalized_plan,
    stress_score,
    follow_up_actions
  }
}

function generateImmediateTechniques(stressLevel: number, triggers: string[]) {
  const techniques: Array<{ name: string; description: string; duration: string; effectiveness: 'very_high' | 'high' | 'medium' }> = []

  if (stressLevel >= 8) {
    techniques.push(
      { name: 'Respirația 4-7-8 (URGENT)', description: 'Inspiră 4s, ține 7s, expiră 8s', duration: '2-3 min', effectiveness: 'very_high' },
      { name: 'Grounding 5-4-3-2-1', description: '5 vezi, 4 auzi, 3 simți, 2 miroși, 1 guști', duration: '3-5 min', effectiveness: 'high' },
      { name: 'Relaxare musculară rapidă', description: 'Contractă/relaxează grupe musculare', duration: '3-5 min', effectiveness: 'high' }
    )
  } else if (stressLevel >= 6) {
    techniques.push(
      { name: 'Respirația pătrată', description: '4-4-4-4', duration: '3-5 min', effectiveness: 'high' },
      { name: 'Mindfulness scurt', description: 'Observă respirația fără judecată', duration: '5-10 min', effectiveness: 'medium' }
    )
  } else {
    techniques.push(
      { name: 'Respirație profundă', description: 'Expirații lente și lungi', duration: '2-3 min', effectiveness: 'medium' },
      { name: 'Plimbare scurtă', description: 'Mișcare ușoară', duration: '5-10 min', effectiveness: 'medium' }
    )
  }

  if (triggers?.includes('Work stress')) {
    techniques.push({ name: 'Pauză de la ecran', description: 'Închide ochii + 10 respirații departe de ecran', duration: '2 min', effectiveness: 'medium' })
  }
  if (triggers?.includes('Social situations')) {
    techniques.push({ name: 'Ancorare discretă', description: 'Atinge degetul mare de arătător – „sunt în siguranță”', duration: '30s', effectiveness: 'medium' })
  }

  return techniques.slice(0, 4)
}

function generatePersonalizedStressPlan(context: StressContext, triggers: string[]) {
  const plan = {
    daily_routine: [] as string[],
    weekly_goals: [] as string[],
    trigger_management: [] as Array<{ trigger: string; strategies: string[]; prevention: string }>,
    progress_tracking: [] as string[]
  }

  if (context.patterns?.volatility === 'high') {
    plan.daily_routine = [
      'Dimineața: 5 min respirație profundă',
      'Prânz: check-in stress 1-10',
      'Seara: 10 min journaling/meditație',
      'Înainte de somn: relaxare ghidată'
    ]
  } else {
    plan.daily_routine = [
      'Dimineața: intenția zilei',
      'Seara: reflecție scurtă',
      'Înainte de somn: rutină constantă de somn'
    ]
  }

  if (context.patterns?.trend === 'increasing') {
    plan.weekly_goals = [
      'S1: Listează triggerii principali',
      'S2: Aplică 2 tehnici zilnic',
      'S3: Evaluează eficiența',
      'S4: Consolidare rutină'
    ]
  }

  triggers?.forEach(t => {
    const m = getTriggerManagementStrategy(t)
    if (m) plan.trigger_management.push(m)
  })

  plan.progress_tracking = [
    'Jurnal zilnic: stress 1-10',
    'Notează ce tehnici ai folosit și efectul',
    'Analiză săptămânală pattern-uri',
    'Revizuire lunară obiective'
  ]

  return plan
}

function calculateStressScore(context: StressContext, currentStress: number) {
  if (context.average_stress == null) return null

  let score = Math.max(0, 100 - context.average_stress * 10)
  if (context.patterns?.trend === 'decreasing') score += 15
  else if (context.patterns?.trend === 'increasing') score -= 15
  if (context.patterns?.volatility === 'low') score += 10
  else if (context.patterns?.volatility === 'high') score -= 10

  score -= (currentStress - (context.average_stress || 0)) * 5

  const bounded = Math.max(0, Math.min(100, Math.round(score)))
  return {
    overall_score: bounded,
    components: {
      average_stress: context.average_stress,
      current_stress: currentStress,
      trend: context.patterns?.trend,
      volatility: context.patterns?.volatility
    },
    interpretation:
      bounded >= 80 ? 'Excellent stress management'
        : bounded >= 60 ? 'Good stress control'
        : bounded >= 40 ? 'Moderate stress levels'
        : 'High stress - needs attention'
  }
}

function generateFollowUpActions(stressLevel: number, context: StressContext) {
  const actions: Array<{ timeline: 'next_hour' | 'today' | 'daily' | 'weekly' | 'this_week'; action: string; priority: 'urgent' | 'high' | 'medium' | 'low' }> = []
  if (stressLevel >= 8) {
    actions.push({ timeline: 'next_hour', action: 'Aplică tehnicile imediate și reevaluează', priority: 'urgent' })
    actions.push({ timeline: 'today', action: 'Redu sarcinile cu impact mare și cere suport', priority: 'high' })
  }
  if (context.patterns?.trend === 'increasing') {
    actions.push({ timeline: 'this_week', action: 'Programează o sesiune cu un specialist', priority: 'medium' })
  }
  actions.push({ timeline: 'daily', action: '10-15 min tehnici de relaxare', priority: 'medium' })
  actions.push({ timeline: 'weekly', action: 'Revizuiește progresul și ajustează strategiile', priority: 'low' })

  const order = { urgent: 4, high: 3, medium: 2, low: 1 } as const
  return actions.sort((a, b) => order[b.priority] - order[a.priority])
}

function calculateVariance(numbers: number[]): number {
  if (!numbers.length) return 0
  const mean = numbers.reduce((s, n) => s + n, 0) / numbers.length
  const diffs = numbers.map(n => (n - mean) ** 2)
  return diffs.reduce((s, d) => s + d, 0) / numbers.length
}

function calculateStressTrends(stressData: StressEntry[]) {
  if (stressData.length < 14) return null
  const sorted = [...stressData].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
  const firstWeek = sorted.slice(-7)
  const secondWeek = sorted.slice(-14, -7)
  if (secondWeek.length < 7) return null

  const avg = (arr: StressEntry[]) => arr.reduce((s, e) => s + (e.stress_level || 0), 0) / arr.length
  const w1 = avg(firstWeek)
  const w2 = avg(secondWeek)
  const change = w1 - w2
  const changePct = w2 === 0 ? 0 : (change / w2) * 100

  return {
    week_over_week_change: change,
    change_percentage: changePct,
    trend: change > 0.5 ? 'increasing' : change < -0.5 ? 'decreasing' : 'stable' as const,
    current_week_average: w1,
    previous_week_average: w2
  }
}
