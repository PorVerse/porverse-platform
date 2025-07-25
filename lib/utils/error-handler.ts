// lib/utils/error-handler.ts
import { supabaseAdmin } from '@/lib/supabase'

export interface ErrorLog {
  id?: string
  user_id?: string
  error_type: string
  error_message: string
  stack_trace?: string
  context?: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved?: boolean
  created_at?: string
}

export class ErrorHandler {
  static async logError(error: Error | ErrorLog, context?: any): Promise<void> {
    try {
      let errorLog: ErrorLog

      if (error instanceof Error) {
        errorLog = {
          error_type: error.name || 'UnknownError',
          error_message: error.message,
          stack_trace: error.stack,
          context: context,
          severity: this.determineSeverity(error),
          resolved: false
        }
      } else {
        errorLog = error
      }

      // Add timestamp
      errorLog.created_at = new Date().toISOString()

      // Log to database
      await supabaseAdmin
        .from('error_logs')
        .insert([errorLog])

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('🚨 Error logged:', errorLog)
      }

      // Send alerts for critical errors
      if (errorLog.severity === 'critical') {
        await this.sendCriticalAlert(errorLog)
      }

    } catch (logError) {
      // Fallback: log to console if database logging fails
      console.error('Failed to log error to database:', logError)
      console.error('Original error:', error)
    }
  }

  private static determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    // Critical errors
    if (
      message.includes('payment') ||
      message.includes('stripe') ||
      message.includes('paypal') ||
      message.includes('subscription') ||
      message.includes('database connection') ||
      stack.includes('supabase')
    ) {
      return 'critical'
    }

    // High severity
    if (
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('ai') ||
      message.includes('openai')
    ) {
      return 'high'
    }

    // Medium severity
    if (
      message.includes('validation') ||
      message.includes('network') ||
      message.includes('timeout')
    ) {
      return 'medium'
    }

    return 'low'
  }

  private static async sendCriticalAlert(errorLog: ErrorLog): Promise<void> {
    // In production, integrate with your alerting service (Slack, Discord, etc.)
    console.error('🚨 CRITICAL ERROR ALERT:', errorLog)
    
    // Example: Send to Discord webhook
    if (process.env.DISCORD_WEBHOOK_URL) {
      try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: '🚨 Critical Error in PorVerse',
              description: errorLog.error_message,
              color: 15158332, // Red
              fields: [
                { name: 'Error Type', value: errorLog.error_type, inline: true },
                { name: 'User ID', value: errorLog.user_id || 'N/A', inline: true },
                { name: 'Timestamp', value: errorLog.created_at || 'N/A', inline: true }
              ]
            }]
          })
        })
      } catch (webhookError) {
        console.error('Failed to send Discord alert:', webhookError)
      }
    }
  }

  static createErrorResponse(error: any, defaultMessage: string = 'Something went wrong') {
    const isProduction = process.env.NODE_ENV === 'production'
    
    return {
      error: isProduction ? defaultMessage : error.message,
      code: error.code || 'UNKNOWN_ERROR',
      ...(isProduction ? {} : { stack: error.stack })
    }
  }
}

// lib/utils/api-wrapper.ts
import { NextRequest, NextResponse } from 'next/server'
import { ErrorHandler } from './error-handler'
import { createServerSupabase } from '@/lib/supabase'

export interface APIContext {
  req: NextRequest
  user?: any
  supabase: any
}

export function withAuth<T>(
  handler: (context: APIContext) => Promise<T>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const supabase = createServerSupabase()
      
      // Get user from session
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const context: APIContext = { req, user, supabase }
      const result = await handler(context)
      
      return NextResponse.json(result)
      
    } catch (error: any) {
      await ErrorHandler.logError(error, {
        endpoint: req.url,
        method: req.method,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for')
      })
      
      return NextResponse.json(
        ErrorHandler.createErrorResponse(error),
        { status: 500 }
      )
    }
  }
}

export function withErrorHandling<T>(
  handler: (req: NextRequest) => Promise<T>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const result = await handler(req)
      return NextResponse.json(result)
      
    } catch (error: any) {
      await ErrorHandler.logError(error, {
        endpoint: req.url,
        method: req.method,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for')
      })
      
      return NextResponse.json(
        ErrorHandler.createErrorResponse(error),
        { status: 500 }
      )
    }
  }
}

// components/ErrorBoundary.tsx
'use client'

import React from 'react'
import { ErrorHandler } from '@/lib/utils/error-handler'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    ErrorHandler.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Ceva nu a mers bine
            </h1>
            <p className="text-white/70 mb-8">
              S-a întâmplat o eroare neașteptată. Echipa noastră a fost notificată și lucrează la o soluție.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Reîncarcă pagina
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// hooks/useErrorHandler.ts
'use client'

import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { ErrorHandler } from '@/lib/utils/error-handler'

export function useErrorHandler() {
  const handleError = useCallback(async (
    error: Error,
    context?: any,
    showToast: boolean = true
  ) => {
    // Log error
    await ErrorHandler.logError(error, context)
    
    // Show user-friendly message
    if (showToast) {
      const userMessage = getUserFriendlyMessage(error)
      toast.error(userMessage)
    }
  }, [])

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      context?: any
    }
  ): Promise<T | null> => {
    try {
      if (options?.loadingMessage) {
        toast.loading(options.loadingMessage)
      }

      const result = await operation()

      toast.dismiss()
      
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }

      return result
      
    } catch (error: any) {
      toast.dismiss()
      
      await handleError(error, options?.context, true)
      return null
    }
  }, [handleError])

  return { handleError, handleAsyncOperation }
}

function getUserFriendlyMessage(error: Error): string {
  const message = error.message.toLowerCase()

  if (message.includes('network') || message.includes('fetch')) {
    return 'Probleme de conectivitate. Verifică internetul și încearcă din nou.'
  }

  if (message.includes('unauthorized') || message.includes('auth')) {
    return 'Sesiunea a expirat. Te rog să te autentifici din nou.'
  }

  if (message.includes('payment') || message.includes('stripe') || message.includes('paypal')) {
    return 'Eroare la procesarea plății. Te rog încearcă din nou sau contactează suportul.'
  }

  if (message.includes('validation')) {
    return 'Datele introduse nu sunt valide. Verifică și încearcă din nou.'
  }

  if (message.includes('rate limit')) {
    return 'Prea multe încercări. Te rog așteaptă câteva minute și încearcă din nou.'
  }

  return 'A apărut o eroare neașteptată. Te rog încearcă din nou.'
}

// lib/utils/monitoring.ts
export class MonitoringService {
  static async trackUserAction(
    userId: string,
    action: string,
    ecosystem?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await supabaseAdmin
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          ecosystem,
          action_type: action,
          action_data: metadata,
          ip_address: this.getClientIP(),
          user_agent: this.getUserAgent(),
          session_id: this.getSessionId()
        })
    } catch (error) {
      console.error('Failed to track user action:', error)
    }
  }

  static async trackPaymentEvent(
    userId: string,
    provider: 'stripe' | 'paypal',
    event: string,
    metadata?: any
  ): Promise<void> {
    try {
      await supabaseAdmin
        .from('payment_logs')
        .insert({
          user_id: userId,
          payment_provider: provider,
          action: event,
          metadata,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to track payment event:', error)
    }
  }

  static async getSystemHealth(): Promise<any> {
    try {
      const checks = await Promise.allSettled([
        this.checkDatabase(),
        this.checkExternalAPIs(),
        this.checkPaymentProviders()
      ])

      return {
        overall: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'degraded',
        database: checks[0].status === 'fulfilled',
        apis: checks[1].status === 'fulfilled',
        payments: checks[2].status === 'fulfilled',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        overall: 'down',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  private static async checkDatabase(): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    return !error
  }

  private static async checkExternalAPIs(): Promise<boolean> {
    try {
      // Check OpenAI
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      })
      
      return response.ok
    } catch {
      return false
    }
  }

  private static async checkPaymentProviders(): Promise<boolean> {
    // Add actual health checks for Stripe and PayPal
    return true
  }

  private static getClientIP(): string {
    // Implement IP detection
    return 'unknown'
  }

  private static getUserAgent(): string {
    // Implement user agent detection
    return 'unknown'
  }

  private static getSessionId(): string {
    // Implement session ID generation
    return crypto.randomUUID()
  }
}

// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { MonitoringService } from '@/lib/utils/monitoring'

export async function GET() {
  try {
    const health = await MonitoringService.getSystemHealth()
    
    const status = health.overall === 'healthy' ? 200 : 
                   health.overall === 'degraded' ? 503 : 500

    return NextResponse.json(health, { status })
  } catch (error) {
    return NextResponse.json(
      { 
        overall: 'down',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}