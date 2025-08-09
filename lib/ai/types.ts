// lib/ai/types.ts
// Interfețe pentru AI Service - completează tipurile lipsă

// ================================
// NUTRITION INTERFACES
// ================================
export interface DayMeal {
  day: string
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snacks: Meal[]
}

export interface Meal {
  name: string
  ingredients: string[]
  calories: number
  macros: MacroNutrients
  instructions: string[]
  preparationTime?: number
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface MacroNutrients {
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

export interface ShoppingItem {
  name: string
  quantity: string
  estimatedPrice: number
  category: string
  optional?: boolean
}

export interface NutritionSummary {
  dailyCalories: number
  weeklyCalories: number
  averageMacros: MacroNutrients
  micronutrients: Record<string, number>
  nutritionScore: number
}

// ================================
// FITNESS INTERFACES
// ================================
export interface Exercise {
  id: string
  name: string
  category: 'strength' | 'cardio' | 'flexibility' | 'balance'
  targetMuscles: string[]
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string[]
  sets?: number
  reps?: number | string
  duration?: number
  restTime?: number
  videoUrl?: string
  imageUrl?: string
}

export interface WorkoutSchedule {
  day: string
  workoutType: string
  exercises: Exercise[]
  totalDuration: number
  caloriesBurn: number
  focusAreas: string[]
}

export interface ProgressMetric {
  metric: string
  currentValue: number
  targetValue: number
  unit: string
  trackingFrequency: 'daily' | 'weekly' | 'monthly'
}

// ================================
// HOMEWORK INTERFACES
// ================================
export interface SolutionStep {
  stepNumber: number
  title: string
  explanation: string
  formula?: string
  calculation?: string
  visualization?: string
  hints: string[]
}

export interface Problem {
  id: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  subject: string
  topic: string
  solution: string
  hints: string[]
}

// ================================
// MENTAL HEALTH INTERFACES
// ================================
export interface TherapyTechnique {
  name: string
  type: 'CBT' | 'DBT' | 'mindfulness' | 'behavioral' | 'cognitive'
  description: string
  instructions: string[]
  duration: number
  effectiveness: number
}

export interface MoodPattern {
  date: string
  mood: number
  anxiety: number
  stress: number
  energy: number
  factors: string[]
}

// ================================
// FINANCIAL INTERFACES
// ================================
export interface BudgetCategory {
  name: string
  currentSpending: number
  recommendedSpending: number
  savingOpportunity: number
  priority: 'essential' | 'important' | 'optional'
}

export interface InvestmentSuggestion {
  type: 'stocks' | 'bonds' | 'funds' | 'crypto' | 'real_estate'
  name: string
  expectedReturn: number
  riskLevel: 'low' | 'medium' | 'high'
  minimumInvestment: number
  description: string
  pros: string[]
  cons: string[]
}

// ================================
// PRODUCTIVITY INTERFACES
// ================================
export interface TimeBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  type: 'focus' | 'meeting' | 'break' | 'admin' | 'creative'
  priority: 'low' | 'medium' | 'high' | 'critical'
  tasks: string[]
  energyRequired: 'low' | 'medium' | 'high'
}

export interface ProductivityTip {
  title: string
  description: string
  category: 'time_management' | 'focus' | 'energy' | 'tools'
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedImpact: number
}

// ================================
// STRATEGIC PLANNING INTERFACES
// ================================
export interface SWOTAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface StrategicAction {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timeline: string
  resources: string[]
  expectedOutcome: string
  successMetrics: string[]
  dependencies: string[]
}

export interface RiskAssessment {
  risk: string
  probability: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  mitigation: string[]
  contingencyPlan: string
}

export interface KPI {
  name: string
  currentValue: number
  targetValue: number
  unit: string
  category: 'financial' | 'operational' | 'customer' | 'learning'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
}

// ================================
// QUANTUM VAULT INTERFACES
// ================================
export interface FutureSelfProjection {
  age: number
  physicalAppearance: {
    fitness: number
    health: number
    energy: number
    confidence: number
  }
  mentalEvolution: {
    wisdom: number
    emotionalIntelligence: number
    creativity: number
    focus: number
  }
  careerProgression: {
    position: string
    income: number
    influence: number
    satisfaction: number
  }
  relationships: {
    family: string
    friends: string
    romantic: string
    professional: string
  }
  achievements: string[]
  regrets: string[]
  wisdomMessages: WisdomMessage[]
}

export interface WisdomMessage {
  message: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  category: 'career' | 'relationships' | 'health' | 'personal_growth'
  actionRequired: string
}

export interface TimelineAlternative {
  name: string
  probability: number
  keyDecisions: string[]
  outcomes: {
    oneYear: string[]
    fiveYears: string[]
    tenYears: string[]
  }
  risks: string[]
  opportunities: string[]
  requiredActions: string[]
}

// ================================
// UTILITY INTERFACES
// ================================
export interface AIUsageLog {
  userId: string
  ecosystem: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  success: boolean
  timestamp: Date
}

export interface CrisisIntervention {
  userId: string
  message: string
  keywordsFound: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  interventionTriggered: boolean
  timestamp: Date
}