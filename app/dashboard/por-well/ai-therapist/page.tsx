'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface UserData {
  mood: {
    entries: Array<{ mood: string; date: string; notes?: string }>;
    currentMood?: string;
  };
  meditation: {
    totalMinutes: number;
    streakDays: number;
    totalSessions: number;
  };
  sleep: {
    averageScore: number;
    lastNight?: number;
  };
  stress: {
    currentLevel: number;
    totalSessions: number;
    reductionPercentage: number;
  };
  journal: {
    totalEntries: number;
    dominantEmotion?: string;
  };
}

export default function AITherapistPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    mood: { entries: [] },
    meditation: { totalMinutes: 0, streakDays: 0, totalSessions: 0 },
    sleep: { averageScore: 0 },
    stress: { currentLevel: 5, totalSessions: 0, reductionPercentage: 0 },
    journal: { totalEntries: 0 }
  });
  const [conversationStarted, setConversationStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserData = async () => {
    try {
      // TODO: Replace with actual Xano API calls
      const mockData: UserData = {
        mood: {
          entries: [
            { mood: 'good', date: '2025-06-19', notes: 'Felt productive today' },
            { mood: 'excellent', date: '2025-06-18', notes: 'Great workout' }
          ],
          currentMood: 'good'
        },
        meditation: {
          totalMinutes: 180,
          streakDays: 12,
          totalSessions: 23
        },
        sleep: {
          averageScore: 8.2,
          lastNight: 8.5
        },
        stress: {
          currentLevel: 3,
          totalSessions: 15,
          reductionPercentage: 20
        },
        journal: {
          totalEntries: 23,
          dominantEmotion: 'optimism'
        }
      };
      
      setUserData(mockData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const startConversation = () => {
    setConversationStarted(true);
    const greeting = getPersonalizedGreeting();
    addMessage('ai', greeting);
  };

  const getPersonalizedGreeting = (): string => {
    let greeting = "Bună! Sunt Dr. Aria și sunt aici să te ajut cu wellness-ul mental. ";
    
    if (userData.mood.entries && userData.mood.entries.length > 0) {
      const lastMood = userData.mood.entries[userData.mood.entries.length - 1];
      greeting += `Văd că mood-ul tău recent a fost ${lastMood.mood}. `;
    }
    
    if (userData.meditation.streakDays > 7) {
      greeting += `Felicitări pentru streak-ul de ${userData.meditation.streakDays} zile la meditație! `;
    }
    
    if (userData.sleep.averageScore > 8) {
      greeting += `Somnul tău a fost excelent recent - aceasta îți susține wellness-ul mental. `;
    }
    
    greeting += "Cum te simți astăzi și cu ce te pot ajuta?";
    
    return greeting;
  };

  const addMessage = (sender: 'ai' | 'user', text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMessage = inputValue.trim();
    addMessage('user', userMessage);
    setInputValue('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Show typing indicator and generate AI response
    setIsTyping(true);
    
    try {
      const response = await generateAIResponse(userMessage);
      setTimeout(() => {
        setIsTyping(false);
        addMessage('ai', response);
      }, 1500 + Math.random() * 1000);
    } catch (error) {
      setIsTyping(false);
      addMessage('ai', 'Îmi pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou.');
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // TODO: Replace with actual OpenRouter API call
    // For now, using intelligent pattern matching based on user data
    
    const message = userMessage.toLowerCase();
    
    if (message.includes('mood') || message.includes('simt')) {
      return generateMoodResponse(message);
    } else if (message.includes('somn') || message.includes('dormit')) {
      return generateSleepResponse(message);
    } else if (message.includes('stres') || message.includes('anxio')) {
      return generateStressResponse(message);
    } else if (message.includes('jurnal') || message.includes('emotion')) {
      return generateJournalResponse(message);
    } else if (message.includes('meditati') || message.includes('mindfulness')) {
      return generateMeditationResponse(message);
    } else if (message.includes('plan') || message.includes('recomand')) {
      return generateRecommendationResponse(message);
    } else if (message.includes('ajutor') || message.includes('greu')) {
      return generateSupportResponse(message);
    } else {
      return generateGeneralResponse(message);
    }
  };

  const generateMoodResponse = (message: string): string => {
    const moodData = userData.mood;
    let response = "În legătură cu mood-ul tău, ";
    
    if (moodData.entries && moodData.entries.length > 0) {
      const recentMoods = moodData.entries.slice(-7);
      const moodValues = { excellent: 5, good: 4, neutral: 3, low: 2, poor: 1 };
      const avgMood = recentMoods.reduce((sum, entry) => {
        return sum + (moodValues[entry.mood as keyof typeof moodValues] || 3);
      }, 0) / recentMoods.length;
      
      if (avgMood >= 4) {
        response += "observ că ai avut un trend pozitiv în ultima săptămână! Aceasta arată că strategiile tale de wellness funcționează. ";
      } else if (avgMood >= 3) {
        response += "ai avut un mood echilibrat, cu ups and downs normale. ";
      } else {
        response += "observ că ai trecut prin momente mai dificile recent. Este important să fii blând cu tine însuți. ";
      }
      
      response += `\n\nPattern-urile tale sugerează că mood-ul tău este influențat pozitiv de meditațiile regulate. Vrei să explorăm modalități de optimizare a mood-ului?`;
    } else {
      response += "îți recomand să începi să îți trackuiești mood-ul zilnic. Aceasta îți va oferi insights valoroase despre pattern-urile emoționale.";
    }
    
    return response;
  };

  const generateSleepResponse = (message: string): string => {
    const sleepData = userData.sleep;
    let response = "În privința somnului tău, ";
    
    if (sleepData.averageScore) {
      if (sleepData.averageScore >= 8) {
        response += "ai o calitate excelentă! Aceasta susține direct wellness-ul tău mental și mood-ul pozitiv. ";
      } else if (sleepData.averageScore >= 6) {
        response += "este decent, dar există spațiu pentru îmbunătățire. ";
      } else {
        response += "pare să necesite atenție. Somnul de calitate este fundamental pentru echilibrul emoțional. ";
      }
      
      response += `\n\nPe baza datelor tale, recomand să stabilești un ritual de relaxare cu 30 min înainte de culcare. Aceasta va avea un impact pozitiv asupra mood-ului și energiei zilnice.`;
    } else {
      response += "îți sugerez să începi să îți monitorizezi pattern-urile de somn. Sleep tracking-ul te va ajuta să identifici factorii care îți afectează odihna.";
    }
    
    return response;
  };

  const generateStressResponse = (message: string): string => {
    const stressData = userData.stress;
    let response = "Pentru gestionarea stresului, ";
    
    if (stressData.totalSessions > 0) {
      response += `văd că ai completat ${stressData.totalSessions} sesiuni de stress management - felicitări pentru consistență! `;
      
      if (stressData.reductionPercentage > 15) {
        response += `Reducerea de ${stressData.reductionPercentage}% în nivelul de stres este impresionantă. `;
      }
      
      response += `\n\nTehnicile care par să funcționeze cel mai bine pentru tine sunt breathing exercises și progressive relaxation. Recomand să practici box breathing de 5 minute zilnic pentru menținerea acestui progres.`;
    } else {
      response += "îți recomand să începi cu tehnici simple de respirație. Box breathing este foarte eficient pentru calm instant în momentele stresante.";
    }
    
    return response;
  };

  const generateJournalResponse = (message: string): string => {
    const journalData = userData.journal;
    let response = "Jurnalul tău emoțional ";
    
    if (journalData.totalEntries > 0) {
      response += `cu ${journalData.totalEntries} intrări este o practică excelentă pentru autocunoaștere! `;
      
      if (journalData.dominantEmotion) {
        response += `Observ că emoția dominantă este '${journalData.dominantEmotion}', ceea ce îmi oferă insight-uri despre pattern-urile tale emoționale. `;
      }
      
      response += `\n\nJournaling-ul consistent îți dezvoltă inteligența emoțională și îți oferă claritate în procesele interne. Continuă să explorezi pattern-urile emoționale - aceasta îți va aduce self-awareness profund.`;
    } else {
      response += "ar fi o adăugire valoroasă la rutina ta de wellness. Scrierea despre emoții și experiențe zilnice îți poate aduce claritate și vindecare emoțională.";
    }
    
    return response;
  };

  const generateMeditationResponse = (message: string): string => {
    const meditationData = userData.meditation;
    let response = "În privința meditației, ";
    
    if (meditationData.totalMinutes > 0) {
      response += `ai acumulat ${meditationData.totalMinutes} minute de practică - aceasta este o fundație solidă pentru peace of mind! `;
      
      if (meditationData.streakDays > 7) {
        response += `Streak-ul de ${meditationData.streakDays} zile arată o dedicare admirabilă. `;
      }
      
      response += `\n\nPracticile regulate de mindfulness îți reduc cortizolul și îți îmbunătățesc focus-ul. Recomand să continui cu mindfulness de dimineață pentru setarea intenției zilei.`;
    } else {
      response += "ar fi perfect să începi cu sesiuni scurte de 5-10 minute. Mindfulness-ul este una dintre cele mai eficiente modalități de a-ți calma mintea.";
    }
    
    return response;
  };

  const generateRecommendationResponse = (message: string): string => {
    let response = "Pe baza analizei complete a datelor tale de wellness, iată recomandările mele personalizate:\n\n";
    
    const recommendations = [];
    
    if (userData.mood.entries && userData.mood.entries.length > 0) {
      const recentMood = userData.mood.entries[userData.mood.entries.length - 1];
      if (recentMood.mood === 'poor' || recentMood.mood === 'low') {
        recommendations.push("🌟 Prioritizează activități care îți ridică mood-ul: exerciții în aer liber, muzică preferată, conexiuni sociale");
      }
    }
    
    if (!userData.meditation.totalMinutes || userData.meditation.totalMinutes < 50) {
      recommendations.push("🧘 Integrează 10 minute de meditație zilnică - aceasta va avea impact major asupra tuturor aspectelor wellness-ului");
    }
    
    if (!userData.sleep.averageScore || userData.sleep.averageScore < 7) {
      recommendations.push("💤 Optimizează rutina de somn: orar fix, fără ecrane cu 1h înainte de culcare, temperatură 18-20°C");
    }
    
    if (!userData.stress.totalSessions || userData.stress.currentLevel > 6) {
      recommendations.push("💊 Practică tehnici de stress management zilnic: box breathing de 5 minute dimineața și seara");
    }
    
    recommendations.push("📝 Continuă jurnaling-ul pentru procesarea emoțiilor și dezvoltarea autocompasiunii");
    
    response += recommendations.join('\n\n');
    response += '\n\nVrei să discutăm în detaliu implementarea acestor recomandări?';
    
    return response;
  };

  const generateSupportResponse = (message: string): string => {
    const supportResponses = [
      "Înțeleg că treci prin momente dificile. Datele tale arată progres chiar și când nu simți aceasta - ești mai puternic decât crezi.",
      "Este normal să ai ups and downs în journey-ul de wellness mental. Faptul că cauți activ suport și practici self-care arată curaj.",
      "Momentele grele fac parte din procesul de creștere. Analiza ta de wellness arată că ai instrumentele necesare să treci prin aceasta.",
      "Ești pe drumul cel bun, chiar dacă uneori nu se simte așa. Să explorăm împreună tehnici care te pot susține în această perioadă."
    ];
    
    const randomResponse = supportResponses[Math.floor(Math.random() * supportResponses.length)];
    const practicalAdvice = "Încearcă tehnica 5-4-3-2-1 când te simți copleșit: 5 lucruri pe care le vezi, 4 pe care le atingi, 3 pe care le auzi, 2 pe care le miroși, 1 pe care îl guști.";
    
    return `${randomResponse}\n\n${practicalAdvice}`;
  };

  const generateGeneralResponse = (message: string): string => {
    const generalResponses = [
      "Aceasta este o întrebare interesantă! Pe baza pattern-urilor tale de wellness, pot să îți ofer o perspectivă personalizată.",
      "Să analizez datele tale pentru a-ți oferi cel mai relevant răspuns la această situație.",
      "Din experiența mea ca AI therapist și bazându-mă pe progress-ul tău în PorWell, iată ce observ...",
      "Perfect că îmi aduci această întrebare! Să explorăm împreună această temă prin prisma wellness-ului tău personal."
    ];
    
    const randomResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    const insight = "Wellness-ul mental este un proces continuu, nu o destinație. Fiecare mic pas contează.";
    
    return `${randomResponse}\n\n${insight}`;
  };

  const askTopic = (topic: string) => {
    setInputValue(topic);
    // Auto-focus textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
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

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  const getMoodDisplay = () => {
    if (!userData.mood.currentMood) return "😐 Neutru";
    
    const moodEmojis = {
      excellent: '😄 Excelent',
      good: '😊 Bun',
      neutral: '😐 Neutru',
      low: '😔 Scăzut',
      poor: '😢 Prost'
    };
    
    return moodEmojis[userData.mood.currentMood as keyof typeof moodEmojis] || "😐 Neutru";
  };

  const getStressLevel = () => {
    const level = userData.stress.currentLevel;
    if (level <= 3) return 'Scăzut';
    if (level <= 6) return 'Moderat';
    return 'Ridicat';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-transparent to-cyan-500/10 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/por-well')}
            className="mb-4 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold hover:bg-purple-500 hover:border-purple-500 transition-all duration-300"
          >
            ← Înapoi la Dashboard
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              🤖 AI Therapist
            </h1>
            <p className="text-gray-300 text-lg">
              Coaching personal bazat pe datele tale de wellness mental
            </p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Area */}
          <div className="lg:col-span-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div>
                  <h3 className="text-xl font-bold">Dr. Aria - AI Therapist</h3>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Online • Pregătit să te ajute
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {!conversationStarted ? (
                <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-xl p-6 text-center">
                  <h4 className="text-xl font-semibold text-purple-400 mb-3">👋 Bună! Sunt Dr. Aria</h4>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    Sunt asistentul tău AI pentru wellness mental. Am analizat datele tale din PorWell 
                    și sunt gata să îți ofer coaching personalizat bazat pe mood-ul tău, somnul, 
                    meditațiile și jurnalul emoțional.
                  </p>
                  <button
                    onClick={startConversation}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    💬 Începe Conversația
                  </button>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[80%] p-4 rounded-xl animate-fadeInUp ${
                        message.sender === 'ai'
                          ? 'bg-purple-500/10 border border-purple-500/30 self-start rounded-bl-sm'
                          : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white self-end ml-auto rounded-br-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      <div className="text-xs opacity-70 mt-2">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="max-w-[80%] p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl rounded-bl-sm self-start">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/20 bg-white/5">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Scrie-mi despre cum te simți sau întreabă-mă orice despre wellness-ul tău mental..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    rows={1}
                    style={{ minHeight: '50px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Trimite
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wellness Summary */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-purple-400 mb-4 text-center">📊 Sumarul Tău Wellness</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Mood Actual</span>
                  <span className="text-purple-400 font-semibold">{getMoodDisplay()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Calitate Somn</span>
                  <span className="text-purple-400 font-semibold">{userData.sleep.averageScore}/10</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Nivel Stres</span>
                  <span className="text-purple-400 font-semibold">{getStressLevel()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Zile Meditație</span>
                  <span className="text-purple-400 font-semibold">{userData.meditation.streakDays}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Intrări Jurnal</span>
                  <span className="text-purple-400 font-semibold">{userData.journal.totalEntries}</span>
                </div>
              </div>
            </div>

            {/* Quick Topics */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-purple-400 mb-4 text-center">💡 Subiecte Rapide</h3>
              <div className="space-y-2">
                {[
                  'Cum îmi pot îmbunătăți mood-ul astăzi?',
                  'De ce am dormit prost săptămâna aceasta?',
                  'Ce tehnici de stress îmi recomandai?',
                  'Analiza pattern-urilor mele emoționale',
                  'Planul meu de wellness pentru săptămâna viitoare'
                ].map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => askTopic(topic)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-left text-sm text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 transition-all duration-300"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Capabilities */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-purple-400 mb-4 text-center">🧠 Ce Pot Face</h3>
              <div className="space-y-3">
                {[
                  { icon: '📈', text: 'Analizez pattern-urile tale de mood și somn' },
                  { icon: '💡', text: 'Ofer insights personalizate bazate pe datele tale' },
                  { icon: '🎯', text: 'Recomand tehnici specifice pentru situația ta' },
                  { icon: '📅', text: 'Creez planuri personalizate de wellness' },
                  { icon: '🤝', text: 'Ofer suport empatic 24/7' }
                ].map((capability, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-lg">{capability.icon}</span>
                    <span className="text-gray-300 text-sm leading-relaxed">{capability.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}