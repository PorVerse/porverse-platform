// lib/stripe/stripe-service.ts
import Stripe from 'stripe'
import { createServerSupabase } from '@/lib/supabase'

export interface PricingTier {
  tier: number
  name: string
  symbol: string
  individual: {
    'por-health': number
    'por-kids': number
    'por-mind': number
    'por-well': number
    'por-flow': number
    'por-blu': number
  }
  bundles: {
    dual: number
    trinity: number
    complete: number
  }
}

export interface SubscriptionData {
  userId: string
  planType: 'individual' | 'dual' | 'trinity' | 'complete'
  ecosystems: string[]
  tier: number
  billingCycle: 'monthly' | 'annual'
  price: number
  currency: string
  country: string
}

export class StripePaymentService {
  private stripe: Stripe
  private supabase = createServerSupabase()

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    })
  }

  // Create Stripe Customer
  async createCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name: name || undefined,
        metadata: {
          user_id: userId,
          platform: 'porverse'
        }
      })

      // Save customer ID to database
      await this.supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId)

      return customer.id
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw new Error('Failed to create customer')
    }
  }

  // Get or Create Customer
  async getOrCreateCustomer(userId: string): Promise<string> {
    // Check if customer already exists
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('stripe_customer_id, email, first_name, last_name')
      .eq('id', userId)
      .single()

    if (profile?.stripe_customer_id) {
      return profile.stripe_customer_id
    }

    // Create new customer
    const fullName = [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(' ')

    return await this.createCustomer(userId, profile!.email, fullName)
  }

  // Create Checkout Session
  async createCheckoutSession(subscriptionData: SubscriptionData): Promise<Stripe.Checkout.Session> {
    try {
      const customerId = await this.getOrCreateCustomer(subscriptionData.userId)
      
      // Calculate prices
      const lineItems = this.buildLineItems(subscriptionData)
      
      // Setup subscription metadata
      const metadata = {
        user_id: subscriptionData.userId,
        plan_type: subscriptionData.planType,
        ecosystems: subscriptionData.ecosystems.join(','),
        tier: subscriptionData.tier.toString(),
        billing_cycle: subscriptionData.billingCycle,
        country: subscriptionData.country
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
        subscription_data: {
          trial_period_days: 14,
          metadata
        },
        metadata,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true
        },
        customer_update: {
          address: 'auto',
          name: 'auto'
        },
        locale: subscriptionData.country === 'RO' ? 'ro' : 'en'
      })

      // Log checkout session creation
      await this.logPaymentEvent(subscriptionData.userId, 'checkout_created', {
        session_id: session.id,
        amount: subscriptionData.price,
        currency: subscriptionData.currency,
        plan_type: subscriptionData.planType
      })

      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error('Failed to create checkout session')
    }
  }

  // Build line items for checkout
  private buildLineItems(subscriptionData: SubscriptionData): Stripe.Checkout.SessionCreateParams.LineItem[] {
    const { planType, ecosystems, price, currency, billingCycle } = subscriptionData
    
    // Calculate final price (annual discount already applied)
    const unitAmount = Math.round(price * 100) // Convert to cents
    
    let productName = ''
    let description = ''

    switch (planType) {
      case 'individual':
        productName = `PorVerse ${ecosystems[0].replace('por-', '').toUpperCase()}`
        description = `Access to ${ecosystems[0]} ecosystem`
        break
      case 'dual':
        productName = 'PorVerse Dual Pack'
        description = `Access to ${ecosystems.length} ecosystems: ${ecosystems.join(', ')}`
        break
      case 'trinity':
        productName = 'PorVerse Trinity Pack'
        description = `Access to ${ecosystems.length} ecosystems + Quantum Vault unlock`
        break
      case 'complete':
        productName = 'PorVerse Complete'
        description = 'Full access to all 6 ecosystems + Quantum Vault + Premium features'
        break
    }

    return [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: productName,
            description,
            images: [`${process.env.NEXT_PUBLIC_APP_URL}/images/logo-icon.png`],
            metadata: {
              plan_type: planType,
              ecosystems: ecosystems.join(',')
            }
          },
          unit_amount: unitAmount,
          recurring: {
            interval: billingCycle === 'annual' ? 'year' : 'month'
          }
        },
        quantity: 1
      }
    ]
  }

  // Handle successful payment
  async handleSuccessfulPayment(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const userId = session.metadata?.user_id
      const planType = session.metadata?.plan_type
      const ecosystems = session.metadata?.ecosystems?.split(',') || []

      if (!userId || !planType) {
        throw new Error('Missing required metadata in session')
      }

      // Get subscription details
      const subscription = await this.stripe.subscriptions.retrieve(
        session.subscription as string
      )

      // Update user subscription in database
      await this.supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          plan_type: planType,
          ecosystems,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          created_at: new Date(),
          updated_at: new Date()
        })

      // Update user profile
      await this.supabase
        .from('user_profiles')
        .update({
          subscription_tier: planType,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      // Grant ecosystem access
      await this.grantEcosystemAccess(userId, ecosystems, planType)

      // Check for Trinity unlock (Quantum Vault)
      if (planType === 'trinity' || planType === 'complete') {
        await this.unlockQuantumVault(userId)
      }

      // Send welcome email
      await this.sendWelcomeEmail(userId, planType, ecosystems)

      // Log successful payment
      await this.logPaymentEvent(userId, 'payment_succeeded', {
        subscription_id: subscription.id,
        amount: subscription.items.data[0].price.unit_amount,
        currency: subscription.currency,
        plan_type: planType
      })

    } catch (error) {
      console.error('Error handling successful payment:', error)
      throw error
    }
  }

  // Grant ecosystem access
  private async grantEcosystemAccess(
    userId: string, 
    ecosystems: string[], 
    planType: string
  ): Promise<void> {
    try {
      const accessLevel = planType === 'individual' ? 'premium' : 'premium'
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year

      for (const ecosystem of ecosystems) {
        await this.supabase
          .from('user_ecosystems')
          .upsert({
            user_id: userId,
            ecosystem: ecosystem as any,
            access_level: accessLevel,
            activated_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
          })
      }

      console.log(`Granted access to ecosystems: ${ecosystems.join(', ')} for user ${userId}`)
    } catch (error) {
      console.error('Error granting ecosystem access:', error)
      throw error
    }
  }

  // Unlock Quantum Vault for Trinity+ users
  private async unlockQuantumVault(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('quantum_vault_access')
        .upsert({
          user_id: userId,
          unlocked_at: new Date().toISOString(),
          access_level: 'full',
          features_unlocked: [
            'future_self',
            'identity_simulator', 
            'reverse_roadmap',
            'mirror_conversations',
            'pattern_detection'
          ]
        })

      console.log(`Quantum Vault unlocked for user ${userId}`)
    } catch (error) {
      console.error('Error unlocking Quantum Vault:', error)
      throw error
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string, immediately: boolean = false): Promise<void> {
    try {
      const { data: subscription } = await this.supabase
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single()

      if (!subscription?.stripe_subscription_id) {
        throw new Error('No active subscription found')
      }

      if (immediately) {
        // Cancel immediately
        await this.stripe.subscriptions.cancel(subscription.stripe_subscription_id)
        
        // Update database
        await this.supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        // Revoke access immediately
        await this.revokeEcosystemAccess(userId)
      } else {
        // Cancel at period end
        await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true
        })

        await this.supabase
          .from('user_subscriptions')
          .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      }

      await this.logPaymentEvent(userId, 'subscription_canceled', {
        subscription_id: subscription.stripe_subscription_id,
        immediately
      })

    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  // Revoke ecosystem access
  private async revokeEcosystemAccess(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_ecosystems')
        .update({
          access_level: 'free',
          expires_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      // Also revoke Quantum Vault
      await this.supabase
        .from('quantum_vault_access')
        .delete()
        .eq('user_id', userId)

      console.log(`Revoked premium access for user ${userId}`)
    } catch (error) {
      console.error('Error revoking ecosystem access:', error)
      throw error
    }
  }

  // Create customer portal session
  async createPortalSession(userId: string): Promise<string> {
    try {
      const customerId = await this.getOrCreateCustomer(userId)
      
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
      })

      return session.url
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw new Error('Failed to create portal session')
    }
  }

  // Send welcome email
  private async sendWelcomeEmail(
    userId: string, 
    planType: string, 
    ecosystems: string[]
  ): Promise<void> {
    // This would integrate with your email service (Resend, SendGrid, etc.)
    console.log(`Sending welcome email to user ${userId} for plan ${planType}`)
    
    // TODO: Implement email service integration
    // await emailService.sendWelcomeEmail(userId, planType, ecosystems)
  }

  // Log payment events
  private async logPaymentEvent(
    userId: string, 
    eventType: string, 
    metadata: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('payment_logs')
        .insert({
          user_id: userId,
          event_type: eventType,
          metadata,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging payment event:', error)
    }
  }

  // Get subscription status
  async getSubscriptionStatus(userId: string): Promise<any> {
    try {
      const { data: subscription } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      return subscription
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return null
    }
  }

  // Handle failed payment
  async handleFailedPayment(subscriptionId: string): Promise<void> {
    try {
      const { data: subscription } = await this.supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single()

      if (subscription) {
        await this.supabase
          .from('user_subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionId)

        await this.logPaymentEvent(subscription.user_id, 'payment_failed', {
          subscription_id: subscriptionId
        })

        // TODO: Send payment failed email
        console.log(`Payment failed for subscription ${subscriptionId}`)
      }
    } catch (error) {
      console.error('Error handling failed payment:', error)
    }
  }
}