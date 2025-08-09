import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerSupabase } from '@/lib/supabase';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { message, userId, context } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: healthProfile } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-health')
      .eq('progress_type', 'health_profile')
      .single();

    const healthContext = healthProfile?.progress_data || {};

    const systemPrompt = `You are an expert health and wellness coach.

User's health context: ${JSON.stringify(healthContext)}
Current context: ${JSON.stringify(context)}

Provide personalized, actionable health advice. Always include:
- Specific, actionable recommendations
- Safety considerations and medical disclaimers when needed
- Motivational and encouraging tone
- Maximum 150 words

IMPORTANT: For serious health concerns, always recommend consulting healthcare professionals.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content ?? '';

    await supabase.from('ai_conversations').insert({
      user_id: userId,
      ecosystem: 'por-health',
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse },
      ],
      context_data: { healthContext, userContext: context },
    });

    return NextResponse.json({ response: aiResponse, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('AI Health Coach Error:', error);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}