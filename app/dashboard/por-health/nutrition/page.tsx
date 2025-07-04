// app/dashboard/por-health/nutrition/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './nutrition.module.css';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  serving: string;
  barcode?: string;
  verified: boolean;
}

interface MealPlan {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  aiOptimized: boolean;
  completedAt?: Date;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // liters
}

interface MacroDistribution {
  protein: number; // percentage
  carbs: number;   // percentage
  fat: number;     // percentage
}

export default function NutritionPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'planner' | 'scanner' | 'analytics'>('today');
  
  // Data states
  const [todayMeals, setTodayMeals] = useState<MealPlan[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  const [dailyProgress, setDailyProgress] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0
  });
  
  // AI Planner states
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    dietType: 'balanced',
    allergies: [] as string[],
    dislikes: [] as string[],
    mealCount: 3,
    snackCount: 2,
    cookingTime: 'moderate'
  });

  // Scanner states
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<FoodItem | null>(null);

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    setLoading(true);
    
    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock nutrition goals
    setNutritionGoals({
      calories: 2200,
      protein: 165, // 30%
      carbs: 248,   // 45% 
      fat: 73,      // 25%
      fiber: 35,
      water: 2.5
    });

    // Mock today's meals
    setTodayMeals([
      {
        id: 'breakfast',
        name: 'Protein Power Bowl',
        type: 'breakfast',
        foods: [
          {
            id: '1',
            name: 'Greek Yogurt',
            brand: 'Fage',
            calories: 130,
            protein: 20,
            carbs: 9,
            fat: 0,
            fiber: 0,
            sugar: 9,
            sodium: 65,
            serving: '170g',
            verified: true
          },
          {
            id: '2',
            name: 'Blueberries',
            calories: 84,
            protein: 1,
            carbs: 21,
            fat: 0.5,
            fiber: 4,
            sugar: 15,
            sodium: 1,
            serving: '100g',
            verified: true
          },
          {
            id: '3',
            name: 'Almonds',
            calories: 161,
            protein: 6,
            carbs: 6,
            fat: 14,
            fiber: 4,
            sugar: 1,
            sodium: 0,
            serving: '28g',
            verified: true
          }
        ],
        totalCalories: 375,
        totalProtein: 27,
        totalCarbs: 36,
        totalFat: 14.5,
        aiOptimized: true,
        completedAt: new Date()
      },
      {
        id: 'lunch',
        name: 'Mediterranean Power Salad',
        type: 'lunch',
        foods: [
          {
            id: '4',
            name: 'Grilled Chicken Breast',
            calories: 185,
            protein: 35,
            carbs: 0,
            fat: 4,
            fiber: 0,
            sugar: 0,
            sodium: 74,
            serving: '100g',
            verified: true
          },
          {
            id: '5',
            name: 'Mixed Greens',
            calories: 20,
            protein: 2,
            carbs: 4,
            fat: 0,
            fiber: 2,
            sugar: 2,
            sodium: 22,
            serving: '100g',
            verified: true
          },
          {
            id: '6',
            name: 'Olive Oil',
            calories: 119,
            protein: 0,
            carbs: 0,
            fat: 14,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            serving: '1 tbsp',
            verified: true
          }
        ],
        totalCalories: 324,
        totalProtein: 37,
        totalCarbs: 4,
        totalFat: 18,
        aiOptimized: true,
        completedAt: new Date()
      },
      {
        id: 'dinner',
        name: 'Salmon & Sweet Potato',
        type: 'dinner',
        foods: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        aiOptimized: true
      }
    ]);

    // Calculate daily progress
    const consumed = todayMeals.filter(meal => meal.completedAt);
    const progress = {
      calories: consumed.reduce((sum, meal) => sum + meal.totalCalories, 0),
      protein: consumed.reduce((sum, meal) => sum + meal.totalProtein, 0),
      carbs: consumed.reduce((sum, meal) => sum + meal.totalCarbs, 0),
      fat: consumed.reduce((sum, meal) => sum + meal.totalFat, 0),
      fiber: consumed.reduce((sum, meal) => sum + meal.foods.reduce((fSum, food) => fSum + food.fiber, 0), 0),
      water: 1.8 // Mock current water intake
    };
    
    setDailyProgress(progress);
    setLoading(false);
  };

  const generateAIMealPlan = async () => {
    setGeneratingPlan(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate optimized meal plan based on preferences
    const newMealPlan = generateOptimizedMeals(userPreferences);
    setTodayMeals(newMealPlan);
    
    setGeneratingPlan(false);
  };

  const generateOptimizedMeals = (preferences: typeof userPreferences): MealPlan[] => {
    // AI meal generation logic would go here
    // For now, returning mock optimized meals
    return [
      {
        id: 'ai-breakfast',
        name: 'AI-Optimized Breakfast',
        type: 'breakfast',
        foods: [
          {
            id: 'ai-1',
            name: 'Protein Oats',
            calories: 320,
            protein: 25,
            carbs: 45,
            fat: 8,
            fiber: 6,
            sugar: 12,
            sodium: 150,
            serving: '1 bowl',
            verified: true
          }
        ],
        totalCalories: 320,
        totalProtein: 25,
        totalCarbs: 45,
        totalFat: 8,
        aiOptimized: true
      }
      // More AI-generated meals would be added here
    ];
  };

  const scanFood = async (barcode?: string) => {
    setScannerOpen(true);
    
    // Simulate barcode scanning
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock scan result
    setScanResult({
      id: 'scanned-1',
      name: 'Protein Bar',
      brand: 'Quest',
      calories: 200,
      protein: 21,
      carbs: 15,
      fat: 9,
      fiber: 14,
      sugar: 1,
      sodium: 250,
      serving: '1 bar (60g)',
      barcode: '123456789',
      verified: true
    });
    
    setScannerOpen(false);
  };

  const getMacroPercentage = (macro: 'protein' | 'carbs' | 'fat', current: number): number => {
    if (!nutritionGoals) return 0;
    return Math.min((current / nutritionGoals[macro]) * 100, 100);
  };

  const getCaloriePercentage = (): number => {
    if (!nutritionGoals) return 0;
    return Math.min((dailyProgress.calories / nutritionGoals.calories) * 100, 100);
  };

  const getMealTypeIcon = (type: MealPlan['type']): string => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[type];
  };

  const getMealStatusColor = (meal: MealPlan): string => {
    if (meal.completedAt) return '#00ff88';
    if (meal.foods.length > 0) return '#fbbf24';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
        <h2 className={styles.loadingTitle}>🍎 Analyzing Nutrition Data</h2>
        <p className={styles.loadingText}>
          AI is optimizing your meal plans and calculating macro distributions...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.nutritionPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/por-health" className={styles.backButton}>
            ← Back to Dashboard
          </Link>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>🍎 AI Nutrition Center</h1>
            <p className={styles.pageSubtitle}>
              Intelligent meal planning powered by your biometric data
            </p>
          </div>
        </div>
        
        <div className={styles.headerStats}>
          <div className={styles.quickStat}>
            <span className={styles.statValue}>{dailyProgress.calories}</span>
            <span className={styles.statUnit}>/{nutritionGoals?.calories} cal</span>
          </div>
          <div className={styles.quickStat}>
            <span className={styles.statValue}>{dailyProgress.protein}g</span>
            <span className={styles.statUnit}>protein</span>
          </div>
          <div className={styles.quickStat}>
            <span className={styles.statValue}>{dailyProgress.water}L</span>
            <span className={styles.statUnit}>water</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'today' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span className={styles.tabIcon}>📊</span>
          Today's Nutrition
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'planner' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          <span className={styles.tabIcon}>🤖</span>
          AI Meal Planner
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'scanner' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <span className={styles.tabIcon}>📱</span>
          Food Scanner
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className={styles.tabIcon}>📈</span>
          Analytics
        </button>
      </nav>

      <div className={styles.tabContent}>
        {/* TODAY'S NUTRITION TAB */}
        {activeTab === 'today' && (
          <div className={styles.todayTab}>
            {/* Macro Overview */}
            <div className={styles.macroOverview}>
              <div className={styles.calorieRing}>
                <div className={styles.ringContainer}>
                  <svg className={styles.progressRing} viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#calorieGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getCaloriePercentage() / 100)}`}
                      className={styles.progressCircle}
                    />
                    <defs>
                      <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00ff88" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className={styles.ringContent}>
                    <span className={styles.ringValue}>{dailyProgress.calories}</span>
                    <span className={styles.ringLabel}>calories</span>
                    <span className={styles.ringRemaining}>
                      {nutritionGoals ? nutritionGoals.calories - dailyProgress.calories : 0} left
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.macroGrid}>
                <div className={styles.macroCard}>
                  <div className={styles.macroHeader}>
                    <span className={styles.macroIcon}>🥩</span>
                    <span className={styles.macroName}>Protein</span>
                  </div>
                  <div className={styles.macroValue}>
                    {dailyProgress.protein}g / {nutritionGoals?.protein}g
                  </div>
                  <div className={styles.macroProgress}>
                    <div 
                      className={styles.macroBar}
                      style={{ width: `${getMacroPercentage('protein', dailyProgress.protein)}%` }}
                    ></div>
                  </div>
                  <div className={styles.macroPercentage}>
                    {Math.round(getMacroPercentage('protein', dailyProgress.protein))}%
                  </div>
                </div>

                <div className={styles.macroCard}>
                  <div className={styles.macroHeader}>
                    <span className={styles.macroIcon}>🌾</span>
                    <span className={styles.macroName}>Carbs</span>
                  </div>
                  <div className={styles.macroValue}>
                    {dailyProgress.carbs}g / {nutritionGoals?.carbs}g
                  </div>
                  <div className={styles.macroProgress}>
                    <div 
                      className={styles.macroBar}
                      style={{ width: `${getMacroPercentage('carbs', dailyProgress.carbs)}%` }}
                    ></div>
                  </div>
                  <div className={styles.macroPercentage}>
                    {Math.round(getMacroPercentage('carbs', dailyProgress.carbs))}%
                  </div>
                </div>

                <div className={styles.macroCard}>
                  <div className={styles.macroHeader}>
                    <span className={styles.macroIcon}>🥑</span>
                    <span className={styles.macroName}>Fat</span>
                  </div>
                  <div className={styles.macroValue}>
                    {dailyProgress.fat}g / {nutritionGoals?.fat}g
                  </div>
                  <div className={styles.macroProgress}>
                    <div 
                      className={styles.macroBar}
                      style={{ width: `${getMacroPercentage('fat', dailyProgress.fat)}%` }}
                    ></div>
                  </div>
                  <div className={styles.macroPercentage}>
                    {Math.round(getMacroPercentage('fat', dailyProgress.fat))}%
                  </div>
                </div>
              </div>
            </div>

            {/* Meals Timeline */}
            <div className={styles.mealsTimeline}>
              <h3 className={styles.sectionTitle}>Today's Meals</h3>
              
              <div className={styles.mealsList}>
                {todayMeals.map((meal) => (
                  <div key={meal.id} className={styles.mealCard}>
                    <div className={styles.mealHeader}>
                      <div className={styles.mealInfo}>
                        <span className={styles.mealIcon}>{getMealTypeIcon(meal.type)}</span>
                        <div>
                          <h4 className={styles.mealName}>{meal.name}</h4>
                          <p className={styles.mealType}>{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</p>
                        </div>
                      </div>
                      
                      <div className={styles.mealStats}>
                        <div className={styles.mealStat}>
                          <span className={styles.statValue}>{meal.totalCalories}</span>
                          <span className={styles.statLabel}>cal</span>
                        </div>
                        <div className={styles.mealStat}>
                          <span className={styles.statValue}>{meal.totalProtein}g</span>
                          <span className={styles.statLabel}>protein</span>
                        </div>
                      </div>
                      
                      <div 
                        className={styles.mealStatus}
                        style={{ backgroundColor: getMealStatusColor(meal) }}
                      >
                        {meal.completedAt ? '✓' : meal.foods.length > 0 ? '⏰' : '○'}
                      </div>
                    </div>

                    {meal.foods.length > 0 && (
                      <div className={styles.foodsList}>
                        {meal.foods.map((food) => (
                          <div key={food.id} className={styles.foodItem}>
                            <div className={styles.foodInfo}>
                              <span className={styles.foodName}>{food.name}</span>
                              {food.brand && <span className={styles.foodBrand}>{food.brand}</span>}
                              <span className={styles.foodServing}>{food.serving}</span>
                            </div>
                            <div className={styles.foodMacros}>
                              <span>{food.calories} cal</span>
                              <span>P: {food.protein}g</span>
                              <span>C: {food.carbs}g</span>
                              <span>F: {food.fat}g</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.mealActions}>
                      {meal.completedAt ? (
                        <span className={styles.completedLabel}>
                          Completed at {meal.completedAt.toLocaleTimeString()}
                        </span>
                      ) : (
                        <div className={styles.actionButtons}>
                          <button className={styles.addFoodButton}>+ Add Food</button>
                          <button className={styles.completeButton}>Mark Complete</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI MEAL PLANNER TAB */}
        {activeTab === 'planner' && (
          <div className={styles.plannerTab}>
            <div className={styles.plannerContent}>
              <div className={styles.plannerHeader}>
                <h3 className={styles.sectionTitle}>🤖 AI Meal Planner</h3>
                <p className={styles.sectionSubtitle}>
                  Get personalized meal plans optimized for your health goals and preferences
                </p>
              </div>

              <div className={styles.preferencesForm}>
                <div className={styles.formSection}>
                  <label className={styles.formLabel}>Diet Type</label>
                  <select 
                    className={styles.formSelect}
                    value={userPreferences.dietType}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, dietType: e.target.value }))}
                  >
                    <option value="balanced">Balanced</option>
                    <option value="keto">Ketogenic</option>
                    <option value="paleo">Paleo</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="mediterranean">Mediterranean</option>
                  </select>
                </div>

                <div className={styles.formSection}>
                  <label className={styles.formLabel}>Meals per Day</label>
                  <div className={styles.numberInput}>
                    <button 
                      className={styles.numberButton}
                      onClick={() => setUserPreferences(prev => ({ 
                        ...prev, 
                        mealCount: Math.max(1, prev.mealCount - 1) 
                      }))}
                    >
                      -
                    </button>
                    <span className={styles.numberValue}>{userPreferences.mealCount}</span>
                    <button 
                      className={styles.numberButton}
                      onClick={() => setUserPreferences(prev => ({ 
                        ...prev, 
                        mealCount: Math.min(6, prev.mealCount + 1) 
                      }))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <label className={styles.formLabel}>Cooking Time Preference</label>
                  <div className={styles.radioGroup}>
                    {['quick', 'moderate', 'elaborate'].map((time) => (
                      <label key={time} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="cookingTime"
                          value={time}
                          checked={userPreferences.cookingTime === time}
                          onChange={(e) => setUserPreferences(prev => ({ 
                            ...prev, 
                            cookingTime: e.target.value 
                          }))}
                          className={styles.radioInput}
                        />
                        <span className={styles.radioText}>
                          {time.charAt(0).toUpperCase() + time.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                className={styles.generateButton}
                onClick={generateAIMealPlan}
                disabled={generatingPlan}
              >
                {generatingPlan ? (
                  <span className={styles.generatingText}>
                    <span className={styles.loadingDots}></span>
                    Generating Optimal Meal Plan...
                  </span>
                ) : (
                  '✨ Generate AI Meal Plan'
                )}
              </button>
            </div>
          </div>
        )}

        {/* FOOD SCANNER TAB */}
        {activeTab === 'scanner' && (
          <div className={styles.scannerTab}>
            <div className={styles.scannerContent}>
              <div className={styles.scannerHeader}>
                <h3 className={styles.sectionTitle}>📱 Food Scanner</h3>
                <p className={styles.sectionSubtitle}>
                  Scan barcodes or search foods to track nutrition instantly
                </p>
              </div>

              <div className={styles.scannerActions}>
                <button 
                  className={styles.scanButton}
                  onClick={() => scanFood()}
                  disabled={scannerOpen}
                >
                  {scannerOpen ? (
                    <span className={styles.scanningText}>
                      <span className={styles.loadingDots}></span>
                      Scanning...
                    </span>
                  ) : (
                    <>
                      <span className={styles.scanIcon}>📷</span>
                      Scan Barcode
                    </>
                  )}
                </button>

                <div className={styles.searchSection}>
                  <input
                    type="text"
                    placeholder="Search food database..."
                    className={styles.searchInput}
                  />
                  <button className={styles.searchButton}>🔍 Search</button>
                </div>
              </div>

              {scanResult && (
                <div className={styles.scanResult}>
                  <div className={styles.resultHeader}>
                    <h4 className={styles.resultTitle}>Scan Result</h4>
                    <span className={styles.verifiedBadge}>
                      {scanResult.verified ? '✓ Verified' : '⚠ Unverified'}
                    </span>
                  </div>
                  
                  <div className={styles.resultContent}>
                    <div className={styles.resultInfo}>
                      <h5 className={styles.resultName}>{scanResult.name}</h5>
                      {scanResult.brand && (
                        <p className={styles.resultBrand}>{scanResult.brand}</p>
                      )}
                      <p className={styles.resultServing}>Serving: {scanResult.serving}</p>
                    </div>

                    <div className={styles.resultNutrition}>
                      <div className={styles.nutritionGrid}>
                        <div className={styles.nutritionItem}>
                          <span className={styles.nutritionLabel}>Calories</span>
                          <span className={styles.nutritionValue}>{scanResult.calories}</span>
                        </div>
                        <div className={styles.nutritionItem}>
                          <span className={styles.nutritionLabel}>Protein</span>
                          <span className={styles.nutritionValue}>{scanResult.protein}g</span>
                        </div>
                        <div className={styles.nutritionItem}>
                          <span className={styles.nutritionLabel}>Carbs</span>
                          <span className={styles.nutritionValue}>{scanResult.carbs}g</span>
                        </div>
                        <div className={styles.nutritionItem}>
                          <span className={styles.nutritionLabel}>Fat</span>
                          <span className={styles.nutritionValue}>{scanResult.fat}g</span>
                        </div>
                        <div className={styles.nutritionItem}>
                          <span className={styles.nutritionLabel}>Fiber</span>
                          <span className={styles.nutritionValue}>{scanResult.fiber}g</span>
                        </div>
                        <div className={styles.nutritionItem}>
                          <span className={styles.nutritionLabel}>Sodium</span>
                          <span className={styles.nutritionValue}>{scanResult.sodium}mg</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.resultActions}>
                      <button className={styles.addToMealButton}>Add to Meal</button>
                      <button className={styles.quickLogButton}>Quick Log</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className={styles.analyticsTab}>
            <div className={styles.analyticsContent}>
              <h3 className={styles.sectionTitle}>📈 Nutrition Analytics</h3>
              
              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                  <h4 className={styles.cardTitle}>7-Day Trends</h4>
                  <div className={styles.chartPlaceholder}>
                    📊 Macro trends visualization
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <h4 className={styles.cardTitle}>Goal Achievement</h4>
                  <div className={styles.chartPlaceholder}>
                    🎯 Goal completion rates
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <h4 className={styles.cardTitle}>Nutrient Timing</h4>
                  <div className={styles.chartPlaceholder}>
                    ⏰ Optimal meal timing analysis
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <h4 className={styles.cardTitle}>AI Insights</h4>
                  <div className={styles.insightsList}>
                    <div className={styles.insight}>
                      <span className={styles.insightIcon}>💡</span>
                      <span className={styles.insightText}>
                        Increase protein intake by 15g for optimal recovery
                      </span>
                    </div>
                    <div className={styles.insight}>
                      <span className={styles.insightIcon}>📈</span>
                      <span className={styles.insightText}>
                        Your fiber intake improved 23% this week
                      </span>
                    </div>
                    <div className={styles.insight}>
                      <span className={styles.insightIcon}>⚡</span>
                      <span className={styles.insightText}>
                        Pre-workout carbs timing is optimal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}