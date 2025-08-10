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

    const {
      mood_score,
      emotions,
      triggers,
      activities,
      thoughts,
      physical_symptoms,
      sleep_quality,
      anxiety_level,
      stress_level
    } = await request.json()

    if (!mood_score || mood_score < 1 || mood_score > 10) {
      return NextResponse.json({ error: 'Valid mood_score (1-10) required' }, { status: 400 })
    }

    const { data: moodEntry, error: dbError } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.id,
        mood_score,
        emotions: emotions || [],
        triggers: triggers || [],
        activities: activities || [],
        thoughts: thoughts || '',
        physical_symptoms: physical_symptoms || [],
        sleep_quality: sleep_quality || null,
        anxiety_level: anxiety_level || null,
        stress_level: stress_level || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save mood entry' }, { status: 500 })
    }

    const moodAnalysis = await generateMoodInsights(user.id, moodEntry, supabase)
    const crisisCheck = await checkForCrisisSignals(moodEntry, thoughts)

    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      ecosystem: 'por-well',
      action_type: 'mood_entry_created',
      action_data: {
        mood_score,
        anxiety_level,
        stress_level,
        has_crisis_indicators: crisisCheck.requiresAttention
      }
    })

    return NextResponse.json({
      success: true,
      entry: moodEntry,
      insights: moodAnalysis,
      crisis_check: crisisCheck,
      recommendations: await generateMoodRecommendations(moodEntry, moodAnalysis)
    })

  } catch (error) {
    console.error('Mood entry error:', error)
    return NextResponse.json({ error: 'Failed to process mood entry' }, { status: 500 })
  }
}

async function generateMoodInsights(userId: string, moodEntry: any, supabase: any) {
  try {
    const { data: recentMoods } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const prompt = `Analyze this mood entry and provide insights:

Current Entry:
- Mood: ${moodEntry.mood_score}/10
- Anxiety: ${moodEntry.anxiety_level || 'Not specified'}/10
- Stress: ${moodEntry.stress_level || 'Not specified'}/10
- Emotions: ${moodEntry.emotions?.join(', ') || 'None specified'}
- Triggers: ${moodEntry.triggers?.join(', ') || 'None specified'}
- Activities: ${moodEntry.activities?.join(', ') || 'None specified'}
- Thoughts: "${moodEntry.thoughts || 'None specified'}"
- Physical symptoms: ${moodEntry.physical_symptoms?.join(', ') || 'None'}

Recent mood history: ${JSON.stringify(recentMoods?.slice(1, 6) || [])}

Provide:
1. Pattern identification (trends, recurring triggers)
2. Correlation analysis (mood vs activities/triggers)
3. Personalized insights (what's working, what needs attention)
4. Positive reinforcement for healthy patterns

Respond in Romanian, be empathetic and constructive. Max 200 words.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate mental health analyst providing insights on mood patterns.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    return {
      analysis: completion.choices[0]?.message?.content || 'Analysis unavailable',
      patterns_detected: detectMoodPatterns(recentMoods || []),
      trend: calculateMoodTrend(recentMoods || [])
    }

  } catch (error) {
    console.error('AI mood analysis error:', error)
    return {
      analysis: 'Analiza AI temporar indisponibilă. Mulțumim pentru că îți urmărești starea de spirit.',
      patterns_detected: [],
      trend: 'stable'
    }
  }
}

function detectMoodPatterns(moodHistory: any[]) {
  if (moodHistory.length < 3) return []

  const patterns = []
  
  const recentScores = moodHistory.slice(0, 5).map(m => m.mood_score)
  const isDecline = recentScores.every((score, i) => 
    i === 0 || score <= recentScores[i - 1]
  )
  
  if (isDecline) {
    patterns.push({
      type: 'declining_mood',
      severity: 'medium',
      description: 'Dispoziția pare să scadă în ultimele zile'
    })
  }

  const allTriggers = moodHistory.flatMap(m => m.triggers || [])
  const triggerCounts: Record<string, number> = allTriggers.reduce((acc, trigger) => {
    acc[trigger] = (acc[trigger] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const commonTrigger = Object.entries(triggerCounts)
    .sort(([,a], [,b]) => b - a)[0]

  if (commonTrigger && commonTrigger[1] >= 3) {
    patterns.push({
      type: 'recurring_trigger',
      severity: 'low',
      description: `Trigger frecvent identificat: ${commonTrigger[0]}`
    })
  }

  return patterns
}

function calculateMoodTrend(moodHistory: any[]) {
  if (moodHistory.length < 3) return 'insufficient_data'

  const recent = moodHistory.slice(0, 3).map(m => m.mood_score)
  const older = moodHistory.slice(3, 6).map(m => m.mood_score)

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.length > 0 
    ? older.reduce((a, b) => a + b, 0) / older.length 
    : recentAvg

  if (recentAvg > olderAvg + 0.5) return 'improving'
  if (recentAvg < olderAvg - 0.5) return 'declining'
  return 'stable'
}

async function checkForCrisisSignals(moodEntry: any, thoughts: string) {
  const crisisKeywords = [
    'vreau să mor', 'să mă sinucid', 'să mă omor', 'să dispăr',
    'nu mai vreau să trăiesc', 'să mă ucid', 'să îmi fac rău',
    'nu mai pot', 'totul e fără sens', 'nimeni nu mă iubește'
  ]

  const lowMoodThreshold = 3
  const highAnxietyThreshold = 8

  let requiresAttention = false
  let severity = 'low'
  const indicators = []

  if (moodEntry.mood_score <= lowMoodThreshold) {
    requiresAttention = true
    indicators.push('Very low mood score')
    if (moodEntry.mood_score <= 2) severity = 'high'
  }

  if (moodEntry.anxiety_level >= highAnxietyThreshold) {
    requiresAttention = true
    indicators.push('High anxiety level')
  }

  if (thoughts) {
    const hasKeywords = crisisKeywords.some(keyword => 
      thoughts.toLowerCase().includes(keyword.toLowerCase())
    )
    if (hasKeywords) {
      requiresAttention = true
      severity = 'critical'
      indicators.push('Crisis language detected')
    }
  }

  return {
    requiresAttention,
    severity,
    indicators,
    resources: requiresAttention ? {
      emergency: '112',
      suicide_prevention: '0800.801.200',
      message: 'Te rugăm să iei legătura cu un specialist sau serviciile de urgență dacă ai gânduri de rănire.'
    } : null
  }
}

async function generateMoodRecommendations(moodEntry: any, analysis: any) {
  const recommendations = []

  if (moodEntry.mood_score <= 4) {
    recommendations.push({
      type: 'activity',
      title: 'Activitate fizică ușoară',
      description: 'O plimbare de 10 minute poate îmbunătăți dispoziția'
    })
  }

  if (moodEntry.anxiety_level >= 7) {
    recommendations.push({
      type: 'breathing',
      title: 'Exercițiu de respirație 4-7-8',
      description: 'Inspiră 4 secunde, ține 7, expiră 8 secunde'
    })
  }

  if (moodEntry.stress_level >= 7) {
    recommendations.push({
      type: 'meditation',
      title: 'Meditație ghidată',
      description: 'O sesiune scurtă de mindfulness poate reduce stresul'
    })
  }

  recommendations.push({
    type: 'gratitude',
    title: 'Jurnalul recunoștinței',
    description: 'Scrie 3 lucruri pentru care ești recunoscător/oare azi'
  })

  return recommendations.slice(0, 3)
}