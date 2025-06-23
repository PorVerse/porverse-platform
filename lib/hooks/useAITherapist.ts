// lib/hooks/useAITherapist.ts
import { useState } from 'react';

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  context?: {
    mood_analysis?: boolean;
    sleep_insights?: boolean;
    stress_patterns?: boolean;
    wellness_recommendations?: boolean;
  };
}

interface AIResponse {
  message: string;
  insights?: {
    mood_correlation?: string;
    sleep_impact?: string;
    stress_factors?: string;
    recommendations?: string[];
  };
  urgency_level?: 'low' | 'medium' | 'high' | 'crisis';
  follow_up_questions?: string[];
}

export function useAITherapist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (
    userMessage: string, 
    wellnessData: any, 
    conversationHistory: AIMessage[]
  ): Promise<AIResponse> => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Create context for AI
      const context = {
        user_message: userMessage,
        wellness_data: wellnessData,
        conversation_history: conversationHistory.slice(-10), // Last 10 messages for context
        timestamp: new Date().toISOString(),
        session_type: 'therapy_chat'
      };

      // Call our API endpoint that handles OpenRouter integration
      const response = await fetch('/api/ai/therapist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const aiResponse: AIResponse = await response.json();

      // Log interaction to Xano for analytics
      await logTherapyInteraction(userMessage, aiResponse, wellnessData);

      return aiResponse;
    } catch (err) {
      console.error('Error generating AI response:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI response');
      
      // Fallback response for errors
      return {
        message: "Îmi pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou sau să contactezi suportul dacă problema persistă.",
        urgency_level: 'low'
      };
    } finally {
      setLoading(false);
    }
  };

  const logTherapyInteraction = async (
    userMessage: string, 
    aiResponse: AIResponse, 
    wellnessData: any
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      
      await fetch('/api/xano/therapy-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_message: userMessage,
          ai_response: aiResponse.message,
          insights_provided: aiResponse.insights,
          urgency_level: aiResponse.urgency_level,
          wellness_context: {
            mood_score: wellnessData?.mood?.weeklyAverage,
            stress_level: wellnessData?.stress?.currentLevel,
            sleep_quality: wellnessData?.sleep?.averageScore
          },
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error logging therapy interaction:', error);
      // Don't throw - logging failure shouldn't break user experience
    }
  };

  const detectCrisis = (message: string): boolean => {
    const crisisKeywords = [
      'sinucidere', 'să mor', 'să mă omor', 'nu mai vreau să trăiesc',
      'să mă fac să', 'să îmi fac rău', 'vreau să dispar',
      'nu mai pot', 'nu mai am speranță', 'totul e fără sens'
    ];

    const lowerMessage = message.toLowerCase();
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const generateCrisisResponse = (): AIResponse => {
    return {
      message: `Observ că treci printr-o perioadă foarte dificilă și îmi pare rău că te simți așa. Sentimentele tale sunt importante și merită atenție profesională imediată.

**RESURSE URGENTE:**
📞 **Telefonul Vieții: 116 123** (gratuit, 24/7)
🏥 **Urgența spitalului de psihiatrie: 112**
💬 **Chat suport: suicide-helpline.org**

Te încurajez să contactezi imediat una dintre aceste resurse. Nu ești singur în această situație și există oameni pregătiți să te ajute.

Până ajungi la sprijin profesional, încearcă să rămâi într-un loc sigur și să contactezi pe cineva de încredere.`,
      urgency_level: 'crisis',
      follow_up_questions: [
        'Ai pe cineva pe care îl poți contacta acum?',
        'Te simți în siguranță în acest moment?'
      ]
    };
  };

  return {
    generateResponse,
    detectCrisis,
    generateCrisisResponse,
    loading,
    error
  };
}