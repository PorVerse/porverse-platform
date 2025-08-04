// lib/services/porkids-service.ts
// PorKids Real AI Service - Transform Mock to Intelligent Homework & Learning System

import { createServerSupabase } from '@/lib/supabase'
import { AIService } from '@/lib/ai/ai-service'

export interface ChildProfile {
  id: string
  parent_id: string
  name: string
  age: number
  grade_level: number
  school_name?: string
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  subjects_strength: string[]
  subjects_weakness: string[]
  interests: string[]
  language: 'ro' | 'en'
  special_needs?: string[]
}

export interface HomeworkSubmission {
  id: string
  child_id: string
  subject: string
  topic: string
  grade_level: number
  original_image_url: string
  ocr_text: string
  problem_type: 'math' | 'science' | 'language' | 'history' | 'geography'
  difficulty_level: 1 | 2 | 3 | 4 | 5
  ai_solution: HomeworkSolution
  learning_objectives: string[]
  time_spent_minutes: number
  parent_approved: boolean
  teacher_feedback?: string
  submitted_at: Date
}

export interface HomeworkSolution {
  step_by_step_solution: SolutionStep[]
  final_answer: string
  explanation: string
  learning_concepts: string[]
  similar_problems: Problem[]
  difficulty_analysis: DifficultyAnalysis
  estimated_time_minutes: number
  hints: string[]
  visual_aids?: string[]
}

export interface LearningProgress {
  child_id: string
  subject: string
  topic: string
  mastery_level: number // 0-100
  sessions_completed: number
  time_invested_hours: number
  mistakes_patterns: string[]
  improvement_rate: number
  next_challenges: string[]
  parent_involvement_score: number
}

export class PorKidsService {
  private aiService: AIService
  private supabase = createServerSupabase()

  constructor() {
    this.aiService = new AIService()
  }

  // ===========================
  // REAL HOMEWORK SCANNING & AI SOLVING
  // ===========================

  async scanAndSolveHomework(
    childId: string,
    imageFile: File,
    subject: string,
    additionalContext?: string
  ): Promise<HomeworkSubmission> {
    
    // Step 1: Upload image to storage
    const imageUrl = await this.uploadHomeworkImage(imageFile, childId)
    
    // Step 2: OCR Processing with Romanian language support
    const ocrResult = await this.performAdvancedOCR(imageUrl, 'romanian')
    
    // Step 3: Get child profile for personalized approach
    const childProfile = await this.getChildProfile(childId)
    
    // Step 4: AI Problem Analysis
    const problemAnalysis = await this.aiService.analyzeHomeworkProblem({
      ocr_text: ocrResult.text,
      subject,
      grade_level: childProfile.grade_level,
      language: childProfile.language,
      learning_style: childProfile.learning_style,
      context: additionalContext
    })

    // Step 5: Generate Educational Solution
    const solution = await this.generateEducationalSolution(problemAnalysis, childProfile)
    
    // Step 6: Create learning objectives
    const learningObjectives = await this.generateLearningObjectives(problemAnalysis, childProfile)
    
    // Step 7: Save homework submission
    const submission = await this.saveHomeworkSubmission({
      child_id: childId,
      subject,
      topic: problemAnalysis.topic,
      grade_level: childProfile.grade_level,
      original_image_url: imageUrl,
      ocr_text: ocrResult.text,
      problem_type: problemAnalysis.type,
      difficulty_level: problemAnalysis.difficulty,
      ai_solution: solution,
      learning_objectives: learningObjectives,
      time_spent_minutes: 0, // Will be tracked
      parent_approved: false, // Requires parent review
      submitted_at: new Date()
    })
    
    // Step 8: Update learning progress
    await this.updateLearningProgress(childId, subject, problemAnalysis.topic, submission)
    
    // Step 9: Generate practice problems if needed
    await this.generateRelatedPracticeProblems(childId, problemAnalysis)
    
    return submission
  }

  private async generateEducationalSolution(
    problemAnalysis: any, 
    childProfile: ChildProfile
  ): Promise<HomeworkSolution> {
    
    const solution = await this.aiService.generateHomeworkSolution({
      problem: problemAnalysis,
      child_age: childProfile.age,
      grade_level: childProfile.grade_level,
      learning_style: childProfile.learning_style,
      language: childProfile.language,
      educational_approach: 'scaffolded_learning', // Build understanding step by step
      include_visual_aids: childProfile.learning_style === 'visual',
      difficulty_adaptation: true
    })

    // Romanian curriculum alignment
    const curriculumAlignment = await this.alignWithRomanianCurriculum(
      solution,
      childProfile.grade_level,
      problemAnalysis.subject
    )

    return {
      step_by_step_solution: solution.steps.map((step: any, index: number) => ({
        step_number: index + 1,
        description: step.description,
        explanation: step.explanation,
        visual_aid: step.visual_aid,
        key_concept: step.key_concept
      })),
      final_answer: solution.final_answer,
      explanation: solution.detailed_explanation,
      learning_concepts: curriculumAlignment.concepts,
      similar_problems: await this.generateSimilarProblems(problemAnalysis, 3),
      difficulty_analysis: {
        complexity_score: solution.complexity_score,
        prerequisite_knowledge: solution.prerequisites,
        challenge_areas: solution.challenges
      },
      estimated_time_minutes: solution.estimated_time,
      hints: solution.progressive_hints,
      visual_aids: solution.visual_aids
    }
  }

  // ===========================
  // LEARNING PROGRESS TRACKING
  // ===========================

  async trackLearningSession(
    childId: string,
    sessionData: {
      subject: string
      topic: string
      duration_minutes: number
      problems_attempted: number
      problems_correct: number
      mistakes_made: string[]
      help_requests: number
      engagement_level: 1 | 2 | 3 | 4 | 5
    }
  ): Promise<LearningProgress> {
    
    // Get current progress
    let progress = await this.getLearningProgress(childId, sessionData.subject, sessionData.topic)
    
    if (!progress) {
      progress = await this.initializeLearningProgress(childId, sessionData.subject, sessionData.topic)
    }

    // Calculate new mastery level using AI
    const masteryUpdate = await this.aiService.calculateMasteryLevel({
      current_mastery: progress.mastery_level,
      session_performance: {
        accuracy: sessionData.problems_correct / sessionData.problems_attempted,
        engagement: sessionData.engagement_level,
        independence: 1 - (sessionData.help_requests / sessionData.problems_attempted),
        time_efficiency: this.calculateTimeEfficiency(sessionData)
      },
      mistake_patterns: sessionData.mistakes_made,
      historical_data: await this.getHistoricalPerformance(childId, sessionData.subject)
    })

    // Update progress
    const updatedProgress = await this.supabase
      .from('learning_progress')
      .update({
        mastery_level: masteryUpdate.new_mastery_level,
        sessions_completed: progress.sessions_completed + 1,
        time_invested_hours: progress.time_invested_hours + (sessionData.duration_minutes / 60),
        mistakes_patterns: [...progress.mistakes_patterns, ...sessionData.mistakes_made],
        improvement_rate: masteryUpdate.improvement_rate,
        next_challenges: masteryUpdate.suggested_next_topics
      })
      .eq('child_id', childId)
      .eq('subject', sessionData.subject)
      .eq('topic', sessionData.topic)
      .select()
      .single()

    // Generate personalized recommendations
    await this.generatePersonalizedRecommendations(childId, updatedProgress.data)
    
    return updatedProgress.data
  }

  // ===========================
  // REAL EDUCATIONAL GAMES
  // ===========================

  async generatePersonalizedGame(
    childId: string,
    subject: string,
    difficultyLevel: number
  ): Promise<EducationalGame> {
    
    const childProfile = await this.getChildProfile(childId)
    const learningProgress = await this.getLearningProgress(childId, subject)
    
    // AI game generation based on learning gaps
    const game = await this.aiService.generateEducationalGame({
      child_profile: childProfile,
      subject,
      difficulty_level: difficultyLevel,
      learning_gaps: learningProgress?.mistakes_patterns || [],
      interests: childProfile.interests,
      game_types: this.getPreferredGameTypes(childProfile.learning_style)
    })

    // Create game instance
    const gameInstance = await this.supabase
      .from('educational_games')
      .insert({
        child_id: childId,
        game_name: game.name,
        subject,
        difficulty_level: difficultyLevel,
        learning_objectives: game.learning_objectives,
        game_data: game.game_mechanics,
        estimated_duration: game.estimated_duration,
        rewards_system: game.rewards,
        created_at: new Date()
      })
      .select()
      .single()

    return {
      id: gameInstance.data.id,
      name: game.name,
      description: game.description,
      learning_objectives: game.learning_objectives,
      game_mechanics: game.game_mechanics,
      rewards_system: game.rewards,
      estimated_duration: game.estimated_duration,
      personalization_level: game.personalization_score
    }
  }

  // ===========================
  // PARENT DASHBOARD DATA
  // ===========================

  async getParentDashboardData(parentId: string): Promise<ParentDashboard> {
    // Get all children for this parent
    const children = await this.getParentChildren(parentId)
    
    // Gather data for each child
    const childrenData = await Promise.all(
      children.map(async (child) => {
        const [
          recentHomework,
          learningProgress,
          weeklyActivity,
          achievements,
          aiInsights
        ] = await Promise.all([
          this.getRecentHomework(child.id, 7),
          this.getAllLearningProgress(child.id),
          this.getWeeklyActivity(child.id),
          this.getRecentAchievements(child.id),
          this.generateChildInsights(child.id)
        ])

        return {
          child_profile: child,
          recent_homework: recentHomework,
          learning_progress: learningProgress,
          weekly_activity: weeklyActivity,
          achievements: achievements,
          ai_insights: aiInsights,
          attention_areas: await this.identifyAttentionAreas(child.id),
          celebration_moments: await this.identifySuccesses(child.id)
        }
      })
    )

    // Family-level insights
    const familyInsights = await this.generateFamilyLearningInsights(parentId, childrenData)

    return {
      children: childrenData,
      family_insights: familyInsights,
      weekly_summary: await this.generateWeeklySummary(parentId),
      recommendations: await this.generateParentRecommendations(parentId),
      upcoming_events: await this.getUpcomingEducationalEvents(),
      resource_suggestions: await this.suggestEducationalResources(childrenData)
    }
  }

  // ===========================
  // AI INSIGHTS FOR PARENTS
  // ===========================

  private async generateChildInsights(childId: string): Promise<ChildInsight[]> {
    // Gather comprehensive learning data
    const learningData = await this.gatherComprehensiveLearningData(childId)
    
    // AI analysis
    const insights = await this.aiService.generateChildLearningInsights({
      homework_data: learningData.homework,
      progress_data: learningData.progress,
      engagement_data: learningData.engagement,
      strengths: learningData.strengths,
      challenges: learningData.challenges,
      parent_involvement: learningData.parent_involvement
    })

    return insights.map(insight => ({
      id: `insight_${Date.now()}_${Math.random()}`,
      category: insight.category, // 'academic', 'behavioral', 'emotional', 'social'
      title: insight.title,
      description: insight.description,
      importance: insight.importance, // 'low', 'medium', 'high', 'urgent'
      actionable_steps: insight.parent_actions,
      confidence_score: insight.confidence,
      timeline: insight.recommended_timeline
    }))
  }

  // ===========================
  // ROMANIAN CURRICULUM ALIGNMENT
  // ===========================

  private async alignWithRomanianCurriculum(
    solution: any,
    gradeLevel: number,
    subject: string
  ): Promise<CurriculumAlignment> {
    
    const curriculumData = await this.getRomanianCurriculumData(gradeLevel, subject)
    
    const alignment = await this.aiService.alignWithCurriculum({
      solution,
      curriculum: curriculumData,
      grade_level: gradeLevel,
      subject,
      country: 'Romania'
    })

    return {
      curriculum_match: alignment.match_percentage,
      covered_objectives: alignment.objectives_covered,
      missing_objectives: alignment.objectives_missing,
      enhancement_suggestions: alignment.enhancements,
      concepts: alignment.key_concepts
    }
  }

  // ===========================
  // HELPER METHODS
  // ===========================

  private async uploadHomeworkImage(file: File, childId: string): Promise<string> {
    const fileName = `homework/${childId}/${Date.now()}-${file.name}`
    
    const { data, error } = await this.supabase.storage
      .from('homework-images')
      .upload(fileName, file)
    
    if (error) throw new Error(`Failed to upload image: ${error.message}`)
    
    return this.supabase.storage
      .from('homework-images')
      .getPublicUrl(data.path).data.publicUrl
  }

  private async performAdvancedOCR(imageUrl: string, language: string = 'romanian'): Promise<{text: string, confidence: number}> {
    // Use OpenRouter for OCR via multimodal models
    const ocrResult = await this.aiService.performOCR({
      image_url: imageUrl,
      language,
      enhance_quality: true,
      detect_handwriting: true
    })
    
    return {
      text: ocrResult.extracted_text,
      confidence: ocrResult.confidence_score
    }
  }

  private async getChildProfile(childId: string): Promise<ChildProfile> {
    const { data, error } = await this.supabase
      .from('child_profiles')
      .select('*')
      .eq('id', childId)
      .single()
    
    if (error || !data) {
      throw new Error(`Child profile not found: ${childId}`)
    }
    
    return data
  }

  private async saveHomeworkSubmission(submissionData: any): Promise<HomeworkSubmission> {
    const { data, error } = await this.supabase
      .from('homework_submissions')
      .insert(submissionData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to save homework: ${error.message}`)
    return data
  }

  private calculateTimeEfficiency(sessionData: any): number {
    // Calculate based on problems per minute vs expected rate for age
    const problemsPerMinute = sessionData.problems_attempted / sessionData.duration_minutes
    const expectedRate = this.getExpectedProblemRate(sessionData.grade_level)
    return Math.min(problemsPerMinute / expectedRate, 2.0) // Cap at 2.0 for very fast learners
  }
}

// Export for use in dashboard
export const porKidsService = new PorKidsService()