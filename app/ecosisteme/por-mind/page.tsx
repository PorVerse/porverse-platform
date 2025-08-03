'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import './pormind.css';

export default function PorMindLanding() {
  useEffect(() => {
    // Navbar scroll effect
    const nav = document.getElementById('navbar');
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll);
    
    // Intersection Observer pentru animații
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar" id="navbar">
        <div className="container nav-content">
          <Link href="/" className="logo">🧠 PorMind</Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Acasă</Link>
            <Link href="/ecosisteme/por-health" className="nav-link">PorHealth</Link>
            <Link href="/ecosisteme/por-kids" className="nav-link">PorKids</Link>
            <Link href="/ecosisteme/por-mind" className="nav-link active">PorMind</Link>
            <Link href="/ecosisteme/por-well" className="nav-link">PorWell</Link>
            <Link href="/ecosisteme/por-flow" className="nav-link">PorFlow</Link>
            <Link href="/ecosisteme/por-blu" className="nav-link">PorBlu</Link>
            <Link href="/pricing" className="nav-link">Prețuri</Link>
          </div>
          <Link href="/auth/signup" className="cta-button">Începe Gratuit</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text fade-in">
            <h1>
              Transformă-ți <span className="highlight">Relația cu Banii</span> prin AI
            </h1>
            <p>
              PorMind este coach-ul tău personal de educație financiară care te învață să gândești ca un milionar. 
              AI avansat + psihologie financiară = Independența ta economică.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <strong>€2.3M</strong>
                <span>Economii generate pentru utilizatori</span>
              </div>
              <div className="stat">
                <strong>94%</strong>
                <span>Îmbunătățire money mindset în 30 zile</span>
              </div>
              <div className="stat">
                <strong>15%</strong>
                <span>Creștere medie venituri în 6 luni</span>
              </div>
            </div>
            <div className="hero-cta">
              <Link href="/auth/signup" className="btn-primary">
                🚀 Începe Gratuit 14 Zile
              </Link>
              <Link href="#demo" className="btn-secondary">
                👀 Vezi Demo AI
              </Link>
            </div>
          </div>
          <div className="hero-visual fade-in">
            <div className="financial-dashboard">
              <div className="dashboard-header">
                <h3>💰 AI Financial Coach</h3>
                <span className="live-indicator">● LIVE</span>
              </div>
              <div className="dashboard-content">
                <div className="insight-card">
                  <div className="insight-icon">💡</div>
                  <div className="insight-text">
                    <strong>AI Insight:</strong> Poți economisi €287/lună optimizând abonamentele și eliminând cheltuielile redundante.
                  </div>
                </div>
                <div className="metrics-row">
                  <div className="metric">
                    <span className="metric-label">Net Worth</span>
                    <span className="metric-value">€45,230</span>
                    <span className="metric-change">+12.3%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Savings Rate</span>
                    <span className="metric-value">28%</span>
                    <span className="metric-change">+8%</span>
                  </div>
                </div>
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Emergency Fund Goal</span>
                    <span>73%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '73%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="problem-section">
        <div className="container">
          <div className="problem-content fade-in">
            <h2>Știai că 78% din români nu au niciun plan financiar?</h2>
            <div className="problems-grid">
              <div className="problem-card">
                <div className="problem-icon">😰</div>
                <h3>Anxietate financiară</h3>
                <p>Te trezești noaptea gândindu-te la bani, facturi și viitor</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">📚</div>
                <h3>Lipsă educație</h3>
                <p>Nimeni nu te-a învățat cum să gestionezi, investești sau să înmulțești banii</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">🔄</div>
                <h3>Ciclul săraciei</h3>
                <p>Lucrezi din ce în ce mai mult dar banii se duc pe cheltuieli, nu pe investiții</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">🎯</div>
                <h3>Fără obiective</h3>
                <p>Nu ai un plan clar pentru independența financiară sau pensia ta</p>
              </div>
            </div>
            <div className="problem-cta">
              <p><strong>Ce dacă ai putea schimba totul în următoarele 30 de zile?</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="solution-section">
        <div className="container">
          <div className="solution-header fade-in">
            <h2>PorMind: Coach-ul AI care îți transformă mentalitatea financiară</h2>
            <p>Nu mai învăța din greșeli costisitoare. Folosește puterea AI pentru a lua decizii financiare inteligente.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card fade-in">
              <div className="feature-icon">🤖</div>
              <h3>AI Money Coach Personal</h3>
              <p>
                Coach conversațional disponibil 24/7 care analizează situația ta financiară și oferă sfaturi personalizate pentru fiecare decizie.
              </p>
              <div className="feature-demo">
                <div className="chat-preview">
                  <div className="chat-message ai">
                    <strong>AI Coach:</strong> Bazat pe analiza ta, recomand să aloci 20% din bonus către fondul de urgență și 50% către ETF-uri. Vrei să discutăm strategia?
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon">📊</div>
              <h3>Budget Optimization AI</h3>
              <p>
                Algoritmul analizează cheltuielile tale și identifică automat unde poți economisi, optimizând bugetul pentru obiectivele tale.
              </p>
              <div className="feature-stats">
                <div className="stat-item">
                  <span className="stat-number">€347</span>
                  <span className="stat-label">Economie medie/lună</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">87%</span>
                  <span className="stat-label">Acuratețe predicții</span>
                </div>
              </div>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon">📈</div>
              <h3>Investment Advisor</h3>
              <p>
                Primești recomandări de investiții personalizate bazate pe profilul tău de risc, obiective și cunoștințele despre piață.
              </p>
              <div className="investment-preview">
                <div className="portfolio-item">
                  <span>ETF World Index</span>
                  <span className="allocation">40%</span>
                  <span className="return positive">+8.2%</span>
                </div>
                <div className="portfolio-item">
                  <span>Bonds România</span>
                  <span className="allocation">30%</span>
                  <span className="return positive">+4.1%</span>
                </div>
              </div>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon">🧠</div>
              <h3>Money Mindset Transformation</h3>
              <p>
                Tehnici de psihologie comportamentală pentru a-ți schimba relația cu banii și a dezvolta mentalitatea abundenței.
              </p>
              <div className="mindset-insights">
                <div className="insight">💡 Identific și corectez blocajele tale financiare</div>
                <div className="insight">🎯 Dezvolt discipline și obiceiuri sănătoase</div>
                <div className="insight">🚀 Construiesc încrederea în deciziile financiare</div>
              </div>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon">🎯</div>
              <h3>Financial Goal Tracking</h3>
              <p>
                Stabilești obiective SMART și AI-ul îți creează planul step-by-step pentru a le atinge, cu tracking automat al progresului.
              </p>
              <div className="goals-preview">
                <div className="goal-item">
                  <div className="goal-info">
                    <strong>Emergency Fund</strong>
                    <span>€15,000 / €20,000</span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '75%' }}></div>
                    </div>
                    <span>75%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card fade-in">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Expense Analysis</h3>
              <p>
                Conectează conturile bancare și primești analize instant ale cheltuielilor cu alerte inteligente pentru bugetul depășit.
              </p>
              <div className="expense-alert">
                <div className="alert-header">
                  <span className="alert-icon">⚠️</span>
                  <strong>Buget Alert</strong>
                </div>
                <p>Ai depășit bugetul la "Distracție" cu €75 luna aceasta. Recomand să reduci ieșirile în weekend.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <h2 className="fade-in">Rezultate reale de la utilizatori PorMind</h2>
          <div className="testimonials-grid">
            <div className="testimonial fade-in">
              <div className="testimonial-header">
                <div className="user-avatar">AM</div>
                <div className="user-info">
                  <strong>Alexandra M.</strong>
                  <span>Marketing Manager</span>
                </div>
                <div className="result-badge">+€23k economia</div>
              </div>
              <div className="testimonial-text">
                "În 6 luni cu PorMind am economisit €23,000 și am învățat să investesc inteligent. AI-ul mi-a identificat cheltuieli ascunse pe care nici nu le observasem. Acum am un plan clar pentru independența financiară!"
              </div>
              <div className="testimonial-metrics">
                <div className="metric">
                  <span>Savings Rate:</span>
                  <span>12% → 31%</span>
                </div>
                <div className="metric">
                  <span>Investment ROI:</span>
                  <span>+14.2%</span>
                </div>
              </div>
            </div>

            <div className="testimonial fade-in">
              <div className="testimonial-header">
                <div className="user-avatar">RC</div>
                <div className="user-info">
                  <strong>Radu C.</strong>
                  <span>Software Developer</span>
                </div>
                <div className="result-badge">+€2.1k/lună</div>
              </div>
              <div className="testimonial-text">
                "Money Mindset Coaching a fost game-changer! Am trecut de la anxietate financiară la încredere totală. Acum câștig cu €2,100 mai mult pe lună prin consultanță și investiții smart recomandate de AI."
              </div>
              <div className="testimonial-metrics">
                <div className="metric">
                  <span>Debt:</span>
                  <span>€15k → €0</span>
                </div>
                <div className="metric">
                  <span>Side Income:</span>
                  <span>€2,100/lună</span>
                </div>
              </div>
            </div>

            <div className="testimonial fade-in">
              <div className="testimonial-header">
                <div className="user-avatar">MV</div>
                <div className="user-info">
                  <strong>Maria V.</strong>
                  <span>Antreprenor</span>
                </div>
                <div className="result-badge">+187% ROI</div>
              </div>
              <div className="testimonial-text">
                "Investment Advisor mi-a optimizat portofoliul și am avut 187% ROI în primul an! Recomandările AI sunt bazate pe date, nu pe emoții. Mi-a schimbat complet strategia de investiții."
              </div>
              <div className="testimonial-metrics">
                <div className="metric">
                  <span>Portfolio:</span>
                  <span>€50k → €143k</span>
                </div>
                <div className="metric">
                  <span>Risk Score:</span>
                  <span>Optimizat 94%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="pricing">
        <div className="container">
          <h2 className="fade-in">Investește în educația ta financiară</h2>
          <p className="pricing-subtitle fade-in">
            Costul unui curs de educație financiară: €2,000+. PorMind cu AI personal: mai puțin de €1/zi.
          </p>
          
          <div className="pricing-cards">
            <div className="pricing-card fade-in">
              <div className="plan-name">Starter</div>
              <div className="plan-price">Gratuit</div>
              <div className="plan-period">14 zile trial</div>
              <ul className="plan-features">
                <li>Budget tracking de bază</li>
                <li>3 întrebări AI/zi</li>
                <li>Analiză cheltuieli săptămânală</li>
                <li>1 obiectiv financiar</li>
                <li>Comunitatea PorMind</li>
              </ul>
              <Link href="/auth/signup" className="btn-secondary plan-button">
                Începe Gratuit
              </Link>
            </div>

            <div className="pricing-card featured fade-in">
              <div className="featured-badge">Cel mai popular</div>
              <div className="plan-name">PorMind Pro</div>
              <div className="plan-price">29 RON</div>
              <div className="plan-period">/lună (€6)</div>
              <ul className="plan-features">
                <li>AI Money Coach nelimitat 24/7</li>
                <li>Budget optimization automată</li>
                <li>Investment advisor cu recomandări</li>
                <li>Money mindset coaching program</li>
                <li>Obiective financiare nelimitate</li>
                <li>Analize predictive avansate</li>
                <li>Integrare conturi bancare</li>
                <li>Support prioritar</li>
              </ul>
              <Link href="/checkout?plan=pormind-pro" className="btn-primary plan-button">
                Începe cu 14 Zile Gratuit
              </Link>
              <div className="plan-savings">Economisești €2,000+ față de cursurile tradiționale</div>
            </div>

            <div className="pricing-card fade-in">
              <div className="plan-name">PorVerse Complete</div>
              <div className="plan-price">199 RON</div>
              <div className="plan-period">/lună (€40)</div>
              <ul className="plan-features">
                <li>Toate funcțiile PorMind Pro</li>
                <li>Acces la toate ecosistemele PorVerse</li>
                <li>AI cross-ecosystem integration</li>
                <li>Personal financial advisor 1-on-1</li>
                <li>Portofoliu management premium</li>
                <li>Tax optimization strategies</li>
                <li>Estate planning tools</li>
                <li>VIP support 24/7</li>
              </ul>
              <Link href="/checkout?plan=complete" className="btn-secondary plan-button">
                Upgrade la Complete
              </Link>
            </div>
          </div>

          <div className="pricing-guarantee fade-in">
            <div className="guarantee-badge">
              <span className="guarantee-icon">🛡️</span>
              <div className="guarantee-text">
                <strong>Garanție 60 de zile</strong>
                <p>Dacă nu îți îmbunătățești situația financiară, îți returnăm toți banii</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content fade-in">
            <h2>Începe transformarea financiară astăzi</h2>
            <p>
              Peste 10,000 de români și-au schimbat viața financiară cu PorMind. 
              Tu când îți începi drumul către independența economică?
            </p>
            <div className="cta-stats">
              <div className="cta-stat">
                <strong>€847</strong>
                <span>Economie medie în primele 60 zile</span>
              </div>
              <div className="cta-stat">
                <strong>94%</strong>
                <span>Utilizatori raportează money mindset îmbunătățit</span>
              </div>
              <div className="cta-stat">
                <strong>2.3x</strong>
                <span>Creștere medie savings rate în 6 luni</span>
              </div>
            </div>
            <div className="cta-buttons">
              <Link href="/auth/signup" className="btn-primary large">
                🚀 Începe Gratuit - 14 Zile
              </Link>
              <p className="cta-disclaimer">
                Fără card necesar • Anulare oricând • Garanție 60 zile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>PorMind</h3>
              <ul>
                <li><Link href="/ecosisteme/por-mind/features">Funcționalități</Link></li>
                <li><Link href="/ecosisteme/por-mind/pricing">Prețuri</Link></li>
                <li><Link href="/ecosisteme/por-mind/testimonials">Testimoniale</Link></li>
                <li><Link href="/ecosisteme/por-mind/blog">Blog Financial</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Ecosisteme</h3>
              <ul>
                <li><Link href="/ecosisteme/por-health">PorHealth</Link></li>
                <li><Link href="/ecosisteme/por-kids">PorKids</Link></li>
                <li><Link href="/ecosisteme/por-well">PorWell</Link></li>
                <li><Link href="/ecosisteme/por-flow">PorFlow</Link></li>
                <li><Link href="/ecosisteme/por-blu">PorBlu</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Educație</h3>
              <ul>
                <li><Link href="/learn/investing-basics">Investiții pentru începători</Link></li>
                <li><Link href="/learn/budgeting">Bugetarea inteligentă</Link></li>
                <li><Link href="/learn/money-psychology">Psihologia banilor</Link></li>
                <li><Link href="/learn/crypto">Crypto & DeFi</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Support</h3>
              <ul>
                <li><Link href="/support">Ajutor</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/legal/privacy">Confidențialitate</Link></li>
                <li><Link href="/legal/terms">Termeni</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 PorVerse. Toate drepturile rezervate.</p>
            <p className="footer-disclaimer">
              Investițiile implică riscuri. Rezultatele trecute nu garantează performanțele viitoare. 
              Consultă un advisor financiar pentru decizii importante.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}