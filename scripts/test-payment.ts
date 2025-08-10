// scripts/test-payments.ts
import { PayPalService } from '../lib/services/paypal-service'
import { StripePaymentService } from '// lib/stripe/stripe-service.ts'

async function testPayments() {
  console.log('🧪 Testing Payment Systems...\n')

  // Test PayPal Service
  console.log('1. Testing PayPal Service...')
  try {
    const paypalService = new PayPalService()
    const plans = paypalService.getPlans()
    
    console.log('✅ PayPal plans loaded:', plans.length)
    
    // Test plan creation (commented out to avoid creating real plans)
    // const planId = await paypalService.createSubscriptionPlan({
    //   name: 'Test Plan',
    //   description: 'Test plan for development',
    //   price: 1.00,
    //   currency: 'RON',
    //   interval: 'month'
    // })
    // console.log('✅ Test plan created:', planId)
    
  } catch (error) {
    console.log('❌ PayPal test failed:', error.message)
  }

  // Test Stripe Service
  console.log('\n2. Testing Stripe Service...')
  try {
    const stripeService = new StripePaymentService()
    // Add Stripe tests here when implemented
    console.log('✅ Stripe service initialized')
    
  } catch (error) {
    console.log('❌ Stripe test failed:', error.message)
  }

  // Test Database Connection
  console.log('\n3. Testing Database Connection...')
  try {
    const { createServerSupabase } = await import('../lib/supabase')
    const supabase = createServerSupabase()
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('id, name')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Database connection working')
    console.log('✅ Subscription plans table accessible')
    
  } catch (error) {
    console.log('❌ Database test failed:', error.message)
  }

  console.log('\n🎉 Payment testing completed!')
}

// Run tests
if (require.main === module) {
  testPayments().catch(console.error)
}

// lib/services/ai-therapist-service.ts
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

export interface TherapySession {
  id: string
  userId: string
  messages: TherapyMessage[]
  mood_before?: number
  mood_after?: number
  techniques_used: string[]
  crisis_detected: boolean
  session_summary?: string
}

export interface TherapyMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  mood_score?: number
  anxiety_level?: number
  techniques?: string[]
}

export interface CrisisIntervention {
  level: 'low' | 'medium' | 'high' | 'critical'
  resources: CrisisResource[]
  immediate_actions: string[]
  follow_up_required: boolean
}

export interface CrisisResource {
  name: string
  phone: string
  description: string
  available_24_7: boolean
  country: string
}

export class AITherapistService {
  private openai: OpenAI
  private crisisKeywords: string[]
  private therapeuticApproaches: Record<string, string>

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    })

    this.crisisKeywords = [
      'vreau să mor', 'să mă sinucid', 'să mă omor', 'să dispăr',
      'nu mai vreau să trăiesc', 'să mă ucid', 'să îmi fac rău',
      'să mă tai', 'să iau pastile', 'să mă arunc',
      'nu mai pot', 'totul e fără sens', 'nimeni nu mă iubește',
      'sunt o povară', 'ar fi mai bine fără mine'
    ]

    this.therapeuticApproaches = {
      cbt: 'Cognitive Behavioral Therapy - focus on identifying and changing negative thought patterns',
      dbt: 'Dialectical Behavior Therapy - focus on emotional regulation and distress tolerance',
      mindfulness: 'Mindfulness-based therapy - focus on present moment awareness',
      solution_focused: 'Solution-Focused Brief Therapy - focus on solutions rather than problems',
      humanistic: 'Humanistic approach - focus on self-acceptance and personal growth'
    }
  }

  // ================================
  // MAIN THERAPY SESSION
  // ================================
  async processTherapyMessage(
    userId: string,
    message: string,
    sessionId?: string,
    context?: {
      mood_score?: number
      anxiety_level?: number
      preferred_approach?: keyof typeof this.therapeuticApproaches
    }
  ): Promise<{
    response: string
    crisis_intervention?: CrisisIntervention
    techniques_used: string[]
    session_id: string
    recommendations: string[]
  }> {
    // 1. Crisis detection
    const crisisCheck = await this.detectCrisis(message, context)
    
    if (crisisCheck.level === 'critical' || crisisCheck.level === 'high') {
      return {
        response: await this.generateCrisisResponse(crisisCheck),
        crisis_intervention: crisisCheck,
        techniques_used: ['crisis_intervention'],
        session_id: sessionId || crypto.randomUUID(),
        recommendations: crisisCheck.immediate_actions
      }
    }

    // 2. Get or create session
    const currentSessionId = sessionId || crypto.randomUUID()
    const sessionHistory = await this.getSessionHistory(userId, currentSessionId)

    // 3. Generate therapeutic response
    const therapeuticResponse = await this.generateTherapeuticResponse(
      message,
      sessionHistory,
      context
    )

    // 4. Save message and response
    await this.saveTherapyInteraction({
      sessionId: currentSessionId,
      userId,
      userMessage: message,
      assistantResponse: therapeuticResponse.response,
      techniques: therapeuticResponse.techniques_used,
      mood_score: context?.mood_score,
      anxiety_level: context?.anxiety_level,
      crisis_detected: crisisCheck.level !== 'low'
    })

    // 5. Generate recommendations
    const recommendations = await this.generateRecommendations(
      userId,
      therapeuticResponse,
      context
    )

    return {
      response: therapeuticResponse.response,
      crisis_intervention: crisisCheck.level !== 'low' ? crisisCheck : undefined,
      techniques_used: therapeuticResponse.techniques_used,
      session_id: currentSessionId,
      recommendations
    }
  }

  // ================================
  // CRISIS DETECTION & INTERVENTION
  // ================================
  private async detectCrisis(
    message: string,
    context?: any
  ): Promise<CrisisIntervention> {
    const lowerMessage = message.toLowerCase()
    
    // Check for direct crisis keywords
    const containsCrisisWords = this.crisisKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    )

    // AI-powered crisis detection
    const aiCrisisCheck = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a crisis detection AI. Analyze the message for signs of:
          1. Suicidal ideation
          2. Self-harm intentions  
          3. Severe depression
          4. Psychotic episodes
          5. Immediate danger to self or others
          
          Return a JSON object with:
          - risk_level: "low", "medium", "high", or "critical"
          - indicators: array of detected risk factors
          - confidence: 0-100
          
          Be conservative - better to over-detect than miss a crisis.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.1,
      max_tokens: 200
    })

    let aiResult
    try {
      aiResult = JSON.parse(aiCrisisCheck.choices[0].message.content || '{}')
    } catch {
      aiResult = { risk_level: 'low', indicators: [], confidence: 0 }
    }

    // Determine final crisis level
    let level: CrisisIntervention['level'] = 'low'
    
    if (containsCrisisWords || aiResult.risk_level === 'critical') {
      level = 'critical'
    } else if (aiResult.risk_level === 'high' || (context?.mood_score && context.mood_score <= 2)) {
      level = 'high'
    } else if (aiResult.risk_level === 'medium' || (context?.anxiety_level && context.anxiety_level >= 8)) {
      level = 'medium'
    }

    return {
      level,
      resources: await this.getCrisisResources('RO'),
      immediate_actions: this.getImmediateActions(level),
      follow_up_required: level !== 'low'
    }
  }

  private async generateCrisisResponse(crisis: CrisisIntervention): Promise<string> {
    const resources = crisis.resources.map(r => `${r.name}: ${r.phone}`).join('\n')
    
    return `Înțeleg că treci printr-un moment foarte dificil și îmi pare foarte rău că te simți așa. Sentimentele tale sunt valide și importante.

🆘 **RESURSE IMEDIATE DE AJUTOR:**

**Telefonul de Urgență pentru Sănătate Mintală:** 
📞 0800 801 200 (gratuit, 24/7)

**Serviciul de Intervenție în Criză:**
📞 021 9466 (București, 24/7)

**Telefonul Prieteniei:**
📞 0800 800 628 (gratuit, 24/7)

${resources}

💜 **ACȚIUNI IMEDIATE:**
• Contactează imediat unul dintre numerele de mai sus
• Dacă ești în pericol imediat, sună la 112
• Nu rămâne singur/ă - contactează pe cineva de încredere
• Îndepărtează-te de orice mijloace care ar putea fi periculoase

🤝 **ȘTIU CĂ:**
• Nu ești singur/ă în asta
• Există ajutor profesional disponibil
• Aceste sentimente sunt temporare, chiar dacă acum par permanente
• Viața ta are valoare și merită să fie trăită

Te rog să contactezi imediat un serviciu de criză. Sunt aici pentru tine, dar în acest moment ai nevoie de ajutor specializat și imediat.

Vrei să vorbim despre ce anume te face să te simți așa?`
  }

  private async getCrisisResources(country: string = 'RO'): Promise<CrisisResource[]> {
    // Romanian crisis resources
    return [
      {
        name: 'Telefonul de Urgență pentru Sănătate Mintală',
        phone: '0800 801 200',
        description: 'Serviciu național gratuit, disponibil 24/7',
        available_24_7: true,
        country: 'RO'
      },
      {
        name: 'Serviciul de Intervenție în Criză București',
        phone: '021 9466',
        description: 'Intervenție în criză și consiliere',
        available_24_7: true,
        country: 'RO'
      },
      {
        name: 'Telefonul Prieteniei',
        phone: '0800 800 628',
        description: 'Consiliere și suport emoțional',
        available_24_7: true,
        country: 'RO'
      },
      {
        name: 'ALIAT - Centrul pentru Sănătate Mintală',
        phone: '0374 456 420',
        description: 'Consiliere psihologică specializată',
        available_24_7: false,
        country: 'RO'
      }
    ]
  }

  private getImmediateActions(level: CrisisIntervention['level']): string[] {
    switch (level) {
      case 'critical':
        return [
          'Contactează imediat 112 sau mergi la cea mai apropiată urgență',
          'Nu rămâne singur/ă - sună pe cineva să vină la tine',
          'Îndepărtează orice obiecte periculoase',
          'Contactează Telefonul de Urgență: 0800 801 200'
        ]
      
      case 'high':
        return [
          'Contactează Telefonul de Urgență: 0800 801 200',
          'Sună pe cineva de încredere să te însoțească',
          'Programează urgent o întâlnire cu un psiholog/psihiatru',
          'Evită să fii singur/ă în următoarele ore'
        ]
      
      case 'medium':
        return [
          'Contactează Telefonul Prieteniei: 0800 800 628',
          'Vorbește cu o persoană de încredere astăzi',
          'Programează o întâlnire cu un specialist în zilele următoare',
          'Practică tehnici de respirație și grounding'
        ]
      
      default:
        return [
          'Continuă să monitorizezi cum te simți',
          'Practică tehnici de relaxare',
          'Menține rutina zilnică',
          'Ia în considerare o discuție cu un specialist'
        ]
    }
  }

  // ================================
  // THERAPEUTIC RESPONSE GENERATION
  // ================================
  private async generateTherapeuticResponse(
    message: string,
    sessionHistory: TherapyMessage[],
    context?: any
  ): Promise<{
    response: string
    techniques_used: string[]
  }> {
    const approach = context?.preferred_approach || 'cbt'
    const systemPrompt = this.getSystemPrompt(approach, context)
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...sessionHistory.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ]

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 800,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const assistantResponse = response.choices[0].message.content || ''
    
    // Extract techniques used
    const techniques = await this.extractTechniques(assistantResponse, approach)
    
    return {
      response: assistantResponse,
      techniques_used: techniques
    }
  }

  private getSystemPrompt(approach: string, context?: any): string {
    const basePrompt = `Tu ești un terapeut AI empatic și profesionist, specializat în ${this.therapeuticApproaches[approach]}.

REGULI IMPORTANTE:
1. Fii întotdeauna empatic, warm și non-judgmental
2. Folosește tehnici din ${approach.toUpperCase()}
3. Nu oferi sfaturi medicale sau diagnostice
4. Încurajează căutarea ajutorului profesional pentru probleme grave
5. Păstrează confidențialitatea și respectă limitele
6. Folosește un ton conversațional, natural, în română
7. Pune întrebări deschise pentru a încuraja reflecția
8. Validează emoțiile și experiențele utilizatorului

CONTEXT CURENT:
${context?.mood_score ? `Mood score: ${context.mood_score}/10` : ''}
${context?.anxiety_level ? `Anxiety level: ${context.anxiety_level}/10` : ''}

TEHNICI RECOMANDATE PENTRU ${approach.toUpperCase()}:
${this.getTechniquesForApproach(approach)}

Răspunde într-un mod caring, professional și terapeutic. Folosește tehnicile specifice abordării și încurajează self-reflection.`

    return basePrompt
  }

  private getTechniquesForApproach(approach: string): string {
    const techniques = {
      cbt: `
      • Identificarea gândurilor negative automate
      • Challenguirea distorsiunilor cognitive
      • Tehnici de reevaluare cognitivă
      • Monitoring-ul gândurilor și emoțiilor
      • Homework-uri comportamentale`,
      
      dbt: `
      • Tehnici de distress tolerance
      • Skill-uri de emoțional regulation
      • Mindfulness exercises
      • Interpersonal effectiveness
      • Grounding techniques`,
      
      mindfulness: `
      • Present moment awareness
      • Body scan meditation
      • Breathing exercises
      • Mindful observation
      • Non-judgmental awareness`,
      
      solution_focused: `
      • Focus pe soluții, nu pe probleme
      • Scaling questions (1-10)
      • Exception finding
      • Goal setting
      • Future-focused questions`,
      
      humanistic: `
      • Unconditional positive regard
      • Active listening și reflection
      • Focusing pe self-acceptance
      • Exploring personal values
      • Encouraging self-discovery`
    }
    
    return techniques[approach] || techniques.cbt
  }

  private async extractTechniques(response: string, approach: string): Promise<string[]> {
    // Simple keyword-based technique detection
    const techniques: string[] = []
    
    if (response.includes('gânduri') || response.includes('credințe')) {
      techniques.push('cognitive_restructuring')
    }
    
    if (response.includes('respirație') || response.includes('respiră')) {
      techniques.push('breathing_exercises')
    }
    
    if (response.includes('mindfulness') || response.includes('prezent')) {
      techniques.push('mindfulness')
    }
    
    if (response.includes('emoții') || response.includes('simți')) {
      techniques.push('emotional_validation')
    }
    
    if (response.includes('soluții') || response.includes('cum ai putea')) {
      techniques.push('solution_focused')
    }

    return techniques.length > 0 ? techniques : [approach]
  }

  // ================================
  // DATABASE OPERATIONS
  // ================================
  private async getSessionHistory(
    userId: string,
    sessionId: string
  ): Promise<TherapyMessage[]> {
    const { data } = await supabaseAdmin
      .from('ai_conversations')
      .select('messages')
      .eq('user_id', userId)
      .eq('conversation_type', 'therapy')
      .eq('id', sessionId)
      .single()

    return data?.messages || []
  }

  private async saveTherapyInteraction(data: {
    sessionId: string
    userId: string
    userMessage: string
    assistantResponse: string
    techniques: string[]
    mood_score?: number
    anxiety_level?: number
    crisis_detected: boolean
  }): Promise<void> {
    // Save to ai_conversations
    const messages = [
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: data.userMessage,
        timestamp: new Date(),
        mood_score: data.mood_score,
        anxiety_level: data.anxiety_level
      },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.assistantResponse,
        timestamp: new Date(),
        techniques: data.techniques
      }
    ]

    await supabaseAdmin
      .from('ai_conversations')
      .upsert({
        id: data.sessionId,
        user_id: data.userId,
        ecosystem: 'por-well',
        ai_model: 'gpt-4',
        conversation_type: 'therapy',
        messages,
        context_data: {
          techniques_used: data.techniques,
          crisis_detected: data.crisis_detected,
          mood_score: data.mood_score,
          anxiety_level: data.anxiety_level
        }
      })

    // Also save to therapy_sessions table if it exists
    try {
      await supabaseAdmin
        .from('therapy_sessions')
        .insert({
          user_id: data.userId,
          session_type: 'ai_chat',
          duration_minutes: 0, // Calculate based on session length
          topics_discussed: data.techniques,
          mood_before: data.mood_score,
          insights: { techniques_used: data.techniques }
        })
    } catch (error) {
      // Table might not exist yet
      console.log('Therapy sessions table not available:', error.message)
    }
  }

  private async generateRecommendations(
    userId: string,
    response: any,
    context?: any
  ): Promise<string[]> {
    const recommendations: string[] = []

    // Mood-based recommendations
    if (context?.mood_score <= 3) {
      recommendations.push('Încearcă să ieși afară pentru 10-15 minute astăzi')
      recommendations.push('Practică 5 minute de respirație profundă')
    }

    // Anxiety-based recommendations
    if (context?.anxiety_level >= 7) {
      recommendations.push('Folosește tehnica 5-4-3-2-1 pentru grounding')
      recommendations.push('Limitează cafeaua și stimulentele astăzi')
    }

    // Technique-based recommendations
    if (response.techniques_used.includes('cognitive_restructuring')) {
      recommendations.push('Ține un jurnal de gânduri negative pentru o săptămână')
    }

    if (response.techniques_used.includes('mindfulness')) {
      recommendations.push('Încearcă aplicația de meditație din PorWell')
    }

    return recommendations
  }

  // ================================
  // PUBLIC UTILITY METHODS
  // ================================
  async getMoodInsights(userId: string, days: number = 30): Promise<any> {
    const { data } = await supabaseAdmin
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (!data || data.length === 0) return null

    // Calculate insights
    const moods = data.map(entry => entry.mood_score)
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length
    
    return {
      average_mood: Math.round(avgMood * 10) / 10,
      mood_trend: this.calculateTrend(moods),
      total_entries: data.length,
      best_day: data.find(entry => entry.mood_score === Math.max(...moods)),
      insights: await this.generateMoodInsights(data)
    }
  }

  private calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 7) return 'stable'
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    const difference = secondAvg - firstAvg
    
    if (difference > 0.5) return 'improving'
    if (difference < -0.5) return 'declining'
    return 'stable'
  }

  private async generateMoodInsights(moodData: any[]): Promise<string[]> {
    const insights: string[] = []
    
    // Add mood pattern insights
    const moods = moodData.map(d => d.mood_score)
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length
    
    if (avgMood >= 7) {
      insights.push('Mood-ul tău general a fost pozitiv în această perioadă! 🌟')
    } else if (avgMood <= 4) {
      insights.push('Ai trecut prin momente dificile. Este important să cauți suport. 💜')
    }
    
    return insights
  }
}