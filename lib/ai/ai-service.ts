// lib/ai/ai-service.ts
// Funcționează cu:
// - OPENAI_API_KEY  (OpenAI direct)
// - sau OPENROUTER_API_KEY (+ optional OPENROUTER_BASE_URL)
//
// Notă: cu OpenRouter, modelele se scriu "anthropic/claude-3-haiku", "openai/gpt-4o-mini", etc.
// Dacă vezi că un model nu răspunde JSON, încercăm fallback de parsare.

import OpenAI from 'openai'

const useOpenRouter = !!process.env.OPENROUTER_API_KEY

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: useOpenRouter
    ? (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1')
    : undefined,
  // OpenRouter apreciază aceste header‑e (opționale):
  // defaultHeaders: useOpenRouter
  //   ? { 'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://porverse.com', 'X-Title': 'PorVerse' }
  //   : undefined,
})

/** Selectoare de model (ușor de schimbat dintr-un singur loc) */
const MODELS = {
  json_small: useOpenRouter ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
  json_medium: useOpenRouter ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
  json_large: useOpenRouter ? 'anthropic/claude-3-haiku' : 'gpt-4o-mini',
}

/** Încearcă să scoată JSON sigur (fie din content direct, fie dintr-un code block) */
function safeJsonParse(content: string | null | undefined) {
  if (!content) throw new Error('Empty AI response content')

  // direct
  try {
    return JSON.parse(content)
  } catch {}

  // caută ```json ... ```
  const block = content.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (block?.[1]) {
    try {
      return JSON.parse(block[1].trim())
    } catch {}
  }

  // încearcă să taie text până la primul { și ultimul }
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    const slice = content.slice(start, end + 1)
    try {
      return JSON.parse(slice)
    } catch {}
  }

  // dacă tot nu merge, aruncă eroare cu primii 200 de char pentru debug
  throw new Error('AI response is not valid JSON: ' + content.slice(0, 200))
}

/** Apel generic care cere JSON; pe OpenAI merge cu response_format, pe OpenRouter poate ignora — avem fallback. */
async function chatJson(
  prompt: string,
  {
    model = MODELS.json_small,
    max_tokens = 1000,
    temperature = 0.7,
  }: { model?: string; max_tokens?: number; temperature?: number } = {}
) {
  const res = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens,
    // OpenAI suportă response_format; pe OpenRouter unele modele îl ignoră → fallback-ul nostru acoperă
    response_format: { type: 'json_object' } as any,
  })

  const content = res.choices?.[0]?.message?.content ?? ''
  return safeJsonParse(content)
}

export class AIService {
  async generateNutritionPlan(data: any) {
    const prompt = `Create a detailed nutrition plan in Romanian for:
- Age: ${data.age ?? 30}
- Weight: ${data.weight ?? 70} kg
- Height: ${data.height ?? 170} cm
- Goal: ${data.goal ?? 'maintain weight'}
- Activity: ${data.activity ?? 'moderate'}
- Restrictions: ${Array.isArray(data.restrictions) ? data.restrictions.join(', ') : 'none'}

Return JSON with keys:
dailyCalories:number,
macros:{protein:number,carbs:number,fat:number},
meals:{breakfast:{items:[{name,calories}]},lunch:{items:[...]},dinner:{items:[...]}},
shoppingList:string[],
tips:string[]`

    return await chatJson(prompt, { model: MODELS.json_medium, max_tokens: 1200, temperature: 0.7 })
  }

  async analyzeHomework(imageData: string, subject: string, grade: number) {
    const prompt = `Analyze the following ${subject} homework for a grade ${grade} student in Romania.
Image OCR text: """${imageData}"""

Return JSON with keys:
problemType:string,
stepByStepSolution:string[],
explanation:string,
concepts:string[],
practiceExercises:string[],
difficulty:1|2|3|4|5,
estimatedTime:number`
    return await chatJson(prompt, { model: MODELS.json_large, max_tokens: 1400, temperature: 0.3 })
  }

  async generateFinancialAdvice(data: any) {
    const prompt = `You are a Romanian financial coach.
Input:
- Income: ${data.monthly_income ?? 5000} ${data.currency ?? 'RON'}/month
- Age: ${data.age ?? 30}
- Risk tolerance: ${data.risk_tolerance ?? 'medium'}
- Goals: ${Array.isArray(data.goals) ? data.goals.join(', ') : 'save money'}
- Country: Romania

Return JSON with keys:
budgetBreakdown:{needs:number,wants:number,savings:number},
investmentSuggestions:string[],
savingsTips:string[],
riskAssessment:string,
taxOptimization:string[],
disclaimer:string`
    return await chatJson(prompt, { model: MODELS.json_medium, max_tokens: 1200, temperature: 0.6 })
  }

  async generateStrategicInsights(data: any) {
    const prompt = `Provide strategic business insights.
Context:
- Industry: ${data.industry ?? 'technology'}
- Company size: ${data.company_size ?? 'startup'}
- Goals: ${Array.isArray(data.goals) ? data.goals.join(', ') : 'growth'}
- Market: ${data.market ?? 'Romania'}
- Timeline: ${data.timeline ?? '1 year'}

Return JSON with keys:
marketAnalysis:string,
opportunities:string[],
threats:string[],
recommendations:{action:string,impact:'low'|'medium'|'high'}[],
kpis:string[],
actionPlan:{action:string,timeline:string,priority:'low'|'medium'|'high'}[]`
    return await chatJson(prompt, { model: MODELS.json_medium, max_tokens: 1400, temperature: 0.7 })
  }

  async generateTherapeuticResponse(data: any) {
    const prompt = `You are an empathetic Romanian therapist.
User says: "${data.message}"
Mood: ${data.mood_score ?? 5}/10, Anxiety: ${data.anxiety_level ?? 5}/10

Return JSON with keys:
response:string,
techniques:string[],
mood_impact:number,
crisis_level:'none'|'low'|'medium'|'high',
resources:string[],
follow_up_questions:string[]`
    return await chatJson(prompt, { model: MODELS.json_small, max_tokens: 900, temperature: 0.8 })
  }

  async generateWorkoutPlan(data: any) {
    const prompt = `Create a progressive workout plan.
- Fitness level: ${data.fitness_level ?? 'beginner'}
- Goals: ${Array.isArray(data.goals) ? data.goals.join(', ') : 'general fitness'}
- Equipment: ${Array.isArray(data.equipment) ? data.equipment.join(', ') : 'bodyweight'}
- Days/week: ${data.days_per_week ?? 3}
- Minutes/session: ${data.minutes_per_session ?? 30}

Return JSON with keys:
weeklyPlan:{day1:{exercises:[{name,sets,reps,rest}]},...,day7:{...}},
exerciseDetails:{[name:string]:{cues:string[],alternatives:string[]}},
progressionTips:string[],
nutritionTips:string[],
estimatedResults:string`
    return await chatJson(prompt, { model: MODELS.json_medium, max_tokens: 1400, temperature: 0.6 })
  }

  async optimizeSchedule(data: any) {
    const prompt = `Optimize this daily schedule.
Tasks: ${JSON.stringify(data.tasks ?? [])}
Work hours: ${data.work_hours ?? '9-17'}
Energy peaks: ${data.energy_peaks ?? 'morning'}
Break preferences: ${data.break_preferences ?? '15min every 2h'}
Priorities: ${Array.isArray(data.priorities) ? data.priorities.join(', ') : 'work tasks'}

Return JSON with keys:
optimizedSchedule:{time:string,task:string,duration:number}[],
productivityTips:string[],
energyManagement:string,
focusBlocks:{start:string,end:string,reason:string}[],
estimatedEfficiency:number`
    return await chatJson(prompt, { model: MODELS.json_small, max_tokens: 1200, temperature: 0.5 })
  }
}

export const aiService = new AIService()
export default AIService
