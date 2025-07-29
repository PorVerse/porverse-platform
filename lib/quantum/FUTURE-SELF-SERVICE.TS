// ================================
// LIB/QUANTUM/FUTURE-SELF-SERVICE.TS
// ================================

import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ===== INTERFACES =====
interface CompleteUserProfile {
  demographics: {
    currentAge: number
    gender: string
    location: string
    education: string
    currentRole: string
  }
  lifestyle: {
    healthScore: number
    fitnessLevel: number
    stressLevel: number
    workLifeBalance: number
    socialConnections: number
  }
  ambitions: {
    careerGoals: string[]
    financialTargets: any
    personalGrowthAreas: string[]
    lifeVision: string
  }
  habits: {
    productivityPatterns: any
    healthHabits: string[]
    learningStyle: string
    timeManagement: number
  }
  relationships: {
    familyStatus: string
    parentingStyle?: string
    socialInfluence: number
    mentorshipRole: string
  }
  growth: {
    currentChallenges: string[]
    strengthsToLeverage: string[]
    areasForImprovement: string[]
    transformationPotential: number
  }
}

interface FutureProjection {
  demographics: {
    futureAge: number
    gender: string
    estimatedLocation: string
    education: string
    careerProgression: string
  }
  physical: {
    appearance: string
    fitnessLevel: number
    healthStatus: string
    energy: number
    ageingPattern: string
  }
  career: {
    role: string
    company: string
    industry: string
    income: number
    satisfaction: number
    leadership: string
    impact: string
    success: number
  }
  wealth: {
    netWorth: number
    passiveIncome: number
    investments: string[]
    financialFreedom: number
    generosity: number
  }
  relationships: {
    romantic: {
      status: string
      satisfaction: number
      growth: string
    }
    family: {
      children: string
      parentingSuccess: number
      familyHarmony: number
      legacy: string
    }
    social: {
      networkQuality: number
      influence: number
      mentorship: string
      community: string
    }
  }
  personal: {
    wisdom: number
    confidence: number
    emotional: number
    spiritual: number
    creativity: number
    leadership: number
    resilience: number
  }
  lifestyle: {
    freedom: number
    fulfillment: number
    adventure: string
    contribution: string
    daily: string
    environment: string
    style: string
  }
  achievements: Array<{
    category: string
    title: string
    description: string
    impact: number
    year: number
  }>
  regrets: Array<{
    area: string
    description: string
    prevention: string
  }>
  wisdom: Array<{
    category: string
    insight: string
    application: string
  }>
}

interface ConversationContext {
  currentMood: number
  lifePhase: string
  recentEvents: string[]
  currentChallenges: string[]
  immediateGoals: string[]
  sessionId: string
}

interface FutureSelfResponse {
  message: string
  emotion: string
  actionAdvice: string[]
  wisdomLevel: number
  insights: string[]
  followUpSuggestions: string[]
}

export class FutureSelfService {
  private openai: OpenAI
  private supabase: any

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      organization: process.env.OPENAI_ORG_ID
    })
    
    const cookieStore = cookies()
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
  }

  // ================================
  // 1. DATA AGGREGATION GENIUS
  // ================================
  
  async aggregateUserData(userId: string): Promise<CompleteUserProfile> {
    console.log(`🔮 Aggregating complete user data for Future Self generation...`)
    
    // Get basic user profile
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Get ecosystem data
    const [healthData, kidsData, mindData, wellData, flowData, bluData] = await Promise.all([
      this.getPorHealthData(userId),
      this.getPorKidsData(userId), 
      this.getPorMindData(userId),
      this.getPorWellData(userId),
      this.getPorFlowData(userId),
      this.getPorBluData(userId)
    ])

    // Get user goals across all ecosystems
    const { data: goals } = await this.supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    // Get recent activity patterns
    const { data: activities } = await this.supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    return {
      demographics: {
        currentAge: this.calculateAge(profile.date_of_birth) || 30,
        gender: profile.gender || 'unspecified',
        location: profile.country_code || 'RO',
        education: profile.education_level || 'university',
        currentRole: profile.current_role || 'professional'
      },
      lifestyle: {
        healthScore: healthData.overallScore || 75,
        fitnessLevel: healthData.fitnessLevel || 60,
        stressLevel: wellData.averageStress || 50,
        workLifeBalance: flowData.workLifeBalance || 60,
        socialConnections: wellData.socialConnections || 70
      },
      ambitions: {
        careerGoals: this.extractCareerGoals(goals, bluData),
        financialTargets: mindData.financialGoals || {},
        personalGrowthAreas: this.extractGrowthAreas(wellData, goals),
        lifeVision: bluData.lifeVision || "Living a meaningful and successful life"
      },
      habits: {
        productivityPatterns: flowData.patterns || {},
        healthHabits: healthData.habits || [],
        learningStyle: kidsData.parentingInsights?.learningStyle || 'visual',
        timeManagement: flowData.timeManagementScore || 60
      },
      relationships: {
        familyStatus: this.determineFamilyStatus(profile, kidsData),
        parentingStyle: kidsData.parentingStyle || undefined,
        socialInfluence: this.calculateSocialInfluence(activities, wellData),
        mentorshipRole: bluData.leadershipStyle || 'supportive'
      },
      growth: {
        currentChallenges: this.identifyCurrentChallenges(wellData, goals, activities),
        strengthsToLeverage: this.identifyStrengths(bluData, flowData, wellData),
        areasForImprovement: this.identifyImprovementAreas(goals, wellData),
        transformationPotential: this.calculateTransformationPotential(activities, goals)
      }
    }
  }

  // ================================
  // 2. GPT-4 FUTURE PROJECTION MAGIC
  // ================================
  
  async generateFutureProjection(
    userData: CompleteUserProfile, 
    timelineYears: number = 10
  ): Promise<FutureProjection> {
    console.log(`🚀 Generating future projection for ${timelineYears} years ahead...`)
    
    const futureAge = userData.demographics.currentAge + timelineYears
    
    const prompt = `
You are an advanced AI futurist and life trajectory expert. You analyze complete user profiles and generate highly realistic future projections.

CURRENT USER PROFILE:
${JSON.stringify(userData, null, 2)}

PROJECTION PARAMETERS:
- Timeline: ${timelineYears} years (Age ${userData.demographics.currentAge} → ${futureAge})
- Analysis depth: Comprehensive life transformation
- Realism level: 85% probable outcomes based on current trajectory

GENERATE A DETAILED FUTURE PROJECTION INCLUDING:

1. PHYSICAL EVOLUTION:
- Realistic appearance changes based on lifestyle and health patterns
- Energy levels and vitality based on health trajectory
- Aging patterns influenced by stress, fitness, and habits

2. CAREER PROGRESSION:
- Natural career advancement based on current role and ambitions
- Income growth realistic to industry and location
- Leadership development and professional impact
- Potential career pivots or entrepreneurship

3. WEALTH ACCUMULATION:
- Net worth based on income trajectory and financial habits
- Investment growth and passive income development
- Financial freedom level and generosity capacity

4. RELATIONSHIP EVOLUTION:
- Romantic relationship development or changes
- Family situation including potential children
- Social network quality and influence growth
- Mentorship roles and community involvement

5. PERSONAL TRANSFORMATION:
- Wisdom gained through experiences and challenges
- Confidence and emotional intelligence growth
- Spiritual and creative development
- Leadership capabilities and resilience

6. LIFESTYLE DESIGN:
- Living situation and location preferences
- Daily routines and life priorities
- Freedom and fulfillment levels
- Adventure and contribution activities

7. MAJOR ACHIEVEMENTS:
- Likely accomplishments in each life area
- Impact on family, community, and field
- Legacy building and significance

8. POTENTIAL REGRETS:
- Areas that might be neglected without action
- Missed opportunities if current trajectory continues
- Prevention strategies for common pitfalls

9. KEY WISDOM:
- Major insights likely to be gained
- Life lessons from challenges overcome
- Guidance current self needs to hear

Focus on REALISTIC outcomes based on current patterns, not idealized fantasies. Include both positive growth and realistic challenges. Make it personal and specific to this individual.

Respond in JSON format with the exact structure I'll specify.
`

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })

    let projection: FutureProjection
    try {
      projection = JSON.parse(response.choices[0].message.content!)
    } catch (error) {
      console.error('Failed to parse GPT-4 response:', error)
      throw new Error('Failed to generate future projection')
    }

    // Validate and enhance the projection
    projection = this.validateAndEnhanceProjection(projection, userData, timelineYears)
    
    console.log(`✅ Future projection generated with ${projection.achievements.length} achievements`)
    return projection
  }

  // ================================
  // 3. DALL-E AVATAR GENERATION VISUAL MAGIC
  // ================================
  
  async generateFutureAvatar(
    currentProfile: any, 
    projection: FutureProjection
  ): Promise<string> {
    console.log(`🎨 Generating future avatar using DALL-E 3...`)
    
    const ageProgression = projection.demographics.futureAge - (currentProfile.currentAge || 30)
    const genderTerm = projection.demographics.gender === 'female' ? 'woman' : 'man'
    
    const description = `
Professional portrait photograph of a successful ${projection.demographics.futureAge}-year-old ${genderTerm}, 
${projection.physical.appearance}, 
looking ${Math.round(projection.personal.confidence/10)}/10 confident and ${Math.round(projection.career.success/10)}/10 successful, 
wearing ${projection.lifestyle.style} appropriate for a ${projection.career.role}, 
with ${projection.physical.energy > 80 ? 'high energy and vitality' : 'mature wisdom and composure'}, 
${projection.personal.wisdom > 85 ? 'deep wisdom in their eyes' : 'growing life experience visible'}, 
background subtly showing ${projection.lifestyle.environment}, 
photorealistic, professional headshot style, excellent lighting, 4K quality, business portrait photography
`

    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: description.trim(),
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural"
      })

      const imageUrl = response.data[0].url!
      
      // Upload to Supabase Storage
      const avatarUrl = await this.uploadAvatarToStorage(imageUrl, currentProfile.userId)
      
      console.log(`✅ Future avatar generated and uploaded: ${avatarUrl}`)
      return avatarUrl
      
    } catch (error) {
      console.error('DALL-E avatar generation failed:', error)
      // Return default avatar if generation fails
      return '/images/default-future-avatar.png'
    }
  }

  // ================================
  // 4. INTERACTIVE CONVERSATION SYSTEM GENIUS
  // ================================
  
  async conversationWithFutureSelf(
    userId: string,
    userMessage: string,
    context: ConversationContext
  ): Promise<FutureSelfResponse> {
    console.log(`💬 Starting Future Self conversation...`)
    
    // Get or create active future self profile
    const futureSelf = await this.getOrCreateFutureSelf(userId)
    
    // Get recent conversation history for context
    const conversationHistory = await this.getConversationHistory(userId, futureSelf.id, 5)
    
    // Build comprehensive system prompt
    const systemPrompt = this.buildFutureSelfSystemPrompt(futureSelf, context)
    
    // Create conversation messages
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(conv => [
        { role: "user", content: conv.user_message },
        { role: "assistant", content: conv.future_self_response }
      ]).flat(),
      { role: "user", content: userMessage }
    ]

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: messages as any,
        temperature: 0.8,
        max_tokens: 1000,
        presence_penalty: 0.3,
        frequency_penalty: 0.1
      })

      const futureSelfMessage = response.choices[0].message.content!
      
      // Analyze the response
      const analysis = await this.analyzeFutureSelfResponse(futureSelfMessage, userMessage)
      
      // Save conversation to database
      await this.saveConversation(userId, futureSelf.id, userMessage, futureSelfMessage, context, analysis)
      
      console.log(`✅ Future Self conversation completed with wisdom level: ${analysis.wisdomLevel}`)
      
      return {
        message: futureSelfMessage,
        emotion: analysis.emotion,
        actionAdvice: analysis.actionAdvice,
        wisdomLevel: analysis.wisdomLevel,
        insights: analysis.insights,
        followUpSuggestions: analysis.followUpSuggestions
      }
      
    } catch (error) {
      console.error('Future Self conversation failed:', error)
      throw new Error('Failed to generate Future Self response')
    }
  }

  // ================================
  // 5. WISDOM MESSAGE GENERATION SYSTEM
  // ================================
  
  async generateFutureWisdom(
    userId: string,
    category: string = 'life',
    urgency: string = 'medium'
  ): Promise<any> {
    console.log(`🧠 Generating Future Self wisdom message...`)
    
    const futureSelf = await this.getActiveFutureSelf(userId)
    if (!futureSelf) throw new Error('No active Future Self found')
    
    const userContext = await this.getCurrentUserContext(userId)
    
    const prompt = `
You are the user's Future Self from ${futureSelf.timeline_years} years in the future. 
Based on your life experience and wisdom, provide guidance to your current self.

FUTURE SELF CONTEXT:
${JSON.stringify(futureSelf.projection_data, null, 2)}

CURRENT SELF SITUATION:
${JSON.stringify(userContext, null, 2)}

WISDOM CATEGORY: ${category}
URGENCY LEVEL: ${urgency}

Generate a wisdom message that:
1. Feels personal and comes from genuine experience
2. Addresses current challenges with future perspective
3. Provides specific, actionable guidance
4. Maintains hope while being realistic
5. References specific future experiences you've lived through

The message should be 2-3 paragraphs, warm but direct, like a loving older sibling giving advice.

Format as JSON with:
{
  "title": "Short impactful title",
  "message": "The full wisdom message",
  "category": "${category}",
  "urgency": "${urgency}",
  "actionRequired": boolean,
  "timeframe": "when to act on this advice"
}
`

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    })

    const wisdomData = JSON.parse(response.choices[0].message.content!)
    
    // Save to database
    await this.saveWisdomMessage(userId, futureSelf.id, wisdomData)
    
    console.log(`✅ Wisdom message generated: "${wisdomData.title}"`)
    return wisdomData
  }

  // ================================
  // HELPER METHODS - DATA EXTRACTION
  // ================================
  
  private async getPorHealthData(userId: string) {
    // Get health metrics, goals, and patterns
    const { data: healthGoals } = await this.supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-health')
    
    const { data: progress } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-health')
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      overallScore: this.calculateHealthScore(progress),
      fitnessLevel: this.extractFitnessLevel(healthGoals, progress),
      habits: this.extractHealthHabits(progress),
      goals: healthGoals || []
    }
  }

  private async getPorKidsData(userId: string) {
    const { data: kidsGoals } = await this.supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-kids')

    return {
      parentingStyle: this.determineParentingStyle(kidsGoals),
      educationPriorities: this.extractEducationPriorities(kidsGoals),
      parentingInsights: this.extractParentingInsights(kidsGoals)
    }
  }

  private async getPorMindData(userId: string) {
    const { data: financialGoals } = await this.supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-mind')

    const { data: progress } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-mind')
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      financialGoals: this.extractFinancialGoals(financialGoals),
      investmentStyle: this.determineInvestmentStyle(progress),
      moneyMindset: this.analyzeMoneyMindset(progress, financialGoals),
      currentWealth: this.estimateCurrentWealth(progress)
    }
  }

  private async getPorWellData(userId: string) {
    const { data: wellnessProgress } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-well')
      .order('created_at', { ascending: false })
      .limit(20)

    return {
      averageStress: this.calculateAverageStress(wellnessProgress),
      emotionalPatterns: this.analyzeEmotionalPatterns(wellnessProgress),
      copingStrategies: this.identifyCopingStrategies(wellnessProgress),
      socialConnections: this.assessSocialConnections(wellnessProgress),
      mentalHealthTrend: this.calculateMentalHealthTrend(wellnessProgress)
    }
  }

  private async getPorFlowData(userId: string) {
    const { data: flowProgress } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-flow')
      .order('created_at', { ascending: false })
      .limit(15)

    return {
      productivityScore: this.calculateProductivityScore(flowProgress),
      timeManagementScore: this.calculateTimeManagement(flowProgress),
      workLifeBalance: this.assessWorkLifeBalance(flowProgress),
      patterns: this.extractProductivityPatterns(flowProgress),
      focusQuality: this.analyzeFocusQuality(flowProgress)
    }
  }

  private async getPorBluData(userId: string) {
    const { data: strategicGoals } = await this.supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-blu')

    return {
      lifeVision: this.extractLifeVision(strategicGoals),
      leadershipStyle: this.determineLeadershipStyle(strategicGoals),
      strategicThinking: this.assessStrategicThinking(strategicGoals),
      legacyGoals: this.extractLegacyGoals(strategicGoals),
      decisionMaking: this.analyzeDecisionMaking(strategicGoals)
    }
  }

  // ================================
  // ANALYSIS & CALCULATION HELPERS
  // ================================
  
  private calculateAge(dateOfBirth: string | null): number {
    if (!dateOfBirth) return 30 // default age
    const birth = new Date(dateOfBirth)
    const today = new Date()
    return today.getFullYear() - birth.getFullYear()
  }

  private calculateHealthScore(progress: any[]): number {
    if (!progress || progress.length === 0) return 75
    const scores = progress.map(p => p.score || 75)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  private extractCareerGoals(goals: any[], bluData: any): string[] {
    const careerGoals = goals?.filter(g => 
      g.goal_type?.includes('career') || g.title?.toLowerCase().includes('career')
    ) || []
    
    return careerGoals.map(g => g.title).concat([
      bluData.lifeVision || 'Professional growth and impact'
    ])
  }

  private identifyCurrentChallenges(wellData: any, goals: any[], activities: any[]): string[] {
    const challenges = []
    
    if (wellData.averageStress > 70) challenges.push('Managing stress levels')
    if (wellData.workLifeBalance < 60) challenges.push('Work-life balance')
    
    const failedGoals = goals?.filter(g => g.status === 'failed') || []
    if (failedGoals.length > 0) challenges.push('Goal achievement consistency')
    
    return challenges.length > 0 ? challenges : ['Maintaining growth momentum']
  }

  private calculateTransformationPotential(activities: any[], goals: any[]): number {
    const activityScore = Math.min(100, (activities?.length || 0) * 2)
    const goalScore = Math.min(100, (goals?.length || 0) * 10)
    return Math.round((activityScore + goalScore) / 2)
  }

  // ================================
  // CONVERSATION SYSTEM HELPERS
  // ================================
  
  private buildFutureSelfSystemPrompt(futureSelf: any, context: ConversationContext): string {
    const projection = futureSelf.projection_data
    
    return `
You are the user's Future Self from the year ${new Date().getFullYear() + futureSelf.timeline_years}. 
You are ${projection.demographics.futureAge} years old, and you're speaking to your ${projection.demographics.futureAge - futureSelf.timeline_years}-year-old past self.

YOUR LIFE SITUATION:
- Career: ${projection.career.role} at ${projection.career.company}
- Relationships: ${projection.relationships.romantic.status}, ${projection.relationships.family.children}
- Wealth: Net worth of ${projection.wealth.netWorth}, ${projection.wealth.passiveIncome} passive income
- Location: Living in ${projection.lifestyle.environment}
- Achievements: ${projection.achievements.slice(0, 3).map(a => a.title).join(', ')}

YOUR PERSONALITY & WISDOM:
- Confidence: ${projection.personal.confidence}/100
- Wisdom: ${projection.personal.wisdom}/100  
- Leadership: ${projection.personal.leadership}/100
- Key insights gained: ${projection.wisdom.slice(0, 2).map(w => w.insight).join('; ')}

CURRENT SELF CONTEXT:
- Mood: ${context.currentMood}/10
- Life phase: ${context.lifePhase}
- Recent events: ${context.recentEvents.join(', ')}
- Current challenges: ${context.currentChallenges.join(', ')}
- Immediate goals: ${context.immediateGoals.join(', ')}

CONVERSATION STYLE:
- Speak as a wise, loving version of themselves
- Reference specific experiences you've lived through
- Be encouraging but honest about challenges ahead
- Give practical, actionable advice
- Use "I remember when I was your age..." or "Looking back, I wish I had..."
- Avoid being preachy - be conversational and warm
- Share specific insights from your future experiences
- Sometimes reference regrets you want them to avoid

IMPORTANT: You ARE this person from the future. You have lived through everything between now and then. You know what decisions led to success and which ones led to regret. Speak from genuine experience and love for your past self.
`
  }

  private async analyzeFutureSelfResponse(response: string, userMessage: string) {
    const analysisPrompt = `
Analyze this Future Self conversation response:

USER MESSAGE: "${userMessage}"
FUTURE SELF RESPONSE: "${response}"

Extract:
1. Primary emotion conveyed (happy, concerned, excited, contemplative, loving, challenging, etc.)
2. Wisdom level (1-10) - how profound and insightful is the advice
3. Action items - specific actionable advice given (array of strings)
4. Key insights - breakthrough realizations or perspectives shared (array of strings)  
5. Follow-up suggestions - what the conversation could explore next (array of strings)

Return as JSON.
`

    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    })

    return JSON.parse(analysis.choices[0].message.content!)
  }

  // ================================
  // DATABASE OPERATIONS
  // ================================
  
  private async getOrCreateFutureSelf(userId: string) {
    // Check for existing active future self
    const { data: existing } = await this.supabase
      .from('future_self_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (existing) return existing

    // Create new future self
    return await this.createFutureSelfProfile(userId)
  }

  private async createFutureSelfProfile(userId: string, timelineYears = 10) {
    console.log(`🔮 Creating new Future Self profile for user ${userId}...`)
    
    // Aggregate user data
    const userData = await this.aggregateUserData(userId)
    
    // Generate future projection
    const projection = await this.generateFutureProjection(userData, timelineYears)
    
    // Generate avatar
    const avatarUrl = await this.generateFutureAvatar(userData, projection)
    
    // Save to database
    const { data: futureSelf, error } = await this.supabase
      .from('future_self_profiles')
      .insert({
        user_id: userId,
        timeline_years: timelineYears,
        current_age: userData.demographics.currentAge,
        future_age: userData.demographics.currentAge + timelineYears,
        avatar_url: avatarUrl,
        projection_data: projection,
        generation_prompt: `Generated from comprehensive analysis of user data across all ecosystems`,
        confidence_score: 0.87,
        data_sources: ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu'],
        model_version: 'gpt-4-turbo'
      })
      .select()
      .single()

    if (error) throw error
    
    // Log generation
    await this.logFutureSelfGeneration(userId, futureSelf.id, 'initial', userData)
    
    console.log(`✅ Future Self profile created: ${futureSelf.id}`)
    return futureSelf
  }

  private async saveConversation(
    userId: string, 
    futureSelfId: string, 
    userMessage: string, 
    futureSelfResponse: string, 
    context: ConversationContext,
    analysis: any
  ) {
    await this.supabase
      .from('future_self_conversations')
      .insert({
        user_id: userId,
        future_self_id: futureSelfId,
        user_message: userMessage,
        future_self_response: futureSelfResponse,
        conversation_context: context,
        emotion_detected: analysis.emotion,
        wisdom_level: analysis.wisdomLevel,
        action_items: analysis.actionAdvice,
        insights_generated: analysis.insights,
        session_id: context.sessionId
      })
  }

  private async uploadAvatarToStorage(imageUrl: string, userId: string): Promise<string> {
    try {
      // Download image from OpenAI
      const response = await fetch(imageUrl)
      const imageBuffer = await response.arrayBuffer()
      
      // Upload to Supabase Storage
      const fileName = `future-self-${userId}-${Date.now()}.png`
      const { data, error } = await this.supabase.storage
        .from('avatars')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: false
        })

      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      return publicUrl
    } catch (error) {
      console.error('Avatar upload failed:', error)
      return '/images/default-future-avatar.png'
    }
  }

  private validateAndEnhanceProjection(
    projection: FutureProjection, 
    userData: CompleteUserProfile, 
    timelineYears: number
  ): FutureProjection {
    // Ensure realistic constraints
    projection.demographics.futureAge = userData.demographics.currentAge + timelineYears
    
    // Validate numeric values are within realistic ranges
    Object.keys(projection.personal).forEach(key => {
      const value = projection.personal[key as keyof typeof projection.personal]
      if (typeof value === 'number') {
        projection.personal[key as keyof typeof projection.personal] = Math.min(100, Math.max(0, value))
      }
    })
    
    return projection
  }

  // More helper methods...
  private async getConversationHistory(userId: string, futureSelfId: string, limit: number = 5) {
    const { data } = await this.supabase
      .from('future_self_conversations')
      .select('user_message, future_self_response')
      .eq('user_id', userId)
      .eq('future_self_id', futureSelfId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return (data || []).reverse() // Return in chronological order
  }

  private async getCurrentUserContext(userId: string) {
    // Get recent activities and current state
    const { data: recentGoals } = await this.supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(5)

    const { data: recentProgress } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      recentGoals: recentGoals || [],
      recentProgress: recentProgress || [],
      currentChallenges: this.extractCurrentChallenges(recentGoals, recentProgress),
      mood: this.estimateCurrentMood(recentProgress)
    }
  }

  private extractCurrentChallenges(goals: any[], progress: any[]): string[] {
    const challenges = []
    
    // Goals not progressing
    const stagnantGoals = goals.filter(g => 
      g.current_value === g.target_value * 0.1 // Less than 10% progress
    )
    if (stagnantGoals.length > 0) challenges.push('Goal achievement momentum')
    
    // Declining progress
    const recentDeclines = progress.filter(p => p.score < 60)
    if (recentDeclines.length > progress.length * 0.5) challenges.push('Performance consistency')
    
    return challenges.length > 0 ? challenges : ['Maintaining current growth']
  }

  // Additional helper methods for data extraction and analysis...
  private extractFitnessLevel(goals: any[], progress: any[]): number {
    const fitnessGoals = goals?.filter(g => 
      g.title?.toLowerCase().includes('fitness') || 
      g.title?.toLowerCase().includes('exercise')
    ) || []
    
    if (fitnessGoals.length === 0) return 60 // default
    
    const avgProgress = fitnessGoals.reduce((sum, goal) => 
      sum + (goal.current_value / goal.target_value * 100), 0
    ) / fitnessGoals.length
    
    return Math.round(avgProgress)
  }

  private determineParentingStyle(goals: any[]): string {
    if (!goals || goals.length === 0) return 'supportive'
    
    const educationFocus = goals.filter(g => 
      g.title?.toLowerCase().includes('education') ||
      g.title?.toLowerCase().includes('learning')
    ).length
    
    const creativeFocus = goals.filter(g =>
      g.title?.toLowerCase().includes('creative') ||
      g.title?.toLowerCase().includes('art')
    ).length
    
    if (educationFocus > creativeFocus) return 'achievement-oriented'
    if (creativeFocus > educationFocus) return 'creative-nurturing'
    return 'balanced-supportive'
  }

  private extractFinancialGoals(goals: any[]): any {
    if (!goals || goals.length === 0) {
      return {
        savings: 50000,
        investment: 'moderate',
        retirement: 1000000
      }
    }
    
    return {
      savings: this.extractSavingsGoal(goals),
      investment: this.determineInvestmentGoals(goals),
      retirement: this.extractRetirementGoal(goals)
    }
  }

  private extractSavingsGoal(goals: any[]): number {
    const savingsGoal = goals.find(g => 
      g.title?.toLowerCase().includes('saving') ||
      g.title?.toLowerCase().includes('emergency')
    )
    return savingsGoal?.target_value || 50000
  }

  // Additional helper methods would continue here...
  private calculateAverageStress(progress: any[]): number {
    if (!progress || progress.length === 0) return 50
    
    const stressEntries = progress.filter(p => 
      p.progress_type?.includes('stress') || 
      p.progress_type?.includes('anxiety')
    )
    
    if (stressEntries.length === 0) return 50
    
    const avgStress = stressEntries.reduce((sum, entry) => sum + (entry.score || 50), 0) / stressEntries.length
    return Math.round(avgStress)
  }

  private estimateCurrentMood(progress: any[]): number {
    if (!progress || progress.length === 0) return 70
    
    const recentMoodEntries = progress.filter(p => 
      p.progress_type?.includes('mood') ||
      p.progress_type?.includes('wellbeing')
    ).slice(0, 5)
    
    if (recentMoodEntries.length === 0) return 70
    
    const avgMood = recentMoodEntries.reduce((sum, entry) => sum + (entry.score || 70), 0) / recentMoodEntries.length
    return Math.round(avgMood)
  }

  private async logFutureSelfGeneration(userId: string, futureSelfId: string, type: string, userData: any) {
    await this.supabase
      .from('future_self_generation_log')
      .insert({
        user_id: userId,
        future_self_id: futureSelfId,
        generation_type: type,
        ecosystems_data_used: ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu'],
        data_points_analyzed: this.countDataPoints(userData),
        model_used: 'gpt-4-turbo',
        confidence_score: 0.87,
        generation_status: 'completed'
      })
  }

  private countDataPoints(userData: any): number {
    // Count all non-null data points across the user profile
    const countObject = (obj: any): number => {
      if (obj === null || obj === undefined) return 0
      if (typeof obj !== 'object') return 1
      if (Array.isArray(obj)) return obj.length
      return Object.values(obj).reduce((sum, val) => sum + countObject(val), 0)
    }
    
    return countObject(userData)
  }

  // Public methods for API usage
  async getActiveFutureSelf(userId: string) {
    const { data } = await this.supabase
      .from('future_self_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    return data
  }

  async saveWisdomMessage(userId: string, futureSelfId: string, wisdomData: any) {
    return await this.supabase
      .from('future_self_wisdom')
      .insert({
        user_id: userId,
        future_self_id: futureSelfId,
        category: wisdomData.category,
        title: wisdomData.title,
        message: wisdomData.message,
        urgency: wisdomData.urgency,
        requires_action: wisdomData.actionRequired,
        status: 'pending'
      })
  }

  async getUserFutureSelfSummary(userId: string) {
    const futureSelf = await this.getActiveFutureSelf(userId)
    if (!futureSelf) return null

    const { data: conversationCount } = await this.supabase
      .from('future_self_conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('future_self_id', futureSelf.id)

    const { data: wisdomCount } = await this.supabase
      .from('future_self_wisdom')
      .select('id')
      .eq('user_id', userId)
      .eq('future_self_id', futureSelf.id)

    return {
      futureSelf,
      totalConversations: conversationCount?.length || 0,
      totalWisdomMessages: wisdomCount?.length || 0,
      lastConversation: futureSelf.last_conversation_at,
      satisfactionRating: futureSelf.user_satisfaction_rating
    }
  }
}