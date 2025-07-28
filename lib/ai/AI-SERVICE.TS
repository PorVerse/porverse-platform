// ================================
// LIB/AI/AI-SERVICE.TS - BASE CLASS
// ================================
import OpenAI from 'openai'
import { DatabaseService } from '../database/database-service'
import { SecurityService } from '../security/security-service'

export class AIService {
  protected openai: OpenAI
  protected database: DatabaseService
  protected security: SecurityService

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    })
    this.database = new DatabaseService()
    this.security = SecurityService.getInstance()
  }

  // ================================
  // SAFETY & CONTENT MODERATION
  // ================================
  async moderateContent(content: string): Promise<{
    safe: boolean
    categories: string[]
    severity: 'low' | 'medium' | 'high'
  }> {
    try {
      const moderation = await this.openai.moderations.create({
        input: content
      })

      const result = moderation.results[0]
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category)

      let severity: 'low' | 'medium' | 'high' = 'low'
      if (result.categories.harassment || result.categories.violence) severity = 'high'
      else if (result.categories['hate/threatening'] || result.categories['violence/graphic']) severity = 'medium'

      return {
        safe: !result.flagged,
        categories: flaggedCategories,
        severity
      }
    } catch (error) {
      console.error('Content moderation error:', error)
      return { safe: false, categories: ['error'], severity: 'high' }
    }
  }

  // ================================
  // CRISIS DETECTION (ROMANIAN)
  // ================================
  async detectCrisis(message: string, userId: string): Promise<{
    requiresIntervention: boolean
    riskLevel: 'low' | 'medium' | 'high'
    suggestedActions: string[]
    emergencyResources: any[]
  }> {
    const crisisKeywords = [
      'vreau să mor', 'să mă sinucid', 'să mă omor', 'să dispăr',
      'nu mai vreau să trăiesc', 'să mă ucid', 'să îmi fac rău',
      'să mă tai', 'să iau pastile', 'să mă arunc', 'nu mai pot',
      'totul e fără sens', 'nimeni nu mă iubește', 'sunt o povară',
      'ar fi mai bine fără mine'
    ]

    const lowerMessage = message.toLowerCase()
    const foundKeywords = crisisKeywords.filter(keyword => 
      lowerMessage.includes(keyword)
    )

    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    let requiresIntervention = false

    if (foundKeywords.length > 0) {
      riskLevel = foundKeywords.length > 2 ? 'high' : 'medium'
      requiresIntervention = true

      // Log crisis event
      await this.database.logUserActivity(
        userId,
        'por-well',
        'crisis_detected',
        {
          risk_level: riskLevel,
          keywords_found: foundKeywords,
          message_preview: message.substring(0, 100)
        }
      )
    }

    const emergencyResources = [
      {
        name: 'Telefonul de Încredere',
        number: '0800-801-200',
        description: 'Serviciu gratuit de urgență psihologică, 24/7'
      },
      {
        name: 'SURSM - Salvarea Vieții',
        number: '021-9551',
        description: 'Serviciu de prevenire a suicidului'
      },
      {
        name: 'Ambulanța',
        number: '112',
        description: 'Pentru urgențe medicale acute'
      }
    ]

    return {
      requiresIntervention,
      riskLevel,
      suggestedActions: requiresIntervention ? [
        'Contactează imediat un professional',
        'Sună la un serviciu de urgență',
        'Mergi la cel mai apropiat spital',
        'Contactează o persoană de încredere'
      ] : [],
      emergencyResources: requiresIntervention ? emergencyResources : []
    }
  }

  // ================================
  // TOKEN USAGE TRACKING
  // ================================
  async trackTokenUsage(
    userId: string,
    ecosystem: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    totalCost: number
  ) {
    await this.database.logUserActivity(
      userId,
      ecosystem,
      'ai_token_usage',
      {
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        cost_cents: Math.round(totalCost * 100)
      }
    )
  }
}

// ================================
// LIB/AI/THERAPIST-SERVICE.TS - PORWELL AI
// ================================
export class TherapistService extends AIService {
  
  async provideMentalHealthSupport(
    userId: string,
    message: string,
    conversationHistory: any[] = []
  ): Promise<{
    response: string
    techniques: string[]
    homework?: string[]
    resources?: any[]
    requiresIntervention: boolean
  }> {
    try {
      // Safety check first
      const crisisCheck = await this.detectCrisis(message, userId)
      
      if (crisisCheck.requiresIntervention) {
        return {
          response: `Îmi pare rău că treci prin această perioadă dificilă. Siguranța ta este prioritatea mea. Te rog să contactezi imediat unul dintre serviciile de urgență de mai jos sau să mergi la cel mai apropiat spital.\n\nNu ești singur/ă în această situație și există ajutor disponibil 24/7.`,
          techniques: ['crisis_intervention'],
          resources: crisisCheck.emergencyResources,
          requiresIntervention: true
        }
      }

      // Content moderation
      const moderation = await this.moderateContent(message)
      if (!moderation.safe) {
        return {
          response: 'Înțeleg că poate fi dificil să îți exprimi sentimentele. Să încercăm să reformulăm într-un mod care ne permite să avem o conversație constructivă.',
          techniques: ['redirection'],
          requiresIntervention: false
        }
      }

      // Get user mood history for context
      const moodHistory = await this.database.getMoodHistory(userId, 7)
      const recentMoods = moodHistory.success ? moodHistory.data.slice(0, 3) : []

      // Generate therapeutic response
      const systemPrompt = this.buildTherapistSystemPrompt(recentMoods)
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory.slice(-6), // Last 6 messages for context
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
        presence_penalty: 0.2,
        frequency_penalty: 0.1
      })

      const response = completion.choices[0].message.content || ''
      
      // Extract techniques used
      const techniques = this.identifyTherapeuticTechniques(response)
      
      // Generate homework if appropriate
      const homework = await this.generateTherapeuticHomework(message, techniques)
      
      // Get relevant resources
      const resources = await this.getRelevantResources(techniques)

      // Save conversation
      await this.database.saveAIConversation({
        userId,
        ecosystem: 'por-well',
        aiModel: 'gpt-4-turbo',
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: response }
        ],
        totalTokens: completion.usage?.total_tokens,
        costCents: this.calculateCost(completion.usage?.total_tokens || 0, 'gpt-4-turbo')
      })

      return {
        response,
        techniques,
        homework,
        resources,
        requiresIntervention: false
      }
    } catch (error) {
      console.error('Mental health support error:', error)
      return {
        response: 'Îmi pare rău, dar întâmpin o problemă tehnică. Te rog să încerci din nou în câteva momente sau să contactezi suportul nostru.',
        techniques: [],
        requiresIntervention: false
      }
    }
  }

  private buildTherapistSystemPrompt(recentMoods: any[]): string {
    const moodContext = recentMoods.length > 0 
      ? `Starea de spirit recentă a utilizatorului: ${recentMoods.map(m => `${m.mood_score}/10`).join(', ')}`
      : ''

    return `Ești un terapeut AI empatic și profesionist, specializat în terapia cognitiv-comportamentală (CBT), terapia dialectică comportamentală (DBT) și tehnici de mindfulness. Vorbești în română cu utilizatori din România.

PRINCIPII FUNDAMENTALE:
- Oferă suport emoțional autentic și empatic
- Folosește tehnici terapeutice validate științific
- Mențină întotdeauna granițele profesionale
- Recomandă ajutor profesional când este necesar
- Nu diagnostica sau prescrie medicatie

STIL DE COMUNICARE:
- Cald, empatic și fără judecăți
- Folosește întrebări deschise pentru explorare
- Reflectă sentimentele utilizatorului
- Oferă validare emoțională
- Încurajează autocunoașterea

${moodContext}

Răspunde cu maximum 150-200 cuvinte, focusat și practic.`
  }

  private identifyTherapeuticTechniques(response: string): string[] {
    const techniques = []
    const lowerResponse = response.toLowerCase()

    if (lowerResponse.includes('gânduri') || lowerResponse.includes('credințe')) {
      techniques.push('cognitive_restructuring')
    }
    if (lowerResponse.includes('respirație') || lowerResponse.includes('relaxare')) {
      techniques.push('relaxation_techniques')
    }
    if (lowerResponse.includes('mindfulness') || lowerResponse.includes('prezent')) {
      techniques.push('mindfulness')
    }
    if (lowerResponse.includes('simți') || lowerResponse.includes('emoții')) {
      techniques.push('emotion_regulation')
    }
    if (lowerResponse.includes('comportament') || lowerResponse.includes('acțiuni')) {
      techniques.push('behavioral_activation')
    }

    return techniques
  }

  private async generateTherapeuticHomework(message: string, techniques: string[]): Promise<string[]> {
    const homework = []

    if (techniques.includes('mindfulness')) {
      homework.push('Practică 5 minute de respirație conștientă zilnic')
    }
    if (techniques.includes('cognitive_restructuring')) {
      homework.push('Notează 3 gânduri negative și reformulează-le pozitiv')
    }
    if (techniques.includes('emotion_regulation')) {
      homework.push('Ține un jurnal de emoții timp de 3 zile')
    }

    return homework
  }

  private async getRelevantResources(techniques: string[]): Promise<any[]> {
    const resources = []

    if (techniques.includes('mindfulness')) {
      resources.push({
        type: 'meditation',
        title: 'Meditație ghidată de 10 minute',
        url: '/resources/meditation/basic-10min'
      })
    }
    if (techniques.includes('relaxation_techniques')) {
      resources.push({
        type: 'audio',
        title: 'Exerciții de relaxare progresivă',
        url: '/resources/audio/progressive-relaxation'
      })
    }

    return resources
  }
}

// ================================
// LIB/AI/NUTRITION-SERVICE.TS - PORHEALTH AI
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
    }
  ): Promise<{
    mealPlan: any
    shoppingList: any[]
    nutritionSummary: any
    estimatedCost: number
  }> {
    try {
      // Get user health profile
      const userProfile = await this.database.getUserProfile(userId)
      const healthData = userProfile.data?.user_health_profiles?.[0]

      const systemPrompt = `Ești un nutriționist AI expert, specializat în planificarea meselor pentru utilizatori din România. Creezi planuri personalizate de mese sănătoase și echilibrate.

CONTEXT UTILIZATOR:
- Calorii țintă: ${preferences.targetCalories}
- Restricții dietetice: ${preferences.dietaryRestrictions.join(', ') || 'Niciunele'}
- Alergii: ${preferences.allergies.join(', ') || 'Niciunele'}
- Preferințe culinare: ${preferences.cuisinePreferences.join(', ') || 'Tradițională românească'}
- Numărul de mese: ${preferences.mealsPerDay}
- Buget: ${preferences.budget || 'medium'}
${healthData ? `- Greutate: ${healthData.weight_kg}kg, Înălțime: ${healthData.height_cm}cm` : ''}

CERINȚE:
1. Creează un plan de mese pentru 7 zile
2. Respectă strict restricțiile și alergiile
3. Folosește ingrediente disponibile în România
4. Calculează precis macronutrienții
5. Generează listă de cumpărături organizată
6. Estimează costurile în LEI

Răspunde DOAR cu JSON valid în următorul format:
{
  "weeklyPlan": {
    "day1": {
      "breakfast": {
        "name": "Nume mic dejun",
        "ingredients": ["ingredient1", "ingredient2"],
        "calories": 300,
        "protein": 15,
        "carbs": 40,
        "fat": 10,
        "preparationTime": 15,
        "instructions": "Pași de preparare..."
      },
      "lunch": {...},
      "dinner": {...}
    }
  },
  "shoppingList": [
    {
      "category": "Legume",
      "items": [
        {"name": "Roșii", "quantity": "1kg", "estimatedPrice": 8}
      ]
    }
  ],
  "nutritionSummary": {
    "dailyAverageCalories": 1800,
    "proteinPercentage": 20,
    "carbsPercentage": 50,
    "fatPercentage": 30
  },
  "totalEstimatedCost": 150
}`

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generează planul de mese personalizat." }
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      })

      const response = completion.choices[0].message.content
      const mealPlanData = JSON.parse(response || '{}')

      // Save meal plan to database
      await this.database.logUserActivity(
        userId,
        'por-health',
        'meal_plan_generated',
        {
          target_calories: preferences.targetCalories,
          dietary_restrictions: preferences.dietaryRestrictions,
          estimated_cost: mealPlanData.totalEstimatedCost
        }
      )

      // Save conversation
      await this.database.saveAIConversation({
        userId,
        ecosystem: 'por-health',
        aiModel: 'gpt-4-turbo',
        messages: [
          { role: 'user', content: JSON.stringify(preferences) },
          { role: 'assistant', content: response || '' }
        ],
        totalTokens: completion.usage?.total_tokens,
        costCents: this.calculateCost(completion.usage?.total_tokens || 0, 'gpt-4-turbo')
      })

      return {
        mealPlan: mealPlanData.weeklyPlan,
        shoppingList: mealPlanData.shoppingList,
        nutritionSummary: mealPlanData.nutritionSummary,
        estimatedCost: mealPlanData.totalEstimatedCost
      }
    } catch (error) {
      console.error('Generate meal plan error:', error)
      throw new Error('Eroare la generarea planului de mese')
    }
  }

  async analyzeFoodPhoto(
    userId: string,
    imageBase64: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ): Promise<{
    recognizedFoods: any[]
    estimatedCalories: number
    macronutrients: any
    healthScore: number
    suggestions: string[]
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "Ești un nutriționist AI expert în analiza fotografiilor cu mâncare. Analizezi cu precizie conținutul nutrițional al meselor din imagini."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analizează această fotografie cu mâncare și furnizează:
1. Lista alimentelor recunoscute cu cantitățile estimate
2. Calculul caloriilor totale
3. Macronutrienții (proteine, carbohidrați, grăsimi)
4. Un scor de sănătate (1-10)
5. Sugestii de îmbunătățire

Răspunde în format JSON.`
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

      const response = completion.choices[0].message.content
      const analysisData = JSON.parse(response || '{}')

      // Log food analysis
      await this.database.logUserActivity(
        userId,
        'por-health',
        'food_photo_analyzed',
        {
          meal_type: mealType,
          estimated_calories: analysisData.estimatedCalories,
          health_score: analysisData.healthScore
        }
      )

      return analysisData
    } catch (error) {
      console.error('Analyze food photo error:', error)
      throw new Error('Eroare la analiza fotografiei cu mâncare')
    }
  }
}

// ================================
// LIB/AI/HOMEWORK-SERVICE.TS - PORKIDS AI
// ================================
export class HomeworkService extends AIService {

  async analyzeHomework(
    childId: string,
    imageBase64: string,
    subject: string,
    gradeLevel: number
  ): Promise<{
    recognizedText: string
    problemType: string
    solution: any
    explanation: string[]
    practiceProblems: any[]
    learningGaps: string[]
  }> {
    try {
      // Get child profile for personalization
      const childProfile = await this.database.supabaseAdmin
        .from('child_profiles')
        .select('*')
        .eq('id', childId)
        .single()

      const systemPrompt = `Ești un profesor AI expert, specializat în educația copiilor. Analizezi temele și oferi explicații pas cu pas, adaptate pentru clasa ${gradeLevel}.

PRINCIPII EDUCAȚIONALE:
- Explică pas cu pas, clar și simplu
- Folosește metode vizuale când e posibil
- Încurajează gândirea critică
- Adaptează explicația la vârsta copilului
- Identifică lacunele în învățare
- Generează probleme de exersare similare

CONTEXT COPIL:
- Clasa: ${gradeLevel}
- Materia: ${subject}
${childProfile?.data?.learning_style ? `- Stil de învățare: ${childProfile.data.learning_style}` : ''}

Analizează imaginea cu tema și răspunde în format JSON cu:
{
  "recognizedText": "textul recunoscut din imagine",
  "problemType": "tipul problemei",
  "solution": {
    "steps": ["pasul 1", "pasul 2"],
    "finalAnswer": "răspunsul final",
    "visualization": "descriere diagramă/desen explicativ"
  },
  "explanation": ["explicație adaptată vârstei"],
  "practiceProblems": [
    {
      "problem": "problemă similară",
      "hint": "indiciu",
      "solution": "răspuns"
    }
  ],
  "learningGaps": ["concepte ce trebuie întărite"]
}`

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analizează această temă la ${subject} pentru clasa ${gradeLevel} și oferă o explicație pas cu pas.`
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
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      })

      const response = completion.choices[0].message.content
      const homeworkData = JSON.parse(response || '{}')

      // Save homework submission
      await this.database.saveHomeworkSubmission(childId, {
        subject,
        imageUrl: `data:image/jpeg;base64,${imageBase64.substring(0, 100)}...`, // Truncated for storage
        ocrText: homeworkData.recognizedText,
        aiSolution: homeworkData.solution,
        parentApproved: false
      })

      // Log activity
      await this.database.logUserActivity(
        childProfile?.data?.parent_id,
        'por-kids',
        'homework_analyzed',
        {
          child_id: childId,
          subject,
          grade_level: gradeLevel,
          problem_type: homeworkData.problemType
        }
      )

      return homeworkData
    } catch (error) {
      console.error('Analyze homework error:', error)
      throw new Error('Eroare la analiza temei')
    }
  }

  async generatePracticeProblems(
    childId: string,
    subject: string,
    concept: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 5
  ): Promise<{
    problems: any[]
    rewards: any
    achievements: string[]
  }> {
    try {
      const childProfile = await this.database.supabaseAdmin
        .from('child_profiles')
        .select('*')
        .eq('id', childId)
        .single()

      if (!childProfile.data) throw new Error('Child profile not found')

      const systemPrompt = `Ești un profesor AI care creează probleme de exersare distractive și educative.

CONTEXT:
- Copil: ${childProfile.data.name}, clasa ${childProfile.data.grade_level}
- Materia: ${subject}
- Conceptul: ${concept}
- Dificultate: ${difficulty}
- Numărul de probleme: ${count}

Creează probleme gamificate cu:
- Povești captivante
- Personaje amuzante
- Elemente de joc
- Recompense virtuale
- Explicații încurajatoare

Răspunde în format JSON:
{
  "problems": [
    {
      "id": 1,
      "story": "poveste captivantă cu problema",
      "question": "întrebarea clară",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "B",
      "explanation": "explicație prietenoasă",
      "hint": "indiciu util",
      "points": 10,
      "badge": "nume insignă"
    }
  ],
  "totalPoints": 50,
  "unlockedContent": "conținut deblocat",
  "encouragement": "mesaj de încurajare"
}`

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generează ${count} probleme de ${difficulty} la ${concept} pentru ${subject}.` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })

      const response = completion.choices[0].message.content
      const problemsData = JSON.parse(response || '{}')

      // Log practice session
      await this.database.logUserActivity(
        childProfile.data.parent_id,
        'por-kids',
        'practice_problems_generated',
        {
          child_id: childId,
          subject,
          concept,
          difficulty,
          problem_count: count
        }
      )

      return {
        problems: problemsData.problems,
        rewards: {
          totalPoints: problemsData.totalPoints,
          unlockedContent: problemsData.unlockedContent
        },
        achievements: [problemsData.encouragement]
      }
    } catch (error) {
      console.error('Generate practice problems error:', error)
      throw new Error('Eroare la generarea problemelor de exersare')
    }
  }
}

// ================================
// LIB/AI/FINANCIAL-SERVICE.TS - PORMIND AI
// ================================
export class FinancialService extends AIService {

  async provideFinancialAdvice(
    userId: string,
    question: string,
    context: {
      monthlyIncome?: number
      currentSavings?: number
      financialGoals?: string[]
      riskTolerance?: string
    } = {}
  ): Promise<{
    advice: string
    actionItems: string[]
    resources: any[]
    riskWarning?: string
    disclaimer: string
  }> {
    try {
      // Get user financial profile
      const userProfile = await this.database.getUserProfile(userId)
      const financialData = userProfile.data?.financial_profiles?.[0]

      const systemPrompt = `Ești un consultant financiar AI expert, specializat în educația financiară pentru utilizatori din România. Oferi sfaturi practice și educative despre bani, investiții și planificare financiară.

PRINCIPII FUNDAMENTALE:
- Oferă doar sfaturi educative, nu recomandări specifice de investiții
- Adaptează sfaturile la contextul economic român
- Menționează riscurile și disclaimerii necesare
- Folosește termeni financiari români
- Încurajează educația financiară continuă

CONTEXT UTILIZATOR:
- Venit lunar: ${context.monthlyIncome || financialData?.monthly_income || 'Necunoscut'} RON
- Economii: ${context.currentSavings || 'Necunoscute'}
- Obiective: ${context.financialGoals?.join(', ') || 'Nespecificate'}
- Toleranța la risc: ${context.riskTolerance || financialData?.risk_tolerance || 'Medie'}

IMPORTANT: Adaugă întotdeauna disclaimer că nu oferă consiliere financiară personalizată și recomandă consultarea unui consultant financiar autorizat pentru decizii importante.

Răspunde profesional, educativ și practic în română.`

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.4,
        max_tokens: 1000
      })

      const advice = completion.choices[0].message.content || ''
      
      // Extract action items from response
      const actionItems = this.extractActionItems(advice)
      
      // Get relevant financial resources
      const resources = await this.getFinancialResources(question)
      
      // Check if high-risk content needs warning
      const riskWarning = this.assessRiskWarning(question, advice)

      // Save conversation
      await this.database.saveAIConversation({
        userId,
        ecosystem: 'por-mind',
        aiModel: 'gpt-4-turbo',
        messages: [
          { role: 'user', content: question },
          { role: 'assistant', content: advice }
        ],
        totalTokens: completion.usage?.total_tokens,
        costCents: this.calculateCost(completion.usage?.total_tokens || 0, 'gpt-4-turbo')
      })

      return {
        advice,
        actionItems,
        resources,
        riskWarning,
        disclaimer: 'Acest sfat este doar în scop educativ. Pentru decizii financiare importante, consultă un consilier financiar autorizat. Investițiile comportă riscuri și randamentele trecute nu garantează rezultatele viitoare.'
      }
    } catch (error) {
      console.error('Financial advice error:', error)
      throw new Error('Eroare la furnizarea sfaturilor financiare')
    }
  }

  async analyzeBudget(
    userId: string,
    monthlyIncome: number,
    expenses: { category: string; amount: number }[]
  ): Promise<{
    analysis: any
    recommendations: string[]
    savingsOpportunities: any[]
    budgetPlan: any
  }> {
    try {
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
      const savingsRate = ((monthlyIncome - totalExpenses) / monthlyIncome) * 100

      const systemPrompt = `Ești un expert în planificarea bugetului personal pentru România. Analizezi veniturile și cheltuielile utilizatorilor și oferi recomandări practice.

VENIT LUNAR: ${monthlyIncome} RON
CHELTUIELI:
${expenses.map(exp => `- ${exp.category}: ${exp.amount} RON`).join('\n')}

TOTAL CHELTUIELI: ${totalExpenses} RON
RATA DE ECONOMISIRE: ${savingsRate.toFixed(1)}%

Analizează bugetul și oferă:
1. Analiza detaliată a cheltuielilor
2. Recomandări de optimizare
3. Oportunități de economisire
4. Plan de buget 50/30/20 adaptat

Răspunde în format JSON:
{
  "analysis": {
    "totalIncome": ${monthlyIncome},
    "totalExpenses": ${totalExpenses},
    "savingsRate": ${savingsRate.toFixed(1)},
    "expensesByCategory": {...},
    "healthScore": "scor 1-10"
  },
  "recommendations": ["recomandare 1", "recomandare 2"],
  "savingsOpportunities": [
    {
      "category": "categoria",
      "currentSpending": 500,
      "recommendedSpending": 400,
      "potentialSavings": 100,
      "tips": ["sfat 1", "sfat 2"]
    }
  ],
  "budgetPlan": {
    "needs": "50%",
    "wants": "30%", 
    "savings": "20%"
  }
}`

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Analizează acest buget și oferă recomandări." }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })

      const response = completion.choices[0].message.content
      const budgetData = JSON.parse(response || '{}')

      // Save budget analysis
      await this.database.logUserActivity(
        userId,
        'por-mind',
        'budget_analyzed',
        {
          monthly_income: monthlyIncome,
          total_expenses: totalExpenses,
          savings_rate: savingsRate,
          health_score: budgetData.analysis?.healthScore
        }
      )

      return budgetData
    } catch (error) {
      console.error('Budget analysis error:', error)
      throw new Error('Eroare la analiza bugetului')
    }
  }

  private extractActionItems(advice: string): string[] {
    const actionItems = []
    const lines = advice.split('\n')
    
    for (const line of lines) {
      if (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')) {
        const cleanLine = line.replace(/[•\-\d\.]/g, '').trim()
        if (cleanLine.length > 10) {
          actionItems.push(cleanLine)
        }
      }
    }
    
    return actionItems.slice(0, 5) // Max 5 action items
  }

  private async getFinancialResources(question: string): Promise<any[]> {
    const resources = []
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes('investiții') || lowerQuestion.includes('acțiuni')) {
      resources.push({
        type: 'article',
        title: 'Ghidul Investițiilor pentru Începători',
        url: '/resources/investing-guide-romania'
      })
    }
    
    if (lowerQuestion.includes('buget') || lowerQuestion.includes('cheltuieli')) {
      resources.push({
        type: 'calculator',
        title: 'Calculator de Buget Personal',
        url: '/tools/budget-calculator'
      })
    }

    return resources
  }

  private assessRiskWarning(question: string, advice: string): string | undefined {
    const highRiskKeywords = ['investiții', 'acțiuni', 'crypto', 'bitcoin', 'risc mare']
    const lowerContent = (question + ' ' + advice).toLowerCase()
    
    const hasHighRisk = highRiskKeywords.some(keyword => lowerContent.includes(keyword))
    
    if (hasHighRisk) {
      return '⚠️ ATENȚIE: Investițiile comportă riscuri semnificative de pierdere. Nu investi niciodată bani pe care nu îți permiți să îi pierzi.'
    }
    
    return undefined
  }

  // ================================
  // COST CALCULATION HELPER
  // ================================
  protected calculateCost(tokens: number, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo': { input: 0.01, output: 0.03 }, // per 1K tokens
      'gpt-4-vision-preview': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
    }
    
    const modelPricing = pricing[model] || pricing['gpt-4-turbo']
    return (tokens / 1000) * modelPricing.input // Simplified calculation
  }
}

// ================================
// API ROUTES FOR AI SERVICES
// ================================

// APP/API/AI/THERAPY/ROUTE.TS
export async function POST(request: Request) {
  try {
    const { userId, message, conversationHistory } = await request.json()
    
    if (!userId || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const therapistService = new TherapistService()
    const result = await therapistService.provideMentalHealthSupport(
      userId,
      message,
      conversationHistory
    )

    return Response.json(result)
  } catch (error) {
    console.error('Therapy API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// APP/API/AI/NUTRITION/ROUTE.TS
export async function POST(request: Request) {
  try {
    const { userId, action, data } = await request.json()
    
    if (!userId || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const nutritionService = new NutritionService()
    
    let result
    switch (action) {
      case 'generate_meal_plan':
        result = await nutritionService.generateMealPlan(userId, data)
        break
      case 'analyze_food_photo':
        result = await nutritionService.analyzeFoodPhoto(userId, data.image, data.mealType)
        break
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    return Response.json(result)
  } catch (error) {
    console.error('Nutrition API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// APP/API/AI/HOMEWORK/ROUTE.TS
export async function POST(request: Request) {
  try {
    const { childId, action, data } = await request.json()
    
    if (!childId || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const homeworkService = new HomeworkService()
    
    let result
    switch (action) {
      case 'analyze_homework':
        result = await homeworkService.analyzeHomework(
          childId,
          data.image,
          data.subject,
          data.gradeLevel
        )
        break
      case 'generate_practice':
        result = await homeworkService.generatePracticeProblems(
          childId,
          data.subject,
          data.concept,
          data.difficulty,
          data.count
        )
        break
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    return Response.json(result)
  } catch (error) {
    console.error('Homework API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// APP/API/AI/FINANCIAL/ROUTE.TS
export async function POST(request: Request) {
  try {
    const { userId, action, data } = await request.json()
    
    if (!userId || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const financialService = new FinancialService()
    
    let result
    switch (action) {
      case 'get_advice':
        result = await financialService.provideFinancialAdvice(
          userId,
          data.question,
          data.context
        )
        break
      case 'analyze_budget':
        result = await financialService.analyzeBudget(
          userId,
          data.monthlyIncome,
          data.expenses
        )
        break
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    return Response.json(result)
  } catch (error) {
    console.error('Financial API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}