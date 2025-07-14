'use client';
import './style.module.css';
import { useEffect } from 'react';
import Link from 'next/link';

export default function PorFlowLanding() {
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

  // Demo AI Chat Logic
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
        let reply = "Perfect! Îți pot crea un program de productivitate personalizat. Spune-mi ce vrei să optimizezi astăzi!";
        if (val.includes("productivitate") || val.includes("focus")) {
          reply = "🎯 Pentru focus maxim, recomand metoda Pomodoro: 25 min lucru intens + 5 min pauză. Vrei să-ți programez sesiunea?";
        }
        if (val.includes("timp") || val.includes("program")) {
          reply = "⏰ Îți analizez programul și îți creez time blocks optimizate. Când ai cele mai productive ore?";
        }
        if (val.includes("task") || val.includes("sarcini")) {
          reply = "📋 Îți prioritizez taskurile după matricea Eisenhower: Urgent/Important. Care sunt principalele tale obiective?";
        }
        ai.innerHTML = reply;
        chat.appendChild(ai);
        chat.scrollTop = chat.scrollHeight;
      }, 1200);
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
          <Link href="/" className="logo">PorFlow</Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Acasă</Link>
            <Link href="/ecosisteme/por-health" className="nav-link">PorHealth</Link>
            <Link href="/ecosisteme/por-mind" className="nav-link">PorMind</Link>
            <Link href="/ecosisteme/por-well" className="nav-link">PorWell</Link>
            <Link href="/ecosisteme/por-flow" className="nav-link active">PorFlow</Link>
            <Link href="/ecosisteme/por-blu" className="nav-link">PorBlu</Link>
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
                Productivitate de <span className="highlight">NIVEL ENTERPRISE</span> pentru viața ta
              </h1>
              <p>
                Asistentul AI care îți optimizează timpul, prioritizează taskurile și creează flow state-uri pentru performanță maximă. Time management inteligent pentru rezultate extraordinare.
              </p>
              <div className="hero-buttons">
                <Link href="/auth/signup" className="btn-primary">
                  Începe Transformarea Gratuit
                </Link>
                <Link href="/dashboard/por-flow" className="btn-secondary">
                  Vezi Demo Live
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">3.2x</div>
                  <div className="stat-label">Productivitate crescută</div>
                </div>
                <div className="stat">
                  <div className="stat-number">87%</div>
                  <div className="stat-label">Mai puțin stress</div>
                </div>
                <div className="stat">
                  <div className="stat-number">2.1h</div>
                  <div className="stat-label">Timp câștigat zilnic</div>
                </div>
              </div>
            </div>
            <div className="hero-demo">
              <div className="demo-card">
                <div className="demo-header">
                  <span className="demo-icon">🌊</span>
                  <div className="demo-title">PorFlow AI Assistant</div>
                  <div className="demo-status">● Live</div>
                </div>
                <div className="chat-interface" id="chatInterface">
                  <div className="message ai">
                    🎯 Bună! Sunt AI-ul tău de productivitate. Spune-mi cu ce te ajut astăzi: time blocking, prioritizare taskuri sau crearea unui flow state perfect?
                  </div>
                </div>
                <div className="chat-input">
                  <input 
                    type="text" 
                    id="demoInput"
                    placeholder="Vreau să-mi optimizez programul de lucru..."
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
            <h2>Instrumentele de productivitate care schimbă jocul</h2>
            <p>AI avansat pentru optimizarea timpului și a performanței tale profesionale</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Smart Time Blocking</h3>
              <p>AI-ul analizează energia ta și creează time blocks perfecte pentru fiecare tip de activitate.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Task Prioritization AI</h3>
              <p>Prioritizare inteligentă bazată pe impact, urgență și obiectivele tale pe termen lung.</p>
            </div>
            <div className="feature-card">
              <div className="icon">🧠</div>
              <h3>Flow State Creation</h3>
              <p>Algoritmi specializați pentru atingerea flow state-ului și menținerea concentrării profunde.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Productivity Analytics</h3>
              <p>Insights detaliate despre patternsurile tale de muncă și optimizări bazate pe date.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Workflow Automation</h3>
              <p>Automatizează taskurile repetitive și creează sisteme care lucrează pentru tine.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎛️</div>
              <h3>Energy Management</h3>
              <p>Matchează activitățile cu nivelurile tale naturale de energie pentru rezultate optime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Investește în productivitatea ta</h2>
            <p>Planuri create pentru profesioniști ambițioși</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="plan-name">PorFlow Starter</div>
              <div className="plan-price">49 RON</div>
              <div className="plan-period">/lună (€10)</div>
              <ul className="plan-features">
                <li>Time blocking basic</li>
                <li>Task management simplu</li>
                <li>Pomodoro timer avansat</li>
                <li>Rapoarte săptămânale</li>
                <li>5 workspace-uri</li>
                <li>Support email</li>
              </ul>
              <Link href="/checkout?plan=porflow-starter" className="btn-secondary plan-button">
                Începe cu 14 Zile Gratuit
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="popular-badge">Cel mai popular</div>
              <div className="plan-name">PorFlow Pro</div>
              <div className="plan-price">99 RON</div>
              <div className="plan-period">/lună (€20)</div>
              <ul className="plan-features">
                <li>AI task prioritization</li>
                <li>Smart calendar integration</li>
                <li>Workflow automation</li>
                <li>Energy pattern analysis</li>
                <li>Flow state coaching</li>
                <li>Workspace-uri nelimitate</li>
                <li>Team collaboration</li>
                <li>Priority support</li>
              </ul>
              <Link href="/checkout?plan=porflow-pro" className="btn-primary plan-button">
                Începe cu 14 Zile Gratuit
              </Link>
              <div className="plan-savings">Economisești €1,200+ față de coaching tradițional</div>
            </div>

            <div className="pricing-card">
              <div className="plan-name">PorVerse Complete</div>
              <div className="plan-price">199 RON</div>
              <div className="plan-period">/lună (€40)</div>
              <ul className="plan-features">
                <li>Toate funcțiile PorFlow Pro</li>
                <li>Acces la toate ecosistemele</li>
                <li>Cross-ecosystem insights</li>
                <li>Personal productivity coach</li>
                <li>Enterprise-level automation</li>
                <li>Custom workflows</li>
                <li>White-glove onboarding</li>
                <li>VIP support 24/7</li>
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
          <h2>Transformări în productivitate</h2>
          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="testimonial-text">
                "PorFlow mi-a dublat productivitatea în prima lună. Time blocking-ul inteligent și AI-ul care îmi prioritizează taskurile m-au ajutat să finalizez proiecte cu săptămâni mai devreme."
              </div>
              <div className="testimonial-author">Cătălin R., Product Manager</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                "Ca antreprenor, timpul e totul. PorFlow îmi gestionează calendarul perfect și mă ajută să rămân în flow state ore întregi. Game changer pentru business-ul meu!"
              </div>
              <div className="testimonial-author">Ana M., CEO Startup</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                "Workflow automation-ul m-a scăpat de 2 ore de muncă repetitivă zilnic. Acum mă pot concentra pe ce contează cu adevărat - strategia și creația."
              </div>
              <div className="testimonial-author">Radu P., Designer</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-card">
            <h2>Transformă-ți productivitatea astăzi</h2>
            <p>
              Alătură-te profesioniștilor care și-au optimizat vremea și și-au multiplicat rezultatele. 
              Începe cu 14 zile gratuit - fără card necesar.
            </p>
            <Link href="/auth/signup" className="btn-primary" style={{ fontSize: "1.2rem", padding: "1.2rem 3rem" }}>
              Începe Transformarea Acum
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>PorFlow</h3>
              <ul>
                <li><Link href="/ecosisteme/por-flow/features">Funcționalități</Link></li>
                <li><Link href="/ecosisteme/por-flow/pricing">Prețuri</Link></li>
                <li><Link href="/ecosisteme/por-flow/testimonials">Testimoniale</Link></li>
                <li><Link href="/ecosisteme/por-flow/case-studies">Case Studies</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Ecosisteme</h3>
              <ul>
                <li><Link href="/ecosisteme/por-health">PorHealth</Link></li>
                <li><Link href="/ecosisteme/por-mind">PorMind</Link></li>
                <li><Link href="/ecosisteme/por-well">PorWell</Link></li>
                <li><Link href="/ecosisteme/por-blu">PorBlu</Link></li>
                <li><Link href="/ecosisteme/por-kids">PorKids</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Support</h3>
              <ul>
                <li><Link href="/support">Ajutor</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/api-docs">API</Link></li>
                <li><Link href="/status">Status</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Legal</h3>
              <ul>
                <li><Link href="/legal/privacy">Confidențialitate</Link></li>
                <li><Link href="/legal/terms">Termeni</Link></li>
                <li><Link href="/legal/cookies">Cookies</Link></li>
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