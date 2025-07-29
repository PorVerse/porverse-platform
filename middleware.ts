// ================================
// MIDDLEWARE.TS - SECURITY FOUNDATION COMPLETE & CORRECTED
// ================================
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'
import { createServerClient } from '@supabase/ssr'
import crypto from 'crypto'

// Rate limiting storage (în production folosește Redis)
const rateLimitStorage = new Map<string, { count: number; resetTime: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ================================
  // 1. SECURITY HEADERS - ENHANCED
  // ================================
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  
  // Content Security Policy pentru extra security
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.stripe.com wss:; frame-src https://js.stripe.com;"
  )
  
  // ================================
  // 2. RATE LIMITING - ENHANCED
  // ================================
  const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const rateLimitKey = `${ip}:${pathname}`
  
  // Granular rate limits pentru different endpoints
  const rateLimits: Record<string, { requests: number; window: number }> = {
    '/api/quantum-vault/future-self/generate': { requests: 3, window: 3600000 }, // 3 per hour - expensive AI
    '/api/quantum-vault/future-self/conversation': { requests: 30, window: 60000 }, // 30 per minute
    '/api/quantum-vault/future-self/avatar': { requests: 5, window: 3600000 }, // 5 avatar generations per hour
    '/api/ai/': { requests: 20, window: 60000 }, // 20 per minute for AI
    '/api/payments/': { requests: 5, window: 300000 }, // 5 per 5 minutes for payments
    '/api/auth/': { requests: 10, window: 300000 }, // 10 per 5 minutes for auth
    '/api/': { requests: 60, window: 60000 }, // 60 per minute general API
    '/auth/': { requests: 15, window: 300000 }, // 15 per 5 minutes for auth pages
    default: { requests: 100, window: 60000 }
  }
  
  // Find most specific rate limit
  const limit = Object.entries(rateLimits)
    .sort(([a], [b]) => b.length - a.length) // Sort by specificity
    .find(([path]) => pathname.startsWith(path))?.[1] || rateLimits.default
  
  const now = Date.now()
  const current = rateLimitStorage.get(rateLimitKey)
  
  if (current && now < current.resetTime) {
    if (current.count >= limit.requests) {
      // Log potential abuse
      console.warn(`[SECURITY] Rate limit exceeded: ${ip} - ${pathname} - ${userAgent}`)
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please slow down.',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': limit.requests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetTime.toString()
          }
        }
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
  // 3. AUTHENTICATION CHECK - ENHANCED
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

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // Log failed authentication attempt
        console.warn(`[SECURITY] Authentication failed: ${pathname} - ${ip} - ${userAgent}`)
        
        // Redirect for page routes, 401 for API routes
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        } else {
          return NextResponse.redirect(new URL('/auth/login', request.url))
        }
      }

      // Add user context to API requests
      if (pathname.startsWith('/api/')) {
        response.headers.set('x-user-id', session.user.id)
        response.headers.set('x-user-email', session.user.email || '')
        response.headers.set('x-user-role', session.user.role || 'user')
      }

      // Check for quantum vault access on quantum routes
      if (pathname.startsWith('/api/quantum-vault/') || pathname.startsWith('/quantum-vault/')) {
        // This will be handled by the API routes themselves, but we log access
        console.log(`[QUANTUM] Access attempt: ${session.user.email} - ${pathname}`)
      }

    } catch (error) {
      console.error('[SECURITY] Middleware auth error:', error)
      
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication service unavailable' },
          { status: 503 }
        )
      } else {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }
  }

  // ================================
  // 4. CSRF PROTECTION - ENHANCED
  // ================================
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    // Skip CSRF for specific endpoints
    const skipCSRF = pathname.startsWith('/api/webhooks/') || 
                     pathname.startsWith('/api/auth/callback') ||
                     pathname === '/api/auth/session'
    
    if (!skipCSRF) {
      // Check Origin header
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      const referer = request.headers.get('referer')
      
      if (origin && host) {
        const originUrl = new URL(origin)
        if (originUrl.host !== host) {
          console.warn(`[SECURITY] CSRF - Invalid origin: ${origin} vs ${host} - ${ip}`)
          return NextResponse.json(
            { error: 'Invalid request origin' },
            { status: 403 }
          )
        }
      }
      
      // For API routes, check CSRF token (optional implementation)
      if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
        const csrfToken = request.headers.get('x-csrf-token')
        const sessionToken = request.cookies.get('csrf-token')?.value
        
        // Relaxed CSRF for development, strict for production
        if (process.env.NODE_ENV === 'production' && (!csrfToken || !sessionToken || csrfToken !== sessionToken)) {
          console.warn(`[SECURITY] CSRF token mismatch: ${pathname} - ${ip}`)
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          )
        }
      }
    }
  }

  // ================================
  // 5. INPUT VALIDATION & SANITIZATION
  // ================================
  if (request.method === 'POST' && request.headers.get('content-type')?.includes('application/json')) {
    try {
      const body = await request.clone().json()
      
      // Basic input validation
      if (hasBasicXSSAttempt(JSON.stringify(body))) {
        console.warn(`[SECURITY] Potential XSS attempt blocked: ${pathname} - ${ip}`)
        return NextResponse.json(
          { error: 'Invalid request content' },
          { status: 400 }
        )
      }
      
      // Check for SQL injection attempts
      if (hasSQLInjectionAttempt(JSON.stringify(body))) {
        console.warn(`[SECURITY] Potential SQL injection blocked: ${pathname} - ${ip}`)
        return NextResponse.json(
          { error: 'Invalid request content' },
          { status: 400 }
        )
      }
      
    } catch (error) {
      // Invalid JSON, let the API handle it
    }
  }

  // ================================
  // 6. SUSPICIOUS ACTIVITY DETECTION
  // ================================
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // Script injection
    /union.*select/gi, // SQL injection
    /javascript:/gi, // JavaScript protocol
    /vbscript:/gi, // VBScript protocol
    /onload=/gi, // Event handler injection
    /onerror=/gi // Event handler injection
  ]
  
  const fullUrl = request.url
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(fullUrl))
  
  if (isSuspicious) {
    console.warn(`[SECURITY] Suspicious request blocked: ${fullUrl} - ${ip} - ${userAgent}`)
    return NextResponse.json(
      { error: 'Request blocked for security reasons' },
      { status: 403 }
    )
  }

  // ================================
  // 7. LOGGING & MONITORING - ENHANCED
  // ================================
  if (pathname.startsWith('/api/')) {
    const logLevel = getLogLevel(pathname)
    const logMessage = `[${logLevel}] ${request.method} ${pathname} - IP: ${ip} - UA: ${userAgent.substring(0, 100)}`
    
    if (logLevel === 'HIGH' || pathname.includes('quantum-vault')) {
      console.log(`🔒 ${logMessage}`)
    } else if (logLevel === 'MEDIUM') {
      console.log(`⚠️ ${logMessage}`)
    } else {
      console.log(`ℹ️ ${logMessage}`)
    }
  }

  // ================================
  // 8. PERFORMANCE MONITORING
  // ================================
  const requestStart = Date.now()
  response.headers.set('X-Request-Start', requestStart.toString())

  // ================================
  // 9. CLEANUP OLD RATE LIMIT ENTRIES
  // ================================
  // Periodic cleanup (1% chance per request)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStorage.entries()) {
      if (now > value.resetTime) {
        rateLimitStorage.delete(key)
      }
    }
    
    // Log cleanup
    if (rateLimitStorage.size > 1000) {
      console.log(`[PERFORMANCE] Rate limit cache size: ${rateLimitStorage.size}`)
    }
  }

  return response
}

// ================================
// HELPER FUNCTIONS - ENHANCED
// ================================

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/quantum-vault',
    '/api/quantum-vault',
    '/api/payments',
    '/api/ai',
    '/api/user',
    '/api/subscription',
    '/settings',
    '/billing'
  ]
  
  return protectedRoutes.some(route => pathname.startsWith(route))
}

function getLogLevel(pathname: string): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (pathname.includes('quantum-vault') || pathname.includes('payments')) {
    return 'HIGH'
  } else if (pathname.includes('/api/ai') || pathname.includes('/api/user')) {
    return 'MEDIUM'
  }
  return 'LOW'
}

function hasBasicXSSAttempt(content: string): boolean {
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /<img[\s\S]*?onerror[\s\S]*?>/gi,
    /<svg[\s\S]*?onload[\s\S]*?>/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(content))
}

function hasSQLInjectionAttempt(content: string): boolean {
  const sqlPatterns = [
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+set/gi,
    /alter\s+table/gi,
    /create\s+table/gi,
    /exec\s*\(/gi,
    /sp_executesql/gi,
    /xp_cmdshell/gi,
    /;\s*drop/gi,
    /;\s*delete/gi,
    /'\s*or\s*'1'\s*=\s*'1/gi,
    /'\s*or\s*1\s*=\s*1/gi,
    /--\s*$/gm,
    /\/\*[\s\S]*?\*\//g
  ]
  
  return sqlPatterns.some(pattern => pattern.test(content))
}

// ================================
// MIDDLEWARE CONFIG - ENHANCED
// ================================
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public assets)
     * - api/health (health check endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/health).*)',
  ],
}

// ================================
// LIB/SECURITY/SECURITY-SERVICE.TS - CORRECTED VERSION
// ================================

// Simple sanitization without external dependencies
export class SecurityService {
  private static instance: SecurityService
  
  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }
    return SecurityService.instance
  }

  // ================================
  // INPUT SANITIZATION - NO DEPENDENCIES
  // ================================
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:\s*text\/html/gi, '') // Remove data URLs
      .replace(/expression\s*\(/gi, '') // Remove CSS expressions
      .trim()
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
  // ENCRYPTION & DECRYPTION - BUILT-IN CRYPTO
  // ================================
  encrypt(text: string): string {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex')
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  decrypt(encryptedData: string): string {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex')
    
    const parts = encryptedData.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }
    
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
  // JWT TOKEN MANAGEMENT - SIMPLE VERSION
  // ================================
  generateSimpleJWT(payload: any, expiresIn: number = 24 * 60 * 60 * 1000): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }
    
    const now = Date.now()
    const claims = {
      ...payload,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + expiresIn) / 1000)
    }
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(claims)).toString('base64url')
    
    const signature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'default-secret')
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url')
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  verifySimpleJWT(token: string): any {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }
    
    const [encodedHeader, encodedPayload, signature] = parts
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'default-secret')
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url')
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid JWT signature')
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
    
    // Check expiration
    if (payload.exp && Date.now() > payload.exp * 1000) {
      throw new Error('JWT expired')
    }
    
    return payload
  }

  // ================================
  // CSRF TOKEN MANAGEMENT
  // ================================
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // ================================
  // PASSWORD HASHING - SIMPLE VERSION
  // ================================
  async hashPasswordSimple(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
  }

  async verifyPasswordSimple(password: string, storedHash: string): Promise<boolean> {
    const [salt, originalHash] = storedHash.split(':')
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    return hash === originalHash
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
  // VALIDATION METHODS
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
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs', '.php', '.asp']

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

    // Check for double extensions
    const fileName = file.name.toLowerCase()
    if (fileName.includes('.php.') || fileName.includes('.asp.') || fileName.includes('.jsp.')) {
      return { valid: false, error: 'Invalid file name' }
    }

    return { valid: true }
  }

  // ================================
  // AUDIT LOGGING
  // ================================
  async logSecurityEvent(event: {
    type: 'login' | 'failed_login' | 'password_change' | 'permission_denied' | 'suspicious_activity' | 'quantum_access'
    userId?: string
    ip: string
    userAgent: string
    details?: any
  }): Promise<void> {
    const logEntry = {
      ...event,
      timestamp: new Date().toISOString(),
      severity: this.getEventSeverity(event.type),
      id: this.generateSecureToken(16)
    }

    // Console log with appropriate emoji
    const emoji = this.getEventEmoji(event.type)
    console.log(`${emoji} [SECURITY]`, JSON.stringify(logEntry, null, 2))
    
    // In production, save to database/logging service
    if (process.env.NODE_ENV === 'production') {
      // Implementation depends on your logging strategy
      // await this.saveToAuditLog(logEntry)
    }
  }

  private getEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'login': 'low',
      'failed_login': 'medium',
      'password_change': 'medium',
      'permission_denied': 'high',
      'suspicious_activity': 'critical',
      'quantum_access': 'high'
    }
    return severityMap[eventType] || 'medium'
  }

  private getEventEmoji(eventType: string): string {
    const emojiMap: Record<string, string> = {
      'login': '🔐',
      'failed_login': '❌',
      'password_change': '🔑',
      'permission_denied': '🚫',
      'suspicious_activity': '🚨',
      'quantum_access': '🌌'
    }
    return emojiMap[eventType] || '🔒'
  }
}