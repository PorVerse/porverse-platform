// components/por-flow/TaskManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { Plus, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  estimatedTime: number;
  actualTime?: number;
  category: string;
  deadline?: string;
  tags: string[];
  aiScore?: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface TaskManagerProps {
  className?: string;
}

export default function TaskManager({ className }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'aiScore'>('priority');
  
  const supabase = createClientSupabase();

  // Get current user
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, [supabase]);

  // Load tasks from Supabase
  useEffect(() => {
    const loadTasks = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('ecosystem', 'por-flow')
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        // Transform goals to tasks format
        const transformedTasks: Task[] = (data || []).map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description || undefined,
          priority: getPriorityFromGoal(goal),
          status: getStatusFromGoal(goal.status),
          estimatedTime: goal.target_value || 60,
          category: goal.goal_type,
          deadline: goal.target_date || undefined,
          tags: [],
          aiScore: Math.random() * 10, // Mock AI score for now
          user_id: goal.user_id,
          created_at: goal.created_at,
          updated_at: goal.created_at
        }));

        setTasks(transformedTasks);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [userId, supabase]);

  // Helper functions
  const getPriorityFromGoal = (goal: any): Task['priority'] => {
    if (goal.priority >= 8) return 'urgent';
    if (goal.priority >= 6) return 'high';
    if (goal.priority >= 4) return 'medium';
    return 'low';
  };

  const getStatusFromGoal = (status: string): Task['status'] => {
    switch (status) {
      case 'completed': return 'completed';
      case 'active': return 'in-progress';
      case 'paused': return 'review';
      default: return 'todo';
    }
  };

  // Save task to Supabase
  const saveTask = async (taskData: Partial<Task>) => {
    if (!userId) return;

    try {
      const goalData = {
        user_id: userId,
        ecosystem: 'por-flow' as const,
        goal_type: taskData.category || 'task',
        title: taskData.title!,
        description: taskData.description,
        target_value: taskData.estimatedTime,
        current_value: taskData.actualTime || 0,
        target_date: taskData.deadline,
        priority: getPriorityNumber(taskData.priority || 'medium'),
        status: getGoalStatus(taskData.status || 'todo')
      };

      const { data, error } = await supabase
        .from('user_goals')
        .insert([goalData])
        .select()
        .single();

      if (error) throw error;

      // Transform back to task format and add to state
      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        priority: getPriorityFromGoal(data),
        status: getStatusFromGoal(data.status),
        estimatedTime: data.target_value || 60,
        actualTime: data.current_value || undefined,
        category: data.goal_type,
        deadline: data.target_date || undefined,
        tags: [],
        aiScore: Math.random() * 10,
        user_id: data.user_id,
        created_at: data.created_at
      };

      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      console.error('Error saving task:', err);
      throw err;
    }
  };

  // Update task in Supabase
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const goalUpdates: any = {};
      
      if (updates.title) goalUpdates.title = updates.title;
      if (updates.description !== undefined) goalUpdates.description = updates.description;
      if (updates.estimatedTime) goalUpdates.target_value = updates.estimatedTime;
      if (updates.actualTime !== undefined) goalUpdates.current_value = updates.actualTime;
      if (updates.deadline !== undefined) goalUpdates.target_date = updates.deadline;
      if (updates.priority) goalUpdates.priority = getPriorityNumber(updates.priority);
      if (updates.status) {
        goalUpdates.status = getGoalStatus(updates.status);
        if (updates.status === 'completed') {
          goalUpdates.completed_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('user_goals')
        .update(goalUpdates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
          : task
      ));

      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  // Delete task from Supabase
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  // Helper functions for conversion
  const getPriorityNumber = (priority: Task['priority']): number => {
    switch (priority) {
      case 'urgent': return 10;
      case 'high': return 7;
      case 'medium': return 5;
      case 'low': return 2;
      default: return 5;
    }
  };

  const getGoalStatus = (status: Task['status']): string => {
    switch (status) {
      case 'completed': return 'completed';
      case 'in-progress': return 'active';
      case 'review': return 'paused';
      case 'todo': return 'active';
      default: return 'active';
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return getPriorityNumber(b.priority) - getPriorityNumber(a.priority);
      case 'deadline':
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'aiScore':
        return (b.aiScore || 0) - (a.aiScore || 0);
      default:
        return 0;
    }
  });

  // Get priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#06b6d4';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'review': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'todo': return <Circle className="w-5 h-5 text-gray-400" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className={`task-manager ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`task-manager ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading tasks</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-700 underline text-sm hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-manager ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Task Manager</h2>
        <button
          onClick={() => setShowAddTask(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'todo', 'in-progress', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-1 text-sm"
        >
          <option value="priority">Sort by Priority</option>
          <option value="deadline">Sort by Deadline</option>
          <option value="aiScore">Sort by AI Score</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No tasks found</h3>
            <p>Start by adding your first task to get organized!</p>
          </div>
        ) : (
          sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={updateTask}
              onDelete={deleteTask}
              getPriorityColor={getPriorityColor}
              getStatusIcon={getStatusIcon}
              formatTime={formatTime}
            />
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          onSave={saveTask}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  getPriorityColor: (priority: Task['priority']) => string;
  getStatusIcon: (status: Task['status']) => JSX.Element;
  formatTime: (minutes: number) => string;
}

function TaskCard({ 
  task, 
  onUpdate, 
  onDelete, 
  getPriorityColor, 
  getStatusIcon, 
  formatTime 
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: Task['status']) => {
    setLoading(true);
    try {
      await onUpdate(task.id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await onDelete(task.id);
      } catch (err) {
        console.error('Failed to delete task:', err);
        setLoading(false);
      }
    }
  };

  return (
    <div 
      className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
      style={{ borderLeftColor: getPriorityColor(task.priority), borderLeftWidth: '4px' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => handleStatusChange(
              task.status === 'completed' ? 'todo' : 'completed'
            )}
            disabled={loading}
            className="mt-1"
          >
            {getStatusIcon(task.status)}
          </button>
          
          <div className="flex-1">
            <h3 className={`font-medium ${
              task.status === 'completed' 
                ? 'line-through text-gray-500' 
                : 'text-white'
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-gray-400 text-sm mt-1">{task.description}</p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>⏱️ {formatTime(task.estimatedTime)}</span>
              <span>📁 {task.category}</span>
              {task.aiScore && (
                <span>🤖 AI: {task.aiScore.toFixed(1)}</span>
              )}
              {task.deadline && (
                <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Task Modal Component
interface AddTaskModalProps {
  onSave: (task: Partial<Task>) => Promise<Task>;
  onClose: () => void;
}

function AddTaskModal({ onSave, onClose }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    estimatedTime: 60,
    category: 'Work',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        deadline: formData.deadline || undefined
      });
      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Add New Task</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Enter task title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none h-20 resize-none"
              placeholder="Optional description..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  priority: e.target.value as Task['priority'] 
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Est. Time (min)
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  estimatedTime: parseInt(e.target.value) || 60 
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                min="5"
                step="5"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="e.g., Work, Personal, Learning..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Deadline (optional)
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-2 px-4 rounded-md font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}