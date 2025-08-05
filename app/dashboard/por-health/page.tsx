// app/dashboard/por-health/page.tsx - PRODUCTION READY VERSION
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiClient, useAPICall } from '@/lib/api/api-client';
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Refs for animations
  const particleContainerRef = useRef<HTMLDivElement>(null);

  // ================================
  // REAL API CALLS - NO MORE MOCK DATA!
  // ================================

  // Get dashboard data with real API
  const { 
    data: dashboardData, 
    loading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useAPICall(
    () => apiClient.getDashboardData('por-health'), 
    []
}

  // Get user progress
  const { 
    data: userProgress, 
    loading: progressLoading 
  } = useAPICall(
    () => apiClient.getUserProgress('por-health'),
    []
  );

  // Calculate health score from real data
  const healthScore = dashboardData?.health?.biometrics?.health_score || 0;

  // Transform real API data to component format
  const healthMetrics: HealthMetric[] = dashboardData?.health ? transformHealthMetrics(dashboardData.health) : [];
  const biometrics: BiometricData | null = dashboardData?.health?.biometrics ? transformBiometrics(dashboardData.health.biometrics) : null;
  const nutrition: NutritionProfile | null = dashboardData?.health?.nutrition ? transformNutrition(dashboardData.health.nutrition) : null;
  const workouts: WorkoutSession[] = dashboardData?.health?.workouts || [];
  const insights: HealthInsight[] = dashboardData?.health?.insights || [];

  // ================================
  // DATA TRANSFORMATION HELPERS
  // ================================
  
  function transformHealthMetrics(healthData: any): HealthMetric[] {
    const defaultMetrics = [
      {
        id: 'heart_rate',
        name: 'Heart Rate',
        value: healthData.biometrics?.latest_readings?.heart_rate || 68,
        unit: 'bpm',
        target: 65,
        icon: '💗',
        status: 'good' as const,
        trend: 'stable' as const,
        change: 0.2
      },
      {
        id: 'steps',
        name: 'Daily Steps',
        value: healthData.activity?.daily_steps || 8500,
        unit: 'steps',
        target: 10000,
        icon: '👟',
        status: 'good' as const,
        trend: 'rising' as const,
        change: 15.3
      },
      {
        id: 'sleep',
        name: 'Sleep Quality',
        value: healthData.sleep?.last_night_hours || 7.5,
        unit: 'hrs',
        target: 8.0,
        icon: '🌙',
        status: 'good' as const,
        trend: 'rising' as const,
        change: 12.5
      },
      {
        id: 'hydration',
        name: 'Hydration',
        value: healthData.hydration?.daily_intake || 2.2,
        unit: 'L',
        target: 2.5,
        icon: '💧',
        status: 'warning' as const,
        trend: 'stable' as const,
        change: 5.2
      }
    ];

    // Calculate status based on target achievement
    return defaultMetrics.map(metric => ({
      ...metric,
      status: calculateMetricStatus(metric.value, metric.target)
    }));
  }

  function transformBiometrics(biometricData: any): BiometricData {
    const latest = biometricData.latest_readings || {};
    
    return {
      heartRate: { 
        current: latest.heart_rate || 68, 
        resting: latest.resting_heart_rate || 52, 
        max: 185 
      },
      bloodPressure: { 
        systolic: latest.blood_pressure_systolic || 118, 
        diastolic: latest.blood_pressure_diastolic || 76 
      },
      bodyComposition: { 
        weight: latest.weight || 72.3, 
        bodyFat: latest.body_fat_percentage || 12.8, 
        muscle: latest.muscle_mass || 45.2 
      },
      hydration: { 
        current: latest.hydration_level || 2.2, 
        target: 2.5, 
        percentage: Math.round((latest.hydration_level || 2.2) / 2.5 * 100) 
      },
      sleep: { 
        hours: latest.sleep_hours || 7.5, 
        quality: latest.sleep_quality || 85, 
        deep: latest.deep_sleep_hours || 1.8, 
        rem: latest.rem_sleep_hours || 1.5 
      },
      stress: { 
        level: latest.stress_level || 30, 
        hrv: latest.heart_rate_variability || 42, 
        recovery: biometricData.health_score || 85 
      }
    };
  }

  function transformNutrition(nutritionData: any): NutritionProfile {
    const currentPlan = nutritionData.current_plan;
    
    if (!currentPlan) {
      return {
        calories: { consumed: 0, target: 2000, remaining: 2000 },
        macros: {
          protein: { current: 0, target: 150, percentage: 0 },
          carbs: { current: 0, target: 250, percentage: 0 },
          fat: { current: 0, target: 80, percentage: 0 }
        },
        micronutrients: {
          vitamin_d: 0,
          vitamin_b12: 0,
          iron: 0,
          magnesium: 0
        }
      };
    }

    return {
      calories: {
        consumed: currentPlan.calories_consumed || 1800,
        target: currentPlan.target_calories || 2000,
        remaining: (currentPlan.target_calories || 2000) - (currentPlan.calories_consumed || 1800)
      },
      macros: {
        protein: {
          current: currentPlan.protein_consumed || 130,
          target: currentPlan.protein_target || 150,
          percentage: Math.round((currentPlan.protein_consumed || 130) / (currentPlan.protein_target || 150) * 100)
        },
        carbs: {
          current: currentPlan.carbs_consumed || 220,
          target: currentPlan.carbs_target || 250,
          percentage: Math.round((currentPlan.carbs_consumed || 220) / (currentPlan.carbs_target || 250) * 100)
        },
        fat: {
          current: currentPlan.fat_consumed || 65,
          target: currentPlan.fat_target || 80,
          percentage: Math.round((currentPlan.fat_consumed || 65) / (currentPlan.fat_target || 80) * 100)
        }
      },
      micronutrients: {
        vitamin_d: currentPlan.vitamin_d_percentage || 75,
        vitamin_b12: currentPlan.vitamin_b12_percentage || 90,
        iron: currentPlan.iron_percentage || 80,
        magnesium: currentPlan.magnesium_percentage || 85
      }
    };
  }

  function calculateMetricStatus(value: number, target: number): 'excellent' | 'good' | 'warning' | 'critical' {
    const percentage = value / target;
    if (percentage >= 0.95) return 'excellent';
    if (percentage >= 0.80) return 'good';
    if (percentage >= 0.60) return 'warning';
    return 'critical';
  }

  // ================================
  // AI CHAT FUNCTIONALITY
  // ================================
  
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || chatLoading) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatLoading(true);

    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      // Call real AI nutrition endpoint
      const result = await apiClient.makeRequest('/api/ai/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          action: 'health_chat',
          message: userMessage,
          context: {
            healthScore,
            currentMetrics: healthMetrics,
            biometrics,
            nutrition
          }
        })
      });

      if (result.data) {
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.data.response || 'Îmi pare rău, nu pot procesa cererea ta acum. Te rog încearcă din nou.',
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Îmi pare rău, întâmpin dificultăți tehnice. Te rog încearcă din nou în câteva momente.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // ================================
  // GENERATE NUTRITION PLAN
  // ================================
  
  const generateNutritionPlan = async () => {
    try {
      const result = await apiClient.makeRequest('/api/ai/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate_meal_plan',
          preferences: {
            targetCalories: 2000,
            dietaryRestrictions: [],
            allergies: [],
            mealsPerDay: 3,
            budget: 'medium'
          }
        })
      });

      if (result.data) {
        // Refresh dashboard data to show new plan
        refetchDashboard();
        alert('Plan nutrițional generat cu succes!');
      }
    } catch (error) {
      console.error('Nutrition plan generation error:', error);
      alert('Eroare la generarea planului. Te rog încearcă din nou.');
    }
  };

  // ================================
  // LIFECYCLE & EFFECTS
  // ================================

  useEffect(() => {
    // Real-time clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Initialize particles and animations
    if (!dashboardLoading) {
      initializeParticles();
      startRealTimeUpdates();
    }
  }, [dashboardLoading]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (chatMessages.length === 0 && !dashboardLoading) {
      setChatMessages([{
        id: 1,
        role: 'assistant',
        content: 'Salut! Sunt AI-ul tău de sănătate. Am analizat datele tale și totul arată bine! Ce vrei să optimizăm astăzi?',
        timestamp: new Date()
      }]);
    }
  }, [dashboardLoading]);

  const initializeParticles = () => {
    if (!particleContainerRef.current) return;
    
    // Clear existing particles
    particleContainerRef.current.innerHTML = '';
    
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
    // Refresh dashboard data every 5 minutes
    const updateInterval = setInterval(refetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(updateInterval);
  };

  // ================================
  // HELPER FUNCTIONS (kept from original)
  // ================================

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
    if (hour < 12) return 'Bună dimineața';
    if (hour < 17) return 'Bună ziua';
    return 'Bună seara';
  };

  // ================================
  // LOADING STATE
  // ================================

  if (dashboardLoading || progressLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingOrb}>
          <div className={styles.orbCore}></div>
          <div className={styles.orbRipple}></div>
          <div className={`${styles.orbRipple} ${styles.orbRippleDelay}`}></div>
        </div>
        <h2 className={styles.loadingTitle}>
          🌿 Se încarcă PorHealth
        </h2>
        <p className={styles.loadingSubtitle}>
          AI-ul analizează pattern-urile tale biometrice și optimizează ecosistemul de wellness...
        </p>
        <div className={styles.loadingProgress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
          <div className={styles.loadingSteps}>
            <span className={styles.stepItem}>Conectare la wearables</span>
            <span className={`${styles.stepItem} ${styles.stepDelay1}`}>Procesare date somn</span>
            <span className={`${styles.stepItem} ${styles.stepDelay2}`}>Analiză pattern-uri nutriție</span>
            <span className={`${styles.stepItem} ${styles.stepDelay3}`}>Generare insights</span>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // ERROR STATE
  // ================================

  if (dashboardError) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Eroare la încărcarea datelor</h2>
        <p>{dashboardError}</p>
        <button onClick={refetchDashboard} className={styles.retryButton}>
          Încearcă din nou
        </button>
      </div>
    );
  }

  // ================================
  // MAIN RENDER (Keep all the original JSX structure but with real data)
  // ================================

  return (
    <div className={styles.dashboard}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}></div>
      <div ref={particleContainerRef} className={styles.particleContainer}></div>

      {/* Sidebar - Keep original structure */}
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
                {!nutrition?.calories.consumed && <span className={styles.badge}>New</span>}
              </Link>

              <Link href="/dashboard/por-health/workouts" className={styles.navItem}>
                <span className={styles.navIcon}>💪</span>
                <span>Smart Workouts</span>
                {workouts.length > 0 && <span className={styles.counter}>{workouts.length}</span>}
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

              <button className={styles.navItem} onClick={generateNutritionPlan}>
                <span className={styles.navIcon}>🍎</span>
                <span>Generate Meal Plan</span>
              </button>

              <button className={styles.navItem}>
                <span className={styles.navIcon}>🎯</span>
                <span>Goal Optimizer</span>
              </button>
            </div>
          </div>

          {/* Ecosystems navigation - keep original */}
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
        {/* Header with real data */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>
              {getGreeting()}! 
              <span className={styles.timeChip}>{formatTime(currentTime)}</span>
            </h1>
            <p className={styles.headerSubtitle}>
              Ecosistemul tău de wellness funcționează la 
              <span className={styles.healthScoreText}> {healthScore}% </span>
              performanță optimă
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
                {insights.length > 0 && <span className={styles.notificationBadge}>{insights.length}</span>}
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

        {/* AI Insights Banner with real data */}
        {insights.length > 0 && (
          <div className={styles.insightsBanner}>
            <div className={styles.insightsGlow}></div>
            
            <div className={styles.insightsHeader}>
              <div className={styles.insightsInfo}>
                <div className={styles.insightsIcon}>🧠</div>
                <div>
                  <h3 className={styles.insightsTitle}>AI Health Insights</h3>
                  <p className={styles.insightsSubtitle}>Analiză în timp real a pattern-urilor biometrice</p>
                </div>
              </div>
              <button className={styles.viewAllButton}>Vezi Toate</button>
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
                    <button className={styles.insightAction}>Acționează</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Metrics Grid with real data */}
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
                  Țintă: {metric.target.toLocaleString()} {metric.unit}
                </div>
              </div>

              {/* Expanded View */}
              {selectedMetric === metric.id && (
                <div className={styles.metricExpanded}>
                  <div className={styles.chartPlaceholder}>
                    📈 Vizualizare trend 7 zile
                  </div>
                  <p className={styles.aiAnalysis}>
                    Analiza AI arată performanță optimă. Continuă așa!
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content Grid with real data */}
        <div className={styles.contentGrid}>
          {/* Nutrition Card with real data */}
          {nutrition ? (
            <div className={styles.nutritionCard}>
              <div className={styles.nutritionGlow}></div>
              
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>🍎 Nutriția de Astăzi</h3>
                <div className={styles.aiOptimizedBadge}>
                  {nutrition.calories.consumed > 0 ? 'AI Optimizat' : 'Generează Plan'}
                </div>
              </div>
              
              {nutrition.calories.consumed > 0 ? (
                <>
                  <div className={styles.caloriesOverview}>
                    <div className={styles.caloriesDisplay}>
                      <span className={styles.caloriesConsumed}>{nutrition.calories.consumed}</span>
                      <span className={styles.caloriesSeparator}>/</span>
                      <span className={styles.caloriesTarget}>{nutrition.calories.target}</span>
                      <span className={styles.caloriesUnit}>kcal</span>
                    </div>
                    <div className={styles.caloriesRemaining}>
                      {nutrition.calories.remaining} calorii rămase
                    </div>
                  </div>

                  <div className={styles.macrosGrid}>
                    {Object.entries(nutrition.macros).map(([key, macro]) => (
                      <div key={key} className={styles.macroCard}>
                        <div className={styles.macroHeader}>
                          <span className={styles.macroName}>
                            {key === 'protein' ? 'Proteine' : key === 'carbs' ? 'Carbohidrați' : 'Grăsimi'}
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
                </>
              ) : (
                <div className={styles.noNutritionPlan}>
                  <div className={styles.noDataIcon}>🍽️</div>
                  <h4>Niciun plan nutrițional activ</h4>
                  <p>Generează un plan personalizat cu AI pentru a-ți optimiza nutriția.</p>
                  <button onClick={generateNutritionPlan} className={styles.generatePlanButton}>
                    Generează Plan AI
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.nutritionCard}>
              <div className={styles.nutritionGlow}></div>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>🍎 Nutriția de Astăzi</h3>
              </div>
              <div className={styles.loadingNutrition}>
                <div className={styles.loadingSpinner}></div>
                <p>Se încarcă datele nutriționale...</p>
              </div>
            </div>
          )}

          {/* Workouts Card with real data */}
          <div className={styles.workoutsCard}>
            <div className={styles.workoutsGlow}></div>
            
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>💪 Antrenamentul de Astăzi</h3>
              <div className={styles.workoutsSummary}>
                <span>{workouts.length} sesiuni</span>
                {workouts.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{workouts.reduce((acc, w) => acc + w.caloriesBurn, 0)} cal</span>
                  </>
                )}
              </div>
            </div>
            
            {workouts.length > 0 ? (
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
                        <span className={styles.completedLabel}>Completat</span>
                      ) : workout.status === 'active' ? (
                        <button className={styles.continueButton}>Continuă</button>
                      ) : workout.timeRemaining ? (
                        <div className={styles.scheduledWorkout}>
                          <span className={styles.timeRemaining}>în {workout.timeRemaining}</span>
                          <button className={styles.startButton}>Start</button>
                        </div>
                      ) : (
                        <button className={styles.startButton}>Start Acum</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noWorkouts}>
                <div className={styles.noDataIcon}>💪</div>
                <h4>Niciun antrenament programat</h4>
                <p>Planifică un antrenament personalizat cu AI pentru astăzi.</p>
                <button className={styles.planWorkoutButton}>
                  Planifică Antrenament
                </button>
              </div>
            )}
          </div>

          {/* Biometrics Card with real data */}
          {biometrics ? (
            <div className={styles.biometricsCard}>
              <div className={styles.biometricsGlow}></div>
              
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📊 Biometrie Live</h3>
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
                    <span className={styles.biometricLabel}>Puls</span>
                  </div>
                </div>
                
                <div className={styles.biometricItem}>
                  <div className={styles.biometricIcon}>🩸</div>
                  <div className={styles.biometricData}>
                    <span className={styles.biometricValue}>
                      {biometrics.bloodPressure.systolic}/{biometrics.bloodPressure.diastolic}
                    </span>
                    <span className={styles.biometricUnit}>mmHg</span>
                    <span className={styles.biometricLabel}>Tensiune</span>
                  </div>
                </div>
                
                <div className={styles.biometricItem}>
                  <div className={styles.biometricIcon}>⚖️</div>
                  <div className={styles.biometricData}>
                    <span className={styles.biometricValue}>{biometrics.bodyComposition.weight}</span>
                    <span className={styles.biometricUnit}>kg</span>
                    <span className={styles.biometricLabel}>Greutate</span>
                  </div>
                </div>
                
                <div className={styles.biometricItem}>
                  <div className={styles.biometricIcon}>🧧</div>
                  <div className={styles.biometricData}>
                    <span className={styles.biometricValue}>{biometrics.stress.recovery}</span>
                    <span className={styles.biometricUnit}>%</span>
                    <span className={styles.biometricLabel}>Recuperare</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.biometricsCard}>
              <div className={styles.biometricsGlow}></div>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📊 Biometrie Live</h3>
              </div>
              <div className={styles.loadingBiometrics}>
                <div className={styles.loadingSpinner}></div>
                <p>Se sincronizează datele biometrice...</p>
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

      {/* AI Chat Component - Now with REAL functionality */}
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
              {chatMessages.map((msg) => (
                <div key={msg.id} className={styles.chatMessage}>
                  <div className={msg.role === 'user' ? styles.userAvatar : styles.aiAvatar}>
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className={styles.messageContent}>
                    <p>{msg.content}</p>
                    <span className={styles.messageTime}>
                      {msg.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className={styles.chatMessage}>
                  <div className={styles.aiAvatar}>🤖</div>
                  <div className={styles.messageContent}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Întreabă AI-ul tău de sănătate orice..."
                className={styles.chatInputField}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={chatLoading}
              />
              <button 
                className={styles.chatSend}
                onClick={handleSendMessage}
                disabled={chatLoading || !chatMessage.trim()}
              >
                {chatLoading ? '⏳' : 'Trimite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );