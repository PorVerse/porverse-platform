// app/auth/login/page.tsx - CU CSS MODULES
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import styles from './login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github' | 'discord') => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (err: any) {
      setError(`Eroare la autentificarea cu ${provider}`)
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.gradientOverlay}></div>
        <div className={styles.particlesContainer}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        {/* Left Side - Login Form */}
        <div className={styles.loginSection}>
          <div className={styles.loginContainer}>
            {/* Header */}
            <div className={styles.header}>
              <Link href="/" className={styles.logo}>
                <span className={styles.logoIcon}>🧠</span>
                <span className={styles.logoText}>PorVerse</span>
              </Link>
              
              <h1 className={styles.title}>Bine ai revenit!</h1>
              <p className={styles.subtitle}>
                Continuă-ți transformarea cu PorVerse
              </p>
            </div>

            {/* Login Form */}
            <div className={styles.formCard}>
              {error && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <span className={styles.errorText}>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>📧</span>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.input}
                      placeholder="adresa@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Parolă
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.input}
                      placeholder="Introdu parola"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.togglePassword}
                      disabled={loading}
                    >
                      <span>{showPassword ? '🙈' : '👁️'}</span>
                    </button>
                  </div>
                </div>

                <div className={styles.formOptions}>
                  <label className={styles.rememberMe}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      disabled={loading}
                    />
                    <span className={styles.checkboxText}>Ține-mă conectat</span>
                  </label>

                  <Link href="/auth/forgot-password" className={styles.forgotPassword}>
                    Am uitat parola
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className={`${styles.submitButton} ${loading ? styles.submitButtonLoading : ''}`}
                >
                  {loading ? (
                    <div className={styles.loadingContent}>
                      <div className={styles.spinner}></div>
                      <span>Se conectează...</span>
                    </div>
                  ) : (
                    '🚀 Conectează-te'
                  )}
                </button>
              </form>

              {/* Social Login */}
              <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <span className={styles.dividerText}>sau continuă cu</span>
                <div className={styles.dividerLine}></div>
              </div>

              <div className={styles.socialButtons}>
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <div className={styles.socialButtonContent}>
                    <span className={styles.socialIcon}>🔍</span>
                    <span className={styles.socialText}>Google</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleSocialLogin('github')}
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <div className={styles.socialButtonContent}>
                    <span className={styles.socialIcon}>🐙</span>
                    <span className={styles.socialText}>GitHub</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleSocialLogin('discord')}
                  disabled={loading}
                  className={styles.socialButton}
                >
                  <div className={styles.socialButtonContent}>
                    <span className={styles.socialIcon}>💬</span>
                    <span className={styles.socialText}>Discord</span>
                  </div>
                </button>
              </div>

              <div className={styles.signupLink}>
                <p className={styles.signupText}>
                  Nu ai cont încă?{' '}
                  <Link href="/auth/signup" className={styles.signupLinkText}>
                    Creează cont gratuit
                  </Link>
                </p>
              </div>
            </div>

            <div className={styles.backLink}>
              <Link href="/" className={styles.backLinkText}>
                ← Înapoi la homepage
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Features Preview */}
        <div className={styles.previewSection}>
          <div className={styles.previewContainer}>
            <div className={styles.previewCard}>
              <h3 className={styles.previewTitle}>
                Ecosistemele tale te așteaptă
              </h3>
              
              <div className={styles.ecosystemsList}>
                <div className={styles.ecosystemItem}>
                  <span className={styles.ecosystemIcon}>🌿</span>
                  <div className={styles.ecosystemInfo}>
                    <div className={styles.ecosystemName}>PorHealth</div>
                    <div className={styles.ecosystemDescription}>AI nutrition planner și workout optimizer</div>
                  </div>
                  <span className={styles.badgeFree}>FREE</span>
                </div>
                
                <div className={styles.ecosystemItem}>
                  <span className={styles.ecosystemIcon}>👶</span>
                  <div className={styles.ecosystemInfo}>
                    <div className={styles.ecosystemName}>PorKids</div>
                    <div className={styles.ecosystemDescription}>Homework scanner și family dashboard</div>
                  </div>
                  <span className={styles.badgeFree}>FREE</span>
                </div>
                
                <div className={styles.ecosystemItem}>
                  <span className={styles.ecosystemIcon}>🧠</span>
                  <div className={styles.ecosystemInfo}>
                    <div className={styles.ecosystemName}>PorMind</div>
                    <div className={styles.ecosystemDescription}>Financial planning și investment AI</div>
                  </div>
                  <span className={styles.badgePremium}>PREMIUM</span>
                </div>

                <div className={styles.ecosystemItem}>
                  <span className={styles.ecosystemIcon}>🌌</span>
                  <div className={styles.ecosystemInfo}>
                    <div className={styles.ecosystemName}>Quantum Vault</div>
                    <div className={styles.ecosystemDescription}>Future Self Generator & Advanced AI</div>
                  </div>
                  <span className={styles.badgeQuantum}>TRINITY</span>
                </div>
              </div>
              
              <div className={styles.upgradePromo}>
                <p className={styles.upgradeText}>Upgrade pentru acces complet la toate ecosistemele</p>
                <Link href="/pricing" className={styles.upgradeButton}>
                  <span>🎯</span>
                  <span>Vezi prețurile</span>
                </Link>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                <span className={styles.testimonialIcon}>👨‍💻</span>
                <div className={styles.testimonialText}>
                  <div className={styles.testimonialQuote}>
                    "PorVerse mi-a transformat complet rutina zilnică. În 2 luni am optimizat sănătatea și productivitatea."
                  </div>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorName}>Alex Popescu</div>
                    <div className={styles.authorTitle}>Software Engineer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}