// app/api/ecosystems/por-health/workouts/generate/route.ts
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
    const { fitnessLevel, goals, equipment, timeConstraints } = body

    const aiService = new AIService()
    const workoutPlan = await aiService.generateWorkoutPlan({
      userId: user.id,
      fitnessLevel,
      goals,
      equipment,
      timeConstraints
    })

    // Save workout plan
    const { data: savedPlan, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: user.id,
        plan_data: workoutPlan,
        fitness_level: fitnessLevel,
        goals,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: workoutPlan })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}