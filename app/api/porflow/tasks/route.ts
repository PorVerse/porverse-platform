// app/api/porflow/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { getUserTasks, createTask } from '@/lib/database/porflow'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const filters = {
      status: url.searchParams.get('status') as any,
      priority: url.searchParams.get('priority') as any,
      category: url.searchParams.get('category') || undefined,
      due_within_days: url.searchParams.get('due_within_days') 
        ? parseInt(url.searchParams.get('due_within_days')!) 
        : undefined
    }

    const tasks = await getUserTasks(user.id, filters)
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Tasks API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
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
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const task = await createTask({
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
    })
    
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Create Task API Error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
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
        session = await updateFocusSession(params.id, user.id, {
          status: 'active',
          start_time: new Date()
        })
        break
        
      case 'pause':
        session = await updateFocusSession(params.id, user.id, {
          status: 'paused'
        })
        break
        
      case 'resume':
        session = await updateFocusSession(params.id, user.id, {
          status: 'active'
        })
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
        
      case 'cancel':
        session = await updateFocusSession(params.id, user.id, {
          status: 'cancelled',
          end_time: new Date()
        })
        break
        
      case 'add_distraction':
        // Get current session first
        const { data: currentSession } = await supabase
          .from('por_flow_focus_sessions')
          .select('distractions_count')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single()
        
        if (!currentSession) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }
        
        session = await updateFocusSession(params.id, user.id, {
          distractions_count: (currentSession.distractions_count || 0) + 1
        })
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Update Focus Session API Error:', error)
    return NextResponse.json({ error: 'Failed to update focus session' }, { status: 500 })
  }
}

// app/api/porflow/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { getUserProductivityStats } from '@/lib/database/porflow'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30')

    const stats = await getUserProductivityStats(user.id, days)
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
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
    console.error('Update Task API Error:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
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
    console.error('Delete Task API Error:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
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
    const startDate = new Date(url.searchParams.get('start_date') || new Date().toISOString().split('T')[0])
    const endDate = new Date(url.searchParams.get('end_date') || new Date().toISOString().split('T')[0])
    endDate.setDate(endDate.getDate() + 1) // Include full day

    const timeBlocks = await getUserTimeBlocks(user.id, startDate, endDate)
    return NextResponse.json({ timeBlocks })
  } catch (error) {
    console.error('Time Blocks API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch time blocks' }, { status: 500 })
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

    const timeBlock = await createTimeBlock({
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
    })
    
    return NextResponse.json({ timeBlock }, { status: 201 })
  } catch (error) {
    console.error('Create Time Block API Error:', error)
    return NextResponse.json({ error: 'Failed to create time block' }, { status: 500 })
  }
}

// app/api/porflow/focus-sessions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { getUserFocusSessions, createFocusSession } from '@/lib/database/porflow'

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
    console.error('Focus Sessions API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch focus sessions' }, { status: 500 })
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

    const session = await createFocusSession({
      user_id: user.id,
      session_type: body.session_type,
      planned_duration: body.planned_duration,
      task_id: body.task_id,
      time_block_id: body.time_block_id,
      background_sound: body.background_sound
    })
    
    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('Create Focus Session API Error:', error)
    return NextResponse.json({ error: 'Failed to create focus session' }, { status: 500 })
  }
}

// app/api/porflow/focus-sessions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { updateFocusSession, completeFocusSession } from '@/lib/database/porflow'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error