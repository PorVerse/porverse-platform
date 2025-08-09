// app/api/por-kids/upload-homework/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get('image') as File
    const childId = formData.get('childId') as string

    if (!image || !childId) {
      return NextResponse.json({ error: 'Missing image or child ID' }, { status: 400 })
    }

    // Verify child belongs to user
    const { data: child } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('id', childId)
      .eq('parent_id', user.id)
      .single()

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Upload to storage (simplified - would use actual file storage)
    const imageBuffer = await image.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const imageUrl = `data:${image.type};base64,${base64Image}`

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// app/api/por-kids/scan-homework/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageUrl, childId } = await request.json()

    // Get child profile for context
    const { data: child } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('id', childId)
      .eq('parent_id', user.id)
      .single()

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Extract text using OpenAI Vision
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all text from this homework image for a ${child.grade_level} student. Identify the subject and specific questions.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1000
    })

    const extractedText = visionResponse.choices[0]?.message?.content || ''

    // Identify subject and difficulty
    const subject = await identifySubject(extractedText, child.grade_level)
    const difficulty = await assessDifficulty(extractedText, child.grade_level)

    // Generate solution
    const solutionResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an educational AI tutor for ${child.grade_level} students. Provide step-by-step solutions that help students learn, not just get answers. Include explanations appropriate for a ${child.age}-year-old.`
        },
        {
          role: "user",
          content: `Solve this ${subject} homework for a ${child.grade_level} student:\n\n${extractedText}\n\nProvide:\n1. Step-by-step solution\n2. Learning explanation\n3. Similar practice problems\n4. Key concepts to remember`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })

    const aiSolution = {
      explanation: solutionResponse.choices[0]?.message?.content || '',
      steps: extractSteps(solutionResponse.choices[0]?.message?.content || ''),
      concepts: extractConcepts(solutionResponse.choices[0]?.message?.content || ''),
      practice_problems: generatePracticeProblems(subject, difficulty)
    }

    // Save homework submission
    const { data: submission, error: saveError } = await supabase
      .from('homework_submissions')
      .insert({
        child_id: childId,
        subject,
        image_url: imageUrl,
        ocr_text: extractedText,
        ai_solution: aiSolution,
        difficulty_level: difficulty,
        accuracy_score: 95, // Would be calculated based on solution quality
        parent_approved: false
      })
      .select()
      .single()

    if (saveError) throw saveError

    // Update learning progress
    await updateLearningProgress(supabase, childId, subject, difficulty)

    return NextResponse.json({
      success: true,
      data: submission,
      message: 'Homework scanned and solved successfully'
    })

  } catch (error) {
    console.error('Scanning error:', error)
    return NextResponse.json({ error: 'Scanning failed' }, { status: 500 })
  }
}

// app/api/por-kids/homework/[childId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const supabase = createServerSupabase()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { childId } = params

    // Verify child belongs to user
    const { data: child } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('id', childId)
      .eq('parent_id', user.id)
      .single()

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Get homework submissions
    const { data: submissions, error } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('child_id', childId)
      .order('submitted_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: submissions || []
    })

  } catch (error) {
    console.error('Error fetching homework:', error)
    return NextResponse.json({ error: 'Failed to fetch homework' }, { status: 500 })
  }
}

// app/api/por-kids/progress/[childId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const supabase = createServerSupabase()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { childId } = params

    // Get learning progress
    const { data: progress, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('child_id', childId)
      .order('assessed_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: progress || []
    })

  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

// app/api/por-kids/approve-homework/[submissionId]/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const supabase = createServerSupabase()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { submissionId } = params

    // Verify submission belongs to user's child
    const { data: submission } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        child_profiles!inner(parent_id)
      `)
      .eq('id', submissionId)
      .single()

    if (!submission || submission.child_profiles.parent_id !== user.id) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Approve submission
    const { error: updateError } = await supabase
      .from('homework_submissions')
      .update({ parent_approved: true })
      .eq('id', submissionId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Homework solution approved'
    })

  } catch (error) {
    console.error('Error approving homework:', error)
    return NextResponse.json({ error: 'Failed to approve homework' }, { status: 500 })
  }
}

// Helper functions
async function identifySubject(text: string, gradeLevel: string): Promise<string> {
  const subjects = ['Math', 'English', 'Science', 'History', 'Geography']
  
  // Simple keyword matching - could be enhanced with AI
  const mathKeywords = ['calculate', 'solve', 'equation', 'number', 'add', 'subtract', 'multiply', 'divide']
  const englishKeywords = ['write', 'essay', 'paragraph', 'grammar', 'verb', 'noun', 'sentence']
  const scienceKeywords = ['experiment', 'hypothesis', 'observe', 'molecule', 'energy', 'force']
  
  if (mathKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    return 'Math'
  }
  if (englishKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    return 'English'
  }
  if (scienceKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    return 'Science'
  }
  
  return 'General'
}

async function assessDifficulty(text: string, gradeLevel: string): Promise<number> {
  const gradeMap: Record<string, number> = {
    'Kindergarten': 1,
    '1st Grade': 2,
    '2nd Grade': 3,
    '3rd Grade': 4,
    '4th Grade': 5,
    '5th Grade': 6,
    '6th Grade': 7,
    '7th Grade': 8,
    '8th Grade': 9
  }
  
  return gradeMap[gradeLevel] || 5
}

function extractSteps(solution: string): string[] {
  // Extract numbered steps from solution
  const stepRegex = /(\d+\..*?)(?=\d+\.|$)/gs
  const matches = solution.match(stepRegex)
  return matches || []
}

function extractConcepts(solution: string): string[] {
  // Extract key concepts - simplified implementation
  const conceptKeywords = ['concept', 'rule', 'principle', 'remember']
  const concepts: string[] = []
  
  conceptKeywords.forEach(keyword => {
    const regex = new RegExp(`${keyword}[^.]*\.`, 'gi')
    const matches = solution.match(regex)
    if (matches) concepts.push(...matches)
  })
  
  return concepts
}

function generatePracticeProblems(subject: string, difficulty: number): string[] {
  // Generate similar practice problems based on subject and difficulty
  const problems = {
    'Math': [
      'Solve: 5 + 3 = ?',
      'Calculate: 12 - 7 = ?',
      'Find: 4 × 6 = ?'
    ],
    'English': [
      'Write a sentence using the word "happy"',
      'Identify the noun in: "The cat runs fast"',
      'Complete: "I am _____ today"'
    ]
  }
  
  return problems[subject] || ['Practice problem will be generated']
}

async function updateLearningProgress(
  supabase: any,
  childId: string,
  subject: string,
  difficulty: number
) {
  // Update or create learning progress entry
  const { data: existing } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('child_id', childId)
    .eq('subject', subject)
    .single()

  const progressData = {
    child_id: childId,
    subject,
    topic: 'General',
    mastery_level: existing ? Math.min(100, existing.mastery_level + 5) : difficulty * 10,
    time_spent_minutes: (existing?.time_spent_minutes || 0) + 15,
    exercises_completed: (existing?.exercises_completed || 0) + 1,
    accuracy_percentage: 95,
    assessed_at: new Date().toISOString()
  }

  if (existing) {
    await supabase
      .from('learning_progress')
      .update(progressData)
      .eq('id', existing.id)
  } else {
    await supabase
      .from('learning_progress')
      .insert(progressData)
  }
}