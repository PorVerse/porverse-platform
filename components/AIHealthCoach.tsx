// components/AIHealthCoach.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AIHealthCoach.module.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  insights?: {
    healthScore?: number;
    recommendations?: string[];
    urgency?: 'low' | 'medium' | 'high';
  };
}

interface HealthContext {
  healthScore: number;
  recentMetrics: {
    heartRate: number;
    steps: number;
    sleep: number;
    stress: number;
  };
  goals: string[];
  concerns: string[];
}

interface AIHealthCoachProps {
  isOpen: boolean;
  onClose: () => void;
  healthContext: HealthContext;
}

export default function AIHealthCoach({ isOpen, onClose, healthContext }: AIHealthCoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation with AI greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = generatePersonalizedGreeting();
      setMessages([{
        id: 'initial',
        type: 'ai',
        content: greeting,
        timestamp: new Date(),
        insights: {
          healthScore: healthContext.healthScore,
          recommendations: generateInitialRecommendations(),
          urgency: 'low'
        }
      }]);
    }
  }, [isOpen, healthContext.healthScore]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generatePersonalizedGreeting = (): string => {
    const { healthScore, recentMetrics } = healthContext;
    const timeOfDay = getTimeOfDay();
    
    if (healthScore >= 90) {
      return `${timeOfDay}! 🌟 Your health ecosystem is performing exceptionally at ${healthScore}%! Your sleep quality (${recentMetrics.sleep}hrs) and stress management are outstanding. What wellness goal would you like to optimize today?`;
    } else if (healthScore >= 80) {
      return `${timeOfDay}! 💪 Great progress with a ${healthScore}% health score! I noticed your ${recentMetrics.steps.toLocaleString()} steps today - you're crushing your activity goals! How can I help enhance your wellness journey?`;
    } else if (healthScore >= 70) {
      return `${timeOfDay}! 🎯 Your ${healthScore}% health score shows solid foundation. I see some optimization opportunities, especially with your ${recentMetrics.stress > 30 ? 'stress levels' : 'sleep patterns'}. What's your main wellness focus right now?`;
    } else {
      return `${timeOfDay}! 🌱 I'm here to help boost your ${healthScore}% health score. Let's start with small, sustainable changes that will make a big impact. What health challenge would you like to tackle first?`;
    }
  };

  const generateInitialRecommendations = (): string[] => {
    const recs = [];
    const { recentMetrics } = healthContext;
    
    if (recentMetrics.sleep < 7) {
      recs.push("Optimize sleep: Aim for 7-9 hours with consistent bedtime");
    }
    if (recentMetrics.steps < 8000) {
      recs.push("Increase daily movement: Add 2000 more steps gradually");
    }
    if (recentMetrics.stress > 35) {
      recs.push("Stress management: Try 10-minute morning meditation");
    }
    if (recentMetrics.heartRate > 75) {
      recs.push("Cardiovascular health: Include 3 cardio sessions weekly");
    }
    
    return recs.slice(0, 3); // Top 3 recommendations
  };

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let insights = {};
    
    // Health topics pattern matching
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('energy')) {
      response = generateSleepAdvice(userMessage);
      insights = {
        healthScore: healthContext.healthScore + 5,
        recommendations: ["Maintain consistent sleep schedule", "Optimize bedroom environment", "Limit screens 1hr before bed"],
        urgency: healthContext.recentMetrics.sleep < 6 ? 'high' : 'medium'
      };
    } else if (lowerMessage.includes('weight') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
      response = generateNutritionAdvice(userMessage);
      insights = {
        recommendations: ["Focus on protein timing", "Increase vegetable intake", "Stay hydrated"],
        urgency: 'medium'
      };
    } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxious') || lowerMessage.includes('overwhelmed')) {
      response = generateStressAdvice(userMessage);
      insights = {
        recommendations: ["Practice deep breathing", "Take walking breaks", "Set boundaries"],
        urgency: healthContext.recentMetrics.stress > 40 ? 'high' : 'medium'
      };
    } else if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('fitness')) {
      response = generateFitnessAdvice(userMessage);
      insights = {
        recommendations: ["Progressive overload", "Mix cardio and strength", "Schedule rest days"],
        urgency: 'low'
      };
    } else if (lowerMessage.includes('goal') || lowerMessage.includes('motivation') || lowerMessage.includes('habit')) {
      response = generateGoalAdvice(userMessage);
      insights = {
        recommendations: ["Start small and consistent", "Track daily progress", "Celebrate wins"],
        urgency: 'low'
      };
    } else {
      response = generateGeneralAdvice(userMessage);
      insights = {
        recommendations: ["Maintain balanced lifestyle", "Listen to your body", "Stay consistent"],
        urgency: 'low'
      };
    }
    
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      insights
    };
  };

  const generateSleepAdvice = (message: string): string => {
    const responses = [
      `Based on your ${healthContext.recentMetrics.sleep}hrs of sleep, I recommend establishing a wind-down routine 1 hour before bed. Try dimming lights, avoiding screens, and practicing gentle stretches. Quality sleep is the foundation of your ${healthContext.healthScore}% health score! 🌙`,
      `Sleep optimization is crucial! Your current ${healthContext.recentMetrics.sleep}hrs can be improved. Consider tracking your sleep environment - ideal temperature is 65-68°F, room should be dark and quiet. A consistent bedtime will regulate your circadian rhythm within 2-3 weeks. 😴`,
      `Great question about sleep! I see you averaged ${healthContext.recentMetrics.sleep}hrs recently. To boost energy naturally: morning sunlight exposure (15 mins), no caffeine after 2 PM, and magnesium supplement 30 mins before bed can improve sleep quality by 25-40%. 🌅`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateNutritionAdvice = (message: string): string => {
    const responses = [
      `Nutrition is 70% of your health journey! Based on your current metrics, focus on protein timing - 20-30g within 30 minutes post-workout for optimal recovery. Your body composition goals align perfectly with increased protein intake. 🥗`,
      `Smart nutrition question! I recommend the 80/20 rule - 80% whole foods, 20% flexibility. With your activity level of ${healthContext.recentMetrics.steps.toLocaleString()} steps, you need adequate carbs for energy and protein for recovery. Track macros for 2 weeks to optimize! 📊`,
      `Excellent focus on nutrition! Hydration multiplies every nutritional benefit - aim for half your body weight in ounces daily. Pair complex carbs with healthy fats and protein for sustained energy. Your ${healthContext.healthScore}% health score will improve with consistent meal timing! 💧`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateStressAdvice = (message: string): string => {
    const responses = [
      `Stress management is vital for your wellness! Your current stress level of ${healthContext.recentMetrics.stress}% can be improved with the 4-7-8 breathing technique: inhale 4 counts, hold 7, exhale 8. Practice 3 times daily for noticeable HRV improvement. 🧘‍♀️`,
      `I understand stress impacts everything! Try the 5-5-5 method: when overwhelmed, name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. This grounds your nervous system instantly. Your heart rate variability will thank you! ❤️`,
      `Stress resilience is buildable! With your activity level, exercise is already helping. Add cold exposure (cold shower 30 seconds) and meditation (10 minutes morning) to create anti-fragility. Your ${healthContext.healthScore}% score reflects your body's adaptation capacity! 💪`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateFitnessAdvice = (message: string): string => {
    const responses = [
      `Your ${healthContext.recentMetrics.steps.toLocaleString()} daily steps show great baseline activity! For next level fitness, add 2 strength sessions weekly focusing on compound movements: squats, deadlifts, pull-ups. Progressive overload = progressive results! 🏋️‍♀️`,
      `Fitness optimization incoming! Your current activity suggests good cardiovascular base. To maximize efficiency: 3 strength + 2 cardio weekly, prioritize sleep for recovery, and track progressive overload. Your ${healthContext.healthScore}% health score will climb steadily! 📈`,
      `Smart fitness focus! Based on your metrics, you're ready for periodization: 4 weeks strength building, 1 week deload. This prevents plateaus and overtraining. Your body adapts to challenges when recovery is prioritized equally with training! ⚡`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateGoalAdvice = (message: string): string => {
    const responses = [
      `Goal achievement is about systems, not just outcomes! Your ${healthContext.healthScore}% health score reflects consistent daily actions. Start with 1% improvements daily - compound interest applies to health habits. What's one tiny habit you can implement today? 🎯`,
      `Motivation gets you started, but systems keep you going! Based on your current progress, focus on process goals over outcome goals. Instead of "lose 10 pounds," try "eat protein at every meal." Your brain loves completing small, specific tasks! 🧠`,
      `Excellent question about goals! Your metrics show you're already building momentum. Use the 3-2-1 rule: 3 things you'll do daily, 2 weekly check-ins, 1 monthly assessment. This creates accountability without overwhelming your schedule. Consistency compounds! 📊`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateGeneralAdvice = (message: string): string => {
    const responses = [
      `Great question! Your ${healthContext.healthScore}% health score shows you're on the right track. The key is listening to your body's signals and adjusting accordingly. Every person's optimal health looks different - let's find what works for YOUR unique biology! 🌟`,
      `I love your curiosity about health optimization! Remember, the best protocol is the one you can stick to consistently. Your current metrics suggest a good foundation - now it's about fine-tuning and making sustainable improvements. What feels most challenging right now? 💡`,
      `That's a thoughtful question! Health is multidimensional - physical, mental, emotional, and social. Your ${healthContext.recentMetrics.steps.toLocaleString()} steps and sleep patterns show you understand the basics. Let's explore what aspect of wellness you'd like to dive deeper into! 🌈`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setConversationContext(prev => [...prev, inputValue.trim()].slice(-5)); // Keep last 5 messages
    setInputValue('');
    setIsTyping(true);
    
    try {
      const aiResponse = await generateAIResponse(inputValue.trim());
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm experiencing a technical issue. Please try again, or feel free to ask about any health topic - I'm here to help optimize your wellness journey! 🤖",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.chatModal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.aiAvatar}>
              <span className={styles.avatarIcon}>🧠</span>
              <span className={styles.onlineIndicator}></span>
            </div>
            <div>
              <h3 className={styles.title}>AI Health Coach</h3>
              <p className={styles.subtitle}>
                Analyzing your {healthContext.healthScore}% health score • 
                <span className={styles.liveStatus}> Live AI Analysis</span>
              </p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Health Context Bar */}
        <div className={styles.contextBar}>
          <div className={styles.contextMetrics}>
            <div className={styles.contextMetric}>
              <span className={styles.metricIcon}>❤️</span>
              <span className={styles.metricValue}>{healthContext.recentMetrics.heartRate}</span>
              <span className={styles.metricUnit}>bpm</span>
            </div>
            <div className={styles.contextMetric}>
              <span className={styles.metricIcon}>👟</span>
              <span className={styles.metricValue}>{(healthContext.recentMetrics.steps / 1000).toFixed(1)}k</span>
              <span className={styles.metricUnit}>steps</span>
            </div>
            <div className={styles.contextMetric}>
              <span className={styles.metricIcon}>🌙</span>
              <span className={styles.metricValue}>{healthContext.recentMetrics.sleep}</span>
              <span className={styles.metricUnit}>hrs</span>
            </div>
            <div className={styles.contextMetric}>
              <span className={styles.metricIcon}>🧘</span>
              <span className={styles.metricValue}>{healthContext.recentMetrics.stress}</span>
              <span className={styles.metricUnit}>% stress</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
              {message.type === 'ai' && (
                <div className={styles.messageAvatar}>
                  🤖
                </div>
              )}
              <div className={styles.messageContent}>
                <div className={styles.messageText}>
                  {message.content}
                </div>
                {message.insights && message.insights.recommendations && (
                  <div className={styles.insights}>
                    <div className={styles.insightsHeader}>💡 AI Recommendations:</div>
                    <ul className={styles.recommendations}>
                      {message.insights.recommendations.map((rec, index) => (
                        <li key={index} className={styles.recommendation}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className={styles.messageTime}>
                  {getMessageTime(message.timestamp)}
                </div>
              </div>
              {message.type === 'user' && (
                <div className={styles.userAvatar}>
                  👤
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className={`${styles.message} ${styles.ai}`}>
              <div className={styles.messageAvatar}>🤖</div>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span>AI is analyzing your health data...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button 
            className={styles.quickAction}
            onClick={() => setInputValue("How can I improve my sleep quality?")}
          >
            😴 Sleep Better
          </button>
          <button 
            className={styles.quickAction}
            onClick={() => setInputValue("Create a workout plan for me")}
          >
            💪 Workout Plan
          </button>
          <button 
            className={styles.quickAction}
            onClick={() => setInputValue("Help me reduce stress")}
          >
            🧘 Reduce Stress
          </button>
          <button 
            className={styles.quickAction}
            onClick={() => setInputValue("Nutrition advice for my goals")}
          >
            🥗 Nutrition Tips
          </button>
        </div>

        {/* Input */}
        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your AI health coach anything..."
              className={styles.input}
              disabled={isTyping}
            />
            <button 
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              {isTyping ? '🧠' : '➤'}
            </button>
          </div>
          <div className={styles.inputHint}>
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}