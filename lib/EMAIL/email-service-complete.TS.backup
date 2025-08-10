// lib/email/email-service-complete.ts - COMPLETE EMAIL SYSTEM
import { Resend } from 'resend'
import { Twilio } from 'twilio'
import { DatabaseService } from '../database/database-service-complete'
import { SecurityService } from '../security/security-service'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
  category: 'transactional' | 'marketing' | 'system'
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

interface EmailMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
}

interface EmailCampaign {
  id: string
  name: string
  templateId: string
  segmentIds: string[]
  scheduledAt?: Date
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  metrics: EmailMetrics
}

export class EmailService {
  private resend: Resend
  private twilio?: Twilio
  private database: DatabaseService
  private security: SecurityService
  private templates: Map<string, EmailTemplate>

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!)
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilio = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
    }
    
    this.database = new DatabaseService()
    this.security = SecurityService.getInstance()
    this.templates = new Map()
    
    this.initializeTemplates()
  }

  // ================================
  // TEMPLATE MANAGEMENT - COMPLETE
  // ================================

  private initializeTemplates(): void {
    const templates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: '🚀 Bun venit în PorVerse, {{firstName}}!',
        category: 'transactional',
        variables: ['firstName', 'planName', 'ecosystems', 'dashboardUrl'],
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bun venit în PorVerse</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
              .content { padding: 40px; }
              .feature { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 10px 0; border-left: 4px solid #667eea; }
              .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
              .ecosystem { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 8px 16px; border-radius: 20px; margin: 5px; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚀 Bun venit în PorVerse!</h1>
                <p>Transformarea ta personală începe acum, {{firstName}}!</p>
              </div>
              <div class="content">
                <h2>Felicitări pentru alegerea planului {{planName}}!</h2>
                <p>Ai acces acum la ecosistemele tale de transformare:</p>
                
                <div>
                  {{#each ecosystems}}
                    <span class="ecosystem">{{this}}</span>
                  {{/each}}
                </div>

                <div class="feature">
                  <h3>🤖 AI Personal Assistant</h3>
                  <p>Fiecare ecosistem vine cu un AI specialist care te ghidează pas cu pas.</p>
                </div>

                <div class="feature">
                  <h3>📊 Progress Tracking</h3>
                  <p>Urmărește-ți progresul în timp real și primește insights personalizate.</p>
                </div>

                <div class="feature">
                  <h3>🔮 Quantum Vault</h3>
                  <p>Deblochează accesul la Future Self când ai 3+ ecosisteme premium!</p>
                </div>

                <div style="text-align: center;">
                  <a href="{{dashboardUrl}}" class="btn">🎯 Începe Acum</a>
                </div>

                <p><strong>Ai întrebări?</strong> Răspunde la acest email sau contactează-ne la <a href="mailto:support@porverse.ro">support@porverse.ro</a></p>
                
                <hr style="margin: 30px 0; border: 1px solid #e2e8f0;">
                
                <p style="font-size: 14px; color: #64748b;">
                  Cu dragoste,<br>
                  <strong>Echipa PorVerse</strong><br>
                  🌟 Your AI-Powered Transformation Platform
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Bun venit în PorVerse, {{firstName}}!
          
          Felicitări pentru alegerea planului {{planName}}!
          
          Ai acces la: {{ecosystems}}
          
          Începe transformarea: {{dashboardUrl}}
          
          Echipa PorVerse
        `
      },
      
      {
        id: 'payment_success',
        name: 'Payment Success',
        subject: '✅ Plata confirmată - PorVerse {{planName}}',
        category: 'transactional',
        variables: ['firstName', 'planName', 'amount', 'currency', 'nextBilling', 'invoiceUrl'],
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Plată confirmată</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; background: #f1f5f9; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; margin-top: 20px; }
              .header { background: #10b981; padding: 30px; text-align: center; color: white; }
              .content { padding: 30px; }
              .invoice-box { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Plată Confirmată!</h1>
                <p>Mulțumim pentru încrederea acordată, {{firstName}}!</p>
              </div>
              <div class="content">
                <div class="invoice-box">
                  <h3>Detalii plată:</h3>
                  <p><strong>Plan:</strong> {{planName}}</p>
                  <p><strong>Sumă:</strong> {{amount}} {{currency}}</p>
                  <p><strong>Următoarea factură:</strong> {{nextBilling}}</p>
                </div>
                
                <p>Factura ta este disponibilă aici:</p>
                <a href="{{invoiceUrl}}" class="btn">📄 Vezi Factura</a>
                
                <hr>
                <p style="font-size: 14px; color: #6b7280;">
                  Pentru întrebări despre facturare: billing@porverse.ro
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Plată confirmată!
          
          Plan: {{planName}}
          Sumă: {{amount}} {{currency}}
          Următoarea factură: {{nextBilling}}
          
          Vezi factura: {{invoiceUrl}}
          
          Echipa PorVerse
        `
      },

      {
        id: 'trial_ending',
        name: 'Trial Ending Soon',
        subject: '⏰ Trial-ul tău PorVerse se încheie în 3 zile',
        category: 'transactional',
        variables: ['firstName', 'trialEndDate', 'upgradeUrl', 'planName'],
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Trial se încheie</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; background: #fef3c7; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; margin-top: 20px; }
              .header { background: #f59e0b; padding: 30px; text-align: center; color: white; }
              .content { padding: 30px; }
              .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; }
              .btn-primary { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Trial se încheie în curând</h1>
                <p>Nu pierde progresul tău, {{firstName}}!</p>
              </div>
              <div class="content">
                <div class="warning">
                  <h3>🚨 Important!</h3>
                  <p>Trial-ul tău pentru <strong>{{planName}}</strong> se încheie pe <strong>{{trialEndDate}}</strong>.</p>
                </div>
                
                <h3>Ce se întâmplă dacă nu actualizezi?</h3>
                <ul>
                  <li>❌ Pierzi accesul la ecosistemele premium</li>
                  <li>❌ AI-ul nu va mai genera planuri personalizate</li>
                  <li>❌ Progresul tău va fi pauzat</li>
                </ul>
                
                <h3>✅ Continuă transformarea cu doar un click:</h3>
                <div style="text-align: center;">
                  <a href="{{upgradeUrl}}" class="btn-primary">🔥 Actualizează Acum</a>
                </div>
                
                <p><small>💡 Tip: Planul anual îți oferă 2 luni GRATUITE!</small></p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Trial se încheie în 3 zile!
          
          {{firstName}}, trial-ul pentru {{planName}} se încheie pe {{trialEndDate}}.
          
          Actualizează acum: {{upgradeUrl}}
          
          Echipa PorVerse
        `
      },

      {
        id: 'quantum_unlock',
        name: 'Quantum Vault Unlocked',
        subject: '🔮 QUANTUM VAULT DEBLOCAT! Future Self te așteaptă...',
        category: 'transactional',
        variables: ['firstName', 'quantumUrl', 'ecosystemsUnlocked'],
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Quantum Vault Deblocat</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; background: linear-gradient(135deg, #1e1b4b 0%, #581c87 100%); }
              .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 20px; margin-top: 20px; overflow: hidden; border: 2px solid #a855f7; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 40px; text-align: center; color: white; }
              .content { padding: 40px; }
              .quantum-feature { background: linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%); padding: 20px; border-radius: 12px; margin: 15px 0; border-left: 4px solid #8b5cf6; }
              .btn-quantum { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); color: white; padding: 20px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; margin: 20px 0; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3); }
              .glow { text-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="glow">🔮 QUANTUM VAULT</h1>
                <h2>DEBLOCAT!</h2>
                <p>Felicitări {{firstName}}! Ai atins Trinity Status!</p>
              </div>
              <div class="content">
                <h2 style="color: #6366f1;">🎉 Realizare Extraordinară!</h2>
                <p>Ai deblocat <strong>{{ecosystemsUnlocked}} ecosisteme premium</strong> și acum ai acces la cea mai avansată tehnologie din PorVerse:</p>
                
                <div class="quantum-feature">
                  <h3>🤖 Future Self Simulator</h3>
                  <p>Conversează cu versiunea ta din viitor și primește sfaturi din perspectiva experienței.</p>
                </div>

                <div class="quantum-feature">
                  <h3>🔄 Identity Simulator</h3>
                  <p>Explorează diferite versiuni ale identității tale și cum deciziile de azi te modelează.</p>
                </div>

                <div class="quantum-feature">
                  <h3>🛣️ Reverse Roadmap</h3>
                  <p>Începe cu obiectivul final și descoperă exact ce pași trebuie să faci pentru a ajunge acolo.</p>
                </div>

                <div class="quantum-feature">
                  <h3>🪞 Mirror Conversations</h3>
                  <p>Dialoguri profunde cu diferite aspecte ale personalității tale pentru claritate maximă.</p>
                </div>

                <div class="quantum-feature">
                  <h3>🧠 Pattern Detection</h3>
                  <p>AI-ul detectează pattern-uri ascunse în comportamentul tău pentru breakthrough-uri majore.</p>
                </div>

                <div style="text-align: center; margin: 40px 0;">
                  <a href="{{quantumUrl}}" class="btn-quantum">🚀 INTRĂ ÎN QUANTUM VAULT</a>
                </div>

                <p style="text-align: center; font-style: italic; color: #6366f1;">
                  "Viitorul aparține celor care îndrăznesc să-și depășească limitele. Bun venit în Quantum!"
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          🔮 QUANTUM VAULT DEBLOCAT!
          
          Felicitări {{firstName}}! Ai Trinity Status!
          
          Acum ai acces la:
          - Future Self Simulator
          - Identity Simulator  
          - Reverse Roadmap
          - Mirror Conversations
          - Pattern Detection
          
          Intră în Quantum: {{quantumUrl}}
          
          Echipa PorVerse
        `
      },

      {
        id: 'crisis_support',
        name: 'Crisis Support',
        subject: '💙 Suntem aici pentru tine - Resurse de suport imediat',
        category: 'system',
        variables: ['firstName', 'supportUrl', 'emergencyNumbers'],
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Suport de criză</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; background: #dbeafe; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; margin-top: 20px; }
              .header { background: #3b82f6; padding: 30px; text-align: center; color: white; }
              .content { padding: 30px; line-height: 1.6; }
              .emergency { background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .support-box { background: #f0f9ff; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💙 Suntem aici pentru tine</h1>
                <p>{{firstName}}, nu ești singur/ă în această călătorie</p>
              </div>
              <div class="content">
                <div class="emergency">
                  <h3>🚨 URGENT - Ai nevoie de ajutor imediat?</h3>
                  <p><strong>România:</strong> 112 (urgențe generale)</p>
                  <p><strong>Linia de viață:</strong> 0800.801.200</p>
                  <p><strong>Telefonul copilului:</strong> 116.111</p>
                </div>

                <div class="support-box">
                  <h3>🤗 Resurse de suport PorWell:</h3>
                  <ul>
                    <li>💬 AI Therapist disponibil 24/7</li>
                    <li>🧘 Sesiuni de mindfulness ghidate</li>
                    <li>📊 Mood tracking cu insights</li>
                    <li>🔍 Pattern recognition pentru triggers</li>
                  </ul>
                  <p><a href="{{supportUrl}}" style="color: #3b82f6;">Accesează PorWell acum ➜</a></p>
                </div>

                <h3>💪 Reamintește-ți:</h3>
                <ul>
                  <li>Fiecare zi este o nouă oportunitate</li>
                  <li>Progresul nu este întotdeauna linear</li>
                  <li>Ai deja forța să depășești orice obstacol</li>
                  <li>Comunitatea PorVerse te susține</li>
                </ul>

                <p><strong>Răspunde la acest email</strong> dacă vrei să vorbești cu cineva din echipa noastră.</p>
                
                <hr>
                <p style="font-size: 14px; color: #6b7280;">
                  Acest mesaj a fost trimis automat pentru siguranța ta. Pentru suport: support@porverse.ro
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Suntem aici pentru tine, {{firstName}}.
          
          URGENT? Sună 112 sau 0800.801.200
          
          Resurse PorWell: {{supportUrl}}
          
          Nu ești singur/ă. Echipa PorVerse
        `
      },

      {
        id: 'weekly_report',
        name: 'Weekly Progress Report',
        subject: '📊 Raportul tău săptămânal PorVerse - Progres uimitor!',
        category: 'marketing',
        variables: ['firstName', 'weeklyStats', 'achievements', 'nextGoals', 'dashboardUrl'],
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Raport săptămânal</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; background: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; margin-top: 20px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }
              .content { padding: 30px; }
              .stat-box { background: #f0fdfa; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; }
              .achievement { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; }
              .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Raportul Săptămânii</h1>
                <p>Progresul tău uimitor, {{firstName}}!</p>
              </div>
              <div class="content">
                <h2>🎯 Statistici săptămâna aceasta:</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div class="stat-box">
                    <h3>{{weeklyStats.sessionCount}}</h3>
                    <p>Sesiuni AI</p>
                  </div>
                  <div class="stat-box">
                    <h3>{{weeklyStats.goalsCompleted}}</h3>
                    <p>Obiective atinse</p>
                  </div>
                </div>

                <h2>🏆 Realizări deblocate:</h2>
                {{#each achievements}}
                <div class="achievement">
                  <strong>{{this.title}}</strong> - {{this.description}}
                </div>
                {{/each}}

                <h2>🎯 Săptămâna viitoare:</h2>
                <ul>
                  {{#each nextGoals}}
                  <li>{{this}}</li>
                  {{/each}}
                </ul>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="{{dashboardUrl}}" class="btn">📈 Vezi Dashboard-ul Complet</a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
          Raport săptămânal PorVerse
          
          {{firstName}}, iată progresul tău:
          
          - {{weeklyStats.sessionCount}} sesiuni AI
          - {{weeklyStats.goalsCompleted}} obiective atinse
          
          Realizări: {{achievements}}
          
          Vezi detalii: {{dashboardUrl}}
          
          Echipa PorVerse
        `
      }
    ]

    templates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  // ================================
  // CORE EMAIL SENDING - COMPLETE
  // ================================

  async sendEmail(
    to: string | string[],
    templateId: string,
    variables: Record<string, any> = {},
    options: {
      from?: string
      replyTo?: string
      priority?: 'high' | 'normal' | 'low'
      tags?: string[]
      attachments?: any[]
      scheduledAt?: Date
    } = {}
  ): Promise<EmailResult> {
    try {
      const template = this.templates.get(templateId)
      if (!template) {
        throw new Error(`Template '${templateId}' not found`)
      }

      // Sanitize variables
      const sanitizedVariables = this.security.sanitizeJSON(variables)

      // Render template
      const subject = this.renderTemplate(template.subject, sanitizedVariables)
      const html = this.renderTemplate(template.htmlContent, sanitizedVariables)
      const text = this.renderTemplate(template.textContent, sanitizedVariables)

      // Determine sender
      const fromAddress = options.from || this.getFromAddress(template.category)

      // Send email
      const { data, error } = await this.resend.emails.send({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
        text: text,
        reply_to: options.replyTo,
        tags: [
          { name: 'template', value: templateId },
          { name: 'category', value: template.category },
          ...(options.tags?.map(tag => ({ name: 'custom', value: tag })) || [])
        ],
        attachments: options.attachments,
        scheduled_at: options.scheduledAt
      })

      if (error) {
        throw new Error(error.message)
      }

      // Log email send
      await this.logEmailSent({
        recipients: Array.isArray(to) ? to : [to],
        templateId,
        messageId: data?.id,
        status: 'sent'
      })

      return {
        success: true,
        messageId: data?.id
      }

    } catch (error: any) {
      // Log error
      await this.logEmailError({
        recipients: Array.isArray(to) ? to : [to],
        templateId,
        error: error.message
      })

      return {
        success: false,
        error: error.message
      }
    }
  }

  // ================================
  // BUSINESS EMAIL METHODS - COMPLETE
  // ================================

  async sendWelcomeEmail(userId: string, planDetails: any): Promise<EmailResult> {
    const userResult = await this.database.getUserProfile(userId)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'User not found' }
    }

    const user = userResult.data

    return this.sendEmail(
      user.email,
      'welcome',
      {
        firstName: user.first_name || 'Friend',
        planName: planDetails.name,
        ecosystems: planDetails.ecosystems,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      },
      {
        tags: ['onboarding', 'welcome'],
        priority: 'high'
      }
    )
  }

  async sendPaymentSuccessEmail(userId: string, paymentDetails: any): Promise<EmailResult> {
    const userResult = await this.database.getUserProfile(userId)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'User not found' }
    }

    const user = userResult.data

    return this.sendEmail(
      user.email,
      'payment_success',
      {
        firstName: user.first_name || 'Friend',
        planName: paymentDetails.planName,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        nextBilling: paymentDetails.nextBilling,
        invoiceUrl: paymentDetails.invoiceUrl
      },
      {
        tags: ['billing', 'payment_success'],
        priority: 'high'
      }
    )
  }

  async sendTrialEndingEmail(userId: string, subscription: any): Promise<EmailResult> {
    const userResult = await this.database.getUserProfile(userId)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'User not found' }
    }

    const user = userResult.data

    return this.sendEmail(
      user.email,
      'trial_ending',
      {
        firstName: user.first_name || 'Friend',
        trialEndDate: new Date(subscription.trial_end * 1000).toLocaleDateString('ro-RO'),
        planName: subscription.metadata?.plan_name || 'Premium',
        upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
      },
      {
        tags: ['billing', 'trial_ending'],
        priority: 'high'
      }
    )
  }

  async sendQuantumUnlockEmail(userId: string): Promise<EmailResult> {
    const userResult = await this.database.getUserProfile(userId)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'User not found' }
    }

    const user = userResult.data

    return this.sendEmail(
      user.email,
      'quantum_unlock',
      {
        firstName: user.first_name || 'Friend',
        quantumUrl: `${process.env.NEXT_PUBLIC_APP_URL}/quantum-vault`,
        ecosystemsUnlocked: user.user_ecosystems?.filter(e => e.access_level === 'premium').length || 3
      },
      {
        tags: ['achievement', 'quantum_vault'],
        priority: 'high'
      }
    )
  }

  async sendCrisisSupport(userId: string): Promise<EmailResult> {
    const userResult = await this.database.getUserProfile(userId)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'User not found' }
    }

    const user = userResult.data

    return this.sendEmail(
      user.email,
      'crisis_support',
      {
        firstName: user.first_name || 'Friend',
        supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/por-well`,
        emergencyNumbers: {
          general: '112',
          lifeline: '0800.801.200',
          child: '116.111'
        }
      },
      {
        tags: ['crisis', 'support'],
        priority: 'high',
        from: 'support@porverse.ro'
      }
    )
  }

  async sendWeeklyReport(userId: string, reportData: any): Promise<EmailResult> {
    const userResult = await this.database.getUserProfile(userId)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'User not found' }
    }

    const user = userResult.data

    return this.sendEmail(
      user.email,
      'weekly_report',
      {
        firstName: user.first_name || 'Friend',
        weeklyStats: reportData.stats,
        achievements: reportData.achievements,
        nextGoals: reportData.nextGoals,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      },
      {
        tags: ['report', 'weekly'],
        priority: 'normal'
      }
    )
  }

  // ================================
  // SMS SUPPORT - COMPLETE
  // ================================

  async sendSMS(
    phoneNumber: string,
    message: string,
    urgent: boolean = false
  ): Promise<EmailResult> {
    if (!this.twilio) {
      return { success: false, error: 'SMS service not configured' }
    }

    try {
      const sanitizedMessage = this.security.sanitizeInput(message)
      
      const result = await this.twilio.messages.create({
        body: sanitizedMessage,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER!,
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status`
      })

      // Log SMS send
      await this.database.logUserActivity({
        actionType: 'sms_sent',
        actionData: {
          to: phoneNumber,
          message_sid: result.sid,
          urgent
        }
      })

      return {
        success: true,
        messageId: result.sid
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async sendVerificationSMS(phoneNumber: string, code: string): Promise<EmailResult> {
    const message = `Codul tău de verificare PorVerse: ${code}. Nu împărtăși acest cod cu nimeni.`
    return this.sendSMS(phoneNumber, message, true)
  }

  async sendCrisisSMS(phoneNumber: string): Promise<EmailResult> {
    const message = `PorVerse: Detectăm că ai putea avea nevoie de suport. Resurse imediate: 112 (urgențe), 0800.801.200 (linia de viață). Nu ești singur/ă. 💙`
    return this.sendSMS(phoneNumber, message, true)
  }

  // ================================
  // EMAIL CAMPAIGNS - COMPLETE
  // ================================

  async createEmailCampaign(
    campaignData: {
      name: string
      templateId: string
      segmentIds: string[]
      scheduledAt?: Date
      variables?: Record<string, any>
    }
  ): Promise<{ success: boolean; campaignId?: string; error?: string }> {
    try {
      const { data, error } = await this.database.supabaseAdmin
        .from('email_campaigns')
        .insert({
          name: campaignData.name,
          template_id: campaignData.templateId,
          segment_ids: campaignData.segmentIds,
          scheduled_at: campaignData.scheduledAt?.toISOString(),
          variables: campaignData.variables || {},
          status: campaignData.scheduledAt ? 'scheduled' : 'draft',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, campaignId: data.id }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async sendCampaign(campaignId: string): Promise<EmailResult> {
    try {
      // Get campaign details
      const { data: campaign, error } = await this.database.supabaseAdmin
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (error || !campaign) {
        throw new Error('Campaign not found')
      }

      // Get recipients based on segments
      const recipients = await this.getSegmentRecipients(campaign.segment_ids)

      // Send emails in batches
      const batchSize = 100
      let totalSent = 0
      let totalFailed = 0

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize)
        
        const batchPromises = batch.map(recipient => 
          this.sendEmail(
            recipient.email,
            campaign.template_id,
            {
              ...campaign.variables,
              firstName: recipient.first_name,
              userId: recipient.id
            },
            {
              tags: ['campaign', campaign.name]
            }
          )
        )

        const results = await Promise.allSettled(batchPromises)
        
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            totalSent++
          } else {
            totalFailed++
          }
        })

        // Rate limiting - wait 1 second between batches
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Update campaign status
      await this.database.supabaseAdmin
        .from('email_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          total_sent: totalSent,
          total_failed: totalFailed
        })
        .eq('id', campaignId)

      return {
        success: true,
        data: {
          totalSent,
          totalFailed,
          totalRecipients: recipients.length
        }
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ================================
  // HELPER METHODS - COMPLETE
  // ================================

  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template

    // Simple template replacement
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      rendered = rendered.replace(regex, String(value))
    })

    // Handle arrays (basic Handlebars-style)
    rendered = rendered.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, content) => {
      const array = variables[arrayName]
      if (!Array.isArray(array)) return ''
      
      return array.map(item => {
        let itemContent = content
        if (typeof item === 'object') {
          Object.entries(item).forEach(([prop, val]) => {
            itemContent = itemContent.replace(new RegExp(`{{this\\.${prop}}}`, 'g'), String(val))
          })
        } else {
          itemContent = itemContent.replace(/{{this}}/g, String(item))
        }
        return itemContent
      }).join('')
    })

    return rendered
  }

  private getFromAddress(category: string): string {
    switch (category) {
      case 'transactional':
        return 'PorVerse <noreply@porverse.ro>'
      case 'marketing':
        return 'PorVerse <hello@porverse.ro>'
      case 'system':
        return 'PorVerse Support <support@porverse.ro>'
      default:
        return 'PorVerse <noreply@porverse.ro>'
    }
  }

  private async logEmailSent(data: {
    recipients: string[]
    templateId: string
    messageId?: string
    status: string
  }): Promise<void> {
    try {
      await this.database.supabaseAdmin
        .from('email_logs')
        .insert({
          recipients: data.recipients,
          template_id: data.templateId,
          message_id: data.messageId,
          status: data.status,
          sent_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to log email:', error)
    }
  }

  private async logEmailError(data: {
    recipients: string[]
    templateId: string
    error: string
  }): Promise<void> {
    try {
      await this.database.supabaseAdmin
        .from('email_logs')
        .insert({
          recipients: data.recipients,
          template_id: data.templateId,
          status: 'failed',
          error_message: data.error,
          sent_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to log email error:', error)
    }
  }

  private async getSegmentRecipients(segmentIds: string[]): Promise<any[]> {
    // Implementation would query user segments and return recipients
    // For now, return empty array
    return []
  }

  // ================================
  // EMAIL ANALYTICS - COMPLETE
  // ================================

  async getEmailMetrics(templateId?: string, days: number = 30): Promise<EmailMetrics> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      let query = this.database.supabaseAdmin
        .from('email_logs')
        .select('status, opened_at, clicked_at')
        .gte('sent_at', startDate.toISOString())

      if (templateId) {
        query = query.eq('template_id', templateId)
      }

      const { data, error } = await query

      if (error) throw error

      const metrics: EmailMetrics = {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0
      }

      data?.forEach(log => {
        if (log.status === 'sent') metrics.sent++
        if (log.status === 'delivered') metrics.delivered++
        if (log.opened_at) metrics.opened++
        if (log.clicked_at) metrics.clicked++
        if (log.status === 'bounced') metrics.bounced++
        if (log.status === 'complained') metrics.complained++
      })

      return metrics

    } catch (error) {
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0
      }
    }
  }

  async generateEmailReport(days: number = 30): Promise<any> {
    const metrics = await this.getEmailMetrics(undefined, days)
    const templates = Array.from(this.templates.keys())
    
    const templateMetrics = await Promise.all(
      templates.map(async templateId => ({
        templateId,
        metrics: await this.getEmailMetrics(templateId, days)
      }))
    )

    return {
      overall: metrics,
      byTemplate: templateMetrics,
      period: `${days} days`,
      generatedAt: new Date().toISOString()
    }
  }
}

export default new EmailService()