// app/api/por-kids/homework/scan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { homeworkScannerService } from '@/lib/porKids/homework-scanner-service'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Check if user has access to PorKids
    const { data: ecosystemAccess } = await supabase
      .from('user_ecosystems')
      .select('access_level')
      .eq('user_id', user.id)
      .eq('ecosystem', 'por-kids')
      .single()

    if (!ecosystemAccess || ecosystemAccess.access_level === 'locked') {
      return NextResponse.json(
        { error: 'PorKids access required. Please upgrade your subscription.' },
        { status: 403 }
      )
    }

    // 3. Parse form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const childId = formData.get('childId') as string
    const subject = formData.get('subject') as string
    const gradeLevel = parseInt(formData.get('gradeLevel') as string)

    // 4. Validate input
    if (!imageFile || !childId || !subject || !gradeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: image, childId, subject, gradeLevel' },
        { status: 400 }
      )
    }

    // 5. Validate file
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // 6. Verify child belongs to user
    const { data: childProfile, error: childError } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('id', childId)
      .eq('parent_id', user.id)
      .single()

    if (childError || !childProfile) {
      return NextResponse.json(
        { error: 'Child profile not found or access denied' },
        { status: 404 }
      )
    }

    // 7. Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)

    // 8. Process homework with AI
    console.log(`Processing homework for child ${childId}, subject: ${subject}, grade: ${gradeLevel}`)
    
    const analysis = await homeworkScannerService.scanAndSolveHomework(
      imageBuffer,
      childId,
      subject,
      gradeLevel
    )

    // 9. Log activity
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        ecosystem: 'por-kids',
        action_type: 'homework_scanned',
        action_data: {
          child_id: childId,
          subject: subject,
          grade_level: gradeLevel,
          confidence: analysis.confidence,
          problem_type: analysis.problemType
        }
      })

    // 10. Return successful analysis
    return NextResponse.json({
      success: true,
      data: {
        id: analysis.id,
        extractedText: analysis.extractedText,
        confidence: analysis.confidence,
        problemType: analysis.problemType,
        solution: analysis.solution,
        learningGaps: analysis.learningGaps,
        recommendedExercises: analysis.recommendedExercises,
        parentApprovalRequired: analysis.parentApprovalRequired,
        createdAt: analysis.createdAt
      }
    })

  } catch (error) {
    console.error('Homework scanning error:', error)
    
    // Log error for monitoring
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          }
        }
      }
    )

    await supabase.from('error_logs').insert({
      error_type: 'homework_scan_failure',
      error_message: error.message,
      stack_trace: error.stack,
      context: {
        endpoint: '/api/por-kids/homework/scan',
        timestamp: new Date().toISOString()
      },
      severity: 'high'
    })

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process homework. Please try again or contact support.' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve homework history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const subject = searchParams.get('subject')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Build query
    let query = supabase
      .from('homework_submissions')
      .select(`
        id,
        subject,
        grade_level,
        problem_type,
        ocr_confidence,
        status,
        submitted_at,
        child_profiles!homework_submissions_child_id_fkey (
          name,
          age
        )
      `)
      .eq('child_profiles.parent_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(limit)

    if (childId) {
      query = query.eq('child_id', childId)
    }

    if (subject) {
      query = query.eq('subject', subject)
    }

    const { data: homeworkHistory, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: homeworkHistory || []
    })

  } catch (error) {
    console.error('Homework history retrieval error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve homework history' 
      },
      { status: 500 }
    )
  }
}

// Additional endpoint for parent approval
// PUT /api/por-kids/homework/scan?action=approve
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()
    const { homeworkId, approved, feedback } = body

    if (action !== 'approve') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify homework belongs to user's child
    const { data: homework, error: homeworkError } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        child_profiles!homework_submissions_child_id_fkey (
          parent_id
        )
      `)
      .eq('id', homeworkId)
      .single()

    if (homeworkError || !homework || homework.child_profiles.parent_id !== user.id) {
      return NextResponse.json(
        { error: 'Homework not found or access denied' },
        { status: 404 }
      )
    }

    // Update approval status
    const { error: updateError } = await supabase
      .from('homework_submissions')
      .update({
        status: approved ? 'approved' : 'rejected',
        parent_feedback: feedback,
        approved_at: approved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', homeworkId)

    if (updateError) {
      throw updateError
    }

    // Log activity
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        ecosystem: 'por-kids',
        action_type: 'homework_approved',
        action_data: {
          homework_id: homeworkId,
          approved,
          feedback
        }
      })

    return NextResponse.json({
      success: true,
      message: `Homework ${approved ? 'approved' : 'rejected'} successfully`
    })

  } catch (error) {
    console.error('Homework approval error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update homework approval status' 
      },
      { status: 500 }
    )
  }
}