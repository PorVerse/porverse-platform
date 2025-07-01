// app/dashboard/por-mind/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './style.module.css'; // ✅ CSS Module import

// Types
interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  category: 'emergency' | 'investment' | 'debt' | 'purchase';
}

interface Investment {
  id: string;
  name: string;
  amount: number;
  currentValue: number;
  change: number;
  changePercent: number;
  type: 'stocks' | 'crypto' | 'bonds' | 'real-estate';
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  icon: string;
}

interface AIInsight {
  id: string;
  type: 'saving' | 'investing' | 'spending' | 'warning';
  title: string;
  message: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function PorMindDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [netWorth, setNetWorth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);

  // Mock data
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([
    {
      id: '1',
      name: 'Fondul de urgență',
      target: 30000,
      current: 18500,
      deadline: '2025-12-31',
      category: 'emergency'
    },
    {
      id: '2', 
      name: 'Apartament nou',
      target: 150000,
      current: 45000,
      deadline: '2027-06-30',
      category: 'purchase'
    },
    {
      id: '3',
      name: 'Portofoliu investiții',
      target: 100000,
      current: 23000,
      deadline: '2028-12-31',
      category: 'investment'
    }
  ]);

  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: '1',
      name: 'ETF World Index',
      amount: 15000,
      currentValue: 16200,
      change: 1200,
      changePercent: 8.0,
      type: 'stocks'
    },
    {
      id: '2',
      name: 'Bitcoin',
      amount: 5000,
      currentValue: 4200,
      change: -800,
      changePercent: -16.0,
      type: 'crypto'
    },
    {
      id: '3',
      name: 'Obligațiuni de stat',
      amount: 8000,
      currentValue: 8320,
      change: 320,
      changePercent: 4.0,
      type: 'bonds'
    }
  ]);

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    { id: '1', name: 'Hrană', budgeted: 2000, spent: 1750, icon: '🍽️' },
    { id: '2', name: 'Transport', budgeted: 800, spent: 920, icon: '🚗' },
    { id: '3', name: 'Distracție', budgeted: 1200, spent: 800, icon: '🎉' },
    { id: '4', name: 'Utilități', budgeted: 600, spent: 580, icon: '⚡' },
    { id: '5', name: 'Sănătate', budgeted: 400, spent: 250, icon: '🏥' },
    { id: '6', name: 'Educație', budgeted: 500, spent: 350, icon: '📚' }
  ]);

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Buget depășit la Transport',
      message: 'Ai cheltuit cu 120 RON mai mult decât planificat. Recomand să revizuiești rutele și să încerci transportul public.',
      action: 'Vezi detalii',
      priority: 'high'
    },
    {
      id: '2',
      type: 'saving',
      title: 'Oportunitate de economisire',
      message: 'Poți economisi 300 RON/lună dacă îți consolidezi abonamentele digitale și elimini duplicatele.',
      action: 'Optimizează',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'investing',
      title: 'Moment bun pentru investiții',
      message: 'Piața este în scădere temporară. Este o oportunitate să cumperi ETF-uri la preț redus.',
      action: 'Vezi opțiuni',
      priority: 'medium'
    }
  ]);

  // Simulate loading and data calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      const totalAssets = investments.reduce((sum, inv) => sum + inv.currentValue, 0) + 
                         financialGoals.reduce((sum, goal) => sum + goal.current, 0);
      const totalDebts = 0;
      
      setNetWorth(totalAssets - totalDebts);
      setMonthlyIncome(12000);
      
      const totalExpenses = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
      setMonthlyExpenses(totalExpenses);
      
      const savings = monthlyIncome - totalExpenses;
      setSavingsRate((savings / monthlyIncome) * 100);
      
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [investments, financialGoals, budgetCategories, monthlyIncome]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateGoalProgress = (goal: FinancialGoal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        <h2>Analizez datele tale financiare...</h2>
        <p>Calculez net worth, obiective și oportunități</p>
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

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Overview</div>
          <button 
            className={`${styles.navItem} ${activeView === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <span className={styles.navItemIcon}>📊</span>
            Dashboard
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'goals' ? styles.active : ''}`}
            onClick={() => setActiveView('goals')}
          >
            <span className={styles.navItemIcon}>🎯</span>
            Obiective
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'budget' ? styles.active : ''}`}
            onClick={() => setActiveView('budget')}
          >
            <span className={styles.navItemIcon}>💰</span>
            Buget
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'investments' ? styles.active : ''}`}
            onClick={() => setActiveView('investments')}
          >
            <span className={styles.navItemIcon}>📈</span>
            Investiții
          </button>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>AI Tools</div>
          <button 
            className={`${styles.navItem} ${activeView === 'coach' ? styles.active : ''}`}
            onClick={() => setActiveView('coach')}
          >
            <span className={styles.navItemIcon}>🤖</span>
            AI Coach
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'insights' ? styles.active : ''}`}
            onClick={() => setActiveView('insights')}
          >
            <span className={styles.navItemIcon}>💡</span>
            Insights
          </button>
        </div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Financial Dashboard</h1>
          <p>
            Net Worth: <span className={styles.netWorth}>{formatCurrency(netWorth)}</span> • 
            Savings Rate: <span className={styles.savingsRate}>{savingsRate.toFixed(1)}%</span>
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatCurrency(monthlyIncome)}</div>
              <div className={styles.statLabel}>Venit Lunar</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatCurrency(monthlyExpenses)}</div>
              <div className={styles.statLabel}>Cheltuieli</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.headerBtn}>⚙️</button>
            <button className={styles.headerBtn}>📊</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {activeView === 'overview' && (
          <>
            {/* Welcome Section */}
            <div className={styles.welcomeSection}>
              <h2>Bine ai venit în PorMind! 💰</h2>
              <p>
                Analiza ta financiară în timp real cu insights AI pentru maximizarea bogăției
              </p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>💎</div>
                <div className={styles.statInfo}>
                  <h3>Net Worth</h3>
                  <div className={styles.statValue}>{formatCurrency(netWorth)}</div>
                  <div className={`${styles.statChange} ${styles.positive}`}>+12.5% this month</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statInfo}>
                  <h3>Monthly Savings</h3>
                  <div className={styles.statValue}>{formatCurrency(monthlyIncome - monthlyExpenses)}</div>
                  <div className={`${styles.statChange} ${styles.positive}`}>+{savingsRate.toFixed(1)}% rate</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>📈</div>
                <div className={styles.statInfo}>
                  <h3>Investment Return</h3>
                  <div className={styles.statValue}>+8.2%</div>
                  <div className={`${styles.statChange} ${styles.positive}`}>Beating market</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statInfo}>
                  <h3>Goals Progress</h3>
                  <div className={styles.statValue}>64%</div>
                  <div className={`${styles.statChange} ${styles.positive}`}>On track</div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className={styles.aiInsightsSection}>
              <h3>💡 AI Financial Insights</h3>
              <div className={styles.insightsGrid}>
                {aiInsights.map(insight => (
                  <div 
                    key={insight.id} 
                    className={`${styles.insightCard} ${styles[insight.type]} ${insight.priority === 'high' ? styles.high : ''}`}
                  >
                    <div className={styles.insightHeader}>
                      <span className={styles.insightType}>
                        {insight.type === 'warning' && '⚠️'}
                        {insight.type === 'saving' && '💰'}
                        {insight.type === 'investing' && '📈'}
                        {insight.type === 'spending' && '💳'}
                      </span>
                      <h4>{insight.title}</h4>
                    </div>
                    <p>{insight.message}</p>
                    {insight.action && (
                      <button className={styles.insightAction}>
                        {insight.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActionsSection}>
              <h3>🚀 Quick Actions</h3>
              <div className={styles.quickActions}>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>💳</span>
                  Add Transaction
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>🎯</span>
                  Set New Goal
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>📊</span>
                  Review Budget
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>📈</span>
                  Check Investments
                </button>
              </div>
            </div>
          </>
        )}

        {activeView === 'goals' && (
          <div className={styles.dashboardSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🎯 Financial Goals</h2>
              <div className={styles.sectionActions}>
                <button className={styles.actionBtn}>Add Goal</button>
              </div>
            </div>
            
            <div className={styles.goalsGrid}>
              {financialGoals.map(goal => (
                <div key={goal.id} className={styles.goalCard}>
                  <div className={styles.goalHeader}>
                    <h4>{goal.name}</h4>
                    <span className={styles.goalCategory}>
                      {goal.category === 'emergency' && '🆘'}
                      {goal.category === 'investment' && '📈'}
                      {goal.category === 'purchase' && '🏠'}
                      {goal.category === 'debt' && '💳'}
                    </span>
                  </div>
                  <div className={styles.goalProgress}>
                    <div className={styles.goalProgressBar}>
                      <div 
                        className={styles.goalProgressFill}
                        style={{ width: `${calculateGoalProgress(goal)}%` }}
                      ></div>
                    </div>
                    <div className={styles.goalPercentage}>
                      {calculateGoalProgress(goal).toFixed(0)}%
                    </div>
                  </div>
                  <div className={styles.goalDetails}>
                    <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                    <span className={styles.goalDeadline}>Until {goal.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'budget' && (
          <div className={styles.dashboardSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>💰 Monthly Budget</h2>
              <div className={styles.sectionActions}>
                <button className={styles.actionBtn}>Edit Budget</button>
              </div>
            </div>
            
            <div className={styles.budgetOverview}>
              <div className={styles.budgetSummary}>
                <h3>Budget Summary</h3>
                <div className={styles.budgetStats}>
                  <div className={styles.budgetStat}>
                    <span>Total Budget</span>
                    <span className={styles.budgetAmount}>
                      {formatCurrency(budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0))}
                    </span>
                  </div>
                  <div className={styles.budgetStat}>
                    <span>Total Spent</span>
                    <span className={styles.spentAmount}>
                      {formatCurrency(budgetCategories.reduce((sum, cat) => sum + cat.spent, 0))}
                    </span>
                  </div>
                  <div className={styles.budgetStat}>
                    <span>Remaining</span>
                    <span className={styles.remainingAmount}>
                      {formatCurrency(budgetCategories.reduce((sum, cat) => sum + (cat.budgeted - cat.spent), 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'investments' && (
          <div className={styles.dashboardSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>📈 Investment Portfolio</h2>
              <div className={styles.sectionActions}>
                <button className={styles.actionBtn}>Add Investment</button>
              </div>
            </div>
            
            <div className={styles.portfolioOverview}>
              <div className={styles.portfolioSummary}>
                <h3>Total Portfolio Value</h3>
                <div className={styles.portfolioValue}>
                  {formatCurrency(investments.reduce((sum, inv) => sum + inv.currentValue, 0))}
                </div>
                <div className={styles.portfolioChange}>
                  +{((investments.reduce((sum, inv) => sum + inv.change, 0) / 
                      investments.reduce((sum, inv) => sum + inv.amount, 0)) * 100).toFixed(1)}% Total Return
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'coach' && (
          <div className={styles.aiCoachSection}>
            <div className={styles.coachHeader}>
              <h2>🤖 Warren AI - Financial Coach</h2>
              <p>Întreabă-mă orice despre finanțele tale. Sunt aici să te ajut!</p>
            </div>
            
            <div className={styles.coachInterface}>
              <div className={styles.coachChat}>
                <div className={styles.chatMessage}>
                  <div className={styles.aiAvatar}>🤖</div>
                  <div className={styles.messageContent}>
                    <p>
                      Salut! Am analizat situația ta financiară și observ că ai un savings rate excelent de {savingsRate.toFixed(1)}%. 
                      Însă văd că poți optimiza câteva lucruri...
                    </p>
                    <div className={styles.messageTime}>Acum 2 minute</div>
                  </div>
                </div>
              </div>
              
              <div className={styles.coachActions}>
                <button className={styles.coachBtn}>
                  Analizează bugetul meu complet
                </button>
                <button className={styles.coachBtn}>
                  Strategii pentru investiții în 2025
                </button>
                <button className={styles.coachBtn}>
                  Cum îmi optimizez taxele?
                </button>
                <button className={styles.coachBtn}>
                  Plan pentru independența financiară
                </button>
              </div>
              
              <div className={styles.chatInput}>
                <input 
                  type="text" 
                  className={styles.chatInputField}
                  placeholder="Întreabă-mă orice despre finanțe..."
                />
                <button className={styles.sendBtn}>Trimite</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}