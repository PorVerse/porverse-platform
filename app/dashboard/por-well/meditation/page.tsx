'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.module.css';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  type: 'mindfulness' | 'breathing' | 'body-scan' | 'loving-kindness' | 'sleep' | 'focus';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  audioUrl?: string;
  guideVoice: 'aria' | 'zen' | 'nature';
  backgroundSound: 'none' | 'rain' | 'forest' | 'ocean' | 'singing-bowls' | 'white-noise';
  recommendedFor: string[];
}

interface UserProgress {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  favoriteType: string;
  averageRating: number;
  lastSessionDate: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface SessionState {
  isActive: boolean;
  currentSession: MeditationSession | null;
  timeRemaining: number;
  currentPhase: 'intro' | 'main' | 'outro' | 'complete';
  heartRate?: number;
  calmness?: number;
}

interface AIRecommendation {
  sessionId: string;
  reason: string;
  confidence: number;
  moodBased: boolean;
  stressBased: boolean;
  personalityBased: boolean;
}

export default function MeditationCenter() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Fetch user data from other tools (simulated integration)
  const [userWellnessData] = useState({
    currentMood: 6.2,
    stressLevel: 6,
    energyLevel: 4,
    lastMoodEntry: '2025-01-15',
    commonTriggers: ['Work stress', 'Lack of sleep'],
    preferredActivities: ['Meditation', 'Reading']
  });

  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalSessions: 47,
    totalMinutes: 785,
    currentStreak: 8,
    longestStreak: 23,
    favoriteType: 'mindfulness',
    averageRating: 4.6,
    lastSessionDate: '2025-01-14',
    weeklyGoal: 5,
    weeklyProgress: 3
  });

  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    currentSession: null,
    timeRemaining: 0,
    currentPhase: 'intro'
  });

  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDuration, setFilterDuration] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [heartRateSimulation, setHeartRateSimulation] = useState(72);
  const [calmnessLevel, setCalmnessLevel] = useState(50);

  const meditationSessions: MeditationSession[] = [
    {
      id: '1',
      title: '🌅 Morning Energy Boost',
      description: 'Începe ziua cu energie pozitivă și focus clar',
      duration: 10,
      type: 'mindfulness',
      difficulty: 'beginner',
      benefits: ['Creștere energie', 'Focus îmbunătățit', 'Mood pozitiv'],
      guideVoice: 'aria',
      backgroundSound: 'forest',
      recommendedFor: ['Low energy', 'Morning routine', 'Work preparation']
    },
    {
      id: '2',
      title: '💆‍♀️ Stress Relief Deep',
      description: 'Eliberare profundă de tensiune și stress acumulat',
      duration: 15,
      type: 'body-scan',
      difficulty: 'intermediate',
      benefits: ['Reducere stress', 'Relaxare musculară', 'Calm mental'],
      guideVoice: 'zen',
      backgroundSound: 'ocean',
      recommendedFor: ['High stress', 'Work tension', 'Anxiety relief']
    },
    {
      id: '3',
      title: '🫁 4-7-8 Breathing Master',
      description: 'Tehnica avansată de respirație pentru calm instant',
      duration: 8,
      type: 'breathing',
      difficulty: 'beginner',
      benefits: ['Calm instant', 'Reducere anxietate', 'Control respirație'],
      guideVoice: 'aria',
      backgroundSound: 'singing-bowls',
      recommendedFor: ['Anxiety', 'Panic attacks', 'Quick relief']
    },
    {
      id: '4',
      title: '🧠 Focus & Productivity',
      description: 'Maximizează concentrarea pentru work sessions',
      duration: 12,
      type: 'focus',
      difficulty: 'intermediate',
      benefits: ['Focus laser', 'Productivitate', 'Claritate mentală'],
      guideVoice: 'zen',
      backgroundSound: 'white-noise',
      recommendedFor: ['Work preparation', 'Study sessions', 'Mental clarity']
    },
    {
      id: '5',
      title: '❤️ Loving Kindness Journey',
      description: 'Dezvoltă compassiunea și iubirea de sine',
      duration: 20,
      type: 'loving-kindness',
      difficulty: 'intermediate',
      benefits: ['Self-compassion', 'Empatie', 'Healing emoțional'],
      guideVoice: 'aria',
      backgroundSound: 'forest',
      recommendedFor: ['Self-criticism', 'Relationship issues', 'Emotional healing']
    },
    {
      id: '6',
      title: '😴 Deep Sleep Preparation',
      description: 'Pregătește-te pentru un somn odihnitor și profund',
      duration: 25,
      type: 'sleep',
      difficulty: 'beginner',
      benefits: ['Somn mai bun', 'Relaxare completă', 'Recovery'],
      guideVoice: 'zen',
      backgroundSound: 'rain',
      recommendedFor: ['Insomnia', 'Sleep quality', 'Evening routine']
    },
    {
      id: '7',
      title: '🌊 Mindful Awareness Flow',
      description: 'Conștientizare profundă și presence în moment',
      duration: 18,
      type: 'mindfulness',
      difficulty: 'advanced',
      benefits: ['Presence', 'Awareness', 'Inner peace'],
      guideVoice: 'zen',
      backgroundSound: 'ocean',
      recommendedFor: ['Mindfulness practice', 'Spiritual growth', 'Advanced practitioners']
    },
    {
      id: '8',
      title: '⚡ Quick Reset (SOS)',
      description: 'Reset rapid pentru momente de criză sau overwhelm',
      duration: 5,
      type: 'breathing',
      difficulty: 'beginner',
      benefits: ['Reset instant', 'Calm rapid', 'Emergency relief'],
      guideVoice: 'aria',
      backgroundSound: 'none',
      recommendedFor: ['Emergency', 'Panic', 'Quick relief', 'Work breaks']
    }
  ];

  useEffect(() => {
    generateAIRecommendations();
    simulateWearableData();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionState.isActive && sessionState.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          // Update heart rate simulation during session
          if (newTimeRemaining > 0) {
            const progress = 1 - (newTimeRemaining / (prev.currentSession?.duration ? prev.currentSession.duration * 60 : 1));
            const targetHR = 60 + Math.sin(progress * Math.PI) * 10; // Bell curve for relaxation
            setHeartRateSimulation(Math.round(targetHR));
            setCalmnessLevel(Math.min(100, 50 + progress * 50));
          }
          
          if (newTimeRemaining <= 0) {
            completeSession();
            return { ...prev, timeRemaining: 0, currentPhase: 'complete' };
          }
          
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState.isActive, sessionState.timeRemaining]);

  const generateAIRecommendations = () => {
    const recommendations: AIRecommendation[] = [];
    
    // Mood-based recommendations
    if (userWellnessData.currentMood < 6) {
      recommendations.push({
        sessionId: '1', // Morning Energy Boost
        reason: `Mood-ul tău actual (${userWellnessData.currentMood}/10) poate fi îmbunătățit cu o sesiune energizantă`,
        confidence: 0.87,
        moodBased: true,
        stressBased: false,
        personalityBased: false
      });
    }

    // Stress-based recommendations  
    if (userWellnessData.stressLevel > 6) {
      recommendations.push({
        sessionId: '2', // Stress Relief Deep
        reason: `Nivelul de stress ridicat (${userWellnessData.stressLevel}/10) necesită relaxare profundă`,
        confidence: 0.92,
        moodBased: false,
        stressBased: true,
        personalityBased: false
      });
      
      recommendations.push({
        sessionId: '3', // 4-7-8 Breathing
        reason: 'Tehnica 4-7-8 este foarte eficientă pentru reducerea stresului rapid',
        confidence: 0.89,
        moodBased: false,
        stressBased: true,
        personalityBased: false
      });
    }

    // Energy-based recommendations
    if (userWellnessData.energyLevel < 5) {
      recommendations.push({
        sessionId: '4', // Focus & Productivity
        reason: `Energia scăzută (${userWellnessData.energyLevel}/10) poate fi restabilită cu focus meditation`,
        confidence: 0.81,
        moodBased: false,
        stressBased: false,
        personalityBased: true
      });
    }

    // Trigger-based recommendations
    if (userWellnessData.commonTriggers.includes('Work stress')) {
      recommendations.push({
        sessionId: '8', // Quick Reset
        reason: 'Pentru stress-ul de la muncă, recomand tehnica de reset rapid',
        confidence: 0.85,
        moodBased: false,
        stressBased: true,
        personalityBased: true
      });
    }

    setAiRecommendations(recommendations);
  };

  const simulateWearableData = () => {
    // Simulate real-time biometric data
    const interval = setInterval(() => {
      if (!sessionState.isActive) {
        setHeartRateSimulation(prev => {
          const variation = (Math.random() - 0.5) * 4;
          return Math.max(60, Math.min(100, prev + variation));
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const startSession = (session: MeditationSession) => {
    setSessionState({
      isActive: true,
      currentSession: session,
      timeRemaining: session.duration * 60,
      currentPhase: 'intro',
      heartRate: heartRateSimulation,
      calmness: calmnessLevel
    });

    setShowSessionModal(true);
    
    // Simulate audio start
    console.log(`Starting meditation: ${session.title} with ${session.guideVoice} voice and ${session.backgroundSound} background`);
  };

  const pauseSession = () => {
    setSessionState(prev => ({ ...prev, isActive: false }));
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resumeSession = () => {
    setSessionState(prev => ({ ...prev, isActive: true }));
  };

  const stopSession = () => {
    setSessionState({
      isActive: false,
      currentSession: null,
      timeRemaining: 0,
      currentPhase: 'intro'
    });
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setShowSessionModal(false);
  };

  const completeSession = () => {
    if (!sessionState.currentSession) return;

    // Update progress
    const newProgress = {
      ...userProgress,
      totalSessions: userProgress.totalSessions + 1,
      totalMinutes: userProgress.totalMinutes + sessionState.currentSession.duration,
      currentStreak: userProgress.currentStreak + 1,
      lastSessionDate: new Date().toISOString().split('T')[0],
      weeklyProgress: userProgress.weeklyProgress + 1
    };

    setUserProgress(newProgress);

    // Show completion and benefits
    setTimeout(() => {
      alert(`🎉 Sesiune completă! Ai meditat ${sessionState.currentSession?.duration} minute. Current streak: ${newProgress.currentStreak} zile!`);
      
      // Simulate mood improvement
      setTimeout(() => {
        alert(`📈 Mood Update: Sesiunea de meditație a îmbunătățit mood-ul cu +0.8 puncte! Integrare cu Mood Tracker completă.`);
      }, 1000);
    }, 500);

    setShowSessionModal(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#22c55e';
      case 'intermediate': return '#f59e0b'; 
      case 'advanced': return '#ef4444';
      default: return '#06b6d4';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mindfulness': return '🧘‍♀️';
      case 'breathing': return '🫁';
      case 'body-scan': return '💆‍♀️';
      case 'loving-kindness': return '❤️';
      case 'sleep': return '😴';
      case 'focus': return '🧠';
      default: return '🌟';
    }
  };

  const filteredSessions = meditationSessions.filter(session => {
    if (filterType !== 'all' && session.type !== filterType) return false;
    if (filterDuration !== 'all') {
      if (filterDuration === 'short' && session.duration > 10) return false;
      if (filterDuration === 'medium' && (session.duration <= 10 || session.duration > 20)) return false;
      if (filterDuration === 'long' && session.duration <= 20) return false;
    }
    return true;
  });

  const getStreakEmoji = () => {
    if (userProgress.currentStreak >= 30) return '🏆';
    if (userProgress.currentStreak >= 14) return '🔥';
    if (userProgress.currentStreak >= 7) return '⭐';
    return '🌱';
  };

  if (loading) {
    return (
      <div className="meditation-center loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Se încarcă Meditation Center...</h2>
          <p>Pregătim experiența ta de mindfulness 🧘‍♀️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meditation-center">
      {/* Header */}
      <div className="meditation-header">
        <button 
          onClick={() => router.push('/dashboard/por-well')}
          className="back-btn"
        >
          ← Înapoi la PorWell
        </button>
        
        <div className="header-info">
          <h1>🧘‍♀️ Meditation Center</h1>
          <p>Sesiuni ghidate cu AI pentru mindfulness și relaxare profundă</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{userProgress.currentStreak}</span>
            <span className="stat-label">Current Streak {getStreakEmoji()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userProgress.totalMinutes}</span>
            <span className="stat-label">Total minute meditate</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Math.round(heartRateSimulation)}</span>
            <span className="stat-label">Heart Rate (live)</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="meditation-content">
        {/* Progress Overview */}
        <div className="progress-section">
          <div className="progress-card main">
            <div className="card-header">
              <h3>📊 Progresul tău săptămânal</h3>
              <span className="goal-progress">{userProgress.weeklyProgress}/{userProgress.weeklyGoal} sesiuni</span>
            </div>
            
            <div className="progress-visual">
              <div className="progress-ring">
                <div 
                  className="progress-fill"
                  style={{ 
                    '--progress': `${(userProgress.weeklyProgress / userProgress.weeklyGoal) * 100}%` 
                  } as React.CSSProperties}
                ></div>
                <div className="progress-center">
                  <span className="progress-percentage">
                    {Math.round((userProgress.weeklyProgress / userProgress.weeklyGoal) * 100)}%
                  </span>
                  <span className="progress-label">Obiectiv</span>
                </div>
              </div>
              
              <div className="progress-stats">
                <div className="stat">
                  <span className="stat-number">{userProgress.totalSessions}</span>
                  <span className="stat-text">Total sesiuni</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{userProgress.longestStreak}</span>
                  <span className="stat-text">Cel mai lung streak</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{userProgress.averageRating.toFixed(1)}⭐</span>
                  <span className="stat-text">Rating mediu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Biometrics */}
          <div className="biometrics-card">
            <div className="card-header">
              <h3>📱 Live Biometrics</h3>
              <span className="connected-badge">🔗 Connected</span>
            </div>
            
            <div className="biometric-data">
              <div className="biometric-item">
                <div className="biometric-icon">💓</div>
                <div className="biometric-info">
                  <span className="biometric-value">{Math.round(heartRateSimulation)}</span>
                  <span className="biometric-unit">BPM</span>
                </div>
                <div className={`biometric-status ${heartRateSimulation < 70 ? 'calm' : 'active'}`}>
                  {heartRateSimulation < 70 ? 'Calm' : 'Active'}
                </div>
              </div>
              
              <div className="biometric-item">
                <div className="biometric-icon">🧘‍♀️</div>
                <div className="biometric-info">
                  <span className="biometric-value">{Math.round(calmnessLevel)}</span>
                  <span className="biometric-unit">%</span>
                </div>
                <div className="biometric-status calm">Calmness</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <div className="recommendations-section">
            <div className="section-header">
              <h3>🤖 AI Recommendations</h3>
              <p>Bazate pe datele tale din Mood Tracker și preferințe</p>
            </div>
            
            <div className="recommendations-grid">
              {aiRecommendations.slice(0, 3).map((rec, index) => {
                const session = meditationSessions.find(s => s.id === rec.sessionId);
                if (!session) return null;
                
                return (
                  <div key={index} className="recommendation-card">
                    <div className="rec-header">
                      <div className="rec-badges">
                        {rec.moodBased && <span className="rec-badge mood">Mood</span>}
                        {rec.stressBased && <span className="rec-badge stress">Stress</span>}
                        {rec.personalityBased && <span className="rec-badge personality">Personal</span>}
                      </div>
                      <div className="confidence-score">{Math.round(rec.confidence * 100)}%</div>
                    </div>
                    
                    <div className="rec-session">
                      <div className="session-icon">{getTypeIcon(session.type)}</div>
                      <div className="session-info">
                        <h4>{session.title}</h4>
                        <p>{session.duration} minute • {session.difficulty}</p>
                      </div>
                    </div>
                    
                    <div className="rec-reason">
                      <p>{rec.reason}</p>
                    </div>
                    
                    <button 
                      onClick={() => startSession(session)}
                      className="start-rec-btn"
                    >
                      🎧 Start Session
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Session Library */}
        <div className="library-section">
          <div className="section-header">
            <h3>🎧 Session Library</h3>
            <div className="filters">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">Toate tipurile</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="breathing">Breathing</option>
                <option value="body-scan">Body Scan</option>
                <option value="loving-kindness">Loving Kindness</option>
                <option value="sleep">Sleep</option>
                <option value="focus">Focus</option>
              </select>
              
              <select 
                value={filterDuration}
                onChange={(e) => setFilterDuration(e.target.value)}
                className="filter-select"
              >
                <option value="all">Toate duratele</option>
                <option value="short">Scurt (≤10 min)</option>
                <option value="medium">Mediu (11-20 min)</option>
                <option value="long">Lung (>20 min)</option>
              </select>
            </div>
          </div>
          
          <div className="sessions-grid">
            {filteredSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div className="session-type">
                    <span className="type-icon">{getTypeIcon(session.type)}</span>
                    <span className="type-name">{session.type}</span>
                  </div>
                  <div 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(session.difficulty) }}
                  >
                    {session.difficulty}
                  </div>
                </div>
                
                <div className="session-info">
                  <h4>{session.title}</h4>
                  <p className="session-description">{session.description}</p>
                  
                  <div className="session-meta">
                    <span className="duration">⏱️ {session.duration} min</span>
                    <span className="voice">🎤 {session.guideVoice}</span>
                    <span className="background">🎵 {session.backgroundSound}</span>
                  </div>
                </div>
                
                <div className="session-benefits">
                  <div className="benefits-list">
                    {session.benefits.slice(0, 2).map((benefit, index) => (
                      <span key={index} className="benefit-tag">{benefit}</span>
                    ))}
                    {session.benefits.length > 2 && (
                      <span className="benefit-more">+{session.benefits.length - 2} mai multe</span>
                    )}
                  </div>
                </div>
                
                <div className="session-actions">
                  <button 
                    onClick={() => {
                      setSelectedSession(session);
                      // Could show preview modal here
                    }}
                    className="preview-btn"
                  >
                    👁️ Preview
                  </button>
                  <button 
                    onClick={() => startSession(session)}
                    className="start-btn"
                  >
                    ▶️ Start Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3>⚡ Quick Actions</h3>
          <div className="quick-actions">
            <Link href="/dashboard/por-well/mood-tracker" className="action-btn">
              <span className="action-icon">📊</span>
              <span>Update Mood</span>
            </Link>
            <Link href="/dashboard/por-well/ai-therapist" className="action-btn">
              <span className="action-icon">🤖</span>
              <span>Chat cu AI</span>
            </Link>
            <button 
              onClick={() => {
                const sosSession = meditationSessions.find(s => s.id === '8');
                if (sosSession) startSession(sosSession);
              }}
              className="action-btn emergency"
            >
              <span className="action-icon">🆘</span>
              <span>SOS Reset</span>
            </button>
            <Link href="/dashboard/por-well/breathing" className="action-btn">
              <span className="action-icon">🫁</span>
              <span>Breathing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Session Modal */}
      {showSessionModal && sessionState.currentSession && (
        <div className="session-modal">
          <div className="modal-content">
            <div className="session-in-progress">
              <div className="session-header">
                <h3>{sessionState.currentSession.title}</h3>
                <button 
                  onClick={stopSession}
                  className="close-session-btn"
                >
                  ✕
                </button>
              </div>
              
              <div className="session-timer">
                <div className="timer-circle">
                  <div 
                    className="timer-progress"
                    style={{
                      '--progress': `${((sessionState.currentSession.duration * 60 - sessionState.timeRemaining) / (sessionState.currentSession.duration * 60)) * 100}%`
                    } as React.CSSProperties}
                  ></div>
                  <div className="timer-center">
                    <span className="time-remaining">{formatTime(sessionState.timeRemaining)}</span>
                    <span className="time-label">rămas</span>
                  </div>
                </div>
              </div>
              
              <div className="session-guidance">
                <div className="guidance-text">
                  {sessionState.currentPhase === 'intro' && "Găsește o poziție confortabilă și închide ochii..."}
                  {sessionState.currentPhase === 'main' && "Concentrează-te pe respirație și lasă gândurile să treacă..."}
                  {sessionState.currentPhase === 'outro' && "Începe să îți aduci atenția înapoi în cameră..."}
                </div>
              </div>
              
              <div className="session-biometrics">
                <div className="biometric-live">
                  <span className="bio-label">💓 Heart Rate</span>
                  <span className="bio-value">{Math.round(heartRateSimulation)} BPM</span>
                </div>
                <div className="biometric-live">
                  <span className="bio-label">🧘‍♀️ Calmness</span>
                  <span className="bio-value">{Math.round(calmnessLevel)}%</span>
                </div>
              </div>
              
              <div className="session-controls">
                {sessionState.isActive ? (
                  <button onClick={pauseSession} className="control-btn pause">
                    ⏸️ Pause
                  </button>
                ) : (
                  <button onClick={resumeSession} className="control-btn play">
                    ▶️ Resume
                  </button>
                )}
                <button onClick={stopSession} className="control-btn stop">
                  ⏹️ Stop
                </button>
              </div>
              
              <div className="session-background-controls">
                <div className="background-info">
                  🎵 Background: {sessionState.currentSession.backgroundSound}
                </div>
                <div className="guide-info">
                  🎤 Guide: Dr. {sessionState.currentSession.guideVoice}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}