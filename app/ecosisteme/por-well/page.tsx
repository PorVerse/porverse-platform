'use client';
import './style.css';

export default function PorWellLanding() {
  // --- Demo AI Chat Logic (doar pentru demo, nu persistă) ---
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
        let reply = "Perfect! Te pot ghida cu o meditație sau o tehnică rapidă. Spune-mi dacă vrei un exercițiu de respirație sau mindfulness!";
        if (val.includes("anxietate")) reply = "Pentru anxietate, recomand exercițiul ‘5-5-5’: inspiră 5 secunde, ține 5 secunde, expiră 5 secunde. Încearcă și spune-mi cum te simți!";
        if (val.includes("focus")) reply = "Ca să îți crești focusul, ia o pauză scurtă și folosește metoda Pomodoro: 25 min muncă, 5 min pauză. Vrei să-ți programez sesiunea?";
        ai.innerHTML = reply;
        chat.appendChild(ai);
        chat.scrollTop = chat.scrollHeight;
      }, 1100);
    }
  };

  const handleDemoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleDemoSend();
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container nav-content">
          <a href="/" className="logo">PorWell</a>
          <div className="nav-links">
            <a href="/" className="nav-link">Acasă</a>
            <a href="/ecosisteme/por-health" className="nav-link">PorHealth</a>
            <a href="/ecosisteme/por-mind" className="nav-link">PorMind</a>
            <a href="/ecosisteme/por-well" className="nav-link active">PorWell</a>
            <a href="/ecosisteme/por-flow" className="nav-link">PorFlow</a>
            <a href="/ecosisteme/por-blu" className="nav-link">PorBlu</a>
            <a href="/pricing" className="nav-link">Prețuri</a>
          </div>
          <a href="/auth/signup" className="cta-button">Începe Gratuit</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Echilibru mental și <span className="highlight">Wellbeing</span> la superlativ
              </h1>
              <p>
                Platforma AI care îți oferă instrumente reale pentru reducerea stresului, antrenarea rezilienței și recuperarea energiei mentale — personalizate pentru viața modernă.
              </p>
              <div className="hero-buttons">
                <a href="/auth/signup" className="btn-primary">Începe Gratuit 30 Zile</a>
                <a href="#demo" className="btn-secondary">Vezi Demo Live</a>
              </div>
              <div className="stats">
                <div className="stat">
                  <div className="stat-number">22.000+</div>
                  <div className="stat-label">Utilizatori relaxați</div>
                </div>
                <div className="stat">
                  <div className="stat-number">97%</div>
                  <div className="stat-label">Reducere stres</div>
                </div>
                <div className="stat">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support AI wellbeing</div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card">
                <h4 style={{ color: "var(--pw-secondary)", marginBottom: "0.5rem" }}>🧘‍♂️ Respirații ghidate</h4>
                <p style={{ color: "var(--pw-text-soft)", fontSize: "0.96rem" }}>2 min relaxare<br />Nivel stres -24%</p>
              </div>
              <div className="floating-card">
                <h4 style={{ color: "var(--pw-secondary)", marginBottom: "0.5rem" }}>📈 Mood Tracking</h4>
                <p style={{ color: "var(--pw-text-soft)", fontSize: "0.96rem" }}>6/10 &rarr; 8/10<br />Energie mentală crescută</p>
              </div>
              <div className="floating-card">
                <h4 style={{ color: "var(--pw-secondary)", marginBottom: "0.5rem" }}>🎧 Meditație AI</h4>
                <p style={{ color: "var(--pw-text-soft)", fontSize: "0.96rem" }}>5 min “Focus Flow”<br />Efect garantat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO AI SECTION */}
      <section className="ai-demo" id="demo">
        <div className="container">
          <h2>Testează asistentul AI pentru wellbeing</h2>
          <p>
            Pune orice întrebare despre stres, anxietate, focus sau motivație și AI-ul PorWell îți va oferi răspunsuri practice, personalizate pentru tine.
          </p>
          <div className="demo-container">
            <div className="chat-interface" id="chatInterface">
              <div className="message user">
                Am avut o zi stresantă, nu pot să-mi revin. Ce îmi recomanzi?
              </div>
              <div className="message ai">
                Îmi pare rău să aud! Pentru început, poți încerca o respirație ghidată “4-7-8” timp de 2 minute. <br /><br />
                Dacă vrei, te pot ghida acum sau poți accesa o meditație AI creată pentru reset mental rapid. <br />
                <strong>Vrei să continui cu un exercițiu scurt de relaxare?</strong>
              </div>
            </div>
            <div className="input-demo">
              <input
                type="text"
                className="demo-input"
                placeholder="Întreabă orice despre wellbeing..."
                id="demoInput"
                onKeyDown={handleDemoKeyDown}
                autoComplete="off"
              />
              <button className="btn-primary" type="button" onClick={handleDemoSend}>
                Trimite
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <button className="action-btn">
          <span className="action-btn-icon">🧘‍♂️</span>
          <span className="action-btn-text">Start meditație AI</span>
        </button>
        <button className="action-btn">
          <span className="action-btn-icon">📈</span>
          <span className="action-btn-text">Mood tracker</span>
        </button>
        <button className="action-btn">
          <span className="action-btn-icon">🌱</span>
          <span className="action-btn-text">Tehnici stres</span>
        </button>
        <button className="action-btn">
          <span className="action-btn-icon">💬</span>
          <span className="action-btn-text">Întreabă AI-ul</span>
        </button>
      </div>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="container">
          <div className="how-title">Cum funcționează PorWell</div>
          <div className="how-grid">
            <div className="how-step">
              <div className="how-step-icon">🔎</div>
              <div className="how-step-title">Evaluare AI wellbeing</div>
              <div className="how-step-desc">
                Completezi un mini-chestionar și AI-ul îți face profilul de stres, oboseală, motivație, energie mentală.
              </div>
            </div>
            <div className="how-step">
              <div className="how-step-icon">🎧</div>
              <div className="how-step-title">Plan personalizat & rutine</div>
              <div className="how-step-desc">
                Primești zilnic recomandări, exerciții ghidate, meditații și acțiuni personalizate pentru starea ta.
              </div>
            </div>
            <div className="how-step">
              <div className="how-step-icon">📈</div>
              <div className="how-step-title">Monitorizare progres & AI</div>
              <div className="how-step-desc">
                Progresul tău e monitorizat și AI-ul ajustează planul după fiecare zi pentru rezultate reale.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <div className="container">
          <h2>Instrumente AI pentru fiecare nevoie de wellbeing</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧘‍♀️</div>
              <h3>Meditație ghidată AI</h3>
              <p>
                Exerciții zilnice de mindfulness, cu voce AI și efecte sonore premium, adaptate stării tale de moment. Relaxare, focus, somn.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Reducere rapidă a stresului</h3>
              <p>
                Tehnici AI “anti-stres” testate, cu pași vizuali și suport motivațional pe tot parcursul zilei.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Mood & Energy tracker</h3>
              <p>
                Monitorizare automată a energiei mentale, fluctuațiilor de stare, și tipsuri pentru menținerea zen.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Chat AI wellbeing</h3>
              <p>
                Suport AI 24/7 pentru orice provocare — anxietate, lipsă de motivație, oboseală mentală sau resetare rapidă.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎧</div>
              <h3>Playlisturi AI & sunete</h3>
              <p>
                Muzică selectată de AI, sunete binaurale și white noise pentru focus, relaxare sau somn adânc.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Rutine wellbeing custom</h3>
              <p>
                Rutine zilnice personalizate: hidratare, pauze active, focus, meditații. Totul cu remindere inteligente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="pricing">
        <div className="container">
          <h2>Transformă-ți starea de bine — acces premium la prețuri accesibile</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="plan-name">Free Zen</div>
              <div className="plan-price">Gratuit</div>
              <div className="plan-period">Pentru totdeauna</div>
              <ul className="plan-features">
                <li>Instrumente AI wellbeing de bază</li>
                <li>1 meditație ghidată/zi</li>
                <li>2 exerciții stres/săpt</li>
                <li>Tracker stare și energie</li>
                <li>Support email</li>
              </ul>
              <a href="/auth/signup" className="btn-secondary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                Începe Gratuit
              </a>
            </div>
            <div className="pricing-card featured">
              <div className="featured-badge">Cel mai popular</div>
              <div className="plan-name">PorWell Pro</div>
              <div className="plan-price">19€</div>
              <div className="plan-period">/lună</div>
              <ul className="plan-features">
                <li>Meditații AI nelimitate</li>
                <li>Playlisturi AI & sunete speciale</li>
                <li>Chat AI 24/7</li>
                <li>Tracker avansat stres & energie</li>
                <li>Rutine wellbeing custom</li>
                <li>Support prioritar</li>
              </ul>
              <a href="/checkout?plan=porwell-pro" className="btn-primary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                30 Zile Gratuit
              </a>
            </div>
            <div className="pricing-card">
              <div className="plan-name">PorVerse Complete</div>
              <div className="plan-price">49€</div>
              <div className="plan-period">/lună</div>
              <ul className="plan-features">
                <li>Acces la toate ecosistemele</li>
                <li>AI cross-ecosystem</li>
                <li>Analize complexe</li>
                <li>Coaching wellbeing personalizat</li>
                <li>Garanție rezultate</li>
                <li>White-glove onboarding</li>
              </ul>
              <a href="/checkout?plan=complete" className="btn-secondary" style={{ width: "100%", textAlign: "center", display: "block" }}>
                14 Zile Gratuit
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <h2>Oameni reali, transformări reale</h2>
          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="testimonial-text">
                “Am încercat zeci de aplicații. PorWell e singura unde AI-ul chiar mă ajută să ies din anxietate și să-mi regăsesc focusul în fiecare zi.”
              </div>
              <div className="testimonial-author">Ruxandra P., Corporate</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                “Nu credeam că o platformă AI mă poate ajuta la burnout. După 2 săptămâni cu PorWell, simt că am resetat tot și pot să dorm iar liniștită.”
              </div>
              <div className="testimonial-author">Marius D., Marketing</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                “Obișnuiam să ignor stările mele. Acum AI-ul mă ajută să-mi monitorizez energia și să intervin rapid, nu mă mai las pe ultimul loc.”
              </div>
              <div className="testimonial-author">Andreea L., Freelance</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALĂ */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-card">
            <h2>Pornește azi – starea ta de bine nu așteaptă!</h2>
            <p>
              Încearcă toate instrumentele premium PorWell gratuit timp de 30 zile, fără card, fără stres. Dă start transformării tale mentale chiar acum.
            </p>
            <a href="/auth/signup" className="btn-primary" style={{ fontSize: "1.22rem", padding: "1.17rem 3.1rem" }}>
              Începe Gratuit Acum
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>PorWell</h3>
              <ul>
                <li><a href="/ecosisteme/por-well/features">Funcționalități</a></li>
                <li><a href="/ecosisteme/por-well/pricing">Prețuri</a></li>
                <li><a href="/ecosisteme/por-well/testimonials">Testimoniale</a></li>
                <li><a href="/ecosisteme/por-well/science">Cercetare</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Ecosisteme</h3>
              <ul>
                <li><a href="/ecosisteme/por-health">PorHealth</a></li>
                <li><a href="/ecosisteme/por-mind">PorMind</a></li>
                <li><a href="/ecosisteme/por-flow">PorFlow</a></li>
                <li><a href="/ecosisteme/por-blu">PorBlu</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Support</h3>
              <ul>
                <li><a href="/support">Ajutor</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/api-docs">API</a></li>
                <li><a href="/status">Status</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Legal</h3>
              <ul>
                <li><a href="/legal/privacy">Confidențialitate</a></li>
                <li><a href="/legal/terms">Termeni</a></li>
                <li><a href="/legal/cookies">Cookies</a></li>
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
