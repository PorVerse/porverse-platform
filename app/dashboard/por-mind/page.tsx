// app/dashboard/por-mind/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './style.module.css';

// Types
interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'savings' | 'investment' | 'debt' | 'retirement';
  priority: 'low' | 'medium' | 'high';
  monthlyContribution: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  account: string;
}

interface Investment {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  value: number;
  gain: number;
  gainPercent: number;
  type: 'stock' | 'crypto' | 'etf' | 'bond';
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  icon: string;
  color: string;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'goal';
  title: string;
  description: string;
  action: string;
  impact: string;
  priority: number;
}

export default function PorMindDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [totalWealth, setTotalWealth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);

  // Mock Data States
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  // Load Mock Data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Financial Goals
      setFinancialGoals([
        {
          id: '1',
          title: 'Emergency Fund',
          targetAmount: 30000,
          currentAmount: 18500,
          deadline: '2025-12-31',
          category: 'savings',
          priority: 'high',
          monthlyContribution: 2000
        },
        {
          id: '2',
          title: 'Apartament nou',
          targetAmount: 150000,
          currentAmount: 45000,
          deadline: '2027-06-30',
          category: 'savings',
          priority: 'high',
          monthlyContribution: 3500
        },
        {
          id: '3',
          title: 'Pensie la 50 ani',
          targetAmount: 500000,
          currentAmount: 85000,
          deadline: '2042-01-01',
          category: 'retirement',
          priority: 'medium',
          monthlyContribution: 1500
        }
      ]);

      // Recent Transactions
      setRecentTransactions([
        {
          id: '1',
          description: 'Salariu Luna Ianuarie',
          amount: 8500,
          category: 'Salariu',
          date: '2025-01-15',
          type: 'income',
          account: 'BCR Principal'
        },
        {
          id: '2',
          description: 'Investiție ETF MSCI World',
          amount: -2000,
          category: 'Investiții',
          date: '2025-01-14',
          type: 'expense',
          account: 'Trading212'
        },
        {
          id: '3',
          description: 'Supermarket Kaufland',
          amount: -380,
          category: 'Mâncare',
          date: '2025-01-13',
          type: 'expense',
          account: 'BCR Principal'
        },
        {
          id: '4',
          description: 'Freelance Web Design',
          amount: 2500,
          category: 'Freelance',
          date: '2025-01-12',
          type: 'income',
          account: 'Revolut'
        },
        {
          id: '5',
          description: 'Benzină OMV',
          amount: -185,
          category: 'Transport',
          date: '2025-01-12',
          type: 'expense',
          account: 'BCR Principal'
        }
      ]);

      // Investments Portfolio
      setInvestments([
        {
          id: '1',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          shares: 25,
          buyPrice: 150,
          currentPrice: 185,
          value: 4625,
          gain: 875,
          gainPercent: 23.3,
          type: 'stock'
        },
        {
          id: '2',
          symbol: 'BTC',
          name: 'Bitcoin',
          shares: 0.5,
          buyPrice: 45000,
          currentPrice: 52000,
          value: 26000,
          gain: 3500,
          gainPercent: 15.6,
          type: 'crypto'
        },
        {
          id: '3',
          symbol: 'MSCI',
          name: 'MSCI World ETF',
          shares: 50,
          buyPrice: 95,
          currentPrice: 102,
          value: 5100,
          gain: 350,
          gainPercent: 7.4,
          type: 'etf'
        },
        {
          id: '4',
          symbol: 'ETH',
          name: 'Ethereum',
          shares: 8,
          buyPrice: 2200,
          currentPrice: 2850,
          value: 22800,
          gain: 5200,
          gainPercent: 29.5,
          type: 'crypto'
        }
      ]);

      // Budget Categories
      setBudgetCategories([
        {
          id: '1',
          name: 'Mâncare & Băuturi',
          budgeted: 1500,
          spent: 1180,
          remaining: 320,
          icon: '🍕',
          color: '#ef4444'
        },
        {
          id: '2',
          name: 'Transport',
          budgeted: 800,
          spent: 650,
          remaining: 150,
          icon: '🚗',
          color: '#f59e0b'
        },
        {
          id: '3',
          name: 'Distracție',
          budgeted: 600,
          spent: 420,
          remaining: 180,
          icon: '🎭',
          color: '#10b981'
        },
        {
          id: '4',
          name: 'Subscripții',
          budgeted: 200,
          spent: 185,
          remaining: 15,
          icon: '📱',
          color: '#8b5cf6'
        },
        {
          id: '5',
          name: 'Investiții',
          budgeted: 3000,
          spent: 2000,
          remaining: 1000,
          icon: '📈',
          color: '#06b6d4'
        }
      ]);

      // AI Insights
      setAiInsights([
        {
          id: '1',
          type: 'opportunity',
          title: 'Optimizează rata economisirii',
          description: 'Ai putea crește rata de economisire cu 8% dacă reduci cheltuielile cu mâncarea comandată.',
          action: 'Încearcă să gătești acasă 3 zile pe săptămână',
          impact: '+650 RON lunar',
          priority: 9
        },
        {
          id: '2',
          type: 'warning',
          title: 'Risc concentrare portfolio',
          description: '60% din investiții sunt în crypto. Recomand diversificare pentru reducerea riscului.',
          action: 'Investește în ETF-uri sau acțiuni stabile',
          impact: 'Risc redus cu 35%',
          priority: 8
        },
        {
          id: '3',
          type: 'goal',
          title: 'Emergency Fund aproape complet',
          description: 'Încă 11,500 RON și atingi target-ul pentru fondul de urgență!',
          action: 'Continuă contribuția lunară de 2000 RON',
          impact: 'Obiectiv atins în 6 luni',
          priority: 7
        }
      ]);

      // Calculate totals
      setTotalWealth(58525);
      setMonthlyIncome(11000);
      setMonthlyExpenses(6835);
      setSavingsRate(37.8);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const renderOverview = () => (
    <div className={styles.overviewGrid}>
      {/* Wealth Summary */}
      <div className={styles.wealthCard}>
        <div className={styles.cardHeader}>
          <h3>💰 Total Wealth</h3>
          <span className={styles.period}>Ianuarie 2025</span>
        </div>
        <div className={styles.wealthAmount}>
          {totalWealth.toLocaleString('ro-RO')} RON
        </div>
        <div className={styles.wealthChange}>
          <span className={styles.gainText}>+12.5% (+6,520 RON) luna aceasta</span>
        </div>
        <div className={styles.wealthBreakdown}>
          <div className={styles.breakdownItem}>
            <span>💳 Cash & Savings</span>
            <span>18,500 RON</span>
          </div>
          <div className={styles.breakdownItem}>
            <span>📈 Investments</span>
            <span>40,025 RON</span>
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow */}
      <div className={styles.cashFlowCard}>
        <div className={styles.cardHeader}>
          <h3>💸 Cash Flow Luna</h3>
        </div>
        <div className={styles.cashFlowGrid}>
          <div className={styles.flowItem}>
            <div className={styles.flowIcon}>⬆️</div>
            <div>
              <div className={styles.flowLabel}>Venituri</div>
              <div className={styles.flowAmount}>+{monthlyIncome.toLocaleString('ro-RO')} RON</div>
            </div>
          </div>
          <div className={styles.flowItem}>
            <div className={styles.flowIcon}>⬇️</div>
            <div>
              <div className={styles.flowLabel}>Cheltuieli</div>
              <div className={styles.flowAmount}>-{monthlyExpenses.toLocaleString('ro-RO')} RON</div>
            </div>
          </div>
          <div className={styles.flowItem}>
            <div className={styles.flowIcon}>💎</div>
            <div>
              <div className={styles.flowLabel}>Economii</div>
              <div className={styles.flowAmount}>+{(monthlyIncome - monthlyExpenses).toLocaleString('ro-RO')} RON</div>
            </div>
          </div>
        </div>
        <div className={styles.savingsRate}>
          <span>Rata economisire: <strong>{savingsRate}%</strong> 🎯</span>
        </div>
      </div>

      {/* Financial Goals Progress */}
      <div className={styles.goalsCard}>
        <div className={styles.cardHeader}>
          <h3>🎯 Obiective Financiare</h3>
          <Link href="/dashboard/por-mind/goals" className={styles.seeAll}>
            Vezi toate
          </Link>
        </div>
        <div className={styles.goalsList}>
          {financialGoals.slice(0, 2).map(goal => (
            <div key={goal.id} className={styles.goalItem}>
              <div className={styles.goalHeader}>
                <span className={styles.goalTitle}>{goal.title}</span>
                <span className={styles.goalPercent}>
                  {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                </span>
              </div>
              <div className={styles.goalProgress}>
                <div 
                  className={styles.goalFill}
                  style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                />
              </div>
              <div className={styles.goalDetails}>
                <span>{goal.currentAmount.toLocaleString('ro-RO')} / {goal.targetAmount.toLocaleString('ro-RO')} RON</span>
                <span>{goal.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className={styles.insightsCard}>
        <div className={styles.cardHeader}>
          <h3>🤖 AI Financial Advisor</h3>
          <button 
            className={styles.chatButton}
            onClick={() => setShowAIAdvisor(true)}
          >
            💬 Chat
          </button>
        </div>
        <div className={styles.insightsList}>
          {aiInsights.slice(0, 2).map(insight => (
            <div key={insight.id} className={`${styles.insightItem} ${styles[insight.type]}`}>
              <div className={styles.insightHeader}>
                <span className={styles.insightTitle}>{insight.title}</span>
                <span className={styles.insightImpact}>{insight.impact}</span>
              </div>
              <p className={styles.insightDesc}>{insight.description}</p>
              <div className={styles.insightAction}>
                💡 {insight.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.actionsCard}>
        <div className={styles.cardHeader}>
          <h3>⚡ Acțiuni Rapide</h3>
        </div>
        <div className={styles.actionGrid}>
          <Link href="/dashboard/por-mind/budgeting" className={styles.actionButton}>
            <span className={styles.actionIcon}>📊</span>
            <span>Budget Tracker</span>
          </Link>
          <Link href="/dashboard/por-mind/investing" className={styles.actionButton}>
            <span className={styles.actionIcon}>📈</span>
            <span>Portfolio</span>
          </Link>
          <button className={styles.actionButton} onClick={() => {}}>
            <span className={styles.actionIcon}>➕</span>
            <span>Add Transaction</span>
          </button>
          <button className={styles.actionButton} onClick={() => {}}>
            <span className={styles.actionIcon}>🎯</span>
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={styles.transactionsCard}>
        <div className={styles.cardHeader}>
          <h3>💳 Tranzacții Recente</h3>
          <Link href="/dashboard/por-mind/transactions" className={styles.seeAll}>
            Vezi toate
          </Link>
        </div>
        <div className={styles.transactionsList}>
          {recentTransactions.slice(0, 4).map(transaction => (
            <div key={transaction.id} className={styles.transactionItem}>
              <div className={styles.transactionMain}>
                <div className={styles.transactionInfo}>
                  <span className={styles.transactionDesc}>{transaction.description}</span>
                  <span className={styles.transactionMeta}>
                    {transaction.category} • {transaction.account}
                  </span>
                </div>
                <div className={`${styles.transactionAmount} ${transaction.type === 'income' ? styles.income : styles.expense}`}>
                  {transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString('ro-RO')} RON
                </div>
              </div>
              <div className={styles.transactionDate}>
                {new Date(transaction.date).toLocaleDateString('ro-RO')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBudget = () => (
    <div className={styles.budgetContainer}>
      <div className={styles.budgetHeader}>
        <h2>📊 Budget Tracker</h2>
        <div className={styles.budgetPeriod}>
          <span>Ianuarie 2025</span>
          <button className={styles.editBudget}>✏️ Edit</button>
        </div>
      </div>

      <div className={styles.budgetSummary}>
        <div className={styles.budgetStat}>
          <span className={styles.statLabel}>Total Bugetat</span>
          <span className={styles.statValue}>6,100 RON</span>
        </div>
        <div className={styles.budgetStat}>
          <span className={styles.statLabel}>Total Cheltuit</span>
          <span className={styles.statValue}>4,435 RON</span>
        </div>
        <div className={styles.budgetStat}>
          <span className={styles.statLabel}>Rămas</span>
          <span className={styles.statValue}>1,665 RON</span>
        </div>
      </div>

      <div className={styles.categoriesGrid}>
        {budgetCategories.map(category => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryName}>{category.name}</span>
            </div>
            <div className={styles.categoryProgress}>
              <div 
                className={styles.categoryFill}
                style={{ 
                  width: `${(category.spent / category.budgeted) * 100}%`,
                  backgroundColor: category.color
                }}
              />
            </div>
            <div className={styles.categoryStats}>
              <span>{category.spent} / {category.budgeted} RON</span>
              <span className={category.remaining > 0 ? styles.positive : styles.negative}>
                {category.remaining > 0 ? '+' : ''}{category.remaining} RON
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.spendingInsights}>
        <h3>📈 Insights Cheltuieli</h3>
        <div className={styles.insightGrid}>
          <div className={styles.insightBox}>
            <span className={styles.insightTitle}>Top Categorie</span>
            <span className={styles.insightValue}>Investiții (2,000 RON)</span>
          </div>
          <div className={styles.insightBox}>
            <span className={styles.insightTitle}>Cea mai economică</span>
            <span className={styles.insightValue}>Subscripții (15 RON rămas)</span>
          </div>
          <div className={styles.insightBox}>
            <span className={styles.insightTitle}>Predicție finală</span>
            <span className={styles.insightValue}>5,200 RON total luna</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvestments = () => (
    <div className={styles.investmentContainer}>
      <div className={styles.portfolioHeader}>
        <h2>📈 Portfolio Investiții</h2>
        <div className={styles.portfolioValue}>
          <span>Valoare totală: </span>
          <span className={styles.totalValue}>
            {investments.reduce((sum, inv) => sum + inv.value, 0).toLocaleString('ro-RO')} RON
          </span>
        </div>
      </div>

      <div className={styles.portfolioStats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Câștig</span>
          <span className={styles.statValue}>
            +{investments.reduce((sum, inv) => sum + inv.gain, 0).toLocaleString('ro-RO')} RON
          </span>
          <span className={styles.statPercent}>+18.7%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Cea mai bună performanță</span>
          <span className={styles.statValue}>ETH</span>
          <span className={styles.statPercent}>+29.5%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Diversificare</span>
          <span className={styles.statValue}>4 active</span>
          <span className={styles.statPercent}>Risc mediu</span>
        </div>
      </div>

      <div className={styles.investmentsList}>
        {investments.map(investment => (
          <div key={investment.id} className={styles.investmentItem}>
            <div className={styles.investmentInfo}>
              <div className={styles.investmentMain}>
                <span className={styles.investmentSymbol}>{investment.symbol}</span>
                <span className={styles.investmentName}>{investment.name}</span>
              </div>
              <div className={styles.investmentMeta}>
                <span>{investment.shares} {investment.type === 'crypto' ? 'coins' : 'shares'}</span>
                <span>@{investment.currentPrice.toLocaleString('ro-RO')} RON</span>
              </div>
            </div>
            <div className={styles.investmentNumbers}>
              <div className={styles.investmentValue}>
                {investment.value.toLocaleString('ro-RO')} RON
              </div>
              <div className={`${styles.investmentGain} ${investment.gain > 0 ? styles.positive : styles.negative}`}>
                {investment.gain > 0 ? '+' : ''}{investment.gain.toLocaleString('ro-RO')} RON ({investment.gainPercent}%)
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.investmentActions}>
        <button className={styles.primaryAction}>➕ Adaugă Investiție</button>
        <button className={styles.secondaryAction}>📊 Analiză AI</button>
        <button className={styles.secondaryAction}>⚖️ Rebalansare</button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        <h2>🧠 Analizez situația ta financiară...</h2>
        <p>Calculez portfoliul, bugetul și obiectivele tale</p>
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
            <button 
              className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className={styles.navIcon}>🏠</span>
              Dashboard
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'budget' ? styles.active : ''}`}
              onClick={() => setActiveTab('budget')}
            >
              <span className={styles.navIcon}>📊</span>
              Budget Tracker
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'investments' ? styles.active : ''}`}
              onClick={() => setActiveTab('investments')}
            >
              <span className={styles.navIcon}>📈</span>
              Investiții
            </button>
            <Link href="/dashboard/por-mind/goals" className={styles.navItem}>
              <span className={styles.navIcon}>🎯</span>
              Obiective
            </Link>
          </div>

          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>AI Tools</div>
            <button className={styles.navItem} onClick={() => setShowAIAdvisor(true)}>
              <span className={styles.navIcon}>🤖</span>
              AI Advisor
            </button>
            <button className={styles.navItem}>
              <span className={styles.navIcon}>📊</span>
              Analiză Risc
            </button>
            <button className={styles.navItem}>
              <span className={styles.navIcon}>🔮</span>
              Predicții
            </button>
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
          <h1>Financial Dashboard</h1>
          <p>
            Wealth score: <span className={styles.wealthScore}>87/100</span> • 
            Savings rate: <span className={styles.savingsScore}>{savingsRate}%</span>
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Net Worth</span>
              <span className={styles.statValue}>{totalWealth.toLocaleString('ro-RO')} RON</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Monthly Savings</span>
              <span className={styles.statValue}>{(monthlyIncome - monthlyExpenses).toLocaleString('ro-RO')} RON</span>
            </div>
          </div>
          <button className={styles.addButton} onClick={() => {}}>
            ➕ Add Transaction
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'budget' && renderBudget()}
        {activeTab === 'investments' && renderInvestments()}
      </div>

      {/* AI Advisor Modal */}
      {showAIAdvisor && (
        <div className={styles.modalOverlay} onClick={() => setShowAIAdvisor(false)}>
          <div className={styles.aiModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>🤖 AI Financial Advisor</h3>
              <button 
                className={styles.closeModal}
                onClick={() => setShowAIAdvisor(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.chatContainer}>
              <div className={styles.chatMessage}>
                <div className={styles.aiAvatar}>🤖</div>
                <div className={styles.messageContent}>
                  Salut! Sunt aici să te ajut cu finanțele tale. Văd că ai o rată de economisire de {savingsRate}%, ceea ce este excelent! 
                  
                  Ce te interesează astăzi?
                  <div className={styles.quickQuestions}>
                    <button>💰 Cum să economisesc mai mult?</button>
                    <button>📈 Strategii de investiții</button>
                    <button>🎯 Optimizare obiective</button>
                    <button>⚖️ Managementul riscului</button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Întreabă-mă orice despre finanțele tale..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Handle AI chat
                  }
                }}
              />
              <button>📤</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}