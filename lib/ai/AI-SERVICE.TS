// lib/ai/ai-service.ts
// PRODUCTION READY AI SERVICE - Replace your current file with this

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export class AIService {
  protected openai: OpenAI
  protected supabase: any
  protected models: Record<string, string>

  constructor() {
    // OpenRouter configuration
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "PorVerse AI Platform"
      }
    })
    
    // Direct Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Ecosystem-optimized models
    this.models = {
      'por-well': 'anthropic/claude-3-5-sonnet-20241022', // Best for therapy
      'por-mind': 'openai/gpt-4o', // Financial analysis
      'por-health': 'openai/gpt-4o-mini', // Cost effective for health
      'por-kids': 'anthropic/claude-3-haiku-20240307', // Safe for children
      'por-flow': 'meta-llama/llama-3.1-8b-instruct', // Fast productivity
      'por-blu': 'openai/gpt-4o', // Strategic thinking
      'quantum-vault': 'openai/gpt-4o', // Premium features
      'crisis': 'openai/gpt-4o', // Most reliable for crisis
      'default': 'openai/gpt-4o-mini' // Fallback
    }
  }

  // Crisis detection with Romanian context
  async detectCrisis(message: string, userId: string): Promise<{
    requiresIntervention: boolean
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    suggestedActions: string[]
    emergencyResources: any[]
    confidence: number
  }> {
    
    const crisisKeywords = [
      // Romanian suicide ideation
      'vreau să mor', 'să mă sinucid', 'să mă omor', 'să dispăr',
      'nu mai vreau să trăiesc', 'să mă ucid', 'să îmi fac rău',
      'să mă tai', 'să iau pastile', 'să mă arunc', 'gata cu mine',
      // Desperation Romanian
      'nu mai pot', 'totul e fără sens', 'nu mai am speranță',
      'nimeni nu mă iubește', 'sunt o povară', 'ar fi mai bine fără mine',
      // English keywords
      'want to die', 'kill myself', 'end it all', 'no hope left',
      'suicide', 'better off dead', 'can\'t go on'
    ]

    const lowerMessage = message.toLowerCase()
    const foundKeywords = crisisKeywords.filter(keyword => 
      lowerMessage.includes(keyword)
    )

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let requiresIntervention = false
    let confidence = 0

    // Basic keyword detection (reliable fallback)
    if (foundKeywords.length >= 2) {
      riskLevel = 'critical'
      requiresIntervention = true
      confidence = 95
    } else if (foundKeywords.length >= 1) {
      riskLevel = 'high'
      requiresIntervention = true
      confidence = 85
    }

    // Enhanced AI analysis for edge cases
    if (foundKeywords.length > 0) {
      try {
        const crisisAnalysis = await this.openai.chat.completions.create({
          model: this.models.crisis,
          messages: [
            {
              role: "system",
              content: `Analyze this message for crisis indicators. Respond with ONLY a JSON object:
              {
                "suicide_risk": 0-10,
                "self_harm_risk": 0-10,
                "immediate_danger": 0-10,
                "overall_assessment": "low|medium|high|critical"
              }`
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.1,
          max_tokens: 100,
          response_format: { type: "json_object" }
        })

        const analysis = JSON.parse(crisisAnalysis.choices[0]?.message?.content || '{}')
        const maxRisk = Math.max(
          analysis.suicide_risk || 0,
          analysis.self_harm_risk || 0,
          analysis.immediate_danger || 0
        )

        // Override with AI assessment if more severe
        if (maxRisk >= 8) {
          riskLevel = 'critical'
          confidence = Math.max(confidence, 90)
        } else if (maxRisk >= 6) {
          riskLevel = 'high'
          confidence = Math.max(confidence, 80)
        }

        requiresIntervention = riskLevel === 'high' || riskLevel === 'critical'

      } catch (error) {
        console.error('AI crisis analysis failed, using keyword detection:', error)
      }
    }

    // Romanian emergency resources
    const emergencyResources = [
      {
        name: 'Telefonul Speranței',
        number: '0800-801-200',
        description: 'Serviciu gratuit de urgență psihologică, 24/7',
        type: 'crisis_hotline'
      },
      {
        name: 'Serviciul 112',
        number: '112',
        description: 'Pentru urgențe medicale acute și situații de criză',
        type: 'emergency'
      },
      {
        name: 'Centrul de Sănătate Mintală București',
        number: '021-318-36-04',
        description: 'Consultații de urgență în sănătate mintală',
        type: 'mental_health'
      }
    ]

    // Log crisis detection
    if (requiresIntervention) {
      try {
        await this.supabase
          .from('crisis_logs')
          .insert({
            user_id: userId,
            risk_level: riskLevel,
            confidence: confidence,
            keywords_found: foundKeywords,
            message_preview: message.substring(0, 100),
            intervention_triggered: true,
            created_at: new Date().toISOString()
          })
      } catch (error) {
        console.error('Failed to log crisis event:', error)
      }
    }

    return {
      requiresIntervention,
      riskLevel,
      confidence,
      suggestedActions: requiresIntervention ? [
        'Contactează IMEDIAT serviciul de urgență 112',
        'Sună la Telefonul Speranței: 0800-801-200 (gratuit, 24/7)',
        'Mergi la cea mai apropiată unitate de urgență',
        'Contactează o persoană de încredere (familie, prieten)',
        'Nu rămâne singur/ă - cere ajutorul cuiva'
      ] : [
        'Continuă conversația pentru a explora sentimentele',
        'Practică tehnici de respirație pentru calm',
        'Consideră vorbirea cu un terapeut profesionist'
      ],
      emergencyResources: requiresIntervention ? emergencyResources : []
    }
  }

  // Token usage tracking
  async trackTokenUsage(
    userId: string,
    ecosystem: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    totalCost: number
  ) {
    try {
      await this.supabase
        .from('ai_usage_logs')
        .insert({
          user_id: userId,
          ecosystem: ecosystem,
          model: model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens,
          total_cost_cents: Math.round(totalCost * 100),
          success: true,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Token tracking error:', error)
    }
  }

  // Cost calculation for OpenRouter
  protected calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'openai/gpt-4o': { input: 5, output: 15 },
      'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
      'anthropic/claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'anthropic/claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
      'meta-llama/llama-3.1-8b-instruct': { input: 0.055, output: 0.055 }
    }
    
    const modelPricing = pricing[model] || pricing['openai/gpt-4o-mini']
    const inputCost = (inputTokens / 1000000) * modelPricing.input
    const outputCost = (outputTokens / 1000000) * modelPricing.output
    
    return inputCost + outputCost
  }

  // Error handling with retry logic
  protected async makeAPICall<T>(apiCall: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall()
      } catch (error: any) {
        lastError = error
        console.error(`API call attempt ${attempt} failed:`, error.message)
        
        if (error.status === 429 && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
        
        if (attempt >= maxRetries) break
      }
    }
    
    throw lastError!
  }
}

// Therapist Service
export class TherapistService extends AIService {
  
  async provideMentalHealthSupport(
    userId: string,
    message: string,
    conversationHistory: any[] = [],
    userTier: 'free' | 'premium' = 'premium'
  ): Promise<{
    response: string
    techniques: string[]
    homework?: string[]
    resources?: any[]
    requiresIntervention: boolean
    sessionId: string
    confidence: number
  }> {
    try {
      // Crisis detection first
      const crisisCheck = await this.detectCrisis(message, userId)
      
      if (crisisCheck.requiresIntervention) {
        return {
          response: this.generateCrisisResponse(crisisCheck),
          techniques: ['crisis_intervention'],
          resources: crisisCheck.emergencyResources,
          requiresIntervention: true,
          sessionId: crypto.randomUUID(),
          confidence: crisisCheck.confidence
        }
      }

      // Get appropriate model
      const model = userTier === 'premium' ? this.models['por-well'] : this.models['default']

      // Generate therapeutic response
      const systemPrompt = `Ești un terapeut AI empatic și profesionist specializat în terapia cognitiv-comportamentală (CBT) și tehnici de mindfulness. Vorbești în română cu utilizatori din România.

PRINCIPII FUNDAMENTALE:
- Oferă suport emoțional autentic și empatic
- Folosește tehnici terapeutice validate științific
- Menține întotdeauna granițele profesionale
- Recomandă ajutor profesional când este necesar
- Nu diagnostica sau prescrie medicație

STIL DE COMUNICARE:
- Cald, empatic și fără judecăți
- Folosește întrebări deschise pentru explorare
- Reflectă sentimentele utilizatorului
- Oferă validare emoțională

${userTier === 'premium' ? 'Oferă răspunsuri detaliate și exerciții personalizate.' : 'Oferă răspunsuri concise dar utile, focusate pe suportul esențial.'}

Răspunde cu maximum 150-200 cuvinte, focusat și practic.`
      
      const completion = await this.makeAPICall(async () => {
        return await this.openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory.slice(-6),
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: userTier === 'free' ? 400 : 800,
          presence_penalty: 0.2,
          frequency_penalty: 0.1
        })
      })

      const response = completion.choices[0].message.content || ''
      const techniques = this.identifyTherapeuticTechniques(response)
      const sessionId = crypto.randomUUID()

      // Track usage
      if (completion.usage) {
        const cost = this.calculateCost(
          completion.usage.prompt_tokens,
          completion.usage.completion_tokens,
          model
        )
        
        await this.trackTokenUsage(
          userId, 
          'por-well', 
          model,
          completion.usage.prompt_tokens,
          completion.usage.completion_tokens,
          cost
        )
      }

      // Save therapy session
      try {
        await this.supabase
          .from('therapy_sessions')
          .insert({
            user_id: userId,
            session_id: sessionId,
            user_message: message,
            ai_response: response,
            techniques_used: techniques,
            crisis_detected: false,
            confidence_score: 95,
            created_at: new Date().toISOString()
          })
      } catch (error) {
        console.error('Failed to save therapy session:', error)
      }

      const homework = userTier === 'premium' ? this.generateTherapeuticHomework(techniques) : undefined

      return {
        response,
        techniques,
        homework,
        requiresIntervention: false,
        sessionId,
        confidence: 95
      }

    } catch (error) {
      console.error('Mental health support error:', error)
      return {
        response: 'Îmi pare rău, dar întâmpin o problemă tehnică momentană. Te rog să încerci din nou în câteva momente.',
        techniques: ['technical_support'],
        requiresIntervention: false,
        sessionId: crypto.randomUUID(),
        confidence: 0
      }
    }
  }

  private generateCrisisResponse(crisisCheck: any): string {
    return `🚨 **URGENT - SIGURANȚA TA ESTE PRIORITATEA MEA**

Observ că traversezi o perioadă extrem de dificilă și îmi fac griji serioase pentru siguranța ta. **Nu ești singur/singură în asta.**

🆘 **TE ROG SĂ CONTACTEZI IMEDIAT:**
• **112** - Serviciul de urgență (24/7)
• **0800-801-200** - Telefonul Speranței (gratuit, 24/7)
• **021-318-36-04** - Centrul de Sănătate Mintală București

💙 **ACȚIUNI IMEDIATE:**
1. **Nu rămâne singur/ă** - contactează pe cineva de încredere
2. **Mergi la cea mai apropiată unitate de urgență**
3. **Sună acum la unul dintre numerele de mai sus**

Viața ta **CONTEAZĂ** și merită să primești sprijinul de care ai nevoie.`
  }

  private identifyTherapeuticTechniques(response: string): string[] {
    const techniques = []
    const lowerResponse = response.toLowerCase()

    if (lowerResponse.includes('gânduri') || lowerResponse.includes('cognitiv')) {
      techniques.push('cognitive_restructuring')
    }
    if (lowerResponse.includes('respirație') || lowerResponse.includes('relaxare')) {
      techniques.push('relaxation_techniques')
    }
    if (lowerResponse.includes('mindfulness') || lowerResponse.includes('prezent')) {
      techniques.push('mindfulness')
    }
    if (lowerResponse.includes('emoții') || lowerResponse.includes('sentiment')) {
      techniques.push('emotion_regulation')
    }
    if (lowerResponse.includes('comportament') || lowerResponse.includes('activitate')) {
      techniques.push('behavioral_activation')
    }

    return techniques.length > 0 ? techniques : ['supportive_conversation']
  }

  private generateTherapeuticHomework(techniques: string[]): string[] {
    const homework = []

    if (techniques.includes('mindfulness')) {
      homework.push('Practică 5-10 minute de respirație conștientă zilnic')
    }
    if (techniques.includes('cognitive_restructuring')) {
      homework.push('Identifică și notează 3 gânduri negative zilnic')
    }
    if (techniques.includes('emotion_regulation')) {
      homework.push('Ține un jurnal de emoții timp de 7 zile')
    }

    return homework.slice(0, 3)
  }
}

// Nutrition Service
export class NutritionService extends AIService {

  async generateMealPlan(
    userId: string,
    preferences: {
      targetCalories: number
      dietaryRestrictions: string[]
      allergies: string[]
      mealsPerDay: number
      budget?: 'low' | 'medium' | 'high'
    },
    userTier: 'free' | 'premium' = 'premium'
  ): Promise<{
    mealPlan: any
    shoppingList: any[]
    nutritionSummary: any
    estimatedCost: number
    tips: string[]
  }> {
    try {
      const model = userTier === 'premium' ? this.models['por-health'] : this.models['default']

      const systemPrompt = `Ești un nutriționist AI expert specializat în planuri de mese pentru români. Creezi planuri personalizate cu ingrediente locale și prețuri în LEI.

CONTEXT UTILIZATOR:
- Calorii țintă: ${preferences.targetCalories}
- Restricții: ${preferences.dietaryRestrictions.join(', ') || 'Niciunele'}
- Alergii: ${preferences.allergies.join(', ') || 'Niciunele'}
- Mese pe zi: ${preferences.mealsPerDay}
- Buget: ${preferences.budget || 'medium'}

CERINȚE:
1. Folosește DOAR ingrediente disponibile în România
2. Prețuri realiste în LEI pentru supermarketuri românești
3. Respectă strict restricțiile și alergiile
4. ${userTier === 'premium' ? 'Plan detaliat pentru 7 zile' : 'Plan pentru 3 zile'}

RĂSPUNDE DOAR CU JSON VALID:
{
  "weeklyPlan": {
    "day1": {
      "breakfast": {
        "name": "Ovăz cu fructe",
        "ingredients": ["ovăz - 50g", "banană - 1 buc", "lapte - 200ml"],
        "calories": 350,
        "protein": 12,
        "carbs": 55,
        "fat": 8,
        "cost": 4.50
      }
    }
  },
  "shoppingList": [
    {"name": "Ovăz", "quantity": "500g", "price": 5.00, "store": "Kaufland"}
  ],
  "nutritionSummary": {
    "dailyCalories": ${preferences.targetCalories},
    "proteinGrams": 120,
    "carbsGrams": 200,
    "fatGrams": 60
  },
  "totalCost": 120,
  "tips": ["Sfat practic pentru economii"]
}`

      const maxTokens = userTier === 'premium' ? 2500 : 1200

      const completion = await this.makeAPICall(async () => {
        return await this.openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generează planul de mese personalizat conform specificațiilor." }
          ],
          temperature: 0.3,
          max_tokens: maxTokens,
          response_format: { type: "json_object" }
        })
      })

      const response = completion.choices[0].message.content
      let mealPlanData
      
      try {
        mealPlanData = JSON.parse(response || '{}')
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('Eroare la procesarea planului de mese')
      }

      // Track usage
      if (completion.usage) {
        const cost = this.calculateCost(
          completion.usage.prompt_tokens,
          completion.usage.completion_tokens,
          model
        )
        
        await this.trackTokenUsage(
          userId, 
          'por-health', 
          model,
          completion.usage.prompt_tokens,
          completion.usage.completion_tokens,
          cost
        )
      }

      // Save nutrition plan
      try {
        await this.supabase
          .from('nutrition_plans')
          .insert({
            user_id: userId,
            target_calories: preferences.targetCalories,
            dietary_restrictions: preferences.dietaryRestrictions,
            meal_plan: mealPlanData.weeklyPlan,
            shopping_list: mealPlanData.shoppingList,
            estimated_cost: mealPlanData.totalCost,
            user_tier: userTier,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            created_at: new Date().toISOString()
          })
      } catch (error) {
        console.error('Failed to save meal plan:', error)
      }

      return {
        mealPlan: mealPlanData.weeklyPlan || {},
        shoppingList: mealPlanData.shoppingList || [],
        nutritionSummary: mealPlanData.nutritionSummary || {},
        estimatedCost: mealPlanData.totalCost || 0,
        tips: mealPlanData.tips || []
      }

    } catch (error) {
      console.error('Generate meal plan error:', error)
      throw new Error('Eroare la generarea planului de mese')
    }
  }
}