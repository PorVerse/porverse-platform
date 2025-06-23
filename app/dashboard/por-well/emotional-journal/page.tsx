'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JournalEntry {
  id: number;
  date: string;
  emotion: string;
  emotionEmoji: string;
  intensity: number;
  text: string;
  wordCount: number;
  timestamp: string;
}

interface JournalData {
  totalEntries: number;
  streakDays: number;
  totalWords: number;
  dominantEmotion: string;
  entries: JournalEntry[];
  emotionFrequency: { [key: string]: number };
}

export default function EmotionalJournal() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedEmotionEmoji, setSelectedEmotionEmoji] = useState<string | null>(null);
  const [currentIntensity, setCurrentIntensity] = useState(5);
  const [journalText, setJournalText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [journalData, setJournalData] = useState<JournalData>({
    totalEntries: 23,
    streakDays: 7,
    totalWords: 2847,
    dominantEmotion: 'fericit',
    entries: [],
    emotionFrequency: {
      fericit: 15,
      linistit: 12,
      anxios: 5,
      trist: 3,
      recunoscator: 8,
      confuz: 2,
      furios: 1,
      entuziasmat: 6
    }
  });

  useEffect(() => {
    // Load data from localStorage
    const stored = localStorage.getItem('porwellJournalData');
    if (stored) {
      setJournalData(JSON.parse(stored));
    }
    checkTodaysEntry();
  }, []);

  const emotions = [
    { id: 'fericit', emoji: '😊', name: 'Fericit' },
    { id: 'recunoscator', emoji: '🙏', name: 'Recunoscător' },
    { id: 'anxios', emoji: '😰', name: 'Anxios' },
    { id: 'trist', emoji: '😢', name: 'Trist' },
    { id: 'furios', emoji: '😠', name: 'Furios' },
    { id: 'confuz', emoji: '😕', name: 'Confuz' },
    { id: 'entuziasmat', emoji: '🤩', name: 'Entuziasmat' },
    { id: 'linistit', emoji: '😌', name: 'Liniștit' }
  ];

  const prompts = [
    'Ce evenimente din ziua de astăzi m-au influențat cel mai mult?',
    'Pentru ce sunt recunoscător/ă astăzi?',
    'Ce emoții am simțit și de ce cred că au apărut?',
    'Ce am învățat despre mine astăzi?',
    'Cu ce provocări m-am confruntat și cum le-am gestionat?'
  ];

  const selectEmotion = (emotion: string, emoji: string) => {
    setSelectedEmotion(emotion);
    setSelectedEmotionEmoji(emoji);
  };

  const usePrompt = (promptText: string) => {
    if (journalText.trim() === '') {
      setJournalText(promptText + '\n\n');
    } else {
      setJournalText(journalText + '\n\n' + promptText + '\n\n');
    }
  };

  const saveEntry = () => {
    const text = journalText.trim();

    if (!selectedEmotion) {
      alert('Te rog selectează o emoție înainte de a salva.');
      return;
    }

    if (text.length < 20) {
      alert('Scrie cel puțin câteva cuvinte despre experiența ta.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const wordCount = text.split(/\s+/).length;

    const entry: JournalEntry = {
      id: Date.now(),
      date: today,
      emotion: selectedEmotion,
      emotionEmoji: selectedEmotionEmoji!,
      intensity: currentIntensity,
      text: text,
      wordCount: wordCount,
      timestamp: new Date().toISOString()
    };

    const updatedData = { ...journalData };
    const existingIndex = updatedData.entries.findIndex(entry => entry.date === today);

    if (existingIndex >= 0) {
      updatedData.entries[existingIndex] = entry;
    } else {
      updatedData.entries.push(entry);
      updatedData.totalEntries++;
    }

    // Update emotion frequency
    updatedData.emotionFrequency[selectedEmotion] = (updatedData.emotionFrequency[selectedEmotion] || 0) + 1;

    // Update statistics
    updateJournalStats(updatedData);

    // Keep only last 100 entries
    updatedData.entries = updatedData.entries.slice(-100);

    setJournalData(updatedData);
    localStorage.setItem('porwellJournalData', JSON.stringify(updatedData));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const updateJournalStats = (data: JournalData) => {
    const recentEntries = data.entries.slice(-30);

    if (recentEntries.length > 0) {
      // Calculate total words
      data.totalWords = data.entries.reduce((sum, entry) => sum + entry.wordCount, 0);

      // Calculate streak
      let streak = 0;
      const today = new Date();
      let currentDate = new Date(today);

      for (let i = recentEntries.length - 1; i >= 0; i--) {
        const entryDate = new Date(recentEntries[i].date);
        const checkDate = new Date(currentDate.toDateString());
        const entryDateString = new Date(entryDate.toDateString());

        if (entryDateString.getTime() === checkDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      data.streakDays = streak;

      // Find dominant emotion
      const emotionCounts: { [key: string]: number } = {};
      recentEntries.forEach(entry => {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      });

      const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
        emotionCounts[a] > emotionCounts[b] ? a : b
      );

      data.dominantEmotion = dominantEmotion;
    }
  };

  const checkTodaysEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysEntry = journalData.entries.find(entry => entry.date === today);

    if (todaysEntry) {
      selectEmotion(todaysEntry.emotion, todaysEntry.emotionEmoji);
      setCurrentIntensity(todaysEntry.intensity);
      setJournalText(todaysEntry.text);
    }
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEmotionPercentage = (emotion: string): number => {
    const total = Object.values(journalData.emotionFrequency).reduce((sum, count) => sum + count, 0);
    const count = journalData.emotionFrequency[emotion] || 0;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className="journal-container">
      <style jsx>{`
        .journal-container {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0a0f0a 0%, #111b11 100%);
          color: #ffffff;
          min-height: 100vh;
          padding: 2rem;
          position: relative;
        }

        .journal-container::before {
          content: '';
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(circle at 30% 20%, rgba(245,158,11,0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(34,197,94,0.1) 0%, transparent 50%),
            radial-gradient(circle at 20% 70%, rgba(139,92,246,0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
          animation: journalPulse 18s ease-in-out infinite;
        }

        @keyframes journalPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          33% { opacity: 0.8; transform: scale(1.01); }
          66% { opacity: 1; transform: scale(1.02); }
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
          background: linear-gradient(135deg, #f59e0b, #22c55e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .header p {
          color: #a3a3a3;
          font-size: 1.1rem;
        }

        .journal-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }

        .journal-main {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .entry-card {
          background: rgba(17,27,17,0.7);
          backdrop-filter: blur(25px);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(245,158,11,0.15);
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .entry-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f59e0b;
        }

        .entry-date {
          color: #a3a3a3;
          font-size: 0.9rem;
        }

        .emotion-selector {
          margin-bottom: 2rem;
        }

        .emotion-label {
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 1rem;
          display: block;
        }

        .emotion-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .emotion-item {
          background: rgba(255,255,255,0.08);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s ease;
        }

        .emotion-item:hover {
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }

        .emotion-item.selected {
          border-color: #f59e0b;
          background: rgba(245,158,11,0.1);
        }

        .emotion-emoji {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .emotion-name {
          font-size: 0.9rem;
          color: #ffffff;
          font-weight: 600;
        }

        .intensity-slider {
          margin-bottom: 2rem;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .intensity-range {
          flex: 1;
          -webkit-appearance: none;
          height: 8px;
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
          outline: none;
          transition: all 0.4s ease;
        }

        .intensity-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: #f59e0b;
          border-radius: 50%;
          cursor: pointer;
        }

        .intensity-value {
          font-weight: 700;
          color: #f59e0b;
          font-size: 1.1rem;
          min-width: 60px;
          text-align: center;
        }

        .entry-prompts {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .prompts-title {
          font-weight: 600;
          color: #f59e0b;
          margin-bottom: 1rem;
        }

        .prompt-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .prompt-item {
          color: #a3a3a3;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.4s ease;
          padding: 0.5rem;
          border-radius: 6px;
        }

        .prompt-item:hover {
          color: #f59e0b;
          background: rgba(245,158,11,0.1);
        }

        .writing-area {
          margin-bottom: 2rem;
        }

        .writing-textarea {
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 1.5rem;
          color: #ffffff;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.6;
          min-height: 200px;
          resize: vertical;
          transition: all 0.4s ease;
        }

        .writing-textarea:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }

        .writing-textarea::placeholder {
          color: #666;
        }

        .save-btn {
          background: linear-gradient(135deg, #f59e0b, #22c55e);
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

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(245,158,11,0.3);
        }

        .journal-sidebar {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .stats-card {
          background: rgba(17,27,17,0.7);
          backdrop-filter: blur(25px);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(245,158,11,0.15);
        }

        .stats-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #f59e0b;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255,255,255,0.08);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .stat-label {
          color: #a3a3a3;
          font-size: 0.9rem;
        }

        .stat-value {
          font-weight: 700;
          color: #f59e0b;
        }

        .emotions-chart {
          background: rgba(17,27,17,0.7);
          backdrop-filter: blur(25px);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(245,158,11,0.15);
        }

        .chart-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #f59e0b;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .emotion-bars {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .emotion-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .emotion-bar-label {
          min-width: 80px;
          font-size: 0.9rem;
          color: #a3a3a3;
        }

        .emotion-bar-track {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
          overflow: hidden;
        }

        .emotion-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #22c55e);
          border-radius: 4px;
          transition: width 1s ease-out;
        }

        .emotion-bar-value {
          min-width: 30px;
          font-size: 0.8rem;
          color: #f59e0b;
          font-weight: 600;
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
          .journal-layout {
            grid-template-columns: 1fr;
          }
          
          .emotion-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .emotion-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .slider-container {
            flex-direction: column;
            gap: 1rem;
          }
          
          .writing-textarea {
            min-height: 150px;
          }
        }
      `}</style>

      <Link href="/dashboard/por-well" className="back-btn">
        ← Înapoi la Dashboard
      </Link>
      
      <div className="header">
        <h1>📝 Jurnal Emoțional</h1>
        <p>Explorează și înțelege-ți emoțiile pentru o dezvoltare personală profundă</p>
      </div>
      
      <div className="journal-layout">
        <div className="journal-main">
          <div className="entry-card">
            <div className="entry-header">
              <h2 className="entry-title">Intrarea de Astăzi</h2>
              <span className="entry-date">{formatDate()}</span>
            </div>
            
            <div className="emotion-selector">
              <label className="emotion-label">Ce emoție predominantă simți acum?</label>
              <div className="emotion-grid">
                {emotions.map((emotion) => (
                  <div
                    key={emotion.id}
                    className={`emotion-item ${selectedEmotion === emotion.id ? 'selected' : ''}`}
                    onClick={() => selectEmotion(emotion.id, emotion.emoji)}
                  >
                    <span className="emotion-emoji">{emotion.emoji}</span>
                    <span className="emotion-name">{emotion.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="intensity-slider">
              <label className="emotion-label">Intensitatea emoției (1-10)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  className="intensity-range" 
                  min="1" 
                  max="10" 
                  value={currentIntensity}
                  onChange={(e) => setCurrentIntensity(parseInt(e.target.value))}
                />
                <span className="intensity-value">{currentIntensity}</span>
              </div>
            </div>
            
            <div className="entry-prompts">
              <h4 className="prompts-title">💡 Întrebări ghidare (click pentru a utiliza)</h4>
              <div className="prompt-list">
                {prompts.map((prompt, index) => (
                  <div key={index} className="prompt-item" onClick={() => usePrompt(prompt)}>
                    • {prompt}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="writing-area">
              <label className="emotion-label">Scrie-ți gândurile și experiențele</label>
              <textarea 
                className="writing-textarea"
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Începe să scrii aici... Explorează emoțiile tale, experiențele zilei, gândurile care te preocupă sau te bucură. Nu există răspunsuri greșite - doar onestitatea ta personală."
              />
            </div>
            
            <button className="save-btn" onClick={saveEntry}>
              📝 Salvează Intrarea în Jurnal
            </button>
            
            <div className="success-message">
              <h3>✅ Intrarea a fost salvată!</h3>
              <p>Continuitatea în jurnal îți va aduce claritate și dezvoltare personală.</p>
            </div>
          </div>
        </div>
        
        <div className="journal-sidebar">
          <div className="stats-card">
            <h3 className="stats-title">📊 Statistici Jurnal</h3>
            <div className="stat-item">
              <span className="stat-label">Intrări totale</span>
              <span className="stat-value">{journalData.totalEntries}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Streak zile</span>
              <span className="stat-value">{journalData.streakDays}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cuvinte scrise</span>
              <span className="stat-value">{journalData.totalWords.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Emoția dominantă</span>
              <span className="stat-value">
                {emotions.find(e => e.id === journalData.dominantEmotion)?.emoji} {journalData.dominantEmotion}
              </span>
            </div>
          </div>
          
          <div className="emotions-chart">
            <h3 className="chart-title">💭 Emoții Frecvente</h3>
            <div className="emotion-bars">
              {Object.entries(journalData.emotionFrequency)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 4)
                .map(([emotion, count]) => (
                <div key={emotion} className="emotion-bar">
                  <span className="emotion-bar-label">{emotion}</span>
                  <div className="emotion-bar-track">
                    <div 
                      className="emotion-bar-fill" 
                      style={{ width: `${getEmotionPercentage(emotion)}%` }}
                    ></div>
                  </div>
                  <span className="emotion-bar-value">{getEmotionPercentage(emotion)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}