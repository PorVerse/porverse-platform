import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined
})

export class AIService {
  async generateNutritionPlan(data: any) {
    const prompt = `Create a detailed nutrition plan in Romanian for:
- Age: ${data.age || 30}
- Weight: ${data.weight || 70}kg  
- Height: ${data.height || 170}cm
- Goal: ${data.goal || 'maintain weight'}
- Activity: ${data.activity || 'moderate'}
- Restrictions: ${data.restrictions?.join(', ') || 'none'}

Provide JSON with: dailyCalories, meals (breakfast/lunch/dinner with foods and calories), macros (protein/carbs/fat in grams), shoppingList array, tips array.`

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content!)
  }

  async analyzeHomework(imageData: string, subject: string, grade: number) {
    const prompt = `Analyze this ${subject} homework for grade ${grade} student in Romania. 
Text from image: "${imageData}"

Provide JSON with: problemType, stepByStepSolution array, explanation in Romanian, concepts array, practiceExercises array, difficulty (1-5), estimatedTime minutes.`

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content!)
  }

  async generateFinancialAdvice(data: any) {
    const prompt = `Provide financial advice in Romanian for:
- Income: ${data.monthly_income || 5000} ${data.currency || 'RON'}/month
- Age: ${data.age || 30}
- Risk tolerance: ${data.risk_tolerance || 'medium'}
- Goals: ${data.goals?.join(', ') || 'save money'}
- Country: Romania

Focus on Romanian financial products, taxes, and regulations. Provide JSON with: budgetBreakdown object, investmentSuggestions array, savingsTips array, riskAssessment, taxOptimization array, disclaimer.`

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content!)
  }

  async generateStrategicInsights(data: any) {
    const prompt = `Provide strategic business insights for:
- Industry: ${data.industry || 'technology'}
- Company size: ${data.company_size || 'startup'}
- Goals: ${data.goals?.join(', ') || 'growth'}
- Market: ${data.market || 'Romania'}
- Timeline: ${data.timeline || '1 year'}

Provide JSON with: marketAnalysis, opportunities array, threats array, recommendations array, kpis array, actionPlan with items having action/timeline/priority.`

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content!)
  }

  async generateTherapeuticResponse(data: any) {
    const prompt = `You are an empathetic Romanian therapist. User says: "${data.message}"
Mood: ${data.mood_score || 5}/10, Anxiety: ${data.anxiety_level || 5}/10

Respond with therapeutic support in Romanian. Provide JSON with: response (therapeutic message), techniques array (CBT/DBT techniques used), mood_impact (predicted mood improvement 1-10), crisis_level (none/low/medium/high), resources array if needed, follow_up_questions array.`

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content!)
  }

  async generateWorkoutPlan(data: any) {
    const prompt = `Create workout plan for:
- Fitness level: ${data.fitness_level || 'beginner'}
- Goals: ${data.goals?.join(', ') || 'general fitness'}
- Equipment: ${data.equipment?.join(', ') || 'bodyweight'}
- Days per week: ${data.days_per_week || 3}
- Minutes per session: ${data.minutes_per_session || 30}

Provide JSON with: weeklyPlan object (day1-7 with exercises array), exerciseDetails object, progressionTips array, nutritionTips array, estimatedResults.`

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1200,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content!)
  }

  async optimizeSchedule(data: any) {
    const prompt = `Optimize daily schedule for:
- Tasks: ${JSON.stringify(data.tasks || [])}
- Work hours: ${data.work_hours || '9-17'}
- Energy peaks: ${data.energy_peaks || 'morning'}
- Break preferences: ${data.break_preferences || '15min every 2h'}
- Priorities: ${data.priorities?.join(', ') || 'work tasks'}

Provide JSON with: optimizedSchedule array (time/task/duration), productivityTips array, energyManagement, focusBlocks array, estimatedEfficiency percentage.`

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    })

    return JSON.parse(response.choices[0].message.content!)
  }

  // Helper method for error handling
  private async callAI(prompt: string, maxTokens: number = 1000) {
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: "json_object" }
      })

      return JSON.parse(response.choices[0].message.content!)
    } catch (error) {
      console.error('AI API Error:', error)
      throw new Error('AI service temporarily unavailable')
    }
  }
}

export const aiService = new AIService()
export default AIService