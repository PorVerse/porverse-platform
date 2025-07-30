// test-supabase.js - Rulează cu: node test-supabase.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔗 Testing Supabase connection...')
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
console.log('Key:', supabaseKey ? '✅ Found (first 20 chars)' + supabaseKey.substring(0, 20) + '...' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables!')
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🧪 Testing authentication...')
    
    // Test signup cu email valid
    const testEmail = `test${Date.now()}@gmail.com`
    const testPassword = 'testpassword123'
    
    console.log('Attempting signup with:', testEmail)
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    })
    
    if (signupError) {
      console.log('❌ Signup Error:', signupError.message)
      console.log('Error code:', signupError.status)
      console.log('Error details:', signupError)
    } else {
      console.log('✅ Signup SUCCESS!')
      console.log('User ID:', signupData.user?.id)
      console.log('Email confirmation required:', !signupData.user?.email_confirmed_at)
      console.log('Session created:', !!signupData.session)
    }
    
    // Test basic database access
    console.log('\n🗄️ Testing database access...')
    const { data: dbData, error: dbError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (dbError) {
      console.log('❌ Database Error:', dbError.message)
      console.log('Error code:', dbError.code)
      console.log('This might be because the table doesn\'t exist yet')
    } else {
      console.log('✅ Database connection OK!')
      console.log('Query result:', dbData)
    }
    
    // Test cu un query simplu care sigur există
    console.log('\n📊 Testing basic query...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('❌ Auth session error:', authError.message)
    } else {
      console.log('✅ Auth service working!')
      console.log('Current session:', authData.session ? 'Active' : 'None')
    }
    
  } catch (err) {
    console.log('❌ Connection failed:', err.message)
    console.log('Full error:', err)
  }
}

testConnection()