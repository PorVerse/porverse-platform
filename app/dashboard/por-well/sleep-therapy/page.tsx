'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.css';

// TypeScript Interfaces
interface SleepSession {
  id: string;
  technique: string;
  type: 'cbt-i' | 'hygiene' | 'routine' | 'emergency';
  duration: number;
  description: string;
  steps: string[];
  effectiveness: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bestTime: 'evening' | 'bedtime' | 'middle-night' | 'anytime';
  benefits: string[];
}

interface SleepProfile {
  currentIssues: string[];
  sleepScore: number;
  averageDuration: number;
  insomniaLevel: number;
  weeklyProgress: number;
  lastSession: string | null;
  effectivenessByType: {
    'cbt-i': number;
    'hygiene': number;
    'routine': number;
    'emergency': number;
  };
}

interface SleepData {
  quality: number;
  duration: number;
  fallAsleepTime: number;
  wakeUps: number;
  mood: number;
  energy: number;
}

interface ActiveSession {
  isActive: boolean;
  technique: SleepSession | null;
  timeRemaining: number;
  currentStep: number;
  progress: number;
}

interface AIInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'success';
  title: string;
  message: string;
  confidence: number;
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high';
  connectedTools: string[];
}

export default function SleepTherapy() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<ActiveSession>({
    isActive: false,
    technique: null,
    timeRemaining: 0,
    currentStep: 0,
    progress: 0
  });

  const [sleepProfile, setSleepProfile] = useState<SleepProfile>({
    currentIssues: ['Falling asleep', 'Night wakings'],
    sleepScore: 6.2,
    averageDuration: 6.5,
    insomniaLevel: 4,
    weeklyProgress: 15,
    lastSession: null,
    effectivenessByType: {
      'cbt-i': 7.8,
      'hygiene': 8.2,
      'routine': 7.5,
      'emergency': 6.9
    }
  });

  const [sleepData, setSleepData] = useState<SleepData>({
    quality: 6,
    duration: 6.5,
    fallAsleepTime: 25,
    wakeUps: 2,
    mood: 6,
    energy: 5
  });

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SleepSession | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // CBT-I and Sleep Therapy Sessions
  const sleepSessions: SleepSession[] = [
    {
      id: '1',
      technique: 'Progressive Muscle Relaxation',
      type: 'cbt-i',
      duration: 20,
      description: 'Tehnica PMR pentru relaxarea profundă a întregului corp',
      steps: [
        'Întinde-te confortabil în pat, pe spate',
        'Începe cu degetele de la picioare - încordează 5 sec, relaxează',
        'Continuă cu gambe - încordează, apoi relaxează complet',
        'Coapse și șolduri - tensionează, apoi eliberează',
        'Abdomen și piept - contractă, apoi relaxează',
        'Brațe și umeri - încordează, apoi eliberează',
        'Gât și față - tensionează, apoi relaxează total',
        'Rămâi în această stare de relaxare profundă'
      ],
      effectiveness: 8.5,
      difficulty: 'beginner',
      bestTime: 'bedtime',
      benefits: ['Reduce tensiunea musculară', 'Calmează sistemul nervos', 'Pregătește corpul pentru somn']
    },
    {
      id: '2',
      technique: 'Sleep Restriction Therapy',
      type: 'cbt-i',
      duration: 15,
      description: 'Restricția timpului petrecut în pat pentru eficiență maximă',
      steps: [
        'Calculează timpul mediu de somn din ultima săptămână',
        'Setează o fereastră de somn de aceeași durată',
        'Alege o oră fixă de trezire (ex: 7:00 AM)',
        'Calculează ora de culcare (ex: 7:00 - 6.5h = 00:30)',
        'Mergi la culcare DOAR la ora calculată',
        'Dacă nu adormi în 20 min, ieși din pat',
        'Revino doar când simți somnolența',
        'Menține ora de trezire fixă indiferent de ora de culcare'
      ],
      effectiveness: 9.2,
      difficulty: 'advanced',
      bestTime: 'evening',
      benefits: ['Crește eficiența somnului', 'Reduce timpul de adormire', 'Consolidează somnul']
    },
    {
      id: '3',
      technique: 'Stimulus Control Therapy',
      type: 'cbt-i',
      duration: 10,
      description: 'Reassociază patul cu somnul, nu cu vigilia',
      steps: [
        'Folosește patul DOAR pentru somn și intimitate',
        'Nu sta în pat dacă nu dormi',
        'Dacă nu adormi în 20 min, ieși din dormitor',
        'Fă o activitate liniștită în altă cameră',
        'Revino în pat doar când simți somnolența',
        'Repetă procesul de câte ori este necesar',
        'Menține un program fix de trezire',
        'Evită somnul de zi'
      ],
      effectiveness: 8.8,
      difficulty: 'intermediate',
      bestTime: 'anytime',
      benefits: ['Elimină anxietatea legată de culcare', 'Reconstruiește asocierile pozitive', 'Îmbunătățește latența somnului']
    },
    {
      id: '4',
      technique: 'Sleep Hygiene Protocol',
      type: 'hygiene',
      duration: 30,
      description: 'Rutina completă de igienă a somnului',
      steps: [
        'Cu 3 ore înainte: ultimul strop de cafea/alcool',
        'Cu 2 ore înainte: ultima masă consistentă',
        'Cu 1 oră înainte: stop ecrane și lumină albastră',
        'Setează temperatura camerei la 18-20°C',
        'Creează întuneric complet (perdele blackout)',
        'Elimină zgomotele (dopuri urechi/white noise)',
        'Rutina relaxării: baie caldă, ceai, carte',
        'Tehnici de respirație pentru calmarea minții'
      ],
      effectiveness: 8.0,
      difficulty: 'beginner',
      bestTime: 'evening',
      benefits: ['Optimizează mediul de somn', 'Stabilește rutina sănătoasă', 'Pregătește corp și minte']
    },
    {
      id: '5',
      technique: 'Cognitive Restructuring',
      type: 'cbt-i',
      duration: 25,
      description: 'Schimbă gândurile negative despre somn',
      steps: [
        'Identifică gândurile catastrofice despre somn',
        '"Dacă nu dorm, mâine va fi oribil" → "O noapte proastă nu e sfârșitul"',
        '"Nu pot funcționa fără 8 ore" → "Corpul se adaptează, am mai trecut prin asta"',
        '"Este 3 AM, sunt condamnat" → "Încă am timp să dorm, relaxez și las somnul să vină"',
        'Înlocuiește "trebuie să dorm" cu "permit corpului să se odihnească"',
        'Practică gândirea realistă și compassioasă',
        'Folosește afirmații pozitive și calmante',
        'Acceptă noaptea așa cum e, fără să forțezi'
      ],
      effectiveness: 8.7,
      difficulty: 'intermediate',
      bestTime: 'middle-night',
      benefits: ['Reduce anxietatea de performanță', 'Calmează mental chatter-ul', 'Promovează acceptarea']
    },
    {
      id: '6',
      technique: '4-7-8 Sleep Breathing',
      type: 'routine',
      duration: 10,
      description: 'Tehnica de respirație pentru adormire rapidă',
      steps: [
        'Poziția: întins pe spate, mâinile pe abdomen',
        'Expiră complet prin gură cu sunet "whoosh"',
        'Închide gura, inspiră prin nas numărul 4',
        'Ține respirația și numără până la 7',
        'Expiră prin gură cu "whoosh" numărul 8',
        'Repetă ciclul de 4 ori pentru început',
        'Crește treptat până la 8 cicluri',
        'Concentrează-te doar pe numărătoare'
      ],
      effectiveness: 7.9,
      difficulty: 'beginner',
      bestTime: 'bedtime',
      benefits: ['Activează sistemul parasimpatic', 'Reduce cortisol-ul', 'Adormire în 2-5 minute']
    }
  ];

  useEffect(() => {
    generateAIInsights();
    loadSleepProfile();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeSession.isActive && activeSession.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setActiveSession(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          const totalDuration = prev.technique?.duration ? prev.technique.duration * 60 : 1;
          const newProgress = ((totalDuration - newTimeRemaining) / totalDuration) * 100;

          if (newTimeRemaining <= 0) {
            completeSession();
            return {
              ...prev,
              isActive: false,
              timeRemaining: 0,
              progress: 100
            };
          }

          return {
            ...prev,
            timeRemaining: newTimeRemaining,
            progress: newProgress
          };
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession.isActive, activeSession.timeRemaining]);

  const loadSleepProfile = () => {
    const mockProfile: SleepProfile = {
      currentIssues: ['Falling asleep', 'Night wakings', 'Early morning awakening'],
      sleepScore: 6.2,
      averageDuration: 6.5,
      insomniaLevel: 4,
      weeklyProgress: 15,
      lastSession: '2025-01-14',
      effectivenessByType: {
        'cbt-i': 7.8,
        'hygiene': 8.2,
        'routine': 7.5,
        'emergency': 6.9
      }
    };

    setSleepProfile(mockProfile);
  };

  const generateAIInsights = () => {
    const insights: AIInsight[] = [
      {
        id: '1',
        type: 'warning',
        title: '🌙 Sleep Efficiency Alert',
        message: `Sleep efficiency-ul tău este de 78% (normal: 85%+). CBT-I Sleep Restriction poate îmbunătăți acest aspect.`,
        confidence: 0.91,
        actionable: true,
        urgency: 'medium',
        connectedTools: ['Sleep Tracker', 'Mood Tracker']
      },
      {
        id: '2',
        type: 'pattern',
        title: '😰 Stress-Sleep Correlation',
        message: `AI detectează corelație între stress înalt în Stress Management și latența somnului crescută. Recomand Cognitive Restructuring.`,
        confidence: 0.87,
        actionable: true,
        urgency: 'high',
        connectedTools: ['Stress Management', 'AI Therapist']
      },
      {
        id: '3',
        type: 'success',
        title: '🎯 Progressive Improvement',
        message: `Sleep Hygiene Protocol arată effectiveness de 8.2/10 pentru tine. Continuă cu rutina zilnică pentru rezultate optime.`,
        confidence: 0.94,
        actionable: false,
        urgency: 'low',
        connectedTools: ['Historical Data']
      }
    ];

    setAiInsights(insights);
  };

  const startSession = (session: SleepSession) => {
    setSelectedSession(session);
    setActiveSession({
      isActive: true,
      technique: session,
      timeRemaining: session.duration * 60,
      currentStep: 0,
      progress: 0
    });
    setShowSessionModal(true);
  };

  const completeSession = () => {
    if (!activeSession.technique) return;

    const sessionType = activeSession.technique.type;
    setSleepProfile(prev => ({
      ...prev,
      lastSession: new Date().toISOString().split('T')[0],
      effectivenessByType: {
        ...prev.effectivenessByType,
        [sessionType]: Math.min(10, prev.effectivenessByType[sessionType] + 0.1)
      },
      sleepScore: Math.min(10, prev.sleepScore + 0.2)
    }));

    setTimeout(() => {
      alert(`🌙 Sesiune completă! Sleep score îmbunătățit. Integrare cu Mood Tracker activă pentru monitorizarea progresului.`);
      
      setShowSessionModal(false);
      setActiveSession({
        isActive: false,
        technique: null,
        timeRemaining: 0,
        currentStep: 0,
        progress: 0
      });
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'pattern': return '🔍';
      case 'success': return '✅';
      case 'recommendation': return '💡';
      default: return '📊';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#06b6d4';
    }
  };

  if (loading) {
    return (
      <div className="sleep-therapy loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Se încarcă Sleep Therapy...</h2>
          <p>Pregătim CBT-I și protocoalele personalizate 🌙</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sleep-therapy">
      {/* Header */}
      <div className="sleep-header">
        <button 
          onClick={() => router.push('/dashboard/por-well')}
          className="back-btn"
        >
          ← Înapoi la PorWell
        </button>
        
        <div className="header-info">
          <h1>😴 Sleep Therapy Center</h1>
          <p>CBT-I & Sleep Optimization Protocol</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{sleepProfile.sleepScore.toFixed(1)}</span>
            <span className="stat-label">Sleep Score</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{sleepData.fallAsleepTime}min</span>
            <span className="stat-label">Fall Asleep</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">+{sleepProfile.weeklyProgress}%</span>
            <span className="stat-label">Weekly Progress</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sleep-content">
        {/* Sleep Profile Overview */}
        <div className="profile-overview">
          <div className="overview-card main">
            <div className="card-header">
              <h3>📊 Sleep Profile Analysis</h3>
              <span className="profile-status improving">✅ Improving</span>
            </div>
            
            <div className="profile-grid">
              <div className="profile-metric">
                <div className="metric-icon">⏱️</div>
                <div className="metric-info">
                  <h4>Average Duration</h4>
                  <p>{sleepProfile.averageDuration}h per night</p>
                </div>
              </div>
              <div className="profile-metric">
                <div className="metric-icon">🎯</div>
                <div className="metric-info">
                  <h4>Fall Asleep Time</h4>
                  <p>{sleepData.fallAsleepTime} minutes</p>
                </div>
              </div>
              <div className="profile-metric">
                <div className="metric-icon">🌙</div>
                <div className="metric-info">
                  <h4>Night Wakings</h4>
                  <p>{sleepData.wakeUps} times average</p>
                </div>
              </div>
              <div className="profile-metric">
                <div className="metric-icon">📈</div>
                <div className="metric-info">
                  <h4>Weekly Progress</h4>
                  <p>+{sleepProfile.weeklyProgress}% improvement</p>
                </div>
              </div>
            </div>

            <div className="current-issues">
              <h4>🎯 Current Sleep Issues</h4>
              <div className="issues-list">
                {sleepProfile.currentIssues.map((issue, index) => (
                  <span key={index} className="issue-tag">{issue}</span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="ai-insights-card">
            <div className="card-header">
              <h3>🤖 AI Sleep Insights</h3>
              <span className="integration-status connected">🔗 Ecosystem Connected</span>
            </div>
            
            <div className="insights-list">
              {aiInsights.map((insight) => (
                <div key={insight.id} className={`insight-item ${insight.type}`}>
                  <div className="insight-header">
                    <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                    <h4>{insight.title}</h4>
                    <span className="confidence-badge">{Math.round(insight.confidence * 100)}%</span>
                  </div>
                  <p className="insight-message">{insight.message}</p>
                  <div className="connected-tools">
                    {insight.connectedTools.map((tool, index) => (
                      <span key={index} className="tool-tag">{tool}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CBT-I Techniques */}
        <div className="techniques-section">
          <div className="section-header">
            <h3>🧘‍♀️ CBT-I & Sleep Therapy Sessions</h3>
            <p>Evidence-based techniques for sleep optimization</p>
          </div>

          <div className="techniques-grid">
            {sleepSessions.map((session) => (
              <div key={session.id} className="technique-card">
                <div className="technique-header">
                  <div className="technique-info">
                    <h4>{session.technique}</h4>
                    <p className="technique-description">{session.description}</p>
                  </div>
                  <div className="technique-meta">
                    <span className={`type-badge ${session.type}`}>{session.type.toUpperCase()}</span>
                    <span className="duration-badge">{session.duration}min</span>
                  </div>
                </div>
                
                <div className="technique-stats">
                  <div className="effectiveness-bar">
                    <span className="effectiveness-label">Effectiveness: {session.effectiveness}/10</span>
                    <div className="effectiveness-track">
                      <div 
                        className="effectiveness-fill" 
                        style={{ width: `${(session.effectiveness / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="technique-details">
                    <span className="difficulty-badge">{session.difficulty}</span>
                    <span className="timing-badge">{session.bestTime}</span>
                  </div>
                </div>

                <div className="technique-benefits">
                  <h5>Benefits:</h5>
                  <ul>
                    {session.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <button 
                  className="start-technique-btn"
                  onClick={() => startSession(session)}
                  disabled={activeSession.isActive}
                >
                  {activeSession.isActive ? 'Session în progres...' : `🌙 Start ${session.technique}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Modal */}
      {showSessionModal && selectedSession && (
        <div className="session-modal-overlay">
          <div className="session-modal">
            <div className="modal-header">
              <h3>{selectedSession.technique}</h3>
              <div className="modal-progress">
                <span>Progress: {Math.round(activeSession.progress)}%</span>
                <span>Time: {formatTime(activeSession.timeRemaining)}</span>
              </div>
              <button 
                className="close-modal"
                onClick={() => setShowSessionModal(false)}
              >
                ×
              </button>
            </div>

            <div className="session-progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${activeSession.progress}%` }}
              ></div>
            </div>

            <div className="session-guidance">
              <h4>Session Steps:</h4>
              <div className="steps-container">
                {selectedSession.steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`step-item ${index <= activeSession.currentStep ? 'completed' : ''} ${index === activeSession.currentStep ? 'active' : ''}`}
                  >
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="session-controls">
              <button 
                className="complete-btn"
                onClick={completeSession}
              >
                Complete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}