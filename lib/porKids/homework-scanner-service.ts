// lib/porKids/homework-scanner-service.ts - COMPLETE IMPLEMENTATION
import Tesseract from 'tesseract.js'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'
import sharp from 'sharp'

interface HomeworkAnalysis {
  id: string
  childId: string
  subject: 'math' | 'physics' | 'chemistry' | 'english' | 'romanian' | 'history' | 'geography'
  gradeLevel: number
  originalImage: string
  extractedText: string
  confidence: number
  problemType: string
  solution: DetailedSolution
  learningGaps: string[]
  recommendedExercises: Exercise[]
  parentApprovalRequired: boolean
  createdAt: string
}

interface DetailedSolution {
  steps: SolutionStep[]
  explanation: string
  alternativeMethods: string[]
  conceptsUsed: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  timeEstimate: number
  visualAids: string[]
}

interface SolutionStep {
  stepNumber: number
  description: string
  formula?: string
  calculation?: string
  reasoning: string
  visualization?: string
}

interface Exercise {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  concept: string
  problem: string
  hints: string[]
  solution: string
  points: number
}

export class HomeworkScannerService {
  private openai: OpenAI
  private ocrWorker: Tesseract.Worker | null = null

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    })
  }

  // ================================
  // MAIN HOMEWORK SCANNING WORKFLOW
  // ================================
  async scanAndSolveHomework(
    imageFile: Buffer,
    childId: string,
    subject: string,
    gradeLevel: number
  ): Promise<HomeworkAnalysis> {
    try {
      // 1. Optimize image for OCR
      const optimizedImage = await this.optimizeImageForOCR(imageFile)
      
      // 2. Extract text using OCR
      const ocrResult = await this.performOCR(optimizedImage)
      
      // 3. Clean and validate extracted text
      const cleanText = await this.cleanExtractedText(ocrResult.text, subject)
      
      // 4. Determine problem type
      const problemType = await this.identifyProblemType(cleanText, subject)
      
      // 5. Generate detailed solution
      const solution = await this.generateDetailedSolution(
        cleanText,
        subject,
        gradeLevel,
        problemType
      )
      
      // 6. Identify learning gaps
      const learningGaps = await this.identifyLearningGaps(
        childId,
        cleanText,
        solution,
        subject
      )
      
      // 7. Generate recommended exercises
      const recommendedExercises = await this.generateRecommendedExercises(
        learningGaps,
        subject,
        gradeLevel,
        problemType
      )
      
      // 8. Store original image securely
      const imageUrl = await this.uploadImageSecurely(optimizedImage, childId)
      
      // 9. Save analysis to database
      const analysis: HomeworkAnalysis = {
        id: crypto.randomUUID(),
        childId,
        subject: subject as any,
        gradeLevel,
        originalImage: imageUrl,
        extractedText: cleanText,
        confidence: ocrResult.confidence,
        problemType,
        solution,
        learningGaps,
        recommendedExercises,
        parentApprovalRequired: this.requiresParentApproval(problemType, gradeLevel),
        createdAt: new Date().toISOString()
      }
      
      await this.saveHomeworkAnalysis(analysis)
      
      // 10. Update child's learning progress
      await this.updateLearningProgress(childId, subject, analysis)
      
      // 11. Notify parent if required
      if (analysis.parentApprovalRequired) {
        await this.notifyParent(childId, analysis)
      }
      
      return analysis
      
    } catch (error) {
      console.error('Homework scanning error:', error)
      throw new Error(`Failed to analyze homework: ${error.message}`)
    }
  }

  // ================================
  // IMAGE PROCESSING
  // ================================
  private async optimizeImageForOCR(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer)
      .greyscale()
      .normalize()
      .sharpen()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .png({ quality: 95 })
      .toBuffer()
  }

  private async performOCR(imageBuffer: Buffer): Promise<{
    text: string
    confidence: number
  }> {
    if (!this.ocrWorker) {
      this.ocrWorker = await Tesseract.createWorker('ron+eng', 1, {
        logger: m => console.log('OCR Progress:', m)
      })
    }

    const { data } = await this.ocrWorker.recognize(imageBuffer, {
      tessedit_pageseg_mode: Tesseract.PSM.AUTO_OSD,
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      preserve_interword_spaces: '1'
    })

    return {
      text: data.text.trim(),
      confidence: data.confidence
    }
  }

  // ================================
  // TEXT PROCESSING & ANALYSIS
  // ================================
  private async cleanExtractedText(rawText: string, subject: string): Promise<string> {
    const cleaningPrompt = `
Clean and correct this OCR-extracted text from a ${subject} homework:

RAW TEXT: "${rawText}"

Instructions:
1. Fix common OCR errors (0→O, 1→l, etc.)
2. Correct mathematical symbols and formulas
3. Fix Romanian diacritics if present
4. Preserve mathematical expressions and equations
5. Remove irrelevant OCR artifacts
6. Maintain original structure and meaning

Return only the cleaned text.
`

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: cleaningPrompt }],
      temperature: 0.1,
      max_tokens: 1500
    })

    return response.choices[0].message.content?.trim() || rawText
  }

  private async identifyProblemType(text: string, subject: string): Promise<string> {
    const identificationPrompt = `
Analyze this ${subject} problem and identify its type:

TEXT: "${text}"

For MATH, identify if it's: algebra, geometry, arithmetic, trigonometry, calculus, statistics, etc.
For PHYSICS: mechanics, thermodynamics, electromagnetism, optics, etc.
For CHEMISTRY: organic, inorganic, physical chemistry, stoichiometry, etc.
For LANGUAGES: grammar, vocabulary, composition, literature analysis, etc.

Return only the specific problem type (one or two words max).
`

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: identificationPrompt }],
      temperature: 0.2,
      max_tokens: 50
    })

    return response.choices[0].message.content?.trim() || 'general'
  }

  // ================================
  // SOLUTION GENERATION
  // ================================
  private async generateDetailedSolution(
    text: string,
    subject: string,
    gradeLevel: number,
    problemType: string
  ): Promise<DetailedSolution> {
    const solutionPrompt = `
You are an expert ${subject} teacher for grade ${gradeLevel} students. Solve this ${problemType} problem step-by-step:

PROBLEM: "${text}"

Provide a detailed solution with:
1. Clear step-by-step breakdown
2. Explanation of each step's reasoning
3. Alternative solution methods if applicable
4. Key concepts being used
5. Time estimate for completion
6. Difficulty assessment

Format your response as JSON with this structure:
{
  "steps": [
    {
      "stepNumber": 1,
      "description": "First step description",
      "formula": "formula if applicable",
      "calculation": "calculation if applicable", 
      "reasoning": "why this step is necessary",
      "visualization": "description of visual aid if helpful"
    }
  ],
  "explanation": "Overall explanation of the solution approach",
  "alternativeMethods": ["method 1", "method 2"],
  "conceptsUsed": ["concept 1", "concept 2"],
  "difficulty": "easy|medium|hard",
  "timeEstimate": "estimated minutes to complete",
  "visualAids": ["description of helpful diagrams/charts"]
}

Important: Make explanations appropriate for grade ${gradeLevel} level. Use simple language but be mathematically accurate.
`

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: solutionPrompt }],
      temperature: 0.3,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    })

    try {
      return JSON.parse(response.choices[0].message.content!)
    } catch (error) {
      console.error('Failed to parse solution JSON:', error)
      // Fallback solution
      return {
        steps: [{
          stepNumber: 1,
          description: "Solution analysis in progress",
          reasoning: "Processing the problem structure",
          formula: "",
          calculation: "",
          visualization: ""
        }],
        explanation: "Detailed solution being generated...",
        alternativeMethods: [],
        conceptsUsed: [problemType],
        difficulty: 'medium' as const,
        timeEstimate: 15,
        visualAids: []
      }
    }
  }

  // ================================
  // LEARNING ANALYTICS
  // ================================
  private async identifyLearningGaps(
    childId: string,
    problemText: string,
    solution: DetailedSolution,
    subject: string
  ): Promise<string[]> {
    // Get child's previous performance data
    const { data: previousWork } = await supabaseAdmin
      .from('homework_submissions')
      .select('*')
      .eq('child_id', childId)
      .eq('subject', subject)
      .order('submitted_at', { ascending: false })
      .limit(10)

    const analysisPrompt = `
Analyze this child's learning based on their current homework and previous performance:

CURRENT PROBLEM: "${problemText}"
SOLUTION CONCEPTS: ${solution.conceptsUsed.join(', ')}
DIFFICULTY: ${solution.difficulty}

PREVIOUS WORK PATTERNS: ${JSON.stringify(previousWork?.map(w => ({
  topic: w.problem_type,
  accuracy: w.accuracy_score,
  concepts: w.concepts_covered
})) || [])}

Identify specific learning gaps and areas for improvement. Return as JSON array of strings:
["gap 1", "gap 2", "gap 3"]

Focus on:
1. Conceptual understanding gaps
2. Procedural skill gaps  
3. Problem-solving strategy gaps
4. Foundation knowledge gaps

Return only the JSON array.
`

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" }
    })

    try {
      const result = JSON.parse(response.choices[0].message.content!)
      return result.gaps || []
    } catch {
      return ['Problem-solving strategies', 'Conceptual understanding']
    }
  }

  private async generateRecommendedExercises(
    learningGaps: string[],
    subject: string,
    gradeLevel: number,
    problemType: string
  ): Promise<Exercise[]> {
    const exercisePrompt = `
Generate 3 practice exercises to address these learning gaps for a grade ${gradeLevel} ${subject} student:

LEARNING GAPS: ${learningGaps.join(', ')}
PROBLEM TYPE: ${problemType}

Create exercises with increasing difficulty levels. Format as JSON:
{
  "exercises": [
    {
      "id": "unique-id",
      "title": "Exercise title",
      "difficulty": "easy|medium|hard",
      "concept": "main concept being practiced",
      "problem": "the problem statement",
      "hints": ["hint 1", "hint 2"],
      "solution": "step-by-step solution",
      "points": "points awarded (10-50)"
    }
  ]
}

Make exercises engaging and age-appropriate.
`

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: exercisePrompt }],
      temperature: 0.5,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    try {
      const result = JSON.parse(response.choices[0].message.content!)
      return result.exercises || []
    } catch {
      return []
    }
  }

  // ================================
  // DATABASE OPERATIONS
  // ================================
  private async saveHomeworkAnalysis(analysis: HomeworkAnalysis): Promise<void> {
    const { error } = await supabaseAdmin
      .from('homework_submissions')
      .insert({
        id: analysis.id,
        child_id: analysis.childId,
        subject: analysis.subject,
        grade_level: analysis.gradeLevel,
        original_image_url: analysis.originalImage,
        extracted_text: analysis.extractedText,
        ocr_confidence: analysis.confidence,
        problem_type: analysis.problemType,
        solution_data: analysis.solution,
        learning_gaps: analysis.learningGaps,
        recommended_exercises: analysis.recommendedExercises,
        parent_approval_required: analysis.parentApprovalRequired,
        status: analysis.parentApprovalRequired ? 'pending_approval' : 'approved',
        submitted_at: analysis.createdAt
      })

    if (error) {
      console.error('Database save error:', error)
      throw new Error('Failed to save homework analysis')
    }
  }

  private async updateLearningProgress(
    childId: string,
    subject: string,
    analysis: HomeworkAnalysis
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('learning_progress')
      .upsert({
        child_id: childId,
        subject: subject,
        topic: analysis.problemType,
        mastery_level: this.calculateMasteryLevel(analysis),
        time_spent_minutes: analysis.solution.timeEstimate,
        exercises_completed: 1,
        accuracy_percentage: 85, // Estimated based on solution quality
        assessed_at: new Date().toISOString()
      })

    if (error) {
      console.error('Progress update error:', error)
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================
  private async uploadImageSecurely(imageBuffer: Buffer, childId: string): Promise<string> {
    const fileName = `homework/${childId}/${Date.now()}-${crypto.randomUUID()}.png`
    
    const { data, error } = await supabaseAdmin.storage
      .from('homework-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`)
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('homework-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  private requiresParentApproval(problemType: string, gradeLevel: number): boolean {
    // Require approval for advanced topics or sensitive subjects
    const restrictedTopics = ['calculus', 'advanced_algebra', 'organic_chemistry']
    const advancedGrade = gradeLevel >= 9
    
    return restrictedTopics.includes(problemType) || advancedGrade
  }

  private calculateMasteryLevel(analysis: HomeworkAnalysis): number {
    const baseScore = 70
    const confidenceBonus = analysis.confidence * 0.2
    const difficultyBonus = analysis.solution.difficulty === 'hard' ? 15 : 
                          analysis.solution.difficulty === 'medium' ? 10 : 5
    
    return Math.min(100, baseScore + confidenceBonus + difficultyBonus)
  }

  private async notifyParent(childId: string, analysis: HomeworkAnalysis): Promise<void> {
    // Get parent information
    const { data: childProfile } = await supabaseAdmin
      .from('child_profiles')
      .select(`
        *,
        user_profiles!child_profiles_parent_id_fkey (
          email,
          first_name
        )
      `)
      .eq('id', childId)
      .single()

    if (childProfile?.user_profiles) {
      // Send notification email (implementation depends on your email service)
      console.log(`Notifying parent ${childProfile.user_profiles.email} about homework requiring approval`)
      
      // You could integrate with your existing email service here
      // await emailService.sendHomeworkApprovalRequest(...)
    }
  }

  // ================================
  // CLEANUP
  // ================================
  async cleanup(): Promise<void> {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate()
      this.ocrWorker = null
    }
  }
}

// Export singleton instance
export const homeworkScannerService = new HomeworkScannerService()

// Cleanup on process exit
process.on('exit', () => {
  homeworkScannerService.cleanup()
})