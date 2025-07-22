// app/dashboard/por-flow/page.tsx - VERSIUNEA ACTUALIZATĂ COMPLETĂ
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase';
import TaskManager from '@/components/por-flow/TaskManager';
import FocusTimer from '@/components/por-flow/FocusTimer';
import TimePlanner from '@/components/por-flow/TimePlanner';
import WorkflowAutomation from '@/components/por-flow/WorkflowAutomation';
import styles from './style.module.css';

// Types
interface ProductivityMetrics {
  todayTasks: number;
  completedTasks: number;
  focusTime: number;
  productivityScore: number;
  streakDays: number;
  automatedActions: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  gradient: string;
}

export default function PorFlowDashboard() {
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'timer' | 'planner' | 'automation'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ProductivityMetrics>({
    todayTasks: 0,
    completedTasks: 0,
    focusTime: 0,
    productivityScore: 0,
    streakDays: 0,
    automatedActions: 0
  });
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClientSupabase();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, [supabase]);

  // Load dashboard metrics
  useEffect(() => {
    const loadMetrics = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);

        // Load today's tasks
        const today = new Date().toISOString().split('T')[0];
        const { data: tasksData } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('ecosystem', 'por-flow')
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59');

        // Load focus sessions
        const { data: focusData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('ecosystem', 'por-flow')
          .eq('progress_type', 'focus_session')
          .gte('created_at', today + 'T00:00:00');

        // Load workflows
        const { data: workflowData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('ecosystem', 'por-flow')
          .eq('progress_type', 'workflow');

        // Calculate metrics
        const todayTasks = tasksData?.length || 0;
        const completedTasks = tasksData?.filter(t => t.status === 'completed').length || 0;
        const totalFocusMinutes = focusData?.reduce((sum, session) => {
          return sum + (session.progress_data?.actual_duration || 0);
        }, 0) || 0;
        const productivityScore = completedTasks > 0 ? Math.round((completedTasks / todayTasks) * 100) : 0;
        const automatedActions = workflowData?.reduce((sum, workflow) => {
          return sum + (workflow.progress_data?.runs_count || 0);
        }, 0) || 0;

        setMetrics({
          todayTasks,
          completedTasks,
          focusTime: Math.round(totalFocusMinutes / 60 * 10) / 10,
          productivityScore,
          streakDays: 7, // Mock - calculate from streak
          automatedActions
        });
      } catch (err) {
        console.error('Error loading metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [userId, supabase]);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'add-task',
      title: 'Quick Task',
      description: 'Add a task for today',
      icon: '⚡',
      action: () => setActiveView('tasks'),
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'start-focus',
      title: 'Focus Session',
      description: 'Start a pomodoro session',
      icon: '🧠',
      action: () => setActiveView('timer'),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'plan-day',
      title: 'Plan Day',
      description: 'Schedule time blocks',
      icon: '📅',
      action: () => setActiveView('planner'),
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'automate',
      title: 'Automation',
      description: 'Create workflow',
      icon: '🤖',
      action: () => setActiveView('automation'),
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  // AI Insights (mock data for now)
  const aiInsights = [
    {
      id: '1',
      type: 'recommendation',
      message: 'Your productivity peaks at 10 AM. Schedule important tasks then!',
      confidence: 0.87
    },
    {
      id: '2',
      type: 'pattern',
      message: 'You complete 23% more tasks when you start with a focus session.',
      confidence: 0.91
    },
    {
      id: '3',
      type: 'automation',
      message: 'Consider automating your daily standup preparation.',
      confidence: 0.76
    }
  ];

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner}></div>
          <h2>Optimizing Your Flow...</h2>
          <p>Loading productivity insights</p>
        </div>
      </div>
    );
  }

  // Render specific views
  if (activeView === 'tasks') {
    return (
      <div className={styles.dashboard}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Task Management</h1>
        </div>
        <TaskManager className="w-full" />
      </div>
    );
  }

  if (activeView === 'timer') {
    return (
      <div className={styles.dashboard}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Focus Timer</h1>
        </div>
        <FocusTimer className="w-full" />
      </div>
    );
  }

  if (activeView === 'planner') {
    return (
      <div className={styles.dashboard}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Time Planner</h1>
        </div>
        <TimePlanner className="w-full" />
      </div>
    );
  }

  if (activeView === 'automation') {
    return (
      <div className={styles.dashboard}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Workflow Automation</h1>
        </div>
        <WorkflowAutomation className="w-full" />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🌊 PorFlow Dashboard
          </h1>
          <p className="text-xl text-cyan-300">
            Your Productivity Command Center
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {new Date().toLocaleDateString('ro-RO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </div>
          <div className="text-cyan-300">
            {new Date().toLocaleTimeString('ro-RO', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{metrics.todayTasks}</div>
          <div className="text-sm text-gray-300">Today's Tasks</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{metrics.completedTasks}</div>
          <div className="text-sm text-gray-300">Completed</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{metrics.focusTime}h</div>
          <div className="text-sm text-gray-300">Focus Time</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{metrics.productivityScore}%</div>
          <div className="text-sm text-gray-300">Productivity</div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-400">{metrics.streakDays}</div>
          <div className="text-sm text-gray-300">Day Streak</div>
        </div>
        
        <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-rose-400">{metrics.automatedActions}</div>
          <div className="text-sm text-gray-300">Automated</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={action.action}
              className={`bg-gradient-to-br ${action.gradient} rounded-xl p-6 text-white hover:scale-105 transition-transform duration-200 group`}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <div className="font-bold text-lg mb-1">{action.title}</div>
              <div className="text-sm opacity-90">{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          🤖 AI Insights
          <span className="text-sm bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
            Beta
          </span>
        </h2>
        <div className="grid gap-4">
          {aiInsights.map(insight => (
            <div
              key={insight.id}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${
                      insight.type === 'recommendation' ? 'bg-blue-400' :
                      insight.type === 'pattern' ? 'bg-green-400' :
                      'bg-purple-400'
                    }`}></span>
                    <span className="text-sm text-gray-400 capitalize">
                      {insight.type}
                    </span>
                  </div>
                  <p className="text-white">{insight.message}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(insight.confidence * 100)}% confidence
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Productivity Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveView('tasks')}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 text-left hover:border-cyan-400 transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📝</div>
            <div className="font-semibold text-white mb-1">Task Manager</div>
            <div className="text-sm text-gray-400">Organize and prioritize your tasks</div>
          </button>
          
          <button
            onClick={() => setActiveView('timer')}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 text-left hover:border-purple-400 transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">⏰</div>
            <div className="font-semibold text-white mb-1">Focus Timer</div>
            <div className="text-sm text-gray-400">Pomodoro and deep work sessions</div>
          </button>
          
          <button
            onClick={() => setActiveView('planner')}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 text-left hover:border-green-400 transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📅</div>
            <div className="font-semibold text-white mb-1">Time Planner</div>
            <div className="text-sm text-gray-400">Schedule your day with time blocks</div>
          </button>
          
          <button
            onClick={() => setActiveView('automation')}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 text-left hover:border-orange-400 transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🤖</div>
            <div className="font-semibold text-white mb-1">Automation</div>
            <div className="text-sm text-gray-400">Create workflows and automations</div>
          </button>
        </div>
      </div>
    </div>
  );
}