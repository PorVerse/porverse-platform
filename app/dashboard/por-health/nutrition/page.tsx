// app/dashboard/por-health/nutrition/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../style.module.css';

interface NutritionProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance';
  dietary_restrictions: string[];
  allergies: string[];
  preferences: string[];
  medical_conditions: string[];
}

interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface NutritionInsight {
  id: string;
  type: 'optimization' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  action_required: boolean;
  severity: 'low' | 'medium' | 'high';
  tags: string[];
}

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  description: string;
  prep_time: number;
  cook_time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    vitamins: { [key: string]: number };
    minerals: { [key: string]: number };
  };
  ingredients: {
    name: string;
    amount: number;
    unit: string;
    category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'fat' | 'seasoning';
    price_estimate?: number;
  }[];
  instructions: string[];
  tips: string[];
  variations: string[];
  nutritionist_notes: string[];
  ai_confidence: number;
}

interface WeeklyNutritionPlan {
  id: string;
  name: string;
  description: string;
  week_start: string;
  profile_based: NutritionProfile;
  daily_targets: MacroTarget;
  meals: { [day: string]: Meal[] };
  shopping_list: { [category: string]: string[] };
  prep_schedule: { day: string; tasks: string[]; time_needed: number }[];
  cost_analysis: {
    total_weekly: number;
    per_day: number;
    per_meal: number;
    cost_vs_eating_out: number;
  };
  health_score: number;
  sustainability_score: number;
  convenience_score: number;
}

export default function PremiumNutritionPlanner() {
  const [nutritionPlan, setNutritionPlan] = useState<WeeklyNutritionPlan | null>(null);
  const [insights, setInsights] = useState<NutritionInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<NutritionProfile>({
    age: 28,
    gender: 'male',
    weight: 75,
    height: 175,
    activity_level: 'moderate',
    goal: 'maintenance',
    dietary_restrictions: [],
    allergies: [],
    preferences: ['mediterranean'],
    medical_conditions: []
  });
  const [activeDay, setActiveDay] = useState<string>('monday');
  const [planningMode, setPlanningMode] = useState<'quick' | 'detailed' | 'expert'>('detailed');

  useEffect(() => {
    generateInitialInsights();
  }, [profile]);

  const generateInitialInsights = async () => {
    const mockInsights: NutritionInsight[] = [
      {
        id: '1',
        type: 'optimization',
        title: '🎯 Optimizare Macro-nutrienți',
        message: `Bazat pe profilul tău (${profile.weight}kg, activitate ${profile.activity_level}), recomand 2,200 calorii cu 28% proteine pentru obiectivul de ${profile.goal}.`,
        action_required: true,
        severity: 'medium',
        tags: ['calories', 'macros', 'optimization']
      },
      {
        id: '2',
        type: 'info',
        title: '🥗 Pattern Alimentar Mediterranean',
        message: 'Preferința ta pentru dieta mediteraneană se aliniază perfect cu obiectivele de sănătate. Voi prioritiza peștele, uleiul de măsline și vegetalele.',
        action_required: false,
        severity: 'low',
        tags: ['diet_style', 'mediterranean', 'health']
      },
      {
        id: '3',
        type: 'success',
        title: '💪 Sincronizare cu PorHealth',
        message: 'Datele tale din workout tracker arată 4 antrenamente/săptămână. Planul nutrițional va include timing-ul optim pentru pre/post workout.',
        action_required: false,
        severity: 'low',
        tags: ['integration', 'workout', 'timing']
      },
      {
        id: '4',
        type: 'warning',
        title: '⚠️ Atenție la Micronutrienți',
        message: 'Activitatea intensă necesită atenție sporită la B12, Magneziu și Omega-3. Voi include surse naturale în planul săptămânal.',
        action_required: true,
        severity: 'high',
        tags: ['vitamins', 'minerals', 'deficiency']
      }
    ];

    setInsights(mockInsights);
  };

  const generateWeeklyPlan = async () => {
    setLoading(true);
    
    try {
      // Simulate AI analysis with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      const bmr = profile.gender === 'male' 
        ? 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age)
        : 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
      
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      const dailyCalories = Math.round(bmr * activityMultipliers[profile.activity_level]);
      
      const macroTargets: MacroTarget = {
        calories: dailyCalories,
        protein: Math.round(dailyCalories * 0.28 / 4),
        carbs: Math.round(dailyCalories * 0.45 / 4),
        fat: Math.round(dailyCalories * 0.27 / 9),
        fiber: Math.max(25, Math.round(dailyCalories / 100)),
        sugar: Math.min(50, Math.round(dailyCalories * 0.1 / 4)),
        sodium: 2300
      };

      const sampleMeals: { [day: string]: Meal[] } = {
        monday: [
          {
            id: 'mon_breakfast_1',
            name: 'Power Protein Bowl Mediterranean',
            type: 'breakfast',
            description: 'Bowl energizant cu iaurt grecesc, quinoa, nuci și fructe de sezon',
            prep_time: 10,
            cook_time: 0,
            difficulty: 'easy',
            nutrition: {
              calories: 420,
              protein: 28,
              carbs: 48,
              fat: 14,
              fiber: 8,
              sugar: 22,
              sodium: 180,
              vitamins: { 'B12': 0.8, 'D': 0.3, 'C': 15 },
              minerals: { 'calcium': 320, 'iron': 2.1, 'magnesium': 78 }
            },
            ingredients: [
              { name: 'Iaurt grecesc 0% grăsime', amount: 200, unit: 'g', category: 'protein', price_estimate: 3.5 },
              { name: 'Quinoa fiartă', amount: 60, unit: 'g', category: 'grain', price_estimate: 2.0 },
              { name: 'Fructe de pădure mixte', amount: 100, unit: 'g', category: 'fruit', price_estimate: 4.0 },
              { name: 'Nuci crude', amount: 20, unit: 'g', category: 'fat', price_estimate: 1.8 },
              { name: 'Miere de salcâm', amount: 1, unit: 'lingurită', category: 'seasoning', price_estimate: 0.5 },
              { name: 'Semințe de chia', amount: 1, unit: 'lingură', category: 'fat', price_estimate: 1.2 }
            ],
            instructions: [
              'Lasă quinoa să se răcească complet după fierbere',
              'Într-un bol mare, amestecă iaurtul cu mierea până devine cremos',
              'Adaugă quinoa și amestecă ușor',
              'Decorează cu fructele de pădure în pattern atractiv',
              'Presară nucile mărunțite și semințele de chia',
              'Servește imediat pentru textura optimă'
            ],
            tips: [
              'Prepară quinoa cu o seară înainte pentru economie de timp',
              'Înlocuiește fructele de pădure cu fructe de sezon pentru cost redus',
              'Adaugă scorțișoară pentru boost de antioxidanți',
              'Dublează porția pentru meal prep de 2 zile'
            ],
            variations: [
              'Versiune tropicală: mango și nucă de cocos',
              'Versiune de toamnă: mere și scorțișoară',
              'Versiune proteică: adaugă 1 lingură protein powder'
            ],
            nutritionist_notes: [
              'Combinația perfectă de proteine complete și carbohidrați complecși',
              'Omega-3 din semințele de chia susține funcția cerebrală',
              'Probioticele din iaurt optimizează digestia și imunitatea'
            ],
            ai_confidence: 0.94
          },
          {
            id: 'mon_lunch_1',
            name: 'Salmon Teriyaki cu Quinoa și Avocado',
            type: 'lunch',
            description: 'Somon la grătar cu glazură teriyaki, quinoa cu ierburi și salată de avocado',
            prep_time: 15,
            cook_time: 20,
            difficulty: 'medium',
            nutrition: {
              calories: 580,
              protein: 42,
              carbs: 38,
              fat: 28,
              fiber: 12,
              sugar: 8,
              sodium: 420,
              vitamins: { 'B12': 5.4, 'D': 8.2, 'E': 3.1 },
              minerals: { 'omega3': 1200, 'potassium': 890, 'magnesium': 95 }
            },
            ingredients: [
              { name: 'File de somon proaspăt', amount: 180, unit: 'g', category: 'protein', price_estimate: 18.0 },
              { name: 'Quinoa', amount: 80, unit: 'g', category: 'grain', price_estimate: 2.5 },
              { name: 'Avocado mare', amount: 1, unit: 'bucată', category: 'fat', price_estimate: 6.0 },
              { name: 'Sos teriyaki natural', amount: 2, unit: 'linguri', category: 'seasoning', price_estimate: 1.0 },
              { name: 'Broccoli', amount: 150, unit: 'g', category: 'vegetable', price_estimate: 2.0 },
              { name: 'Roșii cherry', amount: 100, unit: 'g', category: 'vegetable', price_estimate: 3.0 },
              { name: 'Ulei de măsline extra virgin', amount: 1, unit: 'lingură', category: 'fat', price_estimate: 0.8 }
            ],
            instructions: [
              'Marinează somonul în sosul teriyaki 30 minute',
              'Fierbe quinoa cu bulion de legume pentru extra aromă',
              'Aburi broccoli 4-5 minute până rămâne crocant',
              'Grătarează somonul 4 minute pe fiecare parte',
              'Taie avocado și roșiile cherry, condimentează cu ulei',
              'Asamblează totul într-un bol, servește cald'
            ],
            tips: [
              'Nu supragătești somonul - centrul să rămână ușor rozaliu',
              'Adaugă susan pentru crunch și nutrients extra',
              'Înlocuiește quinoa cu orez integral dacă preferi',
              'Garniture: edamame pentru proteine extra'
            ],
            variations: [
              'Versiune vegetariană: tofu la grătar cu același marinat',
              'Versiune low-carb: înlocuiește quinoa cu mai multe legume',
              'Versiune picantă: adaugă ghimbir și chili flakes'
            ],
            nutritionist_notes: [
              'Omega-3 din somon reduce inflamația și susține inima',
              'Quinoa oferă proteine complete cu toți aminoacizii esențiali',
              'Avocado furnizează grăsimi sănătoase pentru absorbția vitaminelor'
            ],
            ai_confidence: 0.91
          }
        ]
        // Add more days...
      };

      const mockPlan: WeeklyNutritionPlan = {
        id: crypto.randomUUID(),
        name: 'Plan Nutrițional Personalizat - Săptămâna 1',
        description: 'Plan optimizat AI pentru obiectivele tale de sănătate și lifestyle',
        week_start: new Date().toISOString().split('T')[0],
        profile_based: profile,
        daily_targets: macroTargets,
        meals: sampleMeals,
        shopping_list: {
          'Proteine': ['File de somon 1kg', 'Iaurt grecesc 1kg', 'Ouă 12 buc', 'Piept de pui 800g'],
          'Legume': ['Broccoli 500g', 'Spanac 300g', 'Roșii cherry 500g', 'Avocado 4 buc'],
          'Cereale': ['Quinoa 500g', 'Ovăz 500g', 'Orez integral 1kg'],
          'Condimente': ['Ulei măsline extra virgin', 'Sos teriyaki', 'Miere', 'Ierburi aromate']
        },
        prep_schedule: [
          { day: 'Duminică', tasks: ['Fierbe quinoa pentru 3 zile', 'Spală și taie legumele', 'Marinează proteina'], time_needed: 90 },
          { day: 'Miercuri', tasks: ['Prep intermediar legume', 'Verifică inventarul'], time_needed: 30 }
        ],
        cost_analysis: {
          total_weekly: 285,
          per_day: 40.7,
          per_meal: 13.6,
          cost_vs_eating_out: 0.65 // 35% savings vs eating out
        },
        health_score: 92,
        sustainability_score: 88,
        convenience_score: 85
      };

      setNutritionPlan(mockPlan);
      
      // Update insights based on generated plan
      const planInsights: NutritionInsight[] = [
        {
          id: 'plan_1',
          type: 'success',
          title: '🎯 Plan Generat cu Succes',
          message: `Planul tău săptămânal include ${Object.values(mockPlan.meals).flat().length} mese optimizate pentru obiectivul de ${profile.goal}.`,
          action_required: false,
          severity: 'low',
          tags: ['plan_generation', 'success']
        },
        {
          id: 'plan_2',
          type: 'optimization',
          title: '💰 Optimizare Costuri',
          message: `Economisești 35% față de mâncarea comandată, cu o dietă superioară nutrițional. Cost estimat: ${mockPlan.cost_analysis.per_day} RON/zi.`,
          action_required: false,
          severity: 'medium',
          tags: ['cost', 'savings', 'budget']
        }
      ];

      setInsights(prev => [...prev, ...planInsights]);
      
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return '⚡';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return '💡';
      default: return '📊';
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'morning_snack': return '☕';
      case 'lunch': return '☀️';
      case 'afternoon_snack': return '🍎';
      case 'dinner': return '🌙';
      case 'evening_snack': return '🌛';
      default: return '🍽️';
    }
  };

  const getDayName = (day: string) => {
    const names: { [key: string]: string } = {
      monday: 'Luni',
      tuesday: 'Marți',
      wednesday: 'Miercuri',
      thursday: 'Joi',
      friday: 'Vineri',
      saturday: 'Sâmbătă',
      sunday: 'Duminică'
    };
    return names[day] || day;
  };

  return (
    <div className={styles.nutritionContainer}>
      {/* Animated Background */}
      <div className={styles.nutritionBackground}></div>
      
      {/* Header */}
      <div className={styles.nutritionHeader}>
        <Link href="/dashboard/por-health" className={styles.backButton}>
          ← Înapoi la PorHealth
        </Link>
        <div className={styles.headerContent}>
          <h1 className={styles.nutritionTitle}>🍎 AI Nutrition Planner Premium</h1>
          <p className={styles.nutritionSubtitle}>
            Planuri nutriționale personalizate cu analiza AI avansată și optimizare automată
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingSection}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingContent}>
            <h3>🧠 Analizez profilul tău nutrițional...</h3>
            <div className={styles.loadingSteps}>
              <div className={styles.loadingStep}>Calculez necesarul caloric bazal</div>
              <div className={styles.loadingStep}>Optimizez macro și micronutrienții</div>
              <div className={styles.loadingStep}>Generez mese personalizate</div>
              <div className={styles.loadingStep}>Creez planul de meal prep</div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.nutritionContent}>
          {/* Profile Setup & Insights */}
          <div className={styles.nutritionSidebar}>
            {/* Profile Card */}
            <div className={styles.profileCard}>
              <h3 className={styles.profileTitle}>👤 Profilul Tău Nutrițional</h3>
              
              <div className={styles.profileGrid}>
                <div className={styles.profileItem}>
                  <label>Vârsta</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({...prev, age: parseInt(e.target.value)}))}
                    className={styles.profileInput}
                  />
                </div>
                
                <div className={styles.profileItem}>
                  <label>Greutate (kg)</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile(prev => ({...prev, weight: parseInt(e.target.value)}))}
                    className={styles.profileInput}
                  />
                </div>
                
                <div className={styles.profileItem}>
                  <label>Înălțime (cm)</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile(prev => ({...prev, height: parseInt(e.target.value)}))}
                    className={styles.profileInput}
                  />
                </div>
                
                <div className={styles.profileItem}>
                  <label>Activitate</label>
                  <select
                    value={profile.activity_level}
                    onChange={(e) => setProfile(prev => ({...prev, activity_level: e.target.value as any}))}
                    className={styles.profileSelect}
                  >
                    <option value="sedentary">Sedentară</option>
                    <option value="light">Ușoară</option>
                    <option value="moderate">Moderată</option>
                    <option value="active">Activă</option>
                    <option value="very_active">Foarte Activă</option>
                  </select>
                </div>
                
                <div className={styles.profileItem}>
                  <label>Obiectiv</label>
                  <select
                    value={profile.goal}
                    onChange={(e) => setProfile(prev => ({...prev, goal: e.target.value as any}))}
                    className={styles.profileSelect}
                  >
                    <option value="weight_loss">Pierdere în greutate</option>
                    <option value="muscle_gain">Câștig muscular</option>
                    <option value="maintenance">Menținere</option>
                    <option value="performance">Performanță</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateWeeklyPlan}
                disabled={loading}
                className={styles.generatePlanButton}
              >
                <span className={styles.buttonIcon}>✨</span>
                Generează Plan AI Premium
              </button>
            </div>

            {/* AI Insights */}
            <div className={styles.insightsCard}>
              <h3 className={styles.insightsTitle}>🧠 AI Insights</h3>
              <div className={styles.insightsList}>
                {insights.map(insight => (
                  <div key={insight.id} className={`${styles.insightItem} ${styles[insight.type]}`}>
                    <div className={styles.insightHeader}>
                      <span className={styles.insightIcon}>{getInsightIcon(insight.type)}</span>
                      <span className={styles.insightItemTitle}>{insight.title}</span>
                    </div>
                    <p className={styles.insightMessage}>{insight.message}</p>
                    {insight.action_required && (
                      <button className={styles.insightAction}>Aplică</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Weekly Plan */}
          <div className={styles.nutritionMain}>
            {nutritionPlan ? (
              <>
                {/* Plan Overview */}
                <div className={styles.planOverview}>
                  <div className={styles.planHeader}>
                    <h2 className={styles.planTitle}>{nutritionPlan.name}</h2>
                    <div className={styles.planScores}>
                      <div className={styles.scoreItem}>
                        <span className={styles.scoreValue}>{nutritionPlan.health_score}</span>
                        <span className={styles.scoreLabel}>Sănătate</span>
                      </div>
                      <div className={styles.scoreItem}>
                        <span className={styles.scoreValue}>{nutritionPlan.sustainability_score}</span>
                        <span className={styles.scoreLabel}>Sustenabil</span>
                      </div>
                      <div className={styles.scoreItem}>
                        <span className={styles.scoreValue}>{nutritionPlan.convenience_score}</span>
                        <span className={styles.scoreLabel}>Convenabil</span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Targets */}
                  <div className={styles.dailyTargets}>
                    <h4>🎯 Obiective Zilnice</h4>
                    <div className={styles.targetsGrid}>
                      <div className={styles.targetItem}>
                        <span className={styles.targetValue}>{nutritionPlan.daily_targets.calories}</span>
                        <span className={styles.targetLabel}>Calorii</span>
                      </div>
                      <div className={styles.targetItem}>
                        <span className={styles.targetValue}>{nutritionPlan.daily_targets.protein}g</span>
                        <span className={styles.targetLabel}>Proteine</span>
                      </div>
                      <div className={styles.targetItem}>
                        <span className={styles.targetValue}>{nutritionPlan.daily_targets.carbs}g</span>
                        <span className={styles.targetLabel}>Carbohidrați</span>
                      </div>
                      <div className={styles.targetItem}>
                        <span className={styles.targetValue}>{nutritionPlan.daily_targets.fat}g</span>
                        <span className={styles.targetLabel}>Grăsimi</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Analysis */}
                  <div className={styles.costAnalysis}>
                    <h4>💰 Analiză Costuri</h4>
                    <div className={styles.costGrid}>
                      <div className={styles.costItem}>
                        <span className={styles.costValue}>{nutritionPlan.cost_analysis.per_day} RON</span>
                        <span className={styles.costLabel}>Cost/zi</span>
                      </div>
                      <div className={styles.costItem}>
                        <span className={styles.costValue}>{Math.round((1 - nutritionPlan.cost_analysis.cost_vs_eating_out) * 100)}%</span>
                        <span className={styles.costLabel}>Economie vs restaurant</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day Navigation */}
                <div className={styles.dayNavigation}>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`${styles.dayButton} ${activeDay === day ? styles.activeDayButton : ''}`}
                    >
                      {getDayName(day)}
                    </button>
                  ))}
                </div>

                {/* Meals Display */}
                <div className={styles.mealsSection}>
                  {nutritionPlan.meals[activeDay]?.map(meal => (
                    <div key={meal.id} className={styles.mealCard}>
                      <div className={styles.mealHeader}>
                        <div className={styles.mealType}>
                          <span className={styles.mealIcon}>{getMealIcon(meal.type)}</span>
                          <span className={styles.mealTypeName}>
                            {meal.type.replace('_', ' ').charAt(0).toUpperCase() + meal.type.slice(1)}
                          </span>
                        </div>
                        <div className={styles.mealMeta}>
                          <span className={styles.mealTime}>⏱️ {meal.prep_time + meal.cook_time}min</span>
                          <span className={styles.mealDifficulty}>👨‍🍳 {meal.difficulty}</span>
                          <span className={styles.mealCalories}>🔥 {meal.nutrition.calories} cal</span>
                        </div>
                      </div>

                      <h4 className={styles.mealName}>{meal.name}</h4>
                      <p className={styles.mealDescription}>{meal.description}</p>

                      {/* Nutrition Info */}
                      <div className={styles.nutritionInfo}>
                        <div className={styles.nutritionItem}>
                          <span>Proteine: {meal.nutrition.protein}g</span>
                        </div>
                        <div className={styles.nutritionItem}>
                          <span>Carbohidrați: {meal.nutrition.carbs}g</span>
                        </div>
                        <div className={styles.nutritionItem}>
                          <span>Grăsimi: {meal.nutrition.fat}g</span>
                        </div>
                        <div className={styles.nutritionItem}>
                          <span>Fibre: {meal.nutrition.fiber}g</span>
                        </div>
                      </div>

                      {/* Ingredients */}
                      <div className={styles.ingredientsSection}>
                        <h5>🛒 Ingrediente:</h5>
                        <div className={styles.ingredientsList}>
                          {meal.ingredients.map((ingredient, index) => (
                            <div key={index} className={styles.ingredientItem}>
                              <span className={styles.ingredientName}>{ingredient.name}</span>
                              <span className={styles.ingredientAmount}>
                                {ingredient.amount} {ingredient.unit}
                              </span>
                              {ingredient.price_estimate && (
                                <span className={styles.ingredientPrice}>
                                  {ingredient.price_estimate} RON
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className={styles.instructionsSection}>
                        <h5>👨‍🍳 Preparare:</h5>
                        <ol className={styles.instructionsList}>
                          {meal.instructions.map((instruction, index) => (
                            <li key={index} className={styles.instructionItem}>
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* AI Tips */}
                      <div className={styles.tipsSection}>
                        <h5>💡 Tips AI:</h5>
                        <ul className={styles.tipsList}>
                          {meal.tips.map((tip, index) => (
                            <li key={index} className={styles.tipItem}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Nutritionist Notes */}
                      <div className={styles.notesSection}>
                        <h5>📋 Note Nutriționist:</h5>
                        <ul className={styles.notesList}>
                          {meal.nutritionist_notes.map((note, index) => (
                            <li key={index} className={styles.noteItem}>{note}</li>
                          ))}
                        </ul>
                      </div>

                      {/* AI Confidence */}
                      <div className={styles.confidenceSection}>
                        <span className={styles.confidenceLabel}>AI Confidence:</span>
                        <div className={styles.confidenceBar}>
                          <div 
                            className={styles.confidenceFill}
                            style={{ width: `${meal.ai_confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className={styles.confidenceValue}>{Math.round(meal.ai_confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                  <button className={styles.actionButton}>
                    📱 Salvează în App
                  </button>
                  <button className={styles.actionButton}>
                    🛒 Generează Lista Cumpărături
                  </button>
                  <button className={styles.actionButton}>
                    📧 Trimite Plan prin Email
                  </button>
                  <button className={styles.actionButton}>
                    📊 Analiză Nutrițională Detaliată
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.noPlansState}>
                <div className={styles.noPlanIcon}>🍎</div>
                <h3>Generează primul tău plan nutrițional AI</h3>
                <p>Completează profilul din stânga și generează un plan personalizat pentru obiectivele tale</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}