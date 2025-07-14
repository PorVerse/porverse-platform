// app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from './style.module.css';

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

      <div className={styles.unifiedDashboard}>
        {/* MOBILE HEADER */}
        <div className={styles.mobileHeader}>
          <button 
            onClick={toggleSidebar}
            className={styles.mobileMenuButton}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <Link href="/" className={styles.mobileLogo}>
            PorVerse
          </Link>
          <div className={styles.mobileUser}>AP</div>
        </div>

        {/* SIDEBAR */}
        <aside className={`${styles.dashboardSidebar} ${sidebarOpen ? styles.open : ''}`}>
          <div className={styles.sidebarHeader}>
            <Link href="/" className={styles.dashboardLogo}>
              <span className={styles.logoIcon}>🧠</span>
              <span className={styles.logoText}>PorVerse</span>
            </Link>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>AP</div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>Andrei Pop</div>
                <div className={styles.userPlan}>Free Plan</div>
              </div>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <div className={styles.navSection}>
              <div className={styles.navSectionTitle}>Overview</div>
              <Link href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
                <span className={styles.navIcon}>📊</span>
                Dashboard
              </Link>
              <Link href="/dashboard/analytics" className={styles.navItem}>
                <span className={styles.navIcon}>📈</span>
                Analytics
              </Link>
              <Link href="/dashboard/settings" className={styles.navItem}>
                <span className={styles.navIcon}>⚙️</span>
                Settings
              </Link>
            </div>

            <div className={styles.navSection}>
              <div className={styles.navSectionTitle}>Ecosisteme</div>
              {ecosystems.map(ecosystem => (
                <Link 
                  key={ecosystem.id}
                  href={ecosystem.status === 'free' ? ecosystem.route : '/pricing'}
                  className={`${styles.navItem} ${ecosystem.status === 'locked' ? styles.locked : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.navIcon}>{ecosystem.icon}</span>
                  {ecosystem.name}
                  {ecosystem.status === 'premium' && (
                    <span className={styles.premiumBadge}>PRO</span>
                  )}
                </Link>
              ))}
            </div>

            <div className={styles.navSection}>
              <div className={styles.navSectionTitle}>Ultimate</div>
              <Link 
                href={hasQuantumAccess() ? "/dashboard/quantum-vault" : "/pricing"}
                className={`${styles.navItem} ${styles.quantumItem} ${!hasQuantumAccess() ? styles.locked : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={styles.navIcon}>🔮</span>
                Quantum Vault
                {!hasQuantumAccess() && <span className={styles.lockIcon}>🔒</span>}
              </Link>
            </div>
          </nav>

          <div className={styles.sidebarFooter}>
            <Link href="/pricing" className={styles.upgradeButton}>
              <span>⚡</span>
              Upgrade to Premium
            </Link>
          </div>
        </aside>

        {/* SIDEBAR OVERLAY (Mobile) */}
        {sidebarOpen && (
          <div 
            className={styles.sidebarOverlay}
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* MAIN CONTENT */}
        <main className={styles.dashboardMain}>
          <div className={styles.dashboardHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.dashboardTitle}>Bună dimineața, Andrei! 🌅</h1>
              <p className={styles.dashboardSubtitle}>
                Ești pe drumul cel bun către transformarea ta. Continuă să progresezi!
              </p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.actionButton}>
                <span>📱</span>
                Mobile App
              </button>
              <button className={`${styles.actionButton} ${styles.primary}`}>
                <span>🎯</span>
                Set Today's Goals
              </button>
            </div>
          </div>

          {/* STATS OVERVIEW */}
          <section className={styles.statsSection}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🔥</div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{userStats.streakDays}</div>
                  <div className={styles.statLabel}>Zile consecutive</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{userStats.completedTasks}</div>
                  <div className={styles.statLabel}>Taskuri completate</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{userStats.ecosystemsActive}</div>
                  <div className={styles.statLabel}>Ecosisteme active</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📅</div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{userStats.totalDays}</div>
                  <div className={styles.statLabel}>Zile totale</div>
                </div>
              </div>
            </div>
          </section>

          {/* PERFORMANCE OVERVIEW */}
          <section className={styles.performanceSection}>
            <h2 className={styles.sectionTitle}>Performanța Ta</h2>
            <div className={styles.performanceGrid}>
              <div className={styles.performanceCard}>
                <div className={styles.performanceHeader}>
                  <span className={styles.performanceIcon}>🌿</span>
                  <div className={styles.performanceInfo}>
                    <h3>Health Score</h3>
                    <p>Nutriție, fitness, wellness</p>
                  </div>
                </div>
                <div className={styles.performanceScore}>
                  <div className={styles.scoreNumber}>{userStats.healthScore}</div>
                  <div className={styles.scoreBar}>
                    <div 
                      className={`${styles.scoreFill} ${styles.health}`}
                      style={{width: `${userStats.healthScore}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={styles.performanceCard}>
                <div className={styles.performanceHeader}>
                  <span className={styles.performanceIcon}>🌻</span>
                  <div className={styles.performanceInfo}>
                    <h3>Wellness Score</h3>
                    <p>Mental health, mindfulness</p>
                  </div>
                </div>
                <div className={styles.performanceScore}>
                  <div className={styles.scoreNumber}>{userStats.wellnessScore}</div>
                  <div className={styles.scoreBar}>
                    <div 
                      className={`${styles.scoreFill} ${styles.wellness}`}
                      style={{width: `${userStats.wellnessScore}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={styles.performanceCard}>
                <div className={styles.performanceHeader}>
                  <span className={styles.performanceIcon}>🌊</span>
                  <div className={styles.performanceInfo}>
                    <h3>Productivity Score</h3>
                    <p>Focus, time management</p>
                  </div>
                </div>
                <div className={styles.performanceScore}>
                  <div className={styles.scoreNumber}>{userStats.productivityScore}</div>
                  <div className={styles.scoreBar}>
                    <div 
                      className={`${styles.scoreFill} ${styles.productivity}`}
                      style={{width: `${userStats.productivityScore}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ECOSYSTEMS GRID */}
          <section className={styles.ecosystemsSection}>
            <h2 className={styles.sectionTitle}>Ecosistemele Tale</h2>
            <div className={styles.ecosystemsGrid}>
              {ecosystems.map(ecosystem => (
                <div key={ecosystem.id} className={`${styles.ecosystemCard} ${ecosystem.status === 'premium' ? styles.premium : ''}`}>
                  <div className={styles.ecosystemHeader}>
                    <span 
                      className={styles.ecosystemIcon}
                      style={{color: ecosystem.color}}
                    >
                      {ecosystem.icon}
                    </span>
                    <div className={styles.ecosystemInfo}>
                      <h3>{ecosystem.name}</h3>
                      <p>{ecosystem.description}</p>
                    </div>
                    {ecosystem.status === 'premium' && (
                      <div className={styles.ecosystemLock}>🔒</div>
                    )}
                  </div>

                  <div className={styles.ecosystemProgress}>
                    <div className={styles.progressInfo}>
                      <span>Progress: {ecosystem.progress}%</span>
                      <span className={styles.lastActivity}>{ecosystem.lastActivity}</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{
                          width: `${ecosystem.progress}%`,
                          backgroundColor: ecosystem.color
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className={styles.ecosystemActions}>
                    {ecosystem.status === 'free' ? (
                      <Link href={ecosystem.route} className={`${styles.ecosystemButton} ${styles.primary}`}>
                        Open Dashboard
                      </Link>
                    ) : (
                      <Link href="/pricing" className={`${styles.ecosystemButton} ${styles.locked}`}>
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
            <section className={styles.quantumTeaser}>
              <div className={styles.quantumCard}>
                <div className={styles.quantumBackground}>
                  <div className={styles.quantumParticles}></div>
                  <div className={styles.quantumGlow}></div>
                </div>
                <div className={styles.quantumContent}>
                  <div className={styles.quantumIcon}>🔮</div>
                  <h2>Quantum Vault Awaits</h2>
                  <p>
                    Unlock the ultimate PorVerse experience. Future Self AI, Timeline Simulator, 
                    și Mirror of Other You te așteaptă.
                  </p>
                  <div className={styles.quantumRequirements}>
                    <p><strong>Unlock Requirements:</strong> PorMind + PorFlow + PorBlu (Trinity Combo)</p>
                  </div>
                  <Link href="/pricing" className={styles.quantumUnlockButton}>
                    <span>✨</span>
                    Unlock Quantum Powers
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* RECENT ACTIVITY */}
          <section className={styles.activitySection}>
            <h2 className={styles.sectionTitle}>Activitate Recentă</h2>
            <div className={styles.activityList}>
              {recentActivities.map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>{activity.icon}</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityAction}>{activity.action}</div>
                    <div className={styles.activityMeta}>
                      <span className={styles.activityEcosystem}>{activity.ecosystem}</span>
                      <span className={styles.activityTime}>{activity.time}</span>
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