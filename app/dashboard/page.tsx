// app/dashboard/page.tsx
// REAL DATA DASHBOARD - Transform Mock to Living Intelligence

'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { porHealthService } from '@/lib/services/porhealth-service'
import { porKidsService } from '@/lib/services/porkids-service'
import { porWellService } from '@/lib/services/porwell-service'
import styles from './dashboard.module.css'

interface DashboardData {
  health: HealthDashboardData | null
  kids: ParentDashboard | null
  wellness: WellnessDashboard | null
  crossEcosystemInsights: CrossEcosystemInsight[]
  quantumVaultAccess: boolean
  loading: boolean
  error: string | null
}

export default function RealDataDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    health: null,
    kids: null,
    wellness: null,
    crossEcosystemInsights: [],
    quantumVaultAccess: false,
    loading: true,
    error: null
  })

  const supabase = createClientSupabase()

  useEffect(() => {
    loadRealDashboardData()
  }, [])

  // ===========================
  // REAL DATA LOADING
  // ===========================

  const loadRealDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }))

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }
      setUser(currentUser)

      // Load real data from all ecosystems in parallel
      const [healthData, kidsData, wellnessData] = await Promise.allSettled([
        porHealthService.getDashboardData(currentUser.id),
        porKidsService.getParentDashboardData(currentUser.id),
        porWellService.getWellnessDashboardData(currentUser.id)
      ])

      // Process results
      const processedData: Partial<DashboardData> = {
        health: healthData.status === 'fulfilled' ? healthData.value : null,
        kids: kidsData.status === 'fulfilled' ? kidsData.value : null,
        wellness: wellnessData.status === 'fulfilled' ? wellnessData.value : null,
      }

      // Generate cross-ecosystem insights
      if (processedData.health && processedData.wellness) {
        processedData.crossEcosystemInsights = await generateCrossEcosystemInsights(
          processedData.health,
          processedData.wellness,
          currentUser.id
        )
      }

      // Check Quantum Vault access (Trinity combo)
      processedData.quantumVaultAccess = await checkQuantumVaultAccess(currentUser.id)

      setDashboardData(prev => ({
        ...prev,
        ...processedData,
        loading: false
      }))

    } catch (error) {
      console.error('Dashboard loading error:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    }
  }

  // ===========================
  // CROSS-ECOSYSTEM AI INSIGHTS
  // ===========================

  const generateCrossEcosystemInsights = async (
    healthData: HealthDashboardData,
    wellnessData: WellnessDashboard,
    userId: string
  ): Promise<CrossEcosystemInsight[]> => {
    
    const insights: CrossEcosystemInsight[] = []

    // Sleep Impact Analysis
    if (healthData.biometrics.latest_readings.sleep_hours && wellnessData.mood_tracking.recent_entries.length > 0) {
      const avgSleep = healthData.biometrics.latest_readings.sleep_hours
      const avgMood = wellnessData.mood_tracking.average_mood
      
      if (avgSleep < 7 && avgMood < 6) {
        insights.push({
          type: 'sleep_mood_correlation',
          title: '😴 Somnul afectează dispoziția',
          description: `Dormi în medie ${avgSleep}h/noapte și ai dispoziția la ${avgMood}/10. Somnul insuficient poate afecta starea emoțională.`,
          action_items: [
            'Stabilește o rutină de somn consistentă',
            'Evită ecranele cu 1h înainte de culcare',
            'Încearcă meditația pentru somn din PorWell'
          ],
          ecosystems_involved: ['PorHealth', 'PorWell'],
          priority: 'high',
          confidence: 0.85
        })
      }
    }

    // Nutrition Mood Impact
    if (healthData.nutrition.macro_breakdown && wellnessData.mood_tracking.recent_entries.length > 0) {
      const avgMood = wellnessData.mood_tracking.average_mood
      const proteinIntake = healthData.nutrition.macro_breakdown.protein_g
      
      if (proteinIntake < 80 && avgMood < 6) {
        insights.push({
          type: 'nutrition_mood_correlation',
          title: '🥗 Nutriția influențează mintea',
          description: `Consumul redus de proteine (${proteinIntake}g/zi) poate contribui la dispoziția scăzută (${avgMood}/10).`,
          action_items: [
            'Crește aportul de proteine la 1.2g/kg corp',
            'Include surse de triptofan (pui, pește, ouă)',
            'Consultă planul de nutriție AI din PorHealth'
          ],
          ecosystems_involved: ['PorHealth', 'PorWell'],
          priority: 'medium',
          confidence: 0.72
        })
      }
    }

    // Exercise Stress Relief
    if (healthData.fitness.recent_sessions.length > 0 && wellnessData.mood_tracking.recent_entries.length > 0) {
      const exerciseFrequency = healthData.fitness.recent_sessions.length
      const avgStress = wellnessData.mood_tracking.recent_entries.reduce((sum, entry) => sum + (entry.stress_level || 5), 0) / wellnessData.mood_tracking.recent_entries.length
      
      if (exerciseFrequency < 3 && avgStress > 6) {
        insights.push({
          type: 'exercise_stress_correlation',
          title: '💪 Exercițiul reduce stresul',
          description: `Doar ${exerciseFrequency} antrenamente în ultima săptămână, iar nivelul de stres este ${avgStress.toFixed(1)}/10. Exercițiul regulat poate reduce semnificativ stresul.`,
          action_items: [
            'Programează 3-4 antrenamente/săptămână',
            'Încearcă yoga sau pilates pentru relaxare',
            'Folosește workout-urile anti-stres din PorHealth'
          ],
          ecosystems_involved: ['PorHealth', 'PorWell'],
          priority: 'high',
          confidence: 0.91
        })
      }
    }

    return insights
  }

  // ===========================
  // QUANTUM VAULT ACCESS CHECK
  // ===========================

  const checkQuantumVaultAccess = async (userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('user_ecosystems')
      .select('ecosystem, access_level')
      .eq('user_id', userId)
      .eq('access_level', 'premium')

    const premiumEcosystems = data?.map(d => d.ecosystem) || []
    const trinityEcosystems = ['por-mind', 'por-flow', 'por-blu']
    
    return trinityEcosystems.every(ecosystem => premiumEcosystems.includes(ecosystem))