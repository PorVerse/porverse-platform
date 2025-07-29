// components/porKids/HomeworkScanner.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, FileText, CheckCircle, AlertCircle, Loader2, Eye, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface HomeworkScannerProps {
  childId: string
  onScanComplete?: (result: any) => void
}

interface ScanResult {
  id: string
  extractedText: string
  confidence: number
  problemType: string
  solution: {
    steps: Array<{
      stepNumber: number
      description: string
      formula?: string
      calculation?: string
      reasoning: string
      visualization?: string
    }>
    explanation: string
    alternativeMethods: string[]
    conceptsUsed: string[]
    difficulty: 'easy' | 'medium' | 'hard'
    timeEstimate: number
    visualAids: string[]
  }
  learningGaps: string[]
  recommendedExercises: Array<{
    id: string
    title: string
    difficulty: 'easy' | 'medium' | 'hard'
    concept: string
    problem: string
    hints: string[]
    points: number
  }>
  parentApprovalRequired: boolean
  createdAt: string
}

export default function HomeworkScanner({ childId, onScanComplete }: HomeworkScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [subject, setSubject] = useState('math')
  const [gradeLevel, setGradeLevel] = useState(5)
  const [showSolution, setShowSolution] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const subjects = [
    { value: 'math', label: 'Matematică', icon: '🔢' },
    { value: 'physics', label: 'Fizică', icon: '⚛️' },
    { value: 'chemistry', label: 'Chimie', icon: '🧪' },
    { value: 'english', label: 'Engleză', icon: '🇬🇧' },
    { value: 'romanian', label: 'Română', icon: '🇷🇴' },
    { value: 'history', label: 'Istorie', icon: '📚' },
    { value: 'geography', label: 'Geografie', icon: '🌍' }
  ]

  const handleFileSelect = useCallback((file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tip de fișier neacceptat. Folosește JPEG, PNG sau WebP.')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fișierul este prea mare. Maximum 10MB.')
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const scanHomework = async () => {
    if (!selectedFile) {
      toast.error('Selectează o imagine mai întâi')
      return
    }

    setIsScanning(true)
    setScanResult(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('childId', childId)
      formData.append('subject', subject)
      formData.append('gradeLevel', gradeLevel.toString())

      const response = await fetch('/api/por-kids/homework/scan', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Eroare la procesarea temei')
      }

      if (result.success) {
        setScanResult(result.data)
        toast.success('Tema a fost analizată cu succes!')
        onScanComplete?.(result.data)
      } else {
        throw new Error(result.error)
      }

    } catch (error: any) {
      console.error('Homework scan error:', error)
      toast.error(error.message || 'Eroare la scanarea temei')
    } finally {
      setIsScanning(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Ușor'
      case 'medium': return 'Mediu'
      case 'hard': return 'Dificil'
      default: return 'Necunoscut'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔍 Homework Scanner AI
        </h2>
        <p className="text-gray-600">
          Scaneaza tema și primește soluții pas cu pas + exerciții personalizate
        </p>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Materia
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {subjects.map((subj) => (
              <option key={subj.value} value={subj.value}>
                {subj.icon} {subj.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clasa
          </label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((grade) => (
              <option key={grade} value={grade}>
                Clasa {grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mb-8">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors">
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
              />
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Schimbă imaginea
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <Upload className="w-12 h-12 text-gray-400" />
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Încarcă o imagine cu tema
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  JPEG, PNG sau WebP • Maximum 10MB
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Încarcă din galerie</span>
                </button>

                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Folosește camera</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />
      </div>

      {/* Scan Button */}
      {selectedFile && (
        <div className="text-center mb-8">
          <button
            onClick={scanHomework}
            disabled={isScanning}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Analizez tema...</span>
              </>
            ) : (
              <>
                <FileText className="w-6 h-6" />
                <span>🔍 Analizează Tema</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Scanning Progress */}
      {isScanning && (
        <div className="mb-8 p-6 bg-blue-50 rounded-xl">
          <div className="flex items-center space-x-4 mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-blue-800 font-medium">Procesez imaginea cu AI...</span>
          </div>
          
          <div className="space-y-2 text-sm text-blue-700">
            <div>✓ Extracting text using OCR...</div>
            <div>✓ Identifying problem type...</div>
            <div>⏳ Generating step-by-step solution...</div>
            <div>⏳ Analyzing learning gaps...</div>
            <div>⏳ Creating practice exercises...</div>
          </div>
        </div>
      )}

      {/* Results */}
      {scanResult && (
        <div className="space-y-6">
          {/* Header Results */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-green-800">
                    Analiza completă!
                  </h3>
                  <p className="text-green-600">
                    Încredere OCR: {Math.round(scanResult.confidence)}% • 
                    Tip problemă: {scanResult.problemType}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(scanResult.solution.difficulty)}`}>
                  {getDifficultyLabel(scanResult.solution.difficulty)}
                </span>
                <span className="text-sm text-gray-600">
                  ~{scanResult.solution.timeEstimate} min
                </span>
              </div>
            </div>

            {scanResult.parentApprovalRequired && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 text-sm">
                  Soluția necesită aprobarea părintelui înainte de a fi afișată
                </span>
              </div>
            )}
          </div>

          {/* Extracted Text */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Text extras din imagine:
            </h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200 font-mono text-sm">
              {scanResult.extractedText}
            </div>
          </div>

          {/* Solution Steps */}
          {!scanResult.parentApprovalRequired && (
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-blue-800 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Soluție pas cu pas:
                </h4>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showSolution ? 'Ascunde' : 'Arată'} soluția</span>
                </button>
              </div>

              {showSolution && (
                <div className="space-y-4">
                  {scanResult.solution.steps.map((step, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-2">
                            {step.description}
                          </p>
                          {step.formula && (
                            <div className="bg-gray-100 p-2 rounded font-mono text-sm mb-2">
                              {step.formula}
                            </div>
                          )}
                          {step.calculation && (
                            <div className="bg-green-100 p-2 rounded font-mono text-sm mb-2">
                              {step.calculation}
                            </div>
                          )}
                          <p className="text-gray-600 text-sm">
                            💡 {step.reasoning}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-gray-800 mb-2">Explicație generală:</h5>
                    <p className="text-gray-700">{scanResult.solution.explanation}</p>
                    
                    {scanResult.solution.conceptsUsed.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-600">Concepte folosite: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {scanResult.solution.conceptsUsed.map((concept, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Learning Gaps */}
          {scanResult.learningGaps.length > 0 && (
            <div className="bg-yellow-50 p-6 rounded-xl">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Zone de îmbunătățit:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scanResult.learningGaps.map((gap, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200">
                    <span className="text-yellow-800">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Exercises */}
          {scanResult.recommendedExercises.length > 0 && (
            <div className="bg-purple-50 p-6 rounded-xl">
              <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Exerciții recomandate pentru exersare:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scanResult.recommendedExercises.map((exercise, index) => (
                  <div key={exercise.id} className="bg-white p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-800 text-sm">
                        {exercise.title}
                      </h5>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                          {getDifficultyLabel(exercise.difficulty)}
                        </span>
                        <span className="text-xs text-purple-600 font-medium">
                          {exercise.points}p
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Concept:</strong> {exercise.concept}
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-800">
                        {exercise.problem}
                      </p>
                    </div>
                    
                    {exercise.hints.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Indicii:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {exercise.hints.map((hint, hintIndex) => (
                            <li key={hintIndex} className="flex items-start">
                              <span className="mr-1">💡</span>
                              {hint}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <button className="w-full px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors">
                      Începe exercițiul
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setScanResult(null)
                setSelectedFile(null)
                setPreview(null)
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Scanează altă temă</span>
            </button>

            <button
              onClick={() => {
                // Generate and download PDF report
                const reportData = {
                  subject,
                  gradeLevel,
                  extractedText: scanResult.extractedText,
                  solution: scanResult.solution,
                  learningGaps: scanResult.learningGaps,
                  exercises: scanResult.recommendedExercises,
                  timestamp: new Date().toISOString()
                }
                
                const dataStr = JSON.stringify(reportData, null, 2)
                const dataBlob = new Blob([dataStr], { type: 'application/json' })
                const url = URL.createObjectURL(dataBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `homework-analysis-${Date.now()}.json`
                link.click()
                URL.revokeObjectURL(url)
                
                toast.success('Raport descărcat!')
              }}
              className="px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Descarcă raport</span>
            </button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {!scanResult && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-3">
            💡 Sfaturi pentru scanarea optimă:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Asigură-te că textul este clar și lizibil</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Folosește lumină bună, evită umbrele</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Încadrează doar zona cu problema</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Ține telefonul stabil pentru claritate</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}