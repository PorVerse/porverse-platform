// app/dashboard/por-well/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AIChat from '../../../components/ai-chat/AIChat';

interface WellnessMetrics {
  moodScore: number;
  stressLevel: number;
  anxietyLevel: number;
  sleepQuality: number;
  mindfulnessStreak: number;
  meditationMinutes: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  isPrimary?: boolean;
}

interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'celebration';
  title: string;
  message: string;
  icon: string;
  action?: {
    text: string;
    href: string;
  };
}

export default function PorWellDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [wellnessMetrics, setWellnessMetrics] = useState<WellnessMetrics>({
    moodScore: 0,
    stressLevel: 0,
    anxietyLevel: 0,
    sleepQuality: 0,
    mindfulnessStreak: 0,
    meditationMinutes: 0
  });

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setWellnessMetrics({
        moodScore: 7.8,
        stressLevel: 3.2,
        anxietyLevel: 2.1,
        sleepQuality: 8.4,
        mindfulnessStreak: 12,
        meditationMinutes: 145
      });
    }, 1000);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bună dimineața';
    if (hour < 18) return 'Bună ziua';
    return 'Bună seara';
  };

  const quickActions: QuickAction[] = [
    {
      id: 'anxiety-helper',
      title: 'Anxiety Helper',
      description: 'Toolkit pentru gestionarea anxietății acute',
      icon: '🌸',
      href: '/dashboard/por-well/anxiety-helper',
      gradient: 'from-purple-500 to-purple-600',
      isPrimary: true
    },
    {
      id: 'mood-tracker',
      title: 'Mood Tracker',
      description: 'Înregistrează și analizează starea emoțională',
      icon: '📊',
      href: '/dashboard/por-well/mood-tracker',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'meditation',
      title: 'Guided Meditation',
      description: 'Sesiuni de meditație personalizate',
      icon: '🧘‍♀️',
      href: '/dashboard/por-well/meditation',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'sleep-therapy',
      title: 'Sleep Therapy',
      description: 'CBT-I și optimizarea somnului',
      icon: '😴',
      href: '/dashboard/por-well/sleep-therapy',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'stress-management',
      title: 'Stress Management',
      description: 'Tehnici pentru reducerea stresului',
      icon: '🛡️',
      href: '/dashboard/por-well/stress-management',
      gradient: 'from-rose-500 to-rose-600'
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness Daily',
      description: 'Practici mindfulness pentru zi de zi',
      icon: '🌱',
      href: '/dashboard/por-well/mindfulness',
      gradient: 'from-green-500 to-green-600'
    }
  ];

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'celebration',
      title: 'Felicitări! 🎉',
      message: 'Ai menținut o stare emoțională stabilă timp de 12 zile consecutive. Mindfulness-ul pare să funcționeze excelent pentru tine!',
      icon: '🏆',
      action: {
        text: 'Vezi progresul complet',
        href: '/dashboard/por-well/progress'
      }
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Recomandare personalizată',
      message: 'Pe baza analizei tale de somn, îți recomand o sesiune de breathing exercises înainte de culcare pentru îmbunătățirea calității somnului.',
      icon: '💡',
      action: {
        text: 'Start breathing session',
        href: '/dashboard/por-well/breathing'
      }
    },
    {
      id: '3',
      type: 'warning',
      title: 'Atenție la stres',
      message: 'Nivelul de stres a crescut cu 15% în ultimele 3 zile. Să explorăm împreună niste tehnici de relaxare?',
      icon: '⚠️',
      action: {
        text: 'Exerciții de relaxare',
        href: '/dashboard/por-well/stress-management'
      }
    }
  ];

  const getMetricColor = (value: number, isReverse: boolean = false) => {
    if (isReverse) {
      if (value <= 3) return 'text-emerald-400';
      if (value <= 6) return 'text-amber-400';
      return 'text-red-400';
    } else {
      if (value >= 8) return 'text-emerald-400';
      if (value >= 6) return 'text-amber-400';
      return 'text-red-400';
    }
  };

  const getMetricBgColor = (value: number, isReverse: boolean = false) => {
    if (isReverse) {
      if (value <= 3) return 'bg-emerald-500';
      if (value <= 6) return 'bg-amber-500';
      return 'bg-red-500';
    } else {
      if (value >= 8) return 'bg-emerald-500';
      if (value >= 6) return 'bg-amber-500';
      return 'bg-red-500';
    }
  };

  const getMetricStatus = (value: number, isReverse: boolean = false) => {
    if (isReverse) {
      if (value <= 3) return 'Excelent';
      if (value <= 6) return 'Moderat';
      return 'Ridicat';
    } else {
      if (value >= 8) return 'Excelent';
      if (value >= 6) return 'Bun';
      return 'Necesită atenție';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-slate-900/20 to-indigo-900/30"></div>
        {isClient && (
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center">
                🌻 PorWell Dashboard
              </h1>
              <p className="text-white/80 mt-1">
                {getGreeting()}! Wellness score-ul tău este{' '}
                <span className="font-bold text-purple-400">{wellnessMetrics.moodScore.toFixed(1)}/10</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{wellnessMetrics.mindfulnessStreak}</div>
                  <div className="text-xs text-white/60">Zile mindful</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{wellnessMetrics.meditationMinutes}</div>
                  <div className="text-xs text-white/60">Min meditație</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{wellnessMetrics.sleepQuality.toFixed(1)}</div>
                  <div className="text-xs text-white/60">Calitatea somnului</div>
                </div>
              </div>
              
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl backdrop-blur-sm text-purple-300 font-mono" suppressHydrationWarning>
                {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4">Centrul tău de echilibru interior</h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Monitorizează starea emoțională, practică mindfulness și construiește 
            obiceiuri sănătoase pentru mental wellness cu ghidajul AI personalizat.
          </p>
        </div>

        {/* Wellness Metrics Dashboard */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            📊 Wellness Metrics Azi
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">😊</span>
                  <div>
                    <h4 className="font-bold text-white">Mood Score</h4>
                    <div className="flex items-baseline">
                      <span className={`text-2xl font-bold ${getMetricColor(wellnessMetrics.moodScore)}`}>
                        {wellnessMetrics.moodScore.toFixed(1)}
                      </span>
                      <span className="text-white/60 ml-1">/10</span>
                    </div>
                    <span className="text-xs text-white/60">{getMetricStatus(wellnessMetrics.moodScore)}</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getMetricBgColor(wellnessMetrics.moodScore)}`}
                  style={{ width: `${(wellnessMetrics.moodScore / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">😰</span>
                  <div>
                    <h4 className="font-bold text-white">Nivel Stres</h4>
                    <div className="flex items-baseline">
                      <span className={`text-2xl font-bold ${getMetricColor(wellnessMetrics.stressLevel, true)}`}>
                        {wellnessMetrics.stressLevel.toFixed(1)}
                      </span>
                      <span className="text-white/60 ml-1">/10</span>
                    </div>
                    <span className="text-xs text-white/60">{getMetricStatus(wellnessMetrics.stressLevel, true)}</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getMetricBgColor(wellnessMetrics.stressLevel, true)}`}
                  style={{ width: `${(wellnessMetrics.stressLevel / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">😟</span>
                  <div>
                    <h4 className="font-bold text-white">Anxietate</h4>
                    <div className="flex items-baseline">
                      <span className={`text-2xl font-bold ${getMetricColor(wellnessMetrics.anxietyLevel, true)}`}>
                        {wellnessMetrics.anxietyLevel.toFixed(1)}
                      </span>
                      <span className="text-white/60 ml-1">/10</span>
                    </div>
                    <span className="text-xs text-white/60">{getMetricStatus(wellnessMetrics.anxietyLevel, true)}</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getMetricBgColor(wellnessMetrics.anxietyLevel, true)}`}
                  style={{ width: `${(wellnessMetrics.anxietyLevel / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">😴</span>
                  <div>
                    <h4 className="font-bold text-white">Calitatea Somnului</h4>
                    <div className="flex items-baseline">
                      <span className={`text-2xl font-bold ${getMetricColor(wellnessMetrics.sleepQuality)}`}>
                        {wellnessMetrics.sleepQuality.toFixed(1)}
                      </span>
                      <span className="text-white/60 ml-1">/10</span>
                    </div>
                    <span className="text-xs text-white/60">{getMetricStatus(wellnessMetrics.sleepQuality)}</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getMetricBgColor(wellnessMetrics.sleepQuality)}`}
                  style={{ width: `${(wellnessMetrics.sleepQuality / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            🚀 Acțiuni Rapide
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link 
                key={action.id} 
                href={action.href} 
                className={`group block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105 ${action.isPrimary ? 'border-purple-500/50 bg-purple-500/10' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-2">{action.title}</h4>
                    <p className="text-sm text-white/70 leading-relaxed">{action.description}</p>
                  </div>
                </div>
                {action.isPrimary && (
                  <div className="mt-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-center">
                    RECOMANDAT
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            🤖 AI Insights Personalizate
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {aiInsights.map((insight) => (
              <div 
                key={insight.id} 
                className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105 ${
                  insight.type === 'celebration' ? 'border-emerald-500/50 bg-emerald-500/10' :
                  insight.type === 'warning' ? 'border-amber-500/50 bg-amber-500/10' :
                  'border-blue-500/50 bg-blue-500/10'
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{insight.icon}</span>
                  <h4 className="font-bold text-white">{insight.title}</h4>
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-4">{insight.message}</p>
                {insight.action && (
                  <Link 
                    href={insight.action.href} 
                    className="inline-flex items-center text-sm font-semibold text-white hover:text-white/80 transition-colors"
                  >
                    {insight.action.text} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Mindfulness Challenge */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-4xl">🌟</span>
              <div>
                <h3 className="text-2xl font-bold text-white">Provocarea Zilei</h3>
                <p className="text-purple-300">Mindfulness în activitățile cotidiene</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-white/90 leading-relaxed">
                Astăzi, practică mindfulness în timp ce bei ceaiul sau cafeaua de dimineață. 
                Observă temperatura, aroma, gustul și senzațiile din corp în timp ce bei încet.
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-white">Progres azi:</span>
                <span className="text-sm font-semibold text-purple-300">65% completat</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="w-[65%] bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-1000"></div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-bold transition-all hover:scale-105">
                ✅ Marchează ca finalizat
              </button>
              <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all hover:scale-105">
                📝 Adaugă notițe
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            📈 Activități Recente
          </h3>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                  🧘‍♀️
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">Sesiune de meditație completată</div>
                  <div className="text-sm text-white/60">15 minute • Acum 2 ore</div>
                </div>
                <div className="text-sm font-semibold text-emerald-400">+0.3 mood score</div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xl">
                  📊
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">Mood check-in înregistrat</div>
                  <div className="text-sm text-white/60">Stare bună • Acum 4 ore</div>
                </div>
                <div className="text-sm font-semibold text-purple-400">Streak menținut</div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-xl">
                  🌱
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">Exercițiu de mindfulness</div>
                  <div className="text-sm text-white/60">Respirație conștientă • Ieri</div>
                </div>
                <div className="text-sm font-semibold text-emerald-400">+0.2 wellness</div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-xl">
                  😴
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">Analiza somnului</div>
                  <div className="text-sm text-white/60">7h 45min • Ieri noapte</div>
                </div>
                <div className="text-sm font-semibold text-blue-400">Calitate bună</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Integration */}
      <AIChat 
        ecosystem="por-well"
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}