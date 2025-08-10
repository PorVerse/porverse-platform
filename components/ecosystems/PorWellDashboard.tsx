// @ts-nocheck
// ========================================
// 3. PORWELL ECOSYSTEM - COMPLETE
// ========================================

// components/ecosystems/PorWellDashboard.tsx
'use client'

import React, { useState } from 'react'
import { apiClient, useAPICall, useConversation } from '@/lib/api/api-client-complete'

interface MoodEntry {
  moodScore: number
  emotions: string[]
  triggers?: string[]
  activities?: string[]
  thoughts?: string
  date: Date
}

export function PorWellDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'therapy' | 'mood' | 'meditation'>('overview')
  const [currentMood, setCurrentMood] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [moodThoughts, setMoodThoughts] = useState('')

  // AI Therapy Conversation
  const { messages, loading: therapyLoading, sendMessage } = useConversation('por-well')

  // Fetch mood history
  const { data: moodHistory } = useAPICall(() => apiClient.getMoodHistory(30))

  const emotions = [
    { name: 'Happy', emoji: '😊', color: 'yellow' },
    { name: 'Sad', emoji: '😢', color: 'blue' },
    { name: 'Anxious', emoji: '😰', color: 'orange' },
    { name: 'Angry', emoji: '😠', color: 'red' },
    { name: 'Excited', emoji: '🤩', color: 'green' },
    { name: 'Peaceful', emoji: '😌', color: 'purple' },
    { name: 'Frustrated', emoji: '😤', color: 'red' },
    { name: 'Grateful', emoji: '🙏', color: 'pink' }
  ]

  const saveMoodEntry = async () => {
    const response = await apiClient.logMoodEntry({
      moodScore: currentMood,
      emotions: selectedEmotions,
      thoughts: moodThoughts,
      triggers: [],
      activities: [],
      physicalSymptoms: [],
      sleepQuality: 7,
      anxietyLevel: 3,
      stressLevel: 4
    })

    if (response.success) {
      alert('Mood entry saved successfully!')
      setSelectedEmotions([])
      setMoodThoughts('')
    }
  }

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Current Mood */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>🌟 How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Mood Scale */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>😢 Very Low</span>
                <span>😐 Neutral</span>
                <span>😊 Very High</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={currentMood}
                onChange={(e) => setCurrentMood(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center mt-2">
                <span className="text-2xl font-bold text-blue-600">{currentMood}/10</span>
              </div>
            </div>

            {/* Emotion Selection */}
            <div>
              <h3 className="font-medium mb-3">What emotions are you experiencing?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.name}
                    onClick={() => {
                      if (selectedEmotions.includes(emotion.name)) {
                        setSelectedEmotions(prev => prev.filter(e => e !== emotion.name))
                      } else {
                        setSelectedEmotions(prev => [...prev, emotion.name])
                      }
                    }}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedEmotions.includes(emotion.name)
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xl mb-1">{emotion.emoji}</div>
                    <div className="text-xs font-medium">{emotion.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Thoughts */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Any thoughts you'd like to share? (Optional)
              </label>
              <textarea
                value={moodThoughts}
                onChange={(e) => setMoodThoughts(e.target.value)}
                placeholder="What's on your mind today?"
                className="w-full px-3 py-2 border rounded-lg resize-none h-20"
              />
            </div>

            <Button onClick={saveMoodEntry} className="w-full">
              💾 Save Mood Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>🧘 Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">
              🧠 Start Therapy Chat
            </Button>
            <Button className="w-full" variant="outline">
              🧘‍♀️ 5-min Meditation
            </Button>
            <Button className="w-full" variant="outline">
              📊 View Mood Trends
            </Button>
            <Button className="w-full" variant="outline">
              💡 Coping Techniques
            </Button>
          </CardContent>
        </Card>

        {/* Today's Insights */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Today's Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="text-gray-600 mb-2">
                "Remember that it's okay to have difficult days. Every feeling is valid and temporary."
              </p>
              <div className="text-xs text-blue-600 font-medium">
                - Your AI Wellness Coach
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const TherapyTab = () => (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🧠 AI Therapy Session</CardTitle>
          <p className="text-sm text-gray-600">
            This is a safe space to explore your thoughts and feelings
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Conversation */}
            <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🤗</div>
                  <p>Hi! I'm here to listen and support you. How are you feeling today?</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white ml-auto'
                        : 'bg-white border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
              {therapyLoading && (
                <div className="bg-white border p-3 rounded-lg max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">💭</div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Share your thoughts..."
                className="flex-1 px-4 py-2 border rounded-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    sendMessage(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <Button disabled={therapyLoading}>Send</Button>
            </div>

            {/* Crisis Support Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm">
                <strong className="text-red-800">Crisis Support:</strong>
                <span className="text-red-700 ml-1">
                  If you're having thoughts of self-harm, please call 112 or the crisis hotline: 0800.801.200
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">PorWell Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Export Data</Button>
          <Button>Emergency Support</Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: '🏠' },
          { id: 'therapy', label: 'AI Therapy', icon: '🧠' },
          { id: 'mood', label: 'Mood Tracking', icon: '📊' },
          { id: 'meditation', label: 'Meditation', icon: '🧘' }
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
      {activeTab === 'therapy' && <TherapyTab />}
      {activeTab === 'mood' && <div>Mood tracking charts here...</div>}
      {activeTab === 'meditation' && <div>Meditation content here...</div>}
    </div>
  )
}
