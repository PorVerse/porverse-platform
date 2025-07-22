// app/dashboard/por-flow/components/FocusSession.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, Coffee, Brain, Zap, Timer } from 'lucide-react';
import styles from './FocusSession.module.css';

interface FocusSession {
  id: string;
  type: 'pomodoro' | 'deep-work' | 'flow-state';
  duration: number; // in minutes
  actualDuration?: number;
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
  isPaused: boolean;
  currentTime: number; // remaining seconds
  distractions: number;
  productivity?: number;
  notes?: string;
  taskId?: string;
}

interface FocusSessionProps {
  userId: string;
  onSessionComplete?: (session: FocusSession) => void;
}

export default function FocusSessionComponent({ userId, onSessionComplete }: FocusSessionProps) {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [backgroundSound, setBackgroundSound] = useState<'none' | 'rain' | 'forest' | 'coffee'>('none');
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<HTMLAudioElement | null>(null);

  // Load focus sessions from storage
  useEffect(() => {
    loadSessions();
    setupAudio();
    requestNotificationPermission();
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const loadSessions = () => {
    try {
      const saved = localStorage.getItem(`porflow_focus_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved).map((s: any) => ({
          ...s,
          startTime: s.startTime ? new Date(s.startTime) : undefined,
          endTime: s.endTime ? new Date(s.endTime) : undefined
        }));
        setSessions(parsed);
      }
    } catch (error) {
      console.error('Error loading focus sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSessions = (sessionsToSave: FocusSession[]) => {
    localStorage.setItem(`porflow_focus_${userId}`, JSON.stringify(sessionsToSave));
  };

  const setupAudio = () => {
    // Setup notification sound
    notificationRef.current = new Audio('/sounds/notification.mp3');
    notificationRef.current.volume = 0.7;
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // Timer logic
  const startTimer = useCallback(() => {
    if (!currentSession || currentSession.isActive) return;

    const updatedSession = {
      ...currentSession,
      isActive: true,
      isPaused: false,
      startTime: currentSession.startTime || new Date()
    };

    setCurrentSession(updatedSession);

    timerRef.current = setInterval(() => {
      setCurrentSession(prev => {
        if (!prev || !prev.isActive || prev.isPaused) return prev;

        const newTime = prev.currentTime - 1;

        if (newTime <= 0) {
          // Session completed
          completeSession({
            ...prev,
            currentTime: 0,
            isActive: false,
            endTime: new Date(),
            actualDuration: Math.round((Date.now() - (prev.startTime?.getTime() || 0)) / 60000)
          });
          return null;
        }

        return { ...prev, currentTime: newTime };
      });
    }, 1000);
  }, [currentSession]);

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setCurrentSession(prev => prev ? { ...prev, isPaused: true, isActive: false } : null);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (currentSession) {
      const stoppedSession = {
        ...currentSession,
        isActive: false,
        isPaused: false,
        endTime: new Date(),
        actualDuration: Math.round((Date.now() - (currentSession.startTime?.getTime() || 0)) / 60000)
      };
      
      const updatedSessions = [...sessions, stoppedSession];
      setSessions(updatedSessions);
      saveSessions(updatedSessions);
    }

    setCurrentSession(null);
  };

  const completeSession = (completedSession: FocusSession) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Play completion sound
    if (soundEnabled && notificationRef.current) {
      notificationRef.current.play().catch(console.error);
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 Focus Session Complete!', {
        body: `Great job! You completed a ${completedSession.type} session.`,
        icon: '/icons/porflow-focus.png'
      });
    }

    // Calculate productivity score (mock algorithm)
    const productivityScore = calculateProductivityScore(completedSession);
    const finalSession = { ...completedSession, productivity: productivityScore };

    const updatedSessions = [...sessions, finalSession];
    setSessions(updatedSessions);
    saveSessions(updatedSessions);

    if (onSessionComplete) {
      onSessionComplete(finalSession);
    }

    // Show break suggestion for pomodoro
    if (completedSession.type === 'pomodoro') {
      setShowBreakSuggestion(true);
    }

    setCurrentSession(null);
  };

  const calculateProductivityScore = (session: FocusSession): number => {
    let score = 8.0; // Base score

    // Deduct for distractions
    score -= session.distractions * 0.5;

    // Bonus for completing full session
    const completionRate = (session.actualDuration || 0) / session.duration;
    score += completionRate * 2;

    // Type-specific bonuses
    if (session.type === 'deep-work') score += 1;
    if (session.type === 'flow-state') score += 1.5;

    return Math.min(Math.max(score, 1), 10);
  };

  // Focus session creators
  const createFocusSession = (type: FocusSession['type'], customDuration?: number) => {
    const durations = {
      'pomodoro': 25,
      'deep-work': 90,
      'flow-state': 120
    };

    const duration = customDuration || durations[type];
    
    const newSession: FocusSession = {
      id: Date.now().toString(),
      type,
      duration,
      currentTime: duration * 60, // Convert to seconds
      isActive: false,
      isPaused: false,
      distractions: 0
    };

    setCurrentSession(newSession);
  };

  // Background sound management
  const toggleBackgroundSound = (sound: typeof backgroundSound) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (sound !== 'none' && sound !== backgroundSound) {
      audioRef.current = new Audio(`/sounds/${sound}.mp3`);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(console.error);
    }

    setBackgroundSound(sound);
  };

  const addDistraction = () => {
    if (currentSession && currentSession.isActive) {
      setCurrentSession(prev => prev ? { ...prev, distractions: prev.distractions + 1 } : null);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTypeInfo = (type: FocusSession['type']) => {
    switch (type) {
      case 'pomodoro':
        return {
          icon: '🍅',
          title: 'Pomodoro',
          description: '25 minutes of focused work',
          color: '#dc2626'
        };
      case 'deep-work':
        return {
          icon: '🧠',
          title: 'Deep Work',
          description: '90 minutes of uninterrupted focus',
          color: '#7c3aed'
        };
      case 'flow-state':
        return {
          icon: '🌊',
          title: 'Flow State',
          description: '2 hours of creative flow',
          color: '#059669'
        };
    }
  };

  const getRecentSessions = () => {
    return sessions
      .slice(-5)
      .reverse()
      .map(session => ({
        ...session,
        typeInfo: getSessionTypeInfo(session.type)
      }));
  };

  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = sessions.filter(s => 
      s.endTime && s.endTime >= today
    );

    const totalMinutes = todaySessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    const avgProductivity = todaySessions.length > 0 
      ? todaySessions.reduce((sum, s) => sum + (s.productivity || 0), 0) / todaySessions.length
      : 0;

    return {
      sessions: todaySessions.length,
      totalMinutes,
      avgProductivity: Math.round(avgProductivity * 10) / 10
    };
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading focus sessions...</p>
      </div>
    );
  }

  const todayStats = getTodayStats();

  return (
    <div className={styles.focusSession}>
      {/* Active Session Display */}
      {currentSession ? (
        <div className={styles.activeSession}>
          <div className={styles.sessionHeader}>
            <div className={styles.sessionType}>
              <span className={styles.sessionIcon}>
                {getSessionTypeInfo(currentSession.type).icon}
              </span>
              <div>
                <h2>{getSessionTypeInfo(currentSession.type).title}</h2>
                <p>{getSessionTypeInfo(currentSession.type).description}</p>
              </div>
            </div>
            
            <div className={styles.sessionControls}>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={styles.soundButton}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.timerDisplay}>
            <div 
              className={styles.circularTimer}
              style={{ 
                background: `conic-gradient(${getSessionTypeInfo(currentSession.type).color} 0deg ${
                  ((currentSession.duration * 60 - currentSession.currentTime) / (currentSession.duration * 60)) * 360
                }deg, rgba(255,255,255,0.1) ${
                  ((currentSession.duration * 60 - currentSession.currentTime) / (currentSession.duration * 60)) * 360
                }deg 360deg)` 
              }}
            >
              <div className={styles.timerInner}>
                <span className={styles.timeText}>
                  {formatTime(currentSession.currentTime)}
                </span>
                <span className={styles.timeLabel}>
                  {currentSession.isActive ? (currentSession.isPaused ? 'Paused' : 'Active') : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.sessionActions}>
            {!currentSession.isActive && !currentSession.isPaused ? (
              <button onClick={startTimer} className={styles.startButton}>
                <Play size={20} />
                Start Focus
              </button>
            ) : currentSession.isActive ? (
              <button onClick={pauseTimer} className={styles.pauseButton}>
                <Pause size={20} />
                Pause
              </button>
            ) : (
              <button onClick={startTimer} className={styles.resumeButton}>
                <Play size={20} />
                Resume
              </button>
            )}
            
            <button onClick={stopTimer} className={styles.stopButton}>
              <Square size={20} />
              Stop
            </button>
            
            <button onClick={addDistraction} className={styles.distractionButton}>
              +1 Distraction
            </button>
          </div>

          <div className={styles.sessionStats}>
            <div className={styles.stat}>
              <span>Distractions</span>
              <strong>{currentSession.distractions}</strong>
            </div>
            <div className={styles.stat}>
              <span>Type</span>
              <strong>{currentSession.type}</strong>
            </div>
            <div className={styles.stat}>
              <span>Duration</span>
              <strong>{currentSession.duration}m</strong>
            </div>
          </div>
        </div>
      ) : (
        /* Session Selection */
        <div className={styles.sessionSelection}>
          <div className={styles.selectionHeader}>
            <h1>🧠 Focus Sessions</h1>
            <p>Choose your focus mode and enter deep work state</p>
          </div>

          <div className={styles.sessionOptions}>
            <div 
              className={styles.sessionOption}
              onClick={() => createFocusSession('flow-state')}
            >
              <div className={styles.optionIcon}>🌊</div>
              <h3>Flow State</h3>
              <p>2 hours of creative deep flow</p>
              <span className={styles.duration}>120 min</span>
            </div>
          </div>

          {/* Background Sound Controls */}
          <div className={styles.backgroundSounds}>
            <h3>Background Ambience</h3>
            <div className={styles.soundOptions}>
              <button 
                className={`${styles.soundOption} ${backgroundSound === 'none' ? styles.active : ''}`}
                onClick={() => toggleBackgroundSound('none')}
              >
                <VolumeX size={16} />
                Silent
              </button>
              <button 
                className={`${styles.soundOption} ${backgroundSound === 'rain' ? styles.active : ''}`}
                onClick={() => toggleBackgroundSound('rain')}
              >
                🌧️ Rain
              </button>
              <button 
                className={`${styles.soundOption} ${backgroundSound === 'forest' ? styles.active : ''}`}
                onClick={() => toggleBackgroundSound('forest')}
              >
                🌲 Forest
              </button>
              <button 
                className={`${styles.soundOption} ${backgroundSound === 'coffee' ? styles.active : ''}`}
                onClick={() => toggleBackgroundSound('coffee')}
              >
                ☕ Café
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Stats */}
      <div className={styles.todayStats}>
        <h3>Today's Focus</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Timer size={24} />
            <div>
              <span className={styles.statNumber}>{todayStats.sessions}</span>
              <span className={styles.statLabel}>Sessions</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Clock size={24} />
            <div>
              <span className={styles.statNumber}>{Math.round(todayStats.totalMinutes / 60 * 10) / 10}h</span>
              <span className={styles.statLabel}>Focused</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Zap size={24} />
            <div>
              <span className={styles.statNumber}>{todayStats.avgProductivity}</span>
              <span className={styles.statLabel}>Avg Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className={styles.recentSessions}>
          <h3>Recent Sessions</h3>
          <div className={styles.sessionsList}>
            {getRecentSessions().map(session => (
              <div key={session.id} className={styles.sessionItem}>
                <div className={styles.sessionItemIcon}>
                  {session.typeInfo.icon}
                </div>
                <div className={styles.sessionItemDetails}>
                  <h4>{session.typeInfo.title}</h4>
                  <p>
                    {session.actualDuration}min • 
                    Score: {session.productivity?.toFixed(1)} • 
                    {session.distractions} distractions
                  </p>
                </div>
                <div className={styles.sessionItemTime}>
                  {session.endTime ? 
                    session.endTime.toLocaleTimeString('ro-RO', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 
                    'In Progress'
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Break Suggestion Modal */}
      {showBreakSuggestion && (
        <div className={styles.breakModal}>
          <div className={styles.breakContent}>
            <div className={styles.breakIcon}>☕</div>
            <h3>Time for a Break!</h3>
            <p>You've completed a Pomodoro session. Take a 5-minute break to recharge.</p>
            <div className={styles.breakActions}>
              <button 
                onClick={() => {
                  setShowBreakSuggestion(false);
                  createFocusSession('pomodoro', 5); // 5-minute break
                }}
                className={styles.takeBreakBtn}
              >
                <Coffee size={16} />
                Take 5 Min Break
              </button>
              <button 
                onClick={() => setShowBreakSuggestion(false)}
                className={styles.skipBreakBtn}
              >
                Continue Working
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Timer Modal - could be added later */}
      {/* Focus Tips Panel - could be added later */}
    </div>
  );
}Session('pomodoro')}
            >
              <div className={styles.optionIcon}>🍅</div>
              <h3>Pomodoro</h3>
              <p>25 min focused work + 5 min break</p>
              <span className={styles.duration}>25 min</span>
            </div>

            <div 
              className={styles.sessionOption}
              onClick={() => createFocusSession('deep-work')}
            >
              <div className={styles.optionIcon}>🧠</div>
              <h3>Deep Work</h3>
              <p>90 minutes of uninterrupted focus</p>
              <span className={styles.duration}>90 min</span>
            </div>

            <div 
              className={styles.sessionOption}
              onClick={() => createFocus