import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test function
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('atms')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    console.log('Database connection successful!')
    return true
  } catch (error) {
    console.error('Database connection failed:', error.message)
    return false
  }
}