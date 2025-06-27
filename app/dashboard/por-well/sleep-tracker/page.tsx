'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './style.css';

interface SleepEntry {
  id: number;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  factors: string[];
  timestamp: string;
}

interface SleepData {
  totalNights: number;
  averageScore: number;
  streakDays: number;
  weeklyAverage: number;
  lastEntry: string | null;
  entries: SleepEntry[];
}

export default function SleepTracker() {
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [selectedQuality, setSelectedQuality] = useState(3);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [sleepData, setSleepData] = useState<SleepData>({
    totalNights: 45,
    averageScore: 8.2,
    streakDays: 12,
    weeklyAverage: 7.8,
    lastEntry: null,
    entries: []
  });

  useEffect(() => {
    // Load data from localStorage
    const stored = localStorage.getItem('porwellSleepData');
    if (stored) {
      setSleepData(JSON.parse(stored));
    }
    checkTodaysEntry();
  }, []);

  const qualityOptions = [
    { value: 1, emoji: '😴', label: 'Foarte rău' },
    { value: 2, emoji: '😔', label: 'Rău' },
    { value: 3, emoji: '😐', label: 'OK' },
    { value: 4, emoji: '😊', label: 'Bun' },
    { value: 5, emoji: '😄', label: 'Excelent' }
  ];

  const sleepFactors = [
    { id: 'caffeine', icon: '☕', label: 'Cafeină' },
    { id: 'exercise', icon: '🏃', label: 'Sport' },
    { id: 'stress', icon: '😰', label: 'Stres' },
    { id: 'screen', icon: '📱', label: 'Ecrane' },
    { id: 'alcohol', icon: '🍷', label: 'Alcool' },
    { id: 'meal', icon: '🍽️', label: 'Masă târzie' },
    { id: 'temperature', icon: '🌡️', label: 'Temperatura' },
    { id: 'meditation', icon: '🧘', label: 'Meditație' }
  ];

  const calculateSleepDuration = (bedTime: string, wakeTime: string): number => {
    const bed = new Date(`2000-01-01 ${bedTime}`);
    let wake = new Date(`2000-01-01 ${wakeTime}`);
    
    // If wake time is earlier than bed time, assume it's next day
    if (wake < bed) {
      wake.setDate(wake.getDate() + 1);
    }
    
    const diffMs = wake.getTime() - bed.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours;
  };

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  const logSleep = () => {
    if (!bedTime || !wakeTime) {
      alert('Te rog completează orele de culcare și trezire.');
      return;
    }

    const sleepDuration = calculateSleepDuration(bedTime, wakeTime);
    const today = new Date().toISOString().split('T')[0];

    const sleepEntry: SleepEntry = {
      id: Date.now(),
      date: today,
      bedTime: bedTime,
      wakeTime: wakeTime,
      duration: sleepDuration,
      quality: selectedQuality,
      factors: [...selectedFactors],
      timestamp: new Date().toISOString()
    };

    const updatedData = { ...sleepData };
    const existingIndex = updatedData.entries.findIndex(entry => entry.date === today);

    if (existingIndex >= 0) {
      updatedData.entries[existingIndex] = sleepEntry;
    } else {
      updatedData.entries.push(sleepEntry);
    }

    // Update statistics
    updateSleepStats(updatedData);

    // Keep only last 90 days
    updatedData.entries = updatedData.entries.slice(-90);

    setSleepData(updatedData);
    localStorage.setItem('porwellSleepData', JSON.stringify(updatedData));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const updateSleepStats = (data: SleepData) => {
    const recentEntries = data.entries.slice(-30);

    if (recentEntries.length > 0) {
      // Calculate average quality
      const avgQuality = recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length;
      data.averageScore = (avgQuality * 2);

      // Calculate streak
      let streak = 0;
      const today = new Date().toDateString();
      let currentDate = new Date();

      for (let i = recentEntries.length - 1; i >= 0; i--) {
        const entryDate = new Date(recentEntries[i].date).toDateString();
        const checkDate = currentDate.toDateString();

        if (entryDate === checkDate) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      data.streakDays = streak;

      // Calculate weekly average
      const lastWeek = recentEntries.slice(-7);
      if (lastWeek.length > 0) {
        const weeklyAvg = lastWeek.reduce((sum, entry) => sum + entry.duration, 0) / lastWeek.length;
        data.weeklyAverage = weeklyAvg;
      }

      data.totalNights = data.entries.length;
    }
  };

  const checkTodaysEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysEntry = sleepData.entries.find(entry => entry.date === today);

    if (todaysEntry) {
      setBedTime(todaysEntry.bedTime);
      setWakeTime(todaysEntry.wakeTime);
      setSelectedQuality(todaysEntry.quality);
      setSelectedFactors(todaysEntry.factors);
    }
  };

  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getScoreCircle = () => {
    const score = sleepData.averageScore;
    const circumference = 377;
    const offset = circumference * (1 - score / 10);
    return { circumference, offset };
  };

  const { circumference, offset } = getScoreCircle();

  return (
    <div className="sleep-tracker-container">
      <Link href="/dashboard/por-well" className="back-btn">
        ← Înapoi la Dashboard
      </Link>
      
      <div className="header">
        <h1>💤 Sleep Tracker</h1>
        <p>Monitorizează și îmbunătățește calitatea somnului pentru wellness mental optimal</p>
      </div>
      
      <div className="sleep-overview">
        <div className="sleep-main">
          <div className="sleep-score">
            <div className="score-circle">
              <svg>
                <circle cx="75" cy="75" r="60" className="bg"></circle>
                <circle 
                  cx="75" 
                  cy="75" 
                  r="60" 
                  className="progress"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset
                  }}
                ></circle>
              </svg>
              <div className="score-value">{sleepData.averageScore.toFixed(1)}</div>
            </div>
            <div className="score-label">Sleep Quality Score</div>
          </div>
          
          <div className="sleep-breakdown">
            <div className="breakdown-item">
              <div className="breakdown-icon">⏰</div>
              <div className="breakdown-value">{formatDuration(sleepData.weeklyAverage)}</div>
              <div className="breakdown-label">Durata Medie</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-icon">📊</div>
              <div className="breakdown-value">87%</div>
              <div className="breakdown-label">Eficiență</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-icon">🌙</div>
              <div className="breakdown-value">2h 15m</div>
              <div className="breakdown-label">Somn Profund</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-icon">💭</div>
              <div className="breakdown-value">1h 45m</div>
              <div className="breakdown-label">REM Sleep</div>
            </div>
          </div>
        </div>
        
        <div className="sleep-stats">
          <div className="quick-stats">
            <div className="stat-item">
              <div className="stat-icon">🛏️</div>
              <div className="stat-info">
                <div className="stat-value">{bedTime}</div>
                <div className="stat-label">Ora de culcare</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <div className="stat-value">{wakeTime}</div>
                <div className="stat-label">Ora de trezire</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <div className="stat-value">{sleepData.streakDays} zile</div>
                <div className="stat-label">Streak actual</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <div className="stat-value">{sleepData.totalNights}</div>
                <div className="stat-label">Nopți înregistrate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="sleep-input">
        <div className="input-card">
          <h3 className="card-title">⏰ Timp de Somn</h3>
          <div className="time-input-group">
            <div className="input-group">
              <label className="input-label">Ora de culcare</label>
              <input
                type="time"
                className="time-input"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Ora de trezire</label>
              <input
                type="time"
                className="time-input"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Durata calculată</label>
            <div className="duration-display">
              {formatDuration(calculateSleepDuration(bedTime, wakeTime))}
            </div>
          </div>
        </div>

        <div className="input-card">
          <h3 className="card-title">😴 Calitatea Somnului</h3>
          <div className="quality-selector">
            {qualityOptions.map((option) => (
              <div
                key={option.value}
                className={`quality-option ${selectedQuality === option.value ? 'selected' : ''}`}
                onClick={() => setSelectedQuality(option.value)}
              >
                <span className="quality-emoji">{option.emoji}</span>
                <span className="quality-text">{option.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="input-card">
          <h3 className="card-title">🎯 Factori de Influență</h3>
          <div className="factors-grid">
            {sleepFactors.map((factor) => (
              <div
                key={factor.id}
                className={`factor-item ${selectedFactors.includes(factor.id) ? 'selected' : ''}`}
                onClick={() => toggleFactor(factor.id)}
              >
                <div className="factor-icon">{factor.icon}</div>
                <div className="factor-label">{factor.label}</div>
              </div>
            ))}
          </div>
          <button className="log-btn" onClick={logSleep}>
            💤 Înregistrează Somnul
          </button>
          
          {showSuccess && (
            <div className="success-message">
              <h3>✅ Somn înregistrat cu succes!</h3>
              <p>Datele tale vor fi analizate pentru a-ți îmbunătăți calitatea somnului.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}