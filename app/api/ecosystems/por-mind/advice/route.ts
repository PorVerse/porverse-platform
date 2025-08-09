// app/api/ecosystems/por-mind/advice/route.ts
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
    const { goals, investments, riskProfile } = body

    const aiService = new AIService()
    const advice = await aiService.generateFinancialAdvice({
      userId: user.id,
      goals,
      investments,
      riskProfile,
      marketConditions: {} // Would fetch real market data
    })

    return NextResponse.json({ data: { advice } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}