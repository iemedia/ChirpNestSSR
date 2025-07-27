'use client'

import { useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useEnsureUserProfile } from '@/hooks/useEnsureUserProfile'
import ChirpBox from '@/components/ChirpBox'
import Timeline, { TimelineHandle } from '@/components/Timeline'
import GlobalTimeline, { GlobalTimelineHandle } from '@/components/GlobalTimeline'
import Gallery from '@/components/Gallery'
import ProfileCard from '@/components/ProfileCard'
import { supabase } from '@/lib/supabaseClient'
import { Toaster, toast } from 'react-hot-toast'
import CustomAuth from '@/components/CustomAuth'

export default function HomePage() {
  const { user, loading } = useAuth()
  useEnsureUserProfile(user)

  const timelineRef = useRef<TimelineHandle>(null)
  const globalTimelineRef = useRef<GlobalTimelineHandle>(null)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully!')
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message)
    }
  }

  const handleChirp = () => {
    timelineRef.current?.refetch()
    globalTimelineRef.current?.refetch()
  }

  useEffect(() => {
    console.log('HomePage:', { loading, user })
  }, [loading, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex items-center justify-center">
        <Toaster position="top-center" />
        <CustomAuth />
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex justify-center py-12 px-4">
        <div className="max-w-6xl w-full bg-white rounded-xl shadow-lg p-8 flex flex-col gap-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900">ChirpNest 🐦</h1>
            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-full shadow transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </header>

          {/* Top Section: Profile Sidebar + Gallery */}
          <section className="flex gap-8" style={{ height: '320px' }}>
            <div className="w-[30%] min-w-0 h-full">
              <ProfileCard user={user} />
            </div>
            <div className="w-[70%] min-w-0 h-full">
              <Gallery />
            </div>
          </section>

          {/* Bottom Section: ChirpBox + Timelines */}
          <section className="flex gap-8">
            <main className="w-[30%] flex flex-col gap-6">
              <ChirpBox user={user} onChirp={handleChirp} />
              <Timeline ref={timelineRef} />
            </main>

            <aside className="w-[70%] bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold text-black pb-6">What's Happening</h2>
              <GlobalTimeline ref={globalTimelineRef} />
            </aside>
          </section>
        </div>
      </div>
    </>
  )
}
