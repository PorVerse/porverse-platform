// ================================
// APP/API/EMAIL/SEND/ROUTE.TS
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'
import { SecurityService } from '@/lib/security/security-service'
import { DatabaseService } from '@/lib/database/database-service'

interface SendEmailRequest {
  userId: string
  emailType: 'welcome' | 'payment_failed' | 'trial_ending' | 'quantum_unlock' | 'weekly_report' | 'crisis_support'
  data: any
}

const emailService = new EmailService()
const security = SecurityService.getInstance()
const database = new DatabaseService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, emailTypes } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Missing unsubscribe token' },
        { status: 400 }
      )
    }

    // Verify token and get user ID
    const userId = await verifyUnsubscribeToken(token)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 400 }
      )
    }

    // Handle unsubscribe
    const success = await emailService.handleUnsubscribe(userId, emailTypes || ['all'])

    if (success) {
      // Log unsubscribe event
      await database.logUserActivity(userId, 'email', 'unsubscribed', {
        email_types: emailTypes,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: 'Successfully unsubscribed from emails'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to process unsubscribe request' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Email unsubscribe error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function verifyUnsubscribeToken(token: string): Promise<string | null> {
  try {
    // Implementation to verify token and return userId
    // This would typically involve checking a database table
    return null // Placeholder
  } catch (error) {
    return null
  }
}

// ================================
// APP/API/EMAIL/SCHEDULE/ROUTE.TS
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { EmailAutomationService } from '@/lib/email/automation-service'
import { SecurityService } from '@/lib/security/security-service'

const automationService = new EmailAutomationService()
const security = SecurityService.getInstance()

export async function POST(request: NextRequest) {
  try {
    // Internal API only
    const internalKey = request.headers.get('x-internal-key')
    if (internalKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Internal API only' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'process_scheduled':
        await automationService.processScheduledEmails()
        break
      
      case 'weekly_reports':
        await automationService.scheduleWeeklyReports()
        break
      
      case 'daily_trial_checks':
        await automationService.scheduleDailyTrialChecks()
        break
      
      case 'inactivity_reminders':
        await automationService.scheduleInactivityReminders()
        break
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Email schedule action completed: ${action}`
    })

  } catch (error) {
    console.error('Email schedule API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Admin only - get scheduled emails
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'pending'
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Get scheduled emails from database
    const { data: scheduledEmails } = await database.supabaseAdmin
      .from('email_schedule')
      .select('*')
      .eq('status', status)
      .order('scheduled_for', { ascending: true })
      .limit(limit)

    return NextResponse.json({
      success: true,
      scheduledEmails: scheduledEmails || [],
      count: scheduledEmails?.length || 0
    })

  } catch (error) {
    console.error('Get scheduled emails error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Admin only - cancel scheduled email
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const emailId = url.searchParams.get('id')

    if (!emailId) {
      return NextResponse.json(
        { error: 'Missing email ID' },
        { status: 400 }
      )
    }

    const success = await automationService.cancelScheduledEmail(emailId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Scheduled email cancelled'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to cancel scheduled email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Cancel scheduled email error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ================================
// APP/API/WEBHOOKS/STRIPE/ROUTE.TS (Updated with Email Integration)
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payments/payment-service'
import { EmailAutomationService } from '@/lib/email/automation-service'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const paymentService = new PaymentService()
const emailAutomation = new EmailAutomationService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event and trigger email automations
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await paymentService.handleCheckoutCompleted(session)
        
        // Trigger welcome email automation
        if (session.metadata?.user_id && session.metadata?.plan_id) {
          await emailAutomation.onPaymentSucceeded(
            session.metadata.user_id,
            session.metadata.plan_id,
            session
          )
        }
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await paymentService.handlePaymentFailed(failedInvoice)
        
        // Trigger payment failed email automation
        if (failedInvoice.customer_email) {
          const userId = await getUserIdFromCustomerId(failedInvoice.customer as string)
          if (userId) {
            const attemptCount = failedInvoice.attempt_count || 1
            await emailAutomation.onPaymentFailed(userId, failedInvoice, attemptCount)
          }
        }
        break

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await paymentService.handleSubscriptionUpdated(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await paymentService.handleSubscriptionCanceled(deletedSubscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function getUserIdFromCustomerId(customerId: string): Promise<string | null> {
  try {
    // Implementation to get userId from Stripe customer ID
    // This would query your user_profiles table
    return null // Placeholder
  } catch (error) {
    return null
  }
}

// ================================
// APP/API/WEBHOOKS/PAYPAL/ROUTE.TS (Updated with Email Integration)
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { PayPalService } from '@/lib/services/paypal-service'
import { EmailAutomationService } from '@/lib/email/automation-service'

const paypalService = new PayPalService()
const emailAutomation = new EmailAutomationService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headers = request.headers

    // Verify PayPal webhook signature
    const isValid = await paypalService.verifyWebhookSignature(body, headers)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    const eventType = body.event_type
    
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await paypalService.handleSubscriptionActivated(body)
        
        // Trigger welcome email
        const userId = await getUserIdFromPayPalSubscription(body.resource.id)
        if (userId) {
          await emailAutomation.onPaymentSucceeded(userId, 'paypal_plan', body.resource)
        }
        break

      case 'PAYMENT.SALE.COMPLETED':
        await paypalService.handlePaymentCompleted(body)
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await paypalService.handleSubscriptionCancelled(body)
        break

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await paypalService.handlePaymentFailed(body)
        
        // Trigger payment failed email
        const failedUserId = await getUserIdFromPayPalSubscription(body.resource.id)
        if (failedUserId) {
          await emailAutomation.onPaymentFailed(failedUserId, body.resource, 1)
        }
        break

      default:
        console.log(`Unhandled PayPal event: ${eventType}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function getUserIdFromPayPalSubscription(subscriptionId: string): Promise<string | null> {
  try {
    // Implementation to get userId from PayPal subscription ID
    return null // Placeholder
  } catch (error) {
    return null
  }
}

// ================================
// APP/API/CRON/EMAIL-JOBS/ROUTE.TS (For Vercel Cron Jobs)
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { EmailAutomationService } from '@/lib/email/automation-service'

const automationService = new EmailAutomationService()

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const job = url.searchParams.get('job')

    switch (job) {
      case 'process_scheduled':
        await automationService.processScheduledEmails()
        return NextResponse.json({
          success: true,
          message: 'Scheduled emails processed'
        })

      case 'weekly_reports':
        await automationService.scheduleWeeklyReports()
        return NextResponse.json({
          success: true,
          message: 'Weekly reports sent'
        })

      case 'daily_trial_checks':
        await automationService.scheduleDailyTrialChecks()
        return NextResponse.json({
          success: true,
          message: 'Daily trial checks completed'
        })

      case 'inactivity_reminders':
        await automationService.scheduleInactivityReminders()
        return NextResponse.json({
          success: true,
          message: 'Inactivity reminders sent'
        })

      default:
        return NextResponse.json(
          { error: `Unknown job: ${job}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Email cron job error:', error)
    
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}

// ================================
// VERCEL.JSON CONFIGURATION FOR CRON JOBS
// ================================
/*
{
  "crons": [
    {
      "path": "/api/cron/email-jobs?job=process_scheduled",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/email-jobs?job=weekly_reports", 
      "schedule": "0 17 * * 5"
    },
    {
      "path": "/api/cron/email-jobs?job=daily_trial_checks",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/email-jobs?job=inactivity_reminders",
      "schedule": "0 9 * * 1"
    }
  ]
}
*/

// ================================
// ENVIRONMENT VARIABLES TO ADD
// ================================
/*
# Email Service
RESEND_API_KEY=re_your-resend-api-key
RESEND_DOMAIN=porverse.ro

# Internal API Security
INTERNAL_API_KEY=your-super-secret-internal-key-here

# Cron Job Security  
CRON_SECRET=your-cron-secret-key-here

# Email Configuration
EMAIL_FROM_WELCOME=welcome@porverse.ro
EMAIL_FROM_BILLING=billing@porverse.ro
EMAIL_FROM_SUPPORT=support@porverse.ro
EMAIL_FROM_QUANTUM=quantum@porverse.ro
EMAIL_FROM_INSIGHTS=insights@porverse.ro
*/ emailService = new EmailService()
const security = SecurityService.getInstance()
const database = new DatabaseService()

export async function POST(request: NextRequest) {
  try {
    // Security checks
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `email_send_${clientIp}`
    const rateLimitOk = await security.checkRateLimit(rateLimitKey, 10, 300) // 10 emails per 5 minutes
    
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Too many email requests.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body: SendEmailRequest = await request.json()
    
    // Validate input
    if (!body.userId || !body.emailType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, emailType' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedUserId = security.sanitizeInput(body.userId)
    const sanitizedEmailType = security.sanitizeInput(body.emailType)

    // Verify user exists
    const userResult = await database.getUserProfile(sanitizedUserId)
    if (!userResult.success) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Send email based on type
    let emailSent = false
    
    switch (sanitizedEmailType) {
      case 'welcome':
        emailSent = await emailService.sendWelcomeEmail(sanitizedUserId, body.data)
        break
      
      case 'payment_failed':
        emailSent = await emailService.sendPaymentFailedEmail(
          sanitizedUserId, 
          body.data.invoice, 
          body.data.attemptCount
        )
        break
      
      case 'trial_ending':
        emailSent = await emailService.sendTrialEndingEmail(sanitizedUserId, body.data.daysLeft)
        break
      
      case 'quantum_unlock':
        emailSent = await emailService.sendQuantumUnlockEmail(sanitizedUserId)
        break
      
      case 'weekly_report':
        emailSent = await emailService.sendWeeklyProgressReport(sanitizedUserId)
        break
      
      case 'crisis_support':
        emailSent = await emailService.sendCrisisSupportEmail(
          sanitizedUserId,
          body.data.severity,
          body.data.resources
        )
        break
      
      default:
        return NextResponse.json(
          { error: `Unsupported email type: ${sanitizedEmailType}` },
          { status: 400 }
        )
    }

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `${sanitizedEmailType} email sent successfully`,
        userId: sanitizedUserId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Email send API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ================================
// APP/API/EMAIL/AUTOMATION/ROUTE.TS  
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { EmailAutomationService } from '@/lib/email/automation-service'
import { SecurityService } from '@/lib/security/security-service'

interface AutomationTriggerRequest {
  trigger: 'payment_succeeded' | 'payment_failed' | 'trial_ending' | 'trinity_unlocked' | 'milestone_reached' | 'crisis_detected'
  userId: string
  data: any
}

const automationService = new EmailAutomationService()
const security = SecurityService.getInstance()

export async function POST(request: NextRequest) {
  try {
    // Verify this is an internal request (from your own services)
    const internalKey = request.headers.get('x-internal-key')
    if (internalKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Internal API only' },
        { status: 401 }
      )
    }

    const body: AutomationTriggerRequest = await request.json()
    
    // Validate input
    if (!body.trigger || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: trigger, userId' },
        { status: 400 }
      )
    }

    const sanitizedUserId = security.sanitizeInput(body.userId)
    const sanitizedTrigger = security.sanitizeInput(body.trigger)

    // Route to appropriate automation handler
    switch (sanitizedTrigger) {
      case 'payment_succeeded':
        await automationService.onPaymentSucceeded(
          sanitizedUserId,
          body.data.planId,
          body.data.subscriptionData
        )
        break
      
      case 'payment_failed':
        await automationService.onPaymentFailed(
          sanitizedUserId,
          body.data.invoice,
          body.data.attemptCount
        )
        break
      
      case 'trial_ending':
        await automationService.onTrialEnding(sanitizedUserId, body.data.daysLeft)
        break
      
      case 'trinity_unlocked':
        await automationService.onTrinityUnlocked(sanitizedUserId)
        break
      
      case 'milestone_reached':
        await automationService.onMilestoneReached(
          sanitizedUserId,
          body.data.milestone,
          body.data.ecosystemData
        )
        break
      
      case 'crisis_detected':
        await automationService.onCrisisDetected(
          sanitizedUserId,
          body.data.severity,
          body.data.context
        )
        break
      
      default:
        return NextResponse.json(
          { error: `Unsupported trigger: ${sanitizedTrigger}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Automation triggered: ${sanitizedTrigger}`,
      userId: sanitizedUserId
    })

  } catch (error) {
    console.error('Email automation API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get automation stats (admin only)
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.includes('admin')) { // Simplified admin check
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const fromDate = url.searchParams.get('from')
    const toDate = url.searchParams.get('to')

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: 'Missing date range parameters: from, to' },
        { status: 400 }
      )
    }

    const stats = await automationService.getEmailAutomationStats({
      from: new Date(fromDate),
      to: new Date(toDate)
    })

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get automation stats error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ================================
// APP/API/EMAIL/TEMPLATES/ROUTE.TS
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'
import { SecurityService } from '@/lib/security/security-service'

const emailService = new EmailService()
const security = SecurityService.getInstance()

export async function POST(request: NextRequest) {
  try {
    // Admin only endpoint for testing email templates
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { templateName, testData, testEmail } = body

    if (!templateName || !testData || !testEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: templateName, testData, testEmail' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!security.validateEmail(testEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const success = await emailService.testEmailTemplate(
      templateName,
      testData,
      testEmail
    )

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${testEmail}`,
        template: templateName
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Email template test error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ================================
// APP/API/EMAIL/UNSUBSCRIBE/ROUTE.TS
// ================================
import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'
import { SecurityService } from '@/lib/security/security-service'
import { DatabaseService } from '@/lib/database/database-service'

const