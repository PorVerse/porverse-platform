// app/api/ai/therapy/route.ts - FIXED (no duplicate imports)
import { NextRequest, NextResponse } from 'next/server';

// Crisis keywords for detection
const CRISIS_KEYWORDS = [
  'sinucidere', 'să mor', 'să mă omor', 'nu mai vreau să trăiesc',
  'suicide', 'kill myself', 'want to die', 'end my life'
];

// Emergency resources
const EMERGENCY_RESOURCES = {
  ro: {
    hotline: '116 123',
    text: 'Dacă ai gânduri de sinucidere, te rog să suni imediat la 116 123 (Telefonul Speranței).',
    resources: ['Telefonul Speranței: 116 123', 'Ambulanța: 112']
  },
  en: {
    hotline: '988',
    text: 'If you are having thoughts of suicide, please call 988 immediately.',
    resources: ['Suicide Prevention Lifeline: 988', 'Emergency: 911']
  }
};

// Crisis detection
function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

// Generate crisis response
function generateCrisisResponse(language: 'ro' | 'en' = 'ro') {
  const resources = EMERGENCY_RESOURCES[language];
  return {
    message: resources.text,
    resources: resources.resources,
    emergency: true,
    crisis: true
  };
}

// Generate therapeutic response
function generateTherapyResponse(message: string, language: 'ro' | 'en' = 'ro') {
  const responses = {
    ro: [
      'Îmi pare rău că treci prin această perioadă dificilă. Sentimentele tale sunt valide și importante.',
      'Mulțumesc că împarți asta cu mine. Sunt aici să te ascult și să te sprijin.',
      'Înțeleg că poate fi copleșitor. Să explorăm împreună cum te poți simți mai bine.',
      'Este curajos din partea ta să cauți sprijin. Cum te simți în acest moment?'
    ],
    en: [
      'I\'m sorry you\'re going through this difficult time. Your feelings are valid and important.',
      'Thank you for sharing this with me. I\'m here to listen and support you.',
      'I understand this can feel overwhelming. Let\'s explore together how you can feel better.',
      'It\'s brave of you to seek support. How are you feeling right now?'
    ]
  };

  const randomResponse = responses[language][Math.floor(Math.random() * responses[language].length)];
  
  const techniques = language === 'ro' ? [
    'Exercițiu de respirație: Inspiră 4 secunde, ține 4 secunde, expiră 4 secunde',
    'Tehnica 5-4-3-2-1: Numește 5 lucruri pe care le vezi, 4 pe care le auzi, 3 pe care le atingi',
    'Mindfulness: Concentrează-te pe prezent timp de 5 minute'
  ] : [
    'Breathing exercise: Breathe in for 4, hold for 4, breathe out for 4',
    '5-4-3-2-1 technique: Name 5 things you see, 4 you hear, 3 you touch',
    'Mindfulness: Focus on the present moment for 5 minutes'
  ];

  return {
    response: randomResponse,
    copingTechniques: techniques.slice(0, 2),
    needsProfessionalHelp: false,
    crisis: false
  };
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, language = 'ro' } = body;

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Crisis detection
    const isCrisis = detectCrisis(message);
    
    if (isCrisis) {
      const crisisResponse = generateCrisisResponse(language);
      return NextResponse.json(crisisResponse);
    }

    // Normal therapeutic response
    const therapyResponse = generateTherapyResponse(message, language);
    
    return NextResponse.json({
      ...therapyResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Therapy API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process therapy request' },
      { status: 500 }
    );
  }
}

// GET handler for conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Mock conversation history for now
    return NextResponse.json({
      conversations: [],
      count: 0
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}