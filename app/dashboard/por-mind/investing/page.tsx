// app/dashboard/por-mind/investing/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../style.module.css';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  aiScore: number;
  aiAnalysis: string;
  riskLevel: 'low' | 'medium' | 'high';
  sector: string;
  dividendYield?: number;
}

interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalReturn: number;
  returnPercent: number;
  riskScore: number;
  holdings: PortfolioHolding[];
  allocation: AssetAllocation;
  rebalanceNeeded: boolean;
  aiRecommendations: string[];
}

interface PortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  weight: number;
}

interface AssetAllocation {
  stocks: number;
  bonds: number;
  crypto: number;
  commodities: number;
  cash: number;
  reits: number;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'rebalance' | 'dividend' | 'analysis';
  title: string;
  message: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
  actionable: boolean;
  relatedSymbols?: string[];
}

interface MarketTrend {
  sector: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  drivers: string[];
  opportunities: string[];
  risks: string[];
}

export default function AIInvestmentAdvisor() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'market' | 'analysis' | 'optimizer'>('portfolio');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [timeHorizon, setTimeHorizon] = useState<'short' | 'medium' | 'long'>('medium');

  const chartRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeInvestmentData();
    initializeParticleSystem();
  }, []);

  const initializeInvestmentData = async () => {
    setLoading(true);
    
    // Simulate AI analysis loading
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock portfolio data
    const mockPortfolio: Portfolio = {
      id: 'main-portfolio',
      name: 'Portofoliul Principal',
      totalValue: 125750,
      totalReturn: 18950,
      returnPercent: 17.74,
      riskScore: 6.8,
      rebalanceNeeded: true,
      holdings: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          shares: 50,
          avgCost: 145.50,
          currentPrice: 185.20,
          totalValue: 9260,
          gainLoss: 1985,
          gainLossPercent: 27.25,
          weight: 7.4
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          shares: 30,
          avgCost: 285.00,
          currentPrice: 345.80,
          totalValue: 10374,
          gainLoss: 1824,
          gainLossPercent: 21.33,
          weight: 8.2
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          shares: 15,
          avgCost: 420.00,
          currentPrice: 685.50,
          totalValue: 10282.50,
          gainLoss: 3982.50,
          gainLossPercent: 63.21,
          weight: 8.2
        },
        {
          symbol: 'TSLA',
          name: 'Tesla, Inc.',
          shares: 25,
          avgCost: 195.00,
          currentPrice: 245.30,
          totalValue: 6132.50,
          gainLoss: 1257.50,
          gainLossPercent: 25.71,
          weight: 4.9
        },
        {
          symbol: 'AMZN',
          name: 'Amazon.com Inc.',
          shares: 40,
          avgCost: 125.00,
          currentPrice: 155.75,
          totalValue: 6230,
          gainLoss: 1230,
          gainLossPercent: 24.60,
          weight: 5.0
        }
      ],
      allocation: {
        stocks: 78.5,
        bonds: 12.0,
        crypto: 5.5,
        commodities: 2.0,
        cash: 1.5,
        reits: 0.5
      },
      aiRecommendations: [
        'Consideră reducerea expunerii la NVDA (8.2% -> 6%) pentru gestionarea riscului',
        'Crește alocarea în bonds la 15% pentru echilibru în contextul actual',
        'Oportunitate de cumpărare: GOOGL pare subevaluat cu P/E de 18.5',
        'Dividend aristocrats: JNJ și PG oferă stabilitate în portofoliu'
      ]
    };

    // Mock watchlist
    const mockWatchlist: Stock[] = [
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 142.35,
        change: 2.85,
        changePercent: 2.04,
        volume: 25678000,
        marketCap: 1850000000000,
        pe: 18.5,
        aiScore: 8.7,
        aiAnalysis: 'Strong fundamentals, undervalued relative to peers. AI and cloud growth drivers intact.',
        riskLevel: 'medium',
        sector: 'Technology',
        dividendYield: 0.0
      },
      {
        symbol: 'BRK.B',
        name: 'Berkshire Hathaway',
        price: 425.80,
        change: -1.25,
        changePercent: -0.29,
        volume: 3245000,
        marketCap: 920000000000,
        pe: 15.2,
        aiScore: 7.9,
        aiAnalysis: 'Defensive play with strong balance sheet. Value approach may outperform in uncertain times.',
        riskLevel: 'low',
        sector: 'Financial Services',
        dividendYield: 0.0
      },
      {
        symbol: 'AVGO',
        name: 'Broadcom Inc.',
        price: 1285.60,
        change: 18.45,
        changePercent: 1.46,
        volume: 1890000,
        marketCap: 595000000000,
        pe: 22.1,
        aiScore: 8.2,
        aiAnalysis: 'AI semiconductor exposure with strong dividend. Benefiting from data center growth.',
        riskLevel: 'medium',
        sector: 'Technology',
        dividendYield: 1.9
      },
      {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        price: 162.45,
        change: 0.85,
        changePercent: 0.53,
        volume: 6789000,
        marketCap: 420000000000,
        pe: 13.8,
        aiScore: 7.5,
        aiAnalysis: 'Defensive dividend aristocrat. Healthcare sector stability with pipeline growth.',
        riskLevel: 'low',
        sector: 'Healthcare',
        dividendYield: 3.1
      },
      {
        symbol: 'AMD',
        name: 'Advanced Micro Devices',
        price: 195.30,
        change: 5.20,
        changePercent: 2.74,
        volume: 45230000,
        marketCap: 315000000000,
        pe: 28.5,
        aiScore: 8.0,
        aiAnalysis: 'Strong competition to Intel, AI chip growth potential. Volatile but promising.',
        riskLevel: 'high',
        sector: 'Technology',
        dividendYield: 0.0
      }
    ];

    // Mock AI insights
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: '🎯 Oportunitate de Cumpărare Detectată',
        message: 'GOOGL arată semne de subevaluare cu P/E de 18.5 vs media sectorului de 24.2. AI Cloud revenue acceleration expected.',
        confidence: 0.87,
        impact: 'high',
        timeframe: 'medium',
        actionable: true,
        relatedSymbols: ['GOOGL']
      },
      {
        id: '2',
        type: 'warning',
        title: '⚠️ Risc de Concentrare Sector Tech',
        message: 'Peste 65% din portofoliu în Technology. Consideră diversificare în Healthcare sau Financial Services.',
        confidence: 0.92,
        impact: 'medium',
        timeframe: 'short',
        actionable: true,
        relatedSymbols: ['AAPL', 'MSFT', 'NVDA']
      },
      {
        id: '3',
        type: 'rebalance',
        title: '⚖️ Rebalansare Recomandată',
        message: 'NVDA a crescut peste target allocation (8.2% vs 6% target). Profit-taking recomandat.',
        confidence: 0.84,
        impact: 'medium',
        timeframe: 'short',
        actionable: true,
        relatedSymbols: ['NVDA']
      },
      {
        id: '4',
        type: 'dividend',
        title: '💰 Dividend Opportunity',
        message: 'JNJ și AVGO oferă yield-uri atractive (3.1% și 1.9%) cu istoric stabil de creștere.',
        confidence: 0.79,
        impact: 'low',
        timeframe: 'long',
        actionable: true,
        relatedSymbols: ['JNJ', 'AVGO']
      },
      {
        id: '5',
        type: 'analysis',
        title: '📊 Market Sentiment Analysis',
        message: 'AI sector momentum pozitiv, dar valuations stretched. Selective approach recomandat.',
        confidence: 0.81,
        impact: 'medium',
        timeframe: 'medium',
        actionable: false,
        relatedSymbols: ['NVDA', 'AMD', 'GOOGL']
      }
    ];

    // Mock market trends
    const mockTrends: MarketTrend[] = [
      {
        sector: 'Technology',
        trend: 'bullish',
        strength: 8.5,
        drivers: ['AI adoption acceleration', 'Cloud computing growth', 'Digital transformation'],
        opportunities: ['Semiconductor leaders', 'Software infrastructure', 'AI-powered platforms'],
        risks: ['Valuation concerns', 'Interest rate sensitivity', 'Regulatory pressure']
      },
      {
        sector: 'Healthcare',
        trend: 'neutral',
        strength: 6.2,
        drivers: ['Aging demographics', 'Biotech innovation', 'Defensive characteristics'],
        opportunities: ['Biotech breakthroughs', 'Medical devices', 'Generic drug players'],
        risks: ['Drug pricing pressure', 'Regulatory delays', 'Competition from biosimilars']
      },
      {
        sector: 'Financial Services',
        trend: 'bullish',
        strength: 7.8,
        drivers: ['Rising interest rates', 'Credit normalization', 'Digital banking adoption'],
        opportunities: ['Regional banks', 'Fintech innovation', 'Insurance companies'],
        risks: ['Credit losses', 'Economic slowdown', 'Regulatory changes']
      }
    ];

    setPortfolio(mockPortfolio);
    setWatchlist(mockWatchlist);
    setAiInsights(mockInsights);
    setMarketTrends(mockTrends);
    setLoading(false);
  };

  const initializeParticleSystem = () => {
    if (!particleRef.current) return;
    
    // Create floating financial particles
    const particles = ['💰', '📈', '📊', '💎', '🚀', '⚡', '🎯', '💡'];
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.textContent = particles[Math.floor(Math.random() * particles.length)];
      particle.className = styles.financialParticle;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 10 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      particleRef.current.appendChild(particle);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return (percent >= 0 ? '+' : '') + percent.toFixed(2) + '%';
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'var(--mind-success)' : 'var(--mind-danger)';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'var(--mind-success)';
      case 'medium': return 'var(--mind-warning)';
      case 'high': return 'var(--mind-danger)';
      default: return 'var(--mind-primary)';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '🎯';
      case 'warning': return '⚠️';
      case 'rebalance': return '⚖️';
      case 'dividend': return '💰';
      case 'analysis': return '📊';
      default: return '💡';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <h3>🧠 AI Investment Analyzer</h3>
          <div className={styles.loadingSteps}>
            <div className={styles.loadingStep}>Analyzing market conditions</div>
            <div className={styles.loadingStep}>Processing portfolio data</div>
            <div className={styles.loadingStep}>Calculating risk metrics</div>
            <div className={styles.loadingStep}>Generating AI insights</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.investingContainer}>
      {/* Animated Background */}
      <div className={styles.financialBackground}></div>
      <div ref={particleRef} className={styles.particleContainer}></div>

      {/* Header */}
      <div className={styles.investingHeader}>
        <Link href="/dashboard/por-mind" className={styles.backButton}>
          ← Înapoi la PorMind
        </Link>
        <div className={styles.headerContent}>
          <h1 className={styles.investingTitle}>💎 AI Investment Advisor</h1>
          <p className={styles.investingSubtitle}>
            Analiza AI avansată pentru portofoliul tău de investiții cu recomandări în timp real
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'portfolio' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          📊 Portofoliu
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'market' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('market')}
        >
          📈 Piață
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'analysis' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          🧠 Analiză AI
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'optimizer' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('optimizer')}
        >
          ⚡ Optimizer
        </button>
      </div>

      <div className={styles.investingContent}>
        {activeTab === 'portfolio' && portfolio && (
          <div className={styles.portfolioSection}>
            {/* Portfolio Overview */}
            <div className={styles.portfolioOverview}>
              <div className={styles.portfolioHeader}>
                <h2 className={styles.portfolioTitle}>{portfolio.name}</h2>
                <div className={styles.portfolioStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatCurrency(portfolio.totalValue)}</span>
                    <span className={styles.statLabel}>Valoare Totală</span>
                  </div>
                  <div className={styles.statItem}>
                    <span 
                      className={styles.statValue}
                      style={{ color: getChangeColor(portfolio.totalReturn) }}
                    >
                      {formatCurrency(portfolio.totalReturn)}
                    </span>
                    <span className={styles.statLabel}>Profit Total</span>
                  </div>
                  <div className={styles.statItem}>
                    <span 
                      className={styles.statValue}
                      style={{ color: getChangeColor(portfolio.returnPercent) }}
                    >
                      {formatPercent(portfolio.returnPercent)}
                    </span>
                    <span className={styles.statLabel}>Return %</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{portfolio.riskScore}/10</span>
                    <span className={styles.statLabel}>Risc Scor</span>
                  </div>
                </div>
              </div>

              {/* Asset Allocation */}
              <div className={styles.allocationSection}>
                <h3>📊 Alocarea Activelor</h3>
                <div className={styles.allocationChart}>
                  <div className={styles.allocationBar}>
                    <div 
                      className={styles.allocationSegment}
                      style={{ 
                        width: `${portfolio.allocation.stocks}%`,
                        backgroundColor: 'var(--mind-primary)'
                      }}
                    ></div>
                    <div 
                      className={styles.allocationSegment}
                      style={{ 
                        width: `${portfolio.allocation.bonds}%`,
                        backgroundColor: 'var(--mind-secondary)'
                      }}
                    ></div>
                    <div 
                      className={styles.allocationSegment}
                      style={{ 
                        width: `${portfolio.allocation.crypto}%`,
                        backgroundColor: 'var(--mind-accent)'
                      }}
                    ></div>
                    <div 
                      className={styles.allocationSegment}
                      style={{ 
                        width: `${portfolio.allocation.commodities}%`,
                        backgroundColor: 'var(--mind-warning)'
                      }}
                    ></div>
                    <div 
                      className={styles.allocationSegment}
                      style={{ 
                        width: `${portfolio.allocation.cash}%`,
                        backgroundColor: 'var(--mind-success)'
                      }}
                    ></div>
                  </div>
                  <div className={styles.allocationLegend}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: 'var(--mind-primary)' }}></div>
                      <span>Acțiuni {portfolio.allocation.stocks}%</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: 'var(--mind-secondary)' }}></div>
                      <span>Obligațiuni {portfolio.allocation.bonds}%</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: 'var(--mind-accent)' }}></div>
                      <span>Crypto {portfolio.allocation.crypto}%</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: 'var(--mind-warning)' }}></div>
                      <span>Commodities {portfolio.allocation.commodities}%</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: 'var(--mind-success)' }}></div>
                      <span>Cash {portfolio.allocation.cash}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            <div className={styles.holdingsSection}>
              <h3>📋 Holdings</h3>
              <div className={styles.holdingsTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>Symbol</div>
                  <div className={styles.headerCell}>Shares</div>
                  <div className={styles.headerCell}>Avg Cost</div>
                  <div className={styles.headerCell}>Current</div>
                  <div className={styles.headerCell}>Value</div>
                  <div className={styles.headerCell}>Gain/Loss</div>
                  <div className={styles.headerCell}>Weight</div>
                </div>
                {portfolio.holdings.map((holding) => (
                  <div key={holding.symbol} className={styles.tableRow}>
                    <div className={styles.tableCell}>
                      <div className={styles.stockInfo}>
                        <span className={styles.stockSymbol}>{holding.symbol}</span>
                        <span className={styles.stockName}>{holding.name}</span>
                      </div>
                    </div>
                    <div className={styles.tableCell}>{holding.shares}</div>
                    <div className={styles.tableCell}>${holding.avgCost.toFixed(2)}</div>
                    <div className={styles.tableCell}>${holding.currentPrice.toFixed(2)}</div>
                    <div className={styles.tableCell}>${holding.totalValue.toLocaleString()}</div>
                    <div 
                      className={styles.tableCell}
                      style={{ color: getChangeColor(holding.gainLoss) }}
                    >
                      <div>{formatCurrency(holding.gainLoss)}</div>
                      <div className={styles.percentChange}>
                        {formatPercent(holding.gainLossPercent)}
                      </div>
                    </div>
                    <div className={styles.tableCell}>{holding.weight.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className={styles.recommendationsSection}>
              <h3>🤖 Recomandări AI</h3>
              <div className={styles.recommendationsList}>
                {portfolio.aiRecommendations.map((recommendation, index) => (
                  <div key={index} className={styles.recommendationItem}>
                    <span className={styles.recommendationIcon}>💡</span>
                    <span className={styles.recommendationText}>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className={styles.marketSection}>
            {/* Watchlist */}
            <div className={styles.watchlistSection}>
              <h2>👁️ Watchlist</h2>
              <div className={styles.stocksList}>
                {watchlist.map((stock) => (
                  <div 
                    key={stock.symbol} 
                    className={styles.stockCard}
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div className={styles.stockHeader}>
                      <div className={styles.stockIdentity}>
                        <span className={styles.stockSymbol}>{stock.symbol}</span>
                        <span className={styles.stockName}>{stock.name}</span>
                      </div>
                      <div className={styles.aiScoreBadge}>
                        AI: {stock.aiScore}/10
                      </div>
                    </div>
                    
                    <div className={styles.stockMetrics}>
                      <div className={styles.priceSection}>
                        <span className={styles.currentPrice}>${stock.price.toFixed(2)}</span>
                        <span 
                          className={styles.priceChange}
                          style={{ color: getChangeColor(stock.change) }}
                        >
                          {formatPercent(stock.changePercent)}
                        </span>
                      </div>
                      
                      <div className={styles.stockDetails}>
                        <div className={styles.detailItem}>
                          <span>P/E: {stock.pe}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span>Sector: {stock.sector}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span 
                            className={styles.riskBadge}
                            style={{ color: getRiskColor(stock.riskLevel) }}
                          >
                            Risk: {stock.riskLevel}
                          </span>
                        </div>
                        {stock.dividendYield && stock.dividendYield > 0 && (
                          <div className={styles.detailItem}>
                            <span>Dividend: {stock.dividendYield}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.aiAnalysis}>
                      <p>{stock.aiAnalysis}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Trends */}
            <div className={styles.trendsSection}>
              <h2>📊 Tendințe Sector</h2>
              <div className={styles.trendsList}>
                {marketTrends.map((trend, index) => (
                  <div key={index} className={styles.trendCard}>
                    <div className={styles.trendHeader}>
                      <h4>{trend.sector}</h4>
                      <div className={`${styles.trendBadge} ${styles[trend.trend]}`}>
                        {trend.trend === 'bullish' && '📈 Bullish'}
                        {trend.trend === 'bearish' && '📉 Bearish'}
                        {trend.trend === 'neutral' && '➡️ Neutral'}
                      </div>
                      <div className={styles.strengthMeter}>
                        <div 
                          className={styles.strengthFill}
                          style={{ width: `${trend.strength * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className={styles.trendDetails}>
                      <div className={styles.trendColumn}>
                        <h5>🚀 Drivers</h5>
                        <ul>
                          {trend.drivers.map((driver, i) => (
                            <li key={i}>{driver}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className={styles.trendColumn}>
                        <h5>💎 Opportunities</h5>
                        <ul>
                          {trend.opportunities.map((opp, i) => (
                            <li key={i}>{opp}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className={styles.trendColumn}>
                        <h5>⚠️ Risks</h5>
                        <ul>
                          {trend.risks.map((risk, i) => (
                            <li key={i}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className={styles.analysisSection}>
            <h2>🧠 AI Investment Analysis</h2>
            <div className={styles.insightsList}>
              {aiInsights.map((insight) => (
                <div key={insight.id} className={`${styles.insightCard} ${styles[insight.type]}`}>
                  <div className={styles.insightHeader}>
                    <div className={styles.insightIcon}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className={styles.insightMeta}>
                      <h4 className={styles.insightTitle}>{insight.title}</h4>
                      <div className={styles.insightTags}>
                        <span className={`${styles.impactTag} ${styles[insight.impact]}`}>
                          Impact: {insight.impact}
                        </span>
                        <span className={styles.timeframeTag}>
                          {insight.timeframe}-term
                        </span>
                        <span className={styles.confidenceTag}>
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.insightContent}>
                    <p className={styles.insightMessage}>{insight.message}</p>
                    
                    {insight.relatedSymbols && insight.relatedSymbols.length > 0 && (
                      <div className={styles.relatedSymbols}>
                        <span>Related: </span>
                        {insight.relatedSymbols.map((symbol, index) => (
                          <span key={symbol} className={styles.symbolTag}>
                            {symbol}
                            {index < insight.relatedSymbols!.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {insight.actionable && (
                      <button className={styles.actionButton}>
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'optimizer' && (
          <div className={styles.optimizerSection}>
            <h2>⚡ Portfolio Optimizer</h2>
            
            <div className={styles.optimizerInputs}>
              <div className={styles.inputGroup}>
                <label>Suma de Investit (RON)</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className={styles.amountInput}
                  min="100"
                  max="1000000"
                  step="100"
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label>Toleranța la Risc</label>
                <select
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(e.target.value as any)}
                  className={styles.selectInput}
                >
                  <option value="conservative">Conservator</option>
                  <option value="moderate">Moderat</option>
                  <option value="aggressive">Agresiv</option>
                </select>
              </div>
              
              <div className={styles.inputGroup}>
                <label>Orizont de Timp</label>
                <select
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value as any)}
                  className={styles.selectInput}
                >
                  <option value="short">1-2 ani</option>
                  <option value="medium">3-7 ani</option>
                  <option value="long">8+ ani</option>
                </select>
              </div>
              
              <button className={styles.optimizeButton}>
                🎯 Optimizează Portofoliul
              </button>
            </div>
            
            <div className={styles.optimizedAllocation}>
              <h3>🎯 Alocare Optimizată AI</h3>
              <div className={styles.allocationSuggestion}>
                <div className={styles.allocationItem}>
                  <span className={styles.assetName}>Large Cap Stocks</span>
                  <span className={styles.assetPercent}>45%</span>
                  <div className={styles.assetBar}>
                    <div style={{ width: '45%' }} className={styles.assetFill}></div>
                  </div>
                </div>
                <div className={styles.allocationItem}>
                  <span className={styles.assetName}>International Stocks</span>
                  <span className={styles.assetPercent}>20%</span>
                  <div className={styles.assetBar}>
                    <div style={{ width: '20%' }} className={styles.assetFill}></div>
                  </div>
                </div>
                <div className={styles.allocationItem}>
                  <span className={styles.assetName}>Bonds</span>
                  <span className={styles.assetPercent}>25%</span>
                  <div className={styles.assetBar}>
                    <div style={{ width: '25%' }} className={styles.assetFill}></div>
                  </div>
                </div>
                <div className={styles.allocationItem}>
                  <span className={styles.assetName}>REITs</span>
                  <span className={styles.assetPercent}>10%</span>
                  <div className={styles.assetBar}>
                    <div style={{ width: '10%' }} className={styles.assetFill}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}