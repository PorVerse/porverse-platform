// components/ai-chat/AIChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AIChat.module.css'; // ✅ FIXED: .module.css

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  ecosystem?: string;
  suggestions?: string[];
}

interface EcosystemContext {
  id: string;
  name: string;
  personality: string;
  color: string;
  icon: string;
  expertise: string[];
  greeting: string;
  suggestions: string[];
}

const ecosystemContexts: Record<string, EcosystemContext> = {
  'por-health': {
    id: 'por-health',
    name: 'Dr. Vita',
    personality: 'Energic, empatic, expert în sănătate holistică și optimizare fizică',
    color: '#10b981',
    icon: '🌿',
    expertise: ['nutriție', 'fitness', 'sleep', 'biohacking', 'supplements'],
    greeting: 'Salut! Sunt Dr. Vita, expertul tău AI în sănătate și fitness. Cum te pot ajuta să îți optimizezi fizicul și energia astăzi?',
    suggestions: [
      'Creează-mi un plan de nutriție personalizat',
      'Ce antrenament e perfect pentru mine azi?',
      'Analizează somnul meu și oferă sfaturi',
      'Ce suplimente îmi recomanzi?'
    ]
  },
  'por-kids': {
    id: 'por-kids',
    name: 'Profesor Alex',
    personality: 'Prietenos, răbdător, expert în educație și dezvoltare copii',
    color: '#ec4899',
    icon: '👶',
    expertise: ['educație', 'dezvoltare copii', 'homework', 'family', 'learning'],
    greeting: 'Bună ziua! Sunt Profesor Alex, asistentul tău pentru educația copiilor. Cu ce te pot ajuta pentru micuțul tău?',
    suggestions: [
      'Ajută-mă cu tema la matematică',
      'Strategii pentru motivarea copilului',
      'Planificare rutină zilnică familie',
      'Jocuri educative pentru vârsta lui'
    ]
  },
  'por-mind': {
    id: 'por-mind',
    name: 'Warren AI',
    personality: 'Analitic, strategic, expert în finanțe și wealth building',
    color: '#3b82f6',
    icon: '🧠',
    expertise: ['investiții', 'budgeting', 'financial planning', 'money mindset', 'taxes'],
    greeting: 'Salutare! Sunt Warren AI, consultantul tău financiar personal. Să construim împreună libertatea ta financiară!',
    suggestions: [
      'Analizează bugetul meu și oferă sfaturi',
      'Strategia mea de investiții pentru 2025',
      'Cum îmi optimizez taxele?',
      'Plan pentru independența financiară'
    ]
  },
  'por-well': {
    id: 'por-well',
    name: 'Dr. Serena',
    personality: 'Empatic, calm, expert în mental wellness și echilibru emotional',
    color: '#8b5cf6',
    icon: '🌻',
    expertise: ['mental health', 'mindfulness', 'anxiety', 'meditation', 'emotional intelligence'],
    greeting: 'Namaste! Sunt Dr. Serena, ghidul tău pentru wellness mental. Să explorăm împreună calea către echilibrul interior.',
    suggestions: [
      'Ajută-mă să îmi gestionez anxietatea',
      'Ghidaj de meditație pentru începători',
      'Analizează starea mea emoțională',
      'Tehnici de relaxare pentru stress'
    ]
  },
  'por-flow': {
    id: 'por-flow',
    name: 'FlowMaster Pro',
    personality: 'Eficient, motivant, expert în productivitate și time management',
    color: '#06b6d4',
    icon: '🌊',
    expertise: ['productivitate', 'time management', 'focus', 'workflow', 'goals'],
    greeting: 'Salut! Sunt FlowMaster Pro, expertul tău în productivitate maximă. Să îți optimizez timpul și energia pentru rezultate extraordinare!',
    suggestions: [
      'Optimizează-mi rutina zilnică',
      'Plan de time blocking pentru săptămâna asta',
      'Cum să îmi cresc focusul și concentrarea?',
      'Automatizări pentru workflow-ul meu'
    ]
  },
  'por-blu': {
    id: 'por-blu',
    name: 'Strategic Sage',
    personality: 'Vizionar, înțelept, expert în leadership și planificare strategică',
    color: '#f59e0b',
    icon: '💧',
    expertise: ['strategic planning', 'leadership', 'vision', 'legacy', 'coaching'],
    greeting: 'Bună ziua! Sunt Strategic Sage, mentorul tău pentru leadership și planificare strategică. Să construim împreună viziunea ta de viitor!',
    suggestions: [
      'Ajută-mă să îmi definesc viziunea pe 10 ani',
      'Strategii de leadership pentru echipa mea',
      'Planificare legacy și impact social',
      'Framework pentru luarea deciziilor importante'
    ]
  }
};

// Mock AI responses pentru fiecare ecosistem
const ecosystemMockResponses: Record<string, string[]> = {
  'por-health': [
    'Bazat pe profilul tău, îți recomand să începi ziua cu 500ml apă + o lingură ulei MCT pentru energie susținută. Micul dejun ideal: omletă cu spanac + avocado + nuci.',
    'Pentru antrenament: 45 min strength training + 15 min HIIT. Focusează-te pe compound movements: squats, deadlifts, pull-ups. Recovery: 48h între sesiuni intensive.',
    'Somnul tău se poate optimiza prin: camera la 18-19°C, blackout complet, magneziu înainte de culcare, și 90 min înainte să oprești screenurile.',
    'Suplimente esențiale pentru tine: Vitamina D3+K2, Omega-3 EPA/DHA, magnesium bisglicinat, și B-complex. Testează înainte să adaugi altele.'
  ],
  'por-kids': [
    'Pentru matematică: folosește metoda vizuală cu obiecte concrete, apoi treci la abstract. Gamification funcționează excelent - fă din fiecare problemă o "misiune".',
    'Motivația copilului crește prin: rutină clară, reward system bazat pe efort (nu rezultat), și 15 min "special time" zilnic doar pentru el.',
    'Rutina perfectă: trezire 7:00, breakfast în familie, 30 min natură, learning blocks de 45 min cu 15 min pauză, și ritual de seară cu citit împreună.',
    'Jocuri educative pe vârste: 5-7 ani pattern blocks și tangram, 8-10 ani coding unplugged și experimente simple, 11+ robotics și proiecte STEAM.'
  ],
  'por-mind': [
    'Bugetul tău: 50/30/20 rule - 50% necesități, 30% wants, 20% savings+investments. Track-uiește totul 30 zile să vezi realitatea, apoi optimizează.',
    'Strategie investiții 2025: 70% index funds low-cost (VTI/VTIAX), 20% bonds (TLT), 10% individual stocks cu research solid. DCA lunar, nu time market.',
    'Optimizare taxe: maximizează contributions la 401k și IRA, folosește tax-loss harvesting, și consideră Roth conversions în anii cu income mai mic.',
    'Independența financiară: calculează FI number (25x annual expenses), crește income cu skills, reduce expenses fără să îți afectezi fericirea, investește diferența consistent.'
  ],
  'por-well': [
    'Pentru anxietate: tehnica 5-4-3-2-1 (5 lucruri văzute, 4 simțite, 3 auzite, 2 mirosuri, 1 gust). Respirație în 4-7-8 counts. Progress, nu perfection.',
    'Meditație început: start cu 5 min/zi, app-ul Insight Timer e gratuit și excelent. Focusează-te pe breath awareness, nu gânduri. Consistency beats duration.',
    'Starea emoțională se îmbunătățește prin: jurnal zilnic 3 gratitudes, exercițiu fizic (chiar 10 min walk), sleep hygiene, și limitarea news/social media.',
    'Stress management: identifcă triggerii, practică assertiveness, boundaries clare cu timpul tău, și self-compassion când greșești. Tu ești enough.'
  ],
  'por-flow': [
    'Rutina optimă: morning routine 60 min (exercise, meditation, planning), time blocks de 90 min pentru deep work, breaks de 15 min, și evening review 10 min.',
    'Time blocking strict cu alarme: 9-10:30 deep work #1, 10:30-10:45 break, 10:45-12:15 deep work #2, 12:15-13:15 lunch, apoi repeat. Phone în modul airplane.',
    'Focus maxim: regula 2 minute pentru task-uri mici, Pomodoro pentru medium tasks, și time blocking pentru proiecte mari. Elimină multitasking complet.',
    'Automatizări: email templates pentru răspunsuri frecvente, IFTTT pentru rutine digitale, și batch processing pentru task-uri similare. Work smarter, not harder.'
  ],
  'por-blu': [
    'Viziunea 10 ani: scrie 3 paragrafe despre impactul ideal, valorile fundamentale, și legacy-ul dorit. Review lunar și ajustează. Vision drives decisions.',
    'Leadership autentic: ascultă mai mult decât vorbești, fă întrebări puternice, oferă feedback constructiv, și dezvoltă oamenii în jurul tău. Lead by example.',
    'Legacy planning: ce problemă rezolvi pentru lume? Ce sistem creezi care să te supraviețuiască? Ce lideri dezvolți? Impact > income.',
    'Decizii strategice: framework-ul 10-10-10 (cum mă voi simți în 10 min, 10 luni, 10 ani?), plus consilieri de încredere și time pentru reflection.'
  ]
};

interface AIChatProps {
  ecosystem: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function AIChat({ ecosystem, isOpen, onToggle, className }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const context = ecosystemContexts[ecosystem] || ecosystemContexts['por-health'];

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      // Send greeting message when chat opens for the first time
      setTimeout(() => {
        addAIMessage(context.greeting, context.suggestions);
        setHasGreeted(true);
      }, 500);
    }
  }, [isOpen, hasGreeted, context]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      ecosystem
    };
    setMessages(prev => [...prev, message]);
  };

  const addAIMessage = (content: string, suggestions?: string[]) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date(),
      ecosystem,
      suggestions
    };
    setMessages(prev => [...prev, message]);
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const responses = ecosystemMockResponses[ecosystem] || ecosystemMockResponses['por-health'];
    
    // Simple keyword matching for more relevant responses
    const keywords = userMessage.toLowerCase();
    let selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    if (ecosystem === 'por-health') {
      if (keywords.includes('nutriție') || keywords.includes('mâncare') || keywords.includes('alimentație')) {
        selectedResponse = responses[0];
      } else if (keywords.includes('antrenament') || keywords.includes('exercițiu') || keywords.includes('fitness')) {
        selectedResponse = responses[1];
      } else if (keywords.includes('somn') || keywords.includes('odihnă') || keywords.includes('sleep')) {
        selectedResponse = responses[2];
      } else if (keywords.includes('suplimente') || keywords.includes('vitamine')) {
        selectedResponse = responses[3];
      }
    }
    
    return selectedResponse;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    addUserMessage(userMessage);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage);
      addAIMessage(aiResponse, context.suggestions);
    } catch (error) {
      addAIMessage('Ne pare rău, a apărut o eroare tehnică. Te rog să încerci din nou.', context.suggestions);
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

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <div className={`${styles.chatToggle} ${className || ''}`} onClick={onToggle}>
        <div className={styles.toggleIcon} style={{ color: context.color }}>
          {context.icon}
        </div>
        <div className={styles.toggleText}>
          <strong>{context.name}</strong>
          <span>Întreabă-mă orice!</span>
        </div>
        <div className={styles.pulseDot}></div>
      </div>
    );
  }

  return (
    <div className={`${styles.chatContainer} ${className || ''}`}>
      <div className={styles.chatHeader} style={{ borderTopColor: context.color }}>
        <div className={styles.headerLeft}>
          <div className={styles.aiAvatar} style={{ backgroundColor: context.color }}>
            {context.icon}
          </div>
          <div className={styles.aiInfo}>
            <strong className={styles.aiName}>{context.name}</strong>
            <span className={styles.aiStatus}>
              {isTyping ? 'Scrie...' : 'Online'}
            </span>
          </div>
        </div>
        <button onClick={onToggle} className={styles.closeButton}>
          ✕
        </button>
      </div>

      <div className={styles.chatMessages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${message.type === 'user' ? styles.userMessage : styles.aiMessage}`}
          >
            <div className={styles.messageContent}>
              {message.content}
            </div>
            <span className={styles.messageTime}>
              {formatTime(message.timestamp)}
            </span>
            
            {message.type === 'ai' && message.suggestions && (
              <div className={styles.suggestions}>
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={styles.suggestionChip}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className={`${styles.message} ${styles.ai}`}>
            <div className={styles.typingIndicator}>
              <span>{context.name} scrie</span>
              <div className={styles.typingDots}>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInput}>
        <div className={styles.inputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Întreabă pe ${context.name}...`}
            className={styles.messageInput}
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={styles.sendButton}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}