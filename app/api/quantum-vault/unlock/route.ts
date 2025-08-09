// app/api/quantum-vault/unlock/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Trinity access
    const { data: hasTrinity } = await supabase
      .rpc('has_trinity_combo', { user_uuid: user.id })

    if (!hasTrinity) {
      return NextResponse.json({ error: 'Trinity access required' }, { status: 403 })
    }

    // Grant Quantum Vault access
    const { data: access, error } = await supabase
      .from('quantum_vault_access')
      .upsert({
        user_id: user.id,
        access_level: 'full',
        features_unlocked: [
          'future_self',
          'identity_simulator',
          'reverse_roadmap',
          'mirror_conversations',
          'pattern_detection'
        ],
        unlocked_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      data: { 
        access,
        message: 'Quantum Vault unlocked! Welcome to the next level of consciousness.' 
      } 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}