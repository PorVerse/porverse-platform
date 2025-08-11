// lib/payments/payment-service.ts
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export class PaymentService {
  private stripe: Stripe
  private supabase: any

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16'
    })
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  }

  async createStripeCheckout(userId: string, planId: string, cycle = 'monthly') {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{
          price: 'price_test_123',
          quantity: 1
        }],
        success_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?success=true',
        cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/pricing?cancelled=true'
      })

      return { url: session.url }
    } catch (error) {
      console.error('Stripe checkout error:', error)
      throw error
    }
  }

  async handleWebhook(signature: string, body: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      )
      
      console.log('Webhook received:', event.type)
      return { received: true }
    } catch (error) {
      console.error('Webhook error:', error)
      throw error
    }
  }
}

export const paymentService = new PaymentService()
