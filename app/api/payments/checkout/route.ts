// app/api/payments/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StripePaymentService, SubscriptionData } from '@/lib/stripe/stripe-service'
import { createServerSupabase } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      planType,
      ecosystems,
      tier,
      billingCycle,
      price,
      currency,
      country
    } = body

    // Get user from session
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!planType || !ecosystems || !tier || !billingCycle || !price || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Prepare subscription data
    const subscriptionData: SubscriptionData = {
      userId: user.id,
      planType,
      ecosystems,
      tier,
      billingCycle,
      price,
      currency,
      country: country || 'RO'
    }

    // Create checkout session
    const paymentService = new StripePaymentService()
    const session = await paymentService.createCheckoutSession(subscriptionData)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// app/api/payments/success/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StripePaymentService } from '@/lib/stripe/stripe-service'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.redirect(new URL('/pricing?error=no_session', request.url))
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    })

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      const paymentService = new StripePaymentService()
      await paymentService.handleSuccessfulPayment(session)

      return NextResponse.redirect(
        new URL('/dashboard?welcome=true&plan=' + session.metadata?.plan_type, request.url)
      )
    } else {
      return NextResponse.redirect(
        new URL('/pricing?error=payment_failed', request.url)
      )
    }

  } catch (error) {
    console.error('Error handling payment success:', error)
    return NextResponse.redirect(
      new URL('/pricing?error=processing_failed', request.url)
    )
  }
}

// app/api/payments/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StripePaymentService } from '@/lib/stripe/stripe-service'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { immediately = false } = await request.json()

    // Get user from session
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const paymentService = new StripePaymentService()
    await paymentService.cancelSubscription(user.id, immediately)

    return NextResponse.json({
      success: true,
      message: immediately 
        ? 'Subscription canceled immediately' 
        : 'Subscription will be canceled at the end of current period'
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

// app/api/payments/portal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StripePaymentService } from '@/lib/stripe/stripe-service'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const paymentService = new StripePaymentService()
    const portalUrl = await paymentService.createPortalSession(user.id)

    return NextResponse.json({
      success: true,
      url: portalUrl
    })

  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}

// app/api/payments/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StripePaymentService } from '@/lib/stripe/stripe-service'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const paymentService = new StripePaymentService()
    const subscription = await paymentService.getSubscriptionStatus(user.id)

    // Get ecosystem access
    const { data: ecosystems } = await supabase
      .from('user_ecosystems')
      .select('ecosystem, access_level, expires_at')
      .eq('user_id', user.id)

    // Check Quantum Vault access
    const { data: quantumAccess } = await supabase
      .from('quantum_vault_access')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      subscription,
      ecosystems: ecosystems || [],
      quantumVault: quantumAccess || null,
      hasActiveSubscription: subscription?.status === 'active'
    })

  } catch (error) {
    console.error('Error getting payment status:', error)
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    )
  }
}

// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StripePaymentService } from '@/lib/stripe/stripe-service'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const paymentService = new StripePaymentService()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription') {
          await paymentService.handleSuccessfulPayment(session)
        }
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          console.log('Invoice payment succeeded:', invoice.id)
          // Handle recurring payment success
          // Update subscription status if needed
        }
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        if (failedInvoice.subscription) {
          await paymentService.handleFailedPayment(failedInvoice.subscription as string)
        }
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        // Handle subscription updates (plan changes, cancellations, etc.)
        console.log('Subscription updated:', updatedSubscription.id)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        // Handle subscription deletion
        console.log('Subscription deleted:', deletedSubscription.id)
        break

      case 'customer.subscription.trial_will_end':
        const trialEndingSubscription = event.data.object as Stripe.Subscription
        // Send trial ending notification
        console.log('Trial will end for subscription:', trialEndingSubscription.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}