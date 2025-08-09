// app/ecosisteme/page.tsx - Main Ecosystems Landing Page
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './style.module.css';

const ecosystems = [
  {
    id: 'por-health',
    name: 'PorHealth',
    subtitle: 'Sănătate & Fitness AI',
    description: 'Nutriție personalizată, antrenamente optimize și monitorizare biometrică avansată pentru transformarea fizică completă.',
    icon: '🌿',
    gradient: 'health',
    features: ['AI Nutrition Planner', 'Workout Optimizer', 'Biometric Tracking', 'Sleep Analysis', 'Wearable Integration'],
    tier: 'FREE',
    href: '/ecosisteme/por-health',
    color: '#00ff88',
    stats: { users: '50k+', improvement: '92%', support: '24/7' }
  },
  {
    id: 'por-kids',
    name: 'PorKids',
    subtitle: 'Educație Conștientă',
    description: 'AI părinte-copil, homework scanner și dezvoltare holistică pentru copii în era digitală modernă.',
    icon: '👶',
    gradient: 'kids',
    features: ['Homework Scanner', 'Progress Tracking', 'Family Dashboard', 'Educational Games', 'Parent Analytics'],
    tier: 'FREE',
    href: '/ecosisteme/por-kids',
    color: '#ec4899',
    stats: { families: '12k+', engagement: '95%', learning: '+40%' }
  },
  {
    id: 'por-mind',
    name: 'PorMind',
    subtitle: 'Educație Financiară AI',
    description: 'Money mindset, investiții inteligente și wealth building personalizat pentru libertate financiară completă.',
    icon: '🧠',
    gradient: 'mind',
    features: ['Financial Planning', 'Investment AI', 'Budget Optimization', 'Wealth Building', 'Tax Strategies'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-mind',
    color: '#3b82f6',
    stats: { wealth: '+185%', savings: '€2.3M', users: '25k+' }
  },
  {
    id: 'por-well',
    name: 'PorWell',
    subtitle: 'Mental Wellness AI',
    description: 'AI therapist, mood tracking și emotional intelligence optimization pentru echilibru interior și pace mentală.',
    icon: '🌻',
    gradient: 'well',
    features: ['AI Therapist', 'Mood Tracking', 'Anxiety Helper', 'Meditation Guide', 'Astrology AI'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-well',
    color: '#8b5cf6',
    stats: { wellbeing: '+89%', stress: '-76%', satisfaction: '98%' }
  },
  {
    id: 'por-flow',
    name: 'PorFlow',
    subtitle: 'Productivitate Maximă',
    description: 'Task management AI, time optimization și workflow automation pentru performanță de nivel superior și eficiență maximă.',
    icon: '🌊',
    gradient: 'flow',
    features: ['Task Management AI', 'Time Blocking', 'Focus Sessions', 'Calendar Optimization', 'Energy Management'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-flow',
    color: '#06b6d4',
    stats: { productivity: '+156%', time: '3.2h/day', efficiency: '94%' }
  },
  {
    id: 'por-blu',
    name: 'PorBlu',
    subtitle: 'Strategic Life Planning',
    description: 'Executive coaching, vision boarding și legacy planning pentru lideri, visionari și antreprenorii de succes.',
    icon: '💧',
    gradient: 'blu',
    features: ['Strategic Planning', 'Executive Coaching', 'Vision Boarding', 'Leadership Development', 'Legacy Planning'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-blu',
    color: '#f59e0b',
    stats: { leaders: '5k+', success: '+234%', impact: 'Generational' }
  }
];

const testimonials = [
  {
    name: "Alexandra Popescu",
    role: "Tech CEO & Mother",
    content: "PorVerse mi-a transformat complet viața. PorHealth pentru sănătate, PorKids pentru educația copilului și PorMind pentru finanțe. Un ecosistem complet de transformare.",
    avatar: "👩‍💼",
    ecosystems: ["PorHealth", "PorKids", "PorMind"],
    gradient: "multi1"
  },
  {
    name: "Mihai Georgescu",
    role: "Serial Entrepreneur",
    content: "Cu PorFlow am optimizat productivitatea cu 200%, iar PorBlu mi-a clarificat viziunea pe următorii 20 de ani. Investment-ul perfect în mine însumi.",
    avatar: "🚀",
    ecosystems: ["PorFlow", "PorBlu", "PorMind"],
    gradient: "multi2"
  },
  {
    name: "Diana Ionescu",
    role: "Wellness Coach",
    content: "PorWell m-a ajutat să îmi gestionez anxietatea, iar integrarea cu PorHealth mi-a optimizat întreaga rutină de wellness. Rezultate incredibile!",
    avatar: "🧘‍♀️",
    ecosystems: ["PorWell", "PorHealth"],
    gradient: "multi3"
  }
];

export default function EcosystemsMainPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEcosystem, setSelectedEcosystem] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const freeEcosystems = ecosystems.filter(eco => eco.tier === 'FREE');
  const premiumEcosystems = ecosystems.filter(eco => eco.tier === 'PREMIUM');

  return (
    <div className={styles.ecosystemsContainer}>
      {/* Animated Background */}
      <div className={styles.backgroundEffects}>
        <div className={styles.gradientOverlay}></div>
        {isClient && (
          <div className={styles.particleField}>
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className={styles.particle}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>🧠</span>
              <span className={styles.logoText}>PorVerse</span>
            </Link>
            
            <nav className={styles.nav}>
              <Link href="/">Acasă</Link>
              <Link href="/ecosisteme" className={styles.active}>Ecosisteme</Link>
              <Link href="/pricing">Prețuri</Link>
              <Link href="/about">Despre</Link>
            </nav>

            <div className={styles.headerActions}>
              <div className={styles.liveTime} suppressHydrationWarning>
                🇷🇴 București • {formatTime(currentTime)}
              </div>
              <Link href="/auth/login" className={styles.loginBtn}>Login</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✨</span>
              <span>6 Ecosisteme integrate pentru transformare completă</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Explorează Universul
              <span className={styles.gradientText}>PorVerse</span>
            </h1>
            
            <p className={styles.heroSubtitle}>
              Primul "sistem de operare spirituală" din lume. 6 ecosisteme AI care lucrează împreună 
              pentru optimizarea holistică a vieții tale: sănătate, minte, wellness, productivitate, 
              strategic planning și educația copiilor.
            </p>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>6</div>
                <div className={styles.statLabel}>Ecosisteme integrate</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>127k+</div>
                <div className={styles.statLabel}>Utilizatori activi</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>23</div>
                <div className={styles.statLabel}>Țări</div>
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link href="/auth/signup" className={styles.ctaPrimary}>
                🚀 Începe Gratuit
              </Link>
              <Link href="/pricing" className={styles.ctaSecondary}>
                💰 Vezi Prețurile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Free Ecosystems */}
      <section className={styles.freeSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>🆓 Începe Gratuit</h2>
            <p>2 ecosisteme complete, fără limitări, pentru totdeauna</p>
          </div>

          <div className={styles.ecosystemsGrid}>
            {freeEcosystems.map((ecosystem, index) => (
              <div 
                key={ecosystem.id} 
                className={`${styles.ecosystemCard} ${styles[ecosystem.gradient]}`}
                style={{ animationDelay: `${index * 0.2}s` }}
                onMouseEnter={() => setSelectedEcosystem(ecosystem.id)}
                onMouseLeave={() => setSelectedEcosystem(null)}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>{ecosystem.icon}</span>
                  <span className={styles.tierBadge}>
                    <span className={styles.tierFree}>GRATUIT</span>
                  </span>
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{ecosystem.name}</h3>
                  <p className={styles.cardSubtitle}>{ecosystem.subtitle}</p>
                  <p className={styles.cardDescription}>{ecosystem.description}</p>
                  
                  <div className={styles.cardFeatures}>
                    {ecosystem.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className={styles.feature}>
                        <span className={styles.featureIcon}>✨</span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className={styles.cardStats}>
                    {Object.entries(ecosystem.stats).map(([key, value]) => (
                      <div key={key} className={styles.miniStat}>
                        <span className={styles.miniStatValue}>{value}</span>
                        <span className={styles.miniStatLabel}>{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.cardActions}>
                  <Link href={ecosystem.href} className={styles.exploreBtn}>
                    Explorează {ecosystem.name}
                  </Link>
                  <Link href="/auth/signup" className={styles.startBtn}>
                    🚀 Începe Gratuit
                  </Link>
                </div>

                <div className={`${styles.cardGlow} ${selectedEcosystem === ecosystem.id ? styles.active : ''}`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Ecosystems */}
      <section className={styles.premiumSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>💎 Ecosisteme Premium</h2>
            <p>Unlock advanced AI features pentru transformare accelerată</p>
          </div>

          <div className={styles.ecosystemsGrid}>
            {premiumEcosystems.map((ecosystem, index) => (
              <div 
                key={ecosystem.id} 
                className={`${styles.ecosystemCard} ${styles[ecosystem.gradient]}`}
                style={{ animationDelay: `${index * 0.2}s` }}
                onMouseEnter={() => setSelectedEcosystem(ecosystem.id)}
                onMouseLeave={() => setSelectedEcosystem(null)}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>{ecosystem.icon}</span>
                  <span className={styles.tierBadge}>
                    <span className={styles.tierPremium}>PREMIUM</span>
                  </span>
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{ecosystem.name}</h3>
                  <p className={styles.cardSubtitle}>{ecosystem.subtitle}</p>
                  <p className={styles.cardDescription}>{ecosystem.description}</p>
                  
                  <div className={styles.cardFeatures}>
                    {ecosystem.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className={styles.feature}>
                        <span className={styles.featureIcon}>✨</span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className={styles.cardStats}>
                    {Object.entries(ecosystem.stats).map(([key, value]) => (
                      <div key={key} className={styles.miniStat}>
                        <span className={styles.miniStatValue}>{value}</span>
                        <span className={styles.miniStatLabel}>{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.cardActions}>
                  <Link href={ecosystem.href} className={styles.exploreBtn}>
                    Explorează {ecosystem.name}
                  </Link>
                  <Link href="/pricing" className={styles.upgradeBtn}>
                    💎 Upgrade Premium
                  </Link>
                </div>

                <div className={`${styles.cardGlow} ${selectedEcosystem === ecosystem.id ? styles.active : ''}`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quantum Vault Teaser */}
      <section className={styles.quantumSection}>
        <div className={styles.container}>
          <div className={styles.quantumContent}>
            <div className={styles.quantumLeft}>
              <div className={styles.quantumBadge}>
                🔮 EXPERIENȚA SUPREMĂ
              </div>
              
              <h2 className={styles.quantumTitle}>
                Quantum Vault
                <span className={styles.quantumSubtitle}>
                  Se deblochează cu Quantum Trinity
                </span>
              </h2>
              
              <p className={styles.quantumDescription}>
                Când achiziționezi <strong>PorMind + PorFlow + PorBlu</strong> (Quantum Trinity), 
                deblochezi automat Quantum Vault - experiența AI supremă care îți arată versiunea 
                viitoare ideală și planul exact pentru a ajunge acolo.
              </p>

              <div className={styles.quantumFeatures}>
                <div className={styles.quantumFeature}>
                  <span>🧬</span>
                  <span>Future Self AI Creation</span>
                </div>
                <div className={styles.quantumFeature}>
                  <span>🌌</span>
                  <span>Identity Shift Simulator</span>
                </div>
                <div className={styles.quantumFeature}>
                  <span>🗺️</span>
                  <span>Reverse Roadmap Generator</span>
                </div>
              </div>

              <Link href="/quantum-vault" className={styles.quantumCta}>
                🔓 Descoperă Quantum Vault
              </Link>
            </div>

            <div className={styles.quantumRight}>
              <div className={styles.quantumVisual}>
                <div className={styles.quantumOrb}>
                  <div className={styles.orbInner}></div>
                </div>
                <div className={styles.orbPulse}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Transformări Reale prin Multiple Ecosisteme</h2>
            <p>Puterea adevărată vine din integrarea ecosistemelor</p>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`${styles.testimonialCard} ${styles[testimonial.gradient]}`}>
                <div className={styles.testimonialContent}>
                  <p>"{testimonial.content}"</p>
                </div>
                
                <div className={styles.testimonialAuthor}>
                  <span className={styles.authorAvatar}>{testimonial.avatar}</span>
                  <div className={styles.authorInfo}>
                    <div className={styles.authorName}>{testimonial.name}</div>
                    <div className={styles.authorRole}>{testimonial.role}</div>
                  </div>
                </div>

                <div className={styles.testimonialEcosystems}>
                  {testimonial.ecosystems.map((eco, i) => (
                    <span key={i} className={styles.ecosystemBadge}>
                      {eco}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Alege-ți Ecosistemele și Începe Transformarea</h2>
            <p>
              Începe cu ecosistemele gratuite sau unlock întregul potențial cu planurile premium. 
              Fiecare ecosistem este proiectat să lucreze în sinergie cu celelalte.
            </p>
            
            <div className={styles.ctaActions}>
              <Link href="/auth/signup" className={styles.ctaPrimaryLarge}>
                🚀 Începe cu Ecosistemele Gratuite
              </Link>
              <Link href="/pricing" className={styles.ctaSecondaryLarge}>
                💎 Vezi Toate Planurile
              </Link>
            </div>

            <div className={styles.ctaGuarantee}>
              <span className={styles.guaranteeIcon}>🛡️</span>
              <span>30 de zile gratuit • Fără card necesar • Anulare oricând</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}