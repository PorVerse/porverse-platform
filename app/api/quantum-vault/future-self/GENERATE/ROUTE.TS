// ================================
// APP/API/QUANTUM-VAULT/FUTURE-SELF/GENERATE/ROUTE.TS
// ================================

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { FutureSelfService } from '@/lib/quantum/future-self-service'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Quantum Vault access
    const { data: quantumAccess } = await supabase
      .from('quantum_vault_access')
      .select('access_level')
      .eq('user_id', user.id)
      .eq('access_level', 'full')
      .single()

    if (!quantumAccess) {
      return NextResponse.json({ 
        error: 'Quantum Vault access required',
        requiresUpgrade: true,
        upgradeUrl: '/pricing?feature=quantum-vault'
      }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { timelineYears = 10, regenerate = false } = body

    // Initialize Future Self Service
    const futureSelfService = new FutureSelfService()

    // Check if user already has active Future Self
    if (!regenerate) {
      const existingFutureSelf = await futureSelfService.getActiveFutureSelf(user.id)
      if (existingFutureSelf) {
        return NextResponse.json({
          success: true,
          futureSelf: existingFutureSelf,
          isExisting: true,
          message: 'Active Future Self already exists'
        })
      }
    }

    // Start generation process
    console.log(`🔮 Starting Future Self generation for user ${user.id}`)
    
    // Log quantum vault session start
    await supabase
      .from('quantum_vault_sessions')
      .insert({
        user_id: user.id,
        session_type: 'future_self_generation',
        started_at: new Date().toISOString(),
        features_used: ['data_aggregation', 'ai_projection', 'avatar_generation']
      })

    try {
      // Create comprehensive Future Self profile
      const futureSelf = await futureSelfService.createFutureSelfProfile(user.id, timelineYears)

      // Log successful generation
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          ecosystem: 'quantum-vault',
          action_type: 'future_self_generated',
          action_data: {
            future_self_id: futureSelf.id,
            timeline_years: timelineYears,
            generation_time: new Date().toISOString(),
            regenerated: regenerate
          }
        })

      return NextResponse.json({
        success: true,
        futureSelf: {
          id: futureSelf.id,
          timelineYears: futureSelf.timeline_years,
          currentAge: futureSelf.current_age,
          futureAge: futureSelf.future_age,
          avatarUrl: futureSelf.avatar_url,
          projection: futureSelf.projection_data,
          confidenceScore: futureSelf.confidence_score,
          createdAt: futureSelf.created_at
        },
        isExisting: false,
        message: 'Future Self successfully generated!'
      })

    } catch (error) {
      console.error('Future Self generation failed:', error)
      
      // Log error
      await supabase
        .from('error_logs')
        .insert({
          user_id: user.id,
          error_type: 'future_self_generation_failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          context: { timelineYears, regenerate },
          severity: 'high'
        })

      return NextResponse.json({
        error: 'Failed to generate Future Self',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Future Self generation API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve existing Future Self
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const futureSelfService = new FutureSelfService()
    const summary = await futureSelfService.getUserFutureSelfSummary(user.id)

    if (!summary) {
      return NextResponse.json({
        exists: false,
        message: 'No Future Self found'
      })
    }

    return NextResponse.json({
      exists: true,
      ...summary
    })

  } catch (error) {
    console.error('Get Future Self API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// ================================
// APP/API/QUANTUM-VAULT/FUTURE-SELF/CONVERSATION/ROUTE.TS
// ================================

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { FutureSelfService } from '@/lib/quantum/future-self-service'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request
    const body = await request.json()
    const { 
      message, 
      currentMood = 7,
      lifePhase = 'growth',
      recentEvents = [],
      currentChallenges = [],
      immediateGoals = [],
      sessionId 
    } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 })
    }

    // Rate limiting check
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const { data: recentConversations } = await supabase
      .from('future_self_conversations')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo.toISOString())

    if (recentConversations && recentConversations.length >= 10) {
      return NextResponse.json({
        error: 'Rate limit exceeded. Please wait before sending another message.',
        retryAfter: 60
      }, { status: 429 })
    }

    const futureSelfService = new FutureSelfService()

    // Build conversation context
    const context = {
      currentMood,
      lifePhase,
      recentEvents,
      currentChallenges,
      immediateGoals,
      sessionId: sessionId || `session_${Date.now()}`
    }

    console.log(`💬 Processing Future Self conversation for user ${user.id}`)

    try {
      // Generate Future Self response
      const response = await futureSelfService.conversationWithFutureSelf(
        user.id,
        message.trim(),
        context
      )

      // Log conversation session
      await supabase
        .from('quantum_vault_sessions')
        .insert({
          user_id: user.id,
          session_type: 'future_self_conversation',
          duration_minutes: 1, // Will be updated when session ends
          features_used: ['future_self_chat'],
          insights_generated: response.insights,
          started_at: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        response: {
          message: response.message,
          emotion: response.emotion,
          actionAdvice: response.actionAdvice,
          wisdomLevel: response.wisdomLevel,
          insights: response.insights,
          followUpSuggestions: response.followUpSuggestions
        },
        conversationContext: context
      })

    } catch (error) {
      console.error('Future Self conversation failed:', error)
      
      return NextResponse.json({
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Future Self conversation API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET conversation history
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const sessionId = url.searchParams.get('sessionId')

    let query = supabase
      .from('future_self_conversations')
      .select(`
        id,
        user_message,
        future_self_response,
        emotion_detected,
        wisdom_level,
        action_items,
        insights_generated,
        session_id,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data: conversations, error: queryError } = await query

    if (queryError) {
      throw queryError
    }

    return NextResponse.json({
      success: true,
      conversations: conversations || [],
      total: conversations?.length || 0
    })

  } catch (error) {
    console.error('Get conversation history API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// ================================
// APP/API/QUANTUM-VAULT/FUTURE-SELF/WISDOM/ROUTE.TS
// ================================

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { FutureSelfService } from '@/lib/quantum/future-self-service'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category = 'life', urgency = 'medium' } = body

    const futureSelfService = new FutureSelfService()

    try {
      const wisdom = await futureSelfService.generateFutureWisdom(user.id, category, urgency)

      return NextResponse.json({
        success: true,
        wisdom
      })

    } catch (error) {
      console.error('Wisdom generation failed:', error)
      return NextResponse.json({
        error: 'Failed to generate wisdom',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Wisdom API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET pending wisdom messages
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'pending'
    const category = url.searchParams.get('category')

    let query = supabase
      .from('future_self_wisdom')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: wisdomMessages, error: queryError } = await query

    if (queryError) {
      throw queryError
    }

    return NextResponse.json({
      success: true,
      wisdomMessages: wisdomMessages || [],
      total: wisdomMessages?.length || 0
    })

  } catch (error) {
    console.error('Get wisdom messages API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// ================================
// APP/API/QUANTUM-VAULT/FUTURE-SELF/AVATAR/ROUTE.TS
// ================================

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { FutureSelfService } from '@/lib/quantum/future-self-service'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting - max 3 avatar generations per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const { data: recentGenerations } = await supabase
      .from('future_self_generation_log')
      .select('id')
      .eq('user_id', user.id)
      .eq('generation_type', 'avatar_regeneration')
      .gte('created_at', oneHourAgo.toISOString())

    if (recentGenerations && recentGenerations.length >= 3) {
      return NextResponse.json({
        error: 'Avatar generation rate limit exceeded. Please try again later.',
        retryAfter: 3600
      }, { status: 429 })
    }

    const futureSelfService = new FutureSelfService()

    // Get existing Future Self
    const futureSelf = await futureSelfService.getActiveFutureSelf(user.id)
    if (!futureSelf) {
      return NextResponse.json({
        error: 'No active Future Self found. Please generate Future Self first.'
      }, { status: 404 })
    }

    try {
      // Get user profile for current appearance context
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Regenerate avatar
      const newAvatarUrl = await futureSelfService.generateFutureAvatar(
        { ...profile, userId: user.id },
        futureSelf.projection_data
      )

      // Update Future Self profile with new avatar
      const { error: updateError } = await supabase
        .from('future_self_profiles')
        .update({
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', futureSelf.id)

      if (updateError) {
        throw updateError
      }

      // Log regeneration
      await supabase
        .from('future_self_generation_log')
        .insert({
          user_id: user.id,
          future_self_id: futureSelf.id,
          generation_type: 'avatar_regeneration',
          model_used: 'dall-e-3',
          trigger_reason: 'User requested avatar regeneration',
          generation_status: 'completed'
        })

      return NextResponse.json({
        success: true,
        avatarUrl: newAvatarUrl,
        message: 'Avatar successfully regenerated'
      })

    } catch (error) {
      console.error('Avatar regeneration failed:', error)
      
      return NextResponse.json({
        error: 'Failed to regenerate avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Avatar regeneration API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// ================================
// APP/API/QUANTUM-VAULT/FUTURE-SELF/FEEDBACK/ROUTE.TS
// ================================

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      conversationId, 
      rating, 
      feedback, 
      wasHelpful,
      experienceRating,
      testimonial 
    } = body

    // Update conversation feedback if provided
    if (conversationId && (rating || feedback !== undefined || wasHelpful !== undefined)) {
      const { error: convError } = await supabase
        .from('future_self_conversations')
        .update({
          user_rating: rating,
          user_feedback: feedback,
          was_helpful: wasHelpful
        })
        .eq('id', conversationId)
        .eq('user_id', user.id)

      if (convError) {
        console.error('Failed to update conversation feedback:', convError)
      }
    }

    // Update Future Self profile rating if provided
    if (experienceRating) {
      const { data: futureSelf } = await supabase
        .from('future_self_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (futureSelf) {
        const { error: profileError } = await supabase
          .from('future_self_profiles')
          .update({
            user_satisfaction_rating: experienceRating,
            updated_at: new Date().toISOString()
          })
          .eq('id', futureSelf.id)

        if (profileError) {
          console.error('Failed to update profile rating:', profileError)
        }
      }
    }

    // Log quantum vault session feedback
    if (experienceRating || testimonial) {
      await supabase
        .from('quantum_vault_sessions')
        .insert({
          user_id: user.id,
          session_type: 'future_self_feedback',
          satisfaction_rating: experienceRating,
          testimonial: testimonial,
          ended_at: new Date().toISOString()
        })
    }

    // Log activity
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        ecosystem: 'quantum-vault',
        action_type: 'future_self_feedback',
        action_data: {
          conversation_id: conversationId,
          rating,
          experience_rating: experienceRating,
          has_testimonial: !!testimonial,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully'
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}