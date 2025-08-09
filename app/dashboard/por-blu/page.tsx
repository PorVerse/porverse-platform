// app/dashboard/por-blu/page.tsx - Strategic Planning & Executive Coaching (REFACTORED)
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Target, Crown, TrendingUp, Lightbulb, Users, Award, Brain, Compass, Plus, Edit, Trash2, Eye, Calendar, Star, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

// === TYPES ===
interface LifeGoal {
  id: string
  title: string
  description: string
  category: 'career' | 'financial' | 'personal' | 'health' | 'relationships' | 'legacy'
  target_date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'planning' | 'active' | 'achieved' | 'paused'
  progress_percentage: number
  milestones: Milestone[]
  accountability_partner: string | null
  created_at: string
  updated_at: string
}

interface Milestone {
  id: string
  title: string
  target_date: string
  completed: boolean
  completed_at: string | null
}

interface StrategicDecision {
  id: string
  title: string
  description: string
  options: DecisionOption[]
  criteria: DecisionCriteria[]
  scores: Record<string, Record<string, number>>
  final_choice: string | null
  decision_date: string
  status: 'draft' | 'analyzing' | 'decided' | 'implemented'
}

interface DecisionOption {
  id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
}

interface DecisionCriteria {
  id: string
  name: string
  weight: number
  description: string
}

interface LeadershipProfile {
  id: string
  leadership_style: 'transformational' | 'servant' | 'authentic' | 'democratic' | 'autocratic'
  strengths: string[]
  development_areas: string[]
  values: string[]
  vision_statement: string
  mission_statement: string
  competencies: Record<string, number>
}

interface VisionBoard {
  id: string
  title: string
  description: string
  time_horizon: number
  areas: VisionArea[]
  created_at: string
}

interface VisionArea {
  id: string
  name: string
  current_state: string
  desired_state: string
  key_actions: string[]
  timeline: string
  images: string[]
}

// === CONSTANTS ===
const LIFE_CATEGORIES = [
  { value: 'career', label: 'Career & Professional', icon: '💼', color: 'blue' },
  { value: 'financial', label: 'Financial Freedom', icon: '💰', color: 'green' },
  { value: 'personal', label: 'Personal Growth', icon: '🌱', color: 'purple' },
  { value: 'health', label: 'Health & Wellness', icon: '🏃', color: 'red' },
  { value: 'relationships', label: 'Relationships', icon: '❤️', color: 'pink' },
  { value: 'legacy', label: 'Legacy & Impact', icon: '🌟', color: 'yellow' }
]

const VISION_AREAS = [
  'Career & Professional Development',
  'Financial Independence & Wealth',
  'Health & Fitness Excellence',
  'Relationships & Family Life',
  'Personal Growth & Learning',
  'Contribution & Legacy Building'
]

const LEADERSHIP_COMPETENCIES = [
  'Strategic Thinking',
  'Communication',
  'Decision Making',
  'Team Building',
  'Innovation',
  'Emotional Intelligence',
  'Adaptability',
  'Integrity'
]

// === MOCK DATA ===
const mockGoals: LifeGoal[] = [
  {
    id: '1',
    title: 'Launch Tech Startup',
    description: 'Build and launch a SaaS platform for small businesses',
    category: 'career',
    target_date: '2025-12-31',
    priority: 'critical',
    status: 'active',
    progress_percentage: 65,
    milestones: [
      { id: '1', title: 'MVP Development', target_date: '2025-06-01', completed: true, completed_at: '2025-05-15' },
      { id: '2', title: 'First 100 Users', target_date: '2025-08-01', completed: false, completed_at: null }
    ],
    accountability_partner: 'John Mentor',
    created_at: '2025-01-01',
    updated_at: '2025-01-15'
  },
  {
    id: '2',
    title: 'Achieve Financial Independence',
    description: 'Build passive income streams to cover living expenses',
    category: 'financial',
    target_date: '2030-01-01',
    priority: 'high',
    status: 'active',
    progress_percentage: 35,
    milestones: [
      { id: '3', title: 'Emergency Fund Complete', target_date: '2025-06-01', completed: true, completed_at: '2025-05-01' },
      { id: '4', title: 'Investment Portfolio €100K', target_date: '2026-01-01', completed: false, completed_at: null }
    ],
    accountability_partner: null,
    created_at: '2025-01-01',
    updated_at: '2025-01-10'
  }
]

const mockDecisions: StrategicDecision[] = [
  {
    id: '1',
    title: 'Choose Business Model',
    description: 'Decide between B2B SaaS vs B2C marketplace for our startup',
    options: [
      {
        id: '1',
        title: 'B2B SaaS Platform',
        description: 'Focus on business customers with subscription model',
        pros: ['Higher LTV', 'Predictable revenue', 'Lower churn'],
        cons: ['Longer sales cycles', 'Higher CAC', 'More complex product']
      },
      {
        id: '2',
        title: 'B2C Marketplace',
        description: 'Consumer-focused platform with transaction fees',
        pros: ['Faster growth', 'Viral potential', 'Lower CAC'],
        cons: ['Higher churn', 'Price sensitive', 'Harder monetization']
      }
    ],
    criteria: [
      { id: '1', name: 'Revenue Potential', weight: 35, description: 'Long-term revenue opportunity' },
      { id: '2', name: 'Market Size', weight: 25, description: 'Total addressable market' },
      { id: '3', name: 'Execution Risk', weight: 25, description: 'Risk of execution failure' },
      { id: '4', name: 'Time to Market', weight: 15, description: 'Speed to launch and revenue' }
    ],
    scores: {
      '1': { '1': 9, '2': 7, '3': 6, '4': 5 },
      '2': { '1': 6, '2': 9, '3': 8, '4': 9 }
    },
    final_choice: 'B2B SaaS Platform',
    decision_date: '2025-01-15',
    status: 'decided'
  }
]

const mockLeadershipProfile: LeadershipProfile = {
  id: '1',
  leadership_style: 'transformational',
  strengths: ['Strategic Vision', 'Innovation', 'Team Motivation', 'Communication'],
  development_areas: ['Delegation', 'Conflict Resolution', 'Financial Acumen'],
  values: ['Integrity', 'Excellence', 'Collaboration', 'Growth'],
  vision_statement: 'To build technology that empowers small businesses to thrive in the digital economy',
  mission_statement: 'Creating accessible, powerful tools that level the playing field for entrepreneurs worldwide',
  competencies: {
    'Strategic Thinking': 8,
    'Communication': 9,
    'Decision Making': 7,
    'Team Building': 8,
    'Innovation': 9,
    'Emotional Intelligence': 6,
    'Adaptability': 8,
    'Integrity': 9
  }
}

const mockVisionBoards: VisionBoard[] = [
  {
    id: '1',
    title: '5-Year Vision: Tech Entrepreneur',
    description: 'My vision for becoming a successful tech entrepreneur by 2030',
    time_horizon: 5,
    areas: [
      {
        id: '1',
        name: 'Career & Professional',
        current_state: 'Software developer at corporation',
        desired_state: 'CEO of successful SaaS company with 50+ employees',
        key_actions: ['Launch MVP', 'Raise Series A', 'Scale team', 'Expand internationally'],
        timeline: '2025-2030',
        images: []
      },
      {
        id: '2',
        name: 'Financial Freedom',
        current_state: '€5K monthly salary, minimal savings',
        desired_state: '€50K+ monthly passive income, €2M+ net worth',
        key_actions: ['Build emergency fund', 'Invest in index funds', 'Generate business income', 'Diversify portfolio'],
        timeline: '2025-2030',
        images: []
      }
    ],
    created_at: '2025-01-01'
  }
]

// === MAIN COMPONENT ===
export default function PorBluDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [goals, setGoals] = useState<LifeGoal[]>(mockGoals)
  const [decisions, setDecisions] = useState<StrategicDecision[]>(mockDecisions)
  const [leadershipProfile, setLeadershipProfile] = useState<LeadershipProfile | null>(mockLeadershipProfile)
  const [visionBoards, setVisionBoards] = useState<VisionBoard[]>(mockVisionBoards)
  const [loading, setLoading] = useState(false)
  
  // AI Chat state
  const [aiMessages, setAiMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: string}>>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Calculate metrics
  const calculateMetrics = () => {
    const activeGoals = goals.filter(g => g.status === 'active')
    const criticalGoals = goals.filter(g => g.priority === 'critical')
    const achievedGoals = goals.filter(g => g.status === 'achieved')
    const overallProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length)
      : 0
    
    const nearTermGoals = goals.filter(g => {
      const daysUntil = Math.ceil((new Date(g.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntil <= 90 && daysUntil > 0
    })

    return {
      activeGoals: activeGoals.length,
      criticalGoals: criticalGoals.length,
      achievedGoals: achievedGoals.length,
      nearTermGoals: nearTermGoals.length,
      overallProgress,
      goalsByCategory: LIFE_CATEGORIES.map(cat => ({
        category: cat.value,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        count: goals.filter(g => g.category === cat.value).length,
        avgProgress: goals.filter(g => g.category === cat.value).length > 0
          ? Math.round(goals.filter(g => g.category === cat.value).reduce((sum, g) => sum + g.progress_percentage, 0) / goals.filter(g => g.category === cat.value).length)
          : 0
      }))
    }
  }

  const metrics = calculateMetrics()

  // AI Functions
  const sendAIMessage = async () => {
    if (!aiInput.trim()) return

    setAiLoading(true)
    const userMessage = {
      role: 'user' as const,
      content: aiInput,
      timestamp: new Date().toISOString()
    }

    setAiMessages(prev => [...prev, userMessage])
    setAiInput('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant' as const,
        content: generateAIResponse(aiInput, goals, decisions, leadershipProfile),
        timestamp: new Date().toISOString()
      }
      setAiMessages(prev => [...prev, aiResponse])
      setAiLoading(false)
    }, 2000)
  }

  const generateAIResponse = (input: string, goals: LifeGoal[], decisions: StrategicDecision[], profile: LeadershipProfile | null): string => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('goal') || lowerInput.includes('objective')) {
      return `Based on your current goals, I see you're making excellent progress! Your startup goal at 65% completion shows strong momentum. Consider:

1. **Prioritize Critical Goals**: Focus on your startup launch as it's marked critical
2. **Set Micro-Milestones**: Break down your remaining 35% into weekly targets
3. **Leverage Strengths**: Your innovation and strategic thinking scores are high (8-9/10)

Next steps: Schedule weekly progress reviews and consider finding an accountability partner for your financial independence goal.`
    }
    
    if (lowerInput.includes('leadership') || lowerInput.includes('team')) {
      return `Your leadership profile shows a transformational style with strong innovation (9/10) and communication (9/10) skills. Areas to develop:

**Strengths to leverage:**
- Strategic Vision: Use this for long-term planning
- Team Motivation: Great for startup culture building

**Development focus:**
- Delegation (current gap): Critical as you scale your team
- Financial Acumen: Important for startup leadership

Recommendation: Take a delegation course and find a CFO mentor for financial skills.`
    }
    
    if (lowerInput.includes('decision') || lowerInput.includes('choice')) {
      return `Your B2B SaaS decision was excellent - scoring 7.4/10 vs 7.75/10 for B2C. The choice aligns with your revenue potential priority (35% weight).

For future strategic decisions:
1. **Use the same framework**: Options + weighted criteria
2. **Include stakeholder input**: Get team/advisor perspectives  
3. **Set review dates**: Schedule decision outcome reviews
4. **Document assumptions**: Track what you believed vs reality

Your decision-making competency (7/10) can improve with more structured approaches.`
    }

    if (lowerInput.includes('vision') || lowerInput.includes('future')) {
      return `Your 5-year tech entrepreneur vision is ambitious and well-structured! The progression from developer to CEO of 50+ person company is realistic given your timeline.

**Vision Strengths:**
- Clear current vs desired states
- Specific financial targets (€50K monthly passive income)
- Actionable key steps identified

**Suggestions:**
- Add quarterly milestones to track progress
- Define success metrics for each area
- Create visual representations/mood boards
- Schedule annual vision reviews and updates

Your transformational leadership style aligns perfectly with this entrepreneurial vision.`
    }

    return `I'm here to help with strategic planning, goal setting, decision frameworks, leadership development, and vision creation. 

Based on your current data:
- ${goals.length} active goals with ${metrics.overallProgress}% average progress
- Strong leadership competencies in innovation and communication  
- Clear 5-year entrepreneurial vision

What specific area would you like to explore? I can help with:
🎯 Goal prioritization and acceleration
👑 Leadership skill development  
⚖️ Strategic decision analysis
🔮 Vision refinement and planning`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Loading PorBlu...</h2>
          <p className="text-blue-200">Preparing your strategic command center</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              💧 PorBlu Strategic Hub
            </h1>
            <p className="text-blue-200 text-lg">Strategic planning & executive excellence</p>
          </div>
          <div className="flex gap-3 items-center">
            <Button 
              onClick={() => setActiveTab('executive-coach')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              🎯 Strategic AI Coach
            </Button>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              PREMIUM ACTIVE
            </Badge>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Overall Progress</p>
                <p className="text-2xl font-bold">{metrics.overallProgress}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
            <Progress value={metrics.overallProgress} className="mt-2" />
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Active Goals</p>
                <p className="text-2xl font-bold">{metrics.activeGoals}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Critical Goals</p>
                <p className="text-2xl font-bold">{metrics.criticalGoals}</p>
              </div>
              <Award className="h-8 w-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Near-term Goals</p>
                <p className="text-2xl font-bold">{metrics.nearTermGoals}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mb-8 bg-white/10 backdrop-blur-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500">Overview</TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-blue-500">Life Goals</TabsTrigger>
          <TabsTrigger value="decisions" className="data-[state=active]:bg-blue-500">Decisions</TabsTrigger>
          <TabsTrigger value="vision" className="data-[state=active]:bg-blue-500">Vision</TabsTrigger>
          <TabsTrigger value="executive-coach" className="data-[state=active]:bg-blue-500">AI Coach</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StrategicOverview 
            metrics={metrics}
            goals={goals}
            decisions={decisions}
            leadershipProfile={leadershipProfile}
          />
        </TabsContent>

        <TabsContent value="goals">
          <LifeGoalsManager 
            goals={goals}
            setGoals={setGoals}
          />
        </TabsContent>

        <TabsContent value="decisions">
          <DecisionFramework 
            decisions={decisions}
            setDecisions={setDecisions}
          />
        </TabsContent>

        <TabsContent value="vision">
          <VisionBoardCreator 
            visionBoards={visionBoards}
            setVisionBoards={setVisionBoards}
          />
        </TabsContent>

        <TabsContent value="executive-coach">
          <ExecutiveCoach 
            messages={aiMessages}
            onSendMessage={sendAIMessage}
            input={aiInput}
            setInput={setAiInput}
            loading={aiLoading}
            leadershipProfile={leadershipProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// === COMPONENTS ===

function StrategicOverview({ metrics, goals, decisions, leadershipProfile }: {
  metrics: any
  goals: LifeGoal[]
  decisions: StrategicDecision[]
  leadershipProfile: LeadershipProfile | null
}) {
  const criticalGoals = goals.filter(g => g.priority === 'critical')
  const recentDecisions = decisions.slice(0, 3)
  
  const radarData = Object.entries(leadershipProfile?.competencies || {}).map(([key, value]) => ({
    competency: key.replace(/([A-Z])/g, ' $1').trim(),
    score: value
  }))

  return (
    <div className="space-y-8">
      {/* Life Areas Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Life Areas Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.goalsByCategory.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-medium text-white">{cat.label}</p>
                      <p className="text-sm text-blue-200">{cat.count} goals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{cat.avgProgress}%</p>
                    <Progress value={cat.avgProgress} className="w-20 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Leadership Competencies</CardTitle>
          </CardHeader>
          <CardContent>
            {leadershipProfile ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="competency" tick={{ fontSize: 11, fill: '#93c5fd' }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar 
                    name="Score" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.2} 
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Crown className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300 mb-4">Complete your leadership assessment</p>
                <Button>Take Assessment</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Goals & Recent Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Critical Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criticalGoals.length > 0 ? (
              <div className="space-y-3">
                {criticalGoals.map(goal => (
                  <div key={goal.id} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{goal.title}</h4>
                      <Badge className="bg-red-500/20 text-red-200 border-red-500/30">
                        {goal.progress_percentage}%
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-200 mb-2">{goal.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
                      <span className="capitalize">{goal.category}</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No critical goals set</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Recent Strategic Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDecisions.length > 0 ? (
              <div className="space-y-3">
                {recentDecisions.map(decision => (
                  <div key={decision.id} className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{decision.title}</h4>
                      <Badge className={`${
                        decision.status === 'decided' ? 'bg-green-500/20 text-green-200 border-green-500/30' :
                        decision.status === 'analyzing' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-200 border-gray-500/30'
                      }`}>
                        {decision.status}
                      </Badge>
                    </div>
                    {decision.final_choice && (
                      <p className="text-sm text-green-200 mb-2">Choice: {decision.final_choice}</p>
                    )}
                    <div className="text-xs text-gray-400">
                      {decision.options.length} options • {decision.criteria.length} criteria
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No strategic decisions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LifeGoalsManager({ goals, setGoals }: {
  goals: LifeGoal[]
  setGoals: (goals: LifeGoal[]) => void
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<'all' | string>('all')
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'career' as const,
    target_date: '',
    priority: 'medium' as const,
    status: 'planning' as const
  })

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) {
      toast.error('Please enter a goal title')
      return
    }

    const goal: LifeGoal = {
      id: Date.now().toString(),
      ...newGoal,
      progress_percentage: 0,
      milestones: [],
      accountability_partner: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setGoals([...goals, goal])
    setNewGoal({
      title: '',
      description: '',
      category: 'career',
      target_date: '',
      priority: 'medium',
      status: 'planning'
    })
    setShowCreateForm(false)
    toast.success('Goal created successfully!')
  }

  const updateGoalProgress = (goalId: string, newProgress: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, progress_percentage: newProgress, updated_at: new Date().toISOString() }
        : goal
    ))
    toast.success('Progress updated!')
  }

  const filteredGoals = goals.filter(goal => 
    filter === 'all' || goal.category === filter
  )

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-500/20 text-gray-200 border-gray-500/30',
      medium: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
      high: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
      critical: 'bg-red-500/20 text-red-200 border-red-500/30'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Life Goals Management</h2>
          <p className="text-blue-200">Track and achieve your most important objectives</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-green-500 to-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Create New Life Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Select value={newGoal.category} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              placeholder="Describe your goal in detail..."
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              rows={3}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <Select value={newGoal.priority} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
              />
              
              <Select value={newGoal.status} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleCreateGoal} className="bg-green-500 hover:bg-green-600">
                Create Goal
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({goals.length})
        </Button>
        {LIFE_CATEGORIES.map(category => (
          <Button
            key={category.value}
            variant={filter === category.value ? 'default' : 'outline'}
            onClick={() => setFilter(category.value)}
            size="sm"
          >
            {category.icon} {category.label} ({goals.filter(g => g.category === category.value).length})
          </Button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map(goal => (
          <Card key={goal.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-lg text-white">{goal.title}</h3>
                    <Badge className={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
                    <Badge variant="outline" className="capitalize border-blue-500/30 text-blue-200">
                      {LIFE_CATEGORIES.find(c => c.value === goal.category)?.icon} {goal.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize border-gray-500/30 text-gray-200">
                      {goal.status}
                    </Badge>
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-blue-200 mb-3">{goal.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                    <span>Created: {new Date(goal.created_at).toLocaleDateString()}</span>
                    {goal.milestones.length > 0 && (
                      <span>{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{goal.progress_percentage}%</div>
                  <div className="text-xs text-gray-400">Complete</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white">Progress</span>
                    <span className="text-sm text-blue-200">{goal.progress_percentage}%</span>
                  </div>
                  <Progress value={goal.progress_percentage} className="mb-2" />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newProgress = Math.min(100, goal.progress_percentage + 10)
                      updateGoalProgress(goal.id, newProgress)
                    }}
                    className="border-green-500/30 text-green-200 hover:bg-green-500/20"
                  >
                    +10% Progress
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20">
                    <Plus className="h-3 w-3 mr-1" />
                    Milestone
                  </Button>
                  <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20">
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredGoals.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center text-gray-400">
              {filter === 'all' ? 'No goals created yet' : `No ${filter} goals found`}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function DecisionFramework({ decisions, setDecisions }: {
  decisions: StrategicDecision[]
  setDecisions: (decisions: StrategicDecision[]) => void
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedDecision, setSelectedDecision] = useState<StrategicDecision | null>(null)

  const calculateDecisionMatrix = (decision: StrategicDecision) => {
    return decision.options.map(option => {
      const totalScore = decision.criteria.reduce((sum, criterion) => {
        const score = decision.scores?.[option.id]?.[criterion.id] || 0
        const weightedScore = (score * criterion.weight) / 100
        return sum + weightedScore
      }, 0)
      return { ...option, totalScore: Math.round(totalScore * 10) / 10 }
    }).sort((a, b) => b.totalScore - a.totalScore)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Strategic Decision Framework</h2>
          <p className="text-blue-200">Structure complex decisions with weighted criteria analysis</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          New Decision
        </Button>
      </div>

      {/* Decision Analysis Modal */}
      {selectedDecision && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-white">{selectedDecision.title}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedDecision(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-200 mb-6">{selectedDecision.description}</p>
            
            {/* Decision Matrix */}
            <div className="space-y-4">
              <h4 className="font-medium text-white">Decision Matrix Analysis</h4>
              
              {calculateDecisionMatrix(selectedDecision).map((option, index) => (
                <div key={option.id} className={`p-4 rounded-lg border ${
                  index === 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/20'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-white">{option.title}</h5>
                    <div className="flex items-center gap-2">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-400" />}
                      <Badge className={index === 0 ? 'bg-green-500/20 text-green-200' : 'bg-gray-500/20 text-gray-200'}>
                        Score: {option.totalScore}/10
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-blue-200 mb-3">{option.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-green-300 mb-1">Pros:</p>
                      <ul className="text-xs text-green-200 space-y-1">
                        {option.pros.map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-300 mb-1">Cons:</p>
                      <ul className="text-xs text-red-200 space-y-1">
                        {option.cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
              
              {selectedDecision.final_choice && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-200">
                    <strong className="text-white">Final Decision:</strong> {selectedDecision.final_choice}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Decided on {new Date(selectedDecision.decision_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decisions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {decisions.map(decision => (
          <Card key={decision.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{decision.title}</CardTitle>
                <Badge className={`${
                  decision.status === 'decided' ? 'bg-green-500/20 text-green-200 border-green-500/30' :
                  decision.status === 'analyzing' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30' :
                  'bg-gray-500/20 text-gray-200 border-gray-500/30'
                }`}>
                  {decision.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-200 text-sm mb-4">{decision.description}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                <span>{decision.options.length} options</span>
                <span>{decision.criteria.length} criteria</span>
                <span>{new Date(decision.decision_date).toLocaleDateString()}</span>
              </div>
              
              {decision.final_choice && (
                <div className="mb-4 p-2 bg-green-500/10 border border-green-500/30 rounded">
                  <p className="text-xs text-green-200">Choice: {decision.final_choice}</p>
                </div>
              )}
              
              <Button 
                size="sm" 
                onClick={() => setSelectedDecision(decision)}
                className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-200 hover:bg-blue-500/30"
              >
                <Eye className="h-3 w-3 mr-2" />
                View Analysis
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {decisions.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 md:col-span-2">
            <CardContent className="p-8 text-center">
              <Lightbulb className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Strategic Decisions Yet</h3>
              <p className="text-gray-400 mb-4">
                Create structured decision frameworks to evaluate complex choices
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create First Decision
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function VisionBoardCreator({ visionBoards, setVisionBoards }: {
  visionBoards: VisionBoard[]
  setVisionBoards: (boards: VisionBoard[]) => void
}) {
  const [selectedBoard, setSelectedBoard] = useState<VisionBoard | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Vision Board Creator</h2>
          <p className="text-blue-200">Visualize your future across all life areas</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Target className="h-4 w-4 mr-2" />
          Create Vision Board
        </Button>
      </div>

      {/* Vision Board Detail */}
      {selectedBoard && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white">{selectedBoard.title}</CardTitle>
                <p className="text-blue-200">{selectedBoard.description}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedBoard(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedBoard.areas.map(area => (
                <div key={area.id} className="p-4 bg-white/5 border border-white/20 rounded-lg">
                  <h4 className="font-medium text-white mb-3">{area.name}</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">Current State:</p>
                      <p className="text-sm text-blue-200">{area.current_state}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">Desired State:</p>
                      <p className="text-sm text-green-200">{area.desired_state}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">Key Actions:</p>
                      <ul className="text-xs text-blue-200 space-y-1">
                        {area.key_actions.map((action, i) => (
                          <li key={i}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Timeline: {area.timeline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vision Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visionBoards.map(board => (
          <Card key={board.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
            <CardHeader>
              <CardTitle className="text-white">{board.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-200 text-sm mb-4">{board.description}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                <span>{board.time_horizon} year vision</span>
                <span>{board.areas.length} life areas</span>
                <span>{new Date(board.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {board.areas.slice(0, 3).map(area => (
                  <Badge key={area.id} variant="outline" className="text-xs border-purple-500/30 text-purple-200">
                    {area.name}
                  </Badge>
                ))}
                {board.areas.length > 3 && (
                  <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                    +{board.areas.length - 3} more
                  </Badge>
                )}
              </div>
              
              <Button 
                size="sm" 
                onClick={() => setSelectedBoard(board)}
                className="w-full bg-purple-500/20 border border-purple-500/30 text-purple-200 hover:bg-purple-500/30"
              >
                <Eye className="h-3 w-3 mr-2" />
                View Vision Board
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {visionBoards.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 md:col-span-2">
            <CardContent className="p-8 text-center">
              <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Create Your First Vision Board</h3>
              <p className="text-gray-400 mb-4">
                Visualize your ideal future across all important life areas
              </p>
              <Button>Create Vision Board</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ExecutiveCoach({ messages, onSendMessage, input, setInput, loading, leadershipProfile }: {
  messages: Array<{role: 'user' | 'assistant', content: string, timestamp: string}>
  onSendMessage: () => void
  input: string
  setInput: (input: string) => void
  loading: boolean
  leadershipProfile: LeadershipProfile | null
}) {
  const executivePrompts = [
    "How can I improve my strategic thinking and decision-making?",
    "What leadership style would be most effective for my team?",
    "Help me develop a clear vision and mission for my organization",
    "How can I better communicate and influence stakeholders?",
    "What should I focus on for my executive development?",
    "How do I balance short-term results with long-term vision?",
    "What are the key leadership competencies I should develop?",
    "How can I build a high-performing team culture?"
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🤖 AI Executive Coach</h2>
        <p className="text-blue-200">Strategic guidance and leadership development</p>
      </div>

      {/* Leadership Profile Summary */}
      {leadershipProfile && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border-purple-500/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-white mb-2">Leadership Style</h4>
                <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 capitalize">
                  {leadershipProfile.leadership_style.replace('_', ' ')}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">Top Strengths</h4>
                <div className="flex flex-wrap gap-1">
                  {leadershipProfile.strengths.slice(0, 2).map(strength => (
                    <Badge key={strength} variant="outline" className="text-xs border-green-500/30 text-green-200">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">Development Areas</h4>
                <div className="flex flex-wrap gap-1">
                  {leadershipProfile.development_areas.slice(0, 2).map(area => (
                    <Badge key={area} variant="outline" className="text-xs border-orange-500/30 text-orange-200">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            Strategic Conversation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="h-96 overflow-y-auto border border-white/20 rounded-lg p-4 mb-4 space-y-4 bg-black/20">
            {messages.length === 0 && (
              <div className="text-center space-y-6">
                <div className="text-gray-400">
                  <Crown className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium text-white mb-2">Welcome to your AI Executive Coach</p>
                  <p>Get strategic guidance tailored to your leadership profile and goals.</p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-blue-200">Popular coaching topics:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {executivePrompts.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => setInput(prompt)}
                        className="text-left p-3 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors text-blue-200"
                      >
                        💡 {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-purple-500/20 text-white border border-purple-500/30'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-purple-500/20 border border-purple-500/30 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse text-yellow-400">👑</div>
                    <span className="text-white">Your executive coach is analyzing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              placeholder="Ask about leadership, strategy, vision, decision-making..."
              disabled={loading}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button 
              onClick={onSendMessage} 
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}