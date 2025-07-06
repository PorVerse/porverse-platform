// app/api/quantum-access/route.ts (FIȘIER NOU)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
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

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check Trinity access
  const { data: hasTrinity } = await supabase
    .rpc('has_trinity_combo', { user_uuid: user.id })

  // Get user's ecosystems
  const { data: ecosystems } = await supabase
    .rpc('get_user_active_ecosystems', { user_uuid: user.id })

  return NextResponse.json({
    hasTrinity,
    ecosystems,
    userId: user.id
  })
}