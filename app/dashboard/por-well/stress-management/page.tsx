'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.module.css';

interface StressTechnique {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  type: 'breathing' | 'progressive' | 'cognitive' | 'mindfulness' | 'movement' | 'emergency';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  effectiveness: number; // 1-10 pentru diferite tipuri de stress
  triggers: string[];
  instructions: string[];
  audioGuidance?: boolean;
  biometricOptimized: boolean;
}

interface UserStressProfile {
  currentLevel: number;
  weeklyAverage: number;
  topTriggers: string[];
  preferredTechniques: string[];
  effectiveness: Record<string, number>;
  lastSessionDate: string;
  totalSessions: number;
  emergencyUses: number;
  moodCorrelation: number;
}

interface StressSession {
  id: string;
  techniqueId: string;
  startTime: Date;
  duration: number;
  effectiveness: number;
  stressBefore: number;
  stressAfter: number;
  heartRateBefore: number;
  heartRateAfter: number;
  notes: string;
}

interface AIStressInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'success';
  title: string;
  message: string;
  confidence: number;
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  connectedTools: string[];
}

interface EcosystemData {
  moodData: {
    currentMood: number;
    stressLevel: number;
    energyLevel: number;
    lastEntry: string;
    weeklyTrend: 'improving' | 'stable' | 'declining';
  };
  therapyData: {
    lastSession: string;
    topConcerns: string[];
    suggestedTechniques: string[];
    crisisRisk: 'low' | 'medium' | 'high';
  };
  meditationData: {
    totalSessions: number;
    averageHeartRate: number;
    calmnessTrend: number;
    preferredTypes: string[];
  };
}

export default function StressManagement() {
  const router = useRouter();
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartRateSimRef = useRef<NodeJS.Timeout | null>(null);
  
  // Simulated ecosystem integration data
  const [ecosystemData] = useState<EcosystemData>({
    moodData: {
      currentMood: 5.8,
      stressLevel: 7.2,
      energyLevel: 4.1,
      lastEntry: '2025-01-15',
      weeklyTrend: 'declining'
    },
    therapyData: {
      lastSession: '2025-01-14',
      topConcerns: ['Work pressure', 'Sleep issues', 'Time management'],
      suggestedTechniques: ['breathing', 'progressive'],
      crisisRisk: 'medium'
    },
    meditationData: {
      totalSessions: 47,
      averageHeartRate: 68,
      calmnessTrend: 78,
      preferredTypes: ['mindfulness', 'breathing']
    }
  });

  const [userStressProfile, setUserStressProfile] = useState<UserStressProfile>({
    currentLevel: 7.2,
    weeklyAverage: 6.8,
    topTriggers: ['Work stress', 'Lack of sleep', 'Time pressure'],
    preferredTechniques: ['breathing', 'progressive'],
    effectiveness: {
      'breathing': 8.5,
      'progressive': 7.8,
      'cognitive': 6.2,
      'mindfulness': 8.1
    },
    lastSessionDate: '2025-01-14',
    totalSessions: 23,
    emergencyUses: 3,
    moodCorrelation: 0.85
  });

  const [currentHeartRate, setCurrentHeartRate] = useState(78);
  const [stressIndicators, setStressIndicators] = useState({
    tension: 7,
    anxiety: 6,
    overwhelm: 8,
    irritability: 5
  });

  const [activeSession, setActiveSession] = useState<{
    isActive: boolean;
    technique: StressTechnique | null;
    timeRemaining: number;
    currentStep: number;
    stressBefore: number;
  }>({
    isActive: false,
    technique: null,
    timeRemaining: 0,
    currentStep: 0,
    stressBefore: 0
  });

  const [aiInsights, setAiInsights] = useState<AIStressInsight[]>([]);
  const [selectedTechnique, setSelectedTechnique] = useState<StressTechnique | null>(null);
  const [showEmergencyProtocol, setShowEmergencyProtocol] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  const stressTechniques: StressTechnique[] = [
    {
      id: 'emergency-reset',
      name: '🆘 Emergency Reset Protocol',
      description: 'Protocol de urgență pentru stress extrem și panic attacks',
      duration: 3,
      type: 'emergency',
      difficulty: 'beginner',
      effectiveness: 9,
      triggers: ['Panic attack', 'Extreme stress', 'Overwhelm'],
      instructions: [
        'STOP tot ce faci și recunoaște starea',
        'Respiră profund 4-7-8: inspiră 4, ține 7, expiră 8',
        'Numără 5-4-3-2-1: 5 lucruri pe care le vezi, 4 pe care le auzi, 3 pe care le atingi, 2 pe care le miroși, 1 pe care îl guști',
        'Repetă mantra: "Această stare va trece. Sunt în siguranță."',
        'Contactează AI Therapist dacă simptomele persistă'
      ],
      audioGuidance: true,
      biometricOptimized: true
    },
    {
      id: 'box-breathing-advanced',
      name: '🫁 Box Breathing Advanced',
      description: 'Tehnica militară de respirație pentru control total al stresului',
      duration: 8,
      type: 'breathing',
      difficulty: 'intermediate',
      effectiveness: 8,
      triggers: ['Work stress', 'Before meetings', 'Performance anxiety'],
      instructions: [
        'Inspiră prin nas pentru 4 secunde',
        'Ține respirația pentru 4 secunde',
        'Expiră prin gură pentru 4 secunde',
        'Ține gol pentru 4 secunde',
        'Repetă ciclul, crescând gradual la 6-8 secunde'
      ],
      audioGuidance: true,
      biometricOptimized: true
    },
    {
      id: 'progressive-muscle',
      name: '💪 Progressive Muscle Relaxation',
      description: 'Relaxare progresivă pentru eliberarea tensiunii fizice',
      duration: 15,
      type: 'progressive',
      difficulty: 'beginner',
      effectiveness: 8,
      triggers: ['Physical tension', 'Chronic stress', 'End of day'],
      instructions: [
        'Întinde-te confortabil și închide ochii',
        'Începe cu degetele de la picioare - contractă 5 sec, relaxează',
        'Urcat progresiv: picioare, abdomen, brațe, umeri',
        'Contractă fața și fruntea, apoi relaxează complet',
        'Simte diferența între tensiune și relaxare'
      ],
      audioGuidance: true,
      biometricOptimized: true
    },
    {
      id: 'cognitive-reframe',
      name: '🧠 Cognitive Reframing',
      description: 'Schimbă perspectiva și gândurile care creează stress',
      duration: 10,
      type: 'cognitive',
      difficulty: 'advanced',
      effectiveness: 7,
      triggers: ['Negative thoughts', 'Catastrophizing', 'Worry loops'],
      instructions: [
        'Identifică gândul stresant exact',
        'Întreabă-te: "Este acest gând realist?"',
        'Caută 3 perspective alternative',
        'Găsește o versiune mai echilibrată a gândului',
        'Repetă noua perspectivă de 3 ori'
      ],
      audioGuidance: false,
      biometricOptimized: false
    },
    {
      id: 'mindful-body-scan',
      name: '🧘‍♀️ Mindful Body Scan',
      description: 'Scanare conștientă a corpului pentru detensionare',
      duration: 12,
      type: 'mindfulness',
      difficulty: 'intermediate',
      effectiveness: 8,
      triggers: ['Physical tension', 'Chronic stress', 'Sleep preparation'],
      instructions: [
        'Întinde-te și respiră natural',
        'Începe cu vârful capului, observă senzațiile',
        'Coboară lent prin corp: cap, gât, umeri, brațe',
        'Continuă: piept, abdomen, șolduri, picioare',
        'Observă fără să judeci, doar conștientizează'
      ],
      audioGuidance: true,
      biometricOptimized: true
    },
    {
      id: 'movement-release',
      name: '🕺 Movement Release',
      description: 'Mișcări simple pentru eliberarea stresului prin corp',
      duration: 7,
      type: 'movement',
      difficulty: 'beginner',
      effectiveness: 7,
      triggers: ['Sitting stress', 'Energy blocks', 'Physical stiffness'],
      instructions: [
        'Ridică-te și scutura-te ușor din umeri',
        'Rotații de cap lente în ambele direcții',
        'Întinde brațele și rotește-le',
        'Aplecări laterale și înainte',
        'Sări ușor pe loc pentru 30 secunde'
      ],
      audioGuidance: false,
      biometricOptimized: true
    },
    {
      id: 'workplace-ninja',
      name: '💼 Workplace Ninja',
      description: 'Tehnici discrete pentru stresul de la birou',
      duration: 5,
      type: 'breathing',
      difficulty: 'beginner',
      effectiveness: 6,
      triggers: ['Meeting stress', 'Deadline pressure', 'Email overwhelm'],
      instructions: [
        'Respirație 4-2-6 discretă: inspiră 4, ține 2, expiră 6',
        'Contractă și relaxează mușchii picioarelor sub birou',
        'Rotații de umeri subtile',
        'Mini-pause pentru a privi pe fereastră sau la distanță',
        'Mantra silențioasă: "Am control și calm"'
      ],
      audioGuidance: false,
      biometricOptimized: false
    },
    {
      id: 'sleep-stress-release',
      name: '😴 Sleep Stress Release',
      description: 'Eliberează stresul zilei pentru somn odihnitor',
      duration: 18,
      type: 'mindfulness',
      difficulty: 'beginner',
      effectiveness: 8,
      triggers: ['Racing thoughts', 'Day stress', 'Sleep anxiety'],
      instructions: [
        'Întinde-te în pat și respiră profund',
        'Vizualizează ziua ca pe un film care se termină',
        '"Eliberez" fiecare grijă cu fiecare expirație',
        'Scanează corpul și relaxează tensiunile',
        'Repetă: "Ziua s-a terminat, sunt în siguranță"'
      ],
      audioGuidance: true,
      biometricOptimized: true
    }
  ];

  useEffect(() => {
    generateAIInsights();
    startHeartRateSimulation();
    checkEmergencyProtocol();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeSession.isActive && activeSession.timeRemaining > 0) {
      sessionTimerRef.current = setInterval(() => {
        setActiveSession(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            completeSession();
            return { ...prev, timeRemaining: 0, isActive: false };
          }
          
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [activeSession.isActive, activeSession.timeRemaining]);

  const startHeartRateSimulation = () => {
    heartRateSimRef.current = setInterval(() => {
      if (!activeSession.isActive) {
        // Normal variation
        setCurrentHeartRate(prev => {
          const baseRate = ecosystemData.moodData.stressLevel > 7 ? 80 : 72;
          const variation = (Math.random() - 0.5) * 6;
          return Math.max(60, Math.min(100, baseRate + variation));
        });
      } else {
        // During session - simulate improvement
        setCurrentHeartRate(prev => {
          const targetRate = 65;
          const diff = prev - targetRate;
          return prev - (diff * 0.1);
        });
      }
    }, 3000);

    return () => {
      if (heartRateSimRef.current) {
        clearInterval(heartRateSimRef.current);
      }
    };
  };

  const checkEmergencyProtocol = () => {
    const { stressLevel } = ecosystemData.moodData;
    const { crisisRisk } = ecosystemData.therapyData;
    
    if (stressLevel >= 8 || crisisRisk === 'high') {
      setShowEmergencyProtocol(true);
    }
  };

  const generateAIInsights = () => {
    const insights: AIStressInsight[] = [];
    
    // Cross-ecosystem analysis
    const { moodData, therapyData, meditationData } = ecosystemData;
    
    // Critical stress insight
    if (moodData.stressLevel >= 7) {
      insights.push({
        id: '1',
        type: 'warning',
        title: '⚠️ Stress Level Critic',
        message: `Stress-ul tău actual (${moodData.stressLevel}/10) depășește pragul recomandat. Mood Tracker-ul arată o tendință de scădere în ultimele zile.`,
        confidence: 0.92,
        actionable: true,
        urgency: 'high',
        connectedTools: ['Mood Tracker', 'AI Therapist']
      });
    }

    // Therapy integration insight
    if (therapyData.topConcerns.includes('Work pressure')) {
      insights.push({
        id: '2',
        type: 'recommendation',
        title: '💼 Work Stress Pattern',
        message: `AI Therapist-ul a identificat "Work pressure" ca preocupare majoră. Recomand tehnica "Workplace Ninja" pentru management în timp real.`,
        confidence: 0.87,
        actionable: true,
        urgency: 'medium',
        connectedTools: ['AI Therapist', 'Meditation Center']
      });
    }

    // Meditation correlation
    if (meditationData.averageHeartRate > 70 && meditationData.calmnessTrend < 80) {
      insights.push({
        id: '3',
        type: 'pattern',
        title: '🧘‍♀️ Meditation Enhancement',
        message: `Datele din Meditation Center arată heart rate mediu ridicat (${meditationData.averageHeartRate} BPM). Tehnicile de breathing pot optimiza sesiunile.`,
        confidence: 0.84,
        actionable: true,
        urgency: 'medium',
        connectedTools: ['Meditation Center', 'Biometrics']
      });
    }

    // Success pattern
    if (userStressProfile.effectiveness['breathing'] > 8) {
      insights.push({
        id: '4',
        type: 'success',
        title: '🎯 Técnica de Succes',
        message: `Breathing exercises au effectiveness de ${userStressProfile.effectiveness['breathing']}/10 pentru tine. Continuă să le folosești zilnic!`,
        confidence: 0.95,
        actionable: false,
        urgency: 'low',
        connectedTools: ['Historical Data']
      });
    }

    // Sleep correlation warning
    if (therapyData.topConcerns.includes('Sleep issues') && moodData.stressLevel > 6) {
      insights.push({
        id: '5',
        type: 'warning',
        title: '😴 Sleep-Stress Cycle',
        message: 'AI detectează ciclul vicios: stress → somn prost → mai mult stress. Folosește "Sleep Stress Release" în fiecare seară.',
        confidence: 0.89,
        actionable: true,
        urgency: 'high',
        connectedTools: ['AI Therapist', 'Sleep Tracking']
      });
    }

    setAiInsights(insights);
  };

  const startTechnique = (technique: StressTechnique) => {
    const currentStress = stressIndicators.tension + stressIndicators.anxiety + stressIndicators.overwhelm + stressIndicators.irritability;
    const averageStress = currentStress / 4;

    setActiveSession({
      isActive: true,
      technique,
      timeRemaining: technique.duration * 60,
      currentStep: 0,
      stressBefore: averageStress
    });

    setShowTechniqueModal(true);
  };

  const completeSession = () => {
    if (!activeSession.technique) return;

    // Simulate stress improvement
    const improvement = Math.random() * 2 + 1; // 1-3 points improvement
    const newStressLevel = Math.max(1, userStressProfile.currentLevel - improvement);
    
    // Update stress indicators
    setStressIndicators(prev => ({
      tension: Math.max(1, prev.tension - improvement * 0.8),
      anxiety: Math.max(1, prev.anxiety - improvement * 0.9),
      overwhelm: Math.max(1, prev.overwhelm - improvement * 1.2),
      irritability: Math.max(1, prev.irritability - improvement * 0.7)
    }));

    // Update profile
    setUserStressProfile(prev => ({
      ...prev,
      currentLevel: newStressLevel,
      totalSessions: prev.totalSessions + 1,
      lastSessionDate: new Date().toISOString().split('T')[0],
      effectiveness: {
        ...prev.effectiveness,
        [activeSession.technique!.type]: Math.min(10, prev.effectiveness[activeSession.technique!.type] + 0.1)
      }
    }));

    // Success feedback
    setTimeout(() => {
      alert(`🎉 Sesiune completă! Stress redus cu ${improvement.toFixed(1)} puncte. Integration cu Mood Tracker activă.`);
      
      // Simulate ecosystem update
      setTimeout(() => {
        alert(`📈 UPDATE: Mood îmbunătățit automat în Mood Tracker. AI Therapist notificat de progres!`);
      }, 1000);
    }, 500);

    setShowTechniqueModal(false);
    setActiveSession({
      isActive: false,
      technique: null,
      timeRemaining: 0,
      currentStep: 0,
      stressBefore: 0
    });
  };

  const getStressLevel = () => {
    const avgStress = (stressIndicators.tension + stressIndicators.anxiety + stressIndicators.overwhelm + stressIndicators.irritability) / 4;
    return Math.round(avgStress * 10) / 10;
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return '#22c55e';
    if (level <= 5) return '#f59e0b';
    if (level <= 7) return '#ef4444';
    return '#dc2626';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#06b6d4';
    }
  };

  const filteredTechniques = stressTechniques.filter(technique => {
    if (filterType === 'all') return true;
    if (filterType === 'recommended') {
      return ecosystemData.therapyData.suggestedTechniques.includes(technique.type);
    }
    return technique.type === filterType;
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="stress-management loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Se încarcă Stress Management...</h2>
          <p>Analizez ecosistemul și generez recomandări 💆‍♀️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stress-management">
      {/* Emergency Protocol Banner */}
      {showEmergencyProtocol && (
        <div className="emergency-banner">
          <div className="emergency-content">
            <span className="emergency-icon">🚨</span>
            <div className="emergency-text">
              <strong>Protocol de Urgență Activat</strong>
              <p>Stress level critic detectat. Acces rapid la tehnici de urgență.</p>
            </div>
            <button 
              onClick={() => {
                const emergencyTech = stressTechniques.find(t => t.id === 'emergency-reset');
                if (emergencyTech) startTechnique(emergencyTech);
              }}
              className="emergency-action"
            >
              🆘 Start Emergency Reset
            </button>
            <button 
              onClick={() => setShowEmergencyProtocol(false)}
              className="emergency-close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="stress-header">
        <button 
          onClick={() => router.push('/dashboard/por-well')}
          className="back-btn"
        >
          ← Înapoi la PorWell
        </button>
        
        <div className="header-info">
          <h1>💆‍♀️ Stress Management</h1>
          <p>Toolkit AI-powered pentru gestionarea și reducerea stresului</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value" style={{color: getStressColor(getStressLevel())}}>
              {getStressLevel()}
            </span>
            <span className="stat-label">Current Stress</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Math.round(currentHeartRate)}</span>
            <span className="stat-label">Heart Rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userStressProfile.totalSessions}</span>
            <span className="stat-label">Total Sessions</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="stress-content">
        {/* Ecosystem Integration Overview */}
        <div className="ecosystem-overview">
          <div className="overview-card main">
            <div className="card-header">
              <h3>🔗 Ecosystem Integration Status</h3>
              <span className="integration-status connected">✅ Connected</span>
            </div>
            
            <div className="integration-grid">
              <div className="integration-item">
                <div className="integration-icon">📊</div>
                <div className="integration-info">
                  <h4>Mood Tracker</h4>
                  <p>Stress: {ecosystemData.moodData.stressLevel}/10</p>
                  <p>Trend: {ecosystemData.moodData.weeklyTrend}</p>
                </div>
                <div className={`integration-signal ${ecosystemData.moodData.weeklyTrend}`}>
                  {ecosystemData.moodData.weeklyTrend === 'improving' ? '📈' : 
                   ecosystemData.moodData.weeklyTrend === 'declining' ? '📉' : '📊'}
                </div>
              </div>
              
              <div className="integration-item">
                <div className="integration-icon">🤖</div>
                <div className="integration-info">
                  <h4>AI Therapist</h4>
                  <p>Last session: {ecosystemData.therapyData.lastSession}</p>
                  <p>Risk: {ecosystemData.therapyData.crisisRisk}</p>
                </div>
                <div className={`integration-signal ${ecosystemData.therapyData.crisisRisk}`}>
                  {ecosystemData.therapyData.crisisRisk === 'high' ? '🔴' : 
                   ecosystemData.therapyData.crisisRisk === 'medium' ? '🟡' : '🟢'}
                </div>
              </div>
              
              <div className="integration-item">
                <div className="integration-icon">🧘‍♀️</div>
                <div className="integration-info">
                  <h4>Meditation</h4>
                  <p>Sessions: {ecosystemData.meditationData.totalSessions}</p>
                  <p>Avg HR: {ecosystemData.meditationData.averageHeartRate}</p>
                </div>
                <div className="integration-signal good">💚</div>
              </div>
            </div>
          </div>

          {/* Real-time Stress Indicators */}
          <div className="stress-indicators-card">
            <div className="card-header">
              <h3>📊 Live Stress Indicators</h3>
              <span className="live-badge">🔴 LIVE</span>
            </div>
            
            <div className="indicators-grid">
              <div className="indicator">
                <div className="indicator-label">💪 Physical Tension</div>
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill tension"
                    style={{width: `${stressIndicators.tension * 10}%`}}
                  ></div>
                </div>
                <div className="indicator-value">{stressIndicators.tension.toFixed(1)}/10</div>
              </div>
              
              <div className="indicator">
                <div className="indicator-label">😰 Anxiety Level</div>
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill anxiety"
                    style={{width: `${stressIndicators.anxiety * 10}%`}}
                  ></div>
                </div>
                <div className="indicator-value">{stressIndicators.anxiety.toFixed(1)}/10</div>
              </div>
              
              <div className="indicator">
                <div className="indicator-label">🌊 Overwhelm</div>
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill overwhelm"
                    style={{width: `${stressIndicators.overwhelm * 10}%`}}
                  ></div>
                </div>
                <div className="indicator-value">{stressIndicators.overwhelm.toFixed(1)}/10</div>
              </div>
              
              <div className="indicator">
                <div className="indicator-label">😤 Irritability</div>
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill irritability"
                    style={{width: `${stressIndicators.irritability * 10}%`}}
                  ></div>
                </div>
                <div className="indicator-value">{stressIndicators.irritability.toFixed(1)}/10</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Cross-Ecosystem */}
        {aiInsights.length > 0 && (
          <div className="insights-section">
            <div className="section-header">
              <h3>🧠 AI Insights - Cross-Ecosystem Analysis</h3>
              <p>Analize inteligente bazate pe datele din toate tool-urile PorWell</p>
            </div>
            
            <div className="insights-grid">
              {aiInsights.map(insight => (
                <div key={insight.id} className={`insight-card ${insight.type} ${insight.urgency}`}>
                  <div className="insight-header">
                    <div className="insight-title-section">
                      <h4>{insight.title}</h4>
                      <div className="connected-tools">
                        {insight.connectedTools.map((tool, index) => (
                          <span key={index} className="tool-tag">{tool}</span>
                        ))}
                      </div>
                    </div>
                    <div className="insight-meta">
                      <div 
                        className="urgency-badge"
                        style={{backgroundColor: getUrgencyColor(insight.urgency)}}
                      >
                        {insight.urgency}
                      </div>
                      <div className="confidence-score">
                        {Math.round(insight.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="insight-message">
                    <p>{insight.message}</p>
                  </div>
                  
                  {insight.actionable && (
                    <div className="insight-actions">
                      <Link href="/dashboard/por-well/ai-therapist" className="action-link">
                        🤖 Discută cu AI
                      </Link>
                      <Link href="/dashboard/por-well/mood-tracker" className="action-link">
                        📊 Update Mood
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Techniques Library */}
        <div className="techniques-section">
          <div className="section-header">
            <h3>🛠️ Stress Techniques Library</h3>
            <div className="techniques-filters">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">Toate tehnicile</option>
                <option value="recommended">🤖 AI Recommended</option>
                <option value="emergency">🆘 Emergency</option>
                <option value="breathing">🫁 Breathing</option>
                <option value="progressive">💪 Progressive</option>
                <option value="cognitive">🧠 Cognitive</option>
                <option value="mindfulness">🧘‍♀️ Mindfulness</option>
                <option value="movement">🕺 Movement</option>
              </select>
            </div>
          </div>
          
          <div className="techniques-grid">
            {filteredTechniques.map(technique => (
              <div key={technique.id} className={`technique-card ${technique.type}`}>
                <div className="technique-header">
                  <div className="technique-type">
                    <span className="type-badge" style={{
                      backgroundColor: technique.type === 'emergency' ? '#dc2626' :
                                    technique.type === 'breathing' ? '#06b6d4' :
                                    technique.type === 'progressive' ? '#8b5cf6' :
                                    technique.type === 'cognitive' ? '#f59e0b' :
                                    technique.type === 'mindfulness' ? '#22c55e' : '#ec4899'
                    }}>
                      {technique.type}
                    </span>
                    <span className="difficulty-badge">
                      {technique.difficulty}
                    </span>
                  </div>
                  
                  {ecosystemData.therapyData.suggestedTechniques.includes(technique.type) && (
                    <div className="ai-recommended">
                      🤖 AI Recommended
                    </div>
                  )}
                </div>
                
                <div className="technique-info">
                  <h4>{technique.name}</h4>
                  <p className="technique-description">{technique.description}</p>
                  
                  <div className="technique-meta">
                    <span className="duration">⏱️ {technique.duration} min</span>
                    <span className="effectiveness">
                      📊 {technique.effectiveness}/10 effectiveness
                    </span>
                    {technique.audioGuidance && (
                      <span className="audio">🎧 Audio guided</span>
                    )}
                    {technique.biometricOptimized && (
                      <span className="biometric">💓 Biometric optimized</span>
                    )}
                  </div>
                </div>
                
                <div className="technique-triggers">
                  <div className="triggers-label">Best for:</div>
                  <div className="triggers-list">
                    {technique.triggers.slice(0, 2).map((trigger, index) => (
                      <span key={index} className="trigger-tag">{trigger}</span>
                    ))}
                    {technique.triggers.length > 2 && (
                      <span className="trigger-more">+{technique.triggers.length - 2}</span>
                    )}
                  </div>
                </div>
                
                <div className="technique-actions">
                  <button 
                    onClick={() => {
                      setSelectedTechnique(technique);
                      // Could show preview
                    }}
                    className="preview-btn"
                  >
                    👁️ Preview
                  </button>
                  <button 
                    onClick={() => startTechnique(technique)}
                    className={`start-btn ${technique.type === 'emergency' ? 'emergency' : ''}`}
                  >
                    {technique.type === 'emergency' ? '🆘' : '▶️'} Start
                  </button>
                </div>
                
                {userStressProfile.effectiveness[technique.type] && (
                  <div className="personal-effectiveness">
                    <span>Your effectiveness: {userStressProfile.effectiveness[technique.type].toFixed(1)}/10</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access Tools */}
        <div className="quick-tools-section">
          <h3>⚡ Quick Access</h3>
          <div className="quick-tools">
            <button 
              onClick={() => {
                const emergencyTech = stressTechniques.find(t => t.id === 'emergency-reset');
                if (emergencyTech) startTechnique(emergencyTech);
              }}
              className="quick-tool emergency"
            >
              <span className="tool-icon">🆘</span>
              <span>Emergency Reset</span>
            </button>
            
            <button 
              onClick={() => {
                const breathingTech = stressTechniques.find(t => t.id === 'box-breathing-advanced');
                if (breathingTech) startTechnique(breathingTech);
              }}
              className="quick-tool"
            >
              <span className="tool-icon">🫁</span>
              <span>Quick Breathing</span>
            </button>
            
            <Link href="/dashboard/por-well/mood-tracker" className="quick-tool">
              <span className="tool-icon">📊</span>
              <span>Update Mood</span>
            </Link>
            
            <Link href="/dashboard/por-well/ai-therapist" className="quick-tool">
              <span className="tool-icon">🤖</span>
              <span>Chat AI</span>
            </Link>
            
            <Link href="/dashboard/por-well/meditation" className="quick-tool">
              <span className="tool-icon">🧘‍♀️</span>
              <span>Meditation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Technique Session Modal */}
      {showTechniqueModal && activeSession.technique && (
        <div className="technique-modal">
          <div className="modal-content">
            <div className="session-in-progress">
              <div className="session-header">
                <h3>{activeSession.technique.name}</h3>
                <button 
                  onClick={() => setShowTechniqueModal(false)}
                  className="close-session-btn"
                >
                  ⏹️ Stop
                </button>
              </div>
              
              <div className="session-timer">
                <div className="timer-display">
                  <span className="time-remaining">{formatTime(activeSession.timeRemaining)}</span>
                  <span className="time-label">remaining</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${((activeSession.technique.duration * 60 - activeSession.timeRemaining) / (activeSession.technique.duration * 60)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="current-instruction">
                <h4>Step {activeSession.currentStep + 1}:</h4>
                <p>{activeSession.technique.instructions[activeSession.currentStep] || activeSession.technique.instructions[0]}</p>
              </div>
              
              <div className="session-biometrics">
                <div className="biometric-item">
                  <span className="bio-label">💓 Heart Rate</span>
                  <span className="bio-value">{Math.round(currentHeartRate)} BPM</span>
                </div>
                <div className="biometric-item">
                  <span className="bio-label">😌 Stress Level</span>
                  <span className="bio-value">{getStressLevel()}/10</span>
                </div>
              </div>
              
              <div className="technique-guidance">
                {activeSession.technique.audioGuidance && (
                  <div className="audio-controls">
                    🎧 Audio guidance active
                  </div>
                )}
                <div className="breathing-visual">
                  <div className="breath-circle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}