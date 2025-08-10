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

    const { message, sleep_data, goal } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const sleepContext = await getSleepContext(user.id, supabase)
    const response = await generateSleepCoachingResponse(message, sleep_data, sleepContext, goal)
    
    await supabase.from('ai_conversations').insert({
      user_id: user.id,
      ecosystem: 'por-well',
      ai_model: 'sleep-coach',
      messages: [
        { role: 'user', content: message, sleep_data },
        { role: 'assistant', content: response.content }
      ],
      context_data: { sleep_context: sleepContext, goal },
      created_at: new Date().toISOString()
    })

    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      ecosystem: 'por-well',
      action_type: 'sleep_coach_interaction',
      action_data: { goal, has_sleep_data: !!sleep_data }
    })

    return NextResponse.json({
      success: true,
      response: response.content,
      sleep_plan: response.sleep_plan,
      recommendations: response.recommendations,
      sleep_score: response.sleep_score,
      session_id: crypto.randomUUID()
    })

  } catch (error) {
    console.error('Sleep coach error:', error)
    return NextResponse.json({ error: 'Sleep coach unavailable' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sleepInsights = await generateSleepInsights(user.id, supabase)

    return NextResponse.json({
      success: true,
      insights: sleepInsights.insights,
      sleep_score: sleepInsights.sleep_score,
      weekly_average: sleepInsights.weekly_average,
      recommendations: sleepInsights.recommendations,
      sleep_debt: sleepInsights.sleep_debt
    })

  } catch (error) {
    console.error('Sleep insights error:', error)
    return NextResponse.json({ error: 'Sleep insights unavailable' }, { status: 500 })
  }
}

async function getSleepContext(userId: string, supabase: any) {
  const { data: sleepData } = await supabase
    .from('mood_entries')
    .select('sleep_quality, created_at, mood_score, stress_level')
    .eq('user_id', userId)
    .not('sleep_quality', 'is', null)
    .order('created_at', { ascending: false })
    .limit(14)

  const { data: healthProfile } = await supabase
    .from('user_health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  const sleepPatterns = analyzeSleepPatterns(sleepData || [])

  return {
    recent_sleep_data: sleepData || [],
    health_profile: healthProfile,
    patterns: sleepPatterns,
    average_sleep_quality: sleepData?.length > 0 
      ? sleepData.reduce((sum: number, entry: any) => sum + entry.sleep_quality, 0) / sleepData.length 
      : null
  }
}

async function generateSleepCoachingResponse(message: string, sleep_data: any, context: any, goal?: string) {
  try {
    const prompt = `Ești un expert în medicina somnului și coach de somn personalizat pentru utilizatorul român.

CONTEXT UTILIZATOR:
- Calitate somn medie: ${context.average_sleep_quality?.toFixed(1) || 'N/A'}/10
- Pattern-uri detectate: ${JSON.stringify(context.patterns)}
- Obiectiv: ${goal || 'Îmbunătățirea calității somnului'}
- Date somn curente: ${JSON.stringify(sleep_data)}

MESAJUL UTILIZATORULUI: "${message}"

Oferă sfaturi personalizate pentru:
1. Îmbunătățirea calității somnului
2. Rutine de culcare optimizate
3. Factori de mediu (temperatură, lumină, zgomot)
4. Tehnici de relaxare pre-somn
5. Managementul stresului pentru somn mai bun

Include recomandări practice și timeline-uri realiste.
Răspunde în română, empatic și profesional. Max 200 cuvinte.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Ești un specialist în medicina somnului cu experiență în terapia cognitiv-comportamentală pentru insomnie (CBT-I).'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Răspuns indisponibil temporar'
    const sleepPlan = generateSleepPlan(context, goal, sleep_data)
    const recommendations = generateSleepRecommendations(context, sleep_data)
    const sleepScore = calculateSleepScore(context, sleep_data)

    return {
      content: aiResponse,
      sleep_plan: sleepPlan,
      recommendations: recommendations,
      sleep_score: sleepScore
    }

  } catch (error) {
    console.error('Sleep coaching AI error:', error)
    return {
      content: 'Îmi pare rău, am întâmpinat o problemă tehnică. Iată câteva sfaturi generale pentru un somn mai bun: Menține un program regulat de somn, evită cafeaua după ora 14:00, și creează un ritual de relaxare înainte de culcare.',
      sleep_plan: null,
      recommendations: [],
      sleep_score: null
    }
  }
}

function analyzeSleepPatterns(sleepData: any[]) {
  if (sleepData.length < 3) return { insufficient_data: true }

  const patterns = {
    weekly_average: 0,
    trend: 'stable',
    consistency: 'unknown',
    mood_correlation: 'unknown'
  }

  patterns.weekly_average = sleepData.reduce((sum: number, entry: any) => sum + entry.sleep_quality, 0) / sleepData.length

  const recent = sleepData.slice(0, Math.ceil(sleepData.length / 2))
  const older = sleepData.slice(-Math.ceil(sleepData.length / 2))
  
  const recentAvg = recent.reduce((sum: number, entry: any) => sum + entry.sleep_quality, 0) / recent.length
  const olderAvg = older.reduce((sum: number, entry: any) => sum + entry.sleep_quality, 0) / older.length

  if (recentAvg > olderAvg + 0.5) patterns.trend = 'improving'
  else if (recentAvg < olderAvg - 0.5) patterns.trend = 'declining'

  const sleepQualityValues = sleepData.map((entry: any) => entry.sleep_quality)
  const variance = calculateVariance(sleepQualityValues)
  
  if (variance < 1) patterns.consistency = 'very_consistent'
  else if (variance < 2) patterns.consistency = 'consistent'
  else if (variance < 3) patterns.consistency = 'somewhat_variable'
  else patterns.consistency = 'highly_variable'

  const validEntries = sleepData.filter((entry: any) => entry.mood_score)
  if (validEntries.length >= 3) {
    const correlation = calculateSimpleCorrelation(
      validEntries.map((e: any) => e.sleep_quality),
      validEntries.map((e: any) => e.mood_score)
    )
    
    if (correlation > 0.3) patterns.mood_correlation = 'positive'
    else if (correlation < -0.3) patterns.mood_correlation = 'negative'
    else patterns.mood_correlation = 'weak'
  }

  return patterns
}

function generateSleepPlan(context: any, goal?: string, sleepData?: any) {
  const plan = {
    target_bedtime: '22:30',
    target_wake_time: '06:30',
    sleep_duration_goal: '8 hours',
    weekly_goals: [] as string[],
    daily_routine: [] as string[]
  }

  if (context.average_sleep_quality < 5) {
    plan.weekly_goals = [
      'Săptămâna 1: Stabilizează program de somn',
      'Săptămâna 2: Optimizează mediul de somn',
      'Săptămâna 3: Implementează tehnici de relaxare',
      'Săptămâna 4: Consolidează rutina și evaluează progresul'
    ]
  } else if (context.average_sleep_quality < 7) {
    plan.weekly_goals = [
      'Săptămâna 1-2: Rafinează rutina existentă',
      'Săptămâna 3-4: Optimizează calitatea somnului profund'
    ]
  }

  plan.daily_routine = [
    '19:00 - Ultima masă consistentă',
    '20:00 - Activități relaxante (lectură, baie caldă)',
    '21:00 - Pregătirea pentru somn (reducere lumină)',
    '22:00 - Tehnici de relaxare în pat',
    '22:30 - Ora țintă de adormire'
  ]

  if (goal?.includes('insomnie') || goal?.includes('adormire')) {
    plan.daily_routine.push('Dacă nu adormi în 20 min, ieși din pat și fa o activitate liniștitoare')
  }

  return plan
}

function generateSleepRecommendations(context: any, sleepData?: any) {
  const recommendations: any[] = []

  if (context.average_sleep_quality < 5) {
    recommendations.push({
      category: 'urgent',
      title: 'Optimizare mediu de somn',
      description: 'Camera între 16-19°C, întuneric complet, liniște',
      priority: 'high'
    })
    
    recommendations.push({
      category: 'routine',
      title: 'Rutină strictă de culcare',
      description: 'Aceeași oră de culcare și trezire, chiar și în weekend',
      priority: 'high'
    })
  }

  if (context.patterns?.consistency === 'highly_variable') {
    recommendations.push({
      category: 'consistency',
      title: 'Stabilizarea programului',
      description: 'Variațiile mari în calitatea somnului sugerează necesitatea unei rutine mai stricte',
      priority: 'medium'
    })
  }

  if (context.patterns?.trend === 'declining') {
    recommendations.push({
      category: 'intervention',
      title: 'Intervenție imediată',
      description: 'Calitatea somnului scade - evaluează factorii de stress și modificările recente',
      priority: 'high'
    })
  }

  recommendations.push({
    category: 'lifestyle',
    title: 'Optimizare stil de viață',
    description: 'Exerciții regulate (dar nu cu 4h înainte de culcare), evită cafeaua după 14:00',
    priority: 'low'
  })

  return recommendations.sort((a: any, b: any) => {
    const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

function calculateSleepScore(context: any, sleepData?: any) {
  if (!context.average_sleep_quality) return null

  let score = context.average_sleep_quality * 10

  if (context.patterns?.consistency === 'very_consistent') score += 10
  else if (context.patterns?.consistency === 'highly_variable') score -= 15

  if (context.patterns?.trend === 'improving') score += 10
  else if (context.patterns?.trend === 'declining') score -= 15

  if (context.patterns?.mood_correlation === 'positive') score += 5

  return {
    overall_score: Math.max(0, Math.min(100, Math.round(score))),
    components: {
      quality: context.average_sleep_quality * 10,
      consistency: context.patterns?.consistency,
      trend: context.patterns?.trend,
      mood_impact: context.patterns?.mood_correlation
    },
    interpretation: score >= 80 ? 'Excellent' : 
                   score >= 60 ? 'Good' : 
                   score >= 40 ? 'Fair' : 'Poor'
  }
}

async function generateSleepInsights(userId: string, supabase: any) {
  const context = await getSleepContext(userId, supabase)
  
  const weeklyData = context.recent_sleep_data.slice(0, 7)
  const weeklyAverage = weeklyData.length > 0 
    ? weeklyData.reduce((sum: number, entry: any) => sum + entry.sleep_quality, 0) / weeklyData.length 
    : 0

  const idealSleep = 8
  const estimatedActualSleep = Math.max(4, weeklyAverage * 0.8)
  const sleepDebt = Math.max(0, (idealSleep - estimatedActualSleep) * 7)

  const insights: string[] = []

  if (context.patterns && 'trend' in context.patterns) {
  if (context.patterns.trend === 'improving') {
    insights.push('📈 Calitatea somnului se îmbunătățește! Continuă rutina actuală.')
  } else if (context.patterns.trend === 'declining') {
    insights.push('⚠️ Calitatea somnului scade. Este timpul să revizuiești rutina de culcare.')
  }
}

if (context.patterns && 'mood_correlation' in context.patterns && context.patterns.mood_correlation === 'positive') {
  insights.push('😊 Există o legătură clară între calitatea somnului și dispoziția ta.')
}

if (context.patterns && 'consistency' in context.patterns && context.patterns.consistency === 'highly_variable') {
  insights.push('🎯 Focusează-te pe o rutină mai constantă pentru rezultate mai bune.')
}

  return {
    insights,
    sleep_score: calculateSleepScore(context),
    weekly_average: weeklyAverage,
    recommendations: generateSleepRecommendations(context),
    sleep_debt: {
      hours: sleepDebt,
      severity: sleepDebt < 5 ? 'low' : sleepDebt < 10 ? 'medium' : 'high',
      recovery_time: Math.ceil(sleepDebt / 2) + ' days'
    }
  }
}

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0
  
  const mean = numbers.reduce((sum: number, num: number) => sum + num, 0) / numbers.length
  const squaredDiffs = numbers.map((num: number) => Math.pow(num - mean, 2))
  return squaredDiffs.reduce((sum: number, diff: number) => sum + diff, 0) / numbers.length
}

function calculateSimpleCorrelation(arr1: number[], arr2: number[]): number {
  if (arr1.length !== arr2.length || arr1.length < 2) return 0

  const n = arr1.length
  const sum1 = arr1.reduce((sum: number, val: number) => sum + val, 0)
  const sum2 = arr2.reduce((sum: number, val: number) => sum + val, 0)
  const sum1Sq = arr1.reduce((sum: number, val: number) => sum + val * val, 0)
  const sum2Sq = arr2.reduce((sum: number, val: number) => sum + val * val, 0)
  const pSum = arr1.reduce((sum: number, val: number, i: number) => sum + val * arr2[i], 0)

  const num = pSum - (sum1 * sum2 / n)
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n))

  return den === 0 ? 0 : num / den
}