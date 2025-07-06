// app/api/quantum-vault/future-self/route.ts (FIȘIER NOU)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { generateFutureSelf } from '@/lib/ai/openrouter'

export async function POST(request: Request) {
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

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Trinity access
    const { data: hasTrinity } = await supabase
      .rpc('has_trinity_combo', { user_uuid: user.id })
    
    if (!hasTrinity) {
      return NextResponse.json({ error: 'Trinity access required' }, { status: 403 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get user progress and goals
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: goals } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    // Generate Future Self
    const futureSelf = await generateFutureSelf({
      profile,
      progress,
      goals,
      age: request.headers.get('x-user-age') || 30
    });

    // Save to database
    await supabase
      .from('quantum_vault_data')
      .upsert({
        user_id: user.id,
        feature_type: 'future_self',
        data_payload: futureSelf,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })

    // Log activity
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        ecosystem: 'quantum-vault',
        action_type: 'future_self_generated',
        action_data: { timestamp: new Date().toISOString() }
      })

    return NextResponse.json({ futureSelf })
  } catch (error) {
    console.error('Future Self API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Future Self' },
      { status: 500 }
    )
  }
}