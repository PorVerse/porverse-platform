// app/auth/verify-email/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styles from './verify-email.module.css';

interface SignupData {
  firstName: string;
  lastName: string;
  ecosystems: string[];
  goals: string[];
}

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string>('');
  const [signupData, setSignupData] = useState<SignupData | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('signup_email');
    const storedData = localStorage.getItem('signup_data');
    
    setEmail(emailParam || storedEmail || '');
    
    if (storedData) {
      try {
        setSignupData(JSON.parse(storedData));
      } catch (e) {
        console.error('Error parsing signup data:', e);
      }
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard?welcome=true');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard?welcome=true');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleResendConfirmation = async () => {
    if (!email || !canResend) {
      setResendMessage('Te rog introdu adresa de email și așteaptă să se termine cronometrul');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          setResendMessage('❌ Prea multe email-uri trimise. Așteaptă 5 minute și încearcă din nou.');
        } else {
          setResendMessage(`❌ Eroare: ${error.message}`);
        }
      } else {
        setResendMessage('✅ Email de confirmare retrimis! Verifică inbox-ul și spam-ul.');
        setCanResend(false);
        setTimeLeft(60);
        
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      setResendMessage('❌ Eroare la retrimite email. Încearcă din nou.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.icon}>📧</div>
          <h1 className={styles.title}>Verifică-ți email-ul</h1>
          <p className={styles.subtitle}>
            {signupData?.firstName ? 
              `Salut ${signupData.firstName}! ` : 
              'Bine ai venit! '
            }
            Pentru a-ți activa contul PorVerse, verifică-ți inbox-ul și apasă pe link-ul de confirmare.
          </p>
        </div>

        {/* User Info Preview */}
        {signupData && (
          <div className={styles.userPreview}>
            <div className={styles.welcomeText}>
              <span className={styles.wave}>👋</span>
              <strong>{signupData.firstName} {signupData.lastName}</strong>
            </div>
            <div className={styles.selectedInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🎯</span>
                <span>{signupData.goals.length} obiective setate</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🌍</span>
                <span>{signupData.ecosystems.length} ecosisteme alese</span>
              </div>
            </div>
          </div>
        )}

        {/* Email Display */}
        <div className={styles.emailInfo}>
          <label className={styles.label}>Email trimis la:</label>
          <div className={styles.emailDisplay}>
            <span className={styles.emailIcon}>✉️</span>
            <span className={styles.emailText}>{email || 'adresa@ta.com'}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <h3>📋 Următorii pași:</h3>
          <ol className={styles.stepsList}>
            <li>
              <strong>Deschide email-ul</strong> - Verifică inbox-ul și folder-ul spam
            </li>
            <li>
              <strong>Găsește email-ul de la PorVerse</strong> - Subiect: "Bun venit în PorVerse!"
            </li>
            <li>
              <strong>Apasă pe butonul "Confirmă Email"</strong> - Link-ul este valabil 24 ore
            </li>
            <li>
              <strong>Vei fi redirectat înapoi</strong> - Pentru a-ți accesa dashboard-ul
            </li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className={styles.troubleshooting}>
          <details className={styles.accordion}>
            <summary>🤔 Nu găsești email-ul?</summary>
            <div className={styles.accordionContent}>
              <ul>
                <li>✓ Verifică folder-ul <strong>Spam/Junk</strong> și <strong>Promoții</strong></li>
                <li>✓ Caută după expeditorul <strong>noreply@porverse.ro</strong></li>
                <li>✓ Verifică că ai introdus email-ul corect mai jos</li>
                <li>✓ Așteaptă până la 5 minute pentru livrare</li>
                <li>✓ Încearcă să adaugi domeniul @porverse.ro în lista de expeditori siguri</li>
              </ul>
            </div>
          </details>
        </div>

        {/* Resend Section */}
        <div className={styles.resendSection}>
          <h4>📮 Retrimite email de confirmare</h4>
          <div className={styles.resendForm}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Introdu email-ul tău"
              className={styles.emailInput}
            />
            <button
              onClick={handleResendConfirmation}
              disabled={isResending || !email || !canResend}
              className={styles.resendButton}
            >
              {isResending ? (
                <>
                  <span className={styles.spinner}></span>
                  Se trimite...
                </>
              ) : !canResend ? (
                <>
                  ⏰ Așteaptă {timeLeft}s
                </>
              ) : (
                <>
                  🔄 Retrimite email
                </>
              )}
            </button>
          </div>
          
          {resendMessage && (
            <div className={`${styles.message} ${resendMessage.includes('✅') ? styles.success : styles.error}`}>
              {resendMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <Link href="/auth/login" className={styles.linkButton}>
            ← Înapoi la Login
          </Link>
          <Link href="/support" className={styles.linkButton}>
            🆘 Ajutor & Support
          </Link>
        </div>

        {/* Contact Info */}
        <div className={styles.contactInfo}>
          <p className={styles.helpText}>
            <strong>Încă ai probleme?</strong><br />
            Contactează-ne la <a href="mailto:support@porverse.ro">support@porverse.ro</a> și îți vom rezolva contul în mai puțin de 30 minute.
          </p>
        </div>
      </div>
    </div>
  );
}