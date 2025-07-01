'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from './style.module.css'
;

interface UserStats {
  totalDays: number;
  streakDays: number;
  completedTasks: number;
  ecosystemsActive: number;
  healthScore: number;
  wellnessScore: number;
  productivityScore: number;
}

interface EcosystemCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'free' | 'premium' | 'locked';
  progress: number;
  lastActivity: string;
  route: string;
  color: string;
}

export default function UnifiedDashboard() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalDays: 12,
    streakDays: 5,
    completedTasks: 147,
    ecosystemsActive: 3,
    healthScore: 85,
    wellnessScore: 72,
    productivityScore: 68
  });

  const [ecosystems, setEcosystems] = useState<EcosystemCard[]>([
    {
      id: 'por-health',
      name: 'PorHealth',
      icon: '🌿',
      description: 'Nutriție, fitness și wellness complet',
      status: 'free',
      progress: 78,
      lastActivity: 'Acum 2 ore',
      route: '/dashboard/por-health',
      color: '#10b981'
    },
    {
      id: 'por-kids',
      name: 'PorKids',
      icon: '👶',
      description: 'Educație inteligentă pentru copii',
      status: 'free',
      progress: 45,
      lastActivity: 'Ieri',
      route: '/dashboard/por-kids',
      color: '#ec4899'
    },
    {
      id: 'por-mind',
      name: 'PorMind',
      icon: '🧠',
      description: 'Educație financiară și money mindset',
      status: 'premium',
      progress: 0,
      lastActivity: 'Nu ai acces',
      route: '/dashboard/por-mind',
      color: '#3b82f6'
    },
    {
      id: 'por-well',
      name: 'PorWell',
      icon: '🌻',
      description: 'Mental wellness și emotional intelligence',
      status: 'premium',
      progress: 0,
      lastActivity: 'Nu ai acces',
      route: '/dashboard/por-well',
      color: '#8b5cf6'
    },
    {
      id: 'por-flow',
      name: 'PorFlow',
      icon: '🌊',
      description: 'Productivitate maximă și time management',
      status: 'premium',
      progress: 0,
      lastActivity: 'Nu ai acces',
      route: '/dashboard/por-flow',
      color: '#06b6d4'
    },
    {
      id: 'por-blu',
      name: 'PorBlu',
      icon: '💧',
      description: 'Strategic planning și executive coaching',
      status: 'premium',
      progress: 0,
      lastActivity: 'Nu ai acces',
      route: '/dashboard/por-blu',
      color: '#f59e0b'
    }
  ]);

  const [recentActivities] = useState([
    {
      ecosystem: 'PorHealth',
      action: 'AI Nutrition Plan generat',
      time: 'Acum 2 ore',
      icon: '🥗'
    },
    {
      ecosystem: 'PorHealth',
      action: 'Workout completat: Upper Body',
      time: 'Acum 5 ore',
      icon: '💪'
    },
    {
      ecosystem: 'PorKids',
      action: 'Temă matematică scanată',
      time: 'Ieri',
      icon: '📚'
    },
    {
      ecosystem: 'PorHealth',
      action: 'Sleep tracking: 7.5h',
      time: 'Ieri',
      icon: '😴'
    }
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasQuantumAccess = () => {
    const activePremium = ecosystems.filter(e => e.status === 'premium' && e.progress > 0).length;
    return activePremium >= 3; // Trinity Combo unlocks Quantum
  };

  // Mobile sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Head>
        <title>Dashboard | PorVerse - Ecosistemul Tău Digital</title>
        <meta name="description" content="Dashboard principal PorVerse cu acces la toate ecosistemele de transformare personală." />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="unified-dashboard">
        {/* MOBILE HEADER */}
        <div className="mobile-header">
          <button 
            onClick={toggleSidebar}
            className="mobile-menu-button"
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <Link href="/" className="mobile-logo">
            PorVerse
          </Link>
          <div className="mobile-user">AP</div>
        </div>

        {/* SIDEBAR */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <Link href="/" className="dashboard-logo">
              <span className="logo-icon">🧠</span>
              <span className="logo-text">PorVerse</span>
            </Link>
            <div className="user-info">
              <div className="user-avatar">AP</div>
              <div className="user-details">
                <div className="user-name">Andrei Pop</div>
                <div className="user-plan">Free Plan</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">Overview</div>
              <Link href="/dashboard" className="nav-item active">
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
              <Link href="/dashboard/analytics" className="nav-item">
                <span className="nav-icon">📈</span>
                Analytics
              </Link>
              <Link href="/dashboard/settings" className="nav-item">
                <span className="nav-icon">⚙️</span>
                Settings
              </Link>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">Ecosisteme</div>
              {ecosystems.map(ecosystem => (
                <Link 
                  key={ecosystem.id}
                  href={ecosystem.status === 'free' ? ecosystem.route : '/pricing'}
                  className={`nav-item ${ecosystem.status === 'locked' ? 'locked' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{ecosystem.icon}</span>
                  {ecosystem.name}
                  {ecosystem.status === 'premium' && (
                    <span className="premium-badge">PRO</span>
                  )}
                </Link>
              ))}
            </div>

            <div className="nav-section">
              <div className="nav-section-title">Ultimate</div>
              <Link 
                href={hasQuantumAccess() ? "/dashboard/quantum-vault" : "/pricing"}
                className={`nav-item quantum-item ${!hasQuantumAccess() ? 'locked' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">🔮</span>
                Quantum Vault
                {!hasQuantumAccess() && <span className="lock-icon">🔒</span>}
              </Link>
            </div>
          </nav>

          <div className="sidebar-footer">
            <Link href="/pricing" className="upgrade-button">
              <span>⚡</span>
              Upgrade to Premium
            </Link>
          </div>
        </aside>

        {/* SIDEBAR OVERLAY (Mobile) */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* MAIN CONTENT */}
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div className="header-content">
              <h1 className="dashboard-title">Bună dimineața, Andrei! 🌅</h1>
              <p className="dashboard-subtitle">
                Ești pe drumul cel bun către transformarea ta. Continuă să progresezi!
              </p>
            </div>
            <div className="header-actions">
              <button className="action-button">
                <span>📱</span>
                Mobile App
              </button>
              <button className="action-button primary">
                <span>🎯</span>
                Set Today's Goals
              </button>
            </div>
          </div>

          {/* STATS OVERVIEW */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <div className="stat-number">{userStats.streakDays}</div>
                  <div className="stat-label">Zile consecutive</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-number">{userStats.completedTasks}</div>
                  <div className="stat-label">Taskuri completate</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-number">{userStats.ecosystemsActive}</div>
                  <div className="stat-label">Ecosisteme active</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <div className="stat-number">{userStats.totalDays}</div>
                  <div className="stat-label">Zile totale</div>
                </div>
              </div>
            </div>
          </section>

          {/* PERFORMANCE OVERVIEW */}
          <section className="performance-section">
            <h2 className="section-title">Performanța Ta</h2>
            <div className="performance-grid">
              <div className="performance-card">
                <div className="performance-header">
                  <span className="performance-icon">🌿</span>
                  <div className="performance-info">
                    <h3>Health Score</h3>
                    <p>Nutriție, fitness, wellness</p>
                  </div>
                </div>
                <div className="performance-score">
                  <div className="score-number">{userStats.healthScore}</div>
                  <div className="score-bar">
                    <div 
                      className="score-fill health" 
                      style={{width: `${userStats.healthScore}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="performance-card">
                <div className="performance-header">
                  <span className="performance-icon">🌻</span>
                  <div className="performance-info">
                    <h3>Wellness Score</h3>
                    <p>Mental health, mindfulness</p>
                  </div>
                </div>
                <div className="performance-score">
                  <div className="score-number">{userStats.wellnessScore}</div>
                  <div className="score-bar">
                    <div 
                      className="score-fill wellness" 
                      style={{width: `${userStats.wellnessScore}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="performance-card">
                <div className="performance-header">
                  <span className="performance-icon">🌊</span>
                  <div className="performance-info">
                    <h3>Productivity Score</h3>
                    <p>Focus, time management</p>
                  </div>
                </div>
                <div className="performance-score">
                  <div className="score-number">{userStats.productivityScore}</div>
                  <div className="score-bar">
                    <div 
                      className="score-fill productivity" 
                      style={{width: `${userStats.productivityScore}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ECOSYSTEMS GRID */}
          <section className="ecosystems-section">
            <h2 className="section-title">Ecosistemele Tale</h2>
            <div className="ecosystems-grid">
              {ecosystems.map(ecosystem => (
                <div key={ecosystem.id} className={`ecosystem-card ${ecosystem.status}`}>
                  <div className="ecosystem-header">
                    <span 
                      className="ecosystem-icon"
                      style={{color: ecosystem.color}}
                    >
                      {ecosystem.icon}
                    </span>
                    <div className="ecosystem-info">
                      <h3>{ecosystem.name}</h3>
                      <p>{ecosystem.description}</p>
                    </div>
                    {ecosystem.status === 'premium' && (
                      <div className="ecosystem-lock">🔒</div>
                    )}
                  </div>

                  <div className="ecosystem-progress">
                    <div className="progress-info">
                      <span>Progress: {ecosystem.progress}%</span>
                      <span className="last-activity">{ecosystem.lastActivity}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{
                          width: `${ecosystem.progress}%`,
                          backgroundColor: ecosystem.color
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="ecosystem-actions">
                    {ecosystem.status === 'free' ? (
                      <Link href={ecosystem.route} className="ecosystem-button primary">
                        Open Dashboard
                      </Link>
                    ) : (
                      <Link href="/pricing" className="ecosystem-button locked">
                        <span>⚡</span>
                        Unlock Premium
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* QUANTUM VAULT TEASER */}
          {!hasQuantumAccess() && (
            <section className="quantum-teaser">
              <div className="quantum-card">
                <div className="quantum-background">
                  <div className="quantum-particles"></div>
                  <div className="quantum-glow"></div>
                </div>
                <div className="quantum-content">
                  <div className="quantum-icon">🔮</div>
                  <h2>Quantum Vault Awaits</h2>
                  <p>
                    Unlock the ultimate PorVerse experience. Future Self AI, Timeline Simulator, 
                    și Mirror of Other You te așteaptă.
                  </p>
                  <div className="quantum-requirements">
                    <p><strong>Unlock Requirements:</strong> PorMind + PorFlow + PorBlu (Trinity Combo)</p>
                  </div>
                  <Link href="/pricing" className="quantum-unlock-button">
                    <span>✨</span>
                    Unlock Quantum Powers
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* RECENT ACTIVITY */}
          <section className="activity-section">
            <h2 className="section-title">Activitate Recentă</h2>
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-meta">
                      <span className="activity-ecosystem">{activity.ecosystem}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}