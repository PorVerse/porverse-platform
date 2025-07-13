// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Set cookie in request for immediate use
            request.cookies.set(name, value)
            // Set cookie in response for future requests
            response.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            // Remove cookie from request
            request.cookies.delete(name)
            // Remove cookie from response
            response.cookies.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )

    // Refresh session if expired
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Handle auth for protected routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (error || !user) {
        // Redirect to login if not authenticated
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth/login'
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check for Quantum Vault access
      if (request.nextUrl.pathname.startsWith('/dashboard/quantum-vault')) {
        // Check if user has Trinity Combo (PorMind + PorFlow + PorBlu)
        try {
          const { data: hasTrinity } = await supabase.rpc('has_trinity_combo', {
            user_uuid: user.id,
          })

          if (!hasTrinity) {
            // Redirect to pricing page if no Trinity access
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/pricing'
            redirectUrl.searchParams.set('upgrade', 'trinity')
            redirectUrl.searchParams.set('feature', 'quantum-vault')
            return NextResponse.redirect(redirectUrl)
          }
        } catch (dbError) {
          console.error('Database error checking Trinity access:', dbError)
          // Allow access on DB error to prevent blocking legitimate users
        }
      }
    }

    // Handle auth routes
    if (request.nextUrl.pathname.startsWith('/auth')) {
      if (user) {
        // Redirect authenticated users away from auth pages
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
      }
    }

    // API route protection
    if (request.nextUrl.pathname.startsWith('/api/')) {
      // Skip auth check for public API routes
      const publicRoutes = ['/api/auth', '/api/webhooks', '/api/health']
      const isPublicRoute = publicRoutes.some(route => 
        request.nextUrl.pathname.startsWith(route)
      )

      if (!isPublicRoute) {
        if (error || !user) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }

        // Add user ID to request headers for API routes
        response.headers.set('x-user-id', user.id)
        response.headers.set('x-user-email', user.email || '')
      }
    }

    return response
  } catch (middlewareError) {
    console.error('Middleware error:', middlewareError)
    
    // Return next response on error to prevent blocking
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}