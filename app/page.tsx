// app/page.tsx - FIXED TO USE CSS MODULE
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './homepage.module.css';

const ecosystems = [
  {
    id: 'por-health',
    name: 'PorHealth',
    subtitle: 'Sănătate & Fitness AI',
    description: 'Nutriție personalizată, antrenamente optimize și monitorizare biometrică avansată',
    icon: '🌿',
    gradient: 'from-emerald-500 to-emerald-600',
    features: ['AI Nutrition Planner', 'Workout Optimizer', 'Biometric Tracking'],
    tier: 'FREE',
    href: '/ecosisteme/por-health'
  },
  {
    id: 'por-kids',
    name: 'PorKids',
    subtitle: 'Educație Conștientă',
    description: 'AI părinte-copil, homework scanner și dezvoltare holistică pentru copii',
    icon: '👶',
    gradient: 'from-pink-500 to-pink-600',
    features: ['Homework Scanner', 'Progress Tracking', 'Family Dashboard'],
    tier: 'FREE',
    href: '/ecosisteme/por-kids'
  },
  {
    id: 'por-mind',
    name: 'PorMind',
    subtitle: 'Educație Financiară AI',
    description: 'Money mindset, investiții inteligente și wealth building personalizat',
    icon: '🧠',
    gradient: 'from-blue-500 to-blue-600',
    features: ['Financial Planning', 'Investment AI', 'Wealth Building'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-mind'
  },
  {
    id: 'por-well',
    name: 'PorWell',
    subtitle: 'Mental Wellness AI',
    description: 'AI therapist, mood tracking și emotional intelligence optimization',
    icon: '🌻',
    gradient: 'from-purple-500 to-purple-600',
    features: ['AI Therapist', 'Mood Tracking', 'Anxiety Helper'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-well'
  },
  {
    id: 'por-flow',
    name: 'PorFlow',
    subtitle: 'Productivitate Maximă',
    description: 'Task management AI, time optimization și workflow automation',
    icon: '🌊',
    gradient: 'from-cyan-500 to-cyan-600',
    features: ['Task Management AI', 'Time Blocking', 'Focus Sessions'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-flow'
  },
  {
    id: 'por-blu',
    name: 'PorBlu',
    subtitle: 'Strategic Life Planning',
    description: 'Executive coaching, vision boarding și legacy planning pentru lideri',
    icon: '💧',
    gradient: 'from-amber-500 to-amber-600',
    features: ['Strategic Planning', 'Executive Coaching', 'Vision Boarding'],
    tier: 'PREMIUM',
    href: '/ecosisteme/por-blu'
  }
];

const testimonials = [
  {
    name: "Andrei Popescu",
    role: "Tech Entrepreneur",
    content: "PorVerse mi-a transformat complet viața. În 3 luni am optimizat sănătatea, finanțele și productivitatea. Este ca și cum aș avea un coach personal AI 24/7.",
    avatar: "🚀",
    ecosystems: ["PorHealth", "PorMind", "PorFlow"]
  },
  {
    name: "Maria Ionescu", 
    role: "Mamă & Designer",
    content: "PorKids a revoluționat educația copilului meu, iar PorWell m-a ajutat să îmi gestionez anxietatea. Investiția perfectă în familia noastră.",
    avatar: "🎨",
    ecosystems: ["PorKids", "PorWell"]
  },
  {
    name: "Călin Georgescu",
    role: "CEO & Investor", 
    content: "Quantum Vault este experiența supremă - mi-a arătat versiunea viitoare a mea și planul exact pentru a ajunge acolo. Mind-blowing!",
    avatar: "💎",
    ecosystems: ["Quantum Vault", "PorBlu"]
  }
];

export default function Homepage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    transformations: 0,
    countries: 0
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        users: 12847,
        transformations: 3921,
        countries: 23
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={styles.hero}>
      {/* Animated Background */}
      <div className={styles.heroBackground}>
        <div className={styles.gradientOverlay}></div>
        {isClient && (
          <div className={styles.particleField}>
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className={styles.particle}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.heroContent}>
        {/* Header */}
        <header className={styles.heroHeader}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🧠</span>
            <span className={styles.logoText}>PorVerse</span>
          </Link>
          
          <nav className={styles.nav}>
            <Link href="/ecosisteme/por-health">Ecosisteme</Link>
            <Link href="/pricing">Prețuri</Link>
            <Link href="/about">Despre</Link>
            <Link href="/auth/login" className={styles.loginBtn}>Login</Link>
          </nav>
        </header>

        {/* Hero Main */}
        <section className={styles.heroMain}>
          <div className={styles.heroLeft}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✨</span>
              <span>Primul "Sistem de Operare Spirituală" din lume</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Transformă-ți viața cu
              <span className={styles.gradientText}>AI avansat</span>
            </h1>
            
            <p className={styles.heroSubtitle}>
              6 ecosisteme integrate pentru optimizarea holistică: sănătate, minte, wellness, 
              productivitate, strategic planning și educația copiilor. Evoluție măsurabilă prin 
              tehnologie de ultimă generație.
            </p>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>
                  {animatedStats.users.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Utilizatori activi</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>
                  {animatedStats.transformations.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Transformări reușite</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>
                  {animatedStats.countries}
                </div>
                <div className={styles.statLabel}>Țări</div>
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link href="/auth/signup" className={styles.ctaPrimary}>
                🚀 Începe Transformarea
              </Link>
              <Link href="/demo" className={styles.ctaSecondary}>
                🎬 Vezi Demo Live
              </Link>
            </div>

            <div className={styles.socialProof}>
              <p className={styles.socialText}>Folosit de echipe din:</p>
              <div className={styles.companies}>
                <span>🏢 Google</span>
                <span>💻 Microsoft</span>
                <span>🚀 Tesla</span>
                <span>💎 Apple</span>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.dashboardPreview}>
              <div className={styles.previewHeader}>
                <h3 className={styles.previewTitle}>PorVerse Dashboard</h3>
                <div className={styles.previewTime} suppressHydrationWarning>
                  {formatTime(currentTime)}
                </div>
              </div>
              
              <div className={styles.previewEcosystems}>
                {ecosystems.slice(0, 4).map((eco, index) => (
                  <div
                    key={eco.id}
                    className={`${styles.previewCard} ${styles[`gradient${index + 1}`]}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className={styles.previewIcon}>{eco.icon}</div>
                    <div className={styles.previewName}>{eco.name}</div>
                    <div className={styles.previewTier}>
                      {eco.tier === 'FREE' ? '🆓' : '💎'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.previewQuantum}>
                <div className={styles.quantumBox}>
                  <div className={styles.quantumIcon}>🔮</div>
                  <div className={styles.quantumText}>Quantum Vault</div>
                  <div className={styles.quantumGlow}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Free Ecosystems */}
      <section className={styles.ecosystems}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>🆓 Începe Gratuit</h2>
            <p>2 ecosisteme complete, fără limitări, pentru totdeauna</p>
          </div>

          <div className={styles.ecosystemsGrid}>
            {ecosystems.filter(eco => eco.tier === 'FREE').map(ecosystem => (
              <div key={ecosystem.id} className={styles.ecosystemCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>{ecosystem.icon}</span>
                  <span className={`${styles.cardTier} ${styles.tierFree}`}>
                    GRATUIT
                  </span>
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{ecosystem.name}</h3>
                  <p className={styles.cardSubtitle}>{ecosystem.subtitle}</p>
                  <p className={styles.cardDescription}>{ecosystem.description}</p>
                  
                  <div className={styles.cardFeatures}>
                    {ecosystem.features.map((feature, i) => (
                      <div key={i} className={styles.feature}>
                        ✨ {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.cardAction}>
                  <Link href="/auth/signup" className={styles.ctaPrimary}>
                    🚀 Începe Gratuit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Ecosystems */}
      <section className={styles.ecosystems}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>💎 Ecosisteme Premium</h2>
            <p>Unlock advanced AI features pentru transformare accelerată</p>
          </div>

          <div className={styles.ecosystemsGrid}>
            {ecosystems.filter(eco => eco.tier === 'PREMIUM').map(ecosystem => (
              <Link 
                key={ecosystem.id}
                href={ecosystem.href}
                className={styles.ecosystemCard}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>{ecosystem.icon}</span>
                  <span className={`${styles.cardTier} ${styles.tierPremium}`}>
                    PREMIUM
                  </span>
                </div>
                
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{ecosystem.name}</h3>
                  <p className={styles.cardSubtitle}>{ecosystem.subtitle}</p>
                  <p className={styles.cardDescription}>{ecosystem.description}</p>
                  
                  <div className={styles.cardFeatures}>
                    {ecosystem.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className={styles.feature}>
                        ✨ {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.cardAction}>
                  <span className={styles.exploreText}>Explorează</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quantum Vault Section */}
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
                  Future Self AI & Reality Simulation
                </span>
              </h2>
              
              <p className={styles.quantumDescription}>
                Se deblochează automat când achiziționezi <strong>Quantum Trinity</strong> 
                (PorMind + PorFlow + PorBlu). Experiența premium care îți arată versiunea 
                viitoare ideală și planul exact pentru a ajunge acolo.
              </p>

              <div className={styles.quantumFeatures}>
                <div className={styles.quantumFeature}>
                  <span className={styles.featureIcon}>🧬</span>
                  <div>
                    <strong>Future Self AI Creation</strong>
                    <p>Generează versiunea ta ideală din viitor cu detalii complete</p>
                  </div>
                </div>
                
                <div className={styles.quantumFeature}>
                  <span className={styles.featureIcon}>🌌</span>
                  <div>
                    <strong>Identity Shift Simulator</strong>
                    <p>Testează decizii majore în timeline-uri alternative</p>
                  </div>
                </div>
                
                <div className={styles.quantumFeature}>
                  <span className={styles.featureIcon}>🗺️</span>
                  <div>
                    <strong>Reverse Roadmap Generator</strong>
                    <p>Plan strategic din viitor spre prezent cu milestone-uri</p>
                  </div>
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
                {isClient && (
                  <div className={styles.quantumParticles}>
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className={styles.quantumParticle}
                        style={{
                          left: `${50 + 40 * Math.cos(i * 30 * Math.PI / 180)}%`,
                          top: `${50 + 40 * Math.sin(i * 30 * Math.PI / 180)}%`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Transformări Reale, Rezultate Măsurabile</h2>
            <p>Oameni din întreaga lume își transformă viața cu PorVerse</p>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
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
            <h2>Gata să îți transformi viața?</h2>
            <p>
              Alătură-te celor {animatedStats.users.toLocaleString()} de utilizatori care și-au optimizat viața cu PorVerse
            </p>
            
            <div className={styles.ctaActions}>
              <Link href="/auth/signup" className={styles.ctaPrimaryLarge}>
                🚀 Începe Gratuit Acum
              </Link>
              <Link href="/pricing" className={styles.ctaSecondaryLarge}>
                💰 Vezi Prețurile
              </Link>
            </div>

            <div className={styles.ctaGuarantee}>
              <span className={styles.guaranteeIcon}>🛡️</span>
              <span>30 de zile gratuit • Fără card necesar • Anulare oricând</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <div className={styles.footerLogo}>
                <span>🧠</span>
                <span>PorVerse</span>
              </div>
              <p className={styles.footerDescription}>
                Primul sistem de operare spirituală pentru optimizarea holistică a vieții umane prin AI avansat.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>📧</a>
                <a href="#" className={styles.socialLink}>🐦</a>
                <a href="#" className={styles.socialLink}>📘</a>
                <a href="#" className={styles.socialLink}>📷</a>
              </div>
            </div>

            <div className={styles.footerSection}>
              <h3>Ecosisteme Gratuite</h3>
              <ul>
                <li><Link href="/ecosisteme/por-health">🌿 PorHealth</Link></li>
                <li><Link href="/ecosisteme/por-kids">👶 PorKids</Link></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h3>Ecosisteme Premium</h3>
              <ul>
                <li><Link href="/ecosisteme/por-mind">🧠 PorMind</Link></li>
                <li><Link href="/ecosisteme/por-well">🌻 PorWell</Link></li>
                <li><Link href="/ecosisteme/por-flow">🌊 PorFlow</Link></li>
                <li><Link href="/ecosisteme/por-blu">💧 PorBlu</Link></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h3>Companie</h3>
              <ul>
                <li><Link href="/about">Despre noi</Link></li>
                <li><Link href="/careers">Cariere</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/press">Presă</Link></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h3>Legal</h3>
              <ul>
                <li><Link href="/privacy">Confidențialitate</Link></li>
                <li><Link href="/terms">Termeni</Link></li>
                <li><Link href="/cookies">Cookies</Link></li>
                <li><Link href="/security">Securitate</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>&copy; 2025 PorVerse. Toate drepturile rezervate.</p>
            <p suppressHydrationWarning>
              România, București • <span className={styles.footerTime}>{formatTime(currentTime)}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}