// app/dashboard/por-health/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import styles from './style.module.css';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  icon: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'rising' | 'falling' | 'stable';
  change: number;
}

interface BiometricData {
  heartRate: { current: number; resting: number; max: number };
  bloodPressure: { systolic: number; diastolic: number };
  bodyComposition: { weight: number; bodyFat: number; muscle: number };
  hydration: { current: number; target: number; percentage: number };
  sleep: { hours: number; quality: number; deep: number; rem: number };
  stress: { level: number; hrv: number; recovery: number };
}

interface NutritionProfile {
  calories: { consumed: number; target: number; remaining: number };
  macros: {
    protein: { current: number; target: number; percentage: number };
    carbs: { current: number; target: number; percentage: number };
    fat: { current: number; target: number; percentage: number };
  };
  micronutrients: {
    vitamin_d: number;
    vitamin_b12: number;
    iron: number;
    magnesium: number;
  };
}

interface WorkoutSession {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'recovery';
  duration: number;
  caloriesBurn: number;
  intensity: 'low' | 'moderate' | 'high' | 'extreme';
  status: 'scheduled' | 'active' | 'completed' | 'skipped';
  timeRemaining?: string;
  muscleGroups: string[];
  equipment: string[];
}

interface HealthInsight {
  id: string;
  type: 'achievement' | 'recommendation' | 'warning' | 'trend';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
  actionable: boolean;
  source: 'ai_analysis' | 'biometric' | 'pattern_recognition';
}

export default function PorHealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  
  // Data States
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [biometrics, setBiometrics] = useState<BiometricData | null>(null);
  const [nutrition, setNutrition] = useState<NutritionProfile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  
  // Refs for animations
  const particleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Real-time clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    setLoading(true);
    
    // Simulate sophisticated AI initialization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Initialize health score with smooth animation
    animateHealthScore();
    
    // Load all data
    await loadHealthData();
    
    // Initialize particle system
    initializeParticles();
    
    setLoading(false);
    
    // Start periodic updates
    startRealTimeUpdates();
  };

  const animateHealthScore = () => {
    const targetScore = 94;
    let currentScore = 0;
    const increment = 2;
    
    const scoreAnimation = setInterval(() => {
      currentScore += increment;
      setHealthScore(currentScore);
      
      if (currentScore >= targetScore) {
        clearInterval(scoreAnimation);
        setHealthScore(targetScore);
      }
    }, 80);
  };

  const loadHealthData = async () => {
    // Health Metrics - Premium data with realistic values
    setHealthMetrics([
      {
        id: 'heart_rate',
        name: 'Heart Rate',
        value: 68,
        unit: 'bpm',
        target: 65,
        icon: '💗',
        status: 'excellent',
        trend: 'stable',
        change: 0.2
      },
      {
        id: 'steps',
        name: 'Daily Steps',
        value: 12847,
        unit: 'steps',
        target: 10000,
        icon: '👟',
        status: 'excellent',
        trend: 'rising',
        change: 15.3
      },
      {
        id: 'sleep',
        name: 'Sleep Quality',
        value: 8.4,
        unit: 'hrs',
        target: 8.0,
        icon: '🌙',
        status: 'excellent',
        trend: 'rising',
        change: 12.5
      },
      {
        id: 'hydration',
        name: 'Hydration',
        value: 2.8,
        unit: 'L',
        target: 2.5,
        icon: '💧',
        status: 'excellent',
        trend: 'stable',
        change: 5.2
      },
      {
        id: 'stress',
        name: 'Stress Level',
        value: 24,
        unit: '%',
        target: 30,
        icon: '🧘',
        status: 'good',
        trend: 'falling',
        change: -8.1
      },
      {
        id: 'recovery',
        name: 'Recovery Score',
        value: 89,
        unit: '%',
        target: 85,
        icon: '⚡',
        status: 'excellent',
        trend: 'rising',
        change: 7.3
      }
    ]);

    // Biometric Data
    setBiometrics({
      heartRate: { current: 68, resting: 52, max: 185 },
      bloodPressure: { systolic: 118, diastolic: 76 },
      bodyComposition: { weight: 72.3, bodyFat: 12.8, muscle: 45.2 },
      hydration: { current: 2.8, target: 2.5, percentage: 112 },
      sleep: { hours: 8.4, quality: 92, deep: 2.1, rem: 1.8 },
      stress: { level: 24, hrv: 45, recovery: 89 }
    });

    // Nutrition Profile
    setNutrition({
      calories: { consumed: 2180, target: 2200, remaining: 20 },
      macros: {
        protein: { current: 165, target: 150, percentage: 110 },
        carbs: { current: 248, target: 275, percentage: 90 },
        fat: { current: 73, target: 85, percentage: 86 }
      },
      micronutrients: {
        vitamin_d: 85,
        vitamin_b12: 92,
        iron: 78,
        magnesium: 88
      }
    });

    // Workout Sessions
    setWorkouts([
      {
        id: 'morning_hiit',
        name: 'Morning HIIT Protocol',
        type: 'hiit',
        duration: 25,
        caloriesBurn: 320,
        intensity: 'extreme',
        status: 'completed',
        muscleGroups: ['Full Body', 'Core', 'Cardio'],
        equipment: ['Bodyweight', 'Resistance Bands']
      },
      {
        id: 'strength_upper',
        name: 'Upper Body Strength',
        type: 'strength',
        duration: 45,
        caloriesBurn: 280,
        intensity: 'high',
        status: 'scheduled',
        timeRemaining: '2h 15m',
        muscleGroups: ['Chest', 'Back', 'Arms', 'Shoulders'],
        equipment: ['Dumbbells', 'Pull-up Bar', 'Bench']
      },
      {
        id: 'evening_flow',
        name: 'Evening Recovery Flow',
        type: 'flexibility',
        duration: 30,
        caloriesBurn: 120,
        intensity: 'low',
        status: 'scheduled',
        timeRemaining: '6h 30m',
        muscleGroups: ['Full Body', 'Core'],
        equipment: ['Yoga Mat', 'Blocks']
      }
    ]);

    // AI Health Insights
    setInsights([
      {
        id: 'sleep_improvement',
        type: 'achievement',
        title: 'Sleep Optimization Success',
        message: 'Your sleep quality has improved 23% this week! Deep sleep increased by 45 minutes.',
        priority: 'high',
        icon: '🌙',
        actionable: false,
        source: 'ai_analysis'
      },
      {
        id: 'protein_recommendation',
        type: 'recommendation',
        title: 'Protein Timing Optimization',
        message: 'Consider adding 20g protein within 30min post-workout for optimal recovery.',
        priority: 'medium',
        icon: '💪',
        actionable: true,
        source: 'ai_analysis'
      },
      {
        id: 'hrv_trend',
        type: 'trend',
        title: 'Heart Rate Variability Trending Up',
        message: 'Your HRV indicates excellent autonomic recovery. Stress management is working!',
        priority: 'medium',
        icon: '❤️',
        actionable: false,
        source: 'biometric'
      }
    ]);
  };

  const initializeParticles = () => {
    if (!particleContainerRef.current) return;
    
    // Create floating health particles
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = styles.particle;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.animationDuration = `${15 + Math.random() * 10}s`;
      particleContainerRef.current.appendChild(particle);
    }
  };

  const startRealTimeUpdates = () => {
    // Simulate real-time biometric updates
    setInterval(() => {
      if (biometrics) {
        setBiometrics(prev => prev ? {
          ...prev,
          heartRate: {
            ...prev.heartRate,
            current: Math.max(60, Math.min(80, prev.heartRate.current + (Math.random() - 0.5) * 2))
          }
        } : null);
      }
    }, 5000);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: '#00ff88',
      good: '#22c55e',
      warning: '#fbbf24',
      critical: '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#22c55e';
  };

  const getTrendIcon = (trend: string) => {
    const icons = {
      rising: '📈',
      falling: '📉',
      stable: '➡️'
    };
    return icons[trend as keyof typeof icons] || '➡️';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingOrb}>
          <div className={styles.orbCore}></div>
          <div className={styles.orbRipple}></div>
          <div className={`${styles.orbRipple} ${styles.orbRippleDelay}`}></div>
        </div>
        <h2 className={styles.loadingTitle}>
          🌿 Initializing PorHealth
        </h2>
        <p className={styles.loadingSubtitle}>
          AI is analyzing your biometric patterns and optimizing your wellness ecosystem...
        </p>
        <div className={styles.loadingProgress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
          <div className={styles.loadingSteps}>
            <span className={styles.stepItem}>Connecting to wearables</span>
            <span className={`${styles.stepItem} ${styles.stepDelay1}`}>Processing sleep data</span>
            <span className={`${styles.stepItem} ${styles.stepDelay2}`}>Analyzing nutrition patterns</span>
            <span className={`${styles.stepItem} ${styles.stepDelay3}`}>Generating insights</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}></div>
      <div ref={particleContainerRef} className={styles.particleContainer}></div>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarGlow}></div>
        
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          <span className={styles.logoText}>PorHealth</span>
          <div className={styles.logoSubtitle}>AI Wellness Optimizer</div>
        </div>

        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            <h4 className={styles.navHeader}>Dashboard</h4>
            <div className={styles.navItems}>
              <button className={`${styles.navItem} ${styles.navItemActive}`}>
                <span className={styles.navIcon}>🏠</span>
                <span>Overview</span>
                <span className={styles.activeIndicator}></span>
              </button>
              
              <Link href="/dashboard/por-health/nutrition" className={styles.navItem}>
                <span className={styles.navIcon}>🍎</span>
                <span>AI Nutrition</span>
                <span className={styles.badge}>New</span>
              </Link>

              <Link href="/dashboard/por-health/workouts" className={styles.navItem}>
                <span className={styles.navIcon}>💪</span>
                <span>Smart Workouts</span>
                <span className={styles.counter}>3</span>
              </Link>

              <Link href="/dashboard/por-health/biometrics" className={styles.navItem}>
                <span className={styles.navIcon}>📊</span>
                <span>Biometrics</span>
              </Link>
            </div>
          </div>

          <div className={styles.navSection}>
            <h4 className={styles.navHeader}>AI Features</h4>
            <div className={styles.navItems}>
              <button 
                className={styles.navItem}
                onClick={() => setAiChatOpen(true)}
              >
                <span className={styles.navIcon}>🤖</span>
                <span>Health Coach</span>
                <span className={styles.liveIndicator}></span>
              </button>

              <button className={styles.navItem}>
                <span className={styles.navIcon}>🔬</span>
                <span>Body Analytics</span>
              </button>

              <button className={styles.navItem}>
                <span className={styles.navIcon}>🎯</span>
                <span>Goal Optimizer</span>
              </button>
            </div>
          </div>

          <div className={styles.navSection}>
            <h4 className={styles.navHeader}>Ecosystems</h4>
            <div className={styles.navItems}>
              <Link href="/dashboard/por-kids" className={styles.navItem}>
                <span className={styles.navIcon}>👶</span>
                <span>PorKids</span>
              </Link>

              <Link href="/dashboard/por-mind" className={styles.navItem}>
                <span className={styles.navIcon}>🧠</span>
                <span>PorMind</span>
                <span className={styles.premiumBadge}>Premium</span>
              </Link>

              <Link href="/dashboard/por-well" className={styles.navItem}>
                <span className={styles.navIcon}>🌻</span>
                <span>PorWell</span>
                <span className={styles.premiumBadge}>Premium</span>
              </Link>

              <Link href="/dashboard/por-flow" className={styles.navItem}>
                <span className={styles.navIcon}>🌊</span>
                <span>PorFlow</span>
                <span className={styles.premiumBadge}>Premium</span>
              </Link>

              <Link href="/dashboard/por-blu" className={styles.navItem}>
                <span className={styles.navIcon}>💧</span>
                <span>PorBlu</span>
                <span className={styles.premiumBadge}>Premium</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className={styles.quantumCta}>
          <div className={styles.quantumGlow}></div>
          <div className={styles.quantumIcon}>⚡</div>
          <h4 className={styles.quantumTitle}>Quantum Health</h4>
          <p className={styles.quantumDescription}>
            Unlock genetic insights & longevity protocols with AI-powered precision medicine
          </p>
          <button className={styles.quantumButton}>Unlock Quantum</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>
              {getGreeting()}, Alex! 
              <span className={styles.timeChip}>{formatTime(currentTime)}</span>
            </h1>
            <p className={styles.headerSubtitle}>
              Your wellness ecosystem is operating at 
              <span className={styles.healthScoreText}> {healthScore}% </span>
              optimal performance
            </p>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.healthScoreCircle}>
              <svg className={styles.scoreChart} viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - healthScore / 100)}`}
                  className={styles.scoreProgress}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff88" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </svg>
              <div className={styles.scoreContent}>
                <span className={styles.scoreValue}>{healthScore}</span>
                <span className={styles.scoreLabel}>Health Score</span>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              <button className={styles.actionButton}>
                <span>🔔</span>
                <span className={styles.notificationBadge}>3</span>
              </button>
              
              <button className={styles.actionButton}>
                ⚙️
              </button>
              
              <div className={styles.profileButton}>
                <img 
                  src="/api/placeholder/48/48" 
                  alt="Profile" 
                  className={styles.profileImage}
                /> 
                <span className={styles.onlineIndicator}></span>
              </div>
            </div>
          </div>
        </header>

        {/* AI Insights Banner */}
        {insights.length > 0 && (
          <div className={styles.insightsBanner}>
            <div className={styles.insightsGlow}></div>
            
            <div className={styles.insightsHeader}>
              <div className={styles.insightsInfo}>
                <div className={styles.insightsIcon}>🧠</div>
                <div>
                  <h3 className={styles.insightsTitle}>AI Health Insights</h3>
                  <p className={styles.insightsSubtitle}>Real-time analysis of your biometric patterns</p>
                </div>
              </div>
              <button className={styles.viewAllButton}>View All</button>
            </div>
            
            <div className={styles.insightsGrid}>
              {insights.map((insight) => (
                <div key={insight.id} className={styles.insightCard}>
                  <div className={styles.insightIcon}>{insight.icon}</div>
                  <div className={styles.insightContent}>
                    <h4 className={styles.insightTitle}>{insight.title}</h4>
                    <p className={styles.insightMessage}>{insight.message}</p>
                  </div>
                  {insight.actionable && (
                    <button className={styles.insightAction}>Act</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Metrics Grid */}
        <div className={styles.metricsGrid}>
          {healthMetrics.map((metric, index) => (
            <div 
              key={metric.id} 
              className={`${styles.metricCard} ${selectedMetric === metric.id ? styles.metricSelected : ''}`}
              onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.metricGlow}></div>
              
              <div className={styles.metricHeader}>
                <div className={styles.metricInfo}>
                  <span className={styles.metricIcon}>{metric.icon}</span>
                  <div>
                    <h4 className={styles.metricName}>{metric.name}</h4>
                    <div className={styles.metricTrend}>
                      {getTrendIcon(metric.trend)}
                      <span className={styles.metricChange} style={{ 
                        color: metric.trend === 'rising' ? '#00ff88' : 
                               metric.trend === 'falling' ? '#ef4444' : '#9ca3af' 
                      }}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div 
                  className={styles.statusIndicator}
                  style={{ 
                    backgroundColor: getStatusColor(metric.status),
                    boxShadow: `0 0 10px ${getStatusColor(metric.status)}`
                  }}
                ></div>
              </div>
              
              <div className={styles.metricValue}>
                <span className={styles.valueNumber}>{metric.value.toLocaleString()}</span>
                <span className={styles.valueUnit}>{metric.unit}</span>
              </div>
              
              <div className={styles.metricProgress}>
                <div className={styles.progressTrack}>
                  <div 
                    className={styles.progressBar}
                    style={{
                      width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                      backgroundColor: getStatusColor(metric.status),
                      boxShadow: `0 0 10px ${getStatusColor(metric.status)}`
                    }}
                  ></div>
                </div>
                <div className={styles.targetInfo}>
                  Target: {metric.target.toLocaleString()} {metric.unit}
                </div>
              </div>

              {/* Expanded View */}
              {selectedMetric === metric.id && (
                <div className={styles.metricExpanded}>
                  <div className={styles.chartPlaceholder}>
                    📈 7-day trend visualization
                  </div>
                  <p className={styles.aiAnalysis}>
                    AI analysis shows optimal performance. Keep up the excellent work!
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Nutrition Card */}
          {nutrition && (
            <div className={styles.nutritionCard}>
              <div className={styles.nutritionGlow}></div>
              
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>🍎 Today's Nutrition</h3>
                <div className={styles.aiOptimizedBadge}>AI Optimized</div>
              </div>
              
              <div className={styles.caloriesOverview}>
                <div className={styles.caloriesDisplay}>
                  <span className={styles.caloriesConsumed}>{nutrition.calories.consumed}</span>
                  <span className={styles.caloriesSeparator}>/</span>
                  <span className={styles.caloriesTarget}>{nutrition.calories.target}</span>
                  <span className={styles.caloriesUnit}>kcal</span>
                </div>
                <div className={styles.caloriesRemaining}>
                  {nutrition.calories.remaining} calories remaining
                </div>
              </div>

              <div className={styles.macrosGrid}>
                {Object.entries(nutrition.macros).map(([key, macro]) => (
                  <div key={key} className={styles.macroCard}>
                    <div className={styles.macroHeader}>
                      <span className={styles.macroName}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className={styles.macroPercentage}>
                        {macro.percentage}%
                      </span>
                    </div>
                    <div className={styles.macroValue}>
                      <span className={styles.macroCurrent}>{macro.current}g</span>
                      <span className={styles.macroTarget}>/ {macro.target}g</span>
                    </div>
                    <div className={styles.macroProgress}>
                      <div 
                        className={styles.macroProgressBar}
                        style={{ width: `${Math.min(macro.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workouts Card */}
          <div className={styles.workoutsCard}>
            <div className={styles.workoutsGlow}></div>
            
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>💪 Today's Training</h3>
              <div className={styles.workoutsSummary}>
                <span>{workouts.length} sessions</span>
                <span>•</span>
                <span>{workouts.reduce((acc, w) => acc + w.caloriesBurn, 0)} cal</span>
              </div>
            </div>
            
            <div className={styles.workoutsList}>
              {workouts.map((workout, index) => (
                <div key={workout.id} className={styles.workoutItem}>
                  <div 
                    className={styles.workoutProgress}
                    style={{
                      backgroundColor: workout.status === 'completed' ? '#00ff88' : 'transparent',
                      transform: workout.status === 'completed' ? 'scaleY(1)' : 'scaleY(0)'
                    }}
                  ></div>
                  
                  <div className={styles.workoutStatus}>
                    {workout.status === 'completed' ? '✓' : 
                     workout.status === 'active' ? '⏱️' : 
                     index + 1}
                  </div>
                  
                  <div className={styles.workoutInfo}>
                    <div className={styles.workoutHeader}>
                      <h4 className={styles.workoutName}>{workout.name}</h4>
                      <span className={`${styles.workoutType} ${styles[`type-${workout.type}`]}`}>
                        {workout.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className={styles.workoutStats}>
                      <span>{workout.duration}min</span>
                      <span>{workout.caloriesBurn} cal</span>
                      <span className={`${styles.intensityBadge} ${styles[`intensity-${workout.intensity}`]}`}>
                        {workout.intensity}
                      </span>
                    </div>
                    
                    <div className={styles.muscleGroups}>
                      {workout.muscleGroups.slice(0, 3).map(muscle => (
                        <span key={muscle} className={styles.muscleGroup}>{muscle}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.workoutActions}>
                    {workout.status === 'completed' ? (
                      <span className={styles.completedLabel}>Completed</span>
                    ) : workout.status === 'active' ? (
                      <button className={styles.continueButton}>Continue</button>
                    ) : workout.timeRemaining ? (
                      <div className={styles.scheduledWorkout}>
                        <span className={styles.timeRemaining}>in {workout.timeRemaining}</span>
                        <button className={styles.startButton}>Start</button>
                      </div>
                    ) : (
                      <button className={styles.startButton}>Start Now</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biometrics Card */}
          {biometrics && (
            <div className={styles.biometricsCard}>
              <div className={styles.biometricsGlow}></div>
              
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📊 Live Biometrics</h3>
                <div className={styles.liveStatus}>
                  <span className={styles.liveIndicator}></span>
                  Live
                </div>
              </div>
              
              <div className={styles.biometricsGrid}>
                <div className={styles.biometricItem}>
                  <div className={styles.biometricIcon}>❤️</div>
                  <div className={styles.biometricData}>
                    <span className={styles.biometricValue}>
                      {Math.round(biometrics.heartRate.current)}
                    </span>
                    <span className={styles.biometricUnit}>bpm</span>
                    <span className={styles.biometricLabel}>Heart Rate</span>
                  </div>
                </div>
                
                <div className={styles.biometricItem}>
                  <div className={styles.biometricIcon}>🩸</div>
                  <div className={styles.biometricData}>
                    <span className={styles.biometricValue}>
                      {biometrics.bloodPressure.systolic}/{biometrics.bloodPressure.diastolic}
                    </span>
                    <span className={styles.biometricUnit}>mmHg</span>
                    <span className={styles.biometricLabel}>Blood Pressure</span>
                  </div>
                </div>
                
                <div className={styles.biometricItem}>
                  <div className={styles.biometricIcon}>⚖️</div>
                  <div className={styles.biometricData}>
                    <span className={styles.biometricValue}>{biometrics.bodyComposition.weight}</span>
                    <span className={styles.biometricUnit}>kg</span>
                    <span className={styles.biometricLabel}>Weight</span>
                  </div>
                </div>
                
                <div className={styles.biometricItem}>
                  <div className={styles.biometricIcon}>🧧</div>
                  <div className={styles.biometricData}>
                    <span className={styles.biometricValue}>{biometrics.stress.recovery}</span>
                    <span className={styles.biometricUnit}>%</span>
                    <span className={styles.biometricLabel}>Recovery</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Chat Floating Button */}
      <button 
        className={`${styles.chatFab} ${aiChatOpen ? styles.chatFabHidden : ''}`}
        onClick={() => setAiChatOpen(true)}
      >
        🤖
      </button>

      {/* AI Chat Component - Placeholder */}
      {aiChatOpen && (
        <div className={styles.aiChatOverlay} onClick={() => setAiChatOpen(false)}>
          <div className={styles.aiChatModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.chatHeader}>
              <h3>🧠 AI Health Coach</h3>
              <button 
                className={styles.chatClose}
                onClick={() => setAiChatOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.chatContent}>
              <div className={styles.chatMessage}>
                <div className={styles.aiAvatar}>🤖</div>
                <div className={styles.messageContent}>
                  <p>Hello Alex! I've analyzed your health data. Your sleep quality improvement is outstanding! What would you like to optimize today?</p>
                </div>
              </div>
            </div>
            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Ask your AI health coach anything..."
                className={styles.chatInputField}
              />
              <button className={styles.chatSend}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}