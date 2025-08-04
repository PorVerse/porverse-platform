// lib/services/porwell-service.ts
// PorWell Real AI Mental Wellness Service - Crisis-Safe Therapy & Mood Intelligence

import { createServerSupabase } from '@/lib/supabase'
import { AIService } from '@/lib/ai/ai-service'
import { EmailService } from '@/lib/email/email-service'

export interface MentalHealthProfile {
  user_id: string
  therapy_preferences: TherapyPreference[]
  current_concerns: string[]
  therapeutic_goals: string[]
  crisis_contacts: EmergencyContact[]
  medication_list: string[]
  therapy_history: string[]
  comfort_level: 1 | 2 | 3 | 4 | 5
  communication_style: 'direct' | 'gentle' | 'analytical' | 'creative'
  trigger_warnings: string[]
}

export interface MoodEntry {
  id: string
  user_id: string
  mood_score: number // 1-10
  emotions: string[]
  triggers: string[]
  physical_symptoms: string[]
  activities_today: string[]
  sleep_hours: number
  stress_level: number // 1-10
  anxiety_level: number // 1-10
  thoughts: string
  gratitude_notes: string[]
  energy_level: number // 1-10
  social_interaction: number // 1-10
  recorded_at: Date
}

export interface TherapySession {
  id: string
  user_id: string
  session_type: 'crisis_intervention' | 'mood_support' | 'anxiety_management' | 'general_wellness'
  conversation_messages: TherapyMessage[]
  therapeutic_techniques: string[]
  crisis_level: 'none' | 'low' | 'medium' | 'high' | 'emergency'
  interventions_used: string[]
  homework_assigned: string[]
  mood_before: number
  mood_after: number
  session_duration_minutes: number
  ai_confidence_score: number
  requires_human_review: boolean
  created_at: Date
}

export interface TherapyMessage {
  role: 'user' | 'therapist'
  content: string
  timestamp: Date
  therapeutic_technique?: string
  sentiment_analysis?: SentimentAnalysis
  crisis_indicators?: string[]
}

export interface CrisisAssessment {
  risk_level: 'none' | 'low' | 'medium' | 'high' | 'imminent'
  risk_factors: string[]
  protective_factors: string[]
  immediate_actions: string[]
  emergency_resources: EmergencyResource[]
  requires_intervention: boolean
  confidence_score: number
}

export class PorWellService {
  private aiService: AIService
  private supabase = createServerSupabase()
  private emailService = new EmailService()

  constructor() {
    this.aiService = new AIService()
  }

  // ===========================
  // CRISIS-SAFE AI THERAPY
  // ===========================

  async conductTherapySession(
    userId: string,
    userMessage: string,
    sessionContext?: any
  ): Promise<TherapySessionResponse> {
    
    // STEP 1: CRISIS ASSESSMENT (HIGHEST PRIORITY)
    const crisisAssessment = await this.performCrisisAssessment(userMessage, userId)
    
    if (crisisAssessment.requires_intervention) {
      return await this.handleCrisisIntervention(userId, crisisAssessment, userMessage)
    }

    // STEP 2: Get user's mental health profile
    const profile = await this.getMentalHealthProfile(userId)
    
    // STEP 3: Analyze user's emotional state
    const emotionalAnalysis = await this.analyzeEmotionalState(userMessage, profile)
    
    // STEP 4: Get conversation history for context
    const recentSessions = await this.getRecentTherapySessions(userId, 3)
    
    // STEP 5: Generate therapeutic response using AI
    const therapeuticResponse = await this.aiService.generateTherapeuticResponse({
      user_message: userMessage,
      emotional_state: emotionalAnalysis,
      user_profile: profile,
      conversation_history: recentSessions,
      therapeutic_approach: profile.therapy_preferences || ['cbt', 'mindfulness'],
      crisis_level: crisisAssessment.risk_level,
      romanian_context: true, // Cultural sensitivity
      communication_style: profile.communication_style || 'gentle'
    })

    // STEP 6: Apply therapeutic techniques
    const enhancedResponse = await this.applyTherapeuticTechniques(
      therapeuticResponse,
      emotionalAnalysis,
      profile
    )

    // STEP 7: Generate homework/exercises
    const therapeuticHomework = await this.generateTherapeuticHomework(
      emotionalAnalysis,
      enhancedResponse.techniques_used
    )

    // STEP 8: Save therapy session
    const session = await this.saveTherapySession({
      user_id: userId,
      session_type: this.determineSessionType(emotionalAnalysis, crisisAssessment),
      conversation_messages: [
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
          sentiment_analysis: emotionalAnalysis
        },
        {
          role: 'therapist',
          content: enhancedResponse.response,
          timestamp: new Date(),
          therapeutic_technique: enhancedResponse.primary_technique
        }
      ],
      therapeutic_techniques: enhancedResponse.techniques_used,
      crisis_level: crisisAssessment.risk_level,
      homework_assigned: therapeuticHomework,
      mood_before: sessionContext?.mood_score || null,
      ai_confidence_score: enhancedResponse.confidence,
      requires_human_review: crisisAssessment.risk_level !== 'none'
    })

    // STEP 9: Schedule follow-up if needed
    if (crisisAssessment.risk_level === 'medium' || crisisAssessment.risk_level === 'high') {
      await this.scheduleFollowUp(userId, crisisAssessment.risk_level)
    }

    return {
      response: enhancedResponse.response,
      techniques_used: enhancedResponse.techniques_used,
      homework: therapeuticHomework,
      crisis_level: crisisAssessment.risk_level,
      resources: await this.getRelevantResources(enhancedResponse.techniques_used),
      follow_up_scheduled: crisisAssessment.risk_level !== 'none',
      session_id: session.id
    }
  }

  // ===========================
  // CRISIS INTERVENTION SYSTEM
  // ===========================

  private async performCrisisAssessment(
    message: string,
    userId: string
  ): Promise<CrisisAssessment> {
    
    // Get user's recent mood history for context
    const recentMoods = await this.getRecentMoodEntries(userId, 7)
    
    // AI crisis detection
    const assessment = await this.aiService.assessCrisisRisk({
      current_message: message,
      recent_mood_history: recentMoods,
      crisis_indicators: [
        'vreau să mor', 'nu mai pot', 'să mă omor', 'sfârșitul', 'gata cu mine',
        'nu mai am speranță', 'totul e inutil', 'nimeni nu mă înțelege',
        'want to die', 'kill myself', 'end it all', 'no hope', 'suicide'
      ],
      protective_factors: [
        'familie', 'copii', 'prieteni', 'viitor', 'planuri', 'speranță',
        'family', 'children', 'friends', 'future', 'hope', 'goals'
      ],
      romanian_cultural_context: true
    })

    // Enhanced risk calculation with Romanian mental health context
    let riskLevel: CrisisAssessment['risk_level'] = 'none'
    
    if (assessment.suicide_risk_score > 8) riskLevel = 'imminent'
    else if (assessment.suicide_risk_score > 6) riskLevel = 'high'
    else if (assessment.suicide_risk_score > 4) riskLevel = 'medium'
    else if (assessment.suicide_risk_score > 2) riskLevel = 'low'

    return {
      risk_level: riskLevel,
      risk_factors: assessment.identified_risk_factors,
      protective_factors: assessment.identified_protective_factors,
      immediate_actions: this.getImmediateActions(riskLevel),
      emergency_resources: await this.getRomanianEmergencyResources(),
      requires_intervention: riskLevel === 'high' || riskLevel === 'imminent',
      confidence_score: assessment.confidence
    }
  }

  private async handleCrisisIntervention(
    userId: string,
    assessment: CrisisAssessment,
    originalMessage: string
  ): Promise<TherapySessionResponse> {
    
    // IMMEDIATE: Log crisis event
    await this.logCrisisEvent(userId, assessment, originalMessage)
    
    // IMMEDIATE: Generate crisis-safe response
    const crisisResponse = await this.aiService.generateCrisisSafeResponse({
      assessment,
      user_id: userId,
      emergency_resources: assessment.emergency_resources,
      romanian_context: true
    })

    // IMMEDIATE: Send crisis notification email
    await this.emailService.sendCrisisAlert({
      user_id: userId,
      risk_level: assessment.risk_level,
      message_excerpt: originalMessage.substring(0, 100),
      emergency_resources: assessment.emergency_resources
    })

    // IMMEDIATE: Schedule follow-up contact
    await this.scheduleEmergencyFollowUp(userId, assessment.risk_level)

    // Save crisis session
    const session = await this.saveTherapySession({
      user_id: userId,
      session_type: 'crisis_intervention',
      conversation_messages: [
        {
          role: 'user',
          content: originalMessage,
          timestamp: new Date(),
          crisis_indicators: assessment.risk_factors
        },
        {
          role: 'therapist',
          content: crisisResponse.response,
          timestamp: new Date(),
          therapeutic_technique: 'crisis_intervention'
        }
      ],
      therapeutic_techniques: crisisResponse.techniques_used,
      crisis_level: assessment.risk_level,
      interventions_used: assessment.immediate_actions,
      requires_human_review: true,
      ai_confidence_score: assessment.confidence_score
    })

    return {
      response: crisisResponse.response,
      techniques_used: crisisResponse.techniques_used,
      crisis_level: assessment.risk_level,
      emergency_resources: assessment.emergency_resources,
      immediate_actions: assessment.immediate_actions,
      session_id: session.id,
      requires_immediate_help: assessment.risk_level === 'imminent'
    }
  }

  // ===========================
  // MOOD TRACKING & ANALYTICS
  // ===========================

  async trackMoodEntry(userId: string, moodData: Partial<MoodEntry>): Promise<MoodAnalysis> {
    // Save mood entry
    const moodEntry = await this.supabase
      .from('mood_entries')
      .insert({
        user_id: userId,
        ...moodData,
        recorded_at: new Date()
      })
      .select()
      .single()

    // Get historical mood data
    const moodHistory = await this.getRecentMoodEntries(userId, 30)
    
    // AI mood pattern analysis
    const moodAnalysis = await this.aiService.analyzeMoodPatterns({
      current_entry: moodEntry.data,
      historical_data: moodHistory,
      user_context: await this.getUserWellnessContext(userId)
    })

    // Identify concerning patterns
    const concerns = await this.identifyMoodConcerns(moodHistory, moodEntry.data)
    
    // Generate personalized insights
    const insights = await this.generateMoodInsights(moodAnalysis, userId)
    
    // Check for intervention needs
    if (concerns.requires_attention) {
      await this.triggerMoodAlert(userId, concerns)
    }

    return {
      current_entry: moodEntry.data,
      patterns: moodAnalysis.patterns,
      trends: moodAnalysis.trends,
      insights: insights,
      concerns: concerns,
      recommendations: await this.generateMoodRecommendations(moodAnalysis, userId)
    }
  }

  // ===========================
  // MEDITATION & MINDFULNESS
  // ===========================

  async generatePersonalizedMeditation(
    userId: string,
    meditationType: 'anxiety' | 'sleep' | 'focus' | 'stress' | 'grief' | 'anger',
    duration: number = 10
  ): Promise<MeditationSession> {
    
    const profile = await this.getMentalHealthProfile(userId)
    const recentMood = await this.getLatestMoodEntry(userId)
    
    // AI-generated personalized meditation
    const meditation = await this.aiService.generateMeditation({
      type: meditationType,
      duration_minutes: duration,
      user_mood: recentMood?.mood_score || 5,
      stress_level: recentMood?.stress_level || 5,
      anxiety_level: recentMood?.anxiety_level || 5,
      preferences: profile.therapy_preferences,
      triggers_to_avoid: profile.trigger_warnings,
      romanian_cultural_elements: true
    })

    // Generate audio script with Romanian elements
    const audioScript = await this.generateMeditationAudio(meditation, profile)
    
    // Save meditation session
    const session = await this.supabase
      .from('meditation_sessions')
      .insert({
        user_id: userId,
        type: meditationType,
        duration_minutes: duration,
        script: meditation.script,
        audio_url: audioScript.audio_url,
        background_music: meditation.background_music,
        created_at: new Date()
      })
      .select()
      .single()

    return {
      id: session.data.id,
      script: meditation.script,
      audio_url: audioScript.audio_url,
      background_music: meditation.background_music,
      breathing_pattern: meditation.breathing_guide,
      visual_elements: meditation.visual_cues,
      affirmations: meditation.personalized_affirmations
    }
  }

  // ===========================
  // WELLNESS DASHBOARD DATA
  // ===========================

  async getWellnessDashboardData(userId: string): Promise<WellnessDashboard> {
    const [
      recentMoods,
      therapySessions,
      meditationHistory,
      wellnessGoals,
      aiInsights,
      riskAssessment
    ] = await Promise.all([
      this.getRecentMoodEntries(userId, 14),
      this.getRecentTherapySessions(userId, 5),
      this.getRecentMeditationSessions(userId, 10),
      this.getWellnessGoals(userId),
      this.generateWellnessInsights(userId),
      this.getCurrentRiskAssessment(userId)
    ])

    return {
      mood_tracking: {
        recent_entries: recentMoods,
        average_mood: this.calculateAverageMood(recentMoods),
        mood_trends: await this.calculateMoodTrends(recentMoods),
        concerning_patterns: await this.identifyPatterns(recentMoods)
      },
      therapy: {
        recent_sessions: therapySessions,
        progress_metrics: await this.calculateTherapyProgress(userId),
        techniques_used: this.extractUsedTechniques(therapySessions),
        homework_compliance: await this.calculateHomeworkCompliance(userId)
      },
      mindfulness: {
        meditation_history: meditationHistory,
        streak_days: await this.calculateMeditationStreak(userId),
        favorite_types: this.getMostUsedMeditationTypes(meditationHistory),
        total_minutes: this.calculateTotalMeditationTime(meditationHistory)
      },
      wellness_goals: wellnessGoals,
      ai_insights: aiInsights,
      risk_assessment: riskAssessment,
      achievements: await this.getWellnessAchievements(userId),
      recommendations: await this.getPersonalizedRecommendations(userId)
    }
  }

  // ===========================
  // ROMANIAN EMERGENCY RESOURCES
  // ===========================

  private async getRomanianEmergencyResources(): Promise<EmergencyResource[]> {
    return [
      {
        name: 'Telefonul Vieții',
        phone: '0800 801 200',
        description: 'Linia națională de prevenire a suicidului - gratuită, 24/7',
        type: 'crisis_hotline'
      },
      {
        name: 'Serviciul de Urgență',
        phone: '112',
        description: 'Serviciul național de urgență',
        type: 'emergency'
      },
      {
        name: 'Alianța Națională de Sănătate Mintală',
        phone: '0726 188 588',
        description: 'Consiliere psihologică și suport',
        type: 'counseling'
      },
      {
        name: 'Centrul de Prevenire a Suicidului',
        phone: '0800 080 100',
        description: 'Suport specializat pentru gânduri suicidare',
        type: 'suicide_prevention'
      }
    ]
  }

  // ===========================
  // HELPER METHODS
  // ===========================

  private async getMentalHealthProfile(userId: string): Promise<MentalHealthProfile> {
    const { data, error } = await this.supabase
      .from('mental_health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error || !data) {
      return await this.createDefaultMentalHealthProfile(userId)
    }
    
    return data
  }

  private async saveTherapySession(sessionData: any): Promise<TherapySession> {
    const { data, error } = await this.supabase
      .from('therapy_sessions')
      .insert(sessionData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to save therapy session: ${error.message}`)
    return data
  }

  private getImmediateActions(riskLevel: CrisisAssessment['risk_level']): string[] {
    switch (riskLevel) {
      case 'imminent':
        return [
          'Contactează imediat serviciul 112',
          'Nu rămâne singur/singură',
          'Îndepărtează obiectele periculoase',
          'Contactează pe cineva de încredere'
        ]
      case 'high':
        return [
          'Contactează Telefonul Vieții: 0800 801 200',
          'Programează urgent o întâlnire cu un psiholog',
          'Informează familia sau prietenii apropiați',
          'Evită alcoolul și substanțele'
        ]
      case 'medium':
        return [
          'Practică tehnici de respirație',
          'Contactează un prieten de încredere',
          'Consideră să vorbești cu un consilier',
          'Monitorizează-ți starea zilnic'
        ]
      default:
        return [
          'Continuă cu auto-îngrijirea',
          'Menține rutina de somn',
          'Practică exerciții de mindfulness'
        ]
    }
  }

  private async scheduleFollowUp(userId: string, riskLevel: string): Promise<void> {
    const followUpTime = riskLevel === 'high' ? 2 : 24 // hours
    
    await this.supabase
      .from('follow_up_schedules')
      .insert({
        user_id: userId,
        type: 'crisis_follow_up',
        scheduled_for: new Date(Date.now() + followUpTime * 60 * 60 * 1000),
        priority: riskLevel,
        created_at: new Date()
      })
  }
}

// Export for use in dashboard
export const porWellService = new PorWellService()