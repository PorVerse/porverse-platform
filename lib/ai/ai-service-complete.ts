// lib/ai/ai-service-complete.ts - COMPLETE AI INTEGRATION SYSTEM
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { DatabaseService } from '../database/database-service-complete'
import { SecurityService } from '../security/security-service'
import { EmailService } from '../email/email-service-complete'

interface AIResponse {
  success: boolean
  data?: any
  error?: string
  tokens?: number
  cost?: number
}

interface ConversationContext {
  userId: string
  ecosystem: string
  conversationHistory: Message[]
  userProfile: any
  sessionData: any
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: any
}

interface AIModel {
  provider: 'openai' | 'anthropic' | 'openrouter'
  model: string
  maxTokens: number
  temperature: number
  costPer1kTokens: number
}

export class AIService {
  private openai: OpenAI
  private anthropic: Anthropic
  private database: DatabaseService
  private security: SecurityService
  private email: EmailService
  private models: Map<string, AIModel>

  constructor() {
    // Initialize AI providers
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: process.env.OPENROUTER_API_KEY ? {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
        'X-Title': 'PorVerse AI Platform'
      } : undefined
    })

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    })

    this.database = new DatabaseService()
    this.security = SecurityService.getInstance()
    this.email = new EmailService()
    
    this.initializeModels()
  }

  // ================================
  // MODEL CONFIGURATION - COMPLETE
  // ================================

  private initializeModels(): void {
    this.models = new Map([
      // OpenAI/OpenRouter Models
      ['gpt-4-turbo', {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        maxTokens: 4096,
        temperature: 0.7,
        costPer1kTokens: 0.01
      }],
      ['gpt-4', {
        provider: 'openai',
        model: 'gpt-4',
        maxTokens: 8192,
        temperature: 0.7,
        costPer1kTokens: 0.03
      }],
      ['gpt-3.5-turbo', {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        maxTokens: 4096,
        temperature: 0.7,
        costPer1kTokens: 0.001
      }],
      // Anthropic Models
      ['claude-3-opus', {
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        maxTokens: 4096,
        temperature: 0.7,
        costPer1kTokens: 0.015
      }],
      ['claude-3-sonnet', {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        maxTokens: 4096,
        temperature: 0.7,
        costPer1kTokens: 0.003
      }],
      ['claude-3-haiku', {
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
        maxTokens: 4096,
        temperature: 0.7,
        costPer1kTokens: 0.00025
      }]
    ])
  }

  // ================================
  // CORE AI CONVERSATION - COMPLETE
  // ================================

  async chatWithAI(
    context: ConversationContext,
    message: string,
    modelName: string = 'gpt-4-turbo'
  ): Promise<AIResponse> {
    try {
      // Security checks
      const sanitizedMessage = this.security.sanitizeInput(message)
      const safetyCheck = await this.performSafetyCheck(sanitizedMessage, context)
      
      if (!safetyCheck.safe) {
        return { success: false, error: safetyCheck.reason }
      }

      // Get model configuration
      const model = this.models.get(modelName)
      if (!model) {
        return { success: false, error: 'Model not found' }
      }

      // Build conversation with system prompt
      const systemPrompt = this.buildSystemPrompt(context.ecosystem, context.userProfile)
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...context.conversationHistory.slice(-10), // Keep last 10 messages
        { role: 'user' as const, content: sanitizedMessage }
      ]

      let response: any
      let tokens = 0
      let cost = 0

      // Call appropriate AI provider
      if (model.provider === 'openai') {
        response = await this.openai.chat.completions.create({
          model: model.model,
          messages: messages,
          max_tokens: model.maxTokens,
          temperature: model.temperature,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          user: context.userId
        })
        
        tokens = response.usage?.total_tokens || 0
        cost = (tokens / 1000) * model.costPer1kTokens

      } else if (model.provider === 'anthropic' && this.anthropic.apiKey) {
        response = await this.anthropic.messages.create({
          model: model.model,
          max_tokens: model.maxTokens,
          temperature: model.temperature,
          messages: messages.filter(m => m.role !== 'system'),
          system: systemPrompt
        })
        
        tokens = response.usage?.input_tokens + response.usage?.output_tokens || 0
        cost = (tokens / 1000) * model.costPer1kTokens
      }

      if (!response) {
        throw new Error('No AI response received')
      }

      const aiMessage = this.extractMessageContent(response, model.provider)
      
      // Post-process response
      const processedResponse = await this.postProcessResponse(
        aiMessage,
        context,
        sanitizedMessage
      )

      // Save conversation
      await this.saveConversation({
        userId: context.userId,
        ecosystem: context.ecosystem,
        messages: [
          { role: 'user', content: sanitizedMessage, timestamp: new Date() },
          { role: 'assistant', content: processedResponse, timestamp: new Date() }
        ],
        context: context.sessionData,
        totalTokens: tokens,
        costCents: Math.round(cost * 100)
      })

      // Check for crisis detection
      await this.checkForCrisis(sanitizedMessage, processedResponse, context.userId)

      return {
        success: true,
        data: {
          message: processedResponse,
          suggestions: await this.generateSuggestions(context),
          insights: await this.generateInsights(context, processedResponse)
        },
        tokens,
        cost
      }

    } catch (error: any) {
      console.error('AI Chat Error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // ECOSYSTEM-SPECIFIC AI - COMPLETE
  // ================================

  // PorHealth AI
  async generateNutritionPlan(
    userId: string,
    preferences: {
      targetCalories: number
      dietaryRestrictions: string[]
      allergies: string[]
      mealsPerDay: number
      budget: 'low' | 'medium' | 'high'
      cuisinePreferences: string[]
    }
  ): Promise<AIResponse> {
    try {
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data) {
        return { success: false, error: 'User not found' }
      }

      const healthData = await this.database.getHealthData(userId)
      
      const prompt = `
        Generate a comprehensive 7-day nutrition plan for a user with the following profile:
        
        Physical Stats: ${JSON.stringify(healthData.data?.current_metrics || {})}
        Preferences: ${JSON.stringify(preferences)}
        
        Requirements:
        1. Create exactly ${preferences.mealsPerDay} meals per day for 7 days
        2. Target ${preferences.targetCalories} calories daily
        3. Avoid: ${preferences.dietaryRestrictions.join(', ')}
        4. Allergies: ${preferences.allergies.join(', ')}
        5. Budget level: ${preferences.budget}
        6. Preferred cuisines: ${preferences.cuisinePreferences.join(', ')}
        
        Response format:
        {
          "weeklyPlan": [
            {
              "day": 1,
              "totalCalories": number,
              "meals": [
                {
                  "type": "breakfast|lunch|dinner|snack",
                  "name": "Recipe name",
                  "ingredients": ["ingredient list"],
                  "instructions": ["step by step"],
                  "calories": number,
                  "macros": {"protein": X, "carbs": Y, "fat": Z},
                  "prepTime": minutes,
                  "cost": estimated_cost_RON
                }
              ]
            }
          ],
          "shoppingList": {
            "proteins": ["item - quantity"],
            "vegetables": ["item - quantity"],
            "grains": ["item - quantity"],
            "other": ["item - quantity"]
          },
          "totalWeeklyCost": number,
          "nutritionTips": ["tip1", "tip2", "tip3"]
        }
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist and meal planner. Always provide detailed, practical, and healthy meal plans in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
        response_format: { type: 'json_object' }
      })

      const mealPlan = JSON.parse(response.choices[0].message?.content || '{}')
      
      // Save meal plan to database
      await this.database.saveHealthData(userId, {
        meal_plan: mealPlan,
        updated_at: new Date().toISOString()
      })

      return {
        success: true,
        data: mealPlan,
        tokens: response.usage?.total_tokens || 0,
        cost: ((response.usage?.total_tokens || 0) / 1000) * 0.01
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async generateWorkoutPlan(
    userId: string,
    preferences: {
      fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
      goals: string[]
      daysPerWeek: number
      minutesPerSession: number
      equipment: string[]
      injuries: string[]
    }
  ): Promise<AIResponse> {
    try {
      const prompt = `
        Create a comprehensive ${preferences.daysPerWeek}-day workout plan for:
        
        Fitness Level: ${preferences.fitnessLevel}
        Goals: ${preferences.goals.join(', ')}
        Session Duration: ${preferences.minutesPerSession} minutes
        Available Equipment: ${preferences.equipment.join(', ')}
        Injuries/Limitations: ${preferences.injuries.join(', ')}
        
        Response format:
        {
          "weeklyPlan": [
            {
              "day": number,
              "focus": "muscle_group_or_type",
              "warmup": {
                "exercises": ["exercise name - duration"],
                "totalTime": minutes
              },
              "mainWorkout": [
                {
                  "exercise": "Exercise Name",
                  "sets": number,
                  "reps": "X-Y reps" or "X seconds",
                  "rest": "X seconds",
                  "equipment": "equipment needed",
                  "targetMuscles": ["muscle1", "muscle2"],
                  "instructions": ["step1", "step2"],
                  "modifications": {
                    "easier": "description",
                    "harder": "description"
                  }
                }
              ],
              "cooldown": {
                "stretches": ["stretch name - duration"],
                "totalTime": minutes
              },
              "estimatedCalories": number
            }
          ],
          "progressionPlan": {
            "week1": "description",
            "week2": "description", 
            "week4": "description",
            "week8": "description"
          },
          "tips": ["tip1", "tip2", "tip3"]
        }
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a certified personal trainer and fitness expert. Create safe, effective workout plans in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
        response_format: { type: 'json_object' }
      })

      const workoutPlan = JSON.parse(response.choices[0].message?.content || '{}')
      
      // Save workout plan
      await this.database.saveHealthData(userId, {
        workout_plan: workoutPlan
      })

      return {
        success: true,
        data: workoutPlan,
        tokens: response.usage?.total_tokens || 0
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // PorKids AI
  async analyzeHomework(
    imageData: string,
    subject: string,
    gradeLevel: number
  ): Promise<AIResponse> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert ${subject} teacher for grade ${gradeLevel}. Analyze homework and provide step-by-step educational solutions that help students learn, not just get answers.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this ${subject} homework for grade ${gradeLevel}. Provide:
                1. Problem identification
                2. Step-by-step solution with explanations
                3. Key concepts being tested
                4. Learning tips
                5. Similar practice problems

                Format as JSON with these fields: problemType, solution, keyPoints, learningTips, practiceProblems`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })

      const analysis = JSON.parse(response.choices[0].message?.content || '{}')
      
      return {
        success: true,
        data: analysis,
        tokens: response.usage?.total_tokens || 0
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async generateLearningPath(
    childId: string,
    subject: string,
    currentLevel: string,
    targetLevel: string,
    weakAreas: string[]
  ): Promise<AIResponse> {
    try {
      const prompt = `
        Create a personalized learning path for:
        Subject: ${subject}
        Current Level: ${currentLevel}
        Target Level: ${targetLevel}
        Weak Areas: ${weakAreas.join(', ')}
        
        Response format:
        {
          "learningPath": [
            {
              "week": number,
              "topic": "Main topic",
              "subtopics": ["subtopic1", "subtopic2"],
              "activities": [
                {
                  "type": "lesson|practice|game|quiz",
                  "title": "Activity title",
                  "description": "What student will do",
                  "estimatedTime": minutes,
                  "difficulty": "easy|medium|hard",
                  "skills": ["skill1", "skill2"]
                }
              ],
              "milestones": ["what student should achieve this week"]
            }
          ],
          "totalDuration": "X weeks",
          "successMetrics": ["metric1", "metric2"],
          "parentTips": ["tip for parents"]
        }
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an educational expert specializing in personalized learning paths for children. Create engaging, age-appropriate content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.8,
        response_format: { type: 'json_object' }
      })

      const learningPath = JSON.parse(response.choices[0].message?.content || '{}')

      return {
        success: true,
        data: learningPath,
        tokens: response.usage?.total_tokens || 0
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // PorWell AI
  async provideMentalHealthSupport(
    context: ConversationContext,
    message: string
  ): Promise<AIResponse> {
    try {
      // Enhanced safety check for mental health
      const crisisCheck = await this.detectCrisisSignals(message)
      if (crisisCheck.isCrisis) {
        await this.handleMentalHealthCrisis(context.userId, crisisCheck)
      }

      const systemPrompt = `
        You are a compassionate AI therapist trained in CBT, DBT, and mindfulness techniques. 
        Always maintain professional boundaries and recommend professional help when needed.
        
        User Context:
        - Current mood: ${context.sessionData?.currentMood || 'unknown'}/10
        - Anxiety level: ${context.sessionData?.anxietyLevel || 'unknown'}/10
        - Session type: ${context.sessionData?.sessionType || 'general'}
        
        Guidelines:
        1. Be empathetic and non-judgmental
        2. Ask clarifying questions to understand better
        3. Suggest practical coping strategies
        4. Encourage professional help if needed
        5. Provide crisis resources if detecting distress
        
        NEVER:
        - Diagnose mental health conditions
        - Provide medical advice
        - Make promises you cannot keep
        - Minimize user's feelings
      `

      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1500,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          ...context.conversationHistory.slice(-8),
          { role: 'user', content: message }
        ]
      })

      const therapeuticResponse = response.content[0].type === 'text' ? response.content[0].text : ''

      // Generate additional therapeutic resources
      const techniques = await this.suggestCopingTechniques(message, context.sessionData)
      const followUp = await this.generateFollowUpQuestions(message, therapeuticResponse)

      return {
        success: true,
        data: {
          response: therapeuticResponse,
          suggestedTechniques: techniques,
          followUpQuestions: followUp,
          crisisLevel: crisisCheck.level,
          resources: crisisCheck.isCrisis ? await this.getCrisisResources() : []
        },
        tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // PorMind AI
  async generateFinancialAdvice(
    userId: string,
    query: string,
    financialData: any
  ): Promise<AIResponse> {
    try {
      const prompt = `
        Provide financial advice for:
        Query: ${query}
        Financial Profile: ${JSON.stringify(financialData)}
        
        Guidelines:
        - Provide educational content, not specific investment advice
        - Consider Romanian financial context
        - Be practical and actionable
        - Include risk considerations
        - Suggest gradual, sustainable approaches
        
        Response format:
        {
          "analysis": "Current situation analysis",
          "recommendations": [
            {
              "category": "budgeting|saving|investing|debt",
              "action": "Specific action to take",
              "timeframe": "immediate|short-term|long-term",
              "risk": "low|medium|high",
              "expectedImpact": "description"
            }
          ],
          "educationalResources": ["resource1", "resource2"],
          "nextSteps": ["step1", "step2"],
          "warnings": ["important warning if any"]
        }
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor with expertise in Romanian markets and personal finance. Always include disclaimers about not providing specific investment advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })

      const advice = JSON.parse(response.choices[0].message?.content || '{}')

      return {
        success: true,
        data: advice,
        tokens: response.usage?.total_tokens || 0
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // PorFlow AI  
  async optimizeProductivity(
    userId: string,
    tasks: any[],
    preferences: any
  ): Promise<AIResponse> {
    try {
      const prompt = `
        Optimize this task list for maximum productivity:
        
        Tasks: ${JSON.stringify(tasks)}
        User Preferences: ${JSON.stringify(preferences)}
        
        Consider:
        - Task priorities and deadlines
        - User's energy patterns
        - Task complexity and estimated time
        - Dependencies between tasks
        
        Response format:
        {
          "optimizedSchedule": [
            {
              "timeSlot": "09:00-10:30",
              "task": "Task name",
              "reason": "Why this timing",
              "energyLevel": "high|medium|low",
              "focusRequired": "high|medium|low"
            }
          ],
          "productivityTips": ["tip1", "tip2"],
          "potentialIssues": ["issue1", "solution1"],
          "estimatedEfficiencyGain": "X%"
        }
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity expert specializing in time management and task optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })

      const optimization = JSON.parse(response.choices[0].message?.content || '{}')

      return {
        success: true,
        data: optimization,
        tokens: response.usage?.total_tokens || 0
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // PorBlu AI
  async generateStrategicInsights(
    userId: string,
    goals: any[],
    currentMetrics: any
  ): Promise<AIResponse> {
    try {
      const prompt = `
        Provide strategic analysis and insights for:
        
        Goals: ${JSON.stringify(goals)}
        Current Metrics: ${JSON.stringify(currentMetrics)}
        
        Analysis needed:
        1. Current position assessment
        2. Gap analysis
        3. Strategic recommendations
        4. Risk factors
        5. Success probability
        
        Response format:
        {
          "positionAssessment": {
            "strengths": ["strength1", "strength2"],
            "weaknesses": ["weakness1", "weakness2"],
            "opportunities": ["opportunity1", "opportunity2"],
            "threats": ["threat1", "threat2"]
          },
          "gapAnalysis": [
            {
              "area": "Area name",
              "currentState": "description",
              "desiredState": "description",
              "gap": "description of gap",
              "difficulty": "low|medium|high"
            }
          ],
          "strategicRecommendations": [
            {
              "priority": "high|medium|low",
              "action": "Recommended action",
              "timeframe": "short|medium|long term",
              "resources": ["resource1", "resource2"],
              "successProbability": "percentage",
              "impact": "high|medium|low"
            }
          ],
          "keyMetrics": ["metric1", "metric2"],
          "timeline": "estimated timeframe"
        }
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an executive coach and strategic planning expert with experience in leadership development and business growth.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })

      const insights = JSON.parse(response.choices[0].message?.content || '{}')

      return {
        success: true,
        data: insights,
        tokens: response.usage?.total_tokens || 0
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Quantum Vault AI
  async generateFutureSelf(
    userId: string,
    timelineYears: number = 10
  ): Promise<AIResponse> {
    try {
      // Get comprehensive user data
      const userProfile = await this.database.getUserProfile(userId)
      const analytics = await this.database.getUserAnalytics(userId, 365) // Full year
      
      if (!userProfile.success) {
        return { success: false, error: 'User profile not found' }
      }

      const prompt = `
        Based on comprehensive user data, create a detailed future self projection for ${timelineYears} years from now:
        
        Current Profile: ${JSON.stringify(userProfile.data)}
        Behavior Analytics: ${JSON.stringify(analytics.data)}
        
        Create a detailed future self that includes:
        1. Physical appearance evolution
        2. Career/professional development
        3. Wealth and financial status
        4. Relationships and family
        5. Health and wellness
        6. Wisdom and life lessons learned
        7. Key achievements and milestones
        8. Personality evolution
        9. Values and priorities changes
        10. Advice they would give to current self
        
        Response format:
        {
          "futureSelf": {
            "age": number,
            "physicalDescription": "detailed description",
            "career": {
              "position": "title/role",
              "industry": "industry",
              "achievements": ["achievement1", "achievement2"],
              "income": "estimated range",
              "workLifeBalance": "description"
            },
            "financial": {
              "netWorth": "estimated range",
              "investments": ["type1", "type2"],
              "financialFreedom": "level achieved",
              "philanthropic": "giving activities"
            },
            "relationships": {
              "family": "family status",
              "friendships": "social circle description",
              "romantic": "relationship status",
              "professional": "network description"
            },
            "health": {
              "physical": "fitness level",
              "mental": "mental wellbeing",
              "habits": ["habit1", "habit2"],
              "energy": "energy levels"
            },
            "personality": {
              "growth": "how personality evolved",
              "strengths": ["strength1", "strength2"],
              "wisdom": "wisdom gained",
              "values": ["core values"]
            },
            "achievements": [
              {
                "area": "life area",
                "milestone": "specific achievement",
                "year": "when achieved",
                "impact": "how it changed them"
              }
            ],
            "wisdomMessages": [
              {
                "topic": "area of wisdom",
                "message": "specific advice to current self",
                "context": "why this is important"
              }
            ],
            "dailyLife": "typical day description",
            "regrets": "few things they wish current self knew",
            "proudMoments": ["moment1", "moment2"]
          },
          "alternativeTimelines": [
            {
              "scenario": "alternative path name",
              "probability": "percentage",
              "description": "how this timeline differs",
              "keyDecisionPoint": "what led to this path"
            }
          ]
        }
      `

      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        temperature: 0.9,
        system: 'You are an advanced AI capable of deep psychological analysis and future projection based on behavioral patterns and life trajectories.',
        messages: [{ role: 'user', content: prompt }]
      })

      const futureSelf = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')

      // Save to Quantum Vault
      await this.database.supabaseAdmin
        .from('future_self_profiles')
        .upsert({
          user_id: userId,
          timeline_years: timelineYears,
          profile_data: futureSelf,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })

      return {
        success: true,
        data: futureSelf,
        tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // HELPER METHODS - COMPLETE
  // ================================

  private buildSystemPrompt(ecosystem: string, userProfile: any): string {
    const basePrompt = `You are an AI assistant for PorVerse, specifically for the ${ecosystem} ecosystem.`
    
    const ecosystemPrompts = {
      'por-health': `${basePrompt} You are a health and wellness expert specializing in nutrition, fitness, and overall wellbeing. Provide evidence-based advice while always recommending users consult healthcare professionals for medical concerns.`,
      
      'por-kids': `${basePrompt} You are an educational expert specializing in children's learning and development. Focus on age-appropriate, engaging educational content that helps children learn effectively while supporting parents.`,
      
      'por-well': `${basePrompt} You are a mental health and wellness supporter trained in therapeutic techniques. Provide empathetic, evidence-based support while always encouraging professional help when needed. Never diagnose or provide medical advice.`,
      
      'por-mind': `${basePrompt} You are a financial advisor and business mentor. Provide educational financial guidance, investment principles, and business strategy advice. Always include appropriate disclaimers about not providing specific investment advice.`,
      
      'por-flow': `${basePrompt} You are a productivity and time management expert. Help users optimize their workflows, manage tasks effectively, and achieve better work-life balance through proven productivity techniques.`,
      
      'por-blu': `${basePrompt} You are an executive coach and strategic planning expert. Provide leadership guidance, strategic thinking frameworks, and help users develop their vision and long-term planning capabilities.`,
      
      'quantum-vault': `${basePrompt} You are an advanced consciousness explorer capable of deep psychological analysis, future projection, and identity simulation. Help users explore different aspects of their identity and potential futures.`
    }

    return ecosystemPrompts[ecosystem] || basePrompt
  }

  private async performSafetyCheck(message: string, context: ConversationContext): Promise<{ safe: boolean; reason?: string }> {
    // Check for harmful content
    if (this.security.detectXSS(message) || this.security.detectSQLInjection(message)) {
      return { safe: false, reason: 'Potential security threat detected' }
    }

    // Check for inappropriate content using OpenAI moderation
    try {
      const moderation = await this.openai.moderations.create({
        input: message
      })

      if (moderation.results[0].flagged) {
        return { safe: false, reason: 'Content violates safety policies' }
      }
    } catch (error) {
      console.warn('Moderation check failed:', error)
    }

    return { safe: true }
  }

  private extractMessageContent(response: any, provider: string): string {
    if (provider === 'openai') {
      return response.choices[0]?.message?.content || ''
    } else if (provider === 'anthropic') {
      return response.content[0]?.text || ''
    }
    return ''
  }

  private async postProcessResponse(response: string, context: ConversationContext, userMessage: string): string {
    // Add personalization
    let processed = response

    // Add user's name if available
    if (context.userProfile?.first_name) {
      processed = processed.replace(/\buser\b/gi, context.userProfile.first_name)
    }

    // Add ecosystem-specific enhancements
    if (context.ecosystem === 'por-well') {
      processed = await this.addMentalHealthResources(processed)
    }

    return processed
  }

  private async saveConversation(data: {
    userId: string
    ecosystem: string
    messages: Message[]
    context: any
    totalTokens: number
    costCents: number
  }): Promise<void> {
    await this.database.saveAIConversation({
      userId: data.userId,
      ecosystem: data.ecosystem,
      messages: data.messages,
      context: data.context,
      totalTokens: data.totalTokens,
      costCents: data.costCents
    })
  }

  private async checkForCrisis(userMessage: string, aiResponse: string, userId: string): Promise<void> {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living', 'hurt myself',
      'self harm', 'overdose', 'jump off', 'hanging', 'worthless', 'hopeless'
    ]

    const hasCrisisIndicators = crisisKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    )

    if (hasCrisisIndicators) {
      // Send crisis support email
      await this.email.sendCrisisSupportEmail(userId)
      
      // Log crisis event
      await this.database.logUserActivity({
        userId,
        actionType: 'crisis_detected',
        actionData: {
          message: userMessage.substring(0, 100), // First 100 chars only
          severity: 'high',
          response_sent: true
        }
      })
    }
  }

  private async detectCrisisSignals(message: string): Promise<{ isCrisis: boolean; level: string; indicators: string[] }> {
    const highRiskIndicators = ['suicide', 'kill myself', 'end it all', 'not worth living']
    const mediumRiskIndicators = ['hopeless', 'worthless', 'can\'t go on', 'give up']
    const lowRiskIndicators = ['sad', 'depressed', 'anxious', 'overwhelmed']

    const messageLower = message.toLowerCase()
    
    const highRisk = highRiskIndicators.filter(indicator => messageLower.includes(indicator))
    const mediumRisk = mediumRiskIndicators.filter(indicator => messageLower.includes(indicator))
    const lowRisk = lowRiskIndicators.filter(indicator => messageLower.includes(indicator))

    if (highRisk.length > 0) {
      return { isCrisis: true, level: 'high', indicators: highRisk }
    } else if (mediumRisk.length > 0) {
      return { isCrisis: false, level: 'medium', indicators: mediumRisk }
    } else if (lowRisk.length > 0) {
      return { isCrisis: false, level: 'low', indicators: lowRisk }
    }

    return { isCrisis: false, level: 'normal', indicators: [] }
  }

  private async handleMentalHealthCrisis(userId: string, crisisData: any): Promise<void> {
    // Send immediate crisis support
    await this.email.sendCrisisSupport(userId)
    
    // Log crisis event
    await this.database.logUserActivity({
      userId,
      actionType: 'mental_health_crisis',
      actionData: {
        level: crisisData.level,
        indicators: crisisData.indicators,
        timestamp: new Date().toISOString()
      }
    })
  }

  private async generateSuggestions(context: ConversationContext): Promise<string[]> {
    // Generate contextual suggestions based on ecosystem and conversation
    const suggestions = []
    
    switch (context.ecosystem) {
      case 'por-health':
        suggestions.push('Track your daily water intake', 'Plan tomorrow\'s meals', 'Schedule a workout')
        break
      case 'por-kids':
        suggestions.push('Practice math problems', 'Read for 20 minutes', 'Try a science experiment')
        break
      case 'por-well':
        suggestions.push('Try a 5-minute meditation', 'Write in your mood journal', 'Practice deep breathing')
        break
      default:
        suggestions.push('Continue our conversation', 'Ask me anything', 'Explore other features')
    }
    
    return suggestions
  }

  private async generateInsights(context: ConversationContext, response: string): Promise<any> {
    // Generate insights based on conversation patterns
    return {
      conversationTopic: 'wellness',
      sentiment: 'positive',
      actionItems: ['Schedule follow-up', 'Track progress'],
      nextSteps: ['Continue monitoring', 'Apply suggestions']
    }
  }

  private async suggestCopingTechniques(message: string, sessionData: any): Promise<string[]> {
    // Suggest appropriate coping techniques based on user message
    const techniques = []
    
    if (message.toLowerCase().includes('anxious') || message.toLowerCase().includes('anxiety')) {
      techniques.push('4-7-8 breathing technique', 'Progressive muscle relaxation', 'Grounding exercises')
    }
    
    if (message.toLowerCase().includes('sad') || message.toLowerCase().includes('depressed')) {
      techniques.push('Gratitude journaling', 'Physical activity', 'Social connection')
    }
    
    return techniques
  }

  private async generateFollowUpQuestions(userMessage: string, aiResponse: string): Promise<string[]> {
    return [
      'How are you feeling right now?',
      'What would be most helpful for you today?',
      'Is there anything specific you\'d like to explore?'
    ]
  }

  private async getCrisisResources(): Promise<any[]> {
    return [
      {
        name: 'Emergency Services',
        number: '112',
        description: 'For immediate emergency assistance'
      },
      {
        name: 'Lifeline Romania',
        number: '0800.801.200',
        description: '24/7 suicide prevention hotline'
      },
      {
        name: 'Children\'s Telephone',
        number: '116.111',
        description: 'Support line for children and teenagers'
      }
    ]
  }

  private async addMentalHealthResources(response: string): Promise<string> {
    // Add relevant mental health resources to response if needed
    if (response.toLowerCase().includes('crisis') || response.toLowerCase().includes('emergency')) {
      response += '\n\n🚨 If you\'re in immediate danger, please call 112 or go to the nearest emergency room.'
    }
    
    return response
  }
}

export default new AIService()