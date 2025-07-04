// app/dashboard/por-health/workouts/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './workouts.module.css';

interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
}

interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps?: number;
  weight?: number;
  duration?: number; // seconds
  distance?: number; // meters
  restTime: number; // seconds
  completed: boolean;
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  targetMuscles: string[];
  equipment: string[];
  exercises: Exercise[];
  sets: WorkoutSet[];
  aiOptimized: boolean;
  personalizedFor: string[];
  caloriesBurn: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'scheduled';
  scheduledFor?: Date;
  completedAt?: Date;
  feedback?: {
    difficulty: number; // 1-10
    enjoyment: number; // 1-10
    notes: string;
  };
}

interface WorkoutStats {
  totalWorkouts: number;
  weeklyStreak: number;
  totalCaloriesBurned: number;
  favoriteType: string;
  strengthPR: Record<string, number>;
  weeklyGoal: number;
  completedThisWeek: number;
}

interface BiometricReading {
  timestamp: Date;
  heartRate: number;
  caloriesBurned: number;
  intensity: 'low' | 'moderate' | 'high' | 'extreme';
}

export default function WorkoutsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'library' | 'create' | 'analytics'>('today');
  
  // Workout states
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
  const [workoutLibrary, setWorkoutLibrary] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  
  // Active workout states
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [biometricReadings, setBiometricReadings] = useState<BiometricReading[]>([]);
  
  // Timer refs
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const biometricIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // AI Workout Generator states
  const [generatingWorkout, setGeneratingWorkout] = useState(false);
  const [workoutPreferences, setWorkoutPreferences] = useState({
    type: 'strength',
    duration: 45,
    difficulty: 'intermediate',
    targetMuscles: [] as string[],
    equipment: [] as string[],
    goals: [] as string[]
  });

  useEffect(() => {
    loadWorkoutData();
    return () => {
      // Cleanup timers
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
      if (biometricIntervalRef.current) clearInterval(biometricIntervalRef.current);
    };
  }, []);

  const loadWorkoutData = async () => {
    setLoading(true);
    
    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock workout stats
    setWorkoutStats({
      totalWorkouts: 127,
      weeklyStreak: 4,
      totalCaloriesBurned: 8420,
      favoriteType: 'Strength',
      strengthPR: {
        'Bench Press': 85,
        'Squat': 120,
        'Deadlift': 140,
        'Pull-ups': 12
      },
      weeklyGoal: 4,
      completedThisWeek: 3
    });

    // Mock today's workouts
    setTodayWorkouts([
      {
        id: 'morning-strength',
        name: 'Upper Body Power',
        type: 'strength',
        difficulty: 'intermediate',
        duration: 45,
        targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
        equipment: ['Dumbbells', 'Pull-up Bar', 'Bench'],
        exercises: generateMockExercises('strength'),
        sets: [],
        aiOptimized: true,
        personalizedFor: ['Strength Building', 'Muscle Definition'],
        caloriesBurn: 320,
        status: 'scheduled',
        scheduledFor: new Date()
      },
      {
        id: 'evening-cardio',
        name: 'HIIT Cardio Blast',
        type: 'hiit',
        difficulty: 'advanced',
        duration: 25,
        targetMuscles: ['Full Body', 'Core'],
        equipment: ['Bodyweight'],
        exercises: generateMockExercises('hiit'),
        sets: [],
        aiOptimized: true,
        personalizedFor: ['Fat Loss', 'Cardiovascular Health'],
        caloriesBurn: 280,
        status: 'not_started',
        scheduledFor: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now
      }
    ]);

    // Mock workout library
    setWorkoutLibrary([
      {
        id: 'full-body-beginner',
        name: 'Full Body Beginner',
        type: 'strength',
        difficulty: 'beginner',
        duration: 30,
        targetMuscles: ['Full Body'],
        equipment: ['Dumbbells'],
        exercises: generateMockExercises('strength'),
        sets: [],
        aiOptimized: true,
        personalizedFor: ['Beginner Friendly', 'Foundation Building'],
        caloriesBurn: 200,
        status: 'not_started'
      },
      {
        id: 'yoga-flow',
        name: 'Morning Yoga Flow',
        type: 'flexibility',
        difficulty: 'beginner',
        duration: 20,
        targetMuscles: ['Full Body', 'Core'],
        equipment: ['Yoga Mat'],
        exercises: generateMockExercises('flexibility'),
        sets: [],
        aiOptimized: true,
        personalizedFor: ['Flexibility', 'Stress Relief'],
        caloriesBurn: 120,
        status: 'not_started'
      }
    ]);

    setLoading(false);
  };

  const generateMockExercises = (type: string): Exercise[] => {
    const strengthExercises: Exercise[] = [
      {
        id: 'push-ups',
        name: 'Push-ups',
        category: 'strength',
        primaryMuscles: ['Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders', 'Core'],
        equipment: ['Bodyweight'],
        difficulty: 'intermediate',
        instructions: [
          'Start in plank position with hands shoulder-width apart',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep core engaged throughout movement'
        ],
        tips: [
          'Keep your body in a straight line',
          'Control the descent for better muscle activation',
          'Breathe out as you push up'
        ]
      },
      {
        id: 'squats',
        name: 'Bodyweight Squats',
        category: 'strength',
        primaryMuscles: ['Quadriceps', 'Glutes'],
        secondaryMuscles: ['Hamstrings', 'Core'],
        equipment: ['Bodyweight'],
        difficulty: 'beginner',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower down by pushing hips back and bending knees',
          'Go down until thighs are parallel to floor',
          'Push through heels to return to standing'
        ],
        tips: [
          'Keep chest up and back straight',
          'Ensure knees track over toes',
          'Full range of motion for best results'
        ]
      }
    ];

    const hiitExercises: Exercise[] = [
      {
        id: 'burpees',
        name: 'Burpees',
        category: 'plyometric',
        primaryMuscles: ['Full Body'],
        secondaryMuscles: ['Core', 'Shoulders'],
        equipment: ['Bodyweight'],
        difficulty: 'advanced',
        instructions: [
          'Start in standing position',
          'Drop into squat and place hands on floor',
          'Jump feet back into plank position',
          'Do a push-up, then jump feet back to squat',
          'Explosively jump up with arms overhead'
        ],
        tips: [
          'Land softly to protect joints',
          'Maintain proper form even when tired',
          'Modify by stepping instead of jumping'
        ]
      }
    ];

    const flexibilityExercises: Exercise[] = [
      {
        id: 'child-pose',
        name: "Child's Pose",
        category: 'flexibility',
        primaryMuscles: ['Back', 'Hips'],
        secondaryMuscles: ['Shoulders'],
        equipment: ['Yoga Mat'],
        difficulty: 'beginner',
        instructions: [
          'Kneel on floor with big toes touching',
          'Sit back on heels and separate knees',
          'Fold forward and extend arms in front',
          'Rest forehead on ground and breathe deeply'
        ],
        tips: [
          'Hold for 30-60 seconds',
          'Focus on deep breathing',
          'Great for relaxation and stress relief'
        ]
      }
    ];

    switch (type) {
      case 'strength': return strengthExercises;
      case 'hiit': return hiitExercises;
      case 'flexibility': return flexibilityExercises;
      default: return strengthExercises;
    }
  };

  const startWorkout = (workout: Workout) => {
    setCurrentWorkout(workout);
    setIsWorkoutActive(true);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setWorkoutTimer(0);
    
    // Start workout timer
    workoutTimerRef.current = setInterval(() => {
      setWorkoutTimer(prev => prev + 1);
    }, 1000);

    // Start biometric monitoring (mock)
    biometricIntervalRef.current = setInterval(() => {
      const reading: BiometricReading = {
        timestamp: new Date(),
        heartRate: 120 + Math.floor(Math.random() * 40), // 120-160 bpm
        caloriesBurned: Math.floor(workoutTimer / 60 * 8), // ~8 cal/min
        intensity: getWorkoutIntensity()
      };
      setBiometricReadings(prev => [...prev.slice(-10), reading]); // Keep last 10 readings
    }, 10000); // Every 10 seconds
  };

  const pauseWorkout = () => {
    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }
    if (biometricIntervalRef.current) {
      clearInterval(biometricIntervalRef.current);
      biometricIntervalRef.current = null;
    }
  };

  const resumeWorkout = () => {
    if (!workoutTimerRef.current) {
      workoutTimerRef.current = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    if (!biometricIntervalRef.current) {
      biometricIntervalRef.current = setInterval(() => {
        const reading: BiometricReading = {
          timestamp: new Date(),
          heartRate: 120 + Math.floor(Math.random() * 40),
          caloriesBurned: Math.floor(workoutTimer / 60 * 8),
          intensity: getWorkoutIntensity()
        };
        setBiometricReadings(prev => [...prev.slice(-10), reading]);
      }, 10000);
    }
  };

  const finishWorkout = () => {
    if (currentWorkout) {
      // Update workout status
      const updatedWorkout = {
        ...currentWorkout,
        status: 'completed' as const,
        completedAt: new Date()
      };
      
      setTodayWorkouts(prev => 
        prev.map(w => w.id === currentWorkout.id ? updatedWorkout : w)
      );
    }
    
    // Clean up
    if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    if (biometricIntervalRef.current) clearInterval(biometricIntervalRef.current);
    
    setIsWorkoutActive(false);
    setCurrentWorkout(null);
    setBiometricReadings([]);
    setWorkoutTimer(0);
  };

  const startRestTimer = (duration: number) => {
    setRestTimer(duration);
    restTimerRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getWorkoutIntensity = (): 'low' | 'moderate' | 'high' | 'extreme' => {
    const elapsed = workoutTimer;
    if (elapsed < 300) return 'low'; // First 5 minutes
    if (elapsed < 1200) return 'moderate'; // 5-20 minutes
    if (elapsed < 2400) return 'high'; // 20-40 minutes
    return 'extreme'; // 40+ minutes
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateAIWorkout = async () => {
    setGeneratingWorkout(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const aiWorkout: Workout = {
      id: 'ai-generated-' + Date.now(),
      name: 'AI Optimized Workout',
      type: workoutPreferences.type as any,
      difficulty: workoutPreferences.difficulty as any,
      duration: workoutPreferences.duration,
      targetMuscles: workoutPreferences.targetMuscles,
      equipment: workoutPreferences.equipment,
      exercises: generateMockExercises(workoutPreferences.type),
      sets: [],
      aiOptimized: true,
      personalizedFor: workoutPreferences.goals,
      caloriesBurn: Math.floor(workoutPreferences.duration * 6),
      status: 'not_started'
    };
    
    setWorkoutLibrary(prev => [aiWorkout, ...prev]);
    setGeneratingWorkout(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
        <h2 className={styles.loadingTitle}>💪 Analyzing Workout Data</h2>
        <p className={styles.loadingText}>
          AI is optimizing your training programs and analyzing performance patterns...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.workoutsPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard/por-health" className={styles.backButton}>
            ← Back to Dashboard
          </Link>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>💪 Smart Workouts</h1>
            <p className={styles.pageSubtitle}>
              AI-powered training optimization based on your biometric data
            </p>
          </div>
        </div>
        
        <div className={styles.headerStats}>
          {workoutStats && (
            <>
              <div className={styles.quickStat}>
                <span className={styles.statValue}>{workoutStats.completedThisWeek}</span>
                <span className={styles.statUnit}>/{workoutStats.weeklyGoal} this week</span>
              </div>
              <div className={styles.quickStat}>
                <span className={styles.statValue}>{workoutStats.weeklyStreak}</span>
                <span className={styles.statUnit}>day streak</span>
              </div>
              <div className={styles.quickStat}>
                <span className={styles.statValue}>{(workoutStats.totalCaloriesBurned / 1000).toFixed(1)}k</span>
                <span className={styles.statUnit}>calories burned</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Active Workout Overlay */}
      {isWorkoutActive && currentWorkout && (
        <div className={styles.workoutOverlay}>
          <div className={styles.workoutHeader}>
            <div className={styles.workoutInfo}>
              <h3 className={styles.workoutName}>{currentWorkout.name}</h3>
              <div className={styles.workoutProgress}>
                Exercise {currentExerciseIndex + 1} of {currentWorkout.exercises.length}
              </div>
            </div>
            
            <div className={styles.workoutTimers}>
              <div className={styles.timerDisplay}>
                <span className={styles.timerLabel}>Workout</span>
                <span className={styles.timerValue}>{formatTime(workoutTimer)}</span>
              </div>
              {restTimer > 0 && (
                <div className={styles.timerDisplay}>
                  <span className={styles.timerLabel}>Rest</span>
                  <span className={styles.timerValue}>{formatTime(restTimer)}</span>
                </div>
              )}
            </div>
            
            <div className={styles.workoutControls}>
              <button 
                className={styles.pauseButton}
                onClick={workoutTimerRef.current ? pauseWorkout : resumeWorkout}
              >
                {workoutTimerRef.current ? '⏸️' : '▶️'}
              </button>
              <button className={styles.finishButton} onClick={finishWorkout}>
                ✅ Finish
              </button>
            </div>
          </div>

          {/* Live Biometrics */}
          {biometricReadings.length > 0 && (
            <div className={styles.liveBiometrics}>
              <div className={styles.biometricReading}>
                <span className={styles.biometricIcon}>❤️</span>
                <span className={styles.biometricValue}>
                  {biometricReadings[biometricReadings.length - 1]?.heartRate}
                </span>
                <span className={styles.biometricUnit}>bpm</span>
              </div>
              
              <div className={styles.biometricReading}>
                <span className={styles.biometricIcon}>🔥</span>
                <span className={styles.biometricValue}>
                  {biometricReadings[biometricReadings.length - 1]?.caloriesBurned}
                </span>
                <span className={styles.biometricUnit}>cal</span>
              </div>
              
              <div className={styles.biometricReading}>
                <span className={styles.biometricIcon}>⚡</span>
                <span className={styles.biometricValue}>
                  {biometricReadings[biometricReadings.length - 1]?.intensity}
                </span>
                <span className={styles.biometricUnit}>intensity</span>
              </div>
            </div>
          )}

          {/* Current Exercise */}
          <div className={styles.currentExercise}>
            <h4 className={styles.exerciseName}>
              {currentWorkout.exercises[currentExerciseIndex]?.name}
            </h4>
            <div className={styles.exerciseDetails}>
              <div className={styles.muscleGroups}>
                Target: {currentWorkout.exercises[currentExerciseIndex]?.primaryMuscles.join(', ')}
              </div>
              <div className={styles.exerciseInstructions}>
                {currentWorkout.exercises[currentExerciseIndex]?.instructions[0]}
              </div>
            </div>
            
            <div className={styles.setControls}>
              <button 
                className={styles.restButton}
                onClick={() => startRestTimer(60)}
              >
                Start Rest (60s)
              </button>
              <button 
                className={styles.nextSetButton}
                onClick={() => {
                  if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
                    setCurrentExerciseIndex(prev => prev + 1);
                  }
                }}
              >
                Next Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'today' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span className={styles.tabIcon}>📅</span>
          Today's Workouts
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'library' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <span className={styles.tabIcon}>📚</span>
          Workout Library
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'create' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <span className={styles.tabIcon}>🤖</span>
          AI Creator
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
        {/* TODAY'S WORKOUTS TAB */}
        {activeTab === 'today' && (
          <div className={styles.todayTab}>
            <div className={styles.workoutsList}>
              {todayWorkouts.map((workout) => (
                <div key={workout.id} className={styles.workoutCard}>
                  <div className={styles.workoutCardHeader}>
                    <div className={styles.workoutCardInfo}>
                      <h3 className={styles.workoutCardName}>{workout.name}</h3>
                      <div className={styles.workoutCardMeta}>
                        <span className={styles.workoutType}>{workout.type.toUpperCase()}</span>
                        <span className={styles.workoutDuration}>{workout.duration} min</span>
                        <span className={styles.workoutCalories}>{workout.caloriesBurn} cal</span>
                      </div>
                      <div className={styles.targetMuscles}>
                        {workout.targetMuscles.slice(0, 3).join(', ')}
                      </div>
                    </div>
                    
                    <div className={styles.workoutActions}>
                      {workout.status === 'completed' ? (
                        <div className={styles.completedBadge}>✅ Completed</div>
                      ) : workout.status === 'in_progress' ? (
                        <button 
                          className={styles.resumeButton}
                          onClick={() => startWorkout(workout)}
                        >
                          Resume
                        </button>
                      ) : (
                        <button 
                          className={styles.startButton}
                          onClick={() => startWorkout(workout)}
                        >
                          Start Workout
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.workoutPreview}>
                    <div className={styles.exercisePreview}>
                      <strong>Exercises:</strong>
                      <div className={styles.exerciseList}>
                        {workout.exercises.map((exercise, index) => (
                          <span key={exercise.id} className={styles.exerciseItem}>
                            {exercise.name}
                            {index < workout.exercises.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>

                    {workout.aiOptimized && (
                      <div className={styles.aiOptimized}>
                        <span className={styles.aiIcon}>🤖</span>
                        <span>AI Optimized for: {workout.personalizedFor.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKOUT LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className={styles.libraryTab}>
            <div className={styles.libraryHeader}>
              <h3 className={styles.sectionTitle}>Workout Library</h3>
              <div className={styles.libraryFilters}>
                <select className={styles.filterSelect}>
                  <option value="all">All Types</option>
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="hiit">HIIT</option>
                  <option value="flexibility">Flexibility</option>
                </select>
                <select className={styles.filterSelect}>
                  <option value="all">All Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className={styles.libraryGrid}>
              {workoutLibrary.map((workout) => (
                <div key={workout.id} className={styles.libraryCard}>
                  <div className={styles.libraryCardHeader}>
                    <h4 className={styles.libraryCardName}>{workout.name}</h4>
                    <div className={styles.difficultyBadge}>
                      {workout.difficulty}
                    </div>
                  </div>
                  
                  <div className={styles.libraryCardContent}>
                    <div className={styles.libraryCardStats}>
                      <span>{workout.duration} min</span>
                      <span>{workout.caloriesBurn} cal</span>
                      <span>{workout.exercises.length} exercises</span>
                    </div>
                    
                    <div className={styles.libraryCardMuscles}>
                      {workout.targetMuscles.join(', ')}
                    </div>
                    
                    <div className={styles.libraryCardEquipment}>
                      Equipment: {workout.equipment.join(', ')}
                    </div>
                  </div>

                  <div className={styles.libraryCardActions}>
                    <button className={styles.previewButton}>Preview</button>
                    <button 
                      className={styles.addToTodayButton}
                      onClick={() => {
                        setTodayWorkouts(prev => [...prev, { ...workout, status: 'scheduled' }]);
                      }}
                    >
                      Add to Today
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI CREATOR TAB */}
        {activeTab === 'create' && (
          <div className={styles.creatorTab}>
            <div className={styles.creatorContent}>
              <div className={styles.creatorHeader}>
                <h3 className={styles.sectionTitle}>🤖 AI Workout Creator</h3>
                <p className={styles.sectionSubtitle}>
                  Create personalized workouts optimized for your goals and preferences
                </p>
              </div>

              <div className={styles.preferencesForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Workout Type</label>
                    <select 
                      className={styles.formSelect}
                      value={workoutPreferences.type}
                      onChange={(e) => setWorkoutPreferences(prev => ({ 
                        ...prev, 
                        type: e.target.value 
                      }))}
                    >
                      <option value="strength">Strength Training</option>
                      <option value="cardio">Cardiovascular</option>
                      <option value="hiit">HIIT</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="custom">Custom Mix</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Duration</label>
                    <div className={styles.durationSlider}>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        step="5"
                        value={workoutPreferences.duration}
                        onChange={(e) => setWorkoutPreferences(prev => ({ 
                          ...prev, 
                          duration: parseInt(e.target.value) 
                        }))}
                        className={styles.slider}
                      />
                      <span className={styles.sliderValue}>
                        {workoutPreferences.duration} minutes
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Difficulty Level</label>
                  <div className={styles.difficultySelector}>
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <button
                        key={level}
                        className={`${styles.difficultyButton} ${
                          workoutPreferences.difficulty === level ? styles.active : ''
                        }`}
                        onClick={() => setWorkoutPreferences(prev => ({ 
                          ...prev, 
                          difficulty: level 
                        }))}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Primary Goals</label>
                  <div className={styles.goalsGrid}>
                    {[
                      'Strength Building', 'Muscle Definition', 'Fat Loss', 
                      'Endurance', 'Flexibility', 'Power Development'
                    ].map((goal) => (
                      <label key={goal} className={styles.goalLabel}>
                        <input
                          type="checkbox"
                          checked={workoutPreferences.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWorkoutPreferences(prev => ({ 
                                ...prev, 
                                goals: [...prev.goals, goal] 
                              }));
                            } else {
                              setWorkoutPreferences(prev => ({ 
                                ...prev, 
                                goals: prev.goals.filter(g => g !== goal) 
                              }));
                            }
                          }}
                          className={styles.goalCheckbox}
                        />
                        <span className={styles.goalText}>{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                className={styles.generateWorkoutButton}
                onClick={generateAIWorkout}
                disabled={generatingWorkout}
              >
                {generatingWorkout ? (
                  <span className={styles.generatingText}>
                    <span className={styles.loadingDots}></span>
                    Generating Optimal Workout...
                  </span>
                ) : (
                  '✨ Generate AI Workout'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className={styles.analyticsTab}>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <h4 className={styles.analyticsTitle}>Weekly Progress</h4>
                <div className={styles.chartPlaceholder}>
                  📊 Weekly workout completion and intensity trends
                </div>
              </div>

              <div className={styles.analyticsCard}>
                <h4 className={styles.analyticsTitle}>Strength Progress</h4>
                <div className={styles.strengthPRs}>
                  {workoutStats && Object.entries(workoutStats.strengthPR).map(([exercise, weight]) => (
                    <div key={exercise} className={styles.prItem}>
                      <span className={styles.prExercise}>{exercise}</span>
                      <span className={styles.prWeight}>{weight}kg</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.analyticsCard}>
                <h4 className={styles.analyticsTitle}>Workout Distribution</h4>
                <div className={styles.chartPlaceholder}>
                  🥧 Workout type distribution pie chart
                </div>
              </div>

              <div className={styles.analyticsCard}>
                <h4 className={styles.analyticsTitle}>AI Insights</h4>
                <div className={styles.insightsList}>
                  <div className={styles.insight}>
                    <span className={styles.insightIcon}>💡</span>
                    <span className={styles.insightText}>
                      Increase leg training frequency for balanced development
                    </span>
                  </div>
                  <div className={styles.insight}>
                    <span className={styles.insightIcon}>📈</span>
                    <span className={styles.insightText}>
                      Your consistency improved 34% this month
                    </span>
                  </div>
                  <div className={styles.insight}>
                    <span className={styles.insightIcon}>⚡</span>
                    <span className={styles.insightText}>
                      Optimal workout time: 10-11 AM based on performance data
                    </span>
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