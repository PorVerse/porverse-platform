// lib/ai/rate-limiter.ts (FIȘIER NOU)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function checkAIUsage(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Check conversations in last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('ecosystem', 'quantum-vault')
    .gte('created_at', yesterday.toISOString())

  const count = data?.length || 0;
  const limit = 20; // 20 AI calls per day for Quantum Vault

  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count),
    resetAt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
  };
}