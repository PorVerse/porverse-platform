// ================================
// MIDDLEWARE.TS - SECURITY FOUNDATION WITH SUPABASE CSP FIX + ADMIN PROTECTION
// ================================
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import crypto from 'crypto'

// Rate limiting storage (în production folosește Redis)
const rateLimitStorage = new Map<string, { count: number; resetTime: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ================================
  // 1. SECURITY HEADERS - ENHANCED WITH SUPABASE
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
  
  // 🔥 FIXED CSP - Include toate domeniile necesare!
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'self' https://js.stripe.com",
      // 🚀 CRITICAL: Include Supabase + toate API-urile
      "connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co https://api.openai.com https://api.stripe.com https://api.paypal.com https://fonts.googleapis.com https://fonts.gstatic.com"
    ].join('; ')
  )
  
  // ================================
  // 2. RATE LIMITING - ENHANCED
  // ================================
  const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const rateLimitKey = `${ip}:${pathname}`
  
  // Granular rate limits pentru different endpoints
  const rateLimits: Record<string, { requests: number; window: number }> = {
    '/admin': { requests: 20, window: 3600000 }, // 20 requests per hour for admin dashboard
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
  // 3. AUTHENTICATION CHECK - ENHANCED WITH ADMIN PROTECTION
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

      // 🚀 ADMIN PROTECTION - Only for /admin routes
      if (pathname.startsWith('/admin')) {
        const userEmail = session.user.email?.toLowerCase()
        const adminEmails = [
          'admin@porverse.ro',
          'porverseofficial@gmail.com', // Your main email
          // Add more admin emails here if needed
        ]
        
        const isAdmin = adminEmails.includes(userEmail || '')
        
        if (!isAdmin) {
          console.warn(`[SECURITY] Admin access denied: ${userEmail} - ${pathname} - ${ip}`)
          
          // Redirect non-admin users to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        
        // Log admin access
        console.log(`[ADMIN] Dashboard access: ${userEmail} - ${pathname} - ${ip}`)
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
  if (pathname.startsWith('/api/') || pathname.startsWith('/admin')) {
    const logLevel = getLogLevel(pathname)
    const logMessage = `[${logLevel}] ${request.method} ${pathname} - IP: ${ip} - UA: ${userAgent.substring(0, 100)}`
    
    if (logLevel === 'HIGH' || pathname.includes('quantum-vault') || pathname.startsWith('/admin')) {
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
    '/admin', // 🚀 Added admin route protection
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
  if (pathname.includes('quantum-vault') || pathname.includes('payments') || pathname.startsWith('/admin')) {
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