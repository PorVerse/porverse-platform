import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('paypal-transmission-sig')
    
    // Verify PayPal webhook signature
    if (!verifyPayPalSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const supabase = createServerSupabase()

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event, supabase)
        break
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event, supabase)
        break
        
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(event, supabase)
        break
        
      default:
        console.log('Unhandled PayPal event:', event.event_type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

function verifyPayPalSignature(body: string, signature: string | null): boolean {
  // Simplified verification - implement proper PayPal signature verification
  return true
}

async function handleSubscriptionActivated(event: any, supabase: any) {
  const subscriptionId = event.resource.id
  // Update subscription status
  await supabase
    .from('user_subscriptions')
    .update({ status: 'active' })
    .eq('paypal_subscription_id', subscriptionId)
}

async function handleSubscriptionCancelled(event: any, supabase: any) {
  const subscriptionId = event.resource.id
  await supabase
    .from('user_subscriptions')
    .update({ status: 'cancelled' })
    .eq('paypal_subscription_id', subscriptionId)
}

async function handlePaymentCompleted(event: any, supabase: any) {
  console.log('PayPal payment completed:', event.resource.id)
}