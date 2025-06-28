// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ecosystems = [
  {
    id: 'por-health',
    name: 'PorHealth',
    subtitle: 'Sănătate & Fitness AI',
    description: 'Nutriție personalizată, antrenamente optimize și monitorizare biometrică avansată',
    icon: '🌿',
    gradient: 'from-emerald-500 to-emerald-600',
    features: ['AI Nutrition Planner', 'Workout Optimizer', 'Biometric Tracking'],
    tier: 'FREE',
    href: '/ecosisteme/por-health'
  },
  {
    id: 'por-kids',
    name: 'PorKids',
    subtitle: 'Educație Conștientă',
    description: 'AI părinte-copil, homework scanner și dezvoltare holistică pentru copii',
    icon: '👶',
    gradient: 'from-pink-500 to-pink-600',
    features: ['Homework Scanner', 'Progress Tracking', 'Family Dashboard'],
    tier: 'FREE',
    href: '/ecosisteme/por-kids'
  },
  {
    id: 'por-mind',
    name: 'PorMind',
    subtitle: 'Educație Financiară AI',
    description: 'Money mindset, investiții inteligente și wealth building personalizat',
    icon: '🧠',
    gradient: 'from-blue-500 to-blue-600',
    features: ['Financial Planning', 'Investment AI', 'Wealth Building'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-mind'
  },
  {
    id: 'por-well',
    name: 'PorWell',
    subtitle: 'Mental Wellness AI',
    description: 'AI therapist, mood tracking și emotional intelligence optimization',
    icon: '🌻',
    gradient: 'from-purple-500 to-purple-600',
    features: ['AI Therapist', 'Mood Tracking', 'Anxiety Helper'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-well'
  },
  {
    id: 'por-flow',
    name: 'PorFlow',
    subtitle: 'Productivitate Maximă',
    description: 'Task management AI, time optimization și workflow automation',
    icon: '🌊',
    gradient: 'from-cyan-500 to-cyan-600',
    features: ['Task Management AI', 'Time Blocking', 'Focus Sessions'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-flow'
  },
  {
    id: 'por-blu',
    name: 'PorBlu',
    subtitle: 'Strategic Life Planning',
    description: 'Executive coaching, vision boarding și legacy planning pentru lideri',
    icon: '💧',
    gradient: 'from-amber-500 to-amber-600',
    features: ['Strategic Planning', 'Executive Coaching', 'Vision Boarding'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-blu'
  }
];

const testimonials = [
  {
    name: "Andrei Popescu",
    role: "Tech Entrepreneur",
    content: "PorVerse mi-a transformat complet viața. În 3 luni am optimizat sănătatea, finanțele și productivitatea. Este ca și cum aș avea un coach personal AI 24/7.",
    avatar: "🚀",
    ecosystems: ["PorHealth", "PorMind", "PorFlow"]
  },
  {
    name: "Maria Ionescu", 
    role: "Mamă & Designer",
    content: "PorKids a revoluționat educația copilului meu, iar PorWell m-a ajutat să îmi gestionez anxietatea. Investiția perfectă în familia noastră.",
    avatar: "🎨",
    ecosystems: ["PorKids", "PorWell"]
  },
  {
    name: "Călin Georgescu",
    role: "CEO & Investor", 
    content: "Quantum Vault este experiența supremă - mi-a arătat versiunea viitoare a mea și planul exact pentru a ajunge acolo. Mind-blowing!",
    avatar: "💎",
    ecosystems: ["Quantum Vault", "PorBlu"]
  }
];

export default function Homepage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    transformations: 0,
    countries: 0
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        users: 12847,
        transformations: 3921,
        countries: 23
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-slate-900/30"></div>
        {isClient && (
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-indigo-400 rounded-full animate-pulse"
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
            <Link href="/" className="flex items-center space-x-3 group">
              <span className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform">🧠</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                PorVerse
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/ecosisteme/por-health" className="text-white/70 hover:text-white transition-colors">
                Ecosisteme
              </Link>
              <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">
                Prețuri
              </Link>
              <Link href="/about" className="text-white/70 hover:text-white transition-colors">
                Despre
              </Link>
              <Link 
                href="/auth/login" 
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-sm transition-all hover:scale-105"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full backdrop-blur-sm">
                <span className="text-2xl">✨</span>
                <span className="text-sm font-semibold text-indigo-300">
                  Primul "Sistem de Operare Spirituală" din lume
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                Transformă-ți viața cu
                <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent filter drop-shadow-lg">
                  AI avansat
                </span>
              </h1>
              
              <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
                6 ecosisteme integrate pentru optimizarea holistică: sănătate, minte, wellness, 
                productivitate, strategic planning și educația copiilor. Evoluție măsurabilă prin 
                tehnologie de ultimă generație.
              </p>

              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-400 transition-all duration-1000">
                    {animatedStats.users.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">Utilizatori activi</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 transition-all duration-1000">
                    {animatedStats.transformations.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">Transformări reușite</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400 transition-all duration-1000">
                    {animatedStats.countries}
                  </div>
                  <div className="text-sm text-white/60">Țări</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/signup" 
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-105 text-center"
                >
                  🚀 Începe Transformarea
                </Link>
                <Link 
                  href="/demo" 
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all hover:scale-105 text-center"
                >
                  🎬 Vezi Demo Live
                </Link>
              </div>

              <div className="pt-4">
                <p className="text-sm text-white/60 mb-2">Folosit de echipe din:</p>
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-white/80">
                  <span>🏢 Google</span>
                  <span>💻 Microsoft</span>
                  <span>🚀 Tesla</span>
                  <span>💎 Apple</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl backdrop-blur-xl border border-white/10 p-8 shadow-2xl hover:shadow-indigo-500/20 transition-all hover:scale-105">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-lg font-bold">PorVerse Dashboard</h3>
                    <div className="text-sm font-mono text-indigo-400" suppressHydrationWarning>
                      {formatTime(currentTime)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {ecosystems.slice(0, 4).map((eco, index) => (
                      <div
                        key={eco.id}
                        className={`p-4 rounded-xl bg-gradient-to-br ${eco.gradient} text-white relative overflow-hidden group hover:scale-105 transition-all`}
                      >
                        <div className="text-2xl mb-2">{eco.icon}</div>
                        <div className="text-sm font-bold">{eco.name}</div>
                        <div className="text-xs opacity-90">
                          {eco.tier === 'FREE' ? '🆓' : '💎'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-center relative overflow-hidden group hover:scale-105 transition-all">
                    <div className="text-2xl mb-2">🔮</div>
                    <div className="text-sm font-bold">Quantum Vault</div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Ecosystems */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              🆓 Începe Gratuit
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              2 ecosisteme complete, fără limitări, pentru totdeauna
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {ecosystems.filter(eco => eco.tier === 'FREE').map(ecosystem => (
              <div 
                key={ecosystem.id} 
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl group-hover:scale-110 transition-transform">{ecosystem.icon}</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-sm font-bold">
                    GRATUIT
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{ecosystem.name}</h3>
                <p className="text-emerald-400 font-semibold mb-4">{ecosystem.subtitle}</p>
                <p className="text-white/70 leading-relaxed mb-6">{ecosystem.description}</p>
                
                <ul className="space-y-2 mb-8">
                  {ecosystem.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-white/80">
                      <span className="text-emerald-400 mr-2">✨</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href="/auth/signup" 
                  className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-bold text-center transition-all hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                >
                  🚀 Începe Gratuit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Ecosystems */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              💎 Ecosisteme Premium
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Unlock advanced AI features pentru transformare accelerată
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystems.filter(eco => eco.tier === 'PREMIUM').map(ecosystem => (
              <Link 
                key={ecosystem.id}
                href={ecosystem.href}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-xl block"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{ecosystem.icon}</span>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
                    PREMIUM
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-1">{ecosystem.name}</h3>
                <p className="text-sm font-semibold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {ecosystem.subtitle}
                </p>
                <p className="text-sm text-white/70 leading-relaxed mb-4">{ecosystem.description}</p>
                
                <ul className="space-y-1">
                  {ecosystem.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center text-xs text-white/80">
                      <span className="text-indigo-400 mr-1">✨</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm text-white/80">Explorează →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quantum Vault Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-indigo-600/10"></div>
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                  <span className="text-2xl">🔮</span>
                  <span className="text-sm font-bold text-purple-300">EXPERIENȚA SUPREMĂ</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-black">
                  Quantum Vault
                  <span className="block text-2xl font-semibold text-purple-400 mt-2">
                    Future Self AI & Reality Simulation
                  </span>
                </h2>
                
                <p className="text-lg text-white/80 leading-relaxed">
                  Se deblochează automat când achiziționezi <strong>Quantum Trinity</strong> 
                  (PorMind + PorFlow + PorBlu). Experiența premium care îți arată versiunea 
                  viitoare ideală și planul exact pentru a ajunge acolo.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-2xl">🧬</span>
                    <div>
                      <h4 className="font-bold text-white mb-1">Future Self AI Creation</h4>
                      <p className="text-sm text-white/70">Generează versiunea ta ideală din viitor cu detalii complete</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-2xl">🌌</span>
                    <div>
                      <h4 className="font-bold text-white mb-1">Identity Shift Simulator</h4>
                      <p className="text-sm text-white/70">Testează decizii majore în timeline-uri alternative</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-2xl">🗺️</span>
                    <div>
                      <h4 className="font-bold text-white mb-1">Reverse Roadmap Generator</h4>
                      <p className="text-sm text-white/70">Plan strategic din viitor spre prezent cu milestone-uri</p>
                    </div>
                  </div>
                </div>

                <Link 
                  href="/quantum-vault" 
                  className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all hover:scale-105"
                >
                  🔓 Descoperă Quantum Vault
                </Link>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center relative overflow-hidden group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 relative">
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-spin-slow"></div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400/50 animate-pulse"></div>
                    {isClient && (
                      <div className="absolute inset-0">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-purple-400 rounded-full animate-ping"
                            style={{
                              left: `${50 + 40 * Math.cos(i * 30 * Math.PI / 180)}%`,
                              top: `${50 + 40 * Math.sin(i * 30 * Math.PI / 180)}%`,
                              animationDelay: `${i * 0.2}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Transformări Reale, Rezultate Măsurabile
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Oameni din întreaga lume își transformă viața cu PorVerse
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:scale-105"
              >
                <div className="mb-4">
                  <p className="text-white/90 italic leading-relaxed">"{testimonial.content}"</p>
                </div>
                
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">{testimonial.avatar}</span>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-white/60">{testimonial.role}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {testimonial.ecosystems.map((eco, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-xs">
                      {eco}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-12">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Gata să îți transformi viața?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Alătură-te celor {animatedStats.users.toLocaleString()} de utilizatori care și-au optimizat viața cu PorVerse
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link 
                href="/auth/signup" 
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/25 transition-all hover:scale-105"
              >
                🚀 Începe Gratuit Acum
              </Link>
              <Link 
                href="/pricing" 
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all hover:scale-105"
              >
                💰 Vezi Prețurile
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
              <span className="text-xl">🛡️</span>
              <span>30 de zile gratuit • Fără card necesar • Anulare oricând</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-6 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">🧠</span>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  PorVerse
                </span>
              </div>
              <p className="text-white/70 mb-4 max-w-xs">
                Primul sistem de operare spirituală pentru optimizarea holistică a vieții umane prin AI avansat.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/60 hover:text-white transition-colors">📧</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">🐦</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">📘</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">📷</a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Ecosisteme Gratuite</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/ecosisteme/por-health" className="hover:text-white transition-colors">🌿 PorHealth</Link></li>
                <li><Link href="/ecosisteme/por-kids" className="hover:text-white transition-colors">👶 PorKids</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Ecosisteme Premium</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/ecosisteme/por-mind" className="hover:text-white transition-colors">🧠 PorMind</Link></li>
                <li><Link href="/ecosisteme/por-well" className="hover:text-white transition-colors">🌻 PorWell</Link></li>
                <li><Link href="/ecosisteme/por-flow" className="hover:text-white transition-colors">🌊 PorFlow</Link></li>
                <li><Link href="/ecosisteme/por-blu" className="hover:text-white transition-colors">💧 PorBlu</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Companie</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/about" className="hover:text-white transition-colors">Despre noi</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Cariere</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Presă</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Confidențialitate</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Termeni</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Securitate</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
            <p>&copy; 2025 PorVerse. Toate drepturile rezervate.</p>
            <p suppressHydrationWarning>
              România, București • {formatTime(currentTime)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}