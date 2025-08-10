import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const payerId = searchParams.get('PayerID')

    if (!token || !payerId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=invalid_payment`)
    }

    // Verify PayPal payment
    const paypalResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}`, {
      headers: {
        'Authorization': `Bearer ${await getPayPalAccessToken()}`,
        'Content-Type': 'application/json'
      }
    })

    if (!paypalResponse.ok) {
      throw new Error('PayPal verification failed')
    }

    const paypalData = await paypalResponse.json()
    
    // Save subscription to database
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('user_subscriptions').insert({
        user_id: user.id,
        payment_provider: 'paypal',
        external_id: token,
        status: 'active',
        created_at: new Date().toISOString()
      })
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`)

  } catch (error) {
    console.error('PayPal success error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/pricing?error=payment_failed`)
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