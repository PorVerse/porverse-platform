import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { userId, preferences, goals } = await request.json();

    const systemPrompt = `You are a certified nutritionist. Create a personalized meal plan.

User preferences: ${JSON.stringify(preferences)}
Goals: ${JSON.stringify(goals)}

Return a JSON object with this structure:
{
  "weeklyPlan": {
    "monday": { "breakfast": {...}, "lunch": {...}, "dinner": {...} }
  },
  "shoppingList": [],
  "nutritionSummary": {},
  "tips": []
}

Include calorie counts, macros, and shopping list.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: systemPrompt }],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' as const },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const mealPlan = JSON.parse(content);

    return NextResponse.json({ mealPlan, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Nutrition Planner Error:', error);
    return NextResponse.json({ error: 'Failed to generate meal plan' }, { status: 500 });
  }
}