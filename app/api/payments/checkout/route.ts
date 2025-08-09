// app/api/payments/checkout/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      planType,
      ecosystems,
      tier,
      billingCycle,
      price,
      currency,
      country
    } = body;

    // Validate required fields
    if (!planType || !ecosystems || !tier || !billingCycle || !price || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mock checkout session for now
    const sessionId = 'cs_' + Math.random().toString(36).substring(7);
    const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

    // Log the subscription request
    console.log('Creating checkout for:', {
      planType,
      ecosystems,
      tier,
      price,
      currency
    });

    return NextResponse.json({
      success: true,
      sessionId,
      url: checkoutUrl,
      planType,
      ecosystems,
      price
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}