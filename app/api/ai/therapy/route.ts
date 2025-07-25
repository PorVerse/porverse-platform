// app/api/ai/therapy/route.ts
import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/utils/api-wrapper'
import { AITherapistService } from '@/lib/services/ai-therapist-service'
import { ErrorHandler } from '@/lib/utils/error-handler'

const therapistService = new AITherapistService()

export const POST = withAuth(async ({ req, user }) => {
  try {
    const { 
      message, 
      session_id, 
      mood_score, 
      anxiety_level, 
      preferred_approach = 'cbt' 
    } = await req.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return { error: 'Message is required' }
    }

    if (message.length > 2000) {
      return { error: 'Message too long (max 2000 characters)' }
    }

    // Process therapy message
    const result = await therapistService.processTherapyMessage(
      user.id,
      message.trim(),
      session_id,
      {
        mood_score,
        anxiety_level,
        preferred_approach
      }
    )

    // Log therapy interaction
    await ErrorHandler.logError({
      error_type: 'therapy_interaction',
      error_message: 'AI therapy session',
      context: {
        user_id: user.id,
        session_id: result.session_id,
        crisis_detected: !!result.crisis_intervention,
        techniques_used: result.techniques_used
      },
      severity: result.crisis_intervention ? 'critical' : 'low'
    })

    return {
      success: true,
      response: result.response,
      session_id: result.session_id,
      techniques_used: result.techniques_used,
      recommendations: result.recommendations,
      crisis_intervention: result.crisis_intervention
    }

  } catch (error: any) {
    await ErrorHandler.logError(error, {
      endpoint: '/api/ai/therapy',
      user_id: user.id
    })
    
    return { error: 'Failed to process therapy message' }
  }
})

// app/api/ai/mood-insights/route.ts
import { withAuth } from '@/lib/utils/api-wrapper'
import { AITherapistService } from '@/lib/services/ai-therapist-service'

const therapistService = new AITherapistService()

export const GET = withAuth(async ({ req, user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    if (days < 1 || days > 365) {
      return { error: 'Days must be between 1 and 365' }
    }

    const insights = await therapistService.getMoodInsights(user.id, days)
    
    return {
      success: true,
      insights: insights || {
        message: 'No mood data available yet. Start tracking your mood to see insights!'
      }
    }

  } catch (error: any) {
    await ErrorHandler.logError(error, {
      endpoint: '/api/ai/mood-insights',
      user_id: user.id
    })
    
    return { error: 'Failed to get mood insights' }
  }
})

// app/api/ai/mood-entry/route.ts
import { withAuth } from '@/lib/utils/api-wrapper'

export const POST = withAuth(async ({ req, user, supabase }) => {
  try {
    const {
      mood_score,
      emotions = [],
      triggers = [],
      activities = [],
      thoughts,
      physical_symptoms = [],
      sleep_quality,
      anxiety_level,
      stress_level
    } = await req.json()

    if (!mood_score || mood_score < 1 || mood_score > 10) {
      return { error: 'Mood score must be between 1 and 10' }
    }

    // Save mood entry
    const { data, error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.id,
        mood_score,
        emotions,
        triggers,
        activities,
        thoughts,
        physical_symptoms,
        sleep_quality,
        anxiety_level,
        stress_level
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      mood_entry: data,
      message: 'Mood entry saved successfully'
    }

  } catch (error: any) {
    await ErrorHandler.logError(error, {
      endpoint: '/api/ai/mood-entry',
      user_id: user.id
    })
    
    return { error: 'Failed to save mood entry' }
  }
})

// components/therapy/AITherapistChat.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, AlertTriangle, Heart, Brain, Shield } from 'lucide-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { toast } from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  techniques?: string[]
  crisis_intervention?: any
}

export default function AITherapistChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Bună! Sunt aici să te ascult și să te sprijin. Acest este un spațiu sigur unde poți să-ți exprimi gândurile și sentimentele fără să fii judecat.

💜 **Cum funcționează:**
• Poți să-mi povestești orice te preocupă
• Îți voi oferi tehnici și strategii terapeutice
• Conversația este confidențială și securizată
• Pentru situații de criză, vei primi resurse imediate de ajutor

**Important:** Sunt un AI terapeut și nu înlocuiesc terapia profesională. Pentru probleme grave, te încurajez să cauți ajutor specializat.

Cum te simți astăzi? Cu ce te pot ajuta?`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const [moodScore, setMoodScore] = useState<number>()
  const [anxietyLevel, setAnxietyLevel] = useState<number>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { handleAsyncOperation } = useErrorHandler()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const result = await handleAsyncOperation(
      async () => {
        const response = await fetch('/api/ai/therapy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.content,
            session_id: sessionId,
            mood_score: moodScore,
            anxiety_level: anxietyLevel
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to get response')
        }

        return await response.json()
      },
      {
        errorMessage: 'Eroare la comunicarea cu AI Therapist'
      }
    )

    setLoading(false)

    if (result?.success) {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        techniques: result.techniques_used,
        crisis_intervention: result.crisis_intervention
      }

      setMessages(prev => [...prev, assistantMessage])
      setSessionId(result.session_id)

      // Handle crisis intervention
      if (result.crisis_intervention) {
        handleCrisisIntervention(result.crisis_intervention)
      }

      // Show recommendations
      if (result.recommendations?.length > 0) {
        setTimeout(() => {
          toast.success(`Recomandări: ${result.recommendations.join(', ')}`, {
            duration: 5000
          })
        }, 1000)
      }
    }
  }

  const handleCrisisIntervention = (intervention: any) => {
    if (intervention.level === 'critical' || intervention.level === 'high') {
      toast.error('Detectat risc crescut - vezi resursele de criză în mesaj', {
        duration: 10000,
        icon: '🆘'
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Therapist</h3>
            <p className="text-white/60 text-sm">Suport emoțional și tehnici terapeutice</p>
          </div>
        </div>
      </div>

      {/* Mood & Anxiety Input */}
      <div className="p-4 bg-white/5 border-b border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Mood Score (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodScore || 5}
              onChange={(e) => setMoodScore(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Foarte trist</span>
              <span className="font-semibold">{moodScore || 5}</span>
              <span>Foarte fericit</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Anxiety Level (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={anxietyLevel || 5}
              onChange={(e) => setAnxietyLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Foarte calm</span>
              <span className="font-semibold">{anxietyLevel || 5}</span>
              <span>Foarte anxios</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              {message.crisis_intervention && (
                <div className="mb-3 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-medium text-red-300">
                    Suport de criză activat
                  </span>
                </div>
              )}
              
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.techniques && message.techniques.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center space-x-2 text-xs text-white/60">
                    <Heart className="w-4 h-4" />
                    <span>Tehnici: {message.techniques.join(', ')}</span>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-white/50 mt-2">
                {message.timestamp.toLocaleTimeString('ro-RO', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white p-4 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-white/70 ml-2">AI Therapist scrie...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrie mesajul tău aici..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
            maxLength={2000}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-white/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Conversație criptată</span>
            </div>
            <span>•</span>
            <span>Confidențial și sigur</span>
          </div>
          <span>{input.length}/2000</span>
        </div>
      </div>
    </div>
  )
}

// 🧪 TESTING INSTRUCTIONS
/*
===========================================
TESTARE COMPLETĂ PAYPAL + AI THERAPIST
===========================================

1. SETUP INIȚIAL:
-------------------
# Instalează dependencies
npm install

# Verifică .env.local (trebuie să conțină):
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret

OPENAI_API_KEY=your_openai_api_key

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rulează aplicația
npm run dev

2. SETUP DATABASE:
------------------
# Mergi la Supabase Dashboard > SQL Editor
# Copiază și rulează SQL schema din middleware.ts
# Verifică că toate tabelele s-au creat

3. TESTARE PAYPAL PAYMENT FLOW:
-------------------------------
# Test 1: Verifică planurile
curl http://localhost:3000/api/payments/plans

# Test 2: Înregistrează-te în app
- Mergi la http://localhost:3000/auth/signup
- Completează înregistrarea
- Verifică că user_profile s-a creat în DB

# Test 3: Testează PayPal checkout
- Mergi la http://localhost:3000/pricing
- Selectează un plan
- Click pe PayPal button
- Trebuie să te redirecteze la PayPal Sandbox
- Completează plata cu PayPal test account
- Verifică redirect înapoi la /dashboard?welcome=true

# Test 4: Verifică subscription în DB
- Check user_subscriptions table
- Check user_ecosystems table - access_level = 'premium'
- Check payment_logs table

4. TESTARE AI THERAPIST:
------------------------
# Test 1: Accesează PorWell (doar cu premium)
- Mergi la /dashboard/por-well
- Deschide AI Therapist
- Scrie un mesaj normal: "Mă simt obosit astăzi"
- Verifică răspuns terapeutic

# Test 2: Test crisis detection
- Scrie: "Nu mai vreau să trăiesc"
- Trebuie să primești:
  * Resurse de criză imediate
  * Numere de telefon
  * Acțiuni urgente
- Check error_logs table - severity: 'critical'

# Test 3: Test mood tracking
- Setează mood score = 3, anxiety = 8
- Scrie despre anxietate
- Verifică că răspunsul conține tehnici de calm

# Test 4: Verifică session persistence
- Reîmprospătează pagina
- Continuă conversația
- Mesajele anterioare trebuie să rămână

5. TESTARE MIDDLEWARE & SECURITY:
---------------------------------
# Test 1: Protected routes
curl http://localhost:3000/dashboard
# Trebuie să redirecteze la /auth/login

# Test 2: Rate limiting
# Fă 70+ requests rapid la orice endpoint
# După 60 requests/minut trebuie să primești 429

# Test 3: Ecosystem access
- Login cu cont free
- Încearcă să accesezi /dashboard/por-well
- Trebuie să redirecteze la /pricing?upgrade=por-well

6. TESTARE ERROR HANDLING:
--------------------------
# Test 1: Network errors
- Oprește internetul
- Încearcă să faci o acțiune
- Verifică toast-ul de eroare user-friendly

# Test 2: API errors
- Modifică temporar OPENAI_API_KEY să fie invalid
- Încearcă AI Therapist
- Verifică error logging în Supabase

# Test 3: Database errors
- Oprește Supabase temporar (dacă posibil)
- Încearcă diverse acțiuni
- Verifică fallback-urile

7. VERIFICĂRI FINALE:
--------------------
✅ PayPal payments funcționează
✅ Stripe payments funcționează  
✅ AI Therapist răspunde correct
✅ Crisis detection funcționează
✅ Database schema complet
✅ Error handling robusts
✅ Middleware security activ
✅ Rate limiting funcționează
✅ Session management OK
✅ Ecosystem access control OK

8. DEBUGGING TIPS:
------------------
# Verifică logs în browser console
# Verifică Network tab pentru API calls
# Check Supabase logs pentru database errors
# Verifică .env.local pentru missing variables

# Troubleshooting PayPal:
- Sandbox vs Production URLs
- Verifică PayPal Developer Dashboard
- Check webhook URL configuration

# Troubleshooting AI:
- Verifică OpenAI API quota
- Check rate limits OpenAI
- Verifică prompt engineering

9. NEXT STEPS DUPĂ TESTARE:
---------------------------
Dacă toate testele trec:
1. Deploy pe Vercel/Netlify
2. Setup production PayPal webhooks
3. Configure production environment variables
4. Setup monitoring și alerting
5. Add more advanced AI features
6. Implement remaining ecosystems

📧 CONTACT SUPPORT:
Dacă întâmpini probleme:
- Check GitHub issues
- Review documentation
- Test individual components
- Verify environment setup

Success rate target: 95%+ pentru toate testele
Performance target: <2s pentru toate pagini
Error rate target: <1% pentru production

READY TO LAUNCH! 🚀
*/