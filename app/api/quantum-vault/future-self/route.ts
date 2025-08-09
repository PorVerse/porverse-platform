// app/api/quantum-vault/future-self/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AIService } from '@/lib/ai/ai-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { timelineYears = 10 } = body

    // Verify Quantum Vault access
    const { data: access } = await supabase
      .from('quantum_vault_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('access_level', 'full')
      .single()

    if (!access) {
      return NextResponse.json({ error: 'Quantum Vault access required' }, { status: 403 })
    }

    const aiService = new AIService()
    const futureSelf = await aiService.generateFutureSelf({
      userId: user.id,
      timelineYears
    })

    // Save future self profile
    const { data: savedProfile, error } = await supabase
      .from('future_self_profiles')
      .insert({
        user_id: user.id,
        timeline_years: timelineYears,
        avatar_data: futureSelf.avatar,
        personality_traits: futureSelf.personality,
        achievements: futureSelf.achievements,
        wisdom_messages: futureSelf.wisdomMessages,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: futureSelf })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}