// app/dashboard/por-mind/goals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../style.module.css';

interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'savings' | 'investment' | 'debt' | 'retirement' | 'purchase';
  priority: 'low' | 'medium' | 'high';
  monthlyContribution: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
}

export default function FinancialGoalsPage() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock financial goals data
      setGoals([
        {
          id: '1',
          title: 'Emergency Fund',
          description: 'Fond de urgență pentru 6 luni de cheltuieli',
          targetAmount: 30000,
          currentAmount: 18500,
          deadline: '2025-12-31',
          category: 'savings',
          priority: 'high',
          monthlyContribution: 2000,
          status: 'active',
          createdAt: '2024-01-15',
          milestones: [
            {
              id: '1',
              title: '25% Complete',
              targetAmount: 7500,
              targetDate: '2024-06-30',
              completed: true,
              completedAt: '2024-06-15'
            },
            {
              id: '2',
              title: '50% Complete',
              targetAmount: 15000,
              targetDate: '2024-09-30',
              completed: true,
              completedAt: '2024-09-20'
            },
            {
              id: '3',
              title: '75% Complete',
              targetAmount: 22500,
              targetDate: '2025-03-31',
              completed: false
            }
          ]
        },
        {
          id: '2',
          title: 'Apartament nou',
          description: 'Avans pentru apartamentul de 3 camere în București',
          targetAmount: 150000,
          currentAmount: 45000,
          deadline: '2027-06-30',
          category: 'purchase',
          priority: 'high',
          monthlyContribution: 3500,
          status: 'active',
          createdAt: '2023-08-01',
          milestones: [
            {
              id: '1',
              title: '20% Avans',
              targetAmount: 30000,
              targetDate: '2025-12-31',
              completed: true,
              completedAt: '2024-11-30'
            },
            {
              id: '2',
              title: '50% Target',
              targetAmount: 75000,
              targetDate: '2026-06-30',
              completed: false
            },
            {
              id: '3',
              title: 'Full Amount',
              targetAmount: 150000,
              targetDate: '2027-06-30',
              completed: false
            }
          ]
        },
        {
          id: '3',
          title: 'Pensie la 50 ani',
          description: 'Independență financiară pentru pensionare timpurie',
          targetAmount: 500000,
          currentAmount: 85000,
          deadline: '2042-01-01',
          category: 'retirement',
          priority: 'medium',
          monthlyContribution: 1500,
          status: 'active',
          createdAt: '2022-01-01',
          milestones: [
            {
              id: '1',
              title: '100K Milestone',
              targetAmount: 100000,
              targetDate: '2025-12-31',
              completed: false
            },
            {
              id: '2',
              title: '250K Milestone',
              targetAmount: 250000,
              targetDate: '2035-01-01',
              completed: false
            }
          ]
        },
        {
          id: '4',
          title: 'Mașină Tesla Model 3',
          description: 'Upgrade la mașină electrică',
          targetAmount: 45000,
          currentAmount: 45000,
          deadline: '2024-12-31',
          category: 'purchase',
          priority: 'medium',
          monthlyContribution: 0,
          status: 'completed',
          createdAt: '2023-01-01',
          milestones: [
            {
              id: '1',
              title: 'Target Achieved',
              targetAmount: 45000,
              targetDate: '2024-12-31',
              completed: true,
              completedAt: '2024-12-20'
            }
          ]
        },
        {
          id: '5',
          title: 'Vacanță în Japonia',
          description: 'Trip de 2 săptămâni în Japonia cu familia',
          targetAmount: 8000,
          currentAmount: 3200,
          deadline: '2025-09-30',
          category: 'savings',
          priority: 'low',
          monthlyContribution: 800,
          status: 'active',
          createdAt: '2024-10-01',
          milestones: [
            {
              id: '1',
              title: 'Bilete de avion',
              targetAmount: 4000,
              targetDate: '2025-06-30',
              completed: false
            }
          ]
        }
      ]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  const calculateProgress = (goal: FinancialGoal) => {
    return Math.round((goal.currentAmount / goal.targetAmount) * 100);
  };

  const calculateMonthsToTarget = (goal: FinancialGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (goal.monthlyContribution <= 0) return Infinity;
    return Math.ceil(remaining / goal.monthlyContribution);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      savings: '💰',
      investment: '📈',
      debt: '💳',
      retirement: '🏖️',
      purchase: '🛒'
    };
    return icons[category as keyof typeof icons] || '🎯';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        <h2>📊 Calculez obiectivele tale financiare...</h2>
        <p>Analizez progresul și strategiile de economisire</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Link href="/dashboard" className={styles.logo}>
            🧠 PorMind
          </Link>
        </div>

        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Financiar</div>
            <Link href="/dashboard/por-mind" className={styles.navItem}>
              <span className={styles.navIcon}>🏠</span>
              Dashboard
            </Link>
            <Link href="/dashboard/por-mind/budgeting" className={styles.navItem}>
              <span className={styles.navIcon}>📊</span>
              Budget Tracker
            </Link>
            <Link href="/dashboard/por-mind/investing" className={styles.navItem}>
              <span className={styles.navIcon}>📈</span>
              Investiții
            </Link>
            <div className={`${styles.navItem} ${styles.active}`}>
              <span className={styles.navIcon}>🎯</span>
              Obiective
            </div>
          </div>

          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Cont</div>
            <Link href="/dashboard" className={styles.navItem}>
              <span className={styles.navIcon}>⬅️</span>
              Înapoi la Dashboard
            </Link>
          </div>
        </nav>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>🎯 Obiective Financiare</h1>
          <p>
            {filteredGoals.filter(g => g.status === 'active').length} active • 
            {filteredGoals.filter(g => g.status === 'completed').length} completed
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.filterButtons}>
            <button 
              className={filter === 'all' ? styles.activeFilter : styles.filterButton}
              onClick={() => setFilter('all')}
            >
              All ({goals.length})
            </button>
            <button 
              className={filter === 'active' ? styles.activeFilter : styles.filterButton}
              onClick={() => setFilter('active')}
            >
              Active ({goals.filter(g => g.status === 'active').length})
            </button>
            <button 
              className={filter === 'completed' ? styles.activeFilter : styles.filterButton}
              onClick={() => setFilter('completed')}
            >
              Completed ({goals.filter(g => g.status === 'completed').length})
            </button>
          </div>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            ➕ Add Goal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Goals Summary */}
        <div className={styles.goalsSummary}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}>💰</span>
            <div>
              <div className={styles.summaryValue}>
                {goals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString('ro-RO')} RON
              </div>
              <div className={styles.summaryLabel}>Total Economisit</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}>🎯</span>
            <div>
              <div className={styles.summaryValue}>
                {goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString('ro-RO')} RON
              </div>
              <div className={styles.summaryLabel}>Total Target</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}>📈</span>
            <div>
              <div className={styles.summaryValue}>
                {Math.round((goals.reduce((sum, goal) => sum + goal.currentAmount, 0) / goals.reduce((sum, goal) => sum + goal.targetAmount, 0)) * 100)}%
              </div>
              <div className={styles.summaryLabel}>Progres General</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryIcon}>💸</span>
            <div>
              <div className={styles.summaryValue}>
                {goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0).toLocaleString('ro-RO')} RON
              </div>
              <div className={styles.summaryLabel}>Contribuție Lunară</div>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className={styles.goalsGrid}>
          {filteredGoals.map(goal => {
            const progress = calculateProgress(goal);
            const monthsToTarget = calculateMonthsToTarget(goal);
            
            return (
              <div 
                key={goal.id} 
                className={`${styles.goalCard} ${goal.status === 'completed' ? styles.completedGoal : ''}`}
                onClick={() => setSelectedGoal(goal)}
              >
                <div className={styles.goalCardHeader}>
                  <div className={styles.goalCardTitle}>
                    <span className={styles.goalCategoryIcon}>
                      {getCategoryIcon(goal.category)}
                    </span>
                    <div>
                      <h3>{goal.title}</h3>
                      <p>{goal.description}</p>
                    </div>
                  </div>
                  <div 
                    className={styles.goalPriority}
                    style={{ backgroundColor: getPriorityColor(goal.priority) }}
                  >
                    {goal.priority}
                  </div>
                </div>

                <div className={styles.goalProgress}>
                  <div className={styles.goalProgressHeader}>
                    <span>{progress}% Complete</span>
                    <span>
                      {goal.currentAmount.toLocaleString('ro-RO')} / {goal.targetAmount.toLocaleString('ro-RO')} RON
                    </span>
                  </div>
                  <div className={styles.goalProgressBar}>
                    <div 
                      className={styles.goalProgressFill}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className={styles.goalMetrics}>
                  <div className={styles.goalMetric}>
                    <span className={styles.metricLabel}>Contribuție lunară</span>
                    <span className={styles.metricValue}>
                      {goal.monthlyContribution.toLocaleString('ro-RO')} RON
                    </span>
                  </div>
                  <div className={styles.goalMetric}>
                    <span className={styles.metricLabel}>Deadline</span>
                    <span className={styles.metricValue}>
                      {new Date(goal.deadline).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                  {goal.status === 'active' && monthsToTarget !== Infinity && (
                    <div className={styles.goalMetric}>
                      <span className={styles.metricLabel}>Luni rămase</span>
                      <span className={styles.metricValue}>
                        {monthsToTarget} luni
                      </span>
                    </div>
                  )}
                </div>

                {goal.status === 'completed' && (
                  <div className={styles.completedBadge}>
                    ✅ Obiectiv Completat!
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Recommendations */}
        <div className={styles.aiRecommendations}>
          <h3>🤖 AI Recommendations</h3>
          <div className={styles.recommendationsList}>
            <div className={styles.recommendationCard}>
              <div className={styles.recommendationIcon}>💡</div>
              <div>
                <h4>Optimizează Emergency Fund</h4>
                <p>Poți accelera obiectivul cu 3 luni dacă creștești contribuția cu 500 RON/lună.</p>
                <button className={styles.recommendationAction}>Apply Suggestion</button>
              </div>
            </div>
            <div className={styles.recommendationCard}>
              <div className={styles.recommendationIcon}>📈</div>
              <div>
                <h4>Diversifică strategia pentru apartament</h4>
                <p>Investește 40% din economii în ETF-uri pentru randamente mai mari.</p>
                <button className={styles.recommendationAction}>Learn More</button>
              </div>
            </div>
            <div className={styles.recommendationCard}>
              <div className={styles.recommendationIcon}>🎯</div>
              <div>
                <h4>Nou obiectiv recomandat</h4>
                <p>Bazat pe pattern-urile tale, consideră un obiectiv pentru educație continuă.</p>
                <button className={styles.recommendationAction}>Create Goal</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Details Modal */}
      {selectedGoal && (
        <div className={styles.modalOverlay} onClick={() => setSelectedGoal(null)}>
          <div className={styles.goalModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{selectedGoal.title}</h3>
              <button 
                className={styles.closeModal}
                onClick={() => setSelectedGoal(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.goalModalContent}>
              <div className={styles.goalDetails}>
                <p>{selectedGoal.description}</p>
                
                <div className={styles.goalStats}>
                  <div className={styles.statGroup}>
                    <span className={styles.statLabel}>Progres</span>
                    <span className={styles.statValue}>
                      {calculateProgress(selectedGoal)}%
                    </span>
                  </div>
                  <div className={styles.statGroup}>
                    <span className={styles.statLabel}>Suma curentă</span>
                    <span className={styles.statValue}>
                      {selectedGoal.currentAmount.toLocaleString('ro-RO')} RON
                    </span>
                  </div>
                  <div className={styles.statGroup}>
                    <span className={styles.statLabel}>Target</span>
                    <span className={styles.statValue}>
                      {selectedGoal.targetAmount.toLocaleString('ro-RO')} RON
                    </span>
                  </div>
                  <div className={styles.statGroup}>
                    <span className={styles.statLabel}>Contribuție lunară</span>
                    <span className={styles.statValue}>
                      {selectedGoal.monthlyContribution.toLocaleString('ro-RO')} RON
                    </span>
                  </div>
                </div>

                <div className={styles.milestones}>
                  <h4>📍 Milestones</h4>
                  <div className={styles.milestonesList}>
                    {selectedGoal.milestones.map(milestone => (
                      <div 
                        key={milestone.id} 
                        className={`${styles.milestoneItem} ${milestone.completed ? styles.completedMilestone : ''}`}
                      >
                        <div className={styles.milestoneIcon}>
                          {milestone.completed ? '✅' : '⏳'}
                        </div>
                        <div className={styles.milestoneInfo}>
                          <span className={styles.milestoneTitle}>{milestone.title}</span>
                          <span className={styles.milestoneAmount}>
                            {milestone.targetAmount.toLocaleString('ro-RO')} RON
                          </span>
                          <span className={styles.milestoneDate}>
                            Target: {new Date(milestone.targetDate).toLocaleDateString('ro-RO')}
                          </span>
                          {milestone.completed && milestone.completedAt && (
                            <span className={styles.completedDate}>
                              Completat: {new Date(milestone.completedAt).toLocaleDateString('ro-RO')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.goalActions}>
                  <button className={styles.primaryAction}>
                    💰 Adaugă Contribuție
                  </button>
                  <button className={styles.secondaryAction}>
                    ✏️ Edit Goal
                  </button>
                  <button className={styles.secondaryAction}>
                    📊 View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.addModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>➕ Obiectiv Financiar Nou</h3>
              <button 
                className={styles.closeModal}
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.addModalContent}>
              <form className={styles.goalForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Nume obiectiv</label>
                    <input 
                      type="text" 
                      placeholder="ex: Vacanță în Bali"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Categorie</label>
                    <select className={styles.formSelect}>
                      <option value="savings">💰 Economii</option>
                      <option value="investment">📈 Investiție</option>
                      <option value="purchase">🛒 Cumpărătură</option>
                      <option value="debt">💳 Plată datorii</option>
                      <option value="retirement">🏖️ Pensie</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Suma țintă (RON)</label>
                    <input 
                      type="number" 
                      placeholder="15000"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Contribuție lunară (RON)</label>
                    <input 
                      type="number" 
                      placeholder="1000"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Deadline</label>
                    <input 
                      type="date" 
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Prioritate</label>
                    <select className={styles.formSelect}>
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Descriere</label>
                  <textarea 
                    placeholder="Detalii despre obiectiv..."
                    className={styles.formTextarea}
                    rows={3}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button 
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={styles.primaryAction}
                  >
                    🎯 Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}