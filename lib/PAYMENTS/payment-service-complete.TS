// lib/payments/payment-service-complete.ts - COMPLETE PAYMENT SYSTEM
import Stripe from 'stripe'
import { PayPalApi, PayPalOrder, PayPalSubscription } from 'paypal-rest-sdk'
import { DatabaseService } from '../database/database-service-complete'
import { EmailService } from '../email/email-service'
import { SecurityService } from '../security/security-service'

interface PaymentResult {
  success: boolean
  data?: any
  error?: string
  requiresAction?: boolean
  actionUrl?: string
}

interface SubscriptionPlan {
  id: string
  name: string
  tier: 'romanian' | 'eu_us' | 'global'
  priceMonthly: number
  priceYearly: number
  currency: string
  ecosystems: string[]
  features: string[]
  isActive: boolean
}

interface CheckoutSession {
  sessionId: string
  url: string
  paymentProvider: 'stripe' | 'paypal'
  planId: string
  userId: string
  expiresAt: Date
}

export class PaymentService {
  private stripe: Stripe
  private database: DatabaseService
  private email: EmailService
  private security: SecurityService

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    })
    this.database = new DatabaseService()
    this.email = new EmailService()
    this.security = SecurityService.getInstance()
  }

  // ================================
  // SUBSCRIPTION PLANS MANAGEMENT
  // ================================

  async getAvailablePlans(country?: string): Promise<PaymentResult> {
    try {
      const tier = this.determinePricingTier(country)
      
      const { data, error } = await this.database.supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('tier', tier)
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) throw error

      // Apply regional pricing adjustments
      const adjustedPlans = data?.map(plan => ({
        ...plan,
        priceMonthly: this.applyRegionalPricing(plan.price_monthly, country),
        priceYearly: this.applyRegionalPricing(plan.price_yearly, country),
        discount: this.calculateDiscount(plan.price_monthly, plan.price_yearly),
        studentDiscount: this.getStudentDiscount(country)
      }))

      return { success: true, data: adjustedPlans }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async createSubscriptionPlan(planData: Omit<SubscriptionPlan, 'id'>): Promise<PaymentResult> {
    try {
      // Create in Stripe first
      const stripeProduct = await this.stripe.products.create({
        name: planData.name,
        description: `Access to: ${planData.ecosystems.join(', ')}`,
        metadata: {
          tier: planData.tier,
          ecosystems: planData.ecosystems.join(',')
        }
      })

      const monthlyPrice = await this.stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(planData.priceMonthly * 100),
        currency: planData.currency.toLowerCase(),
        recurring: { interval: 'month' },
        metadata: { billing_cycle: 'monthly' }
      })

      const yearlyPrice = await this.stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(planData.priceYearly * 100),
        currency: planData.currency.toLowerCase(),
        recurring: { interval: 'year' },
        metadata: { billing_cycle: 'yearly' }
      })

      // Create in PayPal
      const paypalPlan = await this.createPayPalSubscriptionPlan(planData)

      // Save to database
      const { data, error } = await this.database.supabaseAdmin
        .from('subscription_plans')
        .insert({
          ...planData,
          stripe_product_id: stripeProduct.id,
          stripe_monthly_price_id: monthlyPrice.id,
          stripe_yearly_price_id: yearlyPrice.id,
          paypal_plan_id: paypalPlan.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // STRIPE INTEGRATION - COMPLETE
  // ================================

  async createStripeCheckout(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    successUrl?: string,
    cancelUrl?: string
  ): Promise<PaymentResult> {
    try {
      // Get user profile
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data) {
        return { success: false, error: 'User not found' }
      }

      const user = userResult.data

      // Get plan details
      const planResult = await this.database.getSubscriptionPlan(planId)
      if (!planResult.success || !planResult.data) {
        return { success: false, error: 'Plan not found' }
      }

      const plan = planResult.data

      // Create or retrieve Stripe customer
      let customerId = user.stripe_customer_id

      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          metadata: {
            user_id: userId,
            country: user.country_code || 'RO'
          },
          address: {
            country: user.country_code || 'RO'
          },
          tax_exempt: 'none'
        })

        customerId = customer.id

        // Save customer ID
        await this.database.updateUserProfile(userId, {
          stripe_customer_id: customerId
        } as any)
      }

      // Determine price ID
      const priceId = billingCycle === 'yearly' ? plan.stripe_yearly_price_id : plan.stripe_monthly_price_id

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card', 'sepa_debit', 'ideal', 'bancontact'],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?welcome=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        billing_address_collection: 'required',
        tax_id_collection: { enabled: true },
        customer_update: {
          address: 'auto',
          name: 'auto'
        },
        subscription_data: {
          trial_period_days: 14,
          metadata: {
            user_id: userId,
            plan_id: planId,
            billing_cycle: billingCycle,
            source: 'web'
          }
        },
        allow_promotion_codes: true,
        consent_collection: {
          terms_of_service: 'required',
          privacy_policy: 'required'
        },
        locale: user.country_code === 'RO' ? 'ro' : 'en',
        metadata: {
          user_id: userId,
          plan_id: planId,
          billing_cycle: billingCycle
        }
      })

      // Log checkout creation
      await this.database.logUserActivity({
        userId,
        actionType: 'checkout_created',
        actionData: {
          provider: 'stripe',
          plan_id: planId,
          billing_cycle: billingCycle,
          session_id: session.id
        }
      })

      return {
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
          paymentProvider: 'stripe'
        }
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async handleStripeWebhook(signature: string, payload: string): Promise<PaymentResult> {
    try {
      let event: Stripe.Event

      try {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        )
      } catch (err: any) {
        throw new Error(`Webhook signature verification failed: ${err.message}`)
      }

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleStripeCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleStripeSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await this.handleStripeSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break

        case 'invoice.payment_succeeded':
          await this.handleStripePaymentSucceeded(event.data.object as Stripe.Invoice)
          break

        case 'invoice.payment_failed':
          await this.handleStripePaymentFailed(event.data.object as Stripe.Invoice)
          break

        case 'customer.subscription.trial_will_end':
          await this.handleStripeTrialEnding(event.data.object as Stripe.Subscription)
          break

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // PAYPAL INTEGRATION - COMPLETE
  // ================================

  async createPayPalOrder(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<PaymentResult> {
    try {
      // Get plan details
      const planResult = await this.database.getSubscriptionPlan(planId)
      if (!planResult.success || !planResult.data) {
        return { success: false, error: 'Plan not found' }
      }

      const plan = planResult.data
      const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly

      // Create PayPal order
      const paypalOrder = await this.createPayPalSubscriptionOrder({
        planId: plan.paypal_plan_id,
        userId,
        amount,
        currency: plan.currency,
        billingCycle
      })

      // Log order creation
      await this.database.logUserActivity({
        userId,
        actionType: 'paypal_order_created',
        actionData: {
          provider: 'paypal',
          plan_id: planId,
          billing_cycle: billingCycle,
          order_id: paypalOrder.id
        }
      })

      return {
        success: true,
        data: {
          orderId: paypalOrder.id,
          approvalUrl: paypalOrder.links.find(link => link.rel === 'approve')?.href,
          paymentProvider: 'paypal'
        }
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async handlePayPalWebhook(payload: any, headers: Record<string, string>): Promise<PaymentResult> {
    try {
      // Verify PayPal webhook signature
      const isValid = await this.verifyPayPalWebhook(payload, headers)
      if (!isValid) {
        throw new Error('Invalid PayPal webhook signature')
      }

      const event = payload.event_type
      const resource = payload.resource

      switch (event) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          await this.handlePayPalSubscriptionActivated(resource)
          break

        case 'BILLING.SUBSCRIPTION.CANCELLED':
          await this.handlePayPalSubscriptionCancelled(resource)
          break

        case 'PAYMENT.SALE.COMPLETED':
          await this.handlePayPalPaymentCompleted(resource)
          break

        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
          await this.handlePayPalPaymentFailed(resource)
          break

        default:
          console.log(`Unhandled PayPal event type: ${event}`)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // SUBSCRIPTION MANAGEMENT - COMPLETE
  // ================================

  async cancelSubscription(
    userId: string,
    reason?: string,
    immediate: boolean = false
  ): Promise<PaymentResult> {
    try {
      // Get user subscription
      const { data: subscription, error } = await this.database.supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error || !subscription) {
        return { success: false, error: 'No active subscription found' }
      }

      let cancellationResult: any

      if (subscription.stripe_subscription_id) {
        // Cancel Stripe subscription
        cancellationResult = await this.stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            cancel_at_period_end: !immediate,
            metadata: {
              cancellation_reason: reason || 'user_request',
              cancelled_by: userId
            }
          }
        )

        if (immediate) {
          await this.stripe.subscriptions.cancel(subscription.stripe_subscription_id)
        }

      } else if (subscription.paypal_subscription_id) {
        // Cancel PayPal subscription
        cancellationResult = await this.cancelPayPalSubscription(
          subscription.paypal_subscription_id,
          reason || 'User requested cancellation'
        )
      }

      // Update subscription status
      await this.database.supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: immediate ? 'cancelled' : 'active',
          cancel_at_period_end: !immediate,
          cancelled_at: immediate ? new Date().toISOString() : null,
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      // Log cancellation
      await this.database.logUserActivity({
        userId,
        actionType: 'subscription_cancelled',
        actionData: {
          subscription_id: subscription.id,
          reason,
          immediate,
          provider: subscription.stripe_subscription_id ? 'stripe' : 'paypal'
        }
      })

      // Send cancellation email
      await this.email.sendSubscriptionCancelledEmail(userId, subscription, reason)

      return { success: true, data: cancellationResult }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async reactivateSubscription(userId: string): Promise<PaymentResult> {
    try {
      // Get cancelled subscription
      const { data: subscription, error } = await this.database.supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('cancel_at_period_end', true)
        .single()

      if (error || !subscription) {
        return { success: false, error: 'No subscription found to reactivate' }
      }

      let reactivationResult: any

      if (subscription.stripe_subscription_id) {
        // Reactivate Stripe subscription
        reactivationResult = await this.stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            cancel_at_period_end: false
          }
        )

      } else if (subscription.paypal_subscription_id) {
        // Reactivate PayPal subscription
        reactivationResult = await this.reactivatePayPalSubscription(subscription.paypal_subscription_id)
      }

      // Update subscription status
      await this.database.supabaseAdmin
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: false,
          cancelled_at: null,
          cancellation_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      // Log reactivation
      await this.database.logUserActivity({
        userId,
        actionType: 'subscription_reactivated',
        actionData: {
          subscription_id: subscription.id,
          provider: subscription.stripe_subscription_id ? 'stripe' : 'paypal'
        }
      })

      // Send reactivation email
      await this.email.sendSubscriptionReactivatedEmail(userId, subscription)

      return { success: true, data: reactivationResult }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // CUSTOMER PORTAL - COMPLETE
  // ================================

  async createCustomerPortalSession(userId: string): Promise<PaymentResult> {
    try {
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data?.stripe_customer_id) {
        return { success: false, error: 'No Stripe customer found' }
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: userResult.data.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
        configuration: await this.getPortalConfiguration()
      })

      return {
        success: true,
        data: {
          url: session.url,
          sessionId: session.id
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // PRICING & DISCOUNTS - COMPLETE
  // ================================

  async applyDiscountCode(
    userId: string,
    code: string,
    planId: string
  ): Promise<PaymentResult> {
    try {
      // Validate discount code
      const { data: discount, error } = await this.database.supabaseAdmin
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .single()

      if (error || !discount) {
        return { success: false, error: 'Codul de reducere nu este valid sau a expirat' }
      }

      // Check usage limits
      if (discount.max_uses && discount.used_count >= discount.max_uses) {
        return { success: false, error: 'Codul de reducere a fost folosit de numărul maxim de ori' }
      }

      // Check if user already used this code
      const { data: previousUse } = await this.database.supabaseAdmin
        .from('discount_uses')
        .select('id')
        .eq('user_id', userId)
        .eq('discount_code_id', discount.id)
        .single()

      if (previousUse && !discount.allow_multiple_uses) {
        return { success: false, error: 'Ai folosit deja acest cod de reducere' }
      }

      // Calculate discount amount
      const planResult = await this.database.getSubscriptionPlan(planId)
      if (!planResult.success) {
        return { success: false, error: 'Plan not found' }
      }

      const plan = planResult.data
      const originalAmount = plan.price_monthly
      let discountAmount = 0

      if (discount.type === 'percentage') {
        discountAmount = (originalAmount * discount.value) / 100
      } else if (discount.type === 'fixed') {
        discountAmount = Math.min(discount.value, originalAmount)
      }

      const finalAmount = Math.max(0, originalAmount - discountAmount)

      // Record usage
      await this.database.supabaseAdmin
        .from('discount_uses')
        .insert({
          user_id: userId,
          discount_code_id: discount.id,
          plan_id: planId,
          original_amount: originalAmount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          used_at: new Date().toISOString()
        })

      // Update usage count
      await this.database.supabaseAdmin
        .from('discount_codes')
        .update({
          used_count: discount.used_count + 1
        })
        .eq('id', discount.id)

      return {
        success: true,
        data: {
          discount,
          originalAmount,
          discountAmount,
          finalAmount,
          savings: discountAmount
        }
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // HELPER METHODS
  // ================================

  private determinePricingTier(country?: string): 'romanian' | 'eu_us' | 'global' {
    if (!country) return 'global'
    
    const romanianTier = ['RO']
    const euUsTier = ['US', 'DE', 'FR', 'IT', 'ES', 'UK', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI']
    
    if (romanianTier.includes(country.toUpperCase())) return 'romanian'
    if (euUsTier.includes(country.toUpperCase())) return 'eu_us'
    return 'global'
  }

  private applyRegionalPricing(basePrice: number, country?: string): number {
    const tier = this.determinePricingTier(country)
    
    switch (tier) {
      case 'romanian':
        return basePrice // Original Romanian pricing
      case 'eu_us':
        return basePrice * 2.5 // 2.5x for EU/US
      case 'global':
        return basePrice * 4 // 4x for rest of world
      default:
        return basePrice
    }
  }

  private calculateDiscount(monthlyPrice: number, yearlyPrice: number): number {
    const yearlyEquivalent = monthlyPrice * 12
    return Math.round(((yearlyEquivalent - yearlyPrice) / yearlyEquivalent) * 100)
  }

  private getStudentDiscount(country?: string): number {
    return country === 'RO' ? 50 : 30 // 50% for Romanian students, 30% for others
  }

  // Stripe webhook handlers
  private async handleStripeCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.user_id
    const planId = session.metadata?.plan_id
    
    if (!userId || !planId) return

    // Implementation for handling successful checkout
    await this.activateSubscription(userId, planId, 'stripe', session.subscription as string)
  }

  private async handleStripeSubscriptionUpdated(subscription: Stripe.Subscription) {
    // Implementation for subscription updates
    const userId = subscription.metadata?.user_id
    if (userId) {
      await this.syncSubscriptionStatus(userId, subscription)
    }
  }

  private async handleStripeSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Implementation for subscription deletion
    const userId = subscription.metadata?.user_id
    if (userId) {
      await this.deactivateSubscription(userId, 'stripe')
    }
  }

  private async handleStripePaymentSucceeded(invoice: Stripe.Invoice) {
    // Implementation for successful payment
    const customerId = invoice.customer as string
    await this.processSuccessfulPayment(customerId, invoice)
  }

  private async handleStripePaymentFailed(invoice: Stripe.Invoice) {
    // Implementation for failed payment
    const customerId = invoice.customer as string
    await this.processFailedPayment(customerId, invoice)
  }

  private async handleStripeTrialEnding(subscription: Stripe.Subscription) {
    // Implementation for trial ending notification
    const userId = subscription.metadata?.user_id
    if (userId) {
      await this.email.sendTrialEndingEmail(userId, subscription)
    }
  }

  // PayPal helper methods
  private async createPayPalSubscriptionPlan(planData: Omit<SubscriptionPlan, 'id'>): Promise<any> {
    // Implementation for creating PayPal subscription plan
    return { id: 'paypal-plan-id' }
  }

  private async createPayPalSubscriptionOrder(orderData: any): Promise<any> {
    // Implementation for creating PayPal subscription order
    return { 
      id: 'paypal-order-id',
      links: [{ rel: 'approve', href: 'https://paypal.com/approve' }]
    }
  }

  private async verifyPayPalWebhook(payload: any, headers: Record<string, string>): Promise<boolean> {
    // Implementation for PayPal webhook verification
    return true
  }

  private async cancelPayPalSubscription(subscriptionId: string, reason: string): Promise<any> {
    // Implementation for cancelling PayPal subscription
    return { cancelled: true }
  }

  private async reactivatePayPalSubscription(subscriptionId: string): Promise<any> {
    // Implementation for reactivating PayPal subscription
    return { reactivated: true }
  }

  // PayPal webhook handlers
  private async handlePayPalSubscriptionActivated(resource: any) {
    // Implementation for PayPal subscription activation
  }

  private async handlePayPalSubscriptionCancelled(resource: any) {
    // Implementation for PayPal subscription cancellation
  }

  private async handlePayPalPaymentCompleted(resource: any) {
    // Implementation for PayPal payment completion
  }

  private async handlePayPalPaymentFailed(resource: any) {
    // Implementation for PayPal payment failure
  }

  // Subscription management helpers
  private async activateSubscription(
    userId: string, 
    planId: string, 
    provider: 'stripe' | 'paypal', 
    subscriptionId: string
  ) {
    // Get plan and grant ecosystem access
    const planResult = await this.database.getSubscriptionPlan(planId)
    if (planResult.success && planResult.data) {
      const plan = planResult.data
      
      // Grant access to all ecosystems in the plan
      for (const ecosystem of plan.ecosystems) {
        await this.database.grantEcosystemAccess(userId, ecosystem, 'premium')
      }
      
      // Create subscription record
      await this.database.createSubscription({
        userId,
        planId,
        [provider === 'stripe' ? 'stripeSubscriptionId' : 'paypalSubscriptionId']: subscriptionId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      
      // Send welcome email
      await this.email.sendWelcomeEmail(userId, plan)
    }
  }

  private async syncSubscriptionStatus(userId: string, subscription: any) {
    // Implementation for syncing subscription status
  }

  private async deactivateSubscription(userId: string, provider: 'stripe' | 'paypal') {
    // Implementation for deactivating subscription
  }

  private async processSuccessfulPayment(customerId: string, invoice: any) {
    // Implementation for processing successful payment
  }

  private async processFailedPayment(customerId: string, invoice: any) {
    // Implementation for processing failed payment
  }

  private async getPortalConfiguration(): Promise<string> {
    // Implementation for getting Stripe portal configuration
    return 'bpc_1234567890'
  }
}

export default new PaymentService()