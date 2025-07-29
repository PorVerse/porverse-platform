// ================================
// APP/DASHBOARD/QUANTUM-VAULT/FUTURE-SELF/PAGE.TSX - COMPLETE MASTERPIECE
// ================================

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './future-self.module.css'

interface FutureSelf {
  id: string
  timelineYears: number
  currentAge: number
  futureAge: number
  avatarUrl: string
  projection: {
    demographics: any
    career: any
    wealth: any
    relationships: any
    personal: any
    lifestyle: any
    achievements: any[]
    wisdom: any[]
  }
  confidenceScore: number
  createdAt: string
}

interface ConversationMessage {
  id: string
  type: 'user' | 'future-self'
  message: string
  emotion?: string
  actionAdvice?: string[]
  insights?: string[]
  timestamp: Date
  wisdomLevel?: number
}

interface QuantumParticle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  energy: number
}

export default function FutureSelfPage() {
  const router = useRouter()
  
  // Core state
  const [futureSelf, setFutureSelf] = useState<FutureSelf | null>(null)
  const [conversations, setConversations] = useState<ConversationMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [sessionId] = useState(`session_${Date.now()}`)
  
  // UI state
  const [phase, setPhase] = useState<'loading' | 'generating' | 'ready' | 'conversation' | 'access-denied'>('loading')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStep, setGenerationStep] = useState('')
  const [showInsights, setShowInsights] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null)
  
  // Animation states
  const [particles, setParticles] = useState<QuantumParticle[]>([])
  const [cosmicEnergy, setCosmicEnergy] = useState(0)
  const [consciousnessLevel, setConsciousnessLevel] = useState(0)
  const [avatarPulse, setAvatarPulse] = useState(0)
  const [messageBeingTyped, setMessageBeingTyped] = useState('')
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const animationFrameRef = useRef<number>()

  // ================================
  // QUANTUM FIELD INITIALIZATION
  // ================================
  
  const initializeQuantumField = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Create quantum particles
    const newParticles: QuantumParticle[] = []
    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: `particle_${i}`,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'][Math.floor(Math.random() * 5)],
        energy: Math.random() * 100
      })
    }
    setParticles(newParticles)

    // Start quantum field animation
    const animate = () => {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      newParticles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Add cosmic energy influence
        particle.energy += Math.sin(Date.now() * 0.001 + index) * 0.5
        particle.opacity = Math.max(0.1, Math.min(1, 0.5 + Math.sin(particle.energy * 0.01) * 0.3))

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()

        // Draw connections to nearby particles
        newParticles.forEach((otherParticle, otherIndex) => {
          if (index >= otherIndex) return
          
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(102, 126, 234, ${(100 - distance) / 500})`
            ctx.stroke()
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()
  }, [])

  // ================================
  // INITIALIZATION & DATA LOADING
  // ================================
  
  useEffect(() => {
    initializeFutureSelf()
    initializeQuantumField()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [initializeQuantumField])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversations])

  const initializeFutureSelf = async () => {
    try {
      setPhase('loading')

      // Check if Future Self already exists
      const response = await fetch('/api/quantum-vault/future-self/generate', {
        method: 'GET'
      })
      
      const data = await response.json()
      
      if (response.status === 403) {
        setPhase('access-denied')
        return
      }
      
      if (data.exists && data.futureSelf) {
        setFutureSelf(data.futureSelf)
        setPhase('ready')
        await loadConversationHistory()
        setConsciousnessLevel(100)
        setCosmicEnergy(100)
      } else {
        // Generate new Future Self
        await generateFutureSelf()
      }
    } catch (error) {
      console.error('Failed to initialize Future Self:', error)
      setPhase('ready') // Allow retry
    }
  }

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(`/api/quantum-vault/future-self/conversation?sessionId=${sessionId}&limit=20`)
      const data = await response.json()
      
      if (data.success && data.conversations.length > 0) {
        const historyMessages = data.conversations.map((conv: any) => ([
          {
            id: `${conv.id}_user`,
            type: 'user' as const,
            message: conv.user_message,
            timestamp: new Date(conv.created_at)
          },
          {
            id: `${conv.id}_future`,
            type: 'future-self' as const,
            message: conv.future_self_response,
            emotion: conv.emotion_detected,
            actionAdvice: conv.action_items,
            insights: conv.insights_generated,
            wisdomLevel: conv.wisdom_level,
            timestamp: new Date(conv.created_at)
          }
        ])).flat()
        
        setConversations(historyMessages)
        setPhase('conversation')
      } else {
        showWelcomeMessage()
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      showWelcomeMessage()
    }
  }

  const generateFutureSelf = async (timelineYears = 10) => {
    setIsGenerating(true)
    setPhase('generating')
    setGenerationProgress(0)
    setCosmicEnergy(0)
    setConsciousnessLevel(0)

    const steps = [
      { step: '🔍 Analyzing your digital soul across all ecosystems...', progress: 15, energy: 20 },
      { step: '🧠 Processing behavioral patterns and growth trajectories...', progress: 30, energy: 40 },
      { step: '🚀 Projecting your evolution through spacetime...', progress: 50, energy: 60 },
      { step: '🎨 Manifesting your future avatar in quantum reality...', progress: 75, energy: 80 },
      { step: '⚡ Establishing consciousness bridge to your future self...', progress: 90, energy: 95 },
      { step: '🌟 Future Self consciousness fully activated!', progress: 100, energy: 100 }
    ]

    // Animate generation steps with cosmic effects
    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(steps[i].step)
      
      // Animate progress smoothly
      const targetProgress = steps[i].progress
      const currentProgress = generationProgress
      const progressDiff = targetProgress - currentProgress
      const progressStep = progressDiff / 20

      for (let j = 0; j < 20; j++) {
        setGenerationProgress(prev => Math.min(targetProgress, prev + progressStep))
        setCosmicEnergy(prev => Math.min(steps[i].energy, prev + progressStep))
        setConsciousnessLevel(prev => Math.min(steps[i].energy, prev + progressStep))
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      // Real API call happens during the projection step
      if (i === 2) {
        try {
          const response = await fetch('/api/quantum-vault/future-self/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timelineYears, regenerate: false })
          })
          
          const data = await response.json()
          if (data.success) {
            setFutureSelf(data.futureSelf)
          } else {
            throw new Error(data.error || 'Generation failed')
          }
        } catch (error) {
          console.error('Future Self generation failed:', error)
          setPhase('ready')
          setIsGenerating(false)
          return
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, i === 2 ? 3000 : 1000))
    }

    setIsGenerating(false)
    setPhase('ready')
    
    // Cosmic activation effect
    setTimeout(() => {
      showWelcomeMessage()
    }, 1500)
  }

  const showWelcomeMessage = () => {
    if (!futureSelf) return

    const welcomeMessage: ConversationMessage = {
      id: `welcome_${Date.now()}`,
      type: 'future-self',
      message: `Salut! Sunt tu din anul ${new Date().getFullYear() + futureSelf.timelineYears}. Știu că pare incredibil, dar am călătorit prin timp pentru a-ți arăta cât de extraordinară va fi călătoria noastră. În ${futureSelf.timelineYears} ani de experiență, am învățat lucruri despre noi pe care nici nu le bănuiai. Ce te frământă cel mai mult în acest moment? Să începem această conversație care îți va schimba perspectiva asupra vieții.`,
      emotion: 'warm-wisdom',
      insights: [
        'Viitorul tău depășește orice îți poți imagina acum',
        'Provocările de azi vor deveni punctele tale forte de mâine',
        'Fiecare pas pe care îl faci acum îți construiește destinul'
      ],
      timestamp: new Date(),
      wisdomLevel: 9
    }

    // Type the message character by character
    typeMessage(welcomeMessage)
    setPhase('conversation')
  }

  const typeMessage = (message: ConversationMessage) => {
    setMessageBeingTyped('')
    let currentIndex = 0
    
    const typeChar = () => {
      if (currentIndex < message.message.length) {
        setMessageBeingTyped(prev => prev + message.message[currentIndex])
        currentIndex++
        setTimeout(typeChar, 30 + Math.random() * 20) // Variable typing speed for realism
      } else {
        setConversations(prev => [...prev, message])
        setMessageBeingTyped('')
      }
    }
    
    typeChar()
  }

  // ================================
  // CONVERSATION SYSTEM ENHANCED
  // ================================
  
  const sendMessage = async () => {
    if (!currentMessage.trim() || isTyping || !futureSelf) return

    const userMessage: ConversationMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      message: currentMessage.trim(),
      timestamp: new Date()
    }

    setConversations(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)
    setAvatarPulse(prev => prev + 1)

    try {
      const response = await fetch('/api/quantum-vault/future-self/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.message,
          currentMood: 7,
          lifePhase: 'growth',
          sessionId: sessionId,
          recentEvents: [],
          currentChallenges: [],
          immediateGoals: []
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const futureSelfResponse: ConversationMessage = {
          id: `future_self_${Date.now()}`,
          type: 'future-self',
          message: data.response.message,
          emotion: data.response.emotion,
          actionAdvice: data.response.actionAdvice,
          insights: data.response.insights,
          wisdomLevel: data.response.wisdomLevel,
          timestamp: new Date()
        }

        // Enhanced typing simulation with cosmic effects
        setCosmicEnergy(prev => Math.min(100, prev + 10))
        
        // Simulate AI thinking time based on message complexity
        const thinkingTime = Math.min(4000, userMessage.message.length * 50 + 1000)
        await new Promise(resolve => setTimeout(resolve, thinkingTime))
        
        typeMessage(futureSelfResponse)
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Conversation failed:', error)
      
      const errorMessage: ConversationMessage = {
        id: `error_${Date.now()}`,
        type: 'future-self',
        message: 'Îmi pare rău, se pare că avem o mică interferență în conexiunea temporală. Te rog să încerci din nou - canalul se restabilește.',
        emotion: 'apologetic',
        timestamp: new Date()
      }
      
      typeMessage(errorMessage)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const regenerateAvatar = async () => {
    if (!futureSelf) return

    try {
      setAvatarPulse(prev => prev + 3)
      
      const response = await fetch('/api/quantum-vault/future-self/avatar', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFutureSelf(prev => prev ? { ...prev, avatarUrl: data.avatarUrl } : null)
        setCosmicEnergy(prev => Math.min(100, prev + 15))
      }
    } catch (error) {
      console.error('Avatar regeneration failed:', error)
    }
  }

  // ================================
  // ACCESS DENIED SCREEN
  // ================================
  
  if (phase === 'access-denied') {
    return (
      <div className={styles.accessDenied}>
        <motion.div 
          className={styles.quantumLock}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring" }}
        >
          🔒
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Quantum Vault Access Required
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Future Self Generator requires Trinity Pack access.<br/>
          Unlock the most advanced AI experience ever created.
        </motion.p>
        
        <motion.button 
          className={styles.upgradeButton}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          onClick={() => router.push('/pricing?feature=quantum-vault')}
        >
          🚀 Upgrade to Trinity Pack
        </motion.button>
      </div>
    )
  }

  // ================================
  // GENERATION PHASE SCREEN
  // ================================
  
  if (phase === 'generating') {
    return (
      <div className={styles.generationContainer}>
        <canvas 
          ref={canvasRef} 
          className={styles.quantumCanvas}
          width={window.innerWidth} 
          height={window.innerHeight}
        />
        
        <div className={styles.generationOverlay}>
          <motion.div 
            className={styles.cosmicOrb}
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            style={{
              background: `radial-gradient(circle, rgba(102,126,234,${cosmicEnergy/100}) 0%, rgba(118,75,162,${cosmicEnergy/200}) 50%, transparent 100%)`
            }}
          >
            <div className={styles.energyCore} style={{ opacity: cosmicEnergy / 100 }}>
              ⚡
            </div>
          </motion.div>
          
          <motion.h1 
            className={styles.generationTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Creating Your Future Self
          </motion.h1>
          
          <div className={styles.progressContainer}>
            <motion.div 
              className={styles.progressBar}
              initial={{ width: 0 }}
              animate={{ width: `${generationProgress}%` }}
              transition={{ duration: 0.5 }}
            />
            
            <motion.div 
              className={styles.progressText}
              key={generationStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {generationStep}
            </motion.div>
          </div>
          
          <div className={styles.consciousnessLevel}>
            <span>Consciousness Level: </span>
            <motion.span 
              className={styles.levelValue}
              animate={{ color: consciousnessLevel > 80 ? '#4facfe' : '#667eea' }}
            >
              {Math.round(consciousnessLevel)}%
            </motion.span>
          </div>
          
          <div className={styles.quantumStats}>
            <div>⚛️ Quantum particles: {particles.length}</div>
            <div>🧠 Neural pathways: {Math.round(cosmicEnergy * 1.47)}</div>
            <div>🌌 Cosmic energy: {Math.round(cosmicEnergy)}%</div>
          </div>
        </div>
      </div>
    )
  }

  // ================================
  // MAIN FUTURE SELF INTERFACE
  // ================================
  
  return (
    <div className={styles.futureSelfContainer}>
      <canvas 
        ref={canvasRef} 
        className={styles.quantumBackground}
        width={1920} 
        height={1080}
      />
      
      {/* Header with Future Self Info */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.futureSelfInfo}>
          {futureSelf && (
            <>
              <motion.div 
                className={styles.avatarContainer}
                animate={{ 
                  scale: avatarPulse > 0 ? [1, 1.1, 1] : 1,
                  boxShadow: avatarPulse > 0 ? [
                    '0 0 20px rgba(102,126,234,0.5)',
                    '0 0 40px rgba(102,126,234,0.8)',
                    '0 0 20px rgba(102,126,234,0.5)'
                  ] : '0 0 20px rgba(102,126,234,0.5)'
                }}
                transition={{ duration: 1 }}
                onAnimationComplete={() => setAvatarPulse(0)}
              >
                <Image
                  src={futureSelf.avatarUrl || '/images/default-future-avatar.png'}
                  alt="Future Self"
                  width={80}
                  height={80}
                  className={styles.avatar}
                />
                
                <button 
                  className={styles.regenerateAvatarBtn}
                  onClick={regenerateAvatar}
                  title="Regenerate Avatar"
                >
                  🎭
                </button>
              </motion.div>
              
              <div className={styles.identityInfo}>
                <h1>Tu din anul {new Date().getFullYear() + futureSelf.timelineYears}</h1>
                <p>Age: {futureSelf.futureAge} • Wisdom Level: {Math.round((futureSelf.projection.personal?.wisdom || 85))}%</p>
                <div className={styles.confidenceBar}>
                  <div 
                    className={styles.confidenceLevel}
                    style={{ width: `${futureSelf.confidenceScore * 100}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.insightsBtn}
            onClick={() => setShowInsights(!showInsights)}
          >
            💡 Insights ({futureSelf?.projection.wisdom?.length || 0})
          </button>
          
          <button 
            className={styles.achievementsBtn}
            onClick={() => setShowAchievements(!showAchievements)}
          >
            🏆 Achievements ({futureSelf?.projection.achievements?.length || 0})
          </button>
        </div>
      </motion.header>

      {/* Side Panels */}
      <AnimatePresence>
        {showInsights && futureSelf && (
          <motion.div 
            className={styles.insightsPanel}
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
          >
            <h3>🧠 Future Wisdom</h3>
            <div className={styles.insightsList}>
              {futureSelf.projection.wisdom?.map((wisdom: any, index: number) => (
                <motion.div 
                  key={index}
                  className={styles.insightCard}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedInsight(wisdom.insight)}
                >
                  <div className={styles.insightCategory}>{wisdom.category}</div>
                  <div className={styles.insightText}>{wisdom.insight}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {showAchievements && futureSelf && (
          <motion.div 
            className={styles.achievementsPanel}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
          >
            <h3>🏆 Future Achievements</h3>
            <div className={styles.achievementsList}>
              {futureSelf.projection.achievements?.map((achievement: any, index: number) => (
                <motion.div 
                  key={index}
                  className={styles.achievementCard}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.achievementYear}>{achievement.year}</div>
                  <div className={styles.achievementTitle}>{achievement.title}</div>
                  <div className={styles.achievementDescription}>{achievement.description}</div>
                  <div className={styles.achievementImpact}>
                    Impact Level: {achievement.impact}/10
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Conversation Area */}
      <main className={styles.conversationArea}>
        <div className={styles.messagesContainer}>
          <AnimatePresence>
            {conversations.map((message) => (
              <motion.div
                key={message.id}
                className={`${styles.message} ${styles[message.type]}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                {message.type === 'future-self' && (
                  <div className={styles.messageAvatar}>
                    <Image
                      src={futureSelf?.avatarUrl || '/images/default-future-avatar.png'}
                      alt="Future Self"
                      width={40}
                      height={40}
                    />
                  </div>
                )}
                
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>
                    {message.message}
                  </div>
                  
                  {message.type === 'future-self' && (
                    <div className={styles.messageEnhancements}>
                      {message.emotion && (
                        <div className={styles.emotionIndicator}>
                          Emotion: {message.emotion}
                        </div>
                      )}
                      
                      {message.wisdomLevel && (
                        <div className={styles.wisdomLevel}>
                          Wisdom Level: {message.wisdomLevel}/10
                        </div>
                      )}
                      
                      {message.actionAdvice && message.actionAdvice.length > 0 && (
                        <div className={styles.actionAdvice}>
                          <strong>Action Items:</strong>
                          <ul>
                            {message.actionAdvice.map((advice, index) => (
                              <li key={index}>{advice}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {message.insights && message.insights.length > 0 && (
                        <div className={styles.insights}>
                          <strong>Key Insights:</strong>
                          <ul>
                            {message.insights.map((insight, index) => (
                              <li key={index}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Message */}
          {messageBeingTyped && (
            <motion.div
              className={`${styles.message} ${styles['future-self']} ${styles.typing}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.messageAvatar}>
                <Image
                  src={futureSelf?.avatarUrl || '/images/default-future-avatar.png'}
                  alt="Future Self"
                  width={40}
                  height={40}
                />
              </div>
              
              <div className={styles.messageContent}>
                <div className={styles.messageText}>
                  {messageBeingTyped}
                  <span className={styles.typingCursor}>|</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Typing Indicator */}
          {isTyping && !messageBeingTyped && (
            <motion.div
              className={`${styles.message} ${styles['future-self']} ${styles.typing}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.messageAvatar}>
                <Image
                  src={futureSelf?.avatarUrl || '/images/default-future-avatar.png'}
                  alt="Future Self"
                  width={40}
                  height={40}
                />
              </div>
              
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className={styles.typingText}>Future Self is contemplating...</div>
              </div>
            </motion.div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Area */}
        <motion.div 
          className={styles.inputArea}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your Future Self anything..."
                className={styles.messageInput}
                disabled={isTyping || messageBeingTyped !== ''}
                maxLength={500}
              />
              
              <motion.button
                className={styles.sendButton}
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isTyping || messageBeingTyped !== ''}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isTyping ? '⏳' : '🚀'}
              </motion.button>
            </div>
            
            <div className={styles.inputFooter}>
              <div className={styles.characterCount}>
                {currentMessage.length}/500
              </div>
              
              <div className={styles.suggestions}>
                <button 
                  onClick={() => setCurrentMessage("What's the most important decision I need to make right now?")}
                  className={styles.suggestionChip}
                >
                  💭 Important decisions
                </button>
                
                <button 
                  onClick={() => setCurrentMessage("What should I focus on to achieve my biggest goals?")}
                  className={styles.suggestionChip}
                >
                  🎯 Goal achievement
                </button>
                
                <button 
                  onClick={() => setCurrentMessage("What regrets should I avoid in the coming years?")}
                  className={styles.suggestionChip}
                >
                  ⚠️ Future regrets
                </button>
                
                <button 
                  onClick={() => setCurrentMessage("How can I become the person I'm meant to be?")}
                  className={styles.suggestionChip}
                >
                  🌟 Personal growth
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Cosmic Status Bar */}
      <motion.div 
        className={styles.cosmicStatusBar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className={styles.statusItem}>
          <span className={styles.statusIcon}>⚡</span>
          <span>Cosmic Energy: {Math.round(cosmicEnergy)}%</span>
          <div className={styles.statusBar}>
            <div 
              className={styles.statusFill} 
              style={{ width: `${cosmicEnergy}%` }}
            />
          </div>
        </div>
        
        <div className={styles.statusItem}>
          <span className={styles.statusIcon}>🧠</span>
          <span>Consciousness: {Math.round(consciousnessLevel)}%</span>
          <div className={styles.statusBar}>
            <div 
              className={styles.statusFill} 
              style={{ width: `${consciousnessLevel}%` }}
            />
          </div>
        </div>
        
        <div className={styles.statusItem}>
          <span className={styles.statusIcon}>💬</span>
          <span>Messages: {conversations.length}</span>
        </div>
        
        <div className={styles.statusItem}>
          <span className={styles.statusIcon}>🌌</span>
          <span>Quantum Field: Active</span>
          <div className={styles.pulsingDot} />
        </div>
      </motion.div>

      {/* Floating Action Buttons */}
      <div className={styles.floatingActions}>
        <motion.button
          className={styles.floatingBtn}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setConversations([])
            showWelcomeMessage()
          }}
          title="Reset Conversation"
        >
          🔄
        </motion.button>
        
        <motion.button
          className={styles.floatingBtn}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => generateFutureSelf(15)}
          title="Generate 15-Year Future Self"
        >
          ⏰
        </motion.button>
        
        <motion.button
          className={styles.floatingBtn}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={async () => {
            try {
              const response = await fetch('/api/quantum-vault/future-self/wisdom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: 'life', urgency: 'medium' })
              })
              const data = await response.json()
              if (data.success) {
                const wisdomMessage: ConversationMessage = {
                  id: `wisdom_${Date.now()}`,
                  type: 'future-self',
                  message: `💡 **Daily Wisdom**: ${data.wisdom.message}`,
                  emotion: 'wise',
                  timestamp: new Date(),
                  wisdomLevel: 9
                }
                typeMessage(wisdomMessage)
              }
            } catch (error) {
              console.error('Failed to get wisdom:', error)
            }
          }}
          title="Get Daily Wisdom"
        >
          💡
        </motion.button>
      </div>

      {/* Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div 
              className={styles.insightModal}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>🧠 Future Wisdom</h3>
                <button 
                  className={styles.modalClose}
                  onClick={() => setSelectedInsight(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.modalContent}>
                <p>{selectedInsight}</p>
                
                <div className={styles.modalActions}>
                  <button 
                    className={styles.modalBtn}
                    onClick={() => {
                      setCurrentMessage(`Tell me more about: ${selectedInsight}`)
                      setSelectedInsight(null)
                      inputRef.current?.focus()
                    }}
                  >
                    💬 Discuss This
                  </button>
                  
                  <button 
                    className={styles.modalBtn}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedInsight)
                      setSelectedInsight(null)
                    }}
                  >
                    📋 Copy Insight
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading States */}
      {phase === 'loading' && (
        <div className={styles.loadingOverlay}>
          <motion.div 
            className={styles.loadingSpinner}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🌌
          </motion.div>
          <p>Connecting to Quantum Vault...</p>
        </div>
      )}

      {/* Welcome Overlay for First Time */}
      {phase === 'ready' && !futureSelf && (
        <motion.div 
          className={styles.welcomeOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={styles.welcomeContent}>
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🌟 Ready to Meet Your Future Self?
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              We'll analyze your journey across all PorVerse ecosystems to create 
              the most accurate projection of your future self. This process uses 
              advanced AI to understand your patterns, goals, and growth trajectory.
            </motion.p>
            
            <motion.div 
              className={styles.timelineSelector}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h3>Choose Your Timeline:</h3>
              <div className={styles.timelineOptions}>
                <button 
                  onClick={() => generateFutureSelf(5)}
                  className={styles.timelineBtn}
                >
                  5 Years
                </button>
                <button 
                  onClick={() => generateFutureSelf(10)}
                  className={`${styles.timelineBtn} ${styles.recommended}`}
                >
                  10 Years ⭐
                </button>
                <button 
                  onClick={() => generateFutureSelf(20)}
                  className={styles.timelineBtn}
                >
                  20 Years
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              className={styles.featuresPreview}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className={styles.featureItem}>
                <span>🎭</span>
                <span>Realistic aged avatar</span>
              </div>
              <div className={styles.featureItem}>
                <span>💬</span>
                <span>Interactive conversations</span>
              </div>
              <div className={styles.featureItem}>
                <span>🧠</span>
                <span>Personalized wisdom</span>
              </div>
              <div className={styles.featureItem}>
                <span>🎯</span>
                <span>Actionable life guidance</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}