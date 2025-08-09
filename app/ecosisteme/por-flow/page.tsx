'use client';
import styles from './style.module.css';
import { useEffect } from 'react';
import Link from 'next/link';

export default function PorFlowLanding() {
  useEffect(() => {
    const nav = document.getElementById('navbar');
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleDemoSend = () => {
    const input = document.getElementById('demoInput') as HTMLInputElement | null;
    const chat = document.getElementById('chatInterface');
    if (input && chat && input.value.trim()) {
      const umsg = document.createElement('div');
      umsg.className = `${styles.message} user`;
      umsg.textContent = input.value;
      chat.appendChild(umsg);

      const val = input.value.toLowerCase();
      input.value = '';
      chat.scrollTop = chat.scrollHeight;

      setTimeout(() => {
        const ai = document.createElement('div');
        ai.className = `${styles.message} ${styles.ai ?? 'ai'}`;
        let reply =
          'Perfect! Îți pot crea un program de productivitate personalizat. Spune-mi ce vrei să-ți optimizezi astăzi!';
        if (val.includes('productivitate') || val.includes('focus')) {
          reply =
            '🎯 Pentru focus maxim, recomand metoda Pomodoro: 25 min lucru intens + 5 min pauză. Vrei să-ți programez sesiunea?';
        } else if (val.includes('timp') || val.includes('program')) {
          reply =
            '⏰ Îți analizez programul și îți creez time blocks optimizate. Când ai cele mai productive ore?';
        } else if (val.includes('task') || val.includes('sarcini')) {
          reply =
            '📋 Îți prioritizez taskurile după matricea Eisenhower: Urgent/Important. Care sunt principalele tale obiective?';
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
    <main className={styles.flowContainer}>
      {/* NAVBAR */}
      <nav className={styles.navbar} id="navbar">
        <div className={`${styles.container} ${styles['nav-content']}`}>
          <Link href="/" className={styles.logo}>PorFlow</Link>
          <div className={styles['nav-links']}>
            <Link href="/" className={styles['nav-link']}>Acasă</Link>
            <Link href="/ecosisteme/por-health" className={styles['nav-link']}>PorHealth</Link>
            <Link href="/ecosisteme/por-mind" className={styles['nav-link']}>PorMind</Link>
            <Link href="/ecosisteme/por-well" className={styles['nav-link']}>PorWell</Link>
            <Link href="/ecosisteme/por-flow" className={`${styles['nav-link']} active`}>PorFlow</Link>
            <Link href="/ecosisteme/por-blu" className={styles['nav-link']}>PorBlu</Link>
            <Link href="/ecosisteme/por-kids" className={styles['nav-link']}>PorKids</Link>
            <Link href="/pricing" className={styles['nav-link']}>Prețuri</Link>
          </div>
          <Link href="/auth/signup" className={styles['cta-button']}>Începe Gratuit</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles['hero-content']}>
            <div className={styles['hero-text']}>
              <h1>
                Productivitate de <span className={styles.highlight}>NIVEL ENTERPRISE</span> pentru viața ta
              </h1>
              <p>
                Asistentul AI care îți optimizează timpul, prioritizează taskurile și creează flow state-uri pentru
                performanță maximă. Time management inteligent pentru rezultate extraordinare.
              </p>
              <div className={styles['hero-buttons']}>
                <Link href="/auth/signup" className={styles['btn-primary']}>
                  Începe Transformarea Gratuit
                </Link>
                <Link href="/dashboard/por-flow" className={styles['btn-secondary']}>
                  Vezi Demo Live
                </Link>
              </div>
              <div className={styles['hero-stats']}>
                <div className={styles.stat}>
                  <div className={styles['stat-number']}>3.2x</div>
                  <div className={styles['stat-label']}>Productivitate crescută</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles['stat-number']}>87%</div>
                  <div className={styles['stat-label']}>Mai puțin stres</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles['stat-number']}>2.1h</div>
                  <div className={styles['stat-label']}>Timp câștigat zilnic</div>
                </div>
              </div>
            </div>

            <div className={styles['hero-demo']}>
              <div className={styles['demo-card']}>
                <div className={styles['demo-header']}>
                  <span className={styles['demo-icon']}>🌊</span>
                  <div className={styles['demo-title']}>PorFlow AI Assistant</div>
                  <div className={styles['demo-status']}>● Live</div>
                </div>

                <div className={styles['chat-interface']} id="chatInterface">
                  <div className={`${styles.message} ${styles.ai ?? ''}`}>
                    🎯 Bună! Sunt AI-ul tău de productivitate. Spune-mi cu ce te ajut astăzi: time blocking,
                    prioritizare taskuri sau crearea unui flow state perfect?
                  </div>
                </div>

                <div className={styles['chat-input']}>
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
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles['section-header']}>
            <h2>Instrumentele de productivitate care schimbă jocul</h2>
            <p>AI avansat pentru optimizarea timpului și a performanței tale profesionale</p>
          </div>

          <div className={styles['features-grid']}>
            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>⏰</div>
              <h3>Smart Time Blocking</h3>
              <p>AI-ul analizează energia ta și creează time blocks perfecte pentru fiecare tip de activitate.</p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>🎯</div>
              <h3>Task Prioritization AI</h3>
              <p>Prioritizare inteligentă bazată pe impact, urgență și obiectivele tale pe termen lung.</p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>🧠</div>
              <h3>Flow State Creation</h3>
              <p>Algoritmi specializați pentru atingerea flow state-ului și menținerea concentrării profunde.</p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>📊</div>
              <h3>Productivity Analytics</h3>
              <p>Insights detaliate despre pattern‑urile tale de muncă și optimizări bazate pe date.</p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>🔄</div>
              <h3>Workflow Automation</h3>
              <p>Automatizează taskurile repetitive și creează sisteme care lucrează pentru tine.</p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>🎛️</div>
              <h3>Energy Management</h3>
              <p>Potrevește activitățile cu nivelurile tale naturale de energie pentru rezultate optime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles['section-header']}>
            <h2>Investește în productivitatea ta</h2>
            <p>Planuri create pentru profesioniști ambițioși</p>
          </div>

          <div className={styles['pricing-grid']}>
            <div className={styles['pricing-card']}>
              <div className={styles['plan-name']}>PorFlow Starter</div>
              <div className={styles['plan-price']}>49 RON</div>
              <div className={styles['plan-period']}>/lună (€10)</div>
              <ul className={styles['plan-features']}>
                <li>Time blocking basic</li>
                <li>Task management simplu</li>
                <li>Pomodoro timer avansat</li>
                <li>Rapoarte săptămânale</li>
                <li>5 workspace-uri</li>
                <li>Support email</li>
              </ul>
              <Link href="/checkout?plan=porflow-starter" className={`${styles['btn-secondary']} ${styles['plan-button']}`}>
                Începe cu 14 Zile Gratuit
              </Link>
            </div>

            <div className={`${styles['pricing-card']} ${styles.featured}`}>
              <div className={styles['popular-badge']}>Cel mai popular</div>
              <div className={styles['plan-name']}>PorFlow Pro</div>
              <div className={styles['plan-price']}>99 RON</div>
              <div className={styles['plan-period']}>/lună (€20)</div>
              <ul className={styles['plan-features']}>
                <li>AI task prioritization</li>
                <li>Smart calendar integration</li>
                <li>Workflow automation</li>
                <li>Energy pattern analysis</li>
                <li>Flow state coaching</li>
                <li>Workspace-uri nelimitate</li>
                <li>Team collaboration</li>
                <li>Priority support</li>
              </ul>
              <Link href="/checkout?plan=porflow-pro" className={`${styles['btn-primary']} ${styles['plan-button']}`}>
                Începe cu 14 Zile Gratuit
              </Link>
              <div className={styles['plan-savings']}>Economisești €1,200+ față de coaching tradițional</div>
            </div>

            <div className={styles['pricing-card']}>
              <div className={styles['plan-name']}>PorVerse Complete</div>
              <div className={styles['plan-price']}>199 RON</div>
              <div className={styles['plan-period']}>/lună (€40)</div>
              <ul className={styles['plan-features']}>
                <li>Toate funcțiile PorFlow Pro</li>
                <li>Acces la toate ecosistemele</li>
                <li>Cross-ecosystem insights</li>
                <li>Personal productivity coach</li>
                <li>Enterprise-level automation</li>
                <li>Custom workflows</li>
                <li>White-glove onboarding</li>
                <li>VIP support 24/7</li>
              </ul>
              <Link href="/checkout?plan=complete" className={`${styles['btn-secondary']} ${styles['plan-button']}`}>
                Upgrade la Complete
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <h2>Transformări în productivitate</h2>
          <div className={styles['testimonials-grid']}>
            <div className={styles.testimonial}>
              <div className={styles['testimonial-text']}>
                "PorFlow mi-a dublat productivitatea în prima lună. Time blocking-ul inteligent și AI-ul care îmi prioritizează taskurile m-au ajutat să finalizez proiecte cu săptămâni mai devreme."
              </div>
              <div className={styles['testimonial-author']}>Cătălin R., Product Manager</div>
            </div>
            <div className={styles.testimonial}>
              <div className={styles['testimonial-text']}>
                "Ca antreprenor, timpul e totul. PorFlow îmi gestionează calendarul perfect și mă ajută să rămân în flow state ore întregi. Game changer pentru business-ul meu!"
              </div>
              <div className={styles['testimonial-author']}>Ana M., CEO Startup</div>
            </div>
            <div className={styles.testimonial}>
              <div className={styles['testimonial-text']}>
                "Workflow automation-ul m-a scăpat de 2 ore de muncă repetitivă zilnic. Acum mă pot concentra pe ce contează cu adevărat - strategia și creația."
              </div>
              <div className={styles['testimonial-author']}>Radu P., Designer</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles['final-cta']}>
        <div className={styles.container}>
          <div className={styles['cta-card']}>
            <h2>Transformă-ți productivitatea astăzi</h2>
            <p>
              Alătură-te profesioniștilor care și-au optimizat vremea și și-au multiplicat rezultatele.
              Începe cu 14 zile gratuit - fără card necesar.
            </p>
            <Link href="/auth/signup" className={styles['btn-primary']} style={{ fontSize: '1.2rem', padding: '1.2rem 3rem' }}>
              Începe Transformarea Acum
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles['footer-content']}>
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
    </main>
  );
}
