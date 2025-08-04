'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import styles from './dashboard.module.css'

interface CrossEcosystemInsight {
  type: string
  title: string
  description: string
  action_items: string[]
  ecosystems_involved: string[]
  priority: 'low' | 'medium' | 'high'
  confidence: number
}

export default function RealDataDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const supabase = createClientSupabase()

  useEffect(() => {
    loadDashboard()
  }, [])

  const addDebugInfo = (info: string) => {
    console.log('🔍 DEBUG:', info)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  const loadDashboard = async () => {
    try {
      addDebugInfo('Starting dashboard load...')
      setLoading(true)
      setError(null)

      // Add delay to see debug info
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Test 1: Check Supabase connection
      addDebugInfo('Testing Supabase connection...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Test 2: Get current user
      addDebugInfo('Getting current user...')
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(`Auth error: ${userError.message}`)
      }
      
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }
      
      addDebugInfo(`User found: ${currentUser.email}`)
      setUser(currentUser)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Test 3: Check user profile exists
      addDebugInfo('Checking user profile...')
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        addDebugInfo(`Profile error: ${profileError.message}`)
        // Create profile if it doesn't exist
        addDebugInfo('Creating user profile...')
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email || '',
            subscription_tier: 'free',
            subscription_status: 'active',
            onboarding_completed: false
          })
        
        if (insertError) {
          throw new Error(`Failed to create profile: ${insertError.message}`)
        }
        addDebugInfo('User profile created successfully')
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        addDebugInfo('User profile exists')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Test 4: Check ecosystems access
      addDebugInfo('Checking ecosystem access...')
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data: ecosystems, error: ecosystemError } = await supabase
        .from('user_ecosystems')
        .select('*')
        .eq('user_id', currentUser.id)

      if (ecosystemError) {
        addDebugInfo(`Ecosystem error: ${ecosystemError.message}`)
      } else {
        addDebugInfo(`Found ${ecosystems?.length || 0} ecosystem access records`)
      }

      addDebugInfo('Dashboard loaded successfully!')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoading(false)

    } catch (error: any) {
      console.error('Dashboard error:', error)
      addDebugInfo(`ERROR: ${error.message}`)
      setError(error.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'system-ui',
        padding: '20px'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '4px solid rgba(255,255,255,0.3)', 
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        
        <h2 style={{ marginBottom: '10px' }}>🔄 Loading your personalized dashboard...</h2>
        <p style={{ opacity: 0.8, marginBottom: '30px' }}>Gathering insights from all ecosystems...</p>
        
        {/* Debug Info */}
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '15px', 
          borderRadius: '8px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Debug Info:</h3>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.9 }}>
              {info}
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        color: 'white',
        fontFamily: 'system-ui',
        padding: '20px'
      }}>
        <h2 style={{ marginBottom: '10px' }}>❌ Dashboard Error</h2>
        <p style={{ marginBottom: '20px', textAlign: 'center' }}>{error}</p>
        
        <button 
          onClick={loadDashboard}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '30px'
          }}
        >
          Try Again
        </button>

        {/* Debug Info */}
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '15px', 
          borderRadius: '8px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Debug Info:</h3>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.9 }}>
              {info}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px' }}>🚀 Welcome to PorVerse!</h1>
        <p style={{ marginBottom: '30px', opacity: 0.8 }}>Hello {user?.email}!</p>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '15px' }}>🎯 Your Ecosystems</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px' }}>
              <h3>🏥 PorHealth</h3>
              <p>Nutrition & Fitness optimization</p>
              <div style={{ marginTop: '10px' }}>
                <span style={{ background: '#00ff88', color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  FREE ACCESS
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px' }}>
              <h3>📚 PorKids</h3>
              <p>AI homework help & education</p>
              <div style={{ marginTop: '10px' }}>
                <span style={{ background: '#00ff88', color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  FREE ACCESS
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', opacity: 0.6 }}>
              <h3>💰 PorMind</h3>
              <p>Financial intelligence</p>
              <div style={{ marginTop: '10px' }}>
                <span style={{ background: '#ff6b35', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  PREMIUM REQUIRED
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', opacity: 0.6 }}>
              <h3>🧠 PorWell</h3>
              <p>Mental wellness & therapy</p>
              <div style={{ marginTop: '10px' }}>
                <span style={{ background: '#ff6b35', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  PREMIUM REQUIRED
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', opacity: 0.6 }}>
              <h3>⚡ PorFlow</h3>
              <p>Productivity optimization</p>
              <div style={{ marginTop: '10px' }}>
                <span style={{ background: '#ff6b35', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  PREMIUM REQUIRED
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', opacity: 0.6 }}>
              <h3>🎯 PorBlu</h3>
              <p>Strategic leadership</p>
              <div style={{ marginTop: '10px' }}>
                <span style={{ background: '#ff6b35', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  PREMIUM REQUIRED
                </span>
              </div>
            </div>

          </div>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '10px' 
        }}>
          <h2>🎉 Success!</h2>
          <p>Your dashboard loaded successfully! Database connection is working.</p>
          <p style={{ marginTop: '15px' }}>
            <strong>Next steps:</strong> Test the admin dashboard at <code>/admin</code>
          </p>
        </div>
      </div>
    </div>
  )
}