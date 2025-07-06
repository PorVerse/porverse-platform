// lib/quantum/access.ts (FIȘIER NOU)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function verifyTrinityAccess(userId: string): Promise<boolean> {
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

  // Folosim funcția ta has_trinity_combo din database
  const { data, error } = await supabase
    .rpc('has_trinity_combo', { user_uuid: userId })

  if (error) {
    console.error('Trinity check error:', error)
    return false
  }

  return data || false
}

export async function getUserActiveEcosystems(userId: string) {
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

  const { data, error } = await supabase
    .rpc('get_user_active_ecosystems', { user_uuid: userId })

  if (error) {
    console.error('Get ecosystems error:', error)
    return []
  }

  return data || []
}