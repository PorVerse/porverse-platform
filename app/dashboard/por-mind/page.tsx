'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './style.css';  // ✅ CORECT - CSS normal

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
      <div className="dashboard">
        <div className="loadingScreen">
          <div className="loadingSpinner"></div>
          <h2>Calculez situația ta financiară...</h2>
          <p>Analizez veniturile, cheltuielile și investițiile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <nav className="sidebar">
        <div className="sidebarLogo">
          <Link href="/" className="logo">🧠 PorMind</Link>
        </div>

        <div className="navSection">
          <div className="navSectionTitle">Dashboard</div>
          <button 
            className={`navItem ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <span className="navItemIcon">📊</span>
            Prezentare generală
          </button>
          <button 
            className={`navItem ${activeView === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveView('budget')}
          >
            <span className="navItemIcon">💰</span>
            Buget & Cheltuieli
          </button>
          <button 
            className={`navItem ${activeView === 'investments' ? 'active' : ''}`}
            onClick={() => setActiveView('investments')}
          >
            <span className="navItemIcon">📈</span>
            Investiții
          </button>
          <button 
            className={`navItem ${activeView === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveView('goals')}
          >
            <span className="navItemIcon">🎯</span>
            Obiective financiare
          </button>
        </div>

        <div className="navSection">
          <div className="navSectionTitle">AI Tools</div>
          <button 
            className={`navItem ${activeView === 'coach' ? 'active' : ''}`}
            onClick={() => setActiveView('coach')}
          >
            <span className="navItemIcon">🤖</span>
            AI Money Coach
          </button>
          <button 
            className={`navItem ${activeView === 'optimizer' ? 'active' : ''}`}
            onClick={() => setActiveView('optimizer')}
          >
            <span className="navItemIcon">⚡</span>
            Budget Optimizer
          </button>
          <button 
            className={`navItem ${activeView === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveView('analyzer')}
          >
            <span className="navItemIcon">🔍</span>
            Spending Analyzer
          </button>
        </div>

        <div className="navSection">
          <div className="navSectionTitle">Education</div>
          <button 
            className={`navItem ${activeView === 'learn' ? 'active' : ''}`}
            onClick={() => setActiveView('learn')}
          >
            <span className="navItemIcon">🎓</span>
            Financial Learning
          </button>
          <button 
            className={`navItem ${activeView === 'mindset' ? 'active' : ''}`}
            onClick={() => setActiveView('mindset')}
          >
            <span className="navItemIcon">🧘</span>
            Money Mindset
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header className="header">
        <div className="headerLeft">
          <h1>💎 Wealth Builder Dashboard</h1>
          <p>Valoarea netă: <span className="netWorth">{formatCurrency(netWorth)}</span> • Rata economisire: <span className="savingsRate">{savingsRate.toFixed(1)}%</span></p>
        </div>
        <div className="headerRight">
          <div className="headerStats">
            <div className="statItem">
              <div className="statValue">{formatCurrency(monthlyIncome)}</div>
              <div className="statLabel">Venituri luna</div>
            </div>
            <div className="statItem">
              <div className="statValue">{formatCurrency(monthlyExpenses)}</div>
              <div className="statLabel">Cheltuieli luna</div>
            </div>
            <div className="statItem">
              <div className="statValue">{formatCurrency(monthlyIncome - monthlyExpenses)}</div>
              <div className="statLabel">Surplus</div>
            </div>
          </div>
          <div className="headerActions">
            <button className="headerBtn" title="Notificări">🔔</button>
            <button className="headerBtn" title="Setări">⚙️</button>
            <button className="headerBtn" title="Profil">👤</button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mainContent">
        {activeView === 'overview' && (
          <>
            {/* Welcome Section */}
            <section className="welcomeSection">
              <h2>🌟 Bună ziua, Alex!</h2>
              <p>Astăzi ai o oportunitate să îți optimizezi portofoliul. Situația financiară arată promițător!</p>
            </section>

            {/* Quick Stats Grid */}
            <div className="statsGrid">
              <div className="statCard">
                <div className="statIcon">💰</div>
                <div className="statInfo">
                  <h3>Valoare netă</h3>
                  <div className="statValue">{formatCurrency(netWorth)}</div>
                  <div className="statChange">+12.5% față de luna trecută</div>
                </div>
              </div>

              <div className="statCard">
                <div className="statIcon">📈</div>
                <div className="statInfo">
                  <h3>ROI Investiții</h3>
                  <div className="statValue">+8.2%</div>
                  <div className="statChange">Performanță anuală</div>
                </div>
              </div>

              <div className="statCard">
                <div className="statIcon">🎯</div>
                <div className="statInfo">
                  <h3>Obiective</h3>
                  <div className="statValue">3/5</div>
                  <div className="statChange">În progres</div>
                </div>
              </div>

              <div className="statCard">
                <div className="statIcon">💳</div>
                <div className="statInfo">
                  <h3>Credit Score</h3>
                  <div className="statValue">795</div>
                  <div className="statChange">Excelent</div>
                </div>
              </div>
            </div>

            {/* AI Insights Section */}
            <section className="aiInsightsSection">
              <h3>🤖 AI Financial Insights</h3>
              <div className="insightsGrid">
                {aiInsights.map(insight => (
                  <div key={insight.id} className={`insightCard ${insight.type} ${insight.priority}`}>
                    <div className="insightHeader">
                      <span className="insightType">
                        {insight.type === 'warning' && '⚠️'}
                        {insight.type === 'saving' && '💡'}
                        {insight.type === 'investing' && '📈'}
                        {insight.type === 'spending' && '💳'}
                      </span>
                      <h4>{insight.title}</h4>
                    </div>
                    <p>{insight.message}</p>
                    {insight.action && (
                      <button className="insightAction">{insight.action}</button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="quickActionsSection">
              <h3>⚡ Quick Actions</h3>
              <div className="quickActions">
                <button className="actionBtn">
                  <span className="actionIcon">📊</span>
                  Generează raport lunar
                </button>
                <button className="actionBtn">
                  <span className="actionIcon">💰</span>
                  Adaugă venit/cheltuială
                </button>
                <button className="actionBtn">
                  <span className="actionIcon">🎯</span>
                  Creează obiectiv nou
                </button>
                <button className="actionBtn">
                  <span className="actionIcon">📈</span>
                  Analizează investiții
                </button>
              </div>
            </section>

            {/* Financial Goals Progress */}
            <section className="goalsSection">
              <h3>🎯 Progres Obiective Financiare</h3>
              <div className="goalsGrid">
                {financialGoals.map(goal => (
                  <div key={goal.id} className="goalCard">
                    <div className="goalHeader">
                      <h4>{goal.name}</h4>
                      <span className="goalCategory">
                        {goal.category === 'emergency' && '🚨'}
                        {goal.category === 'investment' && '📈'}
                        {goal.category === 'debt' && '💳'}
                        {goal.category === 'purchase' && '🏠'}
                      </span>
                    </div>
                    <div className="goalProgress">
                      <div className="goalProgressBar">
                        <div 
                          className="goalProgressFill"
                          style={{ width: `${calculateGoalProgress(goal)}%` }}
                        ></div>
                      </div>
                      <span className="goalPercentage">{calculateGoalProgress(goal).toFixed(1)}%</span>
                    </div>
                    <div className="goalDetails">
                      <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                      <span className="goalDeadline">Deadline: {new Date(goal.deadline).toLocaleDateString('ro-RO')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === 'coach' && (
          <section className="aiCoachSection">
            <div className="coachHeader">
              <h2>🤖 AI Money Coach</h2>
              <p>Consilierul tău personal pentru educație financiară și luarea deciziilor</p>
            </div>

            <div className="coachInterface">
              <div className="coachChat">
                <div className="chatMessage">
                  <div className="aiAvatar">🤖</div>
                  <div className="messageContent">
                    <p>{generateAIRecommendation()}</p>
                    <span className="messageTime">Acum 2 minute</span>
                  </div>
                </div>
              </div>

              <div className="coachActions">
                <button className="coachBtn">Analizează situația mea financiară</button>
                <button className="coachBtn">Ce investiții îmi recomanzi?</button>
                <button className="coachBtn">Cum să îmi optimizez bugetul?</button>
                <button className="coachBtn">Strategii de economisire</button>
              </div>

              <div className="chatInput">
                <input 
                  type="text" 
                  placeholder="Întreabă AI Money Coach orice despre finanțe..."
                  className="chatInputField"
                />
                <button className="sendBtn">Trimite</button>
              </div>
            </div>
          </section>
        )}

        {activeView === 'budget' && (
          <section className="budgetSection">
            <h2>💰 Budget & Spending Analysis</h2>
            
            <div className="budgetOverview">
              <div className="budgetSummary">
                <h3>Rezumat luna curentă</h3>
                <div className="budgetStats">
                  <div className="budgetStat">
                    <span>Total bugetat:</span>
                    <span className="budgetAmount">{formatCurrency(budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0))}</span>
                  </div>
                  <div className="budgetStat">
                    <span>Total cheltuit:</span>
                    <span className="spentAmount">{formatCurrency(budgetCategories.reduce((sum, cat) => sum + cat.spent, 0))}</span>
                  </div>
                  <div className="budgetStat">
                    <span>Rămas:</span>
                    <span className="remainingAmount">{formatCurrency(budgetCategories.reduce((sum, cat) => sum + (cat.budgeted - cat.spent), 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="categoriesGrid">
              {budgetCategories.map(category => {
                const percentage = (category.spent / category.budgeted) * 100;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={category.id} className={`categoryCard ${isOverBudget ? 'overBudget' : ''}`}>
                    <div className="categoryHeader">
                      <span className="categoryIcon">{category.icon}</span>
                      <h4>{category.name}</h4>
                    </div>
                    <div className="categoryAmount">
                      <span className="spent">{formatCurrency(category.spent)}</span>
                      <span className="budgeted">/ {formatCurrency(category.budgeted)}</span>
                    </div>
                    <div className="categoryProgress">
                      <div className="categoryProgressBar">
                        <div 
                          className={`categoryProgressFill ${isOverBudget ? 'overBudgetFill' : ''}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`categoryPercentage ${isOverBudget ? 'overBudgetText' : ''}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    {isOverBudget && (
                      <div className="overBudgetWarning">
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
          <section className="investmentsSection">
            <h2>📈 Portofoliu Investiții</h2>
            
            <div className="portfolioOverview">
              <div className="portfolioSummary">
                <h3>Valoare totală portofoliu</h3>
                <div className="portfolioValue">
                  {formatCurrency(investments.reduce((sum, inv) => sum + inv.currentValue, 0))}
                </div>
                <div className="portfolioChange">
                  +{formatCurrency(investments.reduce((sum, inv) => sum + inv.change, 0))} 
                  ({((investments.reduce((sum, inv) => sum + inv.change, 0) / investments.reduce((sum, inv) => sum + inv.amount, 0)) * 100).toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className="investmentsGrid">
              {investments.map(investment => (
                <div key={investment.id} className="investmentCard">
                  <div className="investmentHeader">
                    <h4>{investment.name}</h4>
                    <span className="investmentType">
                      {investment.type === 'stocks' && '📊'}
                      {investment.type === 'crypto' && '₿'}
                      {investment.type === 'bonds' && '🏛️'}
                      {investment.type === 'real-estate' && '🏠'}
                    </span>
                  </div>
                  
                  <div className="investmentValue">
                    <div className="currentValue">{formatCurrency(investment.currentValue)}</div>
                    <div className="originalValue">din {formatCurrency(investment.amount)}</div>
                  </div>
                  
                  <div className={`investmentChange ${investment.change >= 0 ? 'positive' : 'negative'}`}>
                    <span>{investment.change >= 0 ? '+' : ''}{formatCurrency(investment.change)}</span>
                    <span>({investment.changePercent >= 0 ? '+' : ''}{investment.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="investmentActions">
              <button className="actionBtn">
                <span className="actionIcon">💰</span>
                Adaugă investiție nouă
              </button>
              <button className="actionBtn">
                <span className="actionIcon">📊</span>
                Rebalansează portofoliul
              </button>
              <button className="actionBtn">
                <span className="actionIcon">🎯</span>
                Setează target profit
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}