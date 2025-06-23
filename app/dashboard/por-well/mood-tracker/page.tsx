'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface MoodEntry {
  id: string;
  mood: 'excellent' | 'good' | 'neutral' | 'low' | 'poor';
  energy: number;
  notes: string;
  factors: string[];
  date: string;
  timestamp: Date;
}

interface MoodStats {
  weeklyAverage: number;
  monthlyTrend: 'improving' | 'stable' | 'declining';
  dominantMood: string;
  energyPattern: string;
  triggerFactors: string[];
  streakDays: number;
}

const moodOptions = [
  { value: 'excellent', emoji: '😄', label: 'Excelent', color: '#22c55e' },
  { value: 'good', emoji: '😊', label: 'Bun', color: '#84cc16' },
  { value: 'neutral', emoji: '😐', label: 'Neutru', color: '#f59e0b' },
  { value: 'low', emoji: '😔', label: 'Scăzut', color: '#f97316' },
  { value: 'poor', emoji: '😢', label: 'Prost', color: '#ef4444' }
];

const moodFactors = [
  { id: 'work', label: 'Muncă', icon: '💼' },
  { id: 'relationships', label: 'Relații', icon: '👥' },
  { id: 'sleep', label: 'Somn', icon: '😴' },
  { id: 'exercise', label: 'Exerciții', icon: '🏃‍♂️' },
  { id: 'weather', label: 'Vreme', icon: '🌤️' },
  { id: 'nutrition', label: 'Alimentație', icon: '🥗' },
  { id: 'social', label: 'Social', icon: '🎉' },
  { id: 'stress', label: 'Stres', icon: '😰' },
  { id: 'health', label: 'Sănătate', icon: '🏥' },
  { id: 'finance', label: 'Finanse', icon: '💰' }
];

export default function MoodTrackerPage() {
  const router = useRouter();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [energy, setEnergy] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [view, setView] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    loadMoodData();
  }, []);

  useEffect(() => {
    if (moodEntries.length > 0) {
      calculateStats();
      generateAIInsights();
    }
  }, [moodEntries]);

  const loadMoodData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual Xano API call
      const mockData: MoodEntry[] = [
        {
          id: '1',
          mood: 'good',
          energy: 7,
          notes: 'Zi productivă la muncă',
          factors: ['work', 'exercise'],
          date: '2025-06-19',
          timestamp: new Date('2025-06-19T09:00:00')
        },
        {
          id: '2',
          mood: 'excellent',
          energy: 9,
          notes: 'Weekend relaxant',
          factors: ['social', 'sleep'],
          date: '2025-06-18',
          timestamp: new Date('2025-06-18T10:30:00')
        },
        {
          id: '3',
          mood: 'neutral',
          energy: 5,
          notes: 'Zi obișnuită',
          factors: ['work'],
          date: '2025-06-17',
          timestamp: new Date('2025-06-17T14:00:00')
        },
        {
          id: '4',
          mood: 'low',
          energy: 3,
          notes: 'Stres la serviciu',
          factors: ['work', 'stress'],
          date: '2025-06-16',
          timestamp: new Date('2025-06-16T16:00:00')
        },
        {
          id: '5',
          mood: 'good',
          energy: 8,
          notes: 'Alergare dimineața',
          factors: ['exercise', 'weather'],
          date: '2025-06-15',
          timestamp: new Date('2025-06-15T07:00:00')
        }
      ];
      setMoodEntries(mockData);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMoodEntry = async () => {
    if (!selectedMood) return;

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood as any,
      energy,
      notes,
      factors: selectedFactors,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date()
    };

    try {
      // TODO: Save to Xano API
      setMoodEntries(prev => [newEntry, ...prev]);
      
      // Reset form
      setSelectedMood('');
      setEnergy(5);
      setNotes('');
      setSelectedFactors([]);
      setShowAddForm(false);
      
      // Show success message
      alert('Mood înregistrat cu succes!');
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('Eroare la salvarea mood-ului');
    }
  };

  const calculateStats = () => {
    const moodValues = { excellent: 5, good: 4, neutral: 3, low: 2, poor: 1 };
    const recentEntries = moodEntries.slice(0, 7);
    
    const weeklyAverage = recentEntries.reduce((sum, entry) => 
      sum + moodValues[entry.mood], 0) / recentEntries.length;
    
    const monthlyEntries = moodEntries.slice(0, 30);
    const monthlyAverage = monthlyEntries.reduce((sum, entry) => 
      sum + moodValues[entry.mood], 0) / monthlyEntries.length;
    
    const monthlyTrend = monthlyAverage > weeklyAverage ? 'improving' : 
                        monthlyAverage === weeklyAverage ? 'stable' : 'declining';
    
    const moodCounts = moodEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'neutral');
    
    const avgEnergy = moodEntries.reduce((sum, entry) => sum + entry.energy, 0) / moodEntries.length;
    const energyPattern = avgEnergy > 7 ? 'high' : avgEnergy > 4 ? 'moderate' : 'low';
    
    const allFactors = moodEntries.flatMap(entry => entry.factors);
    const factorCounts = allFactors.reduce((acc, factor) => {
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const triggerFactors = Object.keys(factorCounts)
      .sort((a, b) => factorCounts[b] - factorCounts[a])
      .slice(0, 3);
    
    const streakDays = calculateMoodStreak();
    
    setStats({
      weeklyAverage,
      monthlyTrend,
      dominantMood,
      energyPattern,
      triggerFactors,
      streakDays
    });
  };

  const calculateMoodStreak = (): number => {
    let streak = 0;
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const generateAIInsights = async () => {
    try {
      const recentMoods = moodEntries.slice(0, 7);
      const moodValues = { excellent: 5, good: 4, neutral: 3, low: 2, poor: 1 };
      const avgMood = recentMoods.reduce((sum, entry) => sum + moodValues[entry.mood], 0) / recentMoods.length;
      
      let insights = '';
      
      if (avgMood >= 4) {
        insights = `🌟 Mood-ul tău arată un trend pozitiv cu o medie de ${avgMood.toFixed(1)}/5! Pattern-urile tale sugerează că ${stats?.triggerFactors[0] || 'exercițiile'} au impact pozitiv asupra stării tale emoționale.`;
      } else if (avgMood >= 3) {
        insights = `⚖️ Mood-ul tău este echilibrat (${avgMood.toFixed(1)}/5), cu variații normale. Observ că ${stats?.triggerFactors[0] || 'munca'} influențează frecvent starea ta emoțională.`;
      } else {
        insights = `💙 Observ că mood-ul tău a fost mai scăzut recent (${avgMood.toFixed(1)}/5). Factori precum ${stats?.triggerFactors.join(', ') || 'stresul'} par să aibă impact negativ. Îți recomand să explorezi tehnici de relaxare și să contactezi suportul profesional dacă este necesar.`;
      }
      
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  const getChartData = () => {
    const moodValues = { excellent: 5, good: 4, neutral: 3, low: 2, poor: 1 };
    
    return moodEntries
      .slice(0, view === 'week' ? 7 : view === 'month' ? 30 : 1)
      .reverse()
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString('ro-RO', { 
          month: 'short', 
          day: 'numeric' 
        }),
        mood: moodValues[entry.mood],
        energy: entry.energy,
        moodLabel: entry.mood
      }));
  };

  const getMoodDistribution = () => {
    const distribution = moodEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return moodOptions.map(option => ({
      name: option.label,
      value: distribution[option.value] || 0,
      color: option.color
    }));
  };

  const getFactorAnalysis = () => {
    const factorCounts = moodEntries.flatMap(entry => entry.factors)
      .reduce((acc, factor) => {
        acc[factor] = (acc[factor] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.keys(factorCounts)
      .map(factorId => {
        const factor = moodFactors.find(f => f.id === factorId);
        return {
          name: factor?.label || factorId,
          count: factorCounts[factorId],
          icon: factor?.icon || '📊'
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(f => f !== factorId)
        : [...prev, factorId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading mood data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-transparent to-cyan-500/10 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/por-well')}
            className="mb-4 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold hover:bg-purple-500 hover:border-purple-500 transition-all duration-300"
          >
            ← Înapoi la Dashboard
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                😊 Mood Tracker
              </h1>
              <p className="text-gray-300 text-lg">
                Urmărește-ți starea emoțională și descoperă pattern-urile
              </p>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              + Adaugă Mood
            </button>
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
              🧠 AI Insights
            </h3>
            <p className="text-gray-300 leading-relaxed">{aiInsights}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {stats?.weeklyAverage.toFixed(1)}/5
            </div>
            <div className="text-gray-300 text-sm">Medie Săptămână</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400">
              {stats?.streakDays}
            </div>
            <div className="text-gray-300 text-sm">Zile Consecutiv</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">
              {stats?.monthlyTrend === 'improving' ? '📈' : stats?.monthlyTrend === 'declining' ? '📉' : '📊'}
            </div>
            <div className="text-gray-300 text-sm">Trend Luna</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {moodOptions.find(m => m.value === stats?.dominantMood)?.emoji || '😐'}
            </div>
            <div className="text-gray-300 text-sm">Mood Dominant</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Toggle */}
            <div className="flex gap-2 justify-center">
              {(['today', 'week', 'month'] as const).map((viewOption) => (
                <button
                  key={viewOption}
                  onClick={() => setView(viewOption)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    view === viewOption
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {viewOption === 'today' ? 'Astăzi' : viewOption === 'week' ? 'Săptămâna' : 'Luna'}
                </button>
              ))}
            </div>

            {/* Mood Trend Chart */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📈 Trend Mood & Energie</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis domain={[0, 10]} stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    name="Mood (1-5)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    name="Energie (1-10)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Mood Distribution */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🎯 Distribuția Mood-urilor</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getMoodDistribution()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {getMoodDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Entries */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📝 Înregistrări Recente</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {moodEntries.slice(0, 5).map((entry) => {
                  const moodOption = moodOptions.find(m => m.value === entry.mood);
                  return (
                    <div key={entry.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{moodOption?.emoji}</span>
                        <span className="text-xs text-gray-400">{entry.date}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        Energie: {entry.energy}/10
                      </div>
                      {entry.notes && (
                        <div className="text-xs text-gray-400 mt-1">
                          "{entry.notes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Factor Analysis */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🔍 Analiza Factorilor</h3>
              <div className="space-y-3">
                {getFactorAnalysis().map((factor, index) => (
                  <div key={factor.name} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{factor.icon}</span>
                      <span className="text-sm text-gray-300">{factor.name}</span>
                    </div>
                    <span className="text-purple-400 font-semibold">{factor.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">⚡ Acțiuni Rapide</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/dashboard/por-well/chat')}
                  className="w-full p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-left text-sm text-purple-300 hover:bg-purple-500/30 transition-all duration-300"
                >
                  🤖 Vorbește cu AI Therapist
                </button>
                <button
                  onClick={() => router.push('/dashboard/por-well/meditation')}
                  className="w-full p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-left text-sm text-cyan-300 hover:bg-cyan-500/30 transition-all duration-300"
                >
                  🧘 Sesiune de Meditație
                </button>
                <button
                  onClick={() => router.push('/dashboard/por-well/stress-management')}
                  className="w-full p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-left text-sm text-green-300 hover:bg-green-500/30 transition-all duration-300"
                >
                  💆 Stress Management
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Mood Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Adaugă Mood-ul Tău</h2>
              
              {/* Mood Selection */}
              <div className="mb-6">
                <label className="text-white font-semibold mb-3 block">Cum te simți?</label>
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedMood(option.value)}
                      className={`p-3 rounded-lg text-center transition-all duration-300 ${
                        selectedMood === option.value
                          ? 'bg-purple-500 border-2 border-purple-400'
                          : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="text-xs text-gray-300">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div className="mb-6">
                <label className="text-white font-semibold mb-3 block">
                  Nivel Energie: {energy}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Factors */}
              <div className="mb-6">
                <label className="text-white font-semibold mb-3 block">Factori de influență</label>
                <div className="grid grid-cols-2 gap-2">
                  {moodFactors.map((factor) => (
                    <button
                      key={factor.id}
                      onClick={() => toggleFactor(factor.id)}
                      className={`p-2 rounded-lg text-left text-sm transition-all duration-300 ${
                        selectedFactors.includes(factor.id)
                          ? 'bg-purple-500/30 border border-purple-500/50'
                          : 'bg-white/10 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <span className="mr-2">{factor.icon}</span>
                      {factor.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="text-white font-semibold mb-3 block">Note (opțional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descrie cum te simți sau ce s-a întâmplat astăzi..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Anulează
                </button>
                <button
                  onClick={saveMoodEntry}
                  disabled={!selectedMood}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Salvează
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
}