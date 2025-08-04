// lib/services/porhealth-service.ts
// PorHealth Real Data Service - Transform Mock to AI Intelligence

import { createServerSupabase } from '@/lib/supabase'
import { AIService } from '@/lib/ai/ai-service'

export interface HealthProfile {
  user_id: string
  age: number
  gender: 'male' | 'female' | 'other'
  height_cm: number
  weight_kg: number
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  health_goals: string[]
  dietary_restrictions: string[]
  allergies: string[]
  medical_conditions: string[]
  fitness_level: 'beginner' | 'intermediate' | 'advanced'
}

export interface NutritionPlan {
  id: string
  user_id: string
  daily_calories: number
  macros: {
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
  }
  meals: Meal[]
  shopping_list: ShoppingItem[]
  weekly_cost_ron: number
  created_at: Date
  expires_at: Date
}

export interface Meal {
  id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  description: string
  ingredients: Ingredient[]
  calories: number
  prep_time_minutes: number
  recipe_steps: string[]
  nutrition: MealNutrition
}

export interface WorkoutPlan {
  id: string
  user_id: string
  plan_name: string
  duration_weeks: number
  days_per_week: number
  focus: 'strength' | 'cardio' | 'flexibility' | 'weight_loss' | 'muscle_gain'
  exercises: Exercise[]
  progression_strategy: string
  estimated_results: string
}

export class PorHealthService {
  private aiService: AIService
  private supabase = createServerSupabase()

  constructor() {
    this.aiService = new AIService()
  }

  // ===========================
  // REAL AI NUTRITION PLANNING
  // ===========================
  
  async generatePersonalizedNutritionPlan(userId: string): Promise<NutritionPlan> {
    // Get user health profile
    const profile = await this.getUserHealthProfile(userId)
    
    // Calculate nutritional needs using AI + Romanian dietary preferences
    const nutritionPlan = await this.aiService.generateNutritionPlan({
      profile,
      country: 'Romania',
      budget_range: 'middle_class', // 100-200 RON/week
      cuisine_preferences: ['romanian', 'mediterranean', 'healthy'],
      meal_prep_time: 'moderate', // 30-45min per meal
      dietary_style: profile.dietary_restrictions.includes('vegetarian') ? 'vegetarian' : 'omnivore'
    })

    // Generate Romanian-specific meals
    const meals = await this.generateRomanianMeals(nutritionPlan, profile)
    
    // Create shopping list with Romanian supermarkets
    const shoppingList = await this.generateRomanianShoppingList(meals)
    
    // Calculate costs in RON
    const weeklyCost = await this.calculateWeeklyCostRON(shoppingList)
    
    // Save to database
    const savedPlan = await this.saveNutritionPlan({
      user_id: userId,
      daily_calories: nutritionPlan.calories,
      macros: nutritionPlan.macros,
      meals,
      shopping_list: shoppingList,
      weekly_cost_ron: weeklyCost,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
    })
    
    return savedPlan
  }

  private async generateRomanianMeals(
    nutritionPlan: any, 
    profile: HealthProfile
  ): Promise<Meal[]> {
    const romanianIngredients = [
      'carne de pui', 'somon', 'ouă', 'brânză de vaci', 'iaurt grecesc',
      'quinoa', 'ovăz', 'orez brun', 'paste integrale',
      'roșii', 'castraveți', 'ardei', 'spanac', 'broccoli',
      'mere', 'banane', 'afine', 'nuci', 'migdale'
    ]

    const mealPrompts = [
      {
        type: 'breakfast' as const,
        prompt: `Creează un mic dejun românesc sănătos cu ${nutritionPlan.calories / 4} calorii folosind ingrediente disponibile în România: ${romanianIngredients.slice(0, 8).join(', ')}`
      },
      {
        type: 'lunch' as const,
        prompt: `Creează un prânz românesc nutritiv cu ${nutritionPlan.calories * 0.4} calorii, potrivit pentru activitate ${profile.activity_level}`
      },
      {
        type: 'dinner' as const,
        prompt: `Creează o cină românească ușoară cu ${nutritionPlan.calories * 0.3} calorii, optimizată pentru recuperare`
      },
      {
        type: 'snack' as const,
        prompt: `Creează un snack sănătos românesc cu ${nutritionPlan.calories * 0.1} calorii`
      }
    ]

    const meals: Meal[] = []
    
    for (const mealPrompt of mealPrompts) {
      const aiMeal = await this.aiService.generateMeal({
        prompt: mealPrompt.prompt,
        dietary_restrictions: profile.dietary_restrictions,
        allergies: profile.allergies,
        country: 'Romania',
        budget: 'moderate'
      })
      
      meals.push({
        id: `meal_${Date.now()}_${mealPrompt.type}`,
        meal_type: mealPrompt.type,
        name: aiMeal.name,
        description: aiMeal.description,
        ingredients: aiMeal.ingredients,
        calories: aiMeal.calories,
        prep_time_minutes: aiMeal.prep_time,
        recipe_steps: aiMeal.recipe_steps,
        nutrition: aiMeal.nutrition
      })
    }
    
    return meals
  }

  // ===========================
  // REAL AI WORKOUT GENERATION
  // ===========================
  
  async generatePersonalizedWorkoutPlan(userId: string): Promise<WorkoutPlan> {
    const profile = await this.getUserHealthProfile(userId)
    
    // Get user's available equipment and time
    const preferences = await this.getUserWorkoutPreferences(userId)
    
    // Generate AI workout plan
    const workoutPlan = await this.aiService.generateWorkoutPlan({
      fitness_level: profile.fitness_level,
      goals: profile.health_goals,
      available_time: preferences.minutes_per_day,
      equipment: preferences.available_equipment,
      injuries: profile.medical_conditions,
      preferences: preferences.workout_types
    })
    
    // Create progressive exercises
    const exercises = await this.generateProgressiveExercises(workoutPlan, profile)
    
    // Save workout plan
    const savedPlan = await this.saveWorkoutPlan({
      user_id: userId,
      plan_name: workoutPlan.name,
      duration_weeks: 12,
      days_per_week: preferences.days_per_week,
      focus: workoutPlan.primary_focus,
      exercises,
      progression_strategy: workoutPlan.progression,
      estimated_results: workoutPlan.expected_results
    })
    
    return savedPlan
  }

  // ===========================
  // REAL BIOMETRIC TRACKING
  // ===========================
  
  async trackBiometricReading(
    userId: string,
    type: 'weight' | 'body_fat' | 'muscle_mass' | 'blood_pressure' | 'heart_rate',
    value: number,
    unit: string
  ): Promise<BiometricTrend> {
    // Save reading
    await this.supabase
      .from('biometric_readings')
      .insert({
        user_id: userId,
        metric_type: type,
        value,
        unit,
        recorded_at: new Date()
      })
    
    // Get historical data
    const { data: history } = await this.supabase
      .from('biometric_readings')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', type)
      .order('recorded_at', { ascending: false })
      .limit(30)
    
    // AI analysis of trends
    const trendAnalysis = await this.aiService.analyzeBiometricTrend({
      readings: history || [],
      user_goals: await this.getUserHealthGoals(userId),
      context: await this.getUserHealthContext(userId)
    })
    
    return {
      current_value: value,
      trend_direction: trendAnalysis.direction,
      trend_strength: trendAnalysis.strength,
      insights: trendAnalysis.insights,
      recommendations: trendAnalysis.recommendations,
      progress_percentage: trendAnalysis.progress_toward_goal
    }
  }

  // ===========================
  // DASHBOARD DATA AGGREGATION
  // ===========================
  
  async getDashboardData(userId: string): Promise<HealthDashboardData> {
    // Fetch all health data in parallel
    const [
      currentNutritionPlan,
      currentWorkoutPlan,
      recentBiometrics,
      weeklyProgress,
      aiInsights
    ] = await Promise.all([
      this.getCurrentNutritionPlan(userId),
      this.getCurrentWorkoutPlan(userId),
      this.getRecentBiometrics(userId),
      this.calculateWeeklyProgress(userId),
      this.generateHealthInsights(userId)
    ])
    
    return {
      nutrition: {
        current_plan: currentNutritionPlan,
        today_calories: await this.getTodayCalories(userId),
        macro_breakdown: await this.getTodayMacros(userId),
        meal_suggestions: await this.getUpcomingMeals(userId)
      },
      fitness: {
        current_plan: currentWorkoutPlan,
        next_workout: await this.getNextWorkout(userId),
        recent_sessions: await this.getRecentWorkouts(userId, 7),
        progress_metrics: await this.getFitnessProgress(userId)
      },
      biometrics: {
        latest_readings: recentBiometrics,
        trends: await this.getBiometricTrends(userId),
        health_score: await this.calculateHealthScore(userId)
      },
      insights: aiInsights,
      weekly_progress: weeklyProgress,
      achievements: await this.getRecentAchievements(userId),
      recommendations: await this.getPersonalizedRecommendations(userId)
    }
  }

  // ===========================
  // AI HEALTH INSIGHTS
  // ===========================
  
  private async generateHealthInsights(userId: string): Promise<HealthInsight[]> {
    // Gather comprehensive health data
    const healthData = await this.gatherComprehensiveHealthData(userId)
    
    // AI analysis
    const insights = await this.aiService.generateHealthInsights({
      nutrition_data: healthData.nutrition,
      fitness_data: healthData.fitness,
      biometric_data: healthData.biometrics,
      sleep_data: healthData.sleep,
      stress_levels: healthData.stress,
      user_goals: healthData.goals
    })
    
    return insights.map(insight => ({
      id: `insight_${Date.now()}_${Math.random()}`,
      category: insight.category,
      title: insight.title,
      description: insight.description,
      importance: insight.importance,
      actionable_steps: insight.action_steps,
      confidence_score: insight.confidence,
      data_sources: insight.sources
    }))
  }

  // ===========================
  // HELPER METHODS
  // ===========================
  
  private async getUserHealthProfile(userId: string): Promise<HealthProfile> {
    const { data, error } = await this.supabase
      .from('user_health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error || !data) {
      // Create default profile if doesn't exist
      return await this.createDefaultHealthProfile(userId)
    }
    
    return data
  }

  private async saveNutritionPlan(planData: any): Promise<NutritionPlan> {
    const { data, error } = await this.supabase
      .from('nutrition_plans')
      .insert(planData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to save nutrition plan: ${error.message}`)
    return data
  }

  private async calculateWeeklyCostRON(shoppingList: ShoppingItem[]): Promise<number> {
    // Romanian supermarket pricing logic
    const romanianPrices: Record<string, number> = {
      'carne de pui': 15, // RON per kg
      'somon': 45,
      'ouă': 12, // per dozen
      'brânză de vaci': 25,
      'iaurt grecesc': 8,
      'orez brun': 4,
      'ovăz': 3,
      'roșii': 6,
      'spanac': 8,
      'mere': 4,
      'banane': 5
    }
    
    return shoppingList.reduce((total, item) => {
      const pricePerUnit = romanianPrices[item.name] || 10 // default 10 RON
      return total + (pricePerUnit * item.quantity)
    }, 0)
  }
}

// Export for use in dashboard
export const porHealthService = new PorHealthService()