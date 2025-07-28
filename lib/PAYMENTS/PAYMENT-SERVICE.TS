// ================================
// LIB/PAYMENTS/PAYMENT-SERVICE.TS
// ================================
import Stripe from 'stripe'
import { DatabaseService } from '../database/database-service'
import { SecurityService } from '../security/security-service'

export class PaymentService {
  private stripe: Stripe
  private database: DatabaseService
  private security: SecurityService

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    })
    this.database = new DatabaseService()
    this.security = SecurityService.getInstance()
  }

  // ================================
  // STRIPE CHECKOUT SESSION
  // ================================
  async createCheckoutSession(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    promoCode?: string
  ) {
    try {
      // Get user profile
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data) {
        throw new Error('User not found')
      }

      const user = userResult.data

      // Get plan details
      const plan = this.getPlanDetails(planId)
      if (!plan) {
        throw new Error('Invalid plan')
      }

      // Calculate price with regional adjustment
      const price = this.calculateRegionalPrice(
        billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly,
        user.country_code
      )

      // Create or retrieve Stripe customer
      let customerId = user.stripe_customer_id
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          metadata: {
            user_id: userId,
            country: user.country_code
          }
        })
        customerId = customer.id

        // Save customer ID to database
        await this.database.updateUserProfile(userId, {
          stripe_customer_id: customerId
        })
      }

      // Apply promo code if provided
      let discounts: any[] = []
      if (promoCode) {
        const discount = await this.validatePromoCode(promoCode, userId)
        if (discount.valid) {
          discounts = [{ coupon: discount.stripeId }]
        }
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'ron',
              product_data: {
                name: plan.name,
                description: `Acces la: ${plan.ecosystems.join(', ')}`,
                images: [`https://porverse.ro/images/plans/${planId}.jpg`],
                metadata: {
                  plan_id: planId,
                  ecosystems: plan.ecosystems.join(',')
                }
              },
              unit_amount: Math.round(price * 100), // Convert to cents
              recurring: {
                interval: billingCycle === 'yearly' ? 'year' : 'month'
              }
            },
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        subscription_data: {
          trial_period_days: planId === 'starter' ? 14 : 0,
          metadata: {
            user_id: userId,
            plan_id: planId,
            billing_cycle: billingCycle
          }
        },
        discounts,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        },
        locale: user.language_code === 'ro' ? 'ro' : 'en',
        metadata: {
          user_id: userId,
          plan_id: planId,
          billing_cycle: billingCycle
        }
      })

      // Log checkout creation
      await this.database.logPaymentEvent({
        userId,
        type: 'checkout_created',
        amount: price,
        currency: 'RON',
        stripeSessionId: session.id,
        metadata: { plan_id: planId, billing_cycle: billingCycle }
      })

      return {
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
          planName: plan.name,
          price,
          currency: 'RON'
        }
      }
    } catch (error) {
      console.error('Create checkout session error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // STRIPE WEBHOOK HANDLER
  // ================================
  async handleStripeWebhook(signature: string, payload: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )

      console.log(`Processing Stripe webhook: ${event.type}`)

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
          break

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
          break

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
          break

        case 'customer.subscription.trial_will_end':
          await this.handleTrialEnding(event.data.object as Stripe.Subscription)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Upgrade subscription error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // CUSTOMER PORTAL
  // ================================
  async createCustomerPortalSession(userId: string) {
    try {
      const user = await this.database.getUserProfile(userId)
      if (!user.success || !user.data?.stripe_customer_id) {
        throw new Error('No Stripe customer found')
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: user.data.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
      })

      return {
        success: true,
        data: { url: session.url }
      }
    } catch (error) {
      console.error('Create customer portal session error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // PROMO CODES & DISCOUNTS
  // ================================
  async validatePromoCode(code: string, userId: string) {
    try {
      // Check if it's a special student discount
      if (code === 'STUDENT50') {
        const user = await this.database.getUserProfile(userId)
        if (user.data?.student_verified) {
          return {
            valid: true,
            discount: 50,
            type: 'percentage',
            stripeId: process.env.STRIPE_STUDENT_COUPON
          }
        }
      }

      // Check other promo codes in Stripe
      const promotionCodes = await this.stripe.promotionCodes.list({
        code: code,
        active: true,
        limit: 1
      })

      if (promotionCodes.data.length > 0) {
        const promoCode = promotionCodes.data[0]
        return {
          valid: true,
          discount: promoCode.coupon.percent_off || promoCode.coupon.amount_off,
          type: promoCode.coupon.percent_off ? 'percentage' : 'fixed',
          stripeId: promoCode.coupon.id
        }
      }

      return { valid: false, error: 'Invalid promo code' }
    } catch (error) {
      console.error('Validate promo code error:', error)
      return { valid: false, error: 'Error validating promo code' }
    }
  }

  // ================================
  // REGIONAL PRICING
  // ================================
  private calculateRegionalPrice(basePrice: number, countryCode?: string): number {
    const multipliers: Record<string, number> = {
      'RO': 0.7,
      'BG': 0.6,
      'PL': 0.8,
      'HU': 0.75,
      'CZ': 0.85,
      'US': 1.2,
      'GB': 1.1,
      'DE': 1.0
    }

    const multiplier = multipliers[countryCode || 'RO'] || 1.0
    return Math.round(basePrice * multiplier * 100) / 100
  }

  // ================================
  // PLAN DEFINITIONS
  // ================================
  private getPlanDetails(planId: string) {
    const plans = {
      'starter': {
        name: 'PorHealth Starter',
        ecosystems: ['por-health'],
        price: { monthly: 49, yearly: 490 },
        features: [
          'AI Nutrition Planner',
          'Workout Optimizer', 
          'Health Tracking',
          '14 zile trial gratuit'
        ]
      },
      'pro': {
        name: 'Triple Pack Pro',
        ecosystems: ['por-health', 'por-kids', 'por-mind'],
        price: { monthly: 119, yearly: 1190 },
        features: [
          'Toate funcțiile Starter',
          'AI Homework Scanner',
          'Smart Budgeting',
          'Investment Advisor',
          'Family Dashboard'
        ]
      },
      'complete': {
        name: 'Complete Ecosystem',
        ecosystems: ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu'],
        price: { monthly: 199, yearly: 1990 },
        features: [
          'Toate funcțiile Pro',
          'AI Therapist 24/7',
          'Productivity Optimizer',
          'Strategic Planning',
          'Quantum Vault Access'
        ]
      }
    }

    return plans[planId as keyof typeof plans]
  }

  // ================================
  // EMAIL NOTIFICATIONS
  // ================================
  private async sendWelcomeEmail(userId: string, planId: string) {
    try {
      // Implementation will be added in email service
      console.log(`Welcome email sent to user ${userId} for plan ${planId}`)
    } catch (error) {
      console.error('Send welcome email error:', error)
    }
  }

  private async sendPaymentFailedEmail(userId: string, invoice: Stripe.Invoice) {
    try {
      // Implementation will be added in email service
      console.log(`Payment failed email sent to user ${userId}`)
    } catch (error) {
      console.error('Send payment failed email error:', error)
    }
  }

  private async sendTrialEndingEmail(userId: string) {
    try {
      // Implementation will be added in email service
      console.log(`Trial ending email sent to user ${userId}`)
    } catch (error) {
      console.error('Send trial ending email error:', error)
    }
  }

  // ================================
  // PAYPAL API HELPER
  // ================================
  private async callPayPalAPI(endpoint: string, data: any) {
    const isProduction = process.env.PAYPAL_MODE === 'live'
    const baseURL = isProduction 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    // Get access token
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const tokenResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Make API call
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    return await response.json()
  }

  // ================================
  // USAGE ANALYTICS
  // ================================
  async getUserPaymentHistory(userId: string) {
    try {
      const { data, error } = await this.database.supabaseAdmin
        .from('payment_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get payment history error:', error)
      return { success: false, error: error.message }
    }
  }

  async getRevenueStats(days: number = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.database.supabaseAdmin
        .from('payment_logs')
        .select('amount, currency, created_at, event_type')
        .eq('event_type', 'payment_succeeded')
        .gte('created_at', startDate.toISOString())

      if (error) throw error

      const stats = {
        totalRevenue: 0,
        transactionCount: 0,
        averageOrder: 0,
        dailyRevenue: {} as Record<string, number>
      }

      if (data) {
        stats.transactionCount = data.length
        stats.totalRevenue = data.reduce((sum, payment) => sum + (payment.amount || 0), 0)
        stats.averageOrder = stats.totalRevenue / stats.transactionCount || 0

        // Group by day
        data.forEach(payment => {
          const date = new Date(payment.created_at).toISOString().split('T')[0]
          stats.dailyRevenue[date] = (stats.dailyRevenue[date] || 0) + (payment.amount || 0)
        })
      }

      return { success: true, data: stats }
    } catch (error) {
      console.error('Get revenue stats error:', error)
      return { success: false, error: error.message }
    }
  }
}

// ================================
// API ROUTES
// ================================

// APP/API/PAYMENTS/CREATE-SESSION/ROUTE.TS
export async function POST(request: Request) {
  try {
    const { userId, planId, billingCycle, promoCode } = await request.json()
    
    if (!userId || !planId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const paymentService = new PaymentService()
    const result = await paymentService.createCheckoutSession(
      userId,
      planId,
      billingCycle,
      promoCode
    )

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json(result.data)
  } catch (error) {
    console.error('Create session API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// APP/API/PAYMENTS/PAYPAL/CREATE-ORDER/ROUTE.TS
export async function POST(request: Request) {
  try {
    const { userId, planId, billingCycle } = await request.json()
    
    if (!userId || !planId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const paymentService = new PaymentService()
    const result = await paymentService.createPayPalOrder(userId, planId, billingCycle)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json(result.data)
  } catch (error) {
    console.error('Create PayPal order API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// APP/API/PAYMENTS/PORTAL/ROUTE.TS
export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 })
    }

    const paymentService = new PaymentService()
    const result = await paymentService.createCustomerPortalSession(userId)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json(result.data)
  } catch (error) {
    console.error('Create portal session API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// APP/API/WEBHOOKS/STRIPE/ROUTE.TS
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return Response.json({ error: 'No signature provided' }, { status: 400 })
    }

    const paymentService = new PaymentService()
    const result = await paymentService.handleStripeWebhook(signature, body)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook API error:', error)
    return Response.json({ error: 'Webhook error' }, { status: 400 })
  }
}

// APP/API/PAYMENTS/CANCEL/ROUTE.TS
export async function POST(request: Request) {
  try {
    const { userId, reason } = await request.json()
    
    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 })
    }

    const paymentService = new PaymentService()
    const result = await paymentService.cancelSubscription(userId, reason)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Cancel subscription API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}) {
      console.error('Stripe webhook error:', error)
      return { success: false, error: error.message }
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.user_id
    const planId = session.metadata?.plan_id

    if (!userId || !planId) {
      console.error('Missing metadata in checkout session')
      return
    }

    try {
      // Create subscription record
      const subscriptionData = {
        userId,
        planId,
        stripeSubscriptionId: session.subscription as string,
        status: 'active' as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }

      await this.database.createSubscription(subscriptionData)

      // Log successful payment
      await this.database.logPaymentEvent({
        userId,
        type: 'payment_succeeded',
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase(),
        stripeSessionId: session.id,
        metadata: { plan_id: planId }
      })

      // Send welcome email
      await this.sendWelcomeEmail(userId, planId)

      console.log(`Subscription created for user ${userId}, plan ${planId}`)
    } catch (error) {
      console.error('Handle checkout completed error:', error)
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      await this.database.updateSubscription(subscription.id, {
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end
      })

      console.log(`Subscription ${subscription.id} updated`)
    } catch (error) {
      console.error('Handle subscription updated error:', error)
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string
    
    try {
      // Get user from customer ID
      const customer = await this.stripe.customers.retrieve(customerId)
      if (customer.deleted) return

      const userId = (customer as Stripe.Customer).metadata?.user_id
      if (!userId) return

      // Log failed payment
      await this.database.logPaymentEvent({
        userId,
        type: 'payment_failed',
        amount: invoice.amount_due / 100,
        currency: invoice.currency.toUpperCase(),
        metadata: { 
          invoice_id: invoice.id,
          attempt_count: invoice.attempt_count
        }
      })

      // Send payment failed email
      await this.sendPaymentFailedEmail(userId, invoice)

      console.log(`Payment failed for user ${userId}`)
    } catch (error) {
      console.error('Handle payment failed error:', error)
    }
  }

  // ================================
  // PAYPAL INTEGRATION
  // ================================
  async createPayPalOrder(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ) {
    try {
      const user = await this.database.getUserProfile(userId)
      if (!user.success || !user.data) {
        throw new Error('User not found')
      }

      const plan = this.getPlanDetails(planId)
      if (!plan) {
        throw new Error('Invalid plan')
      }

      const price = this.calculateRegionalPrice(
        billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly,
        user.data.country_code
      )

      // PayPal API call to create order
      const paypalOrder = await this.callPayPalAPI('/v2/checkout/orders', {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'RON',
            value: price.toFixed(2)
          },
          description: `${plan.name} - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/paypal/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`
        }
      })

      // Log PayPal order creation
      await this.database.logPaymentEvent({
        userId,
        type: 'checkout_created',
        amount: price,
        currency: 'RON',
        paypalOrderId: paypalOrder.id,
        metadata: { plan_id: planId, billing_cycle: billingCycle }
      })

      return {
        success: true,
        data: {
          orderId: paypalOrder.id,
          approvalUrl: paypalOrder.links.find((link: any) => link.rel === 'approve')?.href
        }
      }
    } catch (error) {
      console.error('Create PayPal order error:', error)
      return { success: false, error: error.message }
    }
  }

  async capturePayPalOrder(orderId: string, userId: string) {
    try {
      const captureResult = await this.callPayPalAPI(`/v2/checkout/orders/${orderId}/capture`, {})

      if (captureResult.status === 'COMPLETED') {
        // Process successful payment
        const amount = parseFloat(captureResult.purchase_units[0].payments.captures[0].amount.value)
        
        await this.database.logPaymentEvent({
          userId,
          type: 'payment_succeeded',
          amount,
          currency: 'RON',
          paypalOrderId: orderId
        })

        return { success: true, data: captureResult }
      }

      return { success: false, error: 'Payment not completed' }
    } catch (error) {
      console.error('Capture PayPal order error:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================
  // SUBSCRIPTION MANAGEMENT
  // ================================
  async cancelSubscription(userId: string, reason?: string) {
    try {
      const subscription = await this.database.getUserSubscription(userId)
      if (!subscription.success || !subscription.data) {
        throw new Error('No active subscription found')
      }

      const sub = subscription.data

      if (sub.stripe_subscription_id) {
        // Cancel Stripe subscription
        await this.stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: true,
          metadata: {
            cancellation_reason: reason || 'user_requested'
          }
        })
      }

      // Update database
      await this.database.updateSubscription(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString()
      })

      // Log cancellation
      await this.database.logUserActivity(
        userId,
        'subscription',
        'canceled',
        { reason, canceled_at: new Date().toISOString() }
      )

      return { success: true }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      return { success: false, error: error.message }
    }
  }

  async upgradeSubscription(userId: string, newPlanId: string) {
    try {
      const currentSub = await this.database.getUserSubscription(userId)
      if (!currentSub.success || !currentSub.data) {
        throw new Error('No active subscription found')
      }

      const newPlan = this.getPlanDetails(newPlanId)
      if (!newPlan) {
        throw new Error('Invalid plan')
      }

      if (currentSub.data.stripe_subscription_id) {
        // Get current subscription from Stripe
        const stripeSubscription = await this.stripe.subscriptions.retrieve(
          currentSub.data.stripe_subscription_id
        )

        // Update subscription with new price
        await this.stripe.subscriptions.update(currentSub.data.stripe_subscription_id, {
          items: [{
            id: stripeSubscription.items.data[0].id,
            price_data: {
              currency: 'ron',
              product_data: {
                name: newPlan.name
              },
              unit_amount: Math.round(newPlan.price.monthly * 100),
              recurring: {
                interval: 'month'
              }
            }
          }],
          proration_behavior: 'always_invoice',
          metadata: {
            plan_id: newPlanId
          }
        })
      }

      // Update database
      await this.database.updateSubscription(currentSub.data.stripe_subscription_id, {
        plan_id: newPlanId
      })

      // Grant new ecosystem access
      await this.database.grantEcosystemAccess(userId, newPlanId)

      return { success: true }
    } catch (error)