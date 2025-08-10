// ================================
// app/auth/login/page.tsx
// ================================
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      router.push(redirectTo)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to PorVerse
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ================================
// app/auth/register/page.tsx
// ================================
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      })

      if (error) throw error

      if (data.user && !data.session) {
        setSuccess(true)
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Check your email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              We've sent you a confirmation link at <strong>{formData.email}</strong>
            </p>
            <Link href="/auth/login">
              <Button className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your PorVerse account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get started today</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ================================
// app/dashboard/por-health/page.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PorHealthPage() {
  const [nutritionPlan, setNutritionPlan] = useState(null)
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateNutritionPlan = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ecosystems/por-health/nutrition/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: 30,
          weight: 70,
          height: 175,
          activity_level: 'moderate',
          goals: ['weight_loss', 'muscle_gain']
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setNutritionPlan(data.data)
      }
    } catch (error) {
      console.error('Failed to generate nutrition plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateWorkoutPlan = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ecosystems/por-health/workouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fitness_level: 'intermediate',
          available_time: 45,
          equipment: ['dumbbells', 'resistance_bands'],
          goals: ['strength', 'endurance']
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setWorkoutPlan(data.data)
      }
    } catch (error) {
      console.error('Failed to generate workout plan:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            🍎 PorHealth
          </h1>
          <p className="text-gray-600 mt-2">AI-powered nutrition and fitness optimization</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          Health Ecosystem
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,847</div>
            <p className="text-xs text-gray-500 mt-1">Goal: 2,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Workouts This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">4</div>
            <p className="text-xs text-gray-500 mt-1">Goal: 5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">85</div>
            <p className="text-xs text-gray-500 mt-1">Great progress!</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Nutrition Planner */}
      <Card>
        <CardHeader>
          <CardTitle>AI Nutrition Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Get a personalized nutrition plan optimized for Romanian foods and your specific goals.
            </p>
            
            {nutritionPlan ? (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Your Nutrition Plan</h4>
                <p className="text-green-700">Daily Calories: {nutritionPlan.daily_calories || 2000}</p>
                <p className="text-green-700">Plan generated successfully! Check your meal recommendations.</p>
              </div>
            ) : (
              <Button onClick={generateNutritionPlan} disabled={loading}>
                {loading ? 'Generating...' : '🍽️ Generate Nutrition Plan'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Workout Generator */}
      <Card>
        <CardHeader>
          <CardTitle>AI Workout Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Create personalized workout routines based on your fitness level and available equipment.
            </p>
            
            {workoutPlan ? (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Your Workout Plan</h4>
                <p className="text-blue-700">Duration: {workoutPlan.duration || 45} minutes</p>
                <p className="text-blue-700">Workout plan generated! Ready to start your fitness journey.</p>
              </div>
            ) : (
              <Button onClick={generateWorkoutPlan} disabled={loading}>
                {loading ? 'Generating...' : '💪 Generate Workout Plan'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-green-600">🥗</span>
              <div className="flex-1">
                <p className="font-medium">Logged breakfast</p>
                <p className="text-sm text-gray-500">Ovăz cu fructe - 350 calories</p>
              </div>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-blue-600">🏃</span>
              <div className="flex-1">
                <p className="font-medium">Completed morning run</p>
                <p className="text-sm text-gray-500">5km in 28 minutes</p>
              </div>
              <span className="text-xs text-gray-400">Yesterday</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ================================
// app/dashboard/por-kids/page.tsx
// ================================
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function PorKidsPage() {
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const simulateHomeworkScan = async () => {
    setLoading(true)
    try {
      // Simulate homework scanning
      setTimeout(() => {
        setScanResult({
          problem: "2x + 5 = 15. Find x.",
          solution: "x = 5",
          explanation: "Subtract 5 from both sides, then divide by 2",
          subject: "Mathematics",
          grade: 7
        })
        setLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Homework scan failed:', error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            👶 PorKids
          </h1>
          <p className="text-gray-600 mt-2">Educational AI tutor for Romanian children</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800">
          Education Ecosystem
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Problems Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">47</div>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Learning Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-xs text-gray-500 mt-1">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mastery Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">78%</div>
            <p className="text-xs text-gray-500 mt-1">Mathematics</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Homework Scanner */}
      <Card>
        <CardHeader>
          <CardTitle>AI Homework Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Take a photo of your homework and get instant AI-powered solutions and explanations.
            </p>
            
            {scanResult ? (
              <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-purple-800">Problem Solved!</h4>
                <div className="space-y-2">
                  <p><strong>Problem:</strong> {scanResult.problem}</p>
                  <p><strong>Solution:</strong> {scanResult.solution}</p>
                  <p><strong>Explanation:</strong> {scanResult.explanation}</p>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{scanResult.subject}</Badge>
                    <Badge variant="outline">Grade {scanResult.grade}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-4xl mb-4">📷</div>
                <p className="text-gray-500 mb-4">Upload homework photo or scan with camera</p>
                <Button onClick={simulateHomeworkScan} disabled={loading}>
                  {loading ? 'Analyzing...' : '📸 Try Demo Scan'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Matematică</span>
                <span className="text-sm text-gray-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Română</span>
                <span className="text-sm text-gray-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Științe</span>
                <span className="text-sm text-gray-600">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '72%'}}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Learning Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-green-600">✅</span>
              <div className="flex-1">
                <p className="font-medium">Completed math homework</p>
                <p className="text-sm text-gray-500">Equations and inequalities - 95% accuracy</p>
              </div>
              <span className="text-xs text-gray-400">1h ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-blue-600">🏆</span>
              <div className="flex-1">
                <p className="font-medium">Achievement unlocked</p>
                <p className="text-sm text-gray-500">Math Problem Solver - Level 5</p>
              </div>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ================================
// app/pricing/page.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePayments } from '@/hooks/usePayments'

interface Plan {
  id: string
  name: string
  slug: string
  tier: number
  price_monthly_ron: number
  price_yearly_ron: number
  price_monthly_usd: number
  price_yearly_usd: number
  features: string[]
  ecosystems: string[]
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  
  const { createStripeCheckout, createPayPalSubscription, loading: paymentLoading } = usePayments()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/payments/plans')
        const data = await response.json()
        
        if (data.success) {
          setPlans(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSubscribe = async (planId: string, method: 'stripe' | 'paypal') => {
    try {
      if (method === 'stripe') {
        await createStripeCheckout(planId, billingCycle)
      } else {
        await createPayPalSubscription(planId, billingCycle)
      }
    } catch (error) {
      console.error('Subscription failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Choose Your PorVerse Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Unlock your full potential with AI-powered life optimization
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white p-1 rounded-lg border">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.price_monthly_ron : plan.price_yearly_ron
            const isPopular = plan.slug.includes('premium')
            
            return (
              <Card key={plan.id} className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {price === 0 ? 'Free' : `${price} RON`}
                    {price > 0 && (
                      <span className="text-sm font-normal text-gray-600">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Ecosystems Included:</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan.ecosystems.map((ecosystem) => (
                          <Badge key={ecosystem} variant="outline" className="text-xs">
                            {ecosystem.replace('por-', '').toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Features:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {plan.features.slice(0, 5).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="text-green-600 mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {plan.slug !== 'health-free' && plan.slug !== 'kids-free' ? (
                      <div className="space-y-2 pt-4">
                        <Button 
                          className="w-full"
                          onClick={() => handleSubscribe(plan.id, 'stripe')}
                          disabled={paymentLoading}
                        >
                          Subscribe with Stripe
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => handleSubscribe(plan.id, 'paypal')}
                          disabled={paymentLoading}
                        >
                          Subscribe with PayPal
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use enterprise-grade encryption and follow GDPR compliance standards to protect your personal information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}