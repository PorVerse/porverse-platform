// app/api/quantum-access/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: userError?.message },
        { status: 401 }
      )
    }

    try {
      // Check Trinity access (PorMind + PorFlow + PorBlu)
      const { data: hasTrinity, error: trinityError } = await supabase.rpc(
        'has_trinity_combo',
        { user_uuid: user.id }
      )

      if (trinityError) {
        console.error('Trinity check error:', trinityError)
      }

      // Get user's active ecosystems
      const { data: ecosystems, error: ecosystemsError } = await supabase.rpc(
        'get_user_active_ecosystems',
        { user_uuid: user.id }
      )

      if (ecosystemsError) {
        console.error('Ecosystems check error:', ecosystemsError)
      }

      // Get user profile for additional context
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          profile: profile || null,
        },
        access: {
          hasTrinity: hasTrinity || false,
          ecosystems: ecosystems || [],
        },
        quantumVault: {
          accessible: hasTrinity || false,
          features: hasTrinity
            ? [
                'future_self',
                'reverse_roadmap',
                'identity_simulator',
                'mirror_conversations',
                'pattern_detection',
                'quantum_guidance',
              ]
            : [],
        },
      })
    } catch (dbError) {
      console.error('Database operation error:', dbError)
      return NextResponse.json(
        {
          error: 'Database error',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Quantum access API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Optional: Add POST method for updating quantum access
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const body = await request.json()
    
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log quantum vault access
    const { error: logError } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        ecosystem: 'quantum-vault',
        action_type: 'access_check',
        action_data: {
          timestamp: new Date().toISOString(),
          request_type: body.type || 'general',
        },
      })

    if (logError) {
      console.error('Failed to log quantum access:', logError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quantum access POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}