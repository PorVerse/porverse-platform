// components/por-flow/FocusTimer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { Play, Pause, Square, RotateCcw, Settings, TrendingUp } from 'lucide-react';

interface FocusSession {
  id: string;
  user_id: string;
  type: 'pomodoro' | 'deep-work' | 'flow-state' | 'custom';
  planned_duration: number; // minutes
  actual_duration?: number;
  distractions: number;
  productivity_rating?: number;
  notes?: string;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface FocusStats {
  totalSessions: number;
  totalMinutes: number;
  averageProductivity: number;
  streakDays: number;
  bestSession: number;
  distractionsTotal: number;
}

interface FocusTimerProps {
  className?: string;
}

const FOCUS_PRESETS = {
  pomodoro: { duration: 25, name: 'Pomodoro', color: '#ef4444', icon: '🍅' },
  'deep-work': { duration: 90, name: 'Deep Work', color: '#7c3aed', icon: '🧠' },
  'flow-state': { duration: 120, name: 'Flow State', color: '#059669', icon: '🌊' },
  custom: { duration: 60, name: 'Custom', color: '#06b6d4', icon: '⚡' }
};

export default function FocusTimer({ className }: FocusTimerProps) {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedType, setSelectedType] = useState<keyof typeof FOCUS_PRESETS>('pomodoro');
  const [customDuration, setCustomDuration] = useState(60);
  const [distractions, setDistractions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState<FocusStats>({
    totalSessions: 0,
    totalMinutes: 0,
    averageProductivity: 0,
    streakDays: 0,
    bestSession: 0,
    distractionsTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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

  // Load focus stats and any active session
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);

        // Load focus sessions from user_progress table
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('ecosystem', 'por-flow')
          .eq('progress_type', 'focus_session')
          .order('created_at', { ascending: false });

        if (progressError) {
          console.error('Error loading focus sessions:', progressError);
        } else {
          calculateStats(progressData || []);
          
          // Check for active session
          const activeSession = (progressData || []).find(
            p => p.progress_data?.status === 'active'
          );
          
          if (activeSession) {
            restoreActiveSession(activeSession);
          }
        }
      } catch (err) {
        console.error('Error loading focus data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, supabase]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Calculate stats from progress data
  const calculateStats = (progressData: any[]) => {
    const focusSessions = progressData.filter(p => p.progress_type === 'focus_session');
    
    if (focusSessions.length === 0) {
      setStats({
        totalSessions: 0,
        totalMinutes: 0,
        averageProductivity: 0,
        streakDays: 0,
        bestSession: 0,
        distractionsTotal: 0
      });
      return;
    }

    const totalMinutes = focusSessions.reduce((sum, session) => {
      return sum + (session.progress_data?.actual_duration || 0);
    }, 0);

    const avgProductivity = focusSessions.reduce((sum, session) => {
      return sum + (session.progress_data?.productivity_rating || 0);
    }, 0) / focusSessions.length;

    const totalDistractions = focusSessions.reduce((sum, session) => {
      return sum + (session.progress_data?.distractions || 0);
    }, 0);

    const bestSession = Math.max(...focusSessions.map(s => s.progress_data?.actual_duration || 0));

    // Calculate streak (simplified - consecutive days with sessions)
    const streak = calculateStreakDays(focusSessions);

    setStats({
      totalSessions: focusSessions.length,
      totalMinutes,
      averageProductivity: avgProductivity,
      streakDays: streak,
      bestSession,
      distractionsTotal: totalDistractions
    });
  };

  // Calculate consecutive days streak
  const calculateStreakDays = (sessions: any[]): number => {
    if (sessions.length === 0) return 0;

    const today = new Date();
    let streakDays = 0;
    let currentDate = new Date(today);

    // Check each day going backwards
    for (let i = 0; i < 30; i++) { // Check last 30 days max
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasSessionOnDate = sessions.some(session => {
        const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
        return sessionDate === dateStr;
      });

      if (hasSessionOnDate) {
        streakDays++;
      } else if (streakDays > 0) {
        // Break in streak
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streakDays;
  };

  // Restore active session from database
  const restoreActiveSession = (progressData: any) => {
    const sessionData = progressData.progress_data;
    const startTime = new Date(sessionData.started_at);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
    const remainingTime = Math.max(0, (sessionData.planned_duration * 60) - (elapsedMinutes * 60));

    if (remainingTime > 0) {
      setCurrentSession({
        id: progressData.id,
        user_id: userId!,
        type: sessionData.type,
        planned_duration: sessionData.planned_duration,
        distractions: sessionData.distractions || 0,
        started_at: sessionData.started_at,
        status: 'active'
      });
      setTimeLeft(remainingTime);
      setDistractions(sessionData.distractions || 0);
      setSelectedType(sessionData.type);
      setIsRunning(true);
    }
  };

  // Start a new focus session
  const startSession = async () => {
    if (!userId) return;

    const duration = selectedType === 'custom' ? customDuration : FOCUS_PRESETS[selectedType].duration;
    const sessionData = {
      type: selectedType,
      planned_duration: duration,
      actual_duration: 0,
      distractions: 0,
      started_at: new Date().toISOString(),
      status: 'active'
    };

    try {
      // Save to user_progress table
      const { data, error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: userId,
          ecosystem: 'por-flow',
          progress_type: 'focus_session',
          progress_data: sessionData,
          score: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setCurrentSession({
        id: data.id,
        user_id: userId,
        type: selectedType,
        planned_duration: duration,
        distractions: 0,
        started_at: sessionData.started_at,
        status: 'active'
      });

      setTimeLeft(duration * 60);
      setDistractions(0);
      setIsRunning(true);
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  // Pause session
  const pauseSession = async () => {
    setIsRunning(false);
    
    if (currentSession) {
      await updateSessionInDB({
        ...currentSession,
        actual_duration: Math.round((currentSession.planned_duration * 60 - timeLeft) / 60)
      });
    }
  };

  // Resume session
  const resumeSession = () => {
    setIsRunning(true);
  };

  // Complete session
  const completeSession = async () => {
    setIsRunning(false);
    
    if (!currentSession) return;

    const actualDuration = Math.round((currentSession.planned_duration * 60 - timeLeft) / 60);
    const productivityRating = await promptProductivityRating();

    const completedSession = {
      ...currentSession,
      actual_duration: actualDuration,
      productivity_rating: productivityRating,
      ended_at: new Date().toISOString(),
      status: 'completed' as const
    };

    await updateSessionInDB(completedSession);
    
    // Reset state
    setCurrentSession(null);
    setTimeLeft(0);
    setDistractions(0);
    
    // Refresh stats
    loadStats();
    
    // Show completion notification
    showCompletionNotification(actualDuration, productivityRating);
  };

  // Cancel session
  const cancelSession = async () => {
    if (!currentSession) return;
    
    const cancelledSession = {
      ...currentSession,
      actual_duration: Math.round((currentSession.planned_duration * 60 - timeLeft) / 60),
      ended_at: new Date().toISOString(),
      status: 'cancelled' as const
    };

    await updateSessionInDB(cancelledSession);
    
    setCurrentSession(null);
    setTimeLeft(0);
    setIsRunning(false);
    setDistractions(0);
  };

  // Update session in database
  const updateSessionInDB = async (sessionData: any) => {
    if (!currentSession) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .update({
          progress_data: {
            type: sessionData.type,
            planned_duration: sessionData.planned_duration,
            actual_duration: sessionData.actual_duration,
            distractions: sessionData.distractions,
            productivity_rating: sessionData.productivity_rating,
            started_at: sessionData.started_at,
            ended_at: sessionData.ended_at,
            status: sessionData.status
          },
          score: sessionData.productivity_rating || 0
        })
        .eq('id', currentSession.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating session:', err);
    }
  };

  // Load fresh stats
  const loadStats = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-flow')
      .eq('progress_type', 'focus_session');

    if (!error && data) {
      calculateStats(data);
    }
  };

  // Prompt for productivity rating
  const promptProductivityRating = (): Promise<number> => {
    return new Promise((resolve) => {
      const rating = window.prompt(
        'How productive was this session? (1-10)',
        '8'
      );
      const numRating = parseInt(rating || '8');
      resolve(Math.max(1, Math.min(10, numRating)));
    });
  };

  // Show completion notification
  const showCompletionNotification = (duration: number, rating: number) => {
    // You could replace this with a proper toast notification
    alert(`🎉 Session completed!\nDuration: ${duration} minutes\nProductivity: ${rating}/10`);
  };

  // Add distraction
  const addDistraction = async () => {
    const newDistractions = distractions + 1;
    setDistractions(newDistractions);
    
    if (currentSession) {
      await updateSessionInDB({
        ...currentSession,
        distractions: newDistractions
      });
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const getProgress = () => {
    if (!currentSession) return 0;
    const totalSeconds = currentSession.planned_duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  if (loading) {
    return (
      <div className={`focus-timer ${className}`}>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-300 rounded mb-2"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`focus-timer ${className}`}>
      {/* Header with Stats */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Focus Timer</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-cyan-400 text-2xl font-bold">{stats.totalSessions}</div>
          <div className="text-gray-400 text-sm">Sessions</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-green-400 text-2xl font-bold">{Math.round(stats.totalMinutes / 60)}h</div>
          <div className="text-gray-400 text-sm">Focus Time</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-purple-400 text-2xl font-bold">{stats.averageProductivity.toFixed(1)}</div>
          <div className="text-gray-400 text-sm">Avg Rating</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
          <div className="text-yellow-400 text-2xl font-bold">{stats.streakDays}</div>
          <div className="text-gray-400 text-sm">Day Streak</div>
        </div>
      </div>

      {/* Main Timer */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-8 mb-6">
        {/* Timer Display */}
        <div className="text-center mb-8">
          <div 
            className="w-48 h-48 mx-auto rounded-full border-8 border-gray-600 relative mb-6"
            style={{
              background: `conic-gradient(${FOCUS_PRESETS[selectedType].color} ${getProgress()}%, #374151 ${getProgress()}%)`
            }}
          >
            <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
              <div>
                <div className="text-4xl font-mono text-white mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-lg text-gray-400">
                  {FOCUS_PRESETS[selectedType].icon} {FOCUS_PRESETS[selectedType].name}
                </div>
              </div>
            </div>
          </div>

          {/* Session Info */}
          {currentSession && (
            <div className="flex justify-center gap-6 text-sm text-gray-400 mb-6">
              <span>🎯 Target: {currentSession.planned_duration}m</span>
              <span>⚡ Distractions: {distractions}</span>
              <span>📊 Progress: {Math.round(getProgress())}%</span>
            </div>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-4">
          {!currentSession ? (
            <button
              onClick={startSession}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Play className="w-5 h-5" />
              Start Session
            </button>
          ) : (
            <>
              {isRunning ? (
                <button
                  onClick={pauseSession}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeSession}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
              )}
              
              <button
                onClick={completeSession}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Square className="w-5 h-5" />
                Complete
              </button>
              
              <button
                onClick={cancelSession}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Distraction Button */}
        {currentSession && isRunning && (
          <div className="text-center mt-6">
            <button
              onClick={addDistraction}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              📱 Mark Distraction ({distractions})
            </button>
          </div>
        )}
      </div>

      {/* Session Type Selector */}
      {!currentSession && (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Choose Focus Type</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {Object.entries(FOCUS_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key as keyof typeof FOCUS_PRESETS)}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedType === key
                    ? 'border-cyan-500 bg-cyan-500/20 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-2">{preset.icon}</div>
                <div className="font-medium">{preset.name}</div>
                <div className="text-sm text-gray-400">
                  {key === 'custom' ? `${customDuration}m` : `${preset.duration}m`}
                </div>
              </button>
            ))}
          </div>

          {selectedType === 'custom' && (
            <div className="flex items-center gap-3">
              <label className="text-gray-300">Duration:</label>
              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={customDuration}
                onChange={(e) => setCustomDuration(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-medium w-12 text-right">
                {customDuration}m
              </span>
            </div>
          )}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-6 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Focus Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Session History</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Session:</span>
                  <span className="text-white">{stats.bestSession} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Distractions:</span>
                  <span className="text-white">{stats.distractionsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Distraction Rate:</span>
                  <span className="text-white">
                    {stats.totalSessions > 0 
                      ? (stats.distractionsTotal / stats.totalSessions).toFixed(1)
                      : '0'} per session
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Session Length:</span>
                  <span className="text-white">
                    {stats.totalSessions > 0 
                      ? Math.round(stats.totalMinutes / stats.totalSessions)
                      : 0} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Focus Efficiency:</span>
                  <span className="text-white">
                    {((stats.averageProductivity / 10) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weekly Goal:</span>
                  <span className="text-white">
                    {Math.round(stats.totalMinutes / 60)}/10 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}