// lib/services/paypal-service.ts
import { supabaseAdmin } from '@/lib/supabase'

export interface PayPalPlan {
  id: string
  name: string
  price: number
  currency: string
  ecosystems: string[]
  features: string[]
}

export interface PayPalSubscription {
  subscriptionId: string
  planId: string
  status: string
  userId: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

export class PayPalService {
  private baseURL: string
  private clientId: string
  private clientSecret: string

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com'
    this.clientId = process.env.PAYPAL_CLIENT_ID!
    this.clientSecret = process.env.PAYPAL_SECRET!
  }

  // ================================
  // AUTHENTICATION
  // ================================
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
    
    const response = await fetch(`${this.baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  }

  // ================================
  // SUBSCRIPTION PLANS
  // ================================
  async createSubscriptionPlan(plan: {
    name: string
    description: string
    price: number
    currency: string
    interval: 'month' | 'year'
  }): Promise<string> {
    const accessToken = await this.getAccessToken()

    const planData = {
      product_id: 'PORVERSE_DIGITAL_SERVICES',
      name: plan.name,
      description: plan.description,
      billing_cycles: [{
        frequency: {
          interval_unit: plan.interval.toUpperCase(),
          interval_count: 1
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // Infinite
        pricing_scheme: {
          fixed_price: {
            value: plan.price.toString(),
            currency_code: plan.currency
          }
        }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      },
      taxes: {
        percentage: '19',
        inclusive: false
      }
    }

    const response = await fetch(`${this.baseURL}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(planData)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal plan creation failed: ${error}`)
    }

    const result = await response.json()
    return result.id
  }

  // ================================
  // SUBSCRIPTION CREATION
  // ================================
  async createSubscription(
    userId: string,
    planId: string,
    userEmail: string,
    userName: string
  ): Promise<{ subscriptionId: string, approvalUrl: string }> {
    const accessToken = await this.getAccessToken()

    const subscriptionData = {
      plan_id: planId,
      start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
      quantity: 1,
      shipping_amount: {
        currency_code: 'RON',
        value: '0.00'
      },
      subscriber: {
        name: {
          given_name: userName.split(' ')[0] || 'User',
          surname: userName.split(' ')[1] || 'PorVerse'
        },
        email_address: userEmail
      },
      application_context: {
        brand_name: 'PorVerse',
        locale: 'ro-RO',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/paypal/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`
      },
      custom_id: userId // Link to our user
    }

    const response = await fetch(`${this.baseURL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscriptionData)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal subscription creation failed: ${error}`)
    }

    const result = await response.json()
    
    // Find approval URL
    const approvalLink = result.links.find((link: any) => link.rel === 'approve')
    
    if (!approvalLink) {
      throw new Error('No approval URL found in PayPal response')
    }

    // Save subscription to database
    await this.saveSubscriptionToDatabase({
      subscriptionId: result.id,
      userId,
      planId,
      status: 'APPROVAL_PENDING',
      currentPeriodStart: new Date(result.start_time),
      currentPeriodEnd: new Date() // Will be updated when activated
    })

    return {
      subscriptionId: result.id,
      approvalUrl: approvalLink.href
    }
  }

  // ================================
  // SUBSCRIPTION MANAGEMENT
  // ================================
  async getSubscriptionDetails(subscriptionId: string): Promise<any> {
    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.baseURL}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get subscription details: ${response.statusText}`)
    }

    return await response.json()
  }

  async cancelSubscription(
    subscriptionId: string,
    reason: string = 'User requested cancellation'
  ): Promise<void> {
    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.baseURL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to cancel subscription: ${response.statusText}`)
    }

    // Update database
    await this.updateSubscriptionStatus(subscriptionId, 'CANCELED')
  }

  async activateSubscription(subscriptionId: string): Promise<void> {
    const accessToken = await this.getAccessToken()

    const response = await fetch(`${this.baseURL}/v1/billing/subscriptions/${subscriptionId}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'User completed payment approval'
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to activate subscription: ${response.statusText}`)
    }

    // Update database
    await this.updateSubscriptionStatus(subscriptionId, 'ACTIVE')
  }

  // ================================
  // WEBHOOK HANDLERS
  // ================================
  async handleWebhook(headers: any, body: string): Promise<void> {
    // Verify webhook signature (implement based on PayPal docs)
    const isValid = await this.verifyWebhookSignature(headers, body)
    
    if (!isValid) {
      throw new Error('Invalid webhook signature')
    }

    const event = JSON.parse(body)

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await this.handleSubscriptionActivated(event)
        break
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await this.handleSubscriptionCancelled(event)
        break
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await this.handleSubscriptionSuspended(event)
        break
        
      case 'PAYMENT.SALE.COMPLETED':
        await this.handlePaymentCompleted(event)
        break
        
      case 'PAYMENT.SALE.DENIED':
        await this.handlePaymentDenied(event)
        break
        
      default:
        console.log(`Unhandled PayPal webhook event: ${event.event_type}`)
    }
  }

  private async handleSubscriptionActivated(event: any): Promise<void> {
    const subscriptionId = event.resource.id
    const details = await this.getSubscriptionDetails(subscriptionId)
    
    // Update database
    await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'ACTIVE',
        paypal_subscription_id: subscriptionId,
        current_period_start: new Date(details.start_time),
        current_period_end: new Date(details.billing_info.next_billing_time),
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId)

    // Grant ecosystem access
    const subscription = await this.getSubscriptionFromDB(subscriptionId)
    if (subscription) {
      await this.grantEcosystemAccess(subscription.user_id, subscription.plan_id)
    }

    // Send welcome email
    await this.sendWelcomeEmail(subscription?.user_id, details)
  }

  private async handleSubscriptionCancelled(event: any): Promise<void> {
    const subscriptionId = event.resource.id
    
    await this.updateSubscriptionStatus(subscriptionId, 'CANCELED')
    
    // Revoke premium access but keep data
    const subscription = await this.getSubscriptionFromDB(subscriptionId)
    if (subscription) {
      await this.revokeEcosystemAccess(subscription.user_id)
    }
  }

  private async handlePaymentCompleted(event: any): Promise<void> {
    const subscriptionId = event.resource.billing_agreement_id
    
    // Log successful payment
    await supabaseAdmin
      .from('payment_logs')
      .insert({
        user_id: await this.getUserIdFromSubscription(subscriptionId),
        payment_provider: 'paypal',
        transaction_id: event.resource.id,
        amount: parseFloat(event.resource.amount.total),
        currency: event.resource.amount.currency,
        status: 'completed',
        metadata: { subscription_id: subscriptionId }
      })

    // Update next billing date
    const details = await this.getSubscriptionDetails(subscriptionId)
    await supabaseAdmin
      .from('user_subscriptions')
      .update({
        current_period_end: new Date(details.billing_info.next_billing_time),
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId)
  }

  // ================================
  // DATABASE OPERATIONS
  // ================================
  private async saveSubscriptionToDatabase(subscription: PayPalSubscription): Promise<void> {
    await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: subscription.userId,
        plan_id: subscription.planId,
        status: subscription.status,
        paypal_subscription_id: subscription.subscriptionId,
        current_period_start: subscription.currentPeriodStart.toISOString(),
        current_period_end: subscription.currentPeriodEnd.toISOString()
      })
  }

  private async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
    await supabaseAdmin
      .from('user_subscriptions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId)
  }

  private async getSubscriptionFromDB(subscriptionId: string): Promise<any> {
    const { data } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('paypal_subscription_id', subscriptionId)
      .single()
    
    return data
  }

  private async getUserIdFromSubscription(subscriptionId: string): Promise<string> {
    const subscription = await this.getSubscriptionFromDB(subscriptionId)
    return subscription?.user_id || ''
  }

  private async grantEcosystemAccess(userId: string, planId: string): Promise<void> {
    // Implementation depends on your plan structure
    const ecosystems = await this.getEcosystemsForPlan(planId)
    
    for (const ecosystem of ecosystems) {
      await supabaseAdmin
        .from('user_ecosystems')
        .upsert({
          user_id: userId,
          ecosystem,
          access_level: 'premium',
          activated_at: new Date().toISOString()
        })
    }
  }

  private async revokeEcosystemAccess(userId: string): Promise<void> {
    await supabaseAdmin
      .from('user_ecosystems')
      .update({ access_level: 'free' })
      .eq('user_id', userId)
  }

  private async getEcosystemsForPlan(planId: string): Promise<string[]> {
    // Return ecosystems based on plan
    const planMapping: Record<string, string[]> = {
      'starter': ['por-health'],
      'pro': ['por-health', 'por-kids', 'por-mind'],
      'complete': ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu']
    }
    
    return planMapping[planId] || []
  }

  private async sendWelcomeEmail(userId: string, subscriptionDetails: any): Promise<void> {
    // Implement email sending logic
    console.log(`Welcome email sent to user ${userId}`)
  }

  private async verifyWebhookSignature(headers: any, body: string): Promise<boolean> {
    // Implement PayPal webhook signature verification
    // This is critical for security
    return true // Placeholder - implement actual verification
  }

  // ================================
  // UTILITY METHODS
  // ================================
  getPlans(): PayPalPlan[] {
    return [
      {
        id: 'starter',
        name: 'PorHealth Starter',
        price: 49,
        currency: 'RON',
        ecosystems: ['por-health'],
        features: ['AI Nutrition Planner', 'Workout Optimizer', 'Health Tracking']
      },
      {
        id: 'pro',
        name: 'Triple Pack Pro',
        price: 119,
        currency: 'RON',
        ecosystems: ['por-health', 'por-kids', 'por-mind'],
        features: ['All Starter features', 'Homework Scanner', 'Smart Budgeting', 'Investment Advisor']
      },
      {
        id: 'complete',
        name: 'Complete Ecosystem',
        price: 199,
        currency: 'RON',
        ecosystems: ['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu'],
        features: ['All features', 'AI Therapist', 'Productivity Optimizer', 'Strategic Planning', 'Quantum Vault Access']
      }
    ]
  }

  formatPrice(amount: number, currency: string = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency
    }).format(amount)
  }
}