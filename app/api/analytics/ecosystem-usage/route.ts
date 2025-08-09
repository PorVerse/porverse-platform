// app/api/analytics/ecosystem-usage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ecosystem, feature, duration, metadata } = body

    // Log usage analytics
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        ecosystem,
        action_type: 'feature_usage',
        action_data: {
          feature,
          duration,
          metadata
        },
        created_at: new Date().toISOString()
      })

    // Update ecosystem usage metrics
    await supabase
      .from('user_ecosystems')
      .update({
        last_accessed_at: new Date().toISOString(),
        usage_minutes: supabase.sql`usage_minutes + ${duration || 0}`
      })
      .eq('user_id', user.id)
      .eq('ecosystem', ecosystem)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}