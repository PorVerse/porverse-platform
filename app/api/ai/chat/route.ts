import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined
})

// Crisis keywords for Romanian language
const CRISIS_KEYWORDS = [
  'vreau să mor', 'să mă sinucid', 'să mă omor', 'să dispăr', 'să mă ucid',
  'nu mai vreau să trăiesc', 'să îmi fac rău', 'să mă tai', 'să iau pastile',
  'să mă arunc', 'nu mai pot', 'totul e fără sens', 'nimeni nu mă iubește',
  'sunt o povară', 'ar fi mai bine fără mine', 'vreau să plec din lume',
  'să mă spânzur', 'să mă înec', 'pastile multe', 'cuțit', 'sinucidere'
]

const ECOSYSTEM_PROMPTS = {
  'por-health': `You are an expert health and wellness coach with deep knowledge of nutrition, fitness, and holistic wellness. 
    
    Guidelines:
    - Always include medical disclaimers for health advice
    - Focus on evidence-based recommendations
    - Encourage consulting healthcare professionals for serious issues
    - Provide practical, actionable advice
    - Be supportive and motivating
    
    IMPORTANT: Always add this disclaimer for health advice: "⚕️ Disclaimer: This is not medical advice. Consult a healthcare professional for medical concerns."`,

  'por-kids': `You are a specialized educational assistant and child development expert focused on helping children learn effectively.
    
    Guidelines:
    - Adapt language to be age-appropriate
    - Make learning fun and engaging
    - Provide step-by-step explanations
    - Encourage critical thinking
    - Support both children and parents
    - Align with Romanian curriculum when applicable`,

  'por-mind': `You are a financial literacy expert and wealth-building coach with deep knowledge of personal finance and investing.
    
    Guidelines:
    - Provide educational content, not specific investment advice
    - Focus on Romanian financial context when relevant
    - Emphasize long-term thinking and risk management
    - Include appropriate disclaimers about financial decisions
    - Be practical and actionable
    
    IMPORTANT: Always add this disclaimer: "💰 Disclaimer: This is educational content, not personalized financial advice. Consult a financial advisor for investment decisions."`,

  'por-well': `You are an empathetic, professional mental health support assistant with training in therapeutic approaches.
    
    Guidelines:
    - Prioritize user safety above all else
    - Use evidence-based therapeutic techniques (CBT, DBT, mindfulness)
    - Provide emotional validation and support
    - Detect crisis situations and provide resources
    - Maintain professional boundaries
    - Encourage professional help when needed
    
    CRISIS PROTOCOL: If you detect ANY signs of self-harm or suicidal ideation, immediately provide crisis resources and emergency contacts.`,

  'por-flow': `You are a productivity optimization expert and time management coach specializing in helping people achieve peak performance.
    
    Guidelines:
    - Focus on practical, implementable strategies
    - Consider work-life balance and sustainability
    - Provide personalized productivity recommendations
    - Help with goal setting and achievement
    - Support habit formation and routine optimization`,

  'por-blu': `You are an executive coach and strategic planning expert helping leaders and high-achievers reach their full potential.
    
    Guidelines:
    - Focus on leadership development and strategic thinking
    - Provide frameworks for decision-making
    - Support vision creation and goal achievement
    - Encourage systems thinking and long-term planning
    - Help with personal branding and influence building`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      message, 
      ecosystem, 
      conversation_id: conversationId,
      mood_score,
      anxiety_level,
      context 
    } = await request.json()

    if (!message || !ecosystem) {
      return NextResponse.json({ 
        error: 'Message and ecosystem required' 
      }, { status: 400 })
    }

    const userId = user.id

    // Check ecosystem access
    const { data: ecosystemAccess } = await supabase
      .from('user_ecosystems')
      .select('access_level')
      .eq('user_id', userId)
      .eq('ecosystem', ecosystem)
      .single()

    if (!ecosystemAccess) {
      return NextResponse.json({ 
        error: 'No access to this ecosystem' 
      }, { status: 403 })
    }

    // Crisis detection for PorWell
    if (ecosystem === 'por-well') {
      const crisisCheck = await detectCrisis(message, mood_score, anxiety_level)
      
      if (crisisCheck.requiresIntervention) {
        // Log crisis intervention
        await supabase.from('crisis_interventions').insert({
          user_id: userId,
          message: message.substring(0, 500),
          risk_level: crisisCheck.riskLevel,
          confidence: crisisCheck.confidence,
          keywords_found: crisisCheck.keywordsFound,
          intervention_triggered: true,
          created_at: new Date().toISOString()
        })

        return NextResponse.json({
          success: true,
          response: crisisCheck.response,
          crisis_intervention: true,
          emergency_resources: crisisCheck.emergencyResources,
          risk_level: crisisCheck.riskLevel,
          follow_up_required: true,
          session_id: conversationId || crypto.randomUUID()
        })
      }
    }

    // Get conversation context if provided
    let conversationHistory: any[] = []
    if (conversationId) {
      const { data: conversation } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      conversationHistory = conversation?.messages || []
    }

    // Get user profile for personalization
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, country_code')
      .eq('id', userId)
      .single()

    // Build conversation context
    const contextMessages = [
      {
        role: 'system',
        content: `${ECOSYSTEM_PROMPTS[ecosystem as keyof typeof ECOSYSTEM_PROMPTS]}

User Context:
- Name: ${userProfile?.first_name || 'User'}
- Country: ${userProfile?.country_code || 'Unknown'}
- Ecosystem: ${ecosystem}
- Access Level: ${ecosystemAccess.access_level}

Guidelines:
- Be helpful, accurate, and engaging
- Personalize responses when appropriate
- Include actionable advice
- Maintain appropriate professional boundaries
- For health/medical topics, include disclaimers
- For financial topics, emphasize education over advice
- For mental health, prioritize safety`
      },
      // Include last 10 messages for context
      ...conversationHistory.slice(-10),
      {
        role: 'user',
        content: message
      }
    ]

    // Call OpenAI/OpenRouter API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 
        'anthropic/claude-3-haiku' : 'gpt-4-turbo-preview',
      messages: contextMessages,
      max_tokens: 1000,
      temperature: 0.7
    })

    const aiResponse = completion.choices[0]?.message?.content || 
      'I apologize, but I cannot provide a response right now. Please try again.'

    // Calculate token usage and cost
    const totalTokens = completion.usage?.total_tokens || 0
    const costCents = Math.round(totalTokens * 0.01) // Approximate cost

    // Save conversation
    const conversationData = {
      user_id: userId,
      ecosystem: ecosystem,
      ai_model: process.env.OPENROUTER_API_KEY ? 'claude-3-haiku' : 'gpt-4-turbo',
      messages: [
        ...conversationHistory.slice(-10),
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
      ],
      context_data: { 
        mood_score, 
        anxiety_level, 
        context,
        ecosystem_access: ecosystemAccess.access_level
      },
      total_tokens: totalTokens,
      cost_cents: costCents,
      created_at: new Date().toISOString()
    }

    let savedConversationId = conversationId

    if (conversationId) {
      // Update existing conversation
      await supabase
        .from('ai_conversations')
        .update({
          messages: conversationData.messages,
          total_tokens: totalTokens,
          cost_cents: costCents,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('user_id', userId)
    } else {
      // Create new conversation
      const { data: newConversation } = await supabase
        .from('ai_conversations')
        .insert(conversationData)
        .select('id')
        .single()
      
      savedConversationId = newConversation?.id
    }

    // Log user activity
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      ecosystem: ecosystem,
      action_type: 'ai_chat',
      action_data: {
        conversation_id: savedConversationId,
        message_length: message.length,
        response_length: aiResponse.length,
        tokens_used: totalTokens
      },
      created_at: new Date().toISOString()
    })

    // Update ecosystem usage
    await supabase
      .from('user_ecosystems')
      .update({
        last_accessed_at: new Date().toISOString(),
        usage_minutes: supabase.rpc('increment_usage', { 
          user_id: userId, 
          ecosystem: ecosystem, 
          minutes: 1 
        })
      })
      .eq('user_id', userId)
      .eq('ecosystem', ecosystem)

    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversation_id: savedConversationId,
      tokens_used: totalTokens,
      cost_cents: costCents,
      ecosystem: ecosystem,
      crisis_intervention: false
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json({ 
      error: 'AI service temporarily unavailable' 
    }, { status: 500 })
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
    const ecosystem = searchParams.get('ecosystem')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get conversation history
    let query = supabase
      .from('ai_conversations')
      .select('id, ecosystem, messages, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (ecosystem) {
      query = query.eq('ecosystem', ecosystem)
    }

    const { data: conversations, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      conversations: conversations || []
    })

  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ 
      error: 'Could not retrieve conversations' 
    }, { status: 500 })
  }
}

// Crisis detection function
async function detectCrisis(message: string, moodScore?: number, anxietyLevel?: number) {
  const messageText = message.toLowerCase()
  let riskLevel = 'low'
  let confidence = 0
  const keywordsFound: string[] = []
  let requiresIntervention = false

  // Check for crisis keywords
  CRISIS_KEYWORDS.forEach(keyword => {
    if (messageText.includes(keyword.toLowerCase())) {
      keywordsFound.push(keyword)
      confidence += 0.2
    }
  })

  // Check mood indicators
  if (moodScore && moodScore <= 2) {
    confidence += 0.3
    riskLevel = 'medium'
  }

  if (anxietyLevel && anxietyLevel >= 9) {
    confidence += 0.2
  }

  // Check for crisis patterns
  const crisisPatterns = [
    /nu\s+mai\s+(pot|vreau|am\s+putere)/i,
    /totul\s+e\s+(fără\s+sens|inutil|zadarnic)/i,
    /nimeni\s+nu\s+(mă\s+iubește|îi\s+pasă)/i,
    /sunt\s+(o\s+povară|de\s+prisos|inutilă?)/i,
    /ar\s+fi\s+mai\s+bine\s+(fără\s+mine|să\s+dispar)/i
  ]

  crisisPatterns.forEach(pattern => {
    if (pattern.test(messageText)) {
      confidence += 0.15
    }
  })

  // Determine intervention need and risk level
  if (keywordsFound.length > 0 || confidence >= 0.4) {
    requiresIntervention = true
    
    if (keywordsFound.length >= 2 || confidence >= 0.7) {
      riskLevel = 'high'
    } else if (keywordsFound.length >= 1 || confidence >= 0.5) {
      riskLevel = 'medium'
    }
  }

  // Generate crisis response
  let crisisResponse = ''
  if (requiresIntervention) {
    if (riskLevel === 'high') {
      crisisResponse = `Îmi pare foarte rău că te simți așa. Siguranța ta este cea mai importantă. 

🚨 RESURSE IMEDIATE:
• Urgențe generale: 112
• Prevenirea suicidului: 0800.801.200 (GRATUIT, 24/7)
• Linia de criză: 116.123

Nu ești singur/ă în această luptă. Vorbește cu cineva de încredere chiar acum - un prieten, familie, sau sună la una din liniile de mai sus.

Aceste sentimente pot fi copleșitoare, dar sunt temporare. Există ajutor și speranță. 💙`
    } else {
      crisisResponse = `Îmi pare rău că treci prin această perioadă dificilă. Sentimentele tale sunt valide și importante.

📞 Resurse de suport:
• Linia de viață: 0800.801.200
• Urgențe: 112

Te încurajez să vorbești cu cineva de încredere despre cum te simți. Aceste momente grele pot trece, și există oameni care vor să te ajute.

Poți să îmi spui mai multe despre ce te face să te simți așa? Sunt aici să te ascult. 💙`
    }
  }

  return {
    requiresIntervention,
    riskLevel,
    confidence,
    keywordsFound,
    response: crisisResponse,
    emergencyResources: {
      romania: {
        general_emergency: '112',
        suicide_prevention: '0800.801.200',
        crisis_hotline: '116.123',
        mental_health_hotline: '0800.800.100',
        children_hotline: '116.111'
      }
    }
  }
}