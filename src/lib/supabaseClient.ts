import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase ANON key:', supabaseAnonKey.slice(0, 6) + '...') // don't print full key


export const supabase = createClient(supabaseUrl, supabaseAnonKey)
