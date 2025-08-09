// app/api/payments/plans/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server';

const SUBSCRIPTION_PLANS = {
  ro: [
    {
      id: 'por-health-ro',
      name: 'PorHealth',
      price_monthly: 19.99,
      price_yearly: 199.99,
      currency: 'RON',
      ecosystems: ['por-health'],
      features: ['Nutrition AI', 'Workout Plans', 'Health Tracking']
    },
    {
      id: 'por-kids-ro',
      name: 'PorKids',
      price_monthly: 24.99,
      price_yearly: 249.99,
      currency: 'RON',
      ecosystems: ['por-kids'],
      features: ['Homework AI', 'Educational Games', 'Progress Tracking']
    },
    {
      id: 'trinity-combo-ro',
      name: 'Trinity Combo',
      price_monthly: 59.99,
      price_yearly: 599.99,
      currency: 'RON',
      ecosystems: ['por-mind', 'por-flow', 'por-blu'],
      features: ['Financial AI', 'Productivity Tools', 'Strategic Planning', 'Quantum Vault Access'],
      popular: true
    }
  ],
  us: [
    {
      id: 'por-health-us',
      name: 'PorHealth',
      price_monthly: 9.99,
      price_yearly: 99.99,
      currency: 'USD',
      ecosystems: ['por-health'],
      features: ['Nutrition AI', 'Workout Plans', 'Health Tracking']
    },
    {
      id: 'trinity-combo-us',
      name: 'Trinity Combo',
      price_monthly: 29.99,
      price_yearly: 299.99,
      currency: 'USD',
      ecosystems: ['por-mind', 'por-flow', 'por-blu'],
      features: ['Financial AI', 'Productivity Tools', 'Strategic Planning', 'Quantum Vault Access'],
      popular: true
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'ro';
    const currency = searchParams.get('currency');

    let plans = SUBSCRIPTION_PLANS[region as keyof typeof SUBSCRIPTION_PLANS] || SUBSCRIPTION_PLANS.ro;

    // Filter by currency if specified
    if (currency) {
      plans = plans.filter(plan => plan.currency.toLowerCase() === currency.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      plans,
      region,
      studentDiscount: 50, // 50% discount for students
      supportedCurrencies: ['RON', 'USD', 'EUR']
    });

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, planId, userId } = body;

    if (action === 'estimate') {
      const plan = Object.values(SUBSCRIPTION_PLANS).flat().find(p => p.id === planId);
      
      if (!plan) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        plan,
        estimatedTax: plan.price_monthly * 0.19, // 19% VAT for Romania
        total: plan.price_monthly * 1.19,
        currency: plan.currency
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing plan request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}