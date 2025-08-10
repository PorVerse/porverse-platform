import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  // Log cancellation
  if (token) {
    console.log('PayPal payment cancelled:', token)
  }
  
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscription_id } = await request.json()
    
    // Cancel PayPal subscription
    const accessToken = await getPayPalAccessToken()
    const cancelResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscription_id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'User requested cancellation'
      })
    })

    if (!cancelResponse.ok) {
      throw new Error('PayPal cancellation failed')
    }

    // Update database
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        canceled_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('paypal_subscription_id', subscription_id)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('PayPal cancel error:', error)
    return NextResponse.json({ error: 'Cancellation failed' }, { status: 500 })
  }
}

async function getPayPalAccessToken(): Promise<string> {
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  const data = await response.json()
  return data.access_token
}