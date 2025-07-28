// ================================
// MIDDLEWARE.TS - SECURITY FOUNDATION
// ================================
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'
import { createServerClient } from '@supabase/ssr'

// Rate limiting storage
const rateLimitStorage = new Map<string, { count: number; resetTime: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ================================
  // 1. SECURITY HEADERS
  // ================================
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // ================================
  // 2. RATE LIMITING
  // ================================
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitKey = `${ip}:${pathname}`
  
  // Different limits for different endpoints
  const rateLimits: Record<string, { requests: number; window: number }> = {
    '/api/ai/': { requests: 20, window: 60000 }, // 20 per minute for AI
    '/api/payments/': { requests: 5, window: 60000 }, // 5 per minute for payments
    '/api/': { requests: 60, window: 60000 }, // 60 per minute general
    default: { requests: 100, window: 60000 }
  }
  
  const limit = Object.entries(rateLimits).find(([path]) => 
    pathname.startsWith(path)
  )?.[1] || rateLimits.default
  
  const now = Date.now()
  const current = rateLimitStorage.get(rateLimitKey)
  
  if (current && now < current.resetTime) {
    if (current.count >= limit.requests) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    current.count++
  } else {
    rateLimitStorage.set(rateLimitKey, {
      count: 1,
      resetTime: now + limit.window
    })
  }

  // ================================
  // 3. AUTHENTICATION CHECK
  // ================================
  if (isProtectedRoute(pathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      response.headers.set('x-user-id', session.user.id)
      response.headers.set('x-user-email', session.user.email || '')
    }
  }

  // ================================
  // 4. CSRF PROTECTION
  // ================================
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token')
    const sessionToken = request.cookies.get('csrf-token')?.value
    
    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }
  }

  // ================================
  // 5. LOGGING & MONITORING
  // ================================
  if (pathname.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - IP: ${ip}`)
  }

  return response
}

// ================================
// HELPER FUNCTIONS
// ================================
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/api/payments',
    '/api/ai',
    '/api/user',
    '/quantum-vault'
  ]
  
  return protectedRoutes.some(route => pathname.startsWith(route))
}

// ================================
// MIDDLEWARE CONFIG
// ================================
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    '/api/:path*',
    '/dashboard/:path*',
    '/quantum-vault/:path*'
  ]
}

// ================================
// LIB/SECURITY/SECURITY-SERVICE.TS
// ================================
import crypto from 'crypto'
import DOMPurify from 'isomorphic-dompurify'

export class SecurityService {
  private static instance: SecurityService
  
  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }
    return SecurityService.instance
  }

  // ================================
  // INPUT SANITIZATION
  // ================================
  sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    })
  }

  sanitizeJSON(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeInput(data)
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeJSON(item))
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[this.sanitizeInput(key)] = this.sanitizeJSON(value)
      }
      return sanitized
    }
    
    return data
  }

  // ================================
  // ENCRYPTION & DECRYPTION
  // ================================
  encrypt(text: string): string {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  decrypt(encryptedData: string): string {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
    
    const parts = encryptedData.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  // ================================
  // JWT TOKEN MANAGEMENT
  // ================================
  generateJWT(payload: any, expiresIn: string = '24h'): string {
    const jwt = require('jsonwebtoken')
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn })
  }

  verifyJWT(token: string): any {
    const jwt = require('jsonwebtoken')
    try {
      return jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // ================================
  // CSRF TOKEN MANAGEMENT
  // ================================
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // ================================
  // PASSWORD HASHING
  // ================================
  async hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs')
    const saltRounds = parseInt(process.env.HASH_SALT_ROUNDS || '12')
    return await bcrypt.hash(password, saltRounds)
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcryptjs')
    return await bcrypt.compare(password, hash)
  }

  // ================================
  // SECURE RANDOM GENERATION
  // ================================
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  generateNumericCode(length: number = 6): string {
    const digits = '0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += digits[crypto.randomInt(0, digits.length)]
    }
    return result
  }

  // ================================
  // IP & REQUEST VALIDATION
  // ================================
  isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 320
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s+/g, ''))
  }

  // ================================
  // SQL INJECTION PREVENTION
  // ================================
  validateSQLInput(input: string): boolean {
    const sqlInjectionRegex = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|JAVASCRIPT)\b)|(-{2})|\/\*|\*\//gi
    return !sqlInjectionRegex.test(input)
  }

  // ================================
  // XSS PREVENTION
  // ================================
  escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }
    return text.replace(/[&<>"'/`=]/g, (char) => map[char])
  }

  // ================================
  // FILE UPLOAD VALIDATION
  // ================================
  validateFileUpload(file: { name: string; size: number; type: string }): {
    valid: boolean;
    error?: string;
  } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain'
    ]
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs']

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' }
    }

    const extension = file.name.toLowerCase().split('.').pop()
    if (extension && dangerousExtensions.includes(`.${extension}`)) {
      return { valid: false, error: 'File extension not allowed' }
    }

    return { valid: true }
  }

  // ================================
  // AUDIT LOGGING
  // ================================
  async logSecurityEvent(event: {
    type: 'login' | 'failed_login' | 'password_change' | 'permission_denied' | 'suspicious_activity'
    userId?: string
    ip: string
    userAgent: string
    details?: any
  }): Promise<void> {
    const logEntry = {
      ...event,
      timestamp: new Date().toISOString(),
      severity: this.getEventSeverity(event.type)
    }

    console.log('[SECURITY]', JSON.stringify(logEntry))
    
    // Save to database for audit trail
    // Implementation depends on your logging strategy
  }

  private getEventSeverity(eventType: string): 'low' | 'medium' | 'high' {
    const severityMap: Record<string, 'low' | 'medium' | 'high'> = {
      'login': 'low',
      'failed_login': 'medium',
      'password_change': 'medium',
      'permission_denied': 'high',
      'suspicious_activity': 'high'
    }
    return severityMap[eventType] || 'medium'
  }
}