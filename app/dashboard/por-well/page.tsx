'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// Import hook-urile personalizate - cu error handling
let useWellnessData: any;
let useAITherapist: any;
let useTherapyInsights: any;

try {
  const wellnessHooks = require('@/lib/hooks/useWellnessData');
  const therapistHooks = require('@/lib/hooks/useAITherapist');
  const insightsHooks = require('@/lib/hooks/useTherapyInsights');
  
  useWellnessData = wellnessHooks.useWellnessData;
  useAITherapist = therapistHooks.useAITherapist;
  useTherapyInsights = insightsHooks.useTherapyInsights;
} catch (error) {
  console.log('Hook-urile nu sunt disponibile, folosesc mock data');
  
  // Fallback hooks pentru development
  useWellnessData = () => ({
    data: {
      mood: {
        entries: [
          { mood: 'good', date: '2025-06-19', notes: 'Zi bună' },
          { mood: 'excellent', date: '2025-06-18', notes: 'Mood excelent' }
        ],
        currentMood: 'good',
        weeklyAverage: 4.2
      },
      meditation: {
        totalMinutes: 180,
        streakDays: 12,
        totalSessions: 23
      },
      sleep: {
        averageScore: 8.2,
        lastNight: 8.5,
        weeklyTrend: 'improving'
      },
      stress: {
        currentLevel: 3,
        totalSessions: 15,
        reductionPercentage: 20
      },
      journal: {
        totalEntries: 23,
        dominantEmotion: 'optimism'
      }
    },
    loading: false,
    error: null,
    refetch: () => console.log('Refetch mock data')
  });
  
  useAITherapist = () => ({
    detectCrisis: (message: string) => false,
    generateResponse: async () => ({ message: 'Mock AI response' }),
    loading: false,
    error: null
  });
  
  useTherapyInsights = () => ({
    moodTrend: { message: 'Mood-ul tău arată progres pozitiv!' },
    sleepImpact: { message: 'Somnul de calitate îți susține mood-ul.' },
    recommendations: [
      { text: 'Continuă meditația zilnică pentru echilibru optimal.' }
    ]
  });
}

interface WellnessOverview {
  mood: {
    current: string;
    trend: 'improving' | 'stable' | 'declining';
    weeklyAverage: number;
  };
  meditation: {
    streakDays: number;
    totalMinutes: number;
    weeklyGoal: number;
    weeklyProgress: number;
  };
  stress: {
    currentLevel: number;
    weeklyReduction: number;
    techniquesUsed: number;
  };
  sleep: {
    averageScore: number;
    lastNightScore: number;
    consistencyRating: number;
  };
  aiTherapy: {
    totalSessions: number;
    lastSessionDate: string;
    helpfulnessRating: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  urgency: 'low' | 'medium' | 'high';
  estimated_time: string;
}

export default function PorWellDashboard() {
  const router = useRouter();
  
  // Hook-urile cu error handling
  const wellnessHook = useWellnessData();
  const therapistHook = useAITherapist();
  const wellnessData = wellnessHook?.data;
  const loading = wellnessHook?.loading || false;
  const error = wellnessHook?.error || null;
  const refetch = wellnessHook?.refetch || (() => {});
  const detectCrisis = therapistHook?.detectCrisis || (() => false);
  const insights = useTherapyInsights(wellnessData);
  
  const [overview, setOverview] = useState<WellnessOverview | null>(null);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (wellnessData) {
      generateOverview();
    }
  }, [wellnessData]);

  useEffect(() => {
    if (overview) {
      generateQuickActions();
    }
  }, [overview]);

  useEffect(() => {
    // Show welcome message for new users
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('porwell_visited');
      if (!hasVisited) {
        setShowWelcome(true);
        localStorage.setItem('porwell_visited', 'true');
      }
    }
  }, []);

  const generateOverview = () => {
    if (!wellnessData) return;

    const newOverview: WellnessOverview = {
      mood: {
        current: wellnessData.mood?.currentMood || 'neutral',
        trend: (wellnessData.mood?.weeklyAverage || 3) > 3.5 ? 'improving' : 
               (wellnessData.mood?.weeklyAverage || 3) > 2.5 ? 'stable' : 'declining',
        weeklyAverage: wellnessData.mood?.weeklyAverage || 3
      },
      meditation: {
        streakDays: wellnessData.meditation?.streakDays || 0,
        totalMinutes: wellnessData.meditation?.totalMinutes || 0,
        weeklyGoal: 70, // 10 min/day * 7 days
        weeklyProgress: Math.min(wellnessData.meditation?.totalMinutes || 0, 70)
      },
      stress: {
        currentLevel: wellnessData.stress?.currentLevel || 5,
        weeklyReduction: wellnessData.stress?.reductionPercentage || 0,
        techniquesUsed: wellnessData.stress?.totalSessions || 0
      },
      sleep: {
        averageScore: wellnessData.sleep?.averageScore || 0,
        lastNightScore: wellnessData.sleep?.lastNight || 0,
        consistencyRating: 7.5 // Calculated based on sleep pattern
      },
      aiTherapy: {
        totalSessions: 12, // From therapy logs
        lastSessionDate: '2025-06-19',
        helpfulnessRating: 4.8
      }
    };

    setOverview(newOverview);
  };

  const generateQuickActions = () => {
    if (!wellnessData || !overview) return;

    const actions: QuickAction[] = [];

    // Mood-based actions
    if (overview.mood.weeklyAverage < 3) {
      actions.push({
        id: 'mood-boost',
        title: 'Sesiune Mood Boost',
        description: 'Îmbunătățește-ți starea cu tehnici rapide',
        icon: '😊',
        route: '/dashboard/por-well/mood-tracking',
        urgency: 'high',
        estimated_time: '5 min'
      });
    }

    // Stress-based actions
    if (overview.stress.currentLevel > 7) {
      actions.push({
        id: 'stress-relief',
        title: 'Stress Relief Urgent',
        description: 'Tehnici immediate pentru reducerea stresului',
        icon: '💆',
        route: '/dashboard/por-well/stress-management',
        urgency: 'high',
        estimated_time: '3 min'
      });
    }

    // Meditation streak
    if (overview.meditation.streakDays === 0) {
      actions.push({
        id: 'start-meditation',
        title: 'Începe Meditația',
        description: 'Doar 5 minute pentru calm și focus',
        icon: '🧘',
        route: '/dashboard/por-well/meditation',
        urgency: 'medium',
        estimated_time: '5 min'
      });
    }

    // Sleep optimization
    if (overview.sleep.averageScore < 6) {
      actions.push({
        id: 'sleep-optimization',
        title: 'Optimizează Somnul',
        description: 'Sfaturi personalizate pentru somn mai bun',
        icon: '😴',
        route: '/dashboard/por-well/sleep-therapy',
        urgency: 'medium',
        estimated_time: '10 min'
      });
    }

    // AI Therapy session - întotdeauna disponibil
    actions.push({
      id: 'ai-therapy',
      title: 'Vorbește cu AI Therapist',
      description: 'Check-in cu asistentul tău de wellness mental',
      icon: '🤖',
      route: '/dashboard/por-well/chat',
      urgency: 'low',
      estimated_time: '15 min'
    });

    setQuickActions(actions.slice(0, 4)); // Max 4 quick actions
  };

  const getWellnessScore = (): number => {
    if (!overview) return 0;
    
    const moodScore = (overview.mood.weeklyAverage / 5) * 25;
    const meditationScore = Math.min((overview.meditation.streakDays / 7), 1) * 25;
    const stressScore = ((10 - overview.stress.currentLevel) / 10) * 25;
    const sleepScore = (overview.sleep.averageScore / 10) * 25;
    
    return Math.round(moodScore + meditationScore + stressScore + sleepScore);
  };

  const getTimeBasedGreeting = (): string => {
    const hour = currentTime.getHours();
    
    if (hour < 6) return "Noapte bună";
    if (hour < 12) return "Bună dimineața";
    if (hour < 17) return "Bună ziua";
    if (hour < 22) return "Bună seara";
    return "Noapte bună";
  };

  const getWellnessAdvice = (): string => {
    if (!overview) return "Completează datele pentru sfaturi personalizate.";
    
    const hour = currentTime.getHours();
    
    if (hour >= 6 && hour < 9) {
      return "Dimineața este perfectă pentru setarea intenției zilei. Încearcă 5 minute de meditație.";
    } else if (hour >= 12 && hour < 14) {
      return "Pauza de prânz e ideală pentru o scurtă sesiune de mindfulness.";
    } else if (hour >= 18 && hour < 22) {
      return "Seara e timpul perfect pentru reflecție și pregătirea pentru somn.";
    } else {
      return "Orice moment e bun pentru o respirație conștientă și un check-in emotional.";
    }
  };

  const getTrendData = () => {
    return [
      { day: 'Lun', mood: 4, stress: 6, sleep: 7, meditation: 10 },
      { day: 'Mar', mood: 5, stress: 4, sleep: 8, meditation: 15 },
      { day: 'Mie', mood: 3, stress: 8, sleep: 6, meditation: 5 },
      { day: 'Joi', mood: 4, stress: 5, sleep: 7, meditation: 20 },
      { day: 'Vin', mood: 5, stress: 3, sleep: 8, meditation: 12 },
      { day: 'Sâm', mood: 4, stress: 4, sleep: 9, meditation: 25 },
      { day: 'Dum', mood: 5, stress: 2, sleep: 8, meditation: 30 }
    ];
  };

  const getToolsUsageData = () => {
    return [
      { name: 'AI Therapist', usage: overview?.aiTherapy.totalSessions || 12, color: '#8b5cf6' },
      { name: 'Meditation', usage: overview?.meditation.streakDays || 12, color: '#06b6d4' },
      { name: 'Mood Tracker', usage: 15, color: '#22c55e' },
      { name: 'Stress Relief', usage: overview?.stress.techniquesUsed || 8, color: '#f59e0b' },
      { name: 'Sleep Therapy', usage: 8, color: '#6366f1' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Se încarcă datele wellness...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Eroare la încărcarea datelor</div>
          <p className="text-gray-300 mb-6">Nu am putut încărca datele de wellness.</p>
          <button 
            onClick={refetch}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            🔄 Reîncearcă
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-transparent to-cyan-500/10 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-6 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold hover:bg-purple-500 hover:border-purple-500 transition-all duration-300"
          >
            ← Înapoi la Dashboard Principal
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              🌸 PorWell Dashboard
            </h1>
            <p className="text-gray-300 text-lg mb-4">
              {getTimeBasedGreeting()}! Centrul tău de wellness mental și mindfulness
            </p>
            <div className="text-purple-400">
              {currentTime.toLocaleDateString('ro-RO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Wellness Score */}
          {overview && (
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
                <h2 className="text-lg font-semibold text-white mb-4">Scorul Tău Wellness</h2>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - getWellnessScore() / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{getWellnessScore()}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{getWellnessAdvice()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">😊</div>
              <div className="text-2xl font-bold text-purple-400">{overview.mood.weeklyAverage.toFixed(1)}/5</div>
              <div className="text-gray-300 text-sm">Mood Mediu</div>
              <div className={`text-xs mt-1 ${
                overview.mood.trend === 'improving' ? 'text-green-400' :
                overview.mood.trend === 'declining' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {overview.mood.trend === 'improving' ? '↗️ În creștere' :
                 overview.mood.trend === 'declining' ? '↘️ În scădere' : '→ Stabil'}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">🧘</div>
              <div className="text-2xl font-bold text-cyan-400">{overview.meditation.streakDays}</div>
              <div className="text-gray-300 text-sm">Zile Consecutiv</div>
              <div className="text-xs text-gray-400 mt-1">
                {overview.meditation.totalMinutes} min total
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">💆</div>
              <div className="text-2xl font-bold text-orange-400">{overview.stress.currentLevel}/10</div>
              <div className="text-gray-300 text-sm">Nivel Stres</div>
              <div className="text-xs text-green-400 mt-1">
                -{overview.stress.weeklyReduction}% săptămâna aceasta
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">😴</div>
              <div className="text-2xl font-bold text-indigo-400">{overview.sleep.averageScore.toFixed(1)}/10</div>
              <div className="text-gray-300 text-sm">Calitate Somn</div>
              <div className="text-xs text-gray-400 mt-1">
                Ultima noapte: {overview.sleep.lastNightScore}/10
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts & Trends */}
          <div className="lg:col-span-2 space-y-8">
            {/* Wellness Trends */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📈 Trend-uri Wellness (7 zile)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} name="Mood" />
                  <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={3} name="Stres" />
                  <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={3} name="Somn" />
                  <Line type="monotone" dataKey="meditation" stroke="#06b6d4" strokeWidth={3} name="Meditație (min)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tools Usage */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🛠️ Utilizarea Tool-urilor</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getToolsUsageData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="usage" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column - Quick Actions & Tools */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">⚡ Acțiuni Rapide</h3>
              <div className="space-y-3">
                {quickActions.length > 0 ? quickActions.map((action) => (
                  <Link
                    key={action.id}
                    href={action.route}
                    className={`block p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
                      action.urgency === 'high' 
                        ? 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30'
                        : action.urgency === 'medium'
                        ? 'bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30'
                        : 'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{action.title}</div>
                        <div className="text-sm text-gray-300">{action.description}</div>
                        <div className="text-xs text-gray-400 mt-1">{action.estimated_time}</div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center text-gray-400 py-4">
                    Completează datele pentru acțiuni personalizate
                  </div>
                )}
              </div>
            </div>

            {/* Wellness Tools Grid */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🛠️ Tool-uri Wellness</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard/por-well/chat"
                  className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg text-center hover:bg-purple-500/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="text-sm font-semibold text-white">AI Therapist</div>
                </Link>
                
                <Link
                  href="/dashboard/por-well/mood-tracking"
                  className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center hover:bg-green-500/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-2xl mb-2">😊</div>
                  <div className="text-sm font-semibold text-white">Mood Tracker</div>
                </Link>
                
                <Link
                  href="/dashboard/por-well/meditation"
                  className="p-4 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-center hover:bg-cyan-500/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-2xl mb-2">🧘</div>
                  <div className="text-sm font-semibold text-white">Meditation</div>
                </Link>
                
                <Link
                  href="/dashboard/por-well/stress-management"
                  className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg text-center hover:bg-orange-500/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-2xl mb-2">💆</div>
                  <div className="text-sm font-semibold text-white">Stress Relief</div>
                </Link>
                
                <Link
                  href="/dashboard/por-well/sleep-therapy"
                  className="p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-center hover:bg-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 col-span-2"
                >
                  <div className="text-2xl mb-2">😴</div>
                  <div className="text-sm font-semibold text-white">Sleep Therapy</div>
                </Link>
              </div>
            </div>

            {/* AI Insights */}
            {insights && (
              <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">🧠 AI Insights</h3>
                <div className="text-gray-300 text-sm leading-relaxed">
                  {insights.moodTrend?.message && (
                    <div className="mb-3">
                      <strong>Mood:</strong> {insights.moodTrend.message}
                    </div>
                  )}
                  {insights.sleepImpact?.message && (
                    <div className="mb-3">
                      <strong>Somn:</strong> {insights.sleepImpact.message}
                    </div>
                  )}
                  {insights.recommendations && insights.recommendations.length > 0 && (
                    <div>
                      <strong>Recomandare:</strong> {insights.recommendations[0].text}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Modal for new users */}
        {showWelcome && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-8 max-w-lg w-full">
              <div className="text-center">
                <div className="text-4xl mb-4">🌸</div>
                <h2 className="text-2xl font-bold text-white mb-4">Bun venit în PorWell!</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Centrul tău personal de wellness mental. Aici vei găsi toate tool-urile pentru 
                  a-ți îmbunătăți mood-ul, a medita, a gestiona stresul și a optimiza somnul.
                </p>
                <div className="text-sm text-gray-400 mb-6">
                  💡 <strong>Tip:</strong> Începe cu AI Therapist pentru o evaluare personalizată!
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Să Începem! 🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}