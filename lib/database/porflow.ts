// lib/database/porflow.ts
// PorFlow Database Operations - RAPID Implementation

import { createServerSupabase } from '@/lib/supabase'

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

// ===========================
// AI PRIORITY CALCULATION
// ===========================

export function calculateAIPriorityScore(task: {
  priority: PorFlowTask['priority']
  due_date?: Date
  estimated_minutes: number
  category?: string
}): number {
  let score = 5.0;

  // Priority weight
  const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
  score += priorityWeights[task.priority];

  // Due date proximity
  if (task.due_date) {
    const daysUntilDue = (task.due_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDue < 1) score += 2;
    else if (daysUntilDue < 3) score += 1.5;
    else if (daysUntilDue < 7) score += 1;
  }

  // Category importance
  const categoryWeights: Record<string, number> = {
    'Development': 1.5,
    'Security': 2,
    'Marketing': 1.2,
    'Management': 0.8
  };
  score += categoryWeights[task.category || 'Development'] || 1;

  // Estimated effort vs impact
  const estimatedHours = task.estimated_minutes / 60;
  if (estimatedHours < 1) score += 0.5; // Quick wins
  if (estimatedHours > 4) score -= 0.3; // Large tasks

  return Math.min(Math.max(score, 1), 10);
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

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)
  if (filters?.category) query = query.eq('category', filters.category)
  
  if (filters?.due_within_days) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + filters.due_within_days)
    query = query.lte('due_date', futureDate.toISOString())
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch tasks: ${error.message}`)
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

  // Calculate AI priority score
  const aiScore = calculateAIPriorityScore({
    priority: taskData.priority || 'medium',
    due_date: taskData.due_date,
    estimated_minutes: taskData.estimated_minutes || 60,
    category: taskData.category
  });

  const { data, error } = await supabase
    .from('por_flow_tasks')
    .insert([{
      ...taskData,
      priority: taskData.priority || 'medium',
      estimated_minutes: taskData.estimated_minutes || 60,
      tags: taskData.tags || [],
      dependencies: taskData.dependencies || [],
      ai_priority_score: aiScore,
      due_date: taskData.due_date?.toISOString()
    }])
    .select()
    .single()

  if (error) throw new Error(`Failed to create task: ${error.message}`)
  return data
}

export async function updateTask(
  taskId: string,
  userId: string,
  updates: Partial<PorFlowTask>
): Promise<PorFlowTask> {
  const supabase = createServerSupabase()

  const updateData: any = { ...updates }
  
  // Recalculate AI score if relevant fields changed
  if (updates.priority || updates.due_date || updates.estimated_minutes || updates.category) {
    const currentTask = await supabase
      .from('por_flow_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()
    
    if (currentTask.data) {
      updateData.ai_priority_score = calculateAIPriorityScore({
        priority: updates.priority || currentTask.data.priority,
        due_date: updates.due_date || (currentTask.data.due_date ? new Date(currentTask.data.due_date) : undefined),
        estimated_minutes: updates.estimated_minutes || currentTask.data.estimated_minutes,
        category: updates.category || currentTask.data.category
      });
    }
  }

  if (updateData.due_date) {
    updateData.due_date = updateData.due_date.toISOString()
  }

  const { data, error } = await supabase
    .from('por_flow_tasks')
    .update(updateData)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update task: ${error.message}`)
  return data
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const supabase = createServerSupabase()
  
  const { error } = await supabase
    .from('por_flow_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to delete task: ${error.message}`)
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

  if (error) throw new Error(`Failed to fetch time blocks: ${error.message}`)
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
      ...blockData,
      block_type: blockData.block_type || 'focus',
      priority: blockData.priority || 'medium',
      attendees: blockData.attendees || [],
      task_ids: blockData.task_ids || [],
      start_time: blockData.start_time.toISOString(),
      end_time: blockData.end_time.toISOString()
    }])
    .select()
    .single()

  if (error) throw new Error(`Failed to create time block: ${error.message}`)
  return data
}

export async function updateTimeBlock(
  blockId: string,
  userId: string,
  updates: Partial<PorFlowTimeBlock>
): Promise<PorFlowTimeBlock> {
  const supabase = createServerSupabase()

  const updateData: any = { ...updates }
  if (updateData.start_time) updateData.start_time = updateData.start_time.toISOString()
  if (updateData.end_time) updateData.end_time = updateData.end_time.toISOString()

  const { data, error } = await supabase
    .from('por_flow_time_blocks')
    .update(updateData)
    .eq('id', blockId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update time block: ${error.message}`)
  return data
}

export async function deleteTimeBlock(blockId: string, userId: string): Promise<void> {
  const supabase = createServerSupabase()

  const { error } = await supabase
    .from('por_flow_time_blocks')
    .delete()
    .eq('id', blockId)
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to delete time block: ${error.message}`)
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

  if (error) throw new Error(`Failed to fetch focus sessions: ${error.message}`)
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
      ...sessionData,
      background_sound: sessionData.background_sound || 'none',
      status: 'planned'
    }])
    .select()
    .single()

  if (error) throw new Error(`Failed to create focus session: ${error.message}`)
  return data
}

export async function updateFocusSession(
  sessionId: string,
  userId: string,
  updates: Partial<PorFlowFocusSession>
): Promise<PorFlowFocusSession> {
  const supabase = createServerSupabase()

  const updateData: any = { ...updates }
  if (updateData.start_time) updateData.start_time = updateData.start_time.toISOString()
  if (updateData.end_time) updateData.end_time = updateData.end_time.toISOString()

  const { data, error } = await supabase
    .from('por_flow_focus_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update focus session: ${error.message}`)
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
      productivity_score: sessionData.productivity_score || calculateProductivityScore(sessionData),
      distractions_count: sessionData.distractions_count || 0,
      session_notes: sessionData.session_notes
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(`Failed to complete focus session: ${error.message}`)
  return data
}

// ===========================
// ANALYTICS & INSIGHTS
// ===========================

export async function getUserProductivityStats(userId: string, days: number = 30) {
  const supabase = createServerSupabase()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get task stats
  const { data: taskStats } = await supabase
    .from('por_flow_tasks')
    .select('status, actual_minutes, estimated_minutes')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  // Get focus session stats
  const { data: sessionStats } = await supabase
    .from('por_flow_focus_sessions')
    .select('actual_duration, productivity_score, distractions_count, start_time')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())

  const totalTasks = taskStats?.length || 0
  const completedTasks = taskStats?.filter(t => t.status === 'completed').length || 0
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  
  const totalFocusMinutes = sessionStats?.reduce((sum, s) => sum + (s.actual_duration || 0), 0) || 0
  const avgProductivityScore = sessionStats?.length > 0 
    ? sessionStats.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / sessionStats.length 
    : 0

  // Calculate peak productivity hour
  const hourlyProductivity: Record<number, number[]> = {}
  sessionStats?.forEach(s => {
    if (s.start_time && s.productivity_score) {
      const hour = new Date(s.start_time).getHours()
      if (!hourlyProductivity[hour]) hourlyProductivity[hour] = []
      hourlyProductivity[hour].push(s.productivity_score)
    }
  })

  let peakHour = 9
  let peakScore = 0
  Object.entries(hourlyProductivity).forEach(([hour, scores]) => {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    if (avgScore > peakScore) {
      peakScore = avgScore
      peakHour = parseInt(hour)
    }
  })

  return {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    completion_rate: Math.round(completionRate * 100) / 100,
    total_focus_minutes: totalFocusMinutes,
    avg_productivity_score: Math.round(avgProductivityScore * 100) / 100,
    peak_productivity_hour: peakHour
  }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function calculateProductivityScore(sessionData: {
  actual_duration: number
  distractions_count?: number
}): number {
  let score = 8.0 // Base score
  
  // Deduct for distractions
  score -= (sessionData.distractions_count || 0) * 0.5
  
  // Bonus for longer sessions (shows focus)
  if (sessionData.actual_duration >= 90) score += 1
  if (sessionData.actual_duration >= 120) score += 0.5
  
  return Math.min(Math.max(score, 1), 10)
}

export async function detectScheduleConflicts(
  userId: string,
  newBlock: {
    start_time: Date
    end_time: Date
    id?: string
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

  const { data } = await query
  return data || []
}