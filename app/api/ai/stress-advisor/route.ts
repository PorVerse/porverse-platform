import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, stress_level, triggers, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Get user's stress patterns and history
    const stressContext = await getStressContext(user.id, supabase)
    
    // Generate personalized stress management response
    const response = await generateStressAdvisorResponse(message, stress_level, triggers, stressContext, context)
    
    // Save conversation
    await supabase.from('ai_conversations').insert({
      user_id: user.id,
      ecosystem: 'por-well',
      ai_model: 'stress-advisor',
      messages: [
        { role: 'user', content: message, stress_level, triggers },
        { role: 'assistant', content: response.content }
      ],
      context_data: { stress_context: stressContext, triggers, current_stress: stress_level },
      created_at: new Date().toISOString()
    })

    // Log stress intervention if high level
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

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = parseInt(searchParams.get('days') || '7')

    // Get stress analysis and recommendations
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

async function getStressContext(userId: string, supabase: any) {
  // Get recent stress levels from mood entries
  const { data: stressData } = await supabase
    .from('mood_entries')
    .select('stress_level, triggers, created_at, mood_score, activities, physical_symptoms')
    .eq('user_id', userId)
    .not('stress_level', 'is', null)
    .order('created_at', { ascending: false })
    .limit(21) // 3 weeks of data

  // Get recent anxiety episodes
  const { data: anxietyEpisodes } = await supabase
    .from('anxiety_episodes')
    .select('severity, triggers, coping_strategies_used, duration_minutes, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Analyze patterns
  const patterns = analyzeStressPatterns(stressData || [])
  const triggerAnalysis = analyzeTriggerEffectiveness(stressData || [], anxietyEpisodes || [])

  return {
    recent_stress_data: stressData || [],
    anxiety_episodes: anxietyEpisodes || [],
    patterns: patterns,
    trigger_analysis: triggerAnalysis,
    average_stress: stressData?.length > 0 
      ? stressData.reduce((sum, entry) => sum + entry.stress_level, 0) / stressData.length 
      : null
  }
}

async function generateStressAdvisorResponse(message: string, stress_level: number, triggers: string[], context: any, situationalContext?: any) {
  try {
    const urgencyLevel = stress_level >= 8 ? 'high' : stress_level >= 6 ? 'medium' : 'low'
    
    const prompt = `Ești un expert în managementul stresului și tehnici de reducere a anxietății pentru utilizatorul român.

CONTEXT ACTUAL:
- Nivel stress: ${stress_level}/10
- Triggers identificați: ${triggers?.join(', ') || 'Niciun trigger specific'}
- Nivel urgență: ${urgencyLevel}
- Stress mediu recent: ${context.average_stress?.toFixed(1) || 'N/A'}/10
- Pattern-uri detectate: ${JSON.stringify(context.patterns)}

MESAJUL UTILIZATORULUI: "${message}"

CONTEXTUALA SITUAȚIONALĂ: ${JSON.stringify(situationalContext)}

Pentru nivel ${urgencyLevel} de urgență, oferă:

1. TEHNICI IMEDIATE (pentru următoarele 5-10 minute):
   ${urgencyLevel === 'high' ? '- Tehnici de urgență pentru calm rapid' : '- Tehnici de relaxare standard'}

2. PLAN PERSONALIZAT pe baza pattern-urilor detectate

3. STRATEGII PREVENTIVE specifice trigger-ilor identificați

4. RECOMANDĂRI DE URMĂRIRE

Include exerciții concrete, timere specifice și pași practici.
Răspunde în română, calm și profesional. Max 250 cuvinte.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Ești un psiholog clinician specialist în terapia cognitiv-comportamentală și managementul stresului acute.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.6
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Răspuns indisponibil temporar'

    // Generate immediate techniques based on stress level
    const immediateTechniques = generateImmediateTechniques(stress_level, triggers, context)
    
    // Generate personalized plan
    const personalizedPlan = generatePersonalizedStressPlan(context, triggers, stress_level)
    
    // Calculate stress score and trends
    const stressScore = calculateStressScore(context, stress_level)
    
    // Generate follow-up actions
    const followUpActions = generateFollowUpActions(stress_level, context, triggers)

    return {
      content: aiResponse,
      immediate_techniques: immediateTechniques,
      personalized_plan: personalizedPlan,
      stress_score: stressScore,
      follow_up_actions: followUpActions
    }

  } catch (error) {
    console.error('Stress advisor AI error:', error)
    
    // Fallback response based on stress level
    const fallbackTechniques = stress_level >= 8 
      ? ['Respirație 4-7-8: Inspiră 4 sec, ține 7 sec, expiră 8 sec', 'Numără în ordine inversă de la 100', 'Identifică 5 lucruri pe care le vezi, 4 pe care le auzi, 3 pe care le simți']
      : ['Respirație profundă de 2 minute', 'Plimbare scurtă', 'Exercițiu de mindfulness']

    return {
      content: `Înțeleg că stress-ul tău este la nivel ${stress_level}/10. Iată tehnici immediate care pot ajuta: ${fallbackTechniques.join('. ')}. Dacă stress-ul persistă, consideră să vorbești cu un specialist.`,
      immediate_techniques: fallbackTechniques,
      personalized_plan: null,
      stress_score: null,
      follow_up_actions: []
    }
  }
}

function analyzeStressPatterns(stressData: any[]) {
  if (stressData.length < 5) return { insufficient_data: true }

  const patterns = {
    weekly_average: 0,
    trend: 'stable',
    peak_times: [],
    volatility: 'normal',
    recovery_rate: 'unknown'
  }

  // Calculate weekly average
  patterns.weekly_average = stressData.reduce((sum, entry) => sum + entry.stress_level, 0) / stressData.length

  // Analyze trend
  const recent = stressData.slice(0, Math.ceil(stressData.length / 3))
  const older = stressData.slice(-Math.ceil(stressData.length / 3))
  
  const recentAvg = recent.reduce((sum, entry) => sum + entry.stress_level, 0) / recent.length
  const olderAvg = older.reduce((sum, entry) => sum + entry.stress_level, 0) / older.length

  if (recentAvg > olderAvg + 0.8) patterns.trend = 'increasing'
  else if (recentAvg < olderAvg - 0.8) patterns.trend = 'decreasing'

  // Analyze volatility
  const stressLevels = stressData.map(entry => entry.stress_level)
  const variance = calculateVariance(stressLevels)
  
  if (variance > 4) patterns.volatility = 'high'
  else if (variance > 2) patterns.volatility = 'moderate'
  else patterns.volatility = 'low'

  // Analyze recovery patterns
  patterns.recovery_rate = analyzeRecoveryRate(stressData)

  // Identify peak stress times (day of week analysis)
  patterns.peak_times = identifyStressPeakTimes(stressData)

  return patterns
}

function analyzeTriggerEffectiveness(stressData: any[], anxietyEpisodes: any[]) {
  const triggerImpact = {}
  const copingEffectiveness = {}

  // Analyze triggers from stress data
  stressData.forEach(entry => {
    if (entry.triggers && Array.isArray(entry.triggers)) {
      entry.triggers.forEach(trigger => {
        if (!triggerImpact[trigger]) {
          triggerImpact[trigger] = { total_stress: 0, count: 0, average: 0 }
        }
        triggerImpact[trigger].total_stress += entry.stress_level
        triggerImpact[trigger].count++
      })
    }
  })

  // Calculate averages
  Object.keys(triggerImpact).forEach(trigger => {
    triggerImpact[trigger].average = triggerImpact[trigger].total_stress / triggerImpact[trigger].count
  })

  // Analyze coping strategies from anxiety episodes
  anxietyEpisodes.forEach(episode => {
    if (episode.coping_strategies_used && Array.isArray(episode.coping_strategies_used)) {
      episode.coping_strategies_used.forEach(strategy => {
        if (!copingEffectiveness[strategy]) {
          copingEffectiveness[strategy] = { 
            uses: 0, 
            total_severity_before: 0, 
            effectiveness_score: 0 
          }
        }
        copingEffectiveness[strategy].uses++
        copingEffectiveness[strategy].total_severity_before += episode.severity
        // Effectiveness based on duration (shorter = more effective)
        const effectiveness = Math.max(1, 10 - (episode.duration_minutes / 10))
        copingEffectiveness[strategy].effectiveness_score += effectiveness
      })
    }
  })

  // Calculate effectiveness averages
  Object.keys(copingEffectiveness).forEach(strategy => {
    const data = copingEffectiveness[strategy]
    data.average_effectiveness = data.effectiveness_score / data.uses
  })

  return {
    top_triggers: Object.entries(triggerImpact)
      .sort(([,a], [,b]) => b.average - a.average)
      .slice(0, 5)
      .map(([trigger, data]) => ({ trigger, impact: data.average, frequency: data.count })),
    
    most_effective_coping: Object.entries(copingEffectiveness)
      .filter(([, data]) => data.uses >= 2)
      .sort(([,a], [,b]) => b.average_effectiveness - a.average_effectiveness)
      .slice(0, 3)
      .map(([strategy, data]) => ({ 
        strategy, 
        effectiveness: data.average_effectiveness, 
        usage_count: data.uses 
      }))
  }
}

function generateImmediateTechniques(stressLevel: number, triggers: string[], context: any) {
  const techniques = []

  if (stressLevel >= 8) {
    // Crisis-level stress
    techniques.push(
      {
        name: 'Respirația 4-7-8 (URGENT)',
        description: 'Inspiră prin nas 4 secunde, ține respirația 7 secunde, expiră prin gură 8 secunde',
        duration: '2-3 minute',
        effectiveness: 'very_high'
      },
      {
        name: 'Grounding 5-4-3-2-1',
        description: 'Identifică: 5 lucruri pe care le vezi, 4 pe care le auzi, 3 pe care le simți, 2 pe care le miroși, 1 pe care îl guști',
        duration: '3-5 minute',
        effectiveness: 'high'
      },
      {
        name: 'Relaxare musculară progresivă rapidă',
        description: 'Contractă și relaxează grupurile de mușchi, începând cu picioarele',
        duration: '5-7 minute',
        effectiveness: 'high'
      }
    )
  } else if (stressLevel >= 6) {
    // Moderate stress
    techniques.push(
      {
        name: 'Respirația pătrată',
        description: 'Inspiră 4 secunde, ține 4, expiră 4, pauză 4',
        duration: '3-5 minute',
        effectiveness: 'high'
      },
      {
        name: 'Mindfulness scurt',
        description: 'Focusează-te pe respirație și observă gândurile fără să le judeci',
        duration: '5-10 minute',
        effectiveness: 'medium'
      }
    )
  } else {
    // Mild stress
    techniques.push(
      {
        name: 'Respirație profundă',
        description: 'Respirații lente și profunde, concentrează-te pe expirație',
        duration: '2-3 minute',
        effectiveness: 'medium'
      },
      {
        name: 'Plimbare scurtă',
        description: 'Mișcare ușoară în aer liber sau prin casă',
        duration: '5-10 minute',
        effectiveness: 'medium'
      }
    )
  }

  // Add trigger-specific techniques
  if (triggers?.includes('Work stress')) {
    techniques.push({
      name: 'Pauză de la ecran',
      description: 'Închide ochii și fă 10 respirații profunde departe de computer',
      duration: '2 minute',
      effectiveness: 'medium'
    })
  }

  if (triggers?.includes('Social situations')) {
    techniques.push({
      name: 'Ancorare discretă',
      description: 'Atinge ușor degetul mare cu indexul pentru a-ți aminti că ești în siguranță',
      duration: '30 secunde',
      effectiveness: 'medium'
    })
  }

  return techniques.slice(0, 4) // Max 4 techniques
}

function generatePersonalizedStressPlan(context: any, triggers: string[], stressLevel: number) {
  const plan = {
    daily_routine: [],
    weekly_goals: [],
    trigger_management: [],
    progress_tracking: []
  }

  // Daily routine based on patterns
  if (context.patterns?.volatility === 'high') {
    plan.daily_routine = [
      'Dimineața: 5 minute respirație profundă',
      'Prânz: Check-in rapid cu nivelul de stress',
      'Seara: 10 minute journaling sau meditație',
      'Înainte de culcare: Tehnici de relaxare'
    ]
  } else {
    plan.daily_routine = [
      'Dimineața: Setarea intenției pentru zi',
      'Seara: Reflectare asupra momentelor de stress',
      'Înainte de culcare: Pregătirea pentru somn odihnitor'
    ]
  }

  // Weekly goals based on stress trend
  if (context.patterns?.trend === 'increasing') {
    plan.weekly_goals = [
      'Săptămâna 1: Identifică trigger-ii principali',
      'Săptămâna 2: Implementează tehnici de coping',
      'Săptămâna 3: Evaluează eficacitatea tehnicilor',
      'Săptămâna 4: Consolidează rutina anti-stress'
    ]
  }

  // Trigger-specific management
  triggers?.forEach(trigger => {
    const management = getTriggerManagementStrategy(trigger)
    if (management) {
      plan.trigger_management.push(management)
    }
  })

  // Progress tracking suggestions
  plan.progress_tracking = [
    'Urmărește nivelul de stress zilnic (1-10)',
    'Notează eficacitatea tehnicilor folosite',
    'Identifică pattern-urile săptămânale',
    'Evaluează progresul lunar'
  ]

  return plan
}

function calculateStressScore(context: any, currentStress: number) {
  if (!context.average_stress) return null

  // Base score (inverted - lower stress = higher score)
  let score = Math.max(0, 100 - (context.average_stress * 10))

  // Adjust for trend
  if (context.patterns?.trend === 'decreasing') score += 15
  else if (context.patterns?.trend === 'increasing') score -= 15

  // Adjust for volatility
  if (context.patterns?.volatility === 'low') score += 10
  else if (context.patterns?.volatility === 'high') score -= 10

  // Adjust for current stress level
  const stressDiff = currentStress - context.average_stress
  score -= (stressDiff * 5)

  return {
    overall_score: Math.max(0, Math.min(100, Math.round(score))),
    components: {
      average_stress: context.average_stress,
      current_stress: currentStress,
      trend: context.patterns?.trend,
      volatility: context.patterns?.volatility
    },
    interpretation: score >= 80 ? 'Excellent stress management' :
                   score >= 60 ? 'Good stress control' :
                   score >= 40 ? 'Moderate stress levels' : 'High stress - needs attention'
  }
}

function generateFollowUpActions(stressLevel: number, context: any, triggers: string[]) {
  const actions = []

  if (stressLevel >= 8) {
    actions.push({
      timeline: 'next_hour',
      action: 'Implementează tehnicile imediate și evaluează din nou',
      priority: 'urgent'
    })
    
    actions.push({
      timeline: 'today',
      action: 'Consideră reducerea sarcinilor stresante și cere ajutor dacă e necesar',
      priority: 'high'
    })
  }

  if (context.patterns?.trend === 'increasing') {
    actions.push({
      timeline: 'this_week',
      action: 'Programează o sesiune cu un specialist pentru strategii avansate',
      priority: 'medium'
    })
  }

  // Generic follow-up based on patterns
  actions.push({
    timeline: 'daily',
    action: 'Practică tehnicile de relaxare 10-15 minute zilnic',
    priority: 'medium'
  })

  actions.push({
    timeline: 'weekly',
    action: 'Revizuiește progresul și ajustează strategiile dacă e necesar',
    priority: 'low'
  })

  return actions.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

async function generateStressAnalysis(userId: string, supabase: any, days: number) {
  const context = await getStressContext(userId, supabase)
  
  // Filter data for requested timeframe
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const recentData = context.recent_stress_data.filter(
    entry => new Date(entry.created_at) >= cutoffDate
  )

  if (recentData.length === 0) {
    return {
      analysis: 'Insufficient data for the requested timeframe',
      patterns: null,
      top_triggers: [],
      trends: null,
      recommendations: [],
      coping_effectiveness: []
    }
  }

  const analysis = analyzeStressPatterns(recentData)
  const triggerAnalysis = analyzeTriggerEffectiveness(recentData, context.anxiety_episodes)

  return {
    analysis: {
      timeframe_days: days,
      total_entries: recentData.length,
      average_stress: recentData.reduce((sum, entry) => sum + entry.stress_level, 0) / recentData.length,
      highest_stress: Math.max(...recentData.map(e => e.stress_level)),
      lowest_stress: Math.min(...recentData.map(e => e.stress_level))
    },
    patterns: analysis,
    top_triggers: triggerAnalysis.top_triggers,
    trends: calculateStressTrends(recentData),
    recommendations: generateStressRecommendations(analysis, triggerAnalysis),
    coping_effectiveness: triggerAnalysis.most_effective_coping
  }
}

// Helper functions
function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2))
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
}

function analyzeRecoveryRate(stressData: any[]): string {
  // Analyze how quickly stress levels return to baseline after peaks
  const peaks = stressData.filter(entry => entry.stress_level >= 7)
  if (peaks.length < 2) return 'insufficient_data'

  let totalRecoveryTime = 0
  let recoveryCount = 0

  for (let i = 0; i < peaks.length; i++) {
    const peakTime = new Date(peaks[i].created_at)
    // Look for return to normal (stress < 6) within next entries
    const laterEntries = stressData.filter(entry => 
      new Date(entry.created_at) > peakTime && entry.stress_level < 6
    )
    
    if (laterEntries.length > 0) {
      const recoveryTime = new Date(laterEntries[0].created_at)
      const diffDays = (recoveryTime.getTime() - peakTime.getTime()) / (1000 * 60 * 60 * 24)
      totalRecoveryTime += diffDays
      recoveryCount++
    }
  }

  if (recoveryCount === 0) return 'poor'
  
  const avgRecoveryDays = totalRecoveryTime / recoveryCount
  
  if (avgRecoveryDays <= 1) return 'excellent'
  if (avgRecoveryDays <= 2) return 'good'
  if (avgRecoveryDays <= 4) return 'moderate'
  return 'slow'
}

function identifyStressPeakTimes(stressData: any[]): string[] {
  const dayOfWeekStress: { [key: number]: number[] } = {}
  
  stressData.forEach(entry => {
    const day = new Date(entry.created_at).getDay()
    if (!dayOfWeekStress[day]) dayOfWeekStress[day] = []
    dayOfWeekStress[day].push(entry.stress_level)
  })

  const dayAverages = Object.entries(dayOfWeekStress).map(([day, stressLevels]) => ({
    day: parseInt(day),
    average: stressLevels.reduce((sum, level) => sum + level, 0) / stressLevels.length,
    count: stressLevels.length
  }))

  const sortedDays = dayAverages
    .filter(d => d.count >= 2) // Only days with sufficient data
    .sort((a, b) => b.average - a.average)

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  return sortedDays.slice(0, 2).map(d => dayNames[d.day])
}

function getTriggerManagementStrategy(trigger: string) {
  const strategies = {
    'Work stress': {
      trigger: 'Work stress',
      strategies: [
        'Pomodoro technique pentru managementul sarcinilor',
        'Pauze regulate de 5 minute la fiecare oră',
        'Prioritizarea sarcinilor cu matricea urgent/important'
      ],
      prevention: 'Stabilește limite clare între timpul de lucru și timpul personal'
    },
    'Relationships': {
      trigger: 'Relationships',
      strategies: [
        'Comunicare asertivă pentru exprimarea nevoilor',
        'Stabilirea limitelor sănătoase',
        'Tehnici de conflict resolution'
      ],
      prevention: 'Programează timp de calitate regulat cu persoanele importante'
    },
    'Financial worries': {
      trigger: 'Financial worries',
      strategies: [
        'Crearea unui buget realist',
        'Focusarea pe aspectele controlabile',
        'Planificarea financiară pe termen scurt'
      ],
      prevention: 'Fond de urgență și planificare financiară regulată'
    }
  }

  return strategies[trigger] || null
}

function calculateStressTrends(stressData: any[]) {
  if (stressData.length < 7) return null

  // Weekly comparison
  const firstWeek = stressData.slice(-7)
  const secondWeek = stressData.slice(-14, -7)

  if (secondWeek.length < 7) return null

  const firstWeekAvg = firstWeek.reduce((sum, entry) => sum + entry.stress_level, 0) / firstWeek.length
  const secondWeekAvg = secondWeek.reduce((sum, entry) => sum + entry.stress_level, 0) / secondWeek.length

  const change = firstWeekAvg - secondWeekAvg
  const changePercent = (change / secondWeekAvg) * 100

  return {
    week_over_week_change: change,
    change_percentage: changePercent,
    trend: change > 0.5 ? 'increasing' : change < -0.5 ? 'decreasing' : 'stable',
    current_week_average: firstWeekAvg,
    previous_week_average: secondWeekAvg
  }
}

function generateStressRecommendations(patterns: any, triggerAnalysis: any) {
  const recommendations = []

  if (patterns.trend === 'increasing') {
    recommendations.push({
      priority: 'high',
      category: 'trend_intervention',
      title: 'Intervenție pentru stress crescând',
      description: 'Nivelul de stress crește - e timpul pentru schimbări proactive',
      actions: ['Identifică sursele principale de stress', 'Implementează rutine zilnice de relaxare', 'Consideră ajutor profesional']
    })
  }

  if (patterns.volatility === 'high') {
    recommendations.push({
      priority: 'medium',
      category: 'stabilization',
      title: 'Stabilizarea nivelurilor de stress',
      description: 'Stress-ul variază mult - focusează-te pe consistență',
      actions: ['Rutină zilnică de mindfulness', 'Identifică pattern-urile care declanșează vârfurile', 'Tehnici preventive']
    })
  }

  if (triggerAnalysis.top_triggers.length > 0) {
    const mainTrigger = triggerAnalysis.top_triggers[0]
    recommendations.push({
      priority: 'medium',
      category: 'trigger_management',
      title: `Gestionarea: ${mainTrigger.trigger}`,
      description: `Trigger-ul "${mainTrigger.trigger}" are un impact mare (${mainTrigger.impact.toFixed(1)}/10)`,
      actions: ['Dezvoltă strategii specifice pentru acest trigger', 'Practică tehnici de prevenție', 'Monitorizează eficacitatea']
    })
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}