import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const getSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    console.log('Session:', session)
    setUser(session?.user ?? null)
    setLoading(false)
  }

  getSession()

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log('Auth state changed:', session)
    setUser(session?.user ?? null)
    setLoading(false)
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])


  return { user, loading }
}
