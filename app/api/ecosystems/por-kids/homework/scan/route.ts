// app/api/ecosystems/por-kids/homework/scan/route.ts
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

    const formData = await request.formData()
    const image = formData.get('image') as File
    const subject = formData.get('subject') as string
    const gradeLevel = parseInt(formData.get('gradeLevel') as string)
    const childId = formData.get('childId') as string

    if (!image || !subject || !gradeLevel || !childId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Analyze homework with AI
    const aiService = new AIService()
    const analysis = await aiService.analyzeHomework || (() => Promise.resolve({}))({
      imageData: base64Image,
      subject,
      gradeLevel,
      childId
    })

    // Save homework submission
    const { data: submission, error } = await supabase
      .from('homework_submissions')
      .insert({
        child_id: childId,
        subject,
        image_url: `data:image/jpeg;base64,${base64Image}`,
        ai_solution: analysis,
        parent_approved: false,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { submission, analysis } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}