'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './style.css';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type: 'text' | 'insight' | 'exercise' | 'warning';
  mood?: string;
  tags?: string[];
}

interface UserProfile {
  name: string;
  currentMood: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  stressLevel: number;
  lastMeditationDate: string;
  crisisRisk: 'low' | 'medium' | 'high';
  totalSessions: number;
  preferredTherapyStyle: 'supportive' | 'analytical' | 'practical';
}

interface TherapyMetrics {
  sessionDuration: number;
  messagesExchanged: number;
  insightsGenerated: number;
  exercisesCompleted: number;
  moodImprovement: number;
}

export default function AITherapist() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentSession, setCurrentSession] = useState<TherapyMetrics>({
    sessionDuration: 0,
    messagesExchanged: 0,
    insightsGenerated: 0,
    exercisesCompleted: 0,
    moodImprovement: 0
  });
  
  const [userProfile] = useState<UserProfile>({
    name: 'Sofia',
    currentMood: 6.8,
    moodTrend: 'improving',
    stressLevel: 4,
    lastMeditationDate: '2025-01-15',
    crisisRisk: 'low',
    totalSessions: 12,
    preferredTherapyStyle: 'supportive'
  });

  const [sessionTimer, setSessionTimer] = useState(0);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<any>(null);

  useEffect(() => {
    if (sessionStarted) {
      const timer = setInterval(() => {
        setSessionTimer(prev => prev + 1);
        setCurrentSession(prev => ({
          ...prev,
          sessionDuration: prev.sessionDuration + 1
        }));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [sessionStarted]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startSession = () => {
    setSessionStarted(true);
    
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'ai',
      content: `Bună ${userProfile.name}! 🌸 Sunt Dr. Aria, AI-ul tău pentru wellness mental.\n\nAm analizat datele tale din PorWell și observ că:\n• Mood-ul tău actual: ${userProfile.currentMood}/10 (${userProfile.moodTrend === 'improving' ? 'în creștere 📈' : userProfile.moodTrend === 'stable' ? 'stabil 📊' : 'în scădere 📉'})\n• Nivel stress: ${userProfile.stressLevel}/10\n• Ultima meditație: ${userProfile.lastMeditationDate}\n\nSunt aici să te ajut cu orice te preocupă. Cu ce vrei să începem?`,
      timestamp: new Date(),
      type: 'insight',
      tags: ['welcome', 'data-analysis']
    };
    
    setMessages([welcomeMessage]);
  };

  const detectCrisis = (message: string): boolean => {
    const crisisKeywords = [
      'sinucidere', 'să mor', 'vreau să mor', 'nu mai pot', 'să mă omor',
      'nu mai are sens', 'să dispar', 'să mă fac', 'nu mai vreau să trăiesc'
    ];
    
    return crisisKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  };

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Crisis detection
    if (detectCrisis(userMessage)) {
      return {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `🚨 **Îmi pare foarte rău că te simți așa.** Aceste gânduri sunt serioase și vreau să știi că nu ești singur/ă.\n\n**Contacte urgente:**\n📞 Telefonul Sufletului: 116 123\n📞 Urgențe: 112\n\nÎmi poți spune cum te simți chiar acum? Sunt aici pentru tine și vom găsi împreună modalități să te simți mai bine.`,
        timestamp: new Date(),
        type: 'warning',
        tags: ['crisis', 'emergency', 'support']
      };
    }
    
    // Mood-related responses
    if (lowerMessage.includes('trist') || lowerMessage.includes('deprimat') || lowerMessage.includes('down')) {
      return {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `💙 Îmi pare rău că te simți trist/ă. Este perfect normal să ai perioade mai grele.\n\n**Pe baza datelor tale:**\n• Mood-ul tău a fost ${userProfile.moodTrend === 'improving' ? 'în ameliorare' : 'fluctuant'} recent\n• Meditația poate ajuta - ultima ta sesiune a fost pe ${userProfile.lastMeditationDate}\n\n**Strategii imediate:**\n🌱 Respirația 4-7-8 (2 minute)\n🎵 Playlist-ul tău de relaxare\n☀️ 5 minute la lumină naturală\n\nVrei să încercăm un exercițiu împreună?`,
        timestamp: new Date(),
        type: 'insight',
        tags: ['mood', 'sadness', 'support', 'strategies']
      };
    }
    
    // Stress-related responses
    if (lowerMessage.includes('stres') || lowerMessage.includes('copleșit') || lowerMessage.includes('anxios')) {
      return {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `💆‍♀️ Observ că te simți stresat/ă. Nivelul tău actual de stress este ${userProfile.stressLevel}/10.\n\n**Tehnici rapide anti-stress:**\n\n**5-4-3-2-1 Grounding:**\n• 5 lucruri pe care le vezi\n• 4 lucruri pe care le atingi\n• 3 lucruri pe care le auzi\n• 2 lucruri pe care le miroși\n• 1 lucru pe care îl guști\n\n**Box Breathing:** 4 sec inspiră → 4 sec ține → 4 sec expiră → 4 sec ține\n\nVrei să facem împreună un exercițiu de relaxare ghidat?`,
        timestamp: new Date(),
        type: 'exercise',
        tags: ['stress', 'anxiety', 'techniques', 'grounding']
      };
    }
    
    // Sleep-related responses
    if (lowerMessage.includes('somn') || lowerMessage.includes('insomnie') || lowerMessage.includes('obosit')) {
      return {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `😴 Somnul afectează masiv mood-ul și energia. Văd din datele tale că sunt aspecte de îmbunătățit.\n\n**Sleep Hygiene Tips:**\n🌙 Stop ecrane cu 1h înainte de culcare\n🌡️ Cameră răcoroasă (18-20°C)\n📱 Modul avion sau zona fără telefon\n🎧 Sunete binaurale pentru relaxare\n\n**Rutina de seară ideală:**\n• 21:00 - Ultimul ecran\n• 21:30 - Ceai de mușețel + carte\n• 22:00 - Meditație de 10 min\n• 22:30 - Culcare\n\nVrei să setăm împreună o rutină personalizată?`,
        timestamp: new Date(),
        type: 'insight',
        tags: ['sleep', 'hygiene', 'routine', 'optimization']
      };
    }
    
    // Work/productivity related
    if (lowerMessage.includes('muncă') || lowerMessage.includes('job') || lowerMessage.includes('productiv')) {
      return {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `⚡ Burnout-ul și stresul de la muncă sunt foarte comune. Să analizăm situația ta.\n\n**Red flags burnout:**\n❌ Epuizare constantă\n❌ Detașare emoțională\n❌ Sentimente de ineficiență\n❌ Cicluri vicioase de procrastinare\n\n**Strategii immediate:**\n🎯 Pomodoro Technique (25 min focus + 5 min pauză)\n🚶‍♀️ Walking meetings\n🧘‍♀️ Micro-meditații (2 min între task-uri)\n📝 Boundary setting clar\n\n**Integration PorFlow:** Ecosistemul nostru de productivitate te poate ajuta cu workflow-uri optimizate.\n\nCe aspect te stresează cel mai mult la muncă?`,
        timestamp: new Date(),
        type: 'insight',
        tags: ['work', 'burnout', 'productivity', 'boundaries']
      };
    }
    
    // Relationships
    if (lowerMessage.includes('relații') || lowerMessage.includes('familie') || lowerMessage.includes('prieteni')) {
      return {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `❤️ Relațiile sănătoase sunt fundamentale pentru wellness mental. Să explorăm.\n\n**Tipuri de relații:**\n🌱 **Nutritive:** Te energizează și susțin\n⚡ **Neutre:** Nici bune, nici rele\n🔋 **Toxice:** Îți consumă energia\n\n**Red flags relații toxice:**\n• Criticism constant\n• Manipulation emoțională\n• Lipsa de respectare a boundary-urilor\n• Drama continuă\n\n**Healthy boundaries:**\n✅ \"Nu\" este o propoziție completă\n✅ Nu ești responsabil/ă pentru emoțiile altora\n✅ Self-care nu este egoism\n\nÎmi poți spune despre o relație care te preocupă?`,
        timestamp: new Date(),
        type: 'insight',
        tags: ['relationships', 'boundaries', 'toxicity', 'self-care']
      };
    }
    
    // General supportive response
    return {
      id: crypto.randomUUID(),
      sender: 'ai',
      content: `🌿 Îți mulțumesc că îmi împărtășești asta. Fiecare experiență este validă și importantă.\n\n**Pe baza profilului tău:**\n• Ai parcurs deja ${userProfile.totalSessions} sesiuni de terapie\n• Stilul tău preferat: ${userProfile.preferredTherapyStyle === 'supportive' ? 'Suportiv și empatic' : userProfile.preferredTherapyStyle === 'analytical' ? 'Analitic și structurat' : 'Practic și orientat spre soluții'}\n\nSă explorăm împreună această situație. Ce simți că te-ar ajuta cel mai mult chiar acum?\n\n**Opțiuni:**\n💭 Vorbim despre emoții\n🎯 Găsim soluții practice\n🧘‍♀️ Facem un exercițiu de relaxare`,
      timestamp: new Date(),
      type: 'text',
      tags: ['general', 'supportive', 'exploration']
    };
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Update session metrics
    setCurrentSession(prev => ({
      ...prev,
      messagesExchanged: prev.messagesExchanged + 1
    }));
    
    // Simulate AI thinking time
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(userMessage.content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Update metrics based on response type
      if (aiResponse.type === 'insight') {
        setCurrentSession(prev => ({
          ...prev,
          insightsGenerated: prev.insightsGenerated + 1
        }));
      }
    }, 1500 + Math.random() * 1000); // 1.5-2.5 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const quickPrompts = [
    { text: "Mă simt copleșit/ă astăzi", icon: "😰" },
    { text: "Nu pot să dorm bine", icon: "😴" },
    { text: "Am mult stress la muncă", icon: "💼" },
    { text: "Mă simt trist/ă fără motiv", icon: "😔" },
    { text: "Vreau să îmi îmbunătățesc mood-ul", icon: "🌟" },
    { text: "Am conflicte în relații", icon: "💔" }
  ];

  const startGuidedExercise = (type: string) => {
    const exercises = {
      breathing: {
        title: "🫁 Respirație Ghidată 4-7-8",
        description: "Tehnica perfectă pentru relaxare instantanee",
        duration: "4 minute",
        steps: [
          "Inspiră prin nas 4 secunde",
          "Ține respirația 7 secunde", 
          "Expiră prin gură 8 secunde",
          "Repetă ciclul de 4 ori"
        ]
      },
      grounding: {
        title: "🌍 Exercițiu de Grounding 5-4-3-2-1",
        description: "Pentru a te reconecta cu prezentul",
        duration: "5 minute",
        steps: [
          "5 lucruri pe care le vezi",
          "4 lucruri pe care le atingi",
          "3 lucruri pe care le auzi",
          "2 lucruri pe care le miroși",
          "1 lucru pe care îl guști"
        ]
      },
      mindfulness: {
        title: "🧘‍♀️ Mindfulness Rapid",
        description: "Meditație scurtă pentru claritate mentală",
        duration: "3 minute",
        steps: [
          "Așează-te confortabil",
          "Închide ochii și respiră natural",
          "Observă gândurile fără să le judeci",
          "Focalizează-te pe respirație",
          "Revino ușor la prezent"
        ]
      }
    };
    
    setCurrentExercise(exercises[type as keyof typeof exercises]);
    setShowExerciseModal(true);
  };

  return (
    <div className="ai-therapist">
      {/* Header */}
      <div className="therapy-header">
        <button 
          onClick={() => router.push('/dashboard/por-well')}
          className="back-btn"
        >
          ← Înapoi la PorWell
        </button>
        
        <div className="therapist-info">
          <div className="therapist-avatar">
            <div className="avatar-image">🤖</div>
            <div className="status-indicator"></div>
          </div>
          <div className="therapist-details">
            <h1>Dr. Aria - AI Therapist</h1>
            <p>Specialist în wellness mental • {sessionStarted ? 'În sesiune' : 'Disponibil'}</p>
          </div>
        </div>
        
        {sessionStarted && (
          <div className="session-metrics">
            <div className="metric">
              <span className="metric-value">{formatTime(sessionTimer)}</span>
              <span className="metric-label">Durată</span>
            </div>
            <div className="metric">
              <span className="metric-value">{currentSession.messagesExchanged}</span>
              <span className="metric-label">Mesaje</span>
            </div>
            <div className="metric">
              <span className="metric-value">{currentSession.insightsGenerated}</span>
              <span className="metric-label">Insights</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-container">
        {!sessionStarted ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-avatar">
                <div className="avatar-large">🤖</div>
                <div className="pulse-ring"></div>
              </div>
              
              <h2>Bună, {userProfile.name}! 🌸</h2>
              <p>Sunt Dr. Aria, asistentul tău AI pentru wellness mental. Sunt antrenat să înțeleg emoțiile și să ofer strategii personalizate pentru îmbunătățirea stării tale de bine.</p>
              
              <div className="profile-preview">
                <h3>📊 Profilul tău actual:</h3>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-icon">😊</span>
                    <span className="stat-text">Mood: {userProfile.currentMood}/10</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">📈</span>
                    <span className="stat-text">Trend: {userProfile.moodTrend === 'improving' ? 'Îmbunătățire' : userProfile.moodTrend === 'stable' ? 'Stabil' : 'Scădere'}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">💆‍♀️</span>
                    <span className="stat-text">Stress: {userProfile.stressLevel}/10</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-text">{userProfile.totalSessions} sesiuni complete</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={startSession}
                className="start-session-btn"
              >
                💬 Începe Sesiunea de Terapie
              </button>
              
              <div className="quick-topics">
                <h4>Sau alege un subiect rapid:</h4>
                <div className="topic-grid">
                  {quickPrompts.slice(0, 4).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        startSession();
                        setTimeout(() => {
                          setInputValue(prompt.text);
                          inputRef.current?.focus();
                        }, 1000);
                      }}
                      className="topic-btn"
                    >
                      <span className="topic-icon">{prompt.icon}</span>
                      <span className="topic-text">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="messages-area">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender} ${message.type}`}
                >
                  <div className="message-content">
                    {message.sender === 'ai' && (
                      <div className="message-avatar">🤖</div>
                    )}
                    <div className="message-bubble">
                      <div className="message-text">
                        {message.content.split('\n').map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                      <div className="message-meta">
                        <span className="message-time">
                          {message.timestamp.toLocaleTimeString('ro-RO', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {message.tags && (
                          <div className="message-tags">
                            {message.tags.map((tag, index) => (
                              <span key={index} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {message.sender === 'user' && (
                      <div className="message-avatar user">👤</div>
                    )}
                  </div>
                  
                  {/* Action buttons for AI messages */}
                  {message.sender === 'ai' && message.type === 'insight' && (
                    <div className="message-actions">
                      <button 
                        onClick={() => startGuidedExercise('breathing')}
                        className="action-btn"
                      >
                        🫁 Respirație
                      </button>
                      <button 
                        onClick={() => startGuidedExercise('grounding')}
                        className="action-btn"
                      >
                        🌍 Grounding
                      </button>
                      <button 
                        onClick={() => startGuidedExercise('mindfulness')}
                        className="action-btn"
                      >
                        🧘‍♀️ Mindfulness
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="message ai typing">
                  <div className="message-content">
                    <div className="message-avatar">🤖</div>
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div className="typing-text">Dr. Aria scrie...</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && (
              <div className="quick-prompts">
                <h4>💭 Subiecte populare:</h4>
                <div className="prompts-grid">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(prompt.text)}
                      className="prompt-btn"
                    >
                      <span>{prompt.icon}</span>
                      <span>{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="input-area">
              <div className="input-container">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Scrie despre ce te preocupă sau cum te simți..."
                  className="message-input"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="send-btn"
                >
                  <span>📤</span>
                </button>
              </div>
              
              <div className="input-footer">
                <span className="input-hint">
                  💡 Apasă Enter pentru a trimite, Shift+Enter pentru linie nouă
                </span>
                <span className="safety-note">
                  🔒 Conversația este confidențială și securizată
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Guided Exercise Modal */}
      {showExerciseModal && currentExercise && (
        <div className="exercise-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentExercise.title}</h3>
              <button 
                onClick={() => setShowExerciseModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="exercise-description">{currentExercise.description}</p>
              <div className="exercise-duration">⏱️ Durată estimată: {currentExercise.duration}</div>
              
              <div className="exercise-steps">
                <h4>Pașii exercițiului:</h4>
                <ol>
                  {currentExercise.steps.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setShowExerciseModal(false);
                    setCurrentSession(prev => ({
                      ...prev,
                      exercisesCompleted: prev.exercisesCompleted + 1
                    }));
                    // Add completion message
                    const completionMessage: Message = {
                      id: crypto.randomUUID(),
                      sender: 'ai',
                      content: `🎉 Felicitări! Ai completat exercițiul "${currentExercise.title}". Cum te simți acum? Observi vreo diferență în nivelul de relaxare?`,
                      timestamp: new Date(),
                      type: 'insight',
                      tags: ['exercise-completion', 'feedback']
                    };
                    setMessages(prev => [...prev, completionMessage]);
                  }}
                  className="complete-btn"
                >
                  ✅ Am Terminat Exercițiul
                </button>
                <button 
                  onClick={() => setShowExerciseModal(false)}
                  className="cancel-btn"
                >
                  Închide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}