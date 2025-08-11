import { Button, Card, CardContent, Badge } from '@/components/ui'
// ========================================
// 4. PORMIND ECOSYSTEM - COMPLETE
// ========================================

// components/ecosystems/PorMindDashboard.tsx
'use client'

import React, { useState } from 'react'
import { apiClient, useAPICall } from '@/lib/api/api-client-complete'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface FinancialOverview {
  totalIncome: number
  totalExpenses: number
  savings: number
  investments: number
  budgets: Array<{
    category: string
    allocated: number
    spent: number
    remaining: number
  }>
}

export function PorMindDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'budgeting' | 'investments' | 'advice'>('overview')
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: 'food',
    description: '',
    isIncome: false
  })

  // Fetch financial data
  const { data: financialData, loading: financialLoading } = useAPICall(() => 
    apiClient.getFinancialOverview()
  )

  const addTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description) return

    const response = await apiClient.logTransaction({
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      description: newTransaction.description,
      date: new Date().toISOString().split('T')[0],
      isIncome: newTransaction.isIncome
    })

    if (response.success) {
      setNewTransaction({ amount: '', category: 'food', description: '', isIncome: false })
      alert('Transaction logged successfully!')
    }
  }

  const expenseCategories = [
    { name: 'Food', value: 1200, color: '#FF6B6B' },
    { name: 'Transport', value: 800, color: '#4ECDC4' },
    { name: 'Entertainment', value: 400, color: '#45B7D1' },
    { name: 'Utilities', value: 600, color: '#F9CA24' },
    { name: 'Shopping', value: 300, color: '#A55EEA' }
  ]

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Financial Summary Cards */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Monthly Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {financialData?.totalIncome?.toLocaleString() || '15,500'} RON
          </div>
          <div className="text-xs text-green-600">↗️ +8% from last month</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">
            {financialData?.totalExpenses?.toLocaleString() || '11,300'} RON
          </div>
          <div className="text-xs text-red-600">↗️ +3% from last month</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {financialData?.savings?.toLocaleString() || '4,200'} RON
          </div>
          <div className="text-xs text-blue-600">27% of income</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {financialData?.investments?.toLocaleString() || '25,800'} RON
          </div>
          <div className="text-xs text-purple-600">↗️ +12% growth</div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>💸 Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} RON`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {expenseCategories.map((category) => (
              <div key={category.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">{category.name}: {category.value} RON</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Transaction */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>➕ Quick Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={newTransaction.isIncome ? "default" : "outline"}
                onClick={() => setNewTransaction(prev => ({ ...prev, isIncome: true }))}
                className="flex-1"
              >
                💰 Income
              </Button>
              <Button
                variant={!newTransaction.isIncome ? "default" : "outline"}
                onClick={() => setNewTransaction(prev => ({ ...prev, isIncome: false }))}
                className="flex-1"
              >
                💸 Expense
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (RON)</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select 
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="food">🍔 Food</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="entertainment">🎭 Entertainment</option>
                  <option value="utilities">⚡ Utilities</option>
                  <option value="shopping">🛍️ Shopping</option>
                  <option value="health">🏥 Health</option>
                  <option value="education">📚 Education</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this for?"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <Button onClick={addTransaction} className="w-full">
              ✅ Add Transaction
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const BudgetingTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">💰 Budget Management</h2>
        <Button>Create New Budget</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Budgets */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Current Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Food', allocated: 1500, spent: 1200, color: 'green' },
                { category: 'Transport', allocated: 800, spent: 750, color: 'blue' },
                { category: 'Entertainment', allocated: 600, spent: 640, color: 'red' },
                { category: 'Shopping', allocated: 400, spent: 300, color: 'purple' }
              ].map((budget) => (
                <div key={budget.category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{budget.category}</span>
                    <span className="text-sm">
                      {budget.spent}/{budget.allocated} RON
                    </span>
                  </div>
                  <Progress 
                    value={(budget.spent / budget.allocated) * 100}
                    className="h-2"
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    {budget.allocated - budget.spent} RON remaining
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending Insights */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Spending Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="flex items-center">
                  <span className="text-yellow-600 font-medium">⚠️ Over Budget</span>
                </div>
                <p className="text-sm text-yellow-700">
                  You've exceeded your Entertainment budget by 40 RON this month.
                </p>
              </div>

              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                <div className="flex items-center">
                  <span className="text-green-600 font-medium">✅ On Track</span>
                </div>
                <p className="text-sm text-green-700">
                  Your Transport spending is 94% of budget - well managed!
                </p>
              </div>

              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="flex items-center">
                  <span className="text-blue-600 font-medium">💡 Opportunity</span>
                </div>
                <p className="text-sm text-blue-700">
                  You have 100 RON left in Shopping budget. Consider saving it!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const InvestmentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">📈 Investments</h2>
        <Button>Generate Investment Plan</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Overview */}
        <Card>
          <CardHeader>
            <CardTitle>💼 Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">25,800 RON</div>
              <div className="text-sm text-gray-600">Total Portfolio</div>
              <div className="text-lg text-green-600 mt-2">↗️ +12.5%</div>
              <div className="text-xs text-gray-500">This year</div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>🏦 Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Stocks</span>
                  <span>60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Bonds</span>
                  <span>30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Crypto</span>
                  <span>10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Contribution */}
        <Card>
          <CardHeader>
            <CardTitle>📅 Monthly Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">1,500 RON</div>
              <div className="text-sm text-gray-600">Auto-invest</div>
              <Button className="mt-4 w-full" variant="outline">
                Adjust Amount
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>📊 Recent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { month: 'Jan', value: 23500 },
                  { month: 'Feb', value: 24200 },
                  { month: 'Mar', value: 23800 },
                  { month: 'Apr', value: 25100 },
                  { month: 'May', value: 25800 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value} RON`, 'Portfolio Value']} />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">PorMind Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Export Report</Button>
          <Button>Get AI Advice</Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: '🏠' },
          { id: 'budgeting', label: 'Budgeting', icon: '💰' },
          { id: 'investments', label: 'Investments', icon: '📈' },
          { id: 'advice', label: 'AI Advice', icon: '🤖' }
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
      {activeTab === 'budgeting' && <BudgetingTab />}
      {activeTab === 'investments' && <InvestmentsTab />}
      {activeTab === 'advice' && <div>AI Financial Advice chat here...</div>}
    </div>
  )
}