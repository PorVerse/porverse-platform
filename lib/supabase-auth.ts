// lib/supabase-auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createBrowserClient = createClientComponentClient
export { createRouteHandlerClient as createServerClient } from '@supabase/auth-helpers-nextjs'
