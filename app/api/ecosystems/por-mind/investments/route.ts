// app/api/ecosystems/por-mind/investments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's investment portfolio
    const { data: investments, error } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch current market prices (mock data for now)
    const enhancedInvestments = investments?.map(inv => ({
      ...inv,
      current_price: Math.random() * 100 + 50, // Mock price
      daily_change: (Math.random() - 0.5) * 10, // Mock change
      total_value: inv.shares * (Math.random() * 100 + 50)
    })) || []

    return NextResponse.json({ data: enhancedInvestments })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}