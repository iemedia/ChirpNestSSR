'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

type UserProfile = {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string | null
}

export default function ProfileCard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!user) return

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('users') // ✅ using 'users' table instead of 'profiles'
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to fetch profile:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    }

    fetchProfile()
  }, [user])

  if (!profile) {
    return (
      <div className="flex flex-col items-center bg-gray-900 text-white rounded-xl shadow-md h-full p-6">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    )
  }

  const avatar = profile.avatar_url?.startsWith('http')
    ? profile.avatar_url
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        profile.username || 'User'
      )}&backgroundColor=transparent`

  return (
    <div className="flex flex-col items-center bg-gray-900 text-white rounded-xl shadow-md h-full p-8">
      <img
        src={avatar}
        alt="User Avatar"
        className="w-24 h-24 rounded-full border-2 border-purple-600 shadow mb-4 bg-white"
        loading="lazy"
      />

      <h2 className="text-xl font-bold mb-1">
        {profile.username || 'Unnamed User'}
      </h2>
      <p className="text-sm text-gray-400 mb-4 text-center px-2">
        {profile.bio?.trim() ? profile.bio : 'Sharing vibes, tweets, and sometimes memes 🐥'}
      </p>

      <div className="text-xs text-gray-500 space-y-1 text-center">
        <p>📍 Somewhere on the Web</p>
        <p>
          ✨ Joined{' '}
          {profile.created_at
            ? new Date(profile.created_at).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })
            : 'ChirpNest'}
        </p>
      </div>
    </div>
  )
}
