// app/api/analytics/ecosystem-usage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

type EcosystemUsagePayload = {
  ecosystem: string
  feature?: string
  duration?: number
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await request.json()) as EcosystemUsagePayload
    const ecosystem = (body?.ecosystem || '').trim()
    const feature = body?.feature?.trim()
    const duration = Math.max(0, Math.floor(Number(body?.duration ?? 0)))
    const metadata = body?.metadata ?? {}

    if (!ecosystem) return NextResponse.json({ error: 'ecosystem is required' }, { status: 400 })

    const { error: logErr } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        ecosystem,
        action_type: 'feature_usage',
        action_data: { feature, duration, metadata }
      })
    if (logErr) console.warn('activity log insert failed:', logErr.message)

    const { error: rpcErr } = await supabase.rpc('increment_usage_minutes', {
      p_user_id: user.id,
      p_ecosystem: ecosystem,
      p_minutes: duration
    })
    if (rpcErr) console.error('increment_usage_minutes RPC failed:', rpcErr.message)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('ecosystem-usage error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
