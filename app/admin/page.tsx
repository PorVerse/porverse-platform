'use client'

import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Mock data - în producție va veni din API-uri reale
const mockData = {
  revenue: {
    total: 847293,
    monthly: 67430,
    daily: 2180,
    growth: 34.2
  },
  users: {
    total: 12847,
    active: 8932,
    new: 234,
    retention: 78.5
  },
  ecosystems: {
    'por-health': { users: 4823, revenue: 245000, engagement: 82 },
    'por-kids': { users: 3912, revenue: 156000, engagement: 91 },
    'por-mind': { users: 2134, revenue: 178000, engagement: 74 },
    'por-well': { users: 1876, revenue: 89000, engagement: 88 },
    'por-flow': { users: 1654, revenue: 134000, engagement: 79 },
    'por-blu': { users: 987, revenue: 45000, engagement: 92 }
  },
  aiUsage: {
    totalCalls: 1234567,
    cost: 23450,
    avgResponseTime: 2.3,
    errorRate: 0.2
  },
  realtimeData: [
    { time: '14:00', users: 123, revenue: 1200 },
    { time: '14:05', users: 134, revenue: 1350 },
    { time: '14:10', users: 145, revenue: 1420 },
    { time: '14:15', users: 156, revenue: 1580 },
    { time: '14:20', users: 167, revenue: 1670 },
    { time: '14:25', users: 178, revenue: 1780 },
    { time: '14:30', users: 189, revenue: 1890 }
  ],
  monthlyRevenue: [
    { month: 'Ian', revenue: 45000, users: 1200 },
    { month: 'Feb', revenue: 52000, users: 1450 },
    { month: 'Mar', revenue: 61000, users: 1680 },
    { month: 'Apr', revenue: 58000, users: 1920 },
    { month: 'Mai', revenue: 67000, users: 2150 },
    { month: 'Iun', revenue: 73000, users: 2380 },
    { month: 'Iul', revenue: 84000, users: 2640 }
  ]
}

const COLORS = ['#00ff88', '#0099ff', '#ff6b35', '#8b5cf6', '#f59e0b', '#ef4444']

export default function AdminPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeMetric, setActiveMetric] = useState('revenue')
  const [pulseEffect, setPulseEffect] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const pulseTimer = setInterval(() => {
      setPulseEffect(true)
      setTimeout(() => setPulseEffect(false), 1000)
    }, 3000)

    return () => {
      clearInterval(timer)
      clearInterval(pulseTimer)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading Mission Control...</div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ro-RO').format(num)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono">
      {/* Header NASA Style */}
      <div className="mb-8 border-b border-cyan-500 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 tracking-wider">
              🚀 PORVERSE MISSION CONTROL
            </h1>
            <p className="text-cyan-300 text-lg mt-2">NASA-Style Administrative Command Center</p>
          </div>
          <div className="text-right">
            <div className="text-2xl text-green-400 font-bold">
              {currentTime.toLocaleTimeString('ro-RO')}
            </div>
            <div className="text-cyan-300">
              {currentTime.toLocaleDateString('ro-RO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-900 to-green-700 p-6 rounded-lg border border-green-400 relative overflow-hidden">
          <div className={`absolute inset-0 bg-green-400 opacity-10 ${pulseEffect ? 'animate-pulse' : ''}`}></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm">SYSTEM STATUS</span>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold text-green-100">OPERATIONAL</div>
            <div className="text-green-300 text-sm">All systems nominal</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-lg border border-blue-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-300 text-sm">ACTIVE USERS</span>
            <span className="text-blue-100 text-xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-blue-100">{formatNumber(mockData.users.active)}</div>
          <div className="text-blue-300 text-sm">+{mockData.users.new} new today</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-700 p-6 rounded-lg border border-purple-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 text-sm">AI OPERATIONS</span>
            <span className="text-purple-100 text-xl">🤖</span>
          </div>
          <div className="text-3xl font-bold text-purple-100">{formatNumber(mockData.aiUsage.totalCalls)}</div>
          <div className="text-purple-300 text-sm">{mockData.aiUsage.avgResponseTime}s avg response</div>
        </div>

        <div className="bg-gradient-to-br from-orange-900 to-orange-700 p-6 rounded-lg border border-orange-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-300 text-sm">REVENUE</span>
            <span className="text-orange-100 text-xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-orange-100">{formatCurrency(mockData.revenue.total)}</div>
          <div className="text-orange-300 text-sm">+{mockData.revenue.growth}% growth</div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Revenue Chart */}
        <div className="lg:col-span-2 bg-gray-900 p-6 rounded-lg border border-cyan-500">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📈 REAL-TIME REVENUE TRACKING</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockData.realtimeData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #00ff88',
                  borderRadius: '8px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#00ff88" 
                strokeWidth={2}
                fill="url(#revenueGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="bg-gray-900 p-6 rounded-lg border border-cyan-500">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">🎯 KEY PERFORMANCE INDICATORS</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded border-l-4 border-green-400">
              <div className="text-green-400 text-sm">MONTHLY RECURRING REVENUE</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(mockData.revenue.monthly)}</div>
            </div>
            <div className="p-4 bg-gray-800 rounded border-l-4 border-blue-400">
              <div className="text-blue-400 text-sm">USER RETENTION RATE</div>
              <div className="text-2xl font-bold text-white">{mockData.users.retention}%</div>
            </div>
            <div className="p-4 bg-gray-800 rounded border-l-4 border-purple-400">
              <div className="text-purple-400 text-sm">AI ERROR RATE</div>
              <div className="text-2xl font-bold text-white">{mockData.aiUsage.errorRate}%</div>
            </div>
            <div className="p-4 bg-gray-800 rounded border-l-4 border-orange-400">
              <div className="text-orange-400 text-sm">DAILY REVENUE</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(mockData.revenue.daily)}</div>
            </div>
          </div>
        </div>

        {/* Ecosystem Performance */}
        <div className="bg-gray-900 p-6 rounded-lg border border-cyan-500">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">🌍 ECOSYSTEM PERFORMANCE</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(mockData.ecosystems).map(([name, data]) => ({
                  name: name.replace('por-', '').toUpperCase(),
                  value: data.revenue,
                  users: data.users
                }))}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
              >
                {Object.entries(mockData.ecosystems).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #00ff88' 
                }}
                formatter={(value: any, name: any, props: any) => [
                  formatCurrency(value), 
                  `Revenue (${formatNumber(props.payload.users)} users)`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Growth Trends */}
        <div className="lg:col-span-2 bg-gray-900 p-6 rounded-lg border border-cyan-500">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 MONTHLY GROWTH TRAJECTORY</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #00ff88' 
                }}
                formatter={(value: any, name: any) => [
                  name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                  name === 'revenue' ? 'Revenue' : 'Users'
                ]}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#00ff88" name="Revenue" />
              <Bar dataKey="users" fill="#0099ff" name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mission Control Footer */}
      <div className="mt-8 pt-4 border-t border-cyan-500 flex flex-col lg:flex-row justify-between items-center text-cyan-300">
        <div className="flex flex-wrap gap-4 mb-4 lg:mb-0">
          <span><span className="text-green-400">●</span> All systems operational</span>
          <span><span className="text-blue-400">●</span> Database: Connected</span>
          <span><span className="text-purple-400">●</span> AI Services: Online</span>
          <span><span className="text-orange-400">●</span> Payment Gateway: Active</span>
        </div>
        <div className="text-center lg:text-right">
          <div className="text-sm">MISSION COMMANDER: ADMIN</div>
          <div className="text-xs text-gray-400">PorVerse Quantum Operations Center v2.0</div>
        </div>
      </div>
    </div>
  )
}