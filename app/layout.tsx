// ================================
// app/layout.tsx - Main App Layout
// ================================
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PorVerse - Your Spiritual Operating System',
  description: 'AI-powered platform for complete life optimization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

// ================================
// app/page.tsx - Landing Page
// ================================
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">PorVerse</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your AI-powered Spiritual Operating System for complete life optimization
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-green-600">🍎 PorHealth</h3>
              <p className="text-gray-600">AI-powered nutrition and fitness optimization</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-purple-600">👶 PorKids</h3>
              <p className="text-gray-600">Educational AI tutor for Romanian children</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-yellow-600">💰 PorMind</h3>
              <p className="text-gray-600">Financial coaching and wealth building</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-pink-600">🧠 PorWell</h3>
              <p className="text-gray-600">Mental health and wellness support</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">⚡ PorFlow</h3>
              <p className="text-gray-600">Productivity and time optimization</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">🎯 PorBlu</h3>
              <p className="text-gray-600">Strategic life and business planning</p>
            </div>
          </div>

          <div className="space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ================================
// app/dashboard/layout.tsx - Dashboard Layout
// ================================
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth/login')
        } else if (session?.user) {
          setUser(session.user)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 ml-64">
          <Header user={user} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

// ================================
// app/dashboard/page.tsx - Main Dashboard
// ================================
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface DashboardStats {
  ecosystems_unlocked: number
  total_usage_minutes: number
  recent_activity: number
  active_ecosystems: number
}

interface EcosystemAccess {
  ecosystem: string
  access_level: string
  usage_minutes: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [ecosystems, setEcosystems] = useState<EcosystemAccess[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        const data = await response.json()
        
        if (data.success) {
          setStats(data.data)
          setEcosystems(data.ecosystems)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const ecosystemConfig = {
    'por-health': { name: 'PorHealth', color: 'green', icon: '🍎', href: '/dashboard/por-health' },
    'por-kids': { name: 'PorKids', color: 'purple', icon: '👶', href: '/dashboard/por-kids' },
    'por-mind': { name: 'PorMind', color: 'yellow', icon: '💰', href: '/dashboard/por-mind' },
    'por-well': { name: 'PorWell', color: 'pink', icon: '🧠', href: '/dashboard/por-well' },
    'por-flow': { name: 'PorFlow', color: 'blue', icon: '⚡', href: '/dashboard/por-flow' },
    'por-blu': { name: 'PorBlu', color: 'indigo', icon: '🎯', href: '/dashboard/por-blu' }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your PorVerse command center</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ecosystems Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.ecosystems_unlocked || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((stats?.total_usage_minutes || 0) / 60)}h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.recent_activity || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Ecosystems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.active_ecosystems || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ecosystems Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Ecosystems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(ecosystemConfig).map(([key, config]) => {
            const userAccess = ecosystems.find(e => e.ecosystem === key)
            const hasAccess = !!userAccess
            const accessLevel = userAccess?.access_level || 'locked'
            
            return (
              <Card key={key} className={`transition-all hover:shadow-lg ${hasAccess ? 'border-blue-200' : 'border-gray-200 opacity-60'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{config.icon}</span>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                    </div>
                    <Badge variant={hasAccess ? 'default' : 'outline'}>
                      {accessLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {hasAccess ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Usage: {Math.round((userAccess.usage_minutes || 0) / 60)}h
                      </p>
                      <Link href={config.href}>
                        <Button className="w-full">
                          Open {config.name}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Upgrade to unlock this ecosystem
                      </p>
                      <Link href="/pricing">
                        <Button variant="outline" className="w-full">
                          Upgrade Now
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/ai-chat">
              <Button variant="outline" className="w-full">
                💬 AI Chat
              </Button>
            </Link>
            <Link href="/dashboard/progress">
              <Button variant="outline" className="w-full">
                📊 View Progress
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                ⭐ Upgrade Plan
              </Button>
            </Link>
            <Link href="/quantum-vault">
              <Button variant="outline" className="w-full">
                🔮 Quantum Vault
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ================================
// components/dashboard/Sidebar.tsx
// ================================
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  user: User
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'PorHealth', href: '/dashboard/por-health', icon: '🍎' },
    { name: 'PorKids', href: '/dashboard/por-kids', icon: '👶' },
    { name: 'PorMind', href: '/dashboard/por-mind', icon: '💰' },
    { name: 'PorWell', href: '/dashboard/por-well', icon: '🧠' },
    { name: 'PorFlow', href: '/dashboard/por-flow', icon: '⚡' },
    { name: 'PorBlu', href: '/dashboard/por-blu', icon: '🎯' },
    { name: 'AI Chat', href: '/dashboard/ai-chat', icon: '💬' },
    { name: 'Progress', href: '/dashboard/progress', icon: '📊' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            PorVerse
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="px-4 py-4 border-t">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.user_metadata?.first_name || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="mr-3">🚪</span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

// ================================
// components/dashboard/Header.tsx
// ================================
'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface HeaderProps {
  user: User
}

interface UserSubscription {
  status: string
  subscription_plans?: {
    name: string
    tier: number
  }
}

export function Header({ user }: HeaderProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription')
        const data = await response.json()
        
        if (data.success && data.data) {
          setSubscription(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      }
    }

    fetchSubscription()
  }, [])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {user.user_metadata?.first_name || 'User'}
            </h1>
            {subscription && (
              <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
                {subscription.subscription_plans?.name || 'Free Plan'}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {!subscription || subscription.status !== 'active' ? (
              <Link href="/pricing">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  ⭐ Upgrade to Premium
                </Button>
              </Link>
            ) : (
              <Link href="/quantum-vault">
                <Button size="sm" variant="outline">
                  🔮 Quantum Vault
                </Button>
              </Link>
            )}
            
            <Link href="/dashboard/settings">
              <Button size="sm" variant="outline">
                ⚙️ Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}