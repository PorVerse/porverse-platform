'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './style.module.css';

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  estimatedTime: number; // minutes
  actualTime?: number;
  category: string;
  deadline?: string;
  tags: string[];
  aiScore?: number; // AI difficulty/importance score
}

interface TimeBlock {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'work' | 'break' | 'meeting' | 'focus' | 'personal';
  productivity?: number; // 1-10 scale
  tasks?: string[]; // task IDs
}

interface FocusSession {
  id: string;
  type: 'pomodoro' | 'deep-work' | 'flow-state';
  duration: number; // minutes
  startTime: string;
  endTime?: string;
  isActive: boolean;
  productivity?: number;
  distractions: number;
}

interface ProductivityInsight {
  id: string;
  type: 'pattern' | 'suggestion' | 'achievement' | 'warning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export default function PorFlowDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [currentFocusSession, setCurrentFocusSession] = useState<FocusSession | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [focusTime, setFocusTime] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  // Mock data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock tasks
      setTodayTasks([
        {
          id: '1',
          title: 'Finalizare prezentare Q1',
          description: 'Completez slide-urile cu rezultatele trimestrului',
          priority: 'high',
          status: 'in-progress',
          estimatedTime: 120,
          actualTime: 85,
          category: 'Lucru',
          deadline: '2025-01-15T17:00',
          tags: ['prezentare', 'Q1', 'important'],
          aiScore: 9.2
        },
        {
          id: '2',
          title: 'Review cod pentru feature nou',
          description: 'Code review pentru implementarea dashboard-ului',
          priority: 'medium',
          status: 'todo',
          estimatedTime: 60,
          category: 'Development',
          deadline: '2025-01-16T12:00',
          tags: ['code-review', 'dashboard'],
          aiScore: 7.5
        },
        {
          id: '3',
          title: 'Planificare sprint următorul',
          priority: 'medium',
          status: 'completed',
          estimatedTime: 45,
          actualTime: 40,
          category: 'Planning',
          tags: ['sprint', 'planning'],
          aiScore: 6.8
        },
        {
          id: '4',
          title: 'Răspuns la emailuri importante',
          priority: 'low',
          status: 'todo',
          estimatedTime: 30,
          category: 'Comunicare',
          tags: ['email', 'comunicare'],
          aiScore: 4.2
        },
        {
          id: '5',
          title: 'Update documentație API',
          priority: 'medium',
          status: 'review',
          estimatedTime: 90,
          actualTime: 75,
          category: 'Documentation',
          deadline: '2025-01-17T15:00',
          tags: ['API', 'documentație'],
          aiScore: 7.0
        }
      ]);

      // Mock time blocks pentru azi
      setTimeBlocks([
        {
          id: '1',
          title: 'Deep Work Session',
          start: '09:00',
          end: '11:00',
          type: 'focus',
          productivity: 9,
          tasks: ['1']
        },
        {
          id: '2',
          title: 'Team Meeting',
          start: '11:30',
          end: '12:30',
          type: 'meeting',
          productivity: 7
        },
        {
          id: '3',
          title: 'Lunch Break',
          start: '12:30',
          end: '13:30',
          type: 'break'
        },
        {
          id: '4',
          title: 'Code Review Time',
          start: '14:00',
          end: '15:30',
          type: 'work',
          productivity: 8,
          tasks: ['2', '5']
        },
        {
          id: '5',
          title: 'Admin Tasks',
          start: '16:00',
          end: '17:00',
          type: 'work',
          productivity: 6,
          tasks: ['4']
        }
      ]);

      // Calculate metrics
      const completed = todayTasks.filter(task => task.status === 'completed').length;
      setCompletedTasks(completed);
      setProductivityScore(82); // Mock calculation
      setFocusTime(4.5); // Hours

      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#06b6d4';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo': return '⏳';
      case 'in-progress': return '🔄';
      case 'review': return '👀';
      case 'completed': return '✅';
      default: return '📝';
    }
  };

  const startFocusSession = (type: FocusSession['type'], duration: number) => {
    const session: FocusSession = {
      id: Date.now().toString(),
      type,
      duration,
      startTime: new Date().toISOString(),
      isActive: true,
      distractions: 0
    };
    setCurrentFocusSession(session);
  };

  const stopFocusSession = () => {
    if (currentFocusSession) {
      setCurrentFocusSession({
        ...currentFocusSession,
        endTime: new Date().toISOString(),
        isActive: false,
        productivity: Math.floor(Math.random() * 3) + 8 // Mock 8-10
      });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getAITaskSuggestion = () => {
    const suggestions = [
      "🎯 Bazat pe energia ta matinală, recomand să începi cu 'Finalizare prezentare Q1' - este taskul cu cel mai mare impact.",
      "⚡ Ai 30 de minute libere între întâlniri. Perfect pentru 'Răspuns la emailuri importante'.",
      "🧠 Nivelul tău de focus este optim acum. Perioada ideală pentru taskuri complexe care necesită concentrare profundă.",
      "📈 Performanța ta este cu 15% mai bună când lucrezi la documentație după-amiaza. Planific 'Update documentație API' pentru după-amiaza.",
      "⏰ Ai tendința să subestimezi timpul pentru code review. Adaug 15 minute extra la estimarea pentru 'Review cod pentru feature nou'."
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner}></div>
          <h2>Optimizez workflow-ul tău...</h2>
          <p>Analizez taskurile și calculez prioritățile AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* SIDEBAR */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Link href="/" className={styles.logo}>🌊 PorFlow</Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Overview</div>
          <button 
            className={`${styles.navItem} ${activeView === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <span className={styles.navItemIcon}>📊</span>
            Dashboard
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'tasks' ? styles.active : ''}`}
            onClick={() => setActiveView('tasks')}
          >
            <span className={styles.navItemIcon}>✅</span>
            Task Management
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'calendar' ? styles.active : ''}`}
            onClick={() => setActiveView('calendar')}
          >
            <span className={styles.navItemIcon}>📅</span>
            Time Blocking
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'focus' ? styles.active : ''}`}
            onClick={() => setActiveView('focus')}
          >
            <span className={styles.navItemIcon}>🎯</span>
            Focus Sessions
          </button>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>AI Tools</div>
          <button 
            className={`${styles.navItem} ${activeView === 'ai-optimizer' ? styles.active : ''}`}
            onClick={() => setActiveView('ai-optimizer')}
          >
            <span className={styles.navItemIcon}>🤖</span>
            AI Task Optimizer
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'workflow' ? styles.active : ''}`}
            onClick={() => setActiveView('workflow')}
          >
            <span className={styles.navItemIcon}>⚡</span>
            Workflow Builder
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            <span className={styles.navItemIcon}>📈</span>
            Productivity Analytics
          </button>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Integration</div>
          <button 
            className={`${styles.navItem} ${activeView === 'calendar-sync' ? styles.active : ''}`}
            onClick={() => setActiveView('calendar-sync')}
          >
            <span className={styles.navItemIcon}>🔄</span>
            Calendar Sync
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'automation' ? styles.active : ''}`}
            onClick={() => setActiveView('automation')}
          >
            <span className={styles.navItemIcon}>🔧</span>
            Automation
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>⚡ Flow State Dashboard</h1>
          <p>Scor productivitate: <span className={styles.productivityScore}>{productivityScore}%</span> • Focus astăzi: <span className={styles.focusTime}>{focusTime}h</span></p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{completedTasks}</div>
              <div className={styles.statLabel}>Taskuri finalizate</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{todayTasks.filter(t => t.status === 'in-progress').length}</div>
              <div className={styles.statLabel}>În progres</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{todayTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}</div>
              <div className={styles.statLabel}>Prioritate mare</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            {currentFocusSession?.isActive ? (
              <button 
                className={`${styles.headerBtn} ${styles.activeFocus}`}
                onClick={stopFocusSession}
                title="Stop Focus Session"
              >
                ⏸️
              </button>
            ) : (
              <button 
                className={styles.headerBtn}
                onClick={() => startFocusSession('pomodoro', 25)}
                title="Start Focus Session"
              >
                🎯
              </button>
            )}
            <button className={styles.headerBtn} title="Notificări">🔔</button>
            <button className={styles.headerBtn} title="Setări">⚙️</button>
            <button className={styles.headerBtn} title="Profil">👤</button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        {activeView === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <section className={styles.welcomeSection}>
              <h2>🌟 Bună dimineața, Alex!</h2>
              <p>Ziua ta este optimizată pentru productivitate maximă. Ai 5 taskuri planificate și 4.5h timp de deep work.</p>
            </section>

            {/* AI Suggestion Card */}
            <section className={styles.aiSuggestionSection}>
              <div className={styles.aiSuggestionCard}>
                <div className={styles.aiAvatar}>🤖</div>
                <div className={styles.aiContent}>
                  <h3>AI Productivity Insight</h3>
                  <p>{getAITaskSuggestion()}</p>
                </div>
                <button className={styles.applySuggestion}>Aplică</button>
              </div>
            </section>

            {/* Current Focus Session */}
            {currentFocusSession?.isActive && (
              <section className={styles.focusSessionActive}>
                <div className={styles.focusHeader}>
                  <h3>🎯 Focus Session Activ</h3>
                  <span className={styles.sessionType}>
                    {currentFocusSession.type === 'pomodoro' && '🍅 Pomodoro'}
                    {currentFocusSession.type === 'deep-work' && '🧠 Deep Work'}
                    {currentFocusSession.type === 'flow-state' && '🌊 Flow State'}
                  </span>
                </div>
                <div className={styles.focusTimer}>
                  <div className={styles.timerDisplay}>24:35</div>
                  <div className={styles.timerProgress}>
                    <div className={styles.progressBar} style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className={styles.focusActions}>
                  <button className={styles.pauseBtn}>⏸️ Pauză</button>
                  <button className={styles.stopBtn} onClick={stopFocusSession}>⏹️ Stop</button>
                  <button className={styles.distractionBtn}>📱 Distracție</button>
                </div>
              </section>
            )}

            {/* Today's Priority Tasks */}
            <section className={styles.priorityTasksSection}>
              <h3>🎯 Taskuri Prioritare Astăzi</h3>
              <div className={styles.priorityTasksGrid}>
                {todayTasks
                  .filter(task => task.priority === 'high' || task.priority === 'urgent')
                  .map(task => (
                    <div key={task.id} className={styles.priorityTaskCard}>
                      <div className={styles.taskHeader}>
                        <span className={styles.taskStatus}>{getStatusIcon(task.status)}</span>
                        <h4>{task.title}</h4>
                        <div 
                          className={styles.taskPriority}
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </div>
                      </div>
                      <p className={styles.taskDescription}>{task.description}</p>
                      <div className={styles.taskMeta}>
                        <span className={styles.taskTime}>⏱️ {formatTime(task.estimatedTime)}</span>
                        <span className={styles.taskAI}>🤖 {task.aiScore}/10</span>
                        {task.deadline && (
                          <span className={styles.taskDeadline}>
                            📅 {new Date(task.deadline).toLocaleDateString('ro-RO')}
                          </span>
                        )}
                      </div>
                      <div className={styles.taskTags}>
                        {task.tags.map(tag => (
                          <span key={tag} className={styles.taskTag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Time Blocks Today */}
            <section className={styles.timeBlocksSection}>
              <h3>📅 Programul de Astăzi</h3>
              <div className={styles.timeBlocksTimeline}>
                {timeBlocks.map(block => (
                  <div key={block.id} className={`${styles.timeBlock} ${styles[block.type]}`}>
                    <div className={styles.timeBlockTime}>
                      {block.start} - {block.end}
                    </div>
                    <div className={styles.timeBlockContent}>
                      <h4>{block.title}</h4>
                      {block.productivity && (
                        <div className={styles.productivityIndicator}>
                          <span>Productivitate: {block.productivity}/10</span>
                          <div className={styles.productivityBar}>
                            <div 
                              className={styles.productivityFill}
                              style={{ width: `${block.productivity * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {block.tasks && block.tasks.length > 0 && (
                        <div className={styles.blockTasks}>
                          {block.tasks.map(taskId => {
                            const task = todayTasks.find(t => t.id === taskId);
                            return task ? (
                              <span key={taskId} className={styles.blockTask}>
                                {task.title}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className={styles.quickActionsSection}>
              <h3>⚡ Quick Actions</h3>
              <div className={styles.quickActions}>
                <button 
                  className={styles.actionBtn}
                  onClick={() => startFocusSession('pomodoro', 25)}
                >
                  <span className={styles.actionIcon}>🍅</span>
                  Start Pomodoro (25min)
                </button>
                <button 
                  className={styles.actionBtn}
                  onClick={() => startFocusSession('deep-work', 90)}
                >
                  <span className={styles.actionIcon}>🧠</span>
                  Deep Work (90min)
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>📝</span>
                  Add Quick Task
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>📊</span>
                  View Analytics
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>🔄</span>
                  Auto-Schedule
                </button>
              </div>
            </section>
          </>
        )}

        {activeView === 'ai-optimizer' && (
          <section className={styles.aiOptimizerSection}>
            <div className={styles.optimizerHeader}>
              <h2>🤖 AI Task Optimizer</h2>
              <p>Algoritmul AI analizează taskurile tale și optimizează ordinea pentru productivitate maximă</p>
            </div>

            <div className={styles.optimizerInterface}>
              <div className={styles.optimizerCards}>
                <div className={styles.optimizerCard}>
                  <h3>📊 Analiză Curentă</h3>
                  <div className={styles.analysisMetrics}>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>Taskuri analizate:</span>
                      <span className={styles.metricValue}>{todayTasks.length}</span>
                    </div>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>Timp total estimat:</span>
                      <span className={styles.metricValue}>
                        {formatTime(todayTasks.reduce((sum, task) => sum + task.estimatedTime, 0))}
                      </span>
                    </div>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>Scor AI mediu:</span>
                      <span className={styles.metricValue}>
                        {(todayTasks.reduce((sum, task) => sum + (task.aiScore || 0), 0) / todayTasks.length).toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.optimizerCard}>
                  <h3>⚡ Optimizare Sugerată</h3>
                  <div className={styles.optimizationSuggestions}>
                    <div className={styles.suggestion}>
                      <span className={styles.suggestionIcon}>🎯</span>
                      <span>Reprogramează taskurile în funcție de energia naturală</span>
                    </div>
                    <div className={styles.suggestion}>
                      <span className={styles.suggestionIcon}>⏰</span>
                      <span>Grupează taskurile similare pentru eficiență maximă</span>
                    </div>
                    <div className={styles.suggestion}>
                      <span className={styles.suggestionIcon}>🧠</span>
                      <span>Plasează taskurile complexe în orele de vârf</span>
                    </div>
                  </div>
                  <button className={styles.applyOptimization}>Aplică Optimizarea</button>
                </div>
              </div>

              <div className={styles.optimizedSchedule}>
                <h3>📋 Program Optimizat AI</h3>
                <div className={styles.scheduleComparison}>
                  <div className={styles.scheduleColumn}>
                    <h4>Program Actual</h4>
                    <div className={styles.taskList}>
                      {todayTasks.map(task => (
                        <div key={task.id} className={styles.scheduleTask}>
                          <span className={styles.taskTitle}>{task.title}</span>
                          <span className={styles.taskDuration}>{formatTime(task.estimatedTime)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.scheduleArrow}>→</div>
                  
                  <div className={styles.scheduleColumn}>
                    <h4>Program Optimizat AI</h4>
                    <div className={styles.taskList}>
                      {[...todayTasks]
                        .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
                        .map(task => (
                        <div key={task.id} className={styles.scheduleTask}>
                          <span className={styles.taskTitle}>{task.title}</span>
                          <span className={styles.taskDuration}>{formatTime(task.estimatedTime)}</span>
                          <span className={styles.aiImprovement}>+{Math.floor(Math.random() * 20 + 10)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeView === 'focus' && (
          <section className={styles.focusSection}>
            <h2>🎯 Focus Sessions & Deep Work</h2>
            
            <div className={styles.focusOptions}>
              <div className={styles.focusCard} onClick={() => startFocusSession('pomodoro', 25)}>
                <div className={styles.focusIcon}>🍅</div>
                <h3>Pomodoro</h3>
                <p>25 minute focus + 5 minute break</p>
                <div className={styles.focusStats}>
                  <span>Sessions astăzi: 3</span>
                  <span>Success rate: 85%</span>
                </div>
              </div>

              <div className={styles.focusCard} onClick={() => startFocusSession('deep-work', 90)}>
                <div className={styles.focusIcon}>🧠</div>
                <h3>Deep Work</h3>
                <p>90 minute intensive focus session</p>
                <div className={styles.focusStats}>
                  <span>Sessions astăzi: 1</span>
                  <span>Avg productivity: 9.2/10</span>
                </div>
              </div>

              <div className={styles.focusCard} onClick={() => startFocusSession('flow-state', 120)}>
                <div className={styles.focusIcon}>🌊</div>
                <h3>Flow State</h3>
                <p>2+ ore pentru proiecte complexe</p>
                <div className={styles.focusStats}>
                  <span>Sessions această săptămână: 2</span>
                  <span>Peak performance: 9.8/10</span>
                </div>
              </div>
            </div>

            <div className={styles.focusHistory}>
              <h3>📈 Istoric Focus Sessions</h3>
              <div className={styles.sessionHistory}>
                <div className={styles.historyItem}>
                  <div className={styles.historyTime}>09:00 - 10:30</div>
                  <div className={styles.historyType}>🧠 Deep Work</div>
                  <div className={styles.historyProductivity}>
                    <span>Productivitate: 9.2/10</span>
                    <div className={styles.productivityBar}>
                      <div className={styles.productivityFill} style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className={styles.historyDistractions}>2 distracții</div>
                </div>
                
                <div className={styles.historyItem}>
                  <div className={styles.historyTime}>11:45 - 12:10</div>
                  <div className={styles.historyType}>🍅 Pomodoro</div>
                  <div className={styles.historyProductivity}>
                    <span>Productivitate: 8.5/10</span>
                    <div className={styles.productivityBar}>
                      <div className={styles.productivityFill} style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className={styles.historyDistractions}>1 distracție</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeView === 'tasks' && (
          <section className={styles.tasksSection}>
            <div className={styles.tasksHeader}>
              <h2>✅ Task Management</h2>
              <button className={styles.addTaskBtn}>+ Adaugă Task</button>
            </div>

            <div className={styles.tasksFilters}>
              <button className={styles.filterBtn}>Toate</button>
              <button className={styles.filterBtn}>Astăzi</button>
              <button className={styles.filterBtn}>Prioritate mare</button>
              <button className={styles.filterBtn}>În progres</button>
              <button className={styles.filterBtn}>Completate</button>
            </div>

            <div className={styles.tasksKanban}>
              <div className={styles.kanbanColumn}>
                <h3>📝 To Do ({todayTasks.filter(t => t.status === 'todo').length})</h3>
                <div className={styles.kanbanTasks}>
                  {todayTasks.filter(task => task.status === 'todo').map(task => (
                    <div key={task.id} className={styles.kanbanTask}>
                      <div className={styles.taskHeader}>
                        <h4>{task.title}</h4>
                        <div 
                          className={styles.taskPriority}
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </div>
                      </div>
                      <p>{task.description}</p>
                      <div className={styles.taskFooter}>
                        <span>⏱️ {formatTime(task.estimatedTime)}</span>
                        <span>🤖 {task.aiScore}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.kanbanColumn}>
                <h3>🔄 În Progres ({todayTasks.filter(t => t.status === 'in-progress').length})</h3>
                <div className={styles.kanbanTasks}>
                  {todayTasks.filter(task => task.status === 'in-progress').map(task => (
                    <div key={task.id} className={styles.kanbanTask}>
                      <div className={styles.taskHeader}>
                        <h4>{task.title}</h4>
                        <div 
                          className={styles.taskPriority}
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </div>
                      </div>
                      <p>{task.description}</p>
                      <div className={styles.progressIndicator}>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: '65%' }}></div>
                        </div>
                        <span>65% complet</span>
                      </div>
                      <div className={styles.taskFooter}>
                        <span>⏱️ {task.actualTime ? `${formatTime(task.actualTime)} / ${formatTime(task.estimatedTime)}` : formatTime(task.estimatedTime)}</span>
                        <span>🤖 {task.aiScore}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.kanbanColumn}>
                <h3>👀 Review ({todayTasks.filter(t => t.status === 'review').length})</h3>
                <div className={styles.kanbanTasks}>
                  {todayTasks.filter(task => task.status === 'review').map(task => (
                    <div key={task.id} className={styles.kanbanTask}>
                      <div className={styles.taskHeader}>
                        <h4>{task.title}</h4>
                        <div 
                          className={styles.taskPriority}
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </div>
                      </div>
                      <p>{task.description}</p>
                      <div className={styles.taskFooter}>
                        <span>⏱️ {formatTime(task.actualTime || task.estimatedTime)}</span>
                        <span>🤖 {task.aiScore}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.kanbanColumn}>
                <h3>✅ Completate ({todayTasks.filter(t => t.status === 'completed').length})</h3>
                <div className={styles.kanbanTasks}>
                  {todayTasks.filter(task => task.status === 'completed').map(task => (
                    <div key={task.id} className={`${styles.kanbanTask} ${styles.completedTask}`}>
                      <div className={styles.taskHeader}>
                        <h4>{task.title}</h4>
                        <span className={styles.completedIcon}>✅</span>
                      </div>
                      <div className={styles.taskFooter}>
                        <span>⏱️ {task.actualTime ? `${formatTime(task.actualTime)} (estimat: ${formatTime(task.estimatedTime)})` : formatTime(task.estimatedTime)}</span>
                        <span>🤖 {task.aiScore}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}