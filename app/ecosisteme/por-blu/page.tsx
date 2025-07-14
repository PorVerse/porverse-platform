'use client';
import './style.module.css';
import { useEffect } from 'react';
import Link from 'next/link';

export default function PorBluLanding() {
  useEffect(() => {
    // Navbar scroll effect
    const nav = document.getElementById('navbar');
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Demo AI Coach Logic
  const handleDemoSend = () => {
    const input = document.getElementById('demoInput') as HTMLInputElement;
    const chat = document.getElementById('chatInterface');
    if (input && chat && input.value.trim()) {
      const umsg = document.createElement('div');
      umsg.className = 'message user';
      umsg.textContent = input.value;
      chat.appendChild(umsg);

      const val = input.value.toLowerCase();
      input.value = '';
      chat.scrollTop = chat.scrollHeight;

      setTimeout(() => {
        const ai = document.createElement('div');
        ai.className = 'message ai';
        let reply = "Excelent! Ca strategic advisor, te ghidez spre următorul nivel. Spune-mi unde vrei să ajungi în următorii 3-5 ani.";
        if (val.includes("leadership") || val.includes("echipa")) {
          reply = "🎯 Pentru leadership eficient: definim viziunea, creăm sisteme de accountability și dezvoltăm emotional intelligence. Câți oameni conduci?";
        }
        if (val.includes("strategie") || val.includes("business")) {
          reply = "📊 Să analizăm strategic: SWOT analysis, competitive advantage și roadmap de creștere. Care e principala ta provocare acum?";
        }
        if (val.includes("decizie") || val.includes("alegere")) {
          reply = "🧠 Pentru decizii complexe folosim framework-ul WRAP: Widen options, Reality-test, Attain perspective, Prepare to fail. Ce decizie te preocupă?";
        }
        if (val.includes("cariera") || val.includes("dezvoltare")) {
          reply = "🚀 Planificarea carierei: identificăm skills gap-urile, creăm network strategic și construim personal brand. Ce poziție vizezi?";
        }
        ai.innerHTML = reply;
        chat.appendChild(ai);
        chat.scrollTop = chat.scrollHeight;
      }, 1400);
    }
  };

  const handleDemoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleDemoSend();
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar" id="navbar">
        <div className="container nav-content">
          <Link href="/" className="logo">PorBlu</Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Acasă</Link>
            <Link href="/ecosisteme/por-health" className="nav-link">PorHealth</Link>
            <Link href="/ecosisteme/por-mind" className="nav-link">PorMind</Link>
            <Link href="/ecosisteme/por-well" className="nav-link">PorWell</Link>
            <Link href="/ecosisteme/por-flow" className="nav-link">PorFlow</Link>
            <Link href="/ecosisteme/por-blu" className="nav-link active">PorBlu</Link>
            <Link href="/ecosisteme/por-kids" className="nav-link">PorKids</Link>
            <Link href="/pricing" className="nav-link">Prețuri</Link>
          </div>
          <Link href="/auth/signup" className="cta-button">Începe Gratuit</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                <span className="highlight">LEADERSHIP STRATEGIC</span> și transformare la nivel executiv
              </h1>
              <p>
                Asistentul AI pentru lideri ambițioși care vor să-și construiască legacy-ul. Strategic planning, executive coaching și decision frameworks pentru următorul nivel de performanță.
              </p>
              <div className="hero-buttons">
                <Link href="/auth/signup" className="btn-primary">
                  Începe Transformarea Executivă
                </Link>
                <Link href="/dashboard/por-blu" className="btn-secondary">
                  Vezi Strategic Dashboard
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">4.2x</div>
                  <div className="stat-label">ROI îmbunătățit</div>
                </div>
                <div className="stat">
                  <div className="stat-number">89%</div>
                  <div className="stat-label">Obiective atinse</div>
                </div>
                <div className="stat">
                  <div className="stat-number">156%</div>
                  <div className="stat-label">Team performance</div>
                </div>
              </div>
            </div>
            <div className="hero-demo">
              <div className="demo-card">
                <div className="demo-header">
                  <span className="demo-icon">💧</span>
                  <div className="demo-title">PorBlu Executive Coach</div>
                  <div className="demo-status">● Strategic Mode</div>
                </div>
                <div className="chat-interface" id="chatInterface">
                  <div className="message ai">
                    🎯 Bună! Sunt AI-ul tău de strategic planning și executive coaching. Îți ghidez planificarea pe termen lung și deciziile complexe. Cu ce provocare strategică te pot ajuta?
                  </div>
                </div>
                <div className="chat-input">
                  <input 
                    type="text" 
                    id="demoInput"
                    placeholder="Vreau să-mi dezvolt leadership skills pentru următorul nivel..."
                    onKeyDown={handleDemoKeyDown}
                  />
                  <button onClick={handleDemoSend}>▶</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Instrumentele de leadership care transformă carriere</h2>
            <p>AI avansat pentru strategic thinking și executive excellence</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Strategic Vision Planning</h3>
              <p>Construiește viziuni clare pe 3-5-10 ani cu roadmaps detaliate și milestone-uri măsurabile.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Decision Framework AI</h3>
              <p>Sisteme avansate pentru decizii complexe: scenario planning, risk analysis și opportunity mapping.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Leadership Development</h3>
              <p>Coaching personalizat pentru emotional intelligence, team building și communication mastery.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Performance Analytics</h3>
              <p>KPI tracking, ROI analysis și business intelligence pentru optimizarea continue.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Legacy Building</h3>
              <p>Planificarea pe termen lung pentru impact sustenabil și construirea unui legacy de succes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Change Management</h3>
              <p>Strategii pentru transformări organizaționale și adaptarea la schimbările de piață.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Investiție în leadership-ul tău</h2>
            <p>Planuri pentru executives și lideri vizionari</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="plan-name">PorBlu Strategic</div>
              <div className="plan-price">149 RON</div>
              <div className="plan-period">/lună (€30)</div>
              <ul className="plan-features">
                <li>Strategic planning templates</li>
                <li>Decision framework tools</li>
                <li>Leadership assessment</li>
                <li>Quarterly reviews</li>
                <li>Goal tracking sistem</li>
                <li>Email support</li>
              </ul>
              <Link href="/checkout?plan=porblu-strategic" className="btn-secondary plan-button">
                Începe cu 30 Zile Gratuit
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="popular-badge">Pentru Executives</div>
              <div className="plan-name">PorBlu Executive</div>
              <div className="plan-price">299 RON</div>
              <div className="plan-period">/lună (€60)</div>
              <ul className="plan-features">
                <li>AI executive coaching 1-on-1</li>
                <li>Custom strategic frameworks</li>
                <li>Team leadership insights</li>
                <li>Performance analytics avansate</li>
                <li>Succession planning</li>
                <li>Change management tools</li>
                <li>Legacy planning modules</li>
                <li>Priority support 24/7</li>
              </ul>
              <Link href="/checkout?plan=porblu-executive" className="btn-primary plan-button">
                Începe cu 30 Zile Gratuit
              </Link>
              <div className="plan-savings">Economisești €12,000+ față de coaching executiv tradițional</div>
            </div>

            <div className="pricing-card">
              <div className="plan-name">PorVerse Complete</div>
              <div className="plan-price">199 RON</div>
              <div className="plan-period">/lună (€40)</div>
              <ul className="plan-features">
                <li>Toate funcțiile PorBlu Executive</li>
                <li>Acces la toate ecosistemele</li>
                <li>Cross-ecosystem intelligence</li>
                <li>Personal C-level advisor</li>
                <li>Enterprise strategy tools</li>
                <li>Board-level presentations</li>
                <li>White-glove onboarding</li>
                <li>VIP support concierge</li>
              </ul>
              <Link href="/checkout?plan=complete" className="btn-secondary plan-button">
                Upgrade la Complete
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <h2>Success stories de la lideri</h2>
          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="testimonial-text">
                "PorBlu m-a ajutat să cresc compania de la 50 la 200+ angajați în 18 luni. Strategic planning-ul AI și decision frameworks sunt game-changing pentru orice executive serios."
              </div>
              <div className="testimonial-author">Alexandru V., CEO Tech Startup</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                "Leadership development cu PorBlu mi-a transformat complet stilul de management. Team-ul meu e acum 3x mai productiv și engagement-ul a crescut cu 85%."
              </div>
              <div className="testimonial-author">Maria S., VP Operations</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                "Strategia pe 5 ani creată cu PorBlu ne-a ajutat să ne dublăm market share-ul. Legacy planning și succession framework-ul sunt invaluabile pentru orice business serios."
              </div>
              <div className="testimonial-author">Robert D., Managing Director</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-card">
            <h2>Construiește-ți legacy-ul executiv astăzi</h2>
            <p>
              Alătură-te liderilor care transformă industrii și construiesc imperii de business. 
              Începe călătoria strategică cu 30 de zile gratuit - fără compromisuri.
            </p>
            <Link href="/auth/signup" className="btn-primary" style={{ fontSize: "1.2rem", padding: "1.2rem 3rem" }}>
              Începe Transformarea Executivă
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>PorBlu</h3>
              <ul>
                <li><Link href="/ecosisteme/por-blu/features">Funcționalități</Link></li>
                <li><Link href="/ecosisteme/por-blu/pricing">Prețuri</Link></li>
                <li><Link href="/ecosisteme/por-blu/case-studies">Case Studies</Link></li>
                <li><Link href="/ecosisteme/por-blu/executive-program">Executive Program</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Ecosisteme</h3>
              <ul>
                <li><Link href="/ecosisteme/por-health">PorHealth</Link></li>
                <li><Link href="/ecosisteme/por-mind">PorMind</Link></li>
                <li><Link href="/ecosisteme/por-well">PorWell</Link></li>
                <li><Link href="/ecosisteme/por-flow">PorFlow</Link></li>
                <li><Link href="/ecosisteme/por-kids">PorKids</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Resources</h3>
              <ul>
                <li><Link href="/resources/leadership">Leadership Hub</Link></li>
                <li><Link href="/resources/strategy">Strategy Tools</Link></li>
                <li><Link href="/resources/frameworks">Frameworks</Link></li>
                <li><Link href="/resources/templates">Templates</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Support</h3>
              <ul>
                <li><Link href="/support">Executive Support</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/partnership">Partnerships</Link></li>
                <li><Link href="/enterprise">Enterprise</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2025 PorVerse. Toate drepturile rezervate.
          </div>
        </div>
      </footer>
    </>
  );
}