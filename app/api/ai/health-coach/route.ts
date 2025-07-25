// app/api/ai/health-coach/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerSupabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { message, userId, context } = await request.json();
    
    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user health context from Supabase
    const supabase = createServerSupabase();
    const { data: healthProfile } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('ecosystem', 'por-health')
      .eq('progress_type', 'health_profile')
      .single();

    // Build context for AI
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
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    // Save conversation to Supabase
    await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        ecosystem: 'por-health',
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse }
        ],
        context_data: { healthContext, userContext: context }
      });

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Health Coach Error:', error);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

// app/api/ai/nutrition-planner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { userId, preferences, goals } = await request.json();
    
    const systemPrompt = `You are a certified nutritionist. Create a personalized meal plan.
    
    User preferences: ${JSON.stringify(preferences)}
    Goals: ${JSON.stringify(goals)}
    
    Return a JSON object with this structure:
    {
      "weeklyPlan": {
        "monday": { "breakfast": {...}, "lunch": {...}, "dinner": {...} },
        // ... other days
      },
      "shoppingList": [...],
      "nutritionSummary": {...},
      "tips": [...]
    }
    
    Include calorie counts, macros, and shopping list.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: systemPrompt }],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const mealPlan = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      mealPlan,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Nutrition Planner Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}

// components/AIHealthCoach.tsx - UPDATE pentru real API
'use client';

import { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIHealthCoach({ userId, healthContext }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Call real API
      const response = await fetch('/api/ai/health-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          userId,
          context: healthContext
        })
      });
      
      if (!response.ok) throw new Error('API call failed');
      
      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-health-coach">
      {/* Chat interface - folosește design-ul existent */}
      <div className="messages-container max-h-96 overflow-y-auto mb-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-700 text-white'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block bg-gray-700 text-white px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about nutrition, workouts, wellness..."
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-black px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}