// lib/hooks/useTherapyInsights.ts
import { useMemo } from 'react';

interface TherapyInsights {
  moodTrend: {
    trend: 'insufficient_data' | 'positive' | 'stable' | 'concerning';
    message: string;
  };
  sleepImpact: {
    correlation: 'unknown' | 'positive' | 'negative' | 'mixed';
    message: string;
  };
  stressPatterns: {
    level: 'unknown' | 'low' | 'moderate' | 'high';
    recommendations: string[];
  };
  recommendations: Array<{
    category: 'mood' | 'sleep' | 'meditation' | 'stress';
    priority: 'high' | 'medium' | 'low';
    text: string;
  }>;
  riskFactors: Array<{
    type: 'mood_risk' | 'stress_risk' | 'sleep_risk';
    severity: 'high' | 'medium' | 'low';
    description: string;
  }>;
}

export function useTherapyInsights(wellnessData: any): TherapyInsights | null {
  const insights = useMemo(() => {
    if (!wellnessData) return null;

    const moodTrend = analyzeMoodTrend(wellnessData.mood);
    const sleepImpact = analyzeSleepImpact(wellnessData.sleep, wellnessData.mood);
    const stressPatterns = analyzeStressPatterns(wellnessData.stress);
    const recommendations = generateRecommendations(wellnessData);
    const riskFactors = identifyRiskFactors(wellnessData);

    return {
      moodTrend,
      sleepImpact,
      stressPatterns,
      recommendations,
      riskFactors
    };
  }, [wellnessData]);

  return insights;
}

// Helper functions for analysis
function analyzeMoodTrend(moodData: any) {
  if (!moodData?.entries || moodData.entries.length < 3) {
    return { 
      trend: 'insufficient_data' as const, 
      message: 'Ai nevoie de mai multe înregistrări pentru analiză.' 
    };
  }

  const recentMoods = moodData.entries.slice(-7);
  const moodValues = { excellent: 5, good: 4, neutral: 3, low: 2, poor: 1 };
  
  const scores = recentMoods.map(entry => moodValues[entry.mood as keyof typeof moodValues] || 3);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  if (average >= 4) {
    return { 
      trend: 'positive' as const, 
      message: 'Mood-ul tău arată un trend pozitiv consistent!' 
    };
  } else if (average >= 3) {
    return { 
      trend: 'stable' as const, 
      message: 'Mood-ul tău este echilibrat, cu variații normale.' 
    };
  } else {
    return { 
      trend: 'concerning' as const, 
      message: 'Mood-ul tău pare să necesite atenție și suport suplimentar.' 
    };
  }
}

function analyzeSleepImpact(sleepData: any, moodData: any) {
  if (!sleepData?.averageScore || !moodData?.weeklyAverage) {
    return { 
      correlation: 'unknown' as const, 
      message: 'Date insuficiente pentru analiză.' 
    };
  }

  const sleepScore = sleepData.averageScore;
  const moodScore = moodData.weeklyAverage;

  if (sleepScore >= 8 && moodScore >= 4) {
    return { 
      correlation: 'positive' as const, 
      message: 'Somnul tău de calitate susține direct mood-ul pozitiv.' 
    };
  } else if (sleepScore < 6 && moodScore < 3) {
    return { 
      correlation: 'negative' as const, 
      message: 'Somnul de slabă calitate pare să afecteze mood-ul tău.' 
    };
  } else {
    return { 
      correlation: 'mixed' as const, 
      message: 'Există o legătură variabilă între somn și mood în cazul tău.' 
    };
  }
}

function analyzeStressPatterns(stressData: any) {
  if (!stressData?.currentLevel) {
    return { 
      level: 'unknown' as const, 
      recommendations: [] 
    };
  }

  const level = stressData.currentLevel;
  
  if (level <= 3) {
    return {
      level: 'low' as const,
      recommendations: ['Continuă tehnicile care funcționează', 'Menține rutina de relaxare']
    };
  } else if (level <= 6) {
    return {
      level: 'moderate' as const,
      recommendations: ['Practică breathing exercises zilnic', 'Identifică și gestionează trigger-urile']
    };
  } else {
    return {
      level: 'high' as const,
      recommendations: ['Implementează tehnici de stress imediat', 'Consideră suport profesional']
    };
  }
}

function generateRecommendations(wellnessData: any) {
  const recommendations = [];

  // Mood recommendations
  if (wellnessData.mood?.weeklyAverage < 3) {
    recommendations.push({
      category: 'mood' as const,
      priority: 'high' as const,
      text: 'Practică activități care îți ridică mood-ul: exerciții în aer liber, muzică, conexiuni sociale'
    });
  }

  // Sleep recommendations
  if (wellnessData.sleep?.averageScore < 7) {
    recommendations.push({
      category: 'sleep' as const,
      priority: 'high' as const,
      text: 'Optimizează rutina de somn: orar constant, fără ecrane cu 1h înainte de culcare'
    });
  }

  // Meditation recommendations
  if (wellnessData.meditation?.totalMinutes < 50) {
    recommendations.push({
      category: 'meditation' as const,
      priority: 'medium' as const,
      text: 'Integrează 10 minute de meditație zilnică pentru echilibru mental'
    });
  }

  // Stress recommendations
  if (wellnessData.stress?.currentLevel > 6) {
    recommendations.push({
      category: 'stress' as const,
      priority: 'high' as const,
      text: 'Practică tehnici de stress management zilnic: box breathing, progressive relaxation'
    });
  }

  return recommendations;
}

function identifyRiskFactors(wellnessData: any) {
  const riskFactors = [];

  if (wellnessData.mood?.weeklyAverage < 2.5) {
    riskFactors.push({
      type: 'mood_risk' as const,
      severity: 'high' as const,
      description: 'Mood consistent scăzut necesită atenție imediată'
    });
  }

  if (wellnessData.stress?.currentLevel > 8) {
    riskFactors.push({
      type: 'stress_risk' as const,
      severity: 'high' as const,
      description: 'Nivel de stres foarte ridicat poate afecta sănătatea'
    });
  }

  if (wellnessData.sleep?.averageScore < 5) {
    riskFactors.push({
      type: 'sleep_risk' as const,
      severity: 'medium' as const,
      description: 'Somn de slabă calitate afectează wellness-ul general'
    });
  }

  return riskFactors;
}