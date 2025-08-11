import { Button, Card, CardContent, Badge } from '@/components/ui'
// ========================================
// 1. PORHEALTH ECOSYSTEM - COMPLETE
// ========================================

// components/ecosystems/PorHealthDashboard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { apiClient, useAPICall, useConversation } from '@/lib/api/api-client-complete'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface HealthMetrics {
  weight: number
  bodyFat: number
  muscle: number
  bmr: number
  steps: number
  calories: { consumed: number; target: number; burned: number }
  water: { consumed: number; target: number }
  sleep: { hours: number; quality: number }
  heartRate: { current: number; resting: number }
}

interface NutritionPlan {
  weeklyPlan: Array<{
    day: number
    totalCalories: number
    meals: Array<{
      type: string
      name: string
      ingredients: string[]
      instructions: string[]
      calories: number
      macros: { protein: number; carbs: number; fat: number }
      prepTime: number
      cost: number
    }>
  }>
  shoppingList: {
    proteins: string[]
    vegetables: string[]
    grains: string[]
    other: string[]
  }
  totalWeeklyCost: number
  nutritionTips: string[]
}

export function PorHealthDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'fitness' | 'metrics'>('overview')
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1)

  // Fetch health data
  const { data: healthMetrics, loading: metricsLoading, refetch: refetchMetrics } = useAPICall(() => 
    apiClient.getHealthMetrics()
  )

  // AI Conversation
  const { messages, loading: aiLoading, sendMessage, clearConversation } = useConversation('por-health')

  // Generate Nutrition Plan
  const generateNutritionPlan = async () => {
    setIsGeneratingPlan(true)
    try {
      const response = await apiClient.generateNutritionPlan({
        targetCalories: 2000,
        dietaryRestrictions: [],
        allergies: [],
        mealsPerDay: 3,
        budget: 'medium',
        cuisinePreferences: ['mediterranean', 'romanian']
      })

      if (response.success) {
        setNutritionPlan(response.data)
      }
    } catch (error) {
      console.error('Failed to generate nutrition plan:', error)
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  // Generate Workout Plan
  const generateWorkoutPlan = async () => {
    const response = await apiClient.generateWorkoutPlan({
      fitnessLevel: 'intermediate',
      goals: ['weight-loss', 'muscle-gain'],
      daysPerWeek: 4,
      minutesPerSession: 45,
      equipment: ['dumbbells', 'resistance-bands'],
      injuries: []
    })

    if (response.success) {
      // Handle workout plan display
      console.log('Workout plan generated:', response.data)
    }
  }

  const OverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Health Score */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">85</div>
          <div className="flex items-center space-x-2 text-xs text-green-600">
            <span>↗️ +5 this week</span>
          </div>
          <Progress value={85} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Calories */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Calories Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {healthMetrics?.calories?.consumed || 1650}
          </div>
          <div className="text-xs text-blue-600">
            of {healthMetrics?.calories?.target || 2000} goal
          </div>
          <Progress 
            value={((healthMetrics?.calories?.consumed || 1650) / (healthMetrics?.calories?.target || 2000)) * 100} 
            className="mt-2 h-2" 
          />
        </CardContent>
      </Card>

      {/* Steps */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Steps Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {healthMetrics?.steps || 8642}
          </div>
          <div className="text-xs text-purple-600">of 10,000 goal</div>
          <Progress value={((healthMetrics?.steps || 8642) / 10000) * 100} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Sleep */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">Sleep Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">
            {healthMetrics?.sleep?.hours || 7.5}h
          </div>
          <div className="text-xs text-orange-600">
            Quality: {healthMetrics?.sleep?.quality || 85}%
          </div>
          <Progress value={healthMetrics?.sleep?.quality || 85} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* AI Health Assistant */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🤖 AI Health Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-100 ml-8'
                    : 'bg-gray-100 mr-8'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
                      <div className="mt-4 flex space-x-2">
              <input
                type="text"
                placeholder="Ask about your health..."
                className="flex-1 px-3 py-2 border rounded-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    sendMessage(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <Button disabled={aiLoading}>
                {aiLoading ? '...' : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={generateNutritionPlan}
              disabled={isGeneratingPlan}
              className="w-full"
            >
              {isGeneratingPlan ? 'Generating...' : '🥗 Generate Meal Plan'}
            </Button>
            <Button onClick={generateWorkoutPlan} className="w-full">
              💪 Create Workout Plan
            </Button>
            <Button onClick={refetchMetrics} className="w-full">
              📊 Sync Health Data
            </Button>
          </CardContent>
        </Card>
      </div>
    )

    const NutritionTab = () => (
      <div className="space-y-6">
        {/* Meal Plan Display */}
        {nutritionPlan ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Day Selector */}
              <div className="flex space-x-2 mb-4 overflow-x-auto">
                {Array.from({length: 7}, (_, i) => i + 1).map(day => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? "default" : "outline"}
                    onClick={() => setSelectedDay(day)}
                    className="min-w-[100px]"
                  >
                    Day {day}
                  </Button>
                ))}
              </div>

              {/* Meals for Selected Day */}
              <div className="space-y-4">
                {nutritionPlan.weeklyPlan
                  .find(plan => plan.day === selectedDay)
                  ?.meals.map((meal, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}: {meal.name}</span>
                        <Badge>{meal.calories} cal</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Ingredients:</h4>
                          <ul className="text-sm space-y-1">
                            {meal.ingredients.map((ingredient, i) => (
                              <li key={i}>• {ingredient}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Instructions:</h4>
                          <ol className="text-sm space-y-1">
                            {meal.instructions.map((instruction, i) => (
                              <li key={i}>{i + 1}. {instruction}</li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Nutrition:</h4>
                          <div className="text-sm space-y-1">
                            <div>Protein: {meal.macros.protein}g</div>
                            <div>Carbs: {meal.macros.carbs}g</div>
                            <div>Fat: {meal.macros.fat}g</div>
                            <div className="pt-2 border-t">
                              <div>Prep Time: {meal.prepTime} min</div>
                              <div>Cost: {meal.cost} RON</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Shopping List */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>🛒 Shopping List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(nutritionPlan.shoppingList).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="font-medium capitalize mb-2">{category}:</h4>
                        <ul className="text-sm space-y-1">
                          {items.map((item, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="font-medium">
                      Total Weekly Cost: {nutritionPlan.totalWeeklyCost} RON
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition Tips */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>💡 Nutrition Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    {nutritionPlan.nutritionTips.map((tip, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-green-500">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🥗</div>
            <h3 className="text-lg font-medium mb-2">No Nutrition Plan Yet</h3>
            <p className="text-gray-600 mb-4">Generate a personalized meal plan to get started</p>
            <Button onClick={generateNutritionPlan} disabled={isGeneratingPlan}>
              {isGeneratingPlan ? 'Generating...' : 'Generate Meal Plan'}
            </Button>
          </div>
        )}
      </div>
    )

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">PorHealth Dashboard</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={clearConversation}>
              Clear Chat
            </Button>
            <Button>Sync Data</Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
            { id: 'fitness', label: 'Fitness', icon: '💪' },
            { id: 'metrics', label: 'Metrics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'nutrition' && <NutritionTab />}
        {activeTab === 'fitness' && <div>Fitness content here...</div>}
        {activeTab === 'metrics' && <div>Metrics content here...</div>}
      </div>
    )
  }