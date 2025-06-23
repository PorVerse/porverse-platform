'use client';

import './style.css';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PorHealthLandingPage() {
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function sendDemoMessage() {
    const input = document.getElementById('demoInput') as HTMLInputElement | null;
    const chatInterface = document.getElementById('chatInterface');

    if (!input || !chatInterface || input.value.trim() === '') return;

    const userInput = input.value;
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.textContent = userInput;
    chatInterface.appendChild(userMessage);
    input.value = '';

    setTimeout(() => {
      const aiMessage = document.createElement('div');
      aiMessage.className = 'message ai';
      let response = "Excelentă întrebare! 🌟 Bazat pe profilul tău, îți recomand să începi cu obiective SMART pentru sănătate.";

      if (/antrenament|fitness/i.test(userInput)) {
        response = "Pentru fitness optimal, îți sugerez o combinație de 3 antrenamente cardio și 2 de forță pe săptămână.";
      } else if (/mâncare|nutriție|alimente/i.test(userInput)) {
        response = "Nutriția e 70% din succesul tău! 🥗 Hai să creăm un plan alimentar sustenabil și delicios.";
      }

      aiMessage.innerHTML = response;
      chatInterface.appendChild(aiMessage);
      chatInterface.scrollTop = chatInterface.scrollHeight;
    }, 1000);

    chatInterface.scrollTop = chatInterface.scrollHeight;
  }

  return (
    <>
      <nav className="navbar" id="navbar">
        <div className="container">
          <div className="nav-content">
            <Link href="/" className="logo">PorVerse</Link>
            <div className="nav-links">
              <Link href="/" className="nav-link">Acasă</Link>
              <Link href="/ecosisteme/por-health" className="nav-link active">PorHealth</Link>
              <Link href="/ecosisteme/por-mind" className="nav-link">PorMind</Link>
              <Link href="/ecosisteme/por-well" className="nav-link">PorWell</Link>
              <Link href="/ecosisteme/por-flow" className="nav-link">PorFlow</Link>
              <Link href="/ecosisteme/por-blu" className="nav-link">PorBlu</Link>
              <Link href="/pricing" className="nav-link">Prețuri</Link>
            </div>
            <Link href="/auth/signup" className="cta-button">Începe Gratuit</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Transformă-ți <span className="highlight">Sănătatea</span> cu AI Personal</h1>
              <p>Asistentul tău AI pentru nutriție personalizată, antrenamente inteligente și coaching wellness 24/7. Rezultate reale, științifice și personalizate pentru stilul tău de viață.</p>
              <div className="hero-buttons">
                <Link href="/auth/signup" className="btn-primary">Începe Gratuit 30 Zile</Link>
                <a href="#demo" className="btn-secondary">Vezi Demo Live</a>
              </div>
              <div className="stats">
                <div className="stat">
                  <div className="stat-number">50k+</div>
                  <div className="stat-label">Utilizatori activi</div>
                </div>
                <div className="stat">
                  <div className="stat-number">92%</div>
                  <div className="stat-label">Îmbunătățire sănătate</div>
                </div>
                <div className="stat">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support AI personal</div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card">
                <h4>📊 Analiză Nutrițională</h4>
                <p>Proteine: 85g | Carbohidrați: 120g<br />Optimizare pentru obiectivul tău</p>
              </div>
              <div className="floating-card">
                <h4>🏃‍♂️ Antrenament AI</h4>
                <p>Plan personalizat azi<br />3 exerciții pentru core</p>
              </div>
              <div className="floating-card">
                <h4>😴 Monitorizare Somn</h4>
                <p>7h 23min somn de calitate<br />Optimizări pentru mâine</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>AI Personal pentru Fiecare Aspect al Sănătății Tale</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🥗</div>
              <h3>Nutriție Personalizată</h3>
              <p>AI-ul analizează obiectivele, alergiile și preferințele tale pentru a crea planuri de nutriție perfecte. Rețete, liste de cumpărături și tracking automat al macronutrienților.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💪</div>
              <h3>Antrenamente Inteligente</h3>
              <p>Programe de exerciții adaptate în timp real pe baza progresului tău. De la începător la expert, AI-ul optimizează fiecare mișcare pentru rezultate maxime.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">😴</div>
              <h3>Optimizare Somn</h3>
              <p>Monitorizează calitatea somnului și primește recomandări personalizate pentru odihnă optimă. Rutine de seară și strategii pentru somn profund.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Integrare Wearables</h3>
              <p>Conectează Apple Watch, Fitbit sau alte dispozitive pentru monitoring continuu. Date în timp real pentru ajustări precise ale planului tău.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧬</div>
              <h3>Analize Biometrice</h3>
              <p>Urmărește progreses în greutate, masa musculară, procent de grăsime și energie. Grafice detaliate și predicții pentru obiectivele tale.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Coaching Motivațional</h3>
              <p>AI care te înțelege și te motivează. Mesaje personalizate, reamintiri inteligente și strategii pentru a rămâne pe drumul cel bun.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-demo" id="demo">
        <div className="container">
          <h2>Experimentează Puterea AI-ului PorHealth</h2>
          <p>Vezi cum asistentul tău personal AI înțelege nevoile tale și oferă sfaturi precise pentru sănătatea ta.</p>
          <div className="demo-container">
            <div className="chat-interface" id="chatInterface">
              <div className="message user">
                Salut! Vreau să încep să mănânc mai sănătos, dar am puțin timp. Ce îmi recomanzi?
              </div>
              <div className="message ai">
                Salut! 👋 Înțeleg perfect - timpul e prețios! Bazat pe profilul tău, îți recomand meal prep-ul: <br /><br />
                🥗 <strong>Planul "Quick & Healthy":</strong><br />
                • Duminica: 2h prep pentru toată săptămâna<br />
                • 5 mese echilibrate, gata în 3 minute<br />
                • Ingrediente simple: pui, quinoa, legume<br /><br />
                Vrei să îți generez o listă de cumpărături și programul de prep?
              </div>
            </div>

            <div className="input-demo">
              <input type="text" className="demo-input" placeholder="Întreabă orice despre sănătate..." id="demoInput" />
              <button className="btn-primary" onClick={sendDemoMessage}>Trimite</button>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing">
        <div className="container">
          <h2>Investește în Sănătatea Ta</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>
            Alege planul perfect pentru transformarea ta
          </p>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="plan-name">Starter</div>
              <div className="plan-price">Gratuit</div>
              <div className="plan-period">Pentru totdeauna</div>
              <ul className="plan-features">
                <li>Chat AI de bază</li>
                <li>3 rețete/zi</li>
                <li>Tracking basic nutriție</li>
                <li>1 antrenament/săptămână</li>
                <li>Support email</li>
              </ul>
              <Link href="/auth/signup" className="btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>Începe Gratuit</Link>
            </div>

            <div className="pricing-card featured">
              <div className="featured-badge">Cel mai popular</div>
              <div className="plan-name">PorHealth Pro</div>
              <div className="plan-price">19€</div>
              <div className="plan-period">/lună</div>
              <ul className="plan-features">
                <li>AI personal avansat</li>
                <li>Rețete & planuri nelimitate</li>
                <li>Antrenamente personalizate</li>
                <li>Integrare wearables</li>
                <li>Analize biometrice</li>
                <li>Coaching motivațional</li>
                <li>Support prioritar 24/7</li>
              </ul>
              <Link href="/checkout?plan=porhealth-pro" className="btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>30 Zile Gratuit</Link>
            </div>

            <div className="pricing-card">
              <div className="plan-name">PorVerse Complete</div>
              <div className="plan-price">49€</div>
              <div className="plan-period">/lună</div>
              <ul className="plan-features">
                <li>Toate ecosistemele PorVerse</li>
                <li>AI cross-ecosystem</li>
                <li>Analize complexe</li>
                <li>Coaching 1-on-1 lunar</li>
                <li>Acces early la features</li>
                <li>White-glove onboarding</li>
                <li>Garanție rezultate</li>
              </ul>
              <Link href="/checkout?plan=complete" className="btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>14 Zile Gratuit</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container">
          <h2>Transformări Reale</h2>
          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="testimonial-text">
                "În 3 luni cu PorHealth am slăbit 12kg și am cel mai bun nivel de energie ever. AI-ul înțelege perfect stilul meu de viață ocupat și se adaptează la programul meu."
              </div>
              <div className="testimonial-author">Maria T., Marketing Manager</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                "Ca dezvoltator, stau mult la birou. PorHealth mi-a creat rutine de antrenament perfect pentru casă și tracking-ul automat m-a motivat să continui. Game changer!"
              </div>
              <div className="testimonial-author">Alex D., Software Developer</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                "Recomandările de nutriție sunt spot-on! Mi-a identificat deficiențele și a optimizat energia pentru antrenamente. Cel mai bun investiment în sănătatea mea."
              </div>
              <div className="testimonial-author">Andrei M., Personal Trainer</div>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <div className="cta-card">
            <h2>Începe Transformarea Azi</h2>
            <p>Accesează puterea AI-ului pentru cea mai bună versiune a ta. 30 de zile gratuit, fără card necesar.</p>
            <Link href="/auth/signup" className="btn-primary" style={{ fontSize: '1.2rem', padding: '1.2rem 3rem' }}>Începe Gratuit Acum</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>PorHealth</h3>
              <ul>
                <li><Link href="/ecosisteme/por-health/features">Funcționalități</Link></li>
                <li><Link href="/ecosisteme/por-health/pricing">Prețuri</Link></li>
                <li><Link href="/ecosisteme/por-health/testimonials">Testimoniale</Link></li>
                <li><Link href="/ecosisteme/por-health/science">Cercetare</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Ecosisteme</h3>
              <ul>
                <li><Link href="/ecosisteme/por-mind">PorMind</Link></li>
                <li><Link href="/ecosisteme/por-well">PorWell</Link></li>
                <li><Link href="/ecosisteme/por-flow">PorFlow</Link></li>
                <li><Link href="/ecosisteme/por-blu">PorBlu</Link></li>
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
            <p>© 2025 PorVerse. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
