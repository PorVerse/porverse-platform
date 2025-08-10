// ================================
// lib/email/automation-service.ts (CLEAN)
// ================================
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { EmailService } from './email-service'
import { DatabaseService } from '../database/database-service'
import { SecurityService } from '../security/security-service'
import { randomUUID } from 'crypto'

type Json = Record<string, any> | any[] | string | number | boolean | null

interface AutomationTrigger {
  type: 'payment' | 'trial' | 'achievement' | 'crisis' | 'scheduled'
  userId: string
  eventData: any
  timestamp: Date
}

interface EmailSchedule {
  id: string
  userId: string
  emailType: string
  scheduledFor: Date
  data: any
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
}

export class EmailAutomationService {
  private emailService: EmailService
  private database: DatabaseService
  private security: SecurityService
  private isRunning = false
  private db: SupabaseClient

  constructor() {
    this.emailService = new EmailService()
    this.database = new DatabaseService()
    this.security = SecurityService.getInstance()

    // client intern pt. tabelele de automatizări (email_schedule etc.)
    this.db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }

  // ================================
  // PAYMENT EVENT TRIGGERS
  // ================================
  async onPaymentSucceeded(userId: string, planId: string, _subscriptionData: any): Promise<void> {
    if (this.isRunning) return
    try {
      const plan = this.getPlanDetails(planId)
      if (!plan) {
        console.error('Plan not found:', planId)
        return
      }

      const welcomeSent = await this.emailService.sendWelcomeEmail(userId, plan)
      if (welcomeSent) {
        await this.database.logUserActivity(userId, 'email_automation', 'welcome_sent', {
          plan_id: planId,
          trigger: 'payment_succeeded',
          timestamp: new Date().toISOString()
        })
        await this.scheduleOnboardingSequence(userId, plan)
      }
      console.log(`Welcome email automation completed for user ${userId}`)
    } catch (error: any) {
      console.error('Payment succeeded automation error:', error)
      await this.logAutomationError(userId, 'payment_succeeded', String(error.message || error))
    }
  }

  async onPaymentFailed(userId: string, invoice: any, attemptCount: number): Promise<void> {
    if (this.isRunning) return
    try {
      const failedEmailSent = await this.emailService.sendPaymentFailedEmail(userId, invoice, attemptCount)

      if (failedEmailSent) {
        if (attemptCount < 3) {
          await this.schedulePaymentRetryReminder(userId, invoice, attemptCount + 1)
        } else {
          await this.scheduleAccountSuspensionNotice(userId)
        }

        await this.database.logUserActivity(userId, 'email_automation', 'payment_failed_sent', {
          attempt_count: attemptCount,
          invoice_id: invoice?.id,
          timestamp: new Date().toISOString()
        })
      }

      console.log(`Payment failed email sent to user ${userId}, attempt ${attemptCount}`)
    } catch (error: any) {
      console.error('Payment failed automation error:', error)
      await this.logAutomationError(userId, 'payment_failed', String(error.message || error))
    }
  }

  async onTrialEnding(userId: string, daysLeft: number): Promise<void> {
    if (this.isRunning) return
    try {
      if (![3, 1].includes(daysLeft)) return

      const trialEmailSent = await this.emailService.sendTrialEndingEmail(userId, daysLeft)
      if (trialEmailSent) {
        await this.database.logUserActivity(userId, 'email_automation', 'trial_ending_sent', {
          days_left: daysLeft,
          timestamp: new Date().toISOString()
        })
        if (daysLeft === 1) await this.scheduleFinalTrialReminder(userId)
      }

      console.log(`Trial ending email sent to user ${userId}, ${daysLeft} days left`)
    } catch (error: any) {
      console.error('Trial ending automation error:', error)
      await this.logAutomationError(userId, 'trial_ending', String(error.message || error))
    }
  }

  // ================================
  // ACHIEVEMENT TRIGGERS
  // ================================
  async onTrinityUnlocked(userId: string): Promise<void> {
    if (this.isRunning) return
    try {
      const sent = await this.emailService.sendQuantumUnlockEmail(userId)
      if (sent) {
        await this.database.logUserActivity(userId, 'email_automation', 'quantum_unlock_sent', {
          achievement: 'trinity_master',
          timestamp: new Date().toISOString()
        })
        await this.scheduleQuantumOnboardingSequence(userId)
      }
      console.log(`Quantum Vault unlock email sent to user ${userId}`)
    } catch (error: any) {
      console.error('Trinity unlock automation error:', error)
      await this.logAutomationError(userId, 'trinity_unlock', String(error.message || error))
    }
  }

  async onMilestoneReached(userId: string, milestone: string, ecosystemData: any): Promise<void> {
    if (this.isRunning) return
    try {
      await this.database.logUserActivity(userId, 'email_automation', 'milestone_reached', {
        milestone,
        ecosystem_data: ecosystemData,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Milestone reached automation error:', error)
      await this.logAutomationError(userId, 'milestone_reached', String(error.message || error))
    }
  }

  // ================================
  // CRISIS INTERVENTION TRIGGERS
  // ================================
  async onCrisisDetected(userId: string, severity: 'high' | 'critical', context: any): Promise<void> {
    if (this.isRunning) return
    try {
      const resources = await this.getCrisisSupportResources(context?.location || 'RO')
      const sent = await this.emailService.sendCrisisSupportEmail(userId, severity, resources)

      if (sent) {
        await this.database.logUserActivity(userId, 'email_automation', 'crisis_support_sent', {
          severity,
          context,
          timestamp: new Date().toISOString(),
          priority: 'critical'
        })
        if (severity === 'critical') await this.scheduleCrisisFollowUp(userId, context)
      }
      console.log(`Crisis support email sent to user ${userId}, severity: ${severity}`)
    } catch (error: any) {
      console.error('Crisis detection automation error:', error)
      await this.logAutomationError(userId, 'crisis_detected', String(error.message || error))
    }
  }

  // ================================
  // SCHEDULED EMAIL JOBS
  // ================================
  async scheduleWeeklyReports(): Promise<void> {
    try {
      const users = await this.getPremiumUsers()
      console.log(`Starting weekly reports for ${users.length} users`)
      for (const u of users) {
        try {
          const ok = await this.emailService.sendWeeklyProgressReport(u.user_id)
          if (ok) {
            await this.database.logUserActivity(u.user_id, 'email_automation', 'weekly_report_sent', {
              week: this.getCurrentWeekNumber(),
              timestamp: new Date().toISOString()
            })
          }
          await this.delay(500)
        } catch (e) {
          console.error(`Weekly report failed for user ${u.user_id}:`, e)
        }
      }
      console.log('Weekly reports completed')
    } catch (error) {
      console.error('Weekly reports automation error:', error)
    }
  }

  async scheduleDailyTrialChecks(): Promise<void> {
    try {
      const threeDayUsers = await this.getUsersWithTrialEnding(3)
      for (const u of threeDayUsers) {
        await this.onTrialEnding(u.user_id, 3)
        await this.delay(200)
      }

      const oneDayUsers = await this.getUsersWithTrialEnding(1)
      for (const u of oneDayUsers) {
        await this.onTrialEnding(u.user_id, 1)
        await this.delay(200)
      }

      console.log(`Trial ending checks completed: ${threeDayUsers.length + oneDayUsers.length} emails processed`)
    } catch (error) {
      console.error('Daily trial checks error:', error)
    }
  }

  async scheduleInactivityReminders(): Promise<void> {
    try {
      const inactive = await this.getInactiveUsers(7)
      for (const u of inactive) {
        await this.sendReEngagementEmail(u.user_id)
        await this.delay(300)
      }
      console.log(`Re-engagement emails sent to ${inactive.length} inactive users`)
    } catch (error) {
      console.error('Inactivity reminders error:', error)
    }
  }

  // ================================
  // EMAIL SCHEDULING SYSTEM
  // ================================
  private async scheduleOnboardingSequence(userId: string, plan: any, signupDate: Date = new Date()): Promise<void> {
    const seq = [
      { delayDays: 1, type: 'onboarding_tips', data: { plan_name: plan.name, ecosystems: plan.ecosystems } },
      { delayDays: 3, type: 'feature_spotlight', data: { featured_ecosystem: plan.ecosystems?.[0] } },
      { delayDays: 7, type: 'progress_check', data: { week_number: 1 } }
    ]
    for (const s of seq) {
      await this.scheduleEmail({
        userId,
        emailType: s.type,
        scheduledFor: new Date(signupDate.getTime() + s.delayDays * 24 * 60 * 60 * 1000),
        data: s.data
      })
    }
  }

  private async scheduleQuantumOnboardingSequence(userId: string, unlockDate: Date = new Date()): Promise<void> {
    const seq = [
      { delayDays: 0.5, type: 'quantum_getting_started', data: { feature: 'future_self' } },
      { delayDays: 2, type: 'quantum_advanced_features', data: { feature: 'identity_simulator' } },
      { delayDays: 7, type: 'quantum_mastery_tips', data: { all_features: true } }
    ]
    for (const s of seq) {
      await this.scheduleEmail({
        userId,
        emailType: s.type,
        scheduledFor: new Date(unlockDate.getTime() + s.delayDays * 24 * 60 * 60 * 1000),
        data: s.data
      })
    }
  }

  private async schedulePaymentRetryReminder(userId: string, invoice: any, attemptNumber: number): Promise<void> {
    await this.scheduleEmail({
      userId,
      emailType: 'payment_retry_reminder',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      data: { invoice, attempt_number: attemptNumber }
    })
  }

  private async scheduleAccountSuspensionNotice(userId: string): Promise<void> {
    await this.scheduleEmail({
      userId,
      emailType: 'account_suspension',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      data: { suspension_date: new Date(Date.now() + 48 * 60 * 60 * 1000) }
    })
  }

  private async scheduleFinalTrialReminder(userId: string): Promise<void> {
    // calculăm cu user_subscriptions.status='trialing'
    const { data } = await this.db
      .from('user_subscriptions')
      .select('current_period_end')
      .eq('user_id', userId)
      .eq('status', 'trialing')
      .order('current_period_end', { ascending: false })
      .limit(1)
      .single()

    const trialEnd = data?.current_period_end ? new Date(data.current_period_end).getTime() : null
    if (!trialEnd) {
      console.error(`Cannot schedule final trial reminder: trial end not found for user ${userId}`)
      return
    }

    const sixHoursBefore = new Date(trialEnd - 6 * 60 * 60 * 1000)
    await this.scheduleEmail({
      userId,
      emailType: 'final_trial_reminder',
      scheduledFor: sixHoursBefore,
      data: { trial_ends_at: new Date(trialEnd).toISOString() }
    })
  }

  private async scheduleCrisisFollowUp(userId: string, context: any): Promise<void> {
    await this.scheduleEmail({
      userId,
      emailType: 'crisis_followup',
      scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12h
      data: { context }
    })
  }

  private async scheduleEmail(emailSchedule: Omit<EmailSchedule, 'id' | 'status'>): Promise<void> {
    try {
      const { error } = await this.db.from('email_schedule').insert({
        id: randomUUID(),
        user_id: emailSchedule.userId,
        email_type: emailSchedule.emailType,
        scheduled_for: emailSchedule.scheduledFor.toISOString(),
        data: emailSchedule.data as Json,
        status: 'pending'
      })
      if (error) console.error('Schedule email insert error:', error)
    } catch (error) {
      console.error('Schedule email error:', error)
    }
  }

  async processScheduledEmails(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    try {
      const { data: pending, error } = await this.db
        .from('email_schedule')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(50)

      if (error) {
        console.error('Error fetching pending emails:', error)
        return
      }
      if (!pending?.length) {
        // nothing to do
        return
      }

      console.log(`Processing ${pending.length} scheduled emails`)
      for (const item of pending) {
        try {
          const success = await this.sendScheduledEmail(item)
          await this.db
            .from('email_schedule')
            .update({
              status: success ? 'sent' : 'failed',
              processed_at: new Date().toISOString(),
              error_message: success ? null : 'sendScheduledEmail returned false'
            })
            .eq('id', item.id)

          await this.delay(200) // rate-limit
        } catch (err: any) {
          console.error(`Failed to process scheduled email ${item.id}:`, err)
          await this.db
            .from('email_schedule')
            .update({
              status: 'failed',
              error_message: String(err?.message || err),
              processed_at: new Date().toISOString()
            })
            .eq('id', item.id)
        }
      }
    } catch (err) {
      console.error('Process scheduled emails error:', err)
    } finally {
      this.isRunning = false
    }
  }

  private async sendScheduledEmail(emailSchedule: any): Promise<boolean> {
    const payload = {
      userId: emailSchedule.user_id as string,
      emailType: emailSchedule.email_type as string,
      data: emailSchedule.data as any
    }

    switch (payload.emailType) {
      case 'onboarding_tips':
        return this.sendOnboardingTipsEmail(payload.userId, payload.data)
      case 'feature_spotlight':
        return this.sendFeatureSpotlightEmail(payload.userId, payload.data)
      case 'progress_check':
        return this.sendProgressCheckEmail(payload.userId, payload.data)
      case 'quantum_getting_started':
        return this.sendQuantumGettingStartedEmail(payload.userId, payload.data)
      case 'payment_retry_reminder':
        return this.emailService.sendPaymentFailedEmail(payload.userId, payload.data?.invoice, payload.data?.attempt_number)
      case 'final_trial_reminder':
        return this.sendFinalTrialReminderEmail(payload.userId, payload.data)
      case 'crisis_followup':
        return this.sendCrisisFollowUpEmail(payload.userId, payload.data)
      default:
        console.warn(`Unknown email type: ${payload.emailType}`)
        return false
    }
  }

  // ================================
  // SPECIALIZED EMAIL FUNCTIONS (placeholders)
  // ================================
  private async sendOnboardingTipsEmail(userId: string, _data: any): Promise<boolean> {
    console.log(`Sending onboarding tips to user ${userId}`)
    return true
  }

  private async sendFeatureSpotlightEmail(userId: string, _data: any): Promise<boolean> {
    console.log(`Sending feature spotlight to user ${userId}`)
    return true
  }

  private async sendProgressCheckEmail(userId: string, _data: any): Promise<boolean> {
    console.log(`Sending progress check to user ${userId}`)
    return true
  }

  private async sendQuantumGettingStartedEmail(userId: string, _data: any): Promise<boolean> {
    console.log(`Sending quantum getting started to user ${userId}`)
    return true
  }

  private async sendFinalTrialReminderEmail(userId: string, _data: any): Promise<boolean> {
    console.log(`Sending final trial reminder to user ${userId}`)
    return true
  }

  private async sendCrisisFollowUpEmail(userId: string, _data: any): Promise<boolean> {
    console.log(`Sending crisis follow-up to user ${userId}`)
    return true
  }

  private async sendReEngagementEmail(userId: string): Promise<boolean> {
    console.log(`Sending re-engagement email to user ${userId}`)
    return true
  }

  // ================================
  // HELPERS (data access)
  // ================================
  private async getPremiumUsers(): Promise<Array<{ user_id: string }>> {
    const { data, error } = await this.db
      .from('user_subscriptions')
      .select('user_id')
      .eq('status', 'active')

    if (error) {
      console.error('getPremiumUsers error:', error)
      return []
    }
    // deduplicate
    const set = new Set<string>()
    const list: Array<{ user_id: string }> = []
    for (const row of data || []) {
      if (!set.has(row.user_id)) {
        set.add(row.user_id)
        list.push({ user_id: row.user_id })
      }
    }
    return list
  }

  private async getUsersWithTrialEnding(daysLeft: number): Promise<Array<{ user_id: string }>> {
    // cautăm trialing care se termină în "daysLeft" zile (±24h)
    const now = new Date()
    const targetStart = new Date(now.getTime() + daysLeft * 24 * 60 * 60 * 1000)
    const targetEnd = new Date(targetStart.getTime() + 24 * 60 * 60 * 1000)

    const { data, error } = await this.db
      .from('user_subscriptions')
      .select('user_id,current_period_end,status')
      .eq('status', 'trialing')
      .gte('current_period_end', targetStart.toISOString())
      .lt('current_period_end', targetEnd.toISOString())

    if (error) {
      console.error('getUsersWithTrialEnding error:', error)
      return []
    }
    const set = new Set<string>()
    const out: Array<{ user_id: string }> = []
    for (const r of data || []) {
      if (!set.has(r.user_id)) {
        set.add(r.user_id)
        out.push({ user_id: r.user_id })
      }
    }
    return out
  }

  private async getInactiveUsers(days: number): Promise<Array<{ user_id: string }>> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const { data, error } = await this.db
      .from('user_ecosystems')
      .select('user_id,last_accessed_at')
      .lt('last_accessed_at', cutoff.toISOString())

    if (error) {
      console.error('getInactiveUsers error:', error)
      return []
    }
    const set = new Set<string>()
    const out: Array<{ user_id: string }> = []
    for (const r of data || []) {
      if (!set.has(r.user_id)) {
        set.add(r.user_id)
        out.push({ user_id: r.user_id })
      }
    }
    return out
  }

  // ================================
  // OTHER HELPERS
  // ================================
  private async getCrisisSupportResources(location: string): Promise<any[]> {
    const resources: Record<string, any[]> = {
      RO: [
        { type: 'emergency', name: 'Serviciul Național de Sănătate Psihică și Profilaxia Suicidului', number: '0800 801 200', description: 'Linie directă gratuită' },
        { type: 'emergency', name: '112', number: '112', description: 'Numărul unic de urgență' },
        { type: 'support', name: 'Telefonul Copilului', number: '116 111', description: 'Sprijin pentru copii și adolescenți' }
      ],
      US: [{ type: 'emergency', name: '988 Suicide & Crisis Lifeline', number: '988', description: '24/7 crisis support' }]
    }
    return resources[location] || resources['RO']
  }

  private getPlanDetails(planId: string): any {
    const plans = {
      starter: { name: 'PorHealth Starter', ecosystems: ['PorHealth'], features: ['AI Nutrition Planner', 'Workout Optimizer', 'Health Tracking'] },
      pro: { name: 'Triple Pack Pro', ecosystems: ['PorHealth', 'PorKids', 'PorMind'], features: ['Health AI', 'Homework Scanner', 'Financial Advisor'] },
      complete: { name: 'Complete Ecosystem', ecosystems: ['PorHealth', 'PorKids', 'PorMind', 'PorWell', 'PorFlow', 'PorBlu'], features: ['All Ecosystems', 'AI Therapist', 'Quantum Vault Access'] }
    }
    return (plans as any)[planId]
  }

  private getCurrentWeekNumber(): number {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now.getTime() - start.getTime()
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
  }

  private async logAutomationError(userId: string, automationType: string, errorMsg: string): Promise<void> {
    try {
      await this.database.logUserActivity(userId, 'email_automation', 'automation_error', {
        automation_type: automationType,
        error_message: errorMsg,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('Failed to log automation error:', err)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ================================
  // MASTER AUTOMATION CONTROLLER
  // ================================
  async startAutomationEngine(): Promise<void> {
    console.log('🚀 Starting PorVerse Email Automation Engine...')
    // rulează coada la 5 minute
    setInterval(async () => {
      await this.processScheduledEmails()
    }, 5 * 60 * 1000)

    // Placeholder pentru joburi recurente (folosește node-cron în producție)
    this.scheduleRecurringJob('weekly_reports', '0 17 * * 5', async () => {
      await this.scheduleWeeklyReports()
    })

    this.scheduleRecurringJob('daily_trial_checks', '0 10 * * *', async () => {
      await this.scheduleDailyTrialChecks()
    })

    this.scheduleRecurringJob('inactivity_reminders', '0 9 * * 1', async () => {
      await this.scheduleInactivityReminders()
    })
  }

  private scheduleRecurringJob(name: string, cronExpression: string, _job: () => Promise<void>): void {
    // DOAR INFO: Adaugă 'node-cron' pentru a rula cu adevărat după cronExpression.
    console.log(`Scheduled recurring job (placeholder): ${name} -> ${cronExpression}`)
  }

  // ================================
  // ANALYTICS & REPORTING
  // ================================
  async getEmailAutomationStats(dateRange: { from: Date; to: Date }): Promise<any> {
    try {
      const { data: logs } = await this.db
        .from('user_activity_logs')
        .select('*')
        .eq('ecosystem', 'email_automation')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())

      const total = logs?.length || 0
      const countBy = (t: string) => (logs || []).filter((l: any) => l.action_type === t).length

      return {
        totalEmails: total,
        welcomeEmails: countBy('welcome_sent'),
        paymentFailedEmails: countBy('payment_failed_sent'),
        trialEndingEmails: countBy('trial_ending_sent'),
        quantumUnlockEmails: countBy('quantum_unlock_sent'),
        weeklyReports: countBy('weekly_report_sent'),
        crisisSupportEmails: countBy('crisis_support_sent'),
        errors: countBy('automation_error')
      }
    } catch (error) {
      console.error('Get email automation stats error:', error)
      return null
    }
  }

  // ================================
  // EMERGENCY CONTROLS
  // ================================
  async pauseAllAutomations(): Promise<void> {
    this.isRunning = true
    console.log('⏸️ All email automations paused')
  }

  async resumeAllAutomations(): Promise<void> {
    this.isRunning = false
    console.log('▶️ All email automations resumed')
  }

  async cancelScheduledEmail(emailId: string): Promise<boolean> {
    try {
      const { error } = await this.db
        .from('email_schedule')
        .update({ status: 'cancelled' })
        .eq('id', emailId)
        .eq('status', 'pending')
      return !error
    } catch (error) {
      console.error('Cancel scheduled email error:', error)
      return false
    }
  }
}

export default EmailAutomationService
