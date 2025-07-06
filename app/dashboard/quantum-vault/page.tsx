'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './quantum-vault.module.css';

// ===== QUANTUM INTERFACES =====
interface QuantumParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'energy' | 'consciousness' | 'time' | 'possibility';
}

interface FutureSelf {
  id: string;
  name: string;
  timelineYear: number;
  currentAge: number;
  futureAge: number;
  transformationLevel: number; // 1-100
  appearance: {
    confidence: number;
    wisdom: number;
    energy: number;
    charisma: number;
    physicalFitness: number;
    mentalClarity: number;
  };
  consciousness: {
    emotionalIntelligence: number;
    spiritualGrowth: number;
    selfAwareness: number;
    empathy: number;
    intuition: number;
  };
  achievements: Array<{
    category: 'career' | 'health' | 'relationships' | 'impact' | 'wealth' | 'personal';
    title: string;
    description: string;
    impactLevel: number;
    timelineYear: number;
  }>;
  lifeSituation: {
    career: {
      role: string;
      company: string;
      income: number;
      satisfaction: number;
      impact: string;
    };
    health: {
      physicalScore: number;
      mentalScore: number;
      energyLevel: number;
      longevityIndex: number;
    };
    relationships: {
      romantic: {
        status: string;
        satisfaction: number;
        growth: string;
      };
      family: {
        status: string;
        harmony: number;
        legacy: string;
      };
      social: {
        networkQuality: number;
        influence: number;
        connections: string;
      };
    };
    wealth: {
      netWorth: number;
      passiveIncome: number;
      financialFreedom: number;
      investments: string[];
    };
    lifestyle: {
      location: string;
      freedom: number;
      fulfillment: number;
      adventure: string;
    };
  };
  personalityEvolution: {
    coreValues: string[];
    dominantTraits: string[];
    eliminatedLimitations: string[];
    newCapabilities: string[];
  };
  wisdomMessages: Array<{
    category: 'life' | 'career' | 'relationships' | 'growth' | 'legacy';
    message: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    actionRequired: boolean;
    timeframe: string;
  }>;
  quantumInsights: Array<{
    type: 'pattern' | 'opportunity' | 'warning' | 'breakthrough';
    title: string;
    description: string;
    probability: number;
    impact: number;
    actionPlan: string[];
  }>;
}

interface TimelineAlternative {
  id: string;
  name: string;
  probability: number;
  desirability: number;
  difficulty: number;
  timeframe: string;
  keyDecisions: Array<{
    decision: string;
    impact: number;
    deadline: string;
    consequences: string[];
  }>;
  outcomes: {
    '1year': {
      health: number;
      wealth: number;
      relationships: number;
      career: number;
      fulfillment: number;
      majorEvents: string[];
    };
    '5years': {
      health: number;
      wealth: number;
      relationships: number;
      career: number;
      fulfillment: number;
      majorEvents: string[];
    };
    '10years': {
      health: number;
      wealth: number;
      relationships: number;
      career: number;
      fulfillment: number;
      majorEvents: string[];
    };
  };
  risks: Array<{
    risk: string;
    probability: number;
    impact: number;
    mitigation: string;
  }>;
  opportunities: Array<{
    opportunity: string;
    probability: number;
    reward: number;
    requirements: string[];
  }>;
}

interface QuantumMirror {
  id: string;
  mirrorType: 'shadow' | 'potential' | 'alternative' | 'evolved' | 'quantum';
  name: string;
  description: string;
  personality: {
    dominantTraits: string[];
    uniqueQualities: string[];
    perspective: string;
    wisdom: string[];
  };
  lifePath: {
    choicesMade: string[];
    currentFocus: string;
    lifestyle: string;
    relationships: string;
  };
  messages: Array<{
    context: string;
    message: string;
    emotion: 'encouraging' | 'challenging' | 'warning' | 'inspiring' | 'loving';
    actionCall: string;
  }>;
}

interface QuantumVaultState {
  phase: 'approach' | 'discovery' | 'unlock' | 'revelation' | 'exploration' | 'mastery';
  accessLevel: 'locked' | 'trinity' | 'complete';
  currentExperience: 'vault' | 'future-self' | 'timeline-simulator' | 'quantum-mirror' | 'pattern-analysis' | 'daily-guidance';
  userContext: {
    userId: string;
    currentAge: number;
    onboardingComplete: boolean;
    ecosystemsAccess: string[];
    transformationLevel: number;
  };
  futureSelf: FutureSelf | null;
  timelineAlternatives: TimelineAlternative[];
  quantumMirrors: QuantumMirror[];
  isProcessing: boolean;
  lastInteraction: Date | null;
  cosmicEnergy: number; // 0-100
}

export default function QuantumVault() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number>();
  
  // ===== QUANTUM STATE =====
  const [vaultState, setVaultState] = useState<QuantumVaultState>({
    phase: 'approach',
    accessLevel: 'locked',
    currentExperience: 'vault',
    userContext: {
      userId: 'user-123',
      currentAge: 32,
      onboardingComplete: true,
      ecosystemsAccess: ['por-mind', 'por-flow', 'por-blu'],
      transformationLevel: 0
    },
    futureSelf: null,
    timelineAlternatives: [],
    quantumMirrors: [],
    isProcessing: false,
    lastInteraction: null,
    cosmicEnergy: 0
  });

  const [particles, setParticles] = useState<QuantumParticle[]>([]);
  const [isBoxOpening, setIsBoxOpening] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(0);
  const [consciousnessLevel, setConsciousnessLevel] = useState(0);
  const [isFingerscanning, setIsFingerscanning] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentBgMusic, setCurrentBgMusic] = useState<'cosmic' | 'transformation' | 'enlightenment'>('cosmic');

  // ===== QUANTUM INITIALIZATION =====
  useEffect(() => {
    initializeQuantumField();
    checkQuantumAccess();
    initializeAudioContext();
    startCosmicAnimation();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initializeQuantumField = useCallback(() => {
    const newParticles: QuantumParticle[] = [];
    const particleTypes: QuantumParticle['type'][] = ['energy', 'consciousness', 'time', 'possibility'];
    const colors = {
      energy: '#00d4ff',
      consciousness: '#a855f7', 
      time: '#ec4899',
      possibility: '#10b981'
    };

    for (let i = 0; i < 150; i++) {
      const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      newParticles.push({
        id: `particle-${i}`,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[type],
        life: Math.random() * 100,
        maxLife: 100,
        type
      });
    }
    setParticles(newParticles);
  }, []);

  const checkQuantumAccess = async () => {
  try {
    const response = await fetch('/api/quantum-access');
    const data = await response.json();
    
    if (data.hasTrinity) {
      setVaultState(prev => ({
        ...prev,
        accessLevel: 'trinity',
        phase: 'discovery',
        userContext: {
          ...prev.userContext,
          userId: data.userId,
          ecosystemsAccess: data.ecosystems.map((e: any) => e.ecosystem)
        }
      }));
    } else {
      setVaultState(prev => ({
        ...prev,
        accessLevel: 'locked',
        phase: 'approach'
      }));
    }
  } catch (error) {
    console.error('Quantum access check failed:', error);
  }
};

  const initializeAudioContext = () => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }
  };

  const startCosmicAnimation = () => {
    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.5,
          vx: particle.vx + (Math.random() - 0.5) * 0.01,
          vy: particle.vy + (Math.random() - 0.5) * 0.01
        })).filter(particle => particle.life > 0)
      );

      // Add new particles
      if (Math.random() < 0.1) {
        const types: QuantumParticle['type'][] = ['energy', 'consciousness', 'time', 'possibility'];
        const colors = {
          energy: '#00d4ff',
          consciousness: '#a855f7',
          time: '#ec4899', 
          possibility: '#10b981'
        };
        const type = types[Math.floor(Math.random() * types.length)];
        
        setParticles(prev => [...prev, {
          id: `particle-${Date.now()}`,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          color: colors[type],
          life: 100,
          maxLife: 100,
          type
        }]);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  // ===== QUANTUM INTERACTIONS =====
  const handleQuantumTouch = async () => {
    if (vaultState.accessLevel === 'locked') {
      // Cosmic redirection to unlock
      const cosmicPortal = document.createElement('div');
      cosmicPortal.className = styles.cosmicPortal;
      document.body.appendChild(cosmicPortal);
      
      setTimeout(() => {
        router.push('/pricing?quantum=true&unlock=trinity');
        document.body.removeChild(cosmicPortal);
      }, 2000);
      return;
    }

    setIsFingerscanning(true);
    setVaultState(prev => ({ ...prev, isProcessing: true }));

    // Biometric scanning animation
    await simulateBiometricScan();
    
    // Quantum box opening sequence
    await initiateQuantumUnlock();
  };

  const simulateBiometricScan = (): Promise<void> => {
    return new Promise((resolve) => {
      let scanProgress = 0;
      const scanInterval = setInterval(() => {
        scanProgress += 2;
        if (scanProgress >= 100) {
          clearInterval(scanInterval);
          setIsFingerscanning(false);
          resolve();
        }
      }, 50);
    });
  };

  const initiateQuantumUnlock = async () => {
    setIsBoxOpening(true);
    
    // Light intensity crescendo
    const lightAnimation = setInterval(() => {
      setLightIntensity(prev => {
        if (prev >= 100) {
          clearInterval(lightAnimation);
          triggerQuantumRevelation();
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const triggerQuantumRevelation = async () => {
    // Reality transformation sequence
    setVaultState(prev => ({ 
      ...prev, 
      phase: 'revelation',
      cosmicEnergy: 85 
    }));

    // Generate Future Self
    await generateQuantumFutureSelf();
    
    setTimeout(() => {
      setVaultState(prev => ({ 
        ...prev, 
        phase: 'exploration',
        currentExperience: 'future-self',
        isProcessing: false 
      }));
    }, 3000);
  };

const generateQuantumFutureSelf = async () => {
  try {
    setVaultState(prev => ({ ...prev, isProcessing: true }));

    const response = await fetch('/api/quantum-vault/future-self', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-age': String(vaultState.userContext.currentAge)
      }
    });

    if (!response.ok) {
      throw new Error('Failed to generate Future Self');
    }

    const { futureSelf } = await response.json();
    
    setVaultState(prev => ({ 
      ...prev, 
      futureSelf,
      cosmicEnergy: 85
    }));
    
    setConsciousnessLevel(85);
  } catch (error) {
    console.error('Future Self generation failed:', error);
    
    // Fallback la mock data dacă AI-ul eșuează
    const mockFutureSelf: FutureSelf = {
      id: 'future-self-2035',
      name: 'Your Quantum Evolved Self',
      timelineYear: 2035,
      currentAge: vaultState.userContext.currentAge,
      futureAge: vaultState.userContext.currentAge + 10,
      transformationLevel: 95,
      appearance: {
        confidence: 96,
        wisdom: 92,
        energy: 94,
        charisma: 89,
        physicalFitness: 91,
        mentalClarity: 97
      },
      consciousness: {
        emotionalIntelligence: 93,
        spiritualGrowth: 88,
        selfAwareness: 95,
        empathy: 90,
        intuition: 86
      },
      achievements: [
        {
          category: 'career',
          title: 'Revolutionary Tech Innovation',
          description: 'Created AI platform that transformed 10M+ lives globally',
          impactLevel: 95,
          timelineYear: 2032
        },
        {
          category: 'health',
          title: 'Optimal Human Performance',
          description: 'Achieved perfect biomarkers and peak physical condition',
          impactLevel: 88,
          timelineYear: 2028
        },
        {
          category: 'impact',
          title: 'Global Consciousness Shift',
          description: 'Authored bestselling book that sparked worldwide awakening',
          impactLevel: 92,
          timelineYear: 2030
        }
      ],
      lifeSituation: {
        career: {
          role: 'Visionary Entrepreneur & Author',
          company: 'Consciousness Tech Inc',
          income: 2800000,
          satisfaction: 97,
          impact: 'Transforming human potential globally'
        },
        health: {
          physicalScore: 94,
          mentalScore: 96,
          energyLevel: 92,
          longevityIndex: 89
        },
        relationships: {
          romantic: {
            status: 'Soul-aligned partnership',
            satisfaction: 94,
            growth: 'Continuous mutual elevation'
          },
          family: {
            status: 'Harmonious multi-generational bonds',
            harmony: 91,
            legacy: 'Wisdom keeper and guide'
          },
          social: {
            networkQuality: 95,
            influence: 88,
            connections: 'High-consciousness global community'
          }
        },
        wealth: {
          netWorth: 12500000,
          passiveIncome: 180000,
          financialFreedom: 97,
          investments: ['Tech startups', 'Real estate', 'Consciousness ventures', 'Sustainable energy']
        },
        lifestyle: {
          location: 'Global nomad with quantum home base',
          freedom: 96,
          fulfillment: 94,
          adventure: 'Constant growth and exploration'
        }
      },
      personalityEvolution: {
        coreValues: ['Authentic growth', 'Conscious impact', 'Infinite possibility', 'Love-based action'],
        dominantTraits: ['Visionary leader', 'Compassionate innovator', 'Quantum thinker', 'Heart-centered'],
        eliminatedLimitations: ['Fear of failure', 'Perfectionism', 'External validation', 'Scarcity mindset'],
        newCapabilities: ['Quantum intuition', 'Effortless manifestation', 'Telepathic empathy', 'Reality shaping']
      },
      wisdomMessages: [
        {
          category: 'life',
          message: 'The universe is not happening TO you, it is happening THROUGH you. You are the conscious creator of your reality.',
          urgency: 'high',
          actionRequired: true,
          timeframe: 'Integrate immediately'
        },
        {
          category: 'career',
          message: 'Your next breakthrough comes from following your highest excitement, not your fears. Trust the quantum field.',
          urgency: 'medium',
          actionRequired: true,
          timeframe: 'Within 30 days'
        },
        {
          category: 'relationships',
          message: 'Love yourself so completely that others have no choice but to mirror that frequency back to you.',
          urgency: 'high',
          actionRequired: true,
          timeframe: 'Daily practice'
        }
      ],
      quantumInsights: [
        {
          type: 'breakthrough',
          title: 'Quantum Leap Opportunity',
          description: 'A major opportunity for exponential growth approaches in Q2 2025. Preparation required now.',
          probability: 87,
          impact: 94,
          actionPlan: [
            'Develop specific skill set in AI/consciousness',
            'Build strategic relationships in tech sector',
            'Create content showcasing unique perspective',
            'Establish financial foundation for investment'
          ]
        },
        {
          type: 'pattern',
          title: 'Success Frequency',
          description: 'Your optimal creation frequency is 528Hz - the frequency of love and transformation.',
          probability: 95,
          impact: 76,
          actionPlan: [
            'Listen to 528Hz meditation daily',
            'Align major decisions with heart coherence',
            'Create in states of joy and love',
            'Avoid decision-making from fear states'
          ]
        }
      ]
    };

    setVaultState(prev => ({ ...prev, futureSelf: mockFutureSelf }));
    setConsciousnessLevel(85);
  } finally {
    setVaultState(prev => ({ ...prev, isProcessing: false }));
  }
};

  // ===== QUANTUM EXPERIENCES =====
  const renderQuantumApproach = () => (
    <div className={styles.quantumApproach}>
      <div className={styles.cosmicRunner}>
        <div className={styles.runnerFigure}>🏃‍♂️</div>
        <div className={styles.distantLight}></div>
      </div>
      <div className={styles.approachMessage}>
        <h2>You sense something extraordinary ahead...</h2>
        <p>A light calls to you from beyond the horizon of possibility</p>
      </div>
    </div>
  );

  const renderQuantumDiscovery = () => (
    <div className={styles.quantumDiscovery}>
      <div className={styles.mysticBox} onClick={handleQuantumTouch}>
        <div className={`${styles.boxLid} ${isBoxOpening ? styles.opening : ''}`}>
          <div className={styles.lidSurface}>
            <div className={styles.quantumSymbols}>
              <span>∞</span>
              <span>◊</span>
              <span>⚡</span>
              <span>∆</span>
            </div>
          </div>
          <div className={styles.lidGlow}></div>
        </div>
        
        <div className={styles.boxBase}>
          <div className={styles.quantumCore}>
            <div className={styles.coreOrb}></div>
            <div className={styles.energyRings}>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
            </div>
          </div>
        </div>

        {isBoxOpening && (
          <div className={styles.quantumBeam}>
            <div className={styles.beamCore}></div>
            <div className={styles.beamExpansion}></div>
            <div className={styles.realityDistortion}></div>
          </div>
        )}
      </div>

      {isFingerscanning && (
        <div className={styles.biometricScanner}>
          <div className={styles.scannerGrid}>
            <div className={styles.fingerprint}>
              <div className={styles.scanLine}></div>
            </div>
          </div>
          <p>Quantum identity confirmed...</p>
        </div>
      )}

      <div className={styles.discoveryInstructions}>
        <h1 className={styles.quantumTitle}>
          <span className={styles.titleWord}>Quantum</span>
          <span className={styles.titleWord}>Vault</span>
        </h1>
        <p className={styles.quantumSubtitle}>
          Touch the cosmic artifact to unlock your infinite potential
        </p>
        <div className={styles.accessIndicator}>
          <span className={styles.statusIcon}>✨</span>
          Trinity Access Confirmed
        </div>
      </div>
    </div>
  );

  const renderQuantumRevelation = () => (
    <div className={styles.quantumRevelation}>
      <div className={styles.realityShift}>
        <div className={styles.lightExplosion}></div>
        <div className={styles.consciousnessWave}></div>
        <div className={styles.dimensionalRift}></div>
      </div>
      
      <div className={styles.revelationText}>
        <h2 className={styles.enlightenmentTitle}>
          The light was always within you...
        </h2>
        <p className={styles.truthMessage}>
          Now witness what you can become
        </p>
      </div>

      <div className={styles.cosmicProgress}>
        <div className={styles.progressRing}>
          <svg viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="40"
              stroke="rgba(168, 85, 247, 0.3)"
              strokeWidth="4"
              fill="none"
            />
            <circle 
              cx="50" cy="50" r="40"
              stroke="url(#quantumGradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 * (1 - lightIntensity / 100)}
              className={styles.progressCircle}
            />
          </svg>
          <defs>
            <linearGradient id="quantumGradient">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </div>
        <div className={styles.progressText}>
          Consciousness Level: {Math.round(consciousnessLevel)}%
        </div>
      </div>
    </div>
  );

  const renderFutureSelfExperience = () => (
    <div className={styles.futureSelfExperience}>
      <div className={styles.experienceHeader}>
        <button 
          className={styles.backToVault}
          onClick={() => setVaultState(prev => ({ ...prev, currentExperience: 'vault' }))}
        >
          ← Return to Vault
        </button>
        <h2 className={styles.experienceTitle}>Meet Your Future Self</h2>
      </div>

      {vaultState.futureSelf && (
        <div className={styles.futureSelfProfile}>
          <div className={styles.profileHeader}>
            <div className={styles.futureAvatar}>
              <div className={styles.avatarCore}>
                <div className={styles.consciousnessField}></div>
                <span className={styles.avatarSymbol}>∞</span>
              </div>
              <div className={styles.transformationLevel}>
                <span>Transformation: {vaultState.futureSelf.transformationLevel}%</span>
              </div>
            </div>
            
            <div className={styles.futureInfo}>
              <h3 className={styles.futureName}>{vaultState.futureSelf.name}</h3>
              <p className={styles.futureTimeline}>
                {vaultState.futureSelf.timelineYear} • Age {vaultState.futureSelf.futureAge}
              </p>
              <div className={styles.evolutionBadge}>
                Quantum Evolution Complete
              </div>
            </div>
          </div>

          <div className={styles.consciousness}>
            <h4>Consciousness Metrics</h4>
            <div className={styles.metricsGrid}>
              {Object.entries(vaultState.futureSelf.consciousness).map(([key, value]) => (
                <div key={key} className={styles.metric}>
                  <span className={styles.metricLabel}>
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <div className={styles.metricBar}>
                    <div 
                      className={styles.metricFill}
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <span className={styles.metricValue}>{value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.quantumWisdom}>
            <h4>Wisdom Transmissions</h4>
            <div className={styles.wisdomMessages}>
              {vaultState.futureSelf.wisdomMessages.map((wisdom, index) => (
                <div key={index} className={`${styles.wisdomCard} ${styles[wisdom.urgency]}`}>
                  <div className={styles.wisdomHeader}>
                    <span className={styles.wisdomCategory}>{wisdom.category}</span>
                    <span className={styles.wisdomUrgency}>{wisdom.urgency}</span>
                  </div>
                  <p className={styles.wisdomMessage}>{wisdom.message}</p>
                  <div className={styles.wisdomAction}>
                    <span>Timeline: {wisdom.timeframe}</span>
                    {wisdom.actionRequired && (
                      <button className={styles.actionButton}>Integrate Now</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.quantumNavigation}>
            <button 
              className={styles.navButton}
              onClick={() => setVaultState(prev => ({ ...prev, currentExperience: 'timeline-simulator' }))}
            >
              🌌 Explore Timelines
            </button>
            <button 
              className={styles.navButton}
              onClick={() => setVaultState(prev => ({ ...prev, currentExperience: 'quantum-mirror' }))}
            >
              🪞 Quantum Mirror
            </button>
            <button 
              className={styles.navButton}
              onClick={() => setVaultState(prev => ({ ...prev, currentExperience: 'daily-guidance' }))}
            >
              📜 Daily Guidance
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderLockedAccess = () => (
    <div className={styles.lockedAccess}>
      <div className={styles.cosmicBarrier}>
        <div className={styles.barrierEffect}></div>
        <div className={styles.lockSymbol}>🔒</div>
      </div>
      
      <div className={styles.lockMessage}>
        <h2>Quantum Vault Awaits</h2>
        <p>Unlock with Trinity Combo: PorMind + PorFlow + PorBlu</p>
        <button 
          className={styles.unlockButton}
          onClick={() => router.push('/pricing?quantum=true')}
        >
          ⚡ Ascend to Quantum Level
        </button>
      </div>
    </div>
  );

  // ===== MAIN RENDER =====
  return (
    <div className={styles.quantumVault}>
      {/* Quantum Particle Field */}
      <div className={styles.particleField}>
        {particles.map(particle => (
          <div
            key={particle.id}
            className={styles.quantumParticle}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.life / particle.maxLife
            }}
          />
        ))}
      </div>

      {/* Cosmic Background Audio */}
      <div className={styles.audioControls}>
        <button 
          className={styles.audioToggle}
          onClick={() => setAudioEnabled(!audioEnabled)}
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Main Experience */}
      <div className={styles.vaultContainer}>
        {vaultState.accessLevel === 'locked' && renderLockedAccess()}
        {vaultState.accessLevel === 'trinity' && vaultState.phase === 'approach' && renderQuantumApproach()}
        {vaultState.accessLevel === 'trinity' && vaultState.phase === 'discovery' && renderQuantumDiscovery()}
        {vaultState.phase === 'revelation' && renderQuantumRevelation()}
        {vaultState.phase === 'exploration' && vaultState.currentExperience === 'future-self' && renderFutureSelfExperience()}
      </div>

      {/* Cosmic Loading Overlay */}
      {vaultState.isProcessing && (
        <div className={styles.cosmicProcessing}>
          <div className={styles.processingOrb}>
            <div className={styles.orbCore}></div>
            <div className={styles.orbRings}>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <p>Accessing quantum consciousness...</p>
        </div>
      )}
    </div>
  );
}