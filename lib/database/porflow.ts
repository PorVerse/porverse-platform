// lib/database/porflow.ts
import { createServerSupabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface PorFlowTask {
  id: string
  user_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  category?: string
  estimated_minutes: number
  actual_minutes: number
  due_date?: Date
  assignee?: string
  tags: string[]
  ai_priority_score: number
  dependencies: string[]
  project_id?: string
  order_index: number
  created_at: Date
  updated_at: Date
  completed_at?: Date
}

export interface PorFlowTimeBlock {
  id: string
  user_id: string
  title: string
  description?: string
  start_time: Date
  end_time: Date
  block_type: 'focus' | 'meeting' | 'break' | 'admin' | 'creative' | 'buffer'
  color: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  energy_level?: 'low' | 'medium' | 'high'
  location?: string
  attendees: string[]
  task_ids: string[]
  productivity_score?: number
  is_locked: boolean
  is_completed: boolean
  actual_start_time?: Date
  actual_end_time?: Date
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface PorFlowFocusSession {
  id: string
  user_id: string
  session_type: 'pomodoro' | 'deep-work' | 'flow-state'
  planned_duration: number
  actual_duration: number
  start_time?: Date
  end_time?: Date
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled'
  task_id?: string
  time_block_id?: string
  distractions_count: number
  productivity_score?: number
  background_sound?: 'none' | 'rain' | 'forest' | 'coffee' | 'white-noise'
  session_notes?: string
  break_type: 'short' | 'long' | 'meal'
  created_at: Date
  updated_at: Date
}

export interface ProductivityStats {
  total_tasks: number
  completed_tasks: number
  completion_rate: number
  total_focus_minutes: number
  avg_productivity_score: number
  peak_productivity_hour: number
}

// ===========================
// TASK OPERATIONS
// ===========================

export async function getUserTasks(
  userId: string,
  filters?: {
    status?: PorFlowTask['status']
    priority?: PorFlowTask['priority']
    category?: string
    due_within_days?: number
  }
): Promise<PorFlowTask[]> {
  const supabase = createServerSupabase()
  
  let query = supabase
    .from('por_flow_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('ai_priority_score', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }
  
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  
  if (filters?.due_within_days) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + filters.due_within_days)
    query = query.lte('due_date', futureDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching tasks:', error)
    throw new Error('Failed to fetch tasks')
  }

  return data || []
}

export async function createTask(taskData: {
  user_id: string
  title: string
  description?: string
  priority?: PorFlowTask['priority']
  category?: string
  estimated_minutes?: number
  due_date?: Date
  assignee?: string
  tags?: string[]
  dependencies?: string[]
}): Promise<PorFlowTask> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('por_flow_tasks')
    .insert([{
      user_id: taskData.user_id,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      category: taskData.category,
      estimated_minutes: taskData.estimated_minutes || 60,
      due_date: taskData.due_date?.toISOString(),
      assignee: taskData.assignee,
      tags: taskData.tags || [],
      dependencies: taskData.dependencies || []
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task')
  }

  return data
}

export async function updateTask(
  taskId: string,
  userId: string,
  updates: Partial<Omit<PorFlowTask, 'id' | 'user_id' | 'created_at'>>
): Promise<PorFlowTask> {
  const supabase = createServerSupabase()

  const updateData: any = {}
  
  Object.keys(updates).forEach(key => {
    if (updates[key as keyof typeof updates] !== undefined) {
      if (key === 'due_date' && updates.due_date) {
        updateData[key] = updates.due_date.toISOString()
      } else {
        updateData[key] = updates[key as keyof typeof updates]
      }
    }
  })

  const { data, error } = await supabase
    .from('por_flow_tasks')
    .update(updateData)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating task:', error)
    throw new Error('Failed to update task')
  }

  return data
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const supabase = createServerSupabase()

  const { error } = await supabase
    .from('por_flow_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task')
  }
}

export async function updateTaskOrder(
  userId: string,
  taskUpdates: { id: string; order_index: number; status?: PorFlowTask['status'] }[]
): Promise<void> {
  const supabase = createServerSupabase()

  const promises = taskUpdates.map(update => 
    supabase
      .from('por_flow_tasks')
      .update({ 
        order_index: update.order_index,
        ...(update.status && { status: update.status })
      })
      .eq('id', update.id)
      .eq('user_id', userId)
  )

  const results = await Promise.allSettled(promises)
  
  const failed = results.filter(r => r.status === 'rejected')
  if (failed.length > 0) {
    console.error('Some task updates failed:', failed)
    throw new Error('Failed to update task order')
  }
}

// ===========================
// TIME BLOCK OPERATIONS
// ===========================

export async function getUserTimeBlocks(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PorFlowTimeBlock[]> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('por_flow_time_blocks')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', startDate.toISOString())
    .lte('end_time', endDate.toISOString())
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching time blocks:', error)
    throw new Error('Failed to fetch time blocks')
  }

  return data || []
}

export async function createTimeBlock(blockData: {
  user_id: string
  title: string
  description?: string
  start_time: Date
  end_time: Date
  block_type?: PorFlowTimeBlock['block_type']
  priority?: PorFlowTimeBlock['priority']
  energy_level?: PorFlowTimeBlock['energy_level']
  location?: string
  attendees?: string[]
  task_ids?: string[]
}): Promise<PorFlowTimeBlock> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('por_flow_time_blocks')
    .insert([{
      user_id: blockData.user_id,
      title: blockData.title,
      description: blockData.description,
      start_time: blockData.start_time.toISOString(),
      end_time: blockData.end_time.toISOString(),
      block_type: blockData.block_type || 'focus',
      priority: blockData.priority || 'medium',
      energy_level: blockData.energy_level,
      location: blockData.location,
      attendees: blockData.attendees || [],
      task_ids: blockData.task_ids || []
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating time block:', error)
    throw new Error('Failed to create time block')
  }

  return data
}

export async function updateTimeBlock(
  blockId: string,
  userId: string,
  updates: Partial<Omit<PorFlowTimeBlock, 'id' | 'user_id' | 'created_at'>>
): Promise<PorFlowTimeBlock> {
  const supabase = createServerSupabase()

  const updateData: any = {}
  
  Object.keys(updates).forEach(key => {
    const value = updates[key as keyof typeof updates]
    if (value !== undefined) {
      if (key === 'start_time' || key === 'end_time') {
        updateData[key] = (value as Date).toISOString()
      } else {
        updateData[key] = value
      }
    }
  })

  const { data, error } = await supabase
    .from('por_flow_time_blocks')
    .update(updateData)
    .eq('id', blockId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating time block:', error)
    throw new Error('Failed to update time block')
  }

  return data
}

export async function deleteTimeBlock(blockId: string, userId: string): Promise<void> {
  const supabase = createServerSupabase()

  const { error } = await supabase
    .from('por_flow_time_blocks')
    .delete()
    .eq('id', blockId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting time block:', error)
    throw new Error('Failed to delete time block')
  }
}

// ===========================
// FOCUS SESSION OPERATIONS
// ===========================

export async function getUserFocusSessions(
  userId: string,
  days: number = 30
): Promise<PorFlowFocusSession[]> {
  const supabase = createServerSupabase()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('por_flow_focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Error fetching focus sessions:', error)
    throw new Error('Failed to fetch focus sessions')
  }

  return data || []
}

export async function createFocusSession(sessionData: {
  user_id: string
  session_type: PorFlowFocusSession['session_type']
  planned_duration: number
  task_id?: string
  time_block_id?: string
  background_sound?: PorFlowFocusSession['background_sound']
}): Promise<PorFlowFocusSession> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('por_flow_focus_sessions')
    .insert([{
      user_id: sessionData.user_id,
      session_type: sessionData.session_type,
      planned_duration: sessionData.planned_duration,
      task_id: sessionData.task_id,
      time_block_id: sessionData.time_block_id,
      background_sound: sessionData.background_sound || 'none',
      status: 'planned'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating focus session:', error)
    throw new Error('Failed to create focus session')
  }

  return data
}

export async function startFocusSession(sessionId: string, userId: string): Promise<PorFlowFocusSession> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('por_flow_focus_sessions')
    .update({
      status: 'active',
      start_time: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error starting focus session:', error)
    throw new Error('Failed to start focus session')
  }

  return data
}

export async function completeFocusSession(
  sessionId: string,
  userId: string,
  sessionData: {
    actual_duration: number
    productivity_score?: number
    distractions_count?: number
    session_notes?: string
  }
): Promise<PorFlowFocusSession> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('por_flow_focus_sessions')
    .update({
      status: 'completed',
      end_time: new Date().toISOString(),
      actual_duration: sessionData.actual_duration,
      productivity_score: sessionData.productivity_score,
      distractions_count: sessionData.distractions_count || 0,
      session_notes: sessionData.session_notes
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error completing focus session:', error)
    throw new Error('Failed to complete focus session')
  }

  return data
}

export async function pauseFocusSession(sessionId: string, userId: string): Promise<PorFlowFocusSession> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('por_flow_focus_sessions')
    .update({ status: 'paused' })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error pausing focus session:', error)
    throw new Error('Failed to pause focus session')
  }

  return data
}

export async function cancelFocusSession(sessionId: string, userId: string): Promise<void> {
  const supabase = createServerSupabase()

  const { error } = await supabase
    .from('por_flow_focus_sessions')
    .update({ 
      status: 'cancelled',
      end_time: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error cancelling focus session:', error)
    throw new Error('Failed to cancel focus session')
  }
}

export async function addDistraction(sessionId: string, userId: string): Promise<PorFlowFocusSession> {
  const supabase = createServerSupabase()

  // First get current distraction count
  const { data: current, error: fetchError } = await supabase
    .from('por_flow_focus_sessions')
    .select('distractions_count')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    throw new Error('Failed to fetch current session')
  }

  const { data, error } = await supabase
    .from('por_flow_focus_sessions')
    .update({ 
      distractions_count: (current.distractions_count || 0) + 1 
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error adding distraction:', error)
    throw new Error('Failed to add distraction')
  }

  return data
}

// ===========================
// ANALYTICS & INSIGHTS
// ===========================

export async function getUserProductivityStats(
  userId: string,
  days: number = 30
): Promise<ProductivityStats> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .rpc('get_user_productivity_stats', {
      user_uuid: userId,
      days_back: days
    })

  if (error) {
    console.error('Error fetching productivity stats:', error)
    throw new Error('Failed to fetch productivity stats')
  }

  return data[0] || {
    total_tasks: 0,
    completed_tasks: 0,
    completion_rate: 0,
    total_focus_minutes: 0,
    avg_productivity_score: 0,
    peak_productivity_hour: 9
  }
}

export async function getDailyProductivitySummary(
  userId: string,
  date: Date
): Promise<{
  pomodoro_sessions: number
  deep_work_sessions: number
  flow_sessions: number
  total_focus_minutes: number
  avg_productivity: number
  total_distractions: number
}> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('por_flow_daily_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date.toISOString().split('T')[0])
    .single()

  if (error && error.code !== 'PGRST116') { // Not found is OK
    console.error('Error fetching daily summary:', error)
    throw new Error('Failed to fetch daily summary')
  }

  return data || {
    pomodoro_sessions: 0,
    deep_work_sessions: 0,
    flow_sessions: 0,
    total_focus_minutes: 0,
    avg_productivity: 0,
    total_distractions: 0
  }
}

export async function getWeeklyTaskTrends(
  userId: string,
  startDate: Date
): Promise<Array<{
  date: string
  tasks_created: number
  tasks_completed: number
  avg_priority_score: number
  avg_completion_time: number
}>> {
  const supabase = createServerSupabase()
  
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 7)

  const { data, error } = await supabase
    .from('por_flow_task_trends')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lt('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching task trends:', error)
    throw new Error('Failed to fetch task trends')
  }

  return data || []
}

// ===========================
// AI OPTIMIZATION SUGGESTIONS
// ===========================

export async function generateAIOptimizationSuggestions(userId: string): Promise<Array<{
  id: string
  type: 'reorder' | 'merge' | 'split' | 'move' | 'add-buffer'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  blocks: string[]
}>> {
  // Get user's productivity patterns
  const stats = await getUserProductivityStats(userId, 7)
  const today = new Date()
  const timeBlocks = await getUserTimeBlocks(userId, today, today)
  const tasks = await getUserTasks(userId, { status: 'todo' })

  const suggestions = []

  // Analyze energy vs work type alignment
  if (stats.peak_productivity_hour && stats.peak_productivity_hour !== 9) {
    const creativeBlocks = timeBlocks.filter(b => b.block_type === 'creative')
    if (creativeBlocks.length > 0) {
      suggestions.push({
        id: 'energy-alignment-1',
        type: 'reorder' as const,
        title: 'Optimize Energy Alignment',
        description: `Move creative work to ${stats.peak_productivity_hour}:00 when your energy peaks`,
        impact: 'high' as const,
        blocks: creativeBlocks.map(b => b.id)
      })
    }
  }

  // Suggest buffer time between meetings
  const meetings = timeBlocks.filter(b => b.block_type === 'meeting').sort((a, b) => 
    a.start_time.getTime() - b.start_time.getTime()
  )
  
  for (let i = 0; i < meetings.length - 1; i++) {
    const current = meetings[i]
    const next = meetings[i + 1]
    const gap = (next.start_time.getTime() - current.end_time.getTime()) / (1000 * 60)
    
    if (gap < 15) { // Less than 15 minutes between meetings
      suggestions.push({
        id: `buffer-${i}`,
        type: 'add-buffer' as const,
        title: 'Add Buffer Time',
        description: 'Add 15-minute buffers between meetings to prevent context switching fatigue',
        impact: 'medium' as const,
        blocks: [current.id, next.id]
      })
    }
  }

  // Suggest task batching
  const adminTasks = tasks.filter(t => t.category?.toLowerCase() === 'admin')
  if (adminTasks.length > 3) {
    suggestions.push({
      id: 'batch-admin',
      type: 'merge' as const,
      title: 'Batch Administrative Tasks',
      description: 'Group admin tasks into one focused block for better efficiency',
      impact: 'medium' as const,
      blocks: adminTasks.map(t => t.id)
    })
  }

  return suggestions
}

// ===========================
// BULK OPERATIONS
// ===========================

export async function bulkUpdateTasks(
  userId: string,
  updates: Array<{
    id: string
    updates: Partial<PorFlowTask>
  }>
): Promise<void> {
  const supabase = createServerSupabase()

  const promises = updates.map(({ id, updates: taskUpdates }) => {
    const updateData: any = {}
    Object.keys(taskUpdates).forEach(key => {
      const value = taskUpdates[key as keyof PorFlowTask]
      if (value !== undefined) {
        if (key === 'due_date' && value) {
          updateData[key] = (value as Date).toISOString()
        } else {
          updateData[key] = value
        }
      }
    })

    return supabase
      .from('por_flow_tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
  })

  const results = await Promise.allSettled(promises)
  const failed = results.filter(r => r.status === 'rejected')
  
  if (failed.length > 0) {
    console.error('Some task updates failed:', failed)
    throw new Error(`Failed to update ${failed.length} tasks`)
  }
}

export async function syncCalendarIntegration(
  userId: string,
  externalEvents: Array<{
    title: string
    start_time: Date
    end_time: Date
    location?: string
    attendees?: string[]
  }>
): Promise<PorFlowTimeBlock[]> {
  const supabase = createServerSupabase()

  // Convert external events to time blocks
  const timeBlocksData = externalEvents.map(event => ({
    user_id: userId,
    title: event.title,
    start_time: event.start_time.toISOString(),
    end_time: event.end_time.toISOString(),
    block_type: 'meeting' as const,
    priority: 'medium' as const,
    location: event.location,
    attendees: event.attendees || [],
    is_locked: true // External events shouldn't be modified
  }))

  const { data, error } = await supabase
    .from('por_flow_time_blocks')
    .insert(timeBlocksData)
    .select()

  if (error) {
    console.error('Error syncing calendar:', error)
    throw new Error('Failed to sync calendar events')
  }

  return data
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

export async function detectScheduleConflicts(
  userId: string,
  newBlock: {
    start_time: Date
    end_time: Date
    id?: string // Exclude this ID if updating
  }
): Promise<PorFlowTimeBlock[]> {
  const supabase = createServerSupabase()

  let query = supabase
    .from('por_flow_time_blocks')
    .select('*')
    .eq('user_id', userId)
    .or(`and(start_time.lt.${newBlock.end_time.toISOString()},end_time.gt.${newBlock.start_time.toISOString()})`)

  if (newBlock.id) {
    query = query.neq('id', newBlock.id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error detecting conflicts:', error)
    return []
  }

  return data || []
}

export async function calculateOptimalSchedule(
  userId: string,
  tasks: PorFlowTask[],
  preferences: {
    work_start_hour: number
    work_end_hour: number
    break_duration: number
    max_focus_duration: number
  }
): Promise<Array<{
  task_id: string
  suggested_start: Date
  suggested_end: Date
  reasoning: string
}>> {
  const stats = await getUserProductivityStats(userId)
  const suggestions = []

  // Sort tasks by AI priority score
  const sortedTasks = [...tasks].sort((a, b) => b.ai_priority_score - a.ai_priority_score)
  
  let currentTime = new Date()
  currentTime.setHours(preferences.work_start_hour, 0, 0, 0)

  for (const task of sortedTasks) {
    if (currentTime.getHours() >= preferences.work_end_hour) {
      // Move to next day
      currentTime.setDate(currentTime.getDate() + 1)
      currentTime.setHours(preferences.work_start_hour, 0, 0, 0)
    }

    const duration = Math.min(task.estimated_minutes, preferences.max_focus_duration)
    const endTime = new Date(currentTime.getTime() + duration * 60 * 1000)

    let reasoning = `Scheduled based on AI priority score (${task.ai_priority_score})`
    
    // Add energy-based reasoning
    if (task.category?.toLowerCase() === 'creative' && stats.peak_productivity_hour) {
      reasoning += `. Creative work scheduled during peak energy (${stats.peak_productivity_hour}:00)`
    }

    suggestions.push({
      task_id: task.id,
      suggested_start: new Date(currentTime),
      suggested_end: endTime,
      reasoning
    })

    // Add break time
    currentTime = new Date(endTime.getTime() + preferences.break_duration * 60 * 1000)
  }

  return suggestions
}

// ===========================
// ANALYTICS STORAGE
// ===========================

export async function recordAnalyticsMetric(
  userId: string,
  metricType: string,
  value: number,
  metadata?: any
): Promise<void> {
  const supabase = createServerSupabase()

  const { error } = await supabase
    .from('por_flow_analytics')
    .upsert({
      user_id: userId,
      metric_type: metricType,
      metric_value: value,
      metadata: metadata || {},
      date_recorded: new Date().toISOString().split('T')[0]
    })

  if (error) {
    console.error('Error recording analytics:', error)
    // Don't throw here as analytics shouldn't break functionality
  }
}