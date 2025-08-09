// app/api/ai/chat/route.ts - AI Chat API Production
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import OpenAI from 'openai'

// Initialize OpenAI with fallback to OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined,
  defaultHeaders: process.env.OPENROUTER_API_KEY ? {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'PorVerse AI Platform'
  } : undefined
})

// Ecosystem-specific system prompts
const ECOSYSTEM_PROMPTS = {
  'por-health': `You are PorHealth AI, an expert nutritionist, fitness trainer, and wellness coach. Help users optimize their physical health through personalized nutrition plans, workout routines, and lifestyle recommendations. Always include medical disclaimers when appropriate and suggest consulting healthcare providers for serious concerns.`,
  
  'por-kids': `You are PorKids AI, an educational assistant for children and parents. Help with homework, create engaging learning experiences, and support child development. Always maintain age-appropriate content and prioritize child safety. Encourage parental involvement when needed.`,
  
  'por-mind': `You are PorMind AI, a financial education expert and wealth building coach. Help users understand personal finance, create budgets, plan investments, and build long-term wealth. Provide educational content, not specific investment advice. Always include appropriate disclaimers.`,
  
  'por-well': `You are PorWell AI, a mental wellness companion and therapeutic support system. Provide emotional support, mood tracking insights, stress management techniques, and mental health resources. Always prioritize user safety and suggest professional help when appropriate. Be empathetic and non-judgmental.`,
  
  'por-flow': `You are PorFlow AI, a productivity optimization expert. Help users manage their time, organize tasks, improve focus, and create efficient workflows. Provide practical, actionable advice for better productivity and work-life balance.`,
  
  'por-blu': `You are PorBlu AI, an executive coach and strategic planning advisor. Help users with leadership development, strategic thinking, vision creation, and long-term planning. Provide frameworks for decision-making and personal growth.`,
  
  'quantum-vault': `You are Quantum Vault AI, an advanced consciousness explorer with access to deep psychological analysis and future projection capabilities. Help users explore their identity, simulate future scenarios, and identify patterns in their behavior across all life areas.`
}

// Safety keywords that require crisis intervention
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'hurt myself',
  'self-harm', 'overdose', 'no point living', 'better off dead'
]

interface ChatRequest {
  message: string
  ecosystem: string
  conversationId?: string
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, ecosystem, conversationId, userId } = body

    // Validate required fields
    if (!message || !ecosystem || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase
    const supabase = createServerSupabase()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ecosystem access
    const { data: ecosystemAccess } = await supabase
      .from('user_ecosystems')
      .select('access_level')
      .eq('user_id', userId)
      .eq('ecosystem', ecosystem)
      .single()

    if (!ecosystemAccess || ecosystemAccess.access_level === 'locked') {
      return NextResponse.json(
        { error: 'No access to this ecosystem' },
        { status: 403 }
      )
    }

    // Crisis detection for PorWell
    if (ecosystem === 'por-well') {
      const messageContent = message.toLowerCase()
      const isCrisis = CRISIS_KEYWORDS.some(keyword => 
        messageContent.includes(keyword)
      )

      if (isCrisis) {
        // Log crisis event
        await supabase
          .from('crisis_events')
          .insert({
            user_id: userId,
            message: message,
            severity: 'high',
            auto_detected: true
          })

        // Return crisis response
        return NextResponse.json({
          message: `I'm very concerned about what you've shared. Your life has value and there are people who want to help. Please reach out to:

🆘 **Immediate Help:**
• Romania: 0800 801 200 (National Mental Health)
• Emergency: 112
• International: 988 (Suicide Prevention)

You're not alone in this. Would you like me to help you find local support resources or coping strategies?`,
          isCrisis: true,
          resources: [
            { name: 'National Mental Health Hotline (RO)', number: '0800 801 200' },
            { name: 'Emergency Services', number: '112' },
            { name: 'International Crisis Line', number: '988' }
          ]
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
      // Include last 5 messages for context
      ...conversationHistory.slice(-10),
      {
        role: 'user',
        content: message
      }
    ]

    // Call OpenAI/OpenRouter API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'openai/gpt-4-turbo' : 'gpt-4-turbo-preview',
      messages: contextMessages as any,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI service')
    }

    // Log AI usage for billing
    await supabase
      .from('ai_usage_logs')
      .insert({
        user_id: userId,
        ecosystem,
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0,
        model: completion.model,
        cost_estimate: calculateCost(completion.usage?.total_tokens || 0, completion.model)
      })

    return NextResponse.json({
      message: aiResponse,
      tokens: completion.usage?.total_tokens || 0,
      model: completion.model
    })

  } catch (error: any) {
    console.error('AI Chat Error:', error)

    // Handle specific errors
    if (error.message?.includes('rate_limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    if (error.message?.includes('insufficient_quota')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

// Cost calculation helper
function calculateCost(tokens: number, model: string): number {
  const costPer1kTokens = {
    'gpt-4-turbo-preview': 0.01,
    'gpt-4': 0.03,
    'gpt-3.5-turbo': 0.001,
    'openai/gpt-4-turbo': 0.01,
    'anthropic/claude-3-opus': 0.015,
    'anthropic/claude-3-sonnet': 0.003
  }

  const rate = costPer1kTokens[model as keyof typeof costPer1kTokens] || 0.01
  return (tokens / 1000) * rate
}

// Rate limiting (simple in-memory store for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const limit = 30 // 30 requests per minute

  const key = `ai_chat:${userId}`
  const current = rateLimitStore.get(key)

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= limit) {
    return false
  }

  current.count++
  return true
}