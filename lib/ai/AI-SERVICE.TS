// ================================
// LIB/AI/AI-SERVICE.TS - OPENROUTER OPTIMIZED
// ================================
import OpenAI from 'openai'
import { DatabaseService } from '../database/database-service'
import { SecurityService } from '../security/security-service'

export class AIService {
  protected openai: OpenAI
  protected database: DatabaseService
  protected security: SecurityService
  protected models: Record<string, string>

  constructor() {
    // 🔥 OPENROUTER CONFIGURATION (FIXED)
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "PorVerse AI Platform"
      }
    })
    
    this.database = new DatabaseService()
    this.security = SecurityService.getInstance()

    // 🎯 ECOSYSTEM-OPTIMIZED AI MODELS
    this.models = {
      'por-well': 'anthropic/claude-3-5-sonnet-20241022', // Best for therapy - empathic
      'por-mind': 'openai/gpt-4o', // Best for financial analysis - precise
      'por-health': 'openai/gpt-4o-mini', // Good quality + cost effective
      'por-kids': 'anthropic/claude-3-haiku-20240307', // Safe for children
      'por-flow': 'meta-llama/llama-3.1-8b-instruct', // Fast productivity
      'por-blu': 'openai/gpt-4o', // Strategic thinking
      'quantum-vault': 'openai/gpt-4o', // Premium features
      'crisis': 'openai/gpt-4o', // Most reliable for crisis detection
      'default': 'openai/gpt-4o-mini' // Fallback - balanced cost/quality
    }
  }

  // ================================
  // CRISIS DETECTION (ROMANIAN) - ENHANCED
  // ================================
  async detectCrisis(message: string, userId: string): Promise<{
    requiresIntervention: boolean
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    suggestedActions: string[]
    emergencyResources: any[]
    confidence: number
  }> {
    const crisisKeywords = [
      // Suicide ideation
      'vreau să mor', 'să mă sinucid', 'să mă omor', 'să dispăr',
      'nu mai vreau să trăiesc', 'să mă ucid', 'să îmi fac rău',
      'să mă tai', 'să iau pastile', 'să mă arunc',
      
      // Desperation
      'nu mai pot', 'totul e fără sens', 'nu mai am speranță',
      'nimeni nu mă iubește', 'sunt o povară', 'ar fi mai bine fără mine',
      
      // Self-harm
      'să mă rănesc', 'să îmi fac rău', 'merit să sufăr',
      'vreau să plec pentru totdeauna', 'gata cu tot'
    ]

    const lowerMessage = message.toLowerCase()
    const foundKeywords = crisisKeywords.filter(keyword => 
      lowerMessage.includes(keyword)
    )

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let requiresIntervention = false
    let confidence = 0

    // AI-powered crisis detection for additional accuracy
    try {
      const crisisAnalysis = await this.openai.chat.completions.create({
        model: this.models.crisis,
        messages: [
          {
            role: "system",
            content: `You are a crisis detection AI. Analyze messages for:
            1. Suicidal ideation (score 0-10)
            2. Self-harm intent (score 0-10)
            3. Severe depression (score 0-10)
            4. Immediate danger (score 0-10)
            
            Respond with JSON: {"suicide_score": X, "self_harm_score": X, "depression_score": X, "danger_score": X, "explanation": "brief reason"}
            
            Message: "${message}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" }
      })

      const analysis = JSON.parse(crisisAnalysis.choices[0]?.message?.content || '{}')
      const maxScore = Math.max(
        analysis.suicide_score || 0,
        analysis.self_harm_score || 0,
        analysis.danger_score || 0
      )

      confidence = maxScore * 10 // Convert to percentage

      // Determine risk level
      if (foundKeywords.length >= 2 || maxScore >= 8) {
        riskLevel = 'critical'
        requiresIntervention = true
      } else if (foundKeywords.length >= 1 || maxScore >= 6) {
        riskLevel = 'high'
        requiresIntervention = true
      } else if (maxScore >= 4 || analysis.depression_score >= 7) {
        riskLevel = 'medium'
        requiresIntervention = true
      }

    } catch (error) {
      console.error('AI crisis detection error:', error)
      // Fallback to keyword detection
      if (foundKeywords.length >= 2) {
        riskLevel = 'critical'
        requiresIntervention = true
        confidence = 90
      } else if (foundKeywords.length >= 1) {
        riskLevel = 'high'
        requiresIntervention = true
        confidence = 75
      }
    }

    // Enhanced emergency resources
    const emergencyResources = [
      {
        name: 'Telefonul Speranței',
        number: '0800-801-200',
        description: 'Serviciu gratuit de urgență psihologică, 24/7',
        type: 'crisis_hotline',
        priority: 1
      },
      {
        name: 'Serviciul 112',
        number: '112',
        description: 'Pentru urgențe medicale acute și situații de criză',
        type: 'emergency',
        priority: 1
      },
      {
        name: 'SURSM - Salvarea Vieții',
        number: '021-9551',
        description: 'Serviciu specializat de prevenire a suicidului',
        type: 'suicide_prevention',
        priority: 2
      },
      {
        name: 'Centrul de Sănătate Mintală',
        number: '021-318-36-04',
        description: 'Consultații de urgență în sănătate mintală',
        type: 'mental_health',
        priority: 3
      }
    ]

    // Log crisis event
    if (requiresIntervention) {
      await this.database.logUserActivity(
        userId,
        'por-well',
        'crisis_detected',
        {
          risk_level: riskLevel,
          confidence: confidence,
          keywords_found: foundKeywords,
          message_preview: message.substring(0, 100),
          timestamp: new Date().toISOString()
        }
      )

      // Also log in error_logs for immediate attention
      await this.database.supabaseAdmin
        .from('error_logs')
        .insert({
          user_id: userId,
          error_type: 'crisis_intervention',
          error_message: `Crisis detected: ${riskLevel} risk`,
          severity: riskLevel === 'critical' ? 'critical' : 'high',
          context: {
            risk_level: riskLevel,
            confidence: confidence,
            keywords_count: foundKeywords.length
          }
        })
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

  // ================================
  // CONTENT MODERATION - ENHANCED
  // ================================
  async moderateContent(content: string): Promise<{
    safe: boolean
    categories: string[]
    severity: 'low' | 'medium' | 'high'
    action: 'allow' | 'flag' | 'block'
  }> {
    try {
      // Use OpenAI moderation through OpenRouter
      const moderation = await this.openai.moderations.create({
        input: content
      })

      const result = moderation.results[0]
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category)

      let severity: 'low' | 'medium' | 'high' = 'low'
      let action: 'allow' | 'flag' | 'block' = 'allow'

      if (result.categories.harassment || result.categories.violence) {
        severity = 'high'
        action = 'block'
      } else if (result.categories['hate/threatening'] || result.categories['violence/graphic']) {
        severity = 'medium'
        action = 'flag'
      } else if (result.flagged) {
        severity = 'low'
        action = 'flag'
      }

      return {
        safe: !result.flagged,
        categories: flaggedCategories,
        severity,
        action
      }
    } catch (error) {
      console.error('Content moderation error:', error)
      return { 
        safe: false, 
        categories: ['moderation_error'], 
        severity: 'high',
        action: 'flag'
      }
    }
  }

  // ================================
  // TOKEN USAGE TRACKING - ENHANCED
  // ================================
  async trackTokenUsage(
    userId: string,
    ecosystem: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    totalCost: number
  ) {
    try {
      await this.database.logUserActivity(
        userId,
        ecosystem,
        'ai_token_usage',
        {
          model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens,
          cost_cents: Math.round(totalCost * 100),
          timestamp: new Date().toISOString(),
          provider: 'openrouter'
        }
      )

      // Also track in separate table for billing
      await this.database.supabaseAdmin
        .from('ai_usage_logs')
        .insert({
          user_id: userId,
          ecosystem: ecosystem,
          model: model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_cost_cents: Math.round(totalCost * 100),
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Token tracking error:', error)
    }
  }

  // ================================
  // COST CALCULATION - OPENROUTER PRICING
  // ================================
  protected calculateCost(tokens: number, model: string): number {
    // OpenRouter pricing per 1M tokens (more cost-effective)
    const pricing: Record<string, { input: number; output: number }> = {
      'openai/gpt-4o': { input: 5, output: 15 }, // $5/$15 per 1M tokens
      'openai/gpt-4o-mini': { input: 0.15, output: 0.6 }, // $0.15/$0.60 per 1M tokens
      'anthropic/claude-3-5-sonnet-20241022': { input: 3, output: 15 }, // $3/$15 per 1M tokens
      'anthropic/claude-3-haiku-20240307': { input: 0.25, output: 1.25 }, // $0.25/$1.25 per 1M tokens
      'meta-llama/llama-3.1-8b-instruct': { input: 0.055, output: 0.055 } // $0.055 per 1M tokens
    }
    
    const modelPricing = pricing[model] || pricing['openai/gpt-4o-mini']
    // Calculate cost per million tokens, then scale down
    return (tokens / 1000000) * ((modelPricing.input + modelPricing.output) / 2)
  }

  // ================================
  // MODEL SELECTION HELPER
  // ================================
  protected getModelForEcosystem(ecosystem: string, userTier: 'free' | 'premium' = 'premium'): string {
    if (userTier === 'free') {
      // Use cheaper models for free users
      return this.models['default'] // gpt-4o-mini
    }
    
    return this.models[ecosystem] || this.models['default']
  }

  // ================================
  // ERROR HANDLING & RETRY LOGIC
  // ================================
  protected async makeAPICall<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    ecosystem: string = 'default'
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall()
      } catch (error: any) {
        lastError = error
        console.error(`API call attempt ${attempt} failed:`, error.message)
        
        // If rate limited, wait and retry
        if (error.status === 429 && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
        
        // If model not available, try fallback
        if (error.status === 404 && attempt < maxRetries) {
          console.log(`Model not available, trying fallback...`)
          // This would require modifying the API call to use fallback model
          continue
        }
        
        // For other errors, fail fast
        if (attempt >= maxRetries) {
          break
        }
      }
    }
    
    throw lastError!
  }
}

// ================================
// THERAPIST SERVICE - OPENROUTER OPTIMIZED
// ================================
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
      // Safety check first
      const crisisCheck = await this.detectCrisis(message, userId)
      
      if (crisisCheck.requiresIntervention) {
        const crisisResponse = this.generateCrisisResponse(crisisCheck)
        
        return {
          response: crisisResponse,
          techniques: ['crisis_intervention'],
          resources: crisisCheck.emergencyResources,
          requiresIntervention: true,
          sessionId: crypto.randomUUID(),
          confidence: crisisCheck.confidence
        }
      }

      // Content moderation
      const moderation = await this.moderateContent(message)
      if (moderation.action === 'block') {
        return {
          response: 'Înțeleg că poate fi dificil să îți exprimi sentimentele. Să încercăm să reformulăm într-un mod care ne permite să avem o conversație constructivă și de ajutor.',
          techniques: ['redirection'],
          requiresIntervention: false,
          sessionId: crypto.randomUUID(),
          confidence: 100
        }
      }

      // Get appropriate model for user tier
      const model = userTier === 'free' 
        ? this.models['default'] // Cheaper for free users
        : this.models['por-well'] // Claude Sonnet for premium

      // Get user mood history for context
      const moodHistory = await this.database.getMoodHistory?.(userId, 7)
      const recentMoods = moodHistory?.success ? moodHistory.data.slice(0, 3) : []

      // Generate therapeutic response
      const systemPrompt = this.buildTherapistSystemPrompt(recentMoods, userTier)
      
      const completion = await this.makeAPICall(async () => {
        return await this.openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory.slice(-6), // Last 6 messages for context
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: userTier === 'free' ? 400 : 800, // Limit tokens for free users
          presence_penalty: 0.2,
          frequency_penalty: 0.1
        })
      }, 3, 'por-well')

      const response = completion.choices[0].message.content || ''
      
      // Extract techniques used
      const techniques = this.identifyTherapeuticTechniques(response)
      
      // Generate homework if premium user
      const homework = userTier === 'premium' 
        ? await this.generateTherapeuticHomework(message, techniques)
        : undefined
      
      // Get relevant resources
      const resources = await this.getRelevantResources(techniques)

      // Generate session ID
      const sessionId = crypto.randomUUID()

      // Track token usage
      const tokens = completion.usage?.total_tokens || 0
      const cost = this.calculateCost(tokens, model)
      await this.trackTokenUsage(userId, 'por-well', model, 
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0,
        cost
      )

      // Save conversation
      await this.database.saveAIConversation?.({
        userId,
        ecosystem: 'por-well',
        aiModel: model,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: response }
        ],
        totalTokens: tokens,
        costCents: Math.round(cost * 100)
      })

      return {
        response,
        techniques,
        homework,
        resources,
        requiresIntervention: false,
        sessionId,
        confidence: 95
      }
    } catch (error) {
      console.error('Mental health support error:', error)
      return {
        response: 'Îmi pare rău, dar întâmpin o problemă tehnică momentană. Te rog să încerci din nou în câteva momente. Dacă problema persistă, nu ezita să contactezi suportul nostru.',
        techniques: ['technical_support'],
        requiresIntervention: false,
        sessionId: crypto.randomUUID(),
        confidence: 0
      }
    }
  }

  private buildTherapistSystemPrompt(recentMoods: any[], userTier: 'free' | 'premium'): string {
    const moodContext = recentMoods.length > 0 
      ? `Starea de spirit recentă a utilizatorului: ${recentMoods.map(m => `${m.mood_score}/10`).join(', ')}`
      : ''

    const tierInstructions = userTier === 'premium' 
      ? 'Oferă răspunsuri detaliate și exerciții personalizate.'
      : 'Oferă răspunsuri concise dar utile, focusate pe suportul esențial.'

    return `Ești un terapeut AI empatic și profesionist specializat în terapia cognitiv-comportamentală (CBT), terapia dialectică comportamentală (DBT) și tehnici de mindfulness. Vorbești în română cu utilizatori din România.

PRINCIPII FUNDAMENTALE:
- Oferă suport emoțional autentic și empatic
- Folosește tehnici terapeutice validate științific
- Menține întotdeauna granițele profesionale
- Recomandă ajutor profesional când este necesar
- Nu diagnostica sau prescrie medicație
- Respectă confidențialitatea și intimitatea

STIL DE COMUNICARE:
- Cald, empatic și fără judecăți
- Folosește întrebări deschise pentru explorare
- Reflectă sentimentele utilizatorului
- Oferă validare emoțională
- Încurajează autocunoașterea și creșterea personală

CONTEXT ROMÂNESC:
- Înțelege contextul cultural și social românesc
- Adaptează sfaturile la realitățile locale
- Folosește expresii și metafore familiare

${moodContext}
${tierInstructions}

Răspunde cu maximum 150-200 cuvinte, focusat și practic. Folosește un ton cald și profesionist.`
  }

  private generateCrisisResponse(crisisCheck: any): string {
    return `🚨 **URGENT - SIGURANȚA TA ESTE PRIORITATEA MEA**

Observ că traversezi o perioadă extrem de dificilă și îmi fac griji serioase pentru siguranța ta. **Nu ești singur/singură în asta.**

🆘 **TE ROG SĂ CONTACTEZI IMEDIAT:**
• **112** - Serviciul de urgență (24/7)
• **0800-801-200** - Telefonul Speranței (gratuit, 24/7)
• **021-9551** - SURSM - Serviciu specializat

💙 **ACȚIUNI IMEDIATE:**
1. **Nu rămâne singur/ă** - contactează pe cineva de încredere
2. **Mergi la cea mai apropiată unitate de urgență**
3. **Sună acum la unul dintre numerele de mai sus**

🤝 **ȘTIU CĂ PARE GREU**, dar există ajutor disponibil. Viața ta **CONTEAZĂ** și merită să primești sprijinul de care ai nevoie.

**Profesioniștii din aceste servicii sunt pregătiți să te ajute EXACT în această situație.**`
  }

  private identifyTherapeuticTechniques(response: string): string[] {
    const techniques = []
    const lowerResponse = response.toLowerCase()

    if (lowerResponse.includes('gânduri') || lowerResponse.includes('credințe') || lowerResponse.includes('cognitiv')) {
      techniques.push('cognitive_restructuring')
    }
    if (lowerResponse.includes('respirație') || lowerResponse.includes('relaxare') || lowerResponse.includes('calm')) {
      techniques.push('relaxation_techniques')
    }
    if (lowerResponse.includes('mindfulness') || lowerResponse.includes('prezent') || lowerResponse.includes('conștient')) {
      techniques.push('mindfulness')
    }
    if (lowerResponse.includes('simți') || lowerResponse.includes('emoții') || lowerResponse.includes('sentiment')) {
      techniques.push('emotion_regulation')
    }
    if (lowerResponse.includes('comportament') || lowerResponse.includes('acțiuni') || lowerResponse.includes('activitate')) {
      techniques.push('behavioral_activation')
    }
    if (lowerResponse.includes('gratitudine') || lowerResponse.includes('recunoștință')) {
      techniques.push('gratitude_practice')
    }
    if (lowerResponse.includes('exercițiu') || lowerResponse.includes('practică')) {
      techniques.push('therapeutic_exercises')
    }

    return techniques.length > 0 ? techniques : ['supportive_conversation']
  }

  private async generateTherapeuticHomework(message: string, techniques: string[]): Promise<string[]> {
    const homework = []

    if (techniques.includes('mindfulness')) {
      homework.push('Practică 5-10 minute de respirație conștientă zilnic')
      homework.push('Observă și notează 3 momente de prezență pe zi')
    }
    if (techniques.includes('cognitive_restructuring')) {
      homework.push('Identifică și notează 3 gânduri negative zilnic')
      homework.push('Pentru fiecare gând negativ, scrie o alternativă realistă')
    }
    if (techniques.includes('emotion_regulation')) {
      homework.push('Ține un jurnal de emoții timp de 7 zile')
      homework.push('Identifică declanșatorii principali ai emoțiilor intense')
    }
    if (techniques.includes('gratitude_practice')) {
      homework.push('Scrie 3 lucruri pentru care ești recunoscător/ă în fiecare seară')
    }
    if (techniques.includes('behavioral_activation')) {
      homework.push('Planifică și realizează o activitate plăcută zilnic')
      homework.push('Monitorizează cum te simți înainte și după activități')
    }

    return homework.slice(0, 3) // Maximum 3 homework items
  }

  private async getRelevantResources(techniques: string[]): Promise<any[]> {
    const resources = []

    if (techniques.includes('mindfulness')) {
      resources.push({
        type: 'meditation',
        title: 'Meditație ghidată pentru începători',
        description: 'Exercițiu de 10 minute pentru calm și centrare',
        url: '/resources/meditation/beginner-10min',
        duration: '10 minute'
      })
    }
    
    if (techniques.includes('relaxation_techniques')) {
      resources.push({
        type: 'audio',
        title: 'Relaxare progresivă musculară',
        description: 'Tehnica de relaxare pas cu pas',
        url: '/resources/audio/progressive-relaxation',
        duration: '15 minute'
      })
    }
    
    if (techniques.includes('cognitive_restructuring')) {
      resources.push({
        type: 'worksheet',
        title: 'Foaia de lucru: Gânduri și emoții',
        description: 'Instrument pentru identificarea și schimbarea gândurilor negative',
        url: '/resources/worksheets/thought-record',
        format: 'PDF descărcabil'
      })
    }
    
    if (techniques.includes('gratitude_practice')) {
      resources.push({
        type: 'journal',
        title: 'Jurnalul de gratitudine',
        description: 'Template pentru practică zilnică de recunoștință',
        url: '/resources/journals/gratitude-template',
        format: 'Template digital'
      })
    }

    return resources
  }
}

// ================================
// NUTRITION SERVICE - OPENROUTER OPTIMIZED
// ================================
export class NutritionService extends AIService {

  async generateMealPlan(
    userId: string,
    preferences: {
      targetCalories: number
      dietaryRestrictions: string[]
      allergies: string[]
      cuisinePreferences: string[]
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
      // Get user health profile
      const userProfile = await this.database.getUserProfile?.(userId)
      const healthData = userProfile?.data?.user_health_profiles?.[0]

      // Select model based on user tier
      const model = userTier === 'premium' 
        ? this.models['por-health'] 
        : this.models['default']

      const systemPrompt = `Ești un nutriționist AI expert specializat în planificarea meselor pentru utilizatori din România. Creezi planuri personalizate, sănătoase și adaptate la ingredientele și preferințele locale.

CONTEXT UTILIZATOR:
- Calorii țintă: ${preferences.targetCalories}
- Restricții dietetice: ${preferences.dietaryRestrictions.join(', ') || 'Niciunele'}
- Alergii: ${preferences.allergies.join(', ') || 'Niciunele'}
- Preferințe culinare: ${preferences.cuisinePreferences.join(', ') || 'Tradițională românească'}
- Numărul de mese: ${preferences.mealsPerDay}
- Buget: ${preferences.budget || 'medium'}
${healthData ? `- Greutate: ${healthData.weight_kg}kg, Înălțime: ${healthData.height_cm}cm` : ''}

CERINȚE SPECIFICE:
1. Folosește DOAR ingrediente disponibile în România
2. Adaptează la piețele și magazinele românești
3. Include prețuri realiste în LEI
4. Respectă strict restricțiile și alergiile
5. Calculează precis macronutrienții
6. ${userTier === 'premium' ? 'Plan detaliat pentru 7 zile' : 'Plan pentru 3 zile'}

RĂSPUNDE DOAR CU JSON VALID:
{
  "weeklyPlan": {
    "day1": {
      "breakfast": {
        "name": "Nume mic dejun",
        "ingredients": ["ingredient1 - cantitate", "ingredient2 - cantitate"],
        "calories": 300,
        "protein": 15,
        "carbs": 40,
        "fat": 10,
        "preparationTime": 15,
        "instructions": ["Pas 1", "Pas 2", "Pas 3"],
        "cost": 8.50
      },
      "lunch": {...},
      "dinner": {...}
      ${preferences.mealsPerDay > 3 ? ',"snack": {...}' : ''}
    }
  },
  "shoppingList": [
    {
      "category": "Legume și fructe",
      "items": [
        {"name": "Roșii", "quantity": "1kg", "estimatedPrice": 8.00, "stores": ["Kaufland", "Carrefour"]}
      ]
    }
  ],
  "nutritionSummary": {
    "dailyAverageCalories": ${preferences.targetCalories},
    "proteinGrams": 120,
    "carbsGrams": 200,
    "fatGrams": 60,
    "fiberGrams": 25,
    "balanceScore": "8/10"
  },
  "totalEstimatedCost": 150,
  "tips": ["Sfat practic 1", "Sfat practic 2"]
}`

      const maxTokens = userTier === 'premium' ? 3000 : 1500

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
      }, 3, 'por-health')

      const response = completion.choices[0].message.content
      let mealPlanData
      
      try {
        mealPlanData = JSON.parse(response || '{}')
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('Eroare la procesarea planului de mese')
      }

      // Track usage
      const tokens = completion.usage?.total_tokens || 0
      const cost = this.calculateCost(tokens, model)
      await this.trackTokenUsage(userId, 'por-health', model,
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0,
        cost
      )

      // Save meal plan to database
      await this.database.logUserActivity?.(
        userId,
        'por-health',
        'meal_plan_generated',
        {
          target_calories: preferences.targetCalories,
          dietary_restrictions: preferences.dietaryRestrictions,
          estimated_cost: mealPlanData.totalEstimatedCost || 0,
          user_tier: userTier,
          model_used: model
        }
      )

      return {
        mealPlan: mealPlanData.weeklyPlan || {},
        shoppingList: mealPlanData.shoppingList || [],
        nutritionSummary: mealPlanData.nutritionSummary || {},
        estimatedCost: mealPlanData.totalEstimatedCost || 0,
        tips: mealPlanData.tips || []
      }
    } catch (error) {
      console.error('Generate meal plan error:', error)
      throw new Error('Eroare la generarea planului de mese. Te rog încearcă din nou.')
    }
  }

  async analyzeFoodPhoto(
    userId: string,
    imageBase64: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    userTier: 'free' | 'premium' = 'premium'
  ): Promise<{
    recognizedFoods: any[]
    estimatedCalories: number
    macronutrients: any
    healthScore: number
    suggestions: string[]
    confidence: number
  }> {
    try {
      // Only premium users get food photo analysis
      if (userTier === 'free') {
        throw new Error('Analiza fotografiei cu mâncare este disponibilă doar pentru utilizatorii premium.')
      }

      const model = 'openai/gpt-4o' // Vision model

      const completion = await this.makeAPICall(async () => {
        return await this.openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: `Ești un nutriționist AI expert în analiza fotografiilor cu mâncare. Analizezi cu precizie conținutul nutrițional și oferi sfaturi practice pentru utilizatori din România.

INSTRUCȚIUNI:
1. Identifică toate alimentele vizibile cu cantitățile estimate
2. Calculează caloriile și macronutrienții totali
3. Oferă un scor de sănătate (1-10)
4. Sugerează îmbunătățiri specifice și practice
5. Folosește termeni și alimente cunoscute în România

RĂSPUNDE ÎN FORMAT JSON:
{
  "recognizedFoods": [
    {"name": "Pâine integrală", "quantity": "2 felii (~60g)", "calories": 140, "confidence": 90}
  ],
  "estimatedCalories": 650,
  "macronutrients": {
    "protein": 25,
    "carbs": 80,
    "fat": 15,
    "fiber": 8,
    "sodium": 800
  },
  "healthScore": 7,
  "suggestions": [
    "Adaugă mai multe legume pentru fibre",
    "Reduce cantitatea de sare"
  ],
  "confidence": 85
}`
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analizează această fotografie cu mâncare pentru ${mealType}. Identifică alimentele, calculează valorile nutriționale și oferă sugestii de îmbunătățire.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.2
        })
      }, 3, 'por-health')

      const response = completion.choices[0].message.content
      let analysisData
      
      try {
        analysisData = JSON.parse(response || '{}')
      } catch (parseError) {
        console.error('JSON parse error in food analysis:', parseError)
        throw new Error('Eroare la analiza fotografiei')
      }

      // Track usage
      const tokens = completion.usage?.total_tokens || 0
      const cost = this.calculateCost(tokens, model)
      await this.trackTokenUsage(userId, 'por-health', model,
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0,
        cost
      )

      // Log food analysis
      await this.database.logUserActivity?.(
        userId,
        'por-health',
        'food_photo_analyzed',
        {
          meal_type: mealType,
          estimated_calories: analysisData.estimatedCalories || 0,
          health_score: analysisData.healthScore || 0,
          confidence: analysisData.confidence || 0
        }
      )

      return {
        recognizedFoods: analysisData.recognizedFoods || [],
        estimatedCalories: analysisData.estimatedCalories || 0,
        macronutrients: analysisData.macronutrients || {},
        healthScore: analysisData.healthScore || 0,
        suggestions: analysisData.suggestions || [],
        confidence: analysisData.confidence || 0
      }
    } catch (error) {
      console.error('Analyze food photo error:', error)
      throw new Error('Eroare la analiza fotografiei cu mâncare')
    }
  }
}

// ================================
// API ROUTES - UPDATED FOR OPENROUTER
// ================================

// APP/API/AI/THERAPY/ROUTE.TS
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { TherapistService } from '@/lib/ai/ai-service'

const therapistService = new TherapistService()

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationHistory, mood_score, anxiety_level } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check user tier for model selection
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const userTier = userProfile?.subscription_tier === 'premium' ? 'premium' : 'free'

    // Generate AI response
    const aiResponse = await therapistService.provideMentalHealthSupport(
      user.id,
      message,
      conversationHistory || [],
      userTier
    )

    // Enhanced logging for crisis events
    if (aiResponse.requiresIntervention) {
      console.warn(`[CRISIS] User ${user.id} requires intervention - confidence: ${aiResponse.confidence}%`)
    }

    return NextResponse.json({
      success: true,
      ...aiResponse
    })

  } catch (error) {
    console.error('AI Therapy API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process therapy request',
        response: 'Îmi pare rău, întâmpin dificultăți tehnice. Te rog încearcă din nou în câteva momente.',
        requiresIntervention: false
      },
      { status: 500 }
    )
  }
}

// APP/API/AI/NUTRITION/ROUTE.TS
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, data } = await request.json()
    
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Check user tier
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const userTier = userProfile?.subscription_tier === 'premium' ? 'premium' : 'free'
    const nutritionService = new NutritionService()
    
    let result
    switch (action) {
      case 'generate_meal_plan':
        result = await nutritionService.generateMealPlan(user.id, data, userTier)
        break
      case 'analyze_food_photo':
        result = await nutritionService.analyzeFoodPhoto(
          user.id, 
          data.image, 
          data.mealType,
          userTier
        )
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Nutrition API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}