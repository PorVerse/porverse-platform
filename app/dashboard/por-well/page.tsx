'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './style.css';

export default function PorWellDashboard() {
  const [wellnessData, setWellnessData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulare încărcare date
    setTimeout(() => {
      setWellnessData({
        moodScore: 7.8,
        stressLevel: 3,
        meditationStreak: 15,
        sleepQuality: 8.5,
        anxietyLevel: 2,
        energyLevel: 8.2,
        wellnessScore: 85
      });
      setLoading(false);
    }, 1500);

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅 Bună dimineața';
    if (hour < 17) return '☀️ Bună ziua';
    return '🌙 Bună seara';
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);

    setTimeout(() => {
      let response = '🌿 Îți înțeleg starea. Să explorăm împreună ce te poate ajuta cel mai mult.';
      
      if (userMessage.toLowerCase().includes('stres')) {
        response = '💆‍♀️ Pentru stres rapid, încearcă respirația 4-7-8: inspiră 4 sec, ține 7 sec, expiră 8 sec. Repetă de 3 ori. Funcționează instant!';
      } else if (userMessage.toLowerCase().includes('trist')) {
        response = '💙 Îmi pare rău că te simți așa. Tristețea face parte din experiența umană. Vrei să explorăm exerciții de gratitudine?';
      } else if (userMessage.toLowerCase().includes('somn')) {
        response = '😴 Somnul afectează masiv mood-ul. Oprește ecranele cu 1h înainte, cameră răcoroasă (18-20°C), meditation de 10 min.';
      } else if (userMessage.toLowerCase().includes('anxios')) {
        response = '🧘‍♀️ Pentru anxietate: numără 5 lucruri pe care le vezi, 4 pe care le auzi, 3 pe care le atingi, 2 pe care le miroși, 1 pe care îl guști.';
      }
      
      setChatHistory(prev => [...prev, { role: 'ai', message: response }]);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Se încarcă PorWell...</h2>
          <p>Pregătim experiența ta de wellness 🌸</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo">🌸 PorWell</div>
          <div className="logo-subtitle">Mental Wellness</div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">📊 Dashboard</div>
            <a href="#" className="nav-item active">
              <span className="nav-item-icon">🏠</span>Overview
            </a>
            <Link href="/dashboard/por-well/mood-tracker" className="nav-item">
              <span className="nav-item-icon">😊</span>Mood Tracker
            </Link>
            <Link href="/dashboard/por-well/meditation" className="nav-item">
              <span className="nav-item-icon">🧘‍♀️</span>Meditație
            </Link>
            <Link href="/dashboard/por-well/stress-management" className="nav-item">
              <span className="nav-item-icon">💆‍♀️</span>Anti-Stress
            </Link>
            <Link href="/dashboard/por-well/sleep-therapy" className="nav-item">
              <span className="nav-item-icon">😴</span>Sleep Therapy
            </Link>
          </div>
          
          <div className="nav-section">
            <div className="nav-section-title">🤖 AI Tools</div>
            <Link href="/dashboard/por-well/ai-therapist" className="nav-item">
              <span className="nav-item-icon">🎯</span>AI Therapist
            </Link>
            <Link href="/dashboard/por-well/emotional-journal" className="nav-item">
              <span className="nav-item-icon">📝</span>Jurnal Emoțional
            </Link>
            <Link href="/dashboard/por-well/anxiety-helper" className="nav-item">
              <span className="nav-item-icon">🛡️</span>Anxiety Helper
            </Link>
          </div>
          
          <div className="nav-section">
            <div className="nav-section-title">🌿 Alte Ecosisteme</div>
            <Link href="/dashboard/por-health" className="nav-item">
              <span className="nav-item-icon">💚</span>PorHealth
            </Link>
            <Link href="/dashboard/por-mind" className="nav-item">
              <span className="nav-item-icon">🧠</span>PorMind
            </Link>
            <Link href="/dashboard/por-flow" className="nav-item">
              <span className="nav-item-icon">⚡</span>PorFlow
            </Link>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="upgrade-card">
            <h4>✨ Wellness Premium</h4>
            <p>AI therapist avansat și analize profunde</p>
            <button className="upgrade-btn">🚀 Upgrade Acum</button>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>{getGreeting()}, Sofia!</h1>
          <p>Wellness Score: <span className="wellness-score">85/100</span> 🎯</p>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{wellnessData?.meditationStreak || 0}</span>
              <span className="stat-label">Streak Meditație 🔥</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{wellnessData?.moodScore || 0}/10</span>
              <span className="stat-label">Mood Azi 😊</span>
            </div>
          </div>
          <div className="header-time">
            {currentTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="welcome-section">
          <h2>🌿 Centrul tău de wellness mental</h2>
          <p>Urmărește mood-ul, reduce stresul și dezvoltă obiceiuri sănătoase cu ajutorul AI-ului.</p>
        </div>

        <div className="dashboard-grid">
          {/* Wellness Score Principal */}
          <div className="dashboard-card featured">
            <div className="card-header">
              <span className="card-title">🎯 Wellness Score</span>
              <span className="card-icon">✨</span>
            </div>
            <div className="score-display">
              <div className="score-number">85</div>
              <div className="score-label">din 100</div>
              <div className="score-trend positive">↗ +12 puncte această săptămână</div>
            </div>
            <div className="score-breakdown">
              <div className="breakdown-item">
                <span>Mood</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{width: '78%'}}></div>
                </div>
                <span>78%</span>
              </div>
              <div className="breakdown-item">
                <span>Sleep</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{width: '85%'}}></div>
                </div>
                <span>85%</span>
              </div>
              <div className="breakdown-item">
                <span>Stress</span>
                <div className="breakdown-bar stress">
                  <div className="breakdown-fill" style={{width: '30%'}}></div>
                </div>
                <span>30%</span>
              </div>
            </div>
          </div>

          {/* Mood Azi */}
          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-title">😊 Mood Azi</span>
              <span className="card-icon">💫</span>
            </div>
            <div className="mood-display">
              <div className="mood-emoji">😊</div>
              <div className="mood-score">7.8<span>/10</span></div>
              <div className="mood-label">Foarte Bun</div>
              <div className="mood-note">+0.8 față de ieri</div>
            </div>
          </div>

          {/* Stress Level */}
          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-title">💆‍♀️ Nivel Stress</span>
              <span className="card-icon">🌊</span>
            </div>
            <div className="stress-display">
              <div className="stress-meter">
                <div className="stress-fill" style={{width: '30%'}}></div>
              </div>
              <div className="stress-level">3<span>/10</span></div>
              <div className="stress-label">Scăzut</div>
              <div className="stress-advice">Excelent! Continuă cu respirațiile profunde</div>
            </div>
          </div>

          {/* Meditație Streak */}
          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-title">🧘‍♀️ Meditație</span>
              <span className="card-icon">🔥</span>
            </div>
            <div className="meditation-display">
              <div className="streak-number">{wellnessData?.meditationStreak}</div>
              <div className="streak-label">zile consecutive</div>
              <div className="streak-achievement">🏆 Ai deblocat "Zen Master"!</div>
            </div>
          </div>

          {/* Energy Level */}
          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-title">⚡ Energie</span>
              <span className="card-icon">💪</span>
            </div>
            <div className="energy-display">
              <div className="energy-meter">
                <div className="energy-fill" style={{width: '82%'}}></div>
              </div>
              <div className="energy-level">8.2<span>/10</span></div>
              <div className="energy-label">Înaltă</div>
              <div className="energy-tip">Perfect pentru antrenament!</div>
            </div>
          </div>

          {/* Sleep Quality */}
          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-title">😴 Calitatea Somnului</span>
              <span className="card-icon">🌙</span>
            </div>
            <div className="sleep-display">
              <div className="sleep-score">8.5<span>/10</span></div>
              <div className="sleep-hours">7h 23min noaptea trecută</div>
              <div className="sleep-phases">
                <div className="phase">
                  <span>REM</span>
                  <div className="phase-bar">
                    <div className="phase-fill rem" style={{width: '22%'}}></div>
                  </div>
                  <span>22%</span>
                </div>
                <div className="phase">
                  <span>Deep</span>
                  <div className="phase-bar">
                    <div className="phase-fill deep" style={{width: '18%'}}></div>
                  </div>
                  <span>18%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3>⚡ Acțiuni Rapide</h3>
          <div className="quick-actions">
            <Link href="/dashboard/por-well/ai-therapist" className="action-btn primary">
              <span className="action-icon">🤖</span>
              <span>Conversație AI</span>
            </Link>
            <Link href="/dashboard/por-well/meditation" className="action-btn">
              <span className="action-icon">🎧</span>
              <span>Meditație 5min</span>
            </Link>
            <Link href="/dashboard/por-well/mood-tracker" className="action-btn">
              <span className="action-icon">😊</span>
              <span>Log Mood</span>
            </Link>
            <button onClick={() => setChatOpen(true)} className="action-btn">
              <span className="action-icon">💬</span>
              <span>Chat Rapid</span>
            </button>
            <Link href="/dashboard/por-well/breathing" className="action-btn">
              <span className="action-icon">🫁</span>
              <span>Exerciții Respirație</span>
            </Link>
          </div>
        </div>

        {/* Today's Insights */}
        <div className="insights-section">
          <h3>🔮 Insights Personalizate</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">🌟</div>
              <div className="insight-content">
                <h4>Progres Excelent!</h4>
                <p>Mood-ul tău a crescut cu 15% în ultima săptămână. Meditația zilnică își arată efectele!</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">💡</div>
              <div className="insight-content">
                <h4>Recomandare</h4>
                <p>La ora aceasta ai energia maximă. E momentul perfect pentru task-uri creative!</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Obiectiv Săptămânal</h4>
                <p>Ești la 80% din targetul de meditație. Încă 2 sesiuni și atingi obiectivul!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat */}
      {chatOpen && (
        <div className="ai-chat active">
          <div className="chat-header">
            <span>💬 AI Wellness Assistant</span>
            <button onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {chatHistory.length === 0 && (
              <div className="message ai">
                👋 Salut! Sunt asistentul tău pentru wellness mental. Cu ce te pot ajuta astăzi?
              </div>
            )}
            {chatHistory.map((chat, index) => (
              <div key={index} className={`message ${chat.role}`}>
                {chat.message}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Scrie mesajul tău aici..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>
              <span>📤</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Toggle */}
      {!chatOpen && (
        <button className="chat-toggle" onClick={() => setChatOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
}