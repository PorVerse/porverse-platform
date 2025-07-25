// app/api/payments/plans/route.ts - UPDATED FOR FREEMIUM MODEL
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // CORRECT PRICING STRUCTURE
    const plans = {
      free: [
        {
          id: 'por-health-free',
          name: 'PorHealth FREE',
          description: 'Optimizarea sănătății cu AI basic',
          ecosystems: ['por-health'],
          price: { monthly: 0, yearly: 0 },
          currency: 'RON',
          features: [
            'Basic Nutrition Tracking',
            'Simple Workout Plans', 
            'Health Tips AI',
            'Community Access',
            'Mobile App',
            '⚡ Ads supported'
          ],
          limitations: [
            '10 AI interactions/zi',
            'Basic analytics only',
            'Community support only'
          ]
        },
        {
          id: 'por-kids-free',
          name: 'PorKids FREE',
          description: 'Educație smart pentru copii',
          ecosystems: ['por-kids'],
          price: { monthly: 0, yearly: 0 },
          currency: 'RON',
          features: [
            'Basic Homework Help',
            'Simple Educational Games',
            'Progress Tracking',
            'Parent Notifications',
            'Study Reminders',
            '⚡ Limited AI interactions'
          ],
          limitations: [
            '5 homework scans/zi',
            'Basic games only',
            'Limited progress details'
          ]
        }
      ],
      
      upgrades: [
        {
          id: 'por-health-premium',
          name: 'PorHealth PREMIUM',
          description: 'Nutrition & fitness AI superpowered',
          ecosystems: ['por-health'],
          price: { monthly: 19.99, yearly: 199.99 },
          currency: 'RON',
          upgradeFrom: 'por-health-free',
          features: [
            '🚀 Advanced AI Nutrition Planner',
            '🎯 Personalized Workout Optimizer',
            '📊 Complete Biometric Analysis',
            '🍽️ Smart Meal Planning & Shopping',
            '💪 Real-time Form Correction',
            '🏆 Achievement System',
            '❌ No ads, unlimited AI'
          ]
        },
        {
          id: 'por-kids-premium',
          name: 'PorKids PREMIUM',
          description: 'Educational powerhouse pentru copii',
          ecosystems: ['por-kids'],
          price: { monthly: 19.99, yearly: 199.99 },
          currency: 'RON',
          upgradeFrom: 'por-kids-free',
          features: [
            '📸 AI Homework Scanner & Solver',
            '🎮 Advanced Educational Games',
            '🧠 Adaptive Learning System',
            '👨‍👩‍👧 Family Dashboard',
            '📈 Detailed Progress Analytics',
            '🏅 Gamified Learning Rewards',
            '❌ No ads, unlimited scans'
          ]
        }
      ],

      premium: [
        {
          id: 'por-mind',
          name: 'PorMind',
          description: 'Financial education & wealth building AI',
          ecosystems: ['por-mind'],
          price: { monthly: 29.99, yearly: 299.99 },
          currency: 'RON',
          features: [
            '💰 AI Financial Coach',
            '📊 Smart Investment Advisor',
            '🎯 Personalized Budgeting',
            '💎 Wealth Building Strategies',
            '📈 Market Analysis AI',
            '🏦 Bank Account Integration'
          ]
        },
        {
          id: 'por-well',
          name: 'PorWell',
          description: 'Mental wellness & AI therapy',
          ecosystems: ['por-well'],
          price: { monthly: 29.99, yearly: 299.99 },
          currency: 'RON',
          features: [
            '🧠 AI Therapist 24/7',
            '😌 Advanced Mood Tracking',
            '🧘 Personalized Meditation',
            '💙 Anxiety & Stress Management',
            '📓 Smart Emotional Journal',
            '🚨 Crisis Detection & Support'
          ]
        },
        {
          id: 'por-flow',
          name: 'PorFlow',
          description: 'Productivity & time optimization AI',
          ecosystems: ['por-flow'],
          price: { monthly: 29.99, yearly: 299.99 },
          currency: 'RON',
          features: [
            '⚡ AI Productivity Optimizer',
            '⏰ Smart Time Blocking',
            '🎯 Intelligent Task Prioritization',
            '🔥 Focus Session Tracker',
            '🤖 Workflow Automation',
            '📊 Performance Analytics'
          ]
        },
        {
          id: 'por-blu',
          name: 'PorBlu', 
          description: 'Strategic planning & executive coaching',
          ecosystems: ['por-blu'],
          price: { monthly: 29.99, yearly: 299.99 },
          currency: 'RON',
          features: [
            '🎯 Strategic Life Planning',
            '👔 AI Executive Coach',
            '🔮 Vision Board Creator',
            '📋 Decision Framework Tools',
            '🏆 Leadership Development',
            '💼 Legacy Planning'
          ]
        }
      ],

      bundles: [
        {
          id: 'trinity',
          name: 'Trinity Pack',
          description: 'Business optimization combo + Quantum Vault',
          ecosystems: ['por-mind', 'por-flow', 'por-blu'],
          price: { monthly: 79.99, yearly: 799.99 },
          currency: 'RON',
          popular: true,
          unlocks: 'quantum_vault',
          features: [
            '🔥 All PorMind, PorFlow & PorBlu features',
            '🔮 QUANTUM VAULT ACCESS',
            '🚀 Future Self Simulator',
            '🎭 Identity Simulator', 
            '🔄 Reverse Roadmap Planner',
            '🪞 Mirror Conversations',
            '📊 Pattern Detection AI'
          ],
          savings: {
            monthly: 9.98, // vs 89.97 individual
            yearly: 99.98
          }
        },
        {
          id: 'quantum_direct',
          name: 'Quantum Vault Direct',
          description: 'Direct access la Quantum Vault doar',
          ecosystems: ['quantum-vault'],
          price: { monthly: 99.99, yearly: 999.99 },
          currency: 'RON',
          unlocks: 'quantum_vault',
          features: [
            '🔮 Full Quantum Vault Access',
            '🚀 Future Self Generator',
            '🎭 Identity Simulation',
            '🔄 Reverse Life Planning',
            '🪞 AI Mirror Conversations',
            '📊 Deep Pattern Analysis',
            '🎯 Quantum Guidance System'
          ]
        },
        {
          id: 'complete',
          name: 'Complete Ecosystem',
          description: 'Everything + Premium support',
          ecosystems: ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu'],
          price: { monthly: 149.99, yearly: 1499.99 },
          currency: 'RON',
          unlocks: 'everything',
          features: [
            '🌟 ALL ecosystems (including premium upgrades)',
            '🔮 Full Quantum Vault Access',
            '👑 VIP Support 24/7',
            '🚀 Priority AI Processing',
            '📞 Monthly Coaching Calls',
            '🎯 Custom AI Training',
            '🏆 Lifetime Updates'
          ],
          savings: {
            monthly: 29.95, // vs 179.94 individual
            yearly: 299.95
          }
        }
      ]
    }

    const quantumVaultInfo = {
      name: 'Quantum Vault',
      description: 'Advanced AI laboratory pentru simulări și insights',
      unlockMethods: [
        {
          method: 'trinity_pack',
          description: 'Cumpără Trinity Pack (PorMind + PorFlow + PorBlu)',
          price: 79.99,
          recommended: true
        },
        {
          method: 'direct_access',
          description: 'Acces direct doar la Quantum Vault',
          price: 99.99
        },
        {
          method: 'complete_ecosystem',
          description: 'Complete Ecosystem (include tot)',
          price: 149.99
        },
        {
          method: 'three_plus_ecosystems',
          description: 'Cumpără orice 3+ ecosisteme premium',
          price: 'varies',
          note: 'Quantum Vault se deblochează automat'
        }
      ],
      features: [
        'Future Self Simulator - Conversații cu tine de la 40-50 ani',
        'Identity Simulator - Explorează timeline-uri alternative',
        'Reverse Roadmap - Planifică backwards de la viziune la prezent',
        'Mirror Conversations - Dialoguri cu versiuni ale tale',
        'Pattern Detection AI - Detectează blind spots și pattern-uri',
        'Quantum Guidance - Insights de nivel următor pentru transformare'
      ]
    }

    // Regional pricing tiers
    const regionalPricing = {
      tier1: { // România
        name: 'România',
        currency: 'RON',
        symbol: '',
        multiplier: 1.0
      },
      tier2: { // US & EU
        name: 'US & EU',
        currency: 'USD', 
        symbol: '$',
        multiplier: 0.33 // ~3x cheaper in USD
      },
      tier3: { // Rest of World
        name: 'Rest of World',
        currency: 'USD',
        symbol: '$',
        multiplier: 0.17 // ~6x cheaper in USD
      }
    }

    return NextResponse.json({
      plans,
      quantumVault: quantumVaultInfo,
      regionalPricing,
      policies: {
        trialDays: 14,
        refundPeriod: 30,
        studentDiscount: 50,
        annualDiscount: 40,
        vatRate: 19
      }
    })

  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

// app/api/payments/checkout/route.ts - UPDATED FOR FREEMIUM
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { PayPalService } from '@/lib/services/paypal-service'
import { StripePaymentService } from '@/lib/services/stripe-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      planType, // 'free' | 'upgrade' | 'premium' | 'bundle'
      planId,
      ecosystems,
      tier,
      billingCycle,
      price,
      currency,
      paymentMethod = 'stripe' // 'stripe' | 'paypal'
    } = body

    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle FREE plans - no payment needed
    if (planType === 'free' || price === 0) {
      return await handleFreeSignup(user.id, planId, ecosystems)
    }

    // Handle PAID plans
    const checkoutData = {
      userId: user.id,
      planId,
      planType,
      ecosystems,
      tier,
      billingCycle,
      price,
      currency
    }

    if (paymentMethod === 'paypal') {
      const paypalService = new PayPalService()
      const result = await paypalService.createSubscription(
        user.id,
        planId,
        user.email!,
        `${user.user_metadata?.first_name || 'User'} ${user.user_metadata?.last_name || ''}`
      )
      
      return NextResponse.json({
        success: true,
        provider: 'paypal',
        subscriptionId: result.subscriptionId,
        approvalUrl: result.approvalUrl
      })
    } else {
      const stripeService = new StripePaymentService()
      const session = await stripeService.createCheckoutSession(checkoutData)
      
      return NextResponse.json({
        success: true,
        provider: 'stripe',
        sessionId: session.id,
        url: session.url
      })
    }

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

async function handleFreeSignup(userId: string, planId: string, ecosystems: string[]) {
  const supabase = createServerSupabase()
  
  try {
    // Grant FREE access to ecosystems
    for (const ecosystem of ecosystems) {
      await supabase
        .from('user_ecosystems')
        .upsert({
          user_id: userId,
          ecosystem: ecosystem,
          access_level: 'free', // Not 'premium'
          activated_at: new Date().toISOString(),
          expires_at: null // Free forever
        })
    }

    // Update user profile
    await supabase
      .from('user_profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'active',
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    // Log free signup
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        ecosystem: ecosystems[0] || 'general',
        action_type: 'free_signup',
        action_data: { 
          plan_id: planId,
          ecosystems: ecosystems,
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      type: 'free_signup',
      redirect: `/dashboard?welcome=true&plan=${planId}`
    })

  } catch (error) {
    console.error('Free signup error:', error)
    return NextResponse.json(
      { error: 'Failed to process free signup' },
      { status: 500 }
    )
  }
}

// app/api/ecosystems/access/route.ts - CHECK USER ACCESS
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's ecosystem access
    const { data: ecosystems, error: ecosystemError } = await supabase
      .from('user_ecosystems')
      .select('*')
      .eq('user_id', user.id)
      .order('activated_at', { ascending: false })

    if (ecosystemError) {
      throw ecosystemError
    }

    // Check Quantum Vault access
    const hasQuantumAccess = await checkQuantumVaultAccess(user.id, ecosystems || [])

    // Get subscription status
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    return NextResponse.json({
      ecosystems: ecosystems || [],
      quantumVault: {
        hasAccess: hasQuantumAccess.hasAccess,
        unlockMethod: hasQuantumAccess.method,
        accessLevel: hasQuantumAccess.level
      },
      subscription: subscription || null,
      summary: {
        totalEcosystems: ecosystems?.length || 0,
        premiumEcosystems: ecosystems?.filter(e => e.access_level === 'premium').length || 0,
        freeEcosystems: ecosystems?.filter(e => e.access_level === 'free').length || 0
      }
    })

  } catch (error) {
    console.error('Access check error:', error)
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    )
  }
}

async function checkQuantumVaultAccess(userId: string, ecosystems: any[]) {
  const premiumEcosystems = ecosystems.filter(e => e.access_level === 'premium')
  const premiumIds = premiumEcosystems.map(e => e.ecosystem)

  // Method 1: Trinity Pack (PorMind + PorFlow + PorBlu)
  const hasTrinity = ['por-mind', 'por-flow', 'por-blu'].every(eco => 
    premiumIds.includes(eco)
  )

  // Method 2: Direct Quantum Purchase
  const hasQuantumDirect = ecosystems.some(e => e.ecosystem === 'quantum-vault')

  // Method 3: Complete Package
  const hasComplete = ecosystems.some(e => e.ecosystem === 'complete')

  // Method 4: 3+ Premium Ecosystems
  const hasThreePlus = premiumEcosystems.length >= 3

  if (hasTrinity) {
    return { hasAccess: true, method: 'trinity_pack', level: 'full' }
  }
  
  if (hasQuantumDirect) {
    return { hasAccess: true, method: 'direct_purchase', level: 'full' }
  }
  
  if (hasComplete) {
    return { hasAccess: true, method: 'complete_package', level: 'full' }
  }
  
  if (hasThreePlus) {
    return { hasAccess: true, method: 'three_plus_ecosystems', level: 'full' }
  }

  return { hasAccess: false, method: null, level: null }
}

// lib/services/ecosystem-access.ts - MANAGE ACCESS LEVELS
import { createServerSupabase } from '@/lib/supabase'

export class EcosystemAccessService {
  private supabase = createServerSupabase()

  // Grant free access to PorHealth or PorKids
  async grantFreeAccess(userId: string, ecosystem: 'por-health' | 'por-kids') {
    const validEcosystems = ['por-health', 'por-kids']
    
    if (!validEcosystems.includes(ecosystem)) {
      throw new Error('Invalid ecosystem for free access')
    }

    const { error } = await this.supabase
      .from('user_ecosystems')
      .upsert({
        user_id: userId,
        ecosystem: ecosystem,
        access_level: 'free',
        activated_at: new Date().toISOString(),
        expires_at: null // Free forever
      })

    if (error) throw error

    // Log free access grant
    await this.supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        ecosystem: ecosystem,
        action_type: 'free_access_granted',
        action_data: { timestamp: new Date().toISOString() }
      })
  }

  // Upgrade free ecosystem to premium
  async upgradeToPremium(userId: string, ecosystem: string, subscriptionId: string) {
    const { error } = await this.supabase
      .from('user_ecosystems')
      .update({
        access_level: 'premium',
        upgraded_at: new Date().toISOString(),
        subscription_id: subscriptionId
      })
      .eq('user_id', userId)
      .eq('ecosystem', ecosystem)

    if (error) throw error

    // Check if this upgrade unlocks Quantum Vault
    await this.checkQuantumVaultUnlock(userId)
  }

  // Grant premium access to paid ecosystems
  async grantPremiumAccess(userId: string, ecosystems: string[], subscriptionId: string) {
    const premiumEcosystems = ['por-mind', 'por-well', 'por-flow', 'por-blu']
    
    for (const ecosystem of ecosystems) {
      if (!premiumEcosystems.includes(ecosystem)) {
        throw new Error(`${ecosystem} is not a premium ecosystem`)
      }

      await this.supabase
        .from('user_ecosystems')
        .upsert({
          user_id: userId,
          ecosystem: ecosystem,
          access_level: 'premium',
          activated_at: new Date().toISOString(),
          subscription_id: subscriptionId,
          expires_at: null // Subscription based
        })
    }

    // Check Quantum Vault unlock
    await this.checkQuantumVaultUnlock(userId)
  }

  // Check and unlock Quantum Vault if conditions met
  async checkQuantumVaultUnlock(userId: string) {
    const { data: ecosystems } = await this.supabase
      .from('user_ecosystems')
      .select('ecosystem, access_level')
      .eq('user_id', userId)
      .eq('access_level', 'premium')

    if (!ecosystems) return

    const premiumEcos = ecosystems.map(e => e.ecosystem)

    // Trinity Pack check
    const hasTrinity = ['por-mind', 'por-flow', 'por-blu'].every(eco => 
      premiumEcos.includes(eco)
    )

    // 3+ ecosystems check
    const hasThreePlus = premiumEcos.length >= 3

    if (hasTrinity || hasThreePlus) {
      // Grant Quantum Vault access
      await this.supabase
        .from('quantum_vault_access')
        .upsert({
          user_id: userId,
          access_level: 'full',
          unlocked_at: new Date().toISOString(),
          unlock_method: hasTrinity ? 'trinity_pack' : 'three_plus_ecosystems',
          features_unlocked: [
            'future_self',
            'identity_simulator', 
            'reverse_roadmap',
            'mirror_conversations',
            'pattern_detection',
            'quantum_guidance'
          ]
        })

      // Send unlock notification
      await this.sendQuantumUnlockNotification(userId)
    }
  }

  // Revoke access when subscription canceled
  async revokeAccess(userId: string, ecosystems: string[]) {
    // Don't revoke free ecosystems, only premium
    const premiumEcosystems = ecosystems.filter(eco => 
      !['por-health', 'por-kids'].includes(eco) || eco.includes('premium')
    )

    for (const ecosystem of premiumEcosystems) {
      await this.supabase
        .from('user_ecosystems')
        .update({
          access_level: 'locked',
          revoked_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('ecosystem', ecosystem)
    }

    // Check if Quantum Vault should be revoked
    await this.checkQuantumVaultRevoke(userId)
  }

  // Check if Quantum Vault access should be revoked
  async checkQuantumVaultRevoke(userId: string) {
    const { data: ecosystems } = await this.supabase
      .from('user_ecosystems')
      .select('ecosystem, access_level')
      .eq('user_id', userId)
      .eq('access_level', 'premium')

    const premiumCount = ecosystems?.length || 0
    const hasTrinity = ecosystems?.some(e => 
      ['por-mind', 'por-flow', 'por-blu'].every(eco => 
        ecosystems.map(e => e.ecosystem).includes(eco)
      )
    )

    // Revoke if no longer meets criteria
    if (premiumCount < 3 && !hasTrinity) {
      await this.supabase
        .from('quantum_vault_access')
        .update({
          access_level: 'revoked',
          revoked_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    }
  }

  // Get user access summary
  async getUserAccessSummary(userId: string) {
    const { data: ecosystems } = await this.supabase
      .from('user_ecosystems')
      .select('*')
      .eq('user_id', userId)
      .order('activated_at', { ascending: false })

    const { data: quantumAccess } = await this.supabase
      .from('quantum_vault_access')
      .select('*')
      .eq('user_id', userId)
      .eq('access_level', 'full')
      .single()

    const freeEcosystems = ecosystems?.filter(e => e.access_level === 'free') || []
    const premiumEcosystems = ecosystems?.filter(e => e.access_level === 'premium') || []

    return {
      free: freeEcosystems,
      premium: premiumEcosystems,
      quantumVault: quantumAccess,
      totalCount: ecosystems?.length || 0,
      canUpgrade: freeEcosystems.length > 0,
      quantumEligible: premiumEcosystems.length >= 2 // Close to unlock
    }
  }

  private async sendQuantumUnlockNotification(userId: string) {
    // Implementation for sending unlock notification
    // Could be email, push notification, in-app notification
    console.log(`🔮 Quantum Vault unlocked for user ${userId}`)
  }
}

// middleware.ts - UPDATED FOR ACCESS CONTROL
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/quantum-vault']
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Ecosystem access control
  if (req.nextUrl.pathname.startsWith('/dashboard/')) {
    const ecosystem = req.nextUrl.pathname.split('/')[2]
    
    if (ecosystem && ecosystem !== 'settings') {
      const hasAccess = await checkEcosystemAccess(user?.id, ecosystem)
      
      if (!hasAccess) {
        return NextResponse.redirect(
          new URL(`/pricing?upgrade=${ecosystem}`, req.url)
        )
      }
    }
  }

  // Quantum Vault access control
  if (req.nextUrl.pathname.startsWith('/quantum-vault')) {
    const hasQuantumAccess = await checkQuantumVaultAccess(user?.id)
    
    if (!hasQuantumAccess) {
      return NextResponse.redirect(
        new URL('/pricing?unlock=quantum', req.url)
      )
    }
  }

  return res
}

async function checkEcosystemAccess(userId: string | undefined, ecosystem: string): Promise<boolean> {
  if (!userId) return false

  // Free ecosystems are always accessible
  if (['por-health', 'por-kids'].includes(ecosystem)) {
    return true
  }

  // Check premium access for paid ecosystems
  // This would typically query your database
  // For now, return true to avoid blocking during development
  return true
}

async function checkQuantumVaultAccess(userId: string | undefined): Promise<boolean> {
  if (!userId) return false
  
  // Check Quantum Vault access criteria
  // This would query your database for Trinity/3+ ecosystems
  // For now, return true to avoid blocking during development
  return true
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/quantum-vault/:path*',
    '/api/protected/:path*'
  ]
}