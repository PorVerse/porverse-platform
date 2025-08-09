// app/dashboard/por-mind/page.tsx - Financial Coaching
'use client'

import React, { useState, useEffect } from 'react'
import { apiClient, useUserProfile, useEcosystemAccess } from '@/lib/api/api-client-production'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { DollarSign, TrendingUp, Target, PiggyBank, CreditCard, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import styles from './style.module.css'

interface FinancialProfile {
  id: string
  monthly_income: number
  currency: string
  savings_goal: number
  retirement_age: number
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  investment_experience: 'beginner' | 'intermediate' | 'advanced'
  created_at: string
}

interface Budget {
  id: string
  name: string
  categories: Record<string, number>
  period: 'monthly' | 'weekly'
  total_amount: number
  is_active: boolean
  created_at: string
}

interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  merchant: string
  transaction_date: string
  is_recurring: boolean
}

interface InvestmentRecommendation {
  symbol: string
  name: string
  type: 'stock' | 'etf' | 'bond' | 'crypto'
  risk_level: number
  expected_return: number
  reason: string
  allocation_percentage: number
}

const EXPENSE_CATEGORIES = [
  'Housing', 'Food', 'Transportation', 'Healthcare', 'Entertainment',
  'Shopping', 'Utilities', 'Insurance', 'Education', 'Savings', 'Other'
]

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function PorMindDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [investments, setInvestments] = useState<InvestmentRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [aiChat, setAiChat] = useState<{ messages: any[]; conversationId?: string }>({ messages: [] })
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const userProfile = useUserProfile()
  const ecosystemAccess = useEcosystemAccess('por-mind')

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    setLoading(true)
    try {
      // Load financial profile
      const profileResponse = await fetch('/api/por-mind/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setFinancialProfile(profileData.data)
      }

      // Load budgets
      const budgetResponse = await fetch('/api/por-mind/budgets')
      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json()
        setBudgets(budgetData.data || [])
      }

      // Load recent transactions
      const transactionResponse = await fetch('/api/por-mind/transactions?limit=50')
      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json()
        setTransactions(transactionData.data || [])
      }

      // Load AI conversation history
      const chatResponse = await apiClient.getConversationHistory('por-mind')
      if (chatResponse.success && chatResponse.data.length > 0) {
        const lastConversation = chatResponse.data[0]
        setAiChat({
          messages: lastConversation.messages,
          conversationId: lastConversation.id
        })
      }

    } catch (error) {
      console.error('Error loading financial data:', error)
      toast.error('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }

  const createFinancialProfile = async (profileData: Omit<FinancialProfile, 'id' | 'created_at'>) => {
    try {
      const response = await fetch('/api/por-mind/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        const data = await response.json()
        setFinancialProfile(data.data)
        toast.success('Financial profile created!')
        
        // Generate initial investment recommendations
        generateInvestmentRecommendations(data.data)
      }
    } catch (error) {
      toast.error('Failed to create financial profile')
    }
  }

  const generateInvestmentRecommendations = async (profile?: FinancialProfile) => {
    if (!profile && !financialProfile) return

    setAiLoading(true)
    try {
      const targetProfile = profile || financialProfile!
      
      const prompt = `Generate investment recommendations for:
- Monthly Income: ${targetProfile.monthly_income} ${targetProfile.currency}
- Savings Goal: ${targetProfile.savings_goal} ${targetProfile.currency}
- Risk Tolerance: ${targetProfile.risk_tolerance}
- Investment Experience: ${targetProfile.investment_experience}
- Retirement Age: ${targetProfile.retirement_age}

Provide specific ETFs, stocks, and bonds with allocation percentages for a balanced portfolio.`

      const response = await apiClient.sendAIMessage(
        aiChat.conversationId || await createNewConversation(),
        prompt,
        'por-mind'
      )

      if (response.success) {
        // Parse AI response to extract investment recommendations
        const mockRecommendations: InvestmentRecommendation[] = [
          {
            symbol: 'VTI',
            name: 'Vanguard Total Stock Market ETF',
            type: 'etf',
            risk_level: targetProfile.risk_tolerance === 'conservative' ? 3 : 
                       targetProfile.risk_tolerance === 'moderate' ? 5 : 7,
            expected_return: 7.5,
            reason: 'Broad market exposure with low fees',
            allocation_percentage: targetProfile.risk_tolerance === 'conservative' ? 40 : 
                                   targetProfile.risk_tolerance === 'moderate' ? 60 : 70
          },
          {
            symbol: 'BND',
            name: 'Vanguard Total Bond Market ETF',
            type: 'etf',
            risk_level: 2,
            expected_return: 3.5,
            reason: 'Stable income and portfolio diversification',
            allocation_percentage: targetProfile.risk_tolerance === 'conservative' ? 50 : 
                                   targetProfile.risk_tolerance === 'moderate' ? 30 : 20
          },
          {
            symbol: 'VXUS',
            name: 'Vanguard Total International Stock ETF',
            type: 'etf',
            risk_level: 6,
            expected_return: 6.8,
            reason: 'International diversification',
            allocation_percentage: 10
          }
        ]

        setInvestments(mockRecommendations)
        
        setAiChat(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: 'user' as const,
              content: 'Generate my investment recommendations',
              timestamp: new Date().toISOString()
            },
            response.data.aiResponse
          ]
        }))
      }
    } catch (error) {
      toast.error('Failed to generate recommendations')
    } finally {
      setAiLoading(false)
    }
  }

  const logTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const response = await fetch('/api/por-mind/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(prev => [data.data, ...prev.slice(0, 49)])
        toast.success('Transaction logged!')
        
        // Update budget if applicable
        updateBudgetSpending(transaction.category, transaction.amount)
      }
    } catch (error) {
      toast.error('Failed to log transaction')
    }
  }

  const updateBudgetSpending = (category: string, amount: number) => {
    setBudgets(prev => prev.map(budget => {
      if (budget.is_active && budget.categories[category]) {
        return {
          ...budget,
          categories: {
            ...budget.categories,
            [category]: budget.categories[category] - Math.abs(amount)
          }
        }
      }
      return budget
    }))
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
        const newConversation = await apiClient.startAIConversation('por-mind', aiMessage)
        if (newConversation.success) {
          conversationId = newConversation.data.id
          setAiChat(prev => ({ ...prev, conversationId }))
        }
      } else {
        const response = await apiClient.sendAIMessage(conversationId, aiMessage, 'por-mind')
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

  const createNewConversation = async (): Promise<string> => {
    const response = await apiClient.startAIConversation('por-mind')
    if (response.success) {
      setAiChat(prev => ({ ...prev, conversationId: response.data.id }))
      return response.data.id
    }
    throw new Error('Failed to create conversation')
  }

  const calculateNetWorth = (): number => {
    // Simplified calculation
    const monthlyIncome = financialProfile?.monthly_income || 0
    const estimatedSavings = monthlyIncome * 6 // Rough estimate
    return estimatedSavings
  }

  const calculateMonthlySpending = (): number => {
    const currentMonth = new Date().getMonth()
    return transactions
      .filter(t => new Date(t.transaction_date).getMonth() === currentMonth && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner}></div>
          <h2>Loading PorMind...</h2>
          <p>Analyzing your financial landscape</p>
        </div>
      </div>
    )
  }

  if (!ecosystemAccess.success || !ecosystemAccess.data?.hasAccess) {
    return (
      <div className={styles.dashboard}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">🧠 PorMind Access Required</h2>
          <p className="mb-6">Upgrade to access AI-powered financial coaching</p>
          <Link href="/pricing">
            <Button>Upgrade Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  const netWorth = calculateNetWorth()
  const monthlySpending = calculateMonthlySpending()
  const activeBudget = budgets.find(b => b.is_active)

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🧠 PorMind Dashboard</h1>
          <p className={styles.subtitle}>AI-powered financial growth</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button onClick={() => generateInvestmentRecommendations()} disabled={aiLoading}>
            {aiLoading ? 'Analyzing...' : '📊 Generate Investment Plan'}
          </Button>
          <Badge variant={ecosystemAccess.data?.level === 'premium' ? 'default' : 'secondary'}>
            {ecosystemAccess.data?.level?.toUpperCase()}
          </Badge>
        </div>
      </div>

      {!financialProfile ? (
        <CreateFinancialProfile onSubmit={createFinancialProfile} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="advisor">AI Advisor</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FinancialOverview 
              profile={financialProfile}
              netWorth={netWorth}
              monthlySpending={monthlySpending}
              transactions={transactions}
              activeBudget={activeBudget}
            />
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetManager 
              budgets={budgets}
              setBudgets={setBudgets}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="investments" className="space-y-6">
            <InvestmentPortfolio 
              recommendations={investments}
              profile={financialProfile}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionTracker 
              transactions={transactions}
              onLogTransaction={logTransaction}
            />
          </TabsContent>

          <TabsContent value="advisor" className="space-y-6">
            <AIFinancialAdvisor 
              messages={aiChat.messages}
              onSendMessage={sendAIMessage}
              message={aiMessage}
              setMessage={setAiMessage}
              loading={aiLoading}
              profile={financialProfile}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// Create financial profile component
function CreateFinancialProfile({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    monthly_income: 0,
    currency: 'RON',
    savings_goal: 0,
    retirement_age: 65,
    risk_tolerance: 'moderate' as const,
    investment_experience: 'beginner' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.monthly_income <= 0) {
      toast.error('Please enter your monthly income')
      return
    }
    onSubmit(formData)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Financial Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Monthly Income</label>
              <Input
                type="number"
                value={formData.monthly_income}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_income: Number(e.target.value) }))}
                placeholder="5000"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Currency</label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RON">RON</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Savings Goal</label>
              <Input
                type="number"
                value={formData.savings_goal}
                onChange={(e) => setFormData(prev => ({ ...prev, savings_goal: Number(e.target.value) }))}
                placeholder="50000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Retirement Age</label>
              <Select value={formData.retirement_age.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, retirement_age: Number(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => i + 55).map(age => (
                    <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Risk Tolerance</label>
              <Select value={formData.risk_tolerance} onValueChange={(value: any) => setFormData(prev => ({ ...prev, risk_tolerance: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Investment Experience</label>
              <Select value={formData.investment_experience} onValueChange={(value: any) => setFormData(prev => ({ ...prev, investment_experience: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create Financial Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Financial overview component
function FinancialOverview({ 
  profile, 
  netWorth, 
  monthlySpending, 
  transactions, 
  activeBudget 
}: {
  profile: FinancialProfile
  netWorth: number
  monthlySpending: number
  transactions: Transaction[]
  activeBudget?: Budget
}) {
  const savingsRate = profile.monthly_income > 0 ? ((profile.monthly_income - monthlySpending) / profile.monthly_income) * 100 : 0
  
  const spendingByCategory = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
      return acc
    }, {} as Record<string, number>)

  const chartData = Object.entries(spendingByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {netWorth.toLocaleString()} {profile.currency}
            </div>
            <p className="text-xs text-gray-600">Estimated value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.monthly_income.toLocaleString()} {profile.currency}
            </div>
            <p className="text-xs text-gray-600">Regular income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PiggyBank className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
            <Progress value={savingsRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <CreditCard className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlySpending.toLocaleString()} {profile.currency}
            </div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ${profile.currency}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Goals Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Savings Goal</span>
                  <span className="text-sm text-gray-600">
                    {netWorth.toLocaleString()} / {profile.savings_goal.toLocaleString()} {profile.currency}
                  </span>
                </div>
                <Progress value={(netWorth / profile.savings_goal) * 100} />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Emergency Fund</span>
                  <span className="text-sm text-gray-600">
                    {(profile.monthly_income * 3).toLocaleString()} {profile.currency} target
                  </span>
                </div>
                <Progress value={(netWorth / (profile.monthly_income * 6)) * 100} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Retirement Readiness</span>
                  <span className="text-sm text-gray-600">Age {profile.retirement_age}</span>
                </div>
                <Progress value={25} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-medium mb-1">Set Financial Goals</h3>
            <p className="text-sm text-gray-600">Define and track your financial objectives</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-medium mb-1">Investment Analysis</h3>
            <p className="text-sm text-gray-600">Get AI-powered investment recommendations</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <h3 className="font-medium mb-1">Risk Assessment</h3>
            <p className="text-sm text-gray-600">Evaluate your financial risk exposure</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Budget manager component
function BudgetManager({ 
  budgets, 
  setBudgets, 
  transactions 
}: {
  budgets: Budget[]
  setBudgets: (budgets: Budget[]) => void
  transactions: Transaction[]
}) {
  const [newBudget, setNewBudget] = useState({
    name: '',
    categories: {} as Record<string, number>,
    period: 'monthly' as const,
    total_amount: 0
  })

  const activeBudget = budgets.find(b => b.is_active)

  const addCategory = (category: string, amount: number) => {
    setNewBudget(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: amount },
      total_amount: prev.total_amount + amount
    }))
  }

  return (
    <div className="space-y-6">
      {activeBudget && (
        <Card>
          <CardHeader>
            <CardTitle>Active Budget: {activeBudget.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(activeBudget.categories).map(([category, budgeted]) => {
                const spent = transactions
                  .filter(t => t.category === category && t.amount < 0)
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                
                const percentage = (spent / budgeted) * 100

                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm">
                        {spent.toLocaleString()} / {budgeted.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={percentage > 100 ? 'bg-red-100' : ''}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Budget name"
              value={newBudget.name}
              onChange={(e) => setNewBudget(prev => ({ ...prev, name: e.target.value }))}
            />
            
            <div className="grid grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.map(category => (
                <div key={category} className="flex items-center gap-2">
                  <span className="text-sm">{category}</span>
                  <Input
                    type="number"
                    placeholder="0"
                    onChange={(e) => {
                      const amount = Number(e.target.value)
                      if (amount > 0) addCategory(category, amount)
                    }}
                  />
                </div>
              ))}
            </div>

            <Button className="w-full">
              Create Budget ({newBudget.total_amount.toLocaleString()})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Investment portfolio component
function InvestmentPortfolio({ 
  recommendations, 
  profile 
}: {
  recommendations: InvestmentRecommendation[]
  profile: FinancialProfile
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Investment Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{rec.symbol} - {rec.name}</h4>
                      <p className="text-sm text-gray-600">{rec.reason}</p>
                    </div>
                    <Badge variant="outline">{rec.allocation_percentage}%</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Risk Level: {rec.risk_level}/10</span>
                    <span>Expected Return: {rec.expected_return}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Generate your personalized investment recommendations using AI
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Transaction tracker component
function TransactionTracker({ 
  transactions, 
  onLogTransaction 
}: {
  transactions: Transaction[]
  onLogTransaction: (transaction: any) => void
}) {
  const [newTransaction, setNewTransaction] = useState({
    amount: 0,
    category: '',
    description: '',
    merchant: '',
    transaction_date: new Date().toISOString().split('T')[0],
    is_recurring: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTransaction.category || newTransaction.amount === 0) {
      toast.error('Please fill all required fields')
      return
    }
    onLogTransaction(newTransaction)
    setNewTransaction({
      amount: 0,
      category: '',
      description: '',
      merchant: '',
      transaction_date: new Date().toISOString().split('T')[0],
      is_recurring: false
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Amount (negative for expense)"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
              required
            />
            <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Description"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              placeholder="Merchant"
              value={newTransaction.merchant}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, merchant: e.target.value }))}
            />
            <Input
              type="date"
              value={newTransaction.transaction_date}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, transaction_date: e.target.value }))}
            />
            <Button type="submit" className="col-span-2">
              Log Transaction
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.slice(0, 10).map((transaction, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{transaction.description}</span>
                  <p className="text-sm text-gray-600">{transaction.category} • {transaction.merchant}</p>
                </div>
                <div className="text-right">
                  <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                  </span>
                  <p className="text-xs text-gray-500">{new Date(transaction.transaction_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No transactions logged yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// AI Financial advisor component
function AIFinancialAdvisor({ 
  messages, 
  onSendMessage, 
  message, 
  setMessage, 
  loading,
  profile 
}: {
  messages: any[]
  onSendMessage: () => void
  message: string
  setMessage: (msg: string) => void
  loading: boolean
  profile: FinancialProfile
}) {
  const financialPrompts = [
    "How can I optimize my investment portfolio?",
    "What's the best way to save for retirement?",
    "Should I pay off debt or invest?",
    "How can I improve my credit score?",
    "What emergency fund size do I need?"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          AI Financial Advisor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto border rounded p-4 mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 space-y-4">
              <p>Ask your AI financial advisor anything about money, investments, or financial planning.</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Popular questions:</p>
                {financialPrompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setMessage(prompt)}
                    className="block w-full text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-green-100 text-green-800'
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
              <div className="bg-green-100 px-4 py-2 rounded">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">💰</div>
                  <span>Advisor is analyzing...</span>
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
            placeholder="Ask about investments, budgeting, savings..."
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