const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔗 Testing Supabase connection...')
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
console.log('Key:', supabaseKey ? '✅ Found' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
    
    if (error) {
      console.log('❌ Database Error:', error.message)
    } else {
      console.log('✅ SUCCESS! Database connected!')
      console.log('✅ Tables are accessible!')
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message)
  }
}

testConnection()