// lib/email/email-service.ts - Digital Ocean Compatible

export class EmailService {
  private static instance: EmailService

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendWelcomeEmail(userId: string, userEmail: string, plan?: any): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'welcome@porverse.ro',
          to: userEmail,
          subject: 'Bun venit la PorVerse! 🚀',
          html: this.getWelcomeEmailTemplate(plan?.name || 'Basic')
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Welcome email failed:', error)
      return false
    }
  }

  async sendPaymentSuccessEmail(userId: string, invoice: any): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) return true // Skip if no API key
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'billing@porverse.ro',
          to: invoice.customer_email,
          subject: 'Plată procesată cu succes ✅',
          html: this.getPaymentSuccessTemplate(invoice)
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Payment success email failed:', error)
      return false
    }
  }

  async sendPaymentFailedEmail(userId: string, invoice: any, attempt: number): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) return true
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'billing@porverse.ro',
          to: invoice.customer_email,
          subject: 'Problemă cu plata - Acțiune necesară ⚠️',
          html: this.getPaymentFailedTemplate(invoice, attempt)
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Payment failed email failed:', error)
      return false
    }
  }

  async sendTrialEndingEmail(userId: string, userEmail: string, daysLeft: number): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) return true
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'support@porverse.ro',
          to: userEmail,
          subject: `Perioada de probă se termină în ${daysLeft} zile`,
          html: this.getTrialEndingTemplate(daysLeft)
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Trial ending email failed:', error)
      return false
    }
  }

  async sendTrinityUnlockEmail(userId: string, userEmail: string): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) return true
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'support@porverse.ro',
          to: userEmail,
          subject: '🔮 Quantum Vault deblocat! Trinity Achievement',
          html: this.getTrinityUnlockTemplate()
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Trinity unlock email failed:', error)
      return false
    }
  }

  async sendCrisisEmail(userId: string, userEmail: string, severity: string, context: any): Promise<boolean> {
    // Crisis emails should be sent to support team, not user
    try {
      if (!process.env.RESEND_API_KEY) return true
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'alerts@porverse.ro',
          to: 'support@porverse.ro',
          subject: `🚨 Crisis Alert - User ${userId} - ${severity}`,
          html: this.getCrisisAlertTemplate(userId, severity, context)
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Crisis email failed:', error)
      return false
    }
  }

  // Email Templates
  private getWelcomeEmailTemplate(planName: string): string {
    return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bun venit la PorVerse! 🚀</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Felicitări pentru abonamentul ${planName}!</h2>
          <p>Ești acum parte din comunitatea PorVerse - platforma completă pentru transformare personală.</p>
          <p><strong>Ce poți face acum:</strong></p>
          <ul>
            <li>🏥 Planifică nutriția cu PorHealth</li>
            <li>👨‍👩‍👧‍👦 Ajută copiii cu temele în PorKids</li>
            <li>💰 Optimizează finanțele cu PorMind</li>
            <li>🧘 Îmbunătățește wellbeing-ul cu PorWell</li>
            <li>⚡ Productivitate maximă cu PorFlow</li>
            <li>🎯 Planificare strategică cu PorBlu</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Începe Acum</a>
          </div>
        </div>
      </body>
    </html>
    `
  }

  private getPaymentSuccessTemplate(invoice: any): string {
    return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Plată procesată cu succes ✅</h1>
        </div>
        <div style="padding: 20px;">
          <p>Plata ta a fost procesată cu succes!</p>
          <p><strong>Detalii:</strong></p>
          <ul>
            <li>Sumă: ${invoice.amount_paid / 100} ${invoice.currency?.toUpperCase()}</li>
            <li>Data: ${new Date().toLocaleDateString('ro-RO')}</li>
            <li>Factură: ${invoice.id}</li>
          </ul>
          <p>Abonamentul tău este activ și poți folosi toate funcționalitățile.</p>
        </div>
      </body>
    </html>
    `
  }

  private getPaymentFailedTemplate(invoice: any, attempt: number): string {
    return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Problemă cu plata ⚠️</h1>
        </div>
        <div style="padding: 20px;">
          <p>Plata ta nu a putut fi procesată (încercarea ${attempt}).</p>
          <p>Te rugăm să verifici datele cardului și să încerci din nou.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Actualizează Plata</a>
          </div>
        </div>
      </body>
    </html>
    `
  }

  private getTrialEndingTemplate(daysLeft: number): string {
    return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Perioada de probă se termină în ${daysLeft} zile ⏰</h1>
        </div>
        <div style="padding: 20px;">
          <p>Ai doar ${daysLeft} zile rămase din perioada de probă!</p>
          <p>Pentru a continua să folosești PorVerse, alege un abonament.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Alege Abonament</a>
          </div>
        </div>
      </body>
    </html>
    `
  }

  private getTrinityUnlockTemplate(): string {
    return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔮 Quantum Vault Deblocat!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Felicitări! Ai deblocat Trinity Achievement și acces la Quantum Vault!</p>
          <p><strong>Funcționalități noi disponibile:</strong></p>
          <ul>
            <li>🔮 Future Self - Conversații cu sinele tău din viitor</li>
            <li>⚡ Identity Simulator - Explorează căi alternative</li>
            <li>🗺️ Reverse Roadmap - Planifică de la viitor la prezent</li>
            <li>🪞 Mirror Conversations - Dialoguri cu alter ego-urile tale</li>
            <li>🔍 Pattern Detection - Insights profunde despre comportament</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/quantum-vault" style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Explorează Quantum Vault</a>
          </div>
        </div>
      </body>
    </html>
    `
  }

  private getCrisisAlertTemplate(userId: string, severity: string, context: any): string {
    return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚨 Crisis Alert - ${severity.toUpperCase()}</h1>
        </div>
        <div style="padding: 20px;">
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Severity:</strong> ${severity}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Context:</strong> ${JSON.stringify(context, null, 2)}</p>
          <p><strong>Action Required:</strong> Immediate review and potential intervention</p>
        </div>
      </body>
    </html>
    `
  }
}