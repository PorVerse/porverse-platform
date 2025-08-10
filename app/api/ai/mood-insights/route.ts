import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30' // days
    const includeAI = searchParams.get('ai') === 'true'

    // Get mood entries for the specified timeframe
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(timeframe))

    const { data: moodEntries, error: moodError } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (moodError) {
      console.error('Database error:', moodError)
      return NextResponse.json({ error: 'Failed to fetch mood data' }, { status: 500 })
    }

    if (!moodEntries || moodEntries.length === 0) {
      return NextResponse.json({
        message: 'Nu există înregistrări de dispoziție pentru perioada selectată',
        insights: [],
        statistics: null,
        recommendations: []
      })
    }

    // Calculate basic statistics
    const statistics = calculateMoodStatistics(moodEntries)
    
    // Detect patterns
    const patterns = detectAdvancedPatterns(moodEntries)
    
    // Generate correlations
    const correlations = analyzeCorrelations(moodEntries)

    let aiInsights = null
    if (includeAI && moodEntries.length >= 3) {
      aiInsights = await generateAIInsights(moodEntries, statistics, patterns)
    }

    // Generate personalized recommendations
    const recommendations = generatePersonalizedRecommendations(statistics, patterns, correlations)

    // Log analytics event
    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      ecosystem: 'por-well',
      action_type: 'mood_insights_viewed',
      action_data: {
        timeframe: parseInt(timeframe),
        entries_analyzed: moodEntries.length,
        ai_insights_included: includeAI
      }
    })

    return NextResponse.json({
      success: true,
      timeframe: parseInt(timeframe),
      entries_count: moodEntries.length,
      statistics,
      patterns,
      correlations,
      ai_insights: aiInsights,
      recommendations,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Mood insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate mood insights' },
      { status: 500 }
    )
  }
}

function calculateMoodStatistics(entries: any[]) {
  const moodScores = entries.map(e => e.mood_score).filter(s => s != null)
  const anxietyLevels = entries.map(e => e.anxiety_level).filter(s => s != null)
  const stressLevels = entries.map(e => e.stress_level).filter(s => s != null)
  const sleepQuality = entries.map(e => e.sleep_quality).filter(s => s != null)

  return {
    mood: {
      average: calculateAverage(moodScores),
      min: Math.min(...moodScores),
      max: Math.max(...moodScores),
      trend: calculateTrend(moodScores)
    },
    anxiety: anxietyLevels.length > 0 ? {
      average: calculateAverage(anxietyLevels),
      min: Math.min(...anxietyLevels),
      max: Math.max(...anxietyLevels),
      trend: calculateTrend(anxietyLevels)
    } : null,
    stress: stressLevels.length > 0 ? {
      average: calculateAverage(stressLevels),
      min: Math.min(...stressLevels),
      max: Math.max(...stressLevels),
      trend: calculateTrend(stressLevels)
    } : null,
    sleep: sleepQuality.length > 0 ? {
      average: calculateAverage(sleepQuality),
      min: Math.min(...sleepQuality),
      max: Math.max(...sleepQuality)
    } : null,
    total_entries: entries.length,
    date_range: {
      from: entries[entries.length - 1]?.created_at,
      to: entries[0]?.created_at
    }
  }
}

function detectAdvancedPatterns(entries: any[]) {
  const patterns = []

  // Weekly patterns
  const weeklyPattern = analyzeWeeklyPatterns(entries)
  if (weeklyPattern.significant) {
    patterns.push({
      type: 'weekly',
      description: weeklyPattern.description,
      confidence: weeklyPattern.confidence,
      data: weeklyPattern.data
    })
  }

  // Trigger patterns
  const triggerAnalysis = analyzeTriggerPatterns(entries)
  patterns.push(...triggerAnalysis)

  // Mood volatility
  const volatility = analyzeMoodVolatility(entries)
  if (volatility.isHighVolatility) {
    patterns.push({
      type: 'volatility',
      description: 'Dispoziția prezintă variații mari',
      severity: volatility.severity,
      recommendations: ['Identificarea factorilor care contribuie la instabilitate']
    })
  }

  // Recovery patterns
  const recovery = analyzeRecoveryPatterns(entries)
  if (recovery.hasPattern) {
    patterns.push({
      type: 'recovery',
      description: recovery.description,
      strength: recovery.strength
    })
  }

  return patterns
}

function analyzeCorrelations(entries: any[]) {
  const correlations = []

  // Sleep-mood correlation
  const sleepMoodCorr = calculateCorrelation(
    entries.map(e => e.sleep_quality).filter(s => s != null),
    entries.filter(e => e.sleep_quality != null).map(e => e.mood_score)
  )

  if (sleepMoodCorr.significant) {
    correlations.push({
      type: 'sleep_mood',
      strength: sleepMoodCorr.strength,
      description: sleepMoodCorr.strength > 0.5 
        ? 'Calitatea somnului influențează pozitiv dispoziția'
        : 'Exists legătură între somn și dispoziție'
    })
  }

  // Activity-mood correlations
  const activityAnalysis = analyzeActivityMoodCorrelations(entries)
  correlations.push(...activityAnalysis)

  return correlations
}

async function generateAIInsights(entries: any[], statistics: any, patterns: any[]) {
  try {
    const prompt = `Analizează aceste date de dispoziție și oferă insights personalizate:

STATISTICI:
- Dispoziție medie: ${statistics.mood.average.toFixed(1)}/10
- Trend dispoziție: ${statistics.mood.trend}
- Anxietate medie: ${statistics.anxiety?.average?.toFixed(1) || 'N/A'}/10
- Stress mediu: ${statistics.stress?.average?.toFixed(1) || 'N/A'}/10
- Calitate somn medie: ${statistics.sleep?.average?.toFixed(1) || 'N/A'}/10

PATTERN-URI DETECTATE:
${patterns.map(p => `- ${p.type}: ${p.description}`).join('\n')}

INTRĂRI RECENTE (sample):
${entries.slice(0, 5).map(e => 
  `Zi ${new Date(e.created_at).toLocaleDateString()}: Mood ${e.mood_score}/10, Anxietate ${e.anxiety_level || 'N/A'}/10, Triggers: ${e.triggers?.join(', ') || 'None'}`
).join('\n')}

Oferă:
1. Insight-uri personalizate despre pattern-uri și tendințe
2. Factori pozitivi identificați 
3. Zone de îmbunătățire
4. Strategii practice specifice
5. Perspective încurajatoare

Răspunde în română, empatic și constructiv. Max 250 cuvinte.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Ești un psiholog experimentat care analizează date de mood tracking pentru a oferi insights personalizate și constructive.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.7
    })

    return {
      analysis: completion.choices[0]?.message?.content || 'Analiză AI indisponibilă',
      confidence_score: 0.85,
      generated_at: new Date().toISOString()
    }

  } catch (error) {
    console.error('AI insights generation error:', error)
    return {
      analysis: 'Analiză AI temporar indisponibilă. Datele tale sunt procesate și insight-urile bazice sunt disponibile.',
      confidence_score: 0,
      generated_at: new Date().toISOString()
    }
  }
}

// Helper functions
function calculateAverage(numbers: number[]): number {
  return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0
}

function calculateTrend(values: number[]): string {
  if (values.length < 3) return 'insufficient_data'
  
  const recent = values.slice(0, Math.ceil(values.length / 3))
  const older = values.slice(-Math.ceil(values.length / 3))
  
  const recentAvg = calculateAverage(recent)
  const olderAvg = calculateAverage(older)
  
  const diff = recentAvg - olderAvg
  
  if (diff > 0.5) return 'improving'
  if (diff < -0.5) return 'declining'
  return 'stable'
}

function analyzeWeeklyPatterns(entries: any[]) {
  const dayOfWeekMoods: { [key: number]: number[] } = {}
  
  entries.forEach(entry => {
    const day = new Date(entry.created_at).getDay()
    if (!dayOfWeekMoods[day]) dayOfWeekMoods[day] = []
    dayOfWeekMoods[day].push(entry.mood_score)
  })

  const dayAverages = Object.entries(dayOfWeekMoods).map(([day, moods]) => ({
    day: parseInt(day),
    average: calculateAverage(moods),
    count: moods.length
  }))

  const minDay = dayAverages.reduce((min, curr) => curr.average < min.average ? curr : min)
  const maxDay = dayAverages.reduce((max, curr) => curr.average > max.average ? curr : max)

  const dayNames = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă']
  
  return {
    significant: Math.abs(maxDay.average - minDay.average) > 1.5,
    confidence: Math.min(minDay.count, maxDay.count) >= 2 ? 'high' : 'medium',
    description: `Dispoziția este mai bună ${dayNames[maxDay.day]}, mai scăzută ${dayNames[minDay.day]}`,
    data: dayAverages
  }
}

function analyzeTriggerPatterns(entries: any[]) {
  const patterns = []
  const triggerCounts: { [key: string]: { count: number; avgMood: number; moods: number[] } } = {}

  entries.forEach(entry => {
    if (entry.triggers && Array.isArray(entry.triggers)) {
      entry.triggers.forEach((trigger: string) => {
        if (!triggerCounts[trigger]) {
          triggerCounts[trigger] = { count: 0, avgMood: 0, moods: [] }
        }
        triggerCounts[trigger].count++
        triggerCounts[trigger].moods.push(entry.mood_score)
      })
    }
  })

  Object.entries(triggerCounts).forEach(([trigger, data]) => {
    if (data.count >= 3) {
      data.avgMood = calculateAverage(data.moods)
      
      patterns.push({
        type: 'trigger_frequency',
        trigger: trigger,
        frequency: data.count,
        impact_on_mood: data.avgMood,
        severity: data.avgMood < 4 ? 'high' : data.avgMood < 6 ? 'medium' : 'low',
        description: `"${trigger}" apare frecvent (${data.count}x) și afectează dispoziția (avg: ${data.avgMood.toFixed(1)}/10)`
      })
    }
  })

  return patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 3)
}

function analyzeMoodVolatility(entries: any[]) {
  if (entries.length < 5) return { isHighVolatility: false }

  const moodScores = entries.map(e => e.mood_score)
  const changes = []

  for (let i = 1; i < moodScores.length; i++) {
    changes.push(Math.abs(moodScores[i] - moodScores[i - 1]))
  }

  const avgChange = calculateAverage(changes)
  const isHighVolatility = avgChange > 2

  return {
    isHighVolatility,
    avgChange,
    severity: avgChange > 3 ? 'high' : avgChange > 2 ? 'medium' : 'low'
  }
}

function analyzeRecoveryPatterns(entries: any[]) {
  // Look for patterns where mood recovers after low points
  const lowMoodThreshold = 4
  let recoveryCount = 0
  let totalLowPoints = 0

  for (let i = 1; i < entries.length - 1; i++) {
    if (entries[i].mood_score <= lowMoodThreshold) {
      totalLowPoints++
      
      // Check if mood improved in next 1-3 entries
      const nextEntries = entries.slice(Math.max(0, i - 3), i)
      const hasRecovery = nextEntries.some(e => e.mood_score > entries[i].mood_score + 1)
      
      if (hasRecovery) recoveryCount++
    }
  }

  const recoveryRate = totalLowPoints > 0 ? recoveryCount / totalLowPoints : 0

  return {
    hasPattern: recoveryRate > 0.6 && totalLowPoints >= 3,
    strength: recoveryRate,
    description: `Recuperare după perioade dificile în ${Math.round(recoveryRate * 100)}% din cazuri`
  }
}

function calculateCorrelation(arr1: number[], arr2: number[]): { strength: number; significant: boolean } {
  if (arr1.length !== arr2.length || arr1.length < 3) {
    return { strength: 0, significant: false }
  }

  const n = arr1.length
  const sum1 = arr1.reduce((a, b) => a + b, 0)
  const sum2 = arr2.reduce((a, b) => a + b, 0)
  const sum1Sq = arr1.reduce((sum, x) => sum + x * x, 0)
  const sum2Sq = arr2.reduce((sum, x) => sum + x * x, 0)
  const pSum = arr1.reduce((sum, x, i) => sum + x * arr2[i], 0)

  const num = pSum - (sum1 * sum2 / n)
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n))

  if (den === 0) return { strength: 0, significant: false }

  const correlation = num / den
  return {
    strength: Math.abs(correlation),
    significant: Math.abs(correlation) > 0.3
  }
}

function analyzeActivityMoodCorrelations(entries: any[]) {
  const correlations = []
  const activityMoods: { [key: string]: number[] } = {}

  entries.forEach(entry => {
    if (entry.activities && Array.isArray(entry.activities)) {
      entry.activities.forEach((activity: string) => {
        if (!activityMoods[activity]) activityMoods[activity] = []
        activityMoods[activity].push(entry.mood_score)
      })
    }
  })

  Object.entries(activityMoods).forEach(([activity, moods]) => {
    if (moods.length >= 3) {
      const avgMood = calculateAverage(moods)
      const overallAvg = calculateAverage(entries.map(e => e.mood_score))
      
      correlations.push({
        type: 'activity_mood',
        activity,
        average_mood: avgMood,
        impact: avgMood - overallAvg,
        sample_size: moods.length,
        description: avgMood > overallAvg + 0.5 
          ? `"${activity}" pare să îmbunătățească dispoziția`
          : avgMood < overallAvg - 0.5 
            ? `"${activity}" pare să afecteze negativ dispoziția`
            : `"${activity}" are impact neutru asupra dispoziției`
      })
    }
  })

  return correlations
    .filter(c => Math.abs(c.impact) > 0.5)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 5)
}

function generatePersonalizedRecommendations(statistics: any, patterns: any[], correlations: any[]) {
  const recommendations = []

  // Based on mood trend
  if (statistics.mood.trend === 'declining') {
    recommendations.push({
      priority: 'high',
      category: 'mood_improvement',
      title: 'Focus pe îmbunătățirea dispoziției',
      description: 'Dispoziția ta a scăzut recent. Încearcă activități care te fac să te simți bine.',
      actions: ['Contactează un prieten apropiat', 'Fă o activitate care îți place', 'Consideră vorbitul cu un specialist']
    })
  }

  // Based on anxiety levels
  if (statistics.anxiety && statistics.anxiety.average > 6) {
    recommendations.push({
      priority: 'high',
      category: 'anxiety_management',
      title: 'Gestionarea anxietății',
      description: 'Nivelul de anxietate este ridicat. Tehnicile de relaxare pot ajuta.',
      actions: ['Practică respirația profundă', 'Încearcă meditația ghidată', 'Limitează cafeaua și știrile']
    })
  }

  // Based on trigger patterns
  const frequentTriggers = patterns.filter(p => p.type === 'trigger_frequency' && p.severity === 'high')
  if (frequentTriggers.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'trigger_management',
      title: `Gestionarea trigger-ului: ${frequentTriggers[0].trigger}`,
      description: 'Ai identificat un trigger frecvent care îți afectează dispoziția.',
      actions: [
        'Creează un plan pentru situațiile dificile',
        'Practică tehnici de coping',
        'Consideră evitarea temporară dacă e posibil'
      ]
    })
  }

  // Based on positive correlations
  const positiveActivities = correlations.filter(c => c.type === 'activity_mood' && c.impact > 0.5)
  if (positiveActivities.length > 0) {
    recommendations.push({
      priority: 'low',
      category: 'positive_reinforcement',
      title: `Continuă cu: ${positiveActivities[0].activity}`,
      description: 'Această activitate pare să îți îmbunătățească dispoziția.',
      actions: ['Programează mai mult timp pentru această activitate', 'Explorează activități similare']
    })
  }

  // Sleep-related recommendations
  if (statistics.sleep && statistics.sleep.average < 6) {
    recommendations.push({
      priority: 'medium',
      category: 'sleep_improvement',
      title: 'Îmbunătățirea somnului',
      description: 'Calitatea somnului pare să fie sub normal.',
      actions: [
        'Stabilește o rutină de culcare',
        'Evită ecranele cu o oră înainte de culcare',
        'Creează un mediu confortabil pentru somn'
      ]
    })
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}