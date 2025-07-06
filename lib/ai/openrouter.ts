// lib/ai/openrouter.ts (FIȘIER NOU)
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL!,
    "X-Title": "PorVerse Quantum Vault",
  }
});

export async function generateFutureSelf(userProfile: any) {
  try {
    const prompt = `You are an advanced AI creating a detailed future self profile for spiritual guidance. 
    
    User Profile: ${JSON.stringify(userProfile)}
    
    Generate a comprehensive future self (10 years from now) including:
    1. Transformation level (1-100)
    2. Evolved appearance metrics (confidence, wisdom, energy, etc.)
    3. Consciousness evolution metrics
    4. Major life achievements in career, health, relationships
    5. Life situation details (career, wealth, lifestyle)
    6. 3 powerful wisdom messages with urgency levels
    7. Quantum insights for breakthrough opportunities
    
    Return as detailed JSON matching the FutureSelf interface structure.`;

    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3-haiku",
      messages: [
        {
          role: "system",
          content: "You are a quantum consciousness AI guide helping users discover their highest potential."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content!);
  } catch (error) {
    console.error('Future Self generation error:', error);
    throw error;
  }
}

export async function generateTimelineAlternatives(userDecisions: any) {
  const prompt = `Analyze these life decisions and generate 3 alternative timeline possibilities:
  
  Current Decisions: ${JSON.stringify(userDecisions)}
  
  For each timeline generate:
  1. Name and probability of occurrence
  2. Key decision points needed
  3. Outcomes at 1, 5, and 10 years
  4. Major risks and opportunities
  5. Specific action steps required
  
  Return as JSON array of timeline alternatives.`;

  const response = await openai.chat.completions.create({
    model: "anthropic/claude-3-haiku",
    messages: [
      {
        role: "system",
        content: "You are a quantum timeline analyst showing possible future paths."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1500
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function generateQuantumInsights(userData: any) {
  const prompt = `Based on this user's data, generate powerful quantum insights:
  
  User Data: ${JSON.stringify(userData)}
  
  Generate:
  1. Hidden patterns in their behavior
  2. Breakthrough opportunities approaching
  3. Subconscious blocks to address
  4. Synchronicities to watch for
  5. Daily quantum guidance message
  
  Return as structured JSON with actionable insights.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system", 
        content: "You are a quantum pattern recognition system revealing hidden opportunities."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.9,
    max_tokens: 1000
  });

  return JSON.parse(response.choices[0].message.content!);
}