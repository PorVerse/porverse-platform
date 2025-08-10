// lib/security/security-service.ts - Digital Ocean Compatible

export class SecurityService {
  private static instance: SecurityService

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }
    return SecurityService.instance
  }

  async hashPassword(password: string): Promise<string> {
    // Use Web Crypto API - available in both Node and Edge runtime
    const encoder = new TextEncoder()
    const data = encoder.encode(password + 'porverse_salt')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password)
    return hashedInput === hash
  }

  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return ''
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 1000) // Limit length
  }

  sanitizeJSON(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeInput(obj)
    }
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(item => this.sanitizeJSON(item))
      }
      const sanitized: any = {}
      for (const [key, value] of Object.entries(obj)) {
        const cleanKey = this.sanitizeInput(key)
        sanitized[cleanKey] = this.sanitizeJSON(value)
      }
      return sanitized
    }
    return obj
  }

  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const randomArray = new Uint8Array(length)
    crypto.getRandomValues(randomArray)
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length]
    }
    return result
  }

  private rateLimitStore = new Map<string, { count: number; resetTime: number }>()

  checkRateLimit(identifier: string, endpoint: string = 'default'): { allowed: boolean; resetTime?: number } {
    const key = `${identifier}_${endpoint}`
    const now = Date.now()
    const windowMs = 60000 // 1 minute
    const maxRequests = 60
    
    // Clean expired entries
    for (const [k, v] of this.rateLimitStore.entries()) {
      if (v.resetTime < now) {
        this.rateLimitStore.delete(k)
      }
    }
    
    const entry = this.rateLimitStore.get(key)
    
    if (!entry) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
      return { allowed: true, resetTime: now + windowMs }
    }
    
    if (entry.resetTime < now) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
      return { allowed: true, resetTime: now + windowMs }
    }
    
    if (entry.count >= maxRequests) {
      return { allowed: false, resetTime: entry.resetTime }
    }
    
    entry.count++
    return { allowed: true, resetTime: entry.resetTime }
  }

  detectSQLInjection(input: string): boolean {
    const patterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
      /(\'|\").*(\;|\-\-)/i,
      /(\bOR\b|\bAND\b).*(\=|LIKE)/i
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  detectXSS(input: string): boolean {
    const patterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }

  logSecurityEvent(event: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    userId?: string
    ip?: string
    details?: any
  }): void {
    const timestamp = new Date().toISOString()
    console.log(`[SECURITY] ${timestamp} [${event.severity.toUpperCase()}] ${event.type}`, {
      userId: event.userId,
      ip: event.ip,
      details: event.details
    })
  }

  generateSessionId(): string {
    return `sess_${this.generateSecureToken(24)}_${Date.now()}`
  }

  private sessionStore = new Map<string, { userId: string; createdAt: number; lastAccess: number }>()

  validateSession(sessionId: string, userId: string): boolean {
    const session = this.sessionStore.get(sessionId)
    if (!session) return false
    
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    const maxIdle = 2 * 60 * 60 * 1000 // 2 hours
    
    if (session.userId !== userId) return false
    if (now - session.createdAt > maxAge) return false
    if (now - session.lastAccess > maxIdle) return false
    
    session.lastAccess = now
    return true
  }

  createSession(userId: string): string {
    const sessionId = this.generateSessionId()
    const now = Date.now()
    
    this.sessionStore.set(sessionId, {
      userId,
      createdAt: now,
      lastAccess: now
    })
    
    return sessionId
  }

  invalidateSession(sessionId: string): void {
    this.sessionStore.delete(sessionId)
  }

  cleanupExpiredSessions(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000
    
    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (now - session.createdAt > maxAge) {
        this.sessionStore.delete(sessionId)
      }
    }
  }

  encryptSensitiveData(data: string): string {
    // Simple base64 encoding for build compatibility
    // In production, use proper encryption
    try {
      return Buffer.from(data, 'utf8').toString('base64')
    } catch {
      return btoa(data) // Fallback for edge runtime
    }
  }

  decryptSensitiveData(encryptedData: string): string {
    try {
      return Buffer.from(encryptedData, 'base64').toString('utf8')
    } catch {
      return atob(encryptedData) // Fallback for edge runtime
    }
  }
}