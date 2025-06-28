'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './style.css';  // ✅ CORECT - CSS normal// Types
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

  // Mock data - în real ar veni de la API
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
      // Calculate financial metrics
      const totalAssets = investments.reduce((sum, inv) => sum + inv.currentValue, 0) + 
                         financialGoals.reduce((sum, goal) => sum + goal.current, 0);
      const totalDebts = 0; // Mock - în real ar veni din API
      
      setNetWorth(totalAssets - totalDebts);
      setMonthlyIncome(12000); // Mock
      
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

  const generateAIRecommendation = () => {
    const recommendations = [
      "💡 Bazat pe analiza ta financiară, recomand să aloci 20% din surplus către fondul de urgență și 60% către investiții ETF.",
      "🎯 Pentru a atinge obiectivul apartamentului, ai nevoie să economisești 2,900 RON/lună suplimentar.",
      "📈 Portofoliul tău are o alocare bună, dar consideră să diversifici cu 10% obligațiuni pentru stabilitate.",
      "⚠️ Cheltuielile la transport sunt în creștere. Analizează alternative: abonament lunar sau car sharing.",
      "🚀 Ai potential să îți mărești veniturile cu 2,000 RON/lună prin skill-uri suplimentare în domeniul tău."
    ];
    
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner}></div>
          <h2>Calculez situația ta financiară...</h2>
          <p>Analizez veniturile, cheltuielile și investițiile</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* SIDEBAR */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Link href="/" className={styles.logo}>🧠 PorMind</Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Dashboard</div>
          <button 
            className={`${styles.navItem} ${activeView === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <span className={styles.navItemIcon}>📊</span>
            Prezentare generală
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'budget' ? styles.active : ''}`}
            onClick={() => setActiveView('budget')}
          >
            <span className={styles.navItemIcon}>💰</span>
            Buget & Cheltuieli
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'investments' ? styles.active : ''}`}
            onClick={() => setActiveView('investments')}
          >
            <span className={styles.navItemIcon}>📈</span>
            Investiții
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'goals' ? styles.active : ''}`}
            onClick={() => setActiveView('goals')}
          >
            <span className={styles.navItemIcon}>🎯</span>
            Obiective financiare
          </button>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>AI Tools</div>
          <button 
            className={`${styles.navItem} ${activeView === 'coach' ? styles.active : ''}`}
            onClick={() => setActiveView('coach')}
          >
            <span className={styles.navItemIcon}>🤖</span>
            AI Money Coach
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'optimizer' ? styles.active : ''}`}
            onClick={() => setActiveView('optimizer')}
          >
            <span className={styles.navItemIcon}>⚡</span>
            Budget Optimizer
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'analyzer' ? styles.active : ''}`}
            onClick={() => setActiveView('analyzer')}
          >
            <span className={styles.navItemIcon}>🔍</span>
            Spending Analyzer
          </button>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Education</div>
          <button 
            className={`${styles.navItem} ${activeView === 'learn' ? styles.active : ''}`}
            onClick={() => setActiveView('learn')}
          >
            <span className={styles.navItemIcon}>🎓</span>
            Financial Learning
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'mindset' ? styles.active : ''}`}
            onClick={() => setActiveView('mindset')}
          >
            <span className={styles.navItemIcon}>🧘</span>
            Money Mindset
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>💎 Wealth Builder Dashboard</h1>
          <p>Valoarea netă: <span className={styles.netWorth}>{formatCurrency(netWorth)}</span> • Rata economisire: <span className={styles.savingsRate}>{savingsRate.toFixed(1)}%</span></p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatCurrency(monthlyIncome)}</div>
              <div className={styles.statLabel}>Venituri luna</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatCurrency(monthlyExpenses)}</div>
              <div className={styles.statLabel}>Cheltuieli luna</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{formatCurrency(monthlyIncome - monthlyExpenses)}</div>
              <div className={styles.statLabel}>Surplus</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.headerBtn} title="Notificări">🔔</button>
            <button className={styles.headerBtn} title="Setări">⚙️</button>
            <button className={styles.headerBtn} title="Profil">👤</button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        {activeView === 'overview' && (
          <>
            {/* Welcome Section */}
            <section className={styles.welcomeSection}>
              <h2>🌟 Bună ziua, Alex!</h2>
              <p>Astăzi ai o oportunitate să îți optimizezi portofoliul. Situația financiară arată promițător!</p>
            </section>

            {/* Quick Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statInfo}>
                  <h3>Valoare netă</h3>
                  <div className={styles.statValue}>{formatCurrency(netWorth)}</div>
                  <div className={styles.statChange}>+12.5% față de luna trecută</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>📈</div>
                <div className={styles.statInfo}>
                  <h3>ROI Investiții</h3>
                  <div className={styles.statValue}>+8.2%</div>
                  <div className={styles.statChange}>Performanță anuală</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statInfo}>
                  <h3>Obiective</h3>
                  <div className={styles.statValue}>3/5</div>
                  <div className={styles.statChange}>În progres</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>💳</div>
                <div className={styles.statInfo}>
                  <h3>Credit Score</h3>
                  <div className={styles.statValue}>795</div>
                  <div className={styles.statChange}>Excelent</div>
                </div>
              </div>
            </div>

            {/* AI Insights Section */}
            <section className={styles.aiInsightsSection}>
              <h3>🤖 AI Financial Insights</h3>
              <div className={styles.insightsGrid}>
                {aiInsights.map(insight => (
                  <div key={insight.id} className={`${styles.insightCard} ${styles[insight.type]} ${styles[insight.priority]}`}>
                    <div className={styles.insightHeader}>
                      <span className={styles.insightType}>
                        {insight.type === 'warning' && '⚠️'}
                        {insight.type === 'saving' && '💡'}
                        {insight.type === 'investing' && '📈'}
                        {insight.type === 'spending' && '💳'}
                      </span>
                      <h4>{insight.title}</h4>
                    </div>
                    <p>{insight.message}</p>
                    {insight.action && (
                      <button className={styles.insightAction}>{insight.action}</button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className={styles.quickActionsSection}>
              <h3>⚡ Quick Actions</h3>
              <div className={styles.quickActions}>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>📊</span>
                  Generează raport lunar
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>💰</span>
                  Adaugă venit/cheltuială
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>🎯</span>
                  Creează obiectiv nou
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>📈</span>
                  Analizează investiții
                </button>
              </div>
            </section>

            {/* Financial Goals Progress */}
            <section className={styles.goalsSection}>
              <h3>🎯 Progres Obiective Financiare</h3>
              <div className={styles.goalsGrid}>
                {financialGoals.map(goal => (
                  <div key={goal.id} className={styles.goalCard}>
                    <div className={styles.goalHeader}>
                      <h4>{goal.name}</h4>
                      <span className={styles.goalCategory}>
                        {goal.category === 'emergency' && '🚨'}
                        {goal.category === 'investment' && '📈'}
                        {goal.category === 'debt' && '💳'}
                        {goal.category === 'purchase' && '🏠'}
                      </span>
                    </div>
                    <div className={styles.goalProgress}>
                      <div className={styles.goalProgressBar}>
                        <div 
                          className={styles.goalProgressFill}
                          style={{ width: `${calculateGoalProgress(goal)}%` }}
                        ></div>
                      </div>
                      <span className={styles.goalPercentage}>{calculateGoalProgress(goal).toFixed(1)}%</span>
                    </div>
                    <div className={styles.goalDetails}>
                      <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                      <span className={styles.goalDeadline}>Deadline: {new Date(goal.deadline).toLocaleDateString('ro-RO')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === 'coach' && (
          <section className={styles.aiCoachSection}>
            <div className={styles.coachHeader}>
              <h2>🤖 AI Money Coach</h2>
              <p>Consilierul tău personal pentru educație financiară și luarea deciziilor</p>
            </div>

            <div className={styles.coachInterface}>
              <div className={styles.coachChat}>
                <div className={styles.chatMessage}>
                  <div className={styles.aiAvatar}>🤖</div>
                  <div className={styles.messageContent}>
                    <p>{generateAIRecommendation()}</p>
                    <span className={styles.messageTime}>Acum 2 minute</span>
                  </div>
                </div>
              </div>

              <div className={styles.coachActions}>
                <button className={styles.coachBtn}>Analizează situația mea financiară</button>
                <button className={styles.coachBtn}>Ce investiții îmi recomanzi?</button>
                <button className={styles.coachBtn}>Cum să îmi optimizez bugetul?</button>
                <button className={styles.coachBtn}>Strategii de economisire</button>
              </div>

              <div className={styles.chatInput}>
                <input 
                  type="text" 
                  placeholder="Întreabă AI Money Coach orice despre finanțe..."
                  className={styles.chatInputField}
                />
                <button className={styles.sendBtn}>Trimite</button>
              </div>
            </div>
          </section>
        )}

        {activeView === 'budget' && (
          <section className={styles.budgetSection}>
            <h2>💰 Budget & Spending Analysis</h2>
            
            <div className={styles.budgetOverview}>
              <div className={styles.budgetSummary}>
                <h3>Rezumat luna curentă</h3>
                <div className={styles.budgetStats}>
                  <div className={styles.budgetStat}>
                    <span>Total bugetat:</span>
                    <span className={styles.budgetAmount}>{formatCurrency(budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0))}</span>
                  </div>
                  <div className={styles.budgetStat}>
                    <span>Total cheltuit:</span>
                    <span className={styles.spentAmount}>{formatCurrency(budgetCategories.reduce((sum, cat) => sum + cat.spent, 0))}</span>
                  </div>
                  <div className={styles.budgetStat}>
                    <span>Rămas:</span>
                    <span className={styles.remainingAmount}>{formatCurrency(budgetCategories.reduce((sum, cat) => sum + (cat.budgeted - cat.spent), 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.categoriesGrid}>
              {budgetCategories.map(category => {
                const percentage = (category.spent / category.budgeted) * 100;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={category.id} className={`${styles.categoryCard} ${isOverBudget ? styles.overBudget : ''}`}>
                    <div className={styles.categoryHeader}>
                      <span className={styles.categoryIcon}>{category.icon}</span>
                      <h4>{category.name}</h4>
                    </div>
                    <div className={styles.categoryAmount}>
                      <span className={styles.spent}>{formatCurrency(category.spent)}</span>
                      <span className={styles.budgeted}>/ {formatCurrency(category.budgeted)}</span>
                    </div>
                    <div className={styles.categoryProgress}>
                      <div className={styles.categoryProgressBar}>
                        <div 
                          className={`${styles.categoryProgressFill} ${isOverBudget ? styles.overBudgetFill : ''}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`${styles.categoryPercentage} ${isOverBudget ? styles.overBudgetText : ''}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    {isOverBudget && (
                      <div className={styles.overBudgetWarning}>
                        ⚠️ Depășit cu {formatCurrency(category.spent - category.budgeted)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeView === 'investments' && (
          <section className={styles.investmentsSection}>
            <h2>📈 Portofoliu Investiții</h2>
            
            <div className={styles.portfolioOverview}>
              <div className={styles.portfolioSummary}>
                <h3>Valoare totală portofoliu</h3>
                <div className={styles.portfolioValue}>
                  {formatCurrency(investments.reduce((sum, inv) => sum + inv.currentValue, 0))}
                </div>
                <div className={styles.portfolioChange}>
                  +{formatCurrency(investments.reduce((sum, inv) => sum + inv.change, 0))} 
                  ({((investments.reduce((sum, inv) => sum + inv.change, 0) / investments.reduce((sum, inv) => sum + inv.amount, 0)) * 100).toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className={styles.investmentsGrid}>
              {investments.map(investment => (
                <div key={investment.id} className={styles.investmentCard}>
                  <div className={styles.investmentHeader}>
                    <h4>{investment.name}</h4>
                    <span className={styles.investmentType}>
                      {investment.type === 'stocks' && '📊'}
                      {investment.type === 'crypto' && '₿'}
                      {investment.type === 'bonds' && '🏛️'}
                      {investment.type === 'real-estate' && '🏠'}
                    </span>
                  </div>
                  
                  <div className={styles.investmentValue}>
                    <div className={styles.currentValue}>{formatCurrency(investment.currentValue)}</div>
                    <div className={styles.originalValue}>din {formatCurrency(investment.amount)}</div>
                  </div>
                  
                  <div className={`${styles.investmentChange} ${investment.change >= 0 ? styles.positive : styles.negative}`}>
                    <span>{investment.change >= 0 ? '+' : ''}{formatCurrency(investment.change)}</span>
                    <span>({investment.changePercent >= 0 ? '+' : ''}{investment.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.investmentActions}>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>💰</span>
                Adaugă investiție nouă
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>📊</span>
                Rebalansează portofoliul
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>🎯</span>
                Setează target profit
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}