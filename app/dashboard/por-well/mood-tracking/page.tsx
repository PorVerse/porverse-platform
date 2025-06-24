'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.css';

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  notes: string;
  triggers: string[];
  activities: string[];
  weather: string;
  timestamp: Date;
}

interface MoodStats {
  weeklyAverage: number;
  monthlyTrend: 'improving' | 'stable' | 'declining';
  streakDays: number;
  bestDay: string;
  worstDay: string;
  commonTriggers: string[];
  topActivities: string[];
}

interface AIInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'celebration';
  title: string;
  message: string;
  confidence: number;
  actionable: boolean;
}

export default function MoodTracker() {
  const router = useRouter();
  
  const [currentMood, setCurrentMood] = useState(5);
  const [currentEnergy, setCurrentEnergy] = useState(5);
  const [currentStress, setCurrentStress] = useState(5);
  const [currentSleep, setCurrentSleep] = useState(7);
  const [todayNotes, setTodayNotes] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [currentWeather, setCurrentWeather] = useState('sunny');
  
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  const moodEmojis = ['😢', '😔', '😐', '🙂', '😊', '😁', '🤩', '🥳', '😍', '🌟'];
  const energyEmojis = ['🔋', '🔋', '🔋', '⚡', '⚡', '⚡', '🚀', '🚀', '💥', '🌟'];
  const stressEmojis = ['😌', '😌', '😐', '😐', '😰', '😰', '😱', '😱', '🤯', '💥'];

  const commonTriggers = [
    'Work stress', 'Lack of sleep', 'Social situations', 'Weather changes',
    'Family issues', 'Health concerns', 'Financial worries', 'Relationship problems',
    'Time pressure', 'Technology overload', 'Negative news', 'Physical pain'
  ];

  const positiveActivities = [
    'Exercise', 'Meditation', 'Reading', 'Music', 'Nature walk', 'Cooking',
    'Friends time', 'Creative work', 'Learning', 'Gaming', 'Movies', 'Shopping',
    'Journaling', 'Photography', 'Dancing', 'Yoga'
  ];

  useEffect(() => {
    loadMockData();
    checkTodayEntry();
  }, []);

  useEffect(() => {
    if (moodHistory.length > 0) {
      calculateStats();
      generateAIInsights();
    }
  }, [moodHistory, selectedTimeframe]);

  const loadMockData = () => {
    // Generate mock data for the last 30 days
    const mockData: MoodEntry[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic mood patterns
      const baseMood = 6 + Math.sin(i * 0.1) * 2; // Wave pattern
      const randomVariation = (Math.random() - 0.5) * 2;
      const mood = Math.max(1, Math.min(10, Math.round(baseMood + randomVariation)));
      
      const energy = Math.max(1, Math.min(10, mood + (Math.random() - 0.5) * 3));
      const stress = Math.max(1, Math.min(10, 11 - mood + (Math.random() - 0.5) * 2));
      const sleep = Math.max(4, Math.min(10, 7 + (Math.random() - 0.5) * 2));
      
      mockData.push({
        id: crypto.randomUUID(),
        date: date.toISOString().split('T')[0],
        mood: Math.round(mood),
        energy: Math.round(energy),
        stress: Math.round(stress),
        sleep: Math.round(sleep),
        notes: i === 0 ? '' : `Generated entry for ${date.toLocaleDateString('ro-RO')}`,
        triggers: i % 3 === 0 ? ['Work stress'] : i % 5 === 0 ? ['Lack of sleep'] : [],
        activities: i % 2 === 0 ? ['Exercise'] : i % 3 === 0 ? ['Meditation'] : ['Reading'],
        weather: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        timestamp: date
      });
    }
    
    setMoodHistory(mockData);
    setLoading(false);
  };

  const checkTodayEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = moodHistory.find(entry => entry.date === today);
    setHasLoggedToday(!!todayEntry);
    
    if (todayEntry) {
      setCurrentMood(todayEntry.mood);
      setCurrentEnergy(todayEntry.energy);
      setCurrentStress(todayEntry.stress);
      setCurrentSleep(todayEntry.sleep);
      setTodayNotes(todayEntry.notes);
      setSelectedTriggers(todayEntry.triggers);
      setSelectedActivities(todayEntry.activities);
      setCurrentWeather(todayEntry.weather);
    }
  };

  const calculateStats = () => {
    if (moodHistory.length === 0) return;

    const timeframeDays = selectedTimeframe === 'week' ? 7 : 
                         selectedTimeframe === 'month' ? 30 : 365;
    
    const recentEntries = moodHistory.slice(-timeframeDays);
    const weeklyAverage = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
    
    // Calculate trend
    const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));
    const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));
    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.mood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.mood, 0) / secondHalf.length;
    
    let monthlyTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (secondAvg > firstAvg + 0.5) monthlyTrend = 'improving';
    else if (secondAvg < firstAvg - 0.5) monthlyTrend = 'declining';

    // Calculate streak
    let streakDays = 0;
    for (let i = moodHistory.length - 1; i >= 0; i--) {
      if (moodHistory[i].mood >= 6) {
        streakDays++;
      } else {
        break;
      }
    }

    // Find best and worst days
    const sortedByMood = [...recentEntries].sort((a, b) => b.mood - a.mood);
    const bestDay = sortedByMood[0]?.date || '';
    const worstDay = sortedByMood[sortedByMood.length - 1]?.date || '';

    // Common triggers and activities
    const allTriggers = recentEntries.flatMap(entry => entry.triggers);
    const allActivities = recentEntries.flatMap(entry => entry.activities);
    
    const triggerCounts = allTriggers.reduce((acc: Record<string, number>, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {});
    
    const activityCounts = allActivities.reduce((acc: Record<string, number>, activity) => {
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {});

    const commonTriggers = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([trigger]) => trigger);

    const topActivities = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([activity]) => activity);

    setMoodStats({
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      monthlyTrend,
      streakDays,
      bestDay,
      worstDay,
      commonTriggers,
      topActivities
    });
  };

  const generateAIInsights = () => {
    if (!moodStats || moodHistory.length === 0) return;

    const insights: AIInsight[] = [];

    // Trend analysis
    if (moodStats.monthlyTrend === 'improving') {
      insights.push({
        id: '1',
        type: 'celebration',
        title: '🎉 Progres Excelent!',
        message: `Mood-ul tău a crescut cu ${((moodStats.weeklyAverage - 5) * 20).toFixed(1)}% în ultima perioadă! Continuă cu strategiile care funcționează.`,
        confidence: 0.9,
        actionable: true
      });
    } else if (moodStats.monthlyTrend === 'declining') {
      insights.push({
        id: '2',
        type: 'warning',
        title: '⚠️ Atenție la Trend',
        message: 'Observ o scădere în mood-ul tău recent. Să explorăm împreună ce s-a schimbat în rutina ta.',
        confidence: 0.8,
        actionable: true
      });
    }

    // Streak analysis
    if (moodStats.streakDays >= 7) {
      insights.push({
        id: '3',
        type: 'celebration',
        title: '🔥 Streak Incredibil!',
        message: `${moodStats.streakDays} zile consecutive cu mood bun! Ai găsit formula succesului.`,
        confidence: 0.95,
        actionable: false
      });
    }

    // Activity patterns
    if (moodStats.topActivities.includes('Exercise')) {
      insights.push({
        id: '4',
        type: 'pattern',
        title: '💪 Pattern Detectat',
        message: 'Exercițiile fizice sunt corelate pozitiv cu mood-ul tău. Încearcă să le faci mai des.',
        confidence: 0.85,
        actionable: true
      });
    }

    // Sleep correlation
    const recentEntries = moodHistory.slice(-7);
    const avgSleep = recentEntries.reduce((sum, entry) => sum + entry.sleep, 0) / recentEntries.length;
    
    if (avgSleep < 7) {
      insights.push({
        id: '5',
        type: 'recommendation',
        title: '😴 Optimizează Somnul',
        message: `Somnul tău mediu (${avgSleep.toFixed(1)}h) poate afecta mood-ul. Target: 7-9 ore/noapte.`,
        confidence: 0.9,
        actionable: true
      });
    }

    // Stress analysis
    const avgStress = recentEntries.reduce((sum, entry) => sum + entry.stress, 0) / recentEntries.length;
    
    if (avgStress >= 7) {
      insights.push({
        id: '6',
        type: 'recommendation',
        title: '💆‍♀️ Gestionează Stresul',
        message: 'Nivelul de stress este ridicat. Încearcă meditația sau tehnicile de respirație zilnic.',
        confidence: 0.87,
        actionable: true
      });
    }

    setAiInsights(insights);
  };

  const saveMoodEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const newEntry: MoodEntry = {
      id: crypto.randomUUID(),
      date: today,
      mood: currentMood,
      energy: currentEnergy,
      stress: currentStress,
      sleep: currentSleep,
      notes: todayNotes,
      triggers: selectedTriggers,
      activities: selectedActivities,
      weather: currentWeather,
      timestamp: new Date()
    };

    const updatedHistory = moodHistory.filter(entry => entry.date !== today);
    updatedHistory.push(newEntry);
    updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setMoodHistory(updatedHistory);
    setHasLoggedToday(true);
    setShowEntryForm(false);

    // Success message simulation
    setTimeout(() => {
      alert('✅ Mood logged successfully! Check AI Insights for new recommendations.');
    }, 500);
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return '#ef4444';
    if (mood <= 5) return '#f59e0b';
    if (mood <= 7) return '#06b6d4';
    return '#22c55e';
  };

  const getTimeframeDays = () => {
    switch (selectedTimeframe) {
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
    }
  };

  if (loading) {
    return (
      <div className="mood-tracker loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Se încarcă Mood Tracker...</h2>
          <p>Analizez patterns și generez insights 📊</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-tracker">
      {/* Header */}
      <div className="tracker-header">
        <button 
          onClick={() => router.push('/dashboard/por-well')}
          className="back-btn"
        >
          ← Înapoi la PorWell
        </button>
        
        <div className="header-info">
          <h1>😊 Mood Tracker Advanced</h1>
          <p>Track, analyze și optimizează-ți starea emoțională cu AI insights</p>
        </div>
        
        <div className="header-actions">
          <div className="timeframe-selector">
            {(['week', 'month', 'year'] as const).map(timeframe => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`timeframe-btn ${selectedTimeframe === timeframe ? 'active' : ''}`}
              >
                {timeframe === 'week' ? '7 zile' : timeframe === 'month' ? '30 zile' : '1 an'}
              </button>
            ))}
          </div>
          
          {!hasLoggedToday && (
            <button 
              onClick={() => setShowEntryForm(true)}
              className="log-mood-btn primary"
            >
              📝 Log Mood Azi
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="tracker-content">
        {/* Today's Summary */}
        <div className="today-summary">
          <div className="summary-card main">
            <div className="card-header">
              <h3>📅 Astăzi - {new Date().toLocaleDateString('ro-RO', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}</h3>
              {hasLoggedToday && (
                <button 
                  onClick={() => setShowEntryForm(true)}
                  className="edit-btn"
                >
                  ✏️ Editează
                </button>
              )}
            </div>
            
            {hasLoggedToday ? (
              <div className="today-metrics">
                <div className="metric">
                  <span className="metric-icon">{moodEmojis[currentMood - 1]}</span>
                  <span className="metric-value">{currentMood}/10</span>
                  <span className="metric-label">Mood</span>
                </div>
                <div className="metric">
                  <span className="metric-icon">{energyEmojis[currentEnergy - 1]}</span>
                  <span className="metric-value">{currentEnergy}/10</span>
                  <span className="metric-label">Energie</span>
                </div>
                <div className="metric">
                  <span className="metric-icon">{stressEmojis[currentStress - 1]}</span>
                  <span className="metric-value">{currentStress}/10</span>
                  <span className="metric-label">Stress</span>
                </div>
                <div className="metric">
                  <span className="metric-icon">😴</span>
                  <span className="metric-value">{currentSleep}h</span>
                  <span className="metric-label">Somn</span>
                </div>
              </div>
            ) : (
              <div className="no-entry">
                <div className="no-entry-icon">📝</div>
                <h4>Nu ai logged mood-ul azi</h4>
                <p>Durează doar 2 minute să îți trackezi starea emoțională</p>
                <button 
                  onClick={() => setShowEntryForm(true)}
                  className="log-now-btn"
                >
                  📊 Log Acum
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Stats */}
          {moodStats && (
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-value">{moodStats.weeklyAverage}</div>
                <div className="stat-label">Medie {selectedTimeframe === 'week' ? 'Săptămână' : selectedTimeframe === 'month' ? 'Lună' : 'An'}</div>
                <div className={`stat-trend ${moodStats.monthlyTrend}`}>
                  {moodStats.monthlyTrend === 'improving' ? '📈 Îmbunătățire' : 
                   moodStats.monthlyTrend === 'declining' ? '📉 Scădere' : '📊 Stabil'}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{moodStats.streakDays}</div>
                <div className="stat-label">Zile Consecutive</div>
                <div className="stat-trend positive">🔥 Mood Bun</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{moodHistory.length}</div>
                <div className="stat-label">Total Entries</div>
                <div className="stat-trend neutral">📝 Tracked</div>
              </div>
            </div>
          )}
        </div>

        {/* Charts & Analytics */}
        <div className="analytics-section">
          <div className="mood-chart-card">
            <div className="card-header">
              <h3>📈 Mood Evolution - Ultimele {getTimeframeDays()} zile</h3>
            </div>
            
            <div className="mood-chart">
              <div className="chart-container">
                {moodHistory.slice(-getTimeframeDays()).map((entry, index) => (
                  <div key={entry.id} className="chart-bar">
                    <div 
                      className="bar mood"
                      style={{ 
                        height: `${entry.mood * 10}%`,
                        backgroundColor: getMoodColor(entry.mood)
                      }}
                      title={`${entry.date}: Mood ${entry.mood}/10`}
                    ></div>
                    <div className="bar-label">
                      {new Date(entry.date).getDate()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
                  <span>Scăzut (1-3)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#f59e0b'}}></div>
                  <span>Moderat (4-5)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#06b6d4'}}></div>
                  <span>Bun (6-7)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#22c55e'}}></div>
                  <span>Excelent (8-10)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Correlations */}
          <div className="correlations-card">
            <div className="card-header">
              <h3>🔗 Patterns & Correlations</h3>
            </div>
            
            <div className="correlation-grid">
              <div className="correlation-item">
                <h4>😴 Somn vs Mood</h4>
                <div className="correlation-chart">
                  {moodHistory.slice(-7).map((entry, index) => (
                    <div key={index} className="correlation-point">
                      <div className="point-sleep" style={{height: `${entry.sleep * 10}%`}}></div>
                      <div className="point-mood" style={{height: `${entry.mood * 10}%`}}></div>
                    </div>
                  ))}
                </div>
                <div className="correlation-legend">
                  <span>🟡 Somn</span>
                  <span>🟢 Mood</span>
                </div>
              </div>
              
              <div className="correlation-item">
                <h4>💆‍♀️ Stress vs Mood</h4>
                <div className="correlation-chart">
                  {moodHistory.slice(-7).map((entry, index) => (
                    <div key={index} className="correlation-point">
                      <div className="point-stress" style={{height: `${entry.stress * 10}%`}}></div>
                      <div className="point-mood" style={{height: `${entry.mood * 10}%`}}></div>
                    </div>
                  ))}
                </div>
                <div className="correlation-legend">
                  <span>🔴 Stress</span>
                  <span>🟢 Mood</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="insights-section">
          <div className="insights-header">
            <h3>🧠 AI Insights - Personalizate pentru tine</h3>
            <p>Analize avansate bazate pe patterns și comportamente</p>
          </div>
          
          <div className="insights-grid">
            {aiInsights.map(insight => (
              <div key={insight.id} className={`insight-card ${insight.type}`}>
                <div className="insight-header">
                  <h4>{insight.title}</h4>
                  <div className="confidence-badge">
                    {Math.round(insight.confidence * 100)}% confident
                  </div>
                </div>
                <p className="insight-message">{insight.message}</p>
                {insight.actionable && (
                  <div className="insight-actions">
                    <Link href="/dashboard/por-well/ai-therapist" className="action-link">
                      🤖 Discută cu AI Therapist
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Triggers & Activities Analysis */}
        {moodStats && (
          <div className="analysis-section">
            <div className="triggers-card">
              <div className="card-header">
                <h3>⚠️ Common Triggers</h3>
              </div>
              <div className="triggers-list">
                {moodStats.commonTriggers.length > 0 ? (
                  moodStats.commonTriggers.map((trigger, index) => (
                    <div key={index} className="trigger-item">
                      <span className="trigger-name">{trigger}</span>
                      <span className="trigger-frequency">
                        {moodHistory.filter(entry => entry.triggers.includes(trigger)).length} zile
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>🎉 Nu ai triggers frecvente identificate!</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="activities-card">
              <div className="card-header">
                <h3>🌟 Top Activities</h3>
              </div>
              <div className="activities-list">
                {moodStats.topActivities.length > 0 ? (
                  moodStats.topActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <span className="activity-name">{activity}</span>
                      <span className="activity-frequency">
                        {moodHistory.filter(entry => entry.activities.includes(activity)).length} zile
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>📝 Adaugă activități pentru a vedea patterns</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mood Entry Modal */}
      {showEntryForm && (
        <div className="mood-entry-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📝 {hasLoggedToday ? 'Editează' : 'Log'} Mood-ul de Azi</h3>
              <button 
                onClick={() => setShowEntryForm(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {/* Mood Slider */}
              <div className="mood-input-section">
                <label>😊 Cum te simți? ({currentMood}/10)</label>
                <div className="mood-slider-container">
                  <div className="mood-emoji-display">
                    {moodEmojis[currentMood - 1]}
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentMood}
                    onChange={(e) => setCurrentMood(Number(e.target.value))}
                    className="mood-slider"
                  />
                  <div className="slider-labels">
                    <span>😢 Foarte trist</span>
                    <span>🌟 Fantastic</span>
                  </div>
                </div>
              </div>

              {/* Energy Slider */}
              <div className="mood-input-section">
                <label>⚡ Nivel energie ({currentEnergy}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEnergy}
                  onChange={(e) => setCurrentEnergy(Number(e.target.value))}
                  className="energy-slider"
                />
              </div>

              {/* Stress Slider */}
              <div className="mood-input-section">
                <label>💆‍♀️ Nivel stress ({currentStress}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentStress}
                  onChange={(e) => setCurrentStress(Number(e.target.value))}
                  className="stress-slider"
                />
              </div>

              {/* Sleep Input */}
              <div className="mood-input-section">
                <label>😴 Ore de somn noaptea trecută</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  step="0.5"
                  value={currentSleep}
                  onChange={(e) => setCurrentSleep(Number(e.target.value))}
                  className="sleep-input"
                />
              </div>

              {/* Triggers */}
              <div className="mood-input-section">
                <label>⚠️ Triggers de azi (opțional)</label>
                <div className="triggers-grid">
                  {commonTriggers.map(trigger => (
                    <button
                      key={trigger}
                      onClick={() => toggleTrigger(trigger)}
                      className={`trigger-btn ${selectedTriggers.includes(trigger) ? 'selected' : ''}`}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="mood-input-section">
                <label>🌟 Activități de azi (opțional)</label>
                <div className="activities-grid">
                  {positiveActivities.map(activity => (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`activity-btn ${selectedActivities.includes(activity) ? 'selected' : ''}`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mood-input-section">
                <label>📝 Note despre ziua de azi (opțional)</label>
                <textarea
                  value={todayNotes}
                  onChange={(e) => setTodayNotes(e.target.value)}
                  placeholder="Cum a fost ziua ta? Ce te-a influențat mood-ul..."
                  className="notes-textarea"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowEntryForm(false)}
                className="cancel-btn"
              >
                Anulează
              </button>
              <button 
                onClick={saveMoodEntry}
                className="save-btn"
              >
                💾 {hasLoggedToday ? 'Actualizează' : 'Salvează'} Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}