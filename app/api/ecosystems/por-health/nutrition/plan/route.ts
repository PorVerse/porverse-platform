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
    const { goals, preferences, healthProfile } = body

    // Generate nutrition plan using AI
    const aiService = new AIService()
    const nutritionPlan = await aiService.generateNutritionPlan({
      userId: user.id,
      goals,
      preferences,
      healthProfile
    })

    // Save plan to database
    const { data: savedPlan, error } = await supabase
      .from('nutrition_plans')
      .insert({
        user_id: user.id,
        plan_data: nutritionPlan,
        goals,
        preferences,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: nutritionPlan })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}