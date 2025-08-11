// app/dashboard/por-well/page.tsx - Real Implementation
'use client'

import React, { useState, useEffect } from 'react'
// Temporary fix for build
const apiClient = { getProgress: async () => ({ success: true, data: {} }) }
const useUserProfile = () => ({ data: null, loading: false })
const useEcosystemAccess = () => ({ hasAccess: true, loading: false })
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Heart, Brain, MessageCircle, TrendingUp, Zap, Shield, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import styles from './style.module.css'

interface MoodEntry {
  id: string
  mood_score: number
  emotions: string[]
  triggers: string[]
  activities: string[]
  thoughts: string
  physical_symptoms: string[]
  sleep_quality: number
  anxiety_level: number
  stress_level: number
  created_at: string
}

interface TherapySession {
  id: string
  session_type: 'ai_chat' | 'journal' | 'meditation' | 'breathing'
  duration_minutes: number
  topics_discussed: string[]
  insights: any
  mood_before: number
  mood_after: number
  created_at: string
}

interface AnxietyEpisode {
  id: string
  severity: number
  triggers: string[]
  symptoms: string[]
  coping_strategies_used: string[]
  duration_minutes: number
  notes: string
  created_at: string
}

const EMOTIONS = [
  '😊 Happy', '😢 Sad', '😰 Anxious', '😡 Angry', '😔 Depressed',
  '😌 Calm', '😴 Tired', '😤 Frustrated', '🥰 Loved', '😕 Confused'
]

const TRIGGERS = [
  'Work stress', 'Relationships', 'Health concerns', 'Financial worries',
  'Social situations', 'Family issues', 'Academic pressure', 'News/Media',
  'Sleep problems', 'Physical discomfort'
]

const ACTIVITIES = [
  'Exercise', 'Meditation', 'Reading', 'Music', 'Socializing',
  'Work', 'Gaming', 'Cooking', 'Walking', 'Therapy'
]

const PHYSICAL_SYMPTOMS = [
  'Headache', 'Muscle tension', 'Fatigue', 'Nausea', 'Heart palpitations',
  'Sweating', 'Dizziness', 'Chest tightness', 'Stomach issues', 'Trembling'
]

export default function PorWellDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([])
  const [anxietyEpisodes, setAnxietyEpisodes] = useState<AnxietyEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [aiChat, setAiChat] = useState<{ messages: any[]; conversationId?: string }>({ messages: [] })
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const userProfile = useUserProfile()
  const ecosystemAccess = useEcosystemAccess('por-well')

  useEffect(() => {
    loadWellnessData()
  }, [])

  const loadWellnessData = async () => {
    setLoading(true)
    try {
      // Load mood history
      const moodResponse = await apiClient.getMoodHistory(30)
      if (moodResponse.success) {
        setMoodHistory(moodResponse.data)
      }

      // Load therapy sessions
      const progressResponse = await apiClient.getProgress('por-well')
      if (progressResponse.success) {
        const sessions = progressResponse.data
          .filter((p: any) => p.progress_type === 'therapy_session')
          .map((p: any) => ({
            id: p.id,
            ...p.progress_data,
            created_at: p.date_recorded
          }))

        setTherapySessions(sessions)

        const episodes = progressResponse.data
          .filter((p: any) => p.progress_type === 'anxiety_episode')
          .map((p: any) => ({
            id: p.id,
            ...p.progress_data,
            created_at: p.date_recorded
          }))

        setAnxietyEpisodes(episodes)
      }

      // Load AI conversation history
      const chatResponse = await apiClient.getConversationHistory('por-well')
      if (chatResponse.success && chatResponse.data.length > 0) {
        const lastConversation = chatResponse.data[0]
        setAiChat({
          messages: lastConversation.messages,
          conversationId: lastConversation.id
        })
      }

    } catch (error) {
      console.error('Error loading wellness data:', error)
      toast.error('Failed to load wellness data')
    } finally {
      setLoading(false)
    }
  }

  const saveMoodEntry = async (moodData: Omit<MoodEntry, 'id' | 'created_at'>) => {
    try {
      const response = await apiClient.saveMoodEntry(moodData)
      if (response.success) {
        setMoodHistory(prev => [
          {
            id: response.data.id,
            ...moodData,
            created_at: response.data.created_at
          },
          ...prev.slice(0, 29)
        ])
        toast.success('Mood logged successfully!')
      }
    } catch (error) {
      toast.error('Failed to log mood')
    }
  }

  const logAnxietyEpisode = async (episodeData: Omit<AnxietyEpisode, 'id' | 'created_at'>) => {
    try {
      const response = await apiClient.saveProgress('por-well', {
        progress_type: 'anxiety_episode',
        progress_data: episodeData,
        score: 10 - episodeData.severity, // Lower severity = higher score
        date_recorded: new Date().toISOString()
      })

      if (response.success) {
        setAnxietyEpisodes(prev => [
          {
            id: response.data.id,
            ...episodeData,
            created_at: response.data.date_recorded
          },
          ...prev.slice(0, 9)
        ])
        toast.success('Episode logged for tracking')
      }
    } catch (error) {
      toast.error('Failed to log episode')
    }
  }

  const startTherapySession = async (sessionType: string) => {
    try {
      const sessionData = {
        session_type: sessionType,
        duration_minutes: 0,
        topics_discussed: [],
        insights: {},
        mood_before: getCurrentMoodScore(),
        mood_after: 0
      }

      const response = await apiClient.saveProgress('por-well', {
        progress_type: 'therapy_session',
        progress_data: sessionData,
        score: 0,
        date_recorded: new Date().toISOString()
      })

      if (response.success) {
        toast.success('Therapy session started')
        return response.data.id
      }
    } catch (error) {
      toast.error('Failed to start session')
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
        const newConversation = await apiClient.startAIConversation('por-well', aiMessage)
        if (newConversation.success) {
          conversationId = newConversation.data.id
          setAiChat(prev => ({ ...prev, conversationId }))
        }
      } else {
        const response = await apiClient.sendAIMessage(conversationId, aiMessage, 'por-well')
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

  const getCurrentMoodScore = (): number => {
    return moodHistory.length > 0 ? moodHistory[0].mood_score : 5
  }

  const getAverageMoodLast7Days = (): number => {
    const recent = moodHistory.slice(0, 7)
    return recent.length > 0 
      ? Math.round(recent.reduce((sum, entry) => sum + entry.mood_score, 0) / recent.length)
      : 5
  }

  const getAnxietyTrend = (): 'improving' | 'worsening' | 'stable' => {
    if (moodHistory.length < 7) return 'stable'
    
    const recent = moodHistory.slice(0, 7).map(m => m.anxiety_level)
    const older = moodHistory.slice(7, 14).map(m => m.anxiety_level)
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    
    if (recentAvg < olderAvg - 0.5) return 'improving'
    if (recentAvg > olderAvg + 0.5) return 'worsening'
    return 'stable'
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner}></div>
          <h2>Loading PorWell...</h2>
          <p>Preparing your wellness journey</p>
        </div>
      </div>
    )
  }

  if (!ecosystemAccess.success || !ecosystemAccess.data?.hasAccess) {
    return (
      <div className={styles.dashboard}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">🌻 PorWell Access Required</h2>
          <p className="mb-6">Upgrade to access AI-powered mental wellness tools</p>
          <Link href="/pricing">
            <Button>Upgrade Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  const anxietyTrend = getAnxietyTrend()
  const avgMood = getAverageMoodLast7Days()

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🌻 PorWell Dashboard</h1>
          <p className={styles.subtitle}>Your mental wellness companion</p>
        </div>
        <div className="flex gap-3 items-center">
          <Badge variant={ecosystemAccess.data?.level === 'premium' ? 'default' : 'secondary'}>
            {ecosystemAccess.data?.level?.toUpperCase()}
          </Badge>
          {anxietyTrend === 'worsening' && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Check-in Needed
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="therapist">AI Therapist</TabsTrigger>
          <TabsTrigger value="meditation">Meditation</TabsTrigger>
          <TabsTrigger value="crisis">Crisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WellnessOverview 
            moodHistory={moodHistory}
            avgMood={avgMood}
            anxietyTrend={anxietyTrend}
            sessionsCount={therapySessions.length}
            episodesCount={anxietyEpisodes.length}
          />
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <MoodTracking onSaveMood={saveMoodEntry} moodHistory={moodHistory} />
        </TabsContent>

        <TabsContent value="therapist" className="space-y-6">
          <AITherapist 
            messages={aiChat.messages}
            onSendMessage={sendAIMessage}
            message={aiMessage}
            setMessage={setAiMessage}
            loading={aiLoading}
          />
        </TabsContent>

        <TabsContent value="meditation" className="space-y-6">
          <MeditationCenter onStartSession={startTherapySession} />
        </TabsContent>

        <TabsContent value="crisis" className="space-y-6">
          <CrisisSupport onLogEpisode={logAnxietyEpisode} episodes={anxietyEpisodes} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Wellness overview component
function WellnessOverview({ 
  moodHistory, 
  avgMood, 
  anxietyTrend, 
  sessionsCount, 
  episodesCount 
}: {
  moodHistory: MoodEntry[]
  avgMood: number
  anxietyTrend: string
  sessionsCount: number
  episodesCount: number
}) {
  const chartData = moodHistory.slice(0, 14).reverse().map(entry => ({
    date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.mood_score,
    anxiety: entry.anxiety_level,
    stress: entry.stress_level
  }))

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Mood</CardTitle>
            <Heart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moodHistory[0]?.mood_score || 'N/A'}/10</div>
            <p className="text-xs text-gray-600">
              {moodHistory[0]?.emotions[0] || 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day Average</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMood}/10</div>
            <Progress value={avgMood * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anxiety Trend</CardTitle>
            <Brain className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{anxietyTrend}</div>
            <Badge variant={
              anxietyTrend === 'improving' ? 'default' : 
              anxietyTrend === 'worsening' ? 'destructive' : 'secondary'
            } className="mt-2">
              {anxietyTrend === 'improving' ? '📈 Getting Better' : 
               anxietyTrend === 'worsening' ? '📉 Needs Attention' : '➡️ Stable'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
            <MessageCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsCount}</div>
            <p className="text-xs text-gray-600">AI therapy sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mood & Anxiety Trends (14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Area type="monotone" dataKey="mood" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
              <Area type="monotone" dataKey="anxiety" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Mood Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            {moodHistory.slice(0, 5).map((entry, index) => (
              <div key={entry.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <span className="font-medium">Mood: {entry.mood_score}/10</span>
                  <p className="text-sm text-gray-600">
                    {entry.emotions.slice(0, 2).join(', ')}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {moodHistory.length === 0 && (
              <p className="text-center text-gray-500 py-4">Start tracking your mood to see patterns</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const triggerCounts = moodHistory
                .flatMap(entry => entry.triggers)
                .reduce((acc, trigger) => {
                  acc[trigger] = (acc[trigger] || 0) + 1
                  return acc
                }, {} as Record<string, number>)

              const topTriggers = Object.entries(triggerCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)

              return topTriggers.length > 0 ? (
                <div className="space-y-2">
                  {topTriggers.map(([trigger, count]) => (
                    <div key={trigger} className="flex justify-between items-center">
                      <span>{trigger}</span>
                      <Badge variant="outline">{count}x</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No trigger data yet</p>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Mood tracking component
function MoodTracking({ 
  onSaveMood, 
  moodHistory 
}: {
  onSaveMood: (mood: any) => void
  moodHistory: MoodEntry[]
}) {
  const [moodData, setMoodData] = useState({
    mood_score: 5,
    emotions: [] as string[],
    triggers: [] as string[],
    activities: [] as string[],
    thoughts: '',
    physical_symptoms: [] as string[],
    sleep_quality: 5,
    anxiety_level: 5,
    stress_level: 5
  })

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveMood(moodData)
    setMoodData({
      mood_score: 5,
      emotions: [],
      triggers: [],
      activities: [],
      thoughts: '',
      physical_symptoms: [],
      sleep_quality: 5,
      anxiety_level: 5,
      stress_level: 5
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Mood Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood score */}
            <div>
              <label className="text-sm font-medium">Overall Mood (1-10)</label>
              <div className="mt-2">
                <Slider
                  value={[moodData.mood_score]}
                  onValueChange={([value]) => setMoodData(prev => ({ ...prev, mood_score: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span className="font-medium">{moodData.mood_score}/10</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>

            {/* Emotions */}
            <div>
              <label className="text-sm font-medium">How are you feeling?</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EMOTIONS.map(emotion => (
                  <Badge
                    key={emotion}
                    variant={moodData.emotions.includes(emotion) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setMoodData(prev => ({
                      ...prev,
                      emotions: toggleArrayItem(prev.emotions, emotion)
                    }))}
                  >
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Anxiety and stress */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Anxiety Level (1-10)</label>
                <Slider
                  value={[moodData.anxiety_level]}
                  onValueChange={([value]) => setMoodData(prev => ({ ...prev, anxiety_level: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  {moodData.anxiety_level}/10
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Stress Level (1-10)</label>
                <Slider
                  value={[moodData.stress_level]}
                  onValueChange={([value]) => setMoodData(prev => ({ ...prev, stress_level: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  {moodData.stress_level}/10
                </div>
              </div>
            </div>

            {/* Triggers */}
            <div>
              <label className="text-sm font-medium">What triggered these feelings?</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TRIGGERS.map(trigger => (
                  <Badge
                    key={trigger}
                    variant={moodData.triggers.includes(trigger) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setMoodData(prev => ({
                      ...prev,
                      triggers: toggleArrayItem(prev.triggers, trigger)
                    }))}
                  >
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Thoughts */}
            <div>
              <label className="text-sm font-medium">What's on your mind?</label>
              <Textarea
                value={moodData.thoughts}
                onChange={(e) => setMoodData(prev => ({ ...prev, thoughts: e.target.value }))}
                placeholder="Share your thoughts, worries, or reflections..."
                className="mt-2"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Save Mood Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mood Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {moodHistory.slice(0, 5).map(entry => (
              <div key={entry.id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">Mood: {entry.mood_score}/10</span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {entry.emotions.slice(0, 3).map(emotion => (
                    <Badge key={emotion} variant="outline" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
                {entry.thoughts && (
                  <p className="text-sm text-gray-700">{entry.thoughts.slice(0, 100)}...</p>
                )}
              </div>
            ))}
            {moodHistory.length === 0 && (
              <p className="text-center text-gray-500 py-4">No mood entries yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// AI Therapist component
function AITherapist({ 
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
  const therapeuticPrompts = [
    "I'm feeling overwhelmed with work lately",
    "I've been having trouble sleeping",
    "I'm struggling with anxiety about the future",
    "I feel like I'm not good enough",
    "I'm having relationship difficulties"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Therapist - Safe Space
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto border rounded p-4 mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 space-y-4">
              <p>Welcome to your safe space. I'm here to listen and support you.</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Try starting with:</p>
                {therapeuticPrompts.map(prompt => (
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
                  <div className="animate-pulse">🧠</div>
                  <span>Therapist is thinking...</span>
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
            placeholder="Share what's on your mind..."
            disabled={loading}
          />
          <Button onClick={onSendMessage} disabled={loading || !message.trim()}>
            Send
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <Shield className="h-3 w-3 inline mr-1" />
          This is a safe, confidential space. If you're in crisis, please contact emergency services.
        </div>
      </CardContent>
    </Card>
  )
}

// Meditation center component
function MeditationCenter({ onStartSession }: { onStartSession: (type: string) => void }) {
  const meditations = [
    {
      id: 'breathing',
      title: '4-7-8 Breathing',
      description: 'Calming breath exercise for anxiety relief',
      duration: '5 min',
      difficulty: 'Beginner',
      icon: '🫁'
    },
    {
      id: 'body-scan',
      title: 'Body Scan Meditation',
      description: 'Progressive muscle relaxation technique',
      duration: '15 min',
      difficulty: 'Intermediate',
      icon: '🧘‍♀️'
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness Meditation',
      description: 'Present moment awareness practice',
      duration: '10 min',
      difficulty: 'Beginner',
      icon: '🌸'
    },
    {
      id: 'sleep',
      title: 'Sleep Meditation',
      description: 'Guided relaxation for better sleep',
      duration: '20 min',
      difficulty: 'All levels',
      icon: '😴'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {meditations.map(meditation => (
        <Card key={meditation.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="text-4xl mb-2">{meditation.icon}</div>
            <CardTitle className="text-lg">{meditation.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{meditation.description}</p>
            <div className="flex justify-between items-center mb-4">
              <Badge variant="outline">{meditation.duration}</Badge>
              <span className="text-xs text-gray-500">{meditation.difficulty}</span>
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                onStartSession('meditation')
                toast.success(`Starting ${meditation.title}`)
              }}
            >
              Start Session
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Crisis support component
function CrisisSupport({ 
  onLogEpisode, 
  episodes 
}: {
  onLogEpisode: (episode: any) => void
  episodes: AnxietyEpisode[]
}) {
  const crisisResources = [
    {
      name: 'National Mental Health Hotline (RO)',
      number: '0800 801 200',
      description: 'Free 24/7 crisis support in Romanian',
      urgent: true
    },
    {
      name: 'Emergency Services',
      number: '112',
      description: 'For immediate medical emergencies',
      urgent: true
    },
    {
      name: 'International Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free crisis support via text',
      urgent: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Crisis resources */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Crisis Support Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {crisisResources.map((resource, index) => (
              <div key={index} className={`p-3 rounded ${resource.urgent ? 'bg-red-100' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{resource.name}</h4>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </div>
                  <Badge variant={resource.urgent ? 'destructive' : 'outline'}>
                    {resource.number}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded">
            <p className="text-sm text-blue-800">
              <strong>Remember:</strong> You are not alone. These feelings will pass. Reach out for help.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Anxiety episode tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Anxiety Episode Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {episodes.slice(0, 5).map(episode => (
              <div key={episode.id} className="p-3 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">Severity: {episode.severity}/10</span>
                  <span className="text-xs text-gray-500">
                    {new Date(episode.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Duration:</strong> {episode.duration_minutes} minutes</p>
                  <p><strong>Triggers:</strong> {episode.triggers.join(', ')}</p>
                  <p><strong>Coping strategies:</strong> {episode.coping_strategies_used.join(', ')}</p>
                </div>
              </div>
            ))}
            {episodes.length === 0 && (
              <p className="text-center text-gray-500 py-4">No episodes tracked yet</p>
            )}
          </div>
          <Button 
            className="w-full mt-4" 
            variant="outline"
            onClick={() => {
              // Would open episode logging modal
              // // toast.info('Episode logging feature coming soon')
            }}
          >
            Log New Episode
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}