// app/api/porflow/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { getUserTasks, createTask, bulkUpdateTasks } from '@/lib/database/porflow'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') as any
    const priority = url.searchParams.get('priority') as any
    const category = url.searchParams.get('category')
    const dueWithinDays = url.searchParams.get('due_within_days')

    const filters: any = {}
    if (status) filters.status = status
    if (priority) filters.priority = priority
    if (category) filters.category = category
    if (dueWithinDays) filters.due_within_days = parseInt(dueWithinDays)

    const tasks = await getUserTasks(user.id, filters)
    
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const taskData = {
      user_id: user.id,
      title: body.title,
      description: body.description,
      priority: body.priority,
      category: body.category,
      estimated_minutes: body.estimated_minutes,
      due_date: body.due_date ? new Date(body.due_date) : undefined,
      assignee: body.assignee,
      tags: body.tags,
      dependencies: body.dependencies
    }

    const task = await createTask(taskData)
    
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.updates || !Array.isArray(body.updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      )
    }

    await bulkUpdateTasks(user.id, body.updates)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to update tasks' },
      { status: 500 }
    )
  }
}

// app/api/porflow/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { updateTask, deleteTask } from '@/lib/database/porflow'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    let session

    switch (body.action) {
      case 'start':
        session = await startFocusSession(params.id, user.id)
        break
        
      case 'complete':
        if (!body.actual_duration) {
          return NextResponse.json(
            { error: 'Actual duration is required for completion' },
            { status: 400 }
          )
        }
        session = await completeFocusSession(params.id, user.id, {
          actual_duration: body.actual_duration,
          productivity_score: body.productivity_score,
          distractions_count: body.distractions_count,
          session_notes: body.session_notes
        })
        break
        
      case 'pause':
        session = await pauseFocusSession(params.id, user.id)
        break
        
      case 'cancel':
        await cancelFocusSession(params.id, user.id)
        return NextResponse.json({ success: true })
        
      case 'add_distraction':
        session = await addDistraction(params.id, user.id)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to update focus session' },
      { status: 500 }
    )
  }
}

// app/api/porflow/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { 
  getUserProductivityStats,
  getDailyProductivitySummary,
  getWeeklyTaskTrends
} from '@/lib/database/porflow'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const days = parseInt(url.searchParams.get('days') || '30')
    const date = url.searchParams.get('date')

    switch (type) {
      case 'productivity-stats':
        const stats = await getUserProductivityStats(user.id, days)
        return NextResponse.json({ stats })
        
      case 'daily-summary':
        if (!date) {
          return NextResponse.json(
            { error: 'Date is required for daily summary' },
            { status: 400 }
          )
        }
        const dailySummary = await getDailyProductivitySummary(user.id, new Date(date))
        return NextResponse.json({ summary: dailySummary })
        
      case 'weekly-trends':
        const startDate = date ? new Date(date) : new Date()
        const trends = await getWeeklyTaskTrends(user.id, startDate)
        return NextResponse.json({ trends })
        
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// app/api/porflow/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { 
  generateAIOptimizationSuggestions,
  calculateOptimalSchedule,
  getUserTasks
} from '@/lib/database/porflow'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type')

    switch (type) {
      case 'suggestions':
        const suggestions = await generateAIOptimizationSuggestions(user.id)
        return NextResponse.json({ suggestions })
        
      case 'schedule':
        const tasks = await getUserTasks(user.id, { status: 'todo' })
        const preferences = {
          work_start_hour: parseInt(url.searchParams.get('work_start') || '9'),
          work_end_hour: parseInt(url.searchParams.get('work_end') || '17'),
          break_duration: parseInt(url.searchParams.get('break_duration') || '15'),
          max_focus_duration: parseInt(url.searchParams.get('max_focus') || '90')
        }
        
        const schedule = await calculateOptimalSchedule(user.id, tasks, preferences)
        return NextResponse.json({ schedule })
        
      default:
        return NextResponse.json(
          { error: 'Invalid optimization type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate optimizations' },
      { status: 500 }
    )
  }
}

// app/api/porflow/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { syncCalendarIntegration } from '@/lib/database/porflow'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      )
    }

    const externalEvents = body.events.map((event: any) => ({
      title: event.title,
      start_time: new Date(event.start_time),
      end_time: new Date(event.end_time),
      location: event.location,
      attendees: event.attendees
    }))

    const timeBlocks = await syncCalendarIntegration(user.id, externalEvents)
    
    return NextResponse.json({ 
      success: true, 
      synced_count: timeBlocks.length,
      time_blocks: timeBlocks 
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    )
  }
}

// app/api/porflow/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data: requestData } = body

    switch (type) {
      case 'task-prioritization':
        const prioritizationPrompt = `
          Analyze these tasks and provide AI-powered prioritization insights:
          ${JSON.stringify(requestData.tasks)}
          
          Consider:
          - Due dates and urgency
          - Task complexity and estimated time
          - Dependencies between tasks
          - Strategic importance
          
          Provide a JSON response with:
          - Updated priority scores (1-10)
          - Reasoning for each task
          - Recommended order of execution
          - Suggested time blocks
        `
        
        const prioritizationResponse = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are an AI productivity expert specializing in task prioritization and time management."
            },
            {
              role: "user",
              content: prioritizationPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
        
        return NextResponse.json({ 
          result: JSON.parse(prioritizationResponse.choices[0].message.content || '{}')
        })

      case 'schedule-optimization':
        const schedulePrompt = `
          Optimize this schedule for maximum productivity:
          Current schedule: ${JSON.stringify(requestData.schedule)}
          User preferences: ${JSON.stringify(requestData.preferences)}
          Energy patterns: ${JSON.stringify(requestData.energy_patterns)}
          
          Provide optimizations considering:
          - Energy levels throughout the day
          - Context switching minimization
          - Buffer time between meetings
          - Deep work block optimization
          
          Return JSON with:
          - Optimized time blocks
          - Reasoning for changes
          - Expected productivity improvement
          - Alternative scheduling options
        `
        
        const scheduleResponse = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are an AI scheduling expert who optimizes calendars for peak productivity."
            },
            {
              role: "user",
              content: schedulePrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.4
        })
        
        return NextResponse.json({ 
          result: JSON.parse(scheduleResponse.choices[0].message.content || '{}')
        })

      case 'productivity-insights':
        const insightsPrompt = `
          Generate productivity insights from this user data:
          Stats: ${JSON.stringify(requestData.stats)}
          Recent activities: ${JSON.stringify(requestData.activities)}
          Goals: ${JSON.stringify(requestData.goals)}
          
          Analyze patterns and provide:
          - Key productivity patterns identified
          - Areas for improvement
          - Personalized recommendations
          - Habit suggestions
          - Optimal work rhythms
          
          Focus on actionable insights that can improve performance.
        `
        
        const insightsResponse = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are an AI productivity analyst who identifies patterns and provides actionable insights."
            },
            {
              role: "user",
              content: insightsPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.5
        })
        
        return NextResponse.json({ 
          result: JSON.parse(insightsResponse.choices[0].message.content || '{}')
        })

      default:
        return NextResponse.json(
          { error: 'Invalid AI operation type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

// middleware.ts - Add PorFlow API protection
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if the request is for PorFlow API
  if (request.nextUrl.pathname.startsWith('/api/porflow')) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Rate limiting for AI endpoints
    if (request.nextUrl.pathname.includes('/api/porflow/ai')) {
      const rateLimitKey = `ratelimit:${session.user.id}:ai`
      // Implement rate limiting logic here
      // For now, we'll skip this but in production you'd use Redis or similar
    }
  }

  return res
}

export const config = {
  matcher: [
    '/api/porflow/:path*'
  ]
}

// hooks/usePorFlow.ts - React hooks for easy API consumption
import { useState, useEffect } from 'react'
import { useSupabase } from '@/hooks/useSupabase'

export interface UsePorFlowTasksOptions {
  status?: string
  priority?: string
  category?: string
  due_within_days?: number
  auto_refresh?: boolean
}

export function usePorFlowTasks(options: UsePorFlowTasksOptions = {}) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (options.status) params.append('status', options.status)
      if (options.priority) params.append('priority', options.priority)
      if (options.category) params.append('category', options.category)
      if (options.due_within_days) params.append('due_within_days', options.due_within_days.toString())

      const response = await fetch(`/api/porflow/tasks?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks')
      }
      
      setTasks(data.tasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/porflow/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task')
      }
      
      await fetchTasks() // Refresh tasks
      return data.task
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: any) => {
    try {
      const response = await fetch(`/api/porflow/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task')
      }
      
      await fetchTasks() // Refresh tasks
      return data.task
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/porflow/tasks/${taskId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete task')
      }
      
      await fetchTasks() // Refresh tasks
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [JSON.stringify(options)])

  // Auto-refresh if enabled
  useEffect(() => {
    if (!options.auto_refresh) return

    const interval = setInterval(fetchTasks, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [options.auto_refresh])

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask
  }
}

export function usePorFlowFocusSession() {
  const [currentSession, setCurrentSession] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async (days = 30) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/porflow/focus-sessions?days=${days}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions')
      }
      
      setSessions(data.sessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (sessionData: any) => {
    try {
      const response = await fetch('/api/porflow/focus-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session')
      }
      
      setCurrentSession(data.session)
      return data.session
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const updateSession = async (sessionId: string, action: string, data: any = {}) => {
    try {
      const response = await fetch(`/api/porflow/focus-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update session')
      }
      
      if (action === 'complete' || action === 'cancel') {
        setCurrentSession(null)
        await fetchSessions() // Refresh sessions list
      } else {
        setCurrentSession(result.session)
      }
      
      return result.session
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return {
    currentSession,
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    startSession: (id: string) => updateSession(id, 'start'),
    pauseSession: (id: string) => updateSession(id, 'pause'),
    completeSession: (id: string, data: any) => updateSession(id, 'complete', data),
    cancelSession: (id: string) => updateSession(id, 'cancel'),
    addDistraction: (id: string) => updateSession(id, 'add_distraction')
  }
} (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates = { ...body }
    
    if (updates.due_date) {
      updates.due_date = new Date(updates.due_date)
    }

    const task = await updateTask(params.id, user.id, updates)
    
    return NextResponse.json({ task })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteTask(params.id, user.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}

// app/api/porflow/time-blocks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { getUserTimeBlocks, createTimeBlock, detectScheduleConflicts } from '@/lib/database/porflow'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const startDate = new Date(url.searchParams.get('start_date') || new Date())
    const endDate = new Date(url.searchParams.get('end_date') || new Date())

    const timeBlocks = await getUserTimeBlocks(user.id, startDate, endDate)
    
    return NextResponse.json({ timeBlocks })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time blocks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.title || !body.start_time || !body.end_time) {
      return NextResponse.json(
        { error: 'Title, start_time, and end_time are required' },
        { status: 400 }
      )
    }

    const startTime = new Date(body.start_time)
    const endTime = new Date(body.end_time)

    // Check for conflicts
    const conflicts = await detectScheduleConflicts(user.id, {
      start_time: startTime,
      end_time: endTime
    })

    if (conflicts.length > 0) {
      return NextResponse.json({
        error: 'Schedule conflict detected',
        conflicts
      }, { status: 409 })
    }

    const blockData = {
      user_id: user.id,
      title: body.title,
      description: body.description,
      start_time: startTime,
      end_time: endTime,
      block_type: body.block_type,
      priority: body.priority,
      energy_level: body.energy_level,
      location: body.location,
      attendees: body.attendees,
      task_ids: body.task_ids
    }

    const timeBlock = await createTimeBlock(blockData)
    
    return NextResponse.json({ timeBlock }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create time block' },
      { status: 500 }
    )
  }
}

// app/api/porflow/focus-sessions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { 
  getUserFocusSessions, 
  createFocusSession, 
  startFocusSession,
  completeFocusSession,
  pauseFocusSession,
  cancelFocusSession,
  addDistraction
} from '@/lib/database/porflow'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30')

    const sessions = await getUserFocusSessions(user.id, days)
    
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch focus sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.session_type || !body.planned_duration) {
      return NextResponse.json(
        { error: 'Session type and planned duration are required' },
        { status: 400 }
      )
    }

    const sessionData = {
      user_id: user.id,
      session_type: body.session_type,
      planned_duration: body.planned_duration,
      task_id: body.task_id,
      time_block_id: body.time_block_id,
      background_sound: body.background_sound
    }

    const session = await createFocusSession(sessionData)
    
    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create focus session' },
      { status: 500 }
    )
  }
}

// app/api/porflow/focus-sessions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if