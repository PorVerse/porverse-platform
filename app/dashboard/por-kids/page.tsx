'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './style.module.css';

interface ChatMessage {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
}

interface Subject {
  name: string;
  progress: number;
  target: number;
  lastScore: string;
  icon: string;
}

interface Activity {
  id: string;
  title: string;
  time: string;
  icon: string;
  type: 'homework' | 'badge' | 'game' | 'mission';
}

export default function PorKidsDashboard() {
  const [chatOpen, setChatOpen] = useState(false);
  const [parentMode, setParentMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Salut! Sunt aici să te ajut cu orice exercițiu sau temă. Scrie o întrebare sau trimite o provocare!',
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const subjects: Subject[] = [
    { name: 'Matematică', progress: 92, target: 90, lastScore: '8/10', icon: '🔢' },
    { name: 'Română', progress: 87, target: 85, lastScore: '10/12', icon: '📖' },
    { name: 'Științe', progress: 80, target: 80, lastScore: '9/11', icon: '🔬' }
  ];

  const activities: Activity[] = [
    {
      id: '1',
      title: 'Temă la matematică finalizată',
      time: 'Acum 2h • 8 exerciții',
      icon: '📓',
      type: 'homework'
    },
    {
      id: '2',
      title: 'Insignă nouă: "Geniu la matematică"',
      time: 'Acum 6h',
      icon: '🏅',
      type: 'badge'
    },
    {
      id: '3',
      title: 'Joacă educațională: Provocare logică',
      time: 'Azi • 12 min',
      icon: '🎮',
      type: 'game'
    }
  ];

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      isAI: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(newMessage.toLowerCase());
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isAI: true,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    if (input.includes('matematică')) {
      return 'La matematică, poți rezolva ecuații pas-cu-pas. Vrei să-ți explic un exercițiu? 🔢';
    } else if (input.includes('joacă')) {
      return 'Super! Îți recomand un joc de logică. Vrei să încerci unul? 🎮';
    } else if (input.includes('temă')) {
      return 'Trimite-mi o poză sau scrie exercițiul. Îți explic pe înțelesul tău! 📝';
    } else if (input.includes('română')) {
      return 'La română putem exersa citirea și scrierea! Ce vrei să învățăm? 📖';
    } else if (input.includes('științe')) {
      return 'Științele sunt fascinante! Despre ce experimentă vrei să aflii? 🔬';
    }
    return 'Grozav! Hai să rezolvăm împreună. Scrie exercițiul tău! ✨';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatOpen) {
      const chatContainer = document.querySelector(`.${styles.chatMessages}`);
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [chatMessages, chatOpen]);

  return (
    <div className={styles.dashboard}>
      {/* Mode Toggle - Grid Row 1 */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${!parentMode ? styles.active : ''}`}
          onClick={() => setParentMode(false)}
        >
          👦 Viziune copil
        </button>
        <button
          className={`${styles.modeBtn} ${parentMode ? styles.active : ''}`}
          onClick={() => setParentMode(true)}
        >
          👪 Viziune părinte
        </button>
      </div>

      {/* Sidebar - Grid Row 2 to -1, Column 1 */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logo}>🎓 PorKids</div>
        </div>
        
        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Dashboard</div>
            <button className={`${styles.navItem} ${styles.active}`}>
              <span className={styles.navItemIcon}>📊</span>
              Overview
            </button>
            <button className={styles.navItem}>
              <span className={styles.navItemIcon}>📓</span>
              Teme & Exerciții
            </button>
            <button className={styles.navItem}>
              <span className={styles.navItemIcon}>🧠</span>
              Progres
            </button>
            <button className={styles.navItem}>
              <span className={styles.navItemIcon}>🎯</span>
              Misiuni
            </button>
          </div>
          
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Instrumente AI</div>
            <button className={styles.navItem}>
              <span className={styles.navItemIcon}>🤖</span>
              Ajutor teme
            </button>
            <button className={styles.navItem}>
              <span className={styles.navItemIcon}>🔍</span>
              Scanner temă
            </button>
            <button className={styles.navItem}>
              <span className={styles.navItemIcon}>🎮</span>
              Joacă educațională
            </button>
          </div>
          
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Alte ecosisteme</div>
            <Link href="/dashboard/por-health" className={styles.navItem}>
              <span className={styles.navItemIcon}>💚</span>
              PorHealth
            </Link>
            <Link href="/dashboard/por-mind" className={styles.navItem}>
              <span className={styles.navItemIcon}>🧠</span>
              PorMind
            </Link>
            <Link href="/dashboard/por-flow" className={styles.navItem}>
              <span className={styles.navItemIcon}>🌊</span>
              PorFlow
            </Link>
            <Link href="/dashboard/por-blu" className={styles.navItem}>
              <span className={styles.navItemIcon}>💧</span>
              PorBlu
            </Link>
          </div>
        </nav>
      </aside>

      {/* Header - Grid Row 2, Column 2 (Hidden on mobile) */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{parentMode ? "Monitorizezi progresul copilului tău 👪" : "Bine ai revenit, Luca! 🦸‍♂️"}</h1>
          <p>{parentMode
            ? "Vezi progresul, insignele, misiunile și încurajează-l pe copilul tău direct din dashboard."
            : "Astăzi poți debloca o nouă insignă. Hai să vedem ce provocări ai pentru azi!"}
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{parentMode ? "32" : "14"}</div>
              <div className={styles.statLabel}>{parentMode ? "Teme finalizate" : "Misiuni finalizate"}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>7d</div>
              <div className={styles.statLabel}>Streak</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>+3</div>
              <div className={styles.statLabel}>Insigne noi</div>
            </div>
          </div>
          <button className={styles.notificationBtn} aria-label="Notificări">🔔</button>
          <button className={styles.profileBtn} aria-label="Profil">{parentMode ? "👪" : "🧒"}</button>
        </div>
      </header>

      {/* Main Content - Grid Row 3, Column 2 */}
      <main className={styles.mainContent}>
        {/* Mobile Header (Shows info when desktop header is hidden) */}
        <div className={styles.mobileHeader} style={{ display: 'block' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #ff6b6b, #45b7d1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}>
            {parentMode ? "👪 Dashboard Părinte" : "🦸‍♂️ Salut, Luca!"}
          </h2>
          <p style={{ 
            color: '#ffffff', 
            textAlign: 'center', 
            opacity: '0.9',
            marginBottom: '2rem'
          }}>
            {parentMode 
              ? "Progresul copilului tău în timp real" 
              : "Hai să vezi ce provocări noi ai astăzi!"}
          </p>
        </div>

        {parentMode ? (
          // Parent Dashboard
          <>
            {/* Overall Progress Card */}
            <div className={styles.heroCard}>
              <div className={styles.heroContent}>
                <h2>👪 Progresul lui Luca</h2>
                <div className={styles.heroStats}>
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatValue}>32/40</span>
                    <span className={styles.heroStatLabel}>Teme finalizate</span>
                  </div>
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatValue}>🏅 9</span>
                    <span className={styles.heroStatLabel}>Insigne</span>
                  </div>
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatValue}>🔥 7</span>
                    <span className={styles.heroStatLabel}>Streak zile</span>
                  </div>
                </div>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '80%' }}></div>
                  </div>
                  <span className={styles.progressText}>80% din obiectivul lunar</span>
                </div>
              </div>
            </div>

            {/* Subjects Progress */}
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📊 Progres pe materii</h3>
                <span className={styles.cardSubtitle}>Matematică, Română, Științe</span>
              </div>
              <div className={styles.subjectsGrid}>
                {subjects.map((subject) => (
                  <div key={subject.name} className={styles.subjectCard}>
                    <div className={styles.subjectHeader}>
                      <span className={styles.subjectIcon}>{subject.icon}</span>
                      <span className={styles.subjectName}>{subject.name}</span>
                    </div>
                    <div className={styles.subjectProgress}>
                      <span className={styles.subjectScore}>{subject.progress}%</span>
                      <span className={styles.subjectTarget}>Ultima temă: {subject.lastScore}</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${subject.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>🔔 Notificări și recomandări AI</h3>
              </div>
              <div className={styles.notificationsList}>
                <div className={styles.notification}>
                  <span className={styles.notificationIcon}>👏</span>
                  <span>Luca a progresat excelent la Matematică săptămâna aceasta.</span>
                </div>
                <div className={styles.notification}>
                  <span className={styles.notificationIcon}>💡</span>
                  <span>Recomandare AI: Încurajează-l să finalizeze tema la Engleză pentru badge-ul "Poliglot".</span>
                </div>
                <div className={styles.notification}>
                  <span className={styles.notificationIcon}>🎯</span>
                  <span>Are o nouă misiune: "Recitește un capitol de științe și explică părintelui".</span>
                </div>
              </div>
            </div>

            {/* Quick Message */}
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>✉️ Trimite mesaj de încurajare</h3>
              </div>
              <div className={styles.messageForm}>
                <input
                  type="text"
                  className={styles.messageInput}
                  placeholder="Scrie un mesaj pentru copilul tău..."
                />
                <button className={styles.sendMessageBtn}>Trimite</button>
              </div>
            </div>
          </>
        ) : (
          // Child Dashboard
          <>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                  <span className={styles.statCardTitle}>Teme rezolvate</span>
                  <span className={styles.statCardIcon}>📓</span>
                </div>
                <div className={styles.statCardValue}>32</div>
                <div className={styles.statCardChange}>+5 față de săptămâna trecută</div>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '80%' }}></div>
                  </div>
                  <span className={styles.progressText}>80% obiectiv săptămânal</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                  <span className={styles.statCardTitle}>Misiuni completate</span>
                  <span className={styles.statCardIcon}>🎯</span>
                </div>
                <div className={styles.statCardValue}>14</div>
                <div className={styles.statCardChange}>+2 azi</div>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '66%' }}></div>
                  </div>
                  <span className={styles.progressText}>66% din luna aceasta</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                  <span className={styles.statCardTitle}>Insigne câștigate</span>
                  <span className={styles.statCardIcon}>🏅</span>
                </div>
                <div className={styles.statCardValue}>9</div>
                <div className={styles.statCardChange}>+1 nouă</div>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '90%' }}></div>
                  </div>
                  <span className={styles.progressText}>Colectează-le pe toate!</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardHeader}>
                  <span className={styles.statCardTitle}>Streak zile</span>
                  <span className={styles.statCardIcon}>🔥</span>
                </div>
                <div className={styles.statCardValue}>7</div>
                <div className={styles.statCardChange}>Consecvență!</div>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '100%' }}></div>
                  </div>
                  <span className={styles.progressText}>Bravo! Nu rata șirul!</span>
                </div>
              </div>
            </div>

            {/* Subjects Progress */}
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📊 Progres pe materii</h3>
                <span className={styles.cardSubtitle}>Matematică, Română, Științe</span>
              </div>
              <div className={styles.subjectsGrid}>
                {subjects.map((subject) => (
                  <div key={subject.name} className={styles.subjectCard}>
                    <div className={styles.subjectHeader}>
                      <span className={styles.subjectIcon}>{subject.icon}</span>
                      <span className={styles.subjectName}>{subject.name}</span>
                    </div>
                    <div className={styles.subjectProgress}>
                      <span className={styles.subjectScore}>{subject.progress}%</span>
                      <span className={styles.subjectTarget}>Target: {subject.target}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${subject.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📋 Activități recente</h3>
                <span className={styles.cardSubtitle}>Ultimele 24h</span>
              </div>
              <div className={styles.activitiesList}>
                {activities.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>{activity.icon}</div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitle}>{activity.title}</div>
                      <div className={styles.activityTime}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <button className={styles.actionBtn} onClick={() => setChatOpen(true)}>
                <span className={styles.actionBtnIcon}>🤖</span>
                <span className={styles.actionBtnText}>Întreabă AI-ul</span>
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionBtnIcon}>🔍</span>
                <span className={styles.actionBtnText}>Scanează temă</span>
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionBtnIcon}>🎮</span>
                <span className={styles.actionBtnText}>Joacă educațională</span>
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionBtnIcon}>🎯</span>
                <span className={styles.actionBtnText}>Setează obiectiv</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* AI Chat (only for children) */}
      {!parentMode && (
        <>
          <div className={`${styles.aiChat} ${chatOpen ? styles.open : ''}`}>
            <div className={styles.chatHeader}>
              <h4>🤖 Asistent AI PorKids</h4>
              <button className={styles.chatClose} onClick={() => setChatOpen(false)}>×</button>
            </div>
            <div className={styles.chatMessages}>
              {chatMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`${styles.message} ${message.isAI ? styles.ai : styles.user}`}
                >
                  {message.text}
                </div>
              ))}
              {isTyping && (
                <div className={`${styles.message} ${styles.ai} ${styles.typing}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
            <div className={styles.chatInput}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Întreabă orice despre temă, exerciții sau joacă..."
              />
              <button className={styles.chatSend} onClick={sendMessage}>
                🚀
              </button>
            </div>
          </div>

          <button
            className={`${styles.chatToggle} ${chatOpen ? styles.hidden : ''}`}
            onClick={() => setChatOpen(true)}
          >
            💬
          </button>
        </>
      )}

      {/* Footer - Grid Row 4, Column 2 */}
      <footer className={styles.dashboardFooter}>
        &copy; 2025 PorVerse. Toate drepturile rezervate.
      </footer>
    </div>
  );
}