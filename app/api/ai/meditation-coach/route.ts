import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock meditation coaching response
    const response = {
      message: "I'm here to guide you through meditation. What would you like to work on today?",
      suggestions: [
        "Stress relief breathing",
        "Mindfulness practice", 
        "Sleep preparation",
        "Focus enhancement"
      ],
      sessionId: `session-${Date.now()}`
    }
    
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Meditation coach unavailable' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Meditation coach ready',
    techniques: ['breathing', 'mindfulness', 'body-scan']
  })
}