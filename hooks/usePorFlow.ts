// hooks/usePorFlow.ts
// React Hooks pentru PorFlow - RAPID Implementation

import { useState, useEffect } from 'react'
import type { PorFlowTask, PorFlowTimeBlock, PorFlowFocusSession } from '@/lib/database/porflow'

// ===========================
// TASKS HOOK
// ===========================

interface UsePorFlowTasksOptions {
  status?: string
  priority?: string
  category?: string
  due_within_days?: number
  auto_refresh?: boolean
}

export function usePorFlowTasks(options: UsePorFlowTasksOptions = {}) {
  const [tasks, setTasks] = useState<PorFlowTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const createTask = async (taskData: {
    title: string
    description?: string
    priority?: PorFlowTask['priority']
    category?: string
    estimated_minutes?: number
    due_date?: Date
    assignee?: string
    tags?: string[]
    dependencies?: string[]
  }) => {
    try {
      setError(null)
      const response = await fetch('/api/porflow/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          due_date: taskData.due_date?.toISOString()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task')
      }
      
      // Add to local state immediately
      setTasks(prev => [data.task, ...prev])
      return data.task
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: Partial<PorFlowTask>) => {
    try {
      setError(null)
      const response = await fetch(`/api/porflow/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          due_date: updates.due_date?.toISOString()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task')
      }
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? data.task : task
      ))
      return data.task
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/porflow/tasks/${taskId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete task')
      }
      
      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const moveTask = async (taskId: string, newStatus: PorFlowTask['status']) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Optimistically update UI
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ))

    try {
      await updateTask(taskId, { status: newStatus })
    } catch (err) {
      // Revert on error
      setTasks(prev => prev.map(t => 
        t.id === taskId ? task : t
      ))
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
    deleteTask,
    moveTask
  }
}

// ===========================
// TIME BLOCKS HOOK
// ===========================

export function usePorFlowTimeBlocks(date: Date = new Date()) {
  const [timeBlocks, setTimeBlocks] = useState<PorFlowTimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeBlocks = async (targetDate: Date = date) => {
    try {
      setLoading(true)
      setError(null)
      
      const startDate = new Date(targetDate)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(targetDate)
      endDate.setHours(23, 59, 59, 999)
      
      const response = await fetch(`/api/porflow/time-blocks?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch time blocks')
      }
      
      setTimeBlocks(data.timeBlocks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createTimeBlock = async (blockData: {
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
  }) => {
    try {
      setError(null)
      const response = await fetch('/api/porflow/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blockData,
          start_time: blockData.start_time.toISOString(),
          end_time: blockData.end_time.toISOString()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create time block')
      }
      
      setTimeBlocks(prev => [...prev, data.timeBlock])
      return data.timeBlock
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const updateTimeBlock = async (blockId: string, updates: Partial<PorFlowTimeBlock>) => {
    try {
      setError(null)
      const response = await fetch(`/api/porflow/time-blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          start_time: updates.start_time?.toISOString(),
          end_time: updates.end_time?.toISOString()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update time block')
      }
      
      setTimeBlocks(prev => prev.map(block => 
        block.id === blockId ? data.timeBlock : block
      ))
      return data.timeBlock
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const deleteTimeBlock = async (blockId: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/porflow/time-blocks/${blockId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete time block')
      }
      
      setTimeBlocks(prev => prev.filter(block => block.id !== blockId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  useEffect(() => {
    fetchTimeBlocks(date)
  }, [date.toDateString()])

  return {
    timeBlocks,
    loading,
    error,
    refetch: fetchTimeBlocks,
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock
  }
}

// ===========================
// FOCUS SESSIONS HOOK
// ===========================

export function usePorFlowFocusSession() {
  const [currentSession, setCurrentSession] = useState<PorFlowFocusSession | null>(null)
  const [sessions, setSessions] = useState<PorFlowFocusSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0) // seconds
  const [timerActive, setTimerActive] = useState(false)

  const fetchSessions = async (days = 30) => {
    try {
      setLoading(true)
      setError(null)
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

  const createSession = async (sessionData: {
    session_type: PorFlowFocusSession['session_type']
    planned_duration: number
    task_id?: string
    time_block_id?: string
    background_sound?: PorFlowFocusSession['background_sound']
  }) => {
    try {
      setError(null)
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
      setTimeRemaining(sessionData.planned_duration * 60) // Convert to seconds
      return data.session
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const updateSession = async (action: string, data: any = {}) => {
    if (!currentSession) return

    try {
      setError(null)
      const response = await fetch(`/api/porflow/focus-sessions/${currentSession.id}`, {
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
        setTimeRemaining(0)
        setTimerActive(false)
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

  // Timer functionality
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setTimerActive(false)
          // Auto-complete session when timer reaches 0
          if (currentSession) {
            updateSession('complete', {
              actual_duration: Math.round(currentSession.planned_duration),
              productivity_score: 8, // Default good score
              distractions_count: currentSession.distractions_count || 0
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timeRemaining, currentSession])

  // Session control methods
  const startSession = () => {
    if (currentSession) {
      setTimerActive(true)
      updateSession('start')
    }
  }

  const pauseSession = () => {
    setTimerActive(false)
    updateSession('pause')
  }

  const resumeSession = () => {
    setTimerActive(true)
    updateSession('resume')
  }

  const completeSession = (data: {
    productivity_score?: number
    distractions_count?: number
    session_notes?: string
  }) => {
    const actualMinutes = currentSession 
      ? Math.round((currentSession.planned_duration * 60 - timeRemaining) / 60)
      : 0
    
    updateSession('complete', {
      actual_duration: actualMinutes,
      ...data
    })
  }

  const cancelSession = () => {
    updateSession('cancel')
  }

  const addDistraction = () => {
    updateSession('add_distraction')
  }

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return {
    currentSession,
    sessions,
    loading,
    error,
    timeRemaining,
    timerActive,
    formattedTime: formatTime(timeRemaining),
    fetchSessions,
    createSession,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    addDistraction
  }
}

// ===========================
// ANALYTICS HOOK
// ===========================

export function usePorFlowAnalytics(days = 30) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/porflow/analytics?days=${days}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }
      
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [days])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

// ===========================
// COMBINED PORFLOW HOOK
// ===========================

export function usePorFlow() {
  const tasks = usePorFlowTasks({ auto_refresh: true })
  const timeBlocks = usePorFlowTimeBlocks()
  const focusSession = usePorFlowFocusSession()
  const analytics = usePorFlowAnalytics()

  return {
    tasks,
    timeBlocks,
    focusSession,
    analytics
  }
}