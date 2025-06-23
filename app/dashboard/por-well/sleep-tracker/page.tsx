'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
      <style jsx>{`
        .sleep-tracker-container {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0a0f0a 0%, #1e1b4b 100%);
          color: #ffffff;
          min-height: 100vh;
          padding: 2rem;
          position: relative;
        }

        .sleep-tracker-container::before {
          content: '';
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(circle at 25% 25%, rgba(139,92,246,0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(30,27,75,0.2) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
          animation: nightPulse 20s ease-in-out infinite;
        }

        @keyframes nightPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.01); }
        }

        .back-btn {
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 0.8rem 1.5rem;
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.4s ease;
          display: inline-block;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .back-btn:hover {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #8b5cf6, #22c55e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .header p {
          color: #a3a3a3;
          font-size: 1.1rem;
        }

        .sleep-overview {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }

        .sleep-main {
          background: rgba(17,27,17,0.7);
          backdrop-filter: blur(25px);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(139,92,246,0.15);
        }

        .sleep-stats {
          background: rgba(17,27,17,0.7);
          backdrop-filter: blur(25px);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(139,92,246,0.15);
        }

        .sleep-score {
          text-align: center;
          margin-bottom: 2rem;
        }

        .score-circle {
          width: 150px;
          height: 150px;
          margin: 0 auto 1rem;
          position: relative;
        }

        .score-circle svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .score-circle circle {
          fill: none;
          stroke-width: 12;
          stroke-linecap: round;
        }

        .score-circle .bg {
          stroke: rgba(255,255,255,0.12);
        }

        .score-circle .progress {
          stroke: #8b5cf6;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${offset};
          transition: stroke-dashoffset 2s ease;
        }

        .score-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2.5rem;
          font-weight: 800;
          color: #8b5cf6;
        }

        .score-label {
          font-size: 1.1rem;
          color: #a3a3a3;
          text-align: center;
        }

        .sleep-breakdown {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .breakdown-item {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .breakdown-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .breakdown-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #8b5cf6;
          margin-bottom: 0.5rem;
        }

        .breakdown-label {
          font-size: 0.9rem;
          color: #a3a3a3;
        }

        .quick-stats {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stat-item {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 1.2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 1.5rem;
          width: 40px;
          text-align: center;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #a3a3a3;
        }

        .sleep-input {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }

        .input-card {
          background: rgba(17,27,17,0.7);
          backdrop-filter: blur(25px);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(139,92,246,0.15);
        }

        .card-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #8b5cf6;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .time-input-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-weight: 600;
          color: #ffffff;
          font-size: 0.9rem;
        }

        .time-input {
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 1rem;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.4s ease;
        }

        .time-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }

        .quality-selector {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }

        .quality-option {
          background: rgba(255,255,255,0.08);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 1rem 0.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s ease;
        }

        .quality-option:hover {
          border-color: rgba(255,255,255,0.15);
        }

        .quality-option.selected {
          border-color: #8b5cf6;
          background: rgba(139,92,246,0.1);
        }

        .quality-emoji {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .quality-label {
          font-size: 0.8rem;
          color: #a3a3a3;
        }

        .factors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .factor-item {
          background: rgba(255,255,255,0.08);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s ease;
        }

        .factor-item:hover {
          border-color: rgba(255,255,255,0.15);
        }

        .factor-item.selected {
          border-color: #8b5cf6;
          background: rgba(139,92,246,0.1);
        }

        .factor-icon {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .factor-label {
          font-size: 0.8rem;
          color: #a3a3a3;
        }

        .submit-btn {
          background: linear-gradient(135deg, #8b5cf6, #22c55e);
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.4s ease;
          width: 100%;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139,92,246,0.3);
        }

        .success-message {
          background: rgba(34,197,94,0.1);
          border: 2px solid #22c55e;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          margin-top: 1rem;
          opacity: ${showSuccess ? 1 : 0};
          transform: translateY(${showSuccess ? 0 : 20}px);
          transition: all 0.4s ease;
        }

        @media (max-width: 1024px) {
          .sleep-overview {
            grid-template-columns: 1fr;
          }
          
          .sleep-breakdown {
            grid-template-columns: 1fr;
          }
          
          .quality-selector {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .sleep-input {
            grid-template-columns: 1fr;
          }
          
          .time-input-group {
            grid-template-columns: 1fr;
          }
          
          .factors-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

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
                <circle cx="75" cy="75" r="60" className="progress"></circle>
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
                <div className="stat-value">{sleepData.streakDays}</div>
                <div className="stat-label">Zile consecutive</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <div className="stat-value">{sleepData.averageScore.toFixed(1)}</div>
                <div className="stat-label">Media săptămânii</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="sleep-input">
        <div className="input-card">
          <h3 className="card-title">📝 Loghează Somnul de Azi</h3>
          
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
            <label className="input-label">Cum ai dormit?</label>
            <div className="quality-selector">
              {qualityOptions.map((option) => (
                <div
                  key={option.value}
                  className={`quality-option ${selectedQuality === option.value ? 'selected' : ''}`}
                  onClick={() => setSelectedQuality(option.value)}
                >
                  <span className="quality-emoji">{option.emoji}</span>
                  <span className="quality-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button className="submit-btn" onClick={logSleep}>
            💾 Salvează Datele Somnului
          </button>
          
          <div className="success-message">
            <h3>✅ Somn înregistrat cu succes!</h3>
            <p>Tracking-ul consistent îți va îmbunătăți calitatea somnului!</p>
          </div>
        </div>
        
        <div className="input-card">
          <h3 className="card-title">🎯 Factori de Influență</h3>
          
          <div className="input-group">
            <label className="input-label">Ce a influențat somnul tău?</label>
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
          </div>
        </div>
      </div>
    </div>
  );
}