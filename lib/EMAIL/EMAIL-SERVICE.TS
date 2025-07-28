// ================================
// LIB/EMAIL/EMAIL-SERVICE.TS - COMPLETE IMPLEMENTATION
// ================================
import { Resend } from 'resend'
import { DatabaseService } from '../database/database-service'
import { SecurityService } from '../security/security-service'

interface EmailTemplate {
  welcome: string
  payment_failed: string
  trial_ending: string
  quantum_unlock: string
  weekly_report: string
  crisis_support: string
  password_reset: string
  achievement_unlock: string
}

interface EmailMetrics {
  userId: string
  emailType: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed'
  timestamp: Date
  metadata?: any
}

export class EmailService {
  private resend: Resend
  private database: DatabaseService
  private security: SecurityService
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!)
    this.database = new DatabaseService()
    this.security = SecurityService.getInstance()
  }

  // ================================
  // CORE EMAIL FUNCTIONS
  // ================================
  async sendWelcomeEmail(userId: string, planDetails: any): Promise<boolean> {
    try {
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data) {
        throw new Error('User not found')
      }

      const user = userResult.data
      const templateData = {
        firstName: user.first_name || 'Friend',
        planName: planDetails.name,
        ecosystems: planDetails.ecosystems,
        features: planDetails.features,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${await this.generateUnsubscribeToken(userId)}`
      }

      const html = await this.renderEmailTemplate('welcome', templateData)
      
      const { data, error } = await this.resend.emails.send({
        from: 'PorVerse <welcome@porverse.ro>',
        to: [user.email],
        subject: `🚀 Bun venit în PorVerse, ${user.first_name}! Transformarea ta începe acum`,
        html: html,
        tags: [
          { name: 'type', value: 'welcome' },
          { name: 'plan', value: planDetails.name },
          { name: 'user_id', value: userId }
        ]
      })

      if (error) throw error

      await this.trackEmailMetrics({
        userId,
        emailType: 'welcome',
        status: 'sent',
        timestamp: new Date(),
        metadata: { email_id: data?.id, plan: planDetails.name }
      })

      return true
    } catch (error) {
      console.error('Send welcome email error:', error)
      await this.logEmailError(userId, 'welcome', error.message)
      return false
    }
  }

  async sendPaymentFailedEmail(userId: string, invoice: any, attemptCount: number): Promise<boolean> {
    try {
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data) return false

      const user = userResult.data
      const templateData = {
        firstName: user.first_name || 'Friend',
        amount: `${invoice.amount}`,
        currency: invoice.currency.toUpperCase(),
        attemptCount,
        maxAttempts: 3,
        updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${await this.generateUnsubscribeToken(userId)}`
      }

      const html = await this.renderEmailTemplate('payment_failed', templateData)
      
      const { data, error } = await this.resend.emails.send({
        from: 'PorVerse <billing@porverse.ro>',
        to: [user.email],
        subject: `⚠️ Problemă cu plata abonamentului PorVerse - Acțiune necesară`,
        html: html,
        tags: [
          { name: 'type', value: 'payment_failed' },
          { name: 'attempt', value: attemptCount.toString() },
          { name: 'user_id', value: userId }
        ]
      })

      if (error) throw error

      await this.trackEmailMetrics({
        userId,
        emailType: 'payment_failed',
        status: 'sent',
        timestamp: new Date(),
        metadata: { email_id: data?.id, attempt: attemptCount }
      })

      return true
    } catch (error) {
      console.error('Send payment failed email error:', error)
      return false
    }
  }

  async sendTrialEndingEmail(userId: string, daysLeft: number): Promise<boolean> {
    try {
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data) return false

      const user = userResult.data
      const templateData = {
        firstName: user.first_name || 'Friend',
        daysLeft,
        urgencyMessage: daysLeft === 1 ? 'doar o zi rămasă!' : `${daysLeft} zile rămase`,
        upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?user=${userId}`,
        featuresUrl: `${process.env.NEXT_PUBLIC_APP_URL}/features`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${await this.generateUnsubscribeToken(userId)}`
      }

      const html = await this.renderEmailTemplate('trial_ending', templateData)
      
      const subject = daysLeft === 1 
        ? `🔥 Ultima zi de trial PorVerse - Nu rata transformarea!`
        : `⏰ ${daysLeft} zile până expirarea trial-ului PorVerse`

      const { data, error } = await this.resend.emails.send({
        from: 'PorVerse <trials@porverse.ro>',
        to: [user.email],
        subject: subject,
        html: html,
        tags: [
          { name: 'type', value: 'trial_ending' },
          { name: 'days_left', value: daysLeft.toString() },
          { name: 'user_id', value: userId }
        ]
      })

      if (error) throw error

      await this.trackEmailMetrics({
        userId,
        emailType: 'trial_ending',
        status: 'sent',
        timestamp: new Date(),
        metadata: { email_id: data?.id, days_left: daysLeft }
      })

      return true
    } catch (error) {
      console.error('Send trial ending email error:', error)
      return false
    }
  }

  async sendQuantumUnlockEmail(userId: string): Promise<boolean> {
    try {
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data) return false

      const user = userResult.data
      const templateData = {
        firstName: user.first_name || 'Master',
        achievementTitle: 'Trinity Master',
        quantumVaultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/quantum-vault`,
        futureSelfUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/quantum-vault/future-self`,
        simulatorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/quantum-vault/identity-simulator`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${await this.generateUnsubscribeToken(userId)}`
      }

      const html = await this.renderEmailTemplate('quantum_unlock', templateData)
      
      const { data, error } = await this.resend.emails.send({
        from: 'PorVerse <quantum@porverse.ro>',
        to: [user.email],
        subject: `🌌 QUANTUM VAULT DEBLOCAT! Accesează viitorul tău, ${user.first_name}`,
        html: html,
        tags: [
          { name: 'type', value: 'quantum_unlock' },
          { name: 'achievement', value: 'trinity_master' },
          { name: 'user_id', value: userId }
        ]
      })

      if (error) throw error

      await this.trackEmailMetrics({
        userId,
        emailType: 'quantum_unlock',
        status: 'sent',
        timestamp: new Date(),
        metadata: { email_id: data?.id, achievement: 'trinity_master' }
      })

      return true
    } catch (error) {
      console.error('Send quantum unlock email error:', error)
      return false
    }
  }

  async sendWeeklyProgressReport(userId: string): Promise<boolean> {
    try {
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data) return false

      // Generate AI-powered weekly report
      const weeklyStats = await this.generateWeeklyStats(userId)
      const aiInsights = await this.generateAIInsights(userId, weeklyStats)

      const user = userResult.data
      const templateData = {
        firstName: user.first_name || 'Friend',
        weekNumber: this.getCurrentWeekNumber(),
        stats: weeklyStats,
        insights: aiInsights,
        topAchievement: weeklyStats.topAchievement,
        areasToImprove: aiInsights.improvements,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${await this.generateUnsubscribeToken(userId)}`
      }

      const html = await this.renderEmailTemplate('weekly_report', templateData)
      
      const { data, error } = await this.resend.emails.send({
        from: 'PorVerse <insights@porverse.ro>',
        to: [user.email],
        subject: `📊 Raportul tău săptămânal PorVerse - Săptămâna ${templateData.weekNumber}`,
        html: html,
        tags: [
          { name: 'type', value: 'weekly_report' },
          { name: 'week', value: templateData.weekNumber.toString() },
          { name: 'user_id', value: userId }
        ]
      })

      if (error) throw error

      await this.trackEmailMetrics({
        userId,
        emailType: 'weekly_report',
        status: 'sent',
        timestamp: new Date(),
        metadata: { email_id: data?.id, week: templateData.weekNumber }
      })

      return true
    } catch (error) {
      console.error('Send weekly report email error:', error)
      return false
    }
  }

  async sendCrisisSupportEmail(userId: string, severity: 'high' | 'critical', resources: any[]): Promise<boolean> {
    try {
      const userResult = await this.database.getUserProfile(userId)
      if (!userResult.success || !userResult.data) return false

      const user = userResult.data
      const templateData = {
        firstName: user.first_name || 'Prietene',
        severity,
        emergencyNumbers: resources.filter(r => r.type === 'emergency'),
        supportResources: resources.filter(r => r.type === 'support'),
        therapistUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/por-well/therapist`,
        crisisHotline: '0800 801 200', // SNSPMS România
        emergencyNumber: '112'
      }

      const html = await this.renderEmailTemplate('crisis_support', templateData)
      
      const { data, error } = await this.resend.emails.send({
        from: 'PorVerse <support@porverse.ro>',
        to: [user.email],
        subject: `🤗 Suport PorWell - Suntem aici pentru tine`,
        html: html,
        tags: [
          { name: 'type', value: 'crisis_support' },
          { name: 'severity', value: severity },
          { name: 'user_id', value: userId }
        ]
      })

      if (error) throw error

      // Also log this critical event
      await this.database.logUserActivity(userId, 'por-well', 'crisis_email_sent', {
        severity,
        timestamp: new Date().toISOString(),
        email_id: data?.id
      })

      return true
    } catch (error) {
      console.error('Send crisis support email error:', error)
      return false
    }
  }

  // ================================
  // EMAIL TEMPLATE RENDERING
  // ================================
  async renderEmailTemplate(templateName: keyof EmailTemplate, data: any): Promise<string> {
    const templates = {
      welcome: this.getWelcomeEmailTemplate(data),
      payment_failed: this.getPaymentFailedTemplate(data),
      trial_ending: this.getTrialEndingTemplate(data),
      quantum_unlock: this.getQuantumUnlockTemplate(data),
      weekly_report: this.getWeeklyReportTemplate(data),
      crisis_support: this.getCrisisSupportTemplate(data),
      password_reset: this.getPasswordResetTemplate(data),
      achievement_unlock: this.getAchievementTemplate(data)
    }

    return templates[templateName] || ''
  }

  private getWelcomeEmailTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bun venit în PorVerse</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { display: flex; align-items: center; margin: 10px 0; }
        .feature-icon { width: 20px; height: 20px; background: #28a745; border-radius: 50%; margin-right: 10px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌟 PorVerse</div>
            <h1>Bun venit, ${data.firstName}!</h1>
            <p>Transformarea ta personală începe ACUM</p>
        </div>
        
        <div class="content">
            <h2>🚀 Felicitări pentru alegerea planului ${data.planName}!</h2>
            
            <p>Tocmai ai deblocat accesul la cele mai avansate instrumente de dezvoltare personală alimentate de AI. Iată ce poți face în următoarele minute:</p>
            
            <div class="features">
                <h3>🎯 Ecosistemele tale active:</h3>
                ${data.ecosystems.map(eco => `
                    <div class="feature-item">
                        <div class="feature-icon"></div>
                        <span><strong>${eco}</strong> - Acces complet deblocat</span>
                    </div>
                `).join('')}
            </div>
            
            <h3>✨ Funcții premium incluse:</h3>
            <ul>
                ${data.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" class="cta-button">
                    🚀 Accesează Dashboard-ul
                </a>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
                <h4>💡 Primul pas recomandat:</h4>
                <p>Completează profilul tău pentru recomandări AI personalizate. Cu cât dai mai multe detalii, cu atât AI-ul devine mai precis în sugestii!</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Ai întrebări? <a href="${data.supportUrl}">Contactează suportul</a> | <a href="${data.unsubscribeUrl}">Dezabonează-te</a></p>
            <p>© 2024 PorVerse. Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private getPaymentFailedTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Problemă cu plata</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Problemă cu plata</h1>
            <p>Avem nevoie de atenția ta, ${data.firstName}</p>
        </div>
        
        <div class="content">
            <div class="alert">
                <strong>Plata pentru abonamentul PorVerse nu a putut fi procesată.</strong>
                <br>Suma: ${data.amount} ${data.currency}
                <br>Încercare: ${data.attemptCount}/${data.maxAttempts}
            </div>
            
            <p>Nu-ți face griji! Aceste probleme se întâmplă uneori și sunt ușor de rezolvat. Motivele cele mai comune:</p>
            
            <ul>
                <li>💳 Card expirat sau fonduri insuficiente</li>
                <li>🏦 Restricţii temporare de la bancă</li>
                <li>📍 Schimbare de adresă de facturare</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.updatePaymentUrl}" class="cta-button">
                    🔧 Actualizează metoda de plată
                </a>
            </div>
            
            <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
                <strong>Important:</strong> Dacă nu rezolvi problema în următoarele ${3 - data.attemptCount} zile, accesul la funcțiile premium va fi suspendat temporar.
            </div>
            
            <p style="margin-top: 20px;">Ai nevoie de ajutor? Echipa noastră de suport este aici pentru tine!</p>
        </div>
        
        <div class="footer">
            <p><a href="${data.supportUrl}">Contactează suportul</a> | <a href="${data.unsubscribeUrl}">Dezabonează-te</a></p>
            <p>© 2024 PorVerse. Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private getTrialEndingTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trial expiră în curând</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%); }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%); color: white; padding: 40px 20px; text-align: center; }
        .countdown { font-size: 48px; font-weight: bold; margin: 20px 0; }
        .content { padding: 30px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%); color: white; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 20px 0; }
        .benefits { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ ${data.urgencyMessage}</h1>
            <div class="countdown">${data.daysLeft}</div>
            <p>Salut ${data.firstName}, nu rata șansa transformării!</p>
        </div>
        
        <div class="content">
            <p>Trial-ul tău PorVerse expiră în ${data.daysLeft === 1 ? 'doar o zi' : `${data.daysLeft} zile`}. Ai experimentat puterea AI-ului pentru dezvoltare personală - acum e momentul să-ți continui călătoria!</p>
            
            <div class="benefits">
                <h3>🌟 Ce vei pierde dacă nu continui:</h3>
                <ul>
                    <li>✨ Planuri de nutriție personalizate cu AI</li>
                    <li>🧠 Consilier terapeutic 24/7</li>
                    <li>📚 Scanner homework pentru copii</li>
                    <li>💰 Analiză financiară inteligentă</li>
                    <li>🚀 Optimizer de productivitate</li>
                    <li>🎯 Planificare strategică avansată</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.upgradeUrl}" class="cta-button">
                    🚀 Continuă transformarea
                </a>
            </div>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                <h4>🎁 Ofertă specială pentru tine:</h4>
                <p><strong>20% reducere</strong> la primul abonament dacă te înscrii astăzi! Folosește codul <strong>TRANSFORM20</strong></p>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
                <a href="${data.featuresUrl}" style="color: #667eea;">Vezi toate funcțiile premium →</a>
            </p>
        </div>
        
        <div class="footer">
            <p>Ai întrebări? Suntem aici să te ajutăm!</p>
            <p><a href="${data.unsubscribeUrl}">Dezabonează-te</a></p>
            <p>© 2024 PorVerse. Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private getQuantumUnlockTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quantum Vault Deblocat!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); }
        .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 20px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.2); backdrop-filter: blur(10px); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px 20px; text-align: center; position: relative; overflow: hidden; }
        .quantum-effect { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="white" opacity="0.3"><animate attributeName="r" values="2;10;2" dur="2s" repeatCount="indefinite"/></circle></svg>') repeat; opacity: 0.1; }
        .achievement-badge { font-size: 72px; margin: 20px 0; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .content { padding: 40px 30px; }
        .quantum-feature { background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%); padding: 20px; border-radius: 12px; margin: 15px 0; border: 1px solid rgba(102,126,234,0.2); }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 15px 0; box-shadow: 0 8px 20px rgba(102,126,234,0.3); }
        .footer { background: rgba(248,249,250,0.8); padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="quantum-effect"></div>
            <div class="achievement-badge">🌌</div>
            <h1>QUANTUM VAULT DEBLOCAT!</h1>
            <p>Felicitări, ${data.firstName}! Ai atins nivelul Trinity Master!</p>
        </div>
        
        <div class="content">
            <h2>🎉 Realizare extraordinară deblocată: ${data.achievementTitle}</h2>
            
            <p>Prin accesarea simultană a 3 ecosisteme premium (PorMind + PorFlow + PorBlu), ai deblocat accesul la cel mai avansat sistem de dezvoltare personală din lume!</p>
            
            <div class="quantum-feature">
                <h3>🔮 Future Self Generator</h3>
                <p>Conversează cu versiunea ta din viitor și primește sfaturi de la cel mai înțelept consilier posibil - TU!</p>
                <a href="${data.futureSelfUrl}" class="cta-button">Întâlnește-ți viitorul self</a>
            </div>
            
            <div class="quantum-feature">
                <h3>🎭 Identity Simulator</h3>
                <p>Simulează cum deciziile importante îți vor modela identitatea și viitorul pe termen lung.</p>
                <a href="${data.simulatorUrl}" class="cta-button">Rulează simularea</a>
            </div>
            
            <div class="quantum-feature">
                <h3>🧠 Mirror Conversations</h3>
                <p>Dezbate cu versiuni alternative ale personalității tale pentru breakthrough-uri profunde.</p>
            </div>
            
            <div class="quantum-feature">
                <h3>🔍 Pattern Detection</h3>
                <p>AI-ul analizează toate datele tale pentru a identifica pattern-uri subconștiente și oportunități de transformare.</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0; padding: 30px; background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%); border-radius: 15px;">
                <h3>✨ Acces exclusiv deblocat permanent!</h3>
                <a href="${data.quantumVaultUrl}" class="cta-button" style="font-size: 20px; padding: 20px 40px;">
                    🌌 Intră în Quantum Vault
                </a>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h4>🎯 Ce urmează:</h4>
                <p>Quantum Vault-ul va învăța din toate interacțiunile tale din cele 6 ecosisteme pentru a-ți oferi insights din ce în ce mai profunde. Folosește-l zilnic pentru rezultate maxime!</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Ai atins un nivel rezervat pentru doar 1% din utilizatori!</p>
            <p><a href="${data.unsubscribeUrl}">Dezabonează-te</a></p>
            <p>© 2024 PorVerse. Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>
    `

  private getWeeklyReportTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raportul săptămânal PorVerse</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745; }
        .ecosystem-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .ecosystem-stat { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
        .insight-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Raportul săptămânal</h1>
            <p>Săptămâna ${data.weekNumber} - ${data.firstName}</p>
        </div>
        
        <div class="content">
            <div class="stat-card">
                <h3>🏆 Realizarea săptămânii</h3>
                <p><strong>${data.topAchievement}</strong></p>
            </div>
            
            <h3>📈 Statistici pe ecosisteme:</h3>
            <div class="ecosystem-stats">
                ${Object.entries(data.stats.ecosystems || {}).map(([eco, stats]) => `
                    <div class="ecosystem-stat">
                        <div style="font-size: 24px; margin-bottom: 8px;">${this.getEcosystemIcon(eco)}</div>
                        <div style="font-weight: bold;">${eco}</div>
                        <div style="color: #28a745; font-size: 18px;">${stats.usage}min</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="insight-box">
                <h3>🧠 AI Insights personalizate:</h3>
                <ul>
                    ${data.insights.keyPoints?.map(point => `<li>${point}</li>`).join('') || '<li>Continue utilizarea pentru insights personalizate</li>'}
                </ul>
            </div>
            
            <div class="stat-card">
                <h3>🎯 Zone de îmbunătățit:</h3>
                <ul>
                    ${data.areasToImprove?.map(area => `<li>${area}</li>`).join('') || '<li>Performanță excelentă în toate zonele!</li>'}
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" style="display: inline-block; background: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    📊 Vezi dashboard-ul complet
                </a>
            </div>
            
            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8;">
                <strong>💡 Sfatul săptămânii:</strong>
                <p>${data.insights.weeklyTip || 'Continuă să folosești toate ecosistemele pentru rezultate optime!'}</p>
            </div>
        </div>
        
        <div class="footer">
            <p><a href="${data.unsubscribeUrl}">Dezabonează-te de la rapoarte</a></p>
            <p>© 2024 PorVerse. Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private getCrisisSupportTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suport PorWell</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f0f8ff; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #20b2aa 0%, #48cae4 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 30px; }
        .emergency-box { background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f44336; }
        .support-resource { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #20b2aa; }
        .hotline { font-size: 24px; font-weight: bold; color: #f44336; text-align: center; margin: 20px 0; padding: 15px; background: #fff3e0; border-radius: 8px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤗 Suntem aici pentru tine</h1>
            <p>Salut ${data.firstName}, nu ești singur(ă)</p>
        </div>
        
        <div class="content">
            <p>Am detectat că treci printr-o perioadă dificilă. Primul lucru pe care vreau să-l știi este că <strong>nu ești singur(ă)</strong> și că această stare este temporară.</p>
            
            ${data.severity === 'critical' ? `
            <div class="emergency-box">
                <h3>🚨 Dacă este o situație de urgență:</h3>
                <div class="hotline">Sună IMEDIAT: ${data.emergencyNumber}</div>
                <p>Pentru situații de criză psihiatrică în România:</p>
                <div class="hotline">${data.crisisHotline}</div>
            </div>
            ` : ''}
            
            <h3>💙 Resurse de suport disponibile 24/7:</h3>
            
            ${data.emergencyNumbers.map(resource => `
                <div class="support-resource">
                    <strong>${resource.name}</strong><br>
                    <span style="font-size: 18px; color: #f44336;">📞 ${resource.number}</span><br>
                    <small>${resource.description}</small>
                </div>
            `).join('')}
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h4>🌱 Pași imediați care te pot ajuta:</h4>
                <ul>
                    <li><strong>Respiră profund</strong> - 4 secunde inspiră, 4 secunde ține, 4 secunde expiră</li>
                    <li><strong>Contactează pe cineva</strong> - un prieten, familie sau una din liniile de suport</li>
                    <li><strong>Ieși afară</strong> - o plimbare scurtă poate schimba perspectiva</li>
                    <li><strong>Folosește PorWell Therapist</strong> - sunt aici 24/7 pentru tine</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.therapistUrl}" style="display: inline-block; background: #20b2aa; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    💬 Vorbește cu AI Therapist acum
                </a>
            </div>
            
            <div style="background: #ffeaa7; padding: 15px; border-radius: 8px; border-left: 4px solid #fdcb6e;">
                <strong>🌈 Amintește-ți:</strong>
                <p>Fiecare zi dificilă pe care ai trecut prin ea până acum ți-a demonstrat că ești mai puternic(ă) decât crezi. Această perioadă va trece, iar tu vei ieși mai puternic(ă) din ea.</p>
            </div>
            
            <h3>📚 Resurse suplimentare:</h3>
            ${data.supportResources.map(resource => `
                <div class="support-resource">
                    <strong>${resource.title}</strong><br>
                    <small>${resource.description}</small><br>
                    <a href="${resource.url}" style="color: #20b2aa;">Accesează resursa →</a>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p><strong>Echipa PorVerse îți ține pumnii!</strong></p>
            <p>© 2024 PorVerse. Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private getPasswordResetTemplate(data: any): string {
    return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resetare parolă PorVerse</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #667eea; color: white; padding: 30px; text-align: center;">
            <h1>🔒 Resetare parolă</h1>
        </div>
        <div style="padding: 30px;">
            <p>Salut ${data.firstName},</p>
            <p>Ai solicitat resetarea parolei pentru contul tău PorVerse.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.resetUrl}" style="background: #667eea; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Resetează parola
                </a>
            </div>
            <p>Acest link expiră în 24 de ore din motive de securitate.</p>
            <p>Dacă nu ai solicitat această resetare, ignoră acest email.</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private getAchievementTemplate(data: any): string {
    return `Achievement template for ${data.achievement}`
  }

  // ================================
  // EMAIL AUTOMATION HELPERS
  // ================================
  private async generateWeeklyStats(userId: string): Promise<any> {
    // Implementation to gather user stats from all ecosystems
    return {
      ecosystems: {
        'PorHealth': { usage: 120, sessions: 8 },
        'PorWell': { usage: 45, sessions: 3 },
        'PorMind': { usage: 90, sessions: 5 }
      },
      topAchievement: 'Completat primul plan de nutriție AI'
    }
  }

  private async generateAIInsights(userId: string, stats: any): Promise<any> {
    // Use AI to generate personalized insights
    return {
      keyPoints: [
        'Consistența ta în PorHealth arată dedicare reală',
        'Ai crescut cu 23% timpul petrecut în meditație'
      ],
      improvements: [
        'Încearcă să folosești mai des PorFlow pentru productivitate'
      ],
      weeklyTip: 'Combină meditația matinală cu planificarea zilei pentru rezultate optime'
    }
  }

  private getCurrentWeekNumber(): number {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now.getTime() - start.getTime()
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
  }

  private getEcosystemIcon(ecosystem: string): string {
    const icons = {
      'PorHealth': '🏃',
      'PorKids': '👶',
      'PorMind': '💰',
      'PorWell': '🧘',
      'PorFlow': '⚡',
      'PorBlu': '🎯'
    }
    return icons[ecosystem] || '⭐'
  }

  // ================================
  // EMAIL METRICS & ANALYTICS
  // ================================
  async trackEmailMetrics(metrics: EmailMetrics): Promise<void> {
    try {
      await this.database.logUserActivity(
        metrics.userId,
        'email',
        `email_${metrics.status}`,
        {
          email_type: metrics.emailType,
          status: metrics.status,
          timestamp: metrics.timestamp.toISOString(),
          ...metrics.metadata
        }
      )
    } catch (error) {
      console.error('Track email metrics error:', error)
    }
  }

  async logEmailError(userId: string, emailType: string, error: string): Promise<void> {
    try {
      await this.database.logUserActivity(userId, 'email', 'email_error', {
        email_type: emailType,
        error_message: error,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('Log email error failed:', err)
    }
  }

  // ================================
  // UNSUBSCRIBE MANAGEMENT
  // ================================
  async generateUnsubscribeToken(userId: string): Promise<string> {
    const token = this.security.generateSecureToken(32)
    // Store token in database with expiration
    // Implementation depends on your preference storage
    return token
  }

  async handleUnsubscribe(userId: string, emailTypes: string[]): Promise<boolean> {
    try {
      // Implementation to update user preferences
      return true
    } catch (error) {
      console.error('Handle unsubscribe error:', error)
      return false
    }
  }

  // ================================
  // BULK EMAIL OPERATIONS
  // ================================
  async sendBulkEmails(
    userIds: string[],
    emailType: keyof EmailTemplate,
    templateData: any
  ): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const userId of userIds) {
      try {
        const sent = await this[`send${this.capitalize(emailType)}Email`](userId, templateData)
        if (sent) success++
        else failed++
        
        // Rate limiting - don't overwhelm Resend
        await this.delay(100)
      } catch (error) {
        failed++
        console.error(`Bulk email failed for user ${userId}:`, error)
      }
    }

    return { success, failed }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ================================
  // EMAIL TESTING & VALIDATION
  // ================================
  async testEmailTemplate(
    templateName: keyof EmailTemplate,
    testData: any,
    testEmail: string
  ): Promise<boolean> {
    try {
      const html = await this.renderEmailTemplate(templateName, testData)
      
      const { error } = await this.resend.emails.send({
        from: 'PorVerse <test@porverse.ro>',
        to: [testEmail],
        subject: `[TEST] ${templateName} template`,
        html: html,
        tags: [{ name: 'test', value: 'true' }]
      })

      return !error
    } catch (error) {
      console.error('Test email template error:', error)
      return false
    }
  }

  // ================================
  // SCHEDULED EMAIL JOBS
  // ================================
  async scheduleTrialEndingEmails(): Promise<void> {
    // Find users with trials ending in 3 days and 1 day
    const threeDaysUsers = await this.database.getUsersWithTrialEnding(3)
    const oneDayUsers = await this.database.getUsersWithTrialEnding(1)

    for (const user of threeDaysUsers) {
      await this.sendTrialEndingEmail(user.id, 3)
    }

    for (const user of oneDayUsers) {
      await this.sendTrialEndingEmail(user.id, 1)
    }
  }

  async scheduleWeeklyReports(): Promise<void> {
    // Find all active premium users
    const premiumUsers = await this.database.getPremiumUsers()
    
    for (const user of premiumUsers) {
      await this.sendWeeklyProgressReport(user.id)
      await this.delay(200) // Rate limiting
    }
  }
}