// app/dashboard/por-flow/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Target, TrendingUp, Play, Pause, BarChart3, CheckCircle, Circle, AlertCircle, Zap, Brain, Timer, Plus } from 'lucide-react';
import styles from './style.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'completed';
  category: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  dueDate?: Date;
  dependencies?: string[];
  aiPriorityScore: number;
}

interface TimeBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'focus' | 'meeting' | 'break' | 'buffer';
  tasks: string[];
  productivity?: number;
}

interface FocusSession {
  id: string;
  type: 'pomodoro' | 'deep-work' | 'flow-state';
  duration: number;
  startTime?: Date;
  endTime?: Date;
  taskId?: string;
  status: 'planned' | 'active' | 'completed' | 'paused';
  distractions: number;
  productivity: number;
}

export default function PorFlowDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'calendar' | 'focus' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [currentFocusSession, setCurrentFocusSession] = useState<FocusSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

  // Mock data initialization
  useEffect(() => {
    setTimeout(() => {
      // Initialize mock tasks
      setTasks([
        {
          id: '1',
          title: 'Complete PorVerse AI Integration',
          description: 'Implement OpenAI and Claude integration for all ecosystems',
          priority: 'urgent',
          status: 'in-progress',
          category: 'Development',
          estimatedMinutes: 240,
          actualMinutes: 180,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          aiPriorityScore: 9.5
        },
        {
          id: '2', 
          title: 'Design Marketing Campaign',
          description: 'Create comprehensive marketing strategy for Q2 launch',
          priority: 'high',
          status: 'todo',
          category: 'Marketing',
          estimatedMinutes: 180,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          aiPriorityScore: 8.2
        },
        {
          id: '3',
          title: 'Team Standup Preparation',
          description: 'Review sprint progress and prepare status updates',
          priority: 'medium',
          status: 'todo',
          category: 'Management',
          estimatedMinutes: 30,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          aiPriorityScore: 6.8
        },
        {
          id: '4',
          title: 'Code Review: Authentication Module',
          description: 'Review and approve security enhancements',
          priority: 'high',
          status: 'todo',
          category: 'Development',
          estimatedMinutes: 90,
          aiPriorityScore: 8.5
        }
      ]);

      // Initialize time blocks
      setTimeBlocks([
        {
          id: '1',
          title: 'Deep Work: AI Integration',
          startTime: new Date(Date.now() + 60 * 60 * 1000),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          type: 'focus',
          tasks: ['1'],
          productivity: 85
        },
        {
          id: '2',
          title: 'Marketing Strategy Session',
          startTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
          type: 'focus',
          tasks: ['2'],
          productivity: 78
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const startFocusSession = (type: FocusSession['type'], duration: number, taskId?: string) => {
    const session: FocusSession = {
      id: Date.now().toString(),
      type,
      duration,
      startTime: new Date(),
      status: 'active',
      taskId,
      distractions: 0,
      productivity: 0
    };
    setCurrentFocusSession(session);
  };

  const endFocusSession = () => {
    if (currentFocusSession) {
      const completedSession = {
        ...currentFocusSession,
        endTime: new Date(),
        status: 'completed' as const,
        productivity: Math.floor(Math.random() * 30) + 70 // Mock productivity score
      };
      setFocusSessions(prev => [...prev, completedSession]);
      setCurrentFocusSession(null);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'var(--pf-urgent)';
      case 'high': return 'var(--pf-warning)';
      case 'medium': return 'var(--pf-primary)';
      case 'low': return 'var(--pf-success)';
      default: return 'var(--pf-primary)';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        <h2>Optimizăm productivitatea ta...</h2>
        <p>Analizăm pattern-urile și pregătim recomendările AI</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoSection}>
            <span className={styles.logoIcon}>🌊</span>
            <h1>PorFlow</h1>
          </div>
          <p>Productivitate Maximă</p>
        </div>

        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={20} />
            <span>Overview</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'tasks' ? styles.active : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <CheckCircle size={20} />
            <span>Task Manager</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'calendar' ? styles.active : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={20} />
            <span>Time Blocks</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'focus' ? styles.active : ''}`}
            onClick={() => setActiveTab('focus')}
          >
            <Brain size={20} />
            <span>Focus Sessions</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Current Focus Session */}
        {currentFocusSession && (
          <div className={styles.activeFocus}>
            <h3>🔥 Sesiune Activă</h3>
            <div className={styles.focusTimer}>
              <Timer size={24} />
              <span>{Math.floor(currentFocusSession.duration / 60)}:{(currentFocusSession.duration % 60).toString().padStart(2, '0')}</span>
            </div>
            <p>{currentFocusSession.type === 'pomodoro' ? 'Pomodoro' : 
               currentFocusSession.type === 'deep-work' ? 'Deep Work' : 'Flow State'}</p>
            <button className={styles.endFocusBtn} onClick={endFocusSession}>
              <Pause size={16} />
              Finalizează
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <div className={styles.statItem}>
            <span>Taskuri Astăzi</span>
            <strong>{tasks.filter(t => t.status === 'completed').length}/{tasks.length}</strong>
          </div>
          <div className={styles.statItem}>
            <span>Productivitate</span>
            <strong>85%</strong>
          </div>
          <div className={styles.statItem}>
            <span>Focus Time</span>
            <strong>4.2h</strong>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {activeTab === 'overview' && (
          <div className={styles.overviewTab}>
            <header className={styles.tabHeader}>
              <div>
                <h1>🌊 Productivity Overview</h1>
                <p>Analiza completă a productivității tale cu AI insights</p>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.optimizeBtn}>
                  <Zap size={16} />
                  Optimizează Ziua
                </button>
              </div>
            </header>

            {/* Priority Tasks */}
            <section className={styles.prioritySection}>
              <h2>🎯 Priorități Astăzi</h2>
              <div className={styles.priorityTasksGrid}>
                {tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').map(task => (
                  <div key={task.id} className={styles.priorityTask}>
                    <div className={styles.taskHeader}>
                      <span className={styles.priorityBadge} style={{ backgroundColor: getPriorityColor(task.priority) }}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={styles.aiScore}>AI: {task.aiPriorityScore}/10</span>
                    </div>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <div className={styles.taskMeta}>
                      <span>⏱️ {task.estimatedMinutes}min</span>
                      <span>📁 {task.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Optimizer */}
            <section className={styles.aiOptimizerSection}>
              <h2>🤖 AI Productivity Optimizer</h2>
              <div className={styles.optimizerCards}>
                <div className={styles.optimizerCard}>
                  <Brain size={32} />
                  <h3>Schedule Optimization</h3>
                  <p>AI analizează pattern-urile tale și sugerează cel mai eficient program</p>
                  <button className={styles.cardAction}>Optimizează Schedule</button>
                </div>
                
                <div className={styles.optimizerCard}>
                  <Target size={32} />
                  <h3>Focus Block Planner</h3>
                  <p>Creează automat blocuri de timp pentru deep work bazat pe energia ta</p>
                  <button className={styles.cardAction}>Planifică Focus</button>
                </div>
                
                <div className={styles.optimizerCard}>
                  <TrendingUp size={32} />
                  <h3>Productivity Insights</h3>
                  <p>Analiză avansată a performanței cu recomendări personalizate</p>
                  <button className={styles.cardAction}>Vezi Insights</button>
                </div>
              </div>
            </section>

            {/* Schedule Comparison */}
            <section className={styles.scheduleSection}>
              <h2>📅 AI vs Current Schedule</h2>
              <div className={styles.scheduleComparison}>
                <div className={styles.scheduleColumn}>
                  <h3>Current Schedule</h3>
                  <div className={styles.scheduleBlocks}>
                    <div className={styles.scheduleBlock}>
                      <span>09:00 - 11:00</span>
                      <p>Mixed Tasks</p>
                    </div>
                    <div className={styles.scheduleBlock}>
                      <span>11:00 - 12:30</span>
                      <p>Meetings</p>
                    </div>
                    <div className={styles.scheduleBlock}>
                      <span>13:00 - 17:00</span>
                      <p>Development</p>
                    </div>
                  </div>
                  <div className={styles.scheduleStats}>
                    <span>Productivitate estimată: 68%</span>
                  </div>
                </div>
                
                <div className={styles.scheduleArrow}>→</div>
                
                <div className={styles.scheduleColumn}>
                  <h3>AI Optimized</h3>
                  <div className={styles.scheduleBlocks}>
                    <div className={styles.scheduleBlock}>
                      <span>09:00 - 11:30</span>
                      <p>Deep Work Block</p>
                    </div>
                    <div className={styles.scheduleBlock}>
                      <span>11:30 - 12:00</span>
                      <p>Quick Tasks</p>
                    </div>
                    <div className={styles.scheduleBlock}>
                      <span>13:00 - 15:00</span>
                      <p>Focus Development</p>
                    </div>
                  </div>
                  <div className={styles.scheduleStats}>
                    <span>Productivitate estimată: 89%</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className={styles.tasksTab}>
            <header className={styles.tabHeader}>
              <div>
                <h1>📋 Task Manager AI</h1>
                <p>Gestionează taskurile cu prioritizare inteligentă</p>
              </div>
              <div className={styles.headerActions}>
                <button className={styles.addTaskBtn}>
                  <Plus size={16} />
                  Adaugă Task
                </button>
              </div>
            </header>

            {/* Tasks Kanban Board */}
            <div className={styles.tasksKanban}>
              <div className={styles.kanbanColumn}>
                <h3>To Do ({tasks.filter(t => t.status === 'todo').length})</h3>
                <div className={styles.kanbanTasks}>
                  {tasks.filter(t => t.status === 'todo').map(task => (
                    <div key={task.id} className={styles.kanbanTask}>
                      <div className={styles.taskHeader}>
                        <h4>{task.title}</h4>
                        <span className={styles.priorityBadge} style={{ backgroundColor: getPriorityColor(task.priority) }}>
                          {task.priority}
                        </span>
                      </div>
                      <p>{task.description}</p>
                      <div className={styles.taskFooter}>
                        <span>⏱️ {task.estimatedMinutes}min</span>
                        <span>AI: {task.aiPriorityScore}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.kanbanColumn}>
                <h3>In Progress ({tasks.filter(t => t.status === 'in-progress').length})</h3>
                <div className={styles.kanbanTasks}>
                  {tasks.filter(t => t.status === 'in-progress').map(task => (
                    <div key={task.id} className={styles.kanbanTask}>
                      <div className={styles.taskHeader}>
                        <h4>{task.title}</h4>
                        <span className={styles.priorityBadge} style={{ backgroundColor: getPriorityColor(task.priority) }}>
                          {task.priority}
                        </span>
                      </div>
                      <p>{task.description}</p>
                      {task.actualMinutes && (
                        <div className={styles.progressIndicator}>
                          <span>Progres: {Math.round((task.actualMinutes / task.estimatedMinutes) * 100)}%</span>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill} 
                              style={{ width: `${Math.min((task.actualMinutes / task.estimatedMinutes) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <div className={styles.taskFooter}>
                        <span>⏱️ {task.actualMinutes || 0}/{task.estimatedMinutes}min</span>
                        <span>AI: {task.aiPriorityScore}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.kanbanColumn}>
                <h3>Completed ({tasks.filter(t => t.status === 'completed').length})</h3>
                <div className={styles.kanbanTasks}>
                  {tasks.filter(t => t.status === 'completed').map(task => (
                    <div key={task.id} className={`${styles.kanbanTask} ${styles.completedTask}`}>
                      <div className={styles.taskHeader}>
                        <h4>{task.title}</h4>
                        <CheckCircle className={styles.completedIcon} size={20} />
                      </div>
                      <p>{task.description}</p>
                      <div className={styles.taskFooter}>
                        <span>✅ Completat</span>
                        <span>AI: {task.aiPriorityScore}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className={styles.calendarTab}>
            <header className={styles.tabHeader}>
              <div>
                <h1>📅 Time Blocks & Calendar</h1>
                <p>Optimizează timpul cu blocuri inteligente de productivitate</p>
              </div>
            </header>

            {/* Today's Schedule */}
            <section className={styles.todaySchedule}>
              <h2>Programul de Astăzi</h2>
              <div className={styles.timelineContainer}>
                {timeBlocks.map(block => (
                  <div key={block.id} className={styles.timeBlock}>
                    <div className={styles.timeBlockTime}>
                      <span>{formatTime(block.startTime)}</span>
                      <span>{formatTime(block.endTime)}</span>
                    </div>
                    <div className={styles.timeBlockContent}>
                      <h3>{block.title}</h3>
                      <p>Tip: {block.type}</p>
                      {block.productivity && (
                        <div className={styles.productivityBadge}>
                          Productivitate: {block.productivity}%
                        </div>
                      )}
                    </div>
                    <div className={styles.timeBlockActions}>
                      <button className={styles.editBlockBtn}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className={styles.quickActionsSection}>
              <h2>Acțiuni Rapide</h2>
              <div className={styles.quickActions}>
                <button className={styles.quickActionBtn}>
                  <Plus size={20} />
                  Adaugă Bloc Focus
                </button>
                <button className={styles.quickActionBtn}>
                  <Calendar size={20} />
                  Sincronizează Calendar
                </button>
                <button className={styles.quickActionBtn}>
                  <Zap size={20} />
                  Auto-Optimizare
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'focus' && (
          <div className={styles.focusTab}>
            <header className={styles.tabHeader}>
              <div>
                <h1>🧠 Focus Sessions</h1>
                <p>Sesiuni de concentrare profundă cu tracking AI</p>
              </div>
            </header>

            {/* Focus Options */}
            <section className={styles.focusOptionsSection}>
              <h2>Selectează Tipul de Sesiune</h2>
              <div className={styles.focusOptions}>
                <div className={styles.focusOption} onClick={() => startFocusSession('pomodoro', 25)}>
                  <div className={styles.focusIcon}>🍅</div>
                  <h3>Pomodoro</h3>
                  <p>25 min focus + 5 min pauză</p>
                  <span className={styles.duration}>25 min</span>
                </div>
                
                <div className={styles.focusOption} onClick={() => startFocusSession('deep-work', 90)}>
                  <div className={styles.focusIcon}>🧠</div>
                  <h3>Deep Work</h3>
                  <p>1.5 ore de muncă profundă</p>
                  <span className={styles.duration}>90 min</span>
                </div>
                
                <div className={styles.focusOption} onClick={() => startFocusSession('flow-state', 120)}>
                  <div className={styles.focusIcon}>🌊</div>
                  <h3>Flow State</h3>
                  <p>2 ore de flow complet</p>
                  <span className={styles.duration}>120 min</span>
                </div>
              </div>
            </section>

            {/* Recent Sessions */}
            <section className={styles.recentSessionsSection}>
              <h2>Sesiuni Recente</h2>
              <div className={styles.sessionsHistory}>
                {focusSessions.slice(-5).map(session => (
                  <div key={session.id} className={styles.historyItem}>
                    <div className={styles.sessionIcon}>
                      {session.type === 'pomodoro' ? '🍅' : 
                       session.type === 'deep-work' ? '🧠' : '🌊'}
                    </div>
                    <div className={styles.sessionDetails}>
                      <h4>{session.type === 'pomodoro' ? 'Pomodoro' : 
                           session.type === 'deep-work' ? 'Deep Work' : 'Flow State'}</h4>
                      <p>{session.duration} min • Productivitate: {session.productivity}%</p>
                    </div>
                    <div className={styles.sessionTime}>
                      {session.startTime && formatTime(session.startTime)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={styles.analyticsTab}>
            <header className={styles.tabHeader}>
              <div>
                <h1>📊 Productivity Analytics</h1>
                <p>Insights detaliate despre productivitatea ta</p>
              </div>
            </header>

            {/* Analytics Dashboard */}
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <h3>📈 Productivitate Săptămânală</h3>
                <div className={styles.chartPlaceholder}>
                  <div className={styles.mockChart}>
                    <div className={styles.chartBar} style={{ height: '70%' }}>L</div>
                    <div className={styles.chartBar} style={{ height: '85%' }}>M</div>
                    <div className={styles.chartBar} style={{ height: '60%' }}>M</div>
                    <div className={styles.chartBar} style={{ height: '90%' }}>J</div>
                    <div className={styles.chartBar} style={{ height: '75%' }}>V</div>
                    <div className={styles.chartBar} style={{ height: '45%' }}>S</div>
                    <div className={styles.chartBar} style={{ height: '20%' }}>D</div>
                  </div>
                </div>
                <p>Cea mai productivă zi: Joi (90%)</p>
              </div>

              <div className={styles.analyticsCard}>
                <h3>⏰ Focus Time Distribution</h3>
                <div className={styles.focusDistribution}>
                  <div className={styles.distributionItem}>
                    <span>🍅 Pomodoro</span>
                    <div className={styles.distributionBar}>
                      <div style={{ width: '45%', backgroundColor: 'var(--pf-pomodoro)' }}></div>
                    </div>
                    <span>45%</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span>🧠 Deep Work</span>
                    <div className={styles.distributionBar}>
                      <div style={{ width: '35%', backgroundColor: 'var(--pf-deep-work)' }}></div>
                    </div>
                    <span>35%</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span>🌊 Flow State</span>
                    <div className={styles.distributionBar}>
                      <div style={{ width: '20%', backgroundColor: 'var(--pf-flow-state)' }}></div>
                    </div>
                    <span>20%</span>
                  </div>
                </div>
              </div>

              <div className={styles.analyticsCard}>
                <h3>🎯 Task Completion Rate</h3>
                <div className={styles.completionStats}>
                  <div className={styles.statCircle}>
                    <span className={styles.statNumber}>85%</span>
                    <span className={styles.statLabel}>Completate</span>
                  </div>
                  <div className={styles.completionBreakdown}>
                    <div>✅ Completate: 34 taskuri</div>
                    <div>🔄 În progres: 6 taskuri</div>
                    <div>📋 În așteptare: 8 taskuri</div>
                  </div>
                </div>
              </div>

              <div className={styles.analyticsCard}>
                <h3>🚀 AI Insights</h3>
                <div className={styles.aiInsights}>
                  <div className={styles.insight}>
                    <AlertCircle size={16} />
                    <p>Ești cel mai productiv între 9-11 AM. Programează taskurile importante în această perioadă.</p>
                  </div>
                  <div className={styles.insight}>
                    <TrendingUp size={16} />
                    <p>Productivitatea ta a crescut cu 23% în ultima săptămână. Continuă așa!</p>
                  </div>
                  <div className={styles.insight}>
                    <Brain size={16} />
                    <p>Sesiunile de Deep Work îți aduc cea mai mare satisfacție. Consideră să le creștești.</p>
                  </div>
                </div>
              </div