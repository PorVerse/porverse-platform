// middleware.ts (root directory)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number, resetTime: number }>()

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/api/ai',
  '/api/payments/stripe',
  '/api/payments/paypal',
  '/api/user'
]

// Admin routes
const adminRoutes = [
  '/admin',
  '/api/admin'
]

// Public routes that don't require auth
const publicRoutes = [
  '/',
  '/auth',
  '/pricing',
  '/about',
  '/privacy',
  '/terms',
  '/api/payments/stripe/webhook',
  '/api/payments/paypal/webhook'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  const pathname = req.nextUrl.pathname

  // Rate limiting check
  if (!pathname.startsWith('/_next') && !pathname.startsWith('/static')) {
    const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `${clientIP}:${pathname}`
    
    const rateLimitResult = checkRateLimit(rateLimitKey, 60, 60000) // 60 requests per minute
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
  }

  // Skip auth check for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return res
  }

  // Skip auth for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return res
  }

  try {
    // Get user session
    const { data: { user }, error } = await supabase.auth.getUser()

    // Check if route requires authentication
    const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route))
    const requiresAdmin = adminRoutes.some(route => pathname.startsWith(route))

    if (requiresAuth && (!user || error)) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (requiresAdmin) {
      // Check admin permissions
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Check ecosystem access for dashboard routes
    if (pathname.startsWith('/dashboard/')) {
      const ecosystem = extractEcosystemFromPath(pathname)
      
      if (ecosystem && user) {
        const hasAccess = await checkEcosystemAccess(user.id, ecosystem, supabase)
        
        if (!hasAccess) {
          const upgradeUrl = new URL('/pricing', req.url)
          upgradeUrl.searchParams.set('upgrade', ecosystem)
          return NextResponse.redirect(upgradeUrl)
        }
      }
    }

    // Add user info to headers for API routes
    if (user && pathname.startsWith('/api/')) {
      res.headers.set('x-user-id', user.id)
      res.headers.set('x-user-email', user.email || '')
    }

    return res

  } catch (error) {
    console.error('Middleware error:', error)
    
    // For API routes, return error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }
    
    // For pages, redirect to login
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

function checkRateLimit(
  key: string, 
  maxRequests: number, 
  windowMs: number
): { allowed: boolean, remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  rateLimitStore.set(key, record)
  
  return { allowed: true, remaining: maxRequests - record.count }
}

function extractEcosystemFromPath(pathname: string): string | null {
  const match = pathname.match(/\/dashboard\/(por-[a-z]+)/)
  return match ? match[1] : null
}

async function checkEcosystemAccess(
  userId: string, 
  ecosystem: string, 
  supabase: any
): Promise<boolean> {
  const { data } = await supabase
    .from('user_ecosystems')
    .select('access_level, expires_at')
    .eq('user_id', userId)
    .eq('ecosystem', ecosystem)
    .single()

  if (!data) return false

  // Check if access is locked
  if (data.access_level === 'locked') return false

  // Check if premium access hasn't expired
  if (data.access_level === 'premium' && data.expires_at) {
    const expirationDate = new Date(data.expires_at)
    const now = new Date()
    if (now > expirationDate) return false
  }

  return true
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// ================================
// DATABASE SCHEMA SETUP
// ================================

/* 
Run this SQL in your Supabase SQL Editor:

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom tables
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(100),
  avatar_url TEXT,
  date_of_birth DATE,
  country_code CHAR(2) DEFAULT 'RO',
  language_code CHAR(2) DEFAULT 'ro',
  timezone VARCHAR(50) DEFAULT 'Europe/Bucharest',
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'complete')),
  subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'inactive')),
  stripe_customer_id VARCHAR(255),
  paypal_customer_id VARCHAR(255),
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User ecosystems access
CREATE TABLE IF NOT EXISTS public.user_ecosystems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ecosystem VARCHAR(20) NOT NULL CHECK (ecosystem IN ('por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu')),
  access_level VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'locked')),
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  features_unlocked TEXT[],
  usage_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ecosystem)
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'RON',
  ecosystems TEXT[] NOT NULL,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'paused', 'pending')),
  stripe_subscription_id VARCHAR(255),
  paypal_subscription_id VARCHAR(255),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment logs
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_provider VARCHAR(20) NOT NULL CHECK (payment_provider IN ('stripe', 'paypal')),
  transaction_id VARCHAR(255),
  subscription_id VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2),
  currency CHAR(3),
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'canceled', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ecosystem VARCHAR(20) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL,
  target_value DECIMAL(10,2),
  unit VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ecosystem VARCHAR(20) NOT NULL,
  ai_model VARCHAR(50),
  conversation_type VARCHAR(50),
  messages JSONB NOT NULL DEFAULT '[]',
  context_data JSONB DEFAULT '{}',
  total_tokens INTEGER,
  cost_cents INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity logs
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ecosystem VARCHAR(20),
  action_type VARCHAR(100) NOT NULL,
  action_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, currency, ecosystems, features) VALUES
('starter', 'PorHealth Starter', 'Perfect pentru optimizarea sănătății', 49.00, 490.00, 'RON', ARRAY['por-health'], '["AI Nutrition Planner", "Workout Optimizer", "Health Tracking"]'),
('pro', 'Triple Pack Pro', 'Sănătate + Familie + Finanțe', 119.00, 1190.00, 'RON', ARRAY['por-health', 'por-kids', 'por-mind'], '["All Starter features", "Homework Scanner", "Smart Budgeting", "Investment Advisor"]'),
('complete', 'Complete Ecosystem', 'Transformare completă + Quantum Vault', 199.00, 1990.00, 'RON', ARRAY['por-health', 'por-kids', 'por-mind', 'por-well', 'por-flow', 'por-blu'], '["All features", "AI Therapist", "Productivity Optimizer", "Quantum Vault Access"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  ecosystems = EXCLUDED.ecosystems,
  features = EXCLUDED.features;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON public.user_profiles(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_ecosystems_user_id ON public.user_ecosystems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ecosystems_access ON public.user_ecosystems(user_id, ecosystem, access_level);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON public.payment_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_ecosystem ON public.ai_conversations(user_id, ecosystem);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON public.user_activity_logs(user_id, created_at DESC);

-- Row Level Security Policies
-- User profiles - users can only see/edit their own
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User ecosystems - users can only see their own
CREATE POLICY "Users can view own ecosystems" ON public.user_ecosystems
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage ecosystems" ON public.user_ecosystems
  FOR ALL USING (true);

-- Subscriptions - users can only see their own
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Payment logs - users can only see their own
CREATE POLICY "Users can view own payment logs" ON public.payment_logs
  FOR SELECT USING (auth.uid() = user_id);

-- AI conversations - users can only see their own
CREATE POLICY "Users can manage own conversations" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Activity logs - users can only see their own
CREATE POLICY "Users can view own activity" ON public.user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- User progress - users can only see their own
CREATE POLICY "Users can manage own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Subscription plans are publicly readable
CREATE POLICY "Plans are publicly readable" ON public.subscription_plans
  FOR SELECT USING (true);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ecosystems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create functions
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to check Trinity access (for Quantum Vault)
CREATE OR REPLACE FUNCTION public.has_trinity_access(user_uuid UUID)
RETURNS BOOLEAN AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_ecosystems
    WHERE user_id = user_uuid
    AND ecosystem IN ('por-mind', 'por-flow', 'por-blu')
    AND access_level = 'premium'
    GROUP BY user_id
    HAVING COUNT(DISTINCT ecosystem) = 3
  );
END;
$ LANGUAGE plpgsql;

-- Function to get user dashboard summary
CREATE OR REPLACE FUNCTION public.get_user_dashboard_summary(user_uuid UUID)
RETURNS JSON AS $
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', id,
        'email', email,
        'first_name', first_name,
        'last_name', last_name,
        'subscription_tier', subscription_tier,
        'subscription_status', subscription_status,
        'onboarding_completed', onboarding_completed
      )
      FROM public.user_profiles 
      WHERE id = user_uuid
    ),
    'ecosystems', (
      SELECT json_agg(
        json_build_object(
          'ecosystem', ecosystem,
          'access_level', access_level,
          'usage_minutes', usage_minutes
        )
      )
      FROM public.user_ecosystems 
      WHERE user_id = user_uuid
    ),
    'recent_activity', (
      SELECT json_agg(
        json_build_object(
          'action_type', action_type,
          'ecosystem', ecosystem,
          'created_at', created_at
        )
      )
      FROM (
        SELECT action_type, ecosystem, created_at
        FROM public.user_activity_logs 
        WHERE user_id = user_uuid 
        ORDER BY created_at DESC 
        LIMIT 10
      ) recent
    ),
    'has_trinity_access', public.has_trinity_access(user_uuid)
  ) INTO result;
  
  RETURN result;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

*/