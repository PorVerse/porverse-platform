// app/api/payments/paypal/create-subscription/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, returnUrl, cancelUrl } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Mock PayPal subscription creation
    const subscriptionId = 'I-' + Math.random().toString(36).substring(7).toUpperCase();
    const approvalUrl = `https://www.sandbox.paypal.com/webapps/billing/subscriptions/subscribe?ba_token=${subscriptionId}`;

    console.log('Creating PayPal subscription for plan:', planId);

    return NextResponse.json({
      success: true,
      subscriptionId,
      approvalUrl,
      planId
    });

  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscription_id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Mock subscription status
    return NextResponse.json({
      subscriptionId,
      status: 'ACTIVE',
      plan: 'premium',
      nextBillingTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Error fetching PayPal subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}