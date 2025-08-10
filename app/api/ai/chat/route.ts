// Complete API Routes Implementation
// This file contains all missing API route implementations

// ================================
// app/api/ai/chat/route.ts
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { aiService } from '@/lib/ai/ai-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ecosystem, message } = await request.json()
    
    if (!ecosystem || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate AI response based on ecosystem
    let response
    switch (ecosystem) {
      case 'por-health':
        response = await aiService.generateNutritionPlan({ message })
        break
      case 'por-kids':
        response = await aiService.analyzeHomework(message, 'general', 5)
        break
      case 'por-mind':
        response = await aiService.generateFinancialAdvice({ message })
        break
      case 'por-well':
        response = await aiService.generateTherapeuticResponse({ 
          user_message: message,
          context: 'chat_session'
        })
        break
      case 'por-flow':
        response = await aiService.optimizeSchedule({ message })
        break
      case 'por-blu':
        response = await aiService.generateStrategicInsights({ message })
        break
      default:
        response = { response: "I understand your message. How can I help you today?" }
    }

    // Save conversation to database
    await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        ecosystem,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: response.response || JSON.stringify(response) }
        ],
        context_data: response,
        total_tokens: 150,
        cost_cents: 1
      })

    return NextResponse.json({ 
      response: response.response || "I've analyzed your request and generated insights for you.",
      ecosystem,
      data: response 
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}

// ================================
// app/api/health/route.ts
// ================================
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    const checks = {
      database: !error,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json({
      status: 'healthy',
      checks
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ================================
// app/api/user/profile/route.ts
// ================================
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      data: profile || {
        id: user.id,
        email: user.email,
        first_name: null,
        last_name: null,
        display_name: null,
        avatar_url: null,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profileData = await request.json()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

// ================================
// app/api/user/subscription/route.ts
// ================================
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      data: subscription 
    })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

// ================================
// app/api/ecosystems/access/route.ts
// ================================
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: ecosystems, error } = await supabase
      .from('user_ecosystems')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw error

    // If no ecosystems, create default free access
    if (!ecosystems || ecosystems.length === 0) {
      const defaultEcosystems = [
        { user_id: user.id, ecosystem: 'por-health', access_level: 'free' },
        { user_id: user.id, ecosystem: 'por-kids', access_level: 'free' }
      ]

      await supabase
        .from('user_ecosystems')
        .insert(defaultEcosystems)

      return NextResponse.json({ 
        success: true, 
        data: defaultEcosystems 
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: ecosystems 
    })
  } catch (error) {
    console.error('Ecosystem access error:', error)
    return NextResponse.json({ error: 'Failed to fetch ecosystem access' }, { status: 500 })
  }
}

// ================================
// app/api/payments/plans/route.ts
// ================================
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('tier', { ascending: true })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: plans || [] 
    })
  } catch (error) {
    console.error('Plans fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

// ================================
// app/api/progress/[ecosystem]/route.ts
// ================================
export async function GET(
  request: NextRequest,
  { params }: { params: { ecosystem: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ecosystem } = params

    const { data: progress, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('ecosystem', ecosystem)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      data: progress || { ecosystem, progress_data: {}, updated_at: new Date().toISOString() }
    })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { ecosystem: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ecosystem } = params
    const progressData = await request.json()

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        ecosystem,
        progress_data: progressData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Progress save error:', error)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}

// ================================
// app/api/mood/route.ts
// ================================
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: moods, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: moods || [] 
    })
  } catch (error) {
    console.error('Mood fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch mood data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moodData = await request.json()
    
    const { data, error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.id,
        ...moodData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Mood save error:', error)
    return NextResponse.json({ error: 'Failed to save mood' }, { status: 500 })
  }
}

// ================================
// app/auth/callback/route.ts
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_error`)
      }

      // Create user profile if it doesn't exist
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.user_metadata?.first_name || null,
            last_name: data.user.user_metadata?.last_name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            created_at: data.user.created_at,
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // Grant default ecosystem access
        const defaultEcosystems = [
          { user_id: data.user.id, ecosystem: 'por-health', access_level: 'free' },
          { user_id: data.user.id, ecosystem: 'por-kids', access_level: 'free' }
        ]

        await supabase
          .from('user_ecosystems')
          .upsert(defaultEcosystems)
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=server_error`)
  }
}

// ================================
// app/api/dashboard/stats/route.ts
// ================================
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's ecosystem access
    const { data: ecosystems } = await supabase
      .from('user_ecosystems')
      .select('ecosystem, access_level, usage_minutes')
      .eq('user_id', user.id)

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('ai_conversations')
      .select('ecosystem, created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    // Calculate stats
    const stats = {
      ecosystems_unlocked: ecosystems?.length || 0,
      total_usage_minutes: ecosystems?.reduce((sum, e) => sum + (e.usage_minutes || 0), 0) || 0,
      recent_activity: recentActivity?.length || 0,
      active_ecosystems: [...new Set(recentActivity?.map(a => a.ecosystem))].length
    }

    return NextResponse.json({ 
      success: true, 
      data: stats,
      ecosystems: ecosystems || [],
      recent_activity: recentActivity || []
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}