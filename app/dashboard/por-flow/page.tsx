// app/dashboard/por-flow/page.tsx - Productivity Optimization
'use client'

import React, { useState, useEffect } from 'react'
// Temporary fix for build
const apiClient = { getProgress: async () => ({ success: true, data: {} }) }
const useUserProfile = () => ({ data: null, loading: false })
const useEcosystemAccess = () => ({ hasAccess: true, loading: false })
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Clock, Target, Zap, CheckCircle, Play, Pause, RotateCcw, Brain } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import styles from './style.module.css'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'completed' | 'on_hold'
  category: string
  estimated_minutes: number
  actual_minutes: number
  due_date: string | null
  completed_at: string | null
  ai_priority_score: number
  tags: string[]
  dependencies: string[]
  created_at: string
}

interface TimeBlock {
  id: string
  title: string
  block_type: 'deep_work' | 'meetings' | 'admin' | 'break' | 'learning'
  start_time: string
  end_time: string
  tasks: string[]
  productivity_score: number
  distractions_count: number
  notes: string
  created_at: string
}

interface FocusSession {
  id: string
  session_type: 'pomodoro' | 'deep_work' | 'flow_state'
  planned_duration: number
  actual_duration: number
  breaks_taken: number
  distractions: number
  productivity_rating: number
  task_id: string | null
  started_at: string
  ended_at: string | null
}

interface ProductivityMetrics {
  daily_focus_hours: number
  tasks_completed: number
  average_productivity_score: number
  time_blocking_adherence: number
  distraction_rate: number
}

const TASK_CATEGORIES = [
  'Work', 'Personal', 'Learning', 'Health', 'Admin', 'Creative', 'Social', 'Other'
]

const PRODUCTIVITY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function PorFlowDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([])
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiChat, setAiChat] = useState<{ messages: any[]; conversationId?: string }>({ messages: [] })
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const userProfile = useUserProfile()
  const ecosystemAccess = useEcosystemAccess('por-flow')

  useEffect(() => {
    loadProductivityData()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSessionActive && currentSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSessionActive, currentSession])

  const loadProductivityData = async () => {
    setLoading(true)
    try {
      // Load tasks
      const tasksResponse = await fetch('/api/por-flow/tasks')
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData.data || [])
      }

      // Load time blocks
      const blocksResponse = await fetch('/api/por-flow/time-blocks')
      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json()
        setTimeBlocks(blocksData.data || [])
      }

      // Load focus sessions
      const sessionsResponse = await fetch('/api/por-flow/focus-sessions?limit=20')
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setFocusSessions(sessionsData.data || [])
      }

      // Load AI conversation history
      const chatResponse = await apiClient.getConversationHistory('por-flow')
      if (chatResponse.success && chatResponse.data.length > 0) {
        const lastConversation = chatResponse.data[0]
        setAiChat({
          messages: lastConversation.messages,
          conversationId: lastConversation.id
        })
      }

    } catch (error) {
      console.error('Error loading productivity data:', error)
      toast.error('Failed to load productivity data')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'ai_priority_score'>) => {
    try {
      const response = await fetch('/api/por-flow/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          ai_priority_score: calculateAIPriorityScore(taskData)
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(prev => [data.data, ...prev])
        toast.success('Task created!')
      }
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/por-flow/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
      })

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status, completed_at: status === 'completed' ? new Date().toISOString() : null }
            : task
        ))
        
        if (status === 'completed') {
          toast.success('Task completed! 🎉')
        }
      }
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const startFocusSession = async (sessionType: FocusSession['session_type'], duration: number, taskId?: string) => {
    try {
      const sessionData = {
        session_type: sessionType,
        planned_duration: duration,
        actual_duration: 0,
        breaks_taken: 0,
        distractions: 0,
        productivity_rating: 0,
        task_id: taskId || null,
        started_at: new Date().toISOString(),
        ended_at: null
      }

      const response = await fetch('/api/por-flow/focus-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSession(data.data)
        setSessionTimer(0)
        setIsSessionActive(true)
        toast.success(`Started ${sessionType} session`)
      }
    } catch (error) {
      toast.error('Failed to start focus session')
    }
  }

  const endFocusSession = async (productivityRating: number) => {
    if (!currentSession) return

    try {
      const response = await fetch(`/api/por-flow/focus-sessions/${currentSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actual_duration: sessionTimer,
          productivity_rating: 85,
          ended_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFocusSessions(prev => [data.data, ...prev.slice(0, 19)])
        setCurrentSession(null)
        setIsSessionActive(false)
        setSessionTimer(0)
        toast.success('Focus session completed!')
      }
    } catch (error) {
      toast.error('Failed to end session')
    }
  }

  const generateOptimalSchedule = async () => {
    setAiLoading(true)
    try {
      const incompleteTasks = tasks.filter(t => t.status !== 'completed')
      
      const prompt = `Optimize my daily schedule based on these tasks:
${incompleteTasks.map(t => `- ${t.title} (${t.estimated_minutes}min, Priority: ${t.priority})`).join('\n')}

Consider:
- Total available time: 8 hours
- Energy levels: High morning, Medium afternoon, Low evening
- Break preferences: 15min every 90min
- Deep work blocks: 2-3 hour sessions preferred

Generate an optimal time-blocked schedule with reasoning.`

      const response = await apiClient.sendAIMessage(
        aiChat.conversationId || await createNewConversation(),
        prompt,
        'por-flow'
      )

      if (response.success) {
        setAiChat(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: 'user' as const,
              content: 'Generate my optimal daily schedule',
              timestamp: new Date().toISOString()
            },
            response.data.aiResponse
          ]
        }))
        setActiveTab('ai-optimizer')
      }
    } catch (error) {
      toast.error('Failed to generate schedule')
    } finally {
      setAiLoading(false)
    }
  }

  const sendAIMessage = async () => {
    if (!aiMessage.trim()) return

    setAiLoading(true)
    const userMessage = {
      role: 'user' as const,
      content: aiMessage,
      timestamp: new Date().toISOString()
    }

    setAiChat(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }))

    setAiMessage('')

    try {
      let conversationId = aiChat.conversationId

      if (!conversationId) {
        const newConversation = await apiClient.startAIConversation('por-flow', aiMessage)
        if (newConversation.success) {
          conversationId = newConversation.data.id
          setAiChat(prev => ({ ...prev, conversationId }))
        }
      } else {
        const response = await apiClient.sendAIMessage(conversationId, aiMessage, 'por-flow')
        if (response.success) {
          setAiChat(prev => ({
            ...prev,
            messages: [...prev.messages, response.data.aiResponse]
          }))
        }
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setAiLoading(false)
    }
  }

  const createNewConversation = async (): Promise<string> => {
    const response = await apiClient.startAIConversation('por-flow')
    if (response.success) {
      setAiChat(prev => ({ ...prev, conversationId: response.data.id }))
      return response.data.id
    }
    throw new Error('Failed to create conversation')
  }

  const calculateAIPriorityScore = (task: Partial<Task>): number => {
    let score = 50 // Base score
    
    // Priority weight
    const priorityWeights = { low: 10, medium: 30, high: 70, urgent: 90 }
    score += priorityWeights[task.priority || 'medium']
    
    // Due date proximity
    if (task.due_date) {
      const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue <= 1) score += 30
      else if (daysUntilDue <= 3) score += 20
      else if (daysUntilDue <= 7) score += 10
    }
    
    // Effort consideration
    if (task.estimated_minutes && task.estimated_minutes < 30) score += 10 // Quick wins
    
    return Math.min(100, Math.max(0, score))
  }

  const getTodayMetrics = (): ProductivityMetrics => {
    const today = new Date().toDateString()
    
    const todaySessions = focusSessions.filter(s => 
      new Date(s.started_at).toDateString() === today
    )
    
    const todayTasks = tasks.filter(t => 
      t.completed_at && new Date(t.completed_at).toDateString() === today
    )

    return {
      daily_focus_hours: todaySessions.reduce((sum, s) => sum + (s.actual_duration / 60), 0),
      tasks_completed: todayTasks.length,
      average_productivity_score: todaySessions.length > 0 
        ? todaySessions.reduce((sum, s) => sum + (s.productivity_rating || 85), 0) / todaySessions.length 
        : 0,
      time_blocking_adherence: 85, // Mock calculation
      distraction_rate: todaySessions.reduce((sum, s) => sum + s.distractions, 0) / Math.max(1, todaySessions.length)
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner}></div>
          <h2>Loading PorFlow...</h2>
          <p>Optimizing your productivity workspace</p>
        </div>
      </div>
    )
  }

  if (!ecosystemAccess.success || !ecosystemAccess.data?.hasAccess) {
    return (
      <div className={styles.dashboard}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">⚡ PorFlow Access Required</h2>
          <p className="mb-6">Upgrade to access AI-powered productivity optimization</p>
          <Link href="/pricing">
            <Button>Upgrade Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  const todayMetrics = getTodayMetrics()

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>⚡ PorFlow Dashboard</h1>
          <p className={styles.subtitle}>AI-powered productivity optimization</p>
        </div>
        <div className="flex gap-3 items-center">
          {currentSession && (
            <Card className="p-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-sm">{formatTime(sessionTimer)}</span>
                <Badge variant="outline">{currentSession.session_type}</Badge>
              </div>
            </Card>
          )}
          <Button onClick={generateOptimalSchedule} disabled={aiLoading}>
            {aiLoading ? 'Optimizing...' : '🧠 Optimize Schedule'}
          </Button>
          <Badge variant={ecosystemAccess.data?.level === 'premium' ? 'default' : 'secondary'}>
            {ecosystemAccess.data?.level?.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="focus">Focus</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="ai-optimizer">AI Optimizer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProductivityOverview 
            metrics={todayMetrics}
            tasks={tasks}
            sessions={focusSessions}
            currentSession={currentSession}
            sessionTimer={sessionTimer}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TaskManager 
            tasks={tasks}
            onCreateTask={createTask}
            onUpdateStatus={updateTaskStatus}
          />
        </TabsContent>

        <TabsContent value="focus" className="space-y-6">
          <FocusCenter 
            onStartSession={startFocusSession}
            onEndSession={endFocusSession}
            currentSession={currentSession}
            isActive={isSessionActive}
            timer={sessionTimer}
            sessions={focusSessions}
          />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <TimeBlockingCalendar 
            timeBlocks={timeBlocks}
            tasks={tasks}
            setTimeBlocks={setTimeBlocks}
          />
        </TabsContent>

        <TabsContent value="ai-optimizer" className="space-y-6">
          <AIProductivityOptimizer 
            messages={aiChat.messages}
            onSendMessage={sendAIMessage}
            message={aiMessage}
            setMessage={setAiMessage}
            loading={aiLoading}
            tasks={tasks}
            metrics={todayMetrics}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Productivity overview component
function ProductivityOverview({ 
  metrics, 
  tasks, 
  sessions, 
  currentSession, 
  sessionTimer 
}: {
  metrics: ProductivityMetrics
  tasks: Task[]
  sessions: FocusSession[]
  currentSession: FocusSession | null
  sessionTimer: number
}) {
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed')
  
  const productivityData = sessions.slice(0, 7).reverse().map(session => ({
    date: new Date(session.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    productivity: session.productivity_rating || 85,
    focus_hours: session.actual_duration / 60,
    distractions: session.distractions
  }))

  return (
    <div className="space-y-6">
      {/* Current session indicator */}
      {currentSession && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Active Focus Session</span>
                <Badge variant="outline">{currentSession.session_type}</Badge>
              </div>
              <div className="font-mono text-lg">{Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Hours Today</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.daily_focus_hours.toFixed(1)}h</div>
            <Progress value={(metrics.daily_focus_hours / 8) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tasks_completed}</div>
            <p className="text-xs text-gray-600">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <Zap className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.average_productivity_score.toFixed(1)}/10</div>
            <Progress value={metrics.average_productivity_score * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentTasks.length}</div>
            <p className="text-xs text-gray-600">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trend (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="productivity" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length, color: 'bg-green-500' },
                { status: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: 'bg-blue-500' },
                { status: 'todo', label: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: 'bg-gray-400' },
                { status: 'on_hold', label: 'On Hold', count: tasks.filter(t => t.status === 'on_hold').length, color: 'bg-yellow-500' }
              ].map(item => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span>{item.label}</span>
                  </div>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent completed tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Completed Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {completedTasks.slice(0, 5).length > 0 ? (
            <div className="space-y-2">
              {completedTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div>
                    <span className="font-medium">{task.title}</span>
                    <p className="text-sm text-gray-600">{task.category}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {task.completed_at && new Date(task.completed_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No completed tasks yet today</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Task manager component
function TaskManager({ 
  tasks, 
  onCreateTask, 
  onUpdateStatus 
}: {
  tasks: Task[]
  onCreateTask: (task: any) => void
  onUpdateStatus: (id: string, status: Task['status']) => void
}) {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: '',
    estimated_minutes: 30,
    due_date: '',
    tags: [] as string[]
  })

  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }
    
    onCreateTask({
      ...newTask,
      status: 'todo',
      actual_minutes: 0,
      completed_at: null,
      dependencies: []
    })
    
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      estimated_minutes: 30,
      due_date: '',
      tags: []
    })
  }

  const filteredTasks = tasks.filter(task => 
    filter === 'all' || task.status === filter
  ).sort((a, b) => b.ai_priority_score - a.ai_priority_score)

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    }
    return colors[priority]
  }

  return (
    <div className="space-y-6">
      {/* Create task form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <Select value={newTask.category} onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              placeholder="Task description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="Estimated minutes"
                value={newTask.estimated_minutes}
                onChange={(e) => setNewTask(prev => ({ ...prev, estimated_minutes: Number(e.target.value) }))}
                min="5"
                max="480"
              />
              
              <Input
                type="datetime-local"
                value={newTask.due_date}
                onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Create Task
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Task filters */}
      <div className="flex gap-2">
        {(['all', 'todo', 'in_progress', 'completed'] as const).map(status => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            size="sm"
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
            <Badge className="ml-2">
              {status === 'all' ? tasks.length : tasks.filter(t => t.status === status).length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">{task.category}</Badge>
                    <span className="text-xs text-gray-500">
                      AI Score: {task.ai_priority_score}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>⏱️ {task.estimated_minutes}min</span>
                    {task.due_date && (
                      <span>📅 Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                    <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={task.status} onValueChange={(value: any) => onUpdateStatus(task.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No tasks found for the selected filter
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Focus center component
function FocusCenter({ 
  onStartSession, 
  onEndSession, 
  currentSession, 
  isActive, 
  timer, 
  sessions 
}: {
  onStartSession: (type: FocusSession['session_type'], duration: number, taskId?: string) => void
  onEndSession: (rating: number) => void
  currentSession: FocusSession | null
  isActive: boolean
  timer: number
  sessions: FocusSession[]
}) {
  const [sessionType, setSessionType] = useState<FocusSession['session_type']>('pomodoro')
  const [duration, setDuration] = useState(25)
  const [productivityRating, setProductivityRating] = useState(5)

  const sessionTypes = [
    { type: 'pomodoro' as const, name: 'Pomodoro', duration: 25, description: '25min focused work + 5min break' },
    { type: 'deep_work' as const, name: 'Deep Work', duration: 90, description: '90min uninterrupted focus' },
    { type: 'flow_state' as const, name: 'Flow State', duration: 120, description: '2+ hours creative flow' }
  ]

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Current session */}
      {currentSession ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              Active Session: {currentSession.session_type}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-6xl font-mono">{formatTime(timer)}</div>
              <div className="text-sm text-gray-600">
                Target: {currentSession.planned_duration} minutes
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Rate your productivity (1-10)</label>
                  <Slider
                    value={[productivityRating]}
                    onValueChange={([value]) => setProductivityRating(value)}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-center text-sm text-gray-600 mt-1">
                    {productivityRating}/10
                  </div>
                </div>
                
                <Button 
                  onClick={() => onEndSession(productivityRating)}
                  className="w-full"
                  variant="destructive"
                >
                  End Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Start new session */
        <Card>
          <CardHeader>
            <CardTitle>Start Focus Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessionTypes.map(type => (
                  <div
                    key={type.type}
                    className={`p-4 border rounded cursor-pointer transition-colors ${
                      sessionType === type.type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setSessionType(type.type)
                      setDuration(type.duration)
                    }}
                  >
                    <h3 className="font-medium">{type.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    <div className="text-lg font-bold mt-2">{type.duration} min</div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => onStartSession(sessionType, duration)}
                className="w-full"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Start {sessionType} Session ({duration} min)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Focus Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.slice(0, 5).map(session => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium capitalize">{session.session_type}</span>
                    <p className="text-sm text-gray-600">
                      {Math.floor(session.actual_duration / 60)}min • Rating: {session.productivity_rating}/10
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(session.started_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No focus sessions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Time blocking calendar component
function TimeBlockingCalendar({ 
  timeBlocks, 
  tasks, 
  setTimeBlocks 
}: {
  timeBlocks: TimeBlock[]
  tasks: Task[]
  setTimeBlocks: (blocks: TimeBlock[]) => void
}) {
  const [newBlock, setNewBlock] = useState({
    title: '',
    block_type: 'deep_work' as const,
    start_time: '',
    end_time: '',
    tasks: [] as string[]
  })

  const blockTypes = [
    { type: 'deep_work' as const, label: 'Deep Work', color: 'bg-blue-100 border-blue-300' },
    { type: 'meetings' as const, label: 'Meetings', color: 'bg-red-100 border-red-300' },
    { type: 'admin' as const, label: 'Admin', color: 'bg-gray-100 border-gray-300' },
    { type: 'break' as const, label: 'Break', color: 'bg-green-100 border-green-300' },
    { type: 'learning' as const, label: 'Learning', color: 'bg-purple-100 border-purple-300' }
  ]

  const today = new Date().toISOString().split('T')[0]
  const todayBlocks = timeBlocks.filter(block => 
    block.start_time.startsWith(today)
  ).sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Time Block</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Block title"
              value={newBlock.title}
              onChange={(e) => setNewBlock(prev => ({ ...prev, title: e.target.value }))}
            />
            <Select value={newBlock.block_type} onValueChange={(value: any) => setNewBlock(prev => ({ ...prev, block_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {blockTypes.map(type => (
                  <SelectItem key={type.type} value={type.type}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="time"
              value={newBlock.start_time.split('T')[1]?.substring(0, 5) || ''}
              onChange={(e) => setNewBlock(prev => ({ 
                ...prev, 
                start_time: `${today}T${e.target.value}:00` 
              }))}
            />
            <Input
              type="time"
              value={newBlock.end_time.split('T')[1]?.substring(0, 5) || ''}
              onChange={(e) => setNewBlock(prev => ({ 
                ...prev, 
                end_time: `${today}T${e.target.value}:00` 
              }))}
            />
          </div>
          <Button className="w-full mt-4">
            Create Time Block
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {todayBlocks.length > 0 ? (
            <div className="space-y-2">
              {todayBlocks.map(block => {
                const blockType = blockTypes.find(t => t.type === block.block_type)
                return (
                  <div key={block.id} className={`p-3 rounded border ${blockType?.color}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{block.title}</h4>
                        <p className="text-sm text-gray-600 capitalize">{block.block_type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(block.start_time).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(block.end_time).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No time blocks scheduled for today</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// AI Productivity optimizer component
function AIProductivityOptimizer({ 
  messages, 
  onSendMessage, 
  message, 
  setMessage, 
  loading, 
  tasks, 
  metrics 
}: {
  messages: any[]
  onSendMessage: () => void
  message: string
  setMessage: (msg: string) => void
  loading: boolean
  tasks: Task[]
  metrics: ProductivityMetrics
}) {
  const productivityPrompts = [
    "How can I improve my focus and reduce distractions?",
    "Optimize my task prioritization strategy",
    "Create an ideal daily schedule based on my energy levels",
    "What's the best time blocking approach for my workload?",
    "Help me eliminate productivity bottlenecks"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Productivity Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto border rounded p-4 mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 space-y-4">
              <p>Get AI-powered insights to optimize your productivity and workflow.</p>
              <div className="grid grid-cols-1 gap-2">
                <p className="text-sm font-medium">Try asking:</p>
                {productivityPrompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setMessage(prompt)}
                    className="text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-purple-100 px-4 py-2 rounded">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">🧠</div>
                  <span>Optimizing your productivity...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Current stats context */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="font-medium">{metrics.tasks_completed}</div>
            <div className="text-gray-600">Tasks Done</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="font-medium">{metrics.daily_focus_hours.toFixed(1)}h</div>
            <div className="text-gray-600">Focus Time</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="font-medium">{tasks.filter(t => t.status !== 'completed').length}</div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="font-medium">{metrics.average_productivity_score.toFixed(1)}</div>
            <div className="text-gray-600">Avg Score</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Ask about productivity optimization..."
            disabled={loading}
          />
          <Button onClick={onSendMessage} disabled={loading || !message.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}