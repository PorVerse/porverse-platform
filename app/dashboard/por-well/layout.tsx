'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PorWellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="logo" style={{ fontSize: 26 }}>🌿 PorWell</div>
          <div className="logo-subtitle" style={{ color: 'var(--pw-text-soft)', fontSize: 14 }}>
            Complete Wellness Platform
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Dashboard</div>
            <Link href="/dashboard/por-well" className="nav-item active">
              <span className="nav-item-icon">🏠</span> Overview
            </Link>
            <Link href="/dashboard/por-well/analytics" className="nav-item">
              <span className="nav-item-icon">📊</span> Analytics
            </Link>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Wellness Tools</div>
            <Link href="/dashboard/por-well/mood-tracking" className="nav-item">
              <span className="nav-item-icon">😊</span> Mood Tracker
            </Link>
            <Link href="/dashboard/por-well/meditation" className="nav-item">
              <span className="nav-item-icon">🧘</span> Meditație
            </Link>
            <Link href="/dashboard/por-well/sleep-therapy" className="nav-item">
              <span className="nav-item-icon">💤</span> Sleep Tracking
            </Link>
            <Link href="/dashboard/por-well/stress-management" className="nav-item">
              <span className="nav-item-icon">💊</span> Stress Management
            </Link>
            <Link href="/dashboard/por-well/journal" className="nav-item">
              <span className="nav-item-icon">📝</span> Jurnal Emoțional
            </Link>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Astrologie AI</div>
            <Link href="/dashboard/por-well/astro" className="nav-item">
              <span className="nav-item-icon">🔮</span> Astrograma
            </Link>
            <Link href="/dashboard/por-well/horoscop" className="nav-item">
              <span className="nav-item-icon">🌙</span> Horoscop Daily
            </Link>
            <Link href="/dashboard/por-well/tranzitii" className="nav-item">
              <span className="nav-item-icon">💫</span> Tranziții Planetare
            </Link>
            <Link href="/dashboard/por-well/compatibilitate" className="nav-item">
              <span className="nav-item-icon">💕</span> Compatibilitate
            </Link>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">AI Support</div>
            <Link href="/dashboard/por-well/chat" className="nav-item">
              <span className="nav-item-icon">🤖</span> AI Therapist
            </Link>
            <Link href="/dashboard/por-well/learning" className="nav-item">
              <span className="nav-item-icon">📚</span> Learning Center
            </Link>
          </div>
        </nav>
        <div className="sidebar-footer" style={{ padding: 16 }}>
          <div className="upgrade-card">
            <h4>🚀 Upgrade la Pro</h4>
            <p>Acces la AI avansat și instrumente exclusive</p>
            <button
              className="upgrade-btn"
              onClick={() => window.location.href = '/pricing'}
            >
              Upgrade Acum
            </button>
          </div>
        </div>
      </aside>

      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <button
            aria-label="Meniu"
            className="notification-btn"
            style={{ marginRight: 20, display: 'none' }}
            onClick={() => setSidebarOpen((o) => !o)}
          >
            <span style={{ fontSize: 20 }}>☰</span>
          </button>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 700 }}>PorWell Dashboard</h1>
          <p style={{ color: 'var(--pw-text-soft)', fontSize: 16 }}>Mindfulness • Wellness • Astro AI</p>
        </div>
        <div className="header-right">
          <div className="header-stats" style={{ gap: 24 }}>
            <div className="stat-item">
              <div className="stat-value">87%</div>
              <div className="stat-label">Wellness Score</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">23</div>
              <div className="stat-label">Streak Days</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">4.2/5</div>
              <div className="stat-label">Avg Mood</div>
            </div>
          </div>
          <button className="notification-btn">🔔</button>
          <button className="profile-btn">👤</button>
        </div>
      </header>

      {/* CONȚINUT */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
