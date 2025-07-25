// app/api/payments/paypal/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { PayPalService } from '@/lib/services/paypal-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const paypalService = new PayPalService()
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get plan details
    const plans = paypalService.getPlans()
    const selectedPlan = plans.find(p => p.id === planId)
    
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Create PayPal subscription
    const { subscriptionId, approvalUrl } = await paypalService.createSubscription(
      user.id,
      planId,
      user.email || profile.email,
      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'PorVerse User'
    )

    // Log the subscription creation
    await supabase
      .from('payment_logs')
      .insert({
        user_id: user.id,
        payment_provider: 'paypal',
        action: 'subscription_created',
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        metadata: { 
          subscription_id: subscriptionId,
          plan_id: planId,
          ecosystems: selectedPlan.ecosystems
        }
      })

    return NextResponse.json({
      success: true,
      subscriptionId,
      approvalUrl,
      plan: selectedPlan
    })

  } catch (error) {
    console.error('PayPal subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// app/api/payments/paypal/success/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PayPalService } from '@/lib/services/paypal-service'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subscriptionId = searchParams.get('subscription_id')
    const token = searchParams.get('token')

    if (!subscriptionId || !token) {
      return NextResponse.redirect(
        new URL('/pricing?error=missing_params', request.url)
      )
    }

    const paypalService = new PayPalService()
    const supabase = createServerSupabase()

    // Get subscription details from PayPal
    const subscriptionDetails = await paypalService.getSubscriptionDetails(subscriptionId)

    if (subscriptionDetails.status !== 'ACTIVE') {
      // Activate the subscription
      await paypalService.activateSubscription(subscriptionId)
    }

    // Get user from subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('paypal_subscription_id', subscriptionId)
      .single()

    if (!subscription) {
      return NextResponse.redirect(
        new URL('/pricing?error=subscription_not_found', request.url)
      )
    }

    // Update subscription status
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'ACTIVE',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId)

    // Grant ecosystem access
    const plans = paypalService.getPlans()
    const plan = plans.find(p => p.id === subscription.plan_id)
    
    if (plan) {
      for (const ecosystem of plan.ecosystems) {
        await supabase
          .from('user_ecosystems')
          .upsert({
            user_id: subscription.user_id,
            ecosystem,
            access_level: 'premium',
            activated_at: new Date().toISOString()
          })
      }
    }

    // Update user profile
    await supabase
      .from('user_profiles')
      .update({
        subscription_tier: subscription.plan_id as any,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.user_id)

    // Log successful payment
    await supabase
      .from('payment_logs')
      .insert({
        user_id: subscription.user_id,
        payment_provider: 'paypal',
        action: 'subscription_activated',
        amount: plan?.price || 0,
        currency: plan?.currency || 'RON',
        status: 'completed',
        metadata: { 
          subscription_id: subscriptionId,
          plan_id: subscription.plan_id
        }
      })

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/dashboard?welcome=true&provider=paypal', request.url)
    )

  } catch (error) {
    console.error('PayPal success handler error:', error)
    return NextResponse.redirect(
      new URL('/pricing?error=activation_failed', request.url)
    )
  }
}

// app/api/payments/paypal/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PayPalService } from '@/lib/services/paypal-service'

export async function POST(request: NextRequest) {
  try {
    const paypalService = new PayPalService()
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // Handle the webhook
    await paypalService.handleWebhook(headers, body)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// app/api/payments/paypal/cancel-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { PayPalService } from '@/lib/services/paypal-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const paypalService = new PayPalService()
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await request.json()

    // Get user's active subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .not('paypal_subscription_id', 'is', null)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'No active PayPal subscription found' }, { status: 404 })
    }

    // Cancel with PayPal
    await paypalService.cancelSubscription(
      subscription.paypal_subscription_id,
      reason || 'User requested cancellation'
    )

    // Update local database
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    // Log cancellation
    await supabase
      .from('payment_logs')
      .insert({
        user_id: user.id,
        payment_provider: 'paypal',
        action: 'subscription_canceled',
        metadata: { 
          subscription_id: subscription.paypal_subscription_id,
          reason 
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully'
    })

  } catch (error) {
    console.error('PayPal cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

// app/api/payments/plans/route.ts
import { NextResponse } from 'next/server'
import { PayPalService } from '@/lib/services/paypal-service'
import { StripePaymentService } from '@/lib/services/stripe-service'

export async function GET() {
  try {
    const paypalService = new PayPalService()
    const stripeService = new StripePaymentService()

    const plans = [
      {
        id: 'starter',
        name: 'PorHealth Starter',
        description: 'Perfect pentru cei care vor să își optimizeze sănătatea',
        price: {
          monthly: 49,
          yearly: 490
        },
        currency: 'RON',
        ecosystems: ['por-health'],
        features: [
          'AI Nutrition Planner',
          'Workout Optimizer', 
          'Health Tracking',
          'Biometric Analysis',
          'Meal Planning',
          'Recipe Generator'
        ],
        popular: false
      },
      {
        id: 'pro',
        name: 'Triple Pack Pro',
        description: 'Combinația perfectă: Sănătate + Familie + Finanțe',
        price: {
          monthly: 119,
          yearly: 1190
        },
        currency: 'RON',
        ecosystems: ['por-health', 'por-kids', 'por-mind'],
        features: [
          'Toate features din Starter',
          'Homework Scanner & Solver',
          'Educational Games',
          'Smart Budgeting',
          'Investment Advisor',
          'Financial Coaching',
          'Kids Progress Tracking'
        ],
        popular: true,
        savings: 'Economisești 39 RON/lună'
      },
      {
        id: 'complete',
        name: 'Complete Ecosystem',
        description: 'Transformare completă cu acces la Quantum Vault',
        price: {
          monthly: 199,
          yearly: 1990
        },
        currency: 'RON',
        ecosystems: ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu'],
        features: [
          'Toate features din Pro',
          'AI Therapist & Mental Wellness',
          'Productivity Optimizer',
          'Strategic Life Planning',
          'Executive Coaching',
          '🔮 QUANTUM VAULT ACCESS',
          'Future Self Simulator',
          'Pattern Detection AI'
        ],
        premium: true,
        savings: 'Economisești 95 RON/lună'
      }
    ]

    return NextResponse.json({
      plans,
      currency: 'RON',
      vatRate: 19,
      studentDiscount: 50, // 50% discount for students
      trialDays: 14
    })

  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}