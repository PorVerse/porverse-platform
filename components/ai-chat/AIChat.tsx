// components/ai-chat/AIChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AIChat.css';

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
      'Ajută-mă să gestionez anxietatea',
      'Tehnici de meditație pentru începători',
      'Analizează starea mea emoțională',
      'Strategii pentru mai multă liniște'
    ]
  },
  'por-flow': {
    id: 'por-flow',
    name: 'Nova Productivity',
    personality: 'Energic, eficient, expert în productivitate și optimizare temporală',
    color: '#06b6d4',
    icon: '🌊',
    expertise: ['productivity', 'time management', 'focus', 'workflows', 'automation'],
    greeting: 'Hey! Sunt Nova, expertul tău în productivitate maximă. Să transformăm timpul tău în rezultate extraordinare!',
    suggestions: [
      'Optimizează-mi programul zilnic',
      'Tehnici pentru focus profund',
      'Automatizări pentru workflow-ul meu',
      'Cum să fiu mai eficient la lucru?'
    ]
  },
  'por-blu': {
    id: 'por-blu',
    name: 'Maestro Visionari',
    personality: 'Înțelept, strategic, expert în leadership și planificare pe termen lung',
    color: '#f59e0b',
    icon: '💧',
    expertise: ['strategic planning', 'leadership', 'vision', 'legacy', 'executive coaching'],
    greeting: 'Bună ziua! Sunt Maestro Visionari, arhitectul visiunii tale de viitor. Să construim împreună drumul către moștenirea ta!',
    suggestions: [
      'Ajută-mă să îmi clarific viziunea',
      'Strategia mea pe următorii 10 ani',
      'Dezvoltarea abilităților de leadership',
      'Cum îmi construiesc legacy-ul?'
    ]
  }
};

const mockAIResponses = {
  'por-health': [
    'Pe baza profilului tău, îți recomand să începi ziua cu un smoothie verde bogat în antioxidanți. Adaugă spanac, măr verde, ghimbir și proteină pudră.',
    'Antrenamentul ideal pentru tine astăzi: 20 min HIIT + 15 min stretching. Corpul tău are nevoie de mișcare intensă, dar și de recuperare.',
    'Analiza somnului tău arată că adormi greu. Încearcă rutina 3-2-1: fără mâncare cu 3h înainte, fără lichide cu 2h înainte, fără ecrane cu 1h înainte.',
    'Pentru optimizarea energiei, îți recomand: Vitamina D3+K2 dimineața, Magnesium seara, și Omega-3 la prânz. Toate pe stomacul plin.'
  ],
  'por-kids': [
    'Pentru tema la matematică, să folosim metoda vizuală! Desenăm problemele și le transformăm în povești. Copiii învață mai bine prin joc.',
    'Motivația copilului crește prin recompense neromanțate: timp de calitate împreună, alegerea activității weekend-ului, sau o aventură mică în natură.',
    'Rutina ideală pentru copil: trezire la aceeași oră, mic dejun împreună, timp de joacă liber, activitate creativă, apoi homework cu pauze de 15 min.',
    'Jocuri educative pentru vârsta lui: puzzle-uri cu hărți, experimente de bucătărie (măsurat ingrediente), și povestit cu schimbat rolurile personajelor.'
  ],
  'por-mind': [
    'Analiza bugetului tău arată că poți economisi 23% prin optimizarea abonamentelor. Anulează 3 servicii nefolosite și redirecționează banii către investiții.',
    'Strategia 2025: 40% ETF-uri diversificate, 30% acțiuni tech blue-chip, 20% real estate REITs, 10% crypto (Bitcoin/Ethereum). Rebalansează trimestrial.',
    'Pentru optimizarea taxelor: maximizează contribuțiile la pensie privată, ține evidența cheltuielilor deductibile, și consideră investițiile pe termen lung pentru impozitare redusă.',
    'Planul tău către independența financiară: economisește 25% din venit, investește consistent, creează 2-3 surse de venit pasiv. Target: 25x cheltuielile anuale.'
  ],
  'por-well': [
    'Pentru gestionarea anxietății, practică tehnica 4-7-8: inspiră 4 secunde, ține respirația 7 secunde, expiră 8 secunde. Repetă de 4 ori, de 3 ori pe zi.',
    'Meditația pentru începători: începe cu 5 minute zilnic. Concentrează-te pe respirație, fără să judeci gândurile care apar. Ele sunt normale și temporare.',
    'Starea ta emoțională indică stres moderat. Recomand: plimbări în natură, jurnalul de recunoștință seara, și tehnici de mindfulness în activitățile zilnice.',
    'Pentru mai multă liniște: creează spații sacre în casă, practică detox digital 1h/zi, și învață să spui "nu" fără vinovăție. Limitele sănătoase aduc pace.'
  ],
  'por-flow': [
    'Programul tău optimal: Deep work 9-11 AM (energia maximă), taskuri administrative 2-4 PM, creative work 7-9 PM. Time blocking strict cu alarme.',
    'Pentru focus profund: tehnica Pomodoro modificată - 90 min work intensiv, 20 min pauză completă. Phone în modul airplane, notificări oprite complet.',
    'Automatizări pentru tine: email templates pentru răspunsuri frecvente, schedulare sociale media cu Buffer, și task automation cu Zapier pentru rutinele repetitive.',
    'Eficiența ta crește cu: batching taskurilor similare, regula 2 minute (dacă durează sub 2 min, fă acum), și GTD system pentru mental clarity.'
  ],
  'por-blu': [
    'Viziunea ta trebuie să răspundă la: Ce impact vrei să ai? Ce problemă rezolvi pentru lume? Ce moștenire lași? Scrie 3 paragrafe, revizuiește lunar.',
    'Strategia pe 10 ani: Anul 1-2 construiești fundația, 3-5 scalezi sistemele, 6-8 optimizezi și automatizezi, 9-10 construiești legacy-ul și mentorezi.',
    'Leadership-ul se dezvoltă prin: feedback 360°, mentoring altor lideri, citit biografii de lideri, și practica empației active în toate interacțiunile.',
    'Legacy-ul tău se construiește zilnic prin: deciziile etice pe care le iei, oamenii pe care îi influențezi pozitiv, și sistemele care te vor supraviețui.'
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

  const generateAIResponse = async (userMessage: string): Promise<{ content: string; suggestions: string[] }> => {
    // Mock AI response logic - în realitate ai folosi OpenAI/Claude API
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const responses = mockAIResponses[ecosystem as keyof typeof mockAIResponses] || mockAIResponses['por-health'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Generate contextual suggestions based on user input
    const suggestions = generateSuggestions(userMessage, ecosystem);
    
    return {
      content: randomResponse,
      suggestions
    };
  };

  const generateSuggestions = (userMessage: string, ecosystem: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    
    const suggestionMap: Record<string, Record<string, string[]>> = {
      'por-health': {
        'nutriție': ['Ce să mănânc pentru mai multă energie?', 'Plan de masă pentru pierdere în greutate', 'Suplimente pentru imunitate'],
        'antrenament': ['Exerciții pentru acasă', 'Program cardio pentru început', 'Stretching pentru birou'],
        'somn': ['Rutina de seară perfectă', 'Cum să adorm mai repede?', 'Optimizarea camerei de dormit'],
        'default': ['Cum să îmi măsor progresul?', 'Sfaturi pentru hidratare', 'Alimente anti-inflamatorii']
      },
      'por-mind': {
        'buget': ['Aplicații pentru tracking cheltuieli', 'Cum să economisesc 1000 RON/lună', 'Planul 50/30/20'],
        'investiții': ['Primul meu portofoliu de investiții', 'ETF-uri vs acțiuni individuale', 'Investiții în crypto'],
        'default': ['Cum să îmi negociez salariul?', 'Planul de pensionare', 'Investiții în immobiliare']
      }
    };

    const ecosystemSuggestions = suggestionMap[ecosystem] || suggestionMap['por-health'];
    
    for (const [keyword, suggestions] of Object.entries(ecosystemSuggestions)) {
      if (lowerMessage.includes(keyword) && keyword !== 'default') {
        return suggestions;
      }
    }
    
    return ecosystemSuggestions.default || context.suggestions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addUserMessage(userMessage);
    setIsTyping(true);

    try {
      const response = await generateAIResponse(userMessage);
      addAIMessage(response.content, response.suggestions);
    } catch (error) {
      addAIMessage('Ne pare rău, am întâmpinat o problemă tehnică. Te rog să încerci din nou.', context.suggestions);
    } finally {
      setIsTyping(false);
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
            {message.type === 'ai' && (
              <div className={styles.messageAvatar} style={{ backgroundColor: context.color }}>
                {context.icon}
              </div>
            )}
            
            <div className={styles.messageContent}>
              <div className={styles.messageText}>
                {message.content}
              </div>
              <div className={styles.messageTime}>
                {formatTime(message.timestamp)}
              </div>
              
              {message.suggestions && message.suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  <div className={styles.suggestionsLabel}>Sugestii:</div>
                  <div className={styles.suggestionsList}>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={styles.suggestionButton}
                        style={{ borderColor: context.color }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {message.type === 'user' && (
              <div className={styles.userAvatar}>
                👤
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className={`${styles.message} ${styles.aiMessage}`}>
            <div className={styles.messageAvatar} style={{ backgroundColor: context.color }}>
              {context.icon}
            </div>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.chatInput}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Întreabă pe ${context.name}...`}
          className={styles.messageInput}
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className={styles.sendButton}
          style={{ backgroundColor: context.color }}
        >
          ↗️
        </button>
      </form>
    </div>
  );
}