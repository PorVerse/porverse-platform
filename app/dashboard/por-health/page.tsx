// app/dashboard/por-health/page.tsx - Real Implementation
'use client'

import React, { useState, useEffect } from 'react'
import { apiClient, useUserProfile, useEcosystemAccess } from '@/lib/api/api-client-production'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Activity, Target, TrendingUp, Zap, Heart, Droplets } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import styles from './style.module.css'

interface HealthMetrics {
  weight: number
  height: number
  age: number
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'athletic_performance'
  dietary_restrictions: string[]
  allergies: string[]
}

interface NutritionData {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

interface WorkoutData {
  date: string
  type: string
  duration: number
  calories_burned: number
  intensity: number
}

export default function PorHealthDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null)
  const [nutritionData, setNutritionData] = useState<NutritionData[]>([])
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([])
  const [loading, setLoading] = useState(true)
  const [aiChat, setAiChat] = useState<{ messages: any[]; conversationId?: string }>({ messages: [] })
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const userProfile = useUserProfile()
  const ecosystemAccess = useEcosystemAccess('por-health')

  // Load health data on mount
  useEffect(() => {
    loadHealthData()
  }, [])

  const loadHealthData = async () => {
    setLoading(true)
    try {
      // Load health profile
      const healthResponse = await apiClient.getHealthProfile()
      if (healthResponse.success && healthResponse.data) {
        setHealthMetrics(healthResponse.data)
      }

      // Load recent nutrition data
      const progressResponse = await apiClient.getProgress('por-health')
      if (progressResponse.success) {
        const nutrition = progressResponse.data
          .filter((p: any) => p.progress_type === 'nutrition')
          .map((p: any) => ({
            date: new Date(p.date_recorded).toLocaleDateString(),
            ...p.progress_data
          }))
          .slice(0, 7) // Last 7 days

        setNutritionData(nutrition)

        const workouts = progressResponse.data
          .filter((p: any) => p.progress_type === 'workout')
          .map((p: any) => ({
            date: new Date(p.date_recorded).toLocaleDateString(),
            ...p.progress_data
          }))
          .slice(0, 7)

        setWorkoutData(workouts)
      }

      // Load AI conversation history
      const chatResponse = await apiClient.getConversationHistory('por-health')
      if (chatResponse.success && chatResponse.data.length > 0) {
        const lastConversation = chatResponse.data[0]
        setAiChat({
          messages: lastConversation.messages,
          conversationId: lastConversation.id
        })
      }

    } catch (error) {
      console.error('Error loading health data:', error)
      toast.error('Failed to load health data')
    } finally {
      setLoading(false)
    }
  }

  const updateHealthMetrics = async (newMetrics: Partial<HealthMetrics>) => {
    try {
      const response = await apiClient.updateHealthProfile(newMetrics)
      if (response.success) {
        setHealthMetrics(prev => ({ ...prev, ...newMetrics } as HealthMetrics))
        toast.success('Health metrics updated!')
      }
    } catch (error) {
      toast.error('Failed to update health metrics')
    }
  }

  const logNutritionEntry = async (entry: Omit<NutritionData, 'date'>) => {
    try {
      const response = await apiClient.saveProgress('por-health', {
        progress_type: 'nutrition',
        progress_data: entry,
        score: calculateNutritionScore(entry),
        date_recorded: new Date().toISOString()
      })

      if (response.success) {
        setNutritionData(prev => [
          {
            date: new Date().toLocaleDateString(),
            ...entry
          },
          ...prev.slice(0, 6)
        ])
        toast.success('Nutrition logged!')
      }
    } catch (error) {
      toast.error('Failed to log nutrition')
    }
  }

  const logWorkout = async (workout: Omit<WorkoutData, 'date'>) => {
    try {
      const response = await apiClient.saveProgress('por-health', {
        progress_type: 'workout',
        progress_data: workout,
        score: workout.intensity * workout.duration / 10,
        date_recorded: new Date().toISOString()
      })

      if (response.success) {
        setWorkoutData(prev => [
          {
            date: new Date().toLocaleDateString(),
            ...workout
          },
          ...prev.slice(0, 6)
        ])
        toast.success('Workout logged!')
      }
    } catch (error) {
      toast.error('Failed to log workout')
    }
  }

  const sendAIMessage = async () => {
    if (!aiMessage.trim()) return

    setAiLoading(true)
    const userMessage = {
      role: 'user' as const,
      content: aiMessage,
      timestamp: new Date().toISOString()
    }

    setAiChat(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }))

    setAiMessage('')

    try {
      let conversationId = aiChat.conversationId

      if (!conversationId) {
        const newConversation = await apiClient.startAIConversation('por-health', aiMessage)
        if (newConversation.success) {
          conversationId = newConversation.data.id
          setAiChat(prev => ({ ...prev, conversationId }))
        }
      } else {
        const response = await apiClient.sendAIMessage(conversationId, aiMessage, 'por-health')
        if (response.success) {
          setAiChat(prev => ({
            ...prev,
            messages: [...prev.messages, response.data.aiResponse]
          }))
        }
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setAiLoading(false)
    }
  }

  const calculateNutritionScore = (entry: Omit<NutritionData, 'date'>): number => {
    if (!healthMetrics) return 50
    
    const targetCalories = calculateTargetCalories(healthMetrics)
    const calorieScore = Math.min(100, (entry.calories / targetCalories) * 100)
    
    return Math.round(calorieScore)
  }

  const calculateTargetCalories = (metrics: HealthMetrics): number => {
    // Simplified BMR calculation
    const bmr = 88.362 + (13.397 * metrics.weight) + (4.799 * metrics.height) - (5.677 * metrics.age)
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    
    return Math.round(bmr * activityMultipliers[metrics.activity_level])
  }

  const generateMealPlan = async () => {
    if (!healthMetrics) {
      toast.error('Please complete your health profile first')
      return
    }

    setAiLoading(true)
    try {
      const prompt = `Generate a personalized 3-day meal plan for:
- Weight: ${healthMetrics.weight}kg
- Height: ${healthMetrics.height}cm  
- Age: ${healthMetrics.age}
- Activity Level: ${healthMetrics.activity_level}
- Goal: ${healthMetrics.goal}
- Dietary Restrictions: ${healthMetrics.dietary_restrictions.join(', ')}
- Allergies: ${healthMetrics.allergies.join(', ')}

Include specific meals with calories and macros for each day.`

      const response = await apiClient.sendAIMessage(
        aiChat.conversationId || await createNewConversation(), 
        prompt, 
        'por-health'
      )

      if (response.success) {
        setAiChat(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: 'user' as const,
              content: 'Generate my personalized meal plan',
              timestamp: new Date().toISOString()
            },
            response.data.aiResponse
          ]
        }))
        setActiveTab('ai-coach')
      }
    } catch (error) {
      toast.error('Failed to generate meal plan')
    } finally {
      setAiLoading(false)
    }
  }

  const createNewConversation = async (): Promise<string> => {
    const response = await apiClient.startAIConversation('por-health')
    if (response.success) {
      setAiChat(prev => ({ ...prev, conversationId: response.data.id }))
      return response.data.id
    }
    throw new Error('Failed to create conversation')
  }

  // Check access
  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner}></div>
          <h2>Loading PorHealth...</h2>
          <p>Gathering your health insights</p>
        </div>
      </div>
    )
  }

  if (!ecosystemAccess.success || !ecosystemAccess.data?.hasAccess) {
    return (
      <div className={styles.dashboard}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">🌿 PorHealth Access Required</h2>
          <p className="mb-6">Upgrade to access AI-powered health optimization</p>
          <Link href="/pricing">
            <Button>Upgrade Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  const todayNutrition = nutritionData[0]
  const targetCalories = healthMetrics ? calculateTargetCalories(healthMetrics) : 2000

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🌿 PorHealth Dashboard</h1>
          <p className={styles.subtitle}>AI-powered health optimization</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateMealPlan} disabled={aiLoading}>
            {aiLoading ? 'Generating...' : '🍎 Generate Meal Plan'}
          </Button>
          <Badge variant={ecosystemAccess.data?.level === 'premium' ? 'default' : 'secondary'}>
            {ecosystemAccess.data?.level?.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="ai-coach">AI Coach</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Today's Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
                <Target className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {todayNutrition?.calories || 0} / {targetCalories}
                </div>
                <Progress value={(todayNutrition?.calories || 0) / targetCalories * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
                <Droplets className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {todayNutrition?.water || 0}L / 2.5L
                </div>
                <Progress value={(todayNutrition?.water || 0) / 2.5 * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Heart className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {todayNutrition ? calculateNutritionScore(todayNutrition) : 0}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Daily health optimization</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Trend (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={nutritionData.reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="calories" stroke="#00ff88" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workout Intensity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workoutData.reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="intensity" fill="#00ff88" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-6">
          <QuickNutritionLog onLog={logNutritionEntry} />
          <NutritionHistory data={nutritionData} />
        </TabsContent>

        <TabsContent value="fitness" className="space-y-6">
          <QuickWorkoutLog onLog={logWorkout} />
          <WorkoutHistory data={workoutData} />
        </TabsContent>

        <TabsContent value="ai-coach" className="space-y-6">
          <AIHealthCoach 
            messages={aiChat.messages}
            onSendMessage={sendAIMessage}
            message={aiMessage}
            setMessage={setAiMessage}
            loading={aiLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Quick nutrition logging component
function QuickNutritionLog({ onLog }: { onLog: (entry: any) => void }) {
  const [entry, setEntry] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLog(entry)
    setEntry({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Nutrition Log</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium">Calories</label>
            <Input
              type="number"
              value={entry.calories}
              onChange={(e) => setEntry(prev => ({ ...prev, calories: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Protein (g)</label>
            <Input
              type="number"
              value={entry.protein}
              onChange={(e) => setEntry(prev => ({ ...prev, protein: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Carbs (g)</label>
            <Input
              type="number"
              value={entry.carbs}
              onChange={(e) => setEntry(prev => ({ ...prev, carbs: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Fat (g)</label>
            <Input
              type="number"
              value={entry.fat}
              onChange={(e) => setEntry(prev => ({ ...prev, fat: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Water (L)</label>
            <Input
              type="number"
              step="0.1"
              value={entry.water}
              onChange={(e) => setEntry(prev => ({ ...prev, water: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
          <Button type="submit" className="col-span-2 md:col-span-5 mt-4">
            Log Nutrition
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Quick workout logging component
function QuickWorkoutLog({ onLog }: { onLog: (workout: any) => void }) {
  const [workout, setWorkout] = useState({
    type: '',
    duration: 0,
    calories_burned: 0,
    intensity: 5
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLog(workout)
    setWorkout({ type: '', duration: 0, calories_burned: 0, intensity: 5 })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Workout Log</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Type</label>
            <Input
              value={workout.type}
              onChange={(e) => setWorkout(prev => ({ ...prev, type: e.target.value }))}
              placeholder="e.g. Running, Gym"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Duration (min)</label>
            <Input
              type="number"
              value={workout.duration}
              onChange={(e) => setWorkout(prev => ({ ...prev, duration: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Calories Burned</label>
            <Input
              type="number"
              value={workout.calories_burned}
              onChange={(e) => setWorkout(prev => ({ ...prev, calories_burned: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Intensity (1-10)</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={workout.intensity}
              onChange={(e) => setWorkout(prev => ({ ...prev, intensity: Number(e.target.value) }))}
            />
          </div>
          <Button type="submit" className="col-span-2 md:col-span-4 mt-4">
            Log Workout
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Nutrition history component
function NutritionHistory({ data }: { data: NutritionData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((entry, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{entry.date}</span>
              <div className="flex gap-4 text-sm">
                <span>{entry.calories} cal</span>
                <span>{entry.protein}g protein</span>
                <span>{entry.carbs}g carbs</span>
                <span>{entry.fat}g fat</span>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-center text-gray-500 py-4">No nutrition data yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Workout history component
function WorkoutHistory({ data }: { data: WorkoutData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((workout, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{workout.type}</span>
                <span className="text-sm text-gray-500 ml-2">{workout.date}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span>{workout.duration} min</span>
                <span>{workout.calories_burned} cal</span>
                <span>Intensity: {workout.intensity}/10</span>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-center text-gray-500 py-4">No workout data yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// AI Health Coach component
function AIHealthCoach({ 
  messages, 
  onSendMessage, 
  message, 
  setMessage, 
  loading 
}: {
  messages: any[]
  onSendMessage: () => void
  message: string
  setMessage: (msg: string) => void
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 AI Health Coach</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto border rounded p-4 mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500">
              <p>Start a conversation with your AI health coach!</p>
              <p className="text-sm mt-2">Ask about nutrition, workouts, or health optimization.</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">🤖</div>
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Ask your health coach anything..."
            disabled={loading}
          />
          <Button onClick={onSendMessage} disabled={loading || !message.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}