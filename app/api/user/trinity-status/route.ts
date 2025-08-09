// app/api/user/trinity-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Trinity combo status
    const { data: hasTrinity } = await supabase
      .rpc('has_trinity_combo', { user_uuid: user.id })

    // Get ecosystem access details
    const { data: ecosystems } = await supabase
      .from('user_ecosystems')
      .select('ecosystem, access_level')
      .eq('user_id', user.id)

    const premiumEcosystems = ecosystems?.filter(e => e.access_level === 'premium') || []
    const trinityEcosystems = ['por-mind', 'por-flow', 'por-blu']
    const hasTrinityAccess = trinityEcosystems.every(eco => 
      premiumEcosystems.some(pe => pe.ecosystem === eco)
    )

    // Check Quantum Vault access
    const { data: quantumAccess } = await supabase
      .from('quantum_vault_access')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      data: {
        hasTrinity: hasTrinityAccess,
        premiumEcosystems: premiumEcosystems.map(e => e.ecosystem),
        quantumVaultUnlocked: !!quantumAccess,
        nextSteps: hasTrinityAccess 
          ? ['Access Quantum Vault features'] 
          : [`Unlock remaining ecosystems: ${trinityEcosystems.filter(eco => 
              !premiumEcosystems.some(pe => pe.ecosystem === eco)
            ).join(', ')}`]
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
