// app/api/ecosystems/por-well/therapy/session/route.ts
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
    const { message, sessionContext } = body

    const aiService = new AIService()
    
    // Check for crisis indicators
    const safetyCheck = await aiService.checkMentalHealthSafety(message, sessionContext)
    
    if (safetyCheck.requiresIntervention) {
      // Log crisis event
      await supabase
        .from('crisis_logs')
        .insert({
          user_id: user.id,
          message,
          severity: safetyCheck.severity,
          created_at: new Date().toISOString()
        })

      // Return crisis resources
      return NextResponse.json({
        data: {
          response: safetyCheck.crisisResponse,
          resources: safetyCheck.resources,
          requiresIntervention: true
        }
      })
    }

    // Generate therapeutic response
    const therapyResponse = await aiService.generateTherapeuticResponse({
      message,
      context: sessionContext,
      userId: user.id
    })

    // Save therapy session
    await supabase
      .from('therapy_sessions')
      .insert({
        user_id: user.id,
        session_type: 'ai_chat',
        messages: [{ user: message, ai: therapyResponse.message }],
        mood_before: sessionContext.moodScore,
        created_at: new Date().toISOString()
      })

    return NextResponse.json({ data: therapyResponse })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}