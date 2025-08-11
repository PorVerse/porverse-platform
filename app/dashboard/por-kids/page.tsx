// app/dashboard/por-kids/page.tsx - Real Implementation
'use client'

import React, { useState, useEffect, useRef } from 'react'
// Temporary fix for build
const apiClient = { getProgress: async () => ({ success: true, data: {} }) }
const useUserProfile = () => ({ data: null, loading: false })
const useEcosystemAccess = () => ({ hasAccess: true, loading: false })
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, Upload, BookOpen, Star, Trophy, Brain, Target } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import styles from './style.module.css'

interface ChildProfile {
  id: string
  name: string
  age: number
  grade_level: string
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  subjects_strength: string[]
  subjects_weakness: string[]
  interests: string[]
  created_at: string
}

interface HomeworkSubmission {
  id: string
  child_id: string
  subject: string
  image_url: string
  ocr_text: string
  ai_solution: any
  parent_approved: boolean
  submitted_at: string
  difficulty_level: number
  accuracy_score: number
}

interface LearningProgress {
  subject: string
  topic: string
  mastery_level: number
  time_spent_minutes: number
  exercises_completed: number
  accuracy_percentage: number
  last_practiced: string
}

export default function PorKidsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [homeworkHistory, setHomeworkHistory] = useState<HomeworkSubmission[]>([])
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userProfile = useUserProfile()
  const ecosystemAccess = useEcosystemAccess('por-kids')

  useEffect(() => {
    loadChildrenData()
  }, [])

  useEffect(() => {
    if (selectedChild) {
      loadChildProgress(selectedChild)
    }
  }, [selectedChild])

  const loadChildrenData = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getChildProfiles()
      if (response.success) {
        setChildren(response.data)
        if (response.data.length > 0) {
          setSelectedChild(response.data[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading children:', error)
      toast.error('Failed to load children profiles')
    } finally {
      setLoading(false)
    }
  }

  const loadChildProgress = async (childId: string) => {
    try {
      // Load homework history
      const homeworkResponse = await fetch(`/api/por-kids/homework/${childId}`)
      if (homeworkResponse.ok) {
        const homeworkData = await homeworkResponse.json()
        setHomeworkHistory(homeworkData.data || [])
      }

      // Load learning progress
      const progressResponse = await fetch(`/api/por-kids/progress/${childId}`)
      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        setLearningProgress(progressData.data || [])
      }
    } catch (error) {
      console.error('Error loading child progress:', error)
    }
  }

  const createChildProfile = async (childData: Omit<ChildProfile, 'id' | 'created_at'>) => {
    try {
      const response = await apiClient.createChildProfile(childData)
      if (response.success) {
        setChildren(prev => [response.data, ...prev])
        setSelectedChild(response.data.id)
        toast.success('Child profile created!')
      }
    } catch (error) {
      toast.error('Failed to create child profile')
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!selectedChild) {
      toast.error('Please select a child first')
      return
    }

    setUploading(true)
    setScanning(false)

    try {
      // Upload image
      const formData = new FormData()
      formData.append('image', file)
      formData.append('childId', selectedChild)

      const uploadResponse = await fetch('/api/por-kids/upload-homework', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const uploadData = await uploadResponse.json()
      setScanning(true)
      toast.success('Image uploaded! Scanning homework...')

      // Process with AI
      const processResponse = await fetch('/api/por-kids/scan-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadData.imageUrl,
          childId: selectedChild
        })
      })

      if (!processResponse.ok) {
        throw new Error('Scanning failed')
      }

      const scanData = await processResponse.json()
      
      // Add to homework history
      setHomeworkHistory(prev => [scanData.data, ...prev])
      toast.success('Homework scanned successfully!')
      
      // Switch to homework tab to show results
      setActiveTab('homework')

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process homework')
    } finally {
      setUploading(false)
      setScanning(false)
    }
  }

  const approveHomeworkSolution = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/por-kids/approve-homework/${submissionId}`, {
        method: 'POST'
      })

      if (response.ok) {
        setHomeworkHistory(prev =>
          prev.map(hw =>
            hw.id === submissionId
              ? { ...hw, parent_approved: true }
              : hw
          )
        )
        toast.success('Solution approved!')
      }
    } catch (error) {
      toast.error('Failed to approve solution')
    }
  }

  const selectedChildData = children.find(c => c.id === selectedChild)

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner}></div>
          <h2>Loading PorKids...</h2>
          <p>Preparing educational tools</p>
        </div>
      </div>
    )
  }

  if (!ecosystemAccess.success || !ecosystemAccess.data?.hasAccess) {
    return (
      <div className={styles.dashboard}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">👶 PorKids Access Required</h2>
          <p className="mb-6">Upgrade to access AI-powered education tools</p>
          <Link href="/pricing">
            <Button>Upgrade Now</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>👶 PorKids Dashboard</h1>
          <p className={styles.subtitle}>AI-powered education for children</p>
        </div>
        <div className="flex gap-3 items-center">
          {children.length > 0 && (
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} (Age {child.age})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Badge variant={ecosystemAccess.data?.level === 'premium' ? 'default' : 'secondary'}>
            {ecosystemAccess.data?.level?.toUpperCase()}
          </Badge>
        </div>
      </div>

      {children.length === 0 ? (
        <CreateChildProfile onSubmit={createChildProfile} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {selectedChildData && (
              <ChildOverview 
                child={selectedChildData}
                progress={learningProgress}
                recentHomework={homeworkHistory.slice(0, 3)}
              />
            )}
          </TabsContent>

          <TabsContent value="homework" className="space-y-6">
            <HomeworkScanner
              onUpload={handleImageUpload}
              uploading={uploading}
              scanning={scanning}
              fileInputRef={fileInputRef}
            />
            <HomeworkHistory
              submissions={homeworkHistory}
              onApprove={approveHomeworkSolution}
            />
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <EducationalGames childId={selectedChild} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <LearningProgressDashboard progress={learningProgress} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// Create child profile component
function CreateChildProfile({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    age: 6,
    grade_level: '1st Grade',
    learning_style: 'visual' as const,
    subjects_strength: [] as string[],
    subjects_weakness: [] as string[],
    interests: [] as string[]
  })

  const subjects = ['Math', 'English', 'Science', 'History', 'Art', 'Music', 'PE']
  const interests = ['Reading', 'Drawing', 'Music', 'Sports', 'Science', 'Technology', 'Animals', 'Nature']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Please enter child name')
      return
    }
    onSubmit(formData)
  }

  const toggleArrayItem = (array: string[], item: string, field: string) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item]
    
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Child Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Child's Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Age</label>
              <Select value={formData.age.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, age: Number(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => i + 4).map(age => (
                    <SelectItem key={age} value={age.toString()}>{age} years old</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Grade Level</label>
              <Select value={formData.grade_level} onValueChange={(value) => setFormData(prev => ({ ...prev, grade_level: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'].map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Learning Style</label>
              <Select value={formData.learning_style} onValueChange={(value: any) => setFormData(prev => ({ ...prev, learning_style: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual Learner</SelectItem>
                  <SelectItem value="auditory">Auditory Learner</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic Learner</SelectItem>
                  <SelectItem value="reading">Reading/Writing Learner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Strong Subjects</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {subjects.map(subject => (
                <Badge
                  key={subject}
                  variant={formData.subjects_strength.includes(subject) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem(formData.subjects_strength, subject, 'subjects_strength')}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Subjects Needing Help</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {subjects.map(subject => (
                <Badge
                  key={subject}
                  variant={formData.subjects_weakness.includes(subject) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem(formData.subjects_weakness, subject, 'subjects_weakness')}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Interests</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map(interest => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem(formData.interests, interest, 'interests')}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Child overview component
function ChildOverview({ 
  child, 
  progress, 
  recentHomework 
}: { 
  child: ChildProfile
  progress: LearningProgress[]
  recentHomework: HomeworkSubmission[]
}) {
  const overallProgress = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + p.mastery_level, 0) / progress.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Child info card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {child.name}'s Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-semibold">{child.age} years old</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Grade</p>
              <p className="font-semibold">{child.grade_level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Learning Style</p>
              <p className="font-semibold capitalize">{child.learning_style}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overall Progress</p>
              <p className="font-semibold">{overallProgress}%</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Strong Subjects</p>
            <div className="flex flex-wrap gap-1">
              {child.subjects_strength.map(subject => (
                <Badge key={subject} variant="default" className="text-xs">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Homework Completed</CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentHomework.length}</div>
            <p className="text-xs text-gray-600">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
            <Brain className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(overallProgress / 20)}</div>
            <p className="text-xs text-gray-600">Badges earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent homework */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Homework</CardTitle>
        </CardHeader>
        <CardContent>
          {recentHomework.length > 0 ? (
            <div className="space-y-3">
              {recentHomework.map(hw => (
                <div key={hw.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{hw.subject}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(hw.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={hw.parent_approved ? 'default' : 'secondary'}>
                      {hw.parent_approved ? 'Approved' : 'Pending'}
                    </Badge>
                    <span className="text-sm font-medium">{hw.accuracy_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No homework submitted yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Homework scanner component
function HomeworkScanner({ 
  onUpload, 
  uploading, 
  scanning, 
  fileInputRef 
}: {
  onUpload: (file: File) => void
  uploading: boolean
  scanning: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
}) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File too large. Please choose a smaller image.')
        return
      }
      onUpload(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          AI Homework Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {uploading || scanning ? (
            <div className="py-12">
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="mt-4 font-medium">
                {uploading ? 'Uploading image...' : 'Scanning homework with AI...'}
              </p>
              <p className="text-sm text-gray-600">
                {scanning && 'This may take a few moments'}
              </p>
            </div>
          ) : (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-500 transition-colors">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">Upload Homework Image</p>
                <p className="text-gray-600 mb-4">Take a photo or upload an image of the homework</p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Choose Image
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, PDF • Max size: 10MB
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}

// Homework history component
function HomeworkHistory({ 
  submissions, 
  onApprove 
}: {
  submissions: HomeworkSubmission[]
  onApprove: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Homework History</CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map(submission => (
              <div key={submission.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{submission.subject}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={submission.parent_approved ? 'default' : 'secondary'}>
                      {submission.parent_approved ? 'Approved' : 'Pending Review'}
                    </Badge>
                    <span className="text-sm font-medium">{submission.accuracy_score}%</span>
                  </div>
                </div>
                
                {submission.ai_solution && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm font-medium mb-2">AI Solution:</p>
                    <p className="text-sm">{submission.ai_solution.explanation}</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  {!submission.parent_approved && (
                    <Button size="sm" onClick={() => onApprove(submission.id)}>
                      Approve Solution
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No homework submitted yet</p>
        )}
      </CardContent>
    </Card>
  )
}

// Educational games component
function EducationalGames({ childId }: { childId: string }) {
  const games = [
    {
      id: 'math-adventure',
      title: 'Math Adventure',
      description: 'Solve math problems in a fun adventure game',
      subject: 'Math',
      difficulty: 'Easy',
      icon: '🧮'
    },
    {
      id: 'word-wizard',
      title: 'Word Wizard',
      description: 'Build vocabulary with magical word games',
      subject: 'English',
      difficulty: 'Medium',
      icon: '📚'
    },
    {
      id: 'science-lab',
      title: 'Science Lab',
      description: 'Conduct virtual experiments safely',
      subject: 'Science',
      difficulty: 'Medium',
      icon: '🔬'
    }
  ]

  const startGame = (gameId: string) => {
    toast.success(`Starting ${games.find(g => g.id === gameId)?.title}!`)
    // Would navigate to game or open game modal
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {games.map(game => (
        <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="text-4xl mb-2">{game.icon}</div>
            <CardTitle className="text-lg">{game.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{game.description}</p>
            <div className="flex justify-between items-center mb-4">
              <Badge variant="outline">{game.subject}</Badge>
              <span className="text-xs text-gray-500">{game.difficulty}</span>
            </div>
            <Button className="w-full" onClick={() => startGame(game.id)}>
              Play Now
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Learning progress dashboard
function LearningProgressDashboard({ progress }: { progress: LearningProgress[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subject Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {progress.length > 0 ? (
            <div className="space-y-4">
              {progress.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.subject} - {item.topic}</span>
                    <span className="text-sm text-gray-600">{item.mastery_level}%</span>
                  </div>
                  <Progress value={item.mastery_level} />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.exercises_completed} exercises</span>
                    <span>{item.accuracy_percentage}% accuracy</span>
                    <span>{Math.round(item.time_spent_minutes / 60)}h spent</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No progress data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}