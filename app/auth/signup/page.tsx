// app/auth/signup/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import styles from './signup.module.css'

// ===== TYPES & INTERFACES =====
interface SignupForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
  agreeMarketing: boolean
  country: string
  dateOfBirth: string
}

interface OnboardingData {
  goals: string[]
  currentChallenges: string[]
  ecosystemInterest: string[]
  experience: 'beginner' | 'intermediate' | 'advanced'
  motivation: string
  timeCommitment: string
}

interface EcosystemChoice {
  id: string
  name: string
  description: string
  icon: string
  tier: 'FREE' | 'PREMIUM'
  gradient: string
  features: string[]
  comingSoon?: boolean
}

// ===== ECOSYSTEM DEFINITIONS =====
const ECOSYSTEMS: EcosystemChoice[] = [
  {
    id: 'por-health',
    name: 'PorHealth',
    description: 'AI Nutrition & Fitness Optimization',
    icon: '🌿',
    tier: 'FREE',
    gradient: 'from-green-500 to-emerald-600',
    features: ['AI Meal Planning', 'Workout Generator', 'Health Tracking']
  },
  {
    id: 'por-kids',
    name: 'PorKids',
    description: 'Educational AI for Children',
    icon: '👶',
    tier: 'FREE',
    gradient: 'from-pink-500 to-rose-600',
    features: ['Homework AI Scanner', 'Learning Games', 'Progress Tracking']
  },
  {
    id: 'por-well',
    name: 'PorWell',
    description: 'Mental Wellness & Therapy AI',
    icon: '🧘',
    tier: 'PREMIUM',
    gradient: 'from-purple-500 to-violet-600',
    features: ['AI Therapist', 'Mood Tracking', 'Meditation Guide']
  },
  {
    id: 'por-mind',
    name: 'PorMind',
    description: 'Financial Intelligence & Investing',
    icon: '💎',
    tier: 'PREMIUM',
    gradient: 'from-blue-500 to-indigo-600',
    features: ['AI Investment Advisor', 'Budget Optimizer', 'Wealth Planning']
  },
  {
    id: 'por-flow',
    name: 'PorFlow',
    description: 'Productivity & Time Mastery',
    icon: '🌊',
    tier: 'PREMIUM',
    gradient: 'from-cyan-500 to-teal-600',
    features: ['AI Schedule Optimizer', 'Focus Sessions', 'Automation Tools']
  },
  {
    id: 'por-blu',
    name: 'PorBlu',
    description: 'Strategic Life Planning & Leadership',
    icon: '💧',
    tier: 'PREMIUM',
    gradient: 'from-amber-500 to-orange-600',
    features: ['Executive Coaching', 'Decision Framework', 'Vision Planning']
  }
]

const GOALS = [
  'Improve physical health and fitness',
  'Master personal finances and investing',
  'Enhance mental wellness and reduce stress',
  'Boost productivity and time management',
  'Develop strategic thinking and leadership',
  'Support children\'s education and growth',
  'Achieve work-life balance',
  'Build better habits and routines'
]

const CHALLENGES = [
  'Lack of time for self-improvement',
  'Information overload and decision paralysis',
  'Difficulty staying motivated and consistent',
  'Financial stress and money management',
  'Work burnout and mental fatigue',
  'Balancing family and personal goals',
  'Health and fitness struggles',
  'Finding purpose and direction in life'
]

export default function SignupPage() {
  // ===== STATE MANAGEMENT =====
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<SignupForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreeMarketing: false,
    country: 'RO',
    dateOfBirth: ''
  })
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    goals: [],
    currentChallenges: [],
    ecosystemInterest: [],
    experience: 'beginner',
    motivation: '',
    timeCommitment: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  // ===== EFFECTS =====
  useEffect(() => {
    // Background particle animation
    const canvas = document.getElementById('quantum-canvas') as HTMLCanvasElement
    if (canvas) {
      initQuantumAnimation(canvas)
    }
  }, [])

  useEffect(() => {
    // Calculate password strength
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password))
    }
  }, [formData.password])

  // ===== UTILITY FUNCTIONS =====
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.match(/[a-z]/)) strength += 25
    if (password.match(/[A-Z]/)) strength += 25
    if (password.match(/[0-9]/)) strength += 25
    if (password.match(/[^A-Za-z0-9]/)) strength += 25
    return Math.min(strength, 100)
  }

  const initQuantumAnimation = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
    }> = []

    // Create quantum particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: ['#667eea', '#00ff88', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 6)]
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })
      
      requestAnimationFrame(animate)
    }
    
    animate()
  }

  // ===== EVENT HANDLERS =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (error) setError('')
  }

  const handleArrayToggle = (array: string[], value: string, field: keyof OnboardingData) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value]
    
    setOnboardingData(prev => ({
      ...prev,
      [field]: newArray
    }))
  }

  const validateStep = (stepNumber: number): boolean => {
    setError('')
    
    switch (stepNumber) {
      case 1:
        if (!formData.firstName.trim()) {
          setError('Prenumele este obligatoriu')
          return false
        }
        if (!formData.lastName.trim()) {
          setError('Numele este obligatoriu')
          return false
        }
        if (!formData.email.trim()) {
          setError('Email-ul este obligatoriu')
          return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Email-ul nu este valid')
          return false
        }
        if (!formData.dateOfBirth) {
          setError('Data nașterii este obligatorie')
          return false
        }
        const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()
        if (age < 13) {
          setError('Trebuie să ai cel puțin 13 ani pentru a te înregistra')
          return false
        }
        return true
        
      case 2:
        if (formData.password.length < 8) {
          setError('Parola trebuie să aibă cel puțin 8 caractere')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Parolele nu se potrivesc')
          return false
        }
        if (!formData.agreeTerms) {
          setError('Trebuie să accepți Termenii și Condițiile')
          return false
        }
        return true
        
      case 3:
        if (onboardingData.goals.length === 0) {
          setError('Selectează cel puțin un obiectiv')
          return false
        }
        if (onboardingData.currentChallenges.length === 0) {
          setError('Selectează cel puțin o provocare actuală')
          return false
        }
        return true
        
      case 4:
        if (onboardingData.ecosystemInterest.length === 0) {
          setError('Selectează cel puțin un ecosistem')
          return false
        }
        return true
        
      default:
        return true
    }
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSocialSignup = async (provider: 'google' | 'microsoft' | 'apple') => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'microsoft' ? 'azure' : provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error
    } catch (err: any) {
      setError(`Eroare la înregistrarea cu ${provider}`)
      setLoading(false)
    }
  }

  const handleCompleteSignup = async () => {
    if (!validateStep(4)) return
    
    setLoading(true)
    
    try {
      // Create account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            country: formData.country,
            date_of_birth: formData.dateOfBirth,
            onboarding_data: onboardingData
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Save detailed onboarding data
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            country_code: formData.country,
            date_of_birth: formData.dateOfBirth,
            onboarding_completed: true,
            onboarding_data: onboardingData
          })

        if (profileError) throw profileError

        // Grant ecosystem access
        const ecosystemAccess = onboardingData.ecosystemInterest.map(ecosystemId => ({
          user_id: authData.user!.id,
          ecosystem: ecosystemId,
          access_level: ECOSYSTEMS.find(e => e.id === ecosystemId)?.tier === 'FREE' ? 'free' : 'trial',
          first_accessed_at: new Date().toISOString()
        }))

        const { error: accessError } = await supabase
          .from('user_ecosystems')
          .insert(ecosystemAccess)

        if (accessError) throw accessError

        setStep(5) // Success step
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'A apărut o eroare la crearea contului')
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = () => {
    return ((step - 1) / 4) * 100
  }

  // ===== RENDER FUNCTIONS =====
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Bine ai venit în PorVerse</h1>
        <p className={styles.stepSubtitle}>
          Alătură-te celor peste 12,000 de utilizatori care își transformă viața cu AI
        </p>
      </div>

      <div className={styles.formCard}>
        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className={styles.form}>
          <div className={styles.nameRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>Prenume</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Alex"
                  required
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>Nume de familie</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Popescu"
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Adresa de email</label>
            <div className={styles.inputGroup}>
              <span className={styles.inputIcon}>📧</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="alex@email.com"
                required
              />
            </div>
          </div>

          <div className={styles.nameRow}>
            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth" className={styles.label}>Data nașterii</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>🎂</span>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="country" className={styles.label}>Țara</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputIcon}>🌍</span>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                >
                  <option value="RO">România</option>
                  <option value="US">Statele Unite</option>
                  <option value="GB">Marea Britanie</option>
                  <option value="DE">Germania</option>
                  <option value="FR">Franța</option>
                  <option value="IT">Italia</option>
                  <option value="ES">Spania</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="OTHER">Altă țară</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className={styles.primaryButton}>
            <span>Continuă</span>
            <span className={styles.buttonIcon}>→</span>
          </button>
        </form>

        <div className={styles.socialDivider}>
          <span className={styles.dividerLine}></span>
          <span className={styles.dividerText}>sau înregistrează-te cu</span>
          <span className={styles.dividerLine}></span>
        </div>

        <div className={styles.socialButtons}>
          <button 
            onClick={() => handleSocialSignup('google')}
            className={styles.socialButton}
            disabled={loading}
          >
            <img src="/icons/google.svg" alt="Google" width="20" height="20" />
            <span>Google</span>
          </button>
          
          <button 
            onClick={() => handleSocialSignup('microsoft')}
            className={styles.socialButton}
            disabled={loading}
          >
            <img src="/icons/microsoft.svg" alt="Microsoft" width="20" height="20" />
            <span>Microsoft</span>
          </button>
          
          <button 
            onClick={() => handleSocialSignup('apple')}
            className={styles.socialButton}
            disabled={loading}
          >
            <img src="/icons/apple.svg" alt="Apple" width="20" height="20" />
            <span>Apple</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Securizează-ți contul</h1>
        <p className={styles.stepSubtitle}>
          Creează o parolă puternică pentru a-ți proteja datele
        </p>
      </div>

      <div className={styles.formCard}>
        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Parolă</label>
            <div className={styles.inputGroup}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Minimum 8 caractere"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {formData.password && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div 
                    className={`${styles.strengthFill} ${styles[`strength${Math.ceil(passwordStrength / 25)}`]}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <span className={styles.strengthText}>
                  {passwordStrength < 50 ? 'Slabă' : passwordStrength < 75 ? 'Medie' : 'Puternică'}
                </span>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirmă parola</label>
            <div className={styles.inputGroup}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Repetă parola"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.passwordToggle}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                className={styles.checkbox}
                required
              />
              <span className={styles.checkboxText}>
                Accept <Link href="/terms" className={styles.link}>Termenii și Condițiile</Link> și{' '}
                <Link href="/privacy" className={styles.link}>Politica de Confidențialitate</Link>
              </span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="agreeMarketing"
                checked={formData.agreeMarketing}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                Vreau să primesc email-uri cu tips și noutăți PorVerse
              </span>
            </label>
          </div>

          <div className={styles.stepButtons}>
          <button 
            type="button"
            onClick={handlePrevStep}
            className={styles.secondaryButton}
          >
            <span>←</span>
            <span>Înapoi</span>
          </button>
          
          <button 
            type="button"
            onClick={handleCompleteSignup}
            className={styles.primaryButton}
            disabled={loading || onboardingData.ecosystemInterest.length === 0}
          >
            {loading ? (
              <div className={styles.loadingContent}>
                <div className={styles.spinner}></div>
                <span>Se creează contul...</span>
              </div>
            ) : (
              <>
                <span>🎉 Finalizează contul</span>
                <span className={styles.buttonIcon}>✨</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.successCard}>
        <div className={styles.successAnimation}>
          <div className={styles.successIcon}>🎉</div>
          <div className={styles.successRipple}></div>
          <div className={styles.successParticles}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.particle} style={{
                '--delay': `${i * 0.2}s`,
                '--angle': `${i * 45}deg`
              } as React.CSSProperties}></div>
            ))}
          </div>
        </div>
        
        <h1 className={styles.successTitle}>Bine ai venit în PorVerse!</h1>
        <p className={styles.successMessage}>
          Contul tău a fost creat cu succes. În câteva secunde vei fi redirecționat către dashboard-ul tău personalizat.
        </p>
        
        <div className={styles.successStats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{onboardingData.ecosystemInterest.length}</span>
            <span className={styles.statLabel}>Ecosisteme alese</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{onboardingData.goals.length}</span>
            <span className={styles.statLabel}>Obiective setate</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>∞</span>
            <span className={styles.statLabel}>Potențial deblocat</span>
          </div>
        </div>
        
        <div className={styles.nextSteps}>
          <h3>Ce urmează:</h3>
          <div className={styles.stepsList}>
            <div className={styles.nextStep}>
              <span className={styles.stepIcon}>📧</span>
              <span>Verifică-ți email-ul pentru confirmarea contului</span>
            </div>
            <div className={styles.nextStep}>
              <span className={styles.stepIcon}>🎯</span>
              <span>Completează profilul pentru recomandări personalizate</span>
            </div>
            <div className={styles.nextStep}>
              <span className={styles.stepIcon}>🚀</span>
              <span>Începe călătoria către cea mai bună versiune a ta</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ===== MAIN RENDER =====
  return (
    <div className={styles.signupPage}>
      {/* Quantum Background Animation */}
      <canvas id="quantum-canvas" className={styles.quantumCanvas}></canvas>
      
      {/* Background Gradient Overlay */}
      <div className={styles.backgroundOverlay}></div>
      
      {/* Progress Bar */}
      {step < 5 && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <span className={styles.progressText}>
            Pasul {step} din 4
          </span>
        </div>
      )}
      
      {/* Logo */}
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🌌</span>
          <span className={styles.logoText}>PorVerse</span>
        </Link>
      </div>
      
      {/* Main Content */}
      <main className={styles.mainContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </main>
      
      {/* Footer */}
      {step < 5 && (
        <footer className={styles.footer}>
          <p>
            Ai deja cont? <Link href="/auth/login" className={styles.footerLink}>Conectează-te</Link>
          </p>
        </footer>
      )}
    </div>
  )
}
            <button 
              type="button"
              onClick={handlePrevStep}
              className={styles.secondaryButton}
            >
              <span>←</span>
              <span>Înapoi</span>
            </button>
            
            <button type="submit" className={styles.primaryButton}>
              <span>Continuă</span>
              <span className={styles.buttonIcon}>→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Care sunt obiectivele tale?</h1>
        <p className={styles.stepSubtitle}>
          Selectează toate zonele în care vrei să îți îmbunătățești viața
        </p>
      </div>

      <div className={styles.formCard}>
        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.optionsGrid}>
          {GOALS.map((goal, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleArrayToggle(onboardingData.goals, goal, 'goals')}
              className={`${styles.optionCard} ${onboardingData.goals.includes(goal) ? styles.optionSelected : ''}`}
            >
              <span className={styles.optionText}>{goal}</span>
              <span className={styles.optionCheck}>
                {onboardingData.goals.includes(goal) ? '✓' : '+'}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.stepHeader} style={{ marginTop: '3rem' }}>
          <h2 className={styles.stepTitle} style={{ fontSize: '1.5rem' }}>
            Care sunt provocările tale actuale?
          </h2>
          <p className={styles.stepSubtitle}>
            Selectează obstacolele pe care vrei să le depășești
          </p>
        </div>

        <div className={styles.optionsGrid}>
          {CHALLENGES.map((challenge, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleArrayToggle(onboardingData.currentChallenges, challenge, 'currentChallenges')}
              className={`${styles.optionCard} ${onboardingData.currentChallenges.includes(challenge) ? styles.optionSelected : ''}`}
            >
              <span className={styles.optionText}>{challenge}</span>
              <span className={styles.optionCheck}>
                {onboardingData.currentChallenges.includes(challenge) ? '✓' : '+'}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.stepButtons}>
          <button 
            type="button"
            onClick={handlePrevStep}
            className={styles.secondaryButton}
          >
            <span>←</span>
            <span>Înapoi</span>
          </button>
          
          <button 
            type="button"
            onClick={handleNextStep}
            className={styles.primaryButton}
            disabled={onboardingData.goals.length === 0 || onboardingData.currentChallenges.length === 0}
          >
            <span>Continuă</span>
            <span className={styles.buttonIcon}>→</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h1 className={styles.stepTitle}>Alege-ți ecosistemele</h1>
        <p className={styles.stepSubtitle}>
          Selectează ecosistemele PorVerse cu care vrei să începi
        </p>
      </div>

      <div className={styles.formCard}>
        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.ecosystemGrid}>
          {ECOSYSTEMS.map((ecosystem) => (
            <button
              key={ecosystem.id}
              type="button"
              onClick={() => handleArrayToggle(onboardingData.ecosystemInterest, ecosystem.id, 'ecosystemInterest')}
              className={`${styles.ecosystemCard} ${onboardingData.ecosystemInterest.includes(ecosystem.id) ? styles.ecosystemSelected : ''}`}
            >
              <div className={styles.ecosystemHeader}>
                <span className={styles.ecosystemIcon}>{ecosystem.icon}</span>
                <span className={`${styles.ecosystemTier} ${ecosystem.tier === 'FREE' ? styles.tierFree : styles.tierPremium}`}>
                  {ecosystem.tier}
                </span>
              </div>
              
              <h3 className={styles.ecosystemName}>{ecosystem.name}</h3>
              <p className={styles.ecosystemDescription}>{ecosystem.description}</p>
              
              <div className={styles.ecosystemFeatures}>
                {ecosystem.features.map((feature, index) => (
                  <span key={index} className={styles.feature}>
                    <span className={styles.featureIcon}>✦</span>
                    <span>{feature}</span>
                  </span>
                ))}
              </div>
              
              {ecosystem.tier === 'PREMIUM' && (
                <div className={styles.premiumBadge}>
                  <span>Disponibil cu upgrade</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className={styles.trinityNotice}>
          <div className={styles.trinityIcon}>🔮</div>
          <div className={styles.trinityContent}>
            <h3>Deblochează Quantum Vault</h3>
            <p>Alege orice 3 ecosisteme premium și deblochează funcții exclusive de AI avansat!</p>
          </div>
        </div>

        <div className={styles.stepButtons}></div>