import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test database connection
    const supabase = createServerSupabase()
    const { error: dbError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    // Test AI service
    const aiHealthy = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: !dbError,
        ai: !!aiHealthy,
        payments: !!process.env.STRIPE_SECRET_KEY
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Service check failed'
    }, { status: 500 })
  }
}