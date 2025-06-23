// lib/hooks/useWellnessData.ts
import { useState, useEffect } from 'react';

interface WellnessData {
  mood: {
    entries: Array<{ mood: string; date: string; notes?: string; energy_level?: number }>;
    currentMood?: string;
    weeklyAverage?: number;
  };
  meditation: {
    totalMinutes: number;
    streakDays: number;
    totalSessions: number;
    preferredTime?: string;
    lastSession?: string;
  };
  sleep: {
    averageScore: number;
    lastNight?: number;
    weeklyTrend?: 'improving' | 'stable' | 'declining';
    commonIssues?: string[];
  };
  stress: {
    currentLevel: number;
    totalSessions: number;
    reductionPercentage: number;
    triggerPatterns?: string[];
  };
  journal: {
    totalEntries: number;
    dominantEmotion?: string;
    recentThemes?: string[];
    growthInsights?: string[];
  };
}

export function useWellnessData() {
  const [data, setData] = useState<WellnessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWellnessData = async () => {
    try {
      setLoading(true);
      
      // Get user token from localStorage or auth context
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch data from multiple Xano endpoints
      const [moodData, meditationData, sleepData, stressData, journalData] = await Promise.all([
        fetch('/api/xano/mood-tracker', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/xano/meditation-sessions', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/xano/sleep-tracking', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/xano/stress-management', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/xano/emotional-journal', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Parse responses
      const mood = await moodData.json();
      const meditation = await meditationData.json();
      const sleep = await sleepData.json();
      const stress = await stressData.json();
      const journal = await journalData.json();

      // Transform and combine data
      const wellnessData: WellnessData = {
        mood: {
          entries: mood.entries || [],
          currentMood: mood.current_mood,
          weeklyAverage: calculateMoodAverage(mood.entries)
        },
        meditation: {
          totalMinutes: meditation.total_minutes || 0,
          streakDays: meditation.streak_days || 0,
          totalSessions: meditation.total_sessions || 0,
          preferredTime: meditation.preferred_time,
          lastSession: meditation.last_session
        },
        sleep: {
          averageScore: sleep.average_score || 0,
          lastNight: sleep.last_night_score,
          weeklyTrend: sleep.weekly_trend,
          commonIssues: sleep.common_issues || []
        },
        stress: {
          currentLevel: stress.current_level || 5,
          totalSessions: stress.total_sessions || 0,
          reductionPercentage: stress.reduction_percentage || 0,
          triggerPatterns: stress.trigger_patterns || []
        },
        journal: {
          totalEntries: journal.total_entries || 0,
          dominantEmotion: journal.dominant_emotion,
          recentThemes: journal.recent_themes || [],
          growthInsights: journal.growth_insights || []
        }
      };

      setData(wellnessData);
      setError(null);
    } catch (err) {
      console.error('Error fetching wellness data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wellness data');
      
      // Fallback to mock data for development
      setData({
        mood: {
          entries: [
            { mood: 'good', date: '2025-06-19', notes: 'Zi bună' },
            { mood: 'excellent', date: '2025-06-18', notes: 'Mood excelent' }
          ],
          currentMood: 'good',
          weeklyAverage: 4.2
        },
        meditation: {
          totalMinutes: 180,
          streakDays: 12,
          totalSessions: 23,
          preferredTime: 'morning'
        },
        sleep: {
          averageScore: 8.2,
          lastNight: 8.5,
          weeklyTrend: 'improving'
        },
        stress: {
          currentLevel: 3,
          totalSessions: 15,
          reductionPercentage: 20
        },
        journal: {
          totalEntries: 23,
          dominantEmotion: 'optimism'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWellnessData();
  }, []);

  // Helper function to calculate mood average
  const calculateMoodAverage = (entries: any[]): number => {
    if (!entries || entries.length === 0) return 0;
    
    const moodValues = { excellent: 5, good: 4, neutral: 3, low: 2, poor: 1 };
    const recentEntries = entries.slice(-7); // Last 7 days
    
    const total = recentEntries.reduce((sum, entry) => {
      return sum + (moodValues[entry.mood as keyof typeof moodValues] || 3);
    }, 0);
    
    return total / recentEntries.length;
  };

  return {
    data,
    loading,
    error,
    refetch: fetchWellnessData
  };
}