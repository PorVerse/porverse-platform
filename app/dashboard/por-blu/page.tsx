'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './style.module.css'; // ✅ CSS Module import

// Types
interface LifeGoal {
  id: string;
  category: 'career' | 'personal' | 'financial' | 'health' | 'relationships' | 'legacy';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'not-started' | 'planning' | 'in-progress' | 'review' | 'achieved';
  timeline: string;
  progress: number;
  strategicValue: number;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  importance: number;
}

interface VisionBoardItem {
  id: string;
  title: string;
  description: string;
  category: string;
  targetYear: number;
  aiRelevanceScore: number;
}

interface StrategicInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'strength' | 'weakness' | 'trend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
}

interface DecisionMatrix {
  id: string;
  title: string;
  options: DecisionOption[];
  criteria: DecisionCriteria[];
  status: 'draft' | 'analyzing' | 'completed';
  aiRecommendation?: string;
}

interface DecisionOption {
  id: string;
  name: string;
  description: string;
  scores: { [criteriaId: string]: number };
}

interface DecisionCriteria {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export default function PorBluDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([]);
  const [visionBoard, setVisionBoard] = useState<VisionBoardItem[]>([]);
  const [strategicInsights, setStrategicInsights] = useState<StrategicInsight[]>([]);
  const [currentDecision, setCurrentDecision] = useState<DecisionMatrix | null>(null);
  const [metrics, setMetrics] = useState({
    leadership: 0,
    strategic: 0,
    balance: 0
  });

  // Initialize mock data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLifeGoals([
        {
          id: '1',
          category: 'career',
          title: 'Devin CTO la o companie unicorn',
          description: 'Vreau să conduc echipa tehnică la o startup care ajunge la evaluare de $1B+',
          priority: 'critical',
          status: 'in-progress',
          timeline: '3 years',
          progress: 35,
          strategicValue: 9.5,
          milestones: [
            {
              id: '1a',
              title: 'Promovare la Senior Engineering Manager',
              targetDate: '2025-06-30',
              status: 'in-progress',
              importance: 8
            }
          ]
        },
        {
          id: '2',
          category: 'financial',
          title: 'Independență financiară până la 35 de ani',
          description: 'Acumulez suficiente investiții pentru a nu mai depinde de salariu',
          priority: 'high',
          status: 'in-progress',
          timeline: '7 years',
          progress: 22,
          strategicValue: 9.0,
          milestones: []
        },
        {
          id: '3',
          category: 'personal',
          title: 'Scriu o carte despre leadership în tech',
          description: 'Documentez experiențele mele și ajut alți lideri',
          priority: 'medium',
          status: 'planning',
          timeline: '2 years',
          progress: 8,
          strategicValue: 7.5,
          milestones: []
        }
      ]);

      setVisionBoard([
        {
          id: '1',
          title: 'Speaking la TED Talk',
          description: 'Prezint despre viitorul AI în dezvoltarea software',
          category: 'career',
          targetYear: 2027,
          aiRelevanceScore: 8.8
        },
        {
          id: '2',
          title: 'Startup propriu în AI',
          description: 'Fondez o companie care revoluționează educația cu AI',
          category: 'career',
          targetYear: 2030,
          aiRelevanceScore: 9.5
        },
        {
          id: '3',
          title: 'Casa în Silicon Valley',
          description: 'O proprietate în zona tech pentru network și oportunități',
          category: 'lifestyle',
          targetYear: 2029,
          aiRelevanceScore: 7.2
        }
      ]);

      setStrategicInsights([
        {
          id: '1',
          type: 'opportunity',
          title: 'AI Revolution în educație',
          description: 'Piața EdTech cu AI se estimează că va crească cu 40% anual în următorii 5 ani. Experiența ta în AI + leadership te poziționează perfect.',
          impact: 'critical',
          recommendation: 'Începe să construiești un prototip de platformă educațională cu AI în timpul liber'
        },
        {
          id: '2',
          type: 'strength',
          title: 'Leadership natural',
          description: 'Feedback-ul de la echipă arată că ai competențe native de leadership și oamenii te urmează natural.',
          impact: 'high',
          recommendation: 'Aplică pentru pozitii de leadership senior în următoarele 6 luni'
        },
        {
          id: '3',
          type: 'threat',
          title: 'Burnout risk',
          description: 'Ritmul actual de lucru poate duce la burnout în următoarele 12 luni, afectând obiectivele pe termen lung.',
          impact: 'medium',
          recommendation: 'Implementează tehnici de time management și delegate mai mult'
        }
      ]);

      setCurrentDecision({
        id: '1',
        title: 'Următorul pas în carieră',
        status: 'analyzing',
        options: [
          {
            id: 'opt1',
            name: 'Rămân în compania actuală',
            description: 'Promovare internă la Director level',
            scores: { 'growth': 6, 'salary': 7, 'impact': 5, 'risk': 8 }
          },
          {
            id: 'opt2',
            name: 'Join startup ca CTO',
            description: 'Startup early-stage cu potențial mare',
            scores: { 'growth': 9, 'salary': 6, 'impact': 9, 'risk': 4 }
          }
        ],
        criteria: [
          { id: 'growth', name: 'Potențial de creștere', weight: 9, description: 'Cât de mult pot învăța și crește' },
          { id: 'salary', name: 'Compensație', weight: 7, description: 'Salariul și beneficiile' },
          { id: 'impact', name: 'Impact pe piață', weight: 8, description: 'Influența asupra industriei' },
          { id: 'risk', name: 'Stabilitate', weight: 6, description: 'Cât de sigură este opțiunea' }
        ],
        aiRecommendation: 'Bazat pe profilul tău și obiectivele pe termen lung, recomand "Join startup ca CTO". Scorul AI: 8.7/10. Motivație: Maximizează potențialul de creștere și impact, esențiale pentru obiectivul tău de CTO la unicorn.'
      });

      setMetrics({
        leadership: 78,
        strategic: 85,
        balance: 62
      });

      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons = {
      career: '🚀',
      personal: '🌱', 
      financial: '💰',
      health: '🏃',
      relationships: '❤️',
      legacy: '🏛️'
    };
    return icons[category as keyof typeof icons] || '🎯';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: styles.priorityCritical,
      high: styles.priorityHigh,
      medium: styles.priorityMedium,
      low: styles.priorityLow
    };
    return colors[priority as keyof typeof colors] || '';
  };

  const getInsightIcon = (type: string) => {
    const icons = {
      opportunity: '🔥',
      threat: '⚠️',
      strength: '💪',
      weakness: '🎯',
      trend: '📈'
    };
    return icons[type as keyof typeof icons] || '💡';
  };

  const calculateDecisionScore = (option: DecisionOption, criteria: DecisionCriteria[]) => {
    let totalScore = 0;
    let totalWeight = 0;
    
    criteria.forEach(criterion => {
      const score = option.scores[criterion.id] || 0;
      totalScore += score * criterion.weight;
      totalWeight += criterion.weight;
    });
    
    return totalWeight > 0 ? (totalScore / totalWeight).toFixed(1) : '0';
  };

  const generateStrategicAdvice = () => {
    const advice = [
      "💡 Pentru a atinge obiectivul de CTO, recomand să te concentrezi pe building team skills în următoarele 6 luni.",
      "🎯 Analiza ta de personalitate arată că ai potential natural de lider vizionar. Exploatează această forță!",
      "📈 Piața AI va exploda în următorii 3 ani. Poziționează-te acum pentru a fi în față.",
      "⚖️ Life balance score-ul tău (62%) necesită atenție. Succesul sustenabil necesită echilibru.",
      "🧠 Strategic thinking score-ul tău (85%) te poziționează în top 10%. Aplică pentru poziții executive."
    ];
    
    return advice[Math.floor(Math.random() * advice.length)];
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
        <h2>Analizez strategia ta de viață...</h2>
        <p>Calculez obiective, oportunități și planul optim</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Link href="/dashboard" className={styles.logo}>
            💧 PorBlu
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Strategic Planning</div>
          <button 
            className={`${styles.navItem} ${activeView === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <span className={styles.navItemIcon}>🎯</span>
            Strategic Overview
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'goals' ? styles.active : ''}`}
            onClick={() => setActiveView('goals')}
          >
            <span className={styles.navItemIcon}>🏆</span>
            Life Goals
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'vision' ? styles.active : ''}`}
            onClick={() => setActiveView('vision')}
          >
            <span className={styles.navItemIcon}>🔮</span>
            Vision Board
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'decisions' ? styles.active : ''}`}
            onClick={() => setActiveView('decisions')}
          >
            <span className={styles.navItemIcon}>⚖️</span>
            Decision Matrix
          </button>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>AI Executive Tools</div>
          <button 
            className={`${styles.navItem} ${activeView === 'coach' ? styles.active : ''}`}
            onClick={() => setActiveView('coach')}
          >
            <span className={styles.navItemIcon}>🤖</span>
            AI Executive Coach
          </button>
          <button 
            className={`${styles.navItem} ${activeView === 'insights' ? styles.active : ''}`}
            onClick={() => setActiveView('insights')}
          >
            <span className={styles.navItemIcon}>🧠</span>
            Strategic Insights
          </button>
        </div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>👑 Executive Strategy Center</h1>
          <p>
            Leadership Score: <span className={styles.leadershipScore}>{metrics.leadership}%</span> • 
            Strategic Thinking: <span className={styles.strategicScore}>{metrics.strategic}%</span>
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{lifeGoals.filter(g => g.status === 'in-progress').length}</div>
              <div className={styles.statLabel}>Active Goals</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{Math.round(lifeGoals.reduce((sum, g) => sum + g.progress, 0) / lifeGoals.length)}%</div>
              <div className={styles.statLabel}>Avg Progress</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{metrics.balance}%</div>
              <div className={styles.statLabel}>Life Balance</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.headerBtn}>🔔</button>
            <button className={styles.headerBtn}>📅</button>
            <button className={styles.headerBtn}>⚙️</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {activeView === 'overview' && (
          <>
            {/* Welcome Section */}
            <div className={styles.welcomeSection}>
              <h2>🌟 Welcome to Your Strategic Command Center, Alex</h2>
              <p>Transformă-ți viziunea în realitate prin planning strategic și execuție disciplinată. Today's focus: Leadership development și progress review.</p>
            </div>

            {/* Metrics Grid */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>👑</div>
                <div className={styles.metricInfo}>
                  <h3>Leadership Score</h3>
                  <div className={styles.metricValue}>{metrics.leadership}%</div>
                  <div className={`${styles.metricChange} ${styles.positive}`}>+8% din luna trecută</div>
                  <div className={styles.metricBar}>
                    <div 
                      className={styles.metricFill} 
                      style={{ width: `${metrics.leadership}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🧠</div>
                <div className={styles.metricInfo}>
                  <h3>Strategic Thinking</h3>
                  <div className={styles.metricValue}>{metrics.strategic}%</div>
                  <div className={`${styles.metricChange} ${styles.positive}`}>+12% din luna trecută</div>
                  <div className={styles.metricBar}>
                    <div 
                      className={styles.metricFill} 
                      style={{ width: `${metrics.strategic}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>⚖️</div>
                <div className={styles.metricInfo}>
                  <h3>Life Balance</h3>
                  <div className={styles.metricValue}>{metrics.balance}%</div>
                  <div className={`${styles.metricChange} ${styles.negative}`}>-3% din luna trecută</div>
                  <div className={styles.metricBar}>
                    <div 
                      className={styles.metricFill} 
                      style={{ width: `${metrics.balance}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🎯</div>
                <div className={styles.metricInfo}>
                  <h3>Goal Achievement</h3>
                  <div className={styles.metricValue}>
                    {Math.round(lifeGoals.reduce((sum, g) => sum + g.progress, 0) / lifeGoals.length)}%
                  </div>
                  <div className={`${styles.metricChange} ${styles.positive}`}>+15% din luna trecută</div>
                  <div className={styles.metricBar}>
                    <div 
                      className={styles.metricFill} 
                      style={{ width: `${Math.round(lifeGoals.reduce((sum, g) => sum + g.progress, 0) / lifeGoals.length)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insight */}
            <div className={styles.aiInsightSection}>
              <div className={styles.aiInsightCard}>
                <div className={styles.aiAvatar}>🤖</div>
                <div className={styles.aiContent}>
                  <h3>AI Executive Insight</h3>
                  <p>{generateStrategicAdvice()}</p>
                </div>
                <button className={styles.detailsBtn}>Vezi detalii</button>
              </div>
            </div>

            {/* Critical Goals */}
            <div className={styles.criticalGoalsSection}>
              <h3>🔥 Critical & High Priority Goals</h3>
              <div className={styles.goalsGrid}>
                {lifeGoals
                  .filter(goal => goal.priority === 'critical' || goal.priority === 'high')
                  .map(goal => (
                    <div key={goal.id} className={styles.goalCard}>
                      <div className={styles.goalHeader}>
                        <span className={styles.goalIcon}>{getCategoryIcon(goal.category)}</span>
                        <h4>{goal.title}</h4>
                        <div className={`${styles.goalPriority} ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </div>
                      </div>
                      <p className={styles.goalDescription}>{goal.description}</p>
                      
                      <div className={styles.goalProgress}>
                        <div className={styles.progressHeader}>
                          <span>Progress: {goal.progress}%</span>
                          <span>🤖 {goal.strategicValue}/10</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill}
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className={styles.goalMeta}>
                        <span className={styles.goalTimeline}>🕐 {goal.timeline}</span>
                        <span className={styles.goalStatus}>{goal.status}</span>
                      </div>

                      {goal.milestones.length > 0 && (
                        <div className={styles.goalMilestones}>
                          <span className={styles.milestonesLabel}>Next milestone:</span>
                          <span className={styles.nextMilestone}>
                            {goal.milestones[0].title}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Strategic Insights Preview */}
            <div className={styles.insightsPreview}>
              <h3>🧠 Latest Strategic Insights</h3>
              <div className={styles.insightsGrid}>
                {strategicInsights.slice(0, 3).map(insight => (
                  <div key={insight.id} className={`${styles.insightCard} ${styles[insight.type]}`}>
                    <div className={styles.insightHeader}>
                      <span className={styles.insightIcon}>{getInsightIcon(insight.type)}</span>
                      <h4>{insight.title}</h4>
                      <span className={`${styles.insightImpact} ${styles[insight.impact]}`}>
                        {insight.impact}
                      </span>
                    </div>
                    <p>{insight.description}</p>
                    {insight.recommendation && (
                      <div className={styles.insightRecommendation}>
                        <strong>Recommendation:</strong> {insight.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActionsSection}>
              <h3>⚡ Quick Strategic Actions</h3>
              <div className={styles.quickActions}>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>🎯</span>
                  Create New Goal
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>⚖️</span>
                  Decision Analysis
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>📊</span>
                  Progress Review
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>🔮</span>
                  Update Vision
                </button>
                <button className={styles.actionBtn}>
                  <span className={styles.actionIcon}>🧠</span>
                  AI Strategy Session
                </button>
              </div>
            </div>
          </>
        )}

        {activeView === 'goals' && (
          <div className={styles.dashboardSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>🏆 Strategic Life Goals</h2>
              <button className={styles.addGoalBtn}>+ Create New Goal</button>
            </div>

            <div className={styles.goalsFilters}>
              <button className={styles.filterBtn}>All Goals</button>
              <button className={styles.filterBtn}>Critical</button>
              <button className={styles.filterBtn}>High Priority</button>
              <button className={styles.filterBtn}>In Progress</button>
            </div>

            <div className={styles.goalsDetailedGrid}>
              {lifeGoals.map(goal => (
                <div key={goal.id} className={styles.goalDetailedCard}>
                  <div className={styles.goalCardHeader}>
                    <div className={styles.goalTitleSection}>
                      <span className={styles.goalIcon}>{getCategoryIcon(goal.category)}</span>
                      <div>
                        <h3>{goal.title}</h3>
                        <span className={styles.goalCategory}>{goal.category}</span>
                      </div>
                    </div>
                    <div className={styles.goalMetaActions}>
                      <div className={`${styles.goalPriority} ${getPriorityColor(goal.priority)}`}>
                        {goal.priority}
                      </div>
                      <span className={styles.goalTimeline}>🕐 {goal.timeline}</span>
                    </div>
                  </div>

                  <p className={styles.goalDescription}>{goal.description}</p>

                  <div className={styles.goalMetrics}>
                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <span>Progress: {goal.progress}%</span>
                        <span>Strategic Value: 🤖 {goal.strategicValue}/10</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {goal.milestones.length > 0 && (
                    <div className={styles.milestonesSection}>
                      <h4>🎯 Milestones</h4>
                      <div className={styles.milestonesList}>
                        {goal.milestones.map(milestone => (
                          <div key={milestone.id} className={styles.milestoneItem}>
                            <div className={styles.milestoneHeader}>
                              <span className={styles.milestoneTitle}>{milestone.title}</span>
                              <span className={`${styles.milestoneStatus} ${styles[milestone.status]}`}>
                                {milestone.status}
                              </span>
                            </div>
                            <div className={styles.milestoneDetails}>
                              <span>Target: {new Date(milestone.targetDate).toLocaleDateString('ro-RO')}</span>
                              <span>Importance: {milestone.importance}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.goalActions}>
                    <button className={styles.goalActionBtn}>📝 Edit</button>
                    <button className={styles.goalActionBtn}>📊 Analytics</button>
                    <button className={styles.goalActionBtn}>🎯 Add Milestone</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'vision' && (
          <div className={styles.dashboardSection}>
            <div className={styles.visionHeader}>
              <h2>🔮 AI Vision Board</h2>
              <p className={styles.visionDescription}>
                Vizualizează-ți viitorul și creează un plan strategic pentru a-l atinge. AI-ul analizează relevența fiecărui obiectiv.
              </p>
            </div>

            <div className={styles.visionBoard}>
              {visionBoard.map(item => (
                <div key={item.id} className={styles.visionCard}>
                  <div className={styles.visionImage}>
                    <span className={styles.visionPlaceholder}>📸</span>
                  </div>
                  <div className={styles.visionContent}>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <div className={styles.visionMeta}>
                      <span className={styles.visionYear}>Target: {item.targetYear}</span>
                      <span className={styles.visionCategory}>{item.category}</span>
                    </div>
                    <div className={styles.aiRelevance}>
                      <span>AI Relevance Score:</span>
                      <span className={styles.relevanceScore}>{item.aiRelevanceScore}/10</span>
                      <div className={styles.relevanceBar}>
                        <div 
                          className={styles.relevanceFill}
                          style={{ width: `${item.aiRelevanceScore * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.visionActions}>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>➕</span>
                Add Vision Item
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>🎯</span>
                Convert to Goals
              </button>
            </div>
          </div>
        )}

        {activeView === 'decisions' && currentDecision && (
          <div className={styles.dashboardSection}>
            <div className={styles.decisionHeader}>
              <h2>⚖️ AI Decision Matrix</h2>
              <div className={styles.decisionMeta}>
                <h3>{currentDecision.title}</h3>
                <span className={styles.statusBadge}>{currentDecision.status}</span>
              </div>
            </div>

            {currentDecision.aiRecommendation && (
              <div className={styles.aiRecommendation}>
                <div className={styles.recommendationHeader}>
                  <span className={styles.aiIcon}>🤖</span>
                  <h4>AI Recommendation</h4>
                </div>
                <p>{currentDecision.aiRecommendation}</p>
              </div>
            )}

            <div className={styles.decisionMatrix}>
              <div className={styles.matrixHeader}>
                <div className={styles.optionsLabel}>Options</div>
                {currentDecision.criteria.map(criterion => (
                  <div key={criterion.id} className={styles.criterionHeader}>
                    <span>{criterion.name}</span>
                    <span className={styles.weight}>({criterion.weight}/10)</span>
                  </div>
                ))}
                <div className={styles.scoreLabel}>AI Score</div>
              </div>

              {currentDecision.options.map(option => (
                <div key={option.id} className={styles.matrixRow}>
                  <div className={styles.optionInfo}>
                    <h4>{option.name}</h4>
                    <p>{option.description}</p>
                  </div>
                  {currentDecision.criteria.map(criterion => (
                    <div key={criterion.id} className={styles.scoreCell}>
                      <div className={styles.scoreValue}>{option.scores[criterion.id]}/10</div>
                      <div className={styles.scoreBar}>
                        <div 
                          className={styles.scoreFill}
                          style={{ width: `${option.scores[criterion.id] * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className={styles.totalScore}>
                    {calculateDecisionScore(option, currentDecision.criteria)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.decisionActions}>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>🔄</span>
                Recalculează Scoring
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>📊</span>
                Scenario Analysis
              </button>
              <button className={styles.actionBtn}>
                <span className={styles.actionIcon}>✅</span>
                Finalizează Decizia
              </button>
            </div>
          </div>
        )}

        {activeView === 'coach' && (
          <div className={styles.aiCoachSection}>
            <div className={styles.coachHeader}>
              <h2>🤖 AI Executive Coach</h2>
              <p>Your personal strategic advisor for leadership and life optimization</p>
            </div>

            <div className={styles.coachInterface}>
              <div className={styles.coachChat}>
                <div className={styles.chatMessage}>
                  <div className={styles.aiAvatar}>🤖</div>
                  <div className={styles.messageContent}>
                    <p>Bună, Alex! Am analizat progresul tău recent și am identificat 3 oportunități cheie pentru următoarea fază de growth. Vrei să discutăm strategia pentru poziția de CTO?</p>
                    <span className={styles.messageTime}>Acum 5 minute</span>
                  </div>
                </div>
              </div>

              <div className={styles.coachSuggestions}>
                <h3>🎯 Suggested Discussion Topics</h3>
                <div className={styles.suggestionCards}>
                  <button className={styles.suggestionCard}>
                    <h4>Leadership Development Plan</h4>
                    <p>Strategii pentru a ajunge la scorul de leadership 90%+</p>
                  </button>
                  <button className={styles.suggestionCard}>
                    <h4>Career Acceleration</h4>
                    <p>Planul optim pentru poziția de CTO în următorii 2 ani</p>
                  </button>
                  <button className={styles.suggestionCard}>
                    <h4>Work-Life Integration</h4>
                    <p>Cum să îmbunătățești life balance fără să îți afectezi obiectivele</p>
                  </button>
                </div>
              </div>

              <div className={styles.chatInput}>
                <input 
                  type="text" 
                  placeholder="Întreabă-mă orice despre strategie, leadership sau decizii..."
                  className={styles.chatInputField}
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