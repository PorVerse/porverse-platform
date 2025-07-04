// app/dashboard/por-mind/budgeting/page.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '../style.module.css';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  icon: string;
  color: string;
  suggestions?: string[];
}

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface BudgetAnalysis {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  categories: BudgetCategory[];
  goals: FinancialGoal[];
  aiInsights: string[];
  optimizationSuggestions: string[];
}

export default function BudgetOptimizer() {
  const [budget, setBudget] = useState<BudgetAnalysis | null>(null);
  const [income, setIncome] = useState<number>(5000);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'goals'>('overview');

  const generateBudgetAnalysis = async () => {
    setLoading(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockCategories: BudgetCategory[] = [
        {
          id: '1',
          name: 'Locuință',
          allocated: income * 0.30,
          spent: income * 0.28,
          icon: '🏠',
          color: '#10b981',
          suggestions: [
            'Ești sub limita recomandată de 30% din venit',
            'Consideră refinanțarea creditului dacă ai dobândă mare',
            'Verifică facturile utilităților pentru optimizări'
          ]
        },
        {
          id: '2',
          name: 'Alimentație',
          allocated: income * 0.15,
          spent: income * 0.18,
          icon: '🍽️',
          color: '#f59e0b',
          suggestions: [
            'Depășești bugetul cu 20% - planifică mai atent mesele',
            'Meal prep-ul poate reduce costurile cu 30%',
            'Limitează restaurantele la 2-3 ieșiri pe săptămână'
          ]
        },
        {
          id: '3',
          name: 'Transport',
          allocated: income * 0.12,
          spent: income * 0.10,
          icon: '🚗',
          color: '#3b82f6',
          suggestions: [
            'Excelent control al costurilor de transport',
            'Consideră car sharing pentru economii suplimentare',
            'Verifică asigurarea auto pentru tarife mai bune'
          ]
        },
        {
          id: '4',
          name: 'Economii',
          allocated: income * 0.20,
          spent: income * 0.22,
          icon: '💰',
          color: '#8b5cf6',
          suggestions: [
            'Felicitări! Economisești peste target',
            'Consideră investiții în fonduri indexate',
            'Deschide un cont de economii cu dobândă mai mare'
          ]
        },
        {
          id: '5',
          name: 'Entertainment',
          allocated: income * 0.10,
          spent: income * 0.12,
          icon: '🎭',
          color: '#ec4899',
          suggestions: [
            'Ușor peste buget - caută alternative gratuite',
            'Abonamentele se pot optimiza prin bundling',
            'Rezervă o seară pe săptămână pentru activități gratuite'
          ]
        },
        {
          id: '6',
          name: 'Sănătate',
          allocated: income * 0.08,
          spent: income * 0.06,
          icon: '⚕️',
          color: '#06b6d4',
          suggestions: [
            'Buget bun pentru sănătate',
            'Investește în prevenție pentru economii pe termen lung',
            'Verifică dacă asigurarea de sănătate e optimală'
          ]
        }
      ];

      const mockGoals: FinancialGoal[] = [
        {
          id: '1',
          name: 'Fond de Urgență',
          targetAmount: income * 6,
          currentAmount: income * 3.5,
          deadline: '2025-12-31',
          priority: 'high'
        },
        {
          id: '2',
          name: 'Vacanță în Japonia',
          targetAmount: 8000,
          currentAmount: 2400,
          deadline: '2026-06-01',
          priority: 'medium'
        },
        {
          id: '3',
          name: 'Avans Apartament',
          targetAmount: 50000,
          currentAmount: 12000,
          deadline: '2027-01-01',
          priority: 'high'
        }
      ];

      const totalExpenses = mockCategories
        .filter(cat => cat.name !== 'Economii')
        .reduce((sum, cat) => sum + cat.spent, 0);
      
      const totalSavings = mockCategories
        .find(cat => cat.name === 'Economii')?.spent || 0;

      const analysis: BudgetAnalysis = {
        totalIncome: income,
        totalExpenses,
        totalSavings,
        savingsRate: (totalSavings / income) * 100,
        categories: mockCategories,
        goals: mockGoals,
        aiInsights: [
          `Rata ta de economisire (${((totalSavings / income) * 100).toFixed(1)}%) este peste media națională de 15%`,
          'Categoria alimentație necesită atenție - depășești bugetul cu 20%',
          'Excelent control al costurilor de transport și locuință',
          'Fondul de urgență este pe drumul cel bun - mai ai nevoie de 58% din obiectiv',
          'Consideră automatizarea economiilor pentru consistență'
        ],
        optimizationSuggestions: [
          'Reduce costurile alimentației prin meal planning și gătit acasă',
          'Automatizează transferul către economii în ziua de salariu',
          'Revizuiește abonamentele lunare - multe pot fi optimize sau anulate',
          'Consideră o sursă suplimentară de venit pentru accelerarea obiectivelor',
          'Investește economiile în instrumente financiare cu randament mai mare'
        ]
      };

      setBudget(analysis);
    } catch (error) {
      console.error('Error generating budget analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateBudgetAnalysis();
  }, [income]);

  const getProgressPercentage = (spent: number, allocated: number) => {
    return Math.min((spent / allocated) * 100, 100);
  };

  const getProgressColor = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage <= 80) return '#10b981'; // Green
    if (percentage <= 100) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getGoalProgress = (goal: FinancialGoal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  return (
    <div className={styles.budgetContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>💰 AI Budget Optimizer</h1>
        <p className={styles.subtitle}>
          Analiză inteligentă și optimizare automată pentru bugetul tău personal
        </p>
      </div>

      <div className={styles.incomeInput}>
        <label htmlFor="income">Venitul Tău Lunar (RON)</label>
        <input
          type="number"
          id="income"
          value={income}
          onChange={(e) => setIncome(parseInt(e.target.value) || 0)}
          className={styles.input}
          min="1000"
          max="50000"
          step="100"
        />
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Analizez patterns financiari și generez recomandări...</p>
        </div>
      ) : budget && (
        <>
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              📂 Categorii
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'goals' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('goals')}
            >
              🎯 Obiective
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className={styles.overviewSection}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>💵</div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>
                      {budget.totalIncome.toLocaleString()} RON
                    </div>
                    <div className={styles.statLabel}>Venit Lunar</div>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>💸</div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>
                      {budget.totalExpenses.toLocaleString()} RON
                    </div>
                    <div className={styles.statLabel}>Cheltuieli Totale</div>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🏦</div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>
                      {budget.totalSavings.toLocaleString()} RON
                    </div>
                    <div className={styles.statLabel}>Economii Lunare</div>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📈</div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>
                      {budget.savingsRate.toFixed(1)}%
                    </div>
                    <div className={styles.statLabel}>Rata Economisire</div>
                  </div>
                </div>
              </div>

              <div className={styles.insightsSection}>
                <h3 className={styles.sectionTitle}>🧠 AI Insights</h3>
                <div className={styles.insightsList}>
                  {budget.aiInsights.map((insight, index) => (
                    <div key={index} className={styles.insightCard}>
                      <div className={styles.insightIcon}>💡</div>
                      <div className={styles.insightText}>{insight}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.optimizationSection}>
                <h3 className={styles.sectionTitle}>⚡ Recomandări de Optimizare</h3>
                <div className={styles.suggestionsList}>
                  {budget.optimizationSuggestions.map((suggestion, index) => (
                    <div key={index} className={styles.suggestionCard}>
                      <div className={styles.suggestionIcon}>🎯</div>
                      <div className={styles.suggestionText}>{suggestion}</div>
                      <button className={styles.actionButton}>Aplică</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className={styles.categoriesSection}>
              <div className={styles.categoriesGrid}>
                {budget.categories.map((category) => (
                  <div key={category.id} className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                      <div className={styles.categoryIcon} style={{ backgroundColor: category.color }}>
                        {category.icon}
                      </div>
                      <div className={styles.categoryInfo}>
                        <h4 className={styles.categoryName}>{category.name}</h4>
                        <div className={styles.categoryAmounts}>
                          <span className={styles.spent}>
                            {category.spent.toLocaleString()} RON
                          </span>
                          <span className={styles.allocated}>
                            / {category.allocated.toLocaleString()} RON
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${getProgressPercentage(category.spent, category.allocated)}%`,
                          backgroundColor: getProgressColor(category.spent, category.allocated)
                        }}
                      ></div>
                    </div>

                    <div className={styles.progressInfo}>
                      <span className={styles.progressPercentage}>
                        {getProgressPercentage(category.spent, category.allocated).toFixed(1)}%
                      </span>
                      <span className={styles.remaining}>
                        {category.allocated - category.spent > 0
                          ? `${(category.allocated - category.spent).toLocaleString()} RON rămas`
                          : `${Math.abs(category.allocated - category.spent).toLocaleString()} RON peste buget`
                        }
                      </span>
                    </div>

                    {category.suggestions && (
                      <div className={styles.categorySuggestions}>
                        <h6>💡 Sugestii AI:</h6>
                        <ul>
                          {category.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className={styles.goalsSection}>
              <div className={styles.goalsGrid}>
                {budget.goals.map((goal) => (
                  <div key={goal.id} className={styles.goalCard}>
                    <div className={styles.goalHeader}>
                      <h4 className={styles.goalName}>{goal.name}</h4>
                      <div className={`${styles.priorityBadge} ${styles[goal.priority]}`}>
                        {goal.priority === 'high' && '🔴 Prioritate Mare'}
                        {goal.priority === 'medium' && '🟡 Prioritate Medie'}
                        {goal.priority === 'low' && '🟢 Prioritate Mică'}
                      </div>
                    </div>

                    <div className={styles.goalProgress}>
                      <div className={styles.goalAmounts}>
                        <span className={styles.currentAmount}>
                          {goal.currentAmount.toLocaleString()} RON
                        </span>
                        <span className={styles.targetAmount}>
                          / {goal.targetAmount.toLocaleString()} RON
                        </span>
                      </div>
                      
                      <div className={styles.goalProgressBar}>
                        <div
                          className={styles.goalProgressFill}
                          style={{ width: `${getGoalProgress(goal)}%` }}
                        ></div>
                      </div>
                      
                      <div className={styles.goalMeta}>
                        <span className={styles.goalPercentage}>
                          {getGoalProgress(goal).toFixed(1)}% complet
                        </span>
                        <span className={styles.goalDeadline}>
                          Termen: {new Date(goal.deadline).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                    </div>

                    <div className={styles.goalActions}>
                      <button className={styles.goalAction}>
                        📊 Vezi Plan Detaliat
                      </button>
                      <button className={styles.goalAction}>
                        ⚙️ Automatizează
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.addGoalSection}>
                <button className={styles.addGoalButton}>
                  ➕ Adaugă Obiectiv Financiar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}