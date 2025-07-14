'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './style.module.css';

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
            
            {showSuccess && (
              <div className="success-message">
                <h3>✅ Intrarea a fost salvată!</h3>
                <p>Continuitatea în jurnal îți va aduce claritate și dezvoltare personală.</p>
              </div>
            )}
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