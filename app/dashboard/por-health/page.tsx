'use client';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import './style.module.css';

export default function PorHealthDashboard() {
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    // Scroll animations
    function animateOnScroll() {
      document
        .querySelectorAll<HTMLElement>('.fade-in-up:not(.animated)')
        .forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight - 150) {
            el.classList.add('animated');
          }
        });
    }
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();

    // Progress‐bar animations on load
    function initProgressBars() {
      document
        .querySelectorAll<HTMLElement>('.progress-fill')
        .forEach(bar => {
          const width = bar.style.width;
          bar.style.width = '0%';
          setTimeout(() => (bar.style.width = width), 500);
        });
    }
    window.addEventListener('load', initProgressBars);

    // Simulate real‐time updates every 5min
    function updateHealthData() {
      console.log('Updating health data...');
    }
    const interval = setInterval(updateHealthData, 300000);

    return () => {
      window.removeEventListener('scroll', animateOnScroll);
      window.removeEventListener('load', initProgressBars);
      clearInterval(interval);
    };
  }, []);

  const toggleChat = () => setChatOpen(v => !v);

  const sendMessage = () => {
    const input = document.getElementById('chatInput') as HTMLInputElement;
    const messages = document.getElementById('chatMessages')!;
    if (!input.value.trim()) return;

    // user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.textContent = input.value;
    messages.appendChild(userMessage);

    const userInput = input.value.toLowerCase();
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // simulated AI response
    setTimeout(() => {
      const aiMessage = document.createElement('div');
      aiMessage.className = 'message ai';
      let response = '🌟 Sunt aici să te ajut cu orice aspect al sănătății tale!';
      if (userInput.includes('greutate') || userInput.includes('slabit')) {
        response =
          '🎯 Excelent progres cu -2.3kg! Pentru a continua, îți recomand să menții deficitul caloric curent și să adaugi 2 antrenamente de forță/săptămână.';
      } else if (userInput.includes('nutriție') || userInput.includes('mancare')) {
        response =
          '🥗 Nutriția ta e pe drumul cel bun! Proteinele sunt aproape perfecte la 98g. Vrei să ajustăm planul alimentar?';
      }
      aiMessage.textContent = response;
      messages.appendChild(aiMessage);
      messages.scrollTop = messages.scrollHeight;
    }, 1500);
  };

  return (
    <>
      <Head>
        <title>PorHealth Dashboard - Sănătatea Ta Optimizată | PorVerse</title>
        <meta
          name="description"
          content="Dashboard personal pentru optimizarea sănătății cu AI. Nutriție, antrenamente și wellness tracking personalizat."
        />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://porverse.ro/ecosisteme/por-health" />
        <meta
          property="og:title"
          content="PorHealth Dashboard - Sănătatea Ta Optimizată | PorVerse"
        />
        <meta
          property="og:description"
          content="Dashboard personal pentru optimizarea sănătății cu AI. Nutriție, antrenamente și wellness tracking personalizat."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://porverse.ro/assets/og-porhealth.jpg" />
      </Head>

      <div className="dashboard">
        {/* Sidebar */}
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-logo">
            <div className="logo">PorHealth</div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">Dashboard</div>
              <a href="#" className="nav-item active">
                <span className="nav-item-icon">📊</span>Overview
              </a>
              <a href="#" className="nav-item">
                <span className="nav-item-icon">🥗</span>Nutriție
              </a>
              <a href="#" className="nav-item">
                <span className="nav-item-icon">💪</span>Antrenamente
              </a>
              <a href="#" className="nav-item">
                <span className="nav-item-icon">😴</span>Somn
              </a>
            </div>
            <div className="nav-section">
              <div className="nav-section-title">AI Tools</div>
              <a href="#" className="nav-item">
                <span className="nav-item-icon">🤖</span>Health Coach
              </a>
              <a href="#" className="nav-item">
                <span className="nav-item-icon">📋</span>Meal Planner
              </a>
              <a href="#" className="nav-item">
                <span className="nav-item-icon">🎯</span>Goal Tracker
              </a>
            </div>
            <div className="nav-section">
              <div className="nav-section-title">Integrări</div>
              <a href="#" className="nav-item">
                <span className="nav-item-icon">⌚</span>Apple Watch
              </a>
              <a href="#" className="nav-item">
                <span className="nav-item-icon">📱</span>Google Fit
              </a>
              <a href="#" className="nav-item">
                <span className="nav-item-icon">🏃</span>Fitbit
              </a>
            </div>
            <div className="nav-section">
              <div className="nav-section-title">Alte Ecosisteme</div>
              <a href="/dashboard/por-mind" className="nav-item">
                <span className="nav-item-icon">🧠</span>PorMind
              </a>
              <a href="/dashboard/por-well" className="nav-item">
                <span className="nav-item-icon">🌻</span>PorWell
              </a>
              <a href="/dashboard/por-flow" className="nav-item">
                <span className="nav-item-icon">🌊</span>PorFlow
              </a>
              <a href="/dashboard/por-blu" className="nav-item">
                <span className="nav-item-icon">💧</span>PorBlu
              </a>
            </div>
          </nav>
          <div className="sidebar-footer">
            <div className="upgrade-card">
              <h4>🚀 Upgrade la Pro</h4>
              <p>Acces la AI avansat și tracking complet</p>
              <button
                className="upgrade-btn"
                onClick={() => (window.location.href = '/pricing')}
              >
                Upgrade Acum
              </button>
            </div>
          </div>
        </aside>

        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>Bună, Maria! 🌟</h1>
            <p>Să continuăm transformarea ta către sănătatea optimă</p>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-value">92</div>
                <div className="stat-label">Health Score</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">7d</div>
                <div className="stat-label">Streak</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">-2.3kg</div>
                <div className="stat-label">Luna aceasta</div>
              </div>
            </div>
            <button className="notification-btn">🔔</button>
            <button className="profile-btn">👤</button>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {/* Health Metrics */}
          <div className="dashboard-grid">
            <div className="dashboard-card fade-in-up">
              <div className="card-header">
                <span className="card-title">Greutate</span>
                <span className="card-icon">⚖️</span>
              </div>
              <div className="card-value">68.5 kg</div>
              <div className="card-change positive">↓ -2.3kg (obiectiv: 65kg)</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '78%' }} />
              </div>
              <div className="progress-text">78% către obiectiv</div>
            </div>
            <div className="dashboard-card fade-in-up">
              <div className="card-header">
                <span className="card-title">Calorii Azi</span>
                <span className="card-icon">🔥</span>
              </div>
              <div className="card-value">1,450</div>
              <div className="card-change positive">Target: 1,600 cal/zi</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '91%' }} />
              </div>
              <div className="progress-text">91% din target</div>
            </div>
            <div className="dashboard-card fade-in-up">
              <div className="card-header">
                <span className="card-title">Pași Azi</span>
                <span className="card-icon">👟</span>
              </div>
              <div className="card-value">8,240</div>
              <div className="card-change positive">↗️ +1,240 față de ieri</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '82%' }} />
              </div>
              <div className="progress-text">82% din 10,000 pași</div>
            </div>
            <div className="dashboard-card fade-in-up">
              <div className="card-header">
                <span className="card-title">Hidratare</span>
                <span className="card-icon">💧</span>
              </div>
              <div className="card-value">1.8L</div>
              <div className="card-change positive">Rămân 0.7L până la target</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '72%' }} />
              </div>
              <div className="progress-text">72% din 2.5L</div>
            </div>
          </div>

          {/* Nutrition Breakdown */}
          <div className="dashboard-card fade-in-up">
            <div className="card-header">
              <span className="card-title">🥗 Macronutrienți Azi</span>
              <span style={{ color: 'var(--health-primary)', fontSize: '0.9rem' }}>
                Optimizat pentru pierderea în greutate
              </span>
            </div>
            <div className="nutrition-grid">
              {[
                { label: 'Proteine', value: '98g', target: '100g', pct: '98%' },
                { label: 'Carbohidrați', value: '145g', target: '160g', pct: '91%' },
                { label: 'Grăsimi', value: '48g', target: '55g', pct: '87%' },
                { label: 'Fibre', value: '28g', target: '25g', pct: '100%', highlight: true },
              ].map((n, i) => (
                <div key={i} className="nutrition-item">
                  <div className="nutrition-label">{n.label}</div>
                  <div className="nutrition-value">{n.value}</div>
                  <div className="nutrition-target">Target: {n.target}</div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: n.pct,
                        background: n.highlight ? 'var(--health-primary)' : undefined,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workouts */}
          <div className="dashboard-card fade-in-up">
            <div className="card-header">
              <span className="card-title">💪 Antrenamente Azi</span>
              <span style={{ color: 'var(--health-primary)', fontSize: '0.9rem' }}>2/3 completate</span>
            </div>
            <div className="workout-list">
              {[
                { name: 'Cardio HIIT - 20 min', details: 'Intensitate ridicată • Calorii arse: 280', status: 'Completat', color: 'var(--health-primary)' },
                { name: 'Antrenament Forță - Core', details: '15 min • 3 seturi planks + crunches', status: 'Completat', color: 'var(--health-primary)' },
                { name: 'Stretching & Recovery', details: '10 min • Mobility + relaxare', status: 'Planificat 20:00', color: 'var(--warning)' },
              ].map((w, i) => (
                <div key={i} className="workout-item">
                  <div className="workout-info">
                    <div className="workout-name">{w.name}</div>
                    <div className="workout-details">{w.details}</div>
                  </div>
                  <div className="workout-status" style={{ background: w.color }}>
                    {w.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="dashboard-card fade-in-up">
            <div className="card-header">
              <span className="card-title">📋 Activități Recente</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ultimele 24h</span>
            </div>
            <div className="activity-list">
              {[
                { icon: '🏃‍♀️', title: 'Alergare dimineață completată', time: 'Acum 2 ore • 30 min • 4.2km' },
                { icon: '🥗', title: 'Meal plan generat de AI', time: 'Acum 4 ore • 7 zile • Personalizat' },
                { icon: '⚖️', title: 'Greutate actualizată', time: 'Ieri • 68.5kg (-0.3kg)' },
                { icon: '💧', title: 'Obiectiv hidratare atins', time: 'Ieri • 2.5L apă' },
              ].map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-icon">{a.icon}</div>
                  <div className="activity-content">
                    <div className="activity-title">{a.title}</div>
                    <div className="activity-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions fade-in-up">
            <a href="#" className="action-btn" onClick={toggleChat}>
              <span className="action-btn-icon">🤖</span>
              <span className="action-btn-text">Chat cu Health Coach</span>
            </a>
            <a href="#" className="action-btn">
              <span className="action-btn-icon">🍽️</span>
              <span className="action-btn-text">Generează Meal Plan</span>
            </a>
            <a href="#" className="action-btn">
              <span className="action-btn-icon">📊</span>
              <span className="action-btn-text">Raport Progres</span>
            </a>
            <a href="#" className="action-btn">
              <span className="action-btn-icon">🎯</span>
              <span className="action-btn-text">Setează Obiectiv</span>
            </a>
          </div>
        </main>
      </div>

      {/* AI Chat Widget */}
      <div className={`ai-chat${chatOpen ? ' open' : ''}`} id="aiChat">
        <div className="chat-header">
          <h4>🤖 Health AI Coach</h4>
          <button className="chat-close" onClick={toggleChat}>
            ×
          </button>
        </div>
        <div className="chat-messages" id="chatMessages">
          <div className="message ai">
            Salut, Maria! 🌟 Văd că ai o zi excelentă – 2 antrenamente completate și nutriția pe target! Ce te pot ajuta să optimizez?
          </div>
        </div>
        <div className="chat-input">
          <input id="chatInput" placeholder="Întreabă orice despre sănătate..." />
          <button className="chat-send" onClick={sendMessage}>
            🚀
          </button>
        </div>
      </div>

      {/* Chat Toggle */}
      <button
        className={`chat-toggle${chatOpen ? ' hidden' : ''}`}
        id="chatToggle"
        onClick={toggleChat}
      >
        💬
      </button>
    </>
  );
}
