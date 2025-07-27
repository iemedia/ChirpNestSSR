import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export function useEnsureUserProfile(user: User | null) {
  useEffect(() => {
    if (!user) return

    let isCancelled = false

    async function ensureUser() {
      try {
        // Check if user exists in 'profiles' table
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (isCancelled) return

        if (!data && !error) {
          // Generate username & avatar
          const username =
            user.user_metadata?.username ||
            (user.email ? user.email.split('@')[0] : 'anonymous')

          const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            username
          )}&backgroundColor=transparent`

          // Insert new user profile row into 'profiles'
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(
              [
                {
                  id: user.id,
                  username,
                  avatar_url: avatarUrl,
                  bio: '',
                },
              ],
              { returning: 'minimal' }
            )

          if (insertError) {
            console.error('Insert profile error:', insertError)
          } else {
            console.log('✅ New user profile created for:', user.id)
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to ensure user profile:', err)
        }
      }
    }

    ensureUser()

    return () => {
      isCancelled = true
    }
  }, [user])
}
