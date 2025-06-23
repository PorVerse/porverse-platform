'use client';
import './style.css';
import { useEffect } from 'react';
import Link from 'next/link';

export default function PorKidsLanding() {
  useEffect(() => {
    // Navbar scroll effect (adaptezi după PorHealth)
    const nav = document.getElementById('navbar');
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar" id="navbar">
        <div className="container nav-content">
          <Link href="/" className="logo">PorKids</Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Acasă</Link>
            <Link href="/ecosisteme/por-health" className="nav-link">PorHealth</Link>
            <Link href="/ecosisteme/por-mind" className="nav-link">PorMind</Link>
            <Link href="/ecosisteme/por-well" className="nav-link">PorWell</Link>
            <Link href="/ecosisteme/por-flow" className="nav-link">PorFlow</Link>
            <Link href="/ecosisteme/por-blu" className="nav-link">PorBlu</Link>
            <Link href="/ecosisteme/por-kids" className="nav-link active">PorKids</Link>
            <Link href="/pricing" className="nav-link">Prețuri</Link>
          </div>
          <Link href="/auth/signup" className="cta-button">Începe Gratuit</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1>
              Învățarea devine <span className="highlight">JOACĂ</span> și <span className="highlight">EXPLORARE</span>
            </h1>
            <p>
              PorKids este asistentul AI care ajută copiii să-și organizeze temele, să scaneze pagini de caiet și să primească explicații personalizate pe înțelesul lor. Descoperă cum poți transforma învățarea într-o aventură!
            </p>
            <div className="hero-buttons">
              <Link href="/auth/signup" className="btn-primary">Începe Gratuit 30 Zile</Link>
              <a href="#demo" className="btn-secondary">Vezi Demo Live</a>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="stat-number">25k+</div>
                <div className="stat-label">Copii ajutați</div>
              </div>
              <div className="stat">
                <div className="stat-number">98%</div>
                <div className="stat-label">Progres real</div>
              </div>
              <div className="stat">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Ajutor AI instant</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            {/* Poți pune un SVG/PNG cu temă educațională sau 3 carduri animate */}
            <div className="floating-card">
              <h4 style={{ color: "var(--pk-primary)", marginBottom: "0.5rem" }}>📚 Scanner temă</h4>
              <p style={{ color: "var(--pk-text-secondary)", fontSize: "1rem" }}>
                Fă poză la exercițiu <br />Primești explicații pas-cu-pas
              </p>
            </div>
            <div className="floating-card">
              <h4 style={{ color: "var(--pk-primary)", marginBottom: "0.5rem" }}>🧠 Exerciții interactive</h4>
              <p style={{ color: "var(--pk-text-secondary)", fontSize: "1rem" }}>
                Teste și provocări <br />Feedback pe loc
              </p>
            </div>
            <div className="floating-card">
              <h4 style={{ color: "var(--pk-primary)", marginBottom: "0.5rem" }}>🎨 Joacă și creativitate</h4>
              <p style={{ color: "var(--pk-text-secondary)", fontSize: "1rem" }}>
                Jocuri educaționale <br />Progres vizibil
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* FEATURES SECTION */}
      <section className="features">
        <div className="container">
          <h2>Funcționalități unice pentru copii isteți</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧩</div>
              <h3>Teste interactive</h3>
              <p>
                Întrebări adaptate progresului fiecărui copil, cu feedback instant și statistici de performanță. Înveți fără stres, exact pe stilul tău!
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📓</div>
              <h3>Caiete personalizate</h3>
              <p>
                Generăm automat exerciții și teme pe baza fișelor sau paginilor scanate. Organizare perfectă pentru orice clasă sau materie.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Scanner AI teme</h3>
              <p>
                Scanează orice pagină, PDF sau fotografie și primești explicații detaliate pe înțelesul tău, ca și cum ai avea un profesor privat în buzunar!
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Progres și motivație</h3>
              <p>
                Sistem de insigne, streak-uri și misiuni. Învățarea devine o aventură, iar fiecare progres e sărbătorit!
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍👩‍👧‍👦</div>
              <h3>Colaborare părinte-copil</h3>
              <p>
                Părinții primesc rapoarte și recomandări de la AI. Pot urmări evoluția copilului și pot interveni exact când contează.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎲</div>
              <h3>Joacă educațională</h3>
              <p>
                Jocuri și provocări care dezvoltă creativitatea, logica și spiritul de echipă. Copilul tău învață zâmbind!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI DEMO SECTION */}
      <section className="ai-demo" id="demo">
        <div className="container">
          <h2>Experimentează AI-ul PorKids</h2>
          <p>
            Vezi cum copilul tău poate primi explicații pas-cu-pas la orice temă sau problemă, exact ca la un profesor privat digital!
          </p>
          <div className="demo-container">
            <div className="chat-interface" id="chatInterface">
              <div className="message user">
                Am de rezolvat 4x + 8 = 20. Cum fac?
              </div>
              <div className="message ai">
                <b>Pasul 1:</b> Scade 8 din ambele părți: 4x + 8 <b>- 8</b> = 20 <b>- 8</b> → <b>4x = 12</b><br />
                <b>Pasul 2:</b> Împarte tot la 4: 4x <b>/ 4</b> = 12 <b>/ 4</b> → <b>x = 3</b><br />
                Bravo! Rezultatul este <b>x = 3</b>.
              </div>
            </div>
            <div className="input-demo">
              <input type="text" className="demo-input" placeholder="Întreabă orice despre teme..." id="demoInput" />
              <button className="btn-primary" onClick={() => {
                // Simulare demo (poți lăsa goală pentru landing)
              }}>Trimite</button>
            </div>
          </div>
        </div>
      </section>
      {/* PRICING SECTION */}
      <section className="pricing">
        <div className="container">
          <h2>Planuri flexibile pentru evoluția copilului tău</h2>
          <p style={{ color: "var(--pk-text-secondary)", fontSize: "1.15rem", marginBottom: "2.1rem" }}>
            Poți începe gratuit sau poți debloca toate funcțiile premium!
          </p>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="plan-name">Starter</div>
              <div className="plan-price">Gratuit</div>
              <div className="plan-period">Pentru totdeauna</div>
              <ul className="plan-features">
                <li>Acces la scanare temă</li>
                <li>Teste interactive zilnice</li>
                <li>Raport săptămânal pentru părinți</li>
                <li>Joacă educațională</li>
                <li>Helpdesk AI</li>
              </ul>
              <Link href="/auth/signup" className="btn-secondary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                Începe Gratuit
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="featured-badge">Cel mai popular</div>
              <div className="plan-name">PorKids Pro</div>
              <div className="plan-price">14€</div>
              <div className="plan-period">/lună</div>
              <ul className="plan-features">
                <li>Scanner AI nelimitat</li>
                <li>Exerciții și teme personalizate</li>
                <li>Feedback audio-video AI</li>
                <li>Rapoarte detaliate pentru părinți</li>
                <li>Insigne, misiuni și streak-uri</li>
                <li>Helpdesk AI avansat 24/7</li>
              </ul>
              <Link href="/checkout?plan=porkids-pro" className="btn-primary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                14 Zile Gratuit
              </Link>
            </div>

            <div className="pricing-card">
              <div className="plan-name">PorVerse Complete</div>
              <div className="plan-price">49€</div>
              <div className="plan-period">/lună</div>
              <ul className="plan-features">
                <li>Acces la toate ecosistemele PorVerse</li>
                <li>AI cross-ecosystem</li>
                <li>Suport 1-on-1 lunar pentru părinți</li>
                <li>Rapoarte și analytics avansate</li>
                <li>Garanție rezultate școlare</li>
                <li>Early Access la noi funcționalități</li>
              </ul>
              <Link href="/checkout?plan=complete" className="btn-secondary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                7 Zile Gratuit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials">
        <div className="container">
          <h2>Ce spun copiii și părinții despre PorKids</h2>
          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="testimonial-text">
                "PorKids m-a ajutat să rezolv temele la mate fără să mă stresez! Scannerul AI îmi explică totul pe înțelesul meu și fac progrese la fiecare exercițiu."
              </div>
              <div className="testimonial-author">Alex, 10 ani</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                "Copilul meu și-a recăpătat încrederea la școală. Temele nu mai sunt o corvoadă, iar eu primesc rapoarte clare și știu mereu unde are nevoie de ajutor."
              </div>
              <div className="testimonial-author">Ioana, mama lui Alex</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                "Recomand PorKids tuturor părinților. Funcțiile de joacă educațională și feedback-ul instant fac diferența. Este un ajutor real pentru familie!"
              </div>
              <div className="testimonial-author">Andrei, tată</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-card">
            <h2>Transformă învățarea într-o aventură!</h2>
            <p>
              Copilul tău merită cel mai bun start. Încearcă PorKids și descoperă viitorul educației personalizate – 14 zile gratuit, fără card necesar.
            </p>
            <Link href="/auth/signup" className="btn-primary" style={{ fontSize: "1.13rem", padding: "1.1rem 2.8rem" }}>
              Începe Gratuit Acum
            </Link>
          </div>
        </div>
      </section>
      {/* FOOTER SECTION */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-section">
            <h3>PorKids</h3>
            <ul>
              <li><Link href="/ecosisteme/por-kids/features">Funcționalități</Link></li>
              <li><Link href="/ecosisteme/por-kids/pricing">Prețuri</Link></li>
              <li><Link href="/ecosisteme/por-kids/testimonials">Testimoniale</Link></li>
              <li><Link href="/ecosisteme/por-kids/science">Cercetare</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Ecosisteme</h3>
            <ul>
              <li><Link href="/ecosisteme/por-health">PorHealth</Link></li>
              <li><Link href="/ecosisteme/por-mind">PorMind</Link></li>
              <li><Link href="/ecosisteme/por-well">PorWell</Link></li>
              <li><Link href="/ecosisteme/por-flow">PorFlow</Link></li>
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
          <p>&copy; 2025 PorVerse. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </>
  );
}
