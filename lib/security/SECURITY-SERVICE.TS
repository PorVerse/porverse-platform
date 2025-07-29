// ================================
// LIB/SECURITY/SECURITY-SERVICE.TS - COMPLETE STANDALONE
// ================================

import crypto from 'crypto'

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

  // Legacy method names for compatibility
  async hashPassword(password: string): Promise<string> {
    return this.hashPasswordSimple(password)
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.verifyPasswordSimple(password, hash)
  }

  // Legacy JWT methods for compatibility
  generateJWT(payload: any, expiresIn: string = '24h'): string {
    const expiresInMs = this.parseExpiresIn(expiresIn)
    return this.generateSimpleJWT(payload, expiresInMs)
  }

  verifyJWT(token: string): any {
    return this.verifySimpleJWT(token)
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/)
    if (!match) return 24 * 60 * 60 * 1000 // Default 24 hours
    
    const value = parseInt(match[1])
    const unit = match[2]
    
    const multipliers = {
      s: 1000,          // seconds
      m: 60 * 1000,     // minutes
      h: 60 * 60 * 1000, // hours
      d: 24 * 60 * 60 * 1000 // days
    }
    
    return value * multipliers[unit as keyof typeof multipliers]
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
    type: 'login' | 'failed_login' | 'password_change' | 'permission_denied' | 'suspicious_activity' | 'quantum_access' | 'rate_limit_exceeded'
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
      'quantum_access': 'high',
      'rate_limit_exceeded': 'medium'
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
      'quantum_access': '🌌',
      'rate_limit_exceeded': '⏰'
    }
    return emojiMap[eventType] || '🔒'
  }

  // ================================
  // UTILITY METHODS
  // ================================
  
  // Generate API key
  generateAPIKey(prefix?: string): string {
    const key = this.generateSecureToken(32)
    return prefix ? `${prefix}_${key}` : key
  }

  // Check password strength
  checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push('Password should be at least 8 characters long')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Password should contain lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Password should contain uppercase letters')

    if (/[0-9]/.test(password)) score += 1
    else feedback.push('Password should contain numbers')

    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    else feedback.push('Password should contain special characters')

    if (password.length >= 12) score += 1

    return {
      score,
      feedback,
      isStrong: score >= 4
    }
  }

  // Rate limiting helper
  checkRateLimit(
    key: string, 
    limit: number, 
    window: number, 
    storage: Map<string, { count: number; resetTime: number }>
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = storage.get(key)

    if (!record || now > record.resetTime) {
      const newRecord = { count: 1, resetTime: now + window }
      storage.set(key, newRecord)
      return { allowed: true, remaining: limit - 1, resetTime: newRecord.resetTime }
    }

    if (record.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime }
    }

    record.count++
    return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime }
  }

  // Clean expired rate limit entries
  cleanExpiredRateLimit(storage: Map<string, { count: number; resetTime: number }>): void {
    const now = Date.now()
    for (const [key, record] of storage.entries()) {
      if (now > record.resetTime) {
        storage.delete(key)
      }
    }
  }
}