'use client';
import './dashboard-style.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PorKidsDashboard() {
  // Scroll animații pe grilă, bare progres, etc.
  useEffect(() => {
    const onScroll = () => {
      document.querySelectorAll('.fade-in-up:not(.animated)').forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) el.classList.add('animated');
      });
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // State pentru chat AI
  const [chatOpen, setChatOpen] = useState(false);
const [parentMode, setParentMode] = useState(false);

  return (
    <div className="dashboard">
            {/* TABS Copil / Părinte */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        background: "var(--pk-bg-glass)",
        borderBottom: "1px solid var(--pk-border-glass)",
        padding: "1.2rem 0",
        position: "sticky",
        top: 0,
        zIndex: 999
      }}>
        <button
          className={parentMode ? "" : "btn-primary"}
          style={{
            padding: "0.7rem 2.3rem",
            borderRadius: "30px",
            border: "none",
            fontWeight: 700,
            background: parentMode ? "var(--pk-bg-glass)" : "linear-gradient(135deg, var(--pk-primary), var(--pk-secondary))",
            color: parentMode ? "var(--pk-text-muted)" : "#fff",
            fontSize: "1.09rem",
            cursor: "pointer",
            boxShadow: !parentMode ? "var(--pk-shadow-light)" : "none",
            transition: "all .25s"
          }}
          onClick={() => setParentMode(false)}
        >
          👦 Viziune copil
        </button>
        <button
          className={parentMode ? "btn-primary" : ""}
          style={{
            padding: "0.7rem 2.3rem",
            borderRadius: "30px",
            border: "none",
            fontWeight: 700,
            background: parentMode ? "linear-gradient(135deg, var(--pk-primary), var(--pk-secondary))" : "var(--pk-bg-glass)",
            color: parentMode ? "#fff" : "var(--pk-text-muted)",
            fontSize: "1.09rem",
            cursor: "pointer",
            boxShadow: parentMode ? "var(--pk-shadow-light)" : "none",
            transition: "all .25s"
          }}
          onClick={() => setParentMode(true)}
        >
          👪 Viziune părinte
        </button>
      </div>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo">PorKids</div>
        </div>
        <nav>
          <div className="nav-section">
            <div className="nav-section-title">Dashboard</div>
            <a className="nav-item active">
              <span className="nav-item-icon">📊</span>
              Overview
            </a>
            <a className="nav-item">
              <span className="nav-item-icon">📓</span>
              Teme & Exerciții
            </a>
            <a className="nav-item">
              <span className="nav-item-icon">🧠</span>
              Progres
            </a>
            <a className="nav-item">
              <span className="nav-item-icon">🎯</span>
              Misiuni
            </a>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Instrumente AI</div>
            <a className="nav-item">
              <span className="nav-item-icon">🤖</span>
              Ajutor teme
            </a>
            <a className="nav-item">
              <span className="nav-item-icon">🔍</span>
              Scanner temă
            </a>
            <a className="nav-item">
              <span className="nav-item-icon">🎮</span>
              Joacă educațională
            </a>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Alte ecosisteme</div>
            <Link href="/dashboard/por-health" className="nav-item">
              <span className="nav-item-icon">💚</span>
              PorHealth
            </Link>
            <Link href="/dashboard/por-mind" className="nav-item">
              <span className="nav-item-icon">🧠</span>
              PorMind
            </Link>
            <Link href="/dashboard/por-well" className="nav-item">
              <span className="nav-item-icon">🌻</span>
              PorWell
            </Link>
            <Link href="/dashboard/por-flow" className="nav-item">
              <span className="nav-item-icon">🌊</span>
              PorFlow
            </Link>
            <Link href="/dashboard/por-blu" className="nav-item">
              <span className="nav-item-icon">💧</span>
              PorBlu
            </Link>
          </div>
        </nav>
      </aside>

      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <h1>Bine ai revenit, Luca! 🦸‍♂️</h1>
          <p>Astăzi poți debloca o nouă insignă. Hai să vedem ce provocări ai pentru azi!</p>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">14</div>
              <div className="stat-label">Misiuni finalizate</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">7d</div>
              <div className="stat-label">Streak</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">+3</div>
              <div className="stat-label">Insigne noi</div>
            </div>
          </div>
          <button className="notification-btn" aria-label="Notificări">🔔</button>
          <button className="profile-btn" aria-label="Profil">🧒</button>
        </div>
      </header>
      {/* MAIN CONTENT */}
            {/* MAIN CONTENT */}
      <main className="main-content">
        {parentMode ? (
          // DASHBOARD PĂRINTE (Parent View)
          <>
            {/* Card mare: Progres copil */}
            <div className="dashboard-card fade-in-up" style={{ marginBottom: '2rem', background: "linear-gradient(135deg, #ffe480 0%, #52b6ff 60%, #ff6ba1 100%)", color: "#181818" }}>
              <div className="card-header">
                <span className="card-title" style={{ color: "#181818" }}>👪 Progresul lui Luca (Copilul tău)</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.7rem", marginBottom: "0.3rem" }}>Teme finalizate: 32 / 40</div>
              <div style={{ fontSize: "1.1rem", marginBottom: "0.7rem" }}>Insigne câștigate: 🏅 9 &nbsp;&nbsp; | &nbsp; Streak: 🔥 7 zile &nbsp;&nbsp; | &nbsp; Misiuni: 🎯 14</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "80%" }}></div>
              </div>
              <div className="progress-text">80% din obiectivul lunar</div>
            </div>

            {/* Grid materii & progres */}
            <div className="dashboard-card fade-in-up">
              <div className="card-header">
                <span className="card-title">📊 Progres pe materii</span>
                <span style={{ color: "#52b6ff", fontSize: "0.92rem" }}>Matematică, Română, Științe</span>
              </div>
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <div className="nutrition-label">Matematică</div>
                  <div className="nutrition-value">92%</div>
                  <div className="nutrition-target">Ultima temă: 8/10</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <div className="nutrition-item">
                  <div className="nutrition-label">Română</div>
                  <div className="nutrition-value">87%</div>
                  <div className="nutrition-target">Ultima temă: 10/12</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "87%" }}></div>
                  </div>
                </div>
                <div className="nutrition-item">
                  <div className="nutrition-label">Științe</div>
                  <div className="nutrition-value">80%</div>
                  <div className="nutrition-target">Ultima temă: 9/11</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "80%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notificări și recomandări AI */}
            <div className="dashboard-card fade-in-up">
              <div className="card-header">
                <span className="card-title">🔔 Notificări și recomandări AI</span>
              </div>
              <ul style={{ paddingLeft: "1.4rem", marginTop: "0.6rem", marginBottom: "0.4rem" }}>
                <li>👏 Luca a progresat excelent la Matematică săptămâna aceasta.</li>
                <li>💡 Recomandare AI: Încurajează-l să finalizeze tema la Engleză pentru badge-ul “Poliglot”.</li>
                <li>🎯 Are o nouă misiune: “Recitește un capitol de științe și explică părintelui”.</li>
              </ul>
            </div>

            {/* Mesaj rapid către copil */}
            <div className="dashboard-card fade-in-up">
              <div className="card-header">
                <span className="card-title">✉️ Trimite mesaj de încurajare</span>
              </div>
              <form onSubmit={e => { e.preventDefault(); alert('Mesajul a fost trimis!'); }}>
                <input
                  type="text"
                  style={{
                    width: "80%",
                    borderRadius: "9px",
                    border: "1px solid var(--pk-border-glass)",
                    padding: "0.6rem 1rem",
                    fontSize: "1.05rem",
                    marginRight: "1rem"
                  }}
                  placeholder="Scrie un mesaj pentru copilul tău..."
                />
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #ffe480 0%, #52b6ff 60%, #ff6ba1 100%)",
                    border: "none",
                    color: "#181818",
                    padding: "0.6rem 1.4rem",
                    fontWeight: 700,
                    borderRadius: "9px",
                    cursor: "pointer"
                  }}
                >Trimite</button>
              </form>
            </div>
          </>
        ) : (
          // DASHBOARD COPIL (ce ai avut până acum)
          <>
            {/* ...aici lasă tot ce ai la dashboard copil, fix cum era */}
            {/* (carduri, griduri, activități, quick actions, etc) */}
          </>
        )}
      </main>


        {/* PROGRES PE MATERII / EXERCIȚII */}
        <div className="dashboard-card fade-in-up">
          <div className="card-header">
            <span className="card-title">📊 Progres pe materii</span>
            <span style={{ color: "var(--pk-secondary)", fontSize: "0.92rem" }}>Matematică, Română, Științe</span>
          </div>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <div className="nutrition-label">Matematică</div>
              <div className="nutrition-value">92%</div>
              <div className="nutrition-target">Target: 90%</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "92%" }}></div>
              </div>
            </div>
            <div className="nutrition-item">
              <div className="nutrition-label">Română</div>
              <div className="nutrition-value">87%</div>
              <div className="nutrition-target">Target: 85%</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "87%" }}></div>
              </div>
            </div>
            <div className="nutrition-item">
              <div className="nutrition-label">Științe</div>
              <div className="nutrition-value">80%</div>
              <div className="nutrition-target">Target: 80%</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVITĂȚI RECENTE */}
        <div className="dashboard-card fade-in-up">
          <div className="card-header">
            <span className="card-title">📋 Activități recente</span>
            <span style={{ color: "var(--pk-text-secondary)", fontSize: "0.9rem" }}>Ultimele 24h</span>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📓</div>
              <div className="activity-content">
                <div className="activity-title">Temă la matematică finalizată</div>
                <div className="activity-time">Acum 2h • 8 exerciții</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🏅</div>
              <div className="activity-content">
                <div className="activity-title">Insignă nouă: "Geniu la matematică"</div>
                <div className="activity-time">Acum 6h</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🎮</div>
              <div className="activity-content">
                <div className="activity-title">Joacă educațională: Provocare logică</div>
                <div className="activity-time">Azi • 12 min</div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions fade-in-up">
          <button className="action-btn" onClick={() => setChatOpen(true)}>
            <span className="action-btn-icon">🤖</span>
            <span className="action-btn-text">Întreabă AI-ul</span>
          </button>
          <button className="action-btn">
            <span className="action-btn-icon">🔍</span>
            <span className="action-btn-text">Scanează temă</span>
          </button>
          <button className="action-btn">
            <span className="action-btn-icon">🎮</span>
            <span className="action-btn-text">Joacă educațională</span>
          </button>
          <button className="action-btn">
            <span className="action-btn-icon">🎯</span>
            <span className="action-btn-text">Setează obiectiv</span>
          </button>
        </div>
      </main>
      {/* AI CHAT WIDGET */}
      <div className={`ai-chat${chatOpen ? ' open' : ''}`}>
        <div className="chat-header">
          <h4>🤖 Asistent AI PorKids</h4>
          <button className="chat-close" onClick={() => setChatOpen(false)}>×</button>
        </div>
        <div className="chat-messages" id="chatMessages">
          <div className="message ai">
            Salut! Sunt aici să te ajut cu orice exercițiu sau temă. Scrie o întrebare sau trimite o provocare!
          </div>
        </div>
        <div className="chat-input">
          <input
            id="chatInput"
            placeholder="Întreabă orice despre temă, exerciții sau joacă..."
            onKeyDown={e => {
              if (e.key === 'Enter') {
                // Simulare demo răspuns AI
                const input = document.getElementById('chatInput');
                const messages = document.getElementById('chatMessages');
                if (input && messages && input.value.trim()) {
                  const umsg = document.createElement('div');
                  umsg.className = 'message user';
                  umsg.textContent = input.value;
                  messages.appendChild(umsg);

                  const userInput = input.value.toLowerCase();
                  input.value = '';
                  messages.scrollTop = messages.scrollHeight;

                  setTimeout(() => {
                    const ai = document.createElement('div');
                    ai.className = 'message ai';
                    let resp = 'Grozav! Hai să rezolvăm împreună. Scrie exercițiul tău!';
                    if (userInput.includes('matematică')) {
                      resp = 'La matematică, poți rezolva ecuații pas-cu-pas. Vrei să-ți explic un exercițiu?';
                    } else if (userInput.includes('joacă')) {
                      resp = 'Super! Îți recomand un joc de logică. Vrei să încerci unul?';
                    } else if (userInput.includes('temă')) {
                      resp = 'Trimite-mi o poză sau scrie exercițiul. Îți explic pe înțelesul tău!';
                    }
                    ai.innerHTML = resp;
                    messages.appendChild(ai);
                    messages.scrollTop = messages.scrollHeight;
                  }, 1100);
                }
              }
            }}
          />
          <button
            className="chat-send"
            onClick={() => {
              const input = document.getElementById('chatInput');
              const messages = document.getElementById('chatMessages');
              if (input && messages && input.value.trim()) {
                const umsg = document.createElement('div');
                umsg.className = 'message user';
                umsg.textContent = input.value;
                messages.appendChild(umsg);

                const userInput = input.value.toLowerCase();
                input.value = '';
                messages.scrollTop = messages.scrollHeight;

                setTimeout(() => {
                  const ai = document.createElement('div');
                  ai.className = 'message ai';
                  let resp = 'Grozav! Hai să rezolvăm împreună. Scrie exercițiul tău!';
                  if (userInput.includes('matematică')) {
                    resp = 'La matematică, poți rezolva ecuații pas-cu-pas. Vrei să-ți explic un exercițiu?';
                  } else if (userInput.includes('joacă')) {
                    resp = 'Super! Îți recomand un joc de logică. Vrei să încerci unul?';
                  } else if (userInput.includes('temă')) {
                    resp = 'Trimite-mi o poză sau scrie exercițiul. Îți explic pe înțelesul tău!';
                  }
                  ai.innerHTML = resp;
                  messages.appendChild(ai);
                  messages.scrollTop = messages.scrollHeight;
                }, 1100);
              }
            }}
          >
            🚀
          </button>
        </div>
      </div>

      {/* CHAT TOGGLE */}
      <button
        className={`chat-toggle${chatOpen ? ' hidden' : ''}`}
        onClick={() => setChatOpen(true)}
      >
        💬
      </button>

      {/* FOOTER DASHBOARD */}
      <div className="dashboard-footer">
        &copy; 2025 PorVerse. Toate drepturile rezervate.
      </div>
    </div>
  );
}
