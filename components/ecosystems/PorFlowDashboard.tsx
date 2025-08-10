// @ts-nocheck
// ========================================
// 5. PORFLOW ECOSYSTEM - COMPLETE
// ========================================

// components/ecosystems/PorFlowDashboard.tsx
'use client'

import React, { useState } from 'react'
import { apiClient, useAPICall } from '@/lib/api/api-client-complete'
import { Calendar, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed'
  category: string
  estimatedMinutes: number
  dueDate?: string
  tags: string[]
}

export function PorFlowDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'focus' | 'analytics'>('overview')
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'work',
    estimatedMinutes: 30,
    dueDate: '',
    tags: [] as string[]
  })

  // Fetch tasks
  const { data: tasks, loading: tasksLoading, refetch: refetchTasks } = useAPICall(() => 
    apiClient.getTasks()
  )

  const createTask = async () => {
    if (!newTask.title) return

    const response = await apiClient.createTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      estimatedMinutes: newTask.estimatedMinutes,
      dueDate: newTask.dueDate || undefined,
      tags: newTask.tags
    })

    if (response.success) {
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: 'work',
        estimatedMinutes: 30,
        dueDate: '',
        tags: []
      })
      setIsCreatingTask(false)
      refetchTasks()
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    const response = await apiClient.updateTask(taskId, { status })
    if (response.success) {
      refetchTasks()
    }
  }

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Productivity Stats */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Today's Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">3.2h</div>
          <div className="text-xs text-green-600">Deep work time</div>
          <Progress value={80} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Tasks Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">7/12</div>
          <div className="text-xs text-blue-600">Today's goal</div>
          <Progress value={58} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Productivity Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">85%</div>
          <div className="text-xs text-purple-600">↗️ +5% vs yesterday</div>
          <Progress value={85} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">Focus Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">12</div>
          <div className="text-xs text-orange-600">Days in a row</div>
          <Progress value={100} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>📅 Today's Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '09:00', task: 'Morning Planning', status: 'completed', color: 'green' },
              { time: '09:30', task: 'Email Review', status: 'completed', color: 'green' },
              { time: '10:00', task: 'Project Development', status: 'in_progress', color: 'blue' },
              { time: '12:00', task: 'Team Meeting', status: 'pending', color: 'gray' },
              { time: '14:00', task: 'Deep Work Block', status: 'pending', color: 'gray' },
              { time: '16:00', task: 'Client Calls', status: 'pending', color: 'gray' }
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="text-sm font-mono text-gray-600 w-12">{item.time}</div>
                <div 
                  className={`w-2 h-2 rounded-full ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                    'bg-gray-300'
                  }`}
                />
                <div className="flex-1">
                  <div className={`text-sm ${
                    item.status === 'completed' ? 'line-through text-gray-500' :
                    item.status === 'in_progress' ? 'font-medium' :
                    'text-gray-700'
                  }`}>
                    {item.task}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setIsCreatingTask(true)}
              className="h-20 flex-col"
            >
              <span className="text-lg mb-1">➕</span>
              <span className="text-xs">Add Task</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-lg mb-1">🎯</span>
              <span className="text-xs">Start Focus</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-lg mb-1">🧠</span>
              <span className="text-xs">AI Optimize</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-lg mb-1">📊</span>
              <span className="text-xs">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const TasksTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">📋 Task Management</h2>
        <Button onClick={() => setIsCreatingTask(true)}>
          ➕ Add New Task
        </Button>
      </div>

      {/* Task Creation Modal */}
      {isCreatingTask && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task details..."
                  className="w-full px-3 py-2 border rounded-lg h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select 
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select 
                  value={newTask.category}
                  onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="work">💼 Work</option>
                  <option value="personal">🏠 Personal</option>
                  <option value="health">💪 Health</option>
                  <option value="learning">📚 Learning</option>
                  <option value="finance">💰 Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estimated Time (minutes)</label>
                <input
                  type="number"
                  value={newTask.estimatedMinutes}
                  onChange={(e) => setNewTask(prev => ({ ...prev, estimatedMinutes: Number(e.target.value) }))}
                  min="5"
                  max="480"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreatingTask(false)}>
                Cancel
              </Button>
              <Button onClick={createTask}>Create Task</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: 'To Do', status: 'todo', color: 'gray' },
          { title: 'In Progress', status: 'in_progress', color: 'blue' },
          { title: 'Completed', status: 'completed', color: 'green' }
        ].map((column) => (
          <Card key={column.status}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{column.title}</span>
                <Badge variant="secondary">
                  {tasks?.filter((t: Task) => t.status === column.status).length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks?.filter((task: Task) => task.status === column.status).map((task: Task) => (
                  <div
                    key={task.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      const nextStatus = 
                        task.status === 'todo' ? 'in_progress' :
                        task.status === 'in_progress' ? 'completed' : 'todo'
                      updateTaskStatus(task.id, nextStatus)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedMinutes}m</span>
                      </span>
                      <span>{task.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">PorFlow Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Export Tasks</Button>
          <Button>Start Focus Session</Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: '🏠' },
          { id: 'tasks', label: 'Tasks', icon: '📋' },
          { id: 'focus', label: 'Focus Timer', icon: '🎯' },
          { id: 'analytics', label: 'Analytics', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'tasks' && <TasksTab />}
      {activeTab === 'focus' && <div>Focus timer interface here...</div>}
      {activeTab === 'analytics' && <div>Productivity analytics here...</div>}
    </div>
  )
}