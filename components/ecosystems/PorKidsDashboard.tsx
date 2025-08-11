import { Button, Card, CardContent, Badge } from '@/components/ui'
// ========================================
// 2. PORKIDS ECOSYSTEM - COMPLETE
// ========================================

// components/ecosystems/PorKidsDashboard.tsx
'use client'

import React, { useState, useRef } from 'react'
import { apiClient, useAPICall } from '@/lib/api/api-client-complete'

interface ChildProfile {
  id: string
  name: string
  age: number
  gradeLevel: string
  interests: string[]
  learningStyle: string
}

interface HomeworkAnalysis {
  problemType: string
  solution: {
    steps: string[]
    explanation: string
    answer: string
  }
  keyPoints: string[]
  learningTips: string[]
  practiceProblems: Array<{
    question: string
    hint: string
  }>
}

export function PorKidsDashboard() {
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'homework' | 'progress' | 'games'>('overview')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [homeworkAnalysis, setHomeworkAnalysis] = useState<HomeworkAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('mathematics')
  const [gradeLevel, setGradeLevel] = useState(5)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch children profiles
  const { data: children, loading: childrenLoading } = useAPICall(() => 
    apiClient.getChildProfiles()
  )

  // Fetch learning progress
  const { data: progress, loading: progressLoading } = useAPICall(() => 
    selectedChild ? apiClient.getLearningProgress(selectedChild) : Promise.resolve({ success: false })
  , { dependencies: [selectedChild] })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      setUploadedImage(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeHomework = async () => {
    if (!uploadedImage || !selectedChild) return

    setIsAnalyzing(true)
    try {
      const response = await apiClient.analyzeHomework(
        uploadedImage,
        selectedSubject,
        gradeLevel,
        selectedChild
      )

      if (response.success) {
        setHomeworkAnalysis(response.data)
      } else {
        alert('Failed to analyze homework: ' + response.error)
      }
    } catch (error) {
      console.error('Homework analysis error:', error)
      alert('An error occurred while analyzing the homework')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Child Selector */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Select Child</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children?.map((child: ChildProfile) => (
              <Card
                key={child.id}
                className={`cursor-pointer transition-colors ${
                  selectedChild === child.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedChild(child.id)}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">👦</div>
                    <h3 className="font-medium">{child.name}</h3>
                    <p className="text-sm text-gray-600">
                      Age: {child.age} • Grade: {child.gradeLevel}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {child.interests.map((interest, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Child */}
            <Card className="cursor-pointer hover:bg-gray-50 border-dashed">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">➕</div>
                  <h3 className="font-medium">Add Child</h3>
                  <p className="text-sm text-gray-600">Create new profile</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {selectedChild && (
        <>
          {/* Today's Activities */}
          <Card>
            <CardHeader>
              <CardTitle>📚 Today's Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Math Practice</span>
                  <Badge>Completed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reading Time</span>
                  <Badge variant="secondary">15 min left</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Science Quiz</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Progress This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Mathematics</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Science</span>
                    <span>72%</span>
                  </div>
                  <Progress value={72} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Reading</span>
                    <span>91%</span>
                  </div>
                  <Progress value={91} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Badges */}
          <Card>
            <CardHeader>
              <CardTitle>🏆 Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-3 bg-yellow-100 rounded-lg">
                  <div className="text-2xl">🌟</div>
                  <div className="text-xs font-medium">Math Star</div>
                </div>
                <div className="text-center p-3 bg-green-100 rounded-lg">
                  <div className="text-2xl">📖</div>
                  <div className="text-xs font-medium">Bookworm</div>
                </div>
                <div className="text-center p-3 bg-blue-100 rounded-lg">
                  <div className="text-2xl">🔬</div>
                  <div className="text-xs font-medium">Scientist</div>
                </div>
                <div className="text-center p-3 bg-purple-100 rounded-lg">
                  <div className="text-2xl">⚡</div>
                  <div className="text-xs font-medium">Quick Learner</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )

  const HomeworkTab = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {!selectedChild ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👦</div>
          <h3 className="text-lg font-medium mb-2">Select a Child First</h3>
          <p className="text-gray-600">Choose a child profile to analyze homework</p>
        </div>
      ) : (
        <>
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>📸 Homework Scanner</CardTitle>
              <p className="text-sm text-gray-600">
                Take a photo or upload an image of the homework
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Subject and Grade Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select 
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="mathematics">Mathematics</option>
                      <option value="science">Science</option>
                      <option value="language">Language</option>
                      <option value="history">History</option>
                      <option value="geography">Geography</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Grade Level</label>
                    <select 
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                        <option key={grade} value={grade}>Grade {grade}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* File Upload */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Homework preview" 
                        className="max-w-full max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        onClick={analyzeHomework}
                        disabled={isAnalyzing}
                        className="px-6"
                      >
                        {isAnalyzing ? 'Analyzing...' : '🔍 Analyze Homework'}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-4">📸</div>
                      <h3 className="text-lg font-medium mb-2">Upload Homework Image</h3>
                      <p className="text-gray-600">
                        Click to select an image or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Supports JPG, PNG, WebP up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {homeworkAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>✨ Homework Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Problem Type */}
                  <div>
                    <h3 className="font-medium mb-2">Problem Type</h3>
                    <Badge>{homeworkAnalysis.problemType}</Badge>
                  </div>

                  {/* Solution Steps */}
                  <div>
                    <h3 className="font-medium mb-2">📝 Step-by-Step Solution</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="mb-3 font-medium">{homeworkAnalysis.solution.explanation}</p>
                      <ol className="space-y-2">
                        {homeworkAnalysis.solution.steps.map((step, i) => (
                          <li key={i} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-4 p-3 bg-green-100 rounded-lg">
                        <strong>Answer: {homeworkAnalysis.solution.answer}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Key Learning Points */}
                  <div>
                    <h3 className="font-medium mb-2">🎯 Key Learning Points</h3>
                    <ul className="space-y-2">
                      {homeworkAnalysis.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-yellow-500">•</span>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Learning Tips */}
                  <div>
                    <h3 className="font-medium mb-2">💡 Learning Tips</h3>
                    <ul className="space-y-2">
                      {homeworkAnalysis.learningTips.map((tip, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-green-500">•</span>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practice Problems */}
                  <div>
                    <h3 className="font-medium mb-2">🎮 Practice Problems</h3>
                    <div className="space-y-3">
                      {homeworkAnalysis.practiceProblems.map((problem, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="font-medium mb-2">{problem.question}</p>
                          <p className="text-sm text-gray-600">💡 Hint: {problem.hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">PorKids Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Add Child</Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: '🏠' },
          { id: 'homework', label: 'Homework Scanner', icon: '📸' },
          { id: 'progress', label: 'Progress', icon: '📊' },
          { id: 'games', label: 'Learning Games', icon: '🎮' }
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
      {activeTab === 'homework' && <HomeworkTab />}
      {activeTab === 'progress' && <div>Progress tracking content here...</div>}
      {activeTab === 'games' && <div>Educational games content here...</div>}
    </div>
  )
}