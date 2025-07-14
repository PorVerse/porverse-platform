'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.module.css';

// TypeScript Interfaces
interface AnxietyTechnique {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  type: 'grounding' | 'breathing' | 'cognitive' | 'progressive' | 'emergency' | 'mindfulness';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  effectiveness: number; // 1-10
  triggers: string[];
  instructions: string[];
  panicAttackSafe: boolean;
  immediateRelief: boolean;
}

interface AnxietyProfile {
  currentLevel: number;
  weeklyAverage: number;
  topTriggers: string[];
  preferredTechniques: string[];
  effectiveness: Record<string, number>;
  lastSessionDate: string;
  totalSessions: number;
  panicAttacks: number;
  safeSpaceActivations: number;
}

interface AnxietySession {
  id: string;
  techniqueId: string;
  startTime: Date;
  duration: number;
  effectiveness: number;
  anxietyBefore: number;
  anxietyAfter: number;
  heartRateBefore: number;
  heartRateAfter: number;
  triggers: string[];
  notes: string;
}

interface AIAnxietyInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'success' | 'emergency';
  title: string;
  message: string;
  confidence: number;
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  connectedTools: string[];
}

interface ActiveSession {
  isActive: boolean;
  technique: AnxietyTechnique | null;
  timeRemaining: number;
  currentStep: number;
  anxietyBefore: number;
  isPanicMode: boolean;
}

interface EcosystemData {
  moodData: {
    currentMood: number;
    anxietyLevel: number;
    energyLevel: number;
    lastEntry: string;
    weeklyTrend: 'improving' | 'stable' | 'declining';
  };
  stressData: {
    currentLevel: number;
    topTriggers: string[];
    lastSession: string;
    techniques: string[];
  };
  therapyData: {
    lastSession: string;
    topConcerns: string[];
    suggestedTechniques: string[];
    anxietyRisk: 'low' | 'medium' | 'high' | 'critical';
  };
}

export default function AnxietyHelper() {
  const router = useRouter();
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [anxietyProfile, setAnxietyProfile] = useState<AnxietyProfile>({
    currentLevel: 6.2,
    weeklyAverage: 5.8,
    topTriggers: ['Social situations', 'Work pressure', 'Health concerns'],
    preferredTechniques: ['grounding', 'breathing'],
    effectiveness: {
      grounding: 8.4,
      breathing: 7.8,
      cognitive: 7.2,
      progressive: 6.9,
      emergency: 8.9,
      mindfulness: 7.5
    },
    lastSessionDate: '2025-01-14',
    totalSessions: 34,
    panicAttacks: 3,
    safeSpaceActivations: 12
  });

  const [activeSession, setActiveSession] = useState<ActiveSession>({
    isActive: false,
    technique: null,
    timeRemaining: 0,
    currentStep: 0,
    anxietyBefore: 0,
    isPanicMode: false
  });

  const [anxietyIndicators, setAnxietyIndicators] = useState({
    physical: 4.2,
    emotional: 5.8,
    cognitive: 6.1,
    behavioral: 3.9
  });

  const [currentHeartRate, setCurrentHeartRate] = useState(78);
  const [aiInsights, setAiInsights] = useState<AIAnxietyInsight[]>([]);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [showPanicProtocol, setShowPanicProtocol] = useState(false);
  const [showSafeSpace, setShowSafeSpace] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Mock ecosystem data
  const [ecosystemData] = useState<EcosystemData>({
    moodData: {
      currentMood: 6.2,
      anxietyLevel: 6.8,
      energyLevel: 4.2,
      lastEntry: '2025-01-15',
      weeklyTrend: 'declining'
    },
    stressData: {
      currentLevel: 7.1,
      topTriggers: ['Work deadlines', 'Social situations'],
      lastSession: '2025-01-14',
      techniques: ['breathing', 'progressive']
    },
    therapyData: {
      lastSession: '2025-01-13',
      topConcerns: ['Social anxiety', 'Performance anxiety', 'Health anxiety'],
      suggestedTechniques: ['grounding', 'cognitive'],
      anxietyRisk: 'high'
    }
  });

  // Anxiety management techniques
  const anxietyTechniques: AnxietyTechnique[] = [
    {
      id: '1',
      name: '🌊 5-4-3-2-1 Grounding',
      description: 'Tehnica fundamentală pentru revenirea în prezent și calmarea anxietății',
      duration: 5,
      type: 'grounding',
      difficulty: 'beginner',
      effectiveness: 9.1,
      triggers: ['Panic attacks', 'Social anxiety', 'Overwhelm'],
      instructions: [
        'Identifică 5 lucruri pe care le vezi în jurul tău',
        'Numește 4 lucruri pe care le poți atinge',
        'Ascultă și identifică 3 sunete diferite',
        'Găsește 2 mirosuri pe care le poți simți',
        'Identifică 1 gust în gura ta',
        'Respiră adânc și observă cum te simți acum',
        'Repetă procesul dacă este necesar'
      ],
      panicAttackSafe: true,
      immediateRelief: true
    },
    {
      id: '2',
      name: '🫁 4-7-8 Calming Breath',
      description: 'Respirație specializată pentru calmarea rapidă a sistemului nervos',
      duration: 8,
      type: 'breathing',
      difficulty: 'beginner',
      effectiveness: 8.7,
      triggers: ['Panic attacks', 'Sleep anxiety', 'Performance anxiety'],
      instructions: [
        'Așază-te confortabil cu spatele drept',
        'Expiră complet prin gură cu sunet "whoosh"',
        'Închide gura, inspiră prin nas 4 secunde',
        'Ține respirația 7 secunde',
        'Expiră prin gură 8 secunde cu "whoosh"',
        'Repetă ciclul de 4 ori pentru început',
        'Crește gradual la 8 cicluri pe măsură ce te obișnuiești',
        'Concentrează-te doar pe numărătoare'
      ],
      panicAttackSafe: true,
      immediateRelief: true
    },
    {
      id: '3',
      name: '🧠 Cognitive Restructuring',
      description: 'Schimbă gândurile catastrofice și anxioase cu altele realiste',
      duration: 15,
      type: 'cognitive',
      difficulty: 'intermediate',
      effectiveness: 8.3,
      triggers: ['Catastrophic thinking', 'Health anxiety', 'Social anxiety'],
      instructions: [
        'Identifică gândul anxios exact',
        'Întreabă-te: "Este acest gând realist sau catastrofic?"',
        'Caută dovezi pentru și împotriva gândului',
        'Reformulează: "Ce ar spune un prieten în situația mea?"',
        'Creează un gând alternativ, realist și calm',
        'Repetă noul gând de 3 ori',
        'Observă cum se schimbă senzația în corp',
        'Practică noul gând când apare anxietatea'
      ],
      panicAttackSafe: false,
      immediateRelief: false
    },
    {
      id: '4',
      name: '💪 Progressive Muscle Release',
      description: 'Eliberează tensiunea fizică cauzată de anxietate',
      duration: 12,
      type: 'progressive',
      difficulty: 'beginner',
      effectiveness: 7.9,
      triggers: ['Physical tension', 'Chronic anxiety', 'Sleep anxiety'],
      instructions: [
        'Întinde-te sau așază-te confortabil',
        'Începe cu degetele de la picioare - contractă 5 sec',
        'Eliberează și observă relaxarea 10 secunde',
        'Urcat progresiv: picioare, coapse, abdomen',
        'Continuă cu brațe, umeri, gât și față',
        'Contractă tot corpul 5 secunde',
        'Eliberează total și respiră profund',
        'Rămâi în starea de relaxare 2 minute'
      ],
      panicAttackSafe: true,
      immediateRelief: false
    },
    {
      id: '5',
      name: '🆘 Panic Attack Emergency Protocol',
      description: 'Protocol special pentru gestionarea atacurilor de panică',
      duration: 10,
      type: 'emergency',
      difficulty: 'beginner',
      effectiveness: 9.3,
      triggers: ['Panic attacks', 'Intense fear', 'Physical symptoms'],
      instructions: [
        'STOP - recunoaște că este un atac de panică temporar',
        'Spune-ți: "Sunt în siguranță, va trece în 10-20 minute"',
        'Concentrează-te pe respirația naturală, nu o forța',
        'Numără înapoi de la 100 cu 7: 100, 93, 86, 79...',
        'Ține un obiect în mână și descrie-i textura',
        'Mișcă-te ușor: mergi sau clătină-te blând',
        'Contactează o persoană de încredere dacă este necesar',
        'Aplică gheață pe încheieturile mâinilor'
      ],
      panicAttackSafe: true,
      immediateRelief: true
    },
    {
      id: '6',
      name: '🌸 Mindful Acceptance',
      description: 'Acceptă anxietatea fără să lupți cu ea, reducând intensitatea',
      duration: 20,
      type: 'mindfulness',
      difficulty: 'advanced',
      effectiveness: 8.1,
      triggers: ['Persistent anxiety', 'Anticipatory anxiety', 'GAD'],
      instructions: [
        'Recunoaște prezența anxietății fără judecată',
        'Spune: "Văd că anxietatea este aici acum"',
        'Observă senzațiile fizice fără să le schimbi',
        'Respiră în jurul anxietății, nu împotriva ei',
        'Vizualizează anxietatea ca un nor care trece',
        'Trimite compasiune către tine însuți',
        'Întreabă-te: "Ce am nevoie să aud acum?"',
        'Rămâi cu senzația până se diminuează natural'
      ],
      panicAttackSafe: false,
      immediateRelief: false
    },
    {
      id: '7',
      name: '📱 Digital Anxiety Detox',
      description: 'Tehnici pentru gestionarea anxietății cauzate de tehnologie',
      duration: 25,
      type: 'mindfulness',
      difficulty: 'intermediate',
      effectiveness: 7.4,
      triggers: ['Social media anxiety', 'FOMO', 'Information overload'],
      instructions: [
        'Pune telefonul în modul avion pentru 25 minute',
        'Observă prima reacție de a verifica dispozitivul',
        'Respiră profund de 3 ori când simți impulsul',
        'Concentrează-te pe mediul fizic din jurul tău',
        'Fă o activitate tactilă: desenează, modelează, gătește',
        'Observă cum se schimbă nivelul de anxietate',
        'Stabilește intenții pentru următoarea utilizare',
        'Creează un plan de utilizare conștientă'
      ],
      panicAttackSafe: true,
      immediateRelief: false
    }
  ];

  useEffect(() => {
    generateAIInsights();
    simulateHeartRateMonitoring();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeSession.isActive && activeSession.timeRemaining > 0) {
      sessionTimerRef.current = setInterval(() => {
        setActiveSession(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            completeSession();
            return { ...prev, isActive: false, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    } else if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [activeSession.isActive, activeSession.timeRemaining]);

  const generateAIInsights = () => {
    const insights: AIAnxietyInsight[] = [];

    // Critical anxiety level warning
    if (anxietyProfile.currentLevel > 7) {
      insights.push({
        id: '1',
        type: 'emergency',
        title: '🚨 Anxiety Level Critical',
        message: `Nivelul de anxietate (${anxietyProfile.currentLevel}/10) este critic. Recomand activarea protocolului de urgență și contactarea AI Therapist.`,
        confidence: 0.95,
        actionable: true,
        urgency: 'critical',
        connectedTools: ['Emergency Protocol', 'AI Therapist']
      });
    }

    // Mood correlation insight
    if (ecosystemData.moodData.weeklyTrend === 'declining' && ecosystemData.moodData.anxietyLevel > 6) {
      insights.push({
        id: '2',
        type: 'pattern',
        title: '📉 Mood-Anxiety Correlation',
        message: `Mood Tracker arată o scădere în paralel cu creșterea anxietății. Recomand sesiuni zilnice de grounding.`,
        confidence: 0.88,
        actionable: true,
        urgency: 'high',
        connectedTools: ['Mood Tracker', 'Grounding Techniques']
      });
    }

    // Stress-anxiety cycle
    if (ecosystemData.stressData.currentLevel > 6.5 && anxietyProfile.currentLevel > 6) {
      insights.push({
        id: '3',
        type: 'warning',
        title: '🌀 Stress-Anxiety Cycle',
        message: `Detectez ciclu vicios între stress (${ecosystemData.stressData.currentLevel}/10) și anxietate. Integration cu Stress Management activă.`,
        confidence: 0.91,
        actionable: true,
        urgency: 'high',
        connectedTools: ['Stress Management', 'Breathing Techniques']
      });
    }

    // Success pattern
    if (anxietyProfile.effectiveness['grounding'] > 8) {
      insights.push({
        id: '4',
        type: 'success',
        title: '🎯 Grounding Mastery',
        message: `Tehnicile de grounding au 8.4/10 effectiveness pentru tine. Continuă să le folosești ca prima opțiune.`,
        confidence: 0.97,
        actionable: false,
        urgency: 'low',
        connectedTools: ['Historical Data']
      });
    }

    // Therapy integration
    if (ecosystemData.therapyData.anxietyRisk === 'high') {
      insights.push({
        id: '5',
        type: 'recommendation',
        title: '🤖 AI Therapist Alert',
        message: `AI Therapist a identificat risc înalt de anxietate. Recomand sesiuni cognitive restructuring și monitoring îmbunătățit.`,
        confidence: 0.86,
        actionable: true,
        urgency: 'medium',
        connectedTools: ['AI Therapist', 'Cognitive Techniques']
      });
    }

    setAiInsights(insights);
  };

  const simulateHeartRateMonitoring = () => {
    const interval = setInterval(() => {
      if (!activeSession.isActive) {
        setCurrentHeartRate(prev => {
          const anxietyFactor = anxietyProfile.currentLevel / 10;
          const baseRate = 60 + (anxietyFactor * 30);
          const variation = (Math.random() - 0.5) * 8;
          return Math.max(50, Math.min(120, Math.round(baseRate + variation)));
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const startTechnique = (technique: AnxietyTechnique) => {
    const currentAnxiety = (anxietyIndicators.physical + anxietyIndicators.emotional + anxietyIndicators.cognitive + anxietyIndicators.behavioral) / 4;

    setActiveSession({
      isActive: true,
      technique,
      timeRemaining: technique.duration * 60,
      currentStep: 0,
      anxietyBefore: currentAnxiety,
      isPanicMode: technique.type === 'emergency'
    });

    setShowTechniqueModal(true);
  };

  const activatePanicProtocol = () => {
    const panicTechnique = anxietyTechniques.find(t => t.id === '5');
    if (panicTechnique) {
      startTechnique(panicTechnique);
    }
    setShowPanicProtocol(false);
  };

  const activateSafeSpace = () => {
    setShowSafeSpace(true);
    setAnxietyProfile(prev => ({
      ...prev,
      safeSpaceActivations: prev.safeSpaceActivations + 1
    }));
  };

  const completeSession = () => {
    if (!activeSession.technique) return;

    // Simulate anxiety improvement
    const improvement = Math.random() * 2.5 + 1.5; // 1.5-4 points improvement
    const newAnxietyLevel = Math.max(1, anxietyProfile.currentLevel - improvement);
    
    // Update anxiety indicators
    setAnxietyIndicators(prev => ({
      physical: Math.max(1, prev.physical - improvement * 0.9),
      emotional: Math.max(1, prev.emotional - improvement * 1.1),
      cognitive: Math.max(1, prev.cognitive - improvement * 1.2),
      behavioral: Math.max(1, prev.behavioral - improvement * 0.8)
    }));

    // Update profile
    setAnxietyProfile(prev => ({
      ...prev,
      currentLevel: newAnxietyLevel,
      totalSessions: prev.totalSessions + 1,
      lastSessionDate: new Date().toISOString().split('T')[0],
      effectiveness: {
        ...prev.effectiveness,
        [activeSession.technique!.type]: Math.min(10, prev.effectiveness[activeSession.technique!.type] + 0.1)
      }
    }));

    // Success feedback
    setTimeout(() => {
      alert(`🌟 Sesiune completă! Anxietate redusă cu ${improvement.toFixed(1)} puncte. Integration cu Mood Tracker activă.`);
      
      // Simulate ecosystem update
      setTimeout(() => {
        alert(`📱 UPDATE: Mood îmbunătățit în Mood Tracker. Stress Management notificat de progres!`);
      }, 1000);
    }, 500);

    setShowTechniqueModal(false);
    setActiveSession({
      isActive: false,
      technique: null,
      timeRemaining: 0,
      currentStep: 0,
      anxietyBefore: 0,
      isPanicMode: false
    });
  };

  const getAnxietyLevel = () => {
    const avgAnxiety = (anxietyIndicators.physical + anxietyIndicators.emotional + anxietyIndicators.cognitive + anxietyIndicators.behavioral) / 4;
    return Math.round(avgAnxiety * 10) / 10;
  };

  const getAnxietyColor = (level: number) => {
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

  const filteredTechniques = anxietyTechniques.filter(technique => {
    if (filterType === 'all') return true;
    if (filterType === 'panic-safe') return technique.panicAttackSafe;
    if (filterType === 'immediate') return technique.immediateRelief;
    return technique.type === filterType;
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="anxiety-helper loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Se încarcă Anxiety Helper...</h2>
          <p>Pregătim toolkit-ul personalizat anti-anxietate 🌸</p>
        </div>
      </div>
    );
  }

  return (
    <div className="anxiety-helper">
      {/* Emergency Panic Protocol Banner */}
      {showPanicProtocol && (
        <div className="panic-banner">
          <div className="panic-content">
            <span className="panic-icon">🆘</span>
            <div className="panic-text">
              <strong>Protocol Panic Attack Activat</strong>
              <p>Ești în siguranță. Acest moment va trece. Respiră încet.</p>
            </div>
            <button onClick={activatePanicProtocol} className="panic-action">
              🌊 Start Emergency Protocol
            </button>
            <button onClick={() => setShowPanicProtocol(false)} className="panic-close">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="anxiety-header">
        <button 
          onClick={() => router.push('/dashboard/por-well')}
          className="back-btn"
        >
          ← Înapoi la PorWell
        </button>
        
        <div className="header-info">
          <h1>🌸 Anxiety Helper</h1>
          <p>Toolkit complet pentru gestionarea și reducerea anxietății</p>
        </div>
        
        <div className="emergency-controls">
          <button 
            onClick={() => setShowPanicProtocol(true)}
            className="panic-btn"
          >
            🆘 Panic Protocol
          </button>
          <button 
            onClick={activateSafeSpace}
            className="safe-space-btn"
          >
            🏠 Safe Space
          </button>
        </div>
      </div>

      {/* Anxiety Status Dashboard */}
      <div className="anxiety-status">
        <div className="status-main">
          <div className="current-level">
            <h3>Nivel Anxietate Actual</h3>
            <div className="level-display">
              <span 
                className="level-value" 
                style={{color: getAnxietyColor(getAnxietyLevel())}}
              >
                {getAnxietyLevel()}
              </span>
              <span className="level-scale">/10</span>
            </div>
            <div className="level-indicators">
              <div className="indicator">
                <span className="indicator-label">🫀 Fizic</span>
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill physical"
                    style={{ width: `${anxietyIndicators.physical * 10}%` }}
                  ></div>
                </div>
              </div>
              <div className="indicator">
                <span className="indicator-label">💭 Emoțional</span>
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill emotional"
                    style={{ width: `${anxietyIndicators.emotional * 10}%` }}
                  ></div>
                </div>
              </div>
              <div className="indicator">
                <span className="indicator-label">🧠 Cognitiv</span>
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill cognitive"
                    style={{ width: `${anxietyIndicators.cognitive * 10}%` }}
                  ></div>
                </div>
              </div>
              <div className="indicator">
                <span className="indicator-label">🏃 Comportamental</span>
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill behavioral"
                    style={{ width: `${anxietyIndicators.behavioral * 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="status-sidebar">
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">{Math.round(currentHeartRate)}</span>
              <span className="stat-label">Heart Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{anxietyProfile.totalSessions}</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{anxietyProfile.safeSpaceActivations}</span>
              <span className="stat-label">Safe Space</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights-section">
        <h3>🤖 AI Anxiety Insights & Ecosystem Integration</h3>
        <div className="insights-grid">
          {aiInsights.map((insight) => (
            <div key={insight.id} className={`insight-card ${insight.type}`}>
              <div className="insight-header">
                <h4>{insight.title}</h4>
                <span 
                  className="urgency-badge"
                  style={{ backgroundColor: getUrgencyColor(insight.urgency) }}
                >
                  {insight.urgency.toUpperCase()}
                </span>
              </div>
              <p className="insight-message">{insight.message}</p>
              <div className="insight-tools">
                {insight.connectedTools.map((tool, index) => (
                  <span key={index} className="tool-tag">{tool}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technique Filters */}
      <div className="technique-filters">
        <h3>🛠️ Tehnici Anti-Anxietate</h3>
        <div className="filter-buttons">
          {[
            { id: 'all', label: 'Toate' },
            { id: 'panic-safe', label: 'Panic-Safe' },
            { id: 'immediate', label: 'Relief Imediat' },
            { id: 'grounding', label: 'Grounding' },
            { id: 'breathing', label: 'Respirație' },
            { id: 'cognitive', label: 'Cognitiv' },
            { id: 'emergency', label: 'Urgență' }
          ].map((filter) => (
            <button
              key={filter.id}
              className={`filter-btn ${filterType === filter.id ? 'active' : ''}`}
              onClick={() => setFilterType(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Anxiety Techniques Grid */}
      <div className="techniques-grid">
        {filteredTechniques.map((technique) => (
          <div key={technique.id} className="technique-card">
            <div className="technique-header">
              <div className="technique-badges">
                <span className={`type-badge ${technique.type}`}>
                  {technique.type.toUpperCase()}
                </span>
                {technique.panicAttackSafe && (
                  <span className="safety-badge">PANIC-SAFE</span>
                )}
                {technique.immediateRelief && (
                  <span className="relief-badge">IMMEDIATE</span>
                )}
              </div>
              <span className="duration-badge">{technique.duration}min</span>
            </div>
            
            <h4 className="technique-name">{technique.name}</h4>
            <p className="technique-description">{technique.description}</p>
            
            <div className="technique-stats">
              <div className="effectiveness">
                <span>Effectiveness: {technique.effectiveness}/10</span>
                <div className="effectiveness-bar">
                  <div 
                    className="effectiveness-fill"
                    style={{ width: `${(technique.effectiveness / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="technique-triggers">
              <span className="triggers-label">Triggers:</span>
              <div className="triggers-list">
                {technique.triggers.map((trigger, index) => (
                  <span key={index} className="trigger-tag">{trigger}</span>
                ))}
              </div>
            </div>

            <button 
              className="start-technique-btn"
              onClick={() => startTechnique(technique)}
              disabled={activeSession.isActive}
            >
              {activeSession.isActive ? 'Session activă...' : `🌸 Start ${technique.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Technique Modal */}
      {showTechniqueModal && activeSession.technique && (
        <div className="technique-modal-overlay">
          <div className={`technique-modal ${activeSession.isPanicMode ? 'panic-mode' : ''}`}>
            <div className="modal-header">
              <h3>{activeSession.technique.name}</h3>
              <div className="session-info">
                <span>Time: {formatTime(activeSession.timeRemaining)}</span>
                <span>Anxiety Before: {activeSession.anxietyBefore.toFixed(1)}</span>
              </div>
              <button 
                className="close-modal"
                onClick={() => setShowTechniqueModal(false)}
              >
                ×
              </button>
            </div>

            <div className="technique-guidance">
              <h4>Instructions:</h4>
              <div className="instructions-list">
                {activeSession.technique.instructions.map((instruction, index) => (
                  <div 
                    key={index} 
                    className={`instruction-item ${index <= activeSession.currentStep ? 'completed' : ''} ${index === activeSession.currentStep ? 'active' : ''}`}
                  >
                    <span className="instruction-number">{index + 1}</span>
                    <span className="instruction-text">{instruction}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="session-controls">
              <button 
                className="complete-session-btn"
                onClick={completeSession}
              >
                Complete Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Space Modal */}
      {showSafeSpace && (
        <div className="safe-space-overlay">
          <div className="safe-space-modal">
            <div className="safe-space-content">
              <h2>🏠 Your Safe Space</h2>
              <div className="safe-space-visualization">
                <p>Imaginează-ți un loc în care te simți complet în siguranță...</p>
                <div className="breathing-guide">
                  <div className="breath-circle"></div>
                  <p>Respiră încet și profund</p>
                </div>
              </div>
              <div className="affirmations">
                <p>"Sunt în siguranță în acest moment"</p>
                <p>"Acest sentiment va trece"</p>
                <p>"Am puterea să trec prin asta"</p>
              </div>
              <button 
                className="close-safe-space"
                onClick={() => setShowSafeSpace(false)}
              >
                🌸 Mă simt mai bine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}